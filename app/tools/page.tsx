"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { ToolListing } from "@/lib/types";
import { Wrench, Plus, Search, Phone, MapPin, Tag, CheckCircle } from "lucide-react";

export default function ToolsPage() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolListing[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // New Listing Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [toolName, setToolName] = useState("Water Pump 2-inch Diesel");
  const [description, setDescription] = useState("");
  const [toolCategory, setToolCategory] = useState("Irrigation Pump");
  const [rentalPrice, setRentalPrice] = useState<number | "">(1500);
  const [location, setLocation] = useState("Vavuniya Town");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchTools() {
    try {
      setLoading(true);
      const res = await ValamAPI.getTools({ category, search });
      setTools(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTools();
  }, [category, search]);

  async function handleCreateTool(e: React.FormEvent) {
    e.preventDefault();
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      await ValamAPI.createToolListing({
        tool_name: toolName,
        description,
        category: toolCategory,
        rental_price_per_day: typeof rentalPrice === "number" ? rentalPrice : 0,
        location,
        contact_phone: contactPhone || "0771234567",
      });
      setShowAddModal(false);
      setDescription("");
      fetchTools();
    } catch (err: any) {
      alert(err.message || "Failed to list equipment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar active="tools" />
      <section className="page-hero">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="crumb">Shared Resources / Equipment Lending</div>
            <h1>Farming Equipment & Tool Lending</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 600 }}>
              Share and rent agricultural machinery, water pumps, battery sprayers, and tractors in Vavuniya.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={20} /> List Your Tool
          </button>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* Add Listing Modal */}
          {showAddModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ background: "#FFF", borderRadius: 16, padding: 28, maxWidth: 540, width: "100%" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#1B4D3E" }}>List Agricultural Tool / Equipment</h2>
                <form onSubmit={handleCreateTool}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Equipment Name *</label>
                    <input type="text" required className="input" placeholder="e.g. Water Pump 2-inch, Battery Sprayer 16L" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={toolName} onChange={(e) => setToolName(e.target.value)} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Category</label>
                      <select className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={toolCategory} onChange={(e) => setToolCategory(e.target.value)}>
                        <option value="Irrigation Pump">Irrigation Pump</option>
                        <option value="Sprayer">Sprayer & Applicator</option>
                        <option value="Tractor & Tiller">Tractor & Tiller</option>
                        <option value="Harvesting Tool">Harvesting Tool</option>
                        <option value="General Equipment">General Equipment</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Rental Price (Rs./Day) *</label>
                      <input type="number" required className="input" placeholder="1500" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={rentalPrice} onChange={(e) => setRentalPrice(e.target.value ? parseFloat(e.target.value) : "")} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Location / Area</label>
                      <input type="text" className="input" placeholder="e.g. Vavuniya South, Omanthai" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Contact Phone *</label>
                      <input type="tel" required className="input" placeholder="0771234567" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Tool Condition & Notes</label>
                    <textarea rows={3} className="input" placeholder="Includes 50m hose, battery charger, delivery terms..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ padding: "10px 18px" }}>Cancel</button>
                    <button type="submit" disabled={submitting} className="btn btn-sun" style={{ padding: "10px 24px" }}>
                      {submitting ? "Listing..." : "Post Tool Listing"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search & Category Filters */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", border: "1px solid #E2E8F0" }}>
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, background: "#F8FAFC", padding: "8px 14px", borderRadius: 8, border: "1px solid #CBD5E1" }}>
              <Search size={18} color="#64748B" />
              <input
                type="text"
                placeholder="Search equipment (e.g. Pump, Sprayer, Tractor)..."
                style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 14 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select
              style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, background: "#FFF" }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Irrigation Pump">Irrigation Pump</option>
              <option value="Sprayer">Sprayer</option>
              <option value="Tractor & Tiller">Tractor & Tiller</option>
            </select>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading equipment listings...</div>
          ) : tools.length === 0 ? (
            <div style={{ padding: 40, background: "#FFF", borderRadius: 16, textAlign: "center", color: "#64748B" }}>
              <Wrench size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
              <h3>No Tool Listings Found</h3>
              <p style={{ marginTop: 4 }}>Be the first farmer to list your equipment for rental in Vavuniya.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {tools.map((tool) => (
                <div key={tool.id} style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {tool.category}
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#166534" }}>
                        Rs. {tool.rental_price_per_day}/day
                      </span>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>{tool.tool_name}</h3>
                    {tool.description && <p style={{ fontSize: 13, color: "#64748B", marginBottom: 14, lineHeight: 1.5 }}>{tool.description}</p>}

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#475569", marginBottom: 16 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={15} color="#16A34A" /> Location: <strong>{tool.location}</strong>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Tag size={15} color="#16A34A" /> Owner: <strong>{tool.owner_name}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14, marginTop: 10 }}>
                    <a
                      href={`tel:${tool.contact_phone}`}
                      className="btn btn-sun"
                      style={{ width: "100%", textDecoration: "none", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 12 }}
                    >
                      <Phone size={18} /> Contact Owner ({tool.contact_phone})
                    </a>
                  </div>
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
