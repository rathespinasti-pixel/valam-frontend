"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { ValamUser, CropGuide, CropStageAdvice, CommunityPost } from "@/lib/types";
import { getDefaultStagesForCrop } from "@/lib/lifecycle";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Plus, Trash2, BookOpen, MessageSquare, Edit, Layers, Save, X } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<ValamUser | null>(null);
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Adding / Editing Crop Guide Lifecycle
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<number | null>(null);
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [season, setSeason] = useState("Yala & Maha");
  const [waterReq, setWaterReq] = useState("");
  const [fertGuidance, setFertGuidance] = useState("");
  const [commonProblems, setCommonProblems] = useState("");
  const [basicSolutions, setBasicSolutions] = useState("");
  const [stages, setStages] = useState<CropStageAdvice[]>([]);

  async function loadAdminData() {
    try {
      setLoading(true);
      const u = await ValamAPI.me();
      setUser(u);

      const [guidesRes, postsRes] = await Promise.all([
        ValamAPI.getCropGuides(),
        ValamAPI.getCommunityPosts(),
      ]);

      setGuides(guidesRes.items);
      setPosts(postsRes.items);
    } catch (err) {
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
    loadAdminData();
  }, [router]);

  function openCreateForm() {
    setEditingGuideId(null);
    setCropName("Tomato");
    setVariety("Thilina / KC1");
    setSeason("Yala & Maha");
    setWaterReq("3.5 - 4.5 L/m² daily");
    setFertGuidance("Basal compost + Top dress Urea/MOP");
    setCommonProblems("Bacterial Wilt, Early Blight");
    setBasicSolutions("Resistant varieties, neem oil spray");
    setStages(getDefaultStagesForCrop("Tomato"));
    setShowAddGuide(true);
  }

  function openEditForm(g: CropGuide) {
    setEditingGuideId(g.id);
    setCropName(g.crop_name);
    setVariety(g.variety || "");
    setSeason(g.recommended_season || "Yala & Maha");
    setWaterReq(g.water_requirements || "");
    setFertGuidance(g.fertilizer_guidance || "");
    setCommonProblems(g.common_problems || "");
    setBasicSolutions(g.basic_solutions || "");

    const existingStages = g.growth_stages && g.growth_stages.length > 0
      ? g.growth_stages
      : getDefaultStagesForCrop(g.crop_name);
    setStages(existingStages);
    setShowAddGuide(true);
  }

  function handleStageChange(index: number, field: keyof CropStageAdvice, value: any) {
    setStages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleTaskTextChange(stageIndex: number, taskText: string) {
    const taskList = taskText.split("\n").filter((t) => t.trim().length > 0);
    handleStageChange(stageIndex, "daily_tasks", taskList);
  }

  async function handleSaveGuide(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: Partial<CropGuide> = {
        crop_name: cropName,
        variety,
        recommended_season: season,
        water_requirements: waterReq,
        fertilizer_guidance: fertGuidance,
        common_problems: commonProblems,
        basic_solutions: basicSolutions,
        growth_stages: stages,
      };

      if (editingGuideId) {
        await ValamAPI.updateCropGuide(editingGuideId, payload);
      } else {
        await ValamAPI.createCropGuide(payload);
      }

      setShowAddGuide(false);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to save crop guide");
    }
  }

  async function handleDeleteGuide(guideId: number) {
    if (!confirm("Are you sure you want to delete this crop guide configuration?")) return;
    try {
      await ValamAPI.deleteCropGuide(guideId);
      loadAdminData();
    } catch (err: any) {
      alert("Failed to delete crop guide");
    }
  }

  async function handleDeletePost(postId: number) {
    if (!confirm(t("deletePostConfirm"))) return;
    try {
      await ValamAPI.deleteCommunityPost(postId);
      loadAdminData();
    } catch (err: any) {
      alert("Failed to delete post");
    }
  }

  if (loading) {
    return (
      <>
        <Navbar active="dashboard" />
        <div style={{ padding: 60, textAlign: "center", color: "#666" }}>Loading Admin Portal...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar active="dashboard" pageTitle={t("adminPortalTitle")} />
      <section className="page-hero">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="crumb">Valam / Admin Portal</div>
            <h1>Crop Lifecycle &amp; Admin Config</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 640 }}>
              Manage crop guides, configure 5-stage lifecycles, water &amp; fertilizer guidance, and moderate forum posts.
            </p>
          </div>
          <button onClick={openCreateForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} /> Add Crop Lifecycle Guide
          </button>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Add / Edit Guide Modal */}
          {showAddGuide && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
              <div style={{ background: "#FFF", borderRadius: 20, padding: 32, maxWidth: 840, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                    {editingGuideId ? "Edit Crop Lifecycle Config" : "Create New Crop Lifecycle Config"}
                  </h2>
                  <button onClick={() => setShowAddGuide(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveGuide}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Crop Name *</label>
                      <input type="text" required className="input" placeholder="e.g. Tomato, Okra, Chili" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={cropName} onChange={(e) => setCropName(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Variety</label>
                      <input type="text" className="input" placeholder="e.g. Thilina / KC1" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={variety} onChange={(e) => setVariety(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Season</label>
                      <select className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={season} onChange={(e) => setSeason(e.target.value)}>
                        <option value="Yala & Maha">Yala &amp; Maha</option>
                        <option value="Yala">Yala Season</option>
                        <option value="Maha">Maha Season</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Water Requirements Overview</label>
                      <input type="text" className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={waterReq} onChange={(e) => setWaterReq(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Fertilizer Guidance Overview</label>
                      <input type="text" className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={fertGuidance} onChange={(e) => setFertGuidance(e.target.value)} />
                    </div>
                  </div>

                  {/* 5 Growth Stages Configuration List */}
                  <div style={{ marginTop: 24, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Layers size={18} color="#10B981" /> 5-Stage Growth Lifecycle Config ({stages.length} Stages)
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {stages.map((st, idx) => (
                        <div key={idx} style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0" }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "#166534", marginBottom: 10 }}>
                            Stage {idx + 1}: {st.stage_name || `Stage ${idx + 1}`}
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr", gap: 12, marginBottom: 10 }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Icon Emoji</label>
                              <input type="text" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.icon || "🌱"} onChange={(e) => handleStageChange(idx, "icon", e.target.value)} />
                            </div>

                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Stage Name</label>
                              <input type="text" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.stage_name || ""} onChange={(e) => handleStageChange(idx, "stage_name", e.target.value)} />
                            </div>

                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Start Day</label>
                              <input type="number" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.start_day || 1} onChange={(e) => handleStageChange(idx, "start_day", parseInt(e.target.value, 10))} />
                            </div>

                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>End Day</label>
                              <input type="number" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.end_day || 20} onChange={(e) => handleStageChange(idx, "end_day", parseInt(e.target.value, 10))} />
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Stage Description</label>
                              <input type="text" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.description || ""} onChange={(e) => handleStageChange(idx, "description", e.target.value)} />
                            </div>

                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Expected Appearance</label>
                              <input type="text" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.expected_appearance || ""} onChange={(e) => handleStageChange(idx, "expected_appearance", e.target.value)} />
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Water Requirement</label>
                              <input type="text" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.water_requirement || ""} onChange={(e) => handleStageChange(idx, "water_requirement", e.target.value)} />
                            </div>

                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Fertilizer Recommendation</label>
                              <input type="text" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.fertilizer_recommendation || ""} onChange={(e) => handleStageChange(idx, "fertilizer_recommendation", e.target.value)} />
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Stage Image URL</label>
                              <input type="text" className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={st.image_url || ""} onChange={(e) => handleStageChange(idx, "image_url", e.target.value)} />
                            </div>

                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Daily Tasks (one task per line)</label>
                              <textarea rows={2} className="input" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} value={(st.daily_tasks || []).join("\n")} onChange={(e) => handleTaskTextChange(idx, e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <button type="button" onClick={() => setShowAddGuide(false)} className="btn btn-outline" style={{ padding: "10px 18px" }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-sun" style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Save size={18} /> Save Crop Config
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
            
            {/* Knowledge Base & Configured Crop Guides Section */}
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <BookOpen size={20} color="#16A34A" /> Database Crop Lifecycle Guides ({guides.length})
                </h2>
                <button onClick={openCreateForm} style={{ background: "none", border: "none", color: "#10B981", fontWeight: 700, cursor: "pointer" }}>
                  + New Config
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {guides.map((g) => (
                  <div key={g.id} style={{ padding: 16, borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#1E293B" }}>
                        {g.crop_name} <span style={{ fontSize: 13, fontWeight: 500, color: "#64748B" }}>({g.variety || "Local"})</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                        Season: {g.recommended_season} · {g.growth_stages ? g.growth_stages.length : 0} Lifecycle Stages Configured
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEditForm(g)} style={{ background: "#DCFCE7", border: "1px solid #A7F3D0", color: "#15803D", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteGuide(g.id)} style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forum Moderation Section */}
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={20} color="#0284C7" /> {t("forumModeration")} ({posts.length})
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {posts.map((post) => (
                  <div key={post.id} style={{ padding: 12, borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>{post.title}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>By {post.author_name} · {post.category}</div>
                    </div>

                    <button onClick={() => handleDeletePost(post.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
