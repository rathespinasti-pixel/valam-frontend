"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
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

  const resetNavigating = useCallback(() => {
    setNavigating(false);
  }, []);

  useEffect(() => {
    const startNavigation = () => setNavigating(true);
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = (...args) => {
      const nextUrl = args[2];
      if (nextUrl && new URL(String(nextUrl), window.location.href).href !== window.location.href) startNavigation();
      return originalPushState(...args);
    };
    window.history.replaceState = (...args) => {
      const nextUrl = args[2];
      if (nextUrl && new URL(String(nextUrl), window.location.href).href !== window.location.href) startNavigation();
      return originalReplaceState(...args);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin === window.location.origin && destination.href !== window.location.href) startNavigation();
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

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
