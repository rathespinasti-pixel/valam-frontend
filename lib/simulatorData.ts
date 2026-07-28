export const CROPS = {
  tomato: { label: "Tomato", icon: "fa-apple-whole", yield: 2.8, pest: 18, cost: 450, price: 464 },
  paddy: { label: "Paddy (Rice)", icon: "fa-wheat-awn", yield: 2.2, pest: 22, cost: 320, price: 260 },
  pepper: { label: "Black Pepper", icon: "fa-pepper-hot", yield: 0.6, pest: 28, cost: 380, price: 2200 },
  okra: { label: "Okra", icon: "fa-leaf", yield: 3.4, pest: 15, cost: 300, price: 380 },
} as const;

export const SOIL = {
  red: { label: "Red Soil", icon: "fa-mound", yieldMult: 1.0, pestDelta: 0, costMult: 1.0 },
  clay: { label: "Clay Soil", icon: "fa-layer-group", yieldMult: 0.92, pestDelta: 4, costMult: 1.05 },
  black: { label: "Black Soil", icon: "fa-circle", yieldMult: 1.08, pestDelta: -2, costMult: 0.97 },
  loamy: { label: "Sandy / Loamy", icon: "fa-seedling", yieldMult: 1.04, pestDelta: 1, costMult: 1.0 },
} as const;

export const WATER = {
  drip: { label: "Drip Irrigation", yieldMult: 1.0, pestDelta: 0, costMult: 1.0 },
  borewell: { label: "Borewell", yieldMult: 0.95, pestDelta: 1, costMult: 1.08 },
  canal: { label: "Canal", yieldMult: 0.9, pestDelta: 3, costMult: 0.95 },
  rainfed: { label: "Rainfed", yieldMult: 0.75, pestDelta: 8, costMult: 0.85 },
} as const;

export type CropKey = keyof typeof CROPS;
export type SoilKey = keyof typeof SOIL;
export type WaterKey = keyof typeof WATER;

export const STAGES = [
  { icon: "🌱", label: "Sowing & Sprouting", note: "Cross-referencing predictive weather patterns for your district…", at: 0 },
  { icon: "🌿", label: "Flowering & Growth", note: "Checking micro-climate risk against your soil and humidity profile…", at: 0.33 },
  { icon: "🐛", label: "Pest Warning Trigger", note: "Early blight risk detected around day 45 — factoring it into the forecast…", at: 0.66 },
  { icon: "🍅", label: "Harvest & Profit", note: "Matching harvest date against projected market demand…", at: 0.9 },
] as const;

export const SIM_DURATION_MS = 30000;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export interface SimResult {
  yieldPerAcre: number;
  pestRisk: number;
  costPerAcre: number;
  profitPerAcre: number;
}

function computeBase(crop: CropKey, soil: SoilKey, water: WaterKey) {
  const c = CROPS[crop];
  const s = SOIL[soil];
  const w = WATER[water];
  return {
    yieldPerAcre: c.yield * s.yieldMult * w.yieldMult,
    pestRisk: clamp(c.pest + s.pestDelta + w.pestDelta, 3, 95),
    costPerAcre: c.cost * s.costMult * w.costMult,
    price: c.price,
  };
}

export function computeScenario(
  crop: CropKey,
  soil: SoilKey,
  water: WaterKey,
  { organic, delay }: { organic: boolean; delay: boolean }
): SimResult {
  const base = computeBase(crop, soil, water);
  let yieldPerAcre = base.yieldPerAcre;
  let pestRisk = base.pestRisk;
  const costPerAcre0 = base.costPerAcre;
  let costPerAcre = costPerAcre0;
  let price = base.price;

  if (organic) {
    yieldPerAcre *= 0.95;
    costPerAcre *= 0.7;
    price *= 1.18;
  }
  if (delay) {
    yieldPerAcre *= 0.98;
    price *= 1.08;
    pestRisk = clamp(pestRisk - 3, 3, 95);
  }

  const revenuePerAcre = yieldPerAcre * price;
  const profitPerAcre = revenuePerAcre - costPerAcre;
  return { yieldPerAcre, pestRisk, costPerAcre, profitPerAcre };
}

export const fmtMoney = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const fmtTons = (n: number) => n.toFixed(1) + " Tons/Acre";
export const fmtPct = (n: number) => Math.round(n) + "%";

export function yieldStatus(result: SimResult, cropKey: CropKey) {
  const target = CROPS[cropKey].yield;
  if (result.yieldPerAcre >= target * 0.95) return { icon: "🟢", text: "Healthy target for selected soil" };
  if (result.yieldPerAcre >= target * 0.75) return { icon: "🟡", text: "Below average — consider soil amendment" };
  return { icon: "🔴", text: "Low — reconsider crop / soil match" };
}

export function pestStatus(result: SimResult) {
  if (result.pestRisk < 15) return { icon: "🟢", text: "Low risk" };
  if (result.pestRisk < 30) return { icon: "🟡", text: "Moderate risk — watch for early blight around day 45" };
  return { icon: "🔴", text: "High risk — preventive spraying recommended" };
}

export function costStatus(result: SimResult, cropKey: CropKey) {
  const base = CROPS[cropKey].cost;
  if (result.costPerAcre <= base * 1.1) return { icon: "🟢", text: "Budget-friendly" };
  if (result.costPerAcre <= base * 1.3) return { icon: "🟡", text: "Above average input cost" };
  return { icon: "🔴", text: "High input cost for this crop" };
}

export function profitStatus(result: SimResult) {
  if (result.profitPerAcre <= 0) return { icon: "🔴", text: "Not profitable at current inputs" };
  if (result.profitPerAcre < 400) return { icon: "🟡", text: "Marginal profit" };
  return { icon: "📈", text: "Recommended crop choice" };
}
