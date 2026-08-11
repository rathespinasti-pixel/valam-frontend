import { Crop, CropGuide, CropStageAdvice } from "./types";

export interface ComputedLifecycle {
  cropAge: number;
  totalHarvestDays: number;
  currentStageIndex: number;
  currentStage: CropStageAdvice;
  progressPercentage: number;
  daysUntilHarvest: number;
  expectedHarvestDate: string;
  currentStageImage: string;
  allStages: CropStageAdvice[];
  completedStages: CropStageAdvice[];
  futureStages: CropStageAdvice[];
  nextStage: CropStageAdvice | null;
  nextStageStartDate: string | null;
}

export const CROP_NAME_TRANSLATIONS: Record<string, { ta: string; si: string; en: string }> = {
  tomato: { en: "Tomato", ta: "தக்காளி", si: "තක්කාලි" },
  eggplant: { en: "Eggplant (Brinjal)", ta: "கத்தரிக்காய்", si: "වම්බටු" },
  brinjal: { en: "Eggplant (Brinjal)", ta: "கத்தரிக்காய்", si: "වම්බටු" },
  "green chili": { en: "Green Chili", ta: "பச்சை மிளகாய்", si: "අමු මිරිස්" },
  "green chilli": { en: "Green Chili", ta: "பச்சை மிளகாய்", si: "අමු මිරිස්" },
  chili: { en: "Green Chili", ta: "பச்சை மிளகாய்", si: "අමු මිරිස්" },
  chilli: { en: "Green Chili", ta: "பச்சை மிளகாய்", si: "අමු මිරිස්" },
  okra: { en: "Okra (Ladies Finger)", ta: "வெண்டைக்காய்", si: "බණ්ඩක්කා" },
  "ladies finger": { en: "Okra (Ladies Finger)", ta: "வெண்டைக்காய்", si: "බණ්ඩක්කා" },
  "red onion": { en: "Red Onion", ta: "சின்ன வெங்காயம்", si: "රතු ළූණු" },
  onion: { en: "Red Onion", ta: "சின்ன வெங்காயம்", si: "රතු ළූණු" },
  paddy: { en: "Paddy (Rice)", ta: "நெல்", si: "වී වගාව" },
  rice: { en: "Paddy (Rice)", ta: "நெல்", si: "වී වගාව" },
};

export function getLocalizedCropName(cropName?: string | null, lang: "en" | "ta" | "si" = "en"): string {
  if (!cropName) return "";
  const key = cropName.toLowerCase().trim();
  for (const k in CROP_NAME_TRANSLATIONS) {
    if (key.includes(k)) {
      return CROP_NAME_TRANSLATIONS[k][lang] || cropName;
    }
  }
  return cropName;
}

export const STAGE_NAME_TRANSLATIONS: Record<string, { ta: string; si: string; en: string }> = {
  "seedling": { en: "🌱 Seedling / Nursery", ta: "🌱 நாற்று / முளைப்பு நிலை", si: "🌱 පැළ / තවාන් අවස්ථාව" },
  "nursery": { en: "🌱 Seedling / Nursery", ta: "🌱 நாற்று / முளைப்பு நிலை", si: "🌱 පැළ / තවාන් අවස්ථාව" },
  "transplanting": { en: "🌱 Transplanting", ta: "🌱 நடுதல் நிலை", si: "🌱 පැළ සිටුවීමේ අවස්ථාව" },
  "transplant": { en: "🌱 Transplanting", ta: "🌱 நடுதல் நிலை", si: "🌱 පැළ සිටුවීමේ අවස්ථාව" },
  "vegetative": { en: "🌿 Vegetative Growth", ta: "🌿 வளர்ச்சி நிலை", si: "🌿 වර්ධන අවස්ථාව" },
  "flowering": { en: "🌸 Flowering Phase", ta: "🌸 பூக்கும் நிலை", si: "🌸 මල් පිපීමේ අවස්ථාව" },
  "fruiting": { en: "🍅 Fruiting & Maturation", ta: "🍅 காய் / கனி காய்க்கும் நிலை", si: "🍅 ඵල හටගැනීමේ අවස්ථාව" },
  "harvest": { en: "🧺 Harvesting & Picking", ta: "🧺 அறுவடை நிலை", si: "🧺 අස්වැන්න නෙලීම" },
};

export function getLocalizedStageName(stageName?: string | null, lang: "en" | "ta" | "si" = "en"): string {
  if (!stageName) return "";
  const key = stageName.toLowerCase().trim();
  for (const k in STAGE_NAME_TRANSLATIONS) {
    if (key.includes(k)) {
      return STAGE_NAME_TRANSLATIONS[k][lang] || stageName;
    }
  }
  return stageName;
}

export function getLocalizedDistrict(districtName?: string, lang: "en" | "ta" | "si" = "en"): string {
  if (!districtName) return lang === "ta" ? "வவுனியா" : lang === "si" ? "වවුනියාව" : "Vavuniya";
  const d = districtName.toLowerCase().trim();
  const map: Record<string, { en: string; ta: string; si: string }> = {
    vavuniya: { en: "Vavuniya", ta: "வவுனியா", si: "වවුනියාව" },
    jaffna: { en: "Jaffna", ta: "யாழ்ப்பாணம்", si: "යාපනය" },
    kilinochchi: { en: "Kilinochchi", ta: "கிளிநொச்சி", si: "කිලිනොච්චිය" },
    mannar: { en: "Mannar", ta: "மன்னார்", si: "මන්නාරම" },
    mullaitivu: { en: "Mullaitivu", ta: "முல்லைத்தீவு", si: "මුලතිව්" },
    anuradhapura: { en: "Anuradhapura", ta: "அனுராதபுரம்", si: "අනුරාධපුරය" },
    polonnaruwa: { en: "Polonnaruwa", ta: "பொலன்னறுவை", si: "පොළොන්නරුව" },
    trincomalee: { en: "Trincomalee", ta: "திருகோணமலை", si: "ත්‍රිකුණාමලය" },
    batticaloa: { en: "Batticaloa", ta: "மட்டக்களப்பு", si: "මඩකලපුව" },
  };
  for (const k in map) {
    if (d.includes(k)) return map[k][lang] || districtName;
  }
  return districtName;
}

export function getLocalizedFarmingCategory(cat?: string, lang: "en" | "ta" | "si" = "en"): string {
  if (!cat) return lang === "ta" ? "விவசாயி" : lang === "si" ? "ගොවියා" : "Farmer";
  const c = cat.toLowerCase().trim();
  if (c.includes("home") || c.includes("வீட்டு") || c.includes("ගෙවතු")) {
    return lang === "ta" ? "வீட்டுத் தோட்டம்" : lang === "si" ? "ගෙවතු වගාව" : "Home Gardener";
  }
  if (c.includes("terrace") || c.includes("மாடி") || c.includes("බැල්කනි")) {
    return lang === "ta" ? "மாடித் தோட்டம்" : lang === "si" ? "බැල්කනි/වහල වගාව" : "Terrace Gardener";
  }
  if (c.includes("commercial") || c.includes("வணிக") || c.includes("වාණිජ")) {
    return lang === "ta" ? "வணிக விவசாயி" : lang === "si" ? "වාණිජ ගොවියා" : "Commercial Farmer";
  }
  if (c.includes("beginner") || c.includes("ஆரம்ப") || c.includes("ආරම්භක")) {
    return lang === "ta" ? "ஆரம்ப விவசாயி" : lang === "si" ? "ආරම්භක වගාකරු" : "Beginner";
  }
  return lang === "ta" ? "விவசாயி" : lang === "si" ? "ගොවියා" : "Farmer";
}

export function getLocalizedLandUnit(unit?: string, lang: "en" | "ta" | "si" = "en"): string {
  if (!unit) return lang === "ta" ? "ஏக்கர்" : lang === "si" ? "අක්කර" : "Acres";
  const u = unit.toLowerCase().trim();
  if (u.includes("acre")) return lang === "ta" ? "ஏக்கர்" : lang === "si" ? "අක්කර" : "Acres";
  if (u.includes("perch")) return lang === "ta" ? "பேர்ச்" : lang === "si" ? "පර්චස්" : "Perches";
  if (u.includes("hectare")) return lang === "ta" ? "ஹெக்டேயர்" : lang === "si" ? "හෙක්ටයාර" : "Hectares";
  if (u.includes("sq") || u.includes("feet")) return lang === "ta" ? "சதுர அடி" : lang === "si" ? "වර්ග අඩි" : "Sq Ft";
  return unit;
}

