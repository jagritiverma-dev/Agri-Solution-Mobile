import { useState } from "react";
import { Copy } from "../../components/ui";
import { MarketScreen, MarketPanel, MarketEmpty, MarketSelect, LabelValue, Evidence, cropName, allOption } from "../../components/market/MarketUI";
import { activeCropOptions } from "../../data/market/options";
import { publishedMsp } from "../../data/market/published";
import { usePortal } from "../../hooks/PortalProvider";
import { formatMoney, formatMarketDate, hasDisplayEvidence, hasText, priceIsValid, validDate } from "../../utils/market";

export default function GovernmentMsp() {
  const { language } = usePortal();
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState("");
  const cropRecords = publishedMsp.filter(r => !crop || r.cropId === crop);
  const seasons = Array.from(new Map(publishedMsp.map(r => [r.seasonId, { value: r.seasonId, label: r.season[language] }])).values());
  const records = cropRecords.filter(r => !season || r.seasonId === season).sort((a, b) => (b.effectiveFrom ?? b.reportedOn).localeCompare(a.effectiveFrom ?? a.reportedOn));
  return <MarketScreen title="market.msp" description="market.msp.hint">
    <MarketPanel>
      <MarketSelect label="market.crop" value={crop} options={[allOption("market.allCrops"), ...activeCropOptions(language, "msp")]} onChange={value => { setCrop(value); setSeason(""); }} />
      <MarketSelect label="market.season" value={season} options={[allOption("market.allSeasons"), ...seasons]} onChange={setSeason} />
    </MarketPanel>
    <Copy muted>market.mspNote</Copy>
    {!records.length && <MarketEmpty />}
    {records.map(record => {
      const support = record.stateSupport;
      const showSupport = support && hasDisplayEvidence(support, true) && hasText(support.name) && hasText(support.basis)
        && priceIsValid(support.amount) && (!support.effectiveFrom || validDate(support.effectiveFrom));
      return <MarketPanel key={record.id}>
        <Copy title>{cropName(record.cropId, language)}</Copy>
        <LabelValue label="market.grade" value={record.grade[language]} />
        <LabelValue label="market.season" value={record.season[language]} />
        <LabelValue label="market.mspPrice" value={formatMoney(record.pricePerQuintal, language)} strong />
        <LabelValue label="market.effective" value={formatMarketDate(record.effectiveFrom, language)} />
        {record.effectiveTo && <LabelValue label="market.validUntil" value={formatMarketDate(record.effectiveTo, language)} />}
        <Evidence record={record} />
        {showSupport ? <MarketPanel>
          <Copy>market.stateSupport</Copy><Copy>{support.name[language]}</Copy>
          <Copy>{`${formatMoney(support.amount, language)} · ${support.basis[language]}`}</Copy>
          <LabelValue label="market.effective" value={formatMarketDate(support.effectiveFrom, language)} />
          <Evidence record={support} />
        </MarketPanel> : record.cropId === "paddy" ? <Copy muted>market.noStateSupport</Copy> : null}
      </MarketPanel>;
    })}
  </MarketScreen>;
}
