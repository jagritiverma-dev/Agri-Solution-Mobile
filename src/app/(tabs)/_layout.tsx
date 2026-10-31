import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../config/theme";
import { usePortal } from "../../hooks/PortalProvider";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
export default function TabsLayout() {
  const { t } = usePortal();
  const insets = useSafeAreaInsets();
  const bottomSpace = Math.max(insets.bottom, 10);
  return (
    <Tabs
      screenOptions={{
        headerRight: () => <LanguageSwitcher />,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        headerTintColor: colors.green,
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        tabBarLabelPosition: "below-icon",
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: { paddingVertical: 0 },
        tabBarStyle: {
          height: 64 + bottomSpace,
          paddingTop: 5,
          paddingBottom: bottomSpace,
          backgroundColor: "white",
          borderTopColor: colors.border,
        },
      }}
    >
      {([
        ["index", "Home", "home-outline"],
        ["crops", "Crops", "leaf-outline"],
        ["weather", "Weather", "partly-sunny-outline"],
        ["account", "Profile", "person-circle-outline"],
        ["settings", "Settings", "settings-outline"],
      ] as const).map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t(title),
            ...(name === "settings" ? { headerRight: () => null } : {}),
            tabBarLabel: ({ focused }) => (
              <Text numberOfLines={1} maxFontSizeMultiplier={1.3}
                style={{ fontSize: 12, lineHeight: 21, paddingBottom: 2,
                  fontWeight: focused ? "700" : "500", textAlign: "center",
                  color: focused ? colors.green : colors.muted }}>
                {t(title)}
              </Text>
            ),
            tabBarIcon: ({ color }) => (
              <Ionicons name={icon} color={typeof color === "string" ? color : colors.green} size={24} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
