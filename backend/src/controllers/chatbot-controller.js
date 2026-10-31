const config = require('../config/environment');
const AppError = require('../errors/app-error');

const requestWindowMs = 5 * 60 * 1000;
const maxRequestsPerWindow = 10;
const requestCounts = new Map();

function isRateLimited(ipAddress) {
  const now = Date.now();
  const window = requestCounts.get(ipAddress);

  if (!window && requestCounts.size >= 1000) {
    for (const [address, entry] of requestCounts) {
      if (now - entry.startedAt >= requestWindowMs) requestCounts.delete(address);
    }
    if (requestCounts.size >= 1000) return true;
  }

  if (!window || now - window.startedAt >= requestWindowMs) {
    requestCounts.set(ipAddress, { startedAt: now, count: 1 });
    return false;
  }

  window.count += 1;
  return window.count > maxRequestsPerWindow;
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
    throw new AppError(400, 'Send between 1 and 12 recent chat messages.');
  }

  let totalLength = 0;
  const validatedMessages = messages.map((message) => {
    if (!message || !['user', 'model'].includes(message.role) ||
        typeof message.text !== 'string' || !message.text.trim() || message.text.length > 2000) {
      throw new AppError(400, 'Each chat message must contain a role and 1–2000 characters of text.');
    }

    totalLength += message.text.length;
    return {
      role: message.role,
      parts: [{ text: message.text.trim() }]
    };
  });

  if (totalLength > 8000) {
    throw new AppError(400, 'Recent chat history cannot exceed 8000 characters.');
  }
  if (validatedMessages[validatedMessages.length - 1].role !== 'user') {
    throw new AppError(400, 'The latest chat message must be from the user.');
  }

  return validatedMessages;
}

function modelEndpoint(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}

function modelPreference(model) {
  const previewPenalty = /preview|experimental/i.test(model) ? 10 : 0;
  if (model === config.geminiModel) return previewPenalty;
  if (/flash-lite/i.test(model)) return 1 + previewPenalty;
  if (/flash/i.test(model)) return 2 + previewPenalty;
  if (/pro/i.test(model)) return 3 + previewPenalty;
  return 4 + previewPenalty;
}

async function listAvailableModels(signal) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
    headers: { 'x-goog-api-key': config.geminiApiKey },
    signal
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    console.error(`Gemini model discovery returned HTTP ${response.status}: ${details || 'No error details.'}`);
    if (response.status === 401 || response.status === 403) {
      throw new AppError(502, 'Gemini rejected the API key. Create a Gemini Developer API key in Google AI Studio, update GEMINI_API_KEY, and restart the server.');
    }
    throw new AppError(502, 'Gemini models could not be discovered. Check the API key and try again.');
  }

  const result = await response.json();
  const models = (Array.isArray(result.models) ? result.models : [])
    .filter((model) => Array.isArray(model.supportedGenerationMethods) &&
      model.supportedGenerationMethods.includes('generateContent') &&
      typeof model.name === 'string' &&
      /^models\/gemini-/i.test(model.name))
    .map((model) => model.name.replace(/^models\//i, ''))
    .sort((left, right) => modelPreference(left) - modelPreference(right));

  if (models.length === 0) {
    throw new AppError(502, 'This Gemini API key has no available models that support chat responses. Check the project and API key in Google AI Studio.');
  }

  return models;
}

function generateContent(model, language, contents, signal) {
  return fetch(modelEndpoint(model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.geminiApiKey
    },
    signal,
    body: JSON.stringify({
      system_instruction: {
        parts: [{
          text: `You are Agri-Solution's helpful farming assistant. Reply in ${language}. Write like a knowledgeable local agriculture adviser speaking respectfully with a farmer. Use everyday words and short, connected sentences. In Hindi, use natural Hindi in Devanagari rather than literal English translations, bureaucratic wording or unexplained English terms. In English, use simple English. Answer the farmer's specific question first, then give two or three useful next steps when needed. Explain unfamiliar farming terms briefly. Avoid repeated greetings, slogans and generic disclaimers. Give practical, locally aware agricultural guidance. Clearly distinguish general guidance from official policy, and direct users to the relevant government department for current scheme eligibility, amounts, deadlines, pesticide labels, or other regulated advice. Do not claim to be a government official or invent a diagnosis, dosage or current scheme rule.`
        }]
      },
      contents,
      generationConfig: {
        maxOutputTokens: 700,
        temperature: 0.5
      }
    })
  });
}

