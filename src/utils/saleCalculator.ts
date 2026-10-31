export interface SaleInput {
  quantity: string;
  price: string;
  transport: string;
  other: string;
}
export interface SaleResult {
  gross: number;
  deductions: number;
  net: number;
}
export type Calculation = { ok: true; value: SaleResult } | { ok: false; field: keyof SaleInput; error: string };

/** Fixed-point parsing accepts Hindi digits and valid Indian/western thousands groups. */
export function parseFixed(value: string, decimals: number): number | undefined {
  let text = value.trim().replace(/[०-९]/g, digit => String(digit.charCodeAt(0) - 0x0966));
  if (text.startsWith(".")) text = "0" + text;
  const pattern = new RegExp(`^(?:\\d+|\\d{1,3}(?:,\\d{3})+|\\d{1,2}(?:,\\d{2})*,\\d{3})(?:\\.\\d{0,${decimals}})?$`);
  if (!pattern.test(text)) return undefined;
  const [whole, fraction = ""] = text.replaceAll(",", "").split(".");
  const scaled = Number(whole + fraction.padEnd(decimals, "0"));
  return Number.isSafeInteger(scaled) ? scaled : undefined;
}
export function calculateSale(input: SaleInput): Calculation {
  const quantity = parseFixed(input.quantity, 3);
  if (quantity === undefined || quantity <= 0) return { ok: false, field: "quantity", error: "market.error.quantity" };
  const price = parseFixed(input.price, 2);
  if (price === undefined || price <= 0) return { ok: false, field: "price", error: "market.error.price" };
  const transport = parseFixed(input.transport.trim() || "0", 2);
  if (transport === undefined) return { ok: false, field: "transport", error: "market.error.cost" };
  const other = parseFixed(input.other.trim() || "0", 2);
  if (other === undefined) return { ok: false, field: "other", error: "market.error.cost" };
  const product = quantity * price;
  if (!Number.isSafeInteger(product) || !Number.isSafeInteger(transport + other))
    return { ok: false, field: "quantity", error: "market.error.large" };
  const gross = Math.round(product / 1000);
  const deductions = transport + other;
  return { ok: true, value: { gross: gross / 100, deductions: deductions / 100, net: (gross - deductions) / 100 } };
}
