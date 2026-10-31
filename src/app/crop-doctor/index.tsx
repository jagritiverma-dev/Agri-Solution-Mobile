import { usePortal } from "../../hooks/PortalProvider";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";

const GREEN = "#075B45";

const crops = ["Rice", "Wheat", "Maize", "Tomato", "Chilli", "Other"];

export default function CropDoctor() {
  const { t } = usePortal();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [showGuidance, setShowGuidance] = useState(false);

  const submit = () => {
    if (!selectedCrop || !symptoms.trim()) {
      Alert.alert(
        t("Information needed"),
        t("Please select a crop and describe the symptoms.")
      );
      return;
    }

    setShowGuidance(true);
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>{t("← Back")}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t("AGRI-SOLUTION")}</Text>
        <Text style={styles.heading}>{t("🩺 Crop Doctor")}</Text>
        <Text style={styles.subtitle}>{t("Understand crop problems and get practical next steps.")}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{t("🌱 Protect your crops")}</Text>
        <Text style={styles.infoText}>{t("Choose your crop and describe what you notice. Get practical checks to help you decide the next step.")}</Text>
      </View>

      <Text style={styles.sectionTitle}>{t("1. Select your crop")}</Text>

      <View style={styles.grid}>
        {crops.map((crop) => (
          <TouchableOpacity
            key={crop}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCrop === crop }}
            style={[
              styles.cropChip,
              selectedCrop === crop && styles.selectedChip,
            ]}
            onPress={() => {
              setSelectedCrop(crop);
              setShowGuidance(false);
            }}
          >
            <Text
              style={[
                styles.chipText,
                selectedCrop === crop && styles.selectedText,
              ]}
            >
              {t(crop)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t("2. Describe the problem")}</Text>

      <Text style={styles.helper}>{t("Example: Leaves are turning yellow and have brown spots.")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("Describe what you see on your crop...")}
        placeholderTextColor="#94A29A"
        multiline
        textAlignVertical="top"
        value={symptoms}
        onChangeText={(value) => {
          setSymptoms(value);
          setShowGuidance(false);
        }}
      />

      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={submit}
      >
        <Text style={styles.analyzeText}>{t("Get General Guidance →")}</Text>
      </TouchableOpacity>

      {showGuidance && (
        <View style={styles.resultCard}>
          <Text style={styles.resultHeading}>{t("🌿 Suggested next steps")}</Text>

          <Text style={styles.resultText}>
            {t("Crop")}: {t(selectedCrop)}
          </Text>

          <Text style={styles.resultText}>{t("1. Inspect several affected and healthy plants.")}</Text>

          <Text style={styles.resultText}>{t("2. Check soil moisture, drainage and recent weather.")}</Text>

          <Text style={styles.resultText}>{t("3. Look for insects, spots or damage on both sides of the leaves.")}</Text>

          <Text style={styles.resultText}>{t("4. Take clear photos and consult a local agriculture extension officer or qualified crop expert.")}</Text>

          <Text style={styles.warning}>{t("These are general precautions. Do not apply pesticides or chemicals based only on this result.")}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.assistantButton}
        onPress={() => router.push("/chat")}
      >
        <Text style={styles.assistantText}>{t("🤖 Open Farming Assistant →")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F9F5" },
  content: { padding: 20, paddingBottom: 50 },
  back: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
  },
  header: { marginBottom: 20 },
  eyebrow: {
    color: "#00855B",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: "#063F31",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#728078",
  },
  infoCard: {
    backgroundColor: "#E5F5EB",
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: GREEN,
    marginBottom: 9,
  },
  infoText: {
    color: "#52685C",
    fontSize: 15,
    lineHeight: 23,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#063F31",
    marginBottom: 14,
    marginTop: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  cropChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8E0",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
  },
  selectedChip: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  chipText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "700",
  },
  selectedText: { color: "#FFFFFF" },
  helper: {
    fontSize: 16,
    color: "#7A877F",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8E0",
    borderRadius: 18,
    minHeight: 140,
    padding: 17,
    fontSize: 16,
    color: "#263E32",
  },
  analyzeButton: {
    backgroundColor: GREEN,
    padding: 18,
    borderRadius: 17,
    alignItems: "center",
    marginTop: 20,
  },
  analyzeText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CDE3D3",
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
  },
  resultHeading: {
    fontSize: 21,
    fontWeight: "800",
    color: GREEN,
    marginBottom: 15,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#3C5748",
    marginBottom: 10,
  },
  warning: {
    color: "#9C5A17",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  comingSoon: {
    backgroundColor: "#EAF1FB",
    borderRadius: 20,
    padding: 20,
    marginTop: 25,
  },
  comingTitle: {
    color: "#244E79",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 10,
  },
  comingText: {
    color: "#56718A",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 8,
  },
  assistantButton: {
    borderWidth: 1,
    borderColor: GREEN,
    padding: 17,
    borderRadius: 17,
    alignItems: "center",
    marginTop: 22,
  },
  assistantText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "800",
  },
});
