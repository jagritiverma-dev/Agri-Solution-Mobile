import { useState } from "react";
import { Copy } from "../../components/ui";
import { MarketScreen, MarketPanel, MarketEmpty, MarketSelect, LabelValue, Evidence, allOption } from "../../components/market/MarketUI";
import { publishedInputs } from "../../data/market/published";
import { usePortal } from "../../hooks/PortalProvider";
import { formatMoney, formatMarketDate } from "../../utils/market";

export default function InputPrices() {
  const { language, t } = usePortal();
  const [type, setType] = useState("");
  const records = publishedInputs.filter(r => !type || r.priceType === type);
  return <MarketScreen title="market.inputs" description="market.inputs.hint">
    <MarketSelect label="market.priceType" value={type} options={[allOption("market.allTypes"), ...["regulated", "mrp", "quotation"].map(value => ({ value, label: `market.${value}` }))]} onChange={setType} />
    <Copy muted>market.inputNote</Copy>
    {!records.length && <MarketEmpty />}
    {records.map(record => <MarketPanel key={record.id}>
      <Copy title>{record.product[language]}</Copy>
      <LabelValue label="market.formulation" value={record.formulation[language]} />
      <LabelValue label="market.package" value={record.packageSize[language]} />
      <LabelValue label="market.priceType" value={t(`market.${record.priceType}`)} />
      <LabelValue label="market.price" value={formatMoney(record.price, language)} strong />
      <LabelValue label="market.effective" value={formatMarketDate(record.effectiveFrom, language)} />
      <Evidence record={record} />
    </MarketPanel>)}
  </MarketScreen>;
}
