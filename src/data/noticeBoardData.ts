export type NoticeCategory =
  | "e-KYC & Accounts"
  | "Installments"
  | "Procurement"
  | "Schemes"
  | "Advisory";

export interface NoticeRecord {
  id: string;
  title: string;
  title_hi: string;
  category: NoticeCategory;
  department: string;
  department_hi: string;
  publishedDate: string;
  isPinned: boolean;
  isUrgent: boolean;
  summary: string;
  summary_hi: string;
  fullDetails: string;
  fullDetails_hi: string;
  officialRefNo?: string;
  officialPortalUrl?: string;
  pdfUrl?: string;
  verified: boolean;
}

export const noticeBoardData: NoticeRecord[] = [
  {
    id: "notice_001",
    title: "PM-KISAN: e-KYC and Land Record Verification",
    title_hi: "पीएम-किसान: ई-केवाईसी और भूमि रिकॉर्ड सत्यापन",
    category: "e-KYC & Accounts",
    department: "PM-KISAN, Government of India",
    department_hi: "पीएम-किसान, भारत सरकार",
    publishedDate: "2026-10-29",
    isPinned: true,
    isUrgent: false,
    summary:
      "Submitted information about Aadhaar e-KYC, land records and bank verification. Official confirmation is pending.",
    summary_hi:
      "आधार ई-केवाईसी, भूमि रिकॉर्ड और बैंक खाते के सत्यापन से जुड़ी जानकारी। आधिकारिक पुष्टि बाकी है।",
    fullDetails:
      "The submitted record mentions Aadhaar e-KYC, land record verification and NPCI bank mapping. Its installment number and stated deadline have not been authenticated. Check current requirements and beneficiary status on the PM-KISAN portal.",
    fullDetails_hi:
      "इस जानकारी में आधार ई-केवाईसी, भूमि रिकॉर्ड सत्यापन और बैंक खाते को डीबीटी से जोड़ने का उल्लेख है। बताई गई किस्त संख्या और अंतिम तारीख की आधिकारिक पुष्टि नहीं हुई है। सही जानकारी और लाभार्थी की स्थिति पीएम-किसान पोर्टल पर जांचें।",
    officialPortalUrl: "https://pmkisan.gov.in",
    verified: false,
  },
  {
    id: "notice_002",
    title: "Krishak Unnati Yojana: Payment Information",
    title_hi: "कृषक उन्नति योजना: भुगतान संबंधी जानकारी",
    category: "Installments",
    department: "Agriculture Department, Chhattisgarh",
    department_hi: "कृषि विभाग, छत्तीसगढ़",
    publishedDate: "2026-10-25",
    isPinned: true,
    isUrgent: false,
    summary:
      "Submitted information about financial assistance and DBT payments under Krishak Unnati Yojana. Verification is pending.",
    summary_hi:
      "कृषक उन्नति योजना के अंतर्गत आर्थिक सहायता और डीबीटी भुगतान से जुड़ी जानकारी। सत्यापन बाकी है।",
    fullDetails:
      "The submitted record claims a specific per-quintal assistance amount and payment schedule after paddy sale. These claims have not been authenticated for the stated period. Check the current government order and payment status through authorized channels.",
    fullDetails_hi:
      "प्राप्त जानकारी में धान बिक्री के बाद प्रति क्विंटल सहायता राशि और भुगतान की समय-सारणी का उल्लेख है। इस अवधि के लिए इन दावों की आधिकारिक पुष्टि नहीं हुई है। वर्तमान सरकारी आदेश और भुगतान की स्थिति अधिकृत माध्यम से जांचें।",
    officialPortalUrl: "https://kisan.cg.nic.in",
    verified: false,
  },
  {
    id: "notice_003",
    title: "Paddy Procurement: Token Booking Information",
    title_hi: "धान खरीदी: टोकन बुकिंग संबंधी जानकारी",
    category: "Procurement",
    department: "Agriculture and Cooperative Authorities, Chhattisgarh",
    department_hi: "कृषि एवं सहकारिता विभाग, छत्तीसगढ़",
    publishedDate: "2026-10-27",
    isPinned: false,
    isUrgent: false,
    summary:
      "Submitted information about paddy procurement registration and Token Tunhar Haath booking.",
    summary_hi:
      "धान खरीदी पंजीयन और टोकन तुंहर हाथ से टोकन बुकिंग संबंधी जानकारी।",
    fullDetails:
      "The submitted record mentions procurement start dates, token booking rules, moisture limits and purchase ceilings. These conditions require confirmation from the current state notification. Farmers should check with their authorized procurement centre.",
    fullDetails_hi:
      "प्राप्त जानकारी में धान खरीदी शुरू होने की तारीख, टोकन बुकिंग, नमी की सीमा और खरीदी की अधिकतम मात्रा का उल्लेख है। इन नियमों की वर्तमान सरकारी आदेश से पुष्टि आवश्यक है। किसान अपने अधिकृत धान खरीदी केंद्र से जानकारी लें।",
    officialPortalUrl: "https://kisan.cg.nic.in",
    verified: false,
  },
  {
    id: "notice_004",
    title: "Rajiv Gandhi Kisan Nyay Yojana: Payment Status",
    title_hi: "राजीव गांधी किसान न्याय योजना: भुगतान स्थिति",
    category: "Installments",
    department: "Agriculture Department, Chhattisgarh",
    department_hi: "कृषि विभाग, छत्तीसगढ़",
    publishedDate: "2026-10-15",
    isPinned: false,
    isUrgent: false,
    summary:
      "Submitted information about outstanding agricultural assistance payments. Official confirmation is pending.",
    summary_hi:
      "कृषि सहायता की बकाया राशि के भुगतान से संबंधित जानकारी। आधिकारिक पुष्टि बाकी है।",
    fullDetails:
      "The submitted record claims that certain pending agricultural assistance payments have been released and mentions a document-submission deadline. These claims have not been verified. Farmers should check their eligibility and payment status with the relevant government office.",
    fullDetails_hi:
      "प्राप्त जानकारी में कुछ लंबित कृषि सहायता राशि जारी होने और दस्तावेज जमा करने की अंतिम तारीख का दावा किया गया है। इसकी आधिकारिक पुष्टि नहीं हुई है। किसान अपनी पात्रता और भुगतान की स्थिति संबंधित सरकारी कार्यालय से जांचें।",
    officialPortalUrl: "https://agriportal.cg.nic.in",
    verified: false,
  },
  {
    id: "notice_005",
    title: "Kisan Credit Card: Account Verification",
    title_hi: "किसान क्रेडिट कार्ड: खाता सत्यापन",
    category: "e-KYC & Accounts",
    department: "Banking and Cooperative Institutions, Chhattisgarh",
    department_hi: "बैंकिंग एवं सहकारी संस्थाएं, छत्तीसगढ़",
    publishedDate: "2026-10-20",
    isPinned: false,
    isUrgent: false,
    summary:
      "Submitted information about KCC renewal, Aadhaar verification and bank account requirements.",
    summary_hi:
      "किसान क्रेडिट कार्ड नवीनीकरण, आधार सत्यापन और बैंक खाते की आवश्यकताओं से जुड़ी जानकारी।",
    fullDetails:
      "The submitted record discusses biometric e-KYC and possible changes to interest benefits during KCC renewal. These requirements and consequences have not been authenticated. Contact your issuing bank for current renewal conditions.",
    fullDetails_hi:
      "प्राप्त जानकारी में किसान क्रेडिट कार्ड के नवीनीकरण के समय बायोमेट्रिक ई-केवाईसी और ब्याज सहायता से जुड़े नियमों का उल्लेख है। इन शर्तों की आधिकारिक पुष्टि नहीं हुई है। वर्तमान नियमों के लिए अपने बैंक से संपर्क करें।",
    verified: false,
  },
  {
    id: "notice_006",
    title: "Solar Sujala Yojana: Solar Irrigation Pumps",
    title_hi: "सौर सुजला योजना: सोलर सिंचाई पंप",
    category: "Schemes",
    department: "CREDA, Chhattisgarh",
    department_hi: "क्रेडा, छत्तीसगढ़",
    publishedDate: "2026-10-12",
    isPinned: false,
    isUrgent: false,
    summary:
      "Submitted information about subsidized solar irrigation pumps and applications.",
    summary_hi:
      "अनुदान पर सोलर सिंचाई पंप और आवेदन से जुड़ी जानकारी।",
    fullDetails:
      "The submitted record describes applications for 3 HP and 5 HP solar pumps and mentions a high subsidy percentage. The current phase, application status, eligibility and subsidy amount have not been verified. Confirm details with CREDA or the district office.",
    fullDetails_hi:
      "प्राप्त जानकारी में 3 एचपी और 5 एचपी सोलर पंप के आवेदन तथा अनुदान का उल्लेख है। वर्तमान चरण, आवेदन की स्थिति, पात्रता और अनुदान राशि की पुष्टि नहीं हुई है। सही जानकारी के लिए क्रेडा या जिला कार्यालय से संपर्क करें।",
    officialPortalUrl: "https://creda.cgstate.gov.in",
    verified: false,
  },
  {
    id: "notice_007",
    title: "Paddy Crop: Brown Planthopper Awareness",
    title_hi: "धान की फसल: भूरा माहू कीट से सावधानी",
    category: "Advisory",
    department: "Agricultural Extension Information",
    department_hi: "कृषि विस्तार संबंधी जानकारी",
    publishedDate: "2026-10-28",
    isPinned: false,
    isUrgent: false,
    summary:
      "Submitted advisory about brown planthopper infestation in paddy. Treatment instructions have not been verified.",
    summary_hi:
      "धान में भूरा माहू कीट से संबंधित जानकारी। उपचार के निर्देशों की पुष्टि बाकी है।",
    fullDetails:
      "Brown planthoppers can damage paddy by feeding near the base of the plants. Inspect affected areas and consult a qualified agricultural extension officer for diagnosis and locally approved management. Pesticide doses in the original submission have not been verified.",
    fullDetails_hi:
      "भूरा माहू कीट धान के पौधों के निचले हिस्से से रस चूसकर फसल को नुकसान पहुंचा सकता है। प्रभावित खेत का निरीक्षण करें और सही पहचान तथा उपचार के लिए कृषि विशेषज्ञ से सलाह लें। मूल जानकारी में दी गई कीटनाशक की मात्रा की पुष्टि नहीं हुई है।",
    officialPortalUrl: "https://igkv.ac.in",
    verified: false,
  },
];