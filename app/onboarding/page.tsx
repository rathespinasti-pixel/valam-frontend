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

export default function OnboardingPage() {
  const router = useRouter();
  const { t, setLanguage } = useLanguage();
  const [user, setUser] = useState<ValamUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [prefLang, setPrefLang] = useState("en");
  const [farmingCategory, setFarmingCategory] = useState("Farmer");
  const [district, setDistrict] = useState("Vavuniya");
  const [dsDivision, setDsDivision] = useState("Vavuniya Town");
  const [gnDivision, setGnDivision] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [landSize, setLandSize] = useState<number | "">(1.0);
  const [landUnit, setLandUnit] = useState("Acres");
  const [irrigationPref, setIrrigationPref] = useState("Drip Irrigation");
  const [fertilizerPref, setFertilizerPref] = useState("Organic");

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }
    const stored = ValamAPI.getStoredUser();
    if (stored) {
      setUser(stored);
      setFullName(stored.full_name || "");
      if (stored.preferred_language) setPrefLang(stored.preferred_language);
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
    setLoading(true);
    setError("");

    try {
      setLanguage(prefLang as any);
      await ValamAPI.saveOnboarding({
        full_name: fullName,
        preferred_language: prefLang,
        farming_category: farmingCategory,
        district: district,
        ds_division: dsDivision,
        gn_division: gnDivision,
        land_size: typeof landSize === "number" ? landSize : 1.0,
        land_size_unit: landUnit,
        irrigation_preference: irrigationPref,
        fertilizer_preference: fertilizerPref,
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

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("fullName")}</label>
                <input
                  type="text"
                  required
                  className="input"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("preferredLanguage")}</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={prefLang}
                    onChange={(e) => {
                      setPrefLang(e.target.value);
                      setLanguage(e.target.value as any);
                    }}
                  >
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="si">Sinhala (සිංහල)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("farmingCategory")}</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={farmingCategory}
                    onChange={(e) => setFarmingCategory(e.target.value)}
                  >
                    <option value="Farmer">{t("farmerRole")}</option>
                    <option value="Home Gardener">{t("homeGardenerRole")}</option>
                    <option value="Terrace Gardener">{t("terraceGardenerRole")}</option>
                    <option value="Beginner">{t("beginnerRole")}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("district")}</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    <option value="Vavuniya">Vavuniya</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Kilinochchi">Kilinochchi</option>
                    <option value="Mannar">Mannar</option>
                    <option value="Mullaitivu">Mullaitivu</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("dsDivision")}</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Vavuniya Town, Nallur"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={dsDivision}
                    onChange={(e) => setDsDivision(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("landSize")}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value ? parseFloat(e.target.value) : "")}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("landUnit")}</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={landUnit}
                    onChange={(e) => setLandUnit(e.target.value)}
                  >
                    <option value="Acres">{t("acres")}</option>
                    <option value="Perches">{t("perches")}</option>
                    <option value="Hectares">{t("hectares")}</option>
                    <option value="Square Feet">{t("squareFeet")}</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("farmPlace")}</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                  <input
                    type="text"
                    className="input"
                    placeholder={`${dsDivision}, ${district}`}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                  />
                  <GpsLocationButton
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("irrigationPreference")}</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={irrigationPref}
                    onChange={(e) => setIrrigationPref(e.target.value)}
                  >
                    <option value="Drip Irrigation">{t("dripIrrigation")}</option>
                    <option value="Sprinkler Irrigation">{t("sprinklerIrrigation")}</option>
                    <option value="Manual Watering">{t("manualWatering")}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{t("fertilizerPreference")}</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={fertilizerPref}
                    onChange={(e) => setFertilizerPref(e.target.value)}
                  >
                    <option value="Organic">{t("organicFertilizer")}</option>
                    <option value="Chemical">{t("chemicalFertilizer")}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-sun"
                style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 700, borderRadius: 8 }}
              >
                {loading ? "Saving Profile..." : "Complete Setup & Launch Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
