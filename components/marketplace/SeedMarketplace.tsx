"use client";

import { useState } from "react";

interface SeedCard {
  cat: string;
  emoji: string;
  filter: string;
  title: string;
  seller: string;
  soil: string;
  season: string;
  harvest: string;
  price: string;
  rating: number;
}

const TABS: { filter: string; label: string }[] = [
  { filter: "all", label: "All" },
  { filter: "tomato", label: "🍅 Tomato" },
  { filter: "chilli", label: "🌶️ Chilli" },
  { filter: "cucumber", label: "🥒 Cucumber" },
  { filter: "carrot", label: "🥕 Carrot" },
  { filter: "lettuce", label: "🥬 Lettuce" },
  { filter: "beans", label: "🫘 Beans" },
  { filter: "brinjal", label: "🍆 Brinjal" },
];

const SEEDS: SeedCard[] = [
  { cat: "Tomato Seeds", emoji: "🍅", filter: "tomato", title: "Hybrid Tomato — F1 Variety", seller: "Green Valley Seeds", soil: "Suitable for loamy & red soil", season: "Season: Year-round (best in dry season)", harvest: "Harvest: ~70 days", price: "Rs. 180", rating: 4.6 },
  { cat: "Chilli Seeds", emoji: "🌶️", filter: "chilli", title: "Green Chilli — High Yield", seller: "Sunrise Agro", soil: "Suitable for sandy loam soil", season: "Season: Dry season", harvest: "Harvest: ~90 days", price: "Rs. 150", rating: 5 },
  { cat: "Cucumber Seeds", emoji: "🥒", filter: "cucumber", title: "Cucumber — Long Green", seller: "Farmers Direct Co-op", soil: "Suitable for well-drained loamy soil", season: "Season: Warm, dry weather", harvest: "Harvest: ~55 days", price: "Rs. 140", rating: 4 },
  { cat: "Carrot Seeds", emoji: "🥕", filter: "carrot", title: "Carrot — Nantes Variety", seller: "Green Valley Seeds", soil: "Suitable for loose, sandy soil", season: "Season: Cool season", harvest: "Harvest: ~75 days", price: "Rs. 120", rating: 4 },
  { cat: "Lettuce Seeds", emoji: "🥬", filter: "lettuce", title: "Lettuce — Iceberg", seller: "Sunrise Agro", soil: "Suitable for fertile loamy soil", season: "Season: Cool season", harvest: "Harvest: ~45 days", price: "Rs. 110", rating: 4.5 },
  { cat: "Beans Seeds", emoji: "🫘", filter: "beans", title: "Bush Beans — Green Pod", seller: "Farmers Direct Co-op", soil: "Suitable for well-drained soil", season: "Season: Warm season", harvest: "Harvest: ~60 days", price: "Rs. 130", rating: 4 },
  { cat: "Brinjal Seeds", emoji: "🍆", filter: "brinjal", title: "Brinjal — Long Purple", seller: "Green Valley Seeds", soil: "Suitable for red & loamy soil", season: "Season: Year-round", harvest: "Harvest: ~80 days", price: "Rs. 160", rating: 4.5 },
];

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;
  return (
    <span className="seed-rating">
      {Array.from({ length: full }).map((_, i) => (
        <i key={i} className="fa-solid fa-star" aria-hidden="true" />
      ))}
      {half && <i className="fa-solid fa-star-half-stroke" aria-hidden="true" />}
      <span>{rating}</span>
    </span>
  );
}

// Ports js/marketplace.js: clicking a tab filters #seed-grid cards by data-cat.
export function SeedMarketplace() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <>
      <div className="seed-tabs reveal" id="seed-tabs">
        {TABS.map((t) => (
          <button
            key={t.filter}
            type="button"
            className={`seed-tab${activeFilter === t.filter ? " active" : ""}`}
            onClick={() => setActiveFilter(t.filter)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="market-grid" id="seed-grid">
        {SEEDS.map((s) => (
          <div
            className="seed-card reveal in"
            key={s.title}
            style={{ display: activeFilter === "all" || activeFilter === s.filter ? undefined : "none" }}
          >
            <div className="seed-card-thumb">{s.emoji}</div>
            <div className="seed-card-body">
              <span className="cat">{s.cat}</span>
              <h4>{s.title}</h4>
              <div className="seed-card-meta">
                <span>
                  <i className="fa-solid fa-user" aria-hidden="true" /> Sold by {s.seller}
                </span>
                <span>
                  <i className="fa-solid fa-mound" aria-hidden="true" /> {s.soil}
                </span>
                <span>
                  <i className="fa-solid fa-cloud-sun" aria-hidden="true" /> {s.season}
                </span>
                <span>
                  <i className="fa-solid fa-calendar-check" aria-hidden="true" /> {s.harvest}
                </span>
              </div>
              <div className="seed-card-foot">
                <span className="price">{s.price}</span>
                <Stars rating={s.rating} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
