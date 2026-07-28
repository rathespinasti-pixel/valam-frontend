export interface Pest {
  name: string;
  icon: string;
  crops: string[];
  treatment: string;
}

export const PESTS: Record<string, Pest> = {
  "rice-stem-borer": {
    name: "Rice Stem Borer",
    icon: "fa-bug",
    crops: ["Rice", "Paddy"],
    treatment: "Remove and destroy affected stems (dead hearts/whiteheads) immediately.",
  },
  "fruit-fly": {
    name: "Fruit Fly",
    icon: "fa-mosquito",
    crops: ["Mango", "Guava", "Citrus", "Vegetables"],
    treatment: "Install pheromone or bait traps around the field and remove/bury fallen or infested fruit.",
  },
  armyworm: {
    name: "Armyworm",
    icon: "fa-bug",
    crops: ["Maize", "Rice", "Sugarcane"],
    treatment: "Scout the field edges early morning and hand-pick larvae where feasible.",
  },
  grasshopper: {
    name: "Grasshopper",
    icon: "fa-bug",
    crops: ["Rice", "Vegetables", "Grains"],
    treatment: "Clear bordering weeds and bunds where they breed, and net young nurseries.",
  },
  cricket: {
    name: "Cricket",
    icon: "fa-bug",
    crops: ["Seedlings", "Vegetables", "Lawn/Turf"],
    treatment: "Reduce field debris and mulch where they shelter, and protect young seedlings with covers.",
  },
};

export const PEST_KEYS = Object.keys(PESTS);

export type RiskLevel = "Low" | "Medium" | "High";
export const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High"];

export const RISK_URGENCY: Record<RiskLevel, string> = {
  Low: "Infestation appears mild — monitor the area every few days and act if sounds/damage increase.",
  Medium: "Infestation is moderate — plan control action within the next few days to prevent spread.",
  High: "Infestation is severe — take action immediately to prevent further crop damage.",
};

// Which recommendation category to foreground per severity — higher risk leans on faster-acting control.
export const RISK_RECOMMENDATIONS: Record<RiskLevel, string[]> = {
  Low: ["biological-control"],
  Medium: ["biological-pesticide", "biological-control"],
  High: ["safe-pesticide", "biological-pesticide"],
};

export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}
