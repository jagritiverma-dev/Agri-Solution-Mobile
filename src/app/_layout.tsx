import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { PortalProvider, usePortal } from "../hooks/PortalProvider";
import { colors } from "../config/theme";
function AppStack() {
  const { t } = usePortal();
  return (
      <Stack
        screenOptions={{
          headerRight: () => <LanguageSwitcher />,
          headerTintColor: colors.green,
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="market" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: t("Farmer account") }} />
        <Stack.Screen name="crop/[id]" options={{ title: t("Crop guide") }} />
        <Stack.Screen
          name="schemes"
          options={{ title: t("Schemes & Subsidies") }}
        />
        <Stack.Screen
          name="districts"
          options={{ title: t("home.districtMap") }}
        />
        <Stack.Screen
          name="centres"
          options={{ title: t("Procurement centres") }}
        />
        <Stack.Screen name="notices" options={{ title: t("Notice board") }} />
        <Stack.Screen name="chat" options={{ title: t("Farming assistant") }} />
        <Stack.Screen name="crop-doctor/index" options={{ title: t("Crop Doctor") }} />
        <Stack.Screen name="about" options={{ title: t("About Agri-Solution") }} />
      </Stack>
  );
}

export default function Layout() {
  return (
    <PortalProvider>
      <StatusBar style="dark" />
      <AppStack />
    </PortalProvider>
  );
}
