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
- **Components**: `src/components/AdminLogin.tsx`, `src/components/NewsTab.tsx`, `src/components/SecurityTab.tsx`, `src/components/FirebaseStatusPanel.tsx`, `src/components/ClearanceButton.tsx`.
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
