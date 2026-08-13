# 🌾 Valam (வளம் / වළම්) — Smart Agriculture & Cloud Marketplace Frontend

**Valam** is a modern, high-performance, fully mobile-responsive web application for smart farming, crop growth lifecycle management, AI-driven disease diagnosis, solar irrigation planning, direct produce marketplace bargaining, and farmer-consumer community engagement.

Built for agricultural communities in Sri Lanka and beyond, Valam supports **100% trilingual localization** in **English**, **Tamil (தமிழ்)**, and **Sinhala (සිංහල)**.

---

## 🌟 Key Features & Portals

### 👨‍🌾 1. Farmer Portal
- **Dashboard & 5-Stage Growth Tracker (`/dashboard`)**: Track crop age, days until harvest, active growth stage, progress percentage, daily agronomy tasks, weather advisories, and stage-specific compost application alerts.
- **Crop Lifecycle Explorer (`/crops`, `/crops/lifecycle`)**: Deep dive into 5 distinct growth stages (Seedling/Nursery, Vegetative, Flowering, Fruiting, Harvest) with AI representative growth stage imagery and dosage recommendations.
- **Producer Seller Hub (`/marketplace`)**: List agricultural produce, set fixed prices or enable bargaining, manage stock inventory, and review incoming consumer offers (Accept, Counter-Offer, Decline).
- **AI Plant Disease Diagnosis (`/diagnosis`)**: Upload leaf photos or select symptoms to run instant AI disease detection with organic & chemical treatment remedies.
- **Solar & Smart Irrigation Planner (`/irrigation-solar`)**: Field water volume calculator, pipe spacing breakdown, solar pump sizing, and government subsidy eligibility checker.
- **Real-Time Weather Advisories (`/weather`)**: District-level rainfall, temperature, humidity, wind speed, and rain impact alerts tailored for agricultural operations.

### 🛒 2. Consumer Portal
- **Direct Fresh Harvest Marketplace (`/consumer`)**: Browse farm-fresh produce directly from local smallholders filtered by district, category, price, and farming method (Organic vs Conventional).
- **Interactive Price Bargaining Engine**: Propose custom bargain prices with real-time percentage savings feedback and track pending, accepted, or countered offers.
- **Order Tracker & Counter-Offer Acceptor**: Accept farmer counter-offers in 1 click and confirm order delivery details.

### 💬 3. Direct Messaging & Community
- **1-on-1 Direct Chat (`/chat`)**: Real-time messaging between consumers and farmers for trade inquiries, harvest pickup, and order coordination.
- **Agronomy Community Forum (`/community`)**: Categorized discussion board (Pest Control, Equipment & Solar, Soil & Fertilizer, Market Q&A, General) with post creation, filtering, and reply threads.

### 🤖 4. AI Farming Assistant Chatbot (`/chatbot`)
- Interactive AI chatbot initialized with active crop context, localized in English, Tamil, and Sinhala for instant answers on dry-zone crop management, fertilizer dosage, and pest threats.

### 🛡️ 5. Super Admin & Operations Suite (`/admin`)
- Comprehensive administrative control center:
  - **Overview Analytics**: Active users, registered crops, disease uploads, marketplace transactions, and system health.
  - **User Directory**: Search, filter, edit, or suspend Farmer and Consumer accounts.
  - **Crop Database & Compost Configurator**: Manage official crop guides, planting methods, watering rules, and stage-by-stage compost dosing recipes.
  - **Agricultural Disease Knowledge Base**: Catalog plant diseases, symptoms, and treatment guidelines.
  - **Farmer Disease Uploads Review**: Inspect and approve/reject farmer AI disease diagnosis submissions.
  - **Broadcast System Notifications**: Send targeted system-wide alerts to farmers, consumers, or all users.
  - **Administrator Accounts**: Super Admin role-based access control and staff management.

---

## 📱 Mobile Responsiveness & Design System

Valam is built with a universal responsive layout engine guaranteeing flawless display across all viewports from **320px mobile screens** up to **4K desktop displays**:
- **Adaptive Navigation**: Desktop persistent sidebar on large viewports (`>= 1024px`), collapsing to a top header with slide-over navigation drawer (`SidebarDrawer`) on mobile screens.
- **Fluid Layout Grids**: Custom CSS layout utility engine (`.grid-2col-responsive`, `.grid-3col-responsive`, `.grid-4col-responsive`, `.grid-sidebar-responsive`).
- **Touch-Friendly Controls**: Touch horizontal scroll containers for 5-stage timelines, topic pills, and data tables.
- **Zero Horizontal Overflow**: `max-width: 100vw` protection preventing clipping or unwanted horizontal scrolling.

---

## 🌐 Multilingual Localization (Trilingual)

Supported Languages:
- 🇬🇧 **English (en)**
- 🇱🇰 **Tamil (தமிழ் - ta)**
- 🇱🇰 **Sinhala (සිංහල - si)**

Localization is managed reactively via `LanguageContext` and a centralized translation dictionary in `lib/translations.ts`.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS with unified CSS custom properties (`app/globals.css`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

---

## 📁 Project Directory Structure

```
valam-frontend/
├── app/
│   ├── layout.tsx             # Root layout with font declarations & providers
│   ├── page.tsx               # Public landing page & feature showcase
│   ├── dashboard/             # Farmer Dashboard & 5-Stage Lifecycle timeline
│   ├── consumer/              # Consumer Harvest Marketplace & Bargains
│   ├── marketplace/           # Farmer Producer Seller Hub & Offers Manager
│   ├── chat/                  # Direct 1-on-1 messaging center
│   ├── community/             # Farmer & Consumer Community Forum
│   ├── crops/                 # Crop Guides and growth requirements
│   │   └── lifecycle/         # Detailed 5-stage crop growth explorer
│   ├── diagnosis/             # AI Plant Disease Detection & Symptoms
│   ├── irrigation-solar/      # Solar pump & drip irrigation planner
│   ├── weather/               # District weather forecast & rain alerts
│   ├── chatbot/               # AI Farming Assistant Chatbot
│   ├── admin/                 # Super Admin & Staff Management Suite
│   ├── login/                 # User Authentication Login
│   ├── register/              # Role-based Registration (Farmer / Consumer)
│   ├── onboarding/            # First-time farm profile setup wizard
│   ├── settings/              # Profile, Language & Account preferences
│   └── globals.css            # Responsive design system tokens & utility rules
├── components/
│   ├── auth/                  # LoginForm, RegisterForm, AuthGuard
│   ├── layout/                # Navbar, SidebarDrawer, NotificationDropdown, Footer
│   ├── ui/                    # LanguageSwitcher, GpsLocationButton, Reveal, badges
│   ├── home/                  # Landing page hero, feature grids, FAQ, CTA
│   └── irrigation-solar/      # Solar recommendation form & subsidy eligibility checker
├── context/
│   ├── LanguageContext.tsx    # Reactive trilingual state (EN / TA / SI)
│   └── NotificationContext.tsx# In-app toast & confirmation modal dialogs
├── lib/
│   ├── api.ts                 # Typed REST API client & mock dataset fallbacks
│   ├── types.ts               # Data models & interfaces
│   ├── translations.ts        # Multilingual dictionary (EN, TA, SI)
│   ├── lifecycle.ts           # 5-stage crop growth agronomy data & helpers
│   ├── simulatorData.ts       # Crop simulator, solar pumping & subsidy calculators
│   ├── chatbotTopics.ts       # AI chatbot prompt suggestions & knowledge tags
│   └── utils.ts               # Classname merge & formatting utilities
├── public/                    # Logos, icons, and static assets
├── .env.example               # Environment configuration template
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript compiler configuration
└── package.json               # Dependencies and scripts
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher

### 1. Installation
Clone the repository and install dependencies:
```bash
cd valam-frontend
npm install
```

### 2. Configure Environment Variables
Create a local environment file based on `.env.example`:
```bash
cp .env.example .env.local
```

Set the backend API endpoint URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
Start the Next.js development server with Turbopack:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
To test TypeScript compilation and generate an optimized production bundle:
```bash
npm run build
```

To run the production build locally:
```bash
npm start
```

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server with hot reloading |
| `npm run build` | Runs TypeScript type checking and generates production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs Next.js ESLint checks |

---

## 📄 License

This repository is part of the **Valam Smart Crop Ecosystem** project. All rights reserved.
