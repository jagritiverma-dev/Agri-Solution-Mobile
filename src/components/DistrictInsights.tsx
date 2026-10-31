import { usePortal } from "../hooks/PortalProvider";
import { memo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  DistrictProfile,
  advisorySource,
  agricultureSource,
  regions,
  zoneSource,
  directorySource,
} from "../data/districtAgriculture";
import {
  DistrictWeather,
  getDistrictWeather,
} from "../services/districtWeather";

export function SourceLink({ url, label }: { url: string; label: string }) {
  const { language } = usePortal();
  const [failed, setFailed] = useState(false);
  return (
    <View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        onPress={() => {
          setFailed(false);
          void Linking.openURL(url).catch(() => setFailed(true));
        }}
        style={s.source}
      >
        <Text style={s.sourceText}>{label}</Text>
        <Ionicons name="open-outline" size={13} color="#557368" />
      </Pressable>
      {failed && <Text style={s.small}>{language === "hi" ? "लिंक नहीं खुला।" : "Unable to open link."} {url}</Text>}
    </View>
  );
}
export const DistrictWeatherCard = memo(function DistrictWeatherCard({
  district,
  hi,
}: {
  district: DistrictProfile;
  hi: boolean;
}) {
  const { t } = usePortal();
  const [weather, setWeather] = useState<DistrictWeather>();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const refresh = () => {
    setLoading(true);
    setError(false);
    setWeather(undefined);
    setAttempt((value) => value + 1);
  };
  useEffect(() => {
    let active = true;
    void getDistrictWeather(district, attempt > 0)
      .then((data) => {
        if (active) setWeather(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [district, attempt]);
  const displayDate = (date: string) =>
    new Date(date + "T12:00:00+05:30").toLocaleDateString(
      hi ? "hi-IN" : "en-IN",
      { weekday: "short", day: "numeric", timeZone: "Asia/Kolkata" },
    );
  return (
    <View style={[s.card, { backgroundColor: "#EDF6FC", borderColor: "#B4D5E9", borderTopColor: "#3E8798" }]}>
      <View style={s.row}>
        <Ionicons name="partly-sunny-outline" size={24} color="#3E8798" />
        <Text style={s.title}>
          {hi ? "मौसम की जानकारी" : "Weather outlook"}
        </Text>
        <Pressable
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={hi ? "मौसम फिर लोड करें" : "Refresh weather"}
          onPress={refresh}
          style={s.refresh}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#24745B" />
          ) : (
            <Ionicons name="refresh" size={19} color="#24745B" />
          )}
        </Pressable>
      </View>
      <Text style={s.small}>
        {hi ? "इस जगह का मौसम" : "Weather location"}:{" "}
        {district.place ? t(district.place.name) : (hi ? "उपलब्ध नहीं" : "Unavailable")}
      </Text>
      {loading ? (
        <View style={s.loading}>
          <Text style={s.small}>
            {hi
              ? "मौसम की ताजा जानकारी आ रही है…"
              : "Loading the latest forecast…"}
          </Text>
        </View>
      ) : error ? (
        <View style={s.loading}>
          <Text style={s.body}>
            {hi
              ? "अभी मौसम नहीं मिल पाया। थोड़ी देर बाद फिर कोशिश करें।"
              : "Weather is unavailable. District information is still available."}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={refresh}
            style={s.retry}
          >
            <Text style={s.link}>{hi ? "फिर कोशिश करें" : "Try again"}</Text>
          </Pressable>
        </View>
      ) : (
        weather && (
          <>
            <View style={s.weatherHero}>
              <View>
                <Text style={s.temperature}>
                  {Math.round(weather.current.temperature_2m)}°
                  <Text style={s.celsius}>C</Text>
                </Text>
                <Text style={s.small}>
                  {hi ? "अभी का अनुमानित मौसम" : "Estimated weather now"}
                </Text>
              </View>
              <View style={s.weatherMeta}>
                <Text style={s.body}>
                  {hi ? "हवा की नमी" : "Air humidity"} ·{" "}
                  {weather.current.relative_humidity_2m}%
                </Text>
                <Text style={s.body}>
                  {hi ? "हवा" : "Wind"} · {weather.current.wind_speed_10m} {hi ? "किमी/घंटा" : "km/h"}
                </Text>
              </View>
            </View>
            <View style={s.forecast}>
              {weather.daily.time.map((date, i) => (
                <View style={s.day} key={date}>
                  <Text style={s.dayTitle}>{displayDate(date)}</Text>
                  <Ionicons
                    name={
                      weather.daily.precipitation_probability_max[i] >= 50
                        ? "rainy-outline"
                        : "partly-sunny-outline"
                    }
                    size={25}
                    color="#427C89"
                  />
                  <Text style={s.dayTemp}>
                    {Math.round(weather.daily.temperature_2m_max[i])}° /{" "}
                    {Math.round(weather.daily.temperature_2m_min[i])}°
                  </Text>
                  <Text style={s.rain}>
                    {weather.daily.precipitation_probability_max[i]}% ·{" "}
                    {weather.daily.precipitation_sum[i]} {hi ? "मिमी" : "mm"}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={s.small}>
              {hi
                ? "वर्षा की संभावना · अनुमानित वर्षा मात्रा"
                : "Chance of rain · expected rainfall"}
            </Text>
            <Text style={s.small}>
              {hi ? "मौसम समय" : "Weather time"}:{" "}
              {weather.current.time.replace("T", " · ")} {hi ? "भारतीय समय" : "IST"}
            </Text>
          </>
        )
      )}
      <SourceLink
        url="https://open-meteo.com/"
        label="Open-Meteo · CC BY 4.0"
      />
      <View style={s.advice}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#235D3A" />
        <View style={{ flex: 1 }}>
          <Text style={s.adviceTitle}>
            {hi ? "मौसम के हिसाब से खेती की सलाह" : "Official farming advisory"}
          </Text>
          <Text style={s.small}>
            {hi
              ? "बुवाई, पानी देने या छिड़काव से पहले अपने जिले की ताजा मौसम सलाह पढ़ें।"
              : "Check your district’s latest bulletin before sowing, irrigation or spraying."}
          </Text>
          <SourceLink
            url={advisorySource}
            label={
              hi ? "मौसम विभाग की सलाह पढ़ें" : "Open IMD district bulletins"
            }
          />
        </View>
      </View>
    </View>
  );
});
export const DistrictAgricultureCards = memo(function DistrictAgricultureCards({
  district,
  hi,
}: {
  district: DistrictProfile;
  hi: boolean;
}) {
  return (
    <>
      {district.regionIds.map((regionId) => {
        const region = regions[regionId];
        return (
          <View key={regionId} style={[s.card, { backgroundColor: "#F1F8EA", borderColor: "#BCD6AA", borderTopColor: "#578449" }]}>
            <View style={s.row}>
              <Ionicons name="leaf-outline" size={22} color="#235D3A" />
              <Text style={s.title}>
                {hi ? "यहां कौन-सी फसलें होती हैं?" : "Crops grown in this area"}
              </Text>
            </View>
            <Text style={s.regionName}>{hi ? region.hi : region.en}</Text>
            <Text style={s.small}>
              {hi
                ? "इस कृषि क्षेत्र में आम तौर पर उगाई जाने वाली फसलें"
                : "Common crops across this farming region"}
            </Text>
            <View style={s.chips}>
              {(hi ? region.cropsHi : region.cropsEn).map((crop) => (
                <View key={crop} style={s.chip}>
                  <Text style={s.chipText}>{crop}</Text>
                </View>
              ))}
            </View>
            <Text style={s.body}>
              {hi ? region.summaryHi : region.summaryEn}
            </Text>
            <View style={s.soil}>
              <Ionicons name="layers-outline" size={22} color="#8A6943" />
              <View style={{ flex: 1 }}>
                <Text style={s.adviceTitle}>
                  {hi ? "क्षेत्र की मिट्टी" : "Soil in this area"}
                </Text>
                <Text style={s.body}>{hi ? region.soilHi : region.soilEn}</Text>
              </View>
            </View>
            <SourceLink
              url={agricultureSource}
              label={
                hi
                  ? "स्रोत: ICAR-IGFRI 2024 · तालिका 1 और 5"
                  : "Source: ICAR-IGFRI 2024 · Tables 1 & 5"
              }
            />
          </View>
        );
      })}
      <View style={s.card}>
        <View style={s.row}>
          <Ionicons name="library-outline" size={22} color="#235D3A" />
          <Text style={s.title}>
            {hi ? "जानकारी के स्रोत और स्थानीय मदद" : "Sources & local help"}
          </Text>
        </View>
        <Text style={s.body}>
          {hi
            ? "यह जानकारी पूरे कृषि क्षेत्र की है। कांकेर और रायगढ़ दो कृषि क्षेत्रों में आते हैं, इसलिए दोनों की जानकारी दी गई है। अपने खेत की मिट्टी और पानी के अनुसार सलाह के लिए नजदीकी कृषि विज्ञान केंद्र से बात करें।"
            : "Regional boundaries do not always follow district borders. Kanker and Raigarh include two regional references. Consult your KVK for local advice."}
        </Text>
        <SourceLink
          url={zoneSource}
          label={
            hi
              ? "IGKV · क्षेत्र और कृषि विज्ञान केंद्र"
              : "IGKV · Regions & KVK knowledge centres"
          }
        />
        <SourceLink
          url={directorySource}
          label={
            hi
              ? "सरकारी निर्देशिका · सभी 33 जिले"
              : "Government directory · all 33 districts"
          }
        />
      </View>
    </>
  );
});
const s = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderTopWidth: 4,
    borderColor: "#E3E8DD",
    padding: 16,
    gap: 10,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  title: { flex: 1, color: "#233A2D", fontSize: 16, fontWeight: "700" },
  refresh: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  small: { fontSize: 14, lineHeight: 24, color: "#617467" },
  body: { fontSize: 16, lineHeight: 24, color: "#344D3E" },
  source: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingVertical: 6,
  },
  sourceText: {
    flexShrink: 1,
    color: "#557368",
    fontSize: 14,
    lineHeight: 24,
    textDecorationLine: "underline",
  },
  loading: { minHeight: 100, justifyContent: "center", gap: 8 },
  retry: { alignSelf: "flex-start", paddingVertical: 10, paddingHorizontal: 4 },
  link: { fontWeight: "700", color: "#235D3A" },
  weatherHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    paddingVertical: 4,
  },
  temperature: { fontSize: 44, fontWeight: "700", color: "#174B3C" },
  celsius: { fontSize: 23, fontWeight: "500" },
  weatherMeta: { gap: 5 },
  forecast: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  day: {
    flexGrow: 1,
    flexBasis: "28%",
    minWidth: 85,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 3,
    borderRadius: 12,
    gap: 8,
  },
  dayTitle: { fontSize: 14, color: "#627366" },
  dayTemp: { fontSize: 16, fontWeight: "700", color: "#263E2F" },
  rain: { fontSize: 14, color: "#3E7182" },
  advice: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFF8E8",
  },
  adviceTitle: {
    fontSize: 16,
    color: "#294A37",
    fontWeight: "700",
    marginBottom: 3,
  },
  regionName: { color: "#587365", fontSize: 14, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EAF2E5",
  },
  chipText: { fontSize: 16, color: "#315D40", fontWeight: "600" },
  soil: {
    backgroundColor: "#F6F2E7",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
