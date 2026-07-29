# Project Instructions: Yono Transparency Single-Target Sync System

## Core Architecture
This repository acts as the **Source of Truth**. It uses a GitHub Actions workflow (`.github/workflows/split-sync.yml`) to automatically split, clean, and synchronize code directly to the public website:

1.  **Dex (Public)**: A public repository containing only the user-facing website. All sensitive admin files and backend scripts are **automatically removed** during the sync process to guarantee security.

**Note on Admin (Masterworld)**: The admin repository (`masterworld`) is **INCLUDED** in the automated sync process. It is managed as a standalone "Admin Control" environment. All public-facing website pages and components are **automatically removed** during the sync process to keep the admin interface clean and focused.

## Critical Sync Rules
When adding new files or features, you MUST follow these rules to maintain security and repo isolation:

### Admin-Only Files (Stripped from Public Dex)
The following files and directories must **NEVER** exist in the `Dex` (Public) repository. They are defined in the `ADMIN_ONLY_FILES` list within `split-sync.yml`:
- **Pages**: `src/pages/AdminDashboard.tsx`, `src/pages/AdminLogin.tsx`.
- **Components**: `src/components/AdminLogin.tsx`, `src/components/NewsTab.tsx`, `src/components/SecurityTab.tsx`, `src/components/FirebaseStatusPanel.tsx`.
- **Services/Lib**: `src/services/adminAuthService.ts`, `src/lib/githubSync.ts`, `src/lib/totp.ts`, `src/lib/secureVault.ts`, `src/lib/secureStorage.ts`.
- **Data Backups**: `src/lib/secure_links_backup.json`, `src/lib/public_backup.json`.
- **Backend/Config**: `api/`, `server.ts`, `firebase.json`, `firestore.rules`, `.firebaserc`, `vercel.json`.
- **Maintenance**: All root-level `.ts` and `.js` scripts (e.g., `fix-*.ts`, `test-*.ts`, `verify-*.js`) and the `scripts/` directory.

### Public-Only Files (Stripped from Admin Masterworld)
The following files and directories are **EXCLUDED** from the `Masterworld` (Admin) repository to prevent bloat:
- **Pages**: All user-facing pages like `Home.tsx`, `AppDetails.tsx`, `Blogs.tsx`, etc.
- **Components**: Public UI elements like `Ticker.tsx`, `PublicChatbot.tsx`, `StarRatingFeedback.tsx`, etc.
- **Assets**: The entire `public/` directory (static assets for the main site).

### Adding New Features
If you create a new component or page:
1.  Add the file to the project as usual.
2.  **If Admin-Only**: Update `ADMIN_ONLY_FILES` in `split-sync.yml`.
3.  **If Public-Only**: Update `PUBLIC_ONLY_FILES` in `split-sync.yml`.

## Security & Routing
- The admin dashboard path is dynamic and should be handled with care in `src/App.tsx`.
- Use `lazyWithRetry` for admin components to keep the main bundle clean.
- Ensure any new API routes added to the Express server (`server.ts`) are properly protected.

## Modular Server Files & Route Architecture Guide

Below is a clear, simple list of all newly created server files and sub-routes, along with what each file does:

### 1. Configuration Files
- **`firebase-applet-config.json`**: Stores the default Firebase Project ID (`ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a`) and Firestore Database ID to prevent database configuration errors.

### 2. Backend Server Routes (`/src/server/routes/`)
- **`src/server/routes/adminAuthRoutes.ts`**:
  - **Work**: Handles admin login, 2FA security verification, session logout, password changes, and admin action logging. Keeps authentication logic isolated and secure.
- **`src/server/routes/adminVaultRoutes.ts`**:
  - **Work**: Manages secure vault operations including encrypting/decrypting app download links, database link repairs, link backups, and Firebase connection status checks.
- **`src/server/routes/githubSyncRoutes.ts`**:
  - **Work**: Manages the GitHub automated split-sync webhooks, synchronization triggers, and status checks between the source repo and the public website.
- **`src/server/routes/publicApiRoutes.ts`**:
  - **Work**: Serves public website features including secure download link validation, image proxying, backup data fallbacks, anti-bot challenge nonces, and report submissions.
- **`src/server/routes/seoRoutes.ts`**:
  - **Work**: Generates dynamic SEO files (`sitemap.xml`, `robots.txt`, RSS feeds, open-search) for apps, news, blogs, and videos to boost search engine indexing.

