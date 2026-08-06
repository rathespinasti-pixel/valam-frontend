"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ValamUser, Crop, CropGuide, WeatherAdvisoryResponse, PerenualPlantInfo } from "@/lib/types";
import { computeLifecycle, ComputedLifecycle, getLocalizedCropName, getLocalizedStageName } from "@/lib/lifecycle";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sprout,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Droplets,
  ArrowLeft,
  Sparkles,
  Zap,
  Info,
  Layers,
  ChevronDown,
  CloudSun,
  ShieldCheck,
  BookOpen,
  Sun,
} from "lucide-react";

function CropLifecycleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cropIdParam = searchParams.get("crop_id");
  const { t } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(
    cropIdParam ? parseInt(cropIdParam, 10) : null
  );
  const [weatherAdvisory, setWeatherAdvisory] = useState<WeatherAdvisoryResponse | null>(null);
  const [perenualInfo, setPerenualInfo] = useState<PerenualPlantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskState, setTaskState] = useState<Record<string, boolean>>({});
  const [activeStageTab, setActiveStageTab] = useState<number | null>(null);

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const u = await ValamAPI.me();
        setUser(u);

        const [cropsRes, guidesRes, weatherRes] = await Promise.allSettled([
          ValamAPI.getCrops(),
          ValamAPI.getCropGuides(),
          ValamAPI.getWeatherAdvisory(`${u.ds_division || u.district || "Vavuniya"},LK`),
        ]);

        if (cropsRes.status === "fulfilled") {
          const items = cropsRes.value.items;
          setCrops(items);
          if (items.length > 0) {
            if (cropIdParam) {
              const matched = items.find((c) => c.id === parseInt(cropIdParam, 10));
              setSelectedCropId(matched ? matched.id : items[0].id);
            } else {
              setSelectedCropId(items[0].id);
            }
          }
        }

        if (guidesRes.status === "fulfilled") {
          setGuides(guidesRes.value.items);
        }

        if (weatherRes.status === "fulfilled") {
          setWeatherAdvisory(weatherRes.value);
        }
      } catch (err) {
        console.error("Failed to load lifecycle page data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, cropIdParam]);

  const activeCrop = useMemo(() => {
    return crops.find((c) => c.id === selectedCropId) || crops[0] || null;
  }, [crops, selectedCropId]);

  const lifecycleData: ComputedLifecycle | null = useMemo(() => {
    if (!activeCrop) return null;
    return computeLifecycle(activeCrop, guides);
  }, [activeCrop, guides]);

  // Set default stage tab & fetch Perenual plant info when active crop changes
  useEffect(() => {
    if (lifecycleData) {
      setActiveStageTab(lifecycleData.currentStageIndex);
    }
    if (activeCrop) {
      ValamAPI.getPerenualPlantInfo(activeCrop.crop_name)
        .then(setPerenualInfo)
        .catch((err) => console.error("Perenual info fetch error", err));
    }
  }, [selectedCropId, activeCrop, lifecycleData?.currentStageIndex]);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar active="crops" />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600 }}>Loading Crop Growth Tracker...</div>
        </div>
        <Footer />
      </AuthGuard>
    );
  }

  if (!activeCrop || !lifecycleData) {
    return (
      <AuthGuard>
        <Navbar active="crops" />
        <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
          <Sprout size={54} color="#10B981" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1E293B" }}>No Cultivations Tracked</h2>
          <p style={{ color: "#64748B", marginTop: 8, marginBottom: 24 }}>
            Please add a crop to view its full lifecycle, daily activities, and stage recommendations.
          </p>
          <Link href="/crops" className="btn btn-sun">
            + Add New Cultivation
          </Link>
        </div>
        <Footer />
      </AuthGuard>
    );
  }

  const {
    cropAge,
    totalHarvestDays,
    currentStageIndex,
    currentStage,
    progressPercentage,
    daysUntilHarvest,
    expectedHarvestDate,
    currentStageImage,
    allStages,
    completedStages,
    futureStages,
    nextStage,
    nextStageStartDate,
  } = lifecycleData;

  const inspectStage = activeStageTab !== null && allStages[activeStageTab] ? allStages[activeStageTab] : currentStage;
  const isInspectCurrent = activeStageTab === currentStageIndex;

  // Weather guidance math
  const currentTemp = weatherAdvisory?.current?.temperature_c ?? 31.0;
  const condition = weatherAdvisory?.current?.condition ?? "Sunny";
  const isRaining = condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("shower");

  let weatherAdvice = `Sunny & clear (${currentTemp}°C). Follow standard morning irrigation.`;
  if (isRaining) {
    weatherAdvice = `Rain detected (${condition}). Hold off on overhead watering to prevent waterlogging.`;
  } else if (currentTemp >= 33) {
    weatherAdvice = `High heat warning (${currentTemp}°C). Provide extra afternoon misting to reduce leaf burn.`;
  }

  const toggleTask = (index: number) => {
    setTaskState((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <AuthGuard>
      <Navbar active="crops" pageTitle="Crop Lifecycle Details" />

      {/* Hero Banner */}
      <section className="page-hero" style={{ padding: "32px 0", background: "linear-gradient(135deg, #1B4D3E 0%, #15803D 100%)" }}>
        <div className="container">
          <Link href="/crops" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#A7F3D0", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back to Cultivations
          </Link>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h1 style={{ fontSize: 32, margin: 0 }}>{activeCrop.crop_name} Lifecycle</h1>
                <span style={{ background: "rgba(255,255,255,0.2)", color: "#FFF", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                  Variety: {activeCrop.variety || "Local Selection"}
                </span>
              </div>
              <p style={{ marginTop: 8, color: "#CFE3D5", fontSize: 15, maxWidth: 640 }}>
                Visual growth cycle tracking from seedling to harvest. Live automatic stage detection powered by planting date.
              </p>
            </div>

            {/* Active Crop Picker Dropdown if multiple crops exist */}
            {crops.length > 1 && (
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 14px", backdropFilter: "blur(6px)" }}>
                <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#A7F3D0", fontWeight: 700, display: "block", marginBottom: 4 }}>
                  Switch Crop:
                </label>
                <select
                  value={activeCrop.id}
                  onChange={(e) => setSelectedCropId(parseInt(e.target.value, 10))}
                  style={{
                    background: "#FFFFFF",
                    color: "#1E293B",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      🌱 {c.crop_name} ({c.variety || "Local"}) — Planted {c.planting_date}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* 1. Crop Summary & Progress Bar Header Card */}
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", marginBottom: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>CROP NAME</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginTop: 4 }}>{activeCrop.crop_name}</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>{activeCrop.variety || "Standard Variety"}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>PLANTING DATE</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginTop: 4 }}>{activeCrop.planting_date}</div>
                <div style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>Method: {activeCrop.planting_method || "Transplanting"}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>CURRENT CROP AGE</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#D97706", marginTop: 4 }}>{cropAge} Days</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>Target: {totalHarvestDays} Days</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>CURRENT GROWTH STAGE</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#166534", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{currentStage.icon}</span> {currentStage.stage_name}
                </div>
                <div style={{ fontSize: 12, color: "#10B981", fontWeight: 700, marginTop: 2 }}>Auto-Detected from Date</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>EXPECTED HARVEST</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#9333EA", marginTop: 4 }}>{expectedHarvestDate}</div>
                <div style={{ fontSize: 13, color: "#9333EA", fontWeight: 700 }}>{daysUntilHarvest} Days Remaining</div>
              </div>
            </div>

            {/* Overall Crop Progress Indicator */}
            <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 14, border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
                  Overall Cultivation Progress
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#10B981" }}>
                  {progressPercentage}% Completed
                </span>
              </div>
              <div style={{ width: "100%", height: 14, background: "#E2E8F0", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    width: `${progressPercentage}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #10B981 0%, #059669 100%)",
                    borderRadius: 8,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#64748B", fontWeight: 600 }}>
                <span>🌱 Planting (Day 1)</span>
                <span>🔥 Day {cropAge} (Current)</span>
                <span>🧺 Harvest (Day {totalHarvestDays})</span>
              </div>
            </div>
          </div>

          {/* 2. Interactive Complete Lifecycle Timeline Stepper */}
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
              <Layers size={24} color="#10B981" /> Interactive Growth Lifecycle Timeline
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
              Click any stage below to inspect detailed plant appearance, tasks, irrigation advice, and nutrient guidelines.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${allStages.length}, 1fr)`, gap: 12, overflowX: "auto" }}>
              {allStages.map((st, idx) => {
                const isCurrent = idx === currentStageIndex;
                const isCompleted = (st.end_day || 0) < cropAge;
                const isSelected = activeStageTab === idx;

                let cardBg = "#F8FAFC";
                let borderColor = "#CBD5E1";
                let textColor = "#475569";
                let statusBadge = "Future";
                let badgeBg = "#E2E8F0";
                let badgeColor = "#64748B";

                if (isCompleted) {
                  cardBg = "#F0FDF4";
                  borderColor = "#A7F3D0";
                  textColor = "#166534";
                  statusBadge = "Completed ✓";
                  badgeBg = "#DCFCE7";
                  badgeColor = "#15803D";
                }

                if (isCurrent) {
                  cardBg = "#ECFDF5";
                  borderColor = "#10B981";
                  textColor = "#065F46";
                  statusBadge = "Current Stage 🔥";
                  badgeBg = "#10B981";
                  badgeColor = "#FFFFFF";
                }

                if (isSelected) {
                  borderColor = "#059669";
                }

                return (
                  <div
                    key={st.stage_id || idx}
                    onClick={() => setActiveStageTab(idx)}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      background: cardBg,
                      border: isSelected ? "3px solid #10B981" : `1px solid ${borderColor}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isCurrent ? "0 4px 14px rgba(16, 185, 129, 0.2)" : "none",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{st.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: badgeBg, color: badgeColor, padding: "2px 8px", borderRadius: 12 }}>
                        {statusBadge}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>
                      Stage {idx + 1} (Day {st.start_day}–{st.end_day})
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: textColor, marginTop: 4, lineHeight: 1.2 }}>
                      {st.stage_name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Inspected Stage Details & Stage Image Section */}
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{inspectStage.icon}</span>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1E293B", margin: 0 }}>
                    Stage {activeStageTab! + 1}: {inspectStage.stage_name}
                  </h2>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    Duration: Day {inspectStage.start_day} – {inspectStage.end_day}
                  </div>
                </div>
              </div>

              <div>
                {isInspectCurrent ? (
                  <span style={{ background: "#10B981", color: "#FFF", padding: "6px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                    Current Active Stage
                  </span>
                ) : (inspectStage.end_day || 0) < cropAge ? (
                  <span style={{ background: "#DCFCE7", color: "#166534", padding: "6px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                    Completed Stage Review
                  </span>
                ) : (
                  <span style={{ background: "#F1F5F9", color: "#475569", padding: "6px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                    Future Stage Preview
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>

              {/* Stage Image Display */}
              <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 16, border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={18} color="#10B981" /> Expected Plant Appearance
                </div>
                <img
                  src={inspectStage.image_url || currentStageImage}
                  alt={`${activeCrop.crop_name} ${inspectStage.stage_name}`}
                  style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 14, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
                />
                <p style={{ marginTop: 12, fontSize: 13, color: "#475569", lineHeight: 1.5, fontWeight: 500 }}>
                  {inspectStage.expected_appearance}
                </p>
              </div>

              {/* Stage Specific Instructions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 18, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", marginBottom: 6 }}>
                    Stage Overview &amp; Development
                  </div>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, margin: 0 }}>
                    {inspectStage.description}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ background: "#E0F2FE", borderRadius: 14, padding: 16, border: "1px solid #BAE6FD" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0369A1", display: "flex", alignItems: "center", gap: 6 }}>
                      <Droplets size={18} /> Water Requirement
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0284C7", marginTop: 6 }}>
                      {inspectStage.water_requirement}
                    </div>
                  </div>

                  <div style={{ background: "#DCFCE7", borderRadius: 14, padding: 16, border: "1px solid #A7F3D0" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                      <Sprout size={18} /> Fertilizer Advice
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#15803D", marginTop: 6 }}>
                      {inspectStage.fertilizer_recommendation}
                    </div>
                  </div>
                </div>

                {/* Stage Tasks List */}
                <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 18, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", marginBottom: 10 }}>
                    Recommended Activities for this Stage:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {inspectStage.daily_tasks && inspectStage.daily_tasks.map((task, tIdx) => (
                      <div key={tIdx} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#334155" }}>
                        <CheckCircle2 size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Botanical & Plant Profile Card (Perenual API Integration) */}
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)", marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BookOpen size={24} color="#16A34A" />
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>
                    Botanical &amp; Plant Profile
                  </h2>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    Verified plant information retrieved via Flask backend proxy &amp; local database cache
                  </div>
                </div>
              </div>

              <span style={{ background: "#DCFCE7", color: "#15803D", padding: "4px 12px", borderRadius: 14, fontSize: 12, fontWeight: 700, border: "1px solid #A7F3D0" }}>
                🌐 Perenual Plant Database API
              </span>
            </div>

            {perenualInfo ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* Botanical Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  {perenualInfo.scientific_name && (
                    <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Scientific Name</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", fontStyle: "italic", marginTop: 2 }}>
                        {perenualInfo.scientific_name}
                      </div>
                    </div>
                  )}

                  {perenualInfo.family && (
                    <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Family</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", marginTop: 2 }}>
                        {perenualInfo.family}
                      </div>
                    </div>
                  )}

                  {perenualInfo.plant_type && (
                    <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Plant Type</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", marginTop: 2 }}>
                        {perenualInfo.plant_type}
                      </div>
                    </div>
                  )}

                  {perenualInfo.growth_habit && (
                    <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Growth Habit</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", marginTop: 2 }}>
                        {perenualInfo.growth_habit}
                      </div>
                    </div>
                  )}

                  {perenualInfo.sunlight_requirement && (
                    <div style={{ background: "#FEF3C7", padding: 14, borderRadius: 12, border: "1px solid #FDE68A" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase" }}>Sunlight Requirements</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#B45309", marginTop: 2 }}>
                        ☀️ {perenualInfo.sunlight_requirement}
                      </div>
                    </div>
                  )}

                  {perenualInfo.water_requirement && (
                    <div style={{ background: "#E0F2FE", padding: 14, borderRadius: 12, border: "1px solid #BAE6FD" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0369A1", textTransform: "uppercase" }}>Water Requirements</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0284C7", marginTop: 2 }}>
                        💧 {perenualInfo.water_requirement}
                      </div>
                    </div>
                  )}

                  {perenualInfo.maintenance_level && (
                    <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Maintenance Level</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B", marginTop: 2 }}>
                        {perenualInfo.maintenance_level}
                      </div>
                    </div>
                  )}

                  {perenualInfo.soil_preference && (
                    <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Soil Preference</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginTop: 2 }}>
                        🌱 {perenualInfo.soil_preference}
                      </div>
                    </div>
                  )}
                </div>

                {/* Plant Description */}
                {perenualInfo.description && (
                  <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>Botanical Description</div>
                    <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                      {perenualInfo.description}
                    </p>
                  </div>
                )}

                {/* Reference Images Gallery */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>
                    Reference Plant Images
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                    {perenualInfo.reference_images && perenualInfo.reference_images.length > 0 ? (
                      perenualInfo.reference_images.map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt={`${perenualInfo.crop_name} reference ${idx + 1}`}
                          style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, border: "1px solid #E2E8F0" }}
                        />
                      ))
                    ) : (
                      <div style={{ background: "#F1F5F9", padding: 16, borderRadius: 10, textAlign: "center", color: "#64748B", fontSize: 12 }}>
                        📷 Local Reference Placeholder
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#64748B", background: "#F8FAFC", borderRadius: 12 }}>
                Loading Perenual botanical plant info...
              </div>
            )}
          </div>

          {/* 4. Daily Progress & Today's Recommendations */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>

            {/* Left: Today's Tasks Checklist */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={22} color="#10B981" /> Today's Action Checklist (Day {cropAge})
                  </h2>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                    Stage: {currentStage.stage_name}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", background: "#DCFCE7", padding: "4px 10px", borderRadius: 12 }}>
                  {Object.values(taskState).filter(Boolean).length} / {currentStage.daily_tasks?.length || 0} Done
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentStage.daily_tasks && currentStage.daily_tasks.map((taskText, idx) => {
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
                      <div style={{ fontSize: 14, color: isDone ? "#166534" : "#334155", textDecoration: isDone ? "line-through" : "none", fontWeight: isDone ? 500 : 600, lineHeight: 1.5 }}>
                        {taskText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Today's Weather & Irrigation Recommendation */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <CloudSun size={22} color="#0284C7" /> Today's Weather &amp; Field Advice
              </h2>

              <div style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", borderRadius: 14, padding: 18, color: "#FFF", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{currentTemp}°C</div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>{condition}</div>
                  </div>
                  <CloudSun size={44} style={{ opacity: 0.9 }} />
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: 12, paddingTop: 10, fontSize: 12 }}>
                  📍 {user?.district || "Vavuniya"} · Weather Advisory
                </div>
              </div>

              <div style={{ background: isRaining ? "#FFFBEB" : "#F0FDF4", borderLeft: isRaining ? "4px solid #F59E0B" : "4px solid #10B981", padding: 14, borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>
                  Irrigation Rule
                </div>
                <div style={{ fontSize: 13, color: "#475569", marginTop: 4, fontWeight: 600 }}>
                  {weatherAdvice}
                </div>
              </div>
            </div>

          </div>

          {/* 5. Future Stages Preview & Previous Stages Review */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Future Stages Preview */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={20} color="#9333EA" /> Upcoming Stages Preview
              </h3>

              {futureStages.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#64748B", background: "#F8FAFC", borderRadius: 12 }}>
                  🎉 Crop has reached the final harvest stage!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {futureStages.map((fst, idx) => (
                    <div key={idx} style={{ padding: 16, borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{fst.icon}</span> {fst.stage_name}
                        </div>
                        <span style={{ fontSize: 12, color: "#9333EA", fontWeight: 700, background: "#F3E8FF", padding: "2px 10px", borderRadius: 12 }}>
                          Day {fst.start_day}–{fst.end_day}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
                        Expected Activities: {fst.daily_tasks?.slice(0, 2).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Previous Stages Review */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={20} color="#16A34A" /> Completed Stages Review
              </h3>

              {completedStages.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#64748B", background: "#F8FAFC", borderRadius: 12 }}>
                  🌱 Currently in initial stage 1. No completed stages yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {completedStages.map((cst, idx) => (
                    <div key={idx} style={{ padding: 16, borderRadius: 12, background: "#F0FDF4", border: "1px solid #DCFCE7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{cst.icon}</span> {cst.stage_name}
                        </div>
                        <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                          Duration: Day {cst.start_day} to Day {cst.end_day}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#15803D", background: "#DCFCE7", padding: "4px 10px", borderRadius: 12 }}>
                        Completed ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>
      <Footer />
    </AuthGuard>
  );
}

export default function CropLifecyclePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600 }}>Loading Crop Growth Tracker...</div>
        </div>
      }
    >
      <CropLifecycleContent />
    </Suspense>
  );
}

