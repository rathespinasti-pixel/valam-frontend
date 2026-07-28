import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Valam",
};

const FAQ_ITEMS = [
  { question: "How fast is the response time?", answer: "We reply to all enquiries within 24 hours on business days." },
  { question: "Can I request a district rollout?", answer: 'Yes — select "Partnership" in the topic dropdown and mention your district and estimated farmer count.' },
  { question: "I'm a seed/fertilizer dealer — how do I join the marketplace?", answer: 'Choose "Marketplace Seller Signup" above. We\'ll send verification steps to your email.' },
];

export default function ContactPage() {
  return (
    <>
      <Navbar active="contact" />

      <section className="page-hero">
        <div className="container">
          <div className="crumb">Home / Contact</div>
          <h1>Let&apos;s talk farming</h1>
          <p style={{ marginTop: 14, color: "#CFE3D5", maxWidth: 560 }}>
            Questions, feedback, or want to bring Valam to your district? Send a message — our team replies within
            24 hours.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <Reveal>
            <div className="contact-info-card">
              <div className="row">
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                <div>
                  <b>Office</b>
                  <span>Vavuniya, Northern Province, Sri Lanka</span>
                </div>
              </div>
              <div className="row">
                <i className="fa-solid fa-phone" aria-hidden="true" />
                <div>
                  <b>Phone</b>
                  <span>+94 76 123 4567</span>
                </div>
              </div>
              <div className="row">
                <i className="fa-solid fa-envelope" aria-hidden="true" />
                <div>
                  <b>Email</b>
                  <span>hello@valamfarm.app</span>
                </div>
              </div>
              <div className="row">
                <i className="fa-solid fa-clock" aria-hidden="true" />
                <div>
                  <b>Support Hours</b>
                  <span>Mon–Sat, 8:00 AM – 8:00 PM</span>
                </div>
              </div>
              <SocialLinks style={{ marginTop: 28 }} />
            </div>
            <div className="map-embed" style={{ marginTop: 24 }}>
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=80.45%2C8.70%2C80.55%2C8.80&layer=mapnik"
                loading="lazy"
                title="Valam office location map"
              />
            </div>
          </Reveal>

          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2 style={{ marginTop: 14 }}>Before you write in</h2>
          </Reveal>
          <Reveal style={{ maxWidth: 760 }}>
            <FaqAccordion items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
