const crypto = require('crypto');
const WebSocket = require('ws');
const config = require('../config/environment');

const endpoint = 'wss://iat-api-sg.xf-yun.com/v2/iat';
const host = new URL(endpoint).host;
const chunkSize = 1280;
const chunkIntervalMs = 40;
const timeoutMs = 35000;

function createAuthorizedUrl() {
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  const signature = crypto
    .createHmac('sha256', config.iflytekApiSecret)
    .update(signatureOrigin)
    .digest('base64');
  const authorizationOrigin = `api_key="${config.iflytekApiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  const url = new URL(endpoint);

  url.searchParams.set('authorization', authorization);
  url.searchParams.set('date', date);
  url.searchParams.set('host', host);
  return url.toString();
}

function getResultText(result) {
  return (result.ws || [])
    .map((word) => word.cw?.[0]?.w || '')
    .join('');
}

function transcribePcm(audio, language) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(createAuthorizedUrl());
    const segments = new Map();
    let offset = 0;
    let interval;
    let timeout;
    let settled = false;

    const finish = (error, text) => {
      if (settled) return;
      settled = true;
      clearInterval(interval);
      clearTimeout(timeout);
      if (socket.readyState === WebSocket.OPEN) socket.close();

      if (error) reject(error);
      else resolve(text);
    };

    const sendAudioFrame = (status, chunk) => {
      const frame = {
        data: {
          status,
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: chunk.toString('base64')
        }
      };

      if (status === 0) {
        frame.common = { app_id: config.iflytekAppId };
        frame.business = {
          language,
          domain: 'iat',
          vad_eos: 3000
        };
      }

      try {
        socket.send(JSON.stringify(frame));
      } catch (error) {
        const failure = new Error('Could not send audio to the speech recognition service.');
        failure.statusCode = 502;
        finish(failure);
      }
    };

    timeout = setTimeout(() => {
      const error = new Error('Speech recognition timed out. Please try again.');
      error.statusCode = 504;
      finish(error);
    }, timeoutMs);

    socket.on('open', () => {
      sendAudioFrame(0, audio.subarray(0, chunkSize));
      offset = Math.min(chunkSize, audio.length);

      interval = setInterval(() => {
        if (offset >= audio.length) {
          sendAudioFrame(2, Buffer.alloc(0));
          clearInterval(interval);
          interval = null;
          return;
        }

        const end = Math.min(offset + chunkSize, audio.length);
        sendAudioFrame(1, audio.subarray(offset, end));
        offset = end;
      }, chunkIntervalMs);
    });

    socket.on('message', (message) => {
      let result;
      try {
        result = JSON.parse(message.toString());
      } catch (error) {
        finish(new Error('Speech service returned an invalid response.'));
        return;
      }

      if (result.code !== 0) {
        const error = new Error(`Speech service rejected the request (${result.code}).`);
        error.statusCode = 502;
        finish(error);
        return;
      }

      const recognition = result.data?.result;
      if (recognition) {
        const segment = getResultText(recognition);
        const sequence = Number(recognition.sn);

        if (recognition.pgs === 'rpl' && Array.isArray(recognition.rg)) {
          for (let index = recognition.rg[0]; index <= recognition.rg[1]; index += 1) {
            segments.delete(index);
          }
        }
        segments.set(sequence, segment);
      }

      if (result.data?.status === 2) {
        const text = Array.from(segments.entries())
          .sort(([first], [second]) => first - second)
          .map(([, segment]) => segment)
          .join('')
          .trim();

        if (!text) {
          const error = new Error('No speech was recognized. Please speak clearly and try again.');
          error.statusCode = 422;
          finish(error);
          return;
        }
        finish(null, text);
      }
    });

    socket.on('error', () => {
      const error = new Error('Could not connect to the speech recognition service.');
      error.statusCode = 502;
      finish(error);
    });

    socket.on('unexpected-response', (request, response) => {
      let responseBody = '';
      response.on('data', (chunk) => {
        if (responseBody.length < 4096) {
          responseBody += chunk.toString('utf8').slice(0, 4096 - responseBody.length);
        }
      });
      response.once('end', () => {
        let providerMessage = '';
        try {
          providerMessage = JSON.parse(responseBody).message || '';
        } catch (error) {
          providerMessage = '';
        }

        const details = providerMessage.toLowerCase();
        let message = `Speech recognition service rejected the connection (HTTP ${response.statusCode}).`;
        if (response.statusCode === 401 && details.includes('apikey not found')) {
          message = 'iFlytek could not find this API key. Check that IFLYTEK_API_KEY is active, belongs to IFLYTEK_APP_ID, and has access to speech recognition.';
        } else if (response.statusCode === 401 && details.includes('signature')) {
          message = 'iFlytek rejected the request signature. Verify that the API key and secret belong to this APP ID, and that the server clock is correct.';
        } else if (response.statusCode === 401) {
          message = 'iFlytek rejected authentication. Verify the API key, API secret, and APP ID in backend/.env.';
        } else if (response.statusCode === 403 && /clock|date|x-date/.test(details)) {
          message = 'iFlytek rejected the server time. Check that the computer clock is synchronized.';
        } else if (response.statusCode === 403 && /ip|whitelist|allowed/.test(details)) {
          message = 'iFlytek rejected this server IP. Check the Short Form ASR IP whitelist in the iFlytek console.';
        } else if (response.statusCode === 403) {
          message = 'iFlytek denied speech-recognition access. Check that the service is enabled for this app.';
        } else if (response.statusCode === 429) {
          message = 'iFlytek rate limit reached. Please wait before trying again.';
        }

        const error = new Error(message);
        error.statusCode = 502;
        finish(error);
        socket.terminate();
      });
      response.once('error', () => {
        const error = new Error(`Speech recognition service rejected the connection (HTTP ${response.statusCode}).`);
        error.statusCode = 502;
        finish(error);
        socket.terminate();
      });
    });

    socket.on('close', () => {
      if (!settled) {
        const error = new Error('Speech recognition ended before returning a transcript.');
        error.statusCode = 502;
        finish(error);
      }
    });
  });
}

module.exports = { transcribePcm };
