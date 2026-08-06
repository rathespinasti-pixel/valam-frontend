"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import { SocialLinks } from "./SocialLinks";
import { useLanguage } from "@/context/LanguageContext";

interface FooterProps {
  platformLinksVariant?: "default" | "chat";
}

export function Footer({ platformLinksVariant = "default" }: FooterProps) {
  const { language } = useLanguage();

  const isTa = language === "ta";
  const isSi = language === "si";

  return (
    <footer className="site-footer">
      <div className="container">
        <div
          className="footer-grid"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 300px", maxWidth: "400px" }}>
            <div className="footer-brand">
              <Image src={logo} alt="Valam logo" />
              <b>வளம் · Valam</b>
            </div>
            <p style={{ fontSize: ".9rem", lineHeight: 1.6 }}>
              {isTa
                ? "அறிவார்ந்த விவசாயத்தின் டிஜிட்டல் துணை — வட மாகாண விவசாயிகளுக்கான ஸ்மார்ட் வழிகாட்டி."
                : isSi
                ? "බුද්ධිමත් ගොවිතැනේ ඩිජිටල් සහකරු — උතුරු පළාතේ ගොවීන් සඳහා වන ස්මාර්ට් මඟපෙන්වන්නා."
                : "The digital companion for informed farming in Northern Province, Sri Lanka."}
            </p>
            <SocialLinks />
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <h5>{isTa ? "இணைப்புகள்" : isSi ? "සම්බන්ධතා" : "Company"}</h5>
            <ul>
              <li>
                <Link href="/about">{isTa ? "எங்களைப் பற்றி" : isSi ? "අප ගැන" : "About Us"}</Link>
              </li>
              <li>
                <Link href="/crops">{isTa ? "பயிர் வழிகாட்டி" : isSi ? "වගා උපදෙස්" : "Crop Guides"}</Link>
              </li>
              <li>
                <Link href="/contact">{isTa ? "தொடர்பு கொள்ள" : isSi ? "සම්බන්ධ වන්න" : "Contact"}</Link>
              </li>
              <li>
                <Link href="/admin" style={{ color: "#10B981", fontWeight: 600 }}>{isTa ? "நிர்வாகி போர்டல்" : isSi ? "පරිපාලක ද්වාරය" : "Admin Portal"}</Link>
              </li>
            </ul>
          </div>

          <div style={{ flex: "1 1 240px" }}>
            <h5>{isTa ? "தொடர்புகளுக்கு" : isSi ? "ලිපිනය" : "Contact"}</h5>
            <ul>
              <li>
                <i className="fa-solid fa-envelope" aria-hidden="true" />
                &nbsp; support@valam.lk
              </li>
              <li>
                <i className="fa-solid fa-phone" aria-hidden="true" />
                &nbsp; +94 24 222 1234
              </li>
              <li>
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                &nbsp; Vavuniya, Northern Province, Sri Lanka
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Valam (வளம்). All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
