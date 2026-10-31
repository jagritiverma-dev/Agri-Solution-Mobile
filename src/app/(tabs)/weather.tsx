import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { usePortal } from "../../hooks/PortalProvider";
import { useResource } from "../../hooks/useResource";
import { conditions, getWeather } from "../../services/weather";
import { Place } from "../../types";

type Localized = {
  en: string;
  hi: string;
};

type Soil = {
  id: string;
  name: Localized;
  localName: Localized;
  description: Localized;
  characteristics: Localized;
  water: Localized;
  crops: Localized;
  advice: Localized;
  image: ImageSourcePropType;
  color: string;
};

const palette = {
  green: "#08664C",
  deep: "#104334",
  mint: "#E6F4EA",
  background: "#F7F8F2",
  white: "#FFFFFF",
  muted: "#62756B",
  border: "#E1E9DF",
  blue: "#347CB5",
  yellow: "#F4B63E",
  brown: "#8A5C39",
  cream: "#FFF4DF",
};

const raipur: Place = {
  name: "Raipur",
  latitude: 21.2506,
  longitude: 81.6348,
};

const districts: Place[] = [
  raipur,
  { name: "Bilaspur", latitude: 22.0797, longitude: 82.1391 },
  { name: "Durg", latitude: 21.1904, longitude: 81.2849 },
  { name: "Bhilai", latitude: 21.1938, longitude: 81.3509 },
  { name: "Rajnandgaon", latitude: 21.0974, longitude: 81.0337 },
  { name: "Jagdalpur", latitude: 19.0748, longitude: 82.008 },
  { name: "Ambikapur", latitude: 23.1189, longitude: 83.1954 },
  { name: "Korba", latitude: 22.3595, longitude: 82.7501 },
  { name: "Raigarh", latitude: 21.8974, longitude: 83.395 },
  { name: "Dhamtari", latitude: 20.7072, longitude: 81.5497 },
  { name: "Mahasamund", latitude: 21.1109, longitude: 82.094 },
  { name: "Kanker", latitude: 20.2719, longitude: 81.4918 },
  { name: "Kabirdham", latitude: 22.0085, longitude: 81.2318 },
  { name: "Jashpur", latitude: 22.8876, longitude: 84.1386 },
  { name: "Bijapur", latitude: 18.797, longitude: 80.813 },
];

const soils: Soil[] = [
  {
    id: "kanhar",
    name: { en: "Deep Black Soil", hi: "गहरी काली मिट्टी" },
    localName: { en: "Kanhar", hi: "कन्हार" },
    description: {
      en: "Kanhar is a deep, dark, clay-rich soil found in parts of Chhattisgarh's plains. It is known for retaining moisture and supporting agriculture when drainage and water management are appropriate.",
      hi: "कन्हार गहरी, काली और चिकनी मिट्टी है, जो छत्तीसगढ़ के मैदानी इलाकों में मिलती है। इसमें नमी देर तक रहती है। खेती के लिए पानी देने और निकालने, दोनों की व्यवस्था रखें।",
    },
    characteristics: {
      en: "Deep, heavy, clay-rich and often sticky when wet.",
      hi: "गहरी, भारी और चिकनी मिट्टी, जो गीली होने पर चिपचिपी हो सकती है।",
    },
    water: {
      en: "High moisture retention; waterlogging can occur without drainage.",
      hi: "पानी रोकने की क्षमता अधिक; जल निकास खराब होने पर जलभराव हो सकता है।",
    },
    crops: {
      en: "Paddy, wheat, gram and other locally suitable crops.",
      hi: "धान, गेहूं, चना और अन्य स्थानीय रूप से उपयुक्त फसलें।",
    },
    advice: {
      en: "Avoid working the soil when excessively wet. Improve drainage and use soil-test results to plan nutrients.",
      hi: "मिट्टी बहुत गीली हो तो जुताई न करें। पानी निकलने का रास्ता रखें और मिट्टी की जांच के अनुसार खाद दें।",
    },
    image: require("../../../assets/crops/1.jpg"),
    color: "#5A463D",
  },
  {
    id: "dorsa",
    name: { en: "Medium Soil", hi: "मध्यम मिट्टी" },
    localName: { en: "Dorsa", hi: "डोरसा" },
    description: {
      en: "Dorsa is a medium-textured agricultural soil found in Chhattisgarh. Its moisture-holding capacity is generally between heavy Kanhar and lighter Matasi soils.",
      hi: "डोरसा न बहुत भारी होती है, न बहुत हल्की। इसमें कन्हार से कम और मटासी से ज्यादा नमी रहती है। खेत की नमी देखकर सिंचाई का समय तय करें।",
    },
    characteristics: {
      en: "Medium texture with a mixture of finer and coarser soil particles.",
      hi: "मध्यम बनावट, जिसमें बारीक और अपेक्षाकृत मोटे मिट्टी कण पाए जाते हैं।",
    },
    water: {
      en: "Moderate moisture retention; drainage varies by field.",
      hi: "नमी रोकने की मध्यम क्षमता; जल निकास खेत की स्थिति पर निर्भर करता है।",
    },
    crops: {
      en: "Paddy, pulses, oilseeds and suitable seasonal crops.",
      hi: "धान, दलहन, तिलहन और उपयुक्त मौसमी फसलें।",
    },
    advice: {
      en: "Maintain organic matter, monitor moisture and select crops according to rainfall and irrigation availability.",
      hi: "जैविक पदार्थ बनाए रखें, नमी की जांच करें और वर्षा तथा सिंचाई की उपलब्धता के अनुसार फसल चुनें।",
    },
    image: require("../../../assets/crops/2.jpg"),
    color: "#956B45",
  },
  {
    id: "matasi",
    name: { en: "Light Sandy-Loamy Soil", hi: "हल्की बलुई-दोमट मिट्टी" },
    localName: { en: "Matasi", hi: "मटासी" },
    description: {
      en: "Matasi is a relatively light soil common in parts of Chhattisgarh. It is generally easier to cultivate than heavy clay soil but can lose moisture more quickly.",
      hi: "मटासी हल्की मिट्टी है। चिकनी मिट्टी के मुकाबले इसकी जुताई आसान होती है, लेकिन यह जल्दी सूख सकती है। इसलिए खेत की नमी पर ध्यान रखें।",
    },
    characteristics: {
      en: "Light to medium texture, often with a higher proportion of sand.",
      hi: "हल्की से मध्यम बनावट, जिसमें रेत का अनुपात अपेक्षाकृत अधिक हो सकता है।",
    },
    water: {
      en: "Lower moisture retention than heavy soils; may require closer irrigation monitoring.",
      hi: "भारी मिट्टी की तुलना में नमी रोकने की क्षमता कम; सिंचाई की अधिक निगरानी आवश्यक हो सकती है।",
    },
    crops: {
      en: "Maize, pulses, millets and other crops suited to local rainfall.",
      hi: "मक्का, दलहन, मोटे अनाज और स्थानीय वर्षा के अनुसार उपयुक्त फसलें।",
    },
    advice: {
      en: "Use mulch and organic matter where appropriate to conserve moisture. Avoid unnecessary irrigation losses.",
      hi: "नमी बचाने के लिए जरूरत के अनुसार सूखी घास या फसल के अवशेष से मिट्टी ढकें और जैविक खाद मिलाएं। सिंचाई का पानी व्यर्थ न बहने दें।",
    },
    image: require("../../../assets/crops/3.jpg"),
    color: "#B37B46",
  },
  {
    id: "bhata",
    name: { en: "Upland Lateritic Soil", hi: "ऊंची भूमि की मिट्टी" },
    localName: { en: "Bhata", hi: "भाटा" },
    description: {
      en: "Bhata generally refers to shallow, coarse upland soil in Chhattisgarh. Such land may have lower fertility and limited moisture storage, so crop selection requires care.",
      hi: "भाटा ऊंची जमीन की उथली, मोटे कणों वाली मिट्टी है। इसमें पानी कम टिकता है और उपजाऊपन भी कम हो सकता है। फसल चुनते समय इन बातों का ध्यान रखें।",
    },
    characteristics: {
      en: "Shallow, coarse and sometimes gravelly upland soil.",
      hi: "उथली, मोटे कणों वाली और कहीं-कहीं कंकरीली ऊंची भूमि की मिट्टी।",
    },
    water: {
      en: "Low moisture retention; runoff can be significant on slopes.",
      hi: "नमी रोकने की क्षमता कम; ढलान पर पानी का बहाव अधिक हो सकता है।",
    },
    crops: {
      en: "Millets, selected pulses and other drought-tolerant crops where locally recommended.",
      hi: "मोटे अनाज, कुछ दलहनी फसलें और स्थानीय सलाह के अनुसार सूखा सहन करने वाली फसलें।",
    },
    advice: {
      en: "Consider contour measures, mulching and soil organic matter improvement. Choose varieties recommended for upland conditions.",
      hi: "ढलान पर जल संरक्षण, मल्चिंग और जैविक पदार्थ बढ़ाने के उपाय अपनाएं। ऊंची भूमि के लिए अनुशंसित किस्में चुनें।",
    },
    image: require("../../../assets/crops/bhata.jpg"),
    color: "#A45B38",
  },
  {
    id: "tikra",
    name: { en: "Upland Light Soil", hi: "ऊंची भूमि की हल्की मिट्टी" },
    localName: { en: "Tikra", hi: "टिकरा" },
    description: {
      en: "Tikra is a local upland soil or land classification used in parts of Chhattisgarh. It is often associated with lighter, relatively shallow soils where rainfall management is important.",
      hi: "छत्तीसगढ़ के कुछ इलाकों में ऊंची जमीन को टिकरा कहते हैं। यहां मिट्टी हल्की और कम गहरी हो सकती है। बारिश का पानी खेत में बचाए रखना जरूरी है।",
    },
    characteristics: {
      en: "Relatively shallow upland soil; texture and fertility vary by location.",
      hi: "अपेक्षाकृत उथली ऊंची भूमि की मिट्टी; बनावट और उर्वरता स्थान के अनुसार बदलती है।",
    },
    water: {
      en: "May dry quickly after rainfall, depending on soil depth and slope.",
      hi: "मिट्टी की गहराई और ढलान के अनुसार वर्षा के बाद जल्दी सूख सकती है।",
    },
    crops: {
      en: "Millets, pulses and locally recommended rainfed crops.",
      hi: "मोटे अनाज, दलहन और स्थानीय रूप से अनुशंसित वर्षा आधारित फसलें।",
    },
    advice: {
      en: "Prioritize moisture conservation, suitable sowing dates and crop varieties matched to the field's conditions.",
      hi: "खेत की नमी बचाएं, सही समय पर बुवाई करें और अपनी जमीन के लिए सुझाई गई किस्म चुनें।",
    },
    image: require("../../../assets/crops/tikra.jpg"),
    color: "#C18C53",
  },
];

function weatherIcon(code: number): keyof typeof Ionicons.glyphMap {
  if (code === 0) return "sunny";
  if (code <= 3) return "partly-sunny";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snow";
  if (code <= 82) return "rainy";
  if (code >= 95) return "thunderstorm";
  return "cloud-outline";
}

function hindiCondition(code: number): string {
  if (code === 0) return "साफ मौसम";
  if (code <= 3) return "आंशिक बादल";
  if (code <= 48) return "बादल या कोहरा";
  if (code <= 67) return "बारिश";
  if (code <= 77) return "बर्फीला मौसम";
  if (code <= 82) return "बारिश";
  if (code >= 95) return "आंधी-तूफान";
  return "मौसम";
}

function dayLabel(date: string, hindi: boolean): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    hindi ? "hi-IN" : "en-IN",
    { weekday: "short", day: "numeric", month: "short" }
  );
}

function SoilDetail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.soilDetail}>
      <View style={styles.soilDetailIcon}>
        <Ionicons name={icon} size={17} color={palette.green} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.soilDetailLabel}>{label}</Text>
        <Text style={styles.soilDetailValue}>{value}</Text>
      </View>
    </View>
  );
}

function SoilCard({
  soil,
  hindi,
}: {
  soil: Soil;
  hindi: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const lang = hindi ? "hi" : "en";

  return (
    <View style={styles.soilCard}>
      <Image source={soil.image} style={styles.soilImage} resizeMode="cover" />

      <View style={styles.soilContent}>
        <View style={styles.soilTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.soilLocalName}>
              {soil.localName[lang]}
            </Text>
            <Text style={styles.soilName}>{soil.name[lang]}</Text>
          </View>
          <View
            style={[
              styles.soilBadge,
              { backgroundColor: `${soil.color}18` },
            ]}
          >
            <Ionicons name="leaf-outline" size={18} color={soil.color} />
          </View>
        </View>

        <Text style={styles.soilDescription}>
          {soil.description[lang]}
        </Text>

        <View style={styles.cropHighlight}>
          <Ionicons name="nutrition-outline" size={19} color={palette.green} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cropHighlightLabel}>
              {hindi ? "उपयुक्त फसलें" : "Suitable crops"}
            </Text>
            <Text style={styles.cropHighlightText}>
              {soil.crops[lang]}
            </Text>
          </View>
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            <SoilDetail
              icon="layers-outline"
              label={hindi ? "मिट्टी की विशेषताएं" : "Soil characteristics"}
              value={soil.characteristics[lang]}
            />
            <SoilDetail
              icon="water-outline"
              label={hindi ? "पानी रोकने की क्षमता" : "Water retention"}
              value={soil.water[lang]}
            />
            <SoilDetail
              icon="bulb-outline"
              label={hindi ? "खेती के लिए सुझाव" : "Farming guidance"}
              value={soil.advice[lang]}
            />
          </View>
        )}

        <Pressable
          style={styles.readMore}
          onPress={() => setExpanded((value) => !value)}
        >
          <Text style={styles.readMoreText}>
            {expanded
              ? hindi
                ? "कम दिखाएं"
                : "Show less"
              : hindi
              ? "पूरी जानकारी देखें"
              : "View full details"}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "arrow-forward"}
            size={18}
            color={palette.green}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function WeatherScreen() {
  const { language, t } = usePortal();
  const hindi = language === "hi";

  const [place, setPlace] = useState<Place>(raipur);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [soilFilter, setSoilFilter] = useState("all");

  const weather = useResource(
    useCallback(() => getWeather(place), [place])
  );

  const data = weather.data;
  const current = data?.current;
  const daily = data?.daily;

  const currentHour = data
    ? Math.max(
        0,
        data.hourly.time.findIndex(
          (time) => time.slice(0, 13) === data.current.time.slice(0, 13)
        )
      )
    : 0;

  const selectedSoils = useMemo(
    () =>
      soilFilter === "all"
        ? soils
        : soils.filter((soil) => soil.id === soilFilter),
    [soilFilter]
  );

  async function locate() {
    setLocating(true);
    setLocationError("");

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        throw new Error(
          hindi
            ? "लोकेशन की अनुमति नहीं मिली। कृपया शहर चुनें।"
            : "Location permission declined. Please choose a city."
        );
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setPlace({
        name: "My location",
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });

      setLocationsOpen(false);
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : hindi
          ? "लोकेशन उपलब्ध नहीं है।"
          : "Location unavailable."
      );
    } finally {
      setLocating(false);
    }
  }

  const rainChance = daily?.precipitation_probability_max?.[0];
  const rain =
    typeof rainChance === "number" ? rainChance : null;

  const advisory = useMemo(() => {
    if (!current) return null;

    if (current.weather_code >= 95) {
      return {
        title: hindi ? "आंधी-तूफान की चेतावनी" : "Storm precautions",
        message: hindi
          ? "आंधी-तूफान के समय खुले खेत में काम न करें। मौसम ठीक होने तक छिड़काव रोकें।"
          : "Avoid open-field work during thunderstorms and postpone spraying.",
        icon: "thunderstorm-outline" as const,
      };
    }

    if (rain !== null && rain >= 70) {
      return {
        title: hindi ? "बारिश की संभावना" : "Rain likely",
        message: hindi
          ? "सिंचाई से पहले खेत की नमी जांचें। बारिश के समय छिड़काव से बचें।"
          : "Check soil moisture before irrigation and avoid spraying during rain.",
        icon: "rainy-outline" as const,
      };
    }

    if (current.wind_speed_10m >= 25) {
      return {
        title: hindi ? "तेज हवा" : "Strong winds",
        message: hindi
          ? "तेज हवा में कीटनाशक छिड़काव से बचें।"
          : "Avoid pesticide spraying in strong winds to reduce spray drift.",
        icon: "flag-outline" as const,
      };
    }

    if (current.temperature_2m >= 38) {
      return {
        title: hindi ? "अधिक गर्मी" : "High temperature",
        message: hindi
          ? "फसल और मिट्टी की नमी की नियमित जांच करें।"
          : "Monitor crop and soil moisture regularly during hot weather.",
        icon: "sunny-outline" as const,
      };
    }

    return {
      title: hindi ? "आज की खेती की सलाह" : "Today's farming guidance",
      message: hindi
        ? "सिंचाई और छिड़काव से पहले खेत की स्थिति और मौसम जांचें।"
        : "Review field conditions and weather before irrigation or spraying.",
      icon: "leaf-outline" as const,
    };
  }, [current, rain, hindi]);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      refreshControl={
        <RefreshControl
          refreshing={weather.loading}
          onRefresh={weather.refresh}
          colors={[palette.green]}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="partly-sunny" size={29} color={palette.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>
            {hindi ? "मौसम और मिट्टी" : "Weather & Soil"}
          </Text>
          <Text style={styles.pageSubtitle}>
            {hindi
              ? "मौसम की जानकारी और मिट्टी का मार्गदर्शन"
              : "Local forecasts and soil knowledge"}
          </Text>
        </View>
      </View>

      <View style={styles.locationCard}>
        <Text style={styles.inputLabel}>
          {hindi ? "स्थान चुनें" : "Choose location"}
        </Text>

        <Pressable
          style={styles.locationSelector}
          onPress={() => setLocationsOpen((value) => !value)}
        >
          <Ionicons name="location-outline" size={21} color={palette.green} />
          <Text style={styles.selectedLocation}>{t(place.name)}</Text>
          <Ionicons
            name={locationsOpen ? "chevron-up" : "chevron-down"}
            size={19}
            color={palette.muted}
          />
        </Pressable>

        {locationsOpen && (
          <View style={styles.locationOptions}>
            {districts.map((item) => (
              <Pressable
                key={item.name}
                style={styles.locationOption}
                onPress={() => {
                  setPlace(item);
                  setLocationsOpen(false);
                  setLocationError("");
                }}
              >
                <Text style={styles.locationOptionText}>{t(item.name)}</Text>
                {place.name === item.name && (
                  <Ionicons
                    name="checkmark-circle"
                    size={19}
                    color={palette.green}
                  />
                )}
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          style={styles.gpsAction}
          onPress={locate}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator size="small" color={palette.green} />
          ) : (
            <Ionicons name="navigate-outline" size={18} color={palette.green} />
          )}
          <Text style={styles.gpsActionText}>
            {locating
              ? hindi
                ? "स्थान खोज रहे हैं..."
                : "Finding your location..."
              : hindi
              ? "मेरी वर्तमान लोकेशन"
              : "Use my current location"}
          </Text>
        </Pressable>
      </View>

      {(locationError || weather.error) && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={21} color="#AE4936" />
          <Text style={styles.errorText}>
            {t(locationError || weather.error)}
          </Text>
          <Pressable onPress={weather.refresh}>
            <Text style={styles.retryText}>
              {hindi ? "पुनः प्रयास" : "Retry"}
            </Text>
          </Pressable>
        </View>
      )}

      {weather.loading && !data && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={palette.green} />
          <Text style={styles.loadingText}>
            {hindi ? "मौसम की जानकारी आ रही है..." : "Loading weather..."}
          </Text>
        </View>
      )}

      {current && (
        <>
          <View style={styles.weatherCard}>
            <View style={styles.weatherTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.weatherLocation}>{t(place.name)}</Text>
                <Text style={styles.weatherCaption}>
                  {hindi ? "वर्तमान मौसम" : "Current weather"}
                </Text>
              </View>
              <Ionicons
                name={weatherIcon(current.weather_code)}
                size={62}
                color="#FFDA78"
              />
            </View>

            <Text style={styles.mainTemperature}>
              {Math.round(current.temperature_2m)}°C
            </Text>
            <Text style={styles.weatherCondition}>
              {hindi
                ? hindiCondition(current.weather_code)
                : conditions(current.weather_code)}
            </Text>
            <Text style={styles.feelsLike}>
              {hindi ? "महसूस होता है" : "Feels like"}{" "}
              {Math.round(current.apparent_temperature)}°C
            </Text>

            <View style={styles.weatherLine} />

            <View style={styles.weatherMetrics}>
              <View style={styles.weatherMetric}>
                <Ionicons name="water-outline" size={22} color="#D9F3E5" />
                <Text style={styles.weatherMetricValue}>
                  {current.relative_humidity_2m}%
                </Text>
                <Text style={styles.weatherMetricLabel}>
                  {hindi ? "नमी" : "Humidity"}
                </Text>
              </View>
              <View style={styles.weatherMetric}>
                <Ionicons name="flag-outline" size={22} color="#D9F3E5" />
                <Text style={styles.weatherMetricValue}>
                  {current.wind_speed_10m}
                </Text>
                <Text style={styles.weatherMetricLabel}>
                  {hindi ? "हवा किमी/घंटा" : "Wind km/h"}
                </Text>
              </View>
              <View style={styles.weatherMetric}>
                <Ionicons name="rainy-outline" size={22} color="#D9F3E5" />
                <Text style={styles.weatherMetricValue}>
                  {rain === null ? "—" : `${rain}%`}
                </Text>
                <Text style={styles.weatherMetricLabel}>
                  {hindi ? "बारिश की संभावना" : "Rain chance"}
                </Text>
              </View>
            </View>
          </View>

          {advisory && (
            <View style={styles.advisoryCard}>
              <View style={styles.advisoryIcon}>
                <Ionicons name={advisory.icon} size={26} color={palette.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.advisoryTitle}>{advisory.title}</Text>
                <Text style={styles.advisoryMessage}>{advisory.message}</Text>
              </View>
            </View>
          )}

          <View style={styles.sectionHeading}>
            <Ionicons name="calendar-outline" size={23} color={palette.green} />
            <Text style={styles.sectionTitle}>
              {hindi ? "अगले 7 दिनों का मौसम" : "7-Day Weather Forecast"}
            </Text>
          </View>

          <View style={styles.forecastCard}>
            {daily?.time.map((date, index) => (
              <View key={date} style={styles.forecastRow}>
                <Text style={styles.forecastDay}>
                  {dayLabel(date, hindi)}
                </Text>
                <Ionicons
                  name={weatherIcon(daily.weather_code[index])}
                  size={25}
                  color={
                    daily.weather_code[index] >= 51
                      ? palette.blue
                      : palette.yellow
                  }
                />
                <View style={styles.forecastTemps}>
                  <Text style={styles.forecastHigh}>
                    {Math.round(daily.temperature_2m_max[index])}°
                  </Text>
                  <Text style={styles.forecastLow}>
                    {Math.round(daily.temperature_2m_min[index])}°
                  </Text>
                </View>
                <View style={styles.forecastRain}>
                  <Ionicons name="water" size={14} color={palette.blue} />
                  <Text style={styles.forecastRainText}>
                    {daily.precipitation_probability_max[index] ?? "—"}%
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeading}>
            <Ionicons name="analytics-outline" size={23} color={palette.green} />
            <Text style={styles.sectionTitle}>
              {hindi ? "मिट्टी की वर्तमान स्थिति" : "Current Soil Conditions"}
            </Text>
          </View>

          <View style={styles.soilMetrics}>
            <View style={styles.soilMetricCard}>
              <Ionicons name="water-outline" size={26} color={palette.blue} />
              <Text style={styles.soilMetricValue}>
                {data?.hourly.soil_moisture_0_to_1cm[currentHour] == null
                  ? "—"
                  : `${data.hourly.soil_moisture_0_to_1cm[currentHour]} m³/m³`}
              </Text>
              <Text style={styles.soilMetricLabel}>
                {hindi ? "ऊपरी मिट्टी की नमी" : "Topsoil moisture"}
              </Text>
            </View>
            <View style={styles.soilMetricCard}>
              <Ionicons name="thermometer-outline" size={26} color="#C77B38" />
              <Text style={styles.soilMetricValue}>
                {data?.hourly.soil_temperature_0cm[currentHour] == null
                  ? "—"
                  : `${data.hourly.soil_temperature_0cm[currentHour]}°C`}
              </Text>
              <Text style={styles.soilMetricLabel}>
                {hindi ? "मिट्टी का तापमान" : "Soil temperature"}
              </Text>
            </View>
          </View>

          <Text style={styles.modelNote}>
            {hindi
              ? "ये मिट्टी के आंकड़े मौसम मॉडल के अनुमान हैं, खेत की वास्तविक जांच नहीं।"
              : "Soil readings are weather-model estimates, not actual field measurements."}
          </Text>
        </>
      )}

      <View style={styles.soilSectionHeader}>
        <View style={styles.soilSectionIcon}>
          <Ionicons name="earth-outline" size={26} color={palette.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.soilSectionTitle}>
            {hindi ? "छत्तीसगढ़ की प्रमुख मिट्टियां" : "Major Soils of Chhattisgarh"}
          </Text>
          <Text style={styles.soilSectionSubtitle}>
            {hindi
              ? "मिट्टी पहचानें और उपयुक्त फसल चुनें"
              : "Explore soil characteristics and suitable crops"}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.soilFilters}
      >
        <Pressable
          style={[
            styles.soilFilter,
            soilFilter === "all" && styles.soilFilterActive,
          ]}
          onPress={() => setSoilFilter("all")}
        >
          <Text
            style={[
              styles.soilFilterText,
              soilFilter === "all" && styles.soilFilterTextActive,
            ]}
          >
            {hindi ? "सभी मिट्टियां" : "All soils"}
          </Text>
        </Pressable>

        {soils.map((soil) => (
          <Pressable
            key={soil.id}
            style={[
              styles.soilFilter,
              soilFilter === soil.id && styles.soilFilterActive,
            ]}
            onPress={() => setSoilFilter(soil.id)}
          >
            <Text
              style={[
                styles.soilFilterText,
                soilFilter === soil.id && styles.soilFilterTextActive,
              ]}
            >
              {soil.localName[hindi ? "hi" : "en"]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {selectedSoils.map((soil) => (
        <SoilCard key={soil.id} soil={soil} hindi={hindi} />
      ))}

      <View style={styles.footerNotice}>
        <Ionicons
          name="information-circle-outline"
          size={24}
          color={palette.green}
        />
        <Text style={styles.footerNoticeText}>
          {hindi
            ? "मौसम का स्रोत Open-Meteo है। मिट्टी का प्रकार, पोषक तत्व और खाद की आवश्यकता जानने के लिए मिट्टी परीक्षण कराएं तथा स्थानीय कृषि विभाग या कृषि विज्ञान केंद्र से सलाह लें।"
            : "Weather data is provided by Open-Meteo. For soil identification, nutrient requirements and fertilizer planning, obtain a soil test and consult your local agriculture department or Krishi Vigyan Kendra."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.background,
  },
  pageContent: {
    padding: 16,
    paddingBottom: 45,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 21,
  },
  headerIcon: {
    width: 57,
    height: 57,
    borderRadius: 17,
    backgroundColor: "#E5F2E7",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.deep,
  },
  pageSubtitle: {
    fontSize: 16,
    color: palette.muted,
    marginTop: 5,
  },
  locationCard: {
    backgroundColor: palette.white,
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.deep,
    marginBottom: 11,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#F3F7F2",
    borderRadius: 13,
    padding: 14,
  },
  selectedLocation: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: palette.deep,
  },
  locationOptions: {
    marginTop: 10,
  },
  locationOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  locationOptionText: {
    fontSize: 16,
    color: palette.deep,
  },
  gpsAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  gpsActionText: {
    color: palette.green,
    fontSize: 16,
    fontWeight: "800",
  },
  errorCard: {
    backgroundColor: "#FFF0E9",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 18,
  },
  errorText: {
    fontSize: 16,
    color: "#A84534",
    flexShrink: 1,
  },
  retryText: {
    color: palette.green,
    fontWeight: "800",
  },
  loadingCard: {
    padding: 35,
    alignItems: "center",
  },
  loadingText: {
    color: palette.muted,
    marginTop: 12,
  },
  weatherCard: {
    backgroundColor: palette.green,
    borderRadius: 25,
    padding: 23,
    marginBottom: 18,
  },
  weatherTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  weatherCaption: {
    fontSize: 14,
    color: "#C9E8D8",
    marginTop: 6,
  },
  mainTemperature: {
    fontSize: 70,
    fontWeight: "800",
    color: palette.white,
    marginTop: 10,
  },
  weatherCondition: {
    fontSize: 19,
    fontWeight: "800",
    color: palette.white,
  },
  feelsLike: {
    color: "#D5EDE0",
    fontSize: 16,
    marginTop: 8,
  },
  weatherLine: {
    height: 1,
    backgroundColor: "#408F75",
    marginVertical: 22,
  },
  weatherMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weatherMetric: {
    flex: 1,
    alignItems: "center",
    gap: 7,
  },
  weatherMetricValue: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.white,
  },
  weatherMetricLabel: {
    fontSize: 14,
    color: "#D5EDE0",
    textAlign: "center",
  },
  advisoryCard: {
    flexDirection: "row",
    gap: 13,
    padding: 17,
    borderRadius: 18,
    backgroundColor: palette.cream,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#F4E2BB",
  },
  advisoryIcon: {
    width: 46,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  advisoryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#765122",
    marginBottom: 7,
  },
  advisoryMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: "#765F3E",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.deep,
    flex: 1,
  },
  forecastCard: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 19,
    paddingHorizontal: 15,
    marginBottom: 27,
  },
  forecastRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1EB",
  },
  forecastDay: {
    width: 92,
    fontSize: 14,
    fontWeight: "700",
    color: palette.deep,
  },
  forecastTemps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  forecastHigh: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.deep,
  },
  forecastLow: {
    fontSize: 16,
    color: palette.muted,
  },
  forecastRain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    width: 48,
  },
  forecastRainText: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.blue,
  },
  soilMetrics: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  soilMetricCard: {
    flex: 1,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
    padding: 17,
    gap: 9,
  },
  soilMetricValue: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.deep,
  },
  soilMetricLabel: {
    fontSize: 14,
    color: palette.muted,
  },
  modelNote: {
    fontSize: 14,
    lineHeight: 24,
    color: palette.muted,
    marginBottom: 30,
  },
  soilSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  soilSectionIcon: {
    width: 51,
    height: 51,
    borderRadius: 15,
    backgroundColor: palette.mint,
    justifyContent: "center",
    alignItems: "center",
  },
  soilSectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: palette.deep,
  },
  soilSectionSubtitle: {
    fontSize: 14,
    color: palette.muted,
    marginTop: 5,
  },
  soilFilters: {
    gap: 9,
    paddingBottom: 19,
  },
  soilFilter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
  },
  soilFilterActive: {
    backgroundColor: palette.green,
    borderColor: palette.green,
  },
  soilFilterText: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.deep,
  },
  soilFilterTextActive: {
    color: palette.white,
  },
  soilCard: {
    backgroundColor: palette.white,
    borderRadius: 21,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  soilImage: {
    width: "100%",
    height: 185,
    backgroundColor: "#E4E6D9",
  },
  soilContent: {
    padding: 18,
  },
  soilTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 13,
  },
  soilLocalName: {
    fontSize: 21,
    fontWeight: "800",
    color: palette.deep,
  },
  soilName: {
    fontSize: 16,
    color: palette.muted,
    marginTop: 5,
  },
  soilBadge: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  soilDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4C6155",
  },
  cropHighlight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 14,
    borderRadius: 13,
    backgroundColor: palette.mint,
    marginTop: 16,
  },
  cropHighlightLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: palette.green,
    marginBottom: 6,
  },
  cropHighlightText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#426A52",
  },
  expandedContent: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 8,
  },
  soilDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    paddingVertical: 12,
  },
  soilDetailIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: palette.mint,
    justifyContent: "center",
    alignItems: "center",
  },
  soilDetailLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.deep,
    marginBottom: 5,
  },
  soilDetailValue: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.muted,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 14,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.green,
  },
  footerNotice: {
    flexDirection: "row",
    gap: 12,
    padding: 17,
    backgroundColor: palette.mint,
    borderRadius: 17,
    marginTop: 9,
  },
  footerNoticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    color: "#4E6B5A",
  },
});
