"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ChatConversation, DirectMessage, ValamUser } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedDistrict } from "@/lib/lifecycle";
import {
  MessageSquare,
  Send,
  User,
  Phone,
  Search,
  RefreshCcw,
  CheckCheck,
} from "lucide-react";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const [currentUser, setCurrentUser] = useState<ValamUser | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
  const [activePartner, setActivePartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function initUserAndThreads() {
      try {
        const u = await ValamAPI.me();
        setCurrentUser(u);

        const convs = await ValamAPI.getChatConversations();
        setConversations(convs || []);

        const partnerParam = searchParams?.get("partner_id");
        if (partnerParam) {
          const pid = parseInt(partnerParam, 10);
          if (!isNaN(pid)) {
            setActivePartnerId(pid);
          }
        } else if (convs.length > 0) {
          setActivePartnerId(convs[0].partner.id);
        }
      } catch (err) {
        console.error("Error loading chat:", err);
      } finally {
        setLoading(false);
      }
    }

    initUserAndThreads();
  }, [searchParams]);

  const loadMessages = async (partnerId: number) => {
    try {
      const res = await ValamAPI.getChatMessages(partnerId);
      setActivePartner(res.partner);
      setMessages(res.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  useEffect(() => {
    if (activePartnerId) {
      loadMessages(activePartnerId);
    }
  }, [activePartnerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePartnerId || !messageInput.trim() || sending) return;

    const text = messageInput.trim();
    setMessageInput("");
    setSending(true);

    try {
      const newMsg = await ValamAPI.sendChatMessage({
        receiver_id: activePartnerId,
        message: text,
      });

      setMessages((prev) => [...prev, newMsg]);
      setTimeout(scrollToBottom, 100);

      // Refresh threads
      const convs = await ValamAPI.getChatConversations();
      setConversations(convs || []);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.partner.full_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        height: "calc(80vh - 40px)",
        minHeight: 520,
      }}
    >
      {/* LEFT SIDEBAR: CONVERSATION THREADS */}
      <div
        style={{
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          background: "#F8FAFC",
        }}
      >
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #E2E8F0" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquare size={18} color="#10B981" /> {t("chatHub")}
          </h3>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px 8px 32px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 12,
                background: "#FFFFFF",
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#64748B", fontSize: 13 }}>
              Loading chats...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 12px", color: "#94A3B8" }}>
              <MessageSquare size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{t("noConversationsFound")}</p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activePartnerId === c.partner.id;
              const isPartnerFarmer = c.partner.role === "farmer";

              return (
                <div
                  key={c.partner.id}
                  onClick={() => setActivePartnerId(c.partner.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    marginBottom: 4,
                    background: isSelected ? "#ECFDF5" : "#FFFFFF",
                    border: isSelected ? "1.5px solid #10B981" : "1px solid #F1F5F9",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: isPartnerFarmer ? "#DCFCE7" : "#E0F2FE",
                          color: isPartnerFarmer ? "#166534" : "#0369A1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {c.partner.full_name ? c.partner.full_name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", lineHeight: 1.2 }}>
                          {c.partner.full_name}
                        </div>
                        <span style={{ fontSize: 10, color: isPartnerFarmer ? "#166534" : "#0369A1", fontWeight: 600 }}>
                          {isPartnerFarmer ? "🌱 Farmer" : "🛒 Buyer"} · {getLocalizedDistrict(c.partner.district, language)}
                        </span>
                      </div>
                    </div>

                    {c.unread_count > 0 && (
                      <span
                        style={{
                          background: "#10B981",
                          color: "#FFF",
                          borderRadius: 10,
                          padding: "2px 6px",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {c.unread_count}
                      </span>
                    )}
                  </div>

                  {c.last_message && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        marginTop: 6,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.last_message.message}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: ACTIVE CONVERSATION */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {activePartnerId ? (
          <>
            {/* Chat Partner Header */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #E2E8F0",
                background: "#FFFFFF",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: activePartner?.role === "farmer" ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #0284C7, #0369A1)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {activePartner?.full_name ? activePartner.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1E293B" }}>
                    {activePartner?.full_name || "User"}
                  </h4>
                  <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                    {activePartner?.role === "farmer" ? "🌱 Farmer / Grower" : "🛒 Consumer / Buyer"} · 📍 {getLocalizedDistrict(activePartner?.district, language)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {activePartner?.phone && (
                  <a
                    href={`tel:${activePartner.phone}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      color: "#334155",
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    <Phone size={14} color="#10B981" /> Call
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => loadMessages(activePartnerId)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #E2E8F0",
                    background: "#F8FAFC",
                    cursor: "pointer",
                  }}
                >
                  <RefreshCcw size={14} color="#64748B" />
                </button>
              </div>
            </div>

            {/* Message Bubble Feed */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                background: "#F8FAFC",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", margin: "auto", color: "#94A3B8" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                    No messages yet. Send a message to start bargaining or discussing pickup details!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === Number(currentUser?.id);

                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: "75%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          background: isMe ? "#10B981" : "#FFFFFF",
                          color: isMe ? "#FFFFFF" : "#1E293B",
                          fontSize: 14,
                          lineHeight: 1.4,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                          border: isMe ? "none" : "1px solid #E2E8F0",
                          wordBreak: "break-word",
                        }}
                      >
                        {m.message}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#94A3B8",
                          marginTop: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {m.created_at &&
                          new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        {isMe && <CheckCheck size={12} color={m.is_read ? "#10B981" : "#94A3B8"} />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "12px 16px",
                background: "#FFFFFF",
                borderTop: "1px solid #E2E8F0",
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={t("typeMessagePlaceholder")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 24,
                  border: "1px solid #CBD5E1",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={sending || !messageInput.trim()}
                style={{
                  background: "#10B981",
                  color: "#FFFFFF",
                  border: "none",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  opacity: sending || !messageInput.trim() ? 0.6 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94A3B8", padding: 24, textAlign: "center" }}>
            <MessageSquare size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#475569" }}>
              {t("selectConversation")}
            </h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              Connect directly with local farmers and buyers in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { t } = useLanguage();

  return (
    <AuthGuard>
      <Navbar active="chat" pageTitle={t("chatHub")} />
      <section className="section" style={{ background: "#F1F5F9", padding: "20px 0", minHeight: "85vh" }}>
        <div className="container">
          <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading chat...</div>}>
            <ChatContent />
          </Suspense>
        </div>
      </section>
      <Footer />
    </AuthGuard>
  );
}
