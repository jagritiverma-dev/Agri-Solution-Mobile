import { mspRecords } from "./msp";
import { mandiPriceRecords } from "./mandiPrices";
import { dealerRecords } from "./dealers";
import { inputPriceRecords } from "./inputPrices";
import { centreRecords } from "./centres";
import { marketCrops, marketDistricts } from "./catalogue";
import { hasEvidence, hasText, priceIsValid, publishable, validDate } from "../../utils/market";
import type { CropGrade, MspRecord, MandiPriceRecord, DealerRecord, InputPriceRecord, CentreRecord } from "../../types/market";

const districtExists = (id: string) => marketDistricts.some(d => d.id === id);
const validCrop = (record: CropGrade) => marketCrops.some(c => c.id === record.cropId) && !!record.gradeId?.trim() && hasText(record.grade);
export const selectMspRecords = (records: MspRecord[]) => publishable(records, r => hasEvidence(r, true) && validCrop(r)
  && r.unit === "INR/quintal" && !!r.seasonId?.trim() && hasText(r.season) && priceIsValid(r.pricePerQuintal)
  && validDate(r.effectiveFrom) && (!r.effectiveTo || (validDate(r.effectiveTo) && r.effectiveTo >= r.effectiveFrom)));
export const selectMandiRecords = (records: MandiPriceRecord[]) => publishable(records, r => hasEvidence(r, true) && validCrop(r)
  && districtExists(r.districtId) && !!r.mandiId?.trim() && hasText(r.mandiName) && r.unit === "INR/quintal"
  && [r.minimum, r.maximum, r.modal].every(priceIsValid) && r.minimum <= r.modal && r.modal <= r.maximum);
export const selectDealerRecords = (records: DealerRecord[]) => publishable(records, r => hasText(r.name) && districtExists(r.districtId)
  && r.categories.length > 0 && r.categories.every(c => ["seeds", "fertilizers", "pesticides", "machinery"].includes(c))
  && r.products.every(hasText));
export const selectInputRecords = (records: InputPriceRecord[]) => publishable(records, r => hasText(r.product) && hasText(r.formulation)
  && hasText(r.packageSize) && priceIsValid(r.price) && validDate(r.effectiveFrom)
  && ["regulated", "mrp", "quotation"].includes(r.priceType)
  && (r.priceType !== "regulated" || hasEvidence(r, true))
  && (r.priceType !== "mrp" || r.source.kind === "manufacturer" || r.source.kind === "official"));
export const selectCentreRecords = (records: CentreRecord[]) => publishable(records, r => hasEvidence(r, true) && hasText(r.name)
  && districtExists(r.districtId) && ["procurement", "support", "soil-lab", "training"].includes(r.category));

export const publishedMsp = selectMspRecords(mspRecords);
export const publishedMandi = selectMandiRecords(mandiPriceRecords);
export const publishedDealers = selectDealerRecords(dealerRecords);
export const publishedInputs = selectInputRecords(inputPriceRecords);
export const publishedCentres = selectCentreRecords(centreRecords);
