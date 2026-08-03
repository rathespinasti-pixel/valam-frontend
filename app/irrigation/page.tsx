"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IrrigationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/irrigation-solar");
  }, [router]);

  return null;
}
