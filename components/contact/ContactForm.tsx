"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contactFormSchema, getFieldErrors } from "@/lib/validations";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setStatus(null);

    const validationResult = contactFormSchema.safeParse({
      name,
      phone,
      email,
      topic,
      message,
    });

    if (!validationResult.success) {
      const errors = getFieldErrors(validationResult);
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setStatus({ type: "ok", text: "Thanks! Your message has been received — our team will reply within 24 hours." });
      setSubmitting(false);
      setName("");
      setPhone("");
      setEmail("");
      setTopic("");
      setMessage("");
      setFormErrors({});
    }, 900);
  }

  return (
    <div className="form-card">
      <h3 style={{ marginBottom: 6 }}>Send us a message</h3>
      <p style={{ color: "var(--ink-soft)", fontSize: ".9rem", marginBottom: 24 }}>
        Fill in the form and we&apos;ll get back to you shortly.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="field">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={formErrors.name ? "input-invalid" : ""}
            />
            {formErrors.name && <span className="field-error-text">{formErrors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              placeholder="+94 7X XXX XXXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: "" }));
              }}
              className={formErrors.phone ? "input-invalid" : ""}
            />
            {formErrors.phone && <span className="field-error-text">{formErrors.phone}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={formErrors.email ? "input-invalid" : ""}
            />
            {formErrors.email && <span className="field-error-text">{formErrors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="topic">Topic *</label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (formErrors.topic) setFormErrors((prev) => ({ ...prev, topic: "" }));
              }}
              className={formErrors.topic ? "input-invalid" : ""}
            >
              <option value="">-- Select Topic --</option>
              <option value="General Enquiry">General Enquiry</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Marketplace Seller Signup">Marketplace Seller Signup</option>
              <option value="Partnership">Partnership</option>
              <option value="Report an Issue">Report an Issue</option>
            </select>
            {formErrors.topic && <span className="field-error-text">{formErrors.topic}</span>}
          </div>
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            rows={4}
            placeholder="Tell us how we can help..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (formErrors.message) setFormErrors((prev) => ({ ...prev, message: "" }));
            }}
            className={formErrors.message ? "input-invalid" : ""}
          />
          {formErrors.message && <span className="field-error-text">{formErrors.message}</span>}
        </div>

        <Button type="submit" block disabled={submitting}>
          {submitting ? "Sending…" : "Send Message"} <Send size={15} />
        </Button>
        {status && <div className={`form-status ${status.type}`}>{status.text}</div>}
      </form>
    </div>
  );
}
