import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — Valam",
};

export default function RegisterPage() {
  return (
    <>
      <Navbar />

      <section className="section auth-section">
        <div className="container">
          <Reveal className="auth-shell">
            <div className="auth-panel">
              <span className="crumb">Home / Create Account</span>
              <h2>Join Valam in under two minutes</h2>
              <p>Create your farm profile to unlock the AI chatbot, weather alerts and the marketplace.</p>
              <ul className="auth-points">
                <li>
                  <i className="fa-solid fa-cloud-sun-rain" aria-hidden="true" /> District-level weather &amp;
                  irrigation alerts
                </li>
                <li>
                  <i className="fa-solid fa-camera-retro" aria-hidden="true" /> Ask questions &amp; scan crops with
                  the AI chatbot
                </li>
                <li>
                  <i className="fa-solid fa-store" aria-hidden="true" /> Buy &amp; sell on the seeds/fertilizer
                  marketplace
                </li>
              </ul>
            </div>
            <div className="auth-form-wrap">
              <div className="auth-card">
                <h3>Create your account</h3>
                <p className="auth-sub">Just the essentials — you can fill in the rest later.</p>
                <RegisterForm />
                <p className="auth-switch">
                  Already have an account? <Link href="/login">Log in</Link>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
