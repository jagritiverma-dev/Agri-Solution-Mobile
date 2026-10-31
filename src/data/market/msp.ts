import type { MspRecord, StateSupport } from "../../types/market";
import { official, supplied, text } from "./sources";
const kharif = official(text("Government of India · PIB", "भारत सरकार · पीआईबी"),
  "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2260618&lang=2&reg=3", "2026-05-13");
const rabi = official(text("Government of India · PIB", "भारत सरकार · पीआईबी"),
  "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2173567&lang=35&reg=38", "2025-10-01");
const stateSupport = (msp: number): StateSupport => ({
  ...supplied("1"), name: text("Krishak Unnati Yojana", "कृषक उन्नति योजना"), amount: 3100 - msp, totalRatePerQuintal: 3100,
  basis: text("additional per quintal; supplied total ₹3,100 including MSP. Subject to registration, quality and the stated 21 quintals/acre limit; confirm this season’s eligibility at the centre.",
    "प्रति क्विंटल अतिरिक्त राशि; दी गई कुल दर ₹3,100 में समर्थन मूल्य शामिल है। पंजीयन, गुणवत्ता और बताई गई 21 क्विंटल/एकड़ सीमा लागू; इस मौसम की पात्रता केंद्र से जांचें।"),
});
// Effective procurement dates were not specified in the MSP releases; do not substitute announcement dates.
export const mspRecords: MspRecord[] = [
  { ...kharif, id: "msp-paddy-common-2026", cropId: "paddy", gradeId: "paddy-common", grade: text("Common", "सामान्य"), seasonId: "kharif-2026-27", season: text("Kharif 2026–27", "खरीफ 2026–27"), pricePerQuintal: 2441, unit: "INR/quintal", stateSupport: stateSupport(2441) },
  { ...kharif, id: "msp-paddy-a-2026", cropId: "paddy", gradeId: "paddy-grade-a", grade: text("Grade A", "ग्रेड ए"), seasonId: "kharif-2026-27", season: text("Kharif 2026–27", "खरीफ 2026–27"), pricePerQuintal: 2461, unit: "INR/quintal", stateSupport: stateSupport(2461) },
  { ...kharif, id: "msp-maize-2026", cropId: "maize", gradeId: "maize", grade: text("Maize · procurement quality requirements apply", "मक्का · खरीदी की गुणवत्ता शर्तें लागू"), seasonId: "kharif-2026-27", season: text("Kharif 2026–27", "खरीफ 2026–27"), pricePerQuintal: 2410, unit: "INR/quintal" },
  { ...kharif, id: "msp-arhar-2026", cropId: "arhar", gradeId: "arhar-whole", grade: text("Whole pigeon pea · procurement quality requirements apply", "साबुत अरहर · खरीदी की गुणवत्ता शर्तें लागू"), seasonId: "kharif-2026-27", season: text("Kharif 2026–27", "खरीफ 2026–27"), pricePerQuintal: 8450, unit: "INR/quintal" },
  { ...rabi, id: "msp-wheat-2026", cropId: "wheat", gradeId: "wheat-faq", grade: text("Fair Average Quality (FAQ)", "सामान्य औसत गुणवत्ता"), seasonId: "rabi-2026-27", season: text("Rabi 2026–27", "रबी 2026–27"), pricePerQuintal: 2585, unit: "INR/quintal" },
  { ...rabi, id: "msp-gram-2026", cropId: "gram", gradeId: "gram-whole", grade: text("Whole chickpea · procurement quality requirements apply", "साबुत चना · खरीदी की गुणवत्ता शर्तें लागू"), seasonId: "rabi-2026-27", season: text("Rabi 2026–27", "रबी 2026–27"), pricePerQuintal: 5875, unit: "INR/quintal" },
];
