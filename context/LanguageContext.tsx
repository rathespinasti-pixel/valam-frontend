"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TRANSLATIONS, Language, TranslationDictionary } from "@/lib/translations";
import { ValamAPI } from "@/lib/api";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationDictionary) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("valam_lang") as Language;
    if (saved && (saved === "en" || saved === "ta" || saved === "si")) {
      setLanguageState(saved);
    } else {
      const storedUser = ValamAPI.getStoredUser();
      if (storedUser?.preferred_language) {
        const pref = storedUser.preferred_language.toLowerCase();
        if (pref.includes("ta") || pref.includes("tamil")) setLanguageState("ta");
        else if (pref.includes("si") || pref.includes("sinhala")) setLanguageState("si");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("valam_lang", lang);

    // Sync with backend profile if logged in
    if (ValamAPI.isLoggedIn()) {
      ValamAPI.updateProfile({ preferred_language: lang }).catch(() => {});
    }
  };

  const t = (key: keyof TranslationDictionary): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
