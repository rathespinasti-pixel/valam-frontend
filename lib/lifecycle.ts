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
  chili: { en: "Green Chili", ta: "பச்சை மிளகாய்", si: "අමු මිරිස්" },
  okra: { en: "Okra (Ladies Finger)", ta: "வெண்டைக்காய்", si: "බණ්ඩක්කා" },
  "ladies finger": { en: "Okra (Ladies Finger)", ta: "வெண்டைக்காய்", si: "බණ්ඩக்කා" },
  "red onion": { en: "Red Onion", ta: "சின்ன வெங்காயம்", si: "රතු ළූණු" },
  onion: { en: "Red Onion", ta: "சின்ன வெங்காயம்", si: "රතු ළූණු" },
  paddy: { en: "Paddy (Rice)", ta: "நெல்", si: "වී වගාව" },
  rice: { en: "Paddy (Rice)", ta: "நெல்", si: "වී වගාව" },
};

export function getLocalizedCropName(cropName: string, lang: "en" | "ta" | "si" = "en"): string {
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
  "vegetative": { en: "🌿 Vegetative Growth", ta: "🌿 வளர்ச்சி நிலை", si: "🌿 වර්ධන අවස්ථාව" },
  "flowering": { en: "🌸 Flowering Phase", ta: "🌸 பூக்கும் நிலை", si: "🌸 මල් පිපීමේ අවස්ථාව" },
  "fruiting": { en: "🍅 Fruiting & Maturation", ta: "🍅 காய் / கனி காய்க்கும் நிலை", si: "🍅 ඵල හටගැනීමේ අවස්ථාව" },
  "harvest": { en: "🧺 Harvesting & Picking", ta: "🧺 அறுவடை நிலை", si: "🧺 අස්වැන්න நෙලීම" },
};

export function getLocalizedStageName(stageName: string, lang: "en" | "ta" | "si" = "en"): string {
  if (!stageName) return "";
  const key = stageName.toLowerCase().trim();
  for (const k in STAGE_NAME_TRANSLATIONS) {
    if (key.includes(k)) {
      return STAGE_NAME_TRANSLATIONS[k][lang] || stageName;
    }
  }
  return stageName;
}

// Self-contained, crop-labelled placeholder used only when a crop has no
// curated stock photo below (e.g. an unrecognised crop name). Never falls
// back to a *different* crop's photo (e.g. tomato) - that misrepresents the
// plant. Colour is derived deterministically from the crop name so distinct
// crops still look visually distinct from one another.
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

// Crop-specific dynamic visual fallbacks ensuring distinct identity per crop & stage.
// This is only the CLIENT-SIDE placeholder shown before the backend's
// AI-generated / cached image (see ValamAPI.getCropLifecycleImage) loads.
export function getCropSpecificFallbackImage(cropName: string, stageName: string): string {
  const c = (cropName || "").toLowerCase();
  const s = (stageName || "").toLowerCase();

  const isSeedling = s.includes("seedling") || s.includes("nursery") || s.includes("1");
  const isVeg = s.includes("vegetative") || s.includes("growth") || s.includes("2");
  const isFlower = s.includes("flower") || s.includes("bloom") || s.includes("3");
  const isFruit = s.includes("fruit") || s.includes("pod") || s.includes("matur") || s.includes("4");
  const isHarvest = s.includes("harvest") || s.includes("pick") || s.includes("5");

  if (c.includes("chilli") || c.includes("chili")) {
    if (isSeedling) return "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1583857502409-728b7a66f4ef?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80";
    if (isFruit) return "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80";
    if (isHarvest) return "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("brinjal") || c.includes("eggplant")) {
    if (isSeedling) return "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80";
    if (isFruit || isHarvest) return "https://images.unsplash.com/photo-1613744655060-d8a4362a78f2?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1613744655060-d8a4362a78f2?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("okra") || c.includes("ladies finger")) {
    if (isSeedling || isVeg) return "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1628773822503-930a858340d2?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("paddy") || c.includes("rice")) {
    if (isSeedling) return "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80";
    if (isFlower || isFruit) return "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("onion")) {
    return "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80";
  }

  if (c.includes("tomato")) {
    if (isSeedling) return "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=800&q=80";
    if (isVeg) return "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80";
    if (isFlower) return "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80";
    if (isFruit) return "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=800&q=80";
  }

  // Crop not recognised above - do NOT default to tomato's photos, show a
  // neutral, crop-labelled placeholder instead until the backend's
  // AI-generated image loads.
  return genericPlaceholderImage(cropName, stageName);
}