### 3. Modular Admin UI Components (`src/components/admin/`)
- **`src/components/admin/AdminSidebar.tsx`**:
  - **Work**: The primary vertical navigation sidebar for the admin dashboard, handling tab switching and branding.
- **`src/components/admin/AdminTabContent.tsx`**:
  - **Work**: The central layout router for the dashboard that renders specific tab modules (Apps, News, Settings, etc.) based on user navigation.
- **`src/components/admin/AdminQuickLinksTab.tsx`**:
  - **Work**: Encapsulates the Quick Links management interface inside the Admin Dashboard.
- **`src/components/admin/AdminWebsiteFaqsTab.tsx`**:
  - **Work**: Encapsulates the global Website FAQ management interface inside the Admin Dashboard.
- **`src/components/admin/AdminDevelopersTab.tsx`**:
  - **Work**: Encapsulates the Developer Profiles management interface inside the Admin Dashboard.
- **`src/components/admin/apps/AppInspector.tsx`**:
  - **Work**: Detailed read-only configuration viewer for applications, allowing admins to verify settings before editing.
- **`src/components/admin/apps/AppForm.tsx`**:
  - **Work**: The main application editor interface, utilizing modular form sections for scalable management.
- **`src/components/admin/apps/sections/`**:
  - **Work**: Directory containing modularized form sections: `GeneralSection.tsx`, `SEOSection.tsx`, `ContentSection.tsx`, and `AlertsSection.tsx`.
- **`src/components/admin/FaqEditor.tsx`**:
  - **Work**: Sub-component for editing individual application FAQs inside the Apps module.
- **`src/components/admin/ScreenshotsEditor.tsx`**:
  - **Work**: Sub-component for managing screenshot gallery links inside the Apps module.

### 4. Modular Public UI Components (`src/components/public/`)
- **`src/components/public/PublicHeader.tsx`**:
  - **Work**: Public website navigation header component extracted from `AppPublic.tsx`.
- **`src/components/public/PublicFooter.tsx`**:
  - **Work**: Public website footer component extracted from `AppPublic.tsx`.
- **`src/components/public/PublicBottomNav.tsx`**:
  - **Work**: Floating mobile navigation bar component extracted from `AppPublic.tsx`.
- **`src/components/public/PublicBackToTop.tsx`**:
  - **Work**: Smooth scroll-to-top floating button component extracted from `AppPublic.tsx`.
- **`src/components/public/AppDetailsSkeleton.tsx`**:
  - **Work**: Loading skeleton UI placeholder for the application details page.
- **`src/components/public/YouTubePlayer.tsx`**:
  - **Work**: Interactive YouTube video embed and preview player component for app media galleries.
- **`src/components/public/AppSafetyBoxes.tsx`**:
  - **Work**: Alert, warning, and idea notice callout banners for application details pages.
- **`src/components/public/AppSpecsBar.tsx`**:
  - **Work**: Key app metrics bar displaying rating, file size, category, and version details.
- **`src/components/public/ReviewScoreSummary.tsx`**:
  - **Work**: Overall rating breakdown and star distribution summary widget.
- **`src/components/public/ReviewItem.tsx`**:
  - **Work**: Individual user review card with voting, report actions, and expandable text.

### 5. Server Core Files
- **`server.ts`**:
  - **Work**: The main Express backend server entry point. Connects all sub-routers, handles rate limiting, security headers, and static file serving.
- **`src/server/firebase.ts`**:
  - **Work**: Initializes the server-side Firebase Admin SDK with automatic fallback configuration to prevent database server crashes.

### 6. Admin Business Logic Hooks (`src/hooks/`)
- **`src/hooks/useAdminAuth.ts`**:
  - **Work**: Manages admin session lifecycle, auto-logout on inactivity, and secure authentication state.
- **`src/hooks/useAdminApps.ts`**:
  - **Work**: Centralizes application catalog management, including Firebase fetching and secure link synchronization with the vault.
- **`src/hooks/useAdminSettings.ts`**:
  - **Work**: Shared state manager for global website settings, news, banners, and developer profiles with built-in CRUD handlers.
- **`src/hooks/useAppFilters.ts`**:
  - **Work**: Encapsulates complex search, filtering, and sorting logic for the large application catalog.
- **`src/hooks/useAppForm.ts`**:
  - **Work**: Manages the state and validation of the multifaceted application creation and edit forms.

