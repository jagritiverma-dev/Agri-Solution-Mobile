import { useState } from "react";
import { Copy } from "../../components/ui";
import { MarketScreen, MarketPanel, MarketEmpty, MarketSelect, LabelValue, Evidence, cropOptions, cropName, allOption } from "../../components/market/MarketUI";
import { publishedMsp } from "../../data/market/published";
import { usePortal } from "../../hooks/PortalProvider";
import { formatMoney, formatMarketDate, hasEvidence, hasText, priceIsValid, validDate } from "../../utils/market";

export default function GovernmentMsp() {
  const { language } = usePortal();
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState("");
  const cropRecords = publishedMsp.filter(r => !crop || r.cropId === crop);
  const seasons = Array.from(new Map(cropRecords.map(r => [r.seasonId, { value: r.seasonId, label: r.season[language] }])).values());
  const records = cropRecords.filter(r => !season || r.seasonId === season).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return <MarketScreen title="market.msp" description="market.msp.hint">
    <MarketPanel>
      <MarketSelect label="market.crop" value={crop} options={[allOption("market.allCrops"), ...cropOptions(language)]} onChange={value => { setCrop(value); setSeason(""); }} />
      <MarketSelect label="market.season" value={season} options={[allOption("market.allSeasons"), ...seasons]} onChange={setSeason} />
    </MarketPanel>
    <Copy muted>market.mspNote</Copy>
    {!records.length && <MarketEmpty />}
    {records.map(record => {
      const support = record.stateSupport;
      const showSupport = support && hasEvidence(support, true) && hasText(support.name) && hasText(support.basis)
        && priceIsValid(support.amount) && validDate(support.effectiveFrom);
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
        </MarketPanel> : <Copy muted>market.noStateSupport</Copy>}
      </MarketPanel>;
    })}
  </MarketScreen>;
}
