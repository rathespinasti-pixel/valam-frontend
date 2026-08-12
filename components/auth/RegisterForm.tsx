"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, Sprout, ShoppingBag, MapPin, Building, Phone, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GpsLocationButton } from "@/components/location/GpsLocationButton";
import { ValamAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";

export function RegisterForm() {
  const router = useRouter();
  const { t, setLanguage } = useLanguage();

  const [role, setRole] = useState<"farmer" | "consumer">("farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Controlled form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [prefLang, setPrefLang] = useState<Language>("en");
  const [district, setDistrict] = useState("Vavuniya");
  const [dsDivision, setDsDivision] = useState("Vavuniya Town");
  const [gnDivision, setGnDivision] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Farmer specific fields
  const [farmingCategory, setFarmingCategory] = useState("Farmer");
  const [farmLocation, setFarmLocation] = useState("");
  const [landSize, setLandSize] = useState<number | "">(1.0);
  const [landUnit, setLandUnit] = useState("Acres");
  const [irrigationPref, setIrrigationPref] = useState("Drip Irrigation");
  const [fertilizerPref, setFertilizerPref] = useState("Organic");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    if (!fullName.trim() || !email.trim() || !password || !phone.trim() || !district) {
      setStatus({ type: "error", text: t("fillMandatoryFields") });
      setSubmitting(false);
      return;
    }

    try {
      setLanguage(prefLang);
      await ValamAPI.register({
        full_name: fullName.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim(),
        role: role,
        preferred_language: prefLang,
        district: district,
        ds_division: dsDivision || "Vavuniya Town",
        gn_division: gnDivision.trim() || undefined,
        delivery_address: role === "consumer" ? (deliveryAddress.trim() || `${dsDivision}, ${district}`) : undefined,
        farming_category: role === "farmer" ? farmingCategory : "Consumer",
        land_size: role === "farmer" ? (typeof landSize === "number" ? landSize : 1.0) : 0,
        land_size_unit: role === "farmer" ? landUnit : "Acres",
        irrigation_preference: role === "farmer" ? irrigationPref : "Manual Watering",
        fertilizer_preference: role === "farmer" ? fertilizerPref : "Organic",
        farm_location: role === "farmer" ? (farmLocation.trim() || `${dsDivision}, ${district}`) : (deliveryAddress.trim() || `${dsDivision}, ${district}`),
        farm_size_acres: role === "farmer" ? (typeof landSize === "number" && landUnit === "Acres" ? landSize : 1.0) : 0,
      });

      setStatus({ type: "ok", text: t("accountCreatedRedirecting") });
      setTimeout(() => {
        if (role === "consumer") {
          router.push("/consumer");
        } else {
          router.push("/dashboard");
        }
      }, 600);
    } catch (err) {
      setStatus({ type: "error", text: err instanceof Error ? err.message : t("registrationFailed") });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Role Selection Tabs */}
      <div style={{ marginBottom: 22 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>
          {t("accountType")} *
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            type="button"
            onClick={() => setRole("farmer")}
            style={{
              padding: "14px 12px",
              borderRadius: 14,
              border: role === "farmer" ? "2px solid #10B981" : "1.5px solid #E2E8F0",
              background: role === "farmer" ? "#ECFDF5" : "#FFFFFF",
              color: role === "farmer" ? "#065F46" : "#475569",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: role === "farmer" ? "0 4px 12px rgba(16,185,129,0.12)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
              <Sprout size={20} color={role === "farmer" ? "#10B981" : "#64748B"} />
              {t("farmerOption")}
            </div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85, lineHeight: 1.3 }}>
              {t("farmerOptionDesc")}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("consumer")}
            style={{
              padding: "14px 12px",
              borderRadius: 14,
              border: role === "consumer" ? "2px solid #0284C7" : "1.5px solid #E2E8F0",
              background: role === "consumer" ? "#F0F9FF" : "#FFFFFF",
              color: role === "consumer" ? "#0369A1" : "#475569",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: role === "consumer" ? "0 4px 12px rgba(2,132,199,0.12)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
              <ShoppingBag size={20} color={role === "consumer" ? "#0284C7" : "#64748B"} />
              {t("consumerOption")}
            </div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85, lineHeight: 1.3 }}>
              {t("consumerOptionDesc")}
            </div>
          </button>
        </div>
      </div>

      {/* 1. Basic User Details */}
      <div className="field" style={{ marginBottom: 14 }}>
        <label htmlFor="full_name">{t("fullName")} *</label>
        <div className="input-wrap">
          <User size={18} style={{ position: "absolute", left: 14, color: "#64748B" }} />
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your Full Name"
            style={{ paddingLeft: 42 }}
            required
          />
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="field">
          <label htmlFor="email">{t("emailAddress")} *</label>
          <div className="input-wrap">
            <Mail size={18} style={{ position: "absolute", left: 14, color: "#64748B" }} />
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ paddingLeft: 42 }}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="phone">{t("phoneNumber")} *</label>
          <div className="input-wrap">
            <Phone size={18} style={{ position: "absolute", left: 14, color: "#64748B" }} />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+94 7X XXX XXXX"
              style={{ paddingLeft: 42 }}
              required
            />
          </div>
        </div>
      </div>

      {/* Language & District */}
      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="field">
          <label htmlFor="preferred_language">{t("preferredLanguage")} *</label>
          <div className="input-wrap">
            <i className="fa-solid fa-language" aria-hidden="true" />
            <select
              id="preferred_language"
              name="preferred_language"
              value={prefLang}
              onChange={(e) => {
                const lang = e.target.value as Language;
                setPrefLang(lang);
                setLanguage(lang);
              }}
              style={{ paddingLeft: 40 }}
            >
              <option value="en">English</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="si">Sinhala (සිංහල)</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="district">{t("district")} *</label>
          <div className="input-wrap">
            <MapPin size={18} style={{ position: "absolute", left: 14, color: "#64748B" }} />
            <select
              id="district"
              name="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ paddingLeft: 42 }}
            >
              <option value="Vavuniya">Vavuniya</option>
              <option value="Jaffna">Jaffna</option>
              <option value="Kilinochchi">Kilinochchi</option>
              <option value="Mannar">Mannar</option>
              <option value="Mullaitivu">Mullaitivu</option>
              <option value="Anuradhapura">Anuradhapura</option>
              <option value="Colombo">Colombo</option>
              <option value="Kandy">Kandy</option>
              <option value="Galle">Galle</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONSUMER SPECIFIC FIELDS */}
      {role === "consumer" && (
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="delivery_address">{t("deliveryAddress")} *</label>
          <div className="input-wrap">
            <Building size={18} style={{ position: "absolute", left: 14, color: "#64748B" }} />
            <input
              type="text"
              id="delivery_address"
              name="delivery_address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder={t("deliveryAddressPlaceholder")}
              style={{ paddingLeft: 42 }}
              required
            />
          </div>
        </div>
      )}

      {/* FARMER SPECIFIC FIELDS */}
      {role === "farmer" && (
        <>
          <div className="form-row" style={{ marginBottom: 14 }}>
            <div className="field">
              <label htmlFor="farming_category">{t("farmingCategory")} *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-tractor" aria-hidden="true" />
                <select
                  id="farming_category"
                  name="farming_category"
                  value={farmingCategory}
                  onChange={(e) => setFarmingCategory(e.target.value)}
                  style={{ paddingLeft: 40 }}
                >
                  <option value="Farmer">{t("farmerRole")}</option>
                  <option value="Home Gardener">{t("homeGardenerRole")}</option>
                  <option value="Terrace Gardener">{t("terraceGardenerRole")}</option>
                  <option value="Beginner">{t("beginnerRole")}</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="ds_division">{t("dsDivision")} *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-building-columns" aria-hidden="true" />
                <input
                  type="text"
                  id="ds_division"
                  name="ds_division"
                  value={dsDivision}
                  onChange={(e) => setDsDivision(e.target.value)}
                  placeholder="e.g. Vavuniya Town, Jaffna"
                  required
                />
              </div>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="farm_location">{t("farmPlace")}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
              <div className="input-wrap">
                <i className="fa-solid fa-location-crosshairs" aria-hidden="true" />
                <input
                  type="text"
                  id="farm_location"
                  name="farm_location"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  placeholder={`${dsDivision}, ${district}`}
                />
              </div>
              <GpsLocationButton
                lang={prefLang}
                onLocation={(loc) => {
                  setFarmLocation(loc.farmLocation);
                  if (loc.district) setDistrict(loc.district);
                  if (loc.dsDivision) setDsDivision(loc.dsDivision);
                  if (loc.gnDivision) setGnDivision(loc.gnDivision);
                  setStatus({ type: "ok", text: t("gpsAddedSuccess") });
                }}
                onError={(message) => setStatus({ type: "error", text: message })}
              />
            </div>
          </div>

          {/* Land Details */}
          <div className="form-row" style={{ marginBottom: 14 }}>
            <div className="field">
              <label htmlFor="land_size">{t("landSize")} *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-ruler-combined" aria-hidden="true" />
                <input
                  type="number"
                  id="land_size"
                  name="land_size"
                  step="0.1"
                  min="0"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value ? parseFloat(e.target.value) : "")}
                  placeholder="e.g. 1.5"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="land_unit">{t("landUnit")} *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-tag" aria-hidden="true" />
                <select
                  id="land_unit"
                  name="land_unit"
                  value={landUnit}
                  onChange={(e) => setLandUnit(e.target.value)}
                  style={{ paddingLeft: 40 }}
                >
                  <option value="Acres">{t("acres")}</option>
                  <option value="Perches">{t("perches")}</option>
                  <option value="Hectares">{t("hectares")}</option>
                  <option value="Square Feet">{t("squareFeet")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="form-row" style={{ marginBottom: 14 }}>
            <div className="field">
              <label htmlFor="irrigation_preference">{t("irrigationPreference")} *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-droplet" aria-hidden="true" />
                <select
                  id="irrigation_preference"
                  name="irrigation_preference"
                  value={irrigationPref}
                  onChange={(e) => setIrrigationPref(e.target.value)}
                  style={{ paddingLeft: 40 }}
                >
                  <option value="Drip Irrigation">{t("dripIrrigation")}</option>
                  <option value="Sprinkler Irrigation">{t("sprinklerIrrigation")}</option>
                  <option value="Manual Watering">{t("manualWatering")}</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="fertilizer_preference">{t("fertilizerPreference")} *</label>
              <div className="input-wrap">
                <i className="fa-solid fa-leaf" aria-hidden="true" />
                <select
                  id="fertilizer_preference"
                  name="fertilizer_preference"
                  value={fertilizerPref}
                  onChange={(e) => setFertilizerPref(e.target.value)}
                  style={{ paddingLeft: 40 }}
                >
                  <option value="Organic">{t("organicFertilizer")}</option>
                  <option value="Chemical">{t("chemicalFertilizer")}</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Password */}
      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="password">{t("password")} *</label>
        <div className="input-wrap">
          <Lock size={18} style={{ position: "absolute", left: 14, color: "#64748B" }} />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            autoComplete="new-password"
            style={{ paddingLeft: 42 }}
            required
          />
          <button
            type="button"
            className="pw-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        block
        style={{
          marginTop: 12,
          background: role === "farmer" ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #0284C7, #0369A1)",
          border: "none",
          fontWeight: 700,
        }}
        disabled={submitting}
      >
        {t("createAccount")} ({role === "farmer" ? t("farmerRole") : t("consumerOption")}) <UserPlus size={15} />
      </Button>

      <div className={`form-status${status ? ` ${status.type}` : ""}`} role="status" aria-live="polite">
        {status?.text}
      </div>
    </form>
  );
}
