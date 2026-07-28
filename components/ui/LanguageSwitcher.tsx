"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Globe size={16} color="#A7F3D0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 16,
          padding: "4px 8px",
          cursor: "pointer",
          outline: "none",
        }}
        aria-label="Select Language"
      >
        <option value="en" style={{ color: "#000" }}>🇬🇧 English</option>
        <option value="ta" style={{ color: "#000" }}>🇱🇰 தமிழ்</option>
        <option value="si" style={{ color: "#000" }}>🇱🇰 සිංහල</option>
      </select>
    </div>
  );
}
