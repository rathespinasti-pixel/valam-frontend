import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In — Valam",
};

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <section className="section auth-section">
        <div className="container">
          <Reveal className="auth-shell">
            <div className="auth-panel">
              <span className="crumb">Home / Log In</span>
              <h2>Welcome back to Valam</h2>
              <p>Log in to keep tabs on weather alerts, ask the AI assistant and manage your marketplace listings.</p>
              <ul className="auth-points">
                <li>
                  <i className="fa-solid fa-cloud-sun-rain" aria-hidden="true" /> Real-time weather &amp; irrigation
                  alerts
                </li>
                <li>
                  <i className="fa-solid fa-camera-retro" aria-hidden="true" /> AI chatbot &amp; disease detection
                </li>
                <li>
                  <i className="fa-solid fa-store" aria-hidden="true" /> Your marketplace orders &amp; listings
                </li>
              </ul>
            </div>
            <div className="auth-form-wrap">
              <div className="auth-card">
                <h3>Log in to Valam</h3>
                <p className="auth-sub">Enter your account details below.</p>
                <LoginForm />
                <p className="auth-switch">
                  Don&apos;t have an account? <Link href="/register">Create one</Link>
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
