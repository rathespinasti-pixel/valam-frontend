import type { Config } from "tailwindcss";

// Tailwind v4 reads design tokens from the `@theme` block in app/globals.css.
// This file only exists to satisfy tooling that expects a config module and
// to make the darkMode strategy explicit; content detection is automatic.
const config: Config = {
  darkMode: "media",
};

export default config;
