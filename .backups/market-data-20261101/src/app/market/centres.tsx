import { useState } from "react";
import { Copy } from "../../components/ui";
import { MarketScreen, MarketPanel, MarketEmpty, MarketSelect, LabelValue, Evidence, Contacts, districtOptions, districtName, allOption } from "../../components/market/MarketUI";
import { publishedCentres } from "../../data/market/published";
import { usePortal } from "../../hooks/PortalProvider";
import { hasEvidence } from "../../utils/market";

export default function GovernmentCentres() {
  const { language, t } = usePortal();
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const records = publishedCentres.filter(r => (!district || r.districtId === district) && (!category || r.category === category));
  return <MarketScreen title="market.centres" description="market.centres.hint">
    <MarketPanel>
      <MarketSelect label="market.district" value={district} options={[allOption("market.allDistricts"), ...districtOptions(language)]} onChange={setDistrict} />
      <MarketSelect label="market.category" value={category} options={[allOption("market.allTypes"), ...["procurement", "support", "soil-lab", "training"].map(value => ({ value, label: `market.${value}` }))]} onChange={setCategory} />
    </MarketPanel>
    {!records.length && <MarketEmpty />}
    {records.map(record => <MarketPanel key={record.id}>
      <Copy title>{record.name[language]}</Copy>
      <Copy muted>{t(`market.${record.category}`)}</Copy>
      <LabelValue label="market.district" value={districtName(record.districtId, language)} />
      {record.openingHours && <LabelValue label="market.hours" value={record.openingHours[language]} />}
      <Contacts contact={record} districtId={record.districtId} />
      {record.operation && hasEvidence(record.operation, true) && <>
        <LabelValue label="market.operation" value={t(`market.${record.operation.status}`)} />
        <Evidence record={record.operation} />
      </>}
      <Evidence record={record} />
    </MarketPanel>)}
  </MarketScreen>;
}