export function getLocalizedWeatherCondition(condition?: string, lang: "en" | "ta" | "si" = "en"): string {
  if (!condition) return "";
  if (lang === "en") return condition;
  const c = condition.toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) {
    return lang === "ta" ? "இடியுடன் கூடிய மழை" : "ගිගුරුම් සහිත වැසි";
  }
  if (c.includes("heavy rain")) {
    return lang === "ta" ? "கனமழை" : "තද වැසි";
  }
  if (c.includes("patchy rain") || c.includes("light rain") || c.includes("drizzle") || c.includes("shower")) {
    return lang === "ta" ? "லேசான மழை / தூறல்" : "සිහින් වැසි / වැසි වාර";
  }
  if (c.includes("rain")) {
    return lang === "ta" ? "மழை" : "වැසි";
  }
  if (c.includes("partly cloudy") || c.includes("scattered")) {
    return lang === "ta" ? "பகுதி மேகமூட்டம்" : "අර්ධ වශයෙන් වළාකුළු";
  }
  if (c.includes("cloud") || c.includes("overcast")) {
    return lang === "ta" ? "மேகமூட்டம்" : "වළාකුළු සහිත";
  }
  if (c.includes("clear")) {
    return lang === "ta" ? "தெளிவான வானம்" : "පැහැදිලි අහස";
  }
  if (c.includes("sun")) {
    return lang === "ta" ? "பிரகாசமான வெயில்" : "දීප්තිමත් හිරු එළිය";
  }
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) {
    return lang === "ta" ? "பனிமூட்டம்" : "මීදුම සහිත";
  }
  return condition;
}

