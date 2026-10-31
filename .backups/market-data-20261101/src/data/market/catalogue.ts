import { districts } from "../districts";
import type { MarketText } from "../../types/market";

// Selection labels only. No prices, availability or purchase eligibility are implied.
export const marketCrops: { id: string; name: MarketText }[] = [
  { id: "paddy", name: { hi: "धान", en: "Paddy" } },
  { id: "wheat", name: { hi: "गेहूं", en: "Wheat" } },
  { id: "maize", name: { hi: "मक्का", en: "Maize" } },
  { id: "gram", name: { hi: "चना", en: "Chickpea" } },
  { id: "arhar", name: { hi: "अरहर", en: "Pigeon pea" } },
  { id: "moong", name: { hi: "मूंग", en: "Green gram" } },
  { id: "urad", name: { hi: "उड़द", en: "Black gram" } },
  { id: "soyabean", name: { hi: "सोयाबीन", en: "Soybean" } },
  { id: "mustard", name: { hi: "सरसों", en: "Mustard" } },
  { id: "groundnut", name: { hi: "मूंगफली", en: "Groundnut" } },
  { id: "sesamum", name: { hi: "तिल", en: "Sesame" } },
  { id: "ragi", name: { hi: "रागी", en: "Ragi" } },
  { id: "jowar", name: { hi: "ज्वार", en: "Sorghum" } },
  { id: "bajra", name: { hi: "बाजरा", en: "Pearl millet" } },
];
export const marketDistricts = districts.map(d => ({
  id: d.id, name: { hi: d.hindiName, en: d.districtName },
}));
