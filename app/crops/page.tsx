"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { Crop, ValamUser } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import {
  Sprout,
  Plus,
  Calendar,
  MapPin,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Ruler,
  Layers,
  Sparkles,
  Zap,
  X,
} from "lucide-react";

// Reference images mapped to crop stages for growth visualization MVP
const STAGE_IMAGES: Record<string, { stage1: string; stage2: string; stage3: string }> = {
  Chilli: {
    stage1: "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=600&q=80",
    stage2: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=80",
    stage3: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=80",
  },
  Tomato: {
    stage1: "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=600&q=80",
    stage2: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
    stage3: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80",
  },
  "Red Onion": {
    stage1: "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=600&q=80",
    stage2: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
    stage3: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
  },
  Brinjal: {
    stage1: "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=600&q=80",
    stage2: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    stage3: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
  },
  Okra: {
    stage1: "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=600&q=80",
    stage2: "https://images.unsplash.com/photo-1599818804921-2e65005db379?auto=format&fit=crop&w=600&q=80",
    stage3: "https://images.unsplash.com/photo-1599818804921-2e65005db379?auto=format&fit=crop&w=600&q=80",
  },
  Default: {
    stage1: "https://images.unsplash.com/photo-1592417817098-8f3d69a0a19e?auto=format&fit=crop&w=600&q=80",
    stage2: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
    stage3: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80",
  },
};

// Crop Spacing & Density Data
const CROP_SPACING: Record<string, { plant: string; row: string; plant_cm: number; row_cm: number }> = {
  Chilli: { plant: "45 cm", row: "60 cm", plant_cm: 45, row_cm: 60 },
  Tomato: { plant: "50 cm", row: "75 cm", plant_cm: 50, row_cm: 75 },
  "Red Onion": { plant: "10 cm", row: "15 cm", plant_cm: 10, row_cm: 15 },
  Brinjal: { plant: "60 cm", row: "90 cm", plant_cm: 60, row_cm: 90 },
  Okra: { plant: "30 cm", row: "60 cm", plant_cm: 30, row_cm: 60 },
  Peanut: { plant: "15 cm", row: "30 cm", plant_cm: 15, row_cm: 30 },
  Pumpkin: { plant: "100 cm", row: "150 cm", plant_cm: 100, row_cm: 150 },
  Cucumber: { plant: "40 cm", row: "100 cm", plant_cm: 40, row_cm: 100 },
  Maize: { plant: "25 cm", row: "75 cm", plant_cm: 25, row_cm: 75 },
  Watermelon: { plant: "90 cm", row: "180 cm", plant_cm: 90, row_cm: 180 },
  watermelon: { plant: "90 cm", row: "180 cm", plant_cm: 90, row_cm: 180 },
};

const DEFAULT_CROP_OPTIONS = [
  { name: "Chilli", label: "Chilli (மிளகாய் / මිරිස්)" },
  { name: "Tomato", label: "Tomato (தக்காளி / තක්කාලි)" },
  { name: "Red Onion", label: "Red Onion (சின்ன வெங்காயம் / රතු ළූණු)" },
  { name: "Brinjal", label: "Brinjal (கத்தரி / වම්බටු)" },
  { name: "Okra", label: "Okra (வெண்டி / බණ්ඩක්කා)" },
  { name: "Peanut", label: "Peanut / Groundnut (நிலக்கடலை / රටකජு)" },
  { name: "Pumpkin", label: "Pumpkin (பூசணி / වට්ටක්කා)" },
  { name: "Cucumber", label: "Cucumber (வெள்ளரி / පිපිඤ්ඤා)" },
  { name: "Maize", label: "Maize (சோளம் / බඩඉරිඟු)" },
  { name: "Green Gram", label: "Green Gram (பயறு / මුං ඇට)" },
  { name: "Watermelon", label: "Watermelon (தர்பூசணி / පැණි කොමඩු)" },
];

import { addCropSchema, getFieldErrors } from "@/lib/validations";

