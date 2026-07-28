"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// Ports the "nav-auth" login/register <-> Hi, {name} / Log out swap
// from js/script.js into a small client component the Navbar renders
// once per header instance (desktop + mobile use the same markup).
export function NavAuth() {
  const { user, isLoggedIn, loading, logout } = useAuth();

  if (loading) return <span className="nav-auth" />;

  if (isLoggedIn && user) {
    return (
      <span className="nav-auth">
        <span className="nav-user">Hi, {user.full_name.split(" ")[0]}</span>
        <button type="button" className="nav-logout" onClick={() => logout()}>
          Log out
        </button>
      </span>
    );
  }

  return (
    <span className="nav-auth">
      <Link href="/login">Log in</Link>
      <Link href="/register">Sign up</Link>
    </span>
  );
}
