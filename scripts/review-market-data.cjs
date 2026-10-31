const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { withMarketBrowser } = require('./market-browser.cjs');
const output = path.resolve(__dirname, '../artifacts/market-data-review');

withMarketBrowser(async b => {
  async function choose(label, option) {
    await b.waitFor(`Array.from(document.querySelectorAll('[role="button"]')).some(el => el.getAttribute('aria-label')?.startsWith(${JSON.stringify(label + ':')}))`);
    await b.evaluate(`Array.from(document.querySelectorAll('[role="button"]')).find(el => el.getAttribute('aria-label')?.startsWith(${JSON.stringify(label + ':')})).click()`);
    await b.waitFor(`!!document.querySelector('input[aria-label="Search by name"]')`);
    await b.input('Search by name', option);
    await b.waitFor(`Array.from(document.querySelectorAll('[role="radio"]')).some(el => el.innerText.startsWith(${JSON.stringify(option)}))`);
    await b.evaluate(`Array.from(document.querySelectorAll('[role="radio"]')).find(el => el.innerText.startsWith(${JSON.stringify(option)})).click()`);
    await b.waitFor(`!document.querySelector('input[aria-label="Search by name"]')`);
    await b.pause(100);
  }
  const contains = text => b.evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
  const screenshot = file => b.screenshot(path.join(output, file));

  await b.open('/market/msp', 'en', 320);
  await b.waitFor(`document.body.innerText.includes('2,441.00')`);
  assert.ok(await contains('5,875.00'));
  assert.ok(await contains('Krishak Unnati Yojana'));
  assert.equal(await contains('No information available yet'), false);
  await choose('Marketing season', 'Rabi 2026–27');
  assert.equal(await contains('2,441.00'), false);
  assert.ok(await contains('2,585.00'));
  await choose('Crop', 'Paddy');
  assert.ok(await contains('2,441.00')); assert.ok(await contains('2,461.00'));
  assert.equal(await contains('2,585.00'), false);
  await screenshot('msp-filtered.png');

  await b.open('/market/mandi', 'en', 320);
  await choose('District', 'Raipur');
  assert.ok(await contains('Pandri / Tulsi Mandi')); assert.ok(await contains('Arang Mandi'));
  assert.equal(await contains('Tifra Mandi'), false);
  await choose('Select mandi', 'Arang Mandi');
  assert.ok(await contains('2,360.00')); assert.equal(await contains('2,100.00'), false);
  await choose('Crop', 'Maize');
  assert.ok(await contains('No information available yet'));
  await choose('Crop', 'Paddy');
  assert.ok(await contains('2,360.00'));
  await screenshot('mandi-filtered.png');

  await b.open('/market/inputs', 'en', 320);
  assert.ok(await contains('266.50')); assert.ok(await contains('1,650.00'));
  await choose('Price type', 'NBS-supported / reported MRP');
  assert.ok(await contains('1,350.00')); assert.ok(await contains('1,650.00'));
  assert.equal(await contains('266.50'), false);
  await choose('Price type', 'State rate (supplied)');
  assert.ok(await contains('1,050.00')); assert.equal(await contains('1,350.00'), false);

  await b.open('/market/dealers', 'en', 320);
  await b.evaluate(`Array.from(document.querySelectorAll('[role="radio"]')).find(el => el.innerText.trim() === 'Machinery').click()`);
  await b.waitFor(`!document.body.innerText.includes('MARKFED Input Depot')`);
  assert.ok(await contains('Annapurna Krishi Kendra'));
  await choose('District', 'Durg');
  assert.ok(await contains('No information available yet'));
  await b.evaluate(`Array.from(document.querySelectorAll('[role="radio"]')).find(el => el.innerText.trim() === 'Seeds').click()`);
  await b.waitFor(`document.body.innerText.includes('Kisan Beej Evam Khad Bhandar')`);
  assert.ok(await contains('DRG/AGR/SEED/2019/4412'));
  await screenshot('dealer-filtered.png');

  await b.open('/market/centres', 'en', 320);
  await choose('Service category', 'Soil testing laboratory');
  assert.ok(await contains('District Soil Testing Lab'));
  assert.equal(await contains('Abhanpur PACS'), false);
  await choose('Service category', 'Agricultural training');
  assert.ok(await contains('Krishi Vigyan Kendra'));
  await choose('District', 'Raipur');
  assert.ok(await contains('No information available yet'));
  await choose('Service category', 'Procurement');
  assert.ok(await contains('Kisan Panjiyan'));

  await b.open('/market/comparison', 'en', 320);
  await choose('Crop', 'Paddy');
  assert.equal(await contains('No information available yet'), false);
  assert.ok(await contains('3,100.00')); assert.ok(await contains('1,200.00'));
  await choose('Select a matching mandi record', 'Arang Mandi');
  assert.ok(await contains('740.00')); assert.ok(await contains('81.00'));
  await b.input('Quantity (quintals)', '10');
  await b.click('Compare amounts');
  assert.ok(await contains('24,410.00')); assert.ok(await contains('23,600.00')); assert.ok(await contains('810.00'));
  await choose('Crop', 'Wheat');
  assert.ok(await contains('No information available yet'));
  assert.equal(await contains('24,410.00'), false);

  await b.open('/market/alerts', 'en', 320);
  await choose('Crop', 'Paddy');
  await choose('District', 'Raipur');
  await choose('Select mandi', 'Arang Mandi');
  await b.input('Target price (₹/quintal)', '2500');
  await b.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await b.click('Save preference');
  await b.waitFor(`document.body.innerText.includes('Your preference is saved')`);
  const saved = await b.evaluate(`JSON.parse(localStorage.getItem('mor_kisani_market_preference_v1'))`);
  assert.equal(saved.cropId, 'paddy'); assert.equal(saved.districtId, 'path7133');
  assert.equal(saved.mandiId, 'raipur-arang'); assert.equal(saved.mandiName, 'Arang Mandi'); assert.equal(saved.targetPrice, 2500);
  await b.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await b.send('Page.reload');
  await b.waitFor(`document.querySelector('input[aria-label="Target price (₹/quintal)"]')?.value === '2500'`);
  assert.ok(await contains('Arang Mandi'));
  await screenshot('alert-restored.png');

  for (const [route, content] of [['msp', 'कृषक उन्नति योजना'], ['mandi', 'आरंग मंडी'], ['inputs', 'नीम लेपित यूरिया'], ['dealers', 'अन्नपूर्णा कृषि केंद्र'], ['centres', 'अभनपुर']]) {
    await b.open('/market/' + route, 'hi', 320);
    await b.waitFor(`document.body.innerText.includes(${JSON.stringify(content)})`);
    assert.ok(await b.evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`));
    assert.equal(await contains('market.'), false);
    await screenshot(route + '-hi.png');
  }
  assert.deepEqual(b.errors, []);
  assert.equal(b.requests.filter(url => /^https?:/.test(url) && !url.startsWith(b.origin)).length, 0);
  fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify({ passed: true, width: 320, filters: ['msp', 'mandi', 'inputs', 'dealers', 'centres'], comparisonAutofill: true, comparisonReset: true, selectedMandiSavedOfflineAndRestored: true, hindiCards: true, externalDataRequests: 0 }, null, 2));
  console.log('PASS: populated bilingual cards; dependent filters and pills; comparison autofill, amounts and reset; selected-mandi preference saved offline and restored.');
}).catch(error => { console.error(error); process.exitCode = 1; });
