"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { DiseaseDiagnosis } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { Stethoscope, Upload, ShieldAlert, Sparkles, History, CheckCircle, Image as ImageIcon } from "lucide-react";

export default function DiagnosisPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [cropName, setCropName] = useState("Tomato");
  const [symptoms, setSymptoms] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [history, setHistory] = useState<DiseaseDiagnosis[]>([]);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      const items = await ValamAPI.getDiagnosisHistory();
      setHistory(items);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (ValamAPI.isLoggedIn()) {
      loadHistory();
    }
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFilePreview(result);
        setImageUrl(result);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }

    // MANDATORY REQUIREMENT: Image upload must be present
    if (!imageUrl.trim() && !filePreview) {
      setError(t("selectImageFirstError"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await ValamAPI.analyzeDisease({
        crop_name: cropName,
        symptoms: symptoms.trim() || "Observed leaf/stem abnormality from uploaded image.",
        image_url: imageUrl.trim() || filePreview || undefined,
      });
      setCurrentDiagnosis(result);
      loadHistory();
    } catch (err: any) {
      setError(err.message || "Failed to process diagnosis request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <Navbar active="diagnosis" pageTitle={t("plantDiagnosis")} />
      <section className="page-hero">
        <div className="container">
          <div className="crumb">AI Diagnostics / Pest &amp; Disease Identifier</div>
          <h1>{t("pestDetectionTitle")}</h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 600 }}>
            Upload a photo of diseased leaves or pests to receive instant AI disease detection &amp; treatment advice.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">
          
          {/* Advisory Notice */}
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: 16, marginBottom: 28, display: "flex", gap: 12, alignItems: "center" }}>
            <ShieldAlert size={24} color="#2563EB" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: "#1E40AF" }}>
              <strong>Notice:</strong> This AI diagnosis provides decision support guidance. For severe crop epidemics, please consult your local ASC extension officer.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            
            {/* Left Column: Form Input */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1B4D3E", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Stethoscope size={22} /> Upload Pest Photo
              </h2>

              {error && <div style={{ padding: 12, borderRadius: 8, background: "#FFEBEE", color: "#C62828", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Target Crop *</label>
                  <select className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={cropName} onChange={(e) => setCropName(e.target.value)}>
                    <option value="Tomato">Tomato</option>
                    <option value="Chili">Chili</option>
                    <option value="Red Onion">Red Onion</option>
                    <option value="Paddy">Paddy</option>
                    <option value="Brinjal">Brinjal</option>
                    <option value="Okra">Okra</option>
                    <option value="Maize">Maize</option>
                    <option value="Other Crop">Other Crop</option>
                  </select>
                </div>

                {/* MANDATORY: Pest Image Upload */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 14, marginBottom: 6, color: "#1B4D3E" }}>
                    {t("uploadImageRequired")}
                  </label>
                  <div
                    style={{
                      border: "2px dashed #10B981",
                      borderRadius: 12,
                      padding: 20,
                      textAlign: "center",
                      background: "#F0FDF4",
                      cursor: "pointer",
                      marginBottom: 10,
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="fileUpload"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="fileUpload" style={{ cursor: "pointer", display: "block" }}>
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Uploaded crop preview"
                          style={{ maxHeight: 160, margin: "0 auto", borderRadius: 8, objectFit: "cover" }}
                        />
                      ) : (
                        <div>
                          <Upload size={32} color="#059669" style={{ marginBottom: 8 }} />
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#065F46" }}>
                            Click to select or capture crop photo
                          </div>
                          <div style={{ fontSize: 12, color: "#6EE7B7", marginTop: 4 }}>
                            PNG, JPG, JPEG up to 10MB
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <ImageIcon size={16} color="#64748B" />
                    <input
                      type="url"
                      className="input"
                      placeholder="Or paste image URL (https://...)"
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #CCC", fontSize: 13 }}
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (e.target.value) setFilePreview(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* OPTIONAL: Description / Text Field */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#64748B" }}>
                    {t("descriptionOptional")}
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    placeholder="e.g. Leaf yellowing with black spots visible on lower stems..."
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-sun"
                  style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 700, borderRadius: 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
                >
                  <Sparkles size={20} />
                  {loading ? "Analyzing Photo..." : t("submitDiagnosis")}
                </button>
              </form>
            </div>

            {/* Right Column: Diagnosis Result */}
            <div>
              {currentDiagnosis ? (
                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 28, border: "2px solid #16A34A", boxShadow: "0 4px 16px rgba(22,163,74,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Sparkles color="#16A34A" size={24} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#166534", margin: 0 }}>
                      AI Diagnosis Result — {currentDiagnosis.crop_name}
                    </h2>
                  </div>

                  {currentDiagnosis.image_url && (
                    <img
                      src={currentDiagnosis.image_url}
                      alt="Crop symptom"
                      style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 16 }}
                    />
                  )}

                  <div style={{ marginBottom: 20, whiteSpace: "pre-line", fontSize: 14, color: "#334155", lineHeight: 1.6, background: "#F8FAFC", padding: 16, borderRadius: 10 }}>
                    {currentDiagnosis.diagnosis_result}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle size={18} color="#16A34A" /> Recommended Actions
                    </h3>
                    <div style={{ fontSize: 14, color: "#475569", whiteSpace: "pre-line", background: "#F0FDF4", padding: 14, borderRadius: 8, borderLeft: "4px solid #16A34A" }}>
                      {currentDiagnosis.recommendations}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", borderTop: "1px solid #E2E8F0", paddingTop: 12 }}>
                    ⚠️ {currentDiagnosis.disclaimer}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 40, border: "1px solid #E2E8F0", textAlign: "center", color: "#64748B" }}>
                  <Stethoscope size={44} color="#94A3B8" style={{ marginBottom: 12 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>No Diagnosis Generated Yet</h3>
                  <p style={{ fontSize: 14, maxWidth: 340, margin: "0 auto" }}>Upload a crop photo on the left to get instant AI pest &amp; disease diagnosis.</p>
                </div>
              )}

              {/* History Preview */}
              {history.length > 0 && (
                <div style={{ marginTop: 24, background: "#FFFFFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <History size={18} /> Diagnosis History ({history.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {history.slice(0, 3).map((item) => (
                      <div key={item.id} onClick={() => setCurrentDiagnosis(item)} style={{ padding: 10, borderRadius: 8, background: "#F8FAFC", cursor: "pointer", border: "1px solid #E2E8F0" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>{item.crop_name}</div>
                        <div style={{ fontSize: 12, color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.symptoms}</div>
                      </div>
                    ))}
                  </div>
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
