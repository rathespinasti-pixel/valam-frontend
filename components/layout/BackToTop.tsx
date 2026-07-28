"use client";

import { ArrowUp } from "lucide-react";
import { useBackToTop } from "@/hooks/useBackToTop";

export function BackToTop() {
  const { visible, scrollToTop } = useBackToTop();

  return (
    <button
      type="button"
      className={`to-top${visible ? " show" : ""}`}
      aria-label="Back to top"
      onClick={scrollToTop}
    >
      <ArrowUp size={18} />
    </button>
  );
}
