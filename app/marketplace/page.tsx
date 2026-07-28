"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { SeedMarketplace } from "@/components/marketplace/SeedMarketplace";
import { AuthGuard } from "@/components/auth/AuthGuard";

const ORDER_STEPS = [
  { n: 1, title: "Select crop seed", text: "Choose the seed that fits your soil and season." },
  { n: 2, title: "Choose quantity", text: "Pick packet size or bulk quantity for your land." },
  { n: 3, title: "Add to cart", text: "Add seeds, fertilizer or both to your cart." },
  { n: 4, title: "Delivery details", text: "Enter your address and preferred delivery slot." },
  { n: 5, title: "Payment", text: "Pay online or choose Cash on Delivery." },
];

const GUIDE_STEPS = [
  { title: "Seed Preparation", body: <ul><li>Soak seeds in water for 6–8 hours before planting.</li><li>Select high-quality and healthy seeds.</li></ul> },
  { title: "Soil Preparation", body: <ul><li>Mix soil with compost or organic fertilizer.</li><li>Ensure proper drainage for healthy plant growth.</li></ul> },
  { title: "Planting", body: <ul><li>Plant seeds at the correct depth.</li><li>Maintain proper spacing between plants.</li></ul> },
  { title: "Water Management", body: <ul><li>Provide the required amount of water regularly.</li><li>Avoid overwatering and water stagnation.</li></ul> },
  { title: "Fertilizer Recommendation", body: "The AI system recommends which fertilizer to use, when to apply it, and the required quantity — timed to your crop's growth stage." },
  { title: "Disease Monitoring", body: <>Upload a photo of your plant and the AI will detect diseases, suggest treatment methods and recommend pest control solutions. See <Link href="/pest-radar">Acoustic Radar</Link> for pest sound detection too.</> },
  { title: "Harvesting", body: "Get guidance on the correct harvesting time and the proper harvesting method for your crop." },
];

const FERTILIZERS = [
  { icon: "fa-leaf", cat: "Fertilizer", title: "Organic Fertilizer 20kg", price: "Rs. 950", badge: "In stock" },
  { icon: "fa-recycle", cat: "Fertilizer", title: "Compost 25kg", price: "Rs. 1,200", badge: "In stock" },
  { icon: "fa-flask", cat: "Fertilizer", title: "NPK Fertilizer 10kg", price: "Rs. 1,650", badge: "Popular" },
  { icon: "fa-seedling", cat: "Fertilizer", title: "Bio Fertilizer 5L", price: "Rs. 800", badge: "In stock" },
  { icon: "fa-spray-can-sparkles", cat: "Pest Control", title: "Neem-Based Pest Spray 1L", price: "Rs. 650", badge: "In stock" },
];

