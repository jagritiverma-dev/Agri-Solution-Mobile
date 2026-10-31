import assert from "node:assert/strict";
import test from "node:test";
import { publishedMsp, publishedMandi, publishedInputs, publishedDealers, publishedCentres, selectMandiRecords } from "../src/data/market/published";
import { activeCropOptions, activeDistrictOptions } from "../src/data/market/options";
import { hasEvidence, hasSuppliedEvidence } from "../src/utils/market";
import { comparisonSelection, comparisonRates } from "../src/utils/marketComparison";

test("manual datasets populate all five directories without promoting supplied claims to verified", () => {
  assert.deepEqual([publishedMsp.length, publishedMandi.length, publishedInputs.length, publishedDealers.length, publishedCentres.length], [6, 5, 4, 3, 3]);
  assert.ok(publishedMsp.every(r => hasEvidence(r, true)));
  assert.ok(publishedMandi.every(r => hasSuppliedEvidence(r) && !hasEvidence(r)));
  assert.ok(publishedDealers.every(r => hasSuppliedEvidence(r) && !hasEvidence(r)));
  const supplied = publishedMandi[0];
  assert.equal(selectMandiRecords([{ ...supplied, source: { ...supplied.source, name: { en: "Official", hi: "सरकारी" } } }]).length, 0);
  assert.equal(selectMandiRecords([{ ...supplied, verification: { status: "verified", checkedOn: "2026-11-01" } }]).length, 0);
  assert.equal(selectMandiRecords([{ ...supplied, verification: { status: "unverified" } }]).length, 0);
});

test("active dropdowns and dependent record filters use the populated catalogue", () => {
  assert.deepEqual(activeCropOptions("en").map(o => o.label), ["Paddy", "Wheat", "Maize", "Chickpea", "Pigeon pea"]);
  assert.deepEqual(activeDistrictOptions("en").map(o => o.label).sort(), ["Bilaspur", "Durg", "Raipur"]);
  assert.equal(publishedMsp.filter(r => r.seasonId === "rabi-2026-27").length, 2);
  assert.equal(publishedMsp.filter(r => r.cropId === "paddy").length, 2);
  const raipur = publishedMandi.filter(r => r.districtId === "path7133");
  assert.deepEqual(raipur.map(r => r.mandiId), ["raipur-pandri", "raipur-arang"]);
  assert.equal(raipur.filter(r => r.cropId === "paddy")[0].modal, 2360);
  assert.equal(publishedInputs.filter(r => r.priceCategory === "nbs").length, 2);
  assert.equal(publishedDealers.filter(r => r.categories.includes("machinery"))[0].id, "annapurna-bilaspur");
  assert.equal(publishedCentres.filter(r => r.category === "soil-lab")[0].districtId, "path3192");
});

test("comparison autofills compatible grades, resets unavailable selections and never adds total state rate to MSP", () => {
  const selection = comparisonSelection("paddy", publishedMsp, publishedMandi);
  assert.equal(selection.mspId, "msp-paddy-common-2026");
  assert.equal(selection.mandiId, "tifra-paddy-20261029");
  const msp = publishedMsp.find(r => r.id === selection.mspId)!;
  const mandi = publishedMandi.find(r => r.mandiId === "raipur-arang")!;
  assert.deepEqual(comparisonRates(msp, mandi), { mspDifference: 81, stateRate: 3100, stateDifference: 740 });
  assert.equal(msp.stateSupport?.amount, 659);
  assert.equal(publishedMsp.find(r => r.gradeId === "paddy-grade-a")?.stateSupport?.amount, 639);
  assert.equal(comparisonSelection("paddy", publishedMsp, publishedMandi, "msp-paddy-a-2026").mandiId, "");
  assert.equal(comparisonSelection("wheat", publishedMsp, publishedMandi).mandiId, "");
  assert.equal(comparisonSelection("", publishedMsp, publishedMandi).mspId, "");
  assert.equal(comparisonRates(msp, { ...mandi, gradeId: "paddy-grade-a" }), undefined);
  const inconsistent = { ...msp, stateSupport: { ...msp.stateSupport!, totalRatePerQuintal: 5555 } };
  assert.equal(comparisonRates(inconsistent, mandi)?.stateRate, undefined);
});
