"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, RefreshCcw, CheckCheck, Bell, ShoppingBag, MessageSquare, Tag } from "lucide-react";
import { ValamAPI } from "@/lib/api";
import type { MarketNotification } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  onClose: () => void;
  onUpdateCount?: (count: number) => void;
}

export default function NotificationDropdown({ onClose, onUpdateCount }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<MarketNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await ValamAPI.getUserNotifications(30);
      setNotifications(res.items || []);
      setUnreadCount(res.unread_count || 0);
      if (onUpdateCount) onUpdateCount(res.unread_count || 0);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notif: MarketNotification) => {
    if (!notif.is_read) {
      try {
        await ValamAPI.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }
    onClose();
    if (notif.link_url) {
      router.push(notif.link_url);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ValamAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      if (onUpdateCount) onUpdateCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "marketplace":
        return <ShoppingBag size={16} color="#10B981" />;
      case "bargain":
        return <Tag size={16} color="#F59E0B" />;
      case "chat":
        return <MessageSquare size={16} color="#3B82F6" />;
      default:
        return <Bell size={16} color="#6366F1" />;
    }
  };

  return (
    <div
      id="notification-dropdown"
      ref={dropdownRef}
      style={{
        position: "absolute",
        right: 16,
        top: 64,
        width: 360,
        maxWidth: "92vw",
        background: "#FFFFFF",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        border: "1px solid #E2E8F0",
        zIndex: 1000,
        overflow: "hidden",
      }}
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid #F1F5F9",
          background: "#F8FAFC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
            {t("notifications")}
          </h4>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                background: "#EF4444",
                color: "#FFF",
                padding: "2px 8px",
                borderRadius: 10,
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              title={t("markAllRead")}
              style={{
                background: "none",
                border: "none",
                color: "#10B981",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <CheckCheck size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={loadNotifications}
            title="Refresh"
            style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: 4 }}
          >
            <RefreshCcw size={15} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
        {loading && notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#64748B", fontSize: 13 }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 16px", color: "#94A3B8" }}>
            <Bell size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{t("noNotifications")}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                marginBottom: 6,
                background: n.is_read ? "#FFFFFF" : "#F0FDF4",
                border: n.is_read ? "1px solid #F1F5F9" : "1px solid #BBF7D0",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: n.is_read ? "#F1F5F9" : "#DCFCE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {getCategoryIcon(n.category)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: n.is_read ? 600 : 700, color: "#1E293B", lineHeight: 1.3 }}>
                    {n.title}
                  </p>
                  {!n.is_read && (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", flexShrink: 0, marginLeft: 6 }} />
                  )}
                </div>
                {n.message && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                )}
                {n.created_at && (
                  <span style={{ fontSize: 10, color: "#94A3B8", marginTop: 4, display: "block" }}>
                    {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}