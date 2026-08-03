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
  Bot,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Thermometer,
  Eye,
  CheckCircle2,
  BellRing,
  Clock,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [weatherAdvisory, setWeatherAdvisory] = useState<WeatherAdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskState, setTaskState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }

    async function loadDashboardData() {
      try {
        const u = await ValamAPI.me();
        setUser(u);

        const [cropsRes, weatherRes] = await Promise.allSettled([
          ValamAPI.getCrops(),
          ValamAPI.getWeatherAdvisory(`${u.ds_division || u.district || 'Vavuniya'},LK`),
        ]);

        if (cropsRes.status === "fulfilled") {
          const items = cropsRes.value.items;
          setCrops(items);
          if (items.length > 0) {
            setSelectedCropId(items[0].id);
          }
        }
        if (weatherRes.status === "fulfilled") {
          setWeatherAdvisory(weatherRes.value);
        }
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
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600 }}>Loading farmer daily assistant...</div>
        </div>
        <Footer />
      </AuthGuard>
    );
  }

  const activeCrop = crops.find((c) => c.id === selectedCropId) || crops[0] || null;

  // Days since planting math
  let daysSincePlanting = 0;
  if (activeCrop && activeCrop.planting_date) {
    const start = new Date(activeCrop.planting_date).getTime();
    const now = new Date().getTime();
    daysSincePlanting = Math.max(1, Math.floor((now - start) / (1000 * 3600 * 24)));
  }

  // Estimated duration for progress percentage (average 90 days for short duration crops)
  const totalExpectedDays = 90;
  const progressPercent = Math.min(100, Math.round((daysSincePlanting / totalExpectedDays) * 100));

  // Determine stage normalized to 3 stages
  let stageLabel = t("stage1Title");
  if (activeCrop) {
    if (activeCrop.current_stage.includes("2") || activeCrop.current_stage.toLowerCase().includes("flower")) {
      stageLabel = t("stage2Title");
    } else if (activeCrop.current_stage.includes("3") || activeCrop.current_stage.toLowerCase().includes("fruit") || activeCrop.current_stage.toLowerCase().includes("harvest")) {
      stageLabel = t("stage3Title");
    } else {
      stageLabel = t("stage1Title");
    }
  }

  // Weather rules
  const currentTemp = weatherAdvisory?.current?.temperature_c ?? 31.0;
  const condition = weatherAdvisory?.current?.condition ?? "Sunny";
  const isRaining = condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("shower");
  const isHighTemp = currentTemp >= 32.0;

  let wateringRule = t("waterCropSunny");
  if (isRaining) {
    wateringRule = t("skipWateringRain");
  } else if (isHighTemp) {
    wateringRule = t("waterCoolerHours");
  }

  // Fertilizer guidance based on preference & stage
  const prefFert = user?.fertilizer_preference || activeCrop?.fertilizer_preference || "Organic";
  let fertAdvice = "";
  if (prefFert === "Organic") {
    fertAdvice = "Apply 2kg Compost / Vermicompost & top-dress with cow dung slurry at root base.";
  } else {
    fertAdvice = "Apply Urea (15g/m²) & MOP (10g/m²) top dressing. Irrigate immediately after application.";
  }

  // Today's tasks
  const dailyTasks = [
    `Inspect ${activeCrop ? activeCrop.crop_name : "crop"} leaves for whiteflies, thrips, or early leaf spots.`,
    wateringRule,
    `Fertilizer Reminder: ${fertAdvice}`,
    `Check ${activeCrop?.irrigation_type || user?.irrigation_preference || "drip"} emitters for uniform water flow.`,
  ];

  const toggleTask = (index: number) => {
    setTaskState((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <AuthGuard>
      <Navbar active="dashboard" pageTitle={t("dashboard")} />

      {/* Hero Section */}
      <section className="page-hero" style={{ padding: "32px 0" }}>
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}
        >
          <div>
            <div className="crumb">Northern Province Farmer Portal / Daily Assistant</div>
            <h1 style={{ fontSize: 32 }}>Ayubowan / Vanakkam, {user?.full_name || "Farmer"}!</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", fontSize: 16 }}>
              📍 {user?.district || "Vavuniya"} · {user?.ds_division || "Vavuniya Town"} · {user?.farming_category || "Farmer"} ({user?.land_size || 1} {user?.land_size_unit || "Acres"})
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/crops" className="btn btn-sun">
              + {t("addCrop")}
            </Link>
            <Link
              href="/settings"
              className="btn btn-outline"
              style={{ background: "rgba(255,255,255,0.1)", color: "#FFF", borderColor: "#FFF" }}
            >
              {t("settings")}
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Active Crop Selector Bar if multiple crops exist */}
          {crops.length > 1 && (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "14px 20px",
                marginBottom: 24,
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                gap: 16,
                overflowX: "auto",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1B4D3E", whiteSpace: "nowrap" }}>
                Select Active Crop:
              </span>
              {crops.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCropId(c.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: selectedCropId === c.id ? "2px solid #10B981" : "1px solid #CBD5E1",
                    background: selectedCropId === c.id ? "#DCFCE7" : "#F8FAFC",
                    color: selectedCropId === c.id ? "#166534" : "#475569",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  🌱 {c.crop_name} ({c.variety || "Local"})
                </button>
              ))}
            </div>
          )}

          {/* 1. Daily Assistant Main Tracker Cards (7 Summary Cards) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {/* Card 1: Current Crop */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E6F4EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E8E3E" }}>
                <Sprout size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("currentCrop")}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
                  {activeCrop ? activeCrop.crop_name : "No Crop"}
                </div>
              </div>
            </div>

            {/* Card 2: Days Since Planting */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("daysSincePlanting")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
                  {daysSincePlanting} Days
                </div>
              </div>
            </div>

            {/* Card 3: Current Growth Stage */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803D" }}>
                <Zap size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("currentGrowthStage")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", lineHeight: 1.2 }}>
                  {stageLabel}
                </div>
              </div>
            </div>

            {/* Card 4: Progress Percentage */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333EA" }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("progressPercentage")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#9333EA" }}>{progressPercent}%</div>
              </div>
            </div>

            {/* Card 5: Today's Weather */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7" }}>
                <CloudSun size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("todaysWeather")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{currentTemp}°C</div>
              </div>
            </div>

            {/* Card 6: Irrigation Recommendation */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0369A1" }}>
                <Droplets size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("irrigationStatus")}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isRaining ? "#D97706" : "#0369A1" }}>
                  {isRaining ? "Skip Rain Today" : "Water Early Morning"}
                </div>
              </div>
            </div>

            {/* Card 7: Fertilizer Reminder */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#166534" }}>
                <Sprout size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("fertilizerPreference")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>
                  {prefFert} Dosing Ready
                </div>
              </div>
            </div>
          </div>

          {/* Today's Assistant Banner & Progress Bar */}
          {activeCrop && (
            <div
              style={{
                background: "linear-gradient(135deg, #1B4D3E 0%, #064E3B 100%)",
                borderRadius: 20,
                padding: 28,
                color: "#FFFFFF",
                marginBottom: 32,
                boxShadow: "0 6px 24px rgba(27, 77, 62, 0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                <div>
                  <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>
                    DAILY CROP ASSISTANT
                  </span>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 8, color: "#FFF" }}>
                    {activeCrop.crop_name} — Day {daysSincePlanting} ({stageLabel})
                  </h2>
                  <p style={{ fontSize: 14, color: "#D1FAE5", marginTop: 4 }}>
                    Method: {activeCrop.planting_method || "Transplanting"} · System: {activeCrop.irrigation_type || user?.irrigation_preference || "Drip Irrigation"} · Preference: {prefFert}
                  </p>
                </div>
                <Link href="/crops" className="btn btn-sun" style={{ padding: "10px 20px" }}>
                  Inspect Full Lifecycle <ChevronRight size={16} />
                </Link>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#A7F3D0", marginBottom: 6, fontWeight: 600 }}>
                  <span>Planting Date: {activeCrop.planting_date}</span>
                  <span>{progressPercent}% Stage Completion</span>
                  <span>Est. Harvest: ~Day 90</span>
                </div>
                <div style={{ width: "100%", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: "linear-gradient(90deg, #34D399, #10B981)",
                      borderRadius: 6,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Today's Tasks Checklist & Weather Advisory Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>

            {/* Left: Today's Tasks Checklist */}
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={22} color="#10B981" /> {t("todaysTasks")}
                </h2>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                  {Object.values(taskState).filter(Boolean).length} / {dailyTasks.length} Done
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dailyTasks.map((taskText, idx) => {
                  const isDone = !!taskState[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTask(idx)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: 14,
                        borderRadius: 12,
                        background: isDone ? "#F0FDF4" : "#F8FAFC",
                        border: isDone ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        style={{ width: 18, height: 18, marginTop: 2, accentColor: "#10B981" }}
                      />
                      <div style={{ fontSize: 14, color: isDone ? "#166534" : "#334155", textDecoration: isDone ? "line-through" : "none", lineHeight: 1.5, fontWeight: isDone ? 500 : 600 }}>
                        {taskText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Smart Weather Advisory */}
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
                  <CloudSun size={22} color="#0284C7" /> {t("weatherSummary")}
                </h2>
                <span style={{ fontSize: 12, color: "#0284C7", fontWeight: 700, background: "#E0F2FE", padding: "2px 10px", borderRadius: 12 }}>
                  {user?.district || "Vavuniya"}
                </span>
              </div>

              <div style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", borderRadius: 14, padding: 18, color: "#FFF", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{currentTemp}°C</div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>{condition}</div>
                  </div>
                  <CloudSun size={48} style={{ opacity: 0.9 }} />
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: 12, paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>💧 Humidity: {weatherAdvisory?.current?.humidity_percent ?? 68}%</span>
                  <span>💨 Wind: {weatherAdvisory?.current?.wind_kmh ?? 12} km/h</span>
                </div>
              </div>

              <div style={{ background: isRaining ? "#FFFBEB" : "#F0FDF4", borderLeft: isRaining ? "4px solid #F59E0B" : "4px solid #10B981", padding: 14, borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>
                  {t("wateringRecommendation")}
                </div>
                <div style={{ fontSize: 13, color: "#475569", marginTop: 4, fontWeight: 600 }}>
                  {wateringRule}
                </div>
              </div>
            </div>

          </div>

          {/* Notifications & Reminders Panel */}
          <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <BellRing size={22} color="#D97706" />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1E293B" }}>
                {t("notificationsTitle")}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 12, background: "#F0FDF4", border: "1px solid #DCFCE7", display: "flex", gap: 12, alignItems: "center" }}>
                <Droplets size={24} color="#16A34A" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>{t("wateringReminder")}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{wateringRule}</div>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "#FEF3C7", border: "1px solid #FDE68A", display: "flex", gap: 12, alignItems: "center" }}>
                <Sprout size={24} color="#D97706" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#92400E" }}>{t("fertilizerAlert")}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{prefFert} dose scheduled for active growth stage.</div>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", gap: 12, alignItems: "center" }}>
                <Zap size={24} color="#2563EB" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF" }}>{t("floweringAlert")}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>Maintain steady moisture during flower set.</div>
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
