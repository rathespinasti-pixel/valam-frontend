import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatbotPageClient } from "@/components/chatbot/ChatbotPageClient";

export const metadata: Metadata = {
  title: "AI Assistant — Valam",
  description:
    "Chat with the Valam AI assistant about weather, crop guides, pests and disease, irrigation & solar, or the seeds & fertilizer marketplace.",
};

export default function ChatbotPage() {
  return (
    <>
      <Navbar />

      <section className="page-hero">
        <div className="container">
          <div className="crumb">Home / AI Assistant</div>
          <h1>Ask Valam anything about your farm</h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 560 }}>
            Pick a topic below, try a popular question, or type your own — the assistant answers in real time, in
            Tamil or English.
          </p>
        </div>
      </section>

      <Suspense fallback={null}>
        <ChatbotPageClient />
      </Suspense>

      <Footer platformLinksVariant="chat" />
    </>
  );
}
