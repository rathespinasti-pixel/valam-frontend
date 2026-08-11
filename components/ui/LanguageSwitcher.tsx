"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Globe size={16} color="#059669" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        style={{
          background: "#FFFFFF",
          border: "1px solid #CBD5E1",
          color: "#1E293B",
          fontSize: 13,
          fontWeight: 700,
          borderRadius: 16,
          padding: "5px 10px",
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
