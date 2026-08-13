"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ValamAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { loginSchema, getFieldErrors } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setStatus(null);

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const fieldErrors = getFieldErrors(validationResult);
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await ValamAPI.login({ email: email.trim(), password });
      setStatus({ type: "ok", text: "Login successful — redirecting…" });
      const isAdminRole = res.user.role === "admin" || res.user.role === "super_admin";
      const isConsumer = res.user.role === "consumer";
      setTimeout(() => {
        if (isAdminRole) router.push("/admin");
        else if (isConsumer) router.push("/consumer");
        else router.push("/dashboard");
      }, 500);
    } catch (err) {
      setStatus({ type: "error", text: err instanceof Error ? err.message : "Login failed. Check your credentials." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="email">{t("emailAddress")} *</label>
        <div className="input-wrap">
          <i className="fa-solid fa-envelope" aria-hidden="true" />
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            className={errors.email ? "input-invalid" : ""}
          />
        </div>
        {errors.email && <span className="field-error-text">{errors.email}</span>}
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="password">{t("password")} *</label>
        <div className="input-wrap">
          <i className="fa-solid fa-lock" aria-hidden="true" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            className={errors.password ? "input-invalid" : ""}
          />
          <button
            type="button"
            className="pw-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <span className="field-error-text">{errors.password}</span>}
      </div>

      {status && (
        <div
          role="alert"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
            background: status.type === "ok" ? "#DCFCE7" : "#FEE2E2",
            color: status.type === "ok" ? "#166534" : "#991B1B",
          }}
        >
          {status.text}
        </div>
      )}

      <Button type="submit" variant="primary" disabled={submitting} style={{ width: "100%" }}>
        <LogIn size={18} style={{ marginRight: 8 }} />
        {submitting ? "Signing in..." : t("login")}
      </Button>
    </form>
  );
}
