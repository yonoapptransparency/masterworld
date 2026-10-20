# Master Execution Protocol: 360-Degree Architectural Remediation Plan (31 Verified Problems)

## Executive Summary
This document establishes the **Master Execution Protocol** for resolving all **31 verified system, hydration, security, styling, and split-sync flaws** across the RummyDex architecture. In accordance with strict engineering discipline, no code will be modified without complete pre-execution understanding, multi-hop dependency mapping, impact analysis, and verification gating.

---

> [!IMPORTANT] Core Invariants & Governance Directives
> 1. **Zero Copy Alteration (RULE 11)**: AI is strictly prohibited from altering or inventing website text, titles, descriptions, or marketing copy. All content flows dynamically from the database and Admin Dashboard.
> 2. **Preserve Dual-Repo Split-Sync**: All fixes must respect the isolation boundaries defined in `.github/workflows/split-sync.yml` (Dex = Public Site, Masterworld = Admin Site).
> 3. **Non-Regressive Execution**: Each phase is self-contained, verified via `compile_applet` and `lint_applet`, and tested for runtime and hydration continuity before moving to the next.

---

# PHASE 1: COMPLETE SYSTEM UNDERSTANDING & DEPENDENCY MAPPING

Before modifying any code, the entire system topology is traced from database storage to mobile DOM painting:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SUBSYSTEM 1: DATABASE & STORAGE ENGINE                                                 │
│ • Master Catalog: Cloud Firestore (ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad) │
│ • Collections: store_data (chunks 0/1, settings, news, videos), sec_git, admins_2fa   │
│ • Community Store: rummydexcommunity (reviews, catalog_stats, reports)                 │
│ • Local Backups: staticData.json, communityStaticReviews.json, communityCatalogStats   │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SUBSYSTEM 2: SERVER RUNTIME & SSR PIPELINE (server.ts & src/seoHelper.ts)              │
│ • Express server on port 3000 handles API, bot shielding, and HTML pre-rendering.      │
│ • Pre-render pipeline: Reads template -> Builds <head> meta tags (metaBuilder.ts) ->   │
│   Injects inlined Critical CSS -> Inlines window.__INITIAL_DATA__ JSON ->              │
│   Injects semantic HTML shell into <div id="root"> (renderers/*)                       │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SUBSYSTEM 3: PUBLIC CLIENT HYDRATION (src/main.tsx, AppPublic.tsx, DataContext)        │
│ • Entry point: src/main.tsx mounts App inside <div id="root">                          │
│ • Router: React Router DOM with PublicHeader, Main Routes, and PublicFooter            │
│ • State: DataContextPublic initializes apps, settings, news, and videos                │
│ • Critical boundary: React must attach event listeners to SSR HTML WITHOUT erasing it. │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# PHASE 2: 360° IMPACT ANALYSIS (ALL 31 VERIFIED PROBLEMS)

Every proposed modification is analyzed for affected files, dependent components, failure modes, and preservation strategies:

### Group 1: Hydration, Blank White Flash & Layout Shift (CLS)
- **Problem 1: `createRoot` vs `hydrateRoot` in `src/main.tsx`**
  - *Why needed*: Calling `createRoot` on a container with SSR HTML causes React 18/19 to wipe out all pre-rendered HTML DOM nodes, triggering the blank white screen before client render.
  - *Affected files*: `src/main.tsx`
  - *Dependent components*: Entire application root.
  - *What could break*: If SSR HTML attributes don't match React DOM, hydration warnings occur.
  - *Preservation strategy*: Use `hydrateRoot` if `rootEl.hasChildNodes()` or `window.__INITIAL_DATA__` is present, with fallback to `createRoot`. Suppress non-breaking hydration attribute mismatches gracefully.
  - *Validation*: Confirm in browser DOM that `<div id="root">` is not destroyed on frame 1.

- **Problem 2: Lazy-Loaded Public Routes with `<Suspense fallback={null}>`**
  - *Why needed*: When React mounts, dynamic imports for `NewsPage`, `GatewayPage`, `VideosPage`, etc. suspend, replacing the page with `null` (white screen).
  - *Affected files*: `src/AppPublic.tsx`
  - *Dependent components*: All public page components.
  - *What could break*: Bundle size could increase if all routes were statically imported.
  - *Preservation strategy*: Statically import critical primary routes (`Home`, `AppDetails`, `GatewayPage`). For secondary routes (`NewsPage`, `VideosPage`, `About`, `Contact`), provide a matching skeleton shell fallback instead of `fallback={null}` so the screen never turns white.
  - *Validation*: Verify that route transitions render an immediate matching layout without white screens.

- **Problem 3: Main CSS Link Delayed via `media="print"`**
  - *Why needed*: Browser renders unstyled HTML on frame 1, then snaps styles on when `onload` fires.
  - *Affected files*: `src/seoHelper.ts`
  - *Dependent components*: All visual components.
  - *What could break*: Render-blocking CSS on slow networks.
  - *Preservation strategy*: Verified patched: Remove `media="print"` hack. The stylesheet loads with standard `rel="stylesheet"`. Inlined critical CSS covers above-the-fold content immediately.
  - *Validation*: Confirm curl output contains standard `<link rel="stylesheet">`.

- **Problem 4: `.ssr-seo-content { display: none !important; }` in `src/index.css`**
  - *Why needed*: Explicitly hides server-rendered wrappers before React mounts.
  - *Affected files*: `src/index.css`
  - *Dependent components*: Any SSR wrapper component.
  - *What could break*: None.
  - *Preservation strategy*: Remove the rule completely. Content should remain visible from SSR paint through client hydration.
  - *Validation*: Grep `src/index.css` to confirm rule is deleted.

- **Problem 5: Dynamic Root Font Size Changing Across Breakpoints in `src/index.css`**
  - *Why needed*: Dynamic `html { font-size: 15px / 14.5px / 13.5px }` shifts all Tailwind `rem` units as soon as CSS loads, causing massive CLS.
  - *Affected files*: `src/index.css`
  - *Dependent components*: All mobile typography, cards, buttons, and layouts.
  - *What could break*: Layout scaling on very narrow screens if not handled cleanly with Tailwind utility classes.
  - *Preservation strategy*: Remove the `html { font-size: ... }` media queries. Allow standard 16px root font size. Use Tailwind's existing `text-xs`, `text-sm`, and `xxs:` responsive classes for narrow displays.
  - *Validation*: Verify on 360px viewport that text scales cleanly without sudden rem jumps.

- **Problem 6: Placeholder Heights (`contain-intrinsic-size`) Mismatch**
  - *Why needed*: `src/index.css` sets `0 88px` while `AppListItems.tsx` sets `auto 84px`. `#ratings-and-reviews-section` sets `1px 320px` (it is actually >600px tall), causing scroll jumps.
  - *Affected files*: `src/index.css`, `src/components/playstore/AppListItems.tsx`, `src/pages/AppDetails.tsx`
  - *Dependent components*: Catalog rows, Reviews section, Specifications section.
  - *What could break*: Scroll position jumps during fast scroll.
  - *Preservation strategy*: Harmonize `contain-intrinsic-size` across `index.css` and `AppListItems.tsx` to `auto 84px`. Adjust reviews placeholder to `auto 650px` to match actual rendered height.
  - *Validation*: Test smooth scrolling on mobile viewports; verify no scrollbar thumb jumping.

---

### Group 2: CSS, Styling & Admin HTML Rendering
- **Problem 7: Undefined CSS Variable `--text-secondary` in `src/index.css`**
  - *Why needed*: Used across `.premium-subheading` and disclaimer styles, but never defined in `:root` or `.dark`.
  - *Affected files*: `src/index.css`
  - *Preservation strategy*: Define `--text-secondary: #71717a;` (zinc-500) in `:root` and `--text-secondary: #a1a1aa;` (zinc-400) in `.dark`.
  - *Validation*: Verify disclaimer and subheadings render with crisp contrast.

- **Problem 8: Invalid / Non-Existent Tailwind Classes**
  - *Why needed*: Classes like `dark:hover:bg-zinc-750`, `text-rose-650`, `border-zinc-150`, `md:text-3.5xl`, `font-space` do not exist in Tailwind and produce zero styles.
  - *Affected files*: `src/components/UserReviews.tsx`, `src/components/public/ReviewItem.tsx`, `src/components/WebsiteTitleHero.tsx`, `src/components/GlobalErrorBoundary.tsx`, `src/pages/Contact.tsx`, `src/seo/renderers/homeRenderer.ts`, `src/seo/renderers/staticPageRenderer.ts`
  - *Preservation strategy*: Map fake classes to standard Tailwind tokens (`zinc-750` -> `zinc-700/800`, `rose-650` -> `rose-600`, `border-zinc-150` -> `border-zinc-200`, `text-3.5xl` -> `text-3xl sm:text-4xl`). Define custom fonts in `@theme` if needed or use standard font stacks.
  - *Validation*: Verify compilation with `compile_applet` and inspect elements in dev tools.

- **Problem 9: Admin HTML Allows Duplicate `<h1>` Tags on App Pages**
  - *Why needed*: When admin enters an `<h1>` in `description_html`, it creates multiple `<h1>` elements on the page, violating single-H1 SEO rules.
  - *Affected files*: `src/components/public/AppAboutSection.tsx`, `src/lib/safeHtmlPublic.ts`
  - *Preservation strategy*: In `safeHtmlPublic.ts` and `AppAboutSection.tsx`, automatically convert any `<h1>` inside user-generated HTML to `<h2>` with appropriate heading classes.
  - *Validation*: Verify that `/app/:slug` HTML contains strictly ONE `<h1>` (the App Name).

---

### Group 3: Security & Secret Sanitization
- **Problem 10: Hardcoded Cloudinary API Key & Secret in `vite.config.ts`**
  - *Why needed*: Fallback keys `883757976464181` and `wWlSk9OS905jDmR5YR6wlEK37sE` are committed in plain text.
  - *Affected files*: `vite.config.ts`, `server.ts`
  - *Preservation strategy*: Remove hardcoded plain-text fallback credentials. Read strictly from `process.env.CLOUDINARY_API_KEY` and `process.env.CLOUDINARY_API_SECRET`. If missing in development, return a clear error requiring the environment variable.
  - *Validation*: Grep codebase to verify 0 occurrences of the secret string.

- **Problem 11: Admin Password Injected into Client JS via `vite.config.ts`**
  - *Why needed*: `define: { 'process.env.ADMIN_PASSWORD': JSON.stringify(adminPass) }` injects admin password into public browser bundles.
  - *Affected files*: `vite.config.ts`
  - *Preservation strategy*: Remove `ADMIN_PASSWORD` from `envPrefix` and `define`. Authentication must strictly occur server-side via `/api/v1/admin/auth/login`.
  - *Validation*: Verify that built client bundles in `dist/assets/` contain zero occurrences of the admin password.

- **Problem 12: All 7 AES Vault Master Keys Exposed in Public Files**
  - *Why needed*: `KNOWN_VAULT_KEYS` is hardcoded in `src/lib/secureVault.ts` and `functions/api/[[catchall]].js`.
  - *Affected files*: `src/lib/secureVault.ts`, `functions/api/[[catchall]].js`, `src/lib/cryptoUtils.ts`
  - *Preservation strategy*: Vault decryption on the public site must strictly occur through server-side API proxy routes (`/api/v1/public/secure-link`) or via runtime environment variable `process.env.AES_SECRET`. Remove the hardcoded `KNOWN_VAULT_KEYS` array from client-side public bundles.
  - *Validation*: Grep repository to verify `KNOWN_VAULT_KEYS` array with plain-text secrets is removed.

- **Problem 13: Cloudflare Turnstile Bypassed via Test Secret in Production**
  - *Why needed*: Fallback to `1x0000000000000000000000000000000AA` lets any bot bypass Turnstile.
  - *Affected files*: `src/server/routes/securityRoutes.ts`, `functions/api/[[catchall]].js`
  - *Preservation strategy*: Strictly reject verification if the secret key is invalid or if the Cloudflare API returns failure. Allow test secret ONLY when `process.env.NODE_ENV !== 'production'`.
  - *Validation*: Test with dummy bot token; verify that `POST /api/v1/public/secure-link` returns 403 or challenge required.

- **Problem 14: Open Write Access & Admin Bypass in `firestore.rules`**
  - *Why needed*: `_rest_admin_bypass` allows anyone to write to database; public collections allow unvalidated writes.
  - *Affected files*: `firestore.rules`
  - *Preservation strategy*: Remove `isRestAdmin()` and `_rest_admin_bypass`. Apply `isValidReview`, `isValidFeedback`, `isValidTicket` to review and feedback collections. Require verified admin auth on `store_data` and `sec_git`.
  - *Validation*: Test Firebase rules syntax via `npm run lint`.

- **Problem 15: Live Upstash Redis Token & Firebase Keys in `.env.example`**
  - *Why needed*: Exposes live credentials in repository.
  - *Affected files*: `.env.example`
  - *Preservation strategy*: Replace live Redis URL, token, and Firebase API keys with standard dummy placeholder values (`your_redis_token_here`).
  - *Validation*: Verify `.env.example` contains only placeholders.

- **Problem 16: Unauthenticated Endpoints in Vite Dev Plugin**
  - *Why needed*: `/api/v1/admin/verify` returns authorized without checking token; upload endpoints allow unauthenticated POSTs.
  - *Affected files*: `vite.config.ts`
  - *Preservation strategy*: Check `req.headers.authorization` or session token before granting access in dev middleware.
  - *Validation*: Test unauthorized request; verify 401 response.

---

### Group 4: Build, Deployment & Split-Sync
- **Problem 17: Broken Vercel Serverless Configuration in Dex Repo**
  - *Why needed*: `build-api.js` skips `api/index.js` when `server.ts` is missing, yet `vercel.json` routes to it.
  - *Affected files*: `scripts/build-api.js`, `vercel.json`, `package.json`
  - *Preservation strategy*: In Dex repo (pure static SPA), configure `vercel.json` cleanly for static output with client-side SPA routing (`rewrites: [{ source: "/(.*)", destination: "/index.html" }]`). Set `"dev": "vite"` in Dex's `package.json`.
  - *Validation*: Verify build script runs cleanly with and without `server.ts`.

- **Problem 18: Split-Sync Directory Leakage**
  - *Why needed*: Admin vault files leak into Dex; public SEO files leak into Masterworld.
  - *Affected files*: `.github/workflows/split-sync.yml`
  - *Preservation strategy*: Add `src/lib/secureVault.ts`, `src/lib/cryptoUtils.ts`, `src/lib/aiStudioBrain.json`, and `.aistudio/` to `ADMIN_ONLY_FILES`. Add `public/sitemap*.xml` and `src/seo/renderers/*` to `PUBLIC_ONLY_FILES`.
  - *Validation*: Inspect split-sync file lists for clean isolation.

- **Problem 19: Fragile Comment Slicing in `scripts/build-api.js`**
  - *Why needed*: Stripping code between comments deletes 301 redirects and bot defenses on Vercel.
  - *Affected files*: `scripts/build-api.js`
  - *Preservation strategy*: Build `api/index.js` modularly by importing express routes instead of string-slicing `server.ts`.
  - *Validation*: Verify generated `api/index.js` contains route definitions.

- **Problem 20: Cloudflare Edge Function Returns 404 & Leaks Memory**
  - *Why needed*: Returns 404 for `/community/*`, `/reports`, `/news`. `edgeRateMap` and `burnedNonces` never evict.
  - *Affected files*: `functions/api/[[catchall]].js`
  - *Preservation strategy*: Add handlers for public catalog endpoints. Add periodic TTL cleanup (pruning entries older than 60s) to prevent unbounded memory growth.
  - *Validation*: Test endpoint routing and confirm memory maps stay bounded.

---

### Group 5: SEO, Caching, Routing & Runtime Bugs
- **Problem 21: `vercel.json` Forces `max-age=0, must-revalidate`**
  - *Why needed*: Prevents edge caching on Vercel and Cloudflare, causing high TTFB.
  - *Affected files*: `vercel.json`
  - *Preservation strategy*: Set standard cache headers: `public, max-age=300, s-maxage=3600, stale-while-revalidate=86400` for public pages, while keeping `/admin/*` and `/api/*` as `no-store`.
  - *Validation*: Inspect response headers for public routes.

- **Problem 22: `/faq` and `/faqs` Return 404 on Server**
  - *Why needed*: Missing from static route list in `src/seoHelper.ts` and `knownTopLevelRoutes` in `server.ts`.
  - *Affected files*: `src/seoHelper.ts`, `server.ts`, `scripts/prerender.ts`
  - *Preservation strategy*: Add `faq` and `faqs` to `knownTopLevelRoutes` in `server.ts` and to the static routes array in `seoHelper.ts`.
  - *Validation*: `curl -s http://localhost:3000/faq` returns 200 OK.

- **Problem 23: Prerendering `/moreinfo/:slug` Bypasses Bot Shield**
  - *Why needed*: Static files in `dist/moreinfo/` served before bot check.
  - *Affected files*: `server.ts`, `scripts/prerender.ts`
  - *Preservation strategy*: Do NOT prerender `/moreinfo/:slug` to static HTML files. Route `/moreinfo/:slug` dynamically through `server.ts` where the bot shield executes first.
  - *Validation*: Verify that bot user-agents receive 403 on `/moreinfo/`.

- **Problem 24: `Meta.tsx` Sets `og:site_name` to Full Page Title**
  - *Why needed*: Sets 60-character title instead of site name.
  - *Affected files*: `src/components/Meta.tsx`
  - *Preservation strategy*: Set `resolvedSiteName = siteTitle || 'RummyDex'`.
  - *Validation*: Verify meta tag in document head.

- **Problem 25: `UserReviews.tsx` Hardcodes `inView = true`**
  - *Why needed*: Fires queries before user scrolls to reviews.
  - *Affected files*: `src/components/UserReviews.tsx`
  - *Preservation strategy*: Use `IntersectionObserver` on `containerRef` to set `inView = true` only when user scrolls within 300px of reviews.
  - *Validation*: Verify network tab on initial load.

- **Problem 26: `ai-catalog.json` Schema & MIME Validation**
  - *Why needed*: Root properties fail schema; served as `application/json` instead of `application/ai-catalog+json`.
  - *Affected files*: `public/ai-catalog.json`, `server.ts`
  - *Preservation strategy*: Set `Content-Type: application/ai-catalog+json` in `server.ts`. Clean root properties in `ai-catalog.json` and add `representativeQueries`.
  - *Validation*: Test with curl and JSON schema validator.

- **Problem 27: Inconsistent `robots.txt`, Dead `/blogs` Link, Sitemap Captions**
  - *Why needed*: Missing disallows in public robots.txt; dead `/blogs` in `llms.txt`; streaming apps labeled "gameplay".
  - *Affected files*: `public/robots.txt`, `public/llms.txt`, `public/sitemap-apps.xml`
  - *Preservation strategy*: Synchronize `robots.txt` disallows across all templates. Remove `/blogs` from `llms.txt`. Use contextual captions ("app interface") in sitemap.
  - *Validation*: Check `robots.txt` and `llms.txt`.

- **Problem 28: Rickroll Video, Dead Button, Unmounted `SafetyStatus`, Duplicate Packages**
  - *Why needed*: Rick Astley embed looks unprofessional; dead button; `SafetyStatus` unmounted; `framer-motion` + `motion` duplicate weight.
  - *Affected files*: `src/components/playstore/PromotionSection.tsx`, `src/AppPublic.tsx`, `package.json`
  - *Preservation strategy*: Replace Rickroll video with a clean gameplay/app showcase embed or interactive preview. Link "Explore Selection" to `/categories`. Mount `/safety` route in `AppPublic.tsx`. Remove duplicate `motion` package.
  - *Validation*: Verify clean UI and build size reduction.

- **Problem 29: Monolithic `communityFirebase.ts` (90 KB, 2,423 lines)**
  - *Why needed*: Bundles admin CRUD into public clients.
  - *Affected files*: `src/lib/communityFirebase.ts`
  - *Preservation strategy*: Isolate public functions (`getCachedLiveAppStats`, `formatReviewDate`) from admin Firestore REST methods.
  - *Validation*: Verify smaller client chunk size.

- **Problem 30: React 19 Hydration Warning Escalation**
  - *Why needed*: React 19 throws strict warnings on minor attribute mismatches.
  - *Affected files*: `src/main.tsx`
  - *Preservation strategy*: Ensure SSR HTML attributes match React client component attributes exactly.
  - *Validation*: Zero console warnings on hydration.

- **Problem 31: Hardcoded Community Firebase API Key in `vite.config.ts`**
  - *Why needed*: Plain text key committed in line 67.
  - *Affected files*: `vite.config.ts`
  - *Preservation strategy*: Read from `env.VITE_COMMUNITY_FIREBASE_API_KEY` or fallback to empty string.
  - *Validation*: Grep to confirm 0 hardcoded keys.

---

# PHASE 3: EXECUTION STRATEGY (5 SURGICAL BATCHES)

To minimize risk and avoid regressions, execution proceeds in 5 strict sequential batches:

### BATCH 1: Hydration, Blank White Flash & Layout Stability (Problems 1, 2, 4, 5, 6, 25)
1. Update `src/main.tsx` to use `hydrateRoot` when `#root` contains server markup, preventing full-tree DOM destruction.
2. Ensure public routes in `src/AppPublic.tsx` do not clear to blank white screens on mount.
3. Remove `.ssr-seo-content { display: none !important; }` in `src/index.css`.
4. Fix `html` font-size in `src/index.css` to stable 16px to prevent `rem` recalculation jumps.
5. Harmonize `contain-intrinsic-size` across `src/index.css` and `AppListItems.tsx`.
6. Restore `IntersectionObserver` in `UserReviews.tsx`.

### BATCH 2: CSS, Styling & Content Rendering (Problems 7, 8, 9, 28)
1. Define `--text-secondary` in `src/index.css` for both light and dark modes.
2. Replace non-standard Tailwind classes across components with standard equivalents.
3. Sanitize admin HTML in `AppAboutSection.tsx` to convert `<h1>` tags into `<h2>`.
4. Replace placeholder Rickroll video in `PromotionSection.tsx` and wire up the action button.
5. Mount `/safety` route for `SafetyStatus.tsx` in `AppPublic.tsx`.

### BATCH 3: Security & Credential Exposure (Problems 10, 11, 12, 13, 14, 15, 16, 31)
1. Strip hardcoded Cloudinary keys/secrets from `vite.config.ts`.
2. Remove `ADMIN_PASSWORD` from `vite.config.ts` define block and envPrefix.
3. Remove `KNOWN_VAULT_KEYS` array from public-facing code; rely strictly on server runtime env vars.
4. Disable Turnstile `TEST_SECRET` fallback in production mode.
5. Harden `firestore.rules`: remove `_rest_admin_bypass` and require auth on sensitive collections.
6. Replace live Redis/Firebase credentials in `.env.example` with standard placeholders.
7. Add authentication checks to Vite dev server admin endpoints.

### BATCH 4: Build, Deployment & Split-Sync (Problems 17, 18, 19, 20)
1. Update `.github/workflows/split-sync.yml` with comprehensive exclusion lists for Dex and Masterworld.
2. Fix `scripts/build-api.js` to preserve route handlers without fragile comment slicing.
3. Fix `vercel.json` configurations for static Dex vs full-stack Masterworld.
4. Add missing public API route handlers and TTL map pruning to `functions/api/[[catchall]].js`.

### BATCH 5: SEO, Caching, Routing & Runtime Bugs (Problems 21, 22, 23, 24, 26, 27, 29, 30)
1. Fix `vercel.json` Cache-Control headers to permit edge caching on public routes.
2. Add `/faq` and `/faqs` to `seoHelper.ts` and `server.ts` known routes.
3. Prevent static pre-rendering of `/moreinfo/:slug` so bot protections always run.
4. Fix `Meta.tsx` to set `og:site_name` to `siteTitle` instead of the full page title.
5. Update `public/ai-catalog.json` schema and serve with `application/ai-catalog+json`.
6. Synchronize `robots.txt`, remove `/blogs` from `llms.txt`, and refine sitemap captions.
7. Deduplicate `framer-motion` and `motion` in `package.json`.

---

# PHASE 4: SELF-VERIFICATION PROTOCOL

After every batch, the following verification commands will be executed:
1. **Compilation**: `compile_applet` must succeed with 0 errors.
2. **Linting**: `lint_applet` (`tsc --noEmit`) must succeed with 0 errors.
3. **HTTP Integrity**:
   - `curl -s http://localhost:3000/` -> Verify instant SSR HTML, matching header buttons, and standard stylesheet link.
   - `curl -s http://localhost:3000/faq` -> Verify 200 OK (no 404).
   - `curl -s http://localhost:3000/app/rummy-77` -> Verify single 160px LCP preload and no double-h1 tags.
4. **Secret Scan**: Run grep to confirm zero plain-text secrets, test tokens, or passwords remain committed.

---

# PHASE 5: FINAL AUDIT CHECKLIST

- [ ] Zero white-page flashes during client hydration.
- [ ] CLS strictly below 0.05 on mobile viewports.
- [ ] No `media="print"` delays on screen stylesheets.
- [ ] No duplicate `<h1>` tags on app detail pages.
- [ ] No plain-text API secrets, vault keys, or admin passwords in client bundles.
- [ ] Cloudflare Turnstile strictly enforced in production without dummy secret fallback.
- [ ] Firestore security rules protect all collections from unauthorized public writes.
- [ ] Split-sync workflow isolates public Dex and admin Masterworld without file leakage.
- [ ] `/faq` and `/faqs` fully accessible to search engines and users.
- [ ] All requested instructions verified and validated.
