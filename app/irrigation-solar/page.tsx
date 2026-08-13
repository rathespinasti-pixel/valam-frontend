"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import {
  Droplets,
  Ruler,
  Sun,
  Layers,
  Wrench,
  CheckCircle,
  FileText,
  CloudRain,
  Sliders,
  DollarSign,
  Info,
  Calendar,
  Sparkles,
  RotateCcw,
} from "lucide-react";

// Crop spacing lookup dictionary (cm)
const CROP_SPACING_DB: Record<string, { plant: number; row: number }> = {
  Tomato: { plant: 50, row: 75 },
  Chilli: { plant: 45, row: 60 },
  "Red Onion": { plant: 10, row: 15 },
  Brinjal: { plant: 60, row: 90 },
  Okra: { plant: 30, row: 60 },
  Peanut: { plant: 15, row: 30 },
  Pumpkin: { plant: 100, row: 150 },
  Cucumber: { plant: 40, row: 100 },
  Maize: { plant: 25, row: 75 },
  "Green Gram": { plant: 10, row: 30 },
};

import { solarCalcSchema, getFieldErrors } from "@/lib/validations";

export default function SmartIrrigationPage() {
  const { t, language } = useLanguage();

  // Form State — ZERO default values
  const [cropName, setCropName] = useState("");
  const [cropVariety, setCropVariety] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [irrigationMethod, setIrrigationMethod] = useState("");

  const [inputMode, setInputMode] = useState<"size" | "dimensions">("size");
  const [landSize, setLandSize] = useState<number | "">("");
  const [landUnit, setLandUnit] = useState<string>("");
  const [lengthMeters, setLengthMeters] = useState<number | "">("");
  const [widthMeters, setWidthMeters] = useState<number | "">("");

  const [plantSpacingCm, setPlantSpacingCm] = useState<number>(50);
  const [rowSpacingCm, setRowSpacingCm] = useState<number>(75);

  const [waterSource, setWaterSource] = useState("");
  const [pumpHp, setPumpHp] = useState<string>("");
  const [flowRateLh, setFlowRateLh] = useState<string>("");

  const [soilType, setSoilType] = useState("");
  const [terrain, setTerrain] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [reportGenerated, setReportGenerated] = useState(false);

  // Sync crop spacing when crop changes
  useEffect(() => {
    if (cropName) {
      const defaultSpacing = CROP_SPACING_DB[cropName] || { plant: 45, row: 60 };
      setPlantSpacingCm(defaultSpacing.plant);
      setRowSpacingCm(defaultSpacing.row);
    }
  }, [cropName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});

    const validationResult = solarCalcSchema.safeParse({
      crop_name: cropName,
      growth_stage: growthStage,
      irrigation_method: irrigationMethod,
      land_size: landSize,
      land_size_unit: landUnit,
      water_source: waterSource,
    });

    if (!validationResult.success) {
      const errors = getFieldErrors(validationResult);
      setFormErrors(errors);
      return;
    }

    setReportGenerated(true);
    setTimeout(() => {
      document.getElementById("irrigation-report-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  // Convert land size to square meters ($m^2$)
  function calculateAreaSqM(): { areaSqM: number; lengthM: number; widthM: number } {
    const lNum = typeof lengthMeters === "number" && lengthMeters > 0 ? lengthMeters : 50;
    const wNum = typeof widthMeters === "number" && widthMeters > 0 ? widthMeters : 40;

    if (inputMode === "dimensions") {
      const area = lNum * wNum;
      return { areaSqM: area, lengthM: lNum, widthM: wNum };
    }

    let areaSqM = 4046.86; // Default 1 Acre
    const size = typeof landSize === "number" && landSize > 0 ? landSize : 1.0;

    switch (landUnit) {
      case "Acres":
        areaSqM = size * 4046.86;
        break;
      case "Perches":
        areaSqM = size * 25.2929;
        break;
      case "Hectares":
        areaSqM = size * 10000;
        break;
      case "Square Feet":
        areaSqM = size * 0.092903;
        break;
      case "Square Metres":
        areaSqM = size;
        break;
      default:
        areaSqM = size * 4046.86;
    }

    const side = Math.sqrt(areaSqM);
    return { areaSqM, lengthM: Math.round(side * 10) / 10, widthM: Math.round(side * 10) / 10 };
  }

  const { areaSqM, lengthM, widthM } = calculateAreaSqM();

  // Plant population calculation
  const plantSpacingM = plantSpacingCm / 100;
  const rowSpacingM = rowSpacingCm / 100;
  const estimatedPlants = Math.max(1, Math.floor(areaSqM / (plantSpacingM * rowSpacingM)));

  // Pipe Length Calculations
  const mainPipeM = Math.round(widthM + 10);
  const subMainPipeM = Math.round(widthM);
  const numberOfLaterals = Math.max(1, Math.floor(widthM / rowSpacingM));
  const totalLateralM = Math.round(numberOfLaterals * lengthM);
  const totalPipeM = mainPipeM + subMainPipeM + totalLateralM;

  // Drip Calculations
  const emitterSpacingM = plantSpacingM;
  const totalEmitters = Math.max(1, Math.floor(totalLateralM / emitterSpacingM));

  // Sprinkler Calculations
  const sprinklerCoverageSqM = 100; // 10m x 10m
  const totalSprinklers = Math.max(1, Math.ceil(areaSqM / sprinklerCoverageSqM));

  // Water Requirement Calculation (Liters/plant/day)
  let baseWaterPerPlant = 2.5; // Liters/day
  if (growthStage === "Seedling") baseWaterPerPlant = 1.2;
  else if (growthStage === "Vegetative") baseWaterPerPlant = 2.2;
  else if (growthStage === "Flowering") baseWaterPerPlant = 3.0;
  else if (growthStage === "Fruiting") baseWaterPerPlant = 3.8;

  if (soilType === "Sandy") baseWaterPerPlant *= 1.2;
  else if (soilType === "Clay") baseWaterPerPlant *= 0.85;

  const totalDailyWaterLiters = Math.round(estimatedPlants * baseWaterPerPlant);
  const weeklyWaterLiters = totalDailyWaterLiters * 7;

  // Material Quotation List
  const materialList = [
    { item: `Main PVC Pipe (50mm / 2")`, qty: `${mainPipeM} m` },
    { item: `Sub-Main HDPE Pipe (40mm / 1.5")`, qty: `${subMainPipeM} m` },
    {
      item: irrigationMethod === "Drip Irrigation" ? `Lateral Drip Tube (16mm)` : `Branch Distribution Pipe (32mm)`,
      qty: `${totalLateralM} m`,
    },
    {
      item:
        irrigationMethod === "Drip Irrigation"
          ? `Inline Drip Emitters (${emitterSpacingM * 100}cm spacing, 2 L/h)`
          : irrigationMethod === "Sprinkler Irrigation"
          ? `Rotary Impact Sprinklers (10m radius)`
          : `Water Hoses & Watering Cans`,
      qty: irrigationMethod === "Drip Irrigation" ? `${totalEmitters}` : irrigationMethod === "Sprinkler Irrigation" ? `${totalSprinklers}` : `4 Sets`,
    },
    { item: `120 Mesh Screen / Disc Water Filter`, qty: `1 Unit` },
    { item: `Control Gate Valves (1.5")`, qty: `4 Units` },
    { item: `Pressure Regulator (1.5 - 2.0 bar)`, qty: `1 Unit` },
    { item: `End Caps & Line Stoppers`, qty: `${Math.round(numberOfLaterals + 4)} Units` },
    { item: `Tee Connectors & Elbow Joiners`, qty: `${Math.round(numberOfLaterals * 2)} Units` },
    { item: `Punch Tool & Rubber Grommets`, qty: `1 Set` },
  ];

  return (
    <AuthGuard>
      <Navbar active="irrigation-solar" pageTitle={t("smartIrrigationPlanner")} />
      
      <section className="page-hero">
        <div className="container">
          <div className="crumb">Valam / {t("smartIrrigationPlanner")}</div>
          <h1>{t("smartIrrigationPlanner")}</h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 640 }}>
            {t("irrigationHeroSubtitle")}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Form Section: Step 1 */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: 32,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              marginBottom: 32,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Sliders size={24} color="#16A34A" />
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1B4D3E", margin: 0 }}>
                {t("step1CollectInfo")}
              </h2>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Crop & Growth Details */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("cropName")} *
                  </label>
                  <select
                    className={`input ${formErrors.crop_name ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={cropName}
                    onChange={(e) => {
                      setCropName(e.target.value);
                      if (formErrors.crop_name) setFormErrors((prev) => ({ ...prev, crop_name: "" }));
                    }}
                  >
                    <option value="">-- Select Crop --</option>
                    <option value="Tomato">Tomato ({language === "ta" ? "தக்காளி" : language === "si" ? "තක්කාලි" : "Tomato"})</option>
                    <option value="Chilli">Chilli ({language === "ta" ? "மிளகாய்" : language === "si" ? "මිරිස්" : "Chilli"})</option>
                    <option value="Red Onion">Red Onion ({language === "ta" ? "வெங்காயம்" : language === "si" ? "රතු ළූණු" : "Red Onion"})</option>
                    <option value="Brinjal">Brinjal ({language === "ta" ? "கத்தரி" : language === "si" ? "වම්බටු" : "Brinjal"})</option>
                    <option value="Okra">Okra ({language === "ta" ? "வெண்டி" : language === "si" ? "බණ්ඩක්කා" : "Okra"})</option>
                    <option value="Peanut">Peanut ({language === "ta" ? "நிலக்கடலை" : language === "si" ? "රටකජු" : "Peanut"})</option>
                    <option value="Pumpkin">Pumpkin ({language === "ta" ? "பூசணி" : language === "si" ? "වට්ටක්කා" : "Pumpkin"})</option>
                    <option value="Cucumber">Cucumber ({language === "ta" ? "வெள்ளரி" : language === "si" ? "පිපිඤ්ඤා" : "Cucumber"})</option>
                    <option value="Maize">Maize ({language === "ta" ? "சோளம்" : language === "si" ? "බඩඉරිඟු" : "Maize"})</option>
                    <option value="Green Gram">Green Gram ({language === "ta" ? "பயறு" : language === "si" ? "මුං ඇට" : "Green Gram"})</option>
                  </select>
                  {formErrors.crop_name && <span className="field-error-text">{formErrors.crop_name}</span>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("cropVarietyOptional")}
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. MICO-1 / Local"
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={cropVariety}
                    onChange={(e) => setCropVariety(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("growthStage")} *
                  </label>
                  <select
                    className={`input ${formErrors.growth_stage ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={growthStage}
                    onChange={(e) => {
                      setGrowthStage(e.target.value);
                      if (formErrors.growth_stage) setFormErrors((prev) => ({ ...prev, growth_stage: "" }));
                    }}
                  >
                    <option value="">-- Select Stage --</option>
                    <option value="Seedling">{t("seedlingStage")}</option>
                    <option value="Vegetative">{t("vegetativeStage")}</option>
                    <option value="Flowering">{t("floweringStage")}</option>
                    <option value="Fruiting">{t("fruitingStage")}</option>
                  </select>
                  {formErrors.growth_stage && <span className="field-error-text">{formErrors.growth_stage}</span>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("irrigationPreference")} *
                  </label>
                  <select
                    className={`input ${formErrors.irrigation_method ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={irrigationMethod}
                    onChange={(e) => {
                      setIrrigationMethod(e.target.value);
                      if (formErrors.irrigation_method) setFormErrors((prev) => ({ ...prev, irrigation_method: "" }));
                    }}
                  >
                    <option value="">-- Select Irrigation --</option>
                    <option value="Drip Irrigation">{t("dripIrrigation")}</option>
                    <option value="Sprinkler Irrigation">{t("sprinklerIrrigation")}</option>
                    <option value="Manual Watering">{t("manualWatering")}</option>
                  </select>
                  {formErrors.irrigation_method && <span className="field-error-text">{formErrors.irrigation_method}</span>}
                </div>
              </div>

              {/* Land Information */}
              <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 14, marginBottom: 20, border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <label style={{ fontWeight: 700, fontSize: 15, color: "#1E293B" }}>
                    <Ruler size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    {t("landDetails")} *
                  </label>
                  <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                    <label style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="inputMode"
                        checked={inputMode === "size"}
                        onChange={() => setInputMode("size")}
                        style={{ marginRight: 4 }}
                      />
                      Total Size &amp; Unit
                    </label>
                    <label style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="inputMode"
                        checked={inputMode === "dimensions"}
                        onChange={() => setInputMode("dimensions")}
                        style={{ marginRight: 4 }}
                      />
                      Length × Width (m)
                    </label>
                  </div>
                </div>

                {inputMode === "size" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("landSize")} *</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 1.0"
                        className={`input ${formErrors.land_size ? "input-invalid" : ""}`}
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={landSize}
                        onChange={(e) => {
                          setLandSize(e.target.value ? parseFloat(e.target.value) : "");
                          if (formErrors.land_size) setFormErrors((prev) => ({ ...prev, land_size: "" }));
                        }}
                      />
                      {formErrors.land_size && <span className="field-error-text">{formErrors.land_size}</span>}
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("landUnit")} *</label>
                      <select
                        className={`input ${formErrors.land_size_unit ? "input-invalid" : ""}`}
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={landUnit}
                        onChange={(e) => {
                          setLandUnit(e.target.value);
                          if (formErrors.land_size_unit) setFormErrors((prev) => ({ ...prev, land_size_unit: "" }));
                        }}
                      >
                        <option value="">-- Select Unit --</option>
                        <option value="Acres">{t("acres")}</option>
                        <option value="Perches">{t("perches")}</option>
                        <option value="Hectares">{t("hectares")}</option>
                        <option value="Square Feet">{t("squareFeet")}</option>
                        <option value="Square Metres">Square Metres ($m^2$)</option>
                      </select>
                      {formErrors.land_size_unit && <span className="field-error-text">{formErrors.land_size_unit}</span>}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Land Length (metres)</label>
                      <input
                        type="number"
                        step="1"
                        placeholder="e.g. 50"
                        className="input"
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={lengthMeters}
                        onChange={(e) => setLengthMeters(e.target.value ? parseFloat(e.target.value) : "")}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Land Width (metres)</label>
                      <input
                        type="number"
                        step="1"
                        placeholder="e.g. 40"
                        className="input"
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={widthMeters}
                        onChange={(e) => setWidthMeters(e.target.value ? parseFloat(e.target.value) : "")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Crop Spacing & Water Source */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("plantSpacing")} (cm)
                  </label>
                  <input
                    type="number"
                    min="5"
                    className="input"
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={plantSpacingCm}
                    onChange={(e) => setPlantSpacingCm(parseInt(e.target.value) || 45)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("rowSpacing")} (cm)
                  </label>
                  <input
                    type="number"
                    min="10"
                    className="input"
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={rowSpacingCm}
                    onChange={(e) => setRowSpacingCm(parseInt(e.target.value) || 60)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("waterSource")} *
                  </label>
                  <select
                    className={`input ${formErrors.water_source ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={waterSource}
                    onChange={(e) => {
                      setWaterSource(e.target.value);
                      if (formErrors.water_source) setFormErrors((prev) => ({ ...prev, water_source: "" }));
                    }}
                  >
                    <option value="">-- Select Source --</option>
                    <option value="Well">{t("well")}</option>
                    <option value="Borewell">{t("borewell")}</option>
                    <option value="Water Tank">{t("waterTank")}</option>
                    <option value="Canal">{t("canal")}</option>
                    <option value="River">{t("river")}</option>
                    <option value="Municipal Water">{t("municipalWater")}</option>
                    <option value="Other">{t("otherSource")}</option>
                  </select>
                  {formErrors.water_source && <span className="field-error-text">{formErrors.water_source}</span>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("soilType")}
                  </label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                  >
                    <option value="">-- Select Soil --</option>
                    <option value="Loamy">{t("loamySoil")}</option>
                    <option value="Sandy">{t("sandySoil")}</option>
                    <option value="Clay">{t("claySoil")}</option>
                  </select>
                </div>
              </div>

              {/* Pump & Terrain (Optional) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("pumpCapacityHp")}
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 1.5 HP"
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={pumpHp}
                    onChange={(e) => setPumpHp(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("waterFlowRate")}
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 3000 L/h"
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={flowRateLh}
                    onChange={(e) => setFlowRateLh(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {t("terrain")}
                  </label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={terrain}
                    onChange={(e) => setTerrain(e.target.value)}
                  >
                    <option value="">-- Select Terrain --</option>
                    <option value="Flat">{t("flatTerrain")}</option>
                    <option value="Slight Slope">{t("slightSlope")}</option>
                    <option value="Steep">{t("steepTerrain")}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-sun"
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Sparkles size={20} />
                {t("generateIrrigationPlan")}
              </button>
            </form>
          </div>

          {/* Step 2: Smart Irrigation Report Output */}
          {reportGenerated && (
            <div id="irrigation-report-section" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Header Banner */}
              <div style={{ background: "linear-gradient(135deg, #1B4D3E, #059669)", borderRadius: 20, padding: 28, color: "#FFFFFF", boxShadow: "0 4px 20px rgba(5,150,105,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A7F3D0", fontWeight: 700 }}>
                      {t("step2GenerateReport")}
                    </span>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: "6px 0 4px", color: "#FFFFFF" }}>
                      Smart Irrigation Plan — {cropName} ({growthStage})
                    </h2>
                    <div style={{ fontSize: 14, color: "#ECFDF5" }}>
                      Field Area: {Math.round(areaSqM)} $m^2$ ({lengthM}m × {widthM}m) · Method: {irrigationMethod} · Soil: {soilType}
                    </div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-outline"
                    style={{ borderColor: "#A7F3D0", color: "#FFFFFF", background: "rgba(255,255,255,0.1)", display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <FileText size={16} /> Print / Save PDF Report
                  </button>
                </div>
              </div>

              {/* Overview Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{t("estimatedPlants")}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#1B4D3E", marginTop: 4 }}>
                    {estimatedPlants.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500 }}>plants</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#10B981", marginTop: 4 }}>
                    Spacing: {plantSpacingCm}cm × {rowSpacingCm}cm
                  </div>
                </div>

                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{t("totalPipeRequirement")}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#2563EB", marginTop: 4 }}>
                    {totalPipeM} <span style={{ fontSize: 14, fontWeight: 500 }}>metres</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#3B82F6", marginTop: 4 }}>
                    Main: {mainPipeM}m | Sub: {subMainPipeM}m | Lateral: {totalLateralM}m
                  </div>
                </div>

                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                    {irrigationMethod === "Drip Irrigation" ? t("numberOfEmitters") : t("numberOfSprinklers")}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#D97706", marginTop: 4 }}>
                    {irrigationMethod === "Drip Irrigation" ? totalEmitters.toLocaleString() : totalSprinklers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: "#F59E0B", marginTop: 4 }}>
                    {irrigationMethod === "Drip Irrigation" ? `Emitter Spacing: ${plantSpacingCm}cm` : `Coverage: 10m × 10m`}
                  </div>
                </div>

                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{t("dailyWaterRequirement")}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#059669", marginTop: 4 }}>
                    {totalDailyWaterLiters.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500 }}>Liters/day</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#059669", marginTop: 4 }}>
                    ~{baseWaterPerPlant} L per plant/day
                  </div>
                </div>
              </div>

              {/* Detailed Technical Layout & Water Calculations */}
              <div className="grid-sidebar-responsive" style={{ gap: 24 }}>
                
                {/* Left Card: Method Calculation Details */}
                <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Wrench size={20} color="#16A34A" /> {t("pipeLayoutSummary")} ({irrigationMethod})
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                      <span style={{ color: "#64748B" }}>{t("mainPipeLength")}:</span>
                      <strong style={{ color: "#1E293B" }}>{mainPipeM} metres (50mm / 2" PVC)</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                      <span style={{ color: "#64748B" }}>{t("subMainPipeLength")}:</span>
                      <strong style={{ color: "#1E293B" }}>{subMainPipeM} metres (40mm / 1.5" HDPE)</strong>
                    </div>

                    {irrigationMethod === "Drip Irrigation" && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>{t("numberOfLaterals")}:</span>
                          <strong style={{ color: "#1E293B" }}>{numberOfLaterals} lateral rows</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>{t("lengthOfEachLateral")}:</span>
                          <strong style={{ color: "#1E293B" }}>{lengthM} metres each</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>{t("totalLateralLength")}:</span>
                          <strong style={{ color: "#166534" }}>{totalLateralM} metres (16mm tube)</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>{t("filterRecommendation")}:</span>
                          <strong style={{ color: "#1E293B" }}>120 Mesh Screen / Disc Filter</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>{t("pressureRegulator")}:</span>
                          <strong style={{ color: "#1E293B" }}>1.5 – 2.0 Bar Constant Pressure Regulator</strong>
                        </div>
                      </>
                    )}

                    {irrigationMethod === "Sprinkler Irrigation" && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>{t("numberOfSprinklers")}:</span>
                          <strong style={{ color: "#1E293B" }}>{totalSprinklers} Sprinkler Heads</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>{t("sprinklerCoverage")}:</span>
                          <strong style={{ color: "#1E293B" }}>10m × 10m Grid ({sprinklerCoverageSqM} $m^2$ per head)</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>{t("sprinklerType")}:</span>
                          <strong style={{ color: "#166534" }}>Rotary Impact Sprinklers (Medium Pressure)</strong>
                        </div>
                      </>
                    )}

                    {irrigationMethod === "Manual Watering" && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>Watering Frequency:</span>
                          <strong style={{ color: "#1E293B" }}>2 Times Daily (Early Morning &amp; Evening)</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #E2E8F0" }}>
                          <span style={{ color: "#64748B" }}>Recommended Duration:</span>
                          <strong style={{ color: "#1E293B" }}>45 minutes per watering session</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Card: Weather Aware Schedule & Water Math */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "#EFF6FF", borderRadius: 16, padding: 20, border: "1px solid #BFDBFE" }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1E40AF", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <CloudRain size={18} /> Weather-Aware Watering Schedule
                    </h4>
                    <div style={{ fontSize: 14, color: "#1E3A8A", lineHeight: 1.5 }}>
                      <strong>Suggested Times:</strong>
                      <ul style={{ margin: "6px 0 10px 18px" }}>
                        <li>Morning: 6:00 AM – 7:15 AM</li>
                        <li>Evening: 5:30 PM – 6:30 PM</li>
                      </ul>
                      <div style={{ background: "#DBEAFE", padding: 10, borderRadius: 8, fontSize: 13, color: "#1E40AF" }}>
                        💡 <em>Northern Province Advisory: If high temperature (&gt;32°C) is predicted, irrigate during early morning to reduce evaporation loss.</em>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#F0FDF4", borderRadius: 16, padding: 20, border: "1px solid #BBF7D0" }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: "#166534", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <Droplets size={18} /> {t("waterSavingTips")}
                    </h4>
                    <ul style={{ fontSize: 13, color: "#14532D", margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                      <li>Use paddy straw or dried leaf mulching around crop bases to retain 35% more soil moisture.</li>
                      <li>Flush drip lateral tubes bi-weekly to prevent mineral clog buildup.</li>
                      <li>Adjust irrigation duration during Maha rainy season.</li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* Itemized Material List & Quotation Summary */}
              <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <DollarSign size={20} color="#059669" /> {t("materialQuotation")}
                </h3>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                      <th style={{ padding: 12, color: "#475569" }}>#</th>
                      <th style={{ padding: 12, color: "#475569" }}>{t("itemDescription")}</th>
                      <th style={{ padding: 12, color: "#475569", textAlign: "right" }}>{t("estimatedQuantity")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialList.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: 12, color: "#94A3B8" }}>{idx + 1}</td>
                        <td style={{ padding: 12, fontWeight: 600, color: "#1E293B" }}>{item.item}</td>
                        <td style={{ padding: 12, fontWeight: 700, color: "#059669", textAlign: "right" }}>{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      </section>
      
      <Footer />
    </AuthGuard>
  );
}
