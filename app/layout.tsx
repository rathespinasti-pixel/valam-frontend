import type { Metadata } from "next";
import { Poppins, Inter, Noto_Sans_Tamil } from "next/font/google";
import { BackToTop } from "@/components/layout/BackToTop";
import { ScrollRevealProvider } from "@/components/layout/ScrollRevealProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valam (வளம்) — அறிவார்ந்த விவசாயத்தின் டிஜிட்டல் துணை",
  description:
    "Valam is an all-in-one smart farming app: real-time weather alerts, AI plant-disease detection, a seeds & fertilizer marketplace and a farmer community — built for small and medium farmers.",
  icons: { icon: "/images/logo.png" },
};

import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${notoSansTamil.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <BackToTop />
          <ScrollRevealProvider />
        </LanguageProvider>
      </body>
    </html>
  );
}
