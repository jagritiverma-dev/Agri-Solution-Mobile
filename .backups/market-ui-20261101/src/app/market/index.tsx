import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MarketScreen } from "../../components/market/MarketUI";
import { colors } from "../../config/theme";
import { usePortal } from "../../hooks/PortalProvider";

const services = [
  { key: "msp", icon: "shield-checkmark-outline", route: "/market/msp" },
  { key: "mandi", icon: "storefront-outline", route: "/market/mandi" },
  { key: "dealers", icon: "people-outline", route: "/market/dealers" },
  { key: "inputs", icon: "bag-handle-outline", route: "/market/inputs" },
  { key: "calculator", icon: "calculator-outline", route: "/market/calculator" },
  { key: "centres", icon: "business-outline", route: "/market/centres" },
  { key: "comparison", icon: "swap-horizontal-outline", route: "/market/comparison" },
  { key: "alerts", icon: "notifications-outline", route: "/market/alerts" },
] as const;

export default function AgriculturalMarket() {
  const { t } = usePortal();
  return <MarketScreen title="market.title" description="market.subtitle">
    {services.map(service => <Pressable key={service.key} accessibilityRole="button"
      accessibilityLabel={t(`market.${service.key}`)} onPress={() => router.push(service.route)}
      style={({ pressed }) => [s.card, pressed && s.pressed]}>
      <View style={s.icon}><Ionicons name={service.icon} size={25} color={colors.green} /></View>
      <View style={s.text}>
        <Text style={s.title}>{t(`market.${service.key}`)}</Text>
        <Text style={s.subtitle}>{t(`market.${service.key}.hint`)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>)}
  </MarketScreen>;
}
const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, minHeight: 88, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.white },
  icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.light, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 5 },
  title: { fontSize: 17, lineHeight: 25, color: colors.heading, fontWeight: "600" },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted },
  pressed: { opacity: 0.65 },
});
