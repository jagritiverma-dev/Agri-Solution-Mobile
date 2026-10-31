import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePortal } from "../hooks/PortalProvider";
import { farmerColors } from "../config/farmerTheme";

export function LanguageSwitcher() {
  const { language, languageReady, setLanguage } = usePortal();
  return (
    <View style={styles.container} accessibilityLabel={language === "hi" ? "भाषा चुनें" : "Choose language"}>
      {(["en", "hi"] as const).map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          accessibilityLabel={option === "en" ? "English" : "हिंदी"}
          accessibilityState={{ selected: language === option, disabled: !languageReady }}
          disabled={!languageReady}
          onPress={() => setLanguage(option)}
          style={({ pressed }) => [
            styles.option,
            language === option && styles.active,
            (pressed || !languageReady) && styles.dimmed,
          ]}
        >
          <Text style={[styles.text, language === option && styles.activeText]}>
            {option === "en" ? "EN" : "हिंदी"}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", marginRight: 8, borderRadius: 12, backgroundColor: farmerColors.cream },
  option: { minWidth: 44, minHeight: 44, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  active: { backgroundColor: farmerColors.forest },
  text: { fontSize: 13, fontWeight: "700", color: farmerColors.forest },
  activeText: { color: farmerColors.white },
  dimmed: { opacity: 0.55 },
});
