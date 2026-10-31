import { useEffect, useState } from "react";
import { Button, Copy, Feedback, Field } from "../../components/ui";
import { MarketScreen, MarketPanel, MarketSelect, cropOptions, districtOptions, allOption } from "../../components/market/MarketUI";
import { publishedMandi } from "../../data/market/published";
import { usePortal } from "../../hooks/PortalProvider";
import { readMarketPreference, saveMarketPreference } from "../../services/marketPreferences";
import { createPreference } from "../../utils/marketPreference";

export default function PriceAlerts() {
  const { language } = usePortal();
  const [crop, setCrop] = useState("");
  const [district, setDistrict] = useState("");
  const [mandiId, setMandiId] = useState("custom");
  const [mandiName, setMandiName] = useState("");
  const [target, setTarget] = useState("");
  const [restoring, setRestoring] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void readMarketPreference().then(value => {
      if (!active || !value) return;
      setCrop(value.cropId); setDistrict(value.districtId); setMandiName(value.mandiName); setTarget(String(value.targetPrice));
      setMandiId(publishedMandi.some(r => r.mandiId === value.mandiId && r.districtId === value.districtId) ? value.mandiId! : "custom");
    }).catch(() => { if (active) setError("market.restoreError"); }).finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, []);
  const mandis = Array.from(new Map(publishedMandi.filter(r => r.districtId === district).map(r => [r.mandiId, r])).values());
  const changed = () => { setSaved(false); setError(""); };
  async function save() {
    const selected = mandis.find(r => r.mandiId === mandiId);
    const result = createPreference({ cropId: crop, districtId: district,
      mandiName: selected ? selected.mandiName[language] : mandiName, mandiId: selected?.mandiId, target });
    setSaved(false); setError("");
    if (!result.ok) { setError(result.error); return; }
    setBusy(true);
    try { await saveMarketPreference(result.value); setSaved(true); }
    catch { setError("market.saveError"); }
    finally { setBusy(false); }
  }
  return <MarketScreen title="market.alerts" description="market.alertNote">
    <MarketPanel>
      <MarketSelect label="market.crop" value={crop} options={[allOption("market.selectCrop"), ...cropOptions(language)]} disabled={restoring || busy}
        onChange={value => { changed(); setCrop(value); }} />
      <MarketSelect label="market.district" value={district} options={[allOption("market.selectDistrict"), ...districtOptions(language)]} disabled={restoring || busy}
        onChange={value => { changed(); setDistrict(value); setMandiId("custom"); setMandiName(""); }} />
      <MarketSelect label="market.mandiSelect" value={mandiId} disabled={restoring || busy || !district}
        options={[...mandis.map(r => ({ value: r.mandiId, label: r.mandiName[language] })), { value: "custom", label: "market.customMandi" }]}
        onChange={value => { changed(); setMandiId(value); }} />
      {mandiId === "custom" && <>
        <Copy muted>market.manualMandi</Copy>
        <Field label="market.mandiName" value={mandiName} onChangeText={value => { changed(); setMandiName(value); }} maxLength={80} editable={!restoring && !busy} />
      </>}
      <Field label="market.target" value={target} onChangeText={value => { changed(); setTarget(value); }} keyboardType="decimal-pad" maxLength={20} editable={!restoring && !busy} />
      <Feedback error={error} loading={restoring} />
      <Button label={busy ? "market.saving" : "market.save"} disabled={restoring || busy} onPress={() => void save()} />
      {saved && <Copy>market.saved</Copy>}
    </MarketPanel>
  </MarketScreen>;
}
