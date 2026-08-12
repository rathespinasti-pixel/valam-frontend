"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";

export interface GpsLocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  farmLocation: string;
  district?: string;
  dsDivision?: string;
  gnDivision?: string;
}

interface GpsLocationButtonProps {
  onLocation: (location: GpsLocationResult) => void;
  onError?: (message: string) => void;
  label?: string;
  lang?: Language;
}

const DISTRICT_MAP: { id: string; names: string[] }[] = [
  { id: "Vavuniya", names: ["vavuniya", "வவுனியா", "வவுனியா", "වවුනියාව"] },
  { id: "Jaffna", names: ["jaffna", "யாழ்ப்பாணம்", "யாழ்பாணம்", "யாழ்ப்பாணம்", "යාපනය"] },
  { id: "Kilinochchi", names: ["kilinochchi", "கிளிநொச்சி", "கிளிநொச்சி", "කිලිනොච්චිය"] },
  { id: "Mannar", names: ["mannar", "மன்னார்", "மன்னார்", "මන්නාරම"] },
  { id: "Mullaitivu", names: ["mullaitivu", "முல்லைத்தீவு", "முல்லைத்தீவு", "මුලතිව්"] },
  { id: "Anuradhapura", names: ["anuradhapura", "அனுராதபுரம்", "அனுராதபுரம்", "අනුරාධපුරය"] },
  { id: "Colombo", names: ["colombo", "கொழும்பு", "கொழும்பு", "කොළඹ"] },
  { id: "Kandy", names: ["kandy", "கண்டி", "கண்டி", "මහනුවර"] },
  { id: "Galle", names: ["galle", "காலி", "காலி", "ගාල්ල"] },
];

function pickDistrict(address: Record<string, string> = {}): string | undefined {
  const values = [
    address.county,
    address.state_district,
    address.district,
    address.city,
    address.town,
    address.village,
    address.state,
  ].filter(Boolean);

  for (const item of DISTRICT_MAP) {
    const matched = values.some((val) =>
      item.names.some((name) => val.toLowerCase().includes(name.toLowerCase()))
    );
    if (matched) return item.id;
  }
  return undefined;
}

function pickDsDivision(address: Record<string, string> = {}) {
  return (
    address.city ||
    address.town ||
    address.municipality ||
    address.village ||
    address.suburb ||
    address.county ||
    ""
  );
}

function pickGnDivision(address: Record<string, string> = {}) {
  return address.suburb || address.neighbourhood || address.hamlet || address.quarter || "";
}

async function reverseGeocode(latitude: number, longitude: number, lang: string = "en") {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: "1",
    "accept-language": lang,
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": lang,
      "User-Agent": "ValamApp/1.0",
    },
  });

  if (!response.ok) {
    throw new Error("Could not identify the place name.");
  }

  return response.json() as Promise<{
    display_name?: string;
    address?: Record<string, string>;
  }>;
}

export function GpsLocationButton({ onLocation, onError, label, lang }: GpsLocationButtonProps) {
  const [loading, setLoading] = useState(false);
  const { language: contextLang, t } = useLanguage();
  const activeLang = lang || contextLang || "en";

  const buttonText = loading
    ? t("locating")
    : label && label !== "Use GPS"
      ? label
      : t("useGps");

  function handleClick() {
    if (!("geolocation" in navigator)) {
      onError?.(t("gpsNotSupported"));
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coordText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        try {
          const geo = await reverseGeocode(latitude, longitude, activeLang);
          const address = geo.address || {};
          const district = pickDistrict(address);
          const dsDivision = pickDsDivision(address);
          const gnDivision = pickGnDivision(address);
          const rawDisplayName = geo.display_name || `${dsDivision || "GPS Location"} (${coordText})`;
          const cleanedDisplayName = rawDisplayName.replace(/\s*\([^)]*\)/g, "");

          onLocation({
            latitude,
            longitude,
            accuracy,
            farmLocation: `${cleanedDisplayName} | GPS: ${coordText}`,
            district,
            dsDivision,
            gnDivision,
          });
        } catch {
          onLocation({
            latitude,
            longitude,
            accuracy,
            farmLocation: `GPS: ${coordText}`,
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        const message =
          error.code === error.PERMISSION_DENIED
            ? t("gpsPermissionDenied")
            : error.code === error.TIMEOUT
              ? t("gpsTimeout")
              : t("gpsReadError");
        onError?.(message);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={buttonText}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        border: "1px solid #A7F3D0",
        background: "#ECFDF5",
        color: "#047857",
        borderRadius: 8,
        padding: "9px 12px",
        fontSize: 13,
        fontWeight: 800,
        minHeight: 40,
        whiteSpace: "nowrap",
        opacity: loading ? 0.75 : 1,
      }}
    >
      {loading ? <Loader2 size={15} className="spin" /> : <MapPin size={15} />}
      <span>{buttonText}</span>
    </button>
  );
}

