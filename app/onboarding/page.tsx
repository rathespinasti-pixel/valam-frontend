"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { ValamUser } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<ValamUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [farmLocation, setFarmLocation] = useState("Vavuniya South");
  const [districtAsc, setDistrictAsc] = useState("Vavuniya ASC Division");
  const [farmerType, setFarmerType] = useState("Small-scale farmer");
  const [farmingExperience, setFarmingExperience] = useState("1-3 years");
  const [farmSizeAcres, setFarmSizeAcres] = useState<number | "">(1.5);
  const [mainCropsGrown, setMainCropsGrown] = useState("Tomato, Chili, Onion");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }
    const stored = ValamAPI.getStoredUser();
    if (stored) {
      setUser(stored);
      setFullName(stored.full_name || "");
      if (stored.farm_location) setFarmLocation(stored.farm_location);
      if (stored.district_asc) setDistrictAsc(stored.district_asc);
      if (stored.farmer_type) setFarmerType(stored.farmer_type);
      if (stored.farming_experience) setFarmingExperience(stored.farming_experience);
      if (stored.farm_size_acres) setFarmSizeAcres(stored.farm_size_acres);
      if (stored.main_crops_grown) setMainCropsGrown(stored.main_crops_grown);
      if (stored.preferred_language) setPreferredLanguage(stored.preferred_language);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await ValamAPI.saveOnboarding({
        full_name: fullName,
        farm_location: farmLocation,
        district_asc: districtAsc,
        farmer_type: farmerType,
        farming_experience: farmingExperience,
        farm_size_acres: typeof farmSizeAcres === "number" ? farmSizeAcres : 0,
        main_crops_grown: mainCropsGrown,
        preferred_language: preferredLanguage,
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
          <h1>Welcome to Valam! Let's personalize your farm</h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 600 }}>
            Tell us about your cultivation background so we can tailor localized weather alerts, crop guides, and AI advice for your farm in Vavuniya.
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
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Full Name</label>
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
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Location / Village</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Vavuniya South, Omanthai"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>District / ASC Division</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={districtAsc}
                    onChange={(e) => setDistrictAsc(e.target.value)}
                  >
                    <option value="Vavuniya Town ASC">Vavuniya Town ASC</option>
                    <option value="Vavuniya South ASC">Vavuniya South ASC</option>
                    <option value="Vavuniya North ASC">Vavuniya North ASC (Nedunkeni)</option>
                    <option value="Cheddikulam ASC">Cheddikulam ASC</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Farmer Type</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={farmerType}
                    onChange={(e) => setFarmerType(e.target.value)}
                  >
                    <option value="Commercial farmer">Commercial farmer</option>
                    <option value="Small-scale farmer">Small-scale farmer</option>
                    <option value="Home gardener">Home gardener</option>
                    <option value="Beginner grower">Beginner grower</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Farming Experience</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={farmingExperience}
                    onChange={(e) => setFarmingExperience(e.target.value)}
                  >
                    <option value="Beginner (< 1 year)">Beginner (&lt; 1 year)</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Farm Size (Acres, Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={farmSizeAcres}
                    onChange={(e) => setFarmSizeAcres(e.target.value ? parseFloat(e.target.value) : "")}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Preferred Language</label>
                  <select
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="si">Sinhala (சிங்களம்)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Main Crops Grown</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Tomato, Chili, Red Onion, Paddy, Brinjal"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CCC" }}
                  value={mainCropsGrown}
                  onChange={(e) => setMainCropsGrown(e.target.value)}
                />
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
