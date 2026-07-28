"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarDrawer } from "./SidebarDrawer";
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
  | "contact"
  | "irrigation-solar"
  | "profile"
  | "settings";

interface NavbarProps {
  active?: NavKey;
  pageTitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function Navbar({ active, pageTitle }: NavbarProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuth();

  async function handleLogout() {
    await logout();
    setSidebarOpen(false);
    router.push("/login");
  }

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          {/* Logo Brand */}
          <Link href="/" className="brand">
            <Image src={logo} alt="Valam logo" priority />
            <span className="brand-text">
              <b>வளம் · Valam</b>
              <span>{pageTitle || "Smart Farming Assistant"}</span>
            </span>
          </Link>

          {/* Navigation Items / Top Bar Actions */}
          <div className="nav-cta">
            {!loading && isLoggedIn && user ? (
              // Authenticated User Top Bar: Minimal & Clean (No crowded links)
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Notifications Bell Icon */}
                <button
                  type="button"
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s ease",
                  }}
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell size={18} />
                  <span
                    style={{
                      position: "absolute",
                      top: 7,
                      right: 7,
                      width: 8,
                      height: 8,
                      backgroundColor: "#EF4444",
                      borderRadius: "50%",
                    }}
                  />
                </button>

                {/* User Avatar / Profile Pill */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px 6px 8px",
                    borderRadius: 24,
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#10B981",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    Hi, {user.full_name.split(" ")[0]}
                  </span>
                </button>

                {/* Hamburger Menu Toggle Button */}
                <button
                  type="button"
                  className="nav-toggle"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-label="Open application navigation menu"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={22} />
                </button>
              </div>
            ) : (
              // Public User Navigation Bar: Login & Get Started only
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/login" className="btn btn-outline" style={{ padding: "8px 16px" }}>
                  Login
                </Link>
                <Link href="/register" className="btn btn-sun" style={{ padding: "8px 18px" }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Responsive Sidebar Drawer for Authenticated Users */}
      {isLoggedIn && (
        <SidebarDrawer
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onLogout={handleLogout}
          activeKey={active}
        />
      )}
    </>
  );
}
