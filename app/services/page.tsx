import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

export const metadata: Metadata = {
  title: "Features & Services — Valam",
};

const QUICK_NAV = [
  { href: "#weather", icon: "fa-cloud-sun-rain", label: "Weather Alerts" },
  { href: "#crop-guides", icon: "fa-book-open", label: "Crop Guides" },
  { href: "#ai-chatbot", icon: "fa-camera-retro", label: "AI Chatbot" },
  { href: "#irrigation-solar", icon: "fa-solar-panel", label: "Irrigation & Solar" },
  { href: "#marketplace", icon: "fa-store", label: "Marketplace" },
];

const SERVICES = [
  {
    id: "weather",
    img: "/images/weather-alerts.jpg",
    alt: "Farmer checking AI weather forecast in the field",
    icon: "fa-cloud-sun-rain",
    title: "Weather Forecast & Farming Alerts",
    text: "Get village-level forecasts, rainfall warnings and best-time-to-irrigate suggestions, pushed straight to your phone before conditions change.",
    links: [{ href: "/chatbot?topic=weather", label: "Chat about this" }],
  },
  {
    id: "crop-guides",
    img: "/images/crop-guide.jpg",
    alt: "Fresh harvested vegetables and crops",
    icon: "fa-book-open",
    title: "Crop Guide for Vegetables, Fruits, Rice & Spices",
    text: "Practical, step-by-step growing guides — covering soil prep, sowing, feeding and harvest timing for every major crop type.",
    links: [
      { href: "/chatbot?topic=crop-guides", label: "Chat about this" },
      { href: "/crop-simulator", label: "Simulate Your Crop Twin" },
    ],
  },
  {
    id: "ai-chatbot",
    img: "/images/ai-chatbot.jpg",
    alt: "Farmer scanning a crop leaf with the AI chatbot app",
    icon: "fa-camera-retro",
    title: "AI Farming Chatbot & Plant Disease Detection",
    text: "Ask a farming question anytime, or record insect sounds with the Acoustic Radar — our AI identifies likely pests and recommends a treatment plan in seconds.",
    links: [{ href: "/pest-radar", label: "Detect a pest" }],
  },
  {
    id: "irrigation-solar",
    img: "/images/irrigation-solar.jpg",
    alt: "Solar-powered irrigation pump watering crops",
    icon: "fa-solar-panel",
    title: "Irrigation & Solar Farming Guidance",
    text: "Cost breakdowns, subsidy eligibility checks and setup guidance for solar pumps and drip irrigation systems.",
    links: [{ href: "/irrigation-solar", label: "Try the Solar Assistant" }],
  },
  {
    id: "marketplace",
    img: "/images/marketplace.jpg",
    alt: "Assorted vegetable seed packets",
    icon: "fa-store",
    title: "Seeds & Fertilizer Marketplace",
    text: "Buy and sell directly with verified sellers — quality seeds, fertilizer, organic products and farming equipment, no middlemen markup.",
    links: [{ href: "/marketplace", label: "Visit the Marketplace" }],
  },
];

const FAQ_ITEMS = [
  { question: "Do I need internet access to use Valam?", answer: "Weather alerts and disease detection need a connection, but crop guides and past alerts stay available offline once loaded." },
  { question: "Is Valam available in Tamil?", answer: "Yes — the entire app, including the AI chatbot, works in both Tamil and English." },
  { question: "How accurate is the disease detection?", answer: "The AI model is trained on common regional crop diseases and gives a confidence score with every result, alongside a recommendation to consult a local expert for serious cases." },
  { question: "Who can sell on the marketplace?", answer: "Verified sellers — including farmers, cooperatives and licensed fertilizer/seed dealers — after a short verification step." },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar active="features" ctaHref="#plans" ctaLabel="See Plans" />

      <section className="page-hero">
        <div className="container">
          <div className="crumb">Home / Features</div>
          <h1>Everything your farm needs, in six tools</h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 560 }}>
            Each Valam module solves a specific problem farmers told us about — no unnecessary extras.
          </p>
        </div>
      </section>

      <nav className="feature-quicknav" aria-label="Jump to a feature">
        <div className="container feature-quicknav-inner">
          {QUICK_NAV.map((q) => (
            <a href={q.href} key={q.href}>
              <i className={`fa-solid ${q.icon}`} aria-hidden="true" /> {q.label}
            </a>
          ))}
        </div>
      </nav>

      <section className="section">
        <div className="container">
          {SERVICES.map((s) => (
            <Reveal as="section" id={s.id} className="service-detail" key={s.id}>
              <div className="service-pic">
                <Image src={s.img} alt={s.alt} fill sizes="220px" />
              </div>
              <div>
                <div className="feature-icon">
                  <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
                  {s.links.map((l) => (
                    <Link href={l.href} className="more" key={l.href}>
                      {l.label} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-light" id="plans">
        <div className="container">
          <Reveal className="section-head" style={{ marginInline: "auto", textAlign: "center" }}>
            <span className="eyebrow">Plans</span>
            <h2 style={{ marginTop: 14 }}>Simple pricing for every farm size</h2>
          </Reveal>
          <div className="plan-grid">
            <Reveal className="plan-card">
              <h4>Starter</h4>
              <div className="price">Free</div>
              <ul>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Weather &amp; irrigation alerts</li>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Basic crop guides</li>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Community access</li>
              </ul>
              <Link href="/contact" className="btn btn-outline-dark btn-block">
                Get Started
              </Link>
            </Reveal>
            <Reveal className="plan-card featured">
              <h4>Grower</h4>
              <div className="price">
                Rs. 350<span>/month</span>
              </div>
              <ul>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Everything in Starter</li>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Unlimited AI disease scans</li>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Marketplace selling tools</li>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Priority chatbot support</li>
              </ul>
              <Link href="/contact" className="btn btn-primary btn-block">
                Choose Grower
              </Link>
            </Reveal>
            <Reveal className="plan-card">
              <h4>Cooperative</h4>
              <div className="price">Custom</div>
              <ul>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Everything in Grower</li>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Multi-farmer group dashboard</li>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Bulk marketplace pricing</li>
                <li><i className="fa-solid fa-circle-check" aria-hidden="true" />Dedicated onboarding</li>
              </ul>
              <Link href="/contact" className="btn btn-outline-dark btn-block">
                Contact Sales
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="two-col">
            <Reveal>
              <span className="eyebrow">FAQ</span>
              <h2 style={{ marginTop: 14 }}>Common questions</h2>
            </Reveal>
            <Reveal>
              <FaqAccordion items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <Reveal className="cta-strip">
            <div>
              <h3>Have a specific question?</h3>
              <p>Our team replies within 24 hours.</p>
            </div>
            <Link href="/contact" className="btn btn-sun">
              Contact Us
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
