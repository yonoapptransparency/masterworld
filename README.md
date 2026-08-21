<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# RummyDex Platform & Transparency System

RummyDex is an all-in-one transparency platform, app store catalog, news portal, and review hub for Rummy, Teen Patti, Yono, and casual arcade gaming applications.

---

## 📚 System Architecture & Documentation

Full architectural specifications, directory layout, dual-repo split-sync configurations, and security protocols are documented in:
- **`AGENTS.md`**: Master Source of Truth for system architecture, performance optimization rules, Firestore data flow, community moderation engine, and dual-repo routing.
- **`MORE_INFO_SECURITY_ARCHITECTURE.md`**: Security specifications for download link clearance, Turnstile anti-bot verification, and anonymous bounce gateway.
- **`.github/workflows/split-sync.yml`**: Automated pipeline that splits and syncs the codebase into **Dex** (`www.rummydex.com` public site) and **Masterworld** (admin control site).

---

## 🚀 Key Modules & Capabilities

1. **Catalog & High Availability**:
   - Primary: Cloud Firestore database with local disk caching and real-time synchronization.
   - High-Availability Fallback: `/src/lib/staticData.json` guarantees 100% uptime if cloud services are unreachable.
   - Play Store UI with Cloudinary automatic image compression (`f_auto,q_auto,w_*`).

2. **Community Reviews & Ratings**:
   - Real-time user reviews with star distribution summary, helpful voting persistence, and moderation queue.
   - Admin Reviews Console (`AdminReviewsTab.tsx`) with full CRUD, pinning, status toggles, and official developer/admin replies.

3. **Ultra-Lightweight Reporting**:
   - Public Flagging modal (`ReportAppModal.tsx`) with zero-load direct submission.
   - Dedicated User Reports & Content Flags Center (`AdminReportsTab.tsx`) with audit notes and investigation tracking.

4. **Security & Link Vault**:
   - AES-encrypted download vault with Cloudflare Turnstile anti-scraping nonces.
   - Admin TOTP 2FA authentication and JWT bearer validation.

---

## 🛠️ Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server (Port 3000):
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Start production server:
   ```bash
   npm run start
   ```