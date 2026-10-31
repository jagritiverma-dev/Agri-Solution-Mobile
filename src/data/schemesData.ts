
export type SchemeRegion = "cg" | "central";

export type SchemeCategory =
  | "dbt"
  | "irrigation"
  | "horticulture"
  | "machinery"
  | "credit"
  | "soil"
  | "allied"
  | "pension";

export type SchemeTag =
  | "small"
  | "paddy"
  | "bhoomihin"
  | "scst"
  | "women"
  | "horticulture";

export type ApplyMode = "Online" | "Offline / PACS" | "Both";

export interface Scheme {
  id: string;
  nameEn: string;
  nameHi: string;
  region: SchemeRegion;
  category: SchemeCategory;
  tags: SchemeTag[];
  benefitBadge: string;
  summary: string;
  eligibility: string[];
  documents: string[];
  applyUrl: string;
  applyMode: ApplyMode;
}

const scheme = (
  id: string,
  nameEn: string,
  nameHi: string,
  region: SchemeRegion,
  category: SchemeCategory,
  tags: SchemeTag[],
  benefitBadge: string,
  summary: string,
  eligibility: [string, string, string],
  documents: string[],
  applyUrl: string,
  applyMode: ApplyMode
): Scheme => ({
  id,
  nameEn,
  nameHi,
  region,
  category,
  tags,
  benefitBadge,
  summary,
  eligibility,
  documents,
  applyUrl,
  applyMode,
});

export const SCHEMES: Scheme[] = [
  scheme(
    "krishak-unnati",
    "Krishak Unnati Yojana",
    "कृषक उन्नति योजना",
    "cg",
    "dbt",
    ["small", "paddy"],
    "₹3,100 / quintal",
    "Paddy procurement and associated state financial support. Price differential assistance is subject to current procurement notifications.",
    [
      "Resident farmer of Chhattisgarh.",
      "Registered for the relevant paddy procurement season.",
      "Eligible paddy procurement under current state rules.",
    ],
    ["Aadhaar Card", "B1 / Khasra land record", "Bank Passbook", "PACS registration slip"],
    "https://kisan.cg.nic.in",
    "Offline / PACS"
  ),

  scheme(
    "pm-kisan",
    "PM-KISAN Samman Nidhi",
    "प्रधानमंत्री किसान सम्मान निधि",
    "central",
    "dbt",
    ["small", "paddy"],
    "₹6,000 / year",
    "Eligible landholding farmer families receive annual income support. Payment is made in three installments through DBT.",
    [
      "Eligible landholding farmer family.",
      "Land ownership recorded in applicable revenue records.",
      "Aadhaar-based e-KYC and exclusion checks completed.",
    ],
    ["Aadhaar Card", "Land Revenue Record", "Aadhaar-seeded Bank Account"],
    "https://pmkisan.gov.in",
    "Both"
  ),

  scheme(
    "bhoomihin",
    "Deendayal Upadhyaya Bhoomihin Krishi Majdoor Kalyan Yojana",
    "दीनदयाल उपाध्याय भूमिहीन कृषि मजदूर कल्याण योजना",
    "cg",
    "dbt",
    ["bhoomihin"],
    "₹10,000 / year",
    "Financial assistance intended for eligible landless agricultural labour households. Registration and payment depend on state verification.",
    [
      "Resident of an eligible rural area in Chhattisgarh.",
      "Household meets the scheme's landlessness criteria.",
      "Applicant satisfies livelihood and verification conditions.",
    ],
    ["Aadhaar Card", "Ration Card", "Landless Declaration", "Bank Passbook"],
    "https://kisan.cg.nic.in",
    "Offline / PACS"
  ),

  scheme(
    "sugarcane",
    "Sugarcane Incentive Scheme",
    "गन्ना किसान प्रोत्साहन योजना",
    "cg",
    "dbt",
    [],
    "Seasonal bonus",
    "State incentives may supplement payments for sugarcane supplied to eligible cooperative mills. Bonus rates depend on current notifications.",
    [
      "Registered sugarcane grower.",
      "Sugarcane supplied to an eligible cooperative sugar mill.",
      "Valid delivery and payment records available.",
    ],
    ["Aadhaar Card", "Sugar Mill Supply Slip", "Farmer Passbook", "Bank Details"],
    "https://agriportal.cg.nic.in",
    "Offline / PACS"
  ),

  scheme(
    "saur-sujala",
    "Saur Sujala Yojana",
    "सौर सुजला योजना",
    "cg",
    "irrigation",
    ["small", "scst"],
    "Solar pump subsidy",
    "Supports installation of solar irrigation pumps in eligible agricultural areas. Subsidy and farmer contribution vary by category and sanctioned pump capacity.",
    [
      "Farmer with eligible cultivable land.",
      "Suitable and verifiable irrigation water source.",
      "Application approved under the current CREDA program.",
    ],
    ["Aadhaar Card", "B1 / Khasra", "Water Source Proof", "Caste Certificate if applicable"],
    "https://creda.cgstate.gov.in",
    "Offline / PACS"
  ),

  scheme(
    "jeevan-jyoti",
    "Krishak Jeevan Jyoti Yojana",
    "कृषक जीवन ज्योति योजना",
    "cg",
    "irrigation",
    ["small"],
    "Power bill relief",
    "Provides electricity tariff assistance for eligible agricultural pump connections. Free-unit limits depend on current state electricity rules.",
    [
      "Registered agricultural electricity consumer.",
      "Qualifying irrigation pump connection.",
      "Compliance with current CSPDCL conditions.",
    ],
    ["Electricity Connection Number", "B1 Land Record", "Aadhaar Card"],
    "https://cspdcl.co.in",
    "Offline / PACS"
  ),

  scheme(
    "pm-kusum",
    "PM-KUSUM",
    "प्रधानमंत्री कुसुम योजना",
    "central",
    "irrigation",
    ["small", "scst"],
    "Solar pump assistance",
    "Supports eligible solar agricultural pump and solarization components. Assistance varies by component and state implementation.",
    [
      "Eligible farmer or recognized farmer group.",
      "Qualifying land, water or electricity connection.",
      "Application within an available state component.",
    ],
    ["Aadhaar Card", "Land Ownership Proof", "Bank Passbook", "Electricity Proof if required"],
    "https://pmkusum.mnre.gov.in",
    "Both"
  ),

  scheme(
    "kisan-samriddhi",
    "Kisan Samriddhi Yojana",
    "किसान समृद्धि योजना",
    "cg",
    "irrigation",
    ["small"],
    "Tubewell assistance",
    "Supports groundwater irrigation infrastructure for eligible farmers. Grant limits and approved works depend on district guidelines.",
    [
      "Eligible small or marginal farmer.",
      "Agricultural land requiring irrigation.",
      "Site and proposed works approved by the department.",
    ],
    ["B1 / Khasra", "Patwari Map", "Aadhaar Card", "Bank Passbook"],
    "https://agriportal.cg.nic.in",
    "Offline / PACS"
  ),

  scheme(
    "shakambhari",
    "Shakambhari Yojana",
    "शाकम्भरी योजना",
    "cg",
    "horticulture",
    ["small", "horticulture"],
    "Pump & well support",
    "Supports irrigation facilities for eligible vegetable and horticultural growers. Approved equipment and subsidy rates depend on local rules.",
    [
      "Eligible farmer cultivating vegetables or horticultural crops.",
      "Qualifying landholding under current guidelines.",
      "Irrigation work or equipment approved by the department.",
    ],
    ["B1 / Khasra", "Aadhaar Card", "Crop Cultivation Proof", "Bank Details"],
    "https://agriportal.cg.nic.in",
    "Offline / PACS"
  ),

  scheme(
    "pdmc",
    "Per Drop More Crop (PMKSY)",
    "प्रति बूंद अधिक फसल योजना",
    "central",
    "irrigation",
    ["small", "horticulture", "scst"],
    "Up to 55% support",
    "Promotes drip and sprinkler irrigation to improve water-use efficiency. Assistance depends on farmer category and approved installation costs.",
    [
      "Farmer with suitable agricultural land.",
      "Adequate water source for micro-irrigation.",
      "Approved equipment and installation under local guidelines.",
    ],
    ["Aadhaar Card", "B1 Land Record", "Water Source Details", "Supplier Quotation"],
    "https://pmksy.gov.in",
    "Both"
  ),

  scheme(
    "midh",
    "Mission for Integrated Development of Horticulture",
    "एकीकृत बागवानी विकास मिशन",
    "central",
    "horticulture",
    ["small", "horticulture", "women"],
    "Project-based subsidy",
    "Supports orchards, protected cultivation and horticultural infrastructure. Assistance depends on approved project components and cost norms.",
    [
      "Eligible farmer, SHG or registered FPO.",
      "Suitable land or project infrastructure.",
      "Project meets the current horticulture mission guidelines.",
    ],
    ["Aadhaar Card", "Land Records", "Project Report", "Bank Sanction if required"],
    "https://midh.gov.in",
    "Both"
  ),

  scheme(
    "smam",
    "Sub-Mission on Agricultural Mechanization",
    "कृषि यंत्रीकरण उप-मिशन",
    "central",
    "machinery",
    ["small", "scst", "women"],
    "Machinery subsidy",
    "Supports eligible farm machinery and custom hiring services. Assistance varies by equipment, beneficiary category and program component.",
    [
      "Eligible farmer or approved collective.",
      "Equipment listed under current program guidelines.",
      "Purchase and application meet subsidy requirements.",
    ],
    ["Aadhaar Card", "B1 Land Record", "Bank Passbook", "Dealer Quotation", "Caste Certificate if applicable"],
    "https://agrimachinery.nic.in",
    "Online"
  ),

  scheme(
    "drone-didi",
    "Namo Drone Didi",
    "नमो ड्रोन दीदी योजना",
    "central",
    "machinery",
    ["women"],
    "Up to ₹8 lakh",
    "Supports selected women self-help groups with agricultural drone services. Training and financial assistance follow the scheme's selection rules.",
    [
      "Eligible registered women self-help group.",
      "Selection under the implementing livelihood mission.",
      "Designated operator meets training requirements.",
    ],
    ["SHG Registration", "SHG Bank Passbook", "Operator Aadhaar", "Selection Documents"],
    "https://agricoop.nic.in",
    "Offline / PACS"
  ),

  scheme(
    "zero-interest",
    "0% Interest Agricultural Crop Loan Scheme",
    "शून्य प्रतिशत ब्याज कृषि ऋण योजना",
    "cg",
    "credit",
    ["small", "paddy"],
    "0% conditional interest",
    "Provides concessional short-term agricultural credit through eligible cooperative institutions. Interest relief depends on repayment conditions and current limits.",
    [
      "Eligible member of a participating cooperative society.",
      "Qualifying seasonal agricultural borrowing.",
      "Repayment completed within applicable deadlines.",
    ],
    ["Aadhaar Card", "Rin Pustika / B1", "Society Passbook", "Sowing Declaration"],
    "https://kisan.cg.nic.in",
    "Offline / PACS"
  ),

  scheme(
    "kcc",
    "Kisan Credit Card",
    "किसान क्रेडिट कार्ड",
    "central",
    "credit",
    ["small", "paddy", "women"],
    "Concessional farm credit",
    "Provides working-capital credit for eligible agricultural and allied activities. Interest concessions depend on lending and timely repayment rules.",
    [
      "Eligible farmer, tenant cultivator or allied-sector borrower.",
      "Satisfactory bank assessment and documentation.",
      "Compliance with current credit and repayment terms.",
    ],
    ["Aadhaar Card", "Land or Cultivation Proof", "Bank Documents", "PAN if required"],
    "https://www.jansamarth.in",
    "Both"
  ),

  scheme(
    "pmfby",
    "Pradhan Mantri Fasal Bima Yojana",
    "प्रधानमंत्री फसल बीमा योजना",
    "central",
    "credit",
    ["small", "paddy", "scst", "women"],
    "Crop insurance",
    "Provides insurance protection for notified crops and covered risks. Premium rates and claims follow season-specific insurance notifications.",
    [
      "Cultivating a notified crop in an eligible insurance unit.",
      "Enrollment completed within the applicable deadline.",
      "Required cultivation and identity records available.",
    ],
    ["Aadhaar Card", "B1 / Khasra", "Sowing Proof", "Bank Passbook"],
    "https://pmfby.gov.in",
    "Both"
  ),

  scheme(
    "aif",
    "Agriculture Infrastructure Fund",
    "कृषि अवसंरचना निधि",
    "central",
    "credit",
    ["women"],
    "3% interest subvention",
    "Supports financing for eligible post-harvest and community farming infrastructure. Benefits depend on sanctioned projects and loan terms.",
    [
      "Eligible farmer, FPO, PACS, SHG or agri-entrepreneur.",
      "Qualifying infrastructure project.",
      "Loan and project approved by participating lender.",
    ],
    ["Detailed Project Report", "Land or Lease Documents", "KYC", "Bank Loan Papers"],
    "https://agriinfra.dac.gov.in",
    "Online"
  ),

  scheme(
    "soil-health",
    "Soil Health Card Scheme",
    "मृदा स्वास्थ्य कार्ड योजना",
    "central",
    "soil",
    ["small", "paddy", "horticulture"],
    "Soil testing guidance",
    "Provides soil nutrient information and fertilizer recommendations. Farmers can use the results to plan more efficient nutrient management.",
    [
      "Farmer or cultivator with an identifiable agricultural plot.",
      "Soil sample accepted under the local testing process.",
      "Required farm and sample information supplied.",
    ],
    ["Farmer ID", "Khasra Number", "Soil Sample Details"],
    "https://soilhealth.dac.gov.in",
    "Both"
  ),

  scheme(
    "pkvy",
    "Paramparagat Krishi Vikas Yojana",
    "परंपरागत कृषि विकास योजना",
    "central",
    "soil",
    ["small", "horticulture"],
    "Organic farming support",
    "Promotes cluster-based organic farming and certification. Financial support depends on current program norms and approved activities.",
    [
      "Farmer participating in an eligible organic cluster.",
      "Agreement to follow program farming practices.",
      "Enrollment and verification completed.",
    ],
    ["Aadhaar Card", "Land Records", "Cluster Resolution", "PGS Enrollment"],
    "https://pgsindia-ncof.gov.in",
    "Both"
  ),

  scheme(
    "bamboo",
    "National Bamboo Mission",
    "राष्ट्रीय बांस मिशन",
    "central",
    "soil",
    ["small"],
    "Bamboo plantation aid",
    "Supports eligible bamboo plantation and value-chain activities. Assistance depends on approved species, project type and current norms.",
    [
      "Eligible applicant with suitable plantation land.",
      "Approved bamboo species and plantation plan.",
      "Project accepted by the implementing department.",
    ],
    ["Land Ownership Proof", "Aadhaar Card", "Bank Passbook", "Plantation Plan"],
    "https://nbm.nic.in",
    "Both"
  ),

  scheme(
    "dairy",
    "Integrated Dairy Development Scheme",
    "एकीकृत डेयरी विकास योजना",
    "cg",
    "allied",
    ["small", "scst", "women"],
    "Dairy unit assistance",
    "Supports eligible dairy and livestock development activities in Chhattisgarh. Assistance depends on the active department component and beneficiary category.",
    [
      "Eligible livestock keeper or rural applicant.",
      "Meets project and livestock management conditions.",
      "Approved by the relevant veterinary or animal husbandry office.",
    ],
    ["Aadhaar Card", "Residence or Land Proof", "Bank Passbook", "Caste Certificate if applicable"],
    "https://ahd.cg.gov.in",
    "Offline / PACS"
  ),

  scheme(
    "pmmsy",
    "Pradhan Mantri Matsya Sampada Yojana",
    "प्रधानमंत्री मत्स्य संपदा योजना",
    "central",
    "allied",
    ["small", "scst", "women"],
    "Fisheries subsidy",
    "Supports eligible fisheries, aquaculture and related infrastructure. Assistance varies by project and beneficiary category.",
    [
      "Eligible fish farmer or fisheries applicant.",
      "Suitable pond, land or approved project facility.",
      "Project approved under the current fisheries component.",
    ],
    ["Aadhaar Card", "Land or Pond Lease", "Bank Passbook", "Project Estimate"],
    "https://pmmsy.dof.gov.in",
    "Both"
  ),

  scheme(
    "nlm",
    "National Livestock Mission",
    "राष्ट्रीय पशुधन मिशन",
    "central",
    "allied",
    ["small", "women", "scst"],
    "Livestock project subsidy",
    "Supports eligible poultry, sheep, goat and piggery enterprises. Assistance is project-based and requires compliance with financing and technical rules.",
    [
      "Eligible individual, SHG, FPO or other approved applicant.",
      "Viable livestock enterprise with suitable facilities.",
      "Project satisfies financial and technical approval requirements.",
    ],
    ["Project Report", "Land or Lease Deed", "Aadhaar", "PAN", "Bank Documents"],
    "https://nlm.udyamimitra.in",
    "Online"
  ),

  scheme(
    "vriksha-sampada",
    "Mukhyamantri Vriksha Sampada Yojana",
    "मुख्यमंत्री वृक्ष संपदा योजना",
    "cg",
    "soil",
    ["small"],
    "Tree plantation support",
    "Supports approved commercial tree plantation on eligible land in Chhattisgarh. Subsidy and purchase arrangements depend on current forest department conditions.",
    [
      "Eligible landowner or approved institution in Chhattisgarh.",
      "Suitable land and approved plantation species.",
      "Plantation sanctioned under current program rules.",
    ],
    ["B1 / Khasra", "Aadhaar Card", "Bank Passbook", "Plantation Consent"],
    "https://forest.cg.gov.in",
    "Offline / PACS"
  ),

  scheme(
    "pm-kmy",
    "PM Kisan Maan-Dhan Yojana",
    "प्रधानमंत्री किसान मानधन योजना",
    "central",
    "pension",
    ["small"],
    "₹3,000 / month pension",
    "Provides contributory old-age pension protection for eligible small and marginal farmers. Pension begins at the prescribed age subject to scheme conditions.",
    [
      "Eligible small or marginal landholding farmer.",
      "Within the applicable enrollment age range of 18–40 years.",
      "Meets exclusion and contribution requirements.",
    ],
    ["Aadhaar Card", "Land Record", "Savings Bank Passbook", "Auto-debit Consent"],
    "https://maandhan.in",
    "Both"
  ),
];

export const REGION_OPTIONS = [
  { value: "all", en: "All Schemes", hi: "सभी योजनाएं" },
  { value: "cg", en: "Chhattisgarh", hi: "छत्तीसगढ़" },
  { value: "central", en: "Central Government", hi: "केंद्र सरकार" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "all", en: "All Sectors", hi: "सभी क्षेत्र" },
  { value: "dbt", en: "Income & Paddy Support", hi: "आय एवं धान सहायता" },
  { value: "irrigation", en: "Irrigation, Solar & Power", hi: "सिंचाई, सौर एवं बिजली" },
  { value: "horticulture", en: "Horticulture & Vegetables", hi: "बागवानी एवं सब्जियां" },
  { value: "machinery", en: "Machinery & Drones", hi: "कृषि यंत्र एवं ड्रोन" },
  { value: "credit", en: "Loans & Crop Insurance", hi: "ऋण एवं फसल बीमा" },
  { value: "soil", en: "Soil, Organic & Forestry", hi: "मिट्टी, जैविक एवं वानिकी" },
  { value: "allied", en: "Dairy, Livestock & Fisheries", hi: "डेयरी, पशुपालन एवं मत्स्य" },
  { value: "pension", en: "Farmer Pension", hi: "किसान पेंशन" },
] as const;

