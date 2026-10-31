// Review the exported app with the installed Chrome; no extra dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../dist-review');
const output = path.resolve(__dirname, '../artifacts/ui-refinement');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.resolve(root, '.' + name);
  if (!file.startsWith(root + path.sep)) file = path.join(root, 'index.html');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

async function main() {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mor-kisani-review-'));
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${profile}`, 'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  let socket;
  const pending = new Map();
  let id = 0;
  const failures = [];
  const requests = [];
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; !fs.existsSync(portFile) && i < 100; i++) await pause(200);
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    socket.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject, timer } = pending.get(data.id);
        clearTimeout(timer); pending.delete(data.id);
        data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
      }
      if (data.method === 'Runtime.exceptionThrown') failures.push(data.params.exceptionDetails.text);
      if (data.method === 'Network.requestWillBeSent') requests.push(data.params.request.url);
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const messageId = ++id;
      const timer = setTimeout(() => { pending.delete(messageId); reject(new Error(`Timed out: ${method}`)); }, 20000);
      pending.set(messageId, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: messageId, method, params }));
    });
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    let initScript;
    async function open(route, language, width = 360, height = 800) {
      if (initScript) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: initScript });
      initScript = (await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `localStorage.setItem('mor_kisani_language', ${JSON.stringify(language)});`,
      })).identifier;
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
      await send('Page.navigate', { url: origin + route });
      let ready = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        await pause(150);
        ready = await evaluate(`document.body.innerText.includes(${JSON.stringify(language === 'hi' ? 'हिंदी' : 'English')}) || document.querySelectorAll('[role="tab"]').length === 5`);
        if (ready) break;
      }
      assert.ok(ready, `Page did not render: ${route}`);
      await evaluate('document.fonts.ready.then(() => true)');
      await pause(400);
    }
    async function capture(name) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(output, `${name}.png`), Buffer.from(data, 'base64'));
    }
    async function checkTabs() {
      const bounds = await evaluate(`Array.from(document.querySelectorAll('[role="tab"]')).map(el => {const r=el.getBoundingClientRect(); return {text:el.innerText,x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height}})`);
      assert.equal(bounds.length, 5, JSON.stringify(bounds));
      const width = await evaluate('innerWidth');
      const height = await evaluate('innerHeight');
      for (const tab of bounds) {
        assert.ok(tab.x >= 0 && tab.right <= width + 1, JSON.stringify(tab));
        assert.ok(tab.bottom <= height - 8 && tab.height >= 48, JSON.stringify(tab));
      }
      return bounds;
    }
    const report = [];
    for (const language of ['hi', 'en']) {
      for (const width of [320, 390]) {
        await open('/settings', language, width);
        report.push({ language, width, tabs: await checkTabs() });
        assert.equal(await evaluate(`document.querySelectorAll('[role="radio"]').length`), 2);
        assert.equal(await evaluate(`document.querySelectorAll('[role="button"][aria-label="English"]').length`), 0);
        await capture(`settings-${language}-${width}`);
      }
    }
    // Use the actual controls and confirm the language survives a page reload.
    await evaluate(`document.querySelectorAll('[role="radio"]')[1].click()`);
    await pause(250);
    assert.equal(await evaluate(`localStorage.getItem('mor_kisani_language')`), 'hi');
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: initScript }); initScript = undefined;
    await send('Page.reload'); await pause(1200);
    assert.ok(await evaluate(`document.body.innerText.includes('ऐप की भाषा')`));
    await open('/', 'hi', 320); await checkTabs(); await capture('home-hi-320');
    assert.equal(requests.filter(url => /\/content(?:\?|$)/.test(url)).length, 0, 'Home/settings should not fetch server content');
    await open('/districts', 'hi', 390);
    assert.equal(await evaluate(`document.querySelectorAll('[role="button"][aria-label="English"]').length`), 1);
    assert.equal(await evaluate(`document.querySelectorAll('[role="button"][aria-label="हिंदी"]').length`), 1);
    await capture('districts-hi-390');
    await open('/settings', 'hi', 740, 360); await checkTabs(); await capture('settings-hi-landscape');
    assert.deepEqual(failures, [], 'Unexpected runtime exceptions');
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify({ passed: true, report, runtimeExceptions: failures }, null, 2));
    console.log('PASS: mobile tab bounds, compact Settings, language selection/persistence, single district switcher, no startup content fetch, no runtime exceptions.');
    await send('Browser.close');
  } finally {
    socket?.close(); chrome.kill(); server.close();
    for (const item of pending.values()) clearTimeout(item.timer);
  }
}
main().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
