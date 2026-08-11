"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bolt, ChevronRight, CircleHelp } from "lucide-react";
import { CHAT_TOPICS, DEFAULT_CHAT_TOPIC } from "@/lib/chatbotTopics";
import { ChatAskForm } from "@/components/chat/ChatAskForm";
import { useAskChatbot } from "@/hooks/useAskChatbot";

type Bubble = { role: "user" | "bot"; text: string };

// Ports js/chatbot.js: a topic switcher (also readable/writable via the
// ?topic= query param, matching the original's history.replaceState) plus
// a live chat wired to POST /api/chatbot/ask.
export function ChatbotPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTopic = searchParams?.get("topic");
  const initialTopic = CHAT_TOPICS.some((t) => t.slug === requestedTopic) ? requestedTopic! : DEFAULT_CHAT_TOPIC;

  const [activeSlug, setActiveSlug] = useState(initialTopic);
  const [messages, setMessages] = useState<Bubble[]>(() => [
    { role: "bot", text: CHAT_TOPICS.find((t) => t.slug === initialTopic)!.greeting },
  ]);
  const [status, setStatus] = useState<React.ReactNode>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { ask, asking } = useAskChatbot(activeSlug);

  const topic = CHAT_TOPICS.find((t) => t.slug === activeSlug)!;

  function resetChat(slug: string) {
    const t = CHAT_TOPICS.find((x) => x.slug === slug)!;
    setMessages([{ role: "bot", text: t.greeting }]);
    setStatus(null);
  }

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  function selectTopic(slug: string) {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    resetChat(slug);
    const entries = searchParams ? Array.from(searchParams.entries()) : [];
    const params = new URLSearchParams(entries);
    params.set("topic", slug);
    router.replace(`/chatbot?${params.toString()}`, { scroll: false });
  }

  async function handleAsk(question: string) {
    setStatus(null);
    setMessages((prev) => [...prev, { role: "user", text: question }, { role: "bot", text: "Thinking…" }]);
    const result = await ask(question);
    if (result.ok) {
      setMessages((prev) => [...prev.slice(0, -1), { role: "bot", text: result.answer }]);
    } else if (result.error === "LOGIN_REQUIRED") {
      setMessages((prev) => prev.slice(0, -1));
      setStatus(
        <>
          Please <Link href="/login">log in</Link> to chat with the Valam AI assistant.
        </>
      );
    } else {
      setMessages((prev) => prev.slice(0, -1));
      setStatus(result.error);
    }
  }

  return (
    <>
      <section className="section section-light">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Choose a topic</span>
            <h2 style={{ marginTop: 14 }}>What do you need help with?</h2>
          </div>

          <div className="topic-grid reveal">
            {CHAT_TOPICS.map((t) => (
              <button
                key={t.slug}
                type="button"
                className={`topic-card${t.slug === activeSlug ? " active" : ""}`}
                onClick={() => selectTopic(t.slug)}
              >
                <span className="topic-icon">
                  <i className={`fa-solid ${t.icon}`} aria-hidden="true" />
                </span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="popular-panel reveal">
            <h4>
              <Bolt size={16} /> Popular {topic.label} Questions
            </h4>
            <div className="popular-list">
              {topic.questions.map((q) => (
                <button type="button" key={q} onClick={() => handleAsk(q)}>
                  <CircleHelp className="q-icon" size={15} />
                  <span>{q}</span>
                  <ChevronRight className="chev" size={12} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
            <span className="eyebrow" style={{ background: "rgba(255,255,255,.1)", color: "var(--sunrise-2)" }}>
              Live Chat
            </span>
            <h2 style={{ marginTop: 14, color: "#fff" }}>Valam Assistant</h2>
          </div>
          <div className="chat-mock chat-mock-wide reveal">
            <div className="chat-head">
              <span className="dot" /> Valam Assistant · Online
            </div>
            <div className="chat-body" ref={bodyRef}>
              {messages.map((m, i) => (
                <div className={`bubble ${m.role}`} key={i}>
                  {m.text}
                </div>
              ))}
            </div>
            <ChatAskForm disabled={asking} onSubmit={handleAsk} />
            <div className="chat-ask-status">{status}</div>
          </div>
        </div>
      </section>
    </>
  );
}
