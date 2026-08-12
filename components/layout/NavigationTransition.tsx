"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ParamListener({ onReset }: { onReset: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onReset();
  }, [pathname, searchParams, onReset]);

  return null;
}

export function NavigationTransition({ children }: { children: React.ReactNode }) {
  const [navigating, setNavigating] = useState(false);

  const resetNavigating = () => {
    setNavigating(false);
  };

  return (
    <>
      <Suspense fallback={null}>
        <ParamListener onReset={resetNavigating} />
      </Suspense>
      {navigating ? (
        <main className="route-transition" role="status" aria-live="polite">
          <span className="route-transition-spinner" aria-hidden="true" />
          <span>Loading...</span>
        </main>
      ) : (
        children
      )}
    </>
  );
}
