// Dependency-free Chrome DevTools harness for the exported frontend.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.withMarketBrowser = async function withMarketBrowser(review) {
  const root = path.resolve(__dirname, '../dist-review');
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
  const server = http.createServer((req, res) => {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mor-kisani-market-'));
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, 'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  const pending = new Map();
  const errors = [];
  const requests = [];
  let socket;
  let nextId = 0;
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; !fs.existsSync(portFile) && i < 100; i++) await pause(200);
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    socket.onmessage = event => {
      const data = JSON.parse(event.data);
      const task = pending.get(data.id);
      if (task) {
        clearTimeout(task.timer); pending.delete(data.id);
        data.error ? task.reject(new Error(JSON.stringify(data.error))) : task.resolve(data.result);
      }
      if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text);
      if (data.method === 'Network.requestWillBeSent') requests.push(data.params.request.url);
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 20000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const value = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (value.exceptionDetails) throw new Error(JSON.stringify(value.exceptionDetails));
      return value.result.value;
    };
    const waitFor = async expression => {
      for (let i = 0; i < 120; i++) {
        if (await evaluate(expression)) return;
        await pause(150);
      }
      throw new Error(`Not rendered: ${expression}`);
    };
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    let startup;
    async function open(route, language = 'en', width = 360, height = 800) {
      if (startup) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: startup });
      startup = (await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `localStorage.setItem('mor_kisani_language', ${JSON.stringify(language)})`,
      })).identifier;
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
      await send('Page.navigate', { url: origin + route });
      await waitFor(`document.body?.innerText.length > 30`);
      await evaluate('document.fonts.ready.then(() => true)');
      await pause(300);
    }
    const click = async label => {
      await waitFor(`Array.from(document.querySelectorAll('[role="button"]')).some(el => el.getAttribute('aria-label') === ${JSON.stringify(label)} || el.innerText.trim() === ${JSON.stringify(label)})`);
      await evaluate(`Array.from(document.querySelectorAll('[role="button"]')).find(el => el.getAttribute('aria-label') === ${JSON.stringify(label)} || el.innerText.trim() === ${JSON.stringify(label)}).click()`);
      await pause(200);
    };
    const input = async (label, value) => {
      await evaluate(`(() => { const el=document.querySelector('input[aria-label=' + CSS.escape(${JSON.stringify(label)}) + ']'); if (!el) throw new Error('Input missing: ' + ${JSON.stringify(label)}); el.focus(); el.select(); })()`);
      await send('Input.insertText', { text: value });
      await pause(100);
    };
    const screenshot = async file => {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
    };
    await review({ send, evaluate, waitFor, open, click, input, screenshot, pause, errors, requests, origin });
    await send('Browser.close');
  } finally {
    socket?.close(); chrome.kill(); server.close();
    for (const item of pending.values()) clearTimeout(item.timer);
  }
};
