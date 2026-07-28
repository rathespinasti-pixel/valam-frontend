"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { ValamUser, Crop, WeatherAdvisoryResponse } from "@/lib/types";
import { Sprout, CloudSun, Stethoscope, Users, Wrench, MessageSquareText, ChevronRight, AlertTriangle, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ValamUser | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [weatherAdvisory, setWeatherAdvisory] = useState<WeatherAdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }

    async function loadDashboardData() {
      try {
        const u = await ValamAPI.me();
        setUser(u);
        if (!u.onboarding_completed) {
          router.push("/onboarding");
          return;
        }

        const [cropsRes, weatherRes] = await Promise.allSettled([
          ValamAPI.getCrops(),
          ValamAPI.getWeatherAdvisory(u.farm_location || "Vavuniya,LK"),
        ]);

        if (cropsRes.status === "fulfilled") setCrops(cropsRes.value.items);
        if (weatherRes.status === "fulfilled") setWeatherAdvisory(weatherRes.value);
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <>
        <Navbar active="dashboard" />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600 }}>Loading farmer dashboard...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar active="dashboard" />
      
      {/* Hero Section */}
      <section className="page-hero" style={{ padding: "40px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div className="crumb">Farmer Portal / Overview</div>
            <h1 style={{ fontSize: 32 }}>Ayubowan / Vanakkam, {user?.full_name || "Farmer"}!</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", fontSize: 16 }}>
              📍 {user?.farm_location || "Vavuniya"} · {user?.district_asc || "Vavuniya ASC"} · {user?.farmer_type || "Small-scale farmer"}
            </p>
          </div>
          <Link href="/onboarding" className="btn btn-outline" style={{ background: "rgba(255,255,255,0.1)", color: "#FFF", borderColor: "#FFF" }}>
            Edit Profile
          </Link>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Top Quick Actions Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            <Link href="/crops" style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "#1E293B" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E6F4EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E8E3E" }}>
                <Sprout size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Manage Crops</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>{crops.length} Active Crop{crops.length !== 1 ? "s" : ""}</div>
              </div>
            </Link>

            <Link href="/weather" style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "#1E293B" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7" }}>
                <CloudSun size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Weather Advisory</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>{weatherAdvisory?.current?.temperature_c || 28}°C · {weatherAdvisory?.current?.condition || "Partly Cloudy"}</div>
              </div>
            </Link>

            <Link href="/diagnosis" style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "#1E293B" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                <Stethoscope size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Plant Diagnosis</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>AI Pest Detection</div>
              </div>
            </Link>

            <Link href="/community" style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "#1E293B" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333EA" }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Farmer Forum</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>Community Q&A</div>
              </div>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            
            {/* Left Main Column: Weather Advisory & Active Crops */}
            <div>
              
              {/* Agro Advisory Alert Card */}
              {weatherAdvisory && weatherAdvisory.advisories && weatherAdvisory.advisories.length > 0 && (
                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, marginBottom: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <AlertTriangle color="#D97706" size={22} />
                      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1E293B" }}>
                        Today's Agro Advisory — {user?.farm_location || "Vavuniya"}
                      </h2>
                    </div>
                    <Link href="/weather" style={{ fontSize: 14, fontWeight: 600, color: "#1B4D3E", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                      Full Weather <ChevronRight size={16} />
                    </Link>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {weatherAdvisory.advisories.map((item, i) => (
                      <div key={i} style={{ padding: 14, borderRadius: 10, background: item.severity === "warning" ? "#FFFBEB" : "#F0FDF4", borderLeft: item.severity === "warning" ? "4px solid #F59E0B" : "4px solid #16A34A" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B", marginBottom: 4 }}>
                          [{item.category}] {item.title}
                        </div>
                        <div style={{ fontSize: 13, color: "#475569" }}>
                          {item.advice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Crops Widget */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1E293B" }}>
                    My Active Cultivations ({crops.length})
                  </h2>
                  <Link href="/crops" style={{ fontSize: 14, fontWeight: 600, color: "#1B4D3E", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    + Add New Crop <ChevronRight size={16} />
                  </Link>
                </div>

                {crops.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 16px", color: "#64748B" }}>
                    <Sprout size={40} color="#94A3B8" style={{ marginBottom: 12 }} />
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>No crops added yet</p>
                    <p style={{ fontSize: 14, marginBottom: 16 }}>Start tracking your planting dates, varieties, and stage progress.</p>
                    <Link href="/crops" className="btn btn-sun" style={{ display: "inline-block" }}>
                      Add Your First Crop
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {crops.map((crop) => (
                      <div key={crop.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: "#1E293B" }}>
                            {crop.crop_name} <span style={{ fontSize: 13, fontWeight: 400, color: "#64748B" }}>({crop.variety || "Local"})</span>
                          </div>
                          <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                            Planted: {crop.planting_date} · Area: {crop.area_size || "N/A"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "#DCFCE7", color: "#166534", fontWeight: 700, fontSize: 12 }}>
                            {crop.current_stage}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: AI Assistant Shortcut & Equipment Sharing */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* AI Assistant Quick Card */}
              <div style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2E7D32 100%)", borderRadius: 16, padding: 24, color: "#FFFFFF" }}>
                <MessageSquareText size={32} style={{ marginBottom: 12, opacity: 0.9 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#FFF" }}>Valam AI Assistant</h3>
                <p style={{ fontSize: 13, color: "#E8F5E9", lineHeight: 1.5, marginBottom: 16 }}>
                  Have questions about leaf yellowing, fertilizer dosing, or Vavuniya planting seasons? Ask in Tamil or English.
                </p>
                <Link href="/chatbot" className="btn btn-sun" style={{ width: "100%", textAlign: "center" }}>
                  Start Chat Session
                </Link>
              </div>

              {/* Equipment Sharing Card */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Wrench size={20} color="#15803D" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#1E293B" }}>Equipment Lending</h3>
                </div>
                <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
                  Rent water pumps, battery sprayers, and tractors from fellow farmers in Vavuniya.
                </p>
                <Link href="/tools" className="btn btn-outline" style={{ width: "100%", textAlign: "center", display: "block" }}>
                  Browse Available Tools
                </Link>
              </div>

              {/* Advisory Disclaimer */}
              <div style={{ padding: 14, borderRadius: 12, background: "#F1F5F9", fontSize: 12, color: "#64748B", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <ShieldCheck size={20} color="#64748B" style={{ flexShrink: 0 }} />
                <div>
                  Valam recommendations are decision support guidance based on regional weather and agricultural knowledge.
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
      <Footer />
    </>
  );
}
