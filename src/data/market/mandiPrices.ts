import type { MandiPriceRecord } from "../../types/market";
import { districtIds as d, supplied, text } from "./sources";
// Transcribed observations, not live auction data. Their original source attribution has not been independently confirmed.
export const mandiPriceRecords: MandiPriceRecord[] = [
  { ...supplied("2", "2026-10-24"), id: "pandri-maize-20261024", districtId: d.raipur, mandiId: "raipur-pandri", mandiName: text("Pandri / Tulsi Mandi", "पंडरी / तुलसी मंडी"), cropId: "maize", gradeId: "maize-yellow-local", grade: text("Yellow / Local", "पीला / स्थानीय"), minimum: 2100, maximum: 2100, modal: 2100, unit: "INR/quintal" },
  { ...supplied("2", "2026-10-28"), id: "arang-paddy-20261028", districtId: d.raipur, mandiId: "raipur-arang", mandiName: text("Arang Mandi", "आरंग मंडी"), cropId: "paddy", gradeId: "paddy-common", grade: text("Common / 1001", "सामान्य / 1001"), minimum: 2320, maximum: 2420, modal: 2360, unit: "INR/quintal" },
  { ...supplied("2", "2026-10-26"), id: "durg-gram-20261026", districtId: d.durg, mandiId: "durg-apmc", mandiName: text("Durg APMC", "दुर्ग कृषि उपज मंडी"), cropId: "gram", gradeId: "gram-whole", grade: text("Bengal gram · Whole", "साबुत चना"), minimum: 3000, maximum: 3000, modal: 3000, unit: "INR/quintal" },
  { ...supplied("2", "2026-10-27"), id: "tifra-arhar-20261027", districtId: d.bilaspur, mandiId: "bilaspur-tifra", mandiName: text("Tifra Mandi", "तिफरा मंडी"), cropId: "arhar", gradeId: "arhar-medium", grade: text("Whole · Medium", "साबुत · मध्यम"), minimum: 4100, maximum: 4300, modal: 4100, unit: "INR/quintal" },
  { ...supplied("2", "2026-10-29"), id: "tifra-paddy-20261029", districtId: d.bilaspur, mandiId: "bilaspur-tifra", mandiName: text("Tifra Mandi", "तिफरा मंडी"), cropId: "paddy", gradeId: "paddy-common", grade: text("Common · D.B.", "सामान्य · डी.बी."), minimum: 1900, maximum: 1900, modal: 1900, unit: "INR/quintal" },
];