async function sendMessage(request, response, next) {
  if (!config.geminiApiKey) {
    response.status(503).json({ error: 'The farming assistant is not configured on the server.' });
    return;
  }

  if (isRateLimited(request.ip)) {
    response.status(429).json({ error: 'Too many chat requests. Please try again in a few minutes.' });
    return;
  }

  let contents;
  let language;
  try {
    contents = validateMessages(request.body?.messages);
    if (request.body?.language !== 'en' && request.body?.language !== 'hi') {
      throw new AppError(400, 'Choose English or Hindi for the farming assistant.');
    }
    language = request.body.language === 'hi' ? 'Hindi' : 'English';
  } catch (error) {
    next(error);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    let upstreamResponse = await generateContent(config.geminiModel, language, contents, controller.signal);

    if (!upstreamResponse.ok) {
      let errorBody = await upstreamResponse.text();
      let upstreamMessage = errorBody.slice(0, 500);
      try {
        upstreamMessage = JSON.parse(errorBody).error?.message || upstreamMessage;
      } catch (error) {
        console.error('Gemini returned a non-JSON error response.');
      }
      console.error(`Gemini returned HTTP ${upstreamResponse.status} for model ${config.geminiModel}: ${upstreamMessage || 'No error details.'}`);

      if (upstreamResponse.status === 404) {
        const models = await listAvailableModels(controller.signal);
        const alternatives = models.filter((model) => model !== config.geminiModel).slice(0, 3);
        let matchedModel = false;

        for (const model of alternatives) {
          matchedModel = true;
          upstreamResponse = await generateContent(model, language, contents, controller.signal);
          if (upstreamResponse.status !== 404) {
            console.info(`Gemini chatbot selected available model ${model}.`);
            break;
          }
          errorBody = await upstreamResponse.text();
          console.error(`Gemini model ${model} returned HTTP 404: ${errorBody.slice(0, 300) || 'No error details.'}`);
        }

        if (!matchedModel || upstreamResponse.status === 404) {
          response.status(502).json({
            error: 'No model available to this Gemini API key could answer the request. Check Gemini API access and available models in Google AI Studio.'
          });
          return;
        }
      }

      if (!upstreamResponse.ok && (upstreamResponse.status === 401 || upstreamResponse.status === 403)) {
        response.status(502).json({
          error: 'Gemini rejected the API key. Create a Gemini Developer API key in Google AI Studio, update GEMINI_API_KEY, and restart the server.'
        });
        return;
      }

      if (!upstreamResponse.ok && upstreamResponse.status === 429) {
        response.status(503).json({
          error: 'Gemini free-tier quota is temporarily exhausted. Wait for the quota to reset, then try again.'
        });
        return;
      }

      if (!upstreamResponse.ok) {
        const details = errorBody.slice(0, 500);
        console.error(`Gemini returned HTTP ${upstreamResponse.status}: ${details || 'No error details.'}`);
        response.status(502).json({
          error: 'Gemini could not answer this request. Check the API key, model access, and free-tier quota.'
        });
        return;
      }
    }

    const result = await upstreamResponse.json();
    const text = result.candidates?.[0]?.content?.parts
      ?.map((part) => typeof part.text === 'string' ? part.text : '')
      .join('')
      .trim();
    if (!text) {
      console.error('Gemini returned no text for a chat request.');
      response.status(502).json({ error: 'The farming assistant returned an empty answer. Please try again.' });
      return;
    }

    response.json({ text });
  } catch (error) {
    if (error.name === 'AbortError') {
      response.status(504).json({ error: 'The farming assistant took too long to respond. Please try again.' });
      return;
    }
    next(error);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { sendMessage };
