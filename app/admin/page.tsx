"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { ValamUser, CropGuide, CommunityPost } from "@/lib/types";
import { ShieldCheck, Plus, Trash2, BookOpen, MessageSquare, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<ValamUser | null>(null);
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // New Guide Form state
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [season, setSeason] = useState("Yala");
  const [waterReq, setWaterReq] = useState("");
  const [fertGuidance, setFertGuidance] = useState("");
  const [commonProblems, setCommonProblems] = useState("");
  const [basicSolutions, setBasicSolutions] = useState("");

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

  async function handleCreateGuide(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ValamAPI.createCropGuide({
        crop_name: cropName,
        variety,
        recommended_season: season,
        water_requirements: waterReq,
        fertilizer_guidance: fertGuidance,
        common_problems: commonProblems,
        basic_solutions: basicSolutions,
      });
      setShowAddGuide(false);
      setCropName("");
      setVariety("");
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to create crop guide");
    }
  }

  async function handleDeletePost(postId: number) {
    if (!confirm("Are you sure you want to delete this community post for moderation?")) return;
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
        <div style={{ padding: 60, textAlign: "center", color: "#666" }}>Loading admin panel...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar active="dashboard" />
      <section className="page-hero">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="crumb">System Administration / Moderation</div>
            <h1>Valam Platform Administration</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 600 }}>
              Basic management portal for crop knowledge guides, disease knowledge base, and community forum moderation.
            </p>
          </div>
          <button onClick={() => setShowAddGuide(true)} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} /> Add Crop Guide
          </button>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Add Guide Modal */}
          {showAddGuide && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ background: "#FFF", borderRadius: 16, padding: 28, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#1B4D3E" }}>Add New Crop Guide Knowledge</h2>
                <form onSubmit={handleCreateGuide}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Crop Name *</label>
                      <input type="text" required className="input" placeholder="e.g. Chili, Tomato" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={cropName} onChange={(e) => setCropName(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Variety</label>
                      <input type="text" className="input" placeholder="e.g. MICO-1" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={variety} onChange={(e) => setVariety(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Recommended Season</label>
                    <select className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={season} onChange={(e) => setSeason(e.target.value)}>
                      <option value="Yala">Yala Season</option>
                      <option value="Maha">Maha Season</option>
                      <option value="Yala & Maha">Yala & Maha</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Water Requirements</label>
                    <textarea rows={2} className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={waterReq} onChange={(e) => setWaterReq(e.target.value)} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Fertilizer Guidance</label>
                    <textarea rows={2} className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={fertGuidance} onChange={(e) => setFertGuidance(e.target.value)} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Common Problems</label>
                    <input type="text" className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={commonProblems} onChange={(e) => setCommonProblems(e.target.value)} />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Basic Solutions</label>
                    <input type="text" className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={basicSolutions} onChange={(e) => setBasicSolutions(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <button type="button" onClick={() => setShowAddGuide(false)} className="btn btn-outline" style={{ padding: "10px 18px" }}>Cancel</button>
                    <button type="submit" className="btn btn-sun" style={{ padding: "10px 24px" }}>Save Guide</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            
            {/* Knowledge Base Section */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={20} color="#16A34A" /> Active Crop Guides ({guides.length})
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {guides.map((g) => (
                  <div key={g.id} style={{ padding: 12, borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1E293B" }}>{g.crop_name}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>Season: {g.recommended_season} · {g.variety || "Local"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forum Moderation Section */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={20} color="#0284C7" /> Forum Posts Moderation ({posts.length})
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
