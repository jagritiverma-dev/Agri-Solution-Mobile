import { districts } from "./districts";
import places from "./districtPlaces.json";
export type RegionId = "plains" | "north" | "bastar";
export const agricultureSource =
  "https://igfri.org.in/uploads/Fodder%20Plan%20-Chhattisgarh.pdf";
export const zoneSource = "https://igkv.ac.in/smartkisan/eKnowledge/Home.aspx";
export const directorySource = "https://igod.gov.in/sg/CG/E042/organizations";
export const advisorySource =
  "https://mausam.imd.gov.in/responsive/agromet_adv_ser_district_level_wx_forecast.php";
// Regional reference, not district measurements or farm-specific recommendations.
// ICAR-IGFRI 2024, Table 1 (PDF p.20) and Table 5 (PDF pp.30–31).
export const regions = {
  plains: {
    en: "Central plains",
    hi: "मध्य मैदानी क्षेत्र",
    rain: "1,200–1,600",
    soilEn: "Red-yellow & brown-black soils",
    soilHi: "लाल-पीली और भूरी-काली मिट्टी",
    cropsEn: ["Rice", "Chickpea", "Wheat", "Soybean", "Lathyrus"],
    cropsHi: ["धान", "चना", "गेहूँ", "सोयाबीन", "तिवरा"],
    summaryEn:
      "Rice is common here. After rice, farmers may grow chickpea, wheat or lathyrus. Choose the next crop based on water availability.",
    summaryHi:
      "यहां धान की खेती ज्यादा होती है। धान के बाद पानी की उपलब्धता के अनुसार चना, गेहूं या तिवरा उगाया जाता है। अगली फसल चुनते समय सिंचाई का ध्यान रखें।",
  },
  north: {
    en: "Northern hills",
    hi: "उत्तरी पहाड़ी क्षेत्र",
    rain: "1,400–1,600",
    soilEn: "Red-yellow & brown-black soils",
    soilHi: "लाल-पीली और भूरी-काली मिट्टी",
    cropsEn: ["Rice", "Maize", "Horse gram", "Niger", "Mustard"],
    cropsHi: ["धान", "मक्का", "कुल्थी", "रामतिल", "सरसों"],
    summaryEn:
      "Farmers in this area grow rice, maize, horse gram and niger. Where irrigation is available, they also grow wheat and vegetables.",
    summaryHi:
      "इस इलाके में धान, मक्का, कुल्थी और रामतिल उगाए जाते हैं। जहां सिंचाई की सुविधा है, वहां गेहूं और सब्जियों की खेती भी होती है।",
  },
  bastar: {
    en: "Bastar plateau",
    hi: "बस्तर पठार",
    rain: "1,400–1,600",
    soilEn: "Red-yellow & brown-black soils",
    soilHi: "लाल-पीली और भूरी-काली मिट्टी",
    cropsEn: ["Rice", "Maize", "Millets", "Niger", "Pigeon pea"],
    cropsHi: ["धान", "मक्का", "मोटे अनाज", "रामतिल", "अरहर"],
    summaryEn:
      "Farmers here mainly rely on rain to grow rice, maize, millets and niger. Pulses are also grown together with other crops.",
    summaryHi:
      "बस्तर में धान, मक्का, मोटे अनाज और रामतिल की खेती मुख्य रूप से बारिश के पानी से होती है। मिली-जुली खेती में दाल वाली फसलें भी लगाई जाती हैं।",
  },
};
// Browsing groups inferred from IGKV's legacy regional coverage and parent districts.
// Kanker and Raigarh span zones, so they occur in both relevant filters.
const northern = new Set([
  "path2278",
  "path4496",
  "path4651",
  "path4473",
  "path4267",
  "path4890",
]);
const southern = new Set([
  "path10649",
  "path2387",
  "path10170",
  "path8477",
  "path8739",
  "path9215",
  "path8584",
]);
export const districtProfiles = districts.map((d) => {
  const region: RegionId = northern.has(d.id)
    ? "north"
    : southern.has(d.id)
      ? "bastar"
      : "plains";
  const regionIds: RegionId[] =
    d.id === "path8477"
      ? ["bastar", "plains"]
      : d.id === "path10974"
        ? ["plains", "north"]
        : [region];
  return {
    ...d,
    region,
    regionIds,
    place: places[d.id as keyof typeof places],
  };
});
export type DistrictProfile = (typeof districtProfiles)[number];
export function matchingDistricts(query: string, region: RegionId | "all") {
  const term = query.trim().toLocaleLowerCase();
  return districtProfiles.filter(
    (d) =>
      (region === "all" || d.regionIds.includes(region)) &&
      `${d.districtName} ${d.hindiName} ${d.capitalCity}`
        .toLocaleLowerCase()
        .includes(term),
  );
}