export default function MarketplacePage() {
  return (
    <AuthGuard>
      <Navbar active="marketplace" />

      <section className="page-hero">
        <div className="container">
          <div className="crumb">Home / Features / Seeds &amp; Fertilizer Marketplace</div>
          <h1>
            <i className="fa-solid fa-store" aria-hidden="true" /> Seeds &amp; Fertilizer Marketplace
          </h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 640 }}>
            A smart farming marketplace where you buy quality seeds and fertilizer, track your order, and get a
            personalized AI growing plan from planting all the way to harvest.
          </p>
          <div className="hero-chip-row">
            <span className="hero-chip">
              <i className="fa-solid fa-seedling" aria-hidden="true" /> 7 vegetable seed categories
            </span>
            <span className="hero-chip">
              <i className="fa-solid fa-truck-fast" aria-hidden="true" /> Order tracking &amp; COD
            </span>
            <span className="hero-chip">
              <i className="fa-solid fa-brain" aria-hidden="true" /> AI crop assistant included
            </span>
          </div>
        </div>
      </section>

      <section className="section" id="seed-marketplace">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 1</span>
            <h2 style={{ marginTop: 14 }}>Vegetable Seed Marketplace</h2>
            <p>
              Pick the right seed for your soil, season and growing goals. Every listing shows quality rating,
              seller details and expected harvest time.
            </p>
          </Reveal>
          <SeedMarketplace />
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 2</span>
            <h2 style={{ marginTop: 14 }}>Seed Order System</h2>
            <p>A simple, five-step purchasing flow — with order tracking, delivery updates and purchase history after checkout.</p>
          </Reveal>
          <div className="steps order-steps">
            {ORDER_STEPS.map((s) => (
              <Reveal className="step" key={s.n}>
                <div className="circle">{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
                {s.n !== ORDER_STEPS.length && <div className="step-line" />}
              </Reveal>
            ))}
          </div>
          <Reveal style={{ textAlign: "center", marginTop: 38 }}>
            <span className="hero-chip" style={{ borderColor: "var(--mist)", color: "var(--ink-soft)" }}>
              <i className="fa-solid fa-location-crosshairs" aria-hidden="true" /> Order tracking
            </span>
            <span className="hero-chip" style={{ borderColor: "var(--mist)", color: "var(--ink-soft)", marginLeft: 10 }}>
              <i className="fa-solid fa-truck" aria-hidden="true" /> Delivery updates
            </span>
            <span className="hero-chip" style={{ borderColor: "var(--mist)", color: "var(--ink-soft)", marginLeft: 10 }}>
              <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /> Purchase history
            </span>
          </Reveal>
        </div>
      </section>

      <section className="section" id="growing-guide">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 3</span>
            <h2 style={{ marginTop: 14 }}>Step-by-Step Crop Growing Guide</h2>
            <p>Example: 🍅 Tomato Growing Guide — from seed preparation to harvest, with AI fertilizer advice and disease monitoring along the way.</p>
          </Reveal>

          <Reveal className="guide-accordion">
            {GUIDE_STEPS.map((g, i) => (
              <details className="guide-item" key={g.title} open={i === 0}>
                <summary>
                  <span className="g-num">{i + 1}</span> {g.title}
                </summary>
                <div className="guide-body">{g.body}</div>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <Reveal className="section-head" style={{ marginInline: "auto", textAlign: "center" }}>
            <span className="eyebrow" style={{ background: "rgba(255,255,255,.1)", color: "var(--sunrise-2)" }}>
              Main Feature 4
            </span>
            <h2 style={{ marginTop: 14, color: "#fff" }}>AI Crop Assistant Integration</h2>
            <p style={{ color: "#C4D8CC" }}>Personalized farming guidance based on exactly what you purchased.</p>
          </Reveal>

          <Reveal className="chat-mock chat-mock-wide assist-demo">
            <div className="chat-head">
              <span className="dot" /> Valam Crop Assistant · Online
            </div>
            <div className="chat-body">
              <div className="bubble user">I bought tomato seeds. How should I grow them?</div>
              <div className="bubble bot">
                Your tomato growing plan is ready:
                <ul className="assist-plan">
                  <li><b>Day 1</b> Soil preparation</li>
                  <li><b>Day 7</b> Seedling care</li>
                  <li><b>Day 30</b> Fertilizer application</li>
                  <li><b>Day 70</b> Harvesting</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 5</span>
            <h2 style={{ marginTop: 14 }}>Fertilizer Marketplace</h2>
            <p>Organic fertilizer, compost, NPK, bio fertilizer and pest control — with AI recommendations on what to apply and when.</p>
          </Reveal>
          <div className="market-grid">
            {FERTILIZERS.map((f) => (
              <Reveal className="market-card" key={f.title}>
                <div className="market-thumb">
                  <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
                </div>
                <div className="market-body">
                  <span className="cat">{f.cat}</span>
                  <h4>{f.title}</h4>
                  <div className="price-row">
                    <span className="price">{f.price}</span>
                    <span className="badge">{f.badge}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="problem-card" style={{ maxWidth: 560, margin: "34px auto 0", textAlign: "center" }}>
            <i className="fa-solid fa-lightbulb" style={{ marginBottom: 10 }} aria-hidden="true" />
            <h3>Smart Fertilizer Tip</h3>
            <p>
              &quot;Your tomato plants require potassium fertilizer after 45 days.&quot; — Valam&apos;s AI tells you
              the right fertilizer at the correct time, for every crop you&apos;re growing.
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </AuthGuard>
  );
}
