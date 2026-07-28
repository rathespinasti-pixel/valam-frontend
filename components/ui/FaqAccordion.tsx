"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export interface FaqEntry {
  question: string;
  answer: string;
}

// Ports the single-open FAQ accordion from js/script.js: clicking the open
// item closes it, clicking any other item closes the rest and opens it.
export function FaqAccordion({
  items,
  defaultOpenIndex = 0,
}: {
  items: FaqEntry[];
  defaultOpenIndex?: number | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <>
      {items.map((item, i) => (
        <div key={item.question} className={`faq-item${openIndex === i ? " open" : ""}`}>
          <div
            className="faq-q"
            role="button"
            tabIndex={0}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenIndex(openIndex === i ? null : i);
              }
            }}
          >
            {item.question} <Plus size={16} />
          </div>
          <div className="faq-a">{item.answer}</div>
        </div>
      ))}
    </>
  );
}
