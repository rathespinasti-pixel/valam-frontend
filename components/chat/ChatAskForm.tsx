"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function ChatAskForm({
  placeholder = "Ask a real farming question…",
  disabled = false,
  onSubmit,
}: {
  placeholder?: string;
  disabled?: boolean;
  onSubmit: (question: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="chat-ask-form"
      onSubmit={(e) => {
        e.preventDefault();
        const question = value.trim();
        if (!question) return;
        setValue("");
        onSubmit(question);
      }}
    >
      <input
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" aria-label="Send" disabled={disabled}>
        <Send size={15} />
      </button>
    </form>
  );
}
