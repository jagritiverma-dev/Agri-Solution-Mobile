import { useState, type PropsWithChildren } from "react";
import { FlatList, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Copy, Feedback, Field, Screen, cardTones, styles as shared } from "../ui";
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
  const visual = title.includes("dealers") || title.includes("centres") ? { tone: cardTones.blue, icon: "people-outline" as const }
    : title.includes("inputs") || title.includes("msp") ? { tone: cardTones.amber, icon: "leaf-outline" as const }
    : title.includes("calculator") || title.includes("comparison") || title.includes("alerts") ? { tone: cardTones.purple, icon: "calculator-outline" as const }
    : { tone: cardTones.green, icon: "storefront-outline" as const };
  return <Screen>
    <View style={[marketStyles.screenHeading, visual.tone]}>
      <View style={marketStyles.headingIcon}><Ionicons name={visual.icon} size={26} color={colors.green} /></View>
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
  return <View style={marketStyles.empty}>
    <View style={marketStyles.headingIcon}><Ionicons name="file-tray-outline" size={28} color={colors.muted} /></View>
    <Copy>market.empty</Copy><Copy muted>{message}</Copy>
  </View>;
}
export function LabelValue({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  const { t } = usePortal();
  return <View style={[marketStyles.valueRow, strong && marketStyles.highlight]}>
    <Text style={marketStyles.label}>{t(label)}</Text>
    <Text style={[marketStyles.value, strong && marketStyles.strong]}>{value}</Text>
  </View>;
}

export function MarketCategories({ value, options, onChange }: {
  value: string; options: MarketOption[]; onChange: (value: string) => void;
}) {
  const { t } = usePortal();
  return <View style={marketStyles.chips}>{options.map(option => <Pressable key={option.value}
    accessibilityRole="radio" accessibilityState={{ checked: value === option.value }} aria-checked={value === option.value}
    onPress={() => onChange(option.value)}
    style={({ pressed }) => [marketStyles.chip, value === option.value && marketStyles.chipActive, pressed && marketStyles.dimmed]}>
    <Text style={[marketStyles.chipText, value === option.value && marketStyles.chipTextActive]}>{t(option.label)}</Text>
  </Pressable>)}</View>;
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
  screenHeading: { gap: 9, padding: 18, borderRadius: 20, borderWidth: 1, borderTopWidth: 3 },
  headingIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  empty: { padding: 22, gap: 12, borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: 20, alignItems: "center", backgroundColor: colors.background },
  highlight: { padding: 16, backgroundColor: colors.light, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: colors.green },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 46, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 14, lineHeight: 22, color: colors.heading, fontWeight: "600" },
  chipTextActive: { color: colors.white },
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
