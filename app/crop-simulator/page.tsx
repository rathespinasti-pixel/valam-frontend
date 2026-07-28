"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { CropSimulatorClient } from "@/components/crop-simulator/CropSimulatorClient";
import { AuthGuard } from "@/components/auth/AuthGuard";

const WHY_SIMULATE = [
  { icon: "fa-shield-halved", title: "Risk-free planning", text: "See likely yield, pest pressure and profit before spending on seeds, fertilizer or labor." },
  { icon: "fa-cloud-sun-rain", title: "Weather-aware forecasts", text: "The twin factors in expected rainfall, temperature swings and humidity for your season." },
  { icon: "fa-code-compare", title: "Compare choices instantly", text: "Organic vs. chemical, early vs. delayed sowing — see the trade-offs before committing." },
];

export default function CropSimulatorPage() {
  return (
    <AuthGuard>
      <Navbar active="features" />

      <section className="page-hero">
        <div className="container">
          <div className="crumb">Home / Features / Crop Guides / AI Digital Twin</div>
          <h1>
            <i className="fa-solid fa-dna" aria-hidden="true" /> AI Digital Twin &amp; Crop DNA Simulator
          </h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 620 }}>
            Part of the Crop Guide for Vegetables, Fruits, Rice &amp; Spices. Run a risk-free 30-second AI simulation
            of your whole crop cycle before you spend a single rupee on seeds, fertilizer or labor.
          </p>
          <div className="hero-chip-row">
            <span className="hero-chip">
              <i className="fa-solid fa-seedling" aria-hidden="true" /> Sowing to harvest, fast-forwarded
            </span>
            <span className="hero-chip">
              <i className="fa-solid fa-cloud-sun-rain" aria-hidden="true" /> Weather &amp; pest risk aware
            </span>
            <span className="hero-chip">
              <i className="fa-solid fa-sack-dollar" aria-hidden="true" /> Market-linked profit forecast
            </span>
          </div>
        </div>
      </section>

      <CropSimulatorClient />

      <section className="section section-light">
        <div className="container">
          <Reveal className="section-head" style={{ marginInline: "auto", textAlign: "center" }}>
            <span className="eyebrow">Why Simulate First</span>
            <h2 style={{ marginTop: 14 }}>Test the season before you plant it</h2>
          </Reveal>
          <div className="problem-grid">
            {WHY_SIMULATE.map((w) => (
              <Reveal className="problem-card" key={w.title}>
                <i className={`fa-solid ${w.icon}`} aria-hidden="true" />
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </AuthGuard>
  );
}
