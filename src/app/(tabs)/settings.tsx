import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/ui";
import { colors } from "../../config/theme";
import { usePortal } from "../../hooks/PortalProvider";

export default function Settings() {
  const { language, setLanguage, languageReady, languageError, t } = usePortal();
  return (
    <Screen>
      <View style={s.section}>
        <Text style={s.heading}>{t("App language")}</Text>
        <Text style={s.description}>{language === "hi" ? "जिस भाषा में पढ़ना आसान लगे, उसे चुनें।" : "Choose the language you prefer to read."}</Text>
        {(["en", "hi"] as const).map((option) => (
          <Pressable key={option} accessibilityRole="radio"
            accessibilityState={{ checked: language === option, disabled: !languageReady }}
            disabled={!languageReady} onPress={() => setLanguage(option)}
            style={({ pressed }) => [s.languageRow, language === option && s.selected, pressed && s.pressed]}>
            <Text style={s.rowText}>{option === "en" ? "English" : "हिंदी"}</Text>
            <Ionicons name={language === option ? "radio-button-on" : "radio-button-off"} size={21} color={colors.green} />
          </Pressable>
        ))}
        {languageError && <Text accessibilityRole="alert" style={s.error}>{t("language.preferenceNotSaved")}</Text>}
      </View>
      <View style={s.section}>
        <Text style={s.heading}>{language === "hi" ? "मदद और जानकारी" : "Help & information"}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push("/about")} style={({ pressed }) => [s.link, pressed && s.pressed]}>
          <Ionicons name="information-circle-outline" size={21} color={colors.green} />
          <Text style={s.rowText}>{t("About Mor Kisani")}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push("/chat")} style={({ pressed }) => [s.link, pressed && s.pressed]}>
          <Ionicons name="chatbubble-ellipses-outline" size={21} color={colors.green} />
          <Text style={s.rowText}>{t("Farming assistant")}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  section: { padding: 16, gap: 12, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  heading: { fontSize: 17, lineHeight: 25, fontWeight: "600", color: colors.heading },
  description: { fontSize: 14, lineHeight: 22, color: colors.muted },
  languageRow: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  selected: { backgroundColor: "#F0F7F2", borderColor: "#81AE91" },
  rowText: { flex: 1, fontSize: 15, lineHeight: 23, color: colors.text },
  link: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, paddingVertical: 10 },
  error: { color: colors.error, fontSize: 14, lineHeight: 22 },
  pressed: { opacity: 0.65 },
});
