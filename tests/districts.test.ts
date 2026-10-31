import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  districtProfiles,
  matchingDistricts,
} from "../src/data/districtAgriculture";
import map from "../src/data/districtMapData.json";
import {
  getDistrictWeather,
  validDistrictWeather,
} from "../src/services/districtWeather";
const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});
const valid = {
  current: {
    time: "2026-10-31T12:00",
    temperature_2m: 28,
    relative_humidity_2m: 60,
    weather_code: 1,
    wind_speed_10m: 5,
  },
  daily: {
    time: ["2026-10-31", "2026-11-01", "2026-11-02"],
    temperature_2m_max: [29, 30, 31],
    temperature_2m_min: [20, 21, 22],
    precipitation_probability_max: [10, 20, 30],
    precipitation_sum: [0, 1, 2],
  },
};
test("every selectable district has a unique map path, Hindi name, and verified forecast point", () => {
  assert.equal(districtProfiles.length, 33);
  assert.equal(new Set(districtProfiles.map((d) => d.id)).size, 33);
  assert.deepEqual(
    new Set(districtProfiles.map((d) => d.id)),
    new Set(map.paths.filter((p) => !p.outline).map((p) => p.id)),
  );
  for (const d of districtProfiles) {
    assert.match(d.hindiName, /[\u0900-\u097F]/);
    assert.ok(d.place.geonameId);
    assert.ok(d.place.latitude > 17 && d.place.latitude < 25);
    assert.ok(d.place.longitude > 80 && d.place.longitude < 85);
    assert.ok(d.regionIds.includes(d.region));
  }
});
test("Hindi search and overlapping regional boundaries work without duplicate districts", () => {
  assert.equal(matchingDistricts("रायपुर", "all")[0].districtName, "Raipur");
  for (const region of ["plains", "bastar"] as const)
    assert.ok(matchingDistricts("Kanker", region).length);
  for (const region of ["north", "plains"] as const)
    assert.ok(matchingDistricts("Raigarh", region).length);
  assert.equal(matchingDistricts("no such district", "all").length, 0);
});
test("missing forecast values are rejected rather than displayed as zero", () => {
  assert.equal(validDistrictWeather(valid), true);
  assert.equal(
    validDistrictWeather({
      ...valid,
      daily: { ...valid.daily, precipitation_sum: [0, null, 1] },
    } as never),
    false,
  );
  assert.equal(
    validDistrictWeather({
      ...valid,
      current: { ...valid.current, temperature_2m: NaN },
    }),
    false,
  );
});
test("same-location requests are coalesced and cached; manual refresh fetches again", async () => {
  let calls = 0;
  global.fetch = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 5));
    return new Response(JSON.stringify(valid));
  };
  const district = districtProfiles[0];
  await Promise.all([
    getDistrictWeather(district, true),
    getDistrictWeather(district, true),
  ]);
  assert.equal(calls, 1);
  await getDistrictWeather(district);
  assert.equal(calls, 1);
  await getDistrictWeather(district, true);
  assert.equal(calls, 2);
});
test("a failed forecast can be retried and does not poison the cache", async () => {
  const district = districtProfiles[1];
  global.fetch = async () => new Response("{}");
  await assert.rejects(getDistrictWeather(district, true), /Incomplete/);
  global.fetch = async () => new Response(JSON.stringify(valid));
  assert.deepEqual(await getDistrictWeather(district), valid);
});
