import type { InputPriceRecord } from "../../types/market";
import { official, supplied, text } from "./sources";
export const inputPriceRecords: InputPriceRecord[] = [
  { ...official(text("Department of Fertilizers · Rajya Sabha answer 2425", "उर्वरक विभाग · राज्यसभा उत्तर 2425"), "https://sansad.in/getFile/annex/266/AU2425_YwjsE6.pdf?source=pqars", "2024-12-17"),
    id: "urea-45kg", product: text("Neem Coated Urea", "नीम लेपित यूरिया"), formulation: text("46% nitrogen", "46% नाइट्रोजन"), packageSize: text("45 kg bag", "45 किलो बोरी"), price: 266.50, priceType: "regulated", priceCategory: "statutory",
    priceNote: text("Statutorily notified retail price, as recorded in the dated source.", "स्रोत की तारीख के अनुसार अधिसूचित खुदरा मूल्य।") },
  { ...official(text("Department of Fertilizers · PIB", "उर्वरक विभाग · पीआईबी"), "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2288824&lang=1&reg=3", "2026-07-24"),
    id: "dap-50kg", product: text("Di-Ammonium Phosphate (DAP)", "डीएपी"), formulation: text("N:P:K · 18:46:0", "नाइट्रोजन:फॉस्फोरस:पोटाश · 18:46:0"), packageSize: text("50 kg bag", "50 किलो बोरी"), price: 1350, priceType: "mrp", priceCategory: "nbs",
    priceNote: text("DAP price supported for Kharif 2026. NBS subsidises nutrients; P&K retail prices are decontrolled, not universal statutory ceilings.", "खरीफ 2026 के लिए सहायता से बनाए रखी गई डीएपी की कीमत। एनबीएस में पोषक तत्वों पर सब्सिडी मिलती है; फॉस्फेट और पोटाश उर्वरकों की खुदरा कीमतें सार्वभौमिक सरकारी सीमा नहीं हैं।") },
  { ...supplied("3"), id: "mop-50kg", product: text("Muriate of Potash (MOP)", "म्यूरेट ऑफ पोटाश"), formulation: text("60% K₂O", "60% पोटाश"), packageSize: text("50 kg bag", "50 किलो बोरी"), price: 1650, priceType: "mrp", priceCategory: "nbs",
    priceNote: text("Supplied MRP; brand, effective date and official price support are not confirmed.", "दी गई एमआरपी; ब्रांड, लागू तारीख और इस दर की आधिकारिक पुष्टि उपलब्ध नहीं।") },
  { ...supplied("3"), id: "paddy-seed-30kg", product: text("Certified Paddy Seeds", "प्रमाणित धान बीज"), formulation: text("Karma Mahsuri / Rajeshwari / Indira Aerobic · confirm variety and certification", "कर्मा महसूरी / राजेश्वरी / इंदिरा एरोबिक · किस्म और प्रमाणन जांचें"), packageSize: text("30 kg bag", "30 किलो बोरी"), price: 1050, priceType: "quotation", priceCategory: "state-notified",
    priceNote: text("Supplied state-distribution rate; notification and variety-specific price are awaiting confirmation.", "राज्य वितरण के लिए दी गई दर; अधिसूचना और किस्म के अनुसार कीमत की पुष्टि बाकी है।") },
];
