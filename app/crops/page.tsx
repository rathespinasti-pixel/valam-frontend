"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { Crop } from "@/lib/types";
import { Sprout, Plus, Calendar, MapPin, Trash2, CheckCircle2 } from "lucide-react";

const STAGES = [
  "Nursery & Seedling",
  "Transplanting stage",
  "Vegetative stage",
  "Flowering & Fruit set",
  "Harvesting stage",
  "Post-harvest",
];

export default function CropsPage() {
  const router = useRouter();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [cropName, setCropName] = useState("Tomato");
  const [variety, setVariety] = useState("Thilina (KC1)");
  const [plantingDate, setPlantingDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [areaSize, setAreaSize] = useState("0.5 Acres");
  const [currentStage, setCurrentStage] = useState("Vegetative stage");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchCrops() {
    try {
      setLoading(true);
      const res = await ValamAPI.getCrops();
      setCrops(res.items);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchCrops();
  }, [router]);

  async function handleAddCrop(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await ValamAPI.addCrop({
        crop_name: cropName,
        variety,
        planting_date: plantingDate,
        area_size: areaSize,
        current_stage: currentStage,
        notes,
      });
      setShowAddModal(false);
      setNotes("");
      fetchCrops();
    } catch (err: any) {
      setError(err.message || "Failed to add crop");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStage(cropId: number, newStage: string) {
    try {
      await ValamAPI.updateCrop(cropId, { current_stage: newStage });
      fetchCrops();
    } catch (err) {
      alert("Failed to update crop stage");
    }
  }

  async function handleDelete(cropId: number) {
    if (!confirm("Are you sure you want to remove this crop cultivation record?")) return;
    try {
      await ValamAPI.deleteCrop(cropId);
      fetchCrops();
    } catch (err) {
      alert("Failed to delete crop");
    }
  }

  return (
    <>
      <Navbar active="crops" />
      <section className="page-hero">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="crumb">Farmer Portal / Crop Management</div>
            <h1>Crop Cultivation Tracker</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 600 }}>
              Track planting dates, growth stages, varieties, and area sizes for all your fields in Vavuniya.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={20} /> Add New Crop
          </button>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Add Crop Modal */}
          {showAddModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ background: "#FFF", borderRadius: 16, padding: 32, maxWidth: 540, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#1B4D3E" }}>Add New Cultivation Record</h2>
                
                {error && <div style={{ padding: 10, borderRadius: 8, background: "#FFEBEE", color: "#C62828", marginBottom: 16, fontSize: 14 }}>{error}</div>}

                <form onSubmit={handleAddCrop}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Crop Name *</label>
                      <select className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={cropName} onChange={(e) => setCropName(e.target.value)}>
                        <option value="Tomato">Tomato</option>
                        <option value="Chili">Chili</option>
                        <option value="Red Onion">Red Onion</option>
                        <option value="Paddy">Paddy</option>
                        <option value="Brinjal">Brinjal</option>
                        <option value="Okra">Okra</option>
                        <option value="Maize">Maize</option>
                        <option value="Bitter Gourd">Bitter Gourd</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Variety</label>
                      <input type="text" className="input" placeholder="e.g. Thilina, MICO-1" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={variety} onChange={(e) => setVariety(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Planting Date *</label>
                      <input type="date" required className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Area Size</label>
                      <input type="text" className="input" placeholder="e.g. 0.5 Acres / 10 Perches" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={areaSize} onChange={(e) => setAreaSize(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Current Stage</label>
                    <select className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={currentStage} onChange={(e) => setCurrentStage(e.target.value)}>
                      {STAGES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Notes / Field Location</label>
                    <textarea className="input" rows={3} placeholder="Field details, seed source, fertilizer notes..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ padding: "10px 18px" }}>Cancel</button>
                    <button type="submit" disabled={saving} className="btn btn-sun" style={{ padding: "10px 24px" }}>
                      {saving ? "Saving..." : "Save Crop Record"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Crop List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Loading crops...</div>
          ) : crops.length === 0 ? (
            <div style={{ background: "#FFF", borderRadius: 16, padding: 48, textAlign: "center", border: "1px solid #E2E8F0" }}>
              <Sprout size={48} color="#16A34A" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>No Active Crops Tracked</h3>
              <p style={{ color: "#64748B", maxWidth: 460, margin: "0 auto 20px" }}>
                Add your current cultivations to receive customized weekly stage guidance and weather alerts.
              </p>
              <button onClick={() => setShowAddModal(true)} className="btn btn-sun">
                + Add Your First Crop
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {crops.map((crop) => (
                <div key={crop.id} style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: 0 }}>{crop.crop_name}</h2>
                        {crop.variety && (
                          <span style={{ background: "#F1F5F9", color: "#475569", padding: "2px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                            Variety: {crop.variety}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 14, color: "#64748B" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={15} /> Planted: {crop.planting_date}
                        </span>
                        {crop.area_size && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPin size={15} /> Area: {crop.area_size}
                          </span>
                        )}
                      </div>
                    </div>

                    <button onClick={() => handleDelete(crop.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6 }} title="Delete Crop">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Growth Stage Progression Stepper */}
                  <div style={{ marginTop: 20, marginBottom: 20, background: "#F8FAFC", padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 12 }}>
                      CULTIVATION STAGE PROGRESSION
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                      {STAGES.map((st, idx) => {
                        const isCurrent = crop.current_stage === st;
                        return (
                          <button
                            key={st}
                            onClick={() => handleUpdateStage(crop.id, st)}
                            style={{
                              padding: "10px 8px",
                              borderRadius: 8,
                              border: isCurrent ? "2px solid #16A34A" : "1px solid #CBD5E1",
                              background: isCurrent ? "#DCFCE7" : "#FFFFFF",
                              color: isCurrent ? "#166534" : "#475569",
                              fontWeight: isCurrent ? 700 : 500,
                              fontSize: 12,
                              textAlign: "center",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {isCurrent && <CheckCircle2 size={14} color="#16A34A" />}
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {crop.notes && (
                    <div style={{ fontSize: 13, color: "#475569", background: "#FFFBEB", padding: 12, borderRadius: 8, borderLeft: "3px solid #F59E0B" }}>
                      <strong>Notes:</strong> {crop.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
      <Footer />
    </>
  );
}
