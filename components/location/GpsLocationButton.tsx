"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";

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
}

const NORTHERN_DISTRICTS = ["Vavuniya", "Jaffna", "Kilinochchi", "Mannar", "Mullaitivu"];

function pickDistrict(address: Record<string, string> = {}) {
  const values = [
    address.county,
    address.state_district,
    address.district,
    address.city,
    address.town,
    address.village,
    address.state,
  ].filter(Boolean);

  return NORTHERN_DISTRICTS.find((district) =>
    values.some((value) => value.toLowerCase().includes(district.toLowerCase()))
  );
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

async function reverseGeocode(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: "1",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Could not identify the place name.");
  }

  return response.json() as Promise<{
    display_name?: string;
    address?: Record<string, string>;
  }>;
}

export function GpsLocationButton({ onLocation, onError, label = "Use GPS" }: GpsLocationButtonProps) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (!("geolocation" in navigator)) {
      onError?.("GPS is not available in this browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coordText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        try {
          const geo = await reverseGeocode(latitude, longitude);
          const address = geo.address || {};
          const district = pickDistrict(address);
          const dsDivision = pickDsDivision(address);
          const gnDivision = pickGnDivision(address);
          const placeLabel = geo.display_name || `${dsDivision || "GPS Location"} (${coordText})`;

          onLocation({
            latitude,
            longitude,
            accuracy,
            farmLocation: `${placeLabel} | GPS: ${coordText}`,
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
            ? "Location permission was denied."
            : error.code === error.TIMEOUT
              ? "GPS request timed out. Please try again."
              : "Could not read your GPS location.";
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
      title="Use current GPS location"
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
      <span>{loading ? "Locating..." : label}</span>
    </button>
  );
}
