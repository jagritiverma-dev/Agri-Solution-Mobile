import type { CentreRecord } from "../../types/market";
import { districtIds as d, official, supplied, text } from "./sources";
export const centreRecords: CentreRecord[] = [
  { ...supplied("4"), id: "abhanpur-pacs", name: text("Abhanpur PACS Procurement Centre", "अभनपुर प्राथमिक कृषि साख समिति खरीदी केंद्र"), districtId: d.raipur, category: "procurement",
    address: text("Abhanpur, Raipur · exact centre address not supplied", "अभनपुर, रायपुर · केंद्र का पूरा पता उपलब्ध नहीं"),
    services: text("Paddy procurement · supplied MARKFED centre code 110402", "धान खरीदी · दिया गया मार्कफेड केंद्र कोड 110402"),
    operatingSeason: text("Kharif marketing season; confirm this season’s opening and closing dates with the centre.", "खरीफ विपणन मौसम; इस साल खरीदी शुरू और बंद होने की तारीख केंद्र से पता करें।"),
    registrationRequirements: text("Supplied requirements: Kisan Panjiyan registration, B-1/P-II land-record verification, Token Tunhar Haath token. Confirm before visiting.", "दी गई शर्तें: किसान पंजीयन, बी-1/पी-2 भूमि अभिलेख की जांच, टोकन तुंहर हाथ से टोकन। जाने से पहले पुष्टि करें।") },
  { ...official(text("ICAR Telephone Directory 2026 · Durg-I (CGKV)", "आईसीएआर फोन निर्देशिका 2026 · दुर्ग-प्रथम"), "https://www.icar.gov.in/sites/default/files/2026-04/ICAR-Telephone-Directory-2026-1.pdf", "2025-11-30"),
    id: "kvk-anjora", name: text("Krishi Vigyan Kendra, Anjora (Durg-I, CGKV)", "कृषि विज्ञान केंद्र, अंजोरा (दुर्ग-प्रथम)"), districtId: d.durg, category: "support", serviceCategories: ["support", "training"],
    address: text("Anjora, Durg – 491001", "अंजोरा, दुर्ग – 491001"), phone: "0788-2623461",
    services: text("Agricultural advice and training; ask the centre about current soil testing and seed services.", "खेती की सलाह और प्रशिक्षण; मिट्टी जांच और बीज की उपलब्ध सेवाएं केंद्र से पूछें।") },
  { ...supplied("4"), id: "soil-lab-bilaspur", name: text("District Soil Testing Lab – Bilaspur", "जिला मिट्टी जांच प्रयोगशाला – बिलासपुर"), districtId: d.bilaspur, category: "soil-lab",
    services: text("Soil testing · contact and sample-submission details not supplied", "मिट्टी की जांच · संपर्क और नमूना जमा करने की जानकारी उपलब्ध नहीं") },
];
