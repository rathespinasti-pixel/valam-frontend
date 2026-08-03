"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { AlertCircle, Home } from "lucide-react";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <section className="section" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F9F7" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 520 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: 40, border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <AlertCircle size={64} color="#EF4444" style={{ marginBottom: 16 }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1E293B", marginBottom: 12 }}>
              {t("pageNotFoundTitle")}
            </h1>
            <p style={{ fontSize: 15, color: "#64748B", marginBottom: 28, lineHeight: 1.6 }}>
              {t("pageNotFoundDesc")}
            </p>
            <Link href="/" className="btn btn-sun" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 15, fontWeight: 700, borderRadius: 10 }}>
              <Home size={18} /> {t("backToHome")}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
