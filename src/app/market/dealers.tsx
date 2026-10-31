import { useState } from "react";
import { Copy } from "../../components/ui";
import { MarketScreen, MarketPanel, MarketEmpty, MarketSelect, MarketCategories, LabelValue, Evidence, Contacts, districtName, allOption } from "../../components/market/MarketUI";
import { activeDistrictOptions } from "../../data/market/options";
import { publishedDealers } from "../../data/market/published";
import { usePortal } from "../../hooks/PortalProvider";
import type { DealerCategory } from "../../types/market";
import { formatMarketDate, validDate } from "../../utils/market";

const categories: DealerCategory[] = ["seeds", "fertilizers", "pesticides", "machinery"];
export default function AgriculturalDealers() {
  const { language, t } = usePortal();
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const records = publishedDealers.filter(r => (!district || r.districtId === district) && (!category || r.categories.some(c => c === category)));
  return <MarketScreen title="market.dealers" description="market.dealers.hint">
    <MarketPanel>
      <MarketSelect label="market.district" value={district} options={[allOption("market.allDistricts"), ...activeDistrictOptions(language, "dealers")]} onChange={setDistrict} />
      <Copy muted>market.filterHint</Copy>
    </MarketPanel>
    <Copy>market.category</Copy>
    <MarketCategories value={category} options={[allOption("market.allTypes"), ...categories.map(value => ({ value, label: `market.${value}` }))]} onChange={setCategory} />
    {!records.length && <MarketEmpty />}
    {records.map(record => <MarketPanel key={record.id}>
      <Copy title>{record.name[language]}</Copy>
      <Copy muted>{record.categories.map(c => t(`market.${c}`)).join(" · ")}</Copy>
      <LabelValue label="market.district" value={districtName(record.districtId, language)} />
      {!!record.products.length && <LabelValue label="market.products" value={record.products.map(p => p[language]).join(" · ")} />}
      <LabelValue label="market.licence" value={record.licence?.number ?? t("market.notProvided")} />
      {record.licence?.authority && <LabelValue label="market.licenceAuthority" value={record.licence.authority[language]} />}
      {validDate(record.licence?.validUntil) && <LabelValue label="market.licenceUntil" value={formatMarketDate(record.licence!.validUntil!, language)} />}
      <LabelValue label="market.hours" value={record.openingHours?.[language] ?? t("market.notProvided")} />
      <Contacts contact={record} districtId={record.districtId} />
      <Evidence record={record} />
    </MarketPanel>)}
  </MarketScreen>;
}
