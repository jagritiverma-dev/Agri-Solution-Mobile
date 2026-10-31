import { fetchJson } from "./http";
import { DistrictProfile } from "../data/districtAgriculture";
export type DistrictWeather = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
  };
};
const cache = new Map<string, { at: number; data: DistrictWeather }>();
const pending = new Map<string, Promise<DistrictWeather>>();
export function validDistrictWeather(data: DistrictWeather): boolean {
  const current = data?.current;
  const daily = data?.daily;
  return (
    !!current &&
    typeof current.time === "string" &&
    [
      "temperature_2m",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
    ].every((key) => Number.isFinite(current[key as keyof typeof current])) &&
    !!daily &&
    Array.isArray(daily.time) &&
    daily.time.length === 3 &&
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
    ].every((key) => {
      const values = daily[key as keyof typeof daily];
      return (
        Array.isArray(values) &&
        values.length === 3 &&
        values.every(
          (value) => typeof value === "number" && Number.isFinite(value),
        )
      );
    })
  );
}
export function getDistrictWeather(
  district: DistrictProfile,
  refresh = false,
): Promise<DistrictWeather> {
  if (!district.place)
    return Promise.reject(new Error("No verified forecast location."));
  const cached = cache.get(district.id);
  if (!refresh && cached && Date.now() - cached.at < 10 * 60 * 1000)
    return Promise.resolve(cached.data);
  const existing = pending.get(district.id);
  if (existing) return existing;
  const params = new URLSearchParams({
    latitude: String(district.place.latitude),
    longitude: String(district.place.longitude),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
    timezone: "Asia/Kolkata",
    forecast_days: "3",
  });
  const request = fetchJson<DistrictWeather>(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    {},
    12000,
  )
    .then((data) => {
      if (!validDistrictWeather(data)) throw new Error("Incomplete forecast.");
      cache.set(district.id, { at: Date.now(), data });
      return data;
    })
    .finally(() => pending.delete(district.id));
  pending.set(district.id, request);
  return request;
}
