"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialSlider } from "@/components/ui/TestimonialSlider";
import { ChatPreview } from "@/components/home/ChatPreview";
import { useLanguage } from "@/context/LanguageContext";
import { CloudSun, BookOpen, Camera, Droplet, Store, CheckCircle, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const { t, language } = useLanguage();

  const MARQUEE_ITEMS = [
    { icon: "fa-cloud-sun", label: language === "ta" ? "வானிலை முன்னறிவிப்பு & எச்சரிக்கைகள்" : language === "si" ? "කාලගුණ අනාවැකි සහ අනතුරු අඟවීම්" : "Weather Forecast & Farming Alerts" },
    { icon: "fa-seedling", label: language === "ta" ? "பயிர் வழிகாட்டிகள் — காய்கறிகள் & தானியங்கள்" : language === "si" ? "වගා මාර්ගෝපදේශ — එළවළු සහ ධාන්‍ය" : "Crop Guides — Vegetables & Grains" },
    { icon: "fa-magnifying-glass", label: language === "ta" ? "AI அரட்டை & பயிர் நோய் கண்டறிதல்" : language === "si" ? "AI සහකරු සහ රෝග හඳුනාගැනීම" : "AI Chatbot & Plant Disease Detection" },
    { icon: "fa-solar-panel", label: language === "ta" ? "நீர்ப்பாசன திட்டமிடுதல் & வழிகாட்டல்" : language === "si" ? "ජලසම්පාදන සැලසුම්කරණය" : "Smart Irrigation Planning" },
  ];

  const STEPS = [
    { n: 1, title: language === "ta" ? "பண்ணை சுயவிவரத்தை உருவாக்கவும்" : language === "si" ? "ගොවිපළ ගිණුම සාදන්න" : "Create your farm profile", text: language === "ta" ? "உங்கள் மாவட்டம், பயிர் வகை மற்றும் நில அளவை சேர்க்கவும்." : language === "si" ? "ඔබේ දිස්ත්‍රික්කය සහ ඉඩම් ප්‍රමාණය එක් කරන්න." : "Add your district, crop type and land size in two minutes." },
    { n: 2, title: language === "ta" ? "தினசரி விவசாய அறிவிப்புகளைப் பெறுக" : language === "si" ? "දෛනික වගා උපදෙස් ලබා ගන්න" : "Get daily farming alerts", text: language === "ta" ? "உங்கள் இருப்பிடத்திற்கு ஏற்ப வானிலை மற்றும் பாசன அறிவிப்புகளைப் பெறுங்கள்." : language === "si" ? "ඔබේ ස්ථානයට ගැලපෙන කාලගුණ අනතුරු ඇඟවීම් ලබා ගන්න." : "Receive weather and irrigation notifications tailored to your location." },
    { n: 3, title: language === "ta" ? "AI விவசாய துணையிடம் கேட்கவும்" : language === "si" ? "AI සහකරුගෙන් ප්‍රශ්න අසන්න" : "Ask the AI assistant", text: language === "ta" ? "புகைப்படத்தைப் பதிவேற்றி நோயைக் கண்டறியவும் அல்லது கேள்விகளைக் கேட்கவும்." : language === "si" ? "ඡායාරූපයක් එක් කර රෝග හඳුනා ගන්න නැතහොත් ප්‍රශ්න අසන්න." : "Upload a crop photo or ask any farming question in Tamil, Sinhala, or English." },
    { n: 4, title: language === "ta" ? "வளமான விளைச்சலைப் பெறுக" : language === "si" ? "සාර්ථක අස්වැන්නක් ලබා ගන්න" : "Achieve higher yields", text: language === "ta" ? "பரிந்துரைக்கப்பட்ட உரங்கள் மற்றும் நீர் அட்டவணையைப் பின்பற்றி லாபத்தைப் பெருக்கவும்." : language === "si" ? "නිර්දේශිත පොහොර සහ ජලසම්පාදන කාලසටහන භාවිතා කරන්න." : "Follow smart irrigation and fertilizer schedules for high profit." },
  ];

  const TESTIMONIALS = [
    { stars: 5, quote: "The weather alert saved my paddy field before last month's unexpected rain. I moved harvesting up by two days.", initial: "K", name: "Kumaravel S.", role: "Paddy Farmer, Vavuniya" },
    { stars: 5, quote: "I uploaded a photo of a diseased leaf and got a diagnosis in seconds. It used to take days to find an expert.", initial: "R", name: "Ranjini P.", role: "Home Gardener, Jaffna" },
    { stars: 5, quote: "The smart irrigation calculator helped me estimate my pipe requirements accurately for my brinjal field.", initial: "M", name: "Murugan T.", role: "Vegetable Farmer, Anuradhapura" },
  ];

  return (
    <>
      <Navbar active="home" />

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">
              <i className="fa-solid fa-seedling" aria-hidden="true" /> {t("smartFarming")}
            </span>
            <h1 style={{ marginTop: 18 }}>
              {language === "ta"
                ? "வானிலை, நோய் எச்சரிக்கைகள் & நீர்ப்பாசனம் — ஒரே தளத்தில்."
                : language === "si"
                ? "කාලගුණය, රෝග අනතුරු ඇඟවීම් සහ ජලසම්පාදනය — එකම ස්ථානයකින්."
                : "Weather, disease alerts & smart irrigation — all under one leaf."}
            </h1>
            <p className="lead">
              {language === "ta"
                ? "வளம் (Valam) வட மாகாண விவசாயிகளுக்காக துல்லியமான வானிலை எச்சரிக்கைகள், AI நோய் பரிசோதனை மற்றும் நீர்ப்பாசன வழிகாட்டுதலை வழங்குகிறது."
                : language === "si"
                ? "වළම් (Valam) උතුරු පළාතේ ගොවීන් සඳහා කාලගුණ අනතුරු ඇඟවීම්, AI රෝග විනිශ්චය සහ ජලසම්පාදන මාර්ගෝපදේශ ලබා දෙයි."
                : "Valam (வளம்) brings hyper-local weather warnings, AI-powered plant disease detection, and smart irrigation planning to small and medium farmers in Tamil, Sinhala, and English."}
            </p>
            <div className="hero-actions">
              <Link href="/dashboard" className="btn btn-sun">
                {t("dashboard")}
              </Link>
              <Link href="/diagnosis" className="btn btn-outline">
                {t("plantDiagnosis")}
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <b><StatCounter target={12} suffix="+" /></b>
                <span>Districts covered</span>
              </div>
              <div>
                <b><StatCounter target={100} suffix="%" /></b>
                <span>Localized i18n</span>
              </div>
              <div>
                <b><StatCounter target={24} suffix="/7" /></b>
                <span>AI Chatbot</span>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-card">
              <div className="row">
                <div className="tag">
                  <i className="fa-solid fa-cloud-sun-rain" aria-hidden="true" /> Weather — Vavuniya
                </div>
                <div className="val">28°C</div>
              </div>
              <div className="row">
                <div className="tag">
                  <i className="fa-solid fa-droplet" aria-hidden="true" /> Irrigation Advisory
                </div>
                <div className="val">Evening Slot</div>
              </div>
              <div className="row">
                <div className="tag">
                  <i className="fa-solid fa-leaf" aria-hidden="true" /> Disease Risk
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

      {/* How It Works Steps (Cleaned Layout) */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head" style={{ textAlign: "center", marginInline: "auto" }}>
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

      {/* AI Chatbot Hero Banner */}
      <section className="section section-dark">
        <div className="container two-col">
          <Reveal>
            <span className="eyebrow" style={{ background: "rgba(255,255,255,.1)", color: "#FDE047" }}>
              AI Chatbot
            </span>
            <h2 style={{ marginTop: 14, color: "#fff" }}>
              {language === "ta"
                ? "உங்கள் விவசாய கேள்விகளுக்கு AI துணையிடம் உடனடி பதில் பெறுங்கள்"
                : language === "si"
                ? "ඔබේ ගොවිපළ ගැටළු සඳහා AI සහකරුගෙන් ක්ෂණික පිළිතුරු ලබා ගන්න"
                : "Ask Valam AI anything about your farm"}
            </h2>
            <p style={{ marginTop: 14, color: "#C4D8CC", maxWidth: 480 }}>
              {language === "ta"
                ? "பயிர் சாகுபடி, பூச்சி நோய்கள் மற்றும் உர அட்டவணை பற்றிய தகவல்களை தமிழ், சிங்களம் மற்றும் ஆங்கிலத்தில் அறியலாம்."
                : language === "si"
                ? "වගා පාලනය, පලිබෝධ සහ පොහොර පිළිබඳ උපදෙස් දෙමළ, සිංහල සහ ඉංග්‍රීසි භාෂාවලින් ලබා ගත හැක."
                : "Our AI assistant answers farming queries and diagnoses crop diseases from photos — available 24/7 in Tamil, Sinhala, and English."}
            </p>
            <ul style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <li style={{ color: "#EAF3EC", fontSize: ".94rem", display: "flex", alignItems: "center" }}>
                <CheckCircle size={18} color="#10B981" style={{ marginRight: 10 }} />
                Instant answers on crops, pests and weather
              </li>
              <li style={{ color: "#EAF3EC", fontSize: ".94rem", display: "flex", alignItems: "center" }}>
                <CheckCircle size={18} color="#10B981" style={{ marginRight: 10 }} />
                Photo-based disease diagnosis
              </li>
              <li style={{ color: "#EAF3EC", fontSize: ".94rem", display: "flex", alignItems: "center" }}>
                <CheckCircle size={18} color="#10B981" style={{ marginRight: 10 }} />
                Supports Tamil (தமிழ்), Sinhala (සිංහල) &amp; English
              </li>
            </ul>
          </Reveal>
          <Reveal>
            <ChatPreview />
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head" style={{ marginInline: "auto", textAlign: "center" }}>
            <span className="eyebrow">Farmer Voices</span>
            <h2 style={{ marginTop: 14 }}>Trusted by farmers across Sri Lanka</h2>
          </Reveal>
          <TestimonialSlider items={TESTIMONIALS} />
        </div>
      </section>

      {/* Call to Action */}
      <section className="section section-light">
        <div className="container">
          <Reveal className="cta-strip">
            <div>
              <h3>Ready to grow smarter?</h3>
              <p>Join farmers using Valam for weather, disease alerts and smart irrigation.</p>
            </div>
            <Link href="/dashboard" className="btn btn-sun">
              Get Started Today
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
