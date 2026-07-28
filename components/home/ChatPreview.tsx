"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChatAskForm } from "@/components/chat/ChatAskForm";
import { useAskChatbot } from "@/hooks/useAskChatbot";

const SAMPLES = [
  {
    q: "என் நெல் இலையில் மஞ்சள் புள்ளிகள் இருக்கு, என்ன பண்ணலாம்?",
    a: "படத்தை பதிவேற்றவும் — இது இலை கருகல் நோயாக இருக்கலாம். டிரைக்கோடெர்மா அடிப்படையிலான தெளிப்பு பரிந்துரைக்கப்படுகிறது.",
  },
  {
    q: "நாளைக்கு மழை வருமா?",
    a: "ஆம், நாளை மாலை 60% மழை வாய்ப்பு. நீர்ப்பாசனத்தை இன்று மாலைக்கு மாற்றவும்.",
  },
  {
    q: "சூரிய சக்தி பம்ப் மானியம் பற்றி சொல்லுங்க",
    a: "PM-KUSUM திட்டத்தின் கீழ் 60% மானியம் கிடைக்கும். Solar Guide பிரிவில் விண்ணப்ப படிகள் உள்ளன.",
  },
];

// Ports the homepage "AI chatbot preview" from js/script.js: cycles sample
// Tamil Q&A pairs every 4.5s until the visitor asks a real question, at
// which point the sample cycle stops for good.
export function ChatPreview() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [realMessages, setRealMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [status, setStatus] = useState<React.ReactNode>(null);
  const cycling = realMessages.length === 0;
  const bodyRef = useRef<HTMLDivElement>(null);
  const { ask, asking } = useAskChatbot();

  useEffect(() => {
    if (!cycling) return;
    const id = setInterval(() => {
      setSampleIndex((i) => (i + 1) % SAMPLES.length);
    }, 4500);
    return () => clearInterval(id);
  }, [cycling]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [realMessages]);

  async function handleAsk(question: string) {
    setStatus(null);
    setRealMessages((prev) => [...prev, { role: "user", text: question }]);
    const result = await ask(question);
    if (result.ok) {
      setRealMessages((prev) => [...prev, { role: "bot", text: result.answer }]);
    } else if (result.error === "LOGIN_REQUIRED") {
      setRealMessages([]);
      setStatus(
        <>
          Please <Link href="/login">log in</Link> to ask the AI assistant a real question.
        </>
      );
    } else {
      setStatus(result.error);
    }
  }

  return (
    <div className="chat-mock reveal">
      <div className="chat-head">
        <span className="dot" /> Valam Assistant · Online
      </div>
      <div className="chat-body" ref={bodyRef}>
        {cycling ? (
          <>
            <div className="bubble user">{SAMPLES[sampleIndex].q}</div>
            <div className="bubble bot">{SAMPLES[sampleIndex].a}</div>
          </>
        ) : (
          realMessages.map((m, i) => (
            <div className={`bubble ${m.role}`} key={i}>
              {m.text}
            </div>
          ))
        )}
      </div>
      <ChatAskForm disabled={asking} onSubmit={handleAsk} />
      <div className="chat-ask-status">{status}</div>
    </div>
  );
}
