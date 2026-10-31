import type { MspRecord, MandiPriceRecord } from "../types/market";
import { hasDisplayEvidence, matchingGrade, priceIsValid } from "./market";

export function comparisonSelection(cropId: string, msps: MspRecord[], mandis: MandiPriceRecord[], selectedMspId?: string) {
  const options = msps.filter(r => r.cropId === cropId);
  const msp = selectedMspId ? options.find(r => r.id === selectedMspId)
    : options.find(r => mandis.some(m => matchingGrade(r, m))) ?? options[0];
  const matching = msp ? mandis.filter(r => matchingGrade(msp, r)).sort((a, b) => b.reportedOn.localeCompare(a.reportedOn)) : [];
  return { mspId: msp?.id ?? "", mandiId: matching[0]?.id ?? "", matching };
}

export function comparisonRates(msp: MspRecord, mandi: MandiPriceRecord) {
  if (!matchingGrade(msp, mandi) || !priceIsValid(msp.pricePerQuintal) || !priceIsValid(mandi.modal)) return undefined;
  const support = msp.stateSupport;
  const total = support?.totalRatePerQuintal;
  const stateRate = support && hasDisplayEvidence(support, true) && total !== undefined && priceIsValid(total)
    && priceIsValid(support.amount) && Math.round((total - msp.pricePerQuintal) * 100) === Math.round(support.amount * 100) ? total : undefined;
  return {
    mspDifference: Math.round((msp.pricePerQuintal - mandi.modal) * 100) / 100,
    stateRate,
    stateDifference: stateRate === undefined ? undefined : Math.round((stateRate - mandi.modal) * 100) / 100,
  };
}
