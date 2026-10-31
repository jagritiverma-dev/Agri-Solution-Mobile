import { useState, type PropsWithChildren } from "react";
import { FlatList, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Copy, Feedback, Field, Screen, styles as shared } from "../ui";
import { colors } from "../../config/theme";
import { usePortal } from "../../hooks/PortalProvider";
import { formatMarketDate, safeWebUrl, phoneUrl, directionsUrl } from "../../utils/market";
import { marketCrops, marketDistricts } from "../../data/market/catalogue";
import type { ContactDetails, RecordEvidence } from "../../types/market";
import type { Language } from "../../config/localization";

export interface MarketOption { value: string; label: string }
export const cropOptions = (language: Language): MarketOption[] => marketCrops.map(c => ({ value: c.id, label: c.name[language] }));
export const districtOptions = (language: Language): MarketOption[] => marketDistricts.map(d => ({ value: d.id, label: d.name[language] }));
export const cropName = (id: string, language: Language) => marketCrops.find(c => c.id === id)?.name[language] ?? id;
export const districtName = (id: string, language: Language) => marketDistricts.find(d => d.id === id)?.name[language] ?? id;
export const allOption = (label: string): MarketOption => ({ value: "", label });

export function MarketScreen({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  const { t } = usePortal();
  return <Screen>
    <View style={marketStyles.headingBlock}>
      <Text accessibilityRole="header" style={marketStyles.title}>{t(title)}</Text>
      {description && <Copy muted>{description}</Copy>}
    </View>
    {children}
  </Screen>;
}
export function MarketPanel({ children }: PropsWithChildren) {
  return <View style={[shared.card, marketStyles.panel]}>{children}</View>;
}
export function MarketEmpty({ message = "market.emptyHint" }: { message?: string }) {
  return <MarketPanel>
    <Ionicons name="information-circle-outline" size={26} color={colors.muted} />
    <Copy>market.empty</Copy><Copy muted>{message}</Copy>
  </MarketPanel>;
}
export function LabelValue({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  const { t } = usePortal();
  return <View style={marketStyles.valueRow}>
    <Text style={marketStyles.label}>{t(label)}</Text>
    <Text style={[marketStyles.value, strong && marketStyles.strong]}>{value}</Text>
  </View>;
}
export function MarketAction({ url, label }: { url: string; label: string }) {
  const [error, setError] = useState("");
  return <View style={marketStyles.headingBlock}>
    <Button label={label} secondary onPress={() => {
      setError("");
      void Linking.openURL(url).catch(() => setError("market.linkError"));
    }} />
    {!!error && <Feedback error={error} />}
  </View>;
}
export function Evidence({ record }: { record: RecordEvidence }) {
  const { language } = usePortal();
  const url = safeWebUrl(record.source.url);
  return <View style={marketStyles.evidence}>
    <LabelValue label="market.reported" value={formatMarketDate(record.reportedOn, language)} />
    <LabelValue label="market.source" value={record.source.name[language]} />
    {!!record.source.documentReference && <Copy muted>{record.source.documentReference}</Copy>}
    {url && <MarketAction label="market.openSource" url={url} />}
  </View>;
}
export function Contacts({ contact, districtId }: { contact: ContactDetails; districtId: string }) {
  const { language } = usePortal();
  const phone = phoneUrl(contact.phone);
  const direction = directionsUrl(contact, districtName(districtId, language), language);
  return <>
    {contact.address && <LabelValue label="market.address" value={contact.address[language]} />}
    {phone && <LabelValue label="market.phone" value={contact.phone!} />}
    {phone && <MarketAction label="market.call" url={phone} />}
    {direction && <MarketAction label="market.directions" url={direction} />}
  </>;
}

export function MarketSelect({ label, value, options, onChange, disabled = false }: {
  label: string; value: string; options: MarketOption[]; onChange: (value: string) => void; disabled?: boolean;
}) {
  const { t } = usePortal();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find(option => option.value === value);
  const filtered = options.filter(option => t(option.label).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <View style={marketStyles.headingBlock}>
    <Text style={marketStyles.label}>{t(label)}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${t(label)}: ${selected ? t(selected.label) : t("market.select")}`}
      accessibilityState={{ disabled: disabled || !options.length, expanded: open }} disabled={disabled || !options.length}
      onPress={() => { setSearch(""); setOpen(true); }}
      style={({ pressed }) => [marketStyles.select, (pressed || disabled || !options.length) && marketStyles.dimmed]}>
      <Text style={marketStyles.selectText}>{selected ? t(selected.label) : t("market.select")}</Text>
      <Ionicons name="chevron-down" size={19} color={colors.green} />
    </Pressable>
    <Modal visible={open} onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={shared.screen}>
        <View style={marketStyles.modalContent}>
          <View style={marketStyles.modalHeader}>
            <Text accessibilityRole="header" style={[marketStyles.title, marketStyles.flex]}>{t(label)}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t("market.close")} onPress={() => setOpen(false)} style={marketStyles.close}>
              <Ionicons name="close" size={25} color={colors.green} />
            </Pressable>
          </View>
          <Field label="market.search" value={search} onChangeText={setSearch} autoCorrect={false} />
          <FlatList data={filtered} keyExtractor={option => option.value} keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Copy muted>market.noOptions</Copy>}
            renderItem={({ item }) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: item.value === value }}
              onPress={() => { onChange(item.value); setOpen(false); }} style={marketStyles.option}>
              <Text style={marketStyles.selectText}>{t(item.label)}</Text>
              <Ionicons name={item.value === value ? "radio-button-on" : "radio-button-off"} size={22} color={colors.green} />
            </Pressable>} />
        </View>
      </SafeAreaView>
    </Modal>
  </View>;
}

export const marketStyles = StyleSheet.create({
  headingBlock: { gap: 8 },
  title: { fontSize: 21, lineHeight: 29, fontWeight: "700", color: colors.heading },
  panel: { borderTopWidth: 1 },
  valueRow: { gap: 4 },
  label: { fontSize: 14, lineHeight: 22, color: colors.muted },
  value: { fontSize: 16, lineHeight: 25, color: colors.text },
  strong: { fontSize: 20, lineHeight: 29, fontWeight: "700", color: colors.green },
  evidence: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 10 },
  select: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 50, padding: 13, backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 12 },
  selectText: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 24 },
  dimmed: { opacity: 0.55 },
  modalContent: { flex: 1, padding: 20, gap: 16, width: "100%", maxWidth: 780, alignSelf: "center" },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  close: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  option: { flexDirection: "row", gap: 12, alignItems: "center", minHeight: 52, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
});
