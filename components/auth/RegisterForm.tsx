"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, Sprout, ShoppingBag, MapPin, Building, Phone, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GpsLocationButton } from "@/components/location/GpsLocationButton";
import { ValamAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";
import { registerSchema, getFieldErrors } from "@/lib/validations";

export function RegisterForm() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [role, setRole] = useState<"farmer" | "consumer">("farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Controlled form state — ZERO default values
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [prefLang, setPrefLang] = useState<Language>("en");
  const [district, setDistrict] = useState("");
  const [dsDivision, setDsDivision] = useState("");
  const [gnDivision, setGnDivision] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Farmer specific fields — ZERO default values
  const [farmingCategory, setFarmingCategory] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [landSize, setLandSize] = useState<number | "">("");
  const [landUnit, setLandUnit] = useState("");
  const [irrigationPref, setIrrigationPref] = useState("");
  const [fertilizerPref, setFertilizerPref] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setStatus(null);

    // Zod Schema Validation
    const validationPayload = {
      role,
      full_name: fullName,
      email,
      phone,
      password,
      preferred_language: prefLang,
      district,
      ds_division: dsDivision,
      gn_division: gnDivision || undefined,
      delivery_address: role === "consumer" ? deliveryAddress : undefined,
      farming_category: role === "farmer" ? farmingCategory : undefined,
      farm_location: farmLocation || undefined,
      land_size: role === "farmer" ? (landSize === "" ? undefined : Number(landSize)) : undefined,
      land_size_unit: role === "farmer" ? landUnit : undefined,
      irrigation_preference: role === "farmer" ? irrigationPref : undefined,
      fertilizer_preference: role === "farmer" ? fertilizerPref : undefined,
    };

    const validationResult = registerSchema.safeParse(validationPayload);
    if (!validationResult.success) {
      const fieldErrors = getFieldErrors(validationResult);
      setErrors(fieldErrors);
      setStatus({ type: "error", text: "Please correct the highlighted errors below." });
      return;
    }

    setSubmitting(true);
    try {
      setLanguage(prefLang);
      await ValamAPI.register({
        full_name: fullName.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim(),
        role: role,
        preferred_language: prefLang,
        district: district.trim(),
        ds_division: dsDivision.trim() || "Vavuniya Town",
        gn_division: gnDivision.trim() || undefined,
        delivery_address: role === "consumer" ? deliveryAddress.trim() : undefined,
        farming_category: role === "farmer" ? farmingCategory : "Consumer",
        land_size: role === "farmer" ? (typeof landSize === "number" ? landSize : 1.0) : 0,
        land_size_unit: role === "farmer" ? (landUnit || "Acres") : "Acres",
        irrigation_preference: role === "farmer" ? (irrigationPref || "Manual Watering") : "Manual Watering",
        fertilizer_preference: role === "farmer" ? (fertilizerPref || "Organic") : "Organic",
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
            onClick={() => {
              setRole("farmer");
              setErrors({});
            }}
            style={{
              padding: "14px 12px",
              borderRadius: 14,
              border: role === "farmer" ? "2px solid #10B981" : "1px solid #CBD5E1",
              background: role === "farmer" ? "#ECFDF5" : "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <Sprout size={24} color={role === "farmer" ? "#059669" : "#64748B"} />
            <span style={{ fontWeight: 800, fontSize: 14, color: role === "farmer" ? "#065F46" : "#334155" }}>
              🌾 {t("farmerRole")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("consumer");
              setErrors({});
            }}
            style={{
              padding: "14px 12px",
              borderRadius: 14,
              border: role === "consumer" ? "2px solid #0F766E" : "1px solid #CBD5E1",
              background: role === "consumer" ? "#F0FDFA" : "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <ShoppingBag size={24} color={role === "consumer" ? "#0F766E" : "#64748B"} />
            <span style={{ fontWeight: 800, fontSize: 14, color: role === "consumer" ? "#115E59" : "#334155" }}>
              🛒 {language === "ta" ? "நுகர்வோர் / வாங்குபவர்" : language === "si" ? "පාරිභෝගිකයා / ගැනුම්කරු" : "Consumer / Buyer"}
            </span>
          </button>
        </div>
      </div>

      {/* Basic Profile Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
        <div className="field">
          <label htmlFor="fullName">{t("fullName")} *</label>
          <div className="input-wrap">
            <User size={16} color="#64748B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              id="fullName"
              placeholder="e.g. Siva Kumar"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: "" }));
              }}
              className={errors.full_name ? "input-invalid" : ""}
              style={{ paddingLeft: 38 }}
            />
          </div>
          {errors.full_name && <span className="field-error-text">{errors.full_name}</span>}
        </div>

        <div className="field">
          <label htmlFor="phone">{t("phoneNumber")} *</label>
          <div className="input-wrap">
            <Phone size={16} color="#64748B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="tel"
              id="phone"
              placeholder="+94 77 123 4567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              className={errors.phone ? "input-invalid" : ""}
              style={{ paddingLeft: 38 }}
            />
          </div>
          {errors.phone && <span className="field-error-text">{errors.phone}</span>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
        <div className="field">
          <label htmlFor="email">{t("emailAddress")} *</label>
          <div className="input-wrap">
            <Mail size={16} color="#64748B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={errors.email ? "input-invalid" : ""}
              style={{ paddingLeft: 38 }}
            />
          </div>
          {errors.email && <span className="field-error-text">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">{t("password")} *</label>
          <div className="input-wrap">
            <Lock size={16} color="#64748B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={errors.password ? "input-invalid" : ""}
              style={{ paddingLeft: 38 }}
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPassword((p) => !p)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <span className="field-error-text">{errors.password}</span>}
        </div>
      </div>

      {/* Location Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
        <div className="field">
          <label htmlFor="district">{t("district")} *</label>
          <div className="input-wrap">
            <MapPin size={16} color="#64748B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <select
              id="district"
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                if (errors.district) setErrors((prev) => ({ ...prev, district: "" }));
              }}
              className={errors.district ? "input-invalid" : ""}
              style={{ paddingLeft: 38 }}
            >
              <option value="">-- {t("allDistricts")} --</option>
              <option value="Vavuniya">Vavuniya (வவுனியா / වවුනියාව)</option>
              <option value="Jaffna">Jaffna (யாழ்ப்பாணம் / යාපනය)</option>
              <option value="Kilinochchi">Kilinochchi (கிளிநொச்சி / කිලිනොච්චිය)</option>
              <option value="Mannar">Mannar (மன்னார் / මන්නාරම)</option>
              <option value="Mullaitivu">Mullaitivu (முல்லைத்தீவு / මුලතිව්)</option>
              <option value="Anuradhapura">Anuradhapura (அனுராதபுரம் / අනුරාධපුරය)</option>
              <option value="Colombo">Colombo (கொழும்பு / කොළඹ)</option>
            </select>
          </div>
          {errors.district && <span className="field-error-text">{errors.district}</span>}
        </div>

        <div className="field">
          <label htmlFor="dsDivision">{t("dsDivision")} *</label>
          <div className="input-wrap">
            <Building size={16} color="#64748B" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              id="dsDivision"
              placeholder="e.g. Vavuniya Town, Nedunkeni"
              value={dsDivision}
              onChange={(e) => {
                setDsDivision(e.target.value);
                if (errors.ds_division) setErrors((prev) => ({ ...prev, ds_division: "" }));
              }}
              className={errors.ds_division ? "input-invalid" : ""}
              style={{ paddingLeft: 38 }}
            />
          </div>
          {errors.ds_division && <span className="field-error-text">{errors.ds_division}</span>}
        </div>
      </div>

      {/* CONSUMER ROLE SPECIFIC FIELDS */}
      {role === "consumer" && (
        <div style={{ background: "#F0FDFA", borderRadius: 14, padding: 16, border: "1px solid #CCFBF1", marginBottom: 18 }}>
          <div className="field">
            <label htmlFor="deliveryAddress" style={{ color: "#0F766E", fontWeight: 700 }}>
              {t("deliveryAddress")} *
            </label>
            <input
              type="text"
              id="deliveryAddress"
              placeholder="e.g. No 12, Station Road, Vavuniya"
              value={deliveryAddress}
              onChange={(e) => {
                setDeliveryAddress(e.target.value);
                if (errors.delivery_address) setErrors((prev) => ({ ...prev, delivery_address: "" }));
              }}
              className={errors.delivery_address ? "input-invalid" : ""}
              style={{ background: "#FFFFFF" }}
            />
            {errors.delivery_address && <span className="field-error-text">{errors.delivery_address}</span>}
          </div>
        </div>
      )}

      {/* FARMER ROLE SPECIFIC FIELDS */}
      {role === "farmer" && (
        <div style={{ background: "#F0FDF4", borderRadius: 14, padding: 16, border: "1px solid #DCFCE7", marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
            <div className="field">
              <label htmlFor="farmingCategory" style={{ color: "#166534", fontWeight: 700 }}>
                {t("farmingCategory")} *
              </label>
              <select
                id="farmingCategory"
                value={farmingCategory}
                onChange={(e) => {
                  setFarmingCategory(e.target.value);
                  if (errors.farming_category) setErrors((prev) => ({ ...prev, farming_category: "" }));
                }}
                className={errors.farming_category ? "input-invalid" : ""}
                style={{ background: "#FFFFFF" }}
              >
                <option value="">-- Select Category --</option>
                <option value="Farmer">Full-time Farmer (முழுநேர விவசாயி / පූර්ණකාලීන ගොවි)</option>
                <option value="Home Gardener">Home Gardener (வீட்டுத் தோட்டம் / ගෙවතු වගාකරු)</option>
                <option value="Commercial">Commercial Cultivator (வணிக விவசாயி / වාණිජ වගාකරු)</option>
              </select>
              {errors.farming_category && <span className="field-error-text">{errors.farming_category}</span>}
            </div>

            <div className="field">
              <label htmlFor="landSize" style={{ color: "#166534", fontWeight: 700 }}>
                {t("landSize")} *
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 8 }}>
                <input
                  type="number"
                  id="landSize"
                  step="0.1"
                  placeholder="e.g. 1.5"
                  value={landSize}
                  onChange={(e) => {
                    setLandSize(e.target.value ? parseFloat(e.target.value) : "");
                    if (errors.land_size) setErrors((prev) => ({ ...prev, land_size: "" }));
                  }}
                  className={errors.land_size ? "input-invalid" : ""}
                  style={{ background: "#FFFFFF" }}
                />
                <select
                  id="landUnit"
                  value={landUnit}
                  onChange={(e) => setLandUnit(e.target.value)}
                  style={{ background: "#FFFFFF" }}
                >
                  <option value="">-- Unit --</option>
                  <option value="Acres">Acres</option>
                  <option value="Perches">Perches</option>
                  <option value="Hectares">Hectares</option>
                </select>
              </div>
              {errors.land_size && <span className="field-error-text">{errors.land_size}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <div className="field">
              <label htmlFor="irrigationPref" style={{ color: "#166534", fontWeight: 700 }}>
                {t("irrigationPreference")}
              </label>
              <select
                id="irrigationPref"
                value={irrigationPref}
                onChange={(e) => setIrrigationPref(e.target.value)}
                style={{ background: "#FFFFFF" }}
              >
                <option value="">-- Select Irrigation --</option>
                <option value="Drip Irrigation">Drip Irrigation (சொட்டு நீர்)</option>
                <option value="Sprinkler">Sprinkler (தெளிப்பான்)</option>
                <option value="Solar Powered Pump">Solar Powered Pump (சூரிய பம்ப்)</option>
                <option value="Flood / Channel">Flood / Channel (வாய்க்கால் பாசனம்)</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="fertilizerPref" style={{ color: "#166534", fontWeight: 700 }}>
                {t("fertilizerPreference")}
              </label>
              <select
                id="fertilizerPref"
                value={fertilizerPref}
                onChange={(e) => setFertilizerPref(e.target.value)}
                style={{ background: "#FFFFFF" }}
              >
                <option value="">-- Select Fertilizer --</option>
                <option value="Organic">Organic (இயற்கை உரம் / කාබනික)</option>
                <option value="Chemical / Conventional">Conventional (இரசாயன உரம் / රසායනික)</option>
                <option value="Integrated">Integrated (ஒருங்கிணைந்த / ඒකාබද්ධ)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Preferred Language */}
      <div className="field" style={{ marginBottom: 18 }}>
        <label htmlFor="prefLang">{t("preferredLanguage")}</label>
        <select
          id="prefLang"
          value={prefLang}
          onChange={(e) => setPrefLang(e.target.value as Language)}
        >
          <option value="en">English (UK)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="si">සිංහල (Sinhala)</option>
        </select>
      </div>

      {status && (
        <div
          role="alert"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
            background: status.type === "ok" ? "#DCFCE7" : "#FEE2E2",
            color: status.type === "ok" ? "#166534" : "#991B1B",
          }}
        >
          {status.text}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={submitting}
        style={{
          width: "100%",
          background: role === "consumer" ? "linear-gradient(135deg, #0F766E 0%, #115E59 100%)" : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        }}
      >
        <UserPlus size={18} style={{ marginRight: 8 }} />
        {submitting ? "Creating Account..." : t("createAccount")}
      </Button>
    </form>
  );
}
