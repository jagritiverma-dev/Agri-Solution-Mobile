import type { DealerRecord } from "../../types/market";
import { districtIds as d, supplied, text } from "./sources";
export const dealerRecords: DealerRecord[] = [
  { ...supplied("4"), id: "markfed-raipur", name: text("MARKFED Input Depot – Raipur", "मार्कफेड कृषि सामग्री डिपो – रायपुर"), districtId: d.raipur, categories: ["fertilizers", "seeds"],
    address: text("Near Mandi Gate, Pandri, Raipur – 492004", "मंडी गेट के पास, पंडरी, रायपुर – 492004"), phone: "0771-4034800",
    products: [text("Fertilizers", "खाद"), text("Certified seeds", "प्रमाणित बीज")], openingHours: text("Mon–Sat: 10:00 AM–5:30 PM", "सोम–शनि: सुबह 10 से शाम 5:30 बजे") },
  { ...supplied("4"), id: "kisan-beej-durg", name: text("Kisan Beej Evam Khad Bhandar – Durg", "किसान बीज एवं खाद भंडार – दुर्ग"), districtId: d.durg, categories: ["seeds", "fertilizers", "pesticides"],
    address: text("Shop 14, Ganj Mandi Complex, Station Road, Durg – 491001", "दुकान 14, गंज मंडी परिसर, स्टेशन रोड, दुर्ग – 491001"), phone: "+91 94252 38112",
    products: [text("Seeds", "बीज"), text("Fertilizers", "खाद"), text("Pesticides", "कीटनाशक")], licence: { number: "DRG/AGR/SEED/2019/4412" } },
  { ...supplied("4"), id: "annapurna-bilaspur", name: text("Annapurna Krishi Kendra – Bilaspur", "अन्नपूर्णा कृषि केंद्र – बिलासपुर"), districtId: d.bilaspur, categories: ["pesticides", "machinery"],
    address: text("Tifra Krishi Upaj Mandi Premises, Bilaspur – 495001", "तिफरा कृषि उपज मंडी परिसर, बिलासपुर – 495001"), phone: "+91 98271 65420",
    products: [text("Agrochemicals", "कृषि रसायन"), text("Knapsack sprayers", "पीठ पर रखने वाले स्प्रेयर")] },
];
