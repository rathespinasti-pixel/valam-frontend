"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />

      <section className="section auth-section">
        <div className="container">
          <Reveal className="auth-shell">
            <div className="auth-panel">
              <span className="crumb">Valam / {t("register")}</span>
              <h2>{t("createAccount")}</h2>
              <p>Set up your profile for Northern Province weather alerts, lifecycle recommendations, and disease diagnosis.</p>
              <ul className="auth-points">
                <li>
                  <i className="fa-solid fa-cloud-sun-rain" aria-hidden="true" /> {t("weatherAdvisory")}
                </li>
                <li>
                  <i className="fa-solid fa-seedling" aria-hidden="true" /> {t("currentGrowthStage")}
                </li>
                <li>
                  <i className="fa-solid fa-droplet" aria-hidden="true" /> {t("irrigationGuidance")}
                </li>
              </ul>
            </div>
            <div className="auth-form-wrap">
              <div className="auth-card">
                <h3>{t("register")}</h3>
                <p className="auth-sub">Smart Crop Assistant for Northern Province</p>
                <RegisterForm />
                <p className="auth-switch" style={{ marginTop: 16 }}>
                  Already have an account? <Link href="/login">{t("login")}</Link>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
