# Valam (வளம் / වළම්) — Frontend Web Application

Modern Next.js 15 (App Router) + TypeScript + Vanilla CSS web application for the Valam Smart Agriculture ecosystem.

---

## Key Features

1. **Role-Based Portals**:
   - **🌾 Farmer Portal (`/dashboard`, `/marketplace`, `/crops`, `/weather`, `/diagnosis`, `/irrigation-solar`)**:
     - 5-stage dynamic crop lifecycle tracking with AI stage imagery.
     - Real-time weather rules and agronomy checklist.
     - Cloud Marketplace Seller Hub with incoming bargain offer management (Accept, Counter, Decline).
     - AI plant disease diagnosis and pest detection.
     - Solar irrigation advisor and field calculators.
   - **🛒 Consumer Portal (`/consumer`)**:
     - Fresh harvest discovery with vegetable, district, price, and organic filters.
     - Interactive fair-price bargaining modal with real-time savings calculations.
     - Bargain offer tracker with 1-click counter-offer acceptance and order confirmation.
   - **🛡️ Admin Suite (`/admin`)**:
     - User management, crop guide editor, farmer reports, audit activity, and system alerts.

2. **Direct 1-on-1 Chat (`/chat`)**:
   - Real-time direct messaging between farmers and consumers with read receipts and timestamps.

3. **Community Forum (`/community`)**:
   - Categorized agronomic and marketplace discussions (Pest Control, Equipment & Solar, Soil & Fertilizer, Market Q&A, General).

4. **100% Multilingual Localization**:
   - Complete dynamic localization across **English (en)**, **Tamil (தமிழ் / ta)**, and **Sinhala (සිංහල / si)** via `LanguageContext` and `translations.ts`.

---

## Folder Structure

```
valam-frontend/
├── app/
│   ├── layout.tsx             # Root layout with Language, Notification, and Auth providers
│   ├── page.tsx               # Public landing page with features & agronomic showcase
│   ├── dashboard/             # Farmer Dashboard & 5-Stage Lifecycle timeline
│   ├── consumer/              # Consumer Cloud Market & Bargains Portal
│   ├── marketplace/           # Farmer Produce Seller Hub & Offers Manager
│   ├── chat/                  # Direct 1-on-1 messaging center
│   ├── community/             # Farmer & Consumer Community Forum
│   ├── crops/                 # Crop Guides and growth requirements
│   ├── diagnosis/             # AI Plant Disease Detection & Symptoms
│   ├── irrigation-solar/      # Solar pump & irrigation planner
│   ├── weather/               # District weather forecast & rain alerts
│   ├── chatbot/               # AI Farming Assistant Chatbot
│   ├── admin/                 # Super Admin & Staff Management Suite
│   ├── login/                 # Authentication login page
│   ├── register/              # Role-based registration (Farmer vs Consumer)
│   ├── settings/              # User Profile & Preferences
│   └── globals.css            # Unified design system tokens & styles
├── components/
│   ├── auth/                  # LoginForm, RegisterForm, AuthGuard
│   ├── layout/                # Navbar, SidebarDrawer, NotificationDropdown, Footer
│   ├── ui/                    # LanguageSwitcher, modals, buttons, badges
│   └── home/                  # Landing page hero, feature grids, FAQ
├── context/
│   ├── LanguageContext.tsx    # Reactive language state (en / ta / si)
│   └── NotificationContext.tsx# In-app toast & confirm modal dialogs
├── lib/
│   ├── api.ts                 # Full typed REST API client
│   ├── types.ts               # TypeScript data models and interfaces
│   ├── translations.ts        # Multilingual dictionary (EN, TA, SI)
│   ├── lifecycle.ts           # 5-stage crop agronomy & localized helpers
│   └── utils.ts               # Formatting and utility helpers
├── public/                    # Logos, icons, and static images
├── .env.example               # Environment variables template
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript compiler configuration
└── package.json               # Project dependencies and scripts
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
