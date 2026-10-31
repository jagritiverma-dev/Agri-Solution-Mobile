import { commonHindi } from "./commonTranslations";
import { cropHindi } from "./cropTranslations";
import { marketTranslations } from "./marketTranslations";
export type Language = "en" | "hi";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    "home.brand": "Mor Kisani",
    "home.tagline": "Farming support for Chhattisgarh",
    "home.welcome": "WELCOME, FARMER",
    "home.heading": "Grow with confidence.",
    "home.description":
      "Practical farming information and services for Chhattisgarh farmers.",
    "home.heroEyebrow": "FARMER FIRST",
    "home.heroTitle": "Your farming companion",
    "home.heroDescription":
      "Explore crops, government schemes and practical farming resources.",
    "home.quickServices": "Quick services",
    "home.quickServicesDescription": "Support for every step of your farm",
    "home.crops": "Crops",
    "home.weatherSoil": "Weather & soil",
    "home.schemes": "Schemes",
    "home.districtMap": "District map & information",
    "home.cropDoctor": "Crop Doctor",
    "home.assistant": "AI assistant",
    "home.openServiceHint": "Opens this service",
    "home.exploreMore": "Explore more",
    "home.vikrayToken": "Vikray Token",
    "home.centres": "Procurement centres",
    "home.notices": "Notice board",
    "home.joinTitle": "Farmer account",
    "home.joinDescription":
      "Register or log in to access your farmer account.",
    "home.getStarted": "Get started",
    "home.disclaimer":
      "Crop guides, local weather and farming services — together in Mor Kisani.",
    "language.preferenceNotSaved":
      "Your language is selected for this session, but could not be saved for next time.",
  },
  hi: {
    "home.brand": "मोर किसानी",
    "home.tagline": "छत्तीसगढ़ के किसानों का अपना साथी",
    "home.welcome": "किसान साथियों, स्वागत है",
    "home.heading": "खेती की सही जानकारी, सही समय पर।",
    "home.description":
      "छत्तीसगढ़ के किसानों के लिए खेती की उपयोगी जानकारी और सेवाएं।",
    "home.heroEyebrow": "आपकी खेती, आपका साथी",
    "home.heroTitle": "हर मौसम में आपके साथ",
    "home.heroDescription":
      "अपनी फसल के बारे में जानें, मौसम देखें और काम की सरकारी योजनाएं खोजें।",
    "home.quickServices": "आज क्या जानना चाहेंगे?",
    "home.quickServicesDescription": "जरूरत की जानकारी यहां चुनें",
    "home.crops": "फसलें",
    "home.weatherSoil": "मौसम और मिट्टी",
    "home.schemes": "योजनाएं",
    "home.districtMap": "अपने जिले की जानकारी",
    "home.cropDoctor": "फसल डॉक्टर",
    "home.assistant": "खेती सहायक",
    "home.openServiceHint": "यह सेवा खुलेगी",
    "home.exploreMore": "और सेवाएं",
    "home.vikrayToken": "विक्रय टोकन",
    "home.centres": "फसल खरीद केंद्र",
    "home.notices": "जरूरी सूचनाएं",
    "home.joinTitle": "किसान खाता",
    "home.joinDescription":
      "अपने खाते में लॉग इन करें या नया किसान खाता बनाएं।",
    "home.getStarted": "शुरू करें",
    "home.disclaimer":
      "फसल की जानकारी, आपके इलाके का मौसम और खेती की सेवाएं — सब मोर किसानी पर।",
    "language.preferenceNotSaved":
      "भाषा बदल गई है। इसे सहेज नहीं पाए, इसलिए अगली बार फिर चुननी पड़ सकती है।",
  },
};

export function translate(key: string, language: Language): string | undefined {
  const normalized = key.replace(/\s+/g, " ").trim();
  return marketTranslations[key]?.[language] ?? translations[language][key] ?? (language === "hi" ? commonHindi[normalized] ?? cropHindi[normalized] ?? commonHindi[normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")] : undefined);
}
