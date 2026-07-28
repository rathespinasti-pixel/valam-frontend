"use client";

import { useCountUp } from "@/hooks/useCountUp";

export function StatCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const { ref, text } = useCountUp(target, { suffix });
  return <span ref={ref}>{text}</span>;
}
