"use client";

import { useEffect, useState } from "react";

// Ports the "back to top" scroll-visibility logic from js/script.js.
export function useBackToTop(threshold = 480) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return { visible, scrollToTop };
}
