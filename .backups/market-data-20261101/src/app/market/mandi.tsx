import { useState } from "react";
import { Copy } from "../../components/ui";
import { MarketScreen, MarketPanel, MarketEmpty, MarketSelect, LabelValue, Evidence, cropOptions, districtOptions, cropName, districtName, allOption } from "../../components/market/MarketUI";
import { publishedMandi } from "../../data/market/published";
import { usePortal } from "../../hooks/PortalProvider";
import { formatMoney } from "../../utils/market";

export default function MandiPrices() {
  const { language } = usePortal();
  const [district, setDistrict] = useState("");
  const [mandi, setMandi] = useState("");
  const [crop, setCrop] = useState("");
  const inDistrict = publishedMandi.filter(r => !district || r.districtId === district);
  const mandis = Array.from(new Map(inDistrict.map(r => [r.mandiId, { value: r.mandiId, label: r.mandiName[language] }])).values());
  const records = inDistrict.filter(r => (!mandi || r.mandiId === mandi) && (!crop || r.cropId === crop)).sort((a, b) => b.reportedOn.localeCompare(a.reportedOn));
  return <MarketScreen title="market.mandi" description="market.mandi.hint">
    <MarketPanel>
      <MarketSelect label="market.district" value={district} options={[allOption("market.allDistricts"), ...districtOptions(language)]} onChange={value => { setDistrict(value); setMandi(""); }} />
      <MarketSelect label="market.mandiSelect" value={mandi} options={[allOption("market.allMandis"), ...mandis]} onChange={setMandi} />
      <MarketSelect label="market.crop" value={crop} options={[allOption("market.allCrops"), ...cropOptions(language)]} onChange={setCrop} />
    </MarketPanel>
    <Copy muted>market.mandiNote</Copy>
    {!records.length && <MarketEmpty />}
    {records.map(record => <MarketPanel key={record.id}>
      <Copy title>{record.mandiName[language]}</Copy>
      <LabelValue label="market.district" value={districtName(record.districtId, language)} />
      <LabelValue label="market.crop" value={cropName(record.cropId, language)} />
      <LabelValue label="market.grade" value={record.grade[language]} />
      <LabelValue label="market.modal" value={formatMoney(record.modal, language)} strong />
      <LabelValue label="market.minimum" value={formatMoney(record.minimum, language)} />
      <LabelValue label="market.maximum" value={formatMoney(record.maximum, language)} />
      <Evidence record={record} />
    </MarketPanel>)}
  </MarketScreen>;
}
