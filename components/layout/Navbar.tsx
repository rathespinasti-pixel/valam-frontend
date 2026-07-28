"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NavAuth } from "./NavAuth";
import logo from "@/public/images/logo.png";

type NavKey = "home" | "about" | "features" | "marketplace" | "contact";

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Home" },
  { key: "about", href: "/about", label: "About" },
  { key: "features", href: "/services", label: "Features" },
  { key: "marketplace", href: "/marketplace", label: "Marketplace" },
  { key: "contact", href: "/contact", label: "Contact" },
];

interface NavbarProps {
  /** Which top-level link renders with the active underline on this page (matches the original per-page markup 1:1). */
  active?: NavKey;
  /** The secondary (orange) CTA — every page uses "Try the App" -> /services, except /services itself which uses "See Plans" -> #plans. */
  ctaHref?: string;
  ctaLabel?: string;
}

export function Navbar({ active, ctaHref = "/services", ctaLabel = "Try the App" }: NavbarProps) {
  const [open, setOpen] = useState(false);

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

        <nav className={`nav-links${open ? " open" : ""}`}>
          {LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={link.key === active ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-cta">
          <NavAuth />
          <Link href="/contact" className="btn btn-outline">
            Get in touch
          </Link>
          <Link href={ctaHref} className="btn btn-sun">
            {ctaLabel}
          </Link>
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
