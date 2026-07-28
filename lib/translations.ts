export type Language = "en" | "ta" | "si";

export interface TranslationDictionary {
  appName: string;
  smartFarming: string;
  login: string;
  getStarted: string;
  logout: string;
  dashboard: string;
  weatherForecast: string;
  cropGuide: string;
  aiChatbot: string;
  plantDiagnosis: string;
  irrigationSolar: string;
  marketplace: string;
  community: string;
  settings: string;

  // Dashboard Overview Cards
  totalCrops: string;
  activeCultivations: string;
  todaysWeather: string;
  irrigationStatus: string;
  marketplaceOrders: string;
  aiRecommendations: string;
  farmHealthScore: string;

  // Weather Widget
  weatherAdvisory: string;
  currentTemp: string;
  rainProbability: string;
  humidity: string;
  windSpeed: string;
  uvIndex: string;
  sevenDayForecast: string;
  weatherAlerts: string;

  // Pest Detection
  pestDetectionTitle: string;
  uploadImageRequired: string;
  descriptionOptional: string;
  submitDiagnosis: string;
  selectImageFirstError: string;

  // Settings
  profileUpdate: string;
  fullName: string;
  phoneNumber: string;
  farmPlace: string;
  emailAddress: string;
  password: string;
  preferredLanguage: string;
  saveSettings: string;
  deleteAccount: string;
  deleteAccountConfirmMsg: string;
  deleteAccountSuccess: string;
  confirmDelete: string;
  cancel: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: "வளம் · Valam",
    smartFarming: "Smart Farming Assistant",
    login: "Login",
    getStarted: "Get Started",
    logout: "Log out",
    dashboard: "Dashboard",
    weatherForecast: "Weather Forecast",
    cropGuide: "Crop Guide",
    aiChatbot: "AI Chatbot",
    plantDiagnosis: "Plant Disease Detection",
    irrigationSolar: "Irrigation & Solar Farming",
    marketplace: "Marketplace",
    community: "Community",
    settings: "Settings",

    totalCrops: "Total Crops",
    activeCultivations: "Active Cultivations",
    todaysWeather: "Today's Weather",
    irrigationStatus: "Irrigation Status",
    marketplaceOrders: "Marketplace Orders",
    aiRecommendations: "AI Recommendations",
    farmHealthScore: "Farm Health Score",

    weatherAdvisory: "Weather & Irrigation Advisory",
    currentTemp: "Current Temperature",
    rainProbability: "Rain Probability",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    uvIndex: "UV Index",
    sevenDayForecast: "7-Day Weather Forecast",
    weatherAlerts: "Weather Alerts",

    pestDetectionTitle: "AI Plant Disease & Pest Diagnosis",
    uploadImageRequired: "Upload Crop/Pest Photo * (Required)",
    descriptionOptional: "Additional Symptoms / Description (Optional)",
    submitDiagnosis: "Run Pest Diagnosis",
    selectImageFirstError: "Please upload a crop or leaf image to run AI diagnosis.",

