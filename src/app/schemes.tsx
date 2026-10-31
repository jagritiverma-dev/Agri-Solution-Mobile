
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePortal } from "../hooks/PortalProvider";
import { schemesHindi, schemeDocumentsHindi } from "../data/schemesHindi";
import { schemeSummaries } from "../data/schemeSummaries";

import {
  SCHEMES,
  REGION_OPTIONS,
  CATEGORY_OPTIONS,
  TAG_OPTIONS,
  filterSchemes,
  type Scheme,
  type SchemeRegion,
  type SchemeCategory,
  type SchemeTag,
} from "../data/schemesData";

type Lang = "en" | "hi";
type RegionValue = "all" | SchemeRegion;
type CategoryValue = "all" | SchemeCategory;

type SelectOption = {
  value: string;
  en: string;
  hi: string;
};

const C = {
  green: "#075C43",
  deep: "#064331",
  light: "#E8F4EC",
  cream: "#F7F8F2",
  white: "#FFFFFF",
  ink: "#193D30",
  muted: "#63766B",
  border: "#E1E9E1",
  gold: "#FFF1D7",
  goldText: "#95600F",
};

const categoryIcons: Record<
  SchemeCategory,
  keyof typeof Ionicons.glyphMap
> = {
  dbt: "wallet-outline",
  irrigation: "water-outline",
  horticulture: "flower-outline",
  machinery: "construct-outline",
  credit: "card-outline",
  soil: "leaf-outline",
  allied: "paw-outline",
  pension: "shield-checkmark-outline",
};

const categoryColors: Record<
  SchemeCategory,
  { bg: string; fg: string }
> = {
  dbt: { bg: "#FFF0D9", fg: "#9A6314" },
  irrigation: { bg: "#DEF3FA", fg: "#14758C" },
  horticulture: { bg: "#F5E8F6", fg: "#925B9A" },
  machinery: { bg: "#E8ECFF", fg: "#5363AC" },
  credit: { bg: "#E7F0FF", fg: "#2B67A2" },
  soil: { bg: "#E9F2DB", fg: "#557C32" },
  allied: { bg: "#FBE9DF", fg: "#A55E34" },
  pension: { bg: "#E5F2E8", fg: "#20704C" },
};

const labels = {
  en: {
    title: "Schemes & Subsidies",
    subtitle: "Government support for Chhattisgarh farmers",
    eyebrow: "FARMER SUPPORT DIRECTORY",
    filterTitle: "Find the right scheme",
    search: "Search schemes, benefits, documents...",
    region: "Government",
    category: "Support Sector",
    eligibilityFilters: "Farmer Category",
    selected: "selected",
    showing: "Showing",
    schemes: "schemes",
    state: "State",
    central: "Central",
    reset: "Clear Filters",
    benefit: "Key Benefit",
    details: "Eligibility, benefits & documents",
    hide: "Hide Details",
    eligibility: "Eligibility Criteria",
    documents: "Required Documents",
    application: "Application Information",
    applyMode: "Application Mode",
    official: "Open Official Portal",
    portalNote:
      "This may open a department website rather than a direct application form.",
    noResults: "No matching schemes found",
    noResultsHint: "Try changing your filters.",
    note:
      "Scheme benefits and eligibility may change. Verify current conditions with the responsible government department.",
    linkError: "Unable to open the official website.",
  },
  hi: {
    title: "योजनाएं और सब्सिडी",
    subtitle: "छत्तीसगढ़ के किसानों के लिए सरकारी सहायता",
    eyebrow: "खेती के लिए सरकारी सहायता",
    filterTitle: "सही योजना खोजें",
    search: "योजना, लाभ या दस्तावेज खोजें...",
    region: "सरकार",
    category: "सहायता क्षेत्र",
    eligibilityFilters: "आपके लिए योजनाएं",
    selected: "चयनित",
    showing: "दिखाई गई",
    schemes: "योजनाएं",
    state: "राज्य",
    central: "केंद्र",
    reset: "फ़िल्टर हटाएं",
    benefit: "क्या मदद मिलेगी?",
    details: "पात्रता, लाभ और दस्तावेज",
    hide: "विवरण बंद करें",
    eligibility: "कौन आवेदन कर सकता है?",
    documents: "आवश्यक दस्तावेज",
    application: "आवेदन की जानकारी",
    applyMode: "आवेदन माध्यम",
    official: "सरकारी पोर्टल खोलें",
    portalNote:
      "यह लिंक सीधे आवेदन फॉर्म के बजाय विभागीय वेबसाइट खोल सकता है।",
    noResults: "कोई योजना नहीं मिली",
    noResultsHint: "फ़िल्टर बदलकर दोबारा देखें।",
    note:
      "योजनाओं के लाभ और पात्रता बदल सकते हैं। आवेदन से पहले संबंधित सरकारी विभाग से पुष्टि करें।",
    linkError: "सरकारी वेबसाइट नहीं खुल सकी।",
  },
};

