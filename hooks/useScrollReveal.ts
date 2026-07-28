"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Ports the scroll-reveal IntersectionObserver from js/script.js.
// Any element with className "reveal" fades/slides in once it enters
// the viewport; re-runs on route change since the App Router keeps
// this mounted once at the root layout.
export function useScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal:not(.in)");
    if (!revealEls.length) return;

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [pathname]);
}
