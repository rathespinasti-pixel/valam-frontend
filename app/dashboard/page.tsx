"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ValamUser, Crop, CropGuide, WeatherAdvisoryResponse } from "@/lib/types";
import { computeLifecycle, ComputedLifecycle, getLocalizedCropName, getLocalizedStageName } from "@/lib/lifecycle";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sprout,
  CloudSun,
  Droplets,
  Calendar,
  CheckCircle2,
  BellRing,
  Clock,
  Zap,
  Layers,
  ArrowRight,
  BookOpen,
  Bot,
  Stethoscope,
  ShoppingBag,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [guides, setGuides] = useState<CropGuide[]>([]);
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

        if (u.role === "admin" || u.role === "super_admin") {
          router.push("/admin");
          return;
        }

        const [cropsRes, guidesRes, weatherRes] = await Promise.allSettled([
          ValamAPI.getCrops(),
          ValamAPI.getCropGuides(),
          ValamAPI.getWeatherAdvisory(`${u.ds_division || u.district || "Vavuniya"},LK`),
        ]);

        if (cropsRes.status === "fulfilled") {
          const items = cropsRes.value.items;
          setCrops(items);
          if (items.length > 0) {
            setSelectedCropId(items[0].id);
          }
        }
        if (guidesRes.status === "fulfilled") {
          setGuides(guidesRes.value.items);
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

  const activeCrop = useMemo(() => {
    return crops.find((c) => c.id === selectedCropId) || crops[0] || null;
  }, [crops, selectedCropId]);

  // Compute dynamic lifecycle metrics powered by planting date & DB guides
  const lifecycleData: ComputedLifecycle | null = useMemo(() => {
    if (!activeCrop) return null;
    return computeLifecycle(activeCrop, guides);
  }, [activeCrop, guides]);

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

  // Days since planting & metrics
  const daysSincePlanting = lifecycleData?.cropAge ?? 1;
  const currentStageLabel = lifecycleData?.currentStage?.stage_name ?? "Seedling / Nursery";
  const currentStageIcon = lifecycleData?.currentStage?.icon ?? "🌱";
  const progressPercent = lifecycleData?.progressPercentage ?? 0;
  const daysUntilHarvest = lifecycleData?.daysUntilHarvest ?? 90;
  const currentStageImage = lifecycleData?.currentStageImage ?? "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80";

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

  // Fertilizer & tasks
  const prefFert = user?.fertilizer_preference || activeCrop?.fertilizer_preference || "Organic";
  const fertAdvice = lifecycleData?.currentStage?.fertilizer_recommendation ||
    (prefFert === "Organic"
      ? "Apply 2kg Compost / Vermicompost & top-dress at root base."
      : "Apply Urea & MOP top dressing. Irrigate immediately after application.");

  const dailyTasks = lifecycleData?.currentStage?.daily_tasks || [
    `Inspect ${activeCrop ? activeCrop.crop_name : "crop"} leaves for pests.`,
    wateringRule,
    `Fertilizer Reminder: ${fertAdvice}`,
    `Check irrigation emitters for uniform water flow.`,
  ];

  const toggleTask = (index: number) => {
    setTaskState((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <AuthGuard>
      <Navbar active="dashboard" pageTitle={t("dashboard")} />

      {/* Clean Welcome Banner */}
      <section className="page-hero" style={{ padding: "32px 0" }}>
        <div className="container">
          <div className="crumb" style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)" }}>
            Northern Province Farmer Portal / Daily Assistant
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", lineHeight: 1.2, marginTop: 4 }}>
            Ayubowan / Vanakkam, {user?.full_name || "Farmer"}!
          </h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", fontSize: "clamp(0.88rem, 2vw, 1rem)", lineHeight: 1.4 }}>
            📍 {user?.district || "Vavuniya"} · {user?.ds_division || "Vavuniya Town"} · {user?.farming_category || "Farmer"} ({user?.land_size || 1} {user?.land_size_unit || "Acres"})
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7", paddingTop: 28 }}>
        <div className="container">
        
          {/* Active Crop Selector Bar if multiple crops exist */}
          {crops.length > 1 && (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "12px 18px",
                marginBottom: 24,
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                gap: 12,
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "thin",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1B4D3E", whiteSpace: "nowrap", flexShrink: 0 }}>
                Select Active Crop:
              </span>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", flexWrap: "nowrap" }}>
                {crops.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCropId(c.id)}
                    style={{
                      padding: "7px 15px",
                      borderRadius: 20,
                      border: selectedCropId === c.id ? "2px solid #10B981" : "1px solid #CBD5E1",
                      background: selectedCropId === c.id ? "#DCFCE7" : "#F8FAFC",
                      color: selectedCropId === c.id ? "#166534" : "#475569",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  >
                    🌱 {c.crop_name} ({c.variety || "Local"})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1. Daily Assistant Main Tracker Cards (7 Summary Cards) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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

            {/* Card 2: Current Crop Age */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Crop Age</div>
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
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Current Stage</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", lineHeight: 1.2 }}>
                  {currentStageIcon} {currentStageLabel}
                </div>
              </div>
            </div>

            {/* Card 4: Progress Percentage */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333EA" }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Progress</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#9333EA" }}>{progressPercent}%</div>
              </div>
            </div>

            {/* Card 5: Days Until Harvest */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#B45309" }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Until Harvest</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#B45309" }}>{daysUntilHarvest} Days</div>
              </div>
            </div>

            {/* Card 6: Today's Weather */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7" }}>
                <CloudSun size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("todaysWeather")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{currentTemp}°C</div>
              </div>
            </div>

            {/* Card 7: Irrigation Recommendation */}
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
          </div>

          {/* 2. CROP LIFECYCLE CARD & CURRENT STAGE IMAGE GRID */}
          {activeCrop && lifecycleData && (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: 24,
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                marginBottom: 32,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <Layers size={22} color="#10B981" /> {activeCrop.crop_name} Lifecycle Growth Tracker
                  </h2>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    Planted on {activeCrop.planting_date} · Current Day {daysSincePlanting} of {lifecycleData.totalHarvestDays}
                  </div>
                </div>

                <Link
                  href={`/crops/lifecycle?crop_id=${activeCrop.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#F0FDF4",
                    color: "#166534",
                    border: "1px solid #A7F3D0",
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  Explore Complete Lifecycle <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "center" }}>
                
                {/* Visual 5-Stage Timeline */}
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${lifecycleData.allStages.length}, 1fr)`, gap: 8, marginBottom: 16 }}>
                    {lifecycleData.allStages.map((st, idx) => {
                      const isCurrent = idx === lifecycleData.currentStageIndex;
                      const isCompleted = (st.end_day || 0) < daysSincePlanting;

                      let bg = "#F8FAFC";
                      let border = "1px solid #E2E8F0";
                      let color = "#64748B";

                      if (isCompleted) {
                        bg = "#DCFCE7";
                        border = "1px solid #A7F3D0";
                        color = "#166534";
                      }
                      if (isCurrent) {
                        bg = "#10B981";
                        border = "2px solid #059669";
                        color = "#FFFFFF";
                      }

                      return (
                        <Link
                          key={idx}
                          href={`/crops/lifecycle?crop_id=${activeCrop.id}`}
                          style={{
                            padding: "12px 6px",
                            borderRadius: 12,
                            background: bg,
                            border: border,
                            color: color,
                            textAlign: "center",
                            textDecoration: "none",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{st.icon}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>
                            {st.stage_name}
                          </span>
                          <span style={{ fontSize: 9, opacity: 0.9 }}>
                            Day {st.start_day}–{st.end_day}
                          </span>
                          {isCompleted && <span style={{ fontSize: 10, fontWeight: 800 }}>✓</span>}
                          {isCurrent && <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(255,255,255,0.25)", padding: "1px 6px", borderRadius: 8 }}>Active</span>}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Progress Line */}
                  <div style={{ background: "#F1F5F9", borderRadius: 10, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      <span>Stage Progress: {lifecycleData.currentStage.stage_name}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div style={{ width: "100%", height: 10, background: "#CBD5E1", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${progressPercent}%`, height: "100%", background: "#10B981", borderRadius: 6 }} />
                    </div>
                  </div>
                </div>

                {/* Current Stage Representative Image */}
                <Link
                  href={`/crops/lifecycle?crop_id=${activeCrop.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#F8FAFC",
                      borderRadius: 16,
                      padding: 12,
                      border: "1px solid #E2E8F0",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 20, left: 20, background: "rgba(0,0,0,0.7)", color: "#FFF", padding: "4px 12px", borderRadius: 14, fontSize: 12, fontWeight: 700, backdropFilter: "blur(4px)" }}>
                      {currentStageIcon} Day {daysSincePlanting} Visual
                    </div>

                    <img
                      src={currentStageImage}
                      alt={`${activeCrop.crop_name} ${currentStageLabel}`}
                      style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12 }}
                    />

                    <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "#1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Expected Appearance</span>
                      <span style={{ fontSize: 12, color: "#10B981" }}>Click for details →</span>
                    </div>
                  </div>
                </Link>

              </div>
            </div>
          )}

          {/* Today's Tasks Checklist & Weather Advisory Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>

            {/* Left: Today's Tasks Checklist */}
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={22} color="#10B981" /> {t("todaysTasks")} (Stage {lifecycleData?.currentStageIndex! + 1})
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

          {/* Notifications & Stage Reminders Panel */}
          <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <BellRing size={22} color="#D97706" />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1E293B" }}>
                Automatic Stage Alerts &amp; Notifications
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 12, background: "#F0FDF4", border: "1px solid #DCFCE7", display: "flex", gap: 12, alignItems: "center" }}>
                <Zap size={24} color="#16A34A" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>Current Stage Alert</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>Active stage: {currentStageLabel} (Day {daysSincePlanting})</div>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "#FEF3C7", border: "1px solid #FDE68A", display: "flex", gap: 12, alignItems: "center" }}>
                <Sprout size={24} color="#D97706" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#92400E" }}>Fertilizer Schedule</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{fertAdvice}</div>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", gap: 12, alignItems: "center" }}>
                <Droplets size={24} color="#2563EB" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF" }}>Irrigation Recommendation</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{lifecycleData?.currentStage?.water_requirement || wateringRule}</div>
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
