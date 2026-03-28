# Nakshatra — Deployment, Usage & App Store Guide

---

## Table of Contents
1. [Local Development](#1-local-development)
2. [$0/Month Cloud Deployment](#2-0month-cloud-deployment)
3. [Environment Variables](#3-environment-variables)
4. [Usage Instructions](#4-usage-instructions)
5. [PWA to Native (iOS/Android)](#5-pwa-to-native-iosandroid)
6. [Apple App Store Submission](#6-apple-app-store-submission)
7. [Google Play Store (Bonus)](#7-google-play-store-bonus)
8. [Domain & DNS](#8-domain--dns)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)

---

## 1. Local Development

### Prerequisites
- Node.js >= 18
- npm >= 9

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm test             # Run Vitest tests
```

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Configure environment variables
npm run dev             # http://localhost:3001
npm run build           # Compile TypeScript → dist/
npm start               # Run compiled output
```

### Full Stack (simultaneous)
```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && npm run dev
```

The frontend Vite dev server proxies `/api/*` to `http://localhost:3001` automatically.

---

## 2. $0/Month Cloud Deployment

### Architecture
```
[Cloudflare DNS] → [Vercel (Frontend)] → [Render (Backend)] → [Neon (Postgres)]
                                        ↘ [Groq Free API (LLM)]
```

### A. Frontend → Vercel (Free Tier)

1. **Push to GitHub:**
   ```bash
   git init
   git remote add origin https://github.com/YOUR_USERNAME/nakshatra.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) → New Project → Import Git Repository
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Environment Variables (Vercel Dashboard → Settings → Environment Variables):**
   ```
   VITE_API_URL=https://nakshatra-api.onrender.com/api/v1
   VITE_GROQ_API_KEY=gsk_your_key_here
   VITE_ADMIN_TOKEN=your-secure-admin-token
   ```

4. **Custom Domain:**
   - Vercel Dashboard → Settings → Domains → Add `nakshatra.app` (or your domain)
   - Update DNS to point to Vercel's IP (76.76.21.21) or CNAME (`cname.vercel-dns.com`)

5. **Deploy:** Every `git push` to `main` triggers auto-deploy.

### B. Backend → Render (Free Tier)

1. **Create a Web Service on [render.com](https://render.com):**
   - **Source:** GitHub repo
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Instance Type:** Free

2. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   ADMIN_TOKEN=your-secure-admin-token
   GROQ_API_KEY=gsk_your_key_here
   DATABASE_URL=postgresql://user:pass@host/nakshatra  # From Neon
   CORS_ORIGIN=https://nakshatra.app
   ```

3. **Note:** Render free tier sleeps after 15 min of inactivity. First request takes ~30s cold start. For always-on, use Render Starter ($7/mo) or Railway.

### C. Database → Neon (Free Tier)

1. Go to [neon.tech](https://neon.tech) → Create Project → "nakshatra"
2. Copy the connection string → paste into Render's `DATABASE_URL`
3. Free tier: 0.5 GB storage, auto-suspend after 5 min idle

### D. LLM → Groq (Free Tier)

1. Go to [console.groq.com](https://console.groq.com) → API Keys → Create
2. Free tier: 30 req/min on Llama-3, Mixtral, Gemma
3. Copy key → paste into both Vercel and Render env vars

### E. CDN → Cloudflare (Free)

1. Transfer or configure DNS on [cloudflare.com](https://cloudflare.com)
2. Proxy traffic through Cloudflare for:
   - Free SSL
   - DDoS protection
   - Edge caching for static assets
   - Analytics

### Monthly Cost Breakdown
| Service         | Tier    | Cost   |
|-----------------|---------|--------|
| Vercel          | Hobby   | $0     |
| Render          | Free    | $0     |
| Neon            | Free    | $0     |
| Groq            | Free    | $0     |
| Cloudflare      | Free    | $0     |
| Domain (annual) | —       | ~$10/yr|
| **Total**       |         | **$0/mo** |

---

## 3. Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api/v1     # Backend API base URL
VITE_GROQ_API_KEY=gsk_xxxx                    # Groq API key (client fallback)
VITE_ADMIN_TOKEN=nakshatra-admin-secret       # Admin auth token
```

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
ADMIN_TOKEN=nakshatra-admin-secret
GROQ_API_KEY=gsk_xxxx
DATABASE_URL=postgresql://...                 # Neon connection string
CORS_ORIGIN=http://localhost:5173             # Allowed CORS origin
OLLAMA_URL=http://localhost:11434             # Optional local Ollama
```

---

## 4. Usage Instructions

### First Launch
1. Open the app → You'll see the **Onboarding Wizard**
2. Enter your name, birth date/time, birth location
3. Select your language (English / Hindi)
4. You're in! The Dashboard shows your cosmic overview

### Key Features
| Feature | Path | Description |
|---------|------|-------------|
| **Dashboard** | `/dashboard` | Daily cosmic overview, XP, streak |
| **Kundli** | `/kundli` | Generate Vedic birth chart with planetary positions |
| **Tarot** | `/tarot` | Interactive tarot card readings |
| **Oracle** | `/oracle` | AI-powered Vedic wisdom chat (RAG-enhanced) |
| **Numerology** | `/numerology` | Name & birth number analysis |
| **Compatibility** | `/compatibility` | Partner compatibility analysis |
| **Vastu** | `/vastu` | Vastu Shastra room analysis |
| **Panchanga** | `/panchanga` | Hindu calendar with tithi, nakshatra, yoga |
| **Muhurta** | `/muhurta` | Auspicious timing calculator |
| **Daily Rituals** | `/rituals` | Daily spiritual practice tracker |
| **Scriptures** | `/scriptures` | Hindu scripture library |
| **Community** | `/community` | Share cosmic discoveries |
| **Achievements** | `/achievements` | Gamified achievement badges |
| **Profile** | `/profile` | User profile, settings, language |

### Admin Features
| Feature | Path | Access |
|---------|------|--------|
| **Knowledge Base** | `/knowledge` | Admin only — manage RAG knowledge sources |

### Language Toggle
- Click the **EN | हिं** pill toggle in the header to switch between English and Hindi
- All UI text updates instantly — no reload needed

### PWA Install
- On mobile Safari/Chrome, tap "Add to Home Screen"
- The app installs as a native-feeling PWA with splash screen and icon

---

## 5. PWA to Native (iOS/Android)

Nakshatra is a PWA, which means it already works on mobile. But for App Store submission, you need a native wrapper.

### Option A: Capacitor (Recommended — Free)

[Capacitor](https://capacitorjs.com/) wraps your web app in a native shell.

```bash
# From frontend directory
npm install @capacitor/core @capacitor/cli
npx cap init "Nakshatra" "com.bitsizegyaan.nakshatra" --web-dir dist

# Add platforms
npx cap add ios
npx cap add android

# Build web assets, then sync
npm run build
npx cap sync

# Open in Xcode / Android Studio
npx cap open ios
npx cap open android
```

### Option B: PWABuilder (Easiest — Free)

1. Go to [pwabuilder.com](https://pwabuilder.com)
2. Enter your deployed URL (e.g., `https://nakshatra.app`)
3. Click "Package for stores"
4. Download the iOS/Android packages
5. Open in Xcode/Android Studio and submit

### Capacitor Configuration (`capacitor.config.ts`)
```typescript
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.bitsizegyaan.nakshatra',
  appName: 'Nakshatra',
  webDir: 'dist',
  server: {
    // For production, comment this out to use bundled assets
    // url: 'https://nakshatra.app',
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#020B18',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#020B18',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020B18',
    },
  },
}

export default config
```

---

## 6. Apple App Store Submission

### Prerequisites
- **Apple Developer Account** — $99/year at [developer.apple.com](https://developer.apple.com/programs/)
- **Mac with Xcode 15+** installed
- **App icons** — 1024×1024 PNG (no transparency, no rounded corners)
- **Screenshots** — required sizes:
  - iPhone 6.7" (1290×2796) — iPhone 15 Pro Max
  - iPhone 6.5" (1284×2778) — iPhone 14 Plus
  - iPad Pro 12.9" (2048×2732) — if supporting iPad

### Step-by-Step

#### 1. Prepare the Xcode Project

```bash
cd frontend
npm run build
npx cap sync ios
npx cap open ios
```

In Xcode:
- Set **Bundle Identifier:** `com.bitsizegyaan.nakshatra`
- Set **Version:** `1.0.0` and **Build:** `1`
- Set **Deployment Target:** iOS 15.0+
- Set **Display Name:** `Nakshatra`
- Add your **Team** (Apple Developer account)

#### 2. Configure App Icons

Create `AppIcon.appiconset` with your 1024×1024 icon. Tools:
- [makeappicon.com](https://makeappicon.com) — generates all required sizes
- Or use Xcode's asset catalog to drag-drop the 1024×1024 PNG

#### 3. Add Required Permissions (Info.plist)

If using camera, location, etc:
```xml
<key>NSCameraUsageDescription</key>
<string>Nakshatra uses the camera to scan documents for the Knowledge Base.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Nakshatra uses your location to calculate accurate birth chart positions.</string>
```

#### 4. Create App Store Connect Listing

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps** → **+** → **New App**
3. Fill in:
   - **Name:** Nakshatra — Vedic Astrology & Wisdom
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** com.bitsizegyaan.nakshatra
   - **SKU:** nakshatra-001
   - **Category:** Lifestyle (Primary), Education (Secondary)
   - **Content Rights:** Does not contain third-party content (or declare if using scripture texts)
   - **Age Rating:** 4+ (no objectionable content)

4. **App Information:**
   - **Subtitle:** Kundli, Tarot, Numerology & AI Oracle
   - **Description:**
     ```
     Nakshatra brings ancient Vedic wisdom to your fingertips with cutting-edge AI.

     ✦ KUNDLI — Generate your complete Vedic birth chart with planetary positions, houses, and yoga analysis
     ✦ TAROT — Interactive tarot card readings with AI-powered interpretations
     ✦ ORACLE — Chat with an AI Oracle trained on authentic Vedic scriptures and Jyotisha texts
     ✦ NUMEROLOGY — Discover the hidden meaning in your name and birth numbers
     ✦ COMPATIBILITY — Ashtakoot-based partner compatibility analysis
     ✦ VASTU SHASTRA — Room-by-room Vastu analysis for your home
     ✦ PANCHANGA — Hindu calendar with tithi, nakshatra, yoga, and karana
     ✦ MUHURTA — Find the most auspicious time for important events
     ✦ DAILY RITUALS — Track your spiritual practice and build cosmic discipline
     ✦ SCRIPTURES — Explore wisdom from the Bhagavad Gita, Upanishads, and more

     Available in English and Hindi. Built with respect for ancient traditions and powered by modern AI.
     ```
   - **Keywords:** vedic astrology, kundli, birth chart, tarot, numerology, vastu, panchanga, hindu, jyotish, horoscope, spiritual
   - **Support URL:** https://nakshatra.app/support
   - **Privacy Policy URL:** https://nakshatra.app/privacy

5. **Screenshots:** Upload for each required device size

6. **App Review Information:**
   - **Contact Info:** Your name, email, phone
   - **Notes for Reviewer:**
     ```
     Nakshatra is an astrology and spiritual wellness app. It uses AI to provide
     interpretations of Vedic astrological concepts. No real astrological predictions
     are made — all content is for entertainment and educational purposes.

     The app requires no login for basic features. The AI Oracle chat connects to
     our backend API for enhanced responses but falls back to built-in responses
     if the server is unavailable.
     ```

#### 5. Archive & Upload

In Xcode:
1. Select **Any iOS Device** as the build target
2. **Product** → **Archive**
3. When archive completes, click **Distribute App**
4. Choose **App Store Connect** → **Upload**
5. Wait for processing (5-15 min)

#### 6. Submit for Review

1. In App Store Connect, select your build
2. Click **Submit for Review**
3. Typical review time: **24-48 hours**

### Common Rejection Reasons & Fixes

| Reason | Fix |
|--------|-----|
| **4.2 Minimum Functionality** | Ensure all features work offline (rule engine fallback) |
| **5.1.1 Data Collection** | Add privacy policy, declare data usage in App Privacy |
| **2.1 App Completeness** | Remove all placeholder content, ensure no crashes |
| **1.4.1 Physical Harm** | Add disclaimer: "For entertainment purposes only. Not a substitute for professional advice." |
| **3.1.1 In-App Purchase** | If adding premium features, use Apple's IAP (not Stripe) |
| **2.3.1 Hidden Features** | Don't hide admin features — they should be auth-gated, not hidden |

### App Privacy Labels (Required)

In App Store Connect → App Privacy:
- **Data Collected:** Name, Date of Birth, Location (birth location)
- **Data Linked to You:** Yes (for personalized charts)
- **Data Used to Track You:** No
- **Data Shared with Third Parties:** No (unless using analytics)

---

## 7. Google Play Store (Bonus)

### Prerequisites
- **Google Play Developer Account** — $25 one-time at [play.google.com/console](https://play.google.com/console)

### Steps
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
```

In Android Studio:
1. **Build** → **Generate Signed Bundle/APK** → **Android App Bundle (.aab)**
2. Create a keystore (save it securely!)
3. Upload to Google Play Console
4. Fill in listing details (similar to Apple)
5. Submit for review (typically 1-3 days)

### Content Rating
- Complete the content rating questionnaire in Play Console
- Nakshatra should qualify for "Everyone" rating

---

## 8. Domain & DNS

### Recommended Domain Names (check availability)
- `nakshatra.app` (~$14/year on Google Domains)
- `nakshatra.in` (~$10/year)
- `getnakshatra.com` (~$10/year)

### DNS Setup (Cloudflare)
```
Type    Name            Content                 Proxy
A       @               76.76.21.21             Yes    # Vercel
CNAME   www             cname.vercel-dns.com    Yes    # Vercel
CNAME   api             nakshatra-api.onrender.com  Yes  # Backend
```

---

## 9. Monitoring & Maintenance

### Free Monitoring Tools
- **UptimeRobot** (free) — ping your backend every 5 min to prevent cold starts + get downtime alerts
- **Sentry** (free tier) — error tracking for both frontend and backend
- **Vercel Analytics** (free) — page views, web vitals
- **Cloudflare Analytics** (free) — traffic, cache hit ratio

### Maintenance Checklist
- [ ] Rotate `ADMIN_TOKEN` and `GROQ_API_KEY` quarterly
- [ ] Monitor Groq API usage (stay under 30 req/min free limit)
- [ ] Check Neon storage (0.5 GB free limit)
- [ ] Update dependencies monthly (`npm outdated`)
- [ ] Back up knowledge base vector store JSON monthly
- [ ] Test PWA install on new iOS/Android versions after major OS releases

---

*Built with cosmic precision by Nakshatra Engineering*
*॥ सर्वे भवन्तु सुखिनः ॥*