export const TAG_OPTIONS: {
  value: SchemeTag;
  en: string;
  hi: string;
}[] = [
  { value: "small", en: "Small / Marginal Farmer", hi: "लघु / सीमांत किसान" },
  { value: "paddy", en: "Paddy Producer", hi: "धान उत्पादक" },
  { value: "bhoomihin", en: "Landless Farm Labourer", hi: "भूमिहीन कृषि मजदूर" },
  { value: "scst", en: "SC / ST", hi: "अनुसूचित जाति / जनजाति" },
  { value: "women", en: "Women / SHG", hi: "महिला / स्व-सहायता समूह" },
  { value: "horticulture", en: "Horticulture Grower", hi: "बागवानी किसान" },
];

export function filterSchemes(
  items: Scheme[],
  query: string,
  region: "all" | SchemeRegion,
  category: "all" | SchemeCategory,
  selectedTags: SchemeTag[]
): Scheme[] {
  const search = query.trim().toLocaleLowerCase();

  return items.filter((item) => {
    if (region !== "all" && item.region !== region) return false;
    if (category !== "all" && item.category !== category) return false;

    if (
      selectedTags.length > 0 &&
      !selectedTags.some((tag) => item.tags.includes(tag))
    ) {
      return false;
    }

    if (!search) return true;

    return [
      item.nameEn,
      item.nameHi,
      item.summary,
      item.benefitBadge,
      ...item.eligibility,
      ...item.documents,
    ].some((value) => value.toLocaleLowerCase().includes(search));
  });
}

export function validateSchemes(items: Scheme[]): void {
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate scheme ID: ${item.id}`);
    }

    ids.add(item.id);

    if (
      !item.nameEn.trim() ||
      !item.nameHi.trim() ||
      !item.summary.trim() ||
      item.eligibility.length !== 3 ||
      item.documents.length === 0
    ) {
      throw new Error(`Incomplete scheme data: ${item.id}`);
    }

    try {
      const url = new URL(item.applyUrl);
      if (url.protocol !== "https:") {
        throw new Error("HTTPS required");
      }
    } catch {
      throw new Error(`Invalid official URL: ${item.id}`);
    }
  }

  if (items.length !== 25) {
    throw new Error(`Expected 25 schemes, received ${items.length}`);
  }
}

validateSchemes(SCHEMES);
