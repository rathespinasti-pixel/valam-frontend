"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Ports the demo-only submit handler from js/script.js (#contact-form):
// simulates a network delay, then shows a success message and resets the
// form. See the original README for how to wire this to a real endpoint.
export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setStatus({ type: "ok", text: "Thanks! Your message has been received — our team will reply within 24 hours." });
      setSubmitting(false);
      e.currentTarget.reset();
    }, 900);
  }

  return (
    <div className="form-card">
      <h3 style={{ marginBottom: 6 }}>Send us a message</h3>
      <p style={{ color: "var(--ink-soft)", fontSize: ".9rem", marginBottom: 24 }}>
        Fill in the form and we&apos;ll get back to you shortly.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" placeholder="Your name" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" placeholder="+94 7X XXX XXXX" required />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="topic">Topic</label>
            <select id="topic" name="topic" defaultValue="General Enquiry">
              <option>General Enquiry</option>
              <option>Feature Request</option>
              <option>Marketplace Seller Signup</option>
              <option>Partnership</option>
              <option>Report an Issue</option>
            </select>
          </div>
        </div>
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" placeholder="Tell us how we can help..." required />
        </div>
        <Button type="submit" block disabled={submitting}>
          {submitting ? "Sending…" : "Send Message"} <Send size={15} />
        </Button>
        {status && <div className={`form-status ${status.type}`}>{status.text}</div>}
      </form>
    </div>
  );
}
