"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  MessageSquare,
  Search,
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
  Sprout,
  BarChart3,
  Bug,
  HelpCircle,
  History,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarDrawer } from "./SidebarDrawer";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import { ValamAPI } from "@/lib/api";
import logo from "@/public/images/logo.png";
import NotificationDropdown from "./NotificationDropdown";

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
  | "admin"
  | "chat"
  | "consumer";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoggedIn, loading, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && isLoggedIn) {
      document.body.classList.add("has-sidebar-layout");
    } else {
      document.body.classList.remove("has-sidebar-layout");
    }
    return () => {
      document.body.classList.remove("has-sidebar-layout");
    };
  }, [loading, isLoggedIn]);

  // Close notifications when clicking outside of dropdown or button
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      if (notificationBtnRef.current && notificationBtnRef.current.contains(e.target as Node)) {
        return;
      }
      setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { confirmAction } = useNotification();
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      ValamAPI.getUserNotifications(10)
        .then((res) => setUnreadNotifCount(res.unread_count || 0))
        .catch(() => {});
    }
  }, [isLoggedIn, pathname]);

  function triggerLogoutConfirm() {
    confirmAction({
      title: "Confirm Logout",
      message: "Are you sure you want to log out of your Valam account?",
      confirmText: "Yes, Logout",
      onConfirm: async () => {
        await logout();
        setSidebarOpen(false);
        router.push("/login");
      },
    });
  }

  const isAdminUser = user?.role === "admin" || user?.role === "super_admin";
  const isConsumer = user?.role === "consumer";

  const consumerNavItems = [
    { key: "consumer", href: "/consumer", label: t("marketplace") || "Buy Fresh", icon: ShoppingBag },
    { key: "bargains", href: "/consumer?tab=bargains", label: t("myBargains") || "My Bargains", icon: Sprout },
    { key: "chat", href: "/chat", label: t("chatHub") || "Direct Chat", icon: MessageSquare },
    { key: "community", href: "/community", label: t("community"), icon: Users },
  ];

  const farmerNavItems = [
    { key: "dashboard", href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { key: "crops", href: "/crops", label: t("addCrop") || "Crops", icon: Sprout },
    { key: "marketplace", href: "/marketplace", label: t("cloudMarketTitle") || "Marketplace & Offers", icon: ShoppingBag },
    { key: "chat", href: "/chat", label: t("chatHub") || "Direct Chat", icon: MessageSquare },
    { key: "irrigation-solar", href: "/irrigation-solar", label: t("irrigationSolar") || "Irrigation & Solar", icon: Sun },
    { key: "weather", href: "/weather", label: t("weatherForecast"), icon: CloudSun },
    { key: "chatbot", href: "/chatbot", label: t("aiChatbot"), icon: Bot },
    { key: "diagnosis", href: "/diagnosis", label: t("plantDiagnosis"), icon: Stethoscope },
    { key: "community", href: "/community", label: t("community"), icon: Users },
  ];

  const adminNavItems = [
    { key: "admin-overview", href: "/admin?tab=overview", label: "Overview & Stats", icon: BarChart3 },
    { key: "admin-users", href: "/admin?tab=users", label: "User Management", icon: Users },
    { key: "admin-crops", href: "/admin?tab=crops", label: "Crop Guides", icon: Sprout },
    { key: "marketplace", href: "/marketplace", label: "Marketplace Hub", icon: ShoppingBag },
    { key: "chat", href: "/chat", label: "Direct Chat", icon: MessageSquare },
    { key: "admin-reports", href: "/admin?tab=reports", label: "Farmer Reports", icon: Stethoscope },
    { key: "admin-notifications", href: "/admin?tab=notifications", label: "System Alerts", icon: Bell },
    { key: "admin-logs", href: "/admin?tab=logs", label: "Audit Activity", icon: History },
  ];

  const navItems = isAdminUser ? adminNavItems : (isConsumer ? consumerNavItems : farmerNavItems);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isAdminUser) {
        router.push(`/admin?tab=users&search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push(`/guides?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <>
      {!loading && isLoggedIn && user ? (
        <>
          {/* Persistent Left Side Navigation Bar (Desktop View) */}
          <aside className="sidebar-view-aside" aria-label="Application Navigation Sidebar">
            {/* Brand Logo & Title */}
            <Link href={isAdminUser ? "/admin" : "/dashboard"} className="sidebar-brand">
              <Image src={logo} alt="Valam logo" width={42} height={42} priority />
              <div className="sidebar-brand-text">
                <b>{t("appName")}</b>
                <span>{isAdminUser ? "ADMIN PORTAL" : "ENTERPRISE SUITE"}</span>
              </div>
            </Link>

            {/* Vertical Menu Links */}
            <nav className="sidebar-menu-list">
              {navItems.map((item) => {
                const isActive = active === item.key || pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`sidebar-item ${isActive ? "active" : ""}`}
                  >
                    <Icon size={18} color={isActive ? "#FFFFFF" : "#059669"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Action CTA Button (START HARVEST - Farmers Only) */}
            {!isAdminUser && (
              <div className="sidebar-cta-container">
                <Link href="/crops" className="sidebar-harvest-btn">
                  <Sprout size={16} />
                  <span>START HARVEST</span>
                </Link>
              </div>
            )}

            {/* Bottom Menu Section */}
            <div className="sidebar-bottom-section">
              <Link
                href="/settings"
                className={`sidebar-item ${active === "settings" || pathname === "/settings" ? "active" : ""}`}
              >
                <Settings size={18} color={active === "settings" ? "#FFFFFF" : "#059669"} />
                <span>{t("settings")}</span>
              </Link>

              {isAdminUser && (
                <Link
                  href="/admin"
                  className={`sidebar-item ${pathname === "/admin" ? "active" : ""}`}
                  style={{ color: "#B45309" }}
                >
                  <ShieldCheck size={18} color="#D97706" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <button
                type="button"
                onClick={triggerLogoutConfirm}
                className="sidebar-item"
                style={{ background: "none", border: "none", width: "100%", textAlign: "left", color: "#DC2626", cursor: "pointer", marginTop: 2 }}
              >
                <LogOut size={18} color="#DC2626" />
                <span>{t("logout")}</span>
              </button>
            </div>
          </aside>

          {/* Top Header Bar Adjacent to Sidebar */}
          <header className="sidebar-main-topbar">
            {/* Functional Search Bar */}
            <form onSubmit={handleSearchSubmit} className="sidebar-search-box">
              <Search size={16} className="sidebar-search-icon" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type="text"
                placeholder="Search crops, fields, or weather..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sidebar-search-input"
              />
            </form>

            {/* Topbar Actions: Notifications, Chat, Language Switcher, Profile & Mobile Toggle */}
            <div className="sidebar-topbar-actions">
              <button
                type="button"
                className="topbar-icon-btn"
                title={t("notifications") || "Notifications"}
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-expanded={showNotifications}
                aria-controls="notification-dropdown"
                ref={notificationBtnRef}
                style={{ position: "relative" }}
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#EF4444",
                      border: "1.5px solid #FFFFFF",
                    }}
                  />
                )}
              </button>
              {/* Notification Dropdown */}
              {showNotifications && (
                <div ref={dropdownRef}>
                  <NotificationDropdown
                    onClose={() => setShowNotifications(false)}
                    onUpdateCount={(c) => setUnreadNotifCount(c)}
                  />
                </div>
              )}

              <button
                type="button"
                className="topbar-icon-btn"
                title={t("chatHub") || "Direct Messages"}
                onClick={() => router.push("/chat")}
              >
                <MessageSquare size={18} />
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* User Avatar & Name Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 12px 4px 6px",
                  borderRadius: 999,
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  color: "#1B4D3E",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/settings")}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
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
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "V"}
                </div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>
                  {user.full_name ? user.full_name.split(" ")[0] : "Farmer"}
                </span>
              </div>

              {/* Mobile Drawer Menu Toggle (visible on screens < 1024px) */}
              <button
                type="button"
                className="mobile-nav-toggle btn-toggle"
                style={{
                  background: "rgba(27, 77, 62, 0.1)",
                  border: "none",
                  color: "#1B4D3E",
                  padding: 8,
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Open navigation menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={22} />
              </button>
            </div>
          </header>
        </>
      ) : (
        /* Public Visitor Top Header Navigation Bar */
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

            {/* Right Action Controls: Language Switcher & Auth Buttons */}
            <div className="nav-cta" style={{ flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LanguageSwitcher />
                <Link href="/login" className="btn btn-outline" style={{ padding: "8px 16px" }}>
                  {t("login")}
                </Link>
                <Link href="/register" className="btn btn-sun" style={{ padding: "8px 18px" }}>
                  {t("getStarted")}
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Responsive Mobile Sidebar Drawer */}
      {isLoggedIn && (
        <SidebarDrawer
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onLogout={triggerLogoutConfirm}
          activeKey={active}
        />
      )}
    </>
  );
}
