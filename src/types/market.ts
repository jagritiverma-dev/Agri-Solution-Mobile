import type { Language } from "../config/localization";

export type MarketText = Record<Language, string>;
export type PriceUnit = "INR/quintal";
/** Dates use YYYY-MM-DD. A verification flag must be backed by the cited record. */
export interface MarketSource {
  name: MarketText;
  kind: "official" | "manufacturer" | "dealer" | "supplied";
  url?: string;
  documentReference?: string;
}
export interface Verification {
  status: "unverified" | "verified" | "rejected" | "supplied";
  checkedOn?: string;
}
export interface RecordEvidence {
  source: MarketSource;
  reportedOn: string;
  verification: Verification;
}
export interface MarketRecord extends RecordEvidence { id: string }
export interface CropGrade {
  cropId: string;
  gradeId: string;
  grade: MarketText;
}
export interface StateSupport extends RecordEvidence {
  name: MarketText;
  amount: number;
  basis: MarketText;
  effectiveFrom?: string;
  /** Total procurement rate, inclusive of MSP; never an additional bonus. */
  totalRatePerQuintal?: number;
}
export interface MspRecord extends MarketRecord, CropGrade {
  season: MarketText;
  seasonId: string;
  pricePerQuintal: number;
  unit: PriceUnit;
  effectiveFrom?: string;
  effectiveTo?: string;
  stateSupport?: StateSupport;
}
export interface MandiPriceRecord extends MarketRecord, CropGrade {
  districtId: string;
  mandiId: string;
  mandiName: MarketText;
  minimum: number;
  maximum: number;
  modal: number;
  unit: PriceUnit;
}
export type DealerCategory = "seeds" | "fertilizers" | "pesticides" | "machinery";
export interface ContactDetails {
  address?: MarketText;
  phone?: string;
  coordinates?: { latitude: number; longitude: number };
}
export interface DealerRecord extends MarketRecord, ContactDetails {
  name: MarketText;
  districtId: string;
  categories: DealerCategory[];
  products: MarketText[];
  licence?: { number: string; authority?: MarketText; validUntil?: string };
  openingHours?: MarketText;
}
export type InputPriceType = "regulated" | "mrp" | "quotation";
export interface InputPriceRecord extends MarketRecord {
  product: MarketText;
  formulation: MarketText;
  packageSize: MarketText;
  price: number;
  priceType: InputPriceType;
  effectiveFrom?: string;
  priceCategory?: "statutory" | "nbs" | "state-notified";
  priceNote?: MarketText;
}
export type CentreCategory = "procurement" | "support" | "soil-lab" | "training";
export interface CentreRecord extends MarketRecord, ContactDetails {
  name: MarketText;
  districtId: string;
  category: CentreCategory;
  openingHours?: MarketText;
  services?: MarketText;
  serviceCategories?: CentreCategory[];
  operatingSeason?: MarketText;
  registrationRequirements?: MarketText;
  operation?: RecordEvidence & { status: "open" | "closed" | "seasonal" };
}
export interface PriceAlertPreference {
  version: 1;
  cropId: string;
  districtId: string;
  mandiName: string;
  /** Present only when selected from the local published directory. */
  mandiId?: string;
  targetPrice: number;
  savedAt: string;
}
