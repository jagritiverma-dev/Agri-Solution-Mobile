import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen, cardTones } from "../../components/ui";
import { colors } from "../../config/theme";
import { usePortal } from "../../hooks/PortalProvider";

const groups = [
  { title: "market.group.prices", tone: "green", items: [
    { key: "msp", icon: "shield-checkmark-outline", route: "/market/msp" },
    { key: "mandi", icon: "storefront-outline", route: "/market/mandi" },
  ] },
  { title: "market.group.buy", tone: "amber", items: [
    { key: "inputs", icon: "bag-handle-outline", route: "/market/inputs" },
  ] },
  { title: "market.group.help", tone: "blue", items: [
    { key: "dealers", icon: "people-outline", route: "/market/dealers" },
    { key: "centres", icon: "business-outline", route: "/market/centres" },
  ] },
  { title: "market.group.plan", tone: "purple", items: [
    { key: "comparison", icon: "swap-horizontal-outline", route: "/market/comparison" },
    { key: "alerts", icon: "notifications-outline", route: "/market/alerts" },
  ] },
] as const;

export default function AgriculturalMarket() {
  const { t } = usePortal();
  return <Screen>
    <View style={s.hero}>
      <View style={s.heroTop}><View style={s.badge}><Ionicons name="leaf-outline" size={18} color={colors.gold} /><Text style={s.eyebrow}>{t("market.forFarmers")}</Text></View><Ionicons name="storefront-outline" size={34} color={colors.gold} /></View>
      <Text accessibilityRole="header" style={s.heroTitle}>{t("market.title")}</Text>
      <Text style={s.heroCopy}>{t("market.subtitle")}</Text>
      <View style={s.heroBottom}><Ionicons name="calendar-outline" size={17} color={colors.gold} /><Text style={s.heroFoot}>{t("market.dateReminder")}</Text></View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={t("market.calculator")} onPress={() => router.push("/market/calculator")} style={({ pressed }) => [s.calculator, pressed && s.pressed]}>
      <View style={s.calcIcon}><Ionicons name="calculator-outline" size={27} color={colors.green} /></View>
      <View style={s.text}><Text style={s.title}>{t("market.takeHome")}</Text><Text style={s.subtitle}>{t("market.calculator.hint")}</Text><Text style={s.link}>{t("market.calculator")} →</Text></View>
    </Pressable>
    {groups.map(group => <View key={group.title} style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>{t(group.title)}</Text>
      <View style={[s.group, cardTones[group.tone]]}>
        {group.items.map((service, index) => <Pressable key={service.key} accessibilityRole="button"
          accessibilityLabel={t(`market.${service.key}`)} onPress={() => router.push(service.route)}
          style={({ pressed }) => [s.row, index > 0 && s.divider, pressed && s.pressed]}>
          <View style={s.icon}><Ionicons name={service.icon} size={24} color={colors.green} /></View>
          <View style={s.text}><Text style={s.title}>{t(`market.${service.key}`)}</Text><Text style={s.subtitle}>{t(`market.${service.key}.hint`)}</Text></View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>)}
      </View>
    </View>)}
  </Screen>;
}
const s = StyleSheet.create({
  hero: { padding: 20, gap: 14, borderRadius: 24, backgroundColor: colors.green },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  badge: { flex: 1, flexDirection: "row", alignItems: "center", gap: 7 },
  eyebrow: { flexShrink: 1, color: colors.gold, fontSize: 13, lineHeight: 20, fontWeight: "600" },
  heroTitle: { color: colors.white, fontSize: 26, lineHeight: 36, fontWeight: "700" },
  heroCopy: { color: colors.light, fontSize: 15, lineHeight: 24 },
  heroBottom: { flexDirection: "row", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.muted },
  heroFoot: { flex: 1, fontSize: 12, lineHeight: 19, color: colors.light },
  calculator: { flexDirection: "row", gap: 14, alignItems: "center", padding: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.white },
  calcIcon: { padding: 12, borderRadius: 16, backgroundColor: colors.gold },
  section: { gap: 10 },
  sectionTitle: { color: colors.heading, fontWeight: "700", fontSize: 18, lineHeight: 27 },
  group: { borderWidth: 1, borderTopWidth: 3, borderRadius: 20, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, minHeight: 98 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 40, height: 44, borderRadius: 12, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 5 },
  title: { fontSize: 16, lineHeight: 24, color: colors.heading, fontWeight: "700" },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted },
  link: { color: colors.green, fontSize: 14, lineHeight: 22, fontWeight: "700" },
  pressed: { opacity: 0.65 },
});
