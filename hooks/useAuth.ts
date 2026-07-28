"use client";

import { useCallback, useEffect, useState } from "react";
import { ValamAPI } from "@/lib/api";
import type { ValamUser } from "@/lib/types";

// Ports the nav-auth-state logic from js/script.js into a reusable hook:
// shows the cached user immediately, then revalidates against /auth/me.
export function useAuth() {
  const [user, setUser] = useState<ValamUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reading localStorage/session state must wait until after mount (it's
    // unavailable during SSR); the immediate setLoading(false) below is safe
    // and intentional, not a cascading-render footgun.
    if (!ValamAPI.isLoggedIn()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    const cached = ValamAPI.getStoredUser();
    if (cached) setUser(cached);

    ValamAPI.me()
      .then((fresh) => setUser(fresh))
      .catch(() => {
        ValamAPI.clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await ValamAPI.logout();
    setUser(null);
  }, []);

  return { user, isLoggedIn: !!user, loading, logout };
}