function optionLabel(
  options: readonly SelectOption[],
  value: string,
  lang: Lang
): string {
  const found = options.find(
    (option: SelectOption) => option.value === value
  );
  return found ? found[lang] : value;
}

function Dropdown({
  title,
  value,
  options,
  lang,
  onChange,
}: {
  title: string;
  value: string;
  options: readonly SelectOption[];
  lang: Lang;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.dropdownWrap}>
      <Text style={styles.fieldLabel}>{title}</Text>

      <Pressable
        style={styles.dropdown}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={styles.dropdownText} numberOfLines={1}>
          {optionLabel(options, value, lang)}
        </Text>
        <Ionicons
          name="chevron-down"
          size={17}
          color={C.green}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={10}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={C.ink}
                />
              </Pressable>
            </View>

            <ScrollView style={styles.modalList}>
              {options.map((option: SelectOption) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.modalItem,
                    value === option.value &&
                      styles.modalItemActive,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {option[lang]}
                  </Text>

                  {value === option.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={C.green}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SchemeCard({
  scheme,
  lang,
}: {
  scheme: Scheme;
  lang: Lang;
}) {
  const [expanded, setExpanded] = useState(false);
  const [checkedDocs, setCheckedDocs] =
    useState<number[]>([]);

  const t = labels[lang];
  const color = categoryColors[scheme.category];

  const toggleDocument = (index: number) => {
    setCheckedDocs((previous: number[]) =>
      previous.includes(index)
        ? previous.filter((value: number) => value !== index)
        : [...previous, index]
    );
  };

  const openOfficial = async () => {
    try {
      if (!/^https:\/\//i.test(scheme.applyUrl)) {
        throw new Error("Invalid HTTPS URL");
      }

      const supported = await Linking.canOpenURL(
        scheme.applyUrl
      );

      if (!supported) {
        throw new Error("Unsupported URL");
      }

      await Linking.openURL(scheme.applyUrl);
    } catch {
      Alert.alert(t.linkError);
    }
  };

  const regionName =
    scheme.region === "cg"
      ? lang === "hi"
        ? "छत्तीसगढ़ सरकार"
        : "Chhattisgarh Government"
      : lang === "hi"
        ? "केंद्र सरकार"
        : "Central Government";

  return (
    <View style={[styles.card, { backgroundColor: color.bg, borderTopWidth: 4, borderTopColor: color.fg }]}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.schemeIcon,
            { backgroundColor: color.bg },
          ]}
        >
          <Ionicons
            name={categoryIcons[scheme.category]}
            size={25}
            color={color.fg}
          />
        </View>

        <View style={styles.regionBadge}>
          <Text style={styles.regionBadgeText}>
            {regionName}
          </Text>
        </View>
      </View>

      <Text style={styles.schemeName}>
        {lang === "hi" ? scheme.nameHi : scheme.nameEn}
      </Text>

      <View
        style={[
          styles.categoryPill,
          { backgroundColor: color.bg },
        ]}
      >
        <Text
          style={[
            styles.categoryPillText,
            { color: color.fg },
          ]}
        >
          {optionLabel(
            CATEGORY_OPTIONS,
            scheme.category,
            lang
          )}
        </Text>
      </View>

      <View style={styles.benefitBox}>
        <Ionicons
          name="gift-outline"
          size={22}
          color={C.goldText}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.benefitLabel}>
            {t.benefit}
          </Text>
          <Text style={styles.benefitValue}>
            {lang === "hi" ? schemesHindi[scheme.id][0] : scheme.benefitBadge}
          </Text>
        </View>
      </View>

      <Text style={styles.summary}>
        {lang === "hi" ? schemesHindi[scheme.id][1] : schemeSummaries[scheme.id]}
      </Text>

      {expanded && (
        <View style={styles.expanded}>
          <Text style={styles.detailHeading}>
            {t.eligibility}
          </Text>

          {scheme.eligibility.map(
            (item: string, index: number) => (
              <View
                key={`eligibility-${index}`}
                style={styles.detailRow}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={C.green}
                />
                <Text style={styles.detailText}>
                  {lang === "hi" ? schemesHindi[scheme.id][index + 2] : item}
                </Text>
              </View>
            )
          )}

          <Text style={styles.detailHeading}>
            {t.documents}
          </Text>

          {scheme.documents.map(
            (document: string, index: number) => {
              const checked = checkedDocs.includes(index);

              return (
                <Pressable
                  key={`document-${index}`}
                  style={styles.detailRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  onPress={() => toggleDocument(index)}
                >
                  <Ionicons
                    name={
                      checked
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={19}
                    color={C.green}
                  />

                  <Text
                    style={[
                      styles.detailText,
                      checked && styles.checkedText,
                    ]}
                  >
                    {lang === "hi" ? schemeDocumentsHindi[document] : document}
                  </Text>
                </Pressable>
              );
            }
          )}

          <View style={styles.applyPanel}>
            <Text style={styles.detailHeading}>
              {t.application}
            </Text>

            <Text style={styles.applyMode}>
              {t.applyMode}: {lang === "hi" ? schemeDocumentsHindi[scheme.applyMode] : scheme.applyMode}
            </Text>

            <Text style={styles.portalNote}>
              {t.portalNote}
            </Text>

            <Pressable
              style={styles.applyButton}
              onPress={() => void openOfficial()}
              accessibilityRole="link"
            >
              <Text style={styles.applyText}>
                {t.official}
              </Text>
              <Ionicons
                name="open-outline"
                size={18}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
      )}

      <Pressable
        style={styles.expandButton}
        onPress={() => setExpanded((previous) => !previous)}
      >
        <Text style={styles.expandText}>
          {expanded ? t.hide : t.details}
        </Text>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={19}
          color={C.green}
        />
      </Pressable>
    </View>
  );
}

export default function SchemesScreen() {
  const { language } = usePortal();
  const lang: Lang = language === "hi" ? "hi" : "en";
  const t = labels[lang];

  const [query, setQuery] = useState("");
  const [region, setRegion] =
    useState<RegionValue>("all");
  const [category, setCategory] =
    useState<CategoryValue>("all");
  const [selectedTags, setSelectedTags] =
    useState<SchemeTag[]>([]);

  const filtered = useMemo(
    (): Scheme[] =>
      filterSchemes(
        SCHEMES,
        query,
        region,
        category,
        selectedTags
      ),
    [query, region, category, selectedTags]
  );

  const stateCount = SCHEMES.filter(
    (item: Scheme) => item.region === "cg"
  ).length;

  const centralCount = SCHEMES.length - stateCount;

  const toggleTag = (tag: SchemeTag) => {
    setSelectedTags((previous: SchemeTag[]) =>
      previous.includes(tag)
        ? previous.filter(
            (item: SchemeTag) => item !== tag
          )
        : [...previous, tag]
    );
  };

  const resetFilters = () => {
    setQuery("");
    setRegion("all");
    setCategory("all");
    setSelectedTags([]);
  };

  const hasFilters =
    query.trim().length > 0 ||
    region !== "all" ||
    category !== "all" ||
    selectedTags.length > 0;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroHeading}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="leaf"
              size={24}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.heroEyebrow}>
            {t.eyebrow}
          </Text>
        </View>

        <Text style={styles.heroTitle}>
          {t.title}
        </Text>

        <Text style={styles.heroSubtitle}>
          {t.subtitle}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {SCHEMES.length}
            </Text>
            <Text style={styles.statLabel}>
              {t.schemes}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {stateCount}
            </Text>
            <Text style={styles.statLabel}>
              {t.state}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {centralCount}
            </Text>
            <Text style={styles.statLabel}>
              {t.central}
            </Text>
          </View>
        </View>

        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>
            {t.filterTitle}
          </Text>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={21}
              color={C.green}
            />

            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={t.search}
              placeholderTextColor="#84978B"
            />

            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#84978B"
                />
              </Pressable>
            )}
          </View>

          <View style={styles.dropdownRow}>
            <Dropdown
              title={t.region}
              value={region}
              options={REGION_OPTIONS}
              lang={lang}
              onChange={(value: string) =>
                setRegion(value as RegionValue)
              }
            />

            <Dropdown
              title={t.category}
              value={category}
              options={CATEGORY_OPTIONS}
              lang={lang}
              onChange={(value: string) =>
                setCategory(value as CategoryValue)
              }
            />
          </View>

          <Text style={styles.tagsTitle}>
            {t.eligibilityFilters}
          </Text>

          <View style={styles.tagsGrid}>
            {TAG_OPTIONS.map(
              (option: (typeof TAG_OPTIONS)[number]) => {
                const checked = selectedTags.includes(
                  option.value
                );

                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.tag,
                      checked && styles.tagActive,
                    ]}
                    onPress={() => toggleTag(option.value)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                  >
                    <Ionicons
                      name={
                        checked
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={18}
                      color={C.green}
                    />

                    <Text style={styles.tagText}>
                      {option[lang]}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultsTitle}>
            {t.showing} {filtered.length} {t.schemes}
          </Text>
        </View>

        {hasFilters && (
          <Pressable
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={C.green}
            />
            <Text style={styles.resetText}>
              {t.reset}
            </Text>
          </Pressable>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="search-outline"
            size={38}
            color="#90A99A"
          />

          <Text style={styles.emptyTitle}>
            {t.noResults}
          </Text>

          <Text style={styles.emptyText}>
            {t.noResultsHint}
          </Text>

          <Pressable onPress={resetFilters}>
            <Text style={styles.resetText}>
              {t.reset}
            </Text>
          </Pressable>
        </View>
      ) : (
        filtered.map((scheme: Scheme) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            lang={lang}
          />
        ))
      )}

      <View style={styles.notice}>
        <Ionicons
          name="information-circle-outline"
          size={22}
          color={C.green}
        />

        <Text style={styles.noticeText}>
          {t.note}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.cream,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: C.deep,
    padding: 16,
    paddingTop: 25,
    paddingBottom: 25,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  heroHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  heroIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#19785A",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEyebrow: {
    fontSize: 14,
    fontWeight: "800",
    color: "#C8E7D7",
    letterSpacing: 1,
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 7,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#D6EDE0",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 23,
    marginBottom: 23,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#C7E5D5",
    marginTop: 4,
  },
  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    padding: 17,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 15,
  },
  searchBox: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DCE7DE",
    borderRadius: 13,
    backgroundColor: "#F9FBF8",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 17,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: C.ink,
  },
  dropdownRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 19,
  },
  dropdownWrap: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#365E49",
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#DCE7DE",
    borderRadius: 12,
    minHeight: 49,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 11,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E9E0",
    backgroundColor: "#F7FAF6",
    borderRadius: 11,
    maxWidth: "100%",
  },
  tagActive: {
    backgroundColor: "#E6F3EA",
    borderColor: "#80B79A",
  },
  tagText: {
    fontSize: 14,
    color: "#526C5B",
    fontWeight: "700",
    flexShrink: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.ink,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: "800",
    color: C.green,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 15,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  schemeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  regionBadge: {
    backgroundColor: "#E7F3EA",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    flexShrink: 1,
  },
  regionBadgeText: {
    color: C.green,
    fontSize: 14,
    fontWeight: "800",
  },
  schemeName: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 7,
  },
  englishName: {
    fontSize: 14,
    color: C.muted,
    marginBottom: 8,
  },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 15,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: "800",
  },
  benefitBox: {
    backgroundColor: C.gold,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 15,
  },
  benefitLabel: {
    fontSize: 14,
    color: C.goldText,
    fontWeight: "800",
    marginBottom: 5,
  },
  benefitValue: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: "#70470D",
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5C7164",
    marginBottom: 17,
  },
  expanded: {
    borderTopWidth: 1,
    borderTopColor: "#E6ECE5",
    paddingTop: 18,
    marginBottom: 15,
  },
  detailHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 12,
    marginTop: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 11,
  },
  detailText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#576D5F",
  },
  checkedText: {
    textDecorationLine: "line-through",
    color: "#819487",
  },
  applyPanel: {
    backgroundColor: "#EDF5EE",
    borderRadius: 14,
    padding: 15,
    marginTop: 5,
  },
  applyMode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#365F49",
    marginBottom: 8,
  },
  portalNote: {
    fontSize: 14,
    lineHeight: 24,
    color: "#667D6C",
    marginBottom: 13,
  },
  applyButton: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  applyText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  expandButton: {
    borderTopWidth: 1,
    borderTopColor: "#EDF1EC",
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  expandText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.green,
    flex: 1,
  },
  empty: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: C.muted,
    textAlign: "center",
  },
  notice: {
    marginHorizontal: 16,
    marginTop: 9,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#E7F2E8",
    flexDirection: "row",
    gap: 11,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    color: "#466B53",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "center",
    padding: 22,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
    flex: 1,
  },
  modalList: {
    flexGrow: 0,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1ED",
    gap: 10,
  },
  modalItemActive: {
    backgroundColor: "#E9F5EC",
    borderRadius: 10,
  },
  modalItemText: {
    fontSize: 16,
    color: "#385C47",
    flex: 1,
  },
});
