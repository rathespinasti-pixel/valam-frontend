"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ValamAPI } from "@/lib/api";
import type { Crop } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { MessageSquare, Send, X, Bot, Sparkles, User, RefreshCw, Sprout } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

interface AssistantContext {
  source?: string;
  focused_crop_id?: number;
  focused_crop?: Record<string, any>;
}

export function FloatingChatbot() {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCrops, setUserCrops] = useState<Crop[]>([]);
  const [assistantContext, setAssistantContext] = useState<AssistantContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text:
        language === "ta"
          ? "வணக்கம்! நான் வளம் AI விவசாய உதவி. உங்கள் பயிர் விவரங்கள் ஏற்கனவே எனக்கு தெரியும். பயிர் சாகுபடி, நோய்கள், நீர் பாசனம் அல்லது உரம் பற்றி என்னிடம் நேரடியாக கேளுங்கள்!"
          : language === "si"
          ? "ආයුබෝවන්! මම වළම් කෘෂිකාර්මික AI සහකරු. ඔබගේ වගා තොරතුරු මා සතුව ඇත. වගා රෝග, ජලසම්පාදනය හෝ පොහොර පිළිබඳව ඕනෑම දෙයක් අසන්න!"
          : "Hello! I am Valam AI Farming Assistant. I already have your farm & crop profile loaded. Ask me anything directly about your crops, diseases, irrigation, or fertilizers!",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOpenAssistant(event: Event) {
      const detail = (event as CustomEvent<AssistantContext>).detail || {};
      const focusedCrop = detail.focused_crop || {};
      const cropName = focusedCrop.crop_name || "this crop";
      const cropStage = focusedCrop.current_stage || "the current stage";
      const cropAge = focusedCrop.crop_age ? `Day ${focusedCrop.crop_age}` : "current day";

      setAssistantContext(detail);
      setIsOpen(true);
      setMessages((prev) => [
        ...prev.filter((m) => !m.id.startsWith("context-")),
        {
          id: `context-${Date.now()}`,
          sender: "bot",
          text: `I am ready to help with ${cropName}. I have its ${cropAge}, ${cropStage}, fertilizer, irrigation, weather, and task details from your dashboard.`,
        },
      ]);
    }

    window.addEventListener("valam:open-assistant", handleOpenAssistant);
    return () => window.removeEventListener("valam:open-assistant", handleOpenAssistant);
  }, []);

  useEffect(() => {
    if (isOpen && ValamAPI.isLoggedIn()) {
      ValamAPI.getCrops()
        .then((res) => setUserCrops(res.items || []))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    if (!ValamAPI.isLoggedIn()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text:
            language === "ta"
              ? "AI விவசாய உதவியைப் பயன்படுத்த தயவுசெய்து உள்நுழையவும்."
              : language === "si"
              ? "AI සහකරු භාවිතා කිරීමට කරුණාකර ඇතුළු වන්න."
              : "Please login to ask the AI farming assistant.",
        },
      ]);
      return;
    }

    const userText = question.trim();
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const pageContext = {
        pathname: pathname || "/",
        ...assistantContext,
        active_crops: userCrops.map((c) => ({
          crop_name: c.crop_name,
          variety: c.variety,
          planting_date: c.planting_date,
          current_stage: c.current_stage,
          planting_method: c.planting_method,
        })),
      };

      const res = await ValamAPI.askChatbot(userText, undefined, language, pageContext);
      const botMsg: Message = { id: (Date.now() + 1).toString(), sender: "bot", text: res.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
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

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #16A34A 0%, #059669 100%)",
            color: "#FFFFFF",
            border: "none",
            boxShadow: "0 6px 20px rgba(5,150,105,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease, boxShadow 0.2s ease",
          }}
          title="Valam AI Assistant"
        >
          <Bot size={28} />
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          style={{
            width: 380,
            height: 520,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 100px)",
            background: "#FFFFFF",
            borderRadius: 20,
            boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #1B4D3E, #059669)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: 6, borderRadius: 10 }}>
                <Sparkles size={20} color="#FDE047" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Valam AI Assistant</div>
                <div style={{ fontSize: 12, color: "#D1FAE5" }}>
                  {language === "ta" ? "விவசாய AI துணை" : language === "si" ? "කෘෂිකාර්මික AI සහකරු" : "Smart Farming Helper"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Active Crops Context Banner */}
          {(assistantContext?.focused_crop || userCrops.length > 0) && (
            <div
              style={{
                background: "#ECFDF5",
                padding: "6px 14px",
                borderBottom: "1px solid #A7F3D0",
                fontSize: 11,
                color: "#065F46",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
              }}
            >
              <Sprout size={13} color="#059669" />
              <span>
                Active Crop Context:{" "}
                <strong>
                  {assistantContext?.focused_crop?.crop_name ||
                    userCrops.map((c) => c.crop_name).join(", ")}
                </strong>
              </span>
            </div>
          )}

          {/* Messages Feed */}
          <div style={{ flex: 1, padding: 16, overflowY: "auto", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
                  gap: 8,
                }}
              >
                {m.sender === "bot" && (
                  <div style={{ background: "#10B981", color: "#FFF", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={16} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    fontSize: 14,
                    lineHeight: 1.5,
                    background: m.sender === "user" ? "#1B4D3E" : "#FFFFFF",
                    color: m.sender === "user" ? "#FFFFFF" : "#1E293B",
                    border: m.sender === "bot" ? "1px solid #E2E8F0" : "none",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 13 }}>
                <RefreshCw size={14} className="spin" />
                {language === "ta" ? "AI பதில் அளிக்கிறது..." : language === "si" ? "AI පිළිතුරු දෙමින් පවතී..." : "AI thinking..."}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} style={{ padding: 12, background: "#FFFFFF", borderTop: "1px solid #E2E8F0", display: "flex", gap: 8 }}>
            <input
              type="text"
              className="input"
              placeholder={
                language === "ta"
                  ? "கேள்வி கேட்கவும்..."
                  : language === "si"
                  ? "ප්‍රශ්නයක් අසන්න..."
                  : "Ask farming question..."
              }
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="btn btn-sun"
              style={{ padding: "10px 16px", borderRadius: 10, opacity: loading || !question.trim() ? 0.6 : 1 }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
