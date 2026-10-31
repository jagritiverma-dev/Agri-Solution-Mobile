import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { usePortal } from "../../hooks/PortalProvider";

type Season = "Kharif" | "Rabi";
type Category =
  | "Cereals"
  | "Pulses"
  | "Oilseeds"
  | "Vegetables & Spices"
  | "Other Crops";

type Variety = {
  image?: number;
  name: string;
  description: string;
  type: string;
};

type Crop = {
  id: string;
  name: string;
  hindi: string;
  emoji: string;
  season: Season[];
  category: Category;
  description: string;
  soil?: string;
  water?: string;
  duration?: string;
  seed?: string;
  irrigation?: string;
  fertilizer?: string;
  protection?: string;
  sowing?: string;
  harvest?: string;
};

const GREEN = "#075C45";
const DARK = "#123E30";
const BG = "#F7FAF7";
const LIGHT = "#E9F5EC";
const BORDER = "#E1E9E2";

const cropImages: Record<string, number> = {
  ragi: require("../../../assets/optimized/ragi.jpg"),
  niger: require("../../../assets/optimized/niger.jpg"),
  masoor: require("../../../assets/optimized/masoor.jpg"),
  peas: require("../../../assets/optimized/peas.jpg"),
  mustard: require("../../../assets/optimized/mustard.jpg"),
  linseed: require("../../../assets/optimized/linseed.jpg"),
  paddy: require("../../../assets/optimized/paddy.jpg"),
  maize: require("../../../assets/optimized/maize.jpg"),
  kodo: require("../../../assets/optimized/kodo.jpg"),
  bajra: require("../../../assets/optimized/bajra.jpg"),
  jowar: require("../../../assets/optimized/jowar.jpg"),
  soyabean: require("../../../assets/optimized/soyabean.jpg"),
  groundnut: require("../../../assets/optimized/groundnut.jpg"),
  sesamum: require("../../../assets/optimized/sesamum.jpg"),
  sunflower: require("../../../assets/crops/safflower2.jpg"),
  arhar: require("../../../assets/optimized/arhar.jpg"),
  urad: require("../../../assets/optimized/urad.jpg"),
  moong: require("../../../assets/optimized/moong.jpg"),
  cotton: require("../../../assets/optimized/cotton.jpg"),
  sugarcane: require("../../../assets/optimized/sugarcane.jpg"),
  kulthi: require("../../../assets/optimized/kulthi.jpg"),
  wheat: require("../../../assets/optimized/wheat.jpg"),
  barley: require("../../../assets/optimized/barley.jpg"),
  gram_rabi: require("../../../assets/optimized/gram_rabi.jpg"),
};

const varieties: Record<string, Variety[]> = {
  paddy: [
    {
      name: "MTU-1010",
      image: require("../../../assets/mtu 1010.jpg"),
      type: "Early duration",
      description:
        "Early-duration variety that matures in about 120–135 days and is suitable for timely harvesting.",
    },
    {
      name: "IR-36",
      type: "Early duration",
      description:
        "Popular early rice variety with dependable yield under suitable irrigation and monsoon conditions.",
    },
    {
      name: "Mahamaya",
      type: "Medium duration",
      description:
        "A Chhattisgarh variety suited to local growing conditions and commonly used for grain production.",
    },
    {
      name: "Swarna",
      image: require("../../../assets/crops/swarna-paddy.jpg"),
      type: "Medium duration",
      description:
        "Medium-to-long-duration variety with good grain quality and broad cultivation in the region.",
    },
    {
      name: "Swarna Sub-1",
      type: "Flood tolerant",
      description:
        "Flood-tolerant rice variety that can recover after temporary submergence.",
    },
    {
      name: "PR-113",
      type: "Long duration",
      description:
        "High-yielding variety used where the season and water availability support a longer crop duration.",
    },
    {
      name: "Basmati",
      type: "Premium grain",
      description:
        "A fragrant, long-grain rice type grown where climate, soil and market conditions are suitable.",
    },
  ],
  maize: [
    {
      name: "Hybrid maize",
      type: "Hybrid",
      description:
        "High-yielding hybrid type used for food, feed and industrial purposes.",
    },
    {
      name: "Composite maize",
      type: "Open pollinated",
      description:
        "Open-pollinated type suitable for local cultivation and seed-saving practices.",
    },
  ],
  wheat: [
    {
      name: "HD varieties",
      type: "Improved variety",
      description:
        "Recommended wheat varieties with good grain production in suitable Rabi conditions.",
    },
    {
      name: "Lok-1",
      type: "Improved variety",
      description:
        "A commonly known wheat type suited to timely sowing and moderate irrigation.",
    },
  ],
  soyabean: [
    {
      name: "JS 335",
      type: "Improved variety",
      description:
        "Popular soybean variety with good adaptation and oil-rich grain.",
    },
    {
      name: "JS 9560",
      type: "Improved variety",
      description:
        "Short-to-medium duration type selected for yield and regional suitability.",
    },
  ],
  groundnut: [
    {
      name: "JL 24",
      type: "Short duration",
      description:
        "Short-duration groundnut type with good pod development under well-drained soil.",
    },
    {
      name: "TAG 24",
      type: "Improved variety",
      description:
        "High-performing type suitable for timely sowing and proper moisture management.",
    },
  ],
  arhar: [
    {
      name: "Short-duration arhar",
      type: "Short duration",
      description:
        "Matures earlier and fits well in areas with a shorter Kharif season.",
    },
    {
      name: "Long-duration arhar",
      type: "Long duration",
      description:
        "Needs a longer growing period and can provide a larger harvest under suitable conditions.",
    },
  ],
  cotton: [
    {
      name: "Bt cotton hybrid",
      type: "Hybrid",
      description:
        "Hybrid cotton type selected for boll production and bollworm management as advised locally.",
    },
    {
      name: "Desi cotton",
      type: "Traditional type",
      description:
        "Traditional cotton type known for hardiness and adaptation to local conditions.",
    },
  ],
};

const crops: Crop[] = [
  {
    id: "paddy",
    name: "Paddy (Rice)",
    hindi: "धान",
    emoji: "🌾",
    season: ["Kharif"],
    category: "Cereals",
    description:
      "Chhattisgarh is known as the Rice Bowl of India. Paddy is central to the state's farming, food and culture, with many locally grown varieties.",
    soil: "Clay and clay-loam soils with suitable water management.",
    water: "High; requirements vary by method and rainfall.",
    duration: "Varies by variety, often 100–150 days.",
    seed: "Choose healthy, certified seed suited to the local season.",
    irrigation:
      "Manage water according to crop stage, rainfall and field conditions. Avoid unnecessary continuous flooding.",
    fertilizer:
      "Use soil-test-based nutrient recommendations.",
    protection:
      "Regularly inspect for insects, weeds and disease symptoms. Confirm the problem before treatment.",
    sowing:
      "Commonly established around the monsoon, often June–July, depending on rainfall and local advice.",
    harvest:
      "Harvest when grains are mature and follow proper drying and storage practices.",
  },
  {
    id: "maize",
    name: "Maize",
    hindi: "मक्का",
    emoji: "🌽",
    season: ["Kharif"],
    category: "Cereals",
    description:
      "Maize is an important crop in Chhattisgarh, including tribal areas such as Bastar. It is used for food, animal feed and industrial products.",
    soil: "Well-drained loamy soil.",
    water: "Moderate; avoid waterlogging.",
    duration: "Approximately 80–120 days.",
    protection:
      "Inspect regularly for leaf damage and pests, including fall armyworm.",
    sowing:
      "Kharif sowing generally follows suitable monsoon rainfall.",
  },
  {
    id: "kodo",
    name: "Kodo-Kutki Millet",
    hindi: "कोदो-कुटकी",
    emoji: "🌾",
    season: ["Kharif"],
    category: "Cereals",
    description:
      "Kodo and Kutki are nutritious, drought-tolerant millets traditionally grown by tribal communities in Chhattisgarh.",
    soil: "Often grown in light and less fertile soils.",
    water: "Relatively low compared with paddy.",
  },
  {
    id: "bajra",
    name: "Bajra (Pearl Millet)",
    hindi: "बाजरा",
    emoji: "🌾",
    season: ["Kharif"],
    category: "Cereals",
    description:
      "Bajra is a hardy millet suited to dry conditions. Its grain is used for food and its plant material can provide livestock fodder.",
    soil: "Light, well-drained soils.",
    water: "Low.",
    duration: "Approximately 3–4 months.",
  },
  {
    id: "jowar",
    name: "Jowar (Sorghum)",
    hindi: "ज्वार",
    emoji: "🌾",
    season: ["Kharif"],
    category: "Cereals",
    description:
      "Jowar is a hardy cereal grown for grain, roti, animal feed and fodder. It can tolerate relatively dry conditions.",
    soil: "Light to medium soils.",
    water: "Low to moderate.",
    duration: "Approximately 3–4 months.",
  },
  {
    id: "ragi",
    name: "Ragi (Finger Millet)",
    hindi: "रागी / मड़िया",
    emoji: "🌾",
    season: ["Kharif"],
    category: "Cereals",
    description:
      "A nutritious millet cultivated in suitable rainfed areas. It is used for flour and traditional foods.",
    water: "Generally lower than paddy.",
  },
  {
    id: "soyabean",
    name: "Soyabean",
    hindi: "सोयाबीन",
    emoji: "🫘",
    season: ["Kharif"],
    category: "Oilseeds",
    description:
      "Soyabean is a Kharif oilseed crop rich in protein and oil. It grows best where drainage is good and rainfall is suitable.",
    soil: "Well-drained soil.",
    water: "Moderate.",
    duration: "Approximately 3–3.5 months.",
    protection:
      "Avoid waterlogging and inspect regularly for pests and disease symptoms.",
  },
  {
    id: "groundnut",
    name: "Groundnut",
    hindi: "मूंगफली",
    emoji: "🥜",
    season: ["Kharif"],
    category: "Oilseeds",
    description:
      "Groundnut is grown for edible nuts and oil. Its plant material can also be used as animal fodder.",
    soil: "Light, sandy and well-drained soils.",
    water: "Moderate.",
    duration: "Approximately 3–4 months.",
  },
  {
    id: "sesamum",
    name: "Sesamum (Til)",
    hindi: "तिल",
    emoji: "🌱",
    season: ["Kharif"],
    category: "Oilseeds",
    description:
      "Sesamum is an oilseed crop suited to many light-soil conditions. It can tolerate some dry weather but is sensitive to waterlogging.",
    soil: "Light, well-drained soils.",
    water: "Low to moderate.",
    duration: "Approximately 2.5–3 months.",
  },
  {
    id: "niger",
    name: "Niger",
    hindi: "रामतिल",
    emoji: "🌼",
    season: ["Kharif"],
    category: "Oilseeds",
    description:
      "Niger is a traditional oilseed crop grown in parts of central India, including suitable rainfed areas.",
  },
  {
    id: "sunflower",
    name: "Sunflower",
    hindi: "सूरजमुखी",
    emoji: "🌻",
    season: ["Kharif", "Rabi"],
    category: "Oilseeds",
    description:
      "Sunflower is cultivated for edible oil. Its growing season depends on local climate, variety and irrigation.",
    soil: "Well-drained light to medium soils.",
    water: "Moderate.",
    duration: "Often around 2.5–4 months.",
  },
  {
    id: "arhar",
    name: "Arhar (Pigeon Pea)",
    hindi: "अरहर / तुअर",
    emoji: "🌱",
    season: ["Kharif"],
    category: "Pulses",
    description:
      "Arhar is an important pulse crop used for dal. It is relatively drought-tolerant and contributes to soil fertility through biological nitrogen fixation.",
    soil: "Well-drained light to medium soils.",
    water: "Low to moderate.",
    duration: "Often 4–7 months, depending on variety.",
  },
  {
    id: "urad",
    name: "Urad (Black Gram)",
    hindi: "उड़द",
    emoji: "🫘",
    season: ["Kharif"],
    category: "Pulses",
    description:
      "Urad is a short-duration pulse crop valued for dal and other food products.",
    soil: "Well-drained light to medium soils.",
    water: "Low to moderate.",
    duration: "Approximately 2–3 months.",
  },
  {
    id: "moong",
    name: "Moong (Green Gram)",
    hindi: "मूंग",
    emoji: "🫘",
    season: ["Kharif", "Rabi"],
    category: "Pulses",
    description:
      "Moong is a short-duration pulse crop used for dal, sprouts and other foods. Suitable growing seasons vary locally.",
    soil: "Well-drained light to medium soils.",
    water: "Low to moderate.",
    duration: "Approximately 2–2.5 months.",
  },
  {
    id: "cotton",
    name: "Cotton",
    hindi: "कपास",
    emoji: "☁️",
    season: ["Kharif"],
    category: "Other Crops",
    description:
      "Cotton is a fibre crop used in the textile industry. It requires suitable climate, soil and careful pest management.",
    soil: "Well-drained medium to black soils.",
    water: "Moderate.",
    duration: "Often around 5–6 months or longer.",
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    hindi: "गन्ना",
    emoji: "🎋",
    season: ["Kharif"],
    category: "Other Crops",
    description:
      "Sugarcane is grown for sugar, juice and jaggery. It is a long-duration crop requiring considerable water and nutrients.",
    soil: "Fertile, deep, well-drained soil.",
    water: "High.",
    duration: "Often 10–12 months or longer.",
  },
  {
    id: "kulthi",
    name: "Kulthi (Horse Gram)",
    hindi: "कुल्थी",
    emoji: "🫘",
    season: ["Kharif", "Rabi"],
    category: "Pulses",
    description:
      "Kulthi is a hardy pulse crop grown in some dry and marginal farming areas. It is used as food and animal feed.",
    soil: "Light, rocky or well-drained soils.",
    water: "Low.",
    duration: "Approximately 3–3.5 months.",
  },
  {
    id: "wheat",
    name: "Wheat",
    hindi: "गेहूं",
    emoji: "🌾",
    season: ["Rabi"],
    category: "Cereals",
    description:
      "Wheat is an important Rabi cereal cultivated during cooler months. It is used for flour and many staple foods.",
    soil: "Fertile, well-drained loamy soil.",
    water: "Moderate; timely irrigation is important.",
    duration: "Approximately 4–5 months.",
    sowing:
      "Generally sown during the cooler Rabi season according to local recommendations.",
  },
  {
    id: "barley",
    name: "Barley",
    hindi: "जौ",
    emoji: "🌾",
    season: ["Rabi"],
    category: "Cereals",
    description:
      "Barley is a hardy winter cereal used for food, fodder and brewing.",
    soil: "Light to medium, well-drained soils.",
    water: "Low to moderate.",
    duration: "Approximately 3–4 months.",
  },
  {
    id: "gram_rabi",
    name: "Gram (Chana)",
    hindi: "चना",
    emoji: "🫘",
    season: ["Rabi"],
    category: "Pulses",
    description:
      "Gram is an important winter pulse crop grown for chickpeas and dal. It is often cultivated using residual soil moisture.",
    soil: "Well-drained medium to light soils.",
    water: "Low to moderate.",
    duration: "Approximately 4–5 months.",
  },
  {
    id: "tiwada",
    name: "Tiwada (Lathyrus)",
    hindi: "तिवड़ा / खेसारी",
    emoji: "🌱",
    season: ["Rabi"],
    category: "Pulses",
    description:
      "Tiwada is a traditional winter pulse grown in parts of Chhattisgarh. Cultivation and consumption require attention to approved varieties and food-safety guidance.",
  },
  {
    id: "masoor",
    name: "Masoor (Lentil)",
    hindi: "मसूर",
    emoji: "🫘",
    season: ["Rabi"],
    category: "Pulses",
    description:
      "Masoor is a winter pulse cultivated for protein-rich lentils.",
    water: "Low to moderate.",
  },
  {
    id: "peas",
    name: "Peas",
    hindi: "मटर",
    emoji: "🫛",
    season: ["Rabi"],
    category: "Pulses",
    description:
      "Peas are cultivated during cooler weather for fresh vegetables or dry grain, depending on variety.",
  },
  {
    id: "mustard",
    name: "Mustard",
    hindi: "सरसों",
    emoji: "🌼",
    season: ["Rabi"],
    category: "Oilseeds",
    description:
      "Mustard is an important winter oilseed crop used for edible oil and other products.",
    soil: "Well-drained loamy soil.",
    water: "Low to moderate.",
  },
  {
    id: "linseed",
    name: "Linseed",
    hindi: "अलसी",
    emoji: "🌸",
    season: ["Rabi"],
    category: "Oilseeds",
    description:
      "Linseed is cultivated for oil-rich seeds and other uses during the winter season.",
  },
  {
    id: "rapeseed",
    name: "Rapeseed",
    hindi: "तोरिया / रेपसीड",
    emoji: "🌼",
    season: ["Rabi"],
    category: "Oilseeds",
    description:
      "Rapeseed is a winter oilseed crop cultivated for edible oil under suitable conditions.",
  },
  {
    id: "castor",
    name: "Castor",
    hindi: "अरंडी",
    emoji: "🌿",
    season: ["Kharif"],
    category: "Oilseeds",
    description:
      "Castor is an industrial oilseed crop. Castor beans are toxic and must not be eaten.",
  },
  {
    id: "onion",
    name: "Onion",
    hindi: "प्याज",
    emoji: "🧅",
    season: ["Rabi"],
    category: "Vegetables & Spices",
    description:
      "Onion is an important vegetable crop grown for its bulbs. Good drainage and suitable storage practices are important.",
  },
  {
    id: "potato",
    name: "Potato",
    hindi: "आलू",
    emoji: "🥔",
    season: ["Rabi"],
    category: "Vegetables & Spices",
    description:
      "Potato is a tuber crop generally grown in suitable cool-season conditions.",
    soil: "Loose, well-drained soil.",
  },
  {
    id: "tomato",
    name: "Tomato",
    hindi: "टमाटर",
    emoji: "🍅",
    season: ["Kharif", "Rabi"],
    category: "Vegetables & Spices",
    description:
      "Tomato is an important vegetable crop. Growing seasons depend on temperature, rainfall and local conditions.",
    soil: "Fertile, well-drained soil.",
  },
  {
    id: "chilli",
    name: "Chilli",
    hindi: "मिर्च",
    emoji: "🌶️",
    season: ["Kharif", "Rabi"],
    category: "Vegetables & Spices",
    description:
      "Chilli is cultivated for fresh and dried fruits used as a spice. It requires suitable drainage and regular crop monitoring.",
  },
];

const categories = [
  { key: "All", en: "All", hi: "सभी" },
  { key: "Cereals", en: "Cereals", hi: "अनाज" },
  { key: "Pulses", en: "Pulses", hi: "दलहन" },
  { key: "Oilseeds", en: "Oilseeds", hi: "तिलहन" },
  {
    key: "Vegetables & Spices",
    en: "Vegetables",
    hi: "सब्जियां",
  },
  { key: "Other Crops", en: "Other", hi: "अन्य" },
];

function CropPhoto({
  crop,
  style,
}: {
  crop: Crop;
  style: any;
}) {
  const { language } = usePortal();
  const image = cropImages[crop.id];

  if (image) {
    return (
      <Image
        source={image}
        style={style}
        contentFit="cover"
        accessibilityLabel={language === "hi" ? crop.hindi : crop.name}
      />
    );
  }

  return (
    <View style={[style, styles.fallbackImage]}>
      <Text style={styles.fallbackEmoji}>
        {crop.emoji}
      </Text>
    </View>
  );
}

export default function Crops() {
  const { language, t } = usePortal();
  const hindi = language === "hi";

  const [season, setSeason] = useState("Kharif");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Crop | null>(
    null
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return crops.filter((crop) => {
      const seasonMatch =
        season === "All" ||
        crop.season.includes(season as Season);

      const categoryMatch =
        category === "All" ||
        crop.category === category;

      const searchMatch =
        !query ||
        crop.name.toLowerCase().includes(query) ||
        crop.hindi.includes(query) ||
        crop.category.toLowerCase().includes(query);

      return seasonMatch && categoryMatch && searchMatch;
    });
  }, [season, category, search]);

  if (selected) {
    const cropVarieties = varieties[selected.id] ?? [];

    const details = [
      {
        icon: "calendar-outline" as const,
        label: hindi ? "फसल का मौसम" : "Growing season",
        value: selected.season.map(t).join(" / "),
      },
      {
        icon: "earth-outline" as const,
        label: hindi ? "मिट्टी" : "Soil type",
        value: selected.soil,
      },
      {
        icon: "water-outline" as const,
        label: hindi ? "पानी" : "Water requirements",
        value: selected.water,
      },
      {
        icon: "time-outline" as const,
        label: hindi ? "अवधि" : "Crop duration",
        value: selected.duration,
      },
      {
        icon: "leaf-outline" as const,
        label: hindi ? "बीज" : "Seed",
        value: selected.seed,
      },
      {
        icon: "water-outline" as const,
        label: hindi ? "सिंचाई" : "Irrigation",
        value: selected.irrigation,
      },
      {
        icon: "flask-outline" as const,
        label: hindi ? "खाद" : "Fertilizer",
        value: selected.fertilizer,
      },
      {
        icon: "shield-checkmark-outline" as const,
        label: hindi ? "फसल सुरक्षा" : "Crop protection",
        value: selected.protection,
      },
      {
        icon: "calendar-outline" as const,
        label: hindi ? "बुवाई" : "Sowing",
        value: selected.sowing,
      },
      {
        icon: "basket-outline" as const,
        label: hindi ? "कटाई" : "Harvest",
        value: selected.harvest,
      },
    ];

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.detailContent}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => setSelected(null)}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={GREEN}
          />
          <Text style={styles.backText}>
            {hindi ? "फसलों पर वापस" : "Back to crops"}
          </Text>
        </Pressable>

        <CropPhoto
          crop={selected}
          style={styles.detailPhoto}
        />

        <Text style={styles.detailTitle}>
          {hindi ? selected.hindi : selected.name}
        </Text>

        <Text style={styles.detailSubtitle}>
          {t(selected.category)}
        </Text>

        <View style={styles.detailBadge}>
          <Ionicons
            name="leaf-outline"
            size={15}
            color={GREEN}
          />
          <Text style={styles.detailBadgeText}>
            {hindi
              ? "किसान उपयोगी जानकारी"
              : "Farmer-friendly crop guide"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          {hindi ? "फसल का परिचय" : "About this crop"}
        </Text>

        <View style={[styles.whiteCard, { backgroundColor: "#FFF8EB", borderColor: "#E7D2AA" }]}>
          <Text style={styles.bodyText}>
            {t(selected.description)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          {hindi
            ? "खेती की पूरी जानकारी"
            : "Growing essentials"}
        </Text>

        <View style={styles.whiteCard}>
          {details.map((item, index) => (
            <View
              key={`${item.label}-${index}`}
              style={styles.detailRow}
            >
              <View style={styles.detailIcon}>
                <Ionicons
                  name={item.icon}
                  size={21}
                  color={GREEN}
                />
              </View>

              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>
                  {item.label}
                </Text>

                <Text style={styles.detailValue}>
                  {(item.value ? t(item.value) : "") ||
                    (hindi
                      ? "विस्तृत जानकारी जल्द जोड़ी जाएगी। स्थानीय कृषि विशेषज्ञ से सलाह लें।"
                      : "Detailed guidance not yet available. Consult your local agricultural expert.")}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          {hindi
            ? "फसल की किस्में"
            : `Types and varieties of ${selected.name}`}
        </Text>

        {cropVarieties.length > 0 ? (
          cropVarieties.map((variety, index) => (
            <View
              key={`${t(variety.name)}-${index}`}
              style={[styles.varietyCard, { backgroundColor: "#F4F0FA", borderColor: "#D6C8E8" }]}
            >
              <Image
                source={variety.image ?? cropImages[selected.id]}
                style={styles.varietyImage}
                contentFit="cover"
                accessibilityLabel={variety.image ? t(variety.name) : hindi ? selected.hindi : selected.name}
              />
              <View style={styles.varietyTop}>
                <Text style={styles.varietyNumber}>
                  {String(index + 1).padStart(2, "0")}
                </Text>

                <Text style={styles.varietyType}>
                  {t(variety.type)}
                </Text>
              </View>

              <Text style={styles.varietyName}>
                {variety.name}
              </Text>

              <Text style={styles.bodyText}>
                {t(variety.description)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.whiteCard}>
            <Text style={styles.bodyText}>
              {hindi
                ? "अपने जिले के कृषि विभाग द्वारा अनुशंसित प्रमाणित किस्में चुनें।"
                : "Choose certified varieties recommended by your local agriculture department."}
            </Text>
          </View>
        )}

        <View style={styles.adviceBox}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={GREEN}
          />
          <Text style={styles.adviceText}>
            {hindi
              ? "यह सामान्य जानकारी है। खाद, कीटनाशक और सिंचाई के निर्णय स्थानीय कृषि विशेषज्ञ की सलाह से लें।"
              : "This is general information. Confirm fertilizer, pesticide and irrigation recommendations with local agricultural experts."}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="leaf"
                  size={26}
                  color={GREEN}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>
                  {hindi
                    ? "फसल जानकारी"
                    : "Crop Information"}
                </Text>
                <Text style={styles.subtitle}>
                  {hindi
                    ? "छत्तीसगढ़ की प्रमुख फसलें"
                    : "Major crops of Chhattisgarh"}
                </Text>
              </View>
            </View>

            <View style={styles.banner}>
              <Text style={styles.bannerEmoji}>🌾</Text>
              <Text style={styles.bannerTitle}>
                {hindi
                  ? "धान का कटोरा — छत्तीसगढ़"
                  : "The Rice Bowl of India"}
              </Text>
              <Text style={styles.bannerDescription}>
                {hindi
                  ? "फसल, मौसम, मिट्टी और खेती की जानकारी एक ही जगह।"
                  : "Explore crops, growing seasons, soil needs and cultivation information."}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              {hindi
                ? "मौसम के अनुसार फसलें"
                : "Explore crops by season"}
            </Text>

            <View style={styles.seasonRow}>
              {["Kharif", "Rabi", "All"].map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setSeason(item)}
                  style={[
                    styles.seasonButton,
                    season === item && styles.seasonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.seasonButtonText,
                      season === item &&
                        styles.seasonActiveText,
                    ]}
                  >
                    {item === "All"
                      ? hindi
                        ? "सभी"
                        : "All"
                      : hindi && item === "Kharif"
                      ? "खरीफ"
                      : hindi && item === "Rabi"
                      ? "रबी"
                      : item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.seasonInfo}>
              <Text style={styles.seasonInfoTitle}>
                {season === "Kharif"
                  ? hindi
                    ? "खरीफ फसलें"
                    : "Kharif crops"
                  : season === "Rabi"
                  ? hindi
                    ? "रबी फसलें"
                    : "Rabi crops"
                  : hindi
                  ? "सभी मौसमी फसलें"
                  : "All seasonal crops"}
              </Text>

              <Text style={styles.seasonInfoText}>
                {season === "Kharif"
                  ? hindi
                    ? "खरीफ फसलें मानसून के साथ उगाई जाती हैं। बुवाई सामान्यतः जून–जुलाई और कटाई सितंबर–नवंबर में होती है।"
                    : "Kharif crops grow with the monsoon. Sowing commonly occurs in June–July, with many crops harvested from September to November."
                  : season === "Rabi"
                  ? hindi
                    ? "रबी फसलें सर्दियों में उगाई जाती हैं। बुवाई सामान्यतः अक्टूबर–दिसंबर और कटाई फरवरी–अप्रैल में होती है।"
                    : "Rabi crops are grown in winter. Sowing commonly occurs from October to December, with harvests often between February and April."
                  : hindi
                  ? "खरीफ और रबी दोनों मौसमों की फसलें देखें।"
                  : "Browse crops across Kharif and Rabi seasons."}
              </Text>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={21}
                color="#728077"
              />

              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder={
                  hindi
                    ? "फसल खोजें..."
                    : "Search crop name..."
                }
                placeholderTextColor="#88968D"
              />

              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="#728077"
                  />
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {categories.map((item) => {
                const active = category === item.key;

                return (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.categoryChip,
                      active && styles.categoryActive,
                    ]}
                    onPress={() =>
                      setCategory(item.key)
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        active &&
                          styles.categoryActiveText,
                      ]}
                    >
                      {hindi ? item.hi : item.en}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>
                {hindi
                  ? "उपलब्ध फसलें"
                  : "Explore crops"}
              </Text>

              <Text style={styles.resultCount}>
                {filtered.length}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.cropCard, { backgroundColor: item.category === "Oilseeds" ? "#FFF6E3" : item.category === "Pulses" ? "#F5EFFB" : item.category === "Vegetables & Spices" ? "#FFF0E9" : "#EFF7ED" }]}
            onPress={() => setSelected(item)}
          >
            <CropPhoto
              crop={item}
              style={styles.cropImage}
            />

            <Text
              style={styles.cropName}
            >
              {hindi ? item.hindi : item.name}
            </Text>

            <Text style={styles.cropHindi}>
              {t(item.category)}
            </Text>

            <View style={styles.cropTag}>
              <Text style={styles.cropTagText}>
                {item.season.map(t).join(" / ")}
              </Text>
            </View>

            <View style={styles.cropFooter}>
              <Text style={styles.readMore}>
                {hindi
                  ? "विवरण देखें"
                  : "Read more"}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={GREEN}
              />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="search-outline"
              size={40}
              color="#87948B"
            />
            <Text style={styles.emptyTitle}>
              {hindi
                ? "कोई फसल नहीं मिली"
                : "No crops found"}
            </Text>
            <Text style={styles.emptyText}>
              {hindi
                ? "दूसरा नाम या मौसम चुनें।"
                : "Try another search, season or category."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: DARK,
  },
  subtitle: {
    fontSize: 16,
    color: "#68776D",
    marginTop: 4,
  },
  banner: {
    backgroundColor: "#E0F2E5",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginBottom: 24,
  },
  bannerEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
  },
  bannerDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#50695A",
    textAlign: "center",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
    marginBottom: 12,
  },
  seasonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  seasonButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: "center",
  },
  seasonActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  seasonButtonText: {
    color: DARK,
    fontSize: 16,
    fontWeight: "700",
  },
  seasonActiveText: {
    color: "#FFFFFF",
  },
  seasonInfo: {
    backgroundColor: "#EAF5EC",
    borderRadius: 16,
    padding: 17,
    marginBottom: 19,
  },
  seasonInfoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: GREEN,
    marginBottom: 7,
  },
  seasonInfoText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#536C5D",
  },
  searchBox: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: DARK,
    marginLeft: 10,
  },
  categoryRow: {
    gap: 9,
    paddingBottom: 20,
  },
  categoryChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  categoryActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  categoryActiveText: {
    color: "#FFFFFF",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  resultCount: {
    backgroundColor: LIGHT,
    color: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    fontWeight: "700",
  },
  gridRow: {
    justifyContent: "space-between",
  },
  cropCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 13,
    marginBottom: 14,
  },
  cropImage: {
    width: "100%",
    height: 100,
    borderRadius: 13,
    marginBottom: 12,
  },
  fallbackImage: {
    backgroundColor: "#EFF7EF",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackEmoji: {
    fontSize: 43,
  },
  cropName: {
    fontSize: 15,
    fontWeight: "800",
    color: DARK,
  },
  cropHindi: {
    fontSize: 14,
    color: "#77847B",
    marginTop: 5,
    marginBottom: 10,
  },
  cropTag: {
    alignSelf: "flex-start",
    backgroundColor: LIGHT,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cropTagText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: "700",
  },
  cropFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  readMore: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "700",
  },
  empty: {
    padding: 35,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: DARK,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B796F",
    marginTop: 8,
    textAlign: "center",
  },
  detailContent: {
    padding: 17,
    paddingBottom: 45,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 18,
  },
  backText: {
    fontSize: 15,
    fontWeight: "700",
    color: GREEN,
  },
  detailPhoto: {
    width: "100%",
    height: 230,
    borderRadius: 20,
    marginBottom: 19,
  },
  detailTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: DARK,
  },
  detailSubtitle: {
    fontSize: 15,
    color: "#68796E",
    marginTop: 5,
    marginBottom: 13,
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: LIGHT,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 24,
  },
  detailBadgeText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: "700",
  },
  whiteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 17,
    marginBottom: 23,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 23,
    color: "#405B4C",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1ED",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    color: "#718076",
    marginBottom: 5,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 24,
    color: DARK,
    fontWeight: "500",
  },
  varietyImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 14 },
  varietyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    marginBottom: 13,
  },
  varietyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  varietyNumber: {
    fontSize: 19,
    fontWeight: "800",
    color: GREEN,
  },
  varietyType: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN,
    backgroundColor: LIGHT,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },
  varietyName: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
    marginBottom: 9,
  },
  adviceBox: {
    flexDirection: "row",
    backgroundColor: LIGHT,
    borderRadius: 16,
    padding: 17,
    gap: 10,
    marginTop: 15,
  },
  adviceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    color: "#526D5D",
  },
});
