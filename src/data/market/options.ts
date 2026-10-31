import type { Language } from "../../config/localization";
import { marketCrops, marketDistricts } from "./catalogue";
import { publishedMsp, publishedMandi, publishedDealers, publishedCentres } from "./published";

export function activeCropOptions(language: Language, scope: "all" | "msp" | "mandi" = "all") {
  const records = scope === "msp" ? publishedMsp : scope === "mandi" ? publishedMandi : [...publishedMsp, ...publishedMandi];
  const ids = new Set(records.map(r => r.cropId));
  return marketCrops.filter(c => ids.has(c.id)).map(c => ({ value: c.id, label: c.name[language] }));
}
export function activeDistrictOptions(language: Language, scope: "mandi" | "dealers" | "centres" = "mandi") {
  const records = scope === "dealers" ? publishedDealers : scope === "centres" ? publishedCentres : publishedMandi;
  const ids = new Set(records.map(r => r.districtId));
  return marketDistricts.filter(d => ids.has(d.id)).map(d => ({ value: d.id, label: d.name[language] }));
}
