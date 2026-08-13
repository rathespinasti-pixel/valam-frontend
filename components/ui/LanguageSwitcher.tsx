"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <Globe size={15} color="#059669" className="mobile-hide-icon" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="lang-switcher-select"
        style={{
          background: "#FFFFFF",
          border: "1px solid #CBD5E1",
          color: "#1E293B",
          fontSize: 12,
          fontWeight: 700,
          borderRadius: 14,
          padding: "4px 8px",
          cursor: "pointer",
          outline: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
        aria-label="Select Language"
      >
        <option value="en" style={{ color: "#1E293B" }}>🇬🇧 English</option>
        <option value="ta" style={{ color: "#1E293B" }}>🇱🇰 தமிழ்</option>
        <option value="si" style={{ color: "#1E293B" }}>🇱🇰 සිංහල</option>
      </select>
    </div>
  );
}
