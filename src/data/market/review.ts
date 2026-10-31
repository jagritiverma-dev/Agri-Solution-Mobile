import type { MspRecord, MandiPriceRecord, DealerRecord, InputPriceRecord, CentreRecord } from "../../types/market";

/** Working notes only. This module is deliberately not imported by any screen. */
export interface ReviewEntry<T> {
  documentTitle: string;
  pageOrSection: string;
  notes: string;
  candidate: Partial<T>;
}
export const reviewData = {
  msp: [] as ReviewEntry<MspRecord>[],
  mandiPrices: [] as ReviewEntry<MandiPriceRecord>[],
  dealers: [] as ReviewEntry<DealerRecord>[],
  inputPrices: [] as ReviewEntry<InputPriceRecord>[],
  centres: [] as ReviewEntry<CentreRecord>[],
};
