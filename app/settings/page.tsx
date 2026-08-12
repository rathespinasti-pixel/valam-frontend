"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GpsLocationButton } from "@/components/location/GpsLocationButton";
import { ValamAPI } from "@/lib/api";
import type { ValamUser } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Lock,
  Globe,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [preferredLang, setPreferredLang] = useState<Language>("en");
  const [farmingCategory, setFarmingCategory] = useState("Farmer");
  const [district, setDistrict] = useState("Vavuniya");
  const [dsDivision, setDsDivision] = useState("Vavuniya Town");
  const [landSize, setLandSize] = useState<number | "">(1.0);
  const [landUnit, setLandUnit] = useState("Acres");
  const [irrigationPref, setIrrigationPref] = useState("Drip Irrigation");
  const [fertilizerPref, setFertilizerPref] = useState("Organic");

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const u = await ValamAPI.me();
        setUser(u);
        setFullName(u.full_name || "");
        setPhone(u.phone || "");
        setFarmLocation(u.farm_location || "");
        setEmail(u.email || "");
        if (u.farming_category) setFarmingCategory(u.farming_category);
        if (u.district) setDistrict(u.district);
        if (u.ds_division) setDsDivision(u.ds_division);
        if (u.land_size) setLandSize(u.land_size);
        if (u.land_size_unit) setLandUnit(u.land_size_unit);
        if (u.irrigation_preference) setIrrigationPref(u.irrigation_preference);
        if (u.fertilizer_preference) setFertilizerPref(u.fertilizer_preference);
        if (u.preferred_language) {
          const l = u.preferred_language.toLowerCase();
          if (l.includes("ta") || l.includes("tamil")) setPreferredLang("ta");
          else if (l.includes("si") || l.includes("sinhala")) setPreferredLang("si");
          else setPreferredLang("en");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    if (ValamAPI.isLoggedIn()) {
      loadProfile();
    }
  }, []);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const updated = await ValamAPI.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        farm_location: farmLocation.trim() || `${dsDivision}, ${district}`,
        preferred_language: preferredLang,
        farming_category: farmingCategory,
        district: district,
        ds_division: dsDivision,
        land_size: typeof landSize === "number" ? landSize : 1.0,
        land_size_unit: landUnit,
        irrigation_preference: irrigationPref,
        fertilizer_preference: fertilizerPref,
      });

      setUser(updated);
      setLanguage(preferredLang);
      setStatusMsg({ type: "ok", text: "Settings and profile updated successfully!" });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update settings.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    setDeleting(true);

    try {
      await ValamAPI.deleteAccount(user.id);
      setShowDeleteModal(false);
      alert(t("deleteAccountSuccess"));
      router.push("/login");
    } catch (err) {
      alert("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <Navbar active="settings" />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600 }}>Loading settings...</div>
        </div>
        <Footer />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar active="settings" pageTitle={t("settings")} />

      <section className="page-hero">
        <div className="container">
          <div className="crumb">Farmer Portal / Settings</div>
          <h1>{t("settings")}</h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 600 }}>
            Manage your personal profile, phone number, farm location, preferred language, and account security.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container" style={{ maxWidth: 800 }}>

          {/* Status Alert */}
          {statusMsg && (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: statusMsg.type === "ok" ? "#DCFCE7" : "#FEE2E2",
                color: statusMsg.type === "ok" ? "#166534" : "#991B1B",
                border: statusMsg.type === "ok" ? "1px solid #86EFAC" : "1px solid #FCA5A5",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {statusMsg.type === "ok" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Profile & Settings Form */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: 32,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              marginBottom: 32,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: "#1E293B" }}>
              {t("profileUpdate")}
            </h2>

            <form onSubmit={handleSaveSettings}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#334155" }}>
                    <User size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    {t("fullName")} *
                  </label>
                  <input
                    type="text"
                    required
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1" }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#334155" }}>
                    <Phone size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    {t("phoneNumber")} *
                  </label>
                  <input
                    type="tel"
                    required
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1" }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#334155" }}>
                    <MapPin size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    {t("farmPlace")} *
                  </label>
                  <input
                    type="text"
                    required
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1" }}
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                  />
                  <div style={{ marginTop: 8 }}>
                    <GpsLocationButton
                      lang={preferredLang}
                      onLocation={(loc) => {
                        setFarmLocation(loc.farmLocation);
                        if (loc.district) setDistrict(loc.district);
                        if (loc.dsDivision) setDsDivision(loc.dsDivision);
                        setStatusMsg({ type: "ok", text: t("gpsAddedSuccess") });
                      }}
                      onError={(message) => setStatusMsg({ type: "error", text: message })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#334155" }}>
                    <Mail size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    {t("emailAddress")}
                  </label>
                  <input
                    type="email"
                    disabled
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#64748B" }}
                    value={email}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#334155" }}>
                    <Globe size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    {t("preferredLanguage")}
                  </label>
                  <select
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFF" }}
                    value={preferredLang}
                    onChange={(e) => {
                      const l = e.target.value as Language;
                      setPreferredLang(l);
                      setLanguage(l);
                    }}
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="ta">🇱🇰 தமிழ் (Tamil)</option>
                    <option value="si">🇱🇰 සිංහල (Sinhala)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#334155" }}>
                    <Lock size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    {t("password")}
                  </label>
                  <input
                    type="password"
                    placeholder="New password (optional)"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1" }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-sun"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px" }}
                >
                  <Save size={18} />
                  <span>{saving ? "Saving..." : t("saveSettings")}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Account Danger Zone: Delete Account */}
          <div
            style={{
              background: "#FFF5F5",
              borderRadius: 16,
              padding: 28,
              border: "1px solid #FECDD3",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#E11D48", marginBottom: 8 }}>
              <Trash2 size={22} />
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#9F1239" }}>
                {t("deleteAccount")}
              </h3>
            </div>
            <p style={{ fontSize: 14, color: "#881337", marginBottom: 20 }}>
              Permanently delete your account and remove all personal farming data from Valam. This action cannot be undone.
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              style={{
                background: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Trash2 size={16} />
              <span>{t("deleteAccount")}</span>
            </button>
          </div>

        </div>
      </section>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: 32,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#DC2626", marginBottom: 16 }}>
              <AlertTriangle size={28} />
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#1E293B" }}>
                Confirm Account Deletion
              </h3>
            </div>

            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
              {t("deleteAccountConfirmMsg")}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline"
                style={{ padding: "10px 20px" }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  background: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {deleting ? "Deleting..." : t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </AuthGuard>
  );
}
