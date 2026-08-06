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

// Fallback stage generator for crops without DB guides
export function getDefaultStagesForCrop(cropName: string): CropStageAdvice[] {
  return [
    {
      stage_id: 1,
      stage_name: "Seedling / Nursery",
      icon: "🌱",
      start_day: 1,
      end_day: 20,
      description: `Initial nursery prep and germination phase for ${cropName}.`,
      expected_appearance: "Tender young green shoots with initial true leaves.",
      daily_tasks: ["Water early morning with gentle spray", "Shield from harsh midday sun", "Inspect seedlings for fungal rot"],
      water_requirement: "1.0 - 1.5 L/m² daily",
      fertilizer_recommendation: "Basal organic compost & light liquid fertilizer",
      image_url: "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=600&q=80",
    },
    {
      stage_id: 2,
      stage_name: "Vegetative Growth",
      icon: "🌿",
      start_day: 21,
      end_day: 45,
      description: `Rapid stem, foliar, and root development for ${cropName}.`,
      expected_appearance: "Sturdy green foliage with strong branching and thick canopy.",
      daily_tasks: ["Weed root zone", "Support stems with stakes if needed", "Apply organic mulch around stem base"],
      water_requirement: "2.5 - 3.0 L/m² daily",
      fertilizer_recommendation: "Nitrogen-rich top dressing (Urea / Compost slurry)",
      image_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
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
      image_url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=80",
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
      image_url: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80",
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
      image_url: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=600&q=80",
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
    const img = st.image_url || guide?.image_url || "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80";

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
    // If age exceeds max stage end day, set to final stage
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

  const currentStageImage = currentStage.image_url || "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80";

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
