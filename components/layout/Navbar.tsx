"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  LayoutDashboard,
  CloudSun,
  BookOpen,
  Bot,
  Stethoscope,
  Sun,
  ShoppingBag,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarDrawer } from "./SidebarDrawer";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
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
  | "settings"
  | "admin";

interface NavbarProps {
  active?: NavKey;
  pageTitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function Navbar({ active, pageTitle }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuth();
  const { t } = useLanguage();

  async function handleLogout() {
    await logout();
    setSidebarOpen(false);
    router.push("/login");
  }

  const isAdminUser = user?.role === "admin" || user?.role === "super_admin";

  const topNavLinks = [
    { key: "dashboard", href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { key: "weather", href: "/weather", label: t("weatherForecast"), icon: CloudSun },
    { key: "guides", href: "/guides", label: t("cropGuide"), icon: BookOpen },
    { key: "chatbot", href: "/chatbot", label: t("aiChatbot"), icon: Bot },
    { key: "diagnosis", href: "/diagnosis", label: t("plantDiagnosis"), icon: Stethoscope },
    { key: "marketplace", href: "/marketplace", label: t("marketplace"), icon: ShoppingBag },
    { key: "community", href: "/community", label: t("community"), icon: Users },
    { key: "settings", href: "/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <>
      <header className="site-header">
        <div className="container nav" style={{ gap: 16 }}>
          {/* Logo Brand */}
          <Link href="/" className="brand" style={{ flexShrink: 0 }}>
            <Image src={logo} alt="Valam logo" priority />
            <span className="brand-text">
              <b>{t("appName")}</b>
              <span>{pageTitle || t("smartFarming")}</span>
            </span>
          </Link>

          {/* Desktop Horizontal Top Bar Navigation Menu (No Scroll) */}
          {!loading && isLoggedIn && user && (
            <nav className="desktop-top-nav" style={{ flex: 1, justifyContent: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", padding: "4px 0" }}>
                {topNavLinks.map((item) => {
                  const isActive = active === item.key || pathname === item.href;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`topbar-nav-btn ${isActive ? "active" : ""}`}
                    >
                      <item.icon size={15} color={isActive ? "#FFFFFF" : "#059669"} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Admin Portal Link for Desktop */}
                {isAdminUser && (
                  <Link
                    href="/admin"
                    className={`topbar-admin-btn ${pathname === "/admin" ? "active" : ""}`}
                  >
                    <ShieldCheck size={15} color={pathname === "/admin" ? "#FFFFFF" : "#B45309"} />
                    <span>Admin Portal</span>
                  </Link>
                )}
              </div>
            </nav>
          )}

          {/* Right Action Controls: Language Switcher, User Profile, Logout & Mobile Menu Toggle */}
          <div className="nav-cta" style={{ flexShrink: 0 }}>
            {!loading && isLoggedIn && user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Desktop User Avatar & Profile Pill */}
                <div className="desktop-user-pill" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "5px 12px 5px 6px",
                      borderRadius: 999,
                      background: "#FFFFFF",
                      border: "1px solid rgba(27, 77, 62, 0.18)",
                      color: "#1B4D3E",
                      whiteSpace: "nowrap",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #10B981, #059669)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 12,
                        boxShadow: "0 2px 4px rgba(16, 185, 129, 0.25)",
                      }}
                    >
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {user.full_name.split(" ")[0]}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Logout"
                    className="btn-logout-pill"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "1px solid #FECDD3",
                      background: "#FFF1F2",
                      color: "#991B1B",
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      boxShadow: "0 1px 3px rgba(225, 29, 72, 0.08)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>

                {/* Mobile Navigation Sidebar Toggle Icon (Mobile View Only) */}
                <button
                  type="button"
                  className="mobile-nav-toggle btn-toggle"
                  style={{
                    background: "rgba(27, 77, 62, 0.1)",
                    border: "none",
                    color: "#1B4D3E",
                    padding: 8,
                    borderRadius: 8,
                  }}
                  aria-label="Open mobile navigation sidebar"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={22} />
                </button>
              </div>
            ) : (
              /* Public Visitor Navigation Bar */
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LanguageSwitcher />
                <Link href="/login" className="btn btn-outline" style={{ padding: "8px 16px" }}>
                  {t("login")}
                </Link>
                <Link href="/register" className="btn btn-sun" style={{ padding: "8px 18px" }}>
                  {t("getStarted")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Responsive Mobile Sidebar Drawer */}
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