export default function CropsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [activeStageTab, setActiveStageTab] = useState<1 | 2 | 3>(1);
  const [cropOptions, setCropOptions] = useState<{ name: string; label: string }[]>(DEFAULT_CROP_OPTIONS);

  // Form state — ZERO default values
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [plantingMethod, setPlantingMethod] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [landSize, setLandSize] = useState<number | "">("");
  const [landUnit, setLandUnit] = useState("");
  const [irrigationType, setIrrigationType] = useState("");
  const [fertilizerPref, setFertilizerPref] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function fetchCrops() {
    try {
      setLoading(true);
      const [res, guidesRes, catalogueRes] = await Promise.allSettled([
        ValamAPI.getCrops(),
        ValamAPI.getCropGuides(),
        ValamAPI.getCatalogueCrops(),
      ]);

      if (res.status === "fulfilled") {
        setCrops(res.value.items);
        if (res.value.items.length > 0 && !selectedCrop) {
          setSelectedCrop(res.value.items[0]);
        }
      }

      const dynamicMap = new Map<string, string>();
      DEFAULT_CROP_OPTIONS.forEach((opt) => dynamicMap.set(opt.name.toLowerCase(), opt.label));

      if (guidesRes.status === "fulfilled" && guidesRes.value?.items) {
        guidesRes.value.items.forEach((g) => {
          if (g.crop_name && !dynamicMap.has(g.crop_name.toLowerCase())) {
            const formatted = g.crop_name.charAt(0).toUpperCase() + g.crop_name.slice(1);
            dynamicMap.set(g.crop_name.toLowerCase(), formatted);
          }
        });
      }

      if (catalogueRes.status === "fulfilled" && catalogueRes.value?.items) {
        catalogueRes.value.items.forEach((c) => {
          if (c.name && !dynamicMap.has(c.name.toLowerCase())) {
            const formatted = c.name.charAt(0).toUpperCase() + c.name.slice(1);
            dynamicMap.set(c.name.toLowerCase(), formatted);
          }
        });
      }

      const mergedOptions: { name: string; label: string }[] = [];
      dynamicMap.forEach((label, lowerKey) => {
        const foundDef = DEFAULT_CROP_OPTIONS.find((opt) => opt.name.toLowerCase() === lowerKey);
        if (foundDef) {
          mergedOptions.push(foundDef);
        } else {
          mergedOptions.push({ name: lowerKey.charAt(0).toUpperCase() + lowerKey.slice(1), label });
        }
      });

      setCropOptions(mergedOptions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }
    ValamAPI.me().then(setUser).catch(() => {});
    fetchCrops();
  }, [router]);

  const { showSuccess, showError, confirmAction } = useNotification();

  async function handleAddCrop(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const newCrop = await ValamAPI.addCrop({
        crop_name: cropName,
        variety: variety.trim() || undefined,
        planting_date: plantingDate,
        planting_method: plantingMethod,
        land_size: typeof landSize === "number" ? landSize : 0.5,
        land_size_unit: landUnit,
        irrigation_type: irrigationType,
        fertilizer_preference: fertilizerPref,
        area_size: `${landSize || 0.5} ${landUnit}`,
        current_stage: t("stage1Title"),
        notes: notes.trim() || undefined,
      });

      setShowAddModal(false);
      setNotes("");
      setSelectedCrop(newCrop);
      fetchCrops();
      showSuccess(
        "Crop Cultivation Added!",
        `${newCrop.crop_name} (${newCrop.variety || "Standard Variety"}) has been added to your field tracking.`
      );
    } catch (err: any) {
      const msg = err.message || "Failed to add crop record. Please try again.";
      setError(msg);
      showError("Failed to Add Crop", msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStage(cropId: number, stageName: string) {
    try {
      const updated = await ValamAPI.updateCrop(cropId, { current_stage: stageName });
      setCrops((prev) => prev.map((c) => (c.id === cropId ? updated : c)));
      if (selectedCrop?.id === cropId) setSelectedCrop(updated);
      showSuccess("Growth Stage Updated", `Crop stage changed to ${stageName}.`);
    } catch (err: any) {
      showError("Update Failed", err.message || "Could not update crop growth stage.");
    }
  }

  function handleDelete(cropId: number) {
    confirmAction({
      title: "Delete Crop Record",
      message: "Are you sure you want to remove this crop cultivation record? All associated data will be deleted.",
      confirmText: "Yes, Delete Record",
      onConfirm: async () => {
        try {
          await ValamAPI.deleteCrop(cropId);
          if (selectedCrop?.id === cropId) setSelectedCrop(null);
          fetchCrops();
          showSuccess("Crop Record Removed", "The crop record was deleted successfully.");
        } catch (err: any) {
          showError("Deletion Failed", err.message || "Could not delete crop record.");
        }
      },
    });
  }

  // Calculations for active/selected crop
  const activeCrop = selectedCrop || crops[0] || null;

  let daysSincePlanting = 1;
  if (activeCrop && activeCrop.planting_date) {
    const start = new Date(activeCrop.planting_date).getTime();
    const now = new Date().getTime();
    daysSincePlanting = Math.max(1, Math.floor((now - start) / (1000 * 3600 * 24)));
  }

  const cropKey = activeCrop?.crop_name || "Tomato";
  const spacingInfo = CROP_SPACING[cropKey] || CROP_SPACING["Tomato"];

  // Land size conversion to square meters
  const sizeVal = activeCrop?.land_size || 0.5;
  const unitStr = activeCrop?.land_size_unit || "Acres";

  let areaSqMeters = 2023; // 0.5 acre default
  if (unitStr === "Acres") areaSqMeters = sizeVal * 4046.86;
  else if (unitStr === "Perches") areaSqMeters = sizeVal * 25.29;
  else if (unitStr === "Hectares") areaSqMeters = sizeVal * 10000;
  else if (unitStr === "Square Feet") areaSqMeters = sizeVal * 0.0929;

  // Plant population calculation
  const plantAreaSqM = (spacingInfo.plant_cm / 100) * (spacingInfo.row_cm / 100);
  const estimatedPlantsCount = Math.round(areaSqMeters / plantAreaSqM);

  // Irrigation Math (Drip vs Sprinkler)
  const irrType = activeCrop?.irrigation_type || user?.irrigation_preference || "Drip Irrigation";
  const fertPref = activeCrop?.fertilizer_preference || user?.fertilizer_preference || "Organic";

  const rowLengthMeters = Math.sqrt(areaSqMeters);
  const numRows = Math.round(rowLengthMeters / (spacingInfo.row_cm / 100));

  const mainPipeMeters = Math.round(rowLengthMeters);
  const lateralPipeMeters = Math.round(numRows * rowLengthMeters);
  const emittersCount = Math.round(estimatedPlantsCount * 1.05);
  const sprinklersCount = Math.max(2, Math.round(areaSqMeters / 250));

  const stageImgObj = STAGE_IMAGES[cropKey] || STAGE_IMAGES["Default"];
  const currentStageImg =
    activeStageTab === 1 ? stageImgObj.stage1 : activeStageTab === 2 ? stageImgObj.stage2 : stageImgObj.stage3;

  return (
    <AuthGuard>
      <Navbar active="crops" />

      <section className="page-hero">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="crumb">Farmer Portal / Crop Lifecycle &amp; Management</div>
            <h1>Smart Crop Lifecycle Assistant</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 640 }}>
              Track 3-stage crop growth, reference plant visuals, fertilizer guidance, spacing density, and irrigation hardware math.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={20} /> {t("addCrop")}
          </button>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Add Crop Modal */}
          {showAddModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setShowAddModal(false)}
            >
              <div
                className="modal-dialog-box"
                style={{
                  background: "#FFF",
                  borderRadius: 20,
                  padding: 24,
                  maxWidth: 600,
                  width: "100%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "#F1F5F9",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} color="#64748B" />
                </button>

                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#1B4D3E" }}>
                  Add Short-Duration Cultivation
                </h2>
                
                {error && <div style={{ padding: 12, borderRadius: 8, background: "#FFEBEE", color: "#C62828", marginBottom: 16, fontSize: 14 }}>{error}</div>}

                <form onSubmit={handleAddCrop} noValidate>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("cropName")} *</label>
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
                        {cropOptions.map((opt) => (
                          <option key={opt.name} value={opt.name}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.crop_name && <span className="field-error-text">{formErrors.crop_name}</span>}
                    </div>

                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("variety")}</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. MICO-1, Thilina, Local"
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={variety}
                        onChange={(e) => setVariety(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("plantingMethod")} *</label>
                      <select
                        className={`input ${formErrors.planting_method ? "input-invalid" : ""}`}
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={plantingMethod}
                        onChange={(e) => {
                          setPlantingMethod(e.target.value);
                          if (formErrors.planting_method) setFormErrors((prev) => ({ ...prev, planting_method: "" }));
                        }}
                      >
                        <option value="">-- Select Method --</option>
                        <option value="Transplanting">Transplanting (நாற்று நடுதல் / පැළ සිටුවීම)</option>
                        <option value="Direct Seeding">Direct Seeding (நேரடி விதைப்பு / සෘජු බීජ වැපිරීම)</option>
                        <option value="Nursery Seeding">Nursery Seeding (நாற்றங்கால் / තවාන්)</option>
                      </select>
                      {formErrors.planting_method && <span className="field-error-text">{formErrors.planting_method}</span>}
                    </div>

                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("plantingDate")} *</label>
                      <input
                        type="date"
                        className={`input ${formErrors.planting_date ? "input-invalid" : ""}`}
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={plantingDate}
                        onChange={(e) => {
                          setPlantingDate(e.target.value);
                          if (formErrors.planting_date) setFormErrors((prev) => ({ ...prev, planting_date: "" }));
                        }}
                      />
                      {formErrors.planting_date && <span className="field-error-text">{formErrors.planting_date}</span>}
                    </div>
                  </div>

                  {/* Land details */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("landSize")} *</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 1.5"
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
                      </select>
                      {formErrors.land_size_unit && <span className="field-error-text">{formErrors.land_size_unit}</span>}
                    </div>
                  </div>

                  {/* Irrigation & Fertilizer */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("irrigationPreference")} *</label>
                      <select
                        className={`input ${formErrors.irrigation_type ? "input-invalid" : ""}`}
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={irrigationType}
                        onChange={(e) => {
                          setIrrigationType(e.target.value);
                          if (formErrors.irrigation_type) setFormErrors((prev) => ({ ...prev, irrigation_type: "" }));
                        }}
                      >
                        <option value="">-- Select Irrigation --</option>
                        <option value="Drip Irrigation">{t("dripIrrigation")}</option>
                        <option value="Sprinkler Irrigation">{t("sprinklerIrrigation")}</option>
                        <option value="Manual Watering">{t("manualWatering")}</option>
                      </select>
                      {formErrors.irrigation_type && <span className="field-error-text">{formErrors.irrigation_type}</span>}
                    </div>

                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t("fertilizerPreference")} *</label>
                      <select
                        className={`input ${formErrors.fertilizer_preference ? "input-invalid" : ""}`}
                        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                        value={fertilizerPref}
                        onChange={(e) => {
                          setFertilizerPref(e.target.value);
                          if (formErrors.fertilizer_preference) setFormErrors((prev) => ({ ...prev, fertilizer_preference: "" }));
                        }}
                      >
                        <option value="">-- Select Fertilizer --</option>
                        <option value="Organic">{t("organicFertilizer")}</option>
                        <option value="Chemical">{t("chemicalFertilizer")}</option>
                      </select>
                      {formErrors.fertilizer_preference && <span className="field-error-text">{formErrors.fertilizer_preference}</span>}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Notes / Location Details</label>
                    <textarea className="input" rows={2} placeholder="Field location notes..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ padding: "10px 18px" }}>{t("cancel")}</button>
                    <button type="submit" disabled={saving} className="btn btn-sun" style={{ padding: "10px 24px" }}>
                      {saving ? "Saving..." : t("addCrop")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Main Layout: Left Crop List & Right 3-Stage Lifecycle Visualization */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Loading crops...</div>
          ) : crops.length === 0 ? (
            <div style={{ background: "#FFF", borderRadius: 20, padding: 48, textAlign: "center", border: "1px solid #E2E8F0" }}>
              <Sprout size={48} color="#16A34A" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>No Cultivations Tracked Yet</h3>
              <p style={{ color: "#64748B", maxWidth: 460, margin: "0 auto 20px" }}>
                Add your short-duration crop to view expected appearance, watering schedules, fertilizer guidance, and pipe calculations.
              </p>
              <button onClick={() => setShowAddModal(true)} className="btn btn-sun">
                + {t("addCrop")}
              </button>
            </div>
          ) : (
            <div className="grid-sidebar-responsive" style={{ gap: 24 }}>
              
              {/* Left Column: Crop List Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Your Cultivations ({crops.length})</span>
                  <button onClick={() => setShowAddModal(true)} style={{ background: "none", border: "none", color: "#10B981", fontWeight: 700, cursor: "pointer" }}>
                    + New
                  </button>
                </div>

                {crops.map((c) => {
                  const isSelected = activeCrop?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCrop(c);
                        if (c.current_stage.includes("2")) setActiveStageTab(2);
                        else if (c.current_stage.includes("3")) setActiveStageTab(3);
                        else setActiveStageTab(1);
                      }}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        background: isSelected ? "#F0FDF4" : "#FFFFFF",
                        border: isSelected ? "2px solid #10B981" : "1px solid #E2E8F0",
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 4px 14px rgba(16, 185, 129, 0.15)" : "0 2px 6px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 17, color: "#1E293B" }}>
                            {c.crop_name} <span style={{ fontSize: 13, fontWeight: 500, color: "#64748B" }}>({c.variety || "Local"})</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                            Planted: {c.planting_date} · {c.area_size || "0.5 Acres"}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(c.id);
                          }}
                          style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 4 }}
                          title="Delete Crop"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ background: "#DCFCE7", color: "#166534", padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                          {c.current_stage}
                        </span>
                        <ChevronRight size={16} color="#10B981" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed 3-Stage Lifecycle Inspector & Growth Visualization */}
              {activeCrop && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                  {/* 1. Header Card */}
                  <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", margin: 0 }}>
                            {activeCrop.crop_name}
                          </h2>
                          <span style={{ background: "#F1F5F9", color: "#334155", padding: "2px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                            Variety: {activeCrop.variety || "Local Selection"}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 20, marginTop: 8, fontSize: 14, color: "#64748B", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={16} color="#10B981" /> Day {daysSincePlanting} ({activeCrop.planting_date})
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPin size={16} color="#10B981" /> {activeCrop.area_size} ({sizeVal} {unitStr})
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Droplets size={16} color="#0284C7" /> {irrType}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <span style={{ background: "#DCFCE7", color: "#166534", padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                          Active Stage: {activeCrop.current_stage}
                        </span>
                        <Link
                          href={`/crops/lifecycle?crop_id=${activeCrop.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#10B981",
                            color: "#FFFFFF",
                            padding: "8px 16px",
                            borderRadius: 20,
                            fontWeight: 700,
                            fontSize: 13,
                            textDecoration: "none",
                            boxShadow: "0 2px 8px rgba(16,185,129,0.25)",
                          }}
                        >
                          <Layers size={16} /> Full Lifecycle Visualizer →
                        </Link>
                      </div>
                    </div>

                    {/* 3-Stage Progress Tabs */}
                    <div className="grid-3col-responsive" style={{ marginTop: 24, gap: 10 }}>
                      <button
                        onClick={() => {
                          setActiveStageTab(1);
                          handleUpdateStage(activeCrop.id, t("stage1Title"));
                        }}
                        style={{
                          padding: "14px 10px",
                          borderRadius: 12,
                          border: activeStageTab === 1 ? "2px solid #10B981" : "1px solid #E2E8F0",
                          background: activeStageTab === 1 ? "#DCFCE7" : "#F8FAFC",
                          color: activeStageTab === 1 ? "#166534" : "#475569",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div>STAGE 1 (Day 1-25)</div>
                        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Seedling / Nursery</div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveStageTab(2);
                          handleUpdateStage(activeCrop.id, t("stage2Title"));
                        }}
                        style={{
                          padding: "14px 10px",
                          borderRadius: 12,
                          border: activeStageTab === 2 ? "2px solid #10B981" : "1px solid #E2E8F0",
                          background: activeStageTab === 2 ? "#DCFCE7" : "#F8FAFC",
                          color: activeStageTab === 2 ? "#166534" : "#475569",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div>STAGE 2 (Day 26-55)</div>
                        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Flowering Stage</div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveStageTab(3);
                          handleUpdateStage(activeCrop.id, t("stage3Title"));
                        }}
                        style={{
                          padding: "14px 10px",
                          borderRadius: 12,
                          border: activeStageTab === 3 ? "2px solid #10B981" : "1px solid #E2E8F0",
                          background: activeStageTab === 3 ? "#DCFCE7" : "#F8FAFC",
                          color: activeStageTab === 3 ? "#166534" : "#475569",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div>STAGE 3 (Day 56-90)</div>
                        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Fruiting &amp; Harvest</div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Growth Visualization Card (Expected Appearance) */}
                  <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <Sparkles size={20} color="#10B981" /> {t("expectedAppearance")} — Stage {activeStageTab}
                    </h3>

                    <div className="grid-sidebar-responsive" style={{ gap: 20, alignItems: "center" }}>
                      <img
                        src={currentStageImg}
                        alt={`${activeCrop.crop_name} stage ${activeStageTab}`}
                        style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                      />

                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#1E293B", marginBottom: 6 }}>
                          {activeStageTab === 1 ? t("stage1Title") : activeStageTab === 2 ? t("stage2Title") : t("stage3Title")}
                        </div>
                        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5, marginBottom: 12 }}>
                          {activeStageTab === 1 ? t("stage1Desc") : activeStageTab === 2 ? t("stage2Desc") : t("stage3Desc")}
                        </p>

                        <div style={{ background: "#F8FAFC", padding: 12, borderRadius: 10, fontSize: 13, color: "#334155" }}>
                          <strong>Recommended Water:</strong> {activeStageTab === 1 ? "1.5 - 2 Liters/m² daily" : activeStageTab === 2 ? "3.0 - 4 Liters/m² daily" : "4.0 Liters/m² daily (Reduce before harvest)"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Fertilizer Guidance Card (Organic vs Sri Lanka Chemical) */}
                  <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <Sprout size={20} color="#16A34A" /> {t("fertilizerPreference")} Guidance ({fertPref})
                    </h3>

                    {fertPref === "Organic" ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                        <div style={{ padding: 14, borderRadius: 12, background: "#F0FDF4", border: "1px solid #DCFCE7" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>Compost / Vermicompost</div>
                          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Apply 5 tons/acre as basal layer before seedling.</div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 12, background: "#F0FDF4", border: "1px solid #DCFCE7" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>Cow Dung / Goat Manure</div>
                          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Well-decomposed organic manure top dressing.</div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 12, background: "#F0FDF4", border: "1px solid #DCFCE7" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>Liquid Jeevamrut / Neem Extract</div>
                          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Foliar spray every 10 days for root &amp; pest vigor.</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                        <div style={{ padding: 14, borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF" }}>Urea (Nitrogen)</div>
                          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>15kg/acre at Week 3 &amp; Week 6 top dressing.</div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF" }}>TSP / MOP (Department Mixture)</div>
                          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>20kg/acre MOP during flowering &amp; fruit fill.</div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF" }}>Albert's Solution (Foliar)</div>
                          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>1g/Liter foliar spray for micronutrient deficiency.</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Plant Spacing & Plant Population Estimator */}
                  <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <Ruler size={20} color="#D97706" /> {t("plantSpacing")} &amp; Population Calculator
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
                      <div style={{ padding: 14, borderRadius: 12, background: "#FEF3C7", border: "1px solid #FDE68A" }}>
                        <div style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>{t("plantSpacing")}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#B45309", marginTop: 2 }}>{spacingInfo.plant}</div>
                      </div>

                      <div style={{ padding: 14, borderRadius: 12, background: "#FEF3C7", border: "1px solid #FDE68A" }}>
                        <div style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>{t("rowSpacing")}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#B45309", marginTop: 2 }}>{spacingInfo.row}</div>
                      </div>

                      <div style={{ padding: 14, borderRadius: 12, background: "#DCFCE7", border: "1px solid #A7F3D0" }}>
                        <div style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>{t("estimatedPlants")}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#15803D", marginTop: 2 }}>
                          {estimatedPlantsCount.toLocaleString()} Plants
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Irrigation Guidance & Pipe / Hardware Math */}
                  <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <Droplets size={20} color="#0284C7" /> {t("irrigationGuidance")} ({irrType})
                    </h3>

                    {irrType.toLowerCase().includes("drip") ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                        <div style={{ padding: 14, borderRadius: 12, background: "#E0F2FE", border: "1px solid #BAE6FD" }}>
                          <div style={{ fontSize: 12, color: "#0369A1", fontWeight: 600 }}>{t("mainPipeLength")}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#0284C7", marginTop: 2 }}>~{mainPipeMeters} Meters</div>
                        </div>

                        <div style={{ padding: 14, borderRadius: 12, background: "#E0F2FE", border: "1px solid #BAE6FD" }}>
                          <div style={{ fontSize: 12, color: "#0369A1", fontWeight: 600 }}>{t("lateralPipeLength")}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#0284C7", marginTop: 2 }}>~{lateralPipeMeters} Meters</div>
                        </div>

                        <div style={{ padding: 14, borderRadius: 12, background: "#E0F2FE", border: "1px solid #BAE6FD" }}>
                          <div style={{ fontSize: 12, color: "#0369A1", fontWeight: 600 }}>{t("numberOfEmitters")}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#0284C7", marginTop: 2 }}>~{emittersCount.toLocaleString()} Emitters</div>
                        </div>
                      </div>
                    ) : irrType.toLowerCase().includes("sprinkler") ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                        <div style={{ padding: 14, borderRadius: 12, background: "#E0F2FE", border: "1px solid #BAE6FD" }}>
                          <div style={{ fontSize: 12, color: "#0369A1", fontWeight: 600 }}>{t("mainPipeLength")}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#0284C7", marginTop: 2 }}>~{mainPipeMeters * 2} Meters</div>
                        </div>

                        <div style={{ padding: 14, borderRadius: 12, background: "#E0F2FE", border: "1px solid #BAE6FD" }}>
                          <div style={{ fontSize: 12, color: "#0369A1", fontWeight: 600 }}>{t("numberOfSprinklers")}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#0284C7", marginTop: 2 }}>{sprinklersCount} Sprinklers</div>
                        </div>

                        <div style={{ padding: 14, borderRadius: 12, background: "#E0F2FE", border: "1px solid #BAE6FD" }}>
                          <div style={{ fontSize: 12, color: "#0369A1", fontWeight: 600 }}>{t("sprinklerCoverage")}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#0284C7", marginTop: 2 }}>~{Math.round(areaSqMeters)} m²</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 16, borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", fontSize: 14, color: "#475569" }}>
                        <strong>Manual Watering Guidance:</strong> Water plants twice daily during early morning (6:00 - 8:00 AM) and evening (5:00 - 6:30 PM). Provide 2-3 Liters of water per plant root zone.
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </section>
      <Footer />
    </AuthGuard>
  );
}
