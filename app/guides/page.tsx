"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { CropGuide } from "@/lib/types";
import { BookOpen, Search, Droplets, FlaskConical, AlertCircle, CheckCircle } from "lucide-react";

export default function CropGuidesPage() {
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<CropGuide | null>(null);

  useEffect(() => {
    async function loadGuides() {
      try {
        setLoading(true);
        const res = await ValamAPI.getCropGuides({ crop_name: search, season });
        setGuides(res.items);
        if (res.items.length > 0 && !selectedGuide) {
          setSelectedGuide(res.items[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGuides();
  }, [search, season]);

  return (
    <>
      <Navbar active="guides" />
      <section className="page-hero">
        <div className="container">
          <div className="crumb">Farming Knowledge / Crop Guides & Calendar</div>
          <h1>Vavuniya Crop Calendar & Farming Guide</h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 600 }}>
            Localized cultivation guides for dry-zone farming in Vavuniya. Step-by-step guidance for Yala & Maha seasons.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">
          
          {/* Search Bar & Filters */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", border: "1px solid #E2E8F0" }}>
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, background: "#F8FAFC", padding: "8px 14px", borderRadius: 8, border: "1px solid #CBD5E1" }}>
              <Search size={18} color="#64748B" />
              <input
                type="text"
                placeholder="Search crop (e.g. Tomato, Chili, Paddy)..."
                style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 14 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select
              style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, background: "#FFF" }}
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="">All Seasons</option>
              <option value="Yala">Yala Season (May - Aug)</option>
              <option value="Maha">Maha Season (Oct - Mar)</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            
            {/* Left Column: Crop List */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 12 }}>Select Crop</h3>
              {loading ? (
                <div style={{ padding: 20, color: "#666" }}>Loading guides...</div>
              ) : guides.length === 0 ? (
                <div style={{ padding: 20, background: "#FFF", borderRadius: 12, color: "#64748B" }}>No crop guides found.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {guides.map((g) => {
                    const isSelected = selectedGuide?.id === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGuide(g)}
                        style={{
                          textAlign: "left",
                          padding: 16,
                          borderRadius: 12,
                          border: isSelected ? "2px solid #16A34A" : "1px solid #E2E8F0",
                          background: isSelected ? "#F0FDF4" : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#1E293B" }}>{g.crop_name}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                          {g.variety || "Standard Variety"} · {g.recommended_season || "Yala / Maha"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Detailed Guide View */}
            <div>
              {selectedGuide ? (
                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <span style={{ display: "inline-block", background: "#DCFCE7", color: "#166534", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                        Recommended Season: {selectedGuide.recommended_season}
                      </span>
                      <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                        {selectedGuide.crop_name} Guide
                      </h2>
                      {selectedGuide.variety && (
                        <div style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>Variety: {selectedGuide.variety}</div>
                      )}
                    </div>
                  </div>

                  {/* Growth Stage Calendar */}
                  {selectedGuide.growth_stages && selectedGuide.growth_stages.length > 0 && (
                    <div style={{ marginBottom: 28 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <BookOpen size={20} color="#16A34A" /> Cultivation Timeline & Guidance
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {selectedGuide.growth_stages.map((st, idx) => (
                          <div key={idx} style={{ padding: 14, borderRadius: 10, background: "#F8FAFC", borderLeft: "4px solid #16A34A" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14, color: "#1E293B", marginBottom: 4 }}>
                              <span>{st.week}</span>
                              <span style={{ color: "#16A34A" }}>{st.stage}</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#475569" }}>{st.advice}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    {selectedGuide.water_requirements && (
                      <div style={{ padding: 16, borderRadius: 12, background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0369A1", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                          <Droplets size={18} /> Water Requirements
                        </div>
                        <div style={{ fontSize: 13, color: "#334155" }}>{selectedGuide.water_requirements}</div>
                      </div>
                    )}

                    {selectedGuide.fertilizer_guidance && (
                      <div style={{ padding: 16, borderRadius: 12, background: "#FEFCE8", border: "1px solid #FEF08A" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#A16207", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                          <FlaskConical size={18} /> Fertilizer Guidance
                        </div>
                        <div style={{ fontSize: 13, color: "#334155" }}>{selectedGuide.fertilizer_guidance}</div>
                      </div>
                    )}
                  </div>

                  {/* Common Problems & Solutions */}
                  {selectedGuide.common_problems && (
                    <div style={{ background: "#FFF1F2", padding: 18, borderRadius: 12, border: "1px solid #FECDD3" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#BE123C", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        <AlertCircle size={18} /> Common Problems & Solutions
                      </div>
                      <div style={{ fontSize: 13, color: "#881337", marginBottom: 8 }}>
                        <strong>Issues:</strong> {selectedGuide.common_problems}
                      </div>
                      {selectedGuide.basic_solutions && (
                        <div style={{ fontSize: 13, color: "#15803D", background: "#FFF", padding: 10, borderRadius: 8, border: "1px solid #DCFCE7", display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                          <div><strong>Solutions:</strong> {selectedGuide.basic_solutions}</div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ padding: 40, background: "#FFF", borderRadius: 16, textAlign: "center", color: "#64748B" }}>
                  Select a crop from the left to view detailed guidance.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