function genericPlaceholderImage(cropName: string, stageName: string): string {
  let hash = 0;
  const seed = `${(cropName || "crop").toLowerCase()}::${(stageName || "").toLowerCase()}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const bg = `hsl(${hue},45%,88%)`;
  const fg = `hsl(${hue},55%,30%)`;
  const cropLabel = (cropName || "Crop").trim();
  const stageLabel = (stageName || "Growth").trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="100%" height="100%" fill="${bg}"/>
    <text x="50%" y="45%" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700" fill="${fg}" text-anchor="middle">${cropLabel}</text>
    <text x="50%" y="58%" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="${fg}" text-anchor="middle">${stageLabel} stage</text>
    <text x="50%" y="68%" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="${fg}" text-anchor="middle" opacity="0.75">Photo not yet available</text>
  </svg>`;
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getCropSpecificFallbackImage(cropName: string, stageName: string): string {
  const c = (cropName || "").toLowerCase();
  const s = (stageName || "").toLowerCase();

  const isSeed = (s.includes("seed") && !s.includes("seedling")) || s.includes("germinat");
  const isSeedling = s.includes("seedling") || s.includes("nursery") || s.includes("transplant") || s.includes("1");
  const isVeg = s.includes("vegetative") || s.includes("growth") || s.includes("2") || s.includes("3");
  const isFlower = s.includes("flower") || s.includes("bloom") || s.includes("4");
  const isFruit = s.includes("fruit") || s.includes("pod") || s.includes("matur") || s.includes("5");
  const isHarvest = s.includes("harvest") || s.includes("pick") || s.includes("6");

  if (c.includes("chilli") || c.includes("chili")) {
    if (isSeed) return "https://images.unsplash.com/photo-1535241552843-26780355d026?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1583857502409-728b7a66f4ef?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80";
    if (isFruit) return "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80";
    if (isHarvest) return "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("brinjal") || c.includes("eggplant")) {
    if (isSeed) return "https://images.unsplash.com/photo-1535241552843-26780355d026?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80";
    if (isFruit || isHarvest) return "https://images.unsplash.com/photo-1613744655060-d8a4362a78f2?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1613744655060-d8a4362a78f2?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("okra") || c.includes("ladies finger")) {
    if (isSeed) return "https://images.unsplash.com/photo-1535241552843-26780355d026?auto=format&fit=crop&w=800&q=80";
    if (isSeedling || isVeg) return "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1628773822503-930a858340d2?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("maize") || c.includes("corn")) {
    if (isSeed) return "https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80";
    if (isFruit) return "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80";
    if (isHarvest) return "https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("paddy") || c.includes("rice")) {
    if (isSeed) return "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80";
    if (isFlower || isFruit) return "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("onion")) {
    if (isSeed) return "https://images.unsplash.com/photo-1535241552843-26780355d026?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("pumpkin")) {
    if (isSeed) return "https://images.unsplash.com/photo-1535241552843-26780355d026?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1570586435893-ab4e6b2885bb?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1506917728037-b6fb01c7ae52?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("cucumber")) {
    if (isSeed) return "https://images.unsplash.com/photo-1535241552843-26780355d026?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("carrot")) {
    if (isSeed) return "https://images.unsplash.com/photo-1535241552843-26780355d026?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("beans") || c.includes("gram") || c.includes("mung")) {
    if (isSeed) return "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("peanut") || c.includes("groundnut")) {
    if (isSeed) return "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("tomato")) {
    if (isSeed) return "https://images.unsplash.com/photo-1535241552843-26780355d026?auto=format&fit=crop&w=800&q=80";
    if (isSeedling) return "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80";
    if (isFruit) return "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80";
}

export function getDefaultStagesForCrop(cropName: string, lang: "en" | "ta" | "si" = "en"): CropStageAdvice[] {
  const isTa = lang === "ta";
  const isSi = lang === "si";

  return [
    {
      stage_id: 1,
      stage_name: isTa ? "🌱 நாற்று / முளைப்பு நிலை" : isSi ? "🌱 පැළ / තවාන් අවස්ථාව" : "🌱 Seedling / Nursery",
      icon: "🌱",
      start_day: 1,
      end_day: 20,
      description: isTa
        ? `${cropName} பயிரின் ஆரம்ப நாற்று வளர்ப்பு மற்றும் முளைப்பு நிலை.`
        : isSi
        ? `${cropName} වගාවේ ආරම්භක තවාන් සහ ප්‍රරෝහන අවස්ථාව.`
        : `Initial nursery preparation and tender seedling germination phase for ${cropName}.`,
      expected_appearance: isTa
        ? "மென்மையான பச்சை முளைகள் மற்றும் முதல் இலைகள் தோன்றுதல்."
        : isSi
        ? "ළපටි කොළ පැළ සහ මුල් පත්‍ර හටගැනීම."
        : "Tender young green shoots with initial true leaves emergence.",
      daily_tasks: isTa
        ? ["காலை வேளையில் மிதமான நீர் தெளிக்கவும்", "நண்பகல் கடும் வெயிலில் இருந்து பாதுகாக்கவும்", "பூஞ்சை தாக்குதலை கண்காணிக்கவும்"]
        : isSi
        ? ["උදෑසන කාලයේදී මෘදු ලෙස ජලය ඉසින්න", "දහවල් තද අව්වෙන් ආරක්ෂා කරන්න", "දිලීර රෝග තිබේදැයි පරීක්ෂා කරන්න"]
        : ["Water early morning with gentle spray", "Shield from harsh midday sun", "Inspect seedlings for damping-off"],
      water_requirement: isTa ? "1.0 - 1.5 L/m² தினசரி" : isSi ? "දිනකට 1.0 - 1.5 L/m²" : "1.0 - 1.5 L/m² daily",
      fertilizer_recommendation: isTa ? "அடிப்படை இயற்கை மண்புழு உரம் & உலர் சாணம்" : isSi ? "මූලික කාබනික කොම්පෝස්ට් සහ දියර පොහොර" : "Basal organic compost & light liquid vermiwash",
      image_url: getCropSpecificFallbackImage(cropName, "Seedling"),
    },
    {
      stage_id: 2,
      stage_name: isTa ? "🌱 நடுதல் நிலை" : isSi ? "🌱 පැළ සිටුවීමේ අවස්ථාව" : "🌱 Transplanting",
      icon: "🌱",
      start_day: 21,
      end_day: 21,
      description: isTa
        ? `வளர்ந்த நாற்றுகளை சரியான இடைவெளியில் பிரதான பாத்திகளில் நடுதல்.`
        : isSi
        ? `තවානෙන් ගලවා ගත් පැළ නියමිත පරතරයකින් ප්‍රධාන ක්ෂේත්‍රයේ සිටුවීම.`
        : `Transplanting hardened seedlings into main field beds with optimal spacing for ${cropName}.`,
      expected_appearance: isTa
        ? "நன்கு வேரூன்றிய ஆரோக்கியமான 3-4 இலை நாற்றுகள் பாத்திகளில் நடப்படுதல்."
        : isSi
        ? "නිරෝගී පත්‍ර 3-4 ක් සහිත පැළ පාත්තිවල ස්ථාවරව සිටුවීම."
        : "Healthy 3-4 leaf seedlings transferred into well-prepared raised beds with basal compost.",
      daily_tasks: isTa
        ? ["மாலையில் குளிர்ந்த வேளையில் நடுதல்", "வேர்ப் பகுதியில் உடனடியாக மிதமான நீர் பாய்ச்சுதல்", "நாற்றுகள் சாயாமல் பாதுகாத்தல்"]
        : isSi
        ? ["සවස් කාලයේ පැළ සිටුවන්න", "මුල් ප්‍රදේශයට වහාම ජලය යොදන්න", "පැළ කෙලින් සිටුවීමට ආධාරක සපයන්න"]
        : ["Transplant in cool late afternoon", "Immediate spot watering at root zone", "Apply root booster solution"],
      water_requirement: isTa ? "2.0 L/m² நட்டவுடன் உடனடியாக" : isSi ? "සිටවූ විගස 2.0 L/m²" : "2.0 L/m² immediate",
      fertilizer_recommendation: isTa ? "நன்கு மக்கிய தொழு உரம் / நடுவு குழியில் இயற்கை உரம்" : isSi ? "හොඳින් දිරූ ගව පොහොර / මූලික කාබනික මිශ්‍රණය" : "Well-decomposed cattle manure / Basal organic blend in planting holes",
      image_url: getCropSpecificFallbackImage(cropName, "Seedling"),
    },
    {
      stage_id: 3,
      stage_name: isTa ? "🌿 வளர்ச்சி நிலை" : isSi ? "🌿 වර්ධන අවස්ථාව" : "🌿 Vegetative Growth",
      icon: "🌿",
      start_day: 22,
      end_day: 45,
      description: isTa
        ? `தண்டு வளர்ச்சி, கிளை பரவுதல் மற்றும் அடர்த்தியான இலைகள் உருவாதல்.`
        : isSi
        ? `කඳ ශක්තිමත් වීම, අතු විහිදීම සහ පත්‍ර වර්ධනය වේගවත්ව සිදුවීම.`
        : `Rapid stem, foliar canopy, and root expansion for ${cropName}.`,
      expected_appearance: isTa
        ? "அடர்ந்த பச்சை இலைகள், தடித்த தண்டுகள் மற்றும் ஆரோக்கியமான கிளைகள்."
        : isSi
        ? "ශක්තිමත් කඳන් සහ සශ්‍රීක කොළ පැහැති පත්‍ර වියනක් නිර්මාණය වීම."
        : "Vigorous lush green branching, thick stems, and healthy leaf canopy.",
      daily_tasks: isTa
        ? ["களைகளை அகற்றி மண் அணைத்தல்", "தேவைப்பட்டால் செடிகளுக்கு முட்டுக்கொடுத்தல்", "தண்டு பகுதியில் உலர் புல் கொண்டு மூடாக்கிடுதல்"]
        : isSi
        ? ["වල් පැළෑටි ඉවත් කර පස් බුරුල් කරන්න", "උස පැළ සඳහා ආධාරක කූරු සවි කරන්න", "මුල් වටා වසුන් යොදන්න"]
        : ["Weed root zone carefully", "Provide staking support if climbing or tall", "Apply organic mulch layer around stem base"],
      water_requirement: isTa ? "2.5 - 3.0 L/m² தினசரி" : isSi ? "දිනකට 2.5 - 3.0 L/m²" : "2.5 - 3.0 L/m² daily",
      fertilizer_recommendation: isTa ? "நைட்ரஜன் நிறைந்த இயற்கை உரம் / சாண எரு கரைசல் / யூரியா மேலுரம்" : isSi ? "නයිට්‍රජන් බහුල කොම්පෝස්ට් දියර / ජීවාමෘත / යූරියා" : "Nitrogen-rich top dressing (Compost slurry / Organic fish emulsion / Urea)",
      image_url: getCropSpecificFallbackImage(cropName, "Vegetative Growth"),
    },
    {
      stage_id: 4,
      stage_name: isTa ? "🌸 பூக்கும் நிலை" : isSi ? "🌸 මල් පිපීමේ අවස්ථාව" : "🌸 Flowering",
      icon: "🌸",
      start_day: 46,
      end_day: 70,
      description: isTa
        ? `பூ மொட்டுகள் தோன்றுதல், மலர்தல் மற்றும் மகரந்தச் சேர்க்கை நிலை.`
        : isSi
        ? `මල් පොහොට්ටු හටගැනීම, මල් පිපීම සහ පරාගනය සක්‍රියව සිදුවීම.`
        : `Flower bud initiation, blossom opening, and active pollination for ${cropName}.`,
      expected_appearance: isTa
        ? "கிளைகளில் பிரகாசமான பூக்கள் கூட்டமாக மலர்ந்து காட்சி அளித்தல்."
        : isSi
        ? "ප්‍රධාන අතුවල දීප්තිමත් මල් පොකුරු විකසිත වී තිබීම."
        : "Abundant vibrant flower clusters blooming across main branches.",
      daily_tasks: isTa
        ? ["பூ உதிர்வை தடுக்க சீரான ஈரப்பதம் பேணவும்", "இலை அடியில் பூச்சிகள் உள்ளதா என பரிசோதிக்கவும்", "நுண்ணூட்டச்சத்து தெளிக்கவும்"]
        : isSi
        ? ["මල් හැලීම වැළැක්වීමට ස්ථාවර තෙතමනයක් තබා ගන්න", "පත්‍ර යට පළිබෝධකයන් පරීක්ෂා කරන්න", "ක්ෂුද්‍ර පෝෂක දියර ඉසින්න"]
        : ["Maintain steady soil moisture to prevent blossom drop", "Inspect leaf undersides for thrips & whiteflies", "Apply boron/micronutrient foliar spray"],
      water_requirement: isTa ? "3.5 L/m² தினசரி" : isSi ? "දිනකට 3.5 L/m²" : "3.5 L/m² daily",
      fertilizer_recommendation: isTa ? "பொட்டாசியம் மற்றும் பாஸ்பரஸ் நிறைந்த உரம் (சாம்பல் உரம் / MOP)" : isSi ? "පොටෑසියම් සහ පොස්පරස් බහුල පොහොර (අළු / MOP)" : "High Potassium & Phosphorus top dressing (MOP / Ash / Bone meal)",
      image_url: getCropSpecificFallbackImage(cropName, "Flowering"),
    },
    {
      stage_id: 5,
      stage_name: isTa ? "🍅 காய்க்கும் நிலை" : isSi ? "🍅 ඵල හටගැනීම" : "🍅 Fruiting",
      icon: "🍅",
      start_day: 71,
      end_day: 95,
      description: isTa
        ? `காய்கள் தோன்றி பருத்து முதிர்ச்சி அடையும் நிலை.`
        : isSi
        ? `ගෙඩි හටගැනීම, ප්‍රමාණයෙන් විශාල වීම සහ පැසීම ආරම්භ වීම.`
        : `Fruit and pod development, enlargement, and maturation for ${cropName}.`,
      expected_appearance: isTa
        ? "பச்சை காய்கள் திரண்டு உருப்பெற்று படிப்படியாக நிறம் மாறுதல்."
        : isSi
        ? "නිරෝගී කොළ පැහැති ගෙඩි විශාල වෙමින් ස්වභාවික වර්ණයට හැරීම."
        : "Firm green fruits enlarging in size and beginning uniform color development.",
      daily_tasks: isTa
        ? ["காய் துளைப்பான் புழுக்களை கண்காணிக்கவும்", "சொட்டுநீர் பாசனத்தை சீராக பராமரிக்கவும்", "கனமான காய்களுக்கு முட்டுக்கொடுக்கவும்"]
        : isSi
        ? ["ගෙඩි විදින පණුවන් පරීක්ෂා කරන්න", "බිංදු ජලසම්පාදනය නියමිත පරිදි පවත්වා ගන්න", "බර ගෙඩි සහිත අතු ආධාරක මගින් රඳවන්න"]
        : ["Monitor for fruit borer caterpillars", "Maintain uniform drip irrigation schedule", "Support heavy fruit clusters with stakes"],
      water_requirement: isTa ? "4.0 L/m² தினசரி" : isSi ? "දිනකට 4.0 L/m²" : "4.0 L/m² daily",
      fertilizer_recommendation: isTa ? "காய் உறுதிக்கும் அழுகலை தடுக்கவும் கால்சியம் & பொட்டாசியம் உரம்" : isSi ? "ගෙඩිවල ශක්තියට සහ කුණුවීම වැළැක්වීමට කැල්සියම් හා පොටෑෂ්" : "Calcium & Potassium foliar feed for fruit firmness and blossom-end rot prevention",
      image_url: getCropSpecificFallbackImage(cropName, "Fruiting"),
    },
    {
      stage_id: 6,
      stage_name: isTa ? "🧺 அறுவடை நிலை" : isSi ? "🧺 අස්වැන්න නෙලීම" : "🧺 Harvest",
      icon: "🧺",
      start_day: 96,
      end_day: 120,
      description: isTa
        ? `பயிர் முழு முதிர்ச்சி அடைந்து விளைச்சலை அறுவடை செய்யும் உச்ச நிலை.`
        : isSi
        ? `වගාව සම්පූර්ණයෙන්ම පරිණත වී අස්වැන්න නෙලීමට සුදුසු අවස්ථාව.`
        : `Peak maturity and systematic hand-picking of harvest-ready ${cropName}.`,
      expected_appearance: isTa
        ? "அறுவடைக்கு தயாரான பளபளப்பான திரண்ட பழங்கள் மற்றும் விளைச்சல்."
        : isSi
        ? "නෙලීමට සුදුසු උපරිම ගුණාත්මකභාවයෙන් යුතු පරිණත අස්වැන්න."
        : "Fully mature, vibrant harvest-ready produce with optimal gloss and firmness.",
      daily_tasks: isTa
        ? ["காலை குளிர்ந்த வேளையில் அறுவடை செய்யவும்", "தரம்பிரித்து காற்றோட்டமான கூடைகளில் சேமிக்கவும்", "நேரடி வெயிலில் வைப்பதை தவிர்க்கவும்"]
        : isSi
        ? ["උදෑසන සිසිල් වේලාවේ අස්වැන්න නෙලන්න", "තත්ත්වය අනුව වර්ග කර සෙවණ ඇති ස්ථානයක අසුරන්න", "අව්වෙන් ආරක්ෂා කරන්න"]
        : ["Harvest in early morning cool hours", "Grade and sort produce into harvest crates", "Store in shaded, ventilated area"],
      water_requirement: isTa ? "1.5 L/m² ஆக குறைக்கவும்" : isSi ? "දිනකට 1.5 L/m² දක්වා අඩු කරන්න" : "Reduce watering to 1.5 L/m² daily",
      fertilizer_recommendation: isTa ? "அறுவடைக்கு முன் உரம் தேவையில்லை" : isSi ? "අස්වැන්න නෙලීමට පෙර අමතර පොහොර අවශ්‍ය නොවේ" : "No further fertilizer needed prior to harvest",
      image_url: getCropSpecificFallbackImage(cropName, "Harvest"),
    },
  ];
}

export function calculateCropAge(plantingDateStr: string, todayDate: Date = new Date()): number {
  if (!plantingDateStr) return 1;
  const start = new Date(plantingDateStr).getTime();
  const now = todayDate.getTime();
  const diffDays = Math.floor((now - start) / (1000 * 3600 * 24));
  return Math.max(1, diffDays);
}

export function formatDateString(dateObj: Date): string {
  return dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function computeLifecycle(
  crop: Crop,
  guides: CropGuide[] = [],
  lang: "en" | "ta" | "si" = "en",
  todayDate: Date = new Date()
): ComputedLifecycle {
  const age = calculateCropAge(crop.planting_date, todayDate);

  // Find matching guide from DB
  const guide = guides.find(
    (g) => g.crop_name.toLowerCase().trim() === crop.crop_name.toLowerCase().trim()
  );

  const defaultLocalizedStages = getDefaultStagesForCrop(crop.crop_name, lang);

  let rawStages: CropStageAdvice[] = guide?.growth_stages || [];
  if (!rawStages || rawStages.length === 0) {
    rawStages = defaultLocalizedStages;
  }

  // Normalize stages to standard structure & localize
  const allStages: CropStageAdvice[] = rawStages.map((st, idx) => {
    const sId = st.stage_id || idx + 1;
    const rawName = st.stage_name || st.stage || `Stage ${sId}`;
    const name = getLocalizedStageName(rawName, lang);
    const start = st.start_day || (idx === 0 ? 1 : idx * 25 + 1);
    const end = st.end_day || (idx === 0 ? 20 : (idx + 1) * 25);
    const icon = st.icon || (idx === 0 ? "🌱" : idx === 1 ? "🌱" : idx === 2 ? "🌿" : idx === 3 ? "🌸" : idx === 4 ? "🍅" : "🧺");

    const defStage = defaultLocalizedStages[idx] || defaultLocalizedStages[defaultLocalizedStages.length - 1];

    const desc = lang !== "en" && defStage?.description
      ? defStage.description
      : st.description || st.advice || "Follow daily guidance for optimal yield.";

    const app = lang !== "en" && defStage?.expected_appearance
      ? defStage.expected_appearance
      : st.expected_appearance || "Healthy plant growth.";

    const tasks = lang !== "en" && defStage?.daily_tasks && defStage.daily_tasks.length > 0
      ? defStage.daily_tasks
      : st.daily_tasks || (st.advice ? [st.advice] : ["Water early morning", "Inspect foliage"]);

    const water = lang !== "en" && defStage?.water_requirement
      ? defStage.water_requirement
      : st.water_requirement || "2.5 L/m² daily";

    const fert = lang !== "en" && defStage?.fertilizer_recommendation
      ? defStage.fertilizer_recommendation
      : st.fertilizer_recommendation || "Apply recommended organic compost";

    const img = st.image_url || getCropSpecificFallbackImage(crop.crop_name, rawName);

    return {
      stage_id: sId,
      stage_name: name,
      icon: icon,
      start_day: start,
      end_day: end,
      description: desc,
      expected_appearance: app,
      daily_tasks: tasks,
      water_requirement: water,
      fertilizer_recommendation: fert,
      image_url: img,
    };
  });

  // Determine current stage based strictly on planting date age
  let currentStageIndex = allStages.findIndex(
    (st) => age >= (st.start_day || 1) && age <= (st.end_day || 999)
  );

  if (currentStageIndex === -1) {
    const maxEnd = Math.max(...allStages.map((s) => s.end_day || 100));
    if (age > maxEnd) {
      currentStageIndex = allStages.length - 1;
    } else {
      currentStageIndex = 0;
    }
  }

  const currentStage = allStages[currentStageIndex];

  // Duration & Progress math
  const maxHarvestDay = Math.max(...allStages.map((s) => s.end_day || 100));
  const totalHarvestDays = maxHarvestDay;
  const progressPercentage = Math.min(100, Math.round((age / totalHarvestDays) * 100));
  const daysUntilHarvest = Math.max(0, totalHarvestDays - age);

  // Expected Harvest Date
  const startDate = new Date(crop.planting_date);
  const harvestDateObj = new Date(startDate.getTime() + totalHarvestDays * 86400000);
  const expectedHarvestDate = formatDateString(harvestDateObj);

  // Completed & Future stages
  const completedStages = allStages.filter((st) => (st.end_day || 0) < age);
  const futureStages = allStages.filter((st) => (st.start_day || 0) > age);

  const nextStage = futureStages.length > 0 ? futureStages[0] : null;
  let nextStageStartDate: string | null = null;
  if (nextStage && nextStage.start_day) {
    const nextDateObj = new Date(startDate.getTime() + (nextStage.start_day - 1) * 86400000);
    nextStageStartDate = formatDateString(nextDateObj);
  }

  const currentStageImage = currentStage.image_url || getCropSpecificFallbackImage(crop.crop_name, currentStage.stage_name || currentStage.stage || "");

  return {
    cropAge: age,
    totalHarvestDays,
    currentStageIndex,
    currentStage,
    progressPercentage,
    daysUntilHarvest,
    expectedHarvestDate,
    currentStageImage,
    allStages,
    completedStages,
    futureStages,
    nextStage,
    nextStageStartDate,
  };
}
