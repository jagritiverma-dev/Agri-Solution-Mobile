import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  type ScrollViewInstance,
  type TextInputInstance,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as Speech from "expo-speech";
import { DistrictMap } from "../components/DistrictMap";
import {
  DistrictAgricultureCards,
  DistrictWeatherCard,
} from "../components/DistrictInsights";
import { usePortal } from "../hooks/PortalProvider";
import {
  districtProfiles,
  matchingDistricts,
  regions,
  RegionId,
  DistrictProfile,
} from "../data/districtAgriculture";

function ListenButton({
  district,
  hi,
}: {
  district: DistrictProfile;
  hi: boolean;
}) {
  const { t } = usePortal();
  const [speaking, setSpeaking] = useState(false);
  const [failed, setFailed] = useState(false);
  const request = useRef(0);
  useFocusEffect(
    useCallback(
      () => () => {
        request.current++;
        setSpeaking(false);
        void Speech.stop().catch(() => {});
      },
      [],
    ),
  );
  const listen = async () => {
    const id = ++request.current;
    const wasSpeaking = speaking;
    setSpeaking(false);
    setFailed(false);
    try {
      await Speech.stop();
      if (id !== request.current || wasSpeaking) return;
      const region = regions[district.region];
      const message = hi
        ? `${district.hindiName}। जिला मुख्यालय ${t(district.capitalCity)}। ${region.hi} की खेती के बारे में जानें। ${region.summaryHi}`
        : `${district.districtName}. Headquarters: ${t(district.capitalCity)}. Regional farming reference for the ${region.en}. ${region.summaryEn}`;
      setSpeaking(true);
      Speech.speak(message, {
        language: hi ? "hi-IN" : "en-IN",
        rate: 0.9,
        onDone: () => {
          if (id === request.current) setSpeaking(false);
        },
        onStopped: () => {
          if (id === request.current) setSpeaking(false);
        },
        onError: () => {
          if (id === request.current) {
            setSpeaking(false);
            setFailed(true);
          }
        },
      });
    } catch {
      if (id === request.current) {
        setSpeaking(false);
        setFailed(true);
      }
    }
  };
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          speaking
            ? hi
              ? "सुनना बंद करें"
              : "Stop reading"
            : hi
              ? "कृषि जानकारी सुनें"
              : "Listen to farming summary"
        }
        onPress={() => void listen()}
        style={s.listen}
      >
        <Ionicons
          name={speaking ? "stop-circle-outline" : "volume-medium-outline"}
          size={19}
          color="#173F31"
        />
        <Text style={s.listenText}>
          {speaking
            ? hi
              ? "बंद करें"
              : "Stop reading"
            : hi
              ? "कृषि जानकारी सुनें"
              : "Listen to summary"}
        </Text>
      </Pressable>
      {failed && (
        <Text style={s.speechError}>
          {hi
            ? "आवाज़ उपलब्ध नहीं है। नीचे जानकारी पढ़ें।"
            : "Voice unavailable. You can read the information below."}
        </Text>
      )}
    </View>
  );
}

