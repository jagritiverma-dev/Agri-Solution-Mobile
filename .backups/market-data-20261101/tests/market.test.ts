import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { calculateSale, parseFixed } from "../src/utils/saleCalculator";
import { hasEvidence, matchingGrade, phoneUrl, directionsUrl, formatMoney, validDate } from "../src/utils/market";
import { createPreference, validPreference } from "../src/utils/marketPreference";
import { selectMspRecords, selectMandiRecords, selectDealerRecords, selectInputRecords, selectCentreRecords } from "../src/data/market/published";
import { marketTranslations } from "../src/config/marketTranslations";
import type { MspRecord, MandiPriceRecord, DealerRecord, InputPriceRecord, CentreRecord, RecordEvidence } from "../src/types/market";

// Synthetic test fixtures only. These are never imported by the app or represented as actual prices.
const text = { hi: "परीक्षण", en: "Test fixture" };
const evidence: RecordEvidence = {
  source: { name: text, kind: "official", documentReference: "TEST ONLY — not an official record" },
  reportedOn: "2025-01-01", verification: { status: "verified", checkedOn: "2025-01-02" },
};
const msp: MspRecord = { ...evidence, id: "test-msp", cropId: "paddy", gradeId: "test-grade", grade: text,
  season: text, seasonId: "test-season", pricePerQuintal: 100, unit: "INR/quintal", effectiveFrom: "2025-01-01" };
const mandi: MandiPriceRecord = { ...evidence, id: "test-mandi", cropId: "paddy", gradeId: "test-grade", grade: text,
  districtId: "path7133", mandiId: "test-market", mandiName: text, minimum: 80, modal: 100, maximum: 120, unit: "INR/quintal" };

test("sale calculator computes gross, deductions and net using fixed-point currency", () => {
  assert.deepEqual(calculateSale({ quantity: "12.5", price: "2,000.25", transport: "500.50", other: "100" }),
    { ok: true, value: { gross: 25003.13, deductions: 600.50, net: 24402.63 } });
  assert.deepEqual(calculateSale({ quantity: "१.२५", price: "१००", transport: "", other: "" }),
    { ok: true, value: { gross: 125, deductions: 0, net: 125 } });
  assert.deepEqual(calculateSale({ quantity: "1", price: "100", transport: "150", other: "0" }),
    { ok: true, value: { gross: 100, deductions: 150, net: -50 } });
  assert.equal(parseFixed("1,00,000.50", 2), 10000050);
  assert.equal(parseFixed(".5", 3), 500);
});

test("calculator rejects invalid, negative, infinite, excessive precision and unsafe amounts", () => {
  for (const value of ["", "-1", "0", "NaN", "Infinity", "1e3", "1,2", "2.1234", "₹25"]) {
    assert.equal(calculateSale({ quantity: value, price: "10", transport: "", other: "" }).ok, false, value);
  }
  for (const field of ["price", "transport", "other"] as const) {
    assert.equal(calculateSale({ quantity: "1", price: "10", transport: "0", other: "0", [field]: "-1" }).ok, false);
  }
  assert.equal(calculateSale({ quantity: "999999999", price: "999999999", transport: "", other: "" }).ok, false);
  assert.equal(parseFixed("10.123", 2), undefined);
  assert.match(formatMoney(123456.5, "en"), /1,23,456\.50/);
});

