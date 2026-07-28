"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ValamUser, Crop, WeatherAdvisoryResponse } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sprout,
  Sun,
  CloudSun,
  CloudRain,
  Droplets,
  Wind,
  ShoppingBag,
  Bot,
  TrendingUp,
  MessageSquareText,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Thermometer,
  Eye,
  Wrench,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

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
          router.push("/settings");
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
      <AuthGuard>
        <Navbar active="dashboard" />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600 }}>Loading farmer dashboard...</div>
        </div>
        <Footer />
      </AuthGuard>
    );
  }

  const currentTemp = weatherAdvisory?.current?.temperature_c ?? 29.5;
  const humidity = weatherAdvisory?.current?.humidity_percent ?? 68;
  const condition = weatherAdvisory?.current?.condition ?? "Partly Cloudy";
  const windSpeed = weatherAdvisory?.current?.wind_kmh ?? 12;

  // 7-Day Forecast mock data / derived forecast
  const sevenDayForecast = [
    { day: "Mon", temp: 30, rainProb: "10%", condition: "Sunny", icon: Sun },
    { day: "Tue", temp: 31, rainProb: "15%", condition: "Partly Cloudy", icon: CloudSun },
    { day: "Wed", temp: 29, rainProb: "45%", condition: "Light Rain", icon: CloudRain },
    { day: "Thu", temp: 28, rainProb: "60%", condition: "Showers", icon: CloudRain },
    { day: "Fri", temp: 30, rainProb: "20%", condition: "Partly Cloudy", icon: CloudSun },
    { day: "Sat", temp: 31, rainProb: "10%", condition: "Sunny", icon: Sun },
    { day: "Sun", temp: 32, rainProb: "05%", condition: "Clear Sky", icon: Sun },
  ];

  return (
    <AuthGuard>
      <Navbar active="dashboard" pageTitle={t("dashboard")} />

      {/* Hero Section */}
      <section className="page-hero" style={{ padding: "36px 0" }}>
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}
        >
          <div>
            <div className="crumb">Farmer Portal / {t("dashboard")}</div>
            <h1 style={{ fontSize: 32 }}>Ayubowan / Vanakkam, {user?.full_name || "Farmer"}!</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", fontSize: 16 }}>
              📍 {user?.farm_location || "Vavuniya"} · {user?.district_asc || "Vavuniya ASC"} · {user?.farmer_type || "Small-scale farmer"}
            </p>
          </div>
          <Link
            href="/settings"
            className="btn btn-outline"
            style={{ background: "rgba(255,255,255,0.1)", color: "#FFF", borderColor: "#FFF" }}
          >
            {t("settings")}
          </Link>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* 1. Dashboard Overview Summary Cards (7 Cards) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {/* Card 1: Total Crops */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E6F4EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E8E3E" }}>
                <Sprout size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("totalCrops")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{crops.length} Types</div>
              </div>
            </div>

            {/* Card 2: Active Cultivations */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803D" }}>
                <Sprout size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("activeCultivations")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{crops.length} Active Fields</div>
              </div>
            </div>

            {/* Card 3: Today's Weather */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7" }}>
                <CloudSun size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("todaysWeather")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{currentTemp}°C</div>
              </div>
            </div>

            {/* Card 4: Irrigation Status */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0369A1" }}>
                <Droplets size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("irrigationStatus")}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>Evening Slot (6PM)</div>
              </div>
            </div>

            {/* Card 5: Marketplace Orders */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("marketplaceOrders")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>2 Active</div>
              </div>
            </div>

            {/* Card 6: AI Recommendations */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333EA" }}>
                <Bot size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("aiRecommendations")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>3 New Alerts</div>
              </div>
            </div>

            {/* Card 7: Farm Health Score */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#166534" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("farmHealthScore")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#166534" }}>94% Excellent</div>
              </div>
            </div>
          </div>

          {/* 2. Comprehensive Weather Forecast Widget Section */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: 28,
              marginBottom: 32,
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CloudSun size={26} color="#0284C7" />
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#1E293B" }}>
                  {t("weatherAdvisory")} — {user?.farm_location || "Vavuniya, LK"}
                </h2>
              </div>
              <Link href="/weather" style={{ fontSize: 14, fontWeight: 600, color: "#1B4D3E", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                View Detailed Map <ChevronRight size={16} />
              </Link>
            </div>

            {/* Live Weather Metrics Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 16,
                padding: 20,
                borderRadius: 14,
                background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                color: "#FFFFFF",
                marginBottom: 24,
              }}
            >
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
                  <Thermometer size={14} /> {t("currentTemp")}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{currentTemp}°C</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>{condition}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
                  <CloudRain size={14} /> {t("rainProbability")}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>15%</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Low risk today</div>
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
                  <Droplets size={14} /> {t("humidity")}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{humidity}%</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Optimal range</div>
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
                  <Wind size={14} /> {t("windSpeed")}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{windSpeed} km/h</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Gentle breeze</div>
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
                  <Eye size={14} /> {t("uvIndex")}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>6 Moderate</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Sun protection recommended</div>
              </div>
            </div>

            {/* 7-Day Weather Forecast */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 12 }}>
                📅 {t("sevenDayForecast")}
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: 12,
                }}
              >
                {sevenDayForecast.map((f, i) => {
                  const IconComponent = f.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "14px 10px",
                        borderRadius: 12,
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{f.day}</div>
                      <IconComponent size={24} color="#0284C7" style={{ margin: "8px auto" }} />
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{f.temp}°C</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>🌧 {f.rainProb}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weather Alerts List */}
            {weatherAdvisory && weatherAdvisory.advisories && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={18} color="#D97706" /> {t("weatherAlerts")}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {weatherAdvisory.advisories.map((alertItem, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        background: alertItem.severity === "warning" ? "#FFFBEB" : "#F0FDF4",
                        borderLeft: alertItem.severity === "warning" ? "4px solid #F59E0B" : "4px solid #16A34A",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>
                        [{alertItem.category}] {alertItem.title}
                      </div>
                      <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                        {alertItem.advice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Cultivations & AI Shortcuts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            
            {/* Active Crops Widget */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1E293B" }}>
                  {t("activeCultivations")} ({crops.length})
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

            {/* Right Column: AI Assistant & Equipment Shortcuts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* AI Assistant Quick Card */}
              <div style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2E7D32 100%)", borderRadius: 16, padding: 24, color: "#FFFFFF" }}>
                <MessageSquareText size={32} style={{ marginBottom: 12, opacity: 0.9 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#FFF" }}>Valam AI Assistant</h3>
                <p style={{ fontSize: 13, color: "#E8F5E9", lineHeight: 1.5, marginBottom: 16 }}>
                  Ask questions about leaf yellowing, fertilizer dosing, or Vavuniya planting seasons in Tamil, Sinhala, or English.
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

              {/* Disclaimer */}
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
    </AuthGuard>
  );
}
