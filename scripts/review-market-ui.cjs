const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { withMarketBrowser } = require('./market-browser.cjs');
const output = path.resolve(__dirname, '../artifacts/market-review');
const routes = [
  ['msp', 'Government MSP', 'सरकारी फसल मूल्य'], ['mandi', 'Mandi Prices', 'मंडी भाव'],
  ['dealers', 'Agricultural Dealers', 'कृषि डीलर'], ['inputs', 'Regulated Input Prices', 'कृषि सामग्री के निर्धारित मूल्य'],
  ['calculator', 'Sale Calculator', 'बिक्री कैलकुलेटर'], ['centres', 'Government Centres', 'सरकारी खरीदी एवं सहायता केंद्र'],
  ['comparison', 'Price Comparison', 'मूल्य तुलना'], ['alerts', 'Price Alerts', 'भाव अलर्ट'],
];

withMarketBrowser(async b => {
  await b.open('/', 'en', 320);
  await b.click('Market Information');
  await b.waitFor(`location.pathname === '/market'`);
  for (const [route, title] of routes) {
    await b.click(title);
    await b.waitFor(`location.pathname === '/market/${route}' && document.body.innerText.includes(${JSON.stringify(title)})`);
    assert.equal(await b.evaluate(`document.body.innerText.includes('market.')`), false, route);
    await b.screenshot(path.join(output, `${route}-en-320.png`));
    await b.evaluate('history.back()');
    await b.waitFor(`location.pathname === '/market'`);
  }
  await b.screenshot(path.join(output, 'market-en-320.png'));
  await b.open('/market', 'hi', 320);
  await b.waitFor(`document.body.innerText.includes('मंडी एवं बाजार भाव')`);
  assert.ok(await b.evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`));
  await b.screenshot(path.join(output, 'market-hi-320.png'));
  for (const [route, , title] of routes) {
    await b.open(`/market/${route}`, 'hi', 320);
    await b.waitFor(`document.body.innerText.includes(${JSON.stringify(title)})`);
    assert.equal(await b.evaluate(`document.body.innerText.includes('market.')`), false, route);
    assert.ok(await b.evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), `Horizontal overflow: ${route}`);
    await b.screenshot(path.join(output, `${route}-hi-320.png`));
  }
  await b.open('/market/dealers', 'en', 320);
  await b.evaluate(`Array.from(document.querySelectorAll('[role="radio"]')).find(el => el.innerText.trim() === 'Seeds').click()`);
  await b.waitFor(`Array.from(document.querySelectorAll('[role="radio"]')).some(el => el.innerText.trim() === 'Seeds' && el.getAttribute('aria-checked') === 'true')`);
  await b.evaluate(`Array.from(document.querySelectorAll('[role="radio"]')).find(el => el.innerText.trim() === 'All types').click()`);
  await b.open('/market/calculator', 'en', 360);
  await b.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await b.input('Quantity (quintals)', '10');
  await b.input('Selling price (₹/quintal)', '2000');
  await b.input('Transport cost (₹)', '500');
  await b.input('Other deductions (₹)', '100');
  await b.click('Calculate');
  await b.waitFor(`document.body.innerText.includes('19,400.00')`);
  await b.screenshot(path.join(output, 'calculator-result-offline.png'));
  await b.input('Quantity (quintals)', '-1');
  await b.click('Calculate');
  await b.waitFor(`document.body.innerText.includes('Enter a quantity above zero')`);
  assert.equal(await b.evaluate(`document.body.innerText.includes('19,400.00')`), false, 'Invalid form must not show stale results');
  await b.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

  await b.open('/market/alerts', 'en', 360);
  await b.click('Crop: Select crop');
  await b.waitFor(`document.querySelectorAll('[role="radio"]').length > 1`);
  await b.evaluate(`Array.from(document.querySelectorAll('[role="radio"]')).find(el => el.innerText.includes('Paddy')).click()`);
  await b.pause(150);
  await b.click('District: Select district');
  await b.waitFor(`document.querySelectorAll('[role="radio"]').length > 1`);
  await b.input('Search by name', 'Raipur');
  await b.waitFor(`Array.from(document.querySelectorAll('[role="radio"]')).some(el => el.innerText.includes('Raipur'))`);
  await b.evaluate(`Array.from(document.querySelectorAll('[role="radio"]')).find(el => el.innerText.includes('Raipur')).click()`);
  await b.pause(150);
  await b.input('Mandi name', 'My chosen mandi');
  await b.input('Target price (₹/quintal)', '2500');
  await b.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await b.click('Save preference');
  await b.waitFor(`document.body.innerText.includes('Your preference is saved')`);
  assert.ok(await b.evaluate(`document.body.innerText.includes('Automatic notifications are not active')`));
  const stored = await b.evaluate(`JSON.parse(localStorage.getItem('mor_kisani_market_preference_v1'))`);
  assert.equal(stored.cropId, 'paddy'); assert.equal(stored.targetPrice, 2500);
  await b.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await b.send('Page.reload');
  await b.waitFor(`document.querySelector('input[aria-label="Mandi name"]')?.value === 'My chosen mandi'`);
  await b.screenshot(path.join(output, 'alerts-restored.png'));

  assert.equal(b.requests.filter(url => /^https?:/.test(url) && !url.startsWith(b.origin)).length, 0, 'Market services must not request external data');
  for (const [route, text] of [['/crops', 'Crop Information'], ['/schemes', 'Schemes'], ['/settings', 'App language'], ['/crop-doctor', 'Crop Doctor']]) {
    await b.open(route, 'en', 360);
    await b.waitFor(`document.body.innerText.includes(${JSON.stringify(text)})`);
  }
  assert.deepEqual(b.errors, [], 'Unexpected runtime error');
  fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify({ passed: true, screens: routes.map(r => r[0]), languages: ['hi', 'en'], width: 320,
    calculatorOffline: true, preferenceOfflineAndRestored: true, noExternalDataRequests: true, existingRoutesChecked: ['crops', 'schemes', 'settings', 'crop-doctor'] }, null, 2));
  console.log('PASS: all eight market screens in Hindi/English, Home/card/back navigation, offline calculator and validation, local preferences after reload, no external data calls, existing screens.');
}).catch(error => { console.error(error); process.exitCode = 1; });
