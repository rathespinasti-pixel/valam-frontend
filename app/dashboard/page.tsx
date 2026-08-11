"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ValamUser, Crop, CropGuide, WeatherAdvisoryResponse } from "@/lib/types";
import {
  computeLifecycle,
  ComputedLifecycle,
  getLocalizedCropName,
  getLocalizedStageName,
  getLocalizedDistrict,
  getLocalizedFarmingCategory,
  getLocalizedLandUnit,
  getLocalizedWeatherCondition,
} from "@/lib/lifecycle";
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
  Bot,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [weatherAdvisory, setWeatherAdvisory] = useState<WeatherAdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskState, setTaskState] = useState<Record<string, boolean>>({});
  const [dynamicStageImage, setDynamicStageImage] = useState<string | null>(null);

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

  // Compute dynamic lifecycle metrics powered by planting date, DB guides, and active language
  const lifecycleData: ComputedLifecycle | null = useMemo(() => {
    if (!activeCrop) return null;
    return computeLifecycle(activeCrop, guides, language);
  }, [activeCrop, guides, language]);

  useEffect(() => {
    if (activeCrop && lifecycleData) {
      ValamAPI.getCropLifecycleImage({
        crop_name: activeCrop.crop_name,
        variety: activeCrop.variety,
        stage: lifecycleData.currentStage.stage_name || lifecycleData.currentStage.stage || "Stage 1",
        crop_id: activeCrop.id,
        crop_age: lifecycleData.cropAge,
      })
        .then((res) => {
          if (res && res.image_url) {
            setDynamicStageImage(res.image_url);
          }
        })
        .catch((err) => console.error("Dashboard crop image fetch error:", err));
    }
  }, [activeCrop?.id, activeCrop?.crop_name, activeCrop?.variety, lifecycleData?.currentStageIndex]);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar active="dashboard" />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600 }}>{t("loadingAssistant")}</div>
        </div>
        <Footer />
      </AuthGuard>
    );
  }

  // Days since planting & metrics
  const daysSincePlanting = lifecycleData?.cropAge ?? 1;
  const currentStageLabel = lifecycleData?.currentStage?.stage_name ?? (language === "ta" ? "நாற்று / முளைப்பு நிலை" : language === "si" ? "පැළ / තවාන් අවස්ථාව" : "Seedling / Nursery");
  const currentStageIcon = lifecycleData?.currentStage?.icon ?? "🌱";
  const progressPercent = lifecycleData?.progressPercentage ?? 0;
  const daysUntilHarvest = lifecycleData?.daysUntilHarvest ?? 90;
  const currentStageImage = lifecycleData?.currentStageImage ?? "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80";

  // Localized User Details & Crops
  const localizedCropName = activeCrop ? getLocalizedCropName(activeCrop.crop_name, language) : "";
  const localizedDistrict = getLocalizedDistrict(user?.district, language);
  const localizedCategory = getLocalizedFarmingCategory(user?.farming_category, language);
  const localizedLandUnit = getLocalizedLandUnit(user?.land_size_unit, language);

  // Weather rules
  const currentTemp = weatherAdvisory?.current?.temperature_c ?? 31.0;
  const condition = weatherAdvisory?.current?.condition ?? "Sunny";
  const localizedCondition = getLocalizedWeatherCondition(condition, language);
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
      ? (language === "ta"
          ? "2 கிலோ மண்புழு உரம் / இயற்கை உரம் வேர் பகுதியில் இடவும்."
          : language === "si"
          ? "කාබනික කොම්පෝස්ට් 2kg ක් මුල් ප්‍රදේශයට යොදන්න."
          : "Apply 2kg Compost / Vermicompost & top-dress at root base.")
      : (language === "ta"
          ? "யூரியா மற்றும் MOP மேலுரமாக இட்டு உடனடியாக நீர் பாய்ச்சவும்."
          : language === "si"
          ? "යූරියා සහ MOP යොදා වහාම ජලය යොදන්න."
          : "Apply Urea & MOP top dressing. Irrigate immediately after application."));

  const defaultTask1 = language === "ta"
    ? `${localizedCropName || "பயிர்"} இலைகளில் பூச்சிகள் அல்லது நோய் அறிகுறிகள் உள்ளதா என ஆய்வு செய்யவும்.`
    : language === "si"
    ? `${localizedCropName || "වගාවේ"} පත්‍රවල පළිබෝධ හෝ රෝග ඇත්දැයි පරීක්ෂා කරන්න.`
    : `Inspect ${localizedCropName || "crop"} leaves for pests and diseases.`;

  const defaultTask4 = language === "ta"
    ? "சொட்டுநீர் பாசன குழாய்களில் சீரான நீர் விநியோகத்தை சரிபார்க்கவும்."
    : language === "si"
    ? "බිංදු ජලසම්පාදන බටවලින් ඒකාකාරව ජලය ගලා එන්නේදැයි පරීක්ෂා කරන්න."
    : "Check irrigation emitters for uniform water flow.";

  const fertPrefix = t("fertilizerReminderPrefix") || (language === "ta" ? "உர நினைவூட்டல்" : language === "si" ? "පොහොර මතක් කිරීම" : "Fertilizer Reminder");

  const dailyTasks = lifecycleData?.currentStage?.daily_tasks && lifecycleData.currentStage.daily_tasks.length > 0
    ? lifecycleData.currentStage.daily_tasks
    : [
        defaultTask1,
        wateringRule,
        `${fertPrefix}: ${fertAdvice}`,
        defaultTask4,
      ];

  const openCropAssistant = () => {
    if (!activeCrop) return;

    window.dispatchEvent(
      new CustomEvent("valam:open-assistant", {
        detail: {
          source: "dashboard-overview",
          focused_crop_id: activeCrop.id,
          focused_crop: {
            id: activeCrop.id,
            crop_name: activeCrop.crop_name,
            variety: activeCrop.variety,
            planting_date: activeCrop.planting_date,
            crop_age: daysSincePlanting,
            current_stage: currentStageLabel,
            stage_icon: currentStageIcon,
            progress_percent: progressPercent,
            days_until_harvest: daysUntilHarvest,
            expected_harvest_date: lifecycleData?.expectedHarvestDate,
            planting_method: activeCrop.planting_method,
            irrigation_type: activeCrop.irrigation_type || user?.irrigation_preference,
            fertilizer_preference: prefFert,
            fertilizer_recommendation: fertAdvice,
            water_requirement: lifecycleData?.currentStage?.water_requirement || wateringRule,
            today_weather: {
              temperature_c: currentTemp,
              condition: localizedCondition,
              watering_recommendation: wateringRule,
            },
            daily_tasks: dailyTasks,
            land_size: activeCrop.land_size,
            land_size_unit: activeCrop.land_size_unit,
            notes: activeCrop.notes,
          },
        },
      })
    );
  };

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
            {t("farmerPortalSub")}
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", lineHeight: 1.2, marginTop: 4 }}>
            {t("welcomeFarmer")}, {user?.full_name || (language === "ta" ? "விவசாயி" : language === "si" ? "ගොවියා" : "Farmer")}!
          </h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", fontSize: "clamp(0.88rem, 2vw, 1rem)", lineHeight: 1.4 }}>
            📍 {localizedDistrict} · {user?.ds_division || (language === "ta" ? "வவுனியா நகரம்" : language === "si" ? "වවුනියාව නගරය" : "Vavuniya Town")} · {localizedCategory} ({user?.land_size || 1} {localizedLandUnit})
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
                {t("selectActiveCrop")}
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
                    🌱 {getLocalizedCropName(c.crop_name, language)} ({c.variety || t("varietyLocal")})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1. Daily Assistant Main Tracker Cards (8 Summary Cards) */}
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
                  {activeCrop ? getLocalizedCropName(activeCrop.crop_name, language) : t("noCrop")}
                </div>
              </div>
            </div>

            {/* Card 2: Current Crop Age */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("cropAge")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
                  {daysSincePlanting} {t("days")}
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
                  {currentStageIcon} {getLocalizedStageName(currentStageLabel, language)}
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

            {/* Card 5: Days Until Harvest */}
            <div className="dash-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#B45309" }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t("daysUntilHarvest")}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#B45309" }}>{daysUntilHarvest} {t("days")}</div>
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
                  {isRaining ? t("skipRainToday") : t("waterEarlyMorning")}
                </div>
              </div>
            </div>

            {/* Card 8: Crop-aware AI Assistant */}
            <button
              type="button"
              className="dash-card"
              onClick={openCropAssistant}
              disabled={!activeCrop}
              title={activeCrop ? `${t("askAiAbout")} ${localizedCropName}` : t("addCropToUseAi")}
              style={{
                textAlign: "left",
                border: "1px solid #BBF7D0",
                background: activeCrop ? "#FFFFFF" : "#F8FAFC",
                opacity: activeCrop ? 1 : 0.65,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#047857" }}>
                <Bot size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#047857", fontWeight: 700 }}>{t("aiAssistant")}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", lineHeight: 1.25 }}>
                  {t("askAboutCrop")} {localizedCropName || (language === "ta" ? "உங்கள் பயிர்" : language === "si" ? "ඔබේ වගාව" : "your crop")}
                </div>
              </div>
            </button>
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
                    <Layers size={22} color="#10B981" /> {localizedCropName} {t("lifecycleGrowthTracker")}
                  </h2>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    {t("plantedOn")} {activeCrop.planting_date} · {t("currentDay")} {daysSincePlanting} {t("of")} {lifecycleData.totalHarvestDays}
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
                  {t("exploreCompleteLifecycle")} <ArrowRight size={16} />
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
                            {getLocalizedStageName(st.stage_name, language)}
                          </span>
                          <span style={{ fontSize: 9, opacity: 0.9 }}>
                            {t("day")} {st.start_day}–{st.end_day}
                          </span>
                          {isCompleted && <span style={{ fontSize: 10, fontWeight: 800 }}>✓</span>}
                          {isCurrent && <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(255,255,255,0.25)", padding: "1px 6px", borderRadius: 8 }}>{t("activeBadge")}</span>}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Progress Line */}
                  <div style={{ background: "#F1F5F9", borderRadius: 10, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      <span>{t("stageProgress")}: {getLocalizedStageName(lifecycleData.currentStage.stage_name, language)}</span>
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
                      {currentStageIcon} {t("day")} {daysSincePlanting} {t("visual")}
                    </div>

                    <img
                      src={dynamicStageImage || currentStageImage}
                      alt={`${localizedCropName} ${getLocalizedStageName(currentStageLabel, language)}`}
                      style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12 }}
                    />

                    <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "#1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{t("expectedAppearance")}</span>
                      <span style={{ fontSize: 12, color: "#10B981" }}>{t("clickForDetails")}</span>
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
                  <CheckCircle2 size={22} color="#10B981" /> {t("todaysTasks")} ({t("stage")} {lifecycleData?.currentStageIndex! + 1})
                </h2>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                  {Object.values(taskState).filter(Boolean).length} / {dailyTasks.length} {t("done")}
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
                  {localizedDistrict}
                </span>
              </div>

              <div style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", borderRadius: 14, padding: 18, color: "#FFF", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{currentTemp}°C</div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>{localizedCondition}</div>
                  </div>
                  <CloudSun size={48} style={{ opacity: 0.9 }} />
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: 12, paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>💧 {t("humidity")}: {weatherAdvisory?.current?.humidity_percent ?? 68}%</span>
                  <span>💨 {t("windSpeed")}: {weatherAdvisory?.current?.wind_kmh ?? 12} km/h</span>
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
                {t("autoStageAlerts")}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 12, background: "#F0FDF4", border: "1px solid #DCFCE7", display: "flex", gap: 12, alignItems: "center" }}>
                <Zap size={24} color="#16A34A" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>{t("currentStageAlert")}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{t("activeStageLabel")}: {getLocalizedStageName(currentStageLabel, language)} ({t("day")} {daysSincePlanting})</div>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "#FEF3C7", border: "1px solid #FDE68A", display: "flex", gap: 12, alignItems: "center" }}>
                <Sprout size={24} color="#D97706" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#92400E" }}>{t("fertilizerSchedule")}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{fertAdvice}</div>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", gap: 12, alignItems: "center" }}>
                <Droplets size={24} color="#2563EB" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF" }}>{t("wateringRecommendation")}</div>
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
