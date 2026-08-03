"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ValamAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      await ValamAPI.login({ email, password });
      setStatus({ type: "ok", text: "Login successful — redirecting…" });
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err) {
      setStatus({ type: "error", text: err instanceof Error ? err.message : "Login failed." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="email">{t("emailAddress")}</label>
        <div className="input-wrap">
          <i className="fa-solid fa-envelope" aria-hidden="true" />
          <input type="email" id="email" name="email" placeholder="you@example.com" autoComplete="email" required />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 8 }}>
        <label htmlFor="password">{t("password")}</label>
        <div className="input-wrap">
          <i className="fa-solid fa-lock" aria-hidden="true" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
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
      </div>
      <Button type="submit" block style={{ marginTop: 20 }} disabled={submitting}>
        {submitting ? "Logging in..." : t("login")} <LogIn size={15} />
      </Button>
      <div className={`form-status${status ? ` ${status.type}` : ""}`} role="status" aria-live="polite">
        {status?.text}
      </div>
    </form>
  );
}
