# Project Instructions: Yono Transparency Dual-Repo System

## Core Architecture
This repository acts as the **Source of Truth**. It uses a GitHub Actions workflow (`.github/workflows/split-sync.yml`) to automatically split and synchronize code to two different destination repositories:

1.  **Masterworld (Admin)**: A private repository containing the full application, including all admin dashboards, security tools, backend scripts, and server-side configurations.
2.  **Dex (Public)**: A public repository containing only the user-facing website. All sensitive admin files and backend scripts are **automatically removed** during the sync process.

## Critical Sync Rules
When adding new files or features, you MUST follow these rules to maintain security:

### Admin-Only Files (Masterworld ONLY)
The following files and directories must **NEVER** exist in the `Dex` (Public) repository. They are defined in the `ADMIN_ONLY_FILES` list within `split-sync.yml`:
- **Pages**: `src/pages/AdminDashboard.tsx`, `src/pages/AdminLogin.tsx`.
- **Components**: `src/components/AdminLogin.tsx`, `src/components/NewsTab.tsx`, `src/components/SecurityTab.tsx`, `src/components/FirebaseStatusPanel.tsx`, `src/components/ClearanceButton.tsx`.
- **Services/Lib**: `src/services/adminAuthService.ts`, `src/lib/githubSync.ts`, `src/lib/totp.ts`, `src/lib/secureVault.ts`, `src/lib/secureStorage.ts`.
- **Data Backups**: `src/lib/secure_links_backup.json`, `src/lib/public_backup.json`.
- **Backend/Config**: `api/`, `server.ts`, `firebase.json`, `firestore.rules`, `.firebaserc`, `vercel.json`.
- **Maintenance**: All root-level `.ts` and `.js` scripts (e.g., `fix-*.ts`, `test-*.ts`, `verify-*.js`) and the `scripts/` directory.

### Adding New Admin Features
If you create a new component or page that is for administrative use:
1.  Add the file to the project as usual.
2.  **IMMEDIATELY** update the `ADMIN_ONLY_FILES` list in `.github/workflows/split-sync.yml` to ensure it is stripped from the public `Dex` repo.

## Security & Routing
- The admin dashboard path is dynamic and should be handled with care in `src/App.tsx`.
- Use `lazyWithRetry` for admin components to keep the main bundle clean.
- Ensure any new API routes added to the Express server (`server.ts`) are properly protected.
