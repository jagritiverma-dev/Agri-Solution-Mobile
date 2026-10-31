import { useState } from "react";
import { Button, Copy, Feedback, Field } from "../../components/ui";
import { MarketScreen, MarketPanel, MarketEmpty, MarketSelect, allOption, Evidence, LabelValue } from "../../components/market/MarketUI";
import { activeCropOptions } from "../../data/market/options";
import { comparisonSelection, comparisonRates } from "../../utils/marketComparison";
import { SaleAmounts, SaleFields } from "../../components/market/SaleForm";
import { publishedMandi, publishedMsp } from "../../data/market/published";
import { usePortal } from "../../hooks/PortalProvider";
import { formatMarketDate, formatMoney, matchingGrade } from "../../utils/market";
import { calculateSale, type SaleInput } from "../../utils/saleCalculator";

const blankCosts: SaleInput = { quantity: "", price: "", transport: "", other: "" };
export default function PriceComparison() {
  const { language, t } = usePortal();
  const [crop, setCrop] = useState("");
  const [mspId, setMspId] = useState("");
  const [mandiId, setMandiId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [mspCosts, setMspCosts] = useState(blankCosts);
  const [mandiCosts, setMandiCosts] = useState(blankCosts);
  const [submitted, setSubmitted] = useState(false);
  const msp = publishedMsp.find(r => r.id === mspId && r.cropId === crop);
  const matching = msp ? publishedMandi.filter(r => matchingGrade(msp, r)) : [];
  const mandi = matching.find(r => r.id === mandiId);
  const rates = msp && mandi ? comparisonRates(msp, mandi) : undefined;
  function selectCrop(value: string) {
    const selection = comparisonSelection(value, publishedMsp, publishedMandi);
    setCrop(value); setMspId(selection.mspId); setMandiId(selection.mandiId); setSubmitted(false);
  }
  function selectMsp(value: string) {
    const selection = comparisonSelection(crop, publishedMsp, publishedMandi, value);
    setMspId(selection.mspId); setMandiId(selection.mandiId); setSubmitted(false);
  }
  const mspResult = calculateSale({ ...mspCosts, quantity, price: String(msp?.pricePerQuintal ?? "") });
  const mandiResult = calculateSale({ ...mandiCosts, quantity, price: String(mandi?.modal ?? "") });
  return <MarketScreen title="market.comparison" description="market.comparison.hint">
    <MarketPanel>
      <MarketSelect label="market.crop" value={crop} options={[allOption("market.selectCrop"), ...activeCropOptions(language, "msp")]}
        onChange={selectCrop} />
      <MarketSelect label="market.compareMsp" value={mspId} options={publishedMsp.filter(r => r.cropId === crop).map(r => ({ value: r.id,
        label: `${r.grade[language]} · ${r.season[language]} · ${formatMarketDate(r.effectiveFrom, language)}` }))}
        onChange={selectMsp} />
      <MarketSelect label="market.compareMandi" value={mandiId} options={matching.map(r => ({ value: r.id,
        label: `${r.mandiName[language]} · ${r.grade[language]} · ${formatMarketDate(r.reportedOn, language)}` }))}
        onChange={value => { setMandiId(value); setSubmitted(false); }} />
    </MarketPanel>
    <Copy muted>market.compareNote</Copy>
    {!matching.length && <MarketEmpty message="market.compareUnavailable" />}
    {msp && mandi && <>
      <Field label="market.quantity" keyboardType="decimal-pad" value={quantity} maxLength={20} onChangeText={value => { setQuantity(value); setSubmitted(false); }} />
      <MarketPanel>
        <Copy>market.mspCosts</Copy>
        <LabelValue label="market.mspPrice" value={formatMoney(msp.pricePerQuintal, language)} />
        {rates && <LabelValue label="market.rateDifference" value={formatMoney(rates.mspDifference, language)} />}
        {rates?.stateRate !== undefined && rates.stateDifference !== undefined && msp.stateSupport && <>
          <LabelValue label="market.stateRate" value={formatMoney(rates.stateRate, language)} />
          <LabelValue label="market.stateDifference" value={formatMoney(rates.stateDifference, language)} />
          <Copy muted>{msp.stateSupport.basis[language]}</Copy>
          <Evidence record={msp.stateSupport} />
        </>}
        <LabelValue label="market.grade" value={msp.grade[language]} />
        <LabelValue label="market.season" value={msp.season[language]} />
        <LabelValue label="market.effective" value={formatMarketDate(msp.effectiveFrom, language)} />
        <SaleFields value={mspCosts} onChange={value => { setMspCosts(value); setSubmitted(false); }} includePrice={false} includeQuantity={false} />
        <Evidence record={msp} />
      </MarketPanel>
      <MarketPanel>
        <Copy>market.mandiCosts</Copy><Copy>{mandi.mandiName[language]}</Copy>
        <LabelValue label="market.modal" value={formatMoney(mandi.modal, language)} />
        <LabelValue label="market.grade" value={mandi.grade[language]} />
        <SaleFields value={mandiCosts} onChange={value => { setMandiCosts(value); setSubmitted(false); }} includePrice={false} includeQuantity={false} />
        <Evidence record={mandi} />
      </MarketPanel>
      <Copy muted>market.costNote</Copy>
      {submitted && !mspResult.ok && <Feedback error={`${t("market.mspCosts")}: ${t(mspResult.error)}`} />}
      {submitted && mspResult.ok && !mandiResult.ok && <Feedback error={`${t("market.mandiCosts")}: ${t(mandiResult.error)}`} />}
      <Button label="market.compare" onPress={() => setSubmitted(true)} />
      {submitted && mspResult.ok && mandiResult.ok && <>
        <LabelValue label="market.netDifference" value={formatMoney(Math.round((mspResult.value.net - mandiResult.value.net) * 100) / 100, language)} />
        <Copy>market.msp</Copy><SaleAmounts result={mspResult.value} />
        <Copy>market.mandi</Copy><SaleAmounts result={mandiResult.value} />
      </>}
    </>}
  </MarketScreen>;
}