export default function Districts() {
  const { language, t } = usePortal();
  const hi = language === "hi";
  const [selected, setSelected] = useState("path7133");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [region, setRegion] = useState<RegionId | "all">("all");
  const [tab, setTab] = useState<"map" | "agriculture">("agriculture");
  const content = useRef<ScrollViewInstance>(null);
  const search = useRef<TextInputInstance>(null);
  const district = districtProfiles.find((d) => d.id === selected)!;
  const profile = regions[district.region];
  const filtered = useMemo(
    () => matchingDistricts(query, region),
    [query, region],
  );
  const visibleIds = useMemo(
    () => matchingDistricts("", region).map((d) => d.id),
    [region],
  );
  const select = useCallback((id: string) => {
    setSelected(id);
    setSearchOpen(false);
    setQuery("");
    search.current?.blur();
    Keyboard.dismiss();
    content.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const selectMap = useCallback(
    (id: string) => {
      select(id);
      setTab("agriculture");
    },
    [select],
  );
  const chooseRegion = (next: RegionId | "all") => {
    setRegion(next);
    setQuery("");
    setSearchOpen(true);
    const matches = matchingDistricts("", next);
    if (!matches.some((d) => d.id === selected) && matches[0])
      setSelected(matches[0].id);
    content.current?.scrollTo({ y: 0, animated: false });
  };
  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={s.screen}>
      <View style={s.header}>
        <View style={s.brandRow}>
          <View style={s.brandIcon}>
            <Ionicons name="leaf-outline" size={24} color="#E9BE58" />
          </View>
          <View style={s.flex}>
            <Text style={s.brand}>
              {t("home.brand")} <Text style={s.tag}>{hi ? "छत्तीसगढ़" : "Chhattisgarh"}</Text>
            </Text>
            <Text style={s.brandSub}>
              {hi ? "अपना जिला · अपनी खेती" : "Your district · Your farming"}
            </Text>
          </View>
        </View>
        <View style={s.controls}>
          <View style={s.search}>
            <Ionicons name="search-outline" size={18} color="#7C8C80" />
            <TextInput
              ref={search}
              accessibilityLabel={hi ? "जिला खोजें" : "Search districts"}
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChangeText={(value) => {
                setQuery(value);
                setSearchOpen(true);
              }}
              placeholder={
                hi
                  ? "जिले का नाम लिखें या चुनें…"
                  : "Search or choose a district…"
              }
              placeholderTextColor="#748476"
              style={s.input}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                searchOpen
                  ? hi
                    ? "खोज बंद करें"
                    : "Close district search"
                  : hi
                    ? "सभी जिले दिखाएं"
                    : "Choose district"
              }
              onPress={() => {
                setSearchOpen((v) => !v);
                setQuery("");
                Keyboard.dismiss();
              }}
              style={s.searchAction}
            >
              <Ionicons
                name={searchOpen ? "close" : "chevron-down"}
                size={19}
                color="#365B45"
              />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filters}
            keyboardShouldPersistTaps="handled"
          >
            {(["all", "north", "plains", "bastar"] as const).map((id) => (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={
                  id === "all"
                    ? hi
                      ? "सभी जिले"
                      : "All districts"
                    : hi
                      ? regions[id].hi
                      : regions[id].en
                }
                accessibilityState={{ selected: region === id }}
                onPress={() => chooseRegion(id)}
                style={[s.filter, region === id && s.filterActive]}
              >
                <Text
                  style={[s.filterText, region === id && s.filterActiveText]}
                >
                  {id === "all"
                    ? hi
                      ? "सभी जिले (33)"
                      : "All districts (33)"
                    : hi
                      ? regions[id].hi
                      : regions[id].en}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          {searchOpen && (
            <View style={s.results}>
              <Text style={s.resultLabel}>
                {filtered.length}{" "}
                {hi ? "जिले · चुनें" : "districts · choose one"}
              </Text>
              <FlatList
                data={filtered}
                keyExtractor={(d) => d.id}
                initialNumToRender={5}
                maxToRenderPerBatch={6}
                windowSize={3}
                keyboardShouldPersistTaps="handled"
                style={s.resultList}
                ListEmptyComponent={
                  <Text style={s.empty}>
                    {hi
                      ? "कोई जिला नहीं मिला। दूसरा नाम या क्षेत्र चुनें।"
                      : "No matches. Try another name or region."}
                  </Text>
                }
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${hi ? item.hindiName : item.districtName}, ${hi ? "चुनें" : "select district"}`}
                    accessibilityState={{ selected: item.id === selected }}
                    onPress={() => select(item.id)}
                    style={[
                      s.resultRow,
                      item.id === selected && s.resultSelected,
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={17}
                      color="#39664B"
                    />
                    <Text style={s.resultName}>
                      {hi ? item.hindiName : item.districtName}
                    </Text>
                    {item.id === selected && (
                      <Ionicons name="checkmark" size={18} color="#39664B" />
                    )}
                  </Pressable>
                )}
              />
            </View>
          )}
          <View style={s.tabs}>
            {(["map", "agriculture"] as const).map((mode) => (
              <Pressable
                key={mode}
                accessibilityRole="tab"
                accessibilityLabel={
                  mode === "map"
                    ? hi
                      ? "नक्शा देखें"
                      : "View map"
                    : hi
                      ? "कृषि विवरण"
                      : "Agriculture details"
                }
                accessibilityState={{ selected: tab === mode }}
                onPress={() => {
                  setTab(mode);
                  setSearchOpen(false);
                  Keyboard.dismiss();
                  content.current?.scrollTo({ y: 0, animated: false });
                }}
                style={[s.tab, tab === mode && s.activeTab]}
              >
                <Ionicons
                  name={
                    mode === "map"
                      ? "map-outline"
                      : "information-circle-outline"
                  }
                  size={17}
                  color={tab === mode ? "#235D3A" : "#768278"}
                />
                <Text style={[s.tabText, tab === mode && s.activeTabText]}>
                  {mode === "map"
                    ? hi
                      ? "नक्शा देखें"
                      : "View map"
                    : hi
                      ? "कृषि विवरण"
                      : "Agriculture details"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      <ScrollView
        ref={content}
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "map" ? (
          <>
            <DistrictMap
              selected={selected}
              onSelect={selectMap}
              hi={hi}
              visibleIds={visibleIds}
            />
            <Text style={s.mapHint}>
              {hi
                ? "किसी जिले पर टैप करके कृषि विवरण खोलें। छोटे जिलों के लिए ज़ूम करें या ऊपर खोजें।"
                : "Tap a district to open its farming details. Zoom or use search for smaller districts."}
            </Text>
          </>
        ) : (
          <>
            <View style={s.hero}>
              <View pointerEvents="none" style={s.watermark}>
                <Ionicons name="leaf" size={156} color="#FFFFFF" />
              </View>
              <View style={s.heroTop}>
                <View style={s.regionBadge}>
                  <Text style={s.regionBadgeText}>
                    {hi ? profile.hi : profile.en}
                  </Text>
                </View>
                <Text style={s.heroKicker}>
                  {hi ? "छत्तीसगढ़" : "CHHATTISGARH"}
                </Text>
              </View>
              <Text accessibilityRole="header" style={s.districtName}>
                {hi ? district.hindiName : district.districtName}
              </Text>
              <View style={s.hq}>
                <Ionicons name="business-outline" size={14} color="#E3C170" />
                <Text style={s.hqText}>
                  {hi ? "जिला मुख्यालय" : "District headquarters"}:{" "}
                  {t(district.capitalCity)}
                </Text>
              </View>
              <ListenButton
                key={`${selected}-${language}`}
                district={district}
                hi={hi}
              />
              <View style={s.heroStats}>
                <View style={s.stat}>
                  <Text style={s.statLabel}>
                    {hi ? "इस क्षेत्र की सालाना बारिश" : "Regional annual rain"}
                  </Text>
                  <Text style={s.statValue}>
                    {profile.rain}
                    <Text style={s.unit}>{hi ? " मिमी" : " mm"}</Text>
                  </Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.stat}>
                  <Text style={s.statLabel}>
                    {hi ? "मुख्य फसल" : "Regional main crop"}
                  </Text>
                  <Text style={s.statValue}>{hi ? "धान" : "Rice"}</Text>
                </View>
              </View>
              <Text style={s.heroNote}>
                {hi
                  ? "सालाना बारिश: कृषि क्षेत्र का औसत · ICAR 2024"
                  : "Annual rainfall for the farming region · ICAR 2024"}
              </Text>
            </View>
            <DistrictWeatherCard key={selected} district={district} hi={hi} />
            <DistrictAgricultureCards district={district} hi={hi} />
          </>
        )}
        <Text style={s.footer}>
          {hi
            ? "मोर किसानी · अपनी माटी से जुड़ाव"
            : "mor Kisani · Rooted in our soil"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F6EF" },
  flex: { flex: 1 },
  header: { backgroundColor: "#FFFFFF" },
  brandRow: {
    backgroundColor: "#184A38",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#345F45",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#68825A",
  },
  brand: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  tag: { fontSize: 14, color: "#F4CB6A", fontWeight: "800" },
  brandSub: { fontSize: 14, color: "#D4E5D6", marginTop: 2 },
  language: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAC16A",
    paddingHorizontal: 11,
    minHeight: 38,
    borderRadius: 9,
  },
  languageText: { fontSize: 14, fontWeight: "700", color: "#173F31" },
  controls: {
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E8DD",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DFE6DA",
    borderRadius: 12,
    paddingLeft: 11,
    backgroundColor: "#FAFBF7",
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    color: "#2B4937",
    fontSize: 16,
    paddingVertical: 9,
  },
  searchAction: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  filters: { gap: 8 },
  filter: {
    borderWidth: 1,
    borderColor: "#E7EBE1",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minHeight: 48,
    justifyContent: "center",
    backgroundColor: "#F6F7F2",
  },
  filterActive: { backgroundColor: "#244F3B", borderColor: "#244F3B" },
  filterText: { color: "#586B5C", fontSize: 14, fontWeight: "600" },
  filterActiveText: { color: "#FFFFFF" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F1F3EC",
    padding: 3,
    borderRadius: 10,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  activeTab: { backgroundColor: "#FFFFFF" },
  tabText: { flexShrink: 1, fontSize: 14, color: "#536359", fontWeight: "600" },
  activeTabText: { color: "#235D3A" },
  scroll: { flex: 1 },
  content: {
    padding: 14,
    gap: 14,
    paddingBottom: 28,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    backgroundColor: "#174633",
    borderRadius: 23,
    padding: 20,
    overflow: "hidden",
    gap: 10,
  },
  heroTop: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  regionBadge: {
    backgroundColor: "#EAC16A",
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  regionBadgeText: { fontSize: 14, fontWeight: "800", color: "#203F2D" },
  heroKicker: { fontSize: 14, letterSpacing: 1, color: "#BBD1C0" },
  districtName: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
  },
  hq: { flexDirection: "row", alignItems: "center", gap: 6 },
  hqText: { fontSize: 14, lineHeight: 24, color: "#E2ECE1", flex: 1 },
  listen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    backgroundColor: "#EAC16A",
    paddingHorizontal: 12,
    minHeight: 42,
    borderRadius: 10,
    marginTop: 3,
  },
  listenText: { color: "#173F31", fontSize: 14, fontWeight: "700" },
  speechError: { color: "#F6D690", fontSize: 14, marginTop: 5 },
  heroStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#3C6250",
    marginTop: 12,
    paddingTop: 16,
    gap: 12,
  },
  stat: { flex: 1, gap: 5 },
  statLabel: { fontSize: 14, color: "#C3D6C7", lineHeight: 24 },
  statValue: { fontSize: 16, color: "#FFFFFF", fontWeight: "700" },
  unit: { fontSize: 14, fontWeight: "400" },
  statDivider: { width: 1, backgroundColor: "#3C6250" },
  heroNote: { fontSize: 14, lineHeight: 24, color: "#C3D6C7" },
  watermark: {
    position: "absolute",
    right: -25,
    bottom: 35,
    opacity: 0.055,
    transform: [{ rotate: "-25deg" }],
  },
  results: {
    borderWidth: 1,
    borderColor: "#DFE6DA",
    borderRadius: 12,
    overflow: "hidden",
  },
  resultLabel: {
    fontSize: 14,
    color: "#66816C",
    padding: 10,
    backgroundColor: "#F4F7EF",
  },
  resultList: { maxHeight: 200 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: "#EEF1E8",
  },
  resultName: { flex: 1, fontSize: 16, color: "#2B4937" },
  resultSelected: { backgroundColor: "#EBF2E4" },
  empty: { padding: 18, color: "#627768", fontSize: 16, lineHeight: 24 },
  mapHint: {
    fontSize: 14,
    lineHeight: 24,
    color: "#5C7361",
    paddingHorizontal: 4,
  },
  footer: {
    fontSize: 14,
    color: "#748572",
    textAlign: "center",
    paddingVertical: 6,
  },
});
