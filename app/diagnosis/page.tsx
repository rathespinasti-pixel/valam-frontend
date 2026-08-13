"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { DiseaseDiagnosis } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { Stethoscope, Upload, ShieldAlert, Sparkles, History, Image as ImageIcon, AlertCircle } from "lucide-react";

import { diagnosisSchema, getFieldErrors } from "@/lib/validations";

export default function DiagnosisPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [cropName, setCropName] = useState("");
  const [partAffected, setPartAffected] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [history, setHistory] = useState<DiseaseDiagnosis[]>([]);

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
    setFormErrors({});
    setError("");

    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }

    const validationResult = diagnosisSchema.safeParse({
      crop_name: cropName,
      plant_part: partAffected,
      symptoms: symptoms,
      image_url: imageUrl || filePreview || undefined,
    });

    if (!validationResult.success) {
      const errors = getFieldErrors(validationResult);
      setFormErrors(errors);
      return;
    }

    if (!imageUrl.trim() && !filePreview) {
      setError(t("selectImageFirstError") || "Please upload or provide a crop photo for diagnosis");
      return;
    }

    setLoading(true);

    try {
      const localizedPart = partAffected === "Leaf" ? t("leafPart") : partAffected === "Stem" ? t("stemPart") : t("fruitPart") || partAffected;
      const result = await ValamAPI.analyzeDisease({
        crop_name: `${cropName} (${localizedPart})`,
        symptoms: symptoms.trim() || `Observed abnormality on ${localizedPart}`,
        image_url: imageUrl.trim() || filePreview || undefined,
        language: language,
      });
      setCurrentDiagnosis(result);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process diagnosis request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <Navbar active="diagnosis" pageTitle={t("plantDiagnosis")} />
      <section className="page-hero">
        <div className="container">
          <div className="crumb">Valam / {t("plantDiagnosis")}</div>
          <h1>{t("pestDetectionTitle")}</h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 640 }}>
            {t("diagnosisHeroSubtitle")}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">
          
          {/* Advisory Notice */}
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: 16, marginBottom: 28, display: "flex", gap: 12, alignItems: "center" }}>
            <ShieldAlert size={24} color="#2563EB" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: "#1E40AF" }}>
              {t("diagnosisNotice")}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            
            {/* Left Column: Form Input */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1B4D3E", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Stethoscope size={22} /> {t("uploadImageHeader")}
              </h2>

              {error && <div style={{ padding: 12, borderRadius: 8, background: "#FFEBEE", color: "#C62828", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("targetCropLabel")} *</label>
                    <select
                      className={`input ${formErrors.crop_name ? "input-invalid" : ""}`}
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                      value={cropName}
                      onChange={(e) => {
                        setCropName(e.target.value);
                        if (formErrors.crop_name) setFormErrors((prev) => ({ ...prev, crop_name: "" }));
                      }}
                    >
                      <option value="">-- Select Crop --</option>
                      <option value="Tomato">Tomato ({language === "ta" ? "தக்காளி" : language === "si" ? "තක්කාලි" : "Tomato"})</option>
                      <option value="Chilli">Chilli ({language === "ta" ? "மிளகாய்" : language === "si" ? "මිරිස්" : "Chilli"})</option>
                      <option value="Red Onion">Red Onion ({language === "ta" ? "வெங்காயம்" : language === "si" ? "රතු ළූණු" : "Red Onion"})</option>
                      <option value="Brinjal">Brinjal ({language === "ta" ? "கத்தரி" : language === "si" ? "වම්බටු" : "Brinjal"})</option>
                      <option value="Okra">Okra ({language === "ta" ? "வெண்டி" : language === "si" ? "බණ්ඩක්කා" : "Okra"})</option>
                      <option value="Peanut">Peanut ({language === "ta" ? "நிலக்கடலை" : language === "si" ? "රටකජු" : "Peanut"})</option>
                      <option value="Pumpkin">Pumpkin ({language === "ta" ? "பூசணி" : language === "si" ? "වට්ටක්කා" : "Pumpkin"})</option>
                      <option value="Cucumber">Cucumber ({language === "ta" ? "வெள்ளரி" : language === "si" ? "පිපිඤ්ඤා" : "Cucumber"})</option>
                      <option value="Maize">Maize ({language === "ta" ? "சோளம்" : language === "si" ? "බඩඉරිඟු" : "Maize"})</option>
                      <option value="Green Gram">Green Gram ({language === "ta" ? "பயறு" : language === "si" ? "මුං ඇට" : "Green Gram"})</option>
                    </select>
                    {formErrors.crop_name && <span className="field-error-text">{formErrors.crop_name}</span>}
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{t("affectedPartLabel")} *</label>
                    <select
                      className={`input ${formErrors.plant_part ? "input-invalid" : ""}`}
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                      value={partAffected}
                      onChange={(e) => {
                        setPartAffected(e.target.value);
                        if (formErrors.plant_part) setFormErrors((prev) => ({ ...prev, plant_part: "" }));
                      }}
                    >
                      <option value="">-- Select Part --</option>
                      <option value="Leaf">{t("leafPart")}</option>
                      <option value="Stem">{t("stemPart")}</option>
                      <option value="Fruit">{t("fruitPart")}</option>
                    </select>
                    {formErrors.plant_part && <span className="field-error-text">{formErrors.plant_part}</span>}
                  </div>
                </div>

                {/* MANDATORY: Image Upload Box */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#1B4D3E" }}>
                    {t("uploadImageRequired")} *
                  </label>
                  <div
                    style={{
                      border: "2px dashed #10B981",
                      borderRadius: 14,
                      padding: 16,
                      textAlign: "center",
                      background: "#F0FDF4",
                      cursor: "pointer",
                      marginBottom: 8,
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
                          style={{ maxHeight: 160, margin: "0 auto", borderRadius: 10, objectFit: "cover" }}
                        />
                      ) : (
                        <div>
                          <Upload size={32} color="#059669" style={{ marginBottom: 6 }} />
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#065F46" }}>
                            {t("clickToSelectPhoto")}
                          </div>
                          <div style={{ fontSize: 11, color: "#059669", marginTop: 2 }}>
                            {t("supportedFormats")}
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
                      placeholder={t("pasteImageUrlPlaceholder")}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (e.target.value) setFilePreview(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#334155" }}>
                    Symptoms &amp; Observed Damage *
                  </label>
                  <textarea
                    rows={3}
                    className={`input ${formErrors.symptoms ? "input-invalid" : ""}`}
                    placeholder={t("symptomsPlaceholder")}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC", fontSize: 13, fontFamily: "inherit" }}
                    value={symptoms}
                    onChange={(e) => {
                      setSymptoms(e.target.value);
                      if (formErrors.symptoms) setFormErrors((prev) => ({ ...prev, symptoms: "" }));
                    }}
                  />
                  {formErrors.symptoms && <span className="field-error-text">{formErrors.symptoms}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-sun"
                  style={{ width: "100%", padding: 12, fontSize: 15, fontWeight: 700, borderRadius: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
                >
                  <Sparkles size={18} />
                  {loading ? t("analyzingPhoto") : t("submitDiagnosis")}
                </button>
              </form>
            </div>

            {/* Right Column: Diagnosis Result Output */}
            <div>
              {currentDiagnosis ? (
                <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, border: "2px solid #16A34A", boxShadow: "0 4px 20px rgba(22,163,74,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Sparkles color="#16A34A" size={24} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#166534", margin: 0 }}>
                      {t("aiDiagnosisResult")} — {currentDiagnosis.crop_name}
                    </h2>
                  </div>

                  {currentDiagnosis.image_url && (
                    <img
                      src={currentDiagnosis.image_url}
                      alt="Crop symptom"
                      style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginBottom: 16 }}
                    />
                  )}

                  {/* Diagnosis & Possible Disease */}
                  <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, marginBottom: 16, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertCircle size={18} color="#D97706" /> {t("possibleDisease")}
                    </div>
                    <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5, whiteSpace: "pre-line", fontWeight: 600 }}>
                      {currentDiagnosis.diagnosis_result}
                    </div>
                    {currentDiagnosis.cause && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #CBD5E1", fontSize: 13, color: "#475569" }}>
                        <strong>{t("cause")}:</strong> {currentDiagnosis.cause}
                      </div>
                    )}
                  </div>

                  {/* Organic Treatment */}
                  <div style={{ background: "#F0FDF4", borderLeft: "4px solid #16A34A", padding: 14, borderRadius: 10, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>{t("organicTreatment")}</div>
                    <div style={{ fontSize: 13, color: "#334155", marginTop: 4, whiteSpace: "pre-line" }}>
                      {currentDiagnosis.organic_treatment || "Apply neem seed kernel extract (5%) or garlic-soap spray early morning. Remove severely infected leaves immediately."}
                    </div>
                  </div>

                  {/* Chemical Treatment */}
                  <div style={{ background: "#EFF6FF", borderLeft: "4px solid #2563EB", padding: 14, borderRadius: 10, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF" }}>{t("chemicalTreatment")}</div>
                    <div style={{ fontSize: 13, color: "#334155", marginTop: 4, whiteSpace: "pre-line" }}>
                      {currentDiagnosis.chemical_treatment || "Spray Copper Oxychloride (50% WP) @ 2.5g/L or Mancozeb 75% WP. Ensure proper protective gear during application."}
                    </div>
                  </div>

                  {/* Prevention Advice */}
                  <div style={{ background: "#FEF3C7", borderLeft: "4px solid #D97706", padding: 14, borderRadius: 10, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#92400E" }}>{t("preventionAdvice")}</div>
                    <div style={{ fontSize: 13, color: "#334155", marginTop: 4, whiteSpace: "pre-line" }}>
                      {currentDiagnosis.prevention_advice || "Maintain proper plant spacing, avoid overhead drip watering, and rotate crops."}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", borderTop: "1px solid #E2E8F0", paddingTop: 10 }}>
                    {currentDiagnosis.disclaimer}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 48, border: "1px solid #E2E8F0", textAlign: "center", color: "#64748B" }}>
                  <Stethoscope size={48} color="#94A3B8" style={{ marginBottom: 14 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>{t("noDiagnosisYet")}</h3>
                  <p style={{ fontSize: 14, maxWidth: 360, margin: "0 auto" }}>
                    {t("noDiagnosisSubtitle")}
                  </p>
                </div>
              )}

              {/* History Preview */}
              {history.length > 0 && (
                <div style={{ marginTop: 24, background: "#FFFFFF", borderRadius: 18, padding: 20, border: "1px solid #E2E8F0" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <History size={18} /> {t("diagnosisHistory")} ({history.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {history.slice(0, 3).map((item) => (
                      <div key={item.id} onClick={() => setCurrentDiagnosis(item)} style={{ padding: 12, borderRadius: 10, background: "#F8FAFC", cursor: "pointer", border: "1px solid #E2E8F0" }}>
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
