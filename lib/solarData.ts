export interface SolarSystem {
  maxAcres: number;
  panel: string;
  pump: string;
  area: string;
  cost: string;
}

export const PRICE_TABLE: SolarSystem[] = [
  { maxAcres: 0.5, panel: "550W", pump: "0.5 HP DC Pump", area: "Small Garden", cost: "Rs. 250,000 - 350,000" },
  { maxAcres: 1, panel: "900W", pump: "0.75 HP DC Pump", area: "Up to 1 Acre", cost: "Rs. 350,000 - 450,000" },
  { maxAcres: 3, panel: "1.65kW", pump: "1 HP DC Pump", area: "1-3 Acres", cost: "Rs. 500,000 - 650,000" },
  { maxAcres: 6, panel: "2.75kW", pump: "2 HP DC Pump", area: "3-6 Acres", cost: "Rs. 850,000 - 1,100,000" },
  { maxAcres: 10, panel: "3.3kW", pump: "3 HP DC Pump", area: "Medium Farm", cost: "Rs. 1,100,000 - 1,450,000" },
  { maxAcres: 20, panel: "4.4kW", pump: "4 HP DC Pump", area: "Large Farm", cost: "Rs. 1,500,000 - 1,900,000" },
  { maxAcres: 35, panel: "5.5kW", pump: "5 HP DC Pump", area: "Commercial Farm", cost: "Rs. 1,900,000 - 2,400,000" },
  { maxAcres: 60, panel: "7.7kW", pump: "7.5 HP DC Pump", area: "Plantation", cost: "Rs. 2,600,000 - 3,300,000" },
  { maxAcres: Infinity, panel: "9.9kW", pump: "10 HP DC Pump", area: "Large Agriculture", cost: "Rs. 3,500,000 - 4,500,000" },
];

// Recommendation-system table is the same price tiers, minus the 2.2kW
// "Vegetable Farm" tier (that one is only reachable via the 1–3 acre
// mixed-vegetable special case below) — ported 1:1 from js/irrigation-solar.js.
const SYSTEMS: SolarSystem[] = [
  { maxAcres: 0.5, panel: "550W", pump: "0.5 HP DC Pump", area: "Small Garden", cost: "Rs. 250,000 - 350,000" },
  { maxAcres: 1, panel: "900W", pump: "0.75 HP DC Pump", area: "Up to 1 Acre", cost: "Rs. 350,000 - 450,000" },
  { maxAcres: 3, panel: "1.65kW", pump: "1 HP DC Pump", area: "1-3 Acres", cost: "Rs. 500,000 - 650,000" },
  { maxAcres: 6, panel: "2.75kW", pump: "2 HP DC Pump", area: "3-6 Acres", cost: "Rs. 850,000 - 1,100,000" },
  { maxAcres: 10, panel: "3.3kW", pump: "3 HP DC Pump", area: "Medium Farm", cost: "Rs. 1,100,000 - 1,450,000" },
  { maxAcres: 20, panel: "4.4kW", pump: "4 HP DC Pump", area: "Large Farm", cost: "Rs. 1,500,000 - 1,900,000" },
  { maxAcres: 35, panel: "5.5kW", pump: "5 HP DC Pump", area: "Commercial Farm", cost: "Rs. 1,900,000 - 2,400,000" },
  { maxAcres: 60, panel: "7.7kW", pump: "7.5 HP DC Pump", area: "Plantation", cost: "Rs. 2,600,000 - 3,300,000" },
  { maxAcres: Infinity, panel: "9.9kW", pump: "10 HP DC Pump", area: "Large Agriculture", cost: "Rs. 3,500,000 - 4,500,000" },
];

const VEGETABLE_SYSTEM: SolarSystem = {
  maxAcres: 3,
  panel: "2.2kW",
  pump: "1.5 HP DC Pump",
  area: "Vegetable Farm",
  cost: "Rs. 650,000 - 850,000",
};

export function pickSystem(acres: number, crop: string): SolarSystem {
  if (crop === "vegetable" && acres > 1 && acres <= 3) return VEGETABLE_SYSTEM;
  return SYSTEMS.find((s) => acres <= s.maxAcres) || SYSTEMS[SYSTEMS.length - 1];
}

export function pickIrrigation(crop: string, waterSource: string): string {
  if (crop === "paddy") return "Sprinkler / Flood System";
  if (waterSource === "pond") return "Drip System with Filtration";
  return "Drip System";
}

export interface SubsidyResult {
  programs: string[];
  documents: string[];
  process: string[];
}

const DOCUMENTS = [
  "National Identity Card (NIC) copy",
  "Land ownership or lease document",
  "Cultivation certificate from Grama Niladhari",
  "Bank account details",
];

const PROCESS = [
  "Submit application at the Divisional Agricultural Office",
  "Site inspection by an agricultural officer",
  "Approval and subsidy allocation notice",
  "Install the solar system with an approved vendor",
  "Submit installation proof to claim the subsidy",
];

export function checkSubsidy(acres: number, farmerType: string): SubsidyResult {
  let programs: string[];
  if (farmerType === "cooperative") {
    programs = ["Farmer Cooperative Solar Grant — up to 50% of equipment cost", "Provincial Irrigation Modernization Fund"];
  } else if (acres <= 2) {
    programs = ["Smallholder Solar Subsidy Scheme — up to 50% of equipment cost", "Rural Solar Electrification Support"];
  } else if (acres <= 6) {
    programs = ["Medium Farm Solar Grant — up to 30% of equipment cost", "Agricultural Modernization Loan (low interest)"];
  } else {
    programs = ["Commercial Solar Loan Assistance (interest subsidy)", "Export Agriculture Solar Incentive"];
  }
  return { programs, documents: DOCUMENTS, process: PROCESS };
}
