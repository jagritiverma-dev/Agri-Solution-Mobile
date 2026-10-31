import type { MarketText, RecordEvidence } from "../../types/market";
export const text = (en: string, hi: string): MarketText => ({ en, hi });
export const districtIds = { raipur: "path7133", durg: "path3282", bilaspur: "path3192" } as const;
export function official(name: MarketText, url: string, reportedOn: string): RecordEvidence {
  return { source: { name, kind: "official", url }, reportedOn, verification: { status: "verified", checkedOn: "2026-11-01" } };
}
export function supplied(section: string, reportedOn = "2026-11-01"): RecordEvidence {
  return {
    source: { kind: "supplied", name: text("App owner’s supplied data — not independently verified", "ऐप संचालक की दी हुई जानकारी — स्वतंत्र पुष्टि नहीं"),
      documentReference: "MK-2026-11-01 / " + section },
    reportedOn, verification: { status: "supplied" },
  };
}
