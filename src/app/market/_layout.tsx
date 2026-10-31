import { Stack } from "expo-router";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { colors } from "../../config/theme";
import { usePortal } from "../../hooks/PortalProvider";

export default function MarketLayout() {
  const { t } = usePortal();
  return <Stack screenOptions={{
    headerTintColor: colors.green, headerStyle: { backgroundColor: colors.white },
    headerTitleStyle: { fontWeight: "700", fontSize: 17 },
    headerBackButtonDisplayMode: "minimal", headerRight: () => <LanguageSwitcher />,
    contentStyle: { backgroundColor: colors.background },
  }}>
    <Stack.Screen name="index" options={{ title: t("market.title") }} />
    <Stack.Screen name="msp" options={{ title: t("market.msp") }} />
    <Stack.Screen name="mandi" options={{ title: t("market.mandi") }} />
    <Stack.Screen name="dealers" options={{ title: t("market.dealers") }} />
    <Stack.Screen name="inputs" options={{ title: t("market.inputs.short") }} />
    <Stack.Screen name="calculator" options={{ title: t("market.calculator") }} />
    <Stack.Screen name="centres" options={{ title: t("market.centres.short") }} />
    <Stack.Screen name="comparison" options={{ title: t("market.comparison") }} />
    <Stack.Screen name="alerts" options={{ title: t("market.alerts") }} />
  </Stack>;
}
