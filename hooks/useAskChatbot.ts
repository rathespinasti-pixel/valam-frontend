"use client";

import { useState } from "react";
import { ValamAPI } from "@/lib/api";

// Shared "ask the AI assistant" plumbing used by the homepage preview,
// the dedicated /chatbot page and the /pest-radar follow-up chat. Each
// caller keeps its own message list (their bubble layouts differ
// slightly) but shares the login-gate + request/error handling here.
export function useAskChatbot(category?: string) {
  const [asking, setAsking] = useState(false);

  async function ask(question: string): Promise<{ ok: true; answer: string } | { ok: false; error: string }> {
    if (!ValamAPI.isLoggedIn()) {
      return { ok: false, error: "LOGIN_REQUIRED" };
    }
    setAsking(true);
    try {
      const entry = await ValamAPI.askChatbot(question, category);
      return { ok: true, answer: entry.answer };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
    } finally {
      setAsking(false);
    }
  }

  return { ask, asking };
}
