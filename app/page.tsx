import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialSlider } from "@/components/ui/TestimonialSlider";
import { MarketplacePreviewGrid } from "@/components/home/MarketplacePreviewGrid";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { MarketplaceCtaButton } from "@/components/home/MarketplaceCtaButton";
import { ChatPreview } from "@/components/home/ChatPreview";

export const metadata: Metadata = {
  title: "Valam (வளம்) — அறிவார்ந்த விவசாயத்தின் டிஜிட்டல் துணை",
  description:
    "Valam is an all-in-one smart farming app: real-time weather alerts, AI plant-disease detection, a seeds & fertilizer marketplace and a farmer community — built for small and medium farmers.",
};

const MARQUEE_ITEMS = [
  { icon: "fa-cloud-sun", label: "Weather Forecast & Farming Alerts" },
  { icon: "fa-seedling", label: "Crop Guides — Vegetables, Fruits, Rice & Spices" },
  { icon: "fa-magnifying-glass", label: "AI Chatbot & Plant Disease Detection" },
  { icon: "fa-solar-panel", label: "Irrigation & Solar Farming Guidance" },
  { icon: "fa-store", label: "Seeds & Fertilizer Marketplace" },
];

const PROBLEMS = [
  { icon: "fa-cloud-bolt", title: "No timely weather data", text: "Sudden rain, drought or wind damages crops because alerts don't reach farmers in time." },
  { icon: "fa-bug", title: "Late disease detection", text: "Pests and crop diseases are usually spotted only after serious damage has spread." },
  { icon: "fa-store-slash", title: "Limited market access", text: "Middlemen reduce profits, and quality seeds or fertilizer are hard to source reliably." },
  { icon: "fa-file-circle-exclamation", title: "Missed govt. schemes", text: "Subsidy programs and agricultural policy updates rarely reach farmers on time." },
  { icon: "fa-bolt", title: "High irrigation cost", text: "Rising electricity and fuel costs make traditional irrigation expensive and wasteful." },
  { icon: "fa-comments", title: "No expert network", text: "Farmers have few ways to reach agricultural experts or learn from each other." },
];


const FEATURES = [
  { num: "01", href: "/chatbot?topic=weather", img: "/images/weather-alerts.jpg", alt: "Farmer checking AI weather forecast in the field", icon: "fa-cloud-sun-rain", title: "Weather Forecast & Farming Alerts", text: "District and village-level forecasts with irrigation and rainfall warnings sent straight to your phone.", cta: "Chat about this" },
  { num: "02", href: "/crop-simulator", img: "/images/crop-guide.jpg", alt: "Fresh harvested vegetables and crops", icon: "fa-book-open", title: "Crop Guides — Vegetables, Fruits, Rice & Spices", text: "Step-by-step growing guides, plus an AI Digital Twin that simulates your crop cycle in 30 seconds.", cta: "Simulate Your Crop Twin" },
  { num: "03", href: "/pest-radar", img: "/images/ai-chatbot.jpg", alt: "Farmer scanning a crop leaf with the AI chatbot app", icon: "fa-camera-retro", title: "AI Chatbot & Plant Disease Detection", text: "Ask a farming question or record insect sounds for instant pest identification.", cta: "Detect a pest" },
  { num: "04", href: "/irrigation-solar", img: "/images/irrigation-solar.jpg", alt: "Solar-powered irrigation pump watering crops", icon: "fa-solar-panel", title: "Irrigation & Solar Farming Guidance", text: "An AI Solar Farming Assistant — price tracking, system recommendations, subsidy checks and daily setup guidance.", cta: "Try the Solar Assistant" },
  { num: "05", href: "/chatbot?topic=marketplace", img: "/images/marketplace.jpg", alt: "Assorted vegetable seed packets", icon: "fa-store", title: "Seeds & Fertilizer Marketplace", text: "Buy and sell seeds, fertilizer and organic products directly — no middlemen involved.", cta: "Chat about this" },
];

const STEPS = [
  { n: 1, title: "Create your farm profile", text: "Add your district, crop type and land size — takes under two minutes." },
  { n: 2, title: "Get daily alerts", text: "Receive weather and irrigation notifications tailored to your exact location." },
  { n: 3, title: "Ask the AI chatbot", text: "Upload a crop photo or ask a farming question, anytime, in Tamil or English." },
  { n: 4, title: "Buy & sell on the marketplace", text: "Order seeds and fertilizer, or list your own produce for sale — direct, no middlemen." },
];

const TESTIMONIALS = [
  { stars: 5, quote: "The weather alert saved my paddy field before last month's unexpected rain. I moved harvesting up by two days.", initial: "K", name: "Kumaravel S.", role: "Paddy Farmer, Vavuniya" },
  { stars: 5, quote: "I uploaded a photo of a diseased leaf and got a diagnosis in seconds. It used to take days to find an expert.", initial: "R", name: "Ranjini P.", role: "Home Gardener, Jaffna" },
  { stars: 4.5, quote: "Selling directly on the marketplace cut out the middleman — my margins improved noticeably this season.", initial: "M", name: "Murugan T.", role: "Vegetable Farmer, Anuradhapura" },
  { stars: 5, quote: "The solar pump subsidy guide walked me through the whole application. I wouldn't have found it otherwise.", initial: "S", name: "Selvi A.", role: "Smallholder Farmer, Batticaloa" },
];

