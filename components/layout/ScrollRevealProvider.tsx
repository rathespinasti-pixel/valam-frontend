"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

// Mounted once in the root layout; has no output of its own, it just
// runs the shared scroll-reveal IntersectionObserver against every
// ".reveal" element on the page (see hooks/useScrollReveal.ts).
export function ScrollRevealProvider() {
  useScrollReveal();
  return null;
}
