import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import { SocialLinks } from "./SocialLinks";

interface FooterProps {
  platformLinksVariant?: "default" | "chat";
}

export function Footer({ platformLinksVariant = "default" }: FooterProps) {
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
              அறிவார்ந்த விவசாயத்தின் டிஜிட்டல் துணை — the digital companion for informed farming.
            </p>
            <SocialLinks />
          </div>

          <div style={{ flex: "1 1 200px" }}>
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

          <div style={{ flex: "1 1 240px" }}>
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
