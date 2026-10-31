import { marketCrops, marketDistricts } from "../data/market/catalogue";
import type { PriceAlertPreference } from "../types/market";
import { parseFixed } from "./saleCalculator";

export function validPreference(value: unknown): value is PriceAlertPreference {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<PriceAlertPreference>;
  return p.version === 1 && marketCrops.some(c => c.id === p.cropId) && marketDistricts.some(d => d.id === p.districtId)
    && typeof p.mandiName === "string" && p.mandiName.trim().length > 0 && p.mandiName.length <= 80
    && (p.mandiId === undefined || (typeof p.mandiId === "string" && p.mandiId.length <= 100))
    && typeof p.targetPrice === "number" && Number.isFinite(p.targetPrice) && p.targetPrice > 0 && p.targetPrice <= 1_000_000_000
    && Math.abs(p.targetPrice * 100 - Math.round(p.targetPrice * 100)) < 0.00001
    && typeof p.savedAt === "string" && Number.isFinite(Date.parse(p.savedAt));
}
export function createPreference(input: { cropId: string; districtId: string; mandiName: string; mandiId?: string; target: string }):
  { ok: true; value: PriceAlertPreference } | { ok: false; error: string } {
  if (!marketCrops.some(c => c.id === input.cropId) || !marketDistricts.some(d => d.id === input.districtId)
    || !input.mandiName.trim() || input.mandiName.trim().length > 80) return { ok: false, error: "market.alertRequired" };
  const target = parseFixed(input.target, 2);
  if (target === undefined || target <= 0 || target / 100 > 1_000_000_000) return { ok: false, error: "market.error.price" };
  const value: PriceAlertPreference = { version: 1, cropId: input.cropId, districtId: input.districtId,
    mandiName: input.mandiName.trim(), ...(input.mandiId ? { mandiId: input.mandiId } : {}), targetPrice: target / 100, savedAt: new Date().toISOString() };
  return { ok: true, value };
}