    profileUpdate: "Profile Information",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    farmPlace: "Farm Place / District",
    emailAddress: "Email Address",
    password: "Password (leave blank to keep current)",
    preferredLanguage: "Preferred Language",
    saveSettings: "Save Settings",
    deleteAccount: "Delete Account",
    deleteAccountConfirmMsg: "Are you sure you want to permanently delete your account? This action cannot be undone.",
    deleteAccountSuccess: "Your account has been deleted successfully.",
    confirmDelete: "Yes, Delete My Account",
    cancel: "Cancel",
  },

  ta: {
    appName: "வளம் · Valam",
    smartFarming: "அறிவார்ந்த விவசாய டிஜிட்டல் உதவி",
    login: "உள்நுழைவு",
    getStarted: "தொடங்குங்கள்",
    logout: "வெளியேறு",
    dashboard: "முகப்பு பலகை",
    weatherForecast: "வானிலை அறிக்கை",
    cropGuide: "பயிர் வழிகாட்டி",
    aiChatbot: "AI உரையாடல் பாட்",
    plantDiagnosis: "பயிர் நோய் & பூச்சி கண்டறிதல்",
    irrigationSolar: "நீர்ப்பாசனம் & சோலார் விவசாயம்",
    marketplace: "சந்தை",
    community: "விவசாயிகள் சமூகம்",
    settings: "அமைப்புகள்",

    totalCrops: "மொத்த பயிர்கள்",
    activeCultivations: "செயலில் உள்ள பயிர்கள்",
    todaysWeather: "இன்றைய வானிலை",
    irrigationStatus: "நீர்ப்பாசன நிலை",
    marketplaceOrders: "சந்தை ஆர்டர்கள்",
    aiRecommendations: "AI பரிந்துரைகள்",
    farmHealthScore: "பண்ணை ஆரோக்கிய மதிப்பெண்",

    weatherAdvisory: "வானிலை & நீர்ப்பாசன வழிகாட்டி",
    currentTemp: "தற்போதைய வெப்பநிலை",
    rainProbability: "மழை வாய்ப்பு",
    humidity: "ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    uvIndex: "UV கதிர்வீச்சு குறியீடு",
    sevenDayForecast: "7 நாட்கள் வானிலை முன்னறிவிப்பு",
    weatherAlerts: "வானிலை எச்சரிக்கைகள்",

    pestDetectionTitle: "AI பயிர் நோய் & பூச்சி பரிசோதனை",
    uploadImageRequired: "பயிர்/இலை புகைப்படம் பதிவேற்றவும் * (கட்டாயம்)",
    descriptionOptional: "கூடுதல் விவரங்கள் (விருப்பமான)",
    submitDiagnosis: "நோய் பரிசோதனை செய்க",
    selectImageFirstError: "தயவுசெய்து பரிசோதனை செய்ய பயிர் புகைப்படத்தைப் பதிவேற்றவும்.",

    profileUpdate: "சுயவிவர அமைப்புகள்",
    fullName: "முழு பெயர்",
    phoneNumber: "தொலைபேசி எண்",
    farmPlace: "பண்ணை அமைவிடம் / மாவட்டம்",
    emailAddress: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    preferredLanguage: "விருப்பமான மொழி",
    saveSettings: "அமைப்புகளைச் சேமிக்கவும்",
    deleteAccount: "கணக்கை நிரந்தரமாக நீக்கு",
    deleteAccountConfirmMsg: "உங்கள் கணக்கை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? இந்த நடவடிக்கையை மீட்டெடுக்க முடியாது.",
    deleteAccountSuccess: "உங்கள் கணக்கு வெற்றிகரமாக நீக்கப்பட்டது.",
    confirmDelete: "ஆம், கணக்கை நீக்கு",
    cancel: "ரத்து செய்",
  },

  si: {
    appName: "வளம் · Valam",
    smartFarming: "බුද්ධිමත් ගොවිතැන් සහකාර",
    login: "ඇතුළු වන්න",
    getStarted: "ආරම්භ කරන්න",
    logout: "නික්මෙන්න",
    dashboard: "පුවරුව",
    weatherForecast: "කාලගුණ අනාවැකිය",
    cropGuide: "වගා මාර්ගෝපදේශය",
    aiChatbot: "AI චැට්බොට්",
    plantDiagnosis: "රෝග හා පලිබෝධ හඳුනාගැනීම",
    irrigationSolar: "වාරිමාර්ග හා සූර්ය බලශක්ති",
    marketplace: "වෙළඳපොළ",
    community: "ගොවි ප්‍රජාව",
    settings: "සැකසීම්",

    totalCrops: "මුළු වගාවන්",
    activeCultivations: "සක්‍රිය වගාවන්",
    todaysWeather: "අද කාලගුණය",
    irrigationStatus: "වාරිමාර්ග තත්ත්වය",
    marketplaceOrders: "වෙළඳපොළ ඇණවුම්",
    aiRecommendations: "AI නිර්දේශ",
    farmHealthScore: "ගොවිපළ සෞඛ්‍ය ලකුණ",

    weatherAdvisory: "කාලගුණ හා වාරිමාර්ග උපදෙස්",
    currentTemp: "වත්මන් උෂ්ණත්වය",
    rainProbability: "වැසි සම්භාවිතාව",
    humidity: "ආර්ද්‍රතාවය",
    windSpeed: "සුළඟේ වේගය",
    uvIndex: "UV දර්ශකය",
    sevenDayForecast: "දින 7 කාලගුණ අනාවැකිය",
    weatherAlerts: "කාලගුණ අනතුරු ඇඟවීම්",

    pestDetectionTitle: "AI ශාක රෝග සහ පලිබෝධ නිරීක්ෂණය",
    uploadImageRequired: "වගා/කොළ ඡායාරූපය ලබාදෙන්න * (අනිවාර්යයි)",
    descriptionOptional: "අමතර විස්තර (අත්‍යවශ්‍ය නොවේ)",
    submitDiagnosis: "රෝගය පරීක්ෂා කරන්න",
    selectImageFirstError: "කරුණාකර පරීක්ෂාව සඳහා ඡායාරූපයක් එක් කරන්න.",

    profileUpdate: "පැතිකඩ සැකසීම්",
    fullName: "සම්පූර්ණ නම",
    phoneNumber: "දුරකථන අංකය",
    farmPlace: "ගොවිපළ පිහිටීම / දිස්ත්‍රික්කය",
    emailAddress: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",
    preferredLanguage: "භාෂාව",
    saveSettings: "සැකසීම් සුරකින්න",
    deleteAccount: "ගිණුම ස්ථිරවම මකා දමන්න",
    deleteAccountConfirmMsg: "ඔබේ ගිණුම ස්ථිරවම මකා දැමීමට අවශ්‍යද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.",
    deleteAccountSuccess: "ඔබේ ගිණුම සාර්ථකව මකා දමන ලදී.",
    confirmDelete: "ඔව්, ගිණුම මකා දමන්න",
    cancel: "අවලංගු කරන්න",
  },
};
