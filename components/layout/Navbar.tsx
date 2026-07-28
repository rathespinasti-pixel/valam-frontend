"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NavAuth } from "./NavAuth";
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
  | "about"
  | "contact";

const LINKS: { key: NavKey; href: string; label: string }[] = [
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

export function Navbar({ active, ctaHref = "/dashboard", ctaLabel = "Farmer Hub" }: NavbarProps) {
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