// Stages generator for crops
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
        : `Initial nursery prep and germination phase for ${cropName}.`,
      expected_appearance: isTa
        ? "மென்மையான பச்சை முளைகள் மற்றும் முதல் இலைகள் தோன்றுதல்."
        : isSi
        ? "ළපටි කොළ පැළ සහ මුල් පත්‍ර හටගැනීම."
        : "Tender young green shoots with initial true leaves.",
      daily_tasks: isTa
        ? ["காலை வேளையில் மிதமான நீர் தெளிக்கவும்", "நண்பகல் கடும் வெயிலில் இருந்து பாதுகாக்கவும்", "பூஞ்சை தாக்குதலை கண்காணிக்கவும்"]
        : isSi
        ? ["උදෑසන කාලයේදී මෘදු ලෙස ජලය ඉසින්ன", "දහவල් තද අව්වෙන් ආරක්ෂா කරන්න", "දිලීර රෝග තිබේදැයි පරීක්ෂා කරන්න"]
        : ["Water early morning with gentle spray", "Shield from harsh midday sun", "Inspect seedlings for fungal rot"],
      water_requirement: isTa ? "தினசரி 1.0 - 1.5 L/m²" : isSi ? "දිනපතා 1.0 - 1.5 L/m²" : "1.0 - 1.5 L/m² daily",
      fertilizer_recommendation: isTa ? "இயற்கை மட்கிய உரம் மற்றும் திரவ உரம்" : isSi ? "කොම්පෝස්ට් පොහොර සහ දියර පොහොර" : "Basal organic compost & light liquid fertilizer",
      image_url: getCropSpecificFallbackImage(cropName, "Seedling"),
    },
    {
      stage_id: 2,
      stage_name: isTa ? "🌿 வளர்ச்சி நிலை" : isSi ? "🌿 වර්ධන අවස්ථාව" : "🌿 Vegetative Growth",
      icon: "🌿",
      start_day: 21,
      end_day: 45,
      description: `Rapid stem, foliar, and root development for ${cropName}.`,
      expected_appearance: "Sturdy green foliage with strong branching and thick canopy.",
      daily_tasks: ["Weed root zone", "Support stems with stakes if needed", "Apply organic mulch around stem base"],
      water_requirement: "2.5 - 3.0 L/m² daily",
      fertilizer_recommendation: "Nitrogen-rich top dressing (Urea / Compost slurry)",
      image_url: getCropSpecificFallbackImage(cropName, "Vegetative Growth"),
    },
    {
      stage_id: 3,
      stage_name: "Flowering",
      icon: "🌸",
      start_day: 46,
      end_day: 70,
      description: `Flower bud opening and pollination phase for ${cropName}.`,
      expected_appearance: "Abundant flower buds and blossoms opening across main branches.",
      daily_tasks: ["Maintain steady moisture to prevent flower drop", "Inspect leaf undersides for thrips & whiteflies", "Apply micronutrient foliar spray"],
      water_requirement: "3.5 L/m² daily",
      fertilizer_recommendation: "High Potassium & Phosphorus top dressing (MOP / Ash)",
      image_url: getCropSpecificFallbackImage(cropName, "Flowering"),
    },
    {
      stage_id: 4,
      stage_name: "Fruiting",
      icon: "🍅",
      start_day: 71,
      end_day: 95,
      description: `Fruit/pod development and size expansion for ${cropName}.`,
      expected_appearance: "Plump green fruits expanding in size and weight.",
      daily_tasks: ["Monitor for fruit borer caterpillars", "Ensure uniform drip watering", "Support heavy fruit branches"],
      water_requirement: "4.0 L/m² daily",
      fertilizer_recommendation: "Calcium & Potassium foliar feed",
      image_url: getCropSpecificFallbackImage(cropName, "Fruiting"),
    },
    {
      stage_id: 5,
      stage_name: "Harvest",
      icon: "🧺",
      start_day: 96,
      end_day: 120,
      description: `Final maturation and systematically harvesting ${cropName}.`,
      expected_appearance: "Mature, vibrant harvest-ready produce.",
      daily_tasks: ["Harvest in early morning hours", "Sort and grade produce into crates", "Store in cool shaded area"],
      water_requirement: "Reduce watering to 1.5 L/m² daily",
      fertilizer_recommendation: "No further fertilizer needed",
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
  todayDate: Date = new Date()
): ComputedLifecycle {
  const age = calculateCropAge(crop.planting_date, todayDate);

  // Find matching guide from DB
  const guide = guides.find(
    (g) => g.crop_name.toLowerCase().trim() === crop.crop_name.toLowerCase().trim()
  );

  let rawStages: CropStageAdvice[] = guide?.growth_stages || [];
  if (!rawStages || rawStages.length === 0) {
    rawStages = getDefaultStagesForCrop(crop.crop_name);
  }

  // Normalize stages to standard structure
  const allStages: CropStageAdvice[] = rawStages.map((st, idx) => {
    const sId = st.stage_id || idx + 1;
    const name = st.stage_name || st.stage || `Stage ${sId}`;
    const start = st.start_day || (idx === 0 ? 1 : idx * 25 + 1);
    const end = st.end_day || (idx === 0 ? 20 : (idx + 1) * 25);
    const icon = st.icon || (idx === 0 ? "🌱" : idx === 1 ? "🌿" : idx === 2 ? "🌸" : idx === 3 ? "🍅" : "🧺");
    const desc = st.description || st.advice || "Follow daily guidance for optimal yield.";
    const app = st.expected_appearance || "Healthy plant growth.";
    const tasks = st.daily_tasks || (st.advice ? [st.advice] : ["Water early morning", "Inspect foliage"]);
    const water = st.water_requirement || "2.5 L/m² daily";
    const fert = st.fertilizer_recommendation || "Apply recommended organic compost";
    const img = getCropSpecificFallbackImage(crop.crop_name, name);

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

  // Determine current stage
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
