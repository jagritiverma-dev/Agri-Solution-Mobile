import data from "./districtsData.json";

const hindiNames: Record<string, string> = {
  "path3325": "बालोद",
  "path2651": "बलौदाबाजार",
  "path2278": "बलरामपुर",
  "path10649": "बस्तर",
  "path3323": "बेमेतरा",
  "path2387": "बीजापुर",
  "path3192": "बिलासपुर",
  "path10170": "दंतेवाड़ा",
  "path7155": "धमतरी",
  "path3282": "दुर्ग",
  "path7229": "गरियाबंद",
  "path5352": "गौरेला-पेंड्रा-मरवाही",
  "path6279": "जांजगीर-चांपा",
  "path4496": "जशपुर",
  "path7760": "कबीरधाम",
  "path8477": "कांकेर",
  "path2563": "खैरागढ़-छुईखदान-गंडई",
  "path8739": "कोंडागांव",
  "path10400": "कोरबा",
  "path4651": "कोरिया",
  "path2385": "महासमुंद",
  "path4473": "मनेंद्रगढ़-चिरमिरी-भरतपुर",
  "path7870": "मोहला-मानपुर-अंबागढ़ चौकी",
  "path5815": "मुंगेली",
  "path9215": "नारायणपुर",
  "path10974": "रायगढ़",
  "path7133": "रायपुर",
  "path7848": "राजनांदगांव",
  "path6419": "सक्ती",
  "path6946": "सारंगढ़-बिलाईगढ़",
  "path8584": "सुकमा",
  "path4267": "सूरजपुर",
  "path4890": "सरगुजा"
};

export const districts = data.map(district => ({
  ...district,
  hindiName: hindiNames[district.id] ?? district.districtName,
}));
export type District = (typeof districts)[number];
