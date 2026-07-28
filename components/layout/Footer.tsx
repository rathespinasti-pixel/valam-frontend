import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import { SocialLinks } from "./SocialLinks";

interface FooterProps {
  /** chatbot.html and pest-radar.html link the first/last platform items to the
   *  chatbot's topic query params instead of the services/marketplace anchors,
   *  and label the pest-radar link "AI Pest Detection" instead of "AI Disease
   *  Detection" — preserved here instead of silently normalizing it away. */
  platformLinksVariant?: "default" | "chat";
}

export function Footer({ platformLinksVariant = "default" }: FooterProps) {
  const isChatVariant = platformLinksVariant === "chat";
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <Image src={logo} alt="Valam logo" />
              <b>வளம் · Valam</b>
            </div>
            <p style={{ fontSize: ".9rem", lineHeight: 1.6 }}>
              அறிவார்ந்த விவசாயத்தின் டிஜிட்டல் துணை — the digital companion for informed farming.
            </p>
            <SocialLinks />
          </div>
          <div>
            <h5>Platform</h5>
            <ul>
              <li>
                <Link href={isChatVariant ? "/chatbot?topic=weather" : "/services#weather"}>Weather Alerts</Link>
              </li>
              <li>
                <Link href={isChatVariant ? "/chatbot?topic=crop-guides" : "/services#crop-guides"}>Crop Guides</Link>
              </li>
              <li>
                <Link href="/crop-simulator">AI Crop DNA Simulator</Link>
              </li>
              <li>
                <Link href="/pest-radar">{isChatVariant ? "AI Pest Detection" : "AI Disease Detection"}</Link>
              </li>
              <li>
                <Link href="/irrigation-solar">Irrigation &amp; Solar</Link>
              </li>
              <li>
                <Link href={isChatVariant ? "/chatbot?topic=marketplace" : "/marketplace"}>Marketplace</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/about#team">Our Team</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li>
                <i className="fa-solid fa-envelope" aria-hidden="true" />
                &nbsp; hello@valamfarm.app
              </li>
              <li>
                <i className="fa-solid fa-phone" aria-hidden="true" />
                &nbsp; +94 76 123 4567
              </li>
              <li>
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                &nbsp; Vavuniya, Sri Lanka
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Valam. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
