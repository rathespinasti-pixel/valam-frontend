"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GpsLocationButton } from "@/components/location/GpsLocationButton";
import { ValamAPI } from "@/lib/api";
import type { ValamUser } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

import { onboardingSchema, getFieldErrors } from "@/lib/validations";

export default function OnboardingPage() {
  const router = useRouter();
  const { t, setLanguage } = useLanguage();
  const [user, setUser] = useState<ValamUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Controlled form state — ZERO default values
  const [fullName, setFullName] = useState("");
  const [prefLang, setPrefLang] = useState<"en" | "ta" | "si">("en");
  const [farmingCategory, setFarmingCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [dsDivision, setDsDivision] = useState("");
  const [gnDivision, setGnDivision] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [landSize, setLandSize] = useState<number | "">("");
  const [landUnit, setLandUnit] = useState("");
  const [irrigationPref, setIrrigationPref] = useState("");
  const [fertilizerPref, setFertilizerPref] = useState("");

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }
    const stored = ValamAPI.getStoredUser();
    if (stored) {
      setUser(stored);
      setFullName(stored.full_name || "");
      if (stored.preferred_language) setPrefLang(stored.preferred_language as any);
      if (stored.farming_category) setFarmingCategory(stored.farming_category);
      if (stored.farm_location) setFarmLocation(stored.farm_location);
      if (stored.district) setDistrict(stored.district);
      if (stored.ds_division) setDsDivision(stored.ds_division);
      if (stored.gn_division) setGnDivision(stored.gn_division);
      if (stored.land_size) setLandSize(stored.land_size);
      if (stored.land_size_unit) setLandUnit(stored.land_size_unit);
      if (stored.irrigation_preference) setIrrigationPref(stored.irrigation_preference);
      if (stored.fertilizer_preference) setFertilizerPref(stored.fertilizer_preference);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});
    setError("");

    const validationResult = onboardingSchema.safeParse({
      full_name: fullName,
      preferred_language: prefLang,
      district,
      ds_division: dsDivision,
      gn_division: gnDivision || undefined,
      farming_category: farmingCategory,
      farm_location: farmLocation || undefined,
      land_size: landSize,
      land_size_unit: landUnit,
      irrigation_preference: irrigationPref,
      fertilizer_preference: fertilizerPref,
    });

    if (!validationResult.success) {
      const errors = getFieldErrors(validationResult);
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      setLanguage(prefLang as any);
      await ValamAPI.saveOnboarding({
        full_name: fullName.trim(),
        preferred_language: prefLang,
        farming_category: farmingCategory,
        district: district,
        ds_division: dsDivision,
        gn_division: gnDivision || undefined,
        land_size: typeof landSize === "number" ? landSize : 1.0,
        land_size_unit: landUnit || "Acres",
        irrigation_preference: irrigationPref || "Manual Watering",
        fertilizer_preference: fertilizerPref || "Organic",
        farm_location: farmLocation.trim() || `${dsDivision}, ${district}`,
        farm_size_acres: typeof landSize === "number" && landUnit === "Acres" ? landSize : 1.0,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save onboarding information");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar active="dashboard" />
      <section className="page-hero">
        <div className="container">
          <div className="crumb">Home / Farmer Onboarding</div>
          <h1>Welcome to Valam! Let&apos;s personalize your farm</h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 640 }}>
            Configure your Northern Province cultivation preferences to receive tailored 3-stage crop guidance and weather alerts.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F4F7F4" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="card" style={{ padding: 32, borderRadius: 16, background: "#FFFFFF", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#1B4D3E" }}>
              Farming Profile Setup
            </h2>
            <p style={{ color: "#666", marginBottom: 24 }}>
              Step 1 of 1 — Personalize your farming experience
            </p>

            {error && (
              <div style={{ padding: 12, borderRadius: 8, background: "#FFEBEE", color: "#C62828", marginBottom: 20, fontSize: 14 }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("fullName")} *</label>
                <input
                  type="text"
                  className={`input ${formErrors.full_name ? "input-invalid" : ""}`}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formErrors.full_name) setFormErrors((prev) => ({ ...prev, full_name: "" }));
                  }}
                  placeholder="e.g. Siva Kumar"
                />
                {formErrors.full_name && <span className="field-error-text">{formErrors.full_name}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("preferredLanguage")}</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={prefLang}
                    onChange={(e) => {
                      setPrefLang(e.target.value as any);
                      setLanguage(e.target.value as any);
                    }}
                  >
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="si">Sinhala (සිංහල)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("farmingCategory")} *</label>
                  <select
                    className={`input ${formErrors.farming_category ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={farmingCategory}
                    onChange={(e) => {
                      setFarmingCategory(e.target.value);
                      if (formErrors.farming_category) setFormErrors((prev) => ({ ...prev, farming_category: "" }));
                    }}
                  >
                    <option value="">-- Select Category --</option>
                    <option value="Farmer">{t("farmerRole")}</option>
                    <option value="Home Gardener">{t("homeGardenerRole")}</option>
                    <option value="Terrace Gardener">{t("terraceGardenerRole")}</option>
                    <option value="Beginner">{t("beginnerRole")}</option>
                  </select>
                  {formErrors.farming_category && <span className="field-error-text">{formErrors.farming_category}</span>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("district")} *</label>
                  <select
                    className={`input ${formErrors.district ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (formErrors.district) setFormErrors((prev) => ({ ...prev, district: "" }));
                    }}
                  >
                    <option value="">-- Select District --</option>
                    <option value="Vavuniya">Vavuniya</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Kilinochchi">Kilinochchi</option>
                    <option value="Mannar">Mannar</option>
                    <option value="Mullaitivu">Mullaitivu</option>
                    <option value="Anuradhapura">Anuradhapura</option>
                    <option value="Colombo">Colombo</option>
                  </select>
                  {formErrors.district && <span className="field-error-text">{formErrors.district}</span>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("dsDivision")} *</label>
                  <input
                    type="text"
                    className={`input ${formErrors.ds_division ? "input-invalid" : ""}`}
                    placeholder="e.g. Vavuniya Town, Nallur"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={dsDivision}
                    onChange={(e) => {
                      setDsDivision(e.target.value);
                      if (formErrors.ds_division) setFormErrors((prev) => ({ ...prev, ds_division: "" }));
                    }}
                  />
                  {formErrors.ds_division && <span className="field-error-text">{formErrors.ds_division}</span>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("landSize")} *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1.0"
                    className={`input ${formErrors.land_size ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={landSize}
                    onChange={(e) => {
                      setLandSize(e.target.value ? parseFloat(e.target.value) : "");
                      if (formErrors.land_size) setFormErrors((prev) => ({ ...prev, land_size: "" }));
                    }}
                  />
                  {formErrors.land_size && <span className="field-error-text">{formErrors.land_size}</span>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("landUnit")} *</label>
                  <select
                    className={`input ${formErrors.land_size_unit ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
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
                  </select>
                  {formErrors.land_size_unit && <span className="field-error-text">{formErrors.land_size_unit}</span>}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("farmPlace")}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                  <input
                    type="text"
                    className="input"
                    placeholder={`${dsDivision}, ${district}`}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                  />
                  <GpsLocationButton
                    lang={prefLang as any}
                    onLocation={(loc) => {
                      setFarmLocation(loc.farmLocation);
                      if (loc.district) setDistrict(loc.district);
                      if (loc.dsDivision) setDsDivision(loc.dsDivision);
                      if (loc.gnDivision) setGnDivision(loc.gnDivision);
                      setError("");
                    }}
                    onError={(message) => setError(message)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("irrigationPreference")} *</label>
                  <select
                    className={`input ${formErrors.irrigation_preference ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={irrigationPref}
                    onChange={(e) => {
                      setIrrigationPref(e.target.value);
                      if (formErrors.irrigation_preference) setFormErrors((prev) => ({ ...prev, irrigation_preference: "" }));
                    }}
                  >
                    <option value="">-- Select Irrigation --</option>
                    <option value="Drip Irrigation">{t("dripIrrigation")}</option>
                    <option value="Sprinkler Irrigation">{t("sprinklerIrrigation")}</option>
                    <option value="Manual Watering">{t("manualWatering")}</option>
                  </select>
                  {formErrors.irrigation_preference && <span className="field-error-text">{formErrors.irrigation_preference}</span>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("fertilizerPreference")} *</label>
                  <select
                    className={`input ${formErrors.fertilizer_preference ? "input-invalid" : ""}`}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 700, borderRadius: 10 }}
              >
                {loading ? "Saving Profile..." : "Complete Setup & Go to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
