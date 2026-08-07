"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ChatbotEntry } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { Bot, Send, Sparkles, User, RefreshCw, MessageSquare, HelpCircle, Trash2 } from "lucide-react";

export default function ChatbotPage() {
  const { t, language } = useLanguage();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatbotEntry[]>([]);
  const [messages, setMessages] = useState<Array<{ id: string; sender: "user" | "bot"; text: string }>>([
    {
      id: "welcome",
      sender: "bot",
      text:
        language === "ta"
          ? "வணக்கம்! நான் வளம் AI விவசாய உதவி. பயிர் சாகுபடி, நோய்கள், நீர் பாசனம் அல்லது உரம் பற்றி என்னிடம் கேளுங்கள்!"
          : language === "si"
          ? "ආයුබෝවන්! මම වළම් කෘෂිකාර්මික AI සහකරු. වගා රෝග, ජලසම්පාදනය හෝ පොහොර පිළිබඳව ඕනෑම දෙයක් අසන්න!"
          : "Hello! I am Valam AI Farming Assistant. Ask me anything about crop cultivation, plant diseases, irrigation, or fertilizers!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadHistory() {
    try {
      if (ValamAPI.isLoggedIn()) {
        const res = await ValamAPI.getChatHistory();
        setHistory(res.items);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSend(inputQuestion?: string, category?: string) {
    const qText = (inputQuestion || question).trim();
    if (!qText || loading) return;

    const userMsg = { id: Date.now().toString(), sender: "user" as const, text: qText };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const langName = language === "ta" ? "Tamil" : language === "si" ? "Sinhala" : "English";
      let answerText = "";
      try {
        const aiRes = await ValamAPI.askFarmingAssistant(qText, langName);
        answerText = aiRes.answer;
      } catch (geminiErr) {
        const fallbackRes = await ValamAPI.askChatbot(qText, category, language);
        answerText = fallbackRes.answer;
      }
      const botMsg = { id: (Date.now() + 1).toString(), sender: "bot" as const, text: answerText };
      setMessages((prev) => [...prev, botMsg]);
      loadHistory();
    } catch (err: any) {
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot" as const,
        text:
          language === "ta"
            ? "மன்னிchief, பதிலைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
            : language === "si"
            ? "කණගාටුයි, පිළිතුර ලබා ගැනීමට නොහැකි විය."
            : "Sorry, could not fetch answer. Please try again.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  }

  const QUICK_PROMPTS = [
    {
      label: language === "ta" ? "சொட்டுநீர் பாசனம்" : language === "si" ? "බිංදු ජලසම්පාදනය" : "Drip Irrigation Setup",
      prompt: "How do I calculate drip irrigation lateral pipe requirements for 1 acre of Tomato?",
      cat: "irrigation-solar",
    },
    {
      label: language === "ta" ? "வேப்ப எண்ணெய் தெளிப்பு" : language === "si" ? "කොහොඹ තෙල් සාරය" : "Organic Pest Spray",
      prompt: "How to prepare 5% Neem seed kernel extract spray for whiteflies?",
      cat: "ai-chatbot",
    },
    {
      label: language === "ta" ? "NPK உர அட்டவணை" : language === "si" ? "NPK පොහොර උපදෙස්" : "NPK Dosing Schedule",
      prompt: "What is the recommended NPK fertilizer schedule for Brinjal in Yala season?",
      cat: "crop-guides",
    },
    {
      label: language === "ta" ? "மழைக்கால பாதுகாப்பு" : language === "si" ? "වැසි කාල උපදෙස්" : "Maha Rain Protection",
      prompt: "What drainage measures should I take before heavy Maha rainfall?",
      cat: "weather",
    },
  ];

  return (
    <AuthGuard>
      <Navbar active="chatbot" pageTitle={t("aiChatbot")} />
      
      <section className="page-hero">
        <div className="container">
          <div className="crumb">Valam / {t("aiChatbot")}</div>
          <h1>{t("aiChatbot")}</h1>
          <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 640 }}>
            {language === "ta"
              ? "பயிர் சாகுபடி, நோய்கள், நீர் பாசனம் மற்றும் உரம் பற்றிய கேள்விகளுக்கு 24/7 AI விவசாய துணையிடம் உடனடி பதில் பெறுங்கள்."
              : language === "si"
              ? "වගා පාලනය, රෝග, ජලසම්පාදනය සහ පොහොර පිළිබඳව පැය 24 පුරාම AI සහකරුගෙන් උපදෙස් ලබා ගන්න."
              : "Ask questions on crop cultivation, diseases, irrigation layout, and fertilizer dosing 24/7 in Tamil, Sinhala, and English."}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">
          
          {/* Quick Category Prompts Bar */}
          <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
              <HelpCircle size={16} /> Quick Questions:
            </span>
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt, p.cat)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1B4D3E",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                💡 {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
            
            {/* Left: Chat Console */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                height: 600,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div style={{ padding: "16px 24px", background: "linear-gradient(135deg, #1B4D3E, #059669)", color: "#FFFFFF", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 12 }}>
                  <Sparkles size={22} color="#FDE047" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#FFFFFF" }}>Valam AI Farming Assistant</h3>
                  <div style={{ fontSize: 12, color: "#D1FAE5" }}>Northern Province Agriculture AI Specialist</div>
                </div>
              </div>

              {/* Message Feed */}
              <div style={{ flex: 1, padding: 24, overflowY: "auto", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
                      gap: 12,
                    }}
                  >
                    {m.sender === "bot" && (
                      <div style={{ background: "#10B981", color: "#FFF", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Bot size={20} />
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "14px 18px",
                        borderRadius: 16,
                        fontSize: 14,
                        lineHeight: 1.6,
                        background: m.sender === "user" ? "#1B4D3E" : "#FFFFFF",
                        color: m.sender === "user" ? "#FFFFFF" : "#1E293B",
                        border: m.sender === "bot" ? "1px solid #E2E8F0" : "none",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748B", fontSize: 14 }}>
                    <RefreshCw size={16} className="spin" />
                    {language === "ta" ? "AI பதில் அளிக்கிறது..." : language === "si" ? "AI පිළිතුරු දෙමින් පවතී..." : "AI thinking..."}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Input */}
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: 16, background: "#FFFFFF", borderTop: "1px solid #E2E8F0", display: "flex", gap: 12 }}>
                <input
                  type="text"
                  className="input"
                  placeholder={
                    language === "ta"
                      ? "உங்கள் விவசாய கேள்வியை இங்கு தட்டச்சு செய்யவும்..."
                      : language === "si"
                      ? "ඔබේ කෘෂිකාර්මික ප්‍රශ්නය මෙහි ටයිප් කරන්න..."
                      : "Type your farming question here..."
                  }
                  style={{ flex: 1, padding: "12px 18px", borderRadius: 12, border: "1px solid #CBD5E1", fontSize: 15 }}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="btn btn-sun"
                  style={{ padding: "12px 24px", borderRadius: 12, opacity: loading || !question.trim() ? 0.6 : 1 }}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>

            {/* Right Sidebar: Chat History */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 20, border: "1px solid #E2E8F0", height: 600, overflowY: "auto" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={18} color="#0284C7" /> Recent Questions ({history.length})
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 20 }}>No chat history yet.</div>
                ) : (
                  history.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => {
                        setMessages([
                          { id: `hist-q-${h.id}`, sender: "user", text: h.question },
                          { id: `hist-a-${h.id}`, sender: "bot", text: h.answer },
                        ]);
                      }}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: "#F8FAFC",
                        border: "1px solid #F1F5F9",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        ❓ {h.question}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                        {h.created_at ? new Date(h.created_at).toLocaleDateString() : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </section>
      
      <Footer />
    </AuthGuard>
  );
}
