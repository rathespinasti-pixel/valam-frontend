"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CloudSun,
  BookOpen,
  Bot,
  Stethoscope,
  Sun,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import type { ValamUser } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export interface NavMenuItem {
  key: string;
  transKey: string;
  href: string;
  icon: React.ElementType;
}

export const MENU_ITEMS: NavMenuItem[] = [
  { key: "dashboard", transKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "crops", transKey: "addCrop", href: "/crops", icon: Sprout },
  { key: "irrigation-solar", transKey: "irrigationSolar", href: "/irrigation-solar", icon: Sun },
  { key: "weather", transKey: "weatherForecast", href: "/weather", icon: CloudSun },
  { key: "guides", transKey: "cropGuide", href: "/guides", icon: BookOpen },
  { key: "chatbot", transKey: "aiChatbot", href: "/chatbot", icon: Bot },
  { key: "diagnosis", transKey: "plantDiagnosis", href: "/diagnosis", icon: Stethoscope },
  { key: "marketplace", transKey: "marketplace", href: "/marketplace", icon: ShoppingBag },
  { key: "community", transKey: "community", href: "/community", icon: Users },
  { key: "settings", transKey: "settings", href: "/settings", icon: Settings },
];

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: ValamUser | null;
  onLogout: () => void;
  activeKey?: string;
}

export function SidebarDrawer({ isOpen, onClose, user, onLogout, activeKey }: SidebarDrawerProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sidebar-drawer-shell">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 99998,
          transition: "opacity 0.3s ease",
        }}
        aria-hidden="true"
      />

      {/* Slide-over Sidebar Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(340px, 88vw)",
          backgroundColor: "#11382B",
          color: "#FFFFFF",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.35)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-label="Application Sidebar Menu"
      >
        {/* Header Section */}
        <div
          style={{
            padding: "20px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10B981, #047857)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 18,
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
              }}
            >
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "V"}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#FFFFFF", lineHeight: 1.2 }}>
                {user?.full_name || "Valam Farmer"}
              </div>
              <div style={{ fontSize: 12, color: "#A7F3D0", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={12} /> {user?.farm_location || "Vavuniya, LK"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#FFFFFF",
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            aria-label="Close sidebar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 12px 10px",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#6EE7B7",
                textTransform: "uppercase",
              }}
            >
              Navigation
            </span>
            <LanguageSwitcher />
          </div>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key || pathname === item.href;
            const labelText = t(item.transKey as any);

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  color: isActive ? "#FFFFFF" : "#E2E8F0",
                  backgroundColor: isActive ? "#059669" : "transparent",
                  boxShadow: isActive ? "0 4px 12px rgba(5, 150, 105, 0.4)" : "none",
                  transition: "all 0.18s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon size={19} color={isActive ? "#FFFFFF" : "#A7F3D0"} />
                  <span>{labelText}</span>
                </div>
                <ChevronRight size={16} color={isActive ? "#FFFFFF" : "#6EE7B7"} style={{ opacity: isActive ? 1 : 0.4 }} />
              </Link>
            );
          })}

          {/* Admin Portal Link for Admin Users & Super Admins */}
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <>
            <Link
              href="/admin"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: pathname === "/admin" ? 700 : 600,
                fontSize: 14,
                color: "#FDE68A",
                backgroundColor: pathname === "/admin" ? "#D97706" : "rgba(217, 119, 6, 0.2)",
                border: "1px solid #F59E0B",
                marginTop: 6,
                transition: "all 0.18s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldCheck size={19} color="#FDE68A" />
                <span>Admin Portal</span>
              </div>
              <ChevronRight size={16} color="#FDE68A" />
            </Link>
            <Link
              href="/admin/crops"
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, textDecoration: "none", fontWeight: pathname === "/admin/crops" ? 700 : 600, fontSize: 14, color: "#D1FAE5", backgroundColor: pathname === "/admin/crops" ? "#047857" : "rgba(4,120,87,.2)", border: "1px solid #10B981", marginTop: 6 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Sprout size={19}/><span>Crop Management</span></div>
              <ChevronRight size={16}/>
            </Link>
            </>
          )}
        </div>

        {/* Fixed Footer with Logout Button */}
        <div
          style={{
            padding: "16px 14px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <button
            type="button"
            onClick={onLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid rgba(239, 68, 68, 0.4)",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#FCA5A5",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <LogOut size={18} />
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
