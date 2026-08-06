"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { WeatherAdvisoryResponse } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { CloudSun, Thermometer, Droplets, Wind, AlertTriangle, CheckCircle2 } from "lucide-react";

function getLocalizedWeatherCondition(condition: string, lang: "en" | "ta" | "si" = "en"): string {
  if (!condition) return "";
  const c = condition.toLowerCase();
  if (lang === "ta") {
    if (c.includes("rain") || c.includes("shower")) return "மழை பெய்யும் வாய்ப்பு";
    if (c.includes("cloud") || c.includes("overcast")) return "மேகமூட்டம்";
    if (c.includes("sun") || c.includes("clear")) return "தெளிவான வெயில்";
    if (c.includes("thunder") || c.includes("storm")) return "இடி மின்னலுடன் கூடிய மழை";
    return "மிதமான தட்பவெப்பநிலை";
  }
  if (lang === "si") {
    if (c.includes("rain") || c.includes("shower")) return "වැසි සහිත කාලගුණය";
    if (c.includes("cloud") || c.includes("overcast")) return "වලාකුළු බරිත කාලගුණය";
    if (c.includes("sun") || c.includes("clear")) return "පැහැදිලි අව් රශ්මිය";
    if (c.includes("thunder") || c.includes("storm")) return "ගගුරුම් සහිත වැසි";
    return "සාමාන්‍ය කාලගුණය";
  }
  return condition;
}

export default function WeatherPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<WeatherAdvisoryResponse | null>(null);
  const [location, setLocation] = useState("Vavuniya,LK");
  const [loading, setLoading] = useState(true);

  async function loadWeather(loc: string) {
    try {
      setLoading(true);
      const res = await ValamAPI.getWeatherAdvisory(loc);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather(location);
  }, []);

  return (
    <>
      <Navbar active="weather" pageTitle={t("weatherAdvisory")} />
      
      <section className="page-hero">
        <div className="container">
          <div className="crumb">Valam / {t("weatherAdvisory")}</div>
          <h1>{t("weatherAdvisory")}</h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 600 }}>
            {t("weatherHeroSubtitle")}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Location Selector */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 24, display: "flex", gap: 16, alignItems: "center", border: "1px solid #E2E8F0" }}>
            <span style={{ fontWeight: 700, color: "#1E293B" }}>{t("selectLocation")}:</span>
            <select
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, background: "#FFF" }}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                loadWeather(e.target.value);
              }}
            >
              <option value="Vavuniya,LK">Vavuniya Town</option>
              <option value="Nedunkeni,LK">Vavuniya North (Nedunkeni)</option>
              <option value="Cheddikulam,LK">Cheddikulam</option>
              <option value="Omanthai,LK">Omanthai</option>
            </select>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#666" }}>{t("fetchingWeather")}</div>
          ) : !data ? (
            <div style={{ padding: 40, textAlign: "center", color: "#666" }}>{t("couldNotLoadWeather")}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Current Weather Card */}
              <div style={{ background: "linear-gradient(135deg, #103B2B 0%, #1B4D3E 100%)", borderRadius: 20, padding: 28, color: "#FFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", color: "#A7F3D0", fontWeight: 700 }}>
                      {t("currentCondition")}
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 800, margin: "4px 0", color: "#FFF" }}>{data.location}</h2>
                    <div style={{ fontSize: 18, color: "#E8F5E9" }}>
                      {getLocalizedWeatherCondition(data.current?.condition || "Partly Cloudy", language)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", padding: "12px 20px", borderRadius: 12 }}>
                      <Thermometer size={28} color="#FFB74D" />
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{t("currentTemp")}</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{data.current?.temperature_c || 28}°C</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", padding: "12px 20px", borderRadius: 12 }}>
                      <Droplets size={28} color="#64B5F6" />
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{t("humidity")}</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{data.current?.humidity_percent || 70}%</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", padding: "12px 20px", borderRadius: 12 }}>
                      <Wind size={28} color="#81C784" />
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{t("windSpeed")}</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{data.current?.wind_kmh || 12} km/h</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Agro Advisories Grid */}
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", marginBottom: 16 }}>
                  {t("actionableFarmingAdvice")}
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  {data.advisories.map((adv, i) => {
                    const isWarning = adv.severity === "warning";
                    return (
                      <div
                        key={i}
                        style={{
                          background: "#FFFFFF",
                          borderRadius: 16,
                          padding: 20,
                          border: "1px solid #E2E8F0",
                          borderTop: isWarning ? "4px solid #F59E0B" : "4px solid #16A34A",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          {isWarning ? <AlertTriangle size={20} color="#D97706" /> : <CheckCircle2 size={20} color="#16A34A" />}
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: isWarning ? "#D97706" : "#16A34A" }}>
                            {adv.category}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>{adv.title}</h3>
                        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: 0 }}>{adv.advice}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5-Day Forecast */}
              {data.forecast?.days && data.forecast.days.length > 0 && (
                <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 16 }}>{t("fiveDayForecast")}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                    {data.forecast.days.map((day, idx) => (
                      <div key={idx} style={{ padding: 14, borderRadius: 12, background: "#F8FAFC", textAlign: "center", border: "1px solid #F1F5F9" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Day {day.day}</div>
                        <CloudSun size={24} color="#0284C7" style={{ margin: "8px 0" }} />
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{day.temperature_c}°C</div>
                        <div style={{ fontSize: 12, color: "#475569" }}>{day.condition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </section>
      <Footer />
    </>
  );
}
