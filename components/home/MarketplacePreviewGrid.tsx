"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ValamAPI } from "@/lib/api";
import type { Product } from "@/lib/types";

const STATIC_FALLBACK = [
  { icon: "fa-seedling", cat: "Seeds", name: "Paddy Seed — TN1 Variety", price: "Rs. 850", badge: "In stock" },
  { icon: "fa-jug-detergent", cat: "Fertilizer", name: "Organic Compost 25kg", price: "Rs. 1,200", badge: "In stock" },
  { icon: "fa-droplet", cat: "Irrigation", name: "Drip Irrigation Starter Kit", price: "Rs. 4,500", badge: "Popular" },
  { icon: "fa-solar-panel", cat: "Solar", name: "Solar Water Pump 1HP", price: "Rs. 38,000", badge: "Subsidy eligible" },
];

const CATEGORY_ICONS: Record<string, string> = {
  seeds: "fa-seedling",
  fertilizer: "fa-jug-detergent",
  irrigation: "fa-droplet",
  solar: "fa-solar-panel",
};

export function MarketplacePreviewGrid() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    ValamAPI.getProducts({ per_page: 4 })
      .then((data) => {
        const items = data.items || [];
        if (items.length) setLiveProducts(items);
      })
      .catch(() => {
        /* API unreachable — keep the static preview cards */
      });
  }, []);

  function handleViewMore(e: React.MouseEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push("/marketplace");
    }
  }

  if (!liveProducts) {
    return (
      <div className="market-grid" data-live="pending">
        {STATIC_FALLBACK.map((p) => (
          <div
            className="market-card reveal in"
            key={p.name}
            onClick={handleViewMore}
            style={{ cursor: "pointer" }}
          >
            <div className="market-thumb">
              <i className={`fa-solid ${p.icon}`} aria-hidden="true" />
            </div>
            <div className="market-body">
              <span className="cat">{p.cat}</span>
              <h4>{p.name}</h4>
              <div className="price-row">
                <span className="price">{p.price}</span>
                <button type="button" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={handleViewMore}>
                  View More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="market-grid" data-live="true">
      {liveProducts.map((p) => {
        const icon = CATEGORY_ICONS[(p.category || "").toLowerCase()] || "fa-store";
        const price = Number(p.price).toLocaleString("en-LK", { minimumFractionDigits: 0 });
        return (
          <div
            className="market-card reveal in"
            key={p.id}
            onClick={handleViewMore}
            style={{ cursor: "pointer" }}
          >
            <div className="market-thumb">
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
            </div>
            <div className="market-body">
              <span className="cat">{p.category || ""}</span>
              <h4>{p.name}</h4>
              <div className="price-row">
                <span className="price">Rs. {price}</span>
                <button type="button" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={handleViewMore}>
                  View More
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
