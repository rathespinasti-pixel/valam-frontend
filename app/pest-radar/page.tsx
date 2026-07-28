import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { RadarHeroIllustration } from "@/components/pest-radar/RadarHeroIllustration";
import { PestRadarClient } from "@/components/pest-radar/PestRadarClient";

export const metadata: Metadata = {
  title: "Acoustic Radar — AI Pest Detection — Valam",
  description:
    "Record or upload insect sounds from your field. Valam's Acoustic Radar analyzes the audio, identifies the pest, rates the infestation level and recommends control methods — then lets you ask the AI chatbot follow-up questions.",
};

const BENEFITS = [
  { icon: "fa-magnifying-glass-chart", title: "Early detection", text: "Spot infestations from sound alone, often before any visible symptoms appear on the crop." },
  { icon: "fa-flask-vial", title: "Less unnecessary spraying", text: "Treat only when a pest is confirmed, cutting down on wasted pesticide and its cost." },
  { icon: "fa-sack-dollar", title: "Lower losses, lower cost", text: "Acting early protects yield and keeps input costs down for the rest of the season." },
  { icon: "fa-seedling", title: "Healthier crops overall", text: "Consistent monitoring keeps the field in better condition, season after season." },
];

export default function PestRadarPage() {
  return (
    <>
      <Navbar />

      <section className="page-hero radar-hero radar-hero-full">
        <div className="radar-hero-bg" aria-hidden="true">
          <RadarHeroIllustration />
        </div>
        <div className="radar-hero-scrim" aria-hidden="true" />

        <div className="container radar-hero-content">
          <div className="crumb">Home / Acoustic Radar</div>
          <h1>
            <i className="fa-solid fa-satellite-dish" aria-hidden="true" /> Acoustic Radar — AI Pest Detection
          </h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 560 }}>
            Record the sounds in your field or upload a clip — Valam listens for feeding, wing and movement sounds
            to identify the pest, rate the infestation and recommend what to do next.
          </p>
          <div className="hero-feature-row">
            <div className="hero-feature-item">
              <span className="ico">
                <i className="fa-solid fa-wave-square" aria-hidden="true" />
              </span>
              Listen to Insect Sounds
            </div>
            <div className="hero-feature-item">
              <span className="ico">
                <i className="fa-solid fa-brain" aria-hidden="true" />
              </span>
              AI Powered Detection
            </div>
            <div className="hero-feature-item">
              <span className="ico">
                <i className="fa-solid fa-clock" aria-hidden="true" />
              </span>
              Real-time Results
            </div>
            <div className="hero-feature-item">
              <span className="ico">
                <i className="fa-solid fa-shield-halved" aria-hidden="true" />
              </span>
              Smart Pest Management
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <PestRadarClient />
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head" style={{ marginInline: "auto", textAlign: "center" }}>
            <span className="eyebrow">Why Acoustic Radar</span>
            <h2 style={{ marginTop: 14 }}>Catch pests before the damage is done</h2>
          </Reveal>
          <div className="problem-grid radar-benefits">
            {BENEFITS.map((b) => (
              <Reveal className="problem-card" key={b.title}>
                <i className={`fa-solid ${b.icon}`} aria-hidden="true" />
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer platformLinksVariant="chat" />
    </>
  );
}
