"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const FEATURES = [
  { num: "01", href: "/chatbot?topic=weather", img: "/images/weather-alerts.jpg", alt: "Farmer checking AI weather forecast in the field", icon: "fa-cloud-sun-rain", title: "Weather Forecast & Farming Alerts", text: "District and village-level forecasts with irrigation and rainfall warnings sent straight to your phone.", cta: "Chat about this" },
  { num: "02", href: "/crop-simulator", img: "/images/crop-guide.jpg", alt: "Fresh harvested vegetables and crops", icon: "fa-book-open", title: "Crop Guides — Vegetables, Fruits, Rice & Spices", text: "Step-by-step growing guides, plus an AI Digital Twin that simulates your crop cycle in 30 seconds.", cta: "Simulate Your Crop Twin" },
  { num: "03", href: "/pest-radar", img: "/images/ai-chatbot.jpg", alt: "Farmer scanning a crop leaf with the AI chatbot app", icon: "fa-camera-retro", title: "AI Chatbot & Plant Disease Detection", text: "Ask a farming question or record insect sounds for instant pest identification.", cta: "Detect a pest" },
  { num: "04", href: "/irrigation-solar", img: "/images/irrigation-solar.jpg", alt: "Solar-powered irrigation pump watering crops", icon: "fa-solar-panel", title: "Irrigation & Solar Farming Guidance", text: "An AI Solar Farming Assistant — price tracking, system recommendations, subsidy checks and daily setup guidance.", cta: "Try the Solar Assistant" },
  { num: "05", href: "/chatbot?topic=marketplace", img: "/images/marketplace.jpg", alt: "Assorted vegetable seed packets", icon: "fa-store", title: "Seeds & Fertilizer Marketplace", text: "Buy and sell seeds, fertilizer and organic products directly — no middlemen involved.", cta: "Chat about this" },
];

export function FeatureGrid() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  function handleCardClick(e: React.MouseEvent, href: string) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push(href);
    }
  }

  return (
    <div className="feature-grid">
      {FEATURES.map((f) => (
        <a
          href={f.href}
          onClick={(e) => handleCardClick(e, f.href)}
          className="feature-card reveal"
          key={f.num}
          style={{ cursor: "pointer" }}
        >
          <span className="num">{f.num}</span>
          <div className="feature-pic">
            <Image src={f.img} alt={f.alt} fill sizes="(max-width: 980px) 100vw, 33vw" />
          </div>
          <div className="feature-icon">
            <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
          </div>
          <h3>{f.title}</h3>
          <p>{f.text}</p>
          <span className="more">
            {f.cta} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </span>
        </a>
      ))}
    </div>
  );
}