test("publication excludes unverified records, invalid sources, dates, units and conflicting IDs", () => {
  assert.equal(selectMspRecords([msp]).length, 1);
  assert.equal(selectMspRecords([{ ...msp, verification: { status: "unverified" } }]).length, 0);
  assert.equal(selectMspRecords([{ ...msp, source: { ...msp.source, kind: "dealer" } }]).length, 0);
  assert.equal(selectMspRecords([{ ...msp, reportedOn: "2025-02-30" }]).length, 0);
  assert.equal(selectMspRecords([{ ...msp, effectiveTo: "2024-12-31" }]).length, 0);
  assert.equal(selectMspRecords([msp, { ...msp, pricePerQuintal: 200 }]).length, 0);
  assert.equal(selectMspRecords([{ ...msp, source: { name: text, kind: "official", url: "javascript:alert(1)" } }]).length, 0);
  assert.equal(hasEvidence({ ...evidence, verification: { status: "verified" } }), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2025-02-29"), false);
});

test("mandi ranges and comparison grades/units must match", () => {
  assert.equal(selectMandiRecords([mandi]).length, 1);
  assert.equal(selectMandiRecords([{ ...mandi, modal: 130 }]).length, 0);
  assert.equal(selectMandiRecords([{ ...mandi, districtId: "missing" }]).length, 0);
  assert.equal(matchingGrade(msp, mandi), true);
  assert.equal(matchingGrade(msp, { ...mandi, cropId: "maize" }), false);
  assert.equal(matchingGrade(msp, { ...mandi, gradeId: "different" }), false);
  assert.equal(matchingGrade(msp, { ...mandi, unit: "INR/kg" }), false);
});

test("dealer, input and centre records require appropriate evidence", () => {
  const dealer: DealerRecord = { ...evidence, id: "test-dealer", name: text, districtId: "path7133", categories: ["seeds"], products: [text] };
  const input: InputPriceRecord = { ...evidence, id: "test-input", product: text, formulation: text, packageSize: text, price: 1, priceType: "regulated", effectiveFrom: "2025-01-01" };
  const centre: CentreRecord = { ...evidence, id: "test-centre", name: text, districtId: "path7133", category: "soil-lab" };
  assert.equal(selectDealerRecords([dealer]).length, 1);
  assert.equal(selectDealerRecords([{ ...dealer, categories: [] }]).length, 0);
  assert.equal(selectInputRecords([{ ...input, source: { ...input.source, kind: "dealer" } }]).length, 0);
  assert.equal(selectInputRecords([{ ...input, priceType: "quotation", source: { ...input.source, kind: "dealer" } }]).length, 1);
  assert.equal(selectInputRecords([{ ...input, priceType: "mrp", source: { ...input.source, kind: "manufacturer" } }]).length, 1);
  assert.equal(selectCentreRecords([centre]).length, 1);
  assert.equal(selectCentreRecords([{ ...centre, verification: { status: "unverified" } }]).length, 0);
});

test("call and directions links are absent without usable contact information", () => {
  assert.equal(phoneUrl("not provided"), undefined);
  assert.equal(phoneUrl("tel:+911234567890"), undefined);
  assert.equal(phoneUrl("+91 12345 67890"), "tel:+911234567890");
  assert.equal(directionsUrl({}, "Raipur", "en"), undefined);
  assert.equal(directionsUrl({ coordinates: { latitude: 999, longitude: 0 } }, "Raipur", "en"), undefined);
  assert.match(directionsUrl({ address: text }, "Raipur", "en") ?? "", /maps\/search/);
});

test("local alert preferences validate Hindi prices and survive JSON storage", () => {
  const result = createPreference({ cropId: "paddy", districtId: "path7133", mandiName: " My own market ", target: "२,०००.५०" });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.mandiName, "My own market");
    assert.equal(result.value.targetPrice, 2000.5);
    assert.equal(validPreference(JSON.parse(JSON.stringify(result.value))), true);
    assert.equal(validPreference({ ...result.value, districtId: "unknown" }), false);
    assert.equal(validPreference({ ...result.value, targetPrice: Infinity }), false);
    assert.equal(validPreference({ ...result.value, savedAt: "broken" }), false);
  }
  assert.equal(createPreference({ cropId: "paddy", districtId: "path7133", mandiName: "", target: "10" }).ok, false);
  assert.equal(createPreference({ cropId: "paddy", districtId: "path7133", mandiName: "Test", target: "0" }).ok, false);
});

test("all market UI copy is bilingual and uses existing theme tokens", () => {
  for (const [key, copy] of Object.entries(marketTranslations)) {
    assert.match(copy.hi, /[\u0900-\u097f]/, key);
    assert.ok(copy.en.trim(), key);
  }
  for (const folder of ["src/app/market", "src/components/market"]) {
    for (const name of readdirSync(folder).filter(file => file.endsWith(".tsx"))) {
      const source = readFileSync(path.join(folder, name), "utf8");
      assert.doesNotMatch(source, /#[\da-f]{3,8}\b/i, `New fixed color: ${name}`);
      for (const [, key] of source.matchAll(/["'](market\.[a-zA-Z.]+)["']/g)) assert.ok(marketTranslations[key], `${name}: ${key}`);
    }
  }
});
