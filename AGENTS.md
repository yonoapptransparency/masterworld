# Project Architecture & Developer Guide: RummyDex Transparency System

This repository serves as the **Source of Truth** for **RummyDex** ([https://www.rummydex.com](https://www.rummydex.com)), an all-in-one transparency platform, app store catalog, news portal, and review hub for Rummy, Teen Patti, Yono, and casual card/arcade applications.

---

## 1. Core System Architecture

- **Platform Architecture**: Full-Stack Single Page Application (SPA) powered by Express.js (`server.ts`) and React 18 with Vite and TypeScript.
- **Server Environment**: Runs an Express backend on port `3000` (0.0.0.0) that handles API requests, Turnstile anti-bot checks, dynamic SEO meta tag pre-rendering, XML sitemaps, RSS feeds, and static file serving.
- **Database & Storage**:
  - **Primary**: Cloud Firestore project (`ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a`, Database ID `(default)`).
  - **Collections**: `store_data` (documents: `apps_chunk_0`, `apps_chunk_1`, `settings`, `news`, `blogs`, `videos`, `quick_links`, `faqs`, `developers`, `secure_links`).
  - **Static High-Availability Fallback**: `/src/lib/staticData.json` guarantees 100% website uptime if Firestore is offline or rate-limited.
- **Build & Execution Scripts**:
  - **Dev Server**: `npm run dev` (`tsx server.ts` running on port 3000)
  - **Production Build**: `npm run build` (`vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`)
  - **Production Start**: `npm run start` (`node dist/server.cjs`)

---

## 2. Dual-Repo Automated Split-Sync System (`.github/workflows/split-sync.yml`)

This monorepo automatically splits and synchronizes changes to two isolated external GitHub repositories on every push to `main`:

1. **Dex Repository (Public Site)**: Public website repo (`www.rummydex.com`). All admin components, backend authentication routes, vault keys, and internal scripts are **automatically removed** during sync to guarantee security.
2. **Masterworld Repository (Admin Control)**: Admin control repo. All user-facing public pages (`Home.tsx`, `AppDetails.tsx`), public UI components, and static assets in `/public/` are **automatically removed** during sync to keep the admin interface clean and isolated.

### Sync Rules for Adding Files
When creating new components or pages, maintain repo isolation:
- **Admin-Only Files**: Add path to `ADMIN_ONLY_FILES` in `.github/workflows/split-sync.yml`.
- **Public-Only Files**: Add path to `PUBLIC_ONLY_FILES` in `.github/workflows/split-sync.yml`.

---

## 3. Complete Directory & File Architecture

```
/
├── server.ts                             # Main Express server entrypoint (API routes, static serving, rate limiting)
├── index.html                            # Primary HTML template with SEO placeholder tags
├── package.json                          # Dependencies & scripts (dev, build, start, lint)
├── vite.config.ts                        # Vite bundler configuration
├── firebase-applet-config.json           # Firebase Project & Database credentials
├── .github/workflows/split-sync.yml      # Dual-repo automated split & sync pipeline
│
├── public/                               # Static Public Assets
│   ├── favicon.ico / logo.png            # Branding & favicons
│   ├── site.webmanifest                  # Web App Manifest
│   ├── robots.txt / opensearch.xml       # Search Engine Indexing configs
│
├── src/
│   ├── main.tsx                          # React DOM client entrypoint
│   ├── App.tsx                           # Master App router (Public + Dynamic Admin Lazy Route)
│   ├── AppPublic.tsx                     # Main Public Layout router (Header, Pages, Footer, Navigation)
│   ├── seoHelper.ts                      # Server-side HTML injection, OpenGraph meta tags, INITIAL_DATA payload trimmer
│   ├── types.ts                          # Global TypeScript interfaces & types
│
│   ├── seo/                              # SEO Helper Utilities
│   │   └── utils.ts                      # URL formatters, OpenGraph image resolvers, Cloudinary optimizer
│
│   ├── server/                           # Backend Server Modules & API Routers
│   │   ├── firebase.ts                   # Server-side Firebase Admin REST SDK initializer
│   │   ├── security.ts                   # Cloudflare Turnstile anti-bot verification & link nonces
│   │   ├── middleware/adminAuth.ts       # Admin JWT & Audit Logging middleware
│   │   └── routes/
│   │       ├── adminAuthRoutes.ts        # Admin login, 2FA/TOTP verification, logout, session management
│   │       ├── adminVaultRoutes.ts       # Secure link vault encryption, decryption, DB repair, backups
│   │       ├── githubSyncRoutes.ts       # Split-sync webhooks and manual triggers
│   │       ├── publicApiRoutes.ts        # Public APIs (Download link decryption, reviews, feedback, reports)
│   │       └── seoRoutes.ts              # Dynamic sitemap.xml, rss.xml, robots.txt, opensearch.xml generators
│
│   ├── contexts/                         # React State Management
│   │   └── DataContextPublic.tsx         # Public context (apps catalog, settings, news, search, filters)
│
│   ├── pages/                            # Page Components
│   │   ├── Home.tsx                      # Primary catalog homepage (Featured banners, categories, search)
│   │   ├── AppDetails.tsx                # App details view (Deep-link auto-sync, safety alerts, specs, reviews)
│   │   ├── Blogs.tsx / BlogDetail.tsx    # Strategy blogs & articles
│   │   ├── NewsPage.tsx                  # Latest industry news & announcements
│   │   ├── VideosPage.tsx                # Media & gameplay video gallery
│   │   ├── DevelopersPage.tsx            # Developer profile directory
│   │   ├── Contact.tsx / AboutPage.tsx   # Contact forms & transparency details
│   │   ├── LegalPage.tsx                 # Dynamic legal & terms pages
│   │   ├── AdminDashboard.tsx            # Admin Control Panel (Admin only)
│   │   └── AdminLogin.tsx                # Admin Authentication Portal (Admin only)
│   │
│   ├── components/
│   │   ├── public/                       # Modular Public UI Components
│   │   │   ├── PublicHeader.tsx          # Main top navigation header with live search & categories
│   │   │   ├── PublicFooter.tsx          # Site footer with dynamic SEO links & copyright
│   │   │   ├── PublicBottomNav.tsx       # Floating mobile bottom navigation bar
│   │   │   ├── PublicBackToTop.tsx       # Scroll-to-top floating control
│   │   │   ├── AppHeader.tsx             # App details hero header (Icon, developer, download button)
│   │   │   ├── AppSpecsBar.tsx           # Quick metric bar (Rating, Size, Version, Category)
│   │   │   ├── AppSafetyBoxes.tsx        # Security, warning, and idea callout notices
│   │   │   ├── AppAboutSection.tsx       # Sanitized HTML app description & feature lists
│   │   │   ├── AppScreenshots.tsx        # Interactive screenshot gallery modal
│   │   │   ├── ReviewScoreSummary.tsx    # Rating breakdown & star distribution widget
│   │   │   ├── ReviewItem.tsx            # Individual review card with voting & reporting
│   │   │   ├── ReviewForm.tsx            # User star rating & review submission form
│   │   │   ├── YouTubePlayer.tsx         # Embedded YouTube video player component
│   │   │   ├── NewAdditions.tsx          # Newly added apps ticker component
│   │   │   ├── PublicChatbot.tsx         # Interactive AI assistant widget
│   │   │   └── StarRatingFeedback.tsx    # Site rating floating widget
│   │   │
│   │   ├── playstore/                    # Google Play Store Design System Components
│   │   │   ├── AppListItems.tsx          # Responsive app list cards with Cloudinary auto-optimization
│   │   │   ├── FeaturedBanner.tsx        # Featured top app hero banner
│   │   │   ├── PlayStoreCategoryRow.tsx  # Horizontal scrolling category app row
│   │   │   └── PlayStoreUI.tsx           # Full Play Store styled catalog view
│   │   │
│   │   └── admin/                        # Admin Dashboard UI Components (Admin only)
│   │       ├── AdminSidebar.tsx          # Dashboard navigation sidebar
│   │       ├── AdminTabContent.tsx       # Module tab content manager
│   │       ├── AdminAppsTab.tsx          # Catalog management view
│   │       ├── AdminNewsTab.tsx          # News management view
│   │       ├── AdminBlogsTab.tsx         # Blog management view
│   │       ├── AdminVideosTab.tsx        # Video management view
│   │       ├── AdminQuickLinksTab.tsx    # Quick links editor
│   │       ├── AdminWebsiteFaqsTab.tsx   # FAQ manager
│   │       ├── AdminDevelopersTab.tsx    # Developer profiles manager
│   │       ├── AdminSettingsTab.tsx      # Global settings editor
│   │       ├── AppInspector.tsx          # Read-only configuration inspector
│   │       ├── AppForm.tsx               # App editor with modular form sections
│   │       └── apps/sections/            # Modular App Form Sections (General, SEO, Content, Alerts)
│   │
│   ├── hooks/                            # Custom React Hooks
│   │   ├── useAdminAuth.ts               # Admin session & 2FA state manager
│   │   ├── useAdminApps.ts               # Admin catalog & vault sync hook
│   │   ├── useAdminSettings.ts           # Admin global settings CRUD hook
│   │   ├── useAppFilters.ts              # Catalog search, filter, and sorting logic
│   │   ├── useAppForm.ts                 # App editor state manager
│   │   ├── useReviews.ts                 # User reviews fetcher and submitter
│   │   ├── useGitHubSync.ts              # Split-sync trigger hook
│   │   └── useSEO.ts                     # Client-side dynamic title & meta tag manager
│   │
│   └── lib/                              # Core Utility Libraries & Data Backups
│       ├── staticData.json               # Full high-availability fallback dataset
│       ├── utilsPublic.ts / utils.ts     # Styling helpers (cn, safeVibrate)
│       ├── secureVault.ts                # AES Link Encryption / Decryption engine
│       ├── secureStorage.ts              # Encrypted local storage wrapper
│       ├── totp.ts                       # 2FA Time-based One-Time Password generator & validator
│       └── lazyWithRetry.ts              # Network fault-tolerant dynamic import wrapper
```

---

## 4. Key Performance & Optimization Rules

To maintain maximum Google Search Console indexing, 100% PageSpeed Scores, and instantaneous mobile loading, **ALWAYS** follow these performance rules:

1. **Cloudinary Automatic Image Optimization**:
   - Never render raw Cloudinary URLs directly without optimization.
   - Always wrap Cloudinary URLs in `getOptimizedImageUrl(url, width)` (defined in `src/seo/utils.ts`).
   - This automatically injects `/upload/f_auto,q_auto,w_<width>/`, reducing average icon size from **~370 KB to ~6 KB** (an 85%+ payload reduction).

2. **Server HTML Pre-Rendering Payload Control**:
   - `src/seoHelper.ts` pre-renders initial page HTML for Googlebot and populates `window.__INITIAL_DATA__`.
   - **Critical**: Never dump large HTML strings (`description_html`, `features_html`, etc.) for all 230+ apps into `window.__INITIAL_DATA__` on index pages. `seoHelper.ts` strips `description_html` for non-target app items on list pages, keeping the initial HTML payload under **~100 KB**.
   - If a user navigates directly to a deep app link (`/app/:slug`), `AppDetails.tsx` automatically detects missing details and fetches full item details smoothly in the background.

3. **No Speculation Rules Script**:
   - Do **NOT** insert `<script type="speculationrules">` into `index.html`. Synthetic testing tools (Pingdom, Lighthouse, Googlebot headless renderers) cancel background prefetch requests, triggering false `4xx / aborted` network error reports.

4. **Lazy Loading & Code Splitting**:
   - Use `lazyWithRetry()` for admin views and heavy page modules to keep the core user-facing JavaScript bundle lightweight.

---

## 5. Security & Link Protection Engine

- All app download links are encrypted inside the **Secure Link Vault**.
- Public clients request secure download links via `/api/v1/public/secure-link` using Turnstile anti-bot nonces to prevent scraper bots from hijacking download links.
- Admin routes require TOTP 2FA verification (`totp.ts`) and JWT bearer tokens (`adminAuthRoutes.ts`). Audit logs are written to Firestore for all administrative actions.

---

## 6. How to Extend & Maintain the Application

- **Adding a New App**: Manage via the Admin Dashboard or update `src/lib/staticData.json`.
- **Modifying Backend API Routes**: Add new express endpoints under `/src/server/routes/` and mount them in `server.ts`.
- **Verifying Builds**: Run `npm run build` and `npm run lint` before committing to ensure TypeScript compilation succeeds without errors.
