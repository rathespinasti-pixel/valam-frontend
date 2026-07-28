import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { PRICE_TABLE } from "@/lib/solarData";
import { RecommendationForm } from "@/components/irrigation-solar/RecommendationForm";
import { SubsidyForm } from "@/components/irrigation-solar/SubsidyForm";

export const metadata: Metadata = {
  title: "AI Solar Farming Assistant — Irrigation & Solar Guidance — Valam",
  description:
    "An AI-based solar farming assistant that recommends suitable solar pumps, tracks equipment prices, checks subsidy eligibility, guides installation day-by-day, and sends maintenance reminders.",
};

const DAY_GUIDE = [
  { day: 1, icon: "fa-sun", title: "Solar Site Check", tasks: ["Select proper sunlight area", "Check installation location"] },
  { day: 2, icon: "fa-screwdriver-wrench", title: "Solar Panel Installation", tasks: ["Mounting structure setup", "Cable connection checking"] },
  { day: 3, icon: "fa-droplet", title: "Pump Installation", tasks: ["Connect DC pump", "Test water flow"] },
  { day: 4, icon: "fa-seedling", title: "Drip Irrigation Setup", tasks: ["Install pipes", "Connect drip lines"] },
  { day: 5, icon: "fa-chart-simple", title: "System Monitoring", tasks: ["Check water output", "Check solar performance"] },
];

const MAINTENANCE = [
  { icon: "fa-solar-panel", title: "Panel Cleaning", text: "Your solar panel needs cleaning after 30 days for better efficiency.", due: "Due in 6 days" },
  { icon: "fa-gears", title: "Pump Maintenance", text: "Check pump bearings, seals and motor sound every 3 months.", due: "Due in 24 days" },
  { icon: "fa-water", title: "Pipe Checking", text: "Inspect drip lines and pipes monthly for leaks or blockages.", due: "Due in 12 days" },
  { icon: "fa-car-battery", title: "Battery / Controller Status", text: "Check battery charge levels and controller readings every 2 weeks.", due: "Due in 3 days" },
];

export default function IrrigationSolarPage() {
  return (
    <>
      <Navbar />

      <section className="page-hero">
        <div className="container">
          <div className="crumb">Home / Features / Irrigation &amp; Solar Farming Guidance</div>
          <h1>
            <i className="fa-solid fa-solar-panel" aria-hidden="true" /> AI Solar Farming Assistant
          </h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 640 }}>
            Choose the right solar irrigation system, track equipment prices, check subsidy eligibility and get
            day-by-day AI guidance from setup to maintenance.
          </p>
          <div className="hero-chip-row">
            <span className="hero-chip">
              <i className="fa-solid fa-chart-line" aria-hidden="true" /> Live price tracker
            </span>
            <span className="hero-chip">
              <i className="fa-solid fa-brain" aria-hidden="true" /> AI system recommendation
            </span>
            <span className="hero-chip">
              <i className="fa-solid fa-hand-holding-dollar" aria-hidden="true" /> Subsidy checker
            </span>
          </div>
        </div>
      </section>

      <section className="section" id="price-tracker">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 1</span>
            <h2 style={{ marginTop: 14 }}>AI Solar Pump Price Tracker</h2>
            <p>The AI system continuously tracks solar irrigation equipment prices and shows farmers the latest market rates.</p>
          </Reveal>
          <div className="solar-table-wrap reveal">
            <table className="solar-table">
              <thead>
                <tr>
                  <th>Solar Panel Capacity</th>
                  <th>Pump Capacity</th>
                  <th>Suitable Farm Area</th>
                  <th>Approx. Price (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {PRICE_TABLE.map((row) => (
                  <tr key={row.panel}>
                    <td>{row.panel}</td>
                    <td>{row.pump}</td>
                    <td>{row.area}</td>
                    <td className="price">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section-light" id="recommendation">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 2</span>
            <h2 style={{ marginTop: 14 }}>AI Solar Recommendation System</h2>
            <p>Enter your farm details and the AI recommends the right panel, pump, irrigation method and estimated cost.</p>
          </Reveal>
          <RecommendationForm />
        </div>
      </section>

      <section className="section" id="day-guide">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 3</span>
            <h2 style={{ marginTop: 14 }}>One Day - One Day Solar Farming Guidance</h2>
            <p>The AI gives daily, step-by-step guidance from site check to full system monitoring.</p>
          </Reveal>
          <div className="day-guide reveal">
            {DAY_GUIDE.map((d) => (
              <div className="day-item" key={d.day}>
                <div className="day-badge">DAY {d.day}</div>
                <div>
                  <h4>
                    <i className={`fa-solid ${d.icon}`} style={{ color: "var(--sunrise)" }} aria-hidden="true" /> {d.title}
                  </h4>
                  <ul>
                    {d.tasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-light" id="smart-irrigation">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 4</span>
            <h2 style={{ marginTop: 14 }}>Smart Irrigation Guidance</h2>
            <p>The AI monitors soil moisture, weather conditions and crop water requirement, then sends real-time alerts.</p>
          </Reveal>
          <div className="alert-row reveal">
            <div className="alert-card rain">
              <i className="fa-solid fa-cloud-showers-heavy" aria-hidden="true" />
              <p>
                <b>Rain expected tomorrow.</b> Reduce irrigation by 40% to avoid waterlogging.
              </p>
            </div>
            <div className="alert-card">
              <i className="fa-solid fa-droplet-slash" aria-hidden="true" />
              <p>
                <b>Soil moisture is low.</b> Run the solar pump for 2 hours this evening.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="subsidy-checker">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 5</span>
            <h2 style={{ marginTop: 14 }}>Subsidy Eligibility Checker</h2>
            <p>Check available government support for your solar irrigation setup, required documents and the application process.</p>
          </Reveal>
          <SubsidyForm />
        </div>
      </section>

      <section className="section section-light" id="maintenance">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Main Feature 6</span>
            <h2 style={{ marginTop: 14 }}>Solar Maintenance Assistant</h2>
            <p>The AI sends timely reminders so your solar irrigation system keeps running at peak efficiency.</p>
          </Reveal>
          <div className="maint-grid reveal">
            {MAINTENANCE.map((m) => (
              <div className="maint-card" key={m.title}>
                <i className={`fa-solid ${m.icon}`} aria-hidden="true" />
                <h4>{m.title}</h4>
                <p>{m.text}</p>
                <span className="due">{m.due}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
