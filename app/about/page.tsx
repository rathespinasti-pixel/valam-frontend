import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { StatCounter } from "@/components/ui/StatCounter";

export const metadata: Metadata = {
  title: "About Valam — Smart Farming Assistant",
};

const UNIQUE_FACTORS = [
  { icon: "fa-location-crosshairs", title: "Hyper-local alerts", text: "Weather and irrigation warnings tuned to village-level, not just district-level, conditions." },
  { icon: "fa-camera-retro", title: "AI disease detection", text: "Upload a photo, get an instant diagnosis — no waiting for an expert visit." },
  { icon: "fa-layer-group", title: "All-in-one platform", text: "Learning, buying and support in a single app instead of five different tools." },
  { icon: "fa-people-roof", title: "District-wise community", text: "Connect with farmers facing the same soil, weather and market conditions as you." },
  { icon: "fa-sun", title: "Affordable solar guidance", text: "Plain-language, cost-aware guides to solar and drip irrigation, with subsidy info." },
  { icon: "fa-box-open", title: "Beginner starter kits", text: "Curated kits and guides for anyone just starting out in farming or gardening." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar active="about" />

      <section className="page-hero">
        <div className="container">
          <div className="crumb">Home / About</div>
          <h1>Built for farmers who deserve better tools</h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 560 }}>
            Valam started as a final-year project with one goal: put reliable weather, disease detection and market
            access into a single, easy app for small and medium farmers.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <Reveal>
            <span className="eyebrow">Our Story</span>
            <h2 style={{ marginTop: 14 }}>From a village problem to a digital solution</h2>
            <p style={{ marginTop: 16, color: "var(--ink-soft)", lineHeight: 1.7 }}>
              Many small and medium farmers still depend on traditional methods — without timely weather forecasts,
              early disease detection, or reliable access to markets. This leads to preventable crop losses and
              missed opportunities, like government subsidies that never reach the people they&apos;re meant for.
            </p>
            <p style={{ marginTop: 16, color: "var(--ink-soft)", lineHeight: 1.7 }}>
              Valam (வளம் — meaning &quot;fertility&quot; or &quot;abundance&quot; in Tamil) was designed to close
              that gap: one app that brings the forecast, the expert, the marketplace and the community together, in
              the farmer&apos;s own language.
            </p>
          </Reveal>
          <Reveal>
            <div className="hero-art" style={{ height: 360 }}>
              <div className="sun-disc" style={{ width: 140, height: 140, top: 0, right: "20%" }} />
              <div className="hero-card" style={{ position: "static", background: "var(--forest)", width: "100%" }}>
                <div className="row">
                  <div className="tag">
                    <i className="fa-solid fa-bullseye" aria-hidden="true" /> Mission
                  </div>
                </div>
                <p style={{ color: "#CFE3D5", fontSize: ".92rem", lineHeight: 1.6 }}>
                  Give every farmer access to real-time, hyper-local information — regardless of income, location or
                  literacy level.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <Reveal className="stat-pills">
            <div className="stat-pill">
              <b><StatCounter target={6} /></b>
              <span>Core modules</span>
            </div>
            <div className="stat-pill">
              <b><StatCounter target={12} suffix="+" /></b>
              <span>Districts planned</span>
            </div>
            <div className="stat-pill">
              <b><StatCounter target={2} /></b>
              <span>Languages supported</span>
            </div>
            <div className="stat-pill">
              <b><StatCounter target={100} suffix="%" /></b>
              <span>Farmer-first design</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">What Makes Us Different</span>
            <h2 style={{ marginTop: 14 }}>Unique factors</h2>
          </Reveal>
          <div className="problem-grid">
            {UNIQUE_FACTORS.map((f) => (
              <Reveal className="problem-card" key={f.title}>
                <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-light" id="team">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Who&apos;s Behind Valam</span>
            <h2 style={{ marginTop: 14 }}>Project Team</h2>
          </Reveal>
          <div className="team-grid">
            <Reveal className="team-card">
              <div className="team-photo">PR</div>
              <h4>Pinastina Ratheswaran</h4>
              <span>Project Lead &amp; Developer</span>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="cta-strip">
            <div>
              <h3>Want to see Valam in action?</h3>
              <p>Explore the full feature set or reach out with questions.</p>
            </div>
            <Link href="/services" className="btn btn-sun">
              View Features
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
