"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/public/images/logo.png";

type NavKey =
  | "home"
  | "dashboard"
  | "crops"
  | "guides"
  | "weather"
  | "diagnosis"
  | "community"
  | "tools"
  | "marketplace"
  | "chatbot"
  | "features"
  | "about"
  | "contact";

const AUTHENTICATED_LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Home" },
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "crops", href: "/crops", label: "Crops" },
  { key: "guides", href: "/guides", label: "Guides" },
  { key: "weather", href: "/weather", label: "Weather" },
  { key: "diagnosis", href: "/diagnosis", label: "Diagnosis" },
  { key: "community", href: "/community", label: "Community" },
  { key: "tools", href: "/tools", label: "Tools" },
  { key: "marketplace", href: "/marketplace", label: "Market" },
  { key: "chatbot", href: "/chatbot", label: "AI Chat" },
];

interface NavbarProps {
  active?: NavKey;
  ctaHref?: string;
  ctaLabel?: string;
}

export function Navbar({ active }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          <Image src={logo} alt="Valam logo" priority />
          <span className="brand-text">
            <b>வளம் · Valam</b>
            <span>Smart Farming Assistant</span>
          </span>
        </Link>

        {/* Public vs Authenticated Navigation */}
        <nav className={`nav-links${open ? " open" : ""}`}>
          {!loading && isLoggedIn ? (
            AUTHENTICATED_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={link.key === active ? "active" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))
          ) : (
            // Public Navigation: Display only Login and Get Started
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </nav>

        <div className="nav-cta">
          {!loading && isLoggedIn && user ? (
            <span className="nav-auth">
              <span className="nav-user">Hi, {user.full_name.split(" ")[0]}</span>
              <button type="button" className="nav-logout" onClick={() => logout()}>
                Log out
              </button>
            </span>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/login" className="btn btn-outline" style={{ padding: "8px 16px" }}>
                Login
              </Link>
              <Link href="/register" className="btn btn-sun" style={{ padding: "8px 18px" }}>
                Get Started
              </Link>
            </div>
          )}
          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
