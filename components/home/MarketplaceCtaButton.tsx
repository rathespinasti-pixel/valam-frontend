"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function MarketplaceCtaButton() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push("/marketplace");
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: 36 }}>
      <button
        type="button"
        onClick={handleClick}
        className="btn btn-primary"
        style={{ cursor: "pointer" }}
      >
        Visit Full Marketplace
      </button>
    </div>
  );
}
