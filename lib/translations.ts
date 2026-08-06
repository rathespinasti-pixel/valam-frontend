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
  register: string;
  createAccount: string;

  // Registration & User details
  profileUpdate: string;
  fullName: string;
  phoneNumber: string;
  farmPlace: string;
  emailAddress: string;
  password: string;
  preferredLanguage: string;
  farmingCategory: string;
  farmerRole: string;
  homeGardenerRole: string;
  terraceGardenerRole: string;
  beginnerRole: string;

  // Location (Northern Province)
  farmLocation: string;
  district: string;
  dsDivision: string;
  gnDivision: string;

  // Land Details
  landDetails: string;
  landSize: string;
  landUnit: string;
  acres: string;
  perches: string;
  hectares: string;
  squareFeet: string;

  // Preferences
  irrigationPreference: string;
  dripIrrigation: string;
  sprinklerIrrigation: string;
  manualWatering: string;

  fertilizerPreference: string;
  organicFertilizer: string;
  chemicalFertilizer: string;

  // Dashboard Overview Cards & Daily Assistant
  totalCrops: string;
  activeCultivations: string;
  todaysWeather: string;
  irrigationStatus: string;
  marketplaceOrders: string;
  aiRecommendations: string;
  farmHealthScore: string;

  currentCrop: string;
  daysSincePlanting: string;
  currentGrowthStage: string;
  progressPercentage: string;
  todaysTasks: string;
  weatherSummary: string;
  wateringRecommendation: string;
  fertilizerReminder: string;

  // Crop Lifecycle Stages
  stage1Title: string;
  stage2Title: string;
  stage3Title: string;
  stage1Desc: string;
  stage2Desc: string;
  stage3Desc: string;
  expectedAppearance: string;
  completedTasks: string;
  upcomingTasks: string;
  stageDetails: string;

  // Weather Rules
  weatherAdvisory: string;
  weatherHeroSubtitle: string;
  selectLocation: string;
  currentTemp: string;
  rainProbability: string;
  humidity: string;
  windSpeed: string;
  uvIndex: string;
  sevenDayForecast: string;
  fiveDayForecast: string;
  weatherAlerts: string;
  skipWateringRain: string;
  waterCropSunny: string;
  waterCoolerHours: string;
  actionableFarmingAdvice: string;
  fetchingWeather: string;
  couldNotLoadWeather: string;
  currentCondition: string;

  // Calculations & Guidance & Smart Irrigation
  smartIrrigationPlanner: string;
  irrigationHeroSubtitle: string;
  step1CollectInfo: string;
  step2GenerateReport: string;
  cropVarietyOptional: string;
  growthStage: string;
  seedlingStage: string;
  vegetativeStage: string;
  floweringStage: string;
  fruitingStage: string;
  waterSource: string;
  waterTank: string;
  well: string;
  borewell: string;
  canal: string;
  river: string;
  municipalWater: string;
  otherSource: string;
  pumpCapacityHp: string;
  waterFlowRate: string;
  soilType: string;
  sandySoil: string;
  loamySoil: string;
  claySoil: string;
  terrain: string;
  flatTerrain: string;
  slightSlope: string;
  steepTerrain: string;
  generateIrrigationPlan: string;
  pipeLayoutSummary: string;
  subMainPipeLength: string;
  totalPipeRequirement: string;
  numberOfLaterals: string;
  lengthOfEachLateral: string;
  totalLateralLength: string;
  emitterSpacing: string;
  recommendedPipeDiameter: string;
  filterRecommendation: string;
  pressureRegulator: string;
  controlValves: string;
  sprinklerType: string;
  branchPipeLength: string;
  materialQuotation: string;
  itemDescription: string;
  estimatedQuantity: string;
  waterRequirementPerPlant: string;
  dailyWaterRequirement: string;
  weeklyWaterRequirement: string;
  waterSavingTips: string;
  plantSpacing: string;
  rowSpacing: string;
  estimatedPlants: string;
  irrigationGuidance: string;
  wateringSchedule: string;
  wateringDuration: string;
  pipeCalculation: string;
  mainPipeLength: string;
  lateralPipeLength: string;
  numberOfEmitters: string;
  numberOfSprinklers: string;
  sprinklerCoverage: string;

  // Pest & Disease Diagnosis
  pestDetectionTitle: string;
  diagnosisHeroSubtitle: string;
  diagnosisNotice: string;
  uploadImageHeader: string;
  targetCropLabel: string;
  affectedPartLabel: string;
  clickToSelectPhoto: string;
  supportedFormats: string;
  pasteImageUrlPlaceholder: string;
  symptomsPlaceholder: string;
  analyzingPhoto: string;
  aiDiagnosisResult: string;
  noDiagnosisYet: string;
  noDiagnosisSubtitle: string;
  diagnosisHistory: string;
  leafPart: string;
  stemPart: string;
  fruitPart: string;
  uploadImageRequired: string;
  descriptionOptional: string;
  submitDiagnosis: string;
  selectImageFirstError: string;
  possibleDisease: string;
  cause: string;
  organicTreatment: string;
  chemicalTreatment: string;
  preventionAdvice: string;

  // Notifications
  notificationsTitle: string;
  wateringReminder: string;
  rainAlert: string;
  fertilizerAlert: string;
  floweringAlert: string;
  harvestAlert: string;
  diseaseAlert: string;

  // Shared Buttons & Actions
  save: string;
  edit: string;
  delete: string;
  update: string;
  search: string;
  filter: string;
  next: string;
  previous: string;
  viewDetails: string;
  backToHome: string;
  saveSettings: string;
  deleteAccount: string;
  deleteAccountConfirmMsg: string;
  deleteAccountSuccess: string;
  confirmDelete: string;
  cancel: string;
  addCrop: string;
  cropName: string;
  variety: string;
  plantingDate: string;
  plantingMethod: string;

  // Admin Panel
  adminPortalTitle: string;
  adminPortalSub: string;
  addCropGuide: string;
  activeCropGuides: string;
  forumModeration: string;
  season: string;
  waterRequirements: string;
  fertilizerGuidance: string;
  commonProblems: string;
  basicSolutions: string;
  saveGuide: string;
  deletePostConfirm: string;

  // Error Pages
  pageNotFoundTitle: string;
  pageNotFoundDesc: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: "வளம் · Valam",
    smartFarming: "Smart Crop Assistant",
    login: "Login",
    getStarted: "Get Started",
    logout: "Log out",
    dashboard: "Dashboard",
    weatherForecast: "Weather Forecast",
    cropGuide: "Crop Guide",
    aiChatbot: "AI Assistant",
    plantDiagnosis: "Disease Detection",
    irrigationSolar: "Irrigation Planning",
    marketplace: "Marketplace",
    community: "Community",
    settings: "Settings",
    register: "Register",
    createAccount: "Create Your Account",

    profileUpdate: "Profile Information",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    farmPlace: "Farm Place / District",
    emailAddress: "Email Address",
    password: "Password",
    preferredLanguage: "Preferred Language",
    farmingCategory: "Farming Category",
    farmerRole: "Farmer",
    homeGardenerRole: "Home Gardener",
    terraceGardenerRole: "Terrace Gardener",
    beginnerRole: "Beginner",

    farmLocation: "Farm Location",
    district: "District (Northern Province)",
    dsDivision: "DS Division",
    gnDivision: "GN Division (Optional)",

    landDetails: "Land Details",
    landSize: "Land Size",
    landUnit: "Unit",
    acres: "Acres",
    perches: "Perches",
    hectares: "Hectares",
    squareFeet: "Square Feet",

    irrigationPreference: "Irrigation Preference",
    dripIrrigation: "Drip Irrigation",
    sprinklerIrrigation: "Sprinkler Irrigation",
    manualWatering: "Manual Watering",

    fertilizerPreference: "Fertilizer Preference",
    organicFertilizer: "Organic Fertilizer",
    chemicalFertilizer: "Chemical Fertilizer",

    totalCrops: "Total Crops",
    activeCultivations: "Active Cultivations",
    todaysWeather: "Today's Weather",
    irrigationStatus: "Irrigation Status",
    marketplaceOrders: "Marketplace Orders",
    aiRecommendations: "AI Recommendations",
    farmHealthScore: "Farm Health Score",

    currentCrop: "Current Crop",
    daysSincePlanting: "Days Since Planting",
    currentGrowthStage: "Current Growth Stage",
    progressPercentage: "Progress",
    todaysTasks: "Today's Recommended Tasks",
    weatherSummary: "Weather Summary",
    wateringRecommendation: "Watering Recommendation",
    fertilizerReminder: "Fertilizer Reminder",

    stage1Title: "Stage 1: Seedling / Nursery / Transplanting",
    stage2Title: "Stage 2: Flowering Stage",
    stage3Title: "Stage 3: Fruiting & Harvest",
    stage1Desc: "Germination, root establishment & seedling vigor.",
    stage2Desc: "Bloom formation, pollination & nutrient intake.",
    stage3Desc: "Fruit development, maturation & pickings.",
    expectedAppearance: "Expected Plant Appearance",
    completedTasks: "Completed Tasks",
    upcomingTasks: "Upcoming Tasks",
    stageDetails: "Stage Details & Recommendations",

    weatherAdvisory: "Northern Province Weather Advisory",
    weatherHeroSubtitle: "Real-time weather data converted into actionable farming decisions: spray alerts, irrigation timing, and crop heat stress warnings.",
    selectLocation: "Select Location",
    currentTemp: "Current Temperature",
    rainProbability: "Rain Probability",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    uvIndex: "UV Index",
    sevenDayForecast: "7-Day Weather Forecast",
    fiveDayForecast: "5-Day Weather Forecast",
    weatherAlerts: "Weather Alerts",
    skipWateringRain: "Raining today — Skip watering.",
    waterCropSunny: "Sunny condition — Water crop as scheduled.",
    waterCoolerHours: "High temperature — Water during early morning or late evening.",
    actionableFarmingAdvice: "Actionable Farming Advice for Today",
    fetchingWeather: "Fetching weather forecast...",
    couldNotLoadWeather: "Could not load weather advisory data.",
    currentCondition: "Current Weather Condition",

    // Calculations & Guidance & Smart Irrigation
    smartIrrigationPlanner: "Smart Irrigation Planner",
    irrigationHeroSubtitle: "Plan your pipe layout, calculate water requirements, and generate an itemized material quotation tailored to your crop and land size.",
    step1CollectInfo: "1. Enter Farm & Crop Details",
    step2GenerateReport: "2. View Smart Irrigation Plan Report",
    cropVarietyOptional: "Crop Variety (Optional)",
    growthStage: "Current Growth Stage",
    seedlingStage: "Seedling / Nursery",
    vegetativeStage: "Vegetative / Growth",
    floweringStage: "Flowering Stage",
    fruitingStage: "Fruiting / Harvest",
    waterSource: "Water Source",
    waterTank: "Water Tank",
    well: "Open Well",
    borewell: "Borewell / Tube Well",
    canal: "Irrigation Canal",
    river: "River / Stream",
    municipalWater: "Municipal Water Supply",
    otherSource: "Other Water Source",
    pumpCapacityHp: "Pump Capacity (HP, Optional)",
    waterFlowRate: "Water Flow Rate (L/h, Optional)",
    soilType: "Soil Type",
    sandySoil: "Sandy Soil (High Drainage)",
    loamySoil: "Loamy Soil (Ideal Retention)",
    claySoil: "Clay Soil (Slow Drainage)",
    terrain: "Terrain",
    flatTerrain: "Flat Land",
    slightSlope: "Slight Slope",
    steepTerrain: "Steep Slope",
    generateIrrigationPlan: "Generate Smart Irrigation Plan",
    pipeLayoutSummary: "Pipe Layout Summary",
    subMainPipeLength: "Sub Main Pipe Length",
    totalPipeRequirement: "Total Pipe Requirement",
    numberOfLaterals: "Number of Laterals",
    lengthOfEachLateral: "Length of Each Lateral",
    totalLateralLength: "Total Lateral Pipe Length",
    emitterSpacing: "Emitter Spacing",
    recommendedPipeDiameter: "Recommended Pipe Diameters",
    filterRecommendation: "Filter Recommendation",
    pressureRegulator: "Pressure Regulator",
    controlValves: "Control Valves",
    sprinklerType: "Recommended Sprinkler Type",
    branchPipeLength: "Branch Pipe Length",
    materialQuotation: "Estimated Material List & Quotation",
    itemDescription: "Item Description",
    estimatedQuantity: "Estimated Quantity",
    waterRequirementPerPlant: "Daily Water / Plant",
    dailyWaterRequirement: "Total Daily Water Requirement",
    weeklyWaterRequirement: "Weekly Water Requirement",
    waterSavingTips: "Water Saving & Conservation Tips",
    plantSpacing: "Plant Spacing",
    rowSpacing: "Row Spacing",
    estimatedPlants: "Estimated Plant Population",
    irrigationGuidance: "Irrigation Guidance",
    wateringSchedule: "Watering Schedule",
    wateringDuration: "Recommended Duration",
    pipeCalculation: "Drip / Sprinkler Hardware Estimation",
    mainPipeLength: "Main Pipe Length",
    lateralPipeLength: "Lateral Pipe Length",
    numberOfEmitters: "Estimated Emitters",
    numberOfSprinklers: "Estimated Sprinklers",
    sprinklerCoverage: "Sprinkler Coverage Area",

    // Pest & Disease Diagnosis
    pestDetectionTitle: "Plant Disease & Pest Detection",
    diagnosisHeroSubtitle: "Upload a photo of affected Leaf, Stem, or Fruit to receive cause, organic treatment, chemical treatment, and prevention advice.",
    diagnosisNotice: "Decision Support Notice: Disease diagnosis results are tailored to Northern Province, Sri Lanka. Consult your local ASC agricultural officer for widespread outbreaks.",
    uploadImageHeader: "Upload Image for Diagnosis",
    targetCropLabel: "Target Crop *",
    affectedPartLabel: "Affected Plant Part *",
    clickToSelectPhoto: "Click to select photo of Leaf, Stem, or Fruit",
    supportedFormats: "PNG, JPG, JPEG supported",
    pasteImageUrlPlaceholder: "Or paste image URL (https://...)",
    symptomsPlaceholder: "e.g. Leaf curling with black spots observed on lower branches...",
    analyzingPhoto: "Analyzing Crop Photo...",
    aiDiagnosisResult: "AI Disease Diagnosis",
    noDiagnosisYet: "No Diagnosis Run Yet",
    noDiagnosisSubtitle: "Select target crop, choose affected part (Leaf, Stem, Fruit), and upload a clear photo on the left.",
    diagnosisHistory: "Diagnosis History",
    leafPart: "Leaf",
    stemPart: "Stem",
    fruitPart: "Fruit",
    uploadImageRequired: "Upload Crop / Leaf Photo * (Required)",
    descriptionOptional: "Additional Symptoms / Observations (Optional)",
    submitDiagnosis: "Analyze Disease Photo",
    selectImageFirstError: "Please upload or capture a crop photo for diagnosis.",
    possibleDisease: "Possible Disease / Issue",
    cause: "Probable Cause",
    organicTreatment: "Organic Treatment",
    chemicalTreatment: "Chemical Treatment (Sri Lanka Approved)",
    preventionAdvice: "Prevention Advice",

    notificationsTitle: "Crop & Field Reminders",
    wateringReminder: "Watering Reminder",
    rainAlert: "Rain Advisory Alert",
    fertilizerAlert: "Fertilizer Application Reminder",
    floweringAlert: "Flowering Stage Advisory",
    harvestAlert: "Expected Harvest Readiness",
    diseaseAlert: "Local Pest Threat Warning",

    save: "Save",
    edit: "Edit",
    delete: "Delete",
    update: "Update",
    search: "Search",
    filter: "Filter",
    next: "Next",
    previous: "Previous",
    viewDetails: "View Details",
    backToHome: "Back to Home",
    saveSettings: "Save Profile Settings",
    deleteAccount: "Delete Account",
    deleteAccountConfirmMsg: "Are you sure you want to permanently delete your account?",
    deleteAccountSuccess: "Account deleted successfully.",
    confirmDelete: "Yes, Delete Account",
    cancel: "Cancel",
    addCrop: "Add Crop",
    cropName: "Crop Name",
    variety: "Variety",
    plantingDate: "Planting Date",
    plantingMethod: "Planting Method",

    adminPortalTitle: "Valam Platform Administration",
    adminPortalSub: "Management portal for crop knowledge guides, disease database, and forum moderation.",
    addCropGuide: "Add Crop Guide Knowledge",
    activeCropGuides: "Active Crop Guides",
    forumModeration: "Forum Posts Moderation",
    season: "Recommended Season",
    waterRequirements: "Water Requirements",
    fertilizerGuidance: "Fertilizer Guidance",
    commonProblems: "Common Problems",
    basicSolutions: "Basic Solutions",
    saveGuide: "Save Guide",
    deletePostConfirm: "Are you sure you want to delete this community post for moderation?",

    pageNotFoundTitle: "404 - Page Not Found",
    pageNotFoundDesc: "The page you are looking for does not exist or has been moved.",
  },

  ta: {
    appName: "வளம் · Valam",
    smartFarming: "அறிவார்ந்த பயிர் வளர்ப்பு உதவி",
    login: "உள்நுழைவு",
    getStarted: "தொடங்குங்கள்",
    logout: "வெளியேறு",
    dashboard: "முகப்பு பலகை",
    weatherForecast: "வானிலை அறிக்கை",
    cropGuide: "பயிர் வழிகாட்டி",
    aiChatbot: "AI விவசாய உதவி",
    plantDiagnosis: "பயிர் நோய் கண்டறிதல்",
    irrigationSolar: "நீர்ப்பாசன திட்டம்",
    marketplace: "சந்தை",
    community: "விவசாயிகள் சமூகம்",
    settings: "அமைப்புகள்",
    register: "பதிவு செய்க",
    createAccount: "உங்கள் கணக்கை உருவாக்குங்கள்",

    profileUpdate: "சுயவிவர அமைப்புகள்",
    fullName: "முழு பெயர்",
    phoneNumber: "தொலைபேசி எண்",
    farmPlace: "பண்ணை அமைவிடம் / மாவட்டம்",
    emailAddress: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    preferredLanguage: "விருப்பமான மொழி",
    farmingCategory: "விவசாய வகை",
    farmerRole: "விவசாயி",
    homeGardenerRole: "வீட்டுத் தோட்டம் வளர்ப்பவர்",
    terraceGardenerRole: "மாடித் தோட்டம் வளர்ப்பவர்",
    beginnerRole: "ஆரம்பநிலையாளர்",

    farmLocation: "பண்ணை அமைவிடம்",
    district: "மாவட்டம் (வட மாகாணம்)",
    dsDivision: "பிராந்திய செயலகப் பிரிவு (DS Division)",
    gnDivision: "கிராம நிலாதாரி பிரிவு (விருப்பமான)",

    landDetails: "நில விவரங்கள்",
    landSize: "நில அளவு",
    landUnit: "அலகு",
    acres: "ஏக்கர்",
    perches: "பர்ச்சஸ்",
    hectares: "ஹெக்டேர்",
    squareFeet: "சதுர அடி",

    irrigationPreference: "நீர்ப்பாசன விருப்பம்",
    dripIrrigation: "சொட்டுநீர் பாசனம் (Drip)",
    sprinklerIrrigation: "தெளிப்புநீர் பாசனம் (Sprinkler)",
    manualWatering: "கைமுறை நீர்ப்பாசனம்",

    fertilizerPreference: "உர விருப்பம்",
    organicFertilizer: "இயற்கை உரம் (Organic)",
    chemicalFertilizer: "இரசாயன உரம் (Chemical)",

    totalCrops: "மொத்த பயிர்கள்",
    activeCultivations: "செயலில் உள்ள பயிர்கள்",
    todaysWeather: "இன்றைய வானிலை",
    irrigationStatus: "நீர்ப்பாசன நிலை",
    marketplaceOrders: "சந்தை ஆர்டர்கள்",
    aiRecommendations: "AI பரிந்துரைகள்",
    farmHealthScore: "பண்ணை ஆரோக்கிய மதிப்பெண்",

    currentCrop: "தற்போதைய பயிர்",
    daysSincePlanting: "நட்ட நாட்களின் எண்ணிக்கை",
    currentGrowthStage: "தற்போதைய வளர்ச்சி நிலை",
    progressPercentage: "வளர்ச்சி சதவீதம்",
    todaysTasks: "இன்றைய பரிந்துரைக்கப்பட்ட பணிகள்",
    weatherSummary: "வானிலை சுருக்கம்",
    wateringRecommendation: "நீர்ப்பாசன வழிகாட்டி",
    fertilizerReminder: "உரமிடுதல் நினைவூட்டல்",

    stage1Title: "நிலை 1: நாற்று / நாற்றங்கால் / நடுவு நிலை",
    stage2Title: "நிலை 2: பூக்கும் நிலை",
    stage3Title: "நிலை 3: காய்க்கும் & அறுவடை நிலை",
    stage1Desc: "விதை முளைப்பு, வேர் வளர்ச்சி மற்றும் நாற்று ஆரோக்கியம்.",
    stage2Desc: "பூ மொட்டு உருவாக்கம், மகரந்தச்சேர்க்கை மற்றும் சத்து உறிஞ்சுதல்.",
    stage3Desc: "காய் வளர்ச்சி, முதிர்ச்சி மற்றும் அறுவடை.",
    expectedAppearance: "எதிர்பார்க்கப்படும் பயிர் தோற்றம்",
    completedTasks: "நிறைவடைந்த பணிகள்",
    upcomingTasks: "அடுத்தடுத்த பணிகள்",
    stageDetails: "வளர்ச்சி நிலை விவரங்கள் & ஆலோசனைகள்",

    weatherAdvisory: "வட மாகாண வானிலை வழிகாட்டி",
    weatherHeroSubtitle: "நிகழ்நேர வானிலை தரவு விவசாய முடிவுகளாக மாற்றப்படுகிறது: மருந்து தெளித்தல், பாசன நேரம் மற்றும் வெப்ப எச்சரிக்கைகள்.",
    selectLocation: "இடத்தைத் தேர்ந்தெடுக்கவும்",
    currentTemp: "தற்போதைய வெப்பநிலை",
    rainProbability: "மழை வாய்ப்பு",
    humidity: "ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    uvIndex: "UV குறியீடு",
    sevenDayForecast: "7 நாள் வானிலை முன்னறிவிப்பு",
    fiveDayForecast: "5 நாள் வானிலை முன்னறிவிப்பு",
    weatherAlerts: "வானிலை எச்சரிக்கைகள்",
    skipWateringRain: "இன்று மழை பொழிகிறது — நீர்ப்பாசனத்தை தவிர்க்கவும்.",
    waterCropSunny: "வெயில் உள்ள காலநிலை — திட்டமிட்டபடி நீர் பாய்ச்சவும்.",
    waterCoolerHours: "அதிக வெப்பநிலை — காலை அல்லது மாலை வேளையில் நீர் பாய்ச்சவும்.",
    actionableFarmingAdvice: "இன்றைய விவசாய ஆலோசனைகள்",
    fetchingWeather: "வானிலை விவரங்கள் பெறப்படுகின்றன...",
    couldNotLoadWeather: "வானிலை விபரங்களைப் பெற முடியவில்லை.",
    currentCondition: "தற்போதைய வானிலை நிலை",

    // Calculations & Guidance & Smart Irrigation
    smartIrrigationPlanner: "ஸ்மார்ட் நீர்ப்பாசன திட்டமிடுபவர்",
    irrigationHeroSubtitle: "உங்கள் பயிர் மற்றும் நில அளவிற்கு ஏற்ப குழாய் அமைப்பை திட்டமிட்டு, நீர் தேவைகளை கணக்கிட்டு, பொருட்களின் மதிப்பீட்டு பட்டியலைப் பெறுங்கள்.",
    step1CollectInfo: "1. பண்ணை மற்றும் பயிர் விவரங்களை உள்ளிடவும்",
    step2GenerateReport: "2. ஸ்மார்ட் நீர்ப்பாசன திட்ட அறிக்கையைப் பார்க்கவும்",
    cropVarietyOptional: "பயிர் ரகம் (விருப்பமானது)",
    growthStage: "தற்போதைய வளர்ச்சி நிலை",
    seedlingStage: "நாற்று / நாற்றங்கால் நிலை",
    vegetativeStage: "வளர்ச்சி / தண்டு நிலை",
    floweringStage: "பூக்கும் நிலை",
    fruitingStage: "காய்க்கும் / அறுவடை நிலை",
    waterSource: "நீர் ஆதாரம்",
    waterTank: "நீர் தொட்டி (Water Tank)",
    well: "திறந்த கிணறு (Open Well)",
    borewell: "ஆழ்துளை கிணறு (Borewell)",
    canal: "பாசனக் கால்வாய்",
    river: "ஆறு / ஓடை",
    municipalWater: "நகராட்சி நீர் வழங்கல்",
    otherSource: "இதர நீர் ஆதாரம்",
    pumpCapacityHp: "பம்பின் திறன் (HP, விருப்பமானது)",
    waterFlowRate: "நீர் பாய்ச்சல் வீதம் (L/h, விருப்பமானது)",
    soilType: "மண் வகை",
    sandySoil: "மணல் மண் (அதிக நீர் வடிகால்)",
    loamySoil: "வண்டல் மண் (சிறந்த நீர் தேக்கம்)",
    claySoil: "களிமண் (மெதுவான வடிகால்)",
    terrain: "நில அமைப்பு",
    flatTerrain: "சமவெளி நிலம்",
    slightSlope: "சிறிய சாய்வு",
    steepTerrain: "அதிக சாய்வு",
    generateIrrigationPlan: "நீர்ப்பாசன திட்டத்தை உருவாக்கவும்",
    pipeLayoutSummary: "குழாய் அமைப்பு சுருக்கம்",
    subMainPipeLength: "துணைக் முதன்மை குழாய் நீளம்",
    totalPipeRequirement: "மொத்த குழாய் தேவை",
    numberOfLaterals: "கிளை குழாய்களின் எண்ணிக்கை (Laterals)",
    lengthOfEachLateral: "ஒரு கிளை குழாயின் நீளம்",
    totalLateralLength: "மொத்த கிளை குழாய் நீளம்",
    emitterSpacing: "சொட்டுப்பான் இடைவெளி",
    recommendedPipeDiameter: "பரிந்துரைக்கப்படும் குழாய் விட்டங்கள்",
    filterRecommendation: "வடிகட்டி பரிந்துரை (Filter)",
    pressureRegulator: "அழுத்த சீராக்கி (Pressure Regulator)",
    controlValves: "கட்டுப்பாட்டு வால்வுகள் (Valves)",
    sprinklerType: "பரிந்துரைக்கப்படும் தெளிப்பான் வகை",
    branchPipeLength: "கிளை குழாய் நீளம்",
    materialQuotation: "தேவைப்படும் பொருட்கள் மதிப்பீட்டு பட்டியல்",
    itemDescription: "பொருள் விவரம்",
    estimatedQuantity: "மதிப்பிடப்பட்ட அளவு",
    waterRequirementPerPlant: "செடிக்கான தினசரி நீர்",
    dailyWaterRequirement: "மொத்த தினசரி நீர் தேவை",
    weeklyWaterRequirement: "வாராந்திர நீர் தேவை",
    waterSavingTips: "நீர் சேமிப்பு மற்றும் பாதுகாப்பு ஆலோசனைகள்",
    plantSpacing: "செடி இடைவெளி",
    rowSpacing: "வரிசை இடைவெளி",
    estimatedPlants: "எதிர்பார்க்கப்படும் மொத்த செடிகள்",
    irrigationGuidance: "நீர்ப்பாசன வழிகாட்டுதல்",
    wateringSchedule: "நீர்ப்பாசன அட்டவணை",
    wateringDuration: "பரிந்துரைக்கப்படும் நேரம்",
    pipeCalculation: "குழாய் மற்றும் சொட்டுநீர் கணக்கீடு",
    mainPipeLength: "முதன்மை குழாய் நீளம்",
    lateralPipeLength: "கிளை குழாய் நீளம்",
    numberOfEmitters: "தேவைப்படும் சொட்டுப்பான்கள் (Emitters)",
    numberOfSprinklers: "தேவைப்படும் தெளிப்பான்கள் (Sprinklers)",
    sprinklerCoverage: "தெளிப்பு பரப்பு",

    // Pest & Disease Diagnosis
    pestDetectionTitle: "பயிர் நோய் மற்றும் பூச்சி கண்டறிதல்",
    diagnosisHeroSubtitle: "காரணம், இயற்கை சிகிச்சை, இரசாயன சிகிச்சை மற்றும் தடுப்பு ஆலோசனைகளைப் பெற இலை, தண்டு அல்லது காயின் புகைப்படத்தைப் பதிவேற்றவும்.",
    diagnosisNotice: "முடிவு ஆதரவு அறிவிப்பு: நோய் கண்டறிதல் முடிவுகள் இலங்கையின் வட மாகாணத்திற்கு ஏற்ப தயாரிக்கப்பட்டுள்ளன. பெரிய அளவிலான நோய் பரவலுக்கு உங்கள் உள்ளூர் ASC விவசாய அதிகாரியை அணுகவும்.",
    uploadImageHeader: "பரிசோதனைக்கு புகைப்படத்தைப் பதிவேற்றவும்",
    targetCropLabel: "இலக்கு பயிர் *",
    affectedPartLabel: "பாதிக்கப்பட்ட பயிர் பகுதி *",
    clickToSelectPhoto: "இலை, தண்டு அல்லது காயின் புகைப்படத்தைத் தேர்ந்தெடுக்க கிளிக் செய்யவும்",
    supportedFormats: "PNG, JPG, JPEG ஆதரிக்கப்படுகின்றன",
    pasteImageUrlPlaceholder: "அல்லது புகைப்படத்தின் URL ஐ ஒட்டவும் (https://...)",
    symptomsPlaceholder: "எ.கா. கீழ் கிளைகளில் கருப்பு புள்ளிகளுடன் இலை சுருக்கம் காணப்படுகிறது...",
    analyzingPhoto: "பயிரின் புகைப்படம் பரிசீலிக்கப்படுகிறது...",
    aiDiagnosisResult: "AI பயிர் நோய் அறிக்கை",
    noDiagnosisYet: "இன்னும் நோய் சோதனை செய்யப்படவில்லை",
    noDiagnosisSubtitle: "இடது புறத்தில் பயிரைத் தேர்ந்தெடுத்து புகைப்படத்தைப் பதிவேற்றி நோயைக் கண்டறியவும்.",
    diagnosisHistory: "நோய் பரிசோதனை வரலாறு",
    leafPart: "இலை",
    stemPart: "தண்டு",
    fruitPart: "காய் / பழம்",
    uploadImageRequired: "பயிர் / இலை புகைப்படம் பதிவேற்றவும் * (கட்டாயம்)",
    descriptionOptional: "கூடுதல் அறிகுறிகள் / அவதானிப்புகள் (விருப்பமானது)",
    submitDiagnosis: "நோயைப் பரிசோதிக்கவும்",
    selectImageFirstError: "பரிசோதனைக்கு பயிரின் புகைப்படத்தைப் பதிவேற்றவும்.",
    possibleDisease: "சாத்தியமான நோய் / பிரச்சனை",
    cause: "சாத்தியமான காரணம்",
    organicTreatment: "இயற்கை சிகிச்சை முறை",
    chemicalTreatment: "இரசாயன சிகிச்சை (இலங்கை விவசாய பரிந்துரை)",
    preventionAdvice: "தடுப்பு ஆலோசனைகள்",

    notificationsTitle: "பயிர் நினைவூட்டல்கள்",
    wateringReminder: "நீர் பாசன நினைவூட்டல்",
    rainAlert: "மழை எச்சரிக்கை",
    fertilizerAlert: "உரமிடும் நேர நினைவூட்டல்",
    floweringAlert: "பூக்கும் நிலை ஆலோசனை",
    harvestAlert: "அறுவடை தயார் நிலை",
    diseaseAlert: "பூச்சி/நோய் எச்சரிக்கை",

    save: "சேமிக்க",
    edit: "திருத்த",
    delete: "நீக்க",
    update: "புதுப்பிக்க",
    search: "தேட",
    filter: "வடிகட்ட",
    next: "அடுத்து",
    previous: "முந்தைய",
    viewDetails: "விவரங்களைப் பார்க்க",
    backToHome: "முகப்புப் பக்கத்திற்குச் செல்ல",
    saveSettings: "சுயவிவர அமைப்புகளைச் சேமிக்க",
    deleteAccount: "கணக்கை நீக்க",
    deleteAccountConfirmMsg: "உங்கள் கணக்கை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?",
    deleteAccountSuccess: "கணக்கு வெற்றிகரமாக நீக்கப்பட்டது.",
    confirmDelete: "ஆம், கணக்கை நீக்கு",
    cancel: "ரத்து செய்",
    addCrop: "பயிரைச் சேர்க்க",
    cropName: "பயிர் பெயர்",
    variety: "வகை",
    plantingDate: "நட்ட தேதி",
    plantingMethod: "நடும் முறை",

    adminPortalTitle: "வளம் தள நிர்வாகம்",
    adminPortalSub: "பயிர் வழிகாட்டிகள், நோய் தரவுத்தளம் மற்றும் மன்ற அமைப்பிற்கான நிர்வாக தளம்.",
    addCropGuide: "புதிய பயிர் வழிகாட்டியைச் சேர்க்க",
    activeCropGuides: "செயலில் உள்ள பயிர் வழிகாட்டிகள்",
    forumModeration: "மன்றப் பதிவுகள் நிர்வாகம்",
    season: "பரிந்துரைக்கப்பட்ட பருவம்",
    waterRequirements: "நீர் தேவைகள்",
    fertilizerGuidance: "உர வழிகாட்டுதல்",
    commonProblems: "பொதுவான பிரச்சனைகள்",
    basicSolutions: "அடிப்படை தீர்வுகள்",
    saveGuide: "வழிகாட்டியைச் சேமிக்க",
    deletePostConfirm: "இந்த மன்றப் பதிவை நீக்க உறுதியாக இருக்கிறீர்களா?",

    pageNotFoundTitle: "404 - பக்கம் காணப்படவில்லை",
    pageNotFoundDesc: "நீங்கள் தேடும் பக்கம் இல்லை அல்லது நகர்த்தப்பட்டுவிட்டது.",
  },

  si: {
    appName: "வளம் · Valam",
    smartFarming: "බුද්ධිමත් වගා සහකාර",
    login: "ඇතුළු වන්න",
    getStarted: "ආරම්භ කරන්න",
    logout: "නික්මෙන්න",
    dashboard: "පුවරුව",
    weatherForecast: "කාලගුණ අනාවැකිය",
    cropGuide: "වගා මාර්ගෝපදේශය",
    aiChatbot: "AI උපදේශක",
    plantDiagnosis: "රෝග හඳුනාගැනීම",
    irrigationSolar: "වාරිමාර්ග සැලසුම්",
    marketplace: "වෙළඳපොළ",
    community: "ගොවි ප්‍රජාව",
    settings: "සැකසීම්",
    register: "ලියාපදිංචි වන්න",
    createAccount: "ඔබේ ගිණුම සාදන්න",

    profileUpdate: "පැතිකඩ සැකසීම්",
    fullName: "සම්පූර්ණ නම",
    phoneNumber: "දුරකථන අංකය",
    farmPlace: "ගොවිපළ පිහිටීම / දිස්ත්‍රික්කය",
    emailAddress: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",
    preferredLanguage: "මනාප භාෂාව",
    farmingCategory: "ගොවිතැන් කාණ්ඩය",
    farmerRole: "ගොවියා",
    homeGardenerRole: "ගෙවතු වගාකරු",
    terraceGardenerRole: "පියස්ස වගාකරු",
    beginnerRole: "ආධුනිකයා",

    farmLocation: "ගොවිපළ පිහිටීම",
    district: "දිස්ත්‍රික්කය (උතුරු පළාත)",
    dsDivision: "ප්‍රාදේශීය ලේකම් කොට්ඨාසය",
    gnDivision: "ග්‍රාම නිලධාරී වසම (අත්‍යවශ්‍ය නොවේ)",

    landDetails: "ඉඩම් විස්තර",
    landSize: "ඉඩමේ ප්‍රමාණය",
    landUnit: "ඒකකය",
    acres: "අක්කර",
    perches: "පර්චස්",
    hectares: "හෙක්ටයාර",
    squareFeet: "වර්ග අඩි",

    irrigationPreference: "ජලසම්පාදන ක්‍රමය",
    dripIrrigation: "බිංදු ජලසම්පාදනය",
    sprinklerIrrigation: "විසුරුම් ජලසම්පාදනය",
    manualWatering: "අතින් ජලය දැමීම",

    fertilizerPreference: "පොරොන්දු පොහොර මනාපය",
    organicFertilizer: "කාබනික පොහොර",
    chemicalFertilizer: "සාම්ප්‍රදායික රසායනික පොහොර",

    totalCrops: "මුළු වගාවන්",
    activeCultivations: "සක්‍රිය වගාවන්",
    todaysWeather: "අද කාලගුණය",
    irrigationStatus: "ජලසම්පාදන තත්ත්වය",
    marketplaceOrders: "ඇණවුම්",
    aiRecommendations: "AI උපදෙස්",
    farmHealthScore: "වගා සෞඛ්‍ය ලකුණ",

    currentCrop: "වත්මන් වගාව",
    daysSincePlanting: "සිටුවූ දින ගණන",
    currentGrowthStage: "වත්මන් වර්ධන අවධිය",
    progressPercentage: "වර්ධන ප්‍රගතිය",
    todaysTasks: "අද දින නිර්දේශිත කාර්යයන්",
    weatherSummary: "කාලගුණ සංක්ෂිප්තය",
    wateringRecommendation: "ජලය දැමීමේ උපදෙස",
    fertilizerReminder: "පොහොර යෙදීමේ මතක් කිරීම",

    stage1Title: "අවධිය 1: තැන්පත් / තවාන / පැළ සිටුවීම",
    stage2Title: "අවධිය 2: මල් හටගැනීමේ අවධිය",
    stage3Title: "අවධිය 3: ඵල හටගැනීම සහ අස්වැන්න",
    stage1Desc: "බීජ පැළවීම, මුල් ඇදීම සහ පැළයේ සෞඛ්‍යය.",
    stage2Desc: "මල් පොහොට්ටු සෑදීම සහ පරාගණය.",
    stage3Desc: "ගෙඩි සෑදීම, පැසීම සහ අස්වැන්න නෙලීම.",
    expectedAppearance: "අපේක්ෂිත ශාක ස්වරූපය",
    completedTasks: "සම්පූර්ණ කළ කාර්යයන්",
    upcomingTasks: "ඉදිරි කාර්යයන්",
    stageDetails: "අවධි විස්තර සහ උපදෙස්",

    weatherAdvisory: "උතුරු පළාත් කාලගුණ උපදෙස්",
    weatherHeroSubtitle: "තථ්‍ය කාලීන කාලගුණ දත්ත ගොවිතැන් තීරණ බවට පරිවර්තනය කෙරේ: පොහොර යෙදීම්, ජලසම්පාදන වේලාවන් සහ උෂ්ණත්ව අනතුරු ඇඟවීම්.",
    selectLocation: "ස්ථානය තෝරන්න",
    currentTemp: "වත්මන් උෂ්ණත්වය",
    rainProbability: "වැසි සම්භාවිතාව",
    humidity: "ආර්ද්‍රතාවය",
    windSpeed: "සුළඟේ වේගය",
    uvIndex: "UV දර්ශකය",
    sevenDayForecast: "දින 7 කාලගුණ අනාවැකිය",
    fiveDayForecast: "දින 5 කාලගුණ අනාවැකිය",
    weatherAlerts: "කාලගුණ අනතුරු ඇඟවීම්",
    skipWateringRain: "අද වැසි සහිතයි — ජලය දැමීම මඟහරින්න.",
    waterCropSunny: "අව්ව සහිත කාලගුණය — නியමිත පරිදි ජලය දමන්න.",
    waterCoolerHours: "තද උෂ්ණත්වය — උදෑසන හෝ සවස ජලය දමන්න.",
    actionableFarmingAdvice: "අද දින ගොවිතැන් උපදෙස්",
    fetchingWeather: "කාලගුණ දත්ත ලබා ගනිමින් පවතී...",
    couldNotLoadWeather: "කාලගුණ දත්ත ලබා ගැනීමට නොහැකි විය.",
    currentCondition: "වත්මන් කාලගුණ තත්ත්වය",

    // Calculations & Guidance & Smart Irrigation
    smartIrrigationPlanner: "බුද්ධිමත් ජලසම්පාදන සැලසුම්කරු",
    irrigationHeroSubtitle: "ඔබේ වගාවට සහ ඉඩම් ප්‍රමාණයට ගැලපෙන පරිදි බට පද්ධතිය සැලසුම් කර, ජල අවශ්‍යතා ගණනය කර, උපකරණ ලැයිස්තුව ලබා ගන්න.",
    step1CollectInfo: "1. ගොවිපළ සහ වගා තොරතුරු ඇතුළත් කරන්න",
    step2GenerateReport: "2. ජලසම්පාදන සැලසුම් වාර්තාව නරඹන්න",
    cropVarietyOptional: "වගා ප්‍රභේදය (අත්‍යවශ්‍ය නොවේ)",
    growthStage: "වත්මන් වර්ධන අවධිය",
    seedlingStage: "පැළ / තවාන් අවධිය",
    vegetativeStage: "වර්ධන අවධිය",
    floweringStage: "මල් හටගැනීමේ අවධිය",
    fruitingStage: "ඵල හටගැනීමේ / අස්වැන්න අවධිය",
    waterSource: "ජල මූලාශ්‍රය",
    waterTank: "ජල ටැංකිය",
    well: "ලිඳ",
    borewell: "නළ ළිඳ (Borewell)",
    canal: "ජලසම්පාදන ඇළ",
    river: "ගඟ / ඔය",
    municipalWater: "නගර සභා ජල සැපයුම",
    otherSource: "වෙනත් ජල මූලාශ්‍රයක්",
    pumpCapacityHp: "වතුර පම්ප් ධාරිතාව (HP, අත්‍යවශ්‍ය නොවේ)",
    waterFlowRate: "ජල ගැලීම් වේගය (L/h, අත්‍යවශ්‍ය නොවේ)",
    soilType: "පස වර්ගය",
    sandySoil: "වැලි සහිත පස",
    loamySoil: "ජලාකර්ෂක ලෝම් පස",
    claySoil: "මැටි පස",
    terrain: "භූමි ස්වභාවය",
    flatTerrain: "තැන්නේ පිහිටි ඉඩම",
    slightSlope: "සුළු බෑවුම",
    steepTerrain: "තද බෑවුම",
    generateIrrigationPlan: "ජලසම්පාදන සැලසුම සකසන්න",
    pipeLayoutSummary: "බට පද්ධති සැකැස්ම",
    subMainPipeLength: "අනු ප්‍රධාන බටයේ දිග",
    totalPipeRequirement: "මුළු බට අවශ්‍යතාවය",
    numberOfLaterals: "අනු බට ගණන (Laterals)",
    lengthOfEachLateral: "එක් අනු බටයක දිග",
    totalLateralLength: "මුළු අනු බට දිග",
    emitterSpacing: "බිංදු නික්මවුම් පරතරය",
    recommendedPipeDiameter: "නිර්දේශිත බට විෂ්කම්භය",
    filterRecommendation: "පෙරහන් නිර්දේශය (Filter)",
    pressureRegulator: "පීඩන පාලකය (Pressure Regulator)",
    controlValves: "පාලන කපාට (Valves)",
    sprinklerType: "නිර්දේශිත විසුරුම් යන්ත්‍ර වර්ගය",
    branchPipeLength: "අතු බට දිග",
    materialQuotation: "අවශ්‍ය උපකරණ සහ මිල ගණන් ලැයිස්තුව",
    itemDescription: "උපකරණ විස්තරය",
    estimatedQuantity: "අනුමාන ප්‍රමාණය",
    waterRequirementPerPlant: "පැළයකට දිනකට අවශ්‍ය ජලය",
    dailyWaterRequirement: "දිනකට මුළු ජල අවශ්‍යතාවය",
    weeklyWaterRequirement: "සතියකට මුළු ජල අවශ්‍යතාවය",
    waterSavingTips: "ජල සංරක්ෂණ උපදෙස්",
    plantSpacing: "පැළ අතර පරතරය",
    rowSpacing: "පේළි අතර පරතරය",
    estimatedPlants: "අපේක්ෂිත මුළු පැළ ගණන",
    irrigationGuidance: "ජලසම්පාදන මාර්ගෝපදේශය",
    wateringSchedule: "ජලසම්පාදන කාලසටහන",
    wateringDuration: "නිර්දේශිත කාලය",
    pipeCalculation: "බට සහ ජලසම්පාදන උපකරණ ගණනය",
    mainPipeLength: "ප්‍රධාන බටයේ දිග",
    lateralPipeLength: "අනු බටවල දිග",
    numberOfEmitters: "අවශ්‍ය බිංදු නික්මවුම් ගණන",
    numberOfSprinklers: "අවශ්‍ය විසුරුම් යන්ත්‍ර ගණන",
    sprinklerCoverage: "ආවරණ ප්‍රදේශය",

    // Pest & Disease Diagnosis
    pestDetectionTitle: "වගා රෝග සහ පලිබෝධ හඳුනාගැනීම",
    diagnosisHeroSubtitle: "හේතුව, කාබනික සහ රසායනික පිළියම් සහ වැලැක්වීමේ උපදෙස් ලබා ගැනීමට ආසාදිත පත්‍ර, කඳ හෝ ඵලයේ ඡායාරූපයක් එක් කරන්න.",
    diagnosisNotice: "උපදෙස් සටහන: මෙම රෝග විනිශ්චය ප්‍රතිඵල ශ්‍රී ලංකාවේ උතුරු පළාතට ගැලපෙන පරිදි සකසා ඇත. දරුණු ව්‍යාප්තියකදී ප්‍රාදේශීය කෘෂිකාර්මික නිලධාරියා හමුවන්න.",
    uploadImageHeader: "පරීක්ෂාව සඳහා ඡායාරූපයක් එක් කරන්න",
    targetCropLabel: "අදාළ වගාව *",
    affectedPartLabel: "ආසාදිත කොටස *",
    clickToSelectPhoto: "පත්‍ර, කඳ හෝ ඵලයේ ඡායාරූපය තෝරා ගැනීමට ක්ලික් කරන්න",
    supportedFormats: "PNG, JPG, JPEG සහය දක්වයි",
    pasteImageUrlPlaceholder: "හෝ ඡායාරූපයේ URL එක යොදන්න (https://...)",
    symptomsPlaceholder: "උදා: පහළ අතුවල තද දුඹුරු ලප සහිතව පත්‍ර හැකිලීම...",
    analyzingPhoto: "ඡායාරූපය පරීක්ෂා කරමින් පවතී...",
    aiDiagnosisResult: "AI රෝග විනිශ්චය වාර්තාව",
    noDiagnosisYet: "තවම රෝග පරීක්ෂාවක් සිදු කර නැත",
    noDiagnosisSubtitle: "වගාව සහ ආසාදිත කොටස තෝරා ඡායාරූපයක් එක් කරන්න.",
    diagnosisHistory: "රෝග පරීක්ෂා ඉතිහාසය",
    leafPart: "පත්‍ර",
    stemPart: "කඳ",
    fruitPart: "ඵල / ගෙඩි",
    uploadImageRequired: "වගාවේ / කොළයේ ඡායාරූපය ලබාදෙන්න * (අනිවාර්යයි)",
    descriptionOptional: "අමතර ලක්ෂණ / විස්තර (අත්‍යවශ්‍ය නොවේ)",
    submitDiagnosis: "රෝගය පරීක්ෂා කරන්න",
    selectImageFirstError: "කරුණාකර පරීක්ෂාව සඳහා ඡායාරූපයක් එක් කරන්න.",
    possibleDisease: "හැකියාව ඇති රෝගය / ගැටළුව",
    cause: "හැකියාව ඇති හේතුව",
    organicTreatment: "කාබනික පිළියම්",
    chemicalTreatment: "රසායනික පිළියම් (ශ්‍රී ලංකා නිර්දේශිත)",
    preventionAdvice: "වැලැක්වීමේ උපදෙස්",

    notificationsTitle: "වගා මතක් කිරීම්",
    wateringReminder: "ජලය දැමීමේ මතක් කිරීම",
    rainAlert: "වැසි අනතුරු ඇඟවීම",
    fertilizerAlert: "පොහොර යෙදීමේ මතක් කිරීම",
    floweringAlert: "මල් හටගැනීමේ අවධි උපදෙස්",
    harvestAlert: "අස්වැන්න නෙලීමේ සූදානම",
    diseaseAlert: "පලිබෝධ අනතුරු ඇඟවීම",

    save: "සුරකින්න",
    edit: "සංස්කරණය",
    delete: "මකා දමන්න",
    update: "යාවත්කාලීන කරන්න",
    search: "සොයන්න",
    filter: "පෙරන්න",
    next: "ඊළඟ",
    previous: "පෙර",
    viewDetails: "විස්තර බලන්න",
    backToHome: "මුල් පිටුවට යන්න",
    saveSettings: "සැකසීම් සුරකින්න",
    deleteAccount: "ගිණුම මකා දමන්න",
    deleteAccountConfirmMsg: "ඔබේ ගිණුම මකා දැමීමට ඔබට විශ්වාසද?",
    deleteAccountSuccess: "ගිණුම සාර්ථකව මකා දමන ලදී.",
    confirmDelete: "ඔව්, ගිණුම මකා දමන්න",
    cancel: "අවලංගු කරන්න",
    addCrop: "වගාවක් එක් කරන්න",
    cropName: "වගාවේ නම",
    variety: "ප්‍රභේදය",
    plantingDate: "වගා කළ දිනය",
    plantingMethod: "වගා ක්‍රමය",

    adminPortalTitle: "වළම් වේදිකා පරිපාලනය",
    adminPortalSub: "වගා මාර්ගෝපදේශ, රෝග දත්ත සමුදාය සහ සංසද පරිපාලන ද්වාරය.",
    addCropGuide: "නව වගා මාර්ගෝපදේශයක් එක් කරන්න",
    activeCropGuides: "සක්‍රීය වගා මාර්ගෝපදේශ",
    forumModeration: "සංසද සටහන් පරිපාලනය",
    season: "නිර්දේශිත කන්නය",
    waterRequirements: "ජල අවශ්‍යතා",
    fertilizerGuidance: "පොහොර උපදෙස්",
    commonProblems: "සාමාන්‍ය ගැටළු",
    basicSolutions: "මූලික විසඳුම්",
    saveGuide: "මාර්ගෝපදේශය සුරකින්න",
    deletePostConfirm: "මෙම සටහන මකා දැමීමට ඔබට විශ්වාසද?",

    pageNotFoundTitle: "404 - පිටුව හමු නොවීය",
    pageNotFoundDesc: "ඔබ සොයන පිටුව පවතින්නේ නැත නැතහොත් වෙනත් ස්ථානයකට ගෙන ගොස් ඇත.",
  },
};
