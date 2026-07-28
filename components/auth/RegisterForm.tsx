"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ValamAPI } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    const form = e.currentTarget;
    const field = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value ?? "";

    try {
      await ValamAPI.register({
        full_name: field("full_name").trim(),
        email: field("email").trim(),
        password: field("password"),
        phone: field("phone").trim() || undefined,
        farm_location: field("farm_location").trim() || undefined,
        farm_size_acres: field("farm_size_acres") ? Number(field("farm_size_acres")) : undefined,
      });
      setStatus({ type: "ok", text: "Account created — redirecting…" });
      setTimeout(() => router.push("/"), 600);
    } catch (err) {
      setStatus({ type: "error", text: err instanceof Error ? err.message : "Registration failed." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="full_name">Full Name</label>
        <div className="input-wrap">
          <i className="fa-solid fa-user" aria-hidden="true" />
          <input type="text" id="full_name" name="full_name" placeholder="Your name" autoComplete="name" required />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="email">Email Address</label>
        <div className="input-wrap">
          <i className="fa-solid fa-envelope" aria-hidden="true" />
          <input type="email" id="email" name="email" placeholder="you@example.com" autoComplete="email" required />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="phone">
            Phone Number <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>(optional)</span>
          </label>
          <div className="input-wrap">
            <i className="fa-solid fa-phone" aria-hidden="true" />
            <input type="tel" id="phone" name="phone" placeholder="+94 7X XXX XXXX" autoComplete="tel" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="farm_location">
            Farm Location <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>(optional)</span>
          </label>
          <div className="input-wrap">
            <i className="fa-solid fa-location-dot" aria-hidden="true" />
            <input type="text" id="farm_location" name="farm_location" placeholder="District / Village" />
          </div>
        </div>
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="farm_size_acres">
          Farm Size in acres <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>(optional)</span>
        </label>
        <div className="input-wrap">
          <i className="fa-solid fa-seedling" aria-hidden="true" />
          <input type="number" id="farm_size_acres" name="farm_size_acres" placeholder="e.g. 2.5" step="0.1" min="0" />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 8 }}>
        <label htmlFor="password">Password</label>
        <div className="input-wrap">
          <i className="fa-solid fa-lock" aria-hidden="true" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="At least 6 characters"
            minLength={6}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="pw-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <div className="field-hint">Use at least 6 characters.</div>
      </div>
      <Button type="submit" block style={{ marginTop: 12 }} disabled={submitting}>
        Create Account <UserPlus size={15} />
      </Button>
      <div className={`form-status${status ? ` ${status.type}` : ""}`} role="status" aria-live="polite">
        {status?.text}
      </div>
    </form>
  );
}
