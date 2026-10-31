import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { translate, translations } from "../src/config/localization";
import { SCHEMES } from "../src/data/schemesData";
import { schemesHindi, schemeDocumentsHindi } from "../src/data/schemesHindi";
import places from "../src/data/districtPlaces.json";
import { schemeSummaries } from "../src/data/schemeSummaries";

test("home and navigation have Hindi text without the content server", () => {
  for (const key of Object.keys(translations.en)) {
    assert.ok(translate(key, "hi"), key);
  }
  for (const key of ["Home", "Crops", "Weather", "Profile", "Settings", "Farmer account", "Crop guide", "Schemes & Subsidies", "Procurement centres", "Notice board", "Farming assistant", "Crop Doctor"]) {
    assert.match(translate(key, "hi") ?? "", /[\u0900-\u097f]/, key);
  }
});

test("every bundled crop description and growing detail has Hindi copy", () => {
  const source = readFileSync(new URL("../src/app/(tabs)/crops.tsx", import.meta.url), "utf8");
  const fields = /(?:description|soil|water|duration|seed|irrigation|fertilizer|protection|sowing|harvest|type):\s*"([^"]+)"/g;
  let count = 0;
  for (const [, value] of source.matchAll(fields)) {
    assert.match(translate(value, "hi") ?? "", /[\u0900-\u097f]/, value);
    count++;
  }
  assert.ok(count > 100, "Exercise the full crop guide, not just a sample");
});

test("all schemes include Hindi benefits, summaries, eligibility and documents", () => {
  for (const scheme of SCHEMES) {
    assert.ok(schemeSummaries[scheme.id], `Simple English summary: ${scheme.id}`);
    const copy = schemesHindi[scheme.id];
    assert.equal(copy?.length, 2 + scheme.eligibility.length, scheme.id);
    copy.forEach(text => assert.match(text, /[\u0900-\u097f]/, scheme.id));
    for (const document of [...scheme.documents, scheme.applyMode]) {
      assert.match(schemeDocumentsHindi[document] ?? "", /[\u0900-\u097f]/, document);
    }
  }
});

test("multiline copy and accented place names resolve consistently", () => {
  for (const place of Object.values(places)) {
    assert.match(translate(place.name, "hi") ?? "", /[\u0900-\u097f]/, place.name);
  }
  assert.equal(translate("  Change\n password  ", "hi"), "पासवर्ड बदलें");
  assert.equal(translate("Bījāpur", "hi"), "बीजापुर");
  assert.equal(translate("home.crops", "en"), "Crops");
  assert.equal(translate("home.crops", "hi"), "फसलें");
  assert.equal(translate("home.crops", "en"), "Crops");
  assert.equal(translate("A farmer's own name", "hi"), undefined);
});