export default function HomePage() {
  return (
    <>
      <Navbar active="home" />

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">
              <i className="fa-solid fa-seedling" aria-hidden="true" /> Smart Farming System
            </span>
            <h1 style={{ marginTop: 18 }}>
              Weather, disease alerts &amp; a marketplace — <em>all under one leaf.</em>
            </h1>
            <p className="lead">
              Valam (வளம்) brings hyper-local weather warnings, AI-powered plant disease detection, and a trusted
              seeds &amp; fertilizer marketplace to every small and medium farmer, in Tamil and English.
            </p>
            <div className="hero-actions">
              <Link href="/services" className="btn btn-primary">
                <i className="fa-solid fa-mobile-screen-button" aria-hidden="true" /> Explore Features
              </Link>
              <Link href="/about" className="btn btn-outline">
                How Valam Works
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <b><StatCounter target={12} suffix="+" /></b>
                <span>Districts covered</span>
              </div>
              <div>
                <b><StatCounter target={5} /></b>
                <span>Core farming tools</span>
              </div>
              <div>
                <b><StatCounter target={24} suffix="/7" /></b>
                <span>AI chatbot support</span>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-card">
              <div className="row">
                <div className="tag">
                  <i className="fa-solid fa-cloud-sun-rain" aria-hidden="true" /> Today&apos;s Weather — Vavuniya
                </div>
                <div className="val">28°C</div>
              </div>
              <div className="row">
                <div className="tag">
                  <i className="fa-solid fa-droplet" aria-hidden="true" /> Irrigation Advisory
                </div>
                <div className="val">Evening slot</div>
              </div>
              <div className="row">
                <div className="tag">
                  <i className="fa-solid fa-leaf" aria-hidden="true" /> Disease Risk (Rice)
                </div>
                <div className="val">Low</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-strip">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i}>
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" /> {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="growth-divider">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
          <path
            d="M0,32 C300,80 400,-16 720,32 C1040,80 1140,-16 1440,32 L1440,64 L0,64 Z"
            fill="#1F7A4C"
          />
        </svg>
      </div>


      <section className="section section-light" id="features">
        <div className="container">
          <Reveal className="section-head">
            <h2 style={{ marginTop: 14 }}>Six tools. One green app.</h2>
            <p>Everything a farmer needs — from the first forecast to the final sale — in a single, easy-to-use platform.</p>
          </Reveal>
          <FeatureGrid />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">How It Works</span>
            <h2 style={{ marginTop: 14 }}>From sign-up to harvest, in four steps</h2>
          </Reveal>
          <div className="steps">
            {STEPS.map((s) => (
              <Reveal className="step" key={s.n}>
                <div className="circle">{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
                {s.n !== STEPS.length && <div className="step-line" />}
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <section className="section section-dark">
        <div className="container two-col">
          <Reveal>
            <span className="eyebrow" style={{ background: "rgba(255,255,255,.1)", color: "var(--sunrise-2)" }}>
              AI Chatbot
            </span>
            <h2 style={{ marginTop: 14, color: "#fff" }}>Ask Valam anything about your farm</h2>
            <p style={{ marginTop: 14, color: "#C4D8CC", maxWidth: 480 }}>
              Our chatbot answers farming questions and detects plant diseases from a photo — available in Tamil and
              English, day or night.
            </p>
            <ul style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <li style={{ color: "#EAF3EC", fontSize: ".94rem" }}>
                <i className="fa-solid fa-check" style={{ color: "var(--leaf-light)", marginRight: 10 }} aria-hidden="true" />
                Instant answers on crops, pests and weather
              </li>
              <li style={{ color: "#EAF3EC", fontSize: ".94rem" }}>
                <i className="fa-solid fa-check" style={{ color: "var(--leaf-light)", marginRight: 10 }} aria-hidden="true" />
                Photo-based disease diagnosis
              </li>
              <li style={{ color: "#EAF3EC", fontSize: ".94rem" }}>
                <i className="fa-solid fa-check" style={{ color: "var(--leaf-light)", marginRight: 10 }} aria-hidden="true" />
                Works in Tamil and English
              </li>
            </ul>
          </Reveal>
          <Reveal>
            <ChatPreview />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head" style={{ marginInline: "auto", textAlign: "center" }}>
            <span className="eyebrow">Farmer Voices</span>
            <h2 style={{ marginTop: 14 }}>Trusted by farmers across districts</h2>
          </Reveal>
          <TestimonialSlider items={TESTIMONIALS} />
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <Reveal className="cta-strip">
            <div>
              <h3>Ready to grow smarter?</h3>
              <p>Join farmers already using Valam for weather, disease alerts and trading.</p>
            </div>
            <Link href="/contact" className="btn btn-sun">
              Get Started Today
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
