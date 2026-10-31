import { useState } from "react";
import { Button, Copy, Feedback } from "../../components/ui";
import { MarketScreen, MarketPanel } from "../../components/market/MarketUI";
import { SaleAmounts, SaleFields } from "../../components/market/SaleForm";
import { calculateSale, type SaleInput } from "../../utils/saleCalculator";

export default function SaleCalculator() {
  const [input, setInput] = useState<SaleInput>({ quantity: "", price: "", transport: "", other: "" });
  const [submitted, setSubmitted] = useState(false);
  const result = calculateSale(input);
  return <MarketScreen title="market.calculator" description="market.calculator.hint">
    <MarketPanel>
      <SaleFields value={input} onChange={value => { setInput(value); setSubmitted(false); }} />
      <Copy muted>market.costNote</Copy>
      {submitted && !result.ok && <Feedback error={result.error} />}
      <Button label="market.calculate" onPress={() => setSubmitted(true)} />
    </MarketPanel>
    {submitted && result.ok && <SaleAmounts result={result.value} />}
  </MarketScreen>;
}
