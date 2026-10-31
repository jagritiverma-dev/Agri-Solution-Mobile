import type { Language } from "../config/localization";
import type { ContactDetails, CropGrade, MarketRecord, MarketSource, MarketText, RecordEvidence } from "../types/market";

export function hasText(value: MarketText | undefined): boolean {
  return !!value && typeof value.en === "string" && !!value.en.trim() && typeof value.hi === "string" && !!value.hi.trim();
}
export function validDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function safeWebUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.href;
  } catch { return undefined; }
}
export function hasSource(source: MarketSource): boolean {
  return !!source && hasText(source.name) && ["official", "manufacturer", "dealer", "supplied"].includes(source.kind)
    && !!(safeWebUrl(source.url) || source.documentReference?.trim());
}
export function hasEvidence(record: RecordEvidence, official = false): boolean {
  return !!record && record.verification?.status === "verified" && validDate(record.verification.checkedOn)
    && validDate(record.reportedOn) && hasSource(record.source)
    && record.source.kind !== "supplied"
    && (!official || record.source.kind === "official");
}
/** Owner-supplied data is displayable only with explicit, visible provenance, never as verified. */
export function hasSuppliedEvidence(record: RecordEvidence): boolean {
  return record?.verification?.status === "supplied" && record.source?.kind === "supplied"
    && validDate(record.reportedOn) && hasSource(record.source)
    && record.source.name.en.includes("not independently verified")
    && record.source.name.hi.includes("स्वतंत्र पुष्टि नहीं");
}
export const hasDisplayEvidence = (record: RecordEvidence, official = false) => hasEvidence(record, official) || hasSuppliedEvidence(record);
export function priceIsValid(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1_000_000_000
    && Math.abs(value * 100 - Math.round(value * 100)) < 0.00001;
}
/** Duplicate record IDs are withheld rather than silently selecting one conflicting row. */
export function publishable<T extends MarketRecord>(records: T[], validate: (record: T) => boolean): T[] {
  const counts = new Map<string, number>();
  records.forEach(record => counts.set(record.id, (counts.get(record.id) ?? 0) + 1));
  return records.filter(record => !!record.id?.trim() && counts.get(record.id) === 1 && hasDisplayEvidence(record) && validate(record));
}
export function matchingGrade(a: CropGrade & { unit: string }, b: CropGrade & { unit: string }): boolean {
  return !!a.cropId && !!a.gradeId && a.cropId === b.cropId && a.gradeId === b.gradeId
    && a.unit === "INR/quintal" && b.unit === a.unit;
}
export const formatMoney = (value: number, language: Language) =>
  new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN", {
    style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
export const formatMarketDate = (value: string | undefined, language: Language) =>
  !validDate(value) ? (language === "hi" ? "तारीख उपलब्ध नहीं" : "Date not provided") : new Date(value + "T00:00:00Z").toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
export function phoneUrl(phone?: string): string | undefined {
  if (!phone || !/^\+?[\d\s()-]+$/.test(phone)) return undefined;
  const cleaned = phone.replace(/[\s()-]/g, "");
  return /^\+?\d{10,15}$/.test(cleaned) ? `tel:${cleaned}` : undefined;
}
export function directionsUrl(contact: ContactDetails, district: string, language: Language): string | undefined {
  const c = contact.coordinates;
  if (c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude)
    && Math.abs(c.latitude) <= 90 && Math.abs(c.longitude) <= 180) {
    return `https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`;
  }
  if (hasText(contact.address)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address![language] + ", " + district)}`;
  }
  return undefined;
}
