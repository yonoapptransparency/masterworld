# End-to-End Architecture Audit & Root-Cause Roadmap (Admin → Database → GitHub Sync → Public Website)

This document traces every workflow across the system — from **Admin Dashboard form input**, **saving & encryption**, **Firestore chunked persistence**, **local backup files**, and **GitHub Split-Sync**, all the way to **Build-Time Static Prerendering**, **Server-Side SEO Injection (`seoHelper.ts`)**, and **Client-Side React Hydration** — Verified via live CLI execution against the codebase.

---

## Part 1: Complete End-to-End Workflow Trace (Admin → Public Website)

### Stage 1: Admin Form Input & State Resolution
1. **App Editor Initialization (`src/hooks/useAppForm.ts` & `src/components/AppsTab.tsx`)**:
   - When an Admin opens an app to edit (`editingAppId`), `useAppForm.ts` (lines 72–145) populates `formFields` from `editApp`.
   - **Hidden Fallback Contamination Bug (`src/hooks/useAppForm.ts` lines 88–103)**:
     - If `editApp.description_html` has `<= 10` characters or `editApp.features_html` has `<= 5` characters, `useAppForm.ts` searches `mockApps` (`src/lib/staticData.ts`) by `id` or `slug` and **silently injects old static description/features** back into the Admin form state.
2. **Admin Save Handler (`src/pages/AdminDashboard.tsx` lines 181–333 — `handleSaveApp`)**:
   - Reads fields from `formFieldsOverride` / `FormData`.
   - Copies `seo_title` into both `seo_title` and `meta_title` (lines 276–277) and `seo_description` into both `seo_description` and `meta_description` (lines 278–279).
   - Encrypts `more_information_url` locally via `safeEncrypt(plaintextUrl)` and verifies via `POST /api/v1/admin/encrypt`, storing the ciphertext in `encrypted_link`.
   - Calls `saveAppSingle(appData)` in `src/hooks/useDataActions.ts`.

### Stage 2: How Data Reacts & Stores During Save (`src/hooks/useDataActions.ts` & `src/server/routes/adminVaultRoutes.ts`)
When `saveAppSingle(targetApp)` runs (`src/hooks/useDataActions.ts` lines 33–149), **two separate storage paths execute in sequence**:

1. **Path A — Local Server Disk Backup (`POST /api/v1/admin/app/save` in `src/server/routes/adminVaultRoutes.ts` lines 208–232)**:
   - Calls `getMergedData()` (`adminVaultRoutes.ts` lines 53–89), which reads `src/lib/public_backup.json` and `src/lib/staticData.json` from local disk.
   - Merges `appWithTime` into `current.apps` by matching `a.id === appWithTime.id || (appWithTime.slug && a.slug === appWithTime.slug)` (line 215).
   - Calls `writeMergedData(current)` (`adminVaultRoutes.ts` lines 96–170), which writes:
     - `src/lib/public_backup.json` (contains ALL apps, including `sync_to_public: false` and plaintext URLs),
     - `src/lib/staticData.json` (filtered to `sync_to_public !== false`, with `more_information_url: ""`),
     - `src/lib/staticData.ts`, and
     - `public/sitemap*.xml`.
   - **Critical Bug in Path A (Cold vs. New Data Mix-Up)**:
     - On serverless/container restarts, `src/lib/public_backup.json` on disk starts from the last git commit (cold data). If the Admin previously saved changes directly to Firestore (or across sessions), `getMergedData()` loads the **cold disk file**, updates only the single edited app, and overwrites `src/lib/staticData.json` and `src/lib/public_backup.json` with stale data for all other apps and news items.
     - Live CLI verification confirmed a **divergence between `src/lib/public_backup.json` and `src/lib/staticData.json` right now**: `public_backup.json` has 50 news items while `staticData.json` has 48, and **14 apps** (`spin-crush`, `joy-rummy`, `jaiho-91`, `ok-rummy`, `yono-arcade`, `bingo-101`, `abc-rummy`, `yono-vip`, `rummy-ludo`, `789-jackports`, `rumble-rummy`, `spin-winner`, `yono-slots`, `jaiho-rummy`) have mismatched timestamps/states between the two files.

2. **Path B — Firestore Chunked Storage (`src/hooks/useDataActions.ts` lines 91–132)**:
   - Writes the full `apps` array into Firestore collection `store_data` across chunk documents `apps_chunk_0`, `apps_chunk_1`, etc., plus `apps_meta`.
   - **Critical Bug #1 — Chunk Size Mismatch (`25` vs `100`)**:
     - `src/hooks/useDataActions.ts` (lines 102, 175, 347) writes chunks using **`chunkSize = 25`**.
     - `src/services/firestoreSyncService.ts` (line 4) writes chunks using **`CHUNK_SIZE = 100`**.
   - **Critical Bug #2 — Orphaned Firestore Chunks Never Deleted**:
     - When `saveAppSingle`, `deleteAppSingle`, or `saveApps` writes `numChunks` chunks (`for (let i = 0; i < numChunks; i++)`), it **never deletes higher-indexed chunks** (`apps_chunk_${numChunks}` to `apps_chunk_15`).
     - Meanwhile, `src/hooks/useDataSync.ts` (line 97) and `src/hooks/useGitHubSync.ts` (line 210) blindly read **all 16 chunks (`apps_chunk_0` through `apps_chunk_15`)** without stopping at `apps_meta.numChunks`. Any old or deleted app sitting in a higher chunk is resurrected and merged back into the active state.

### Stage 3: GitHub Split-Sync Pipeline (`src/hooks/useGitHubSync.ts`, `src/lib/githubSync.ts`, `.github/workflows/split-sync.yml`)
There are **two different mechanisms** that push to the public `Dex` repository:
1. **Admin UI "Trigger Full Static Build Sync" (`src/hooks/useGitHubSync.ts` → `src/lib/githubSync.ts`)**:
   - Pulls Firestore chunks (`apps_chunk_0..15`), merges with `liveBackup` (`src/lib/public_backup.json`), fetches `/api/v1/admin/community/export-stats` (`communityCatalogStats.json` + `communityStaticReviews.json`), and commits directly to GitHub via the Git Trees API.
   - **Critical Bug #1 — Stale Backup Merge Overwrites Empty/Cleared Fields (`src/hooks/useGitHubSync.ts` lines 333–366)**:
     - Builds two lookup maps from `liveBackup.apps`: `backupAppById` and `backupAppBySlug`, then merges `existing` with `sa` (`{ ...existing, ...sa }`). If an app's slug or ID ever changed or collided with an older entry in `public_backup.json`, cold properties (`og_image_url`, `screenshots`, `icon_url`, `description_html`) from `existing` bleed into the synced app.
   - **Critical Bug #2 — Hardcoded `candidateFiles` List Missing Public Modules (`src/server/routes/githubSyncRoutes.ts` lines 15–106)**:
     - The `/api/github-sync/public-core-files` endpoint only returns a hardcoded array of ~85 files. It is **missing** critical public files including `src/components/public/ReviewForm.tsx`, `src/components/public/ReviewItem.tsx`, `src/components/public/ReviewScoreSummary.tsx`, `src/hooks/useReviews.ts`, `src/lib/communityFirebase.ts`, `src/seo/reviewFallback.ts`, and `src/components/public/appDetails/appDetailsSchemas.ts`.
   - **Critical Bug #3 — `githubSync.ts` Actively Deletes `public/data/` (`src/lib/githubSync.ts` lines 961–975)**:
     - `commitTreeToGitHub` filters the Git tree for `t.path.startsWith('public/data/') || t.path.startsWith('data/')` and sends `sha: null` to delete every per-app data file on every sync, forcing the public site to rely on monolithic `staticData.json` and `communityStaticReviews.json`.

---

## Part 2: Audit of Meta Titles & Brand Suffix Behavior ("Does Our Brand Name Still Get Automatically Added?")

We traced every function that touches `<title>`, `seo_title`, and `meta_title` from Admin save to SSR and Client hydration, and tested them via live CLI execution.

### 1. What Happens When Admin Sets `seo_title` on an App or News Article
- `formatPageTitle(rawTitle, fallbackTitle)` in `src/lib/seoUtils.ts` (lines 5–23) runs regex:
  ```ts
  clean.replace(/\s*[-|–—•:]+\s*(?:RummyDex|Rummy\s*Dex|MasterWorld|Master\s*World|Dex)\s*$/i, '').trim()
  ```
- **Verified Live CLI Result**:
  - `formatPageTitle("Best Rummy App 2026", "RummyDex")` → `"Best Rummy App 2026"` (Brand name is **NOT** appended when `seo_title` is provided).
  - `formatPageTitle("Jaiho Rummy Download | RummyDex", "RummyDex")` → `"Jaiho Rummy Download"` (Trailing `| RummyDex` is **stripped**).
  - SSR `<title>` for `/app/jaiho-rummy` → `<title>Jaiho Rummy App Download: Play 13-Card Indian Rummy Online</title>` (Exact match to Admin's `seo_title`).

### 2. Where Brand Names & Hardcoded Suffixes ARE Still Being Auto-Injected or Overwritten
Even though custom `seo_title` on Apps and News no longer appends `| RummyDex`, **5 specific places in the codebase still auto-inject `RummyDex` or overwrite Admin titles**:

| # | Location | Exact Line(s) | What Happens |
| :--- | :--- | :--- | :--- |
| **1** | `src/seo/metaBuilder.ts` | Lines 177–184 | **Category Pages (`/category/:slug`)**: Hardcodes `metaTitle = "${catName} - Download & Reviews"` and auto-appends `"on RummyDex."` to `metaDesc` (`"Explore top Rummy, verified reviews, download ratings, and bonus updates on RummyDex."`). |
| **2** | `src/pages/Home.tsx` | Lines 296–305 | **Client Category & `/new-apps` Pages**: Hardcodes `${selectedCategory} Apps - Download & Reviews` and auto-appends `on ${siteTitleLabel}` (`on RummyDex`) to the meta description. |
| **3** | `src/components/Meta.tsx` | Lines 62–63 | **Client `<Meta />` Component**: Hardcodes `const siteName = 'RummyDex'; const formattedTitle = formatPageTitle(title, siteName);`. Whenever `title` is empty/undefined during a route transition or initial render, `formatPageTitle("", "RummyDex")` returns `"RummyDex"`, flashing `"RummyDex"` as the document title. |
| **4** | `src/hooks/useDataActions.ts` | Lines 483–494 | **Admin News Save (`saveNews`)**: Runs `const rawTitle = (n?.seo_title || n?.meta_title || n?.title || '').trim();` and writes `seo_title: exactTitle, meta_title: exactTitle`. If Admin leaves `seo_title` blank on a News item, saving permanently overwrites `seo_title` and `meta_title` in Firestore with the article headline `n.title`. Furthermore, if Admin intentionally writes `| RummyDex` at the end of a title, `formatPageTitle` strips it against Admin's will. |
| **5** | `index.html` | Lines 32–42 | **Base HTML Template**: Hardcodes `<title>RummyDex — The Ultimate Casual Gaming &amp; App Hub</title>` and hardcoded RummyDex descriptions in `index.html` instead of neutral placeholders populated solely from Admin's `settings` database. |

---

## Part 3: Deep Audit of the 4 Core Production Issues

### Issue 1: Why Pages Are Not Getting Indexed (`Discovered - currently not indexed` & `Crawled - currently not indexed`)

Live CLI execution of `injectSeoTags()` against `/app/jaiho-rummy` and `/news/spin-rummy-app` revealed **6 concrete technical blockers**:

1. **THREE `@type: "Product"` JSON-LD Schemas on Every `/app/:slug` Page**:
   - **Live CLI Verification**: `injectSeoTags()` outputs **2 `@type: "Product"` objects in the server HTML alone**:
     - **Schema #1 (`src/seo/schemaBuilder.ts` lines 88–150)**: Full `@type: "Product"` (`@id: "...#product"`) with `aggregateRating`, `offers`, and `review`.
     - **Schema #3 (`src/seo/schemaBuilder.ts` lines 163–175)**: `@type: "WebPage"` containing `"mainEntity": { "@type": "Product", "name": "JAIHO RUMMY", "url": "https://www.rummydex.com/app/jaiho-rummy" }` — a **second inline `Product` object** with NO `@id`, NO `offers`, NO `aggregateRating`, and NO `review`! (Instead of referencing `{"@id": "https://www.rummydex.com/app/jaiho-rummy#product"}`).
     - **Schema #6 (Client Hydration — `src/pages/AppDetails.tsx` line 258 + `src/components/Meta.tsx` lines 148–161)**: When React mounts, `AppDetails.tsx` builds `buildProductSchema()` (`src/components/public/appDetails/appDetailsSchemas.ts`) and passes it to `<Meta schemas={schemas} />`. Because `Meta.tsx` creates `<script id="json-ld-schema-3" type="application/ld+json">` **without `data-rh="true"`**, the server's `data-rh="true"` scripts are not replaced or deduplicated, leaving **3 `@type: "Product"` declarations** in the live DOM!
2. **SSR `<noscript>` Injection When `<div id="root">` Doesn't Match Regex (`src/seoHelper.ts` lines 199–204)**:
   - If the built `dist/index.html` has any attribute or whitespace variation inside `<div id="root">`, `rootRegex.test(finalHtml)` fails and `seoHelper.ts` wraps the entire pre-rendered page inside `<noscript>${preRenderedHtml}</noscript>`, leaving `<div id="root"></div>` empty for crawlers before JS execution.
3. **Every Single Page Embeds All 74 Apps (~44 KB of JSON) in `window.__INITIAL_DATA__` (`src/seo/initialDataOptimizer.ts` lines 18–95)**:
   - Live CLI verification showed `initAppsCount: 74` and `initDataSizeKB: 44` inside `/app/jaiho-rummy`.
   - Every `/app/:slug` HTML file embeds the metadata of all 74 apps in the catalog (`name`, `slug`, `category`, `icon_url`, `seo_title`, `seo_description`). Consequently, **~70% of the raw bytes of every `/app/:slug` HTML file are identical across all 74 app pages**, causing Googlebot to classify deep pages as duplicate boilerplate and defer crawling (`Discovered - currently not indexed`).
4. **Identical 16 "Similar Applications" Rendered on Almost Every App and News Page (`src/seo/renderers/appDetailsRenderer.ts` lines 257–274 & `src/seo/renderers/newsRenderer.ts` lines 168–184)**:
   - Live CLI verification showed that `/app/jaiho-rummy` and `/news/spin-rummy-app` render the **exact same 16 app cards** (`SPIN WINNER`, `JEET SPIN`, `JAIHO PLAY`, `SLOTS WINNER`, etc.) because `.filter(...).slice(0, 16)` always picks the first 16 items in `apps` order!
   - This means Apps #17 through #74 receive **zero internal links** from `Similar Applications` blocks across the entire website, starving them of internal PageRank.
5. **Global Cloudflare Turnstile Script in `index.html` (`index.html` line 26)**:
   - `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>` is injected in the `<head>` of every public page (`/`, `/app/*`, `/news/*`), triggering external challenge scripts during Googlebot WRS rendering.
6. **Build-Time Static Prerender (`scripts/prerender.ts`) Uses Stale Local `staticData.json`**:
   - When Vercel builds the site (`npm run build`), `scripts/prerender.ts` reads `src/lib/staticData.json`. If an app or news article was saved in Admin without a full GitHub sync updating `staticData.json`, no static `/dist/app/<slug>/index.html` or `/dist/news/<slug>/index.html` is generated.

---

### Issue 2: Complete Separation of `/moreinfo` (Secure Gateway) from the Public Website

Currently, `/moreinfo` (`GatewayPage.tsx`) is coupled to the public website in **6 places** (`moreinfoLinks: 1` on every `/app/:slug` page and `moreinfoLinks: 2` on every `/news/:slug` page in our live CLI test):

| # | File & Line(s) | Current Coupling | Required Fix for 100% Isolation |
| :--- | :--- | :--- | :--- |
| **1** | `index.html` (Line 26) | Loads Cloudflare Turnstile `api.js` globally on every page of the website. | Remove Turnstile `<script>` from `index.html`. Load it dynamically inside `useTurnstileVerification.ts` **only** when `/moreinfo` mounts. |
| **2** | `src/seo/renderers/appDetailsRenderer.ts` (Lines 100, 189–196) | Renders `<a href="/moreinfo/...">Download</a>` crawlable anchor tag in SSR HTML of every `/app/:slug` page (forcing Googlebot to discover `/moreinfo/*` URLs blocked by `robots.txt`). | Replace `<a href="/moreinfo/...">` with `<button type="button">` in SSR HTML. Never output `/moreinfo/` in any public page HTML. |
| **3** | `src/seo/renderers/newsRenderer.ts` (Lines 93, 128–137) | Renders **2** `<a href="/moreinfo/...">` crawlable links (`Download` and `Verify & Access Official Link`) in SSR HTML of every `/news/:slug` article. | Replace with `<button type="button">` or link strictly to `/app/<linkedApp.slug>`. Zero `/moreinfo` links on News pages. |
| **4** | `src/components/public/AppActionButtons.tsx` (Lines 15–35) & `NewsRelatedAppBox.tsx` (Lines 14–23) | Imports `scheduleTurnstileWarmup` from `useTurnstileVerification.ts` and runs it on `onMouseEnter` / `onTouchStart` on public App and News pages. | Remove `useTurnstileVerification` imports from `AppActionButtons.tsx` and `NewsRelatedAppBox.tsx`. Navigate to `/moreinfo/:slug` exclusively via click handler (`navigate('/moreinfo/' + slug)`). |
| **5** | `scripts/prerender.ts` (Lines 104–117) & `src/seo/preRenderEngine.ts` (Line 41) | Pre-renders `/dist/moreinfo/<slug>/index.html` for every app at build time and routes `/moreinfo` through the public SEO pre-render engine. | Stop pre-rendering `/moreinfo/*` in `scripts/prerender.ts` and remove `gatewayRenderer` from public SEO pre-rendering. |
| **6** | `src/pages/GatewayPage.tsx` (Line 3) | Calls `useData()` from `DataContextPublic`, loading the full 74-app public catalog just to display a single app on `/moreinfo/:slug`. | Make `GatewayPage.tsx` standalone: fetch only `/data/apps/<slug>.json` (or `/api/v1/public/app/<slug>`) on demand. |

---

### Issue 3: Why App Images & Content Get Mixed Up in Google Search Results

Our live CLI audit of all 74 apps in `staticData.json` and the SSR HTML of `/app/jaiho-rummy` and `/news/spin-rummy-app` uncovered the **exact root causes** of why one app's image gets paired with another app's title/metadata in Google Search:

1. **69 out of 74 Apps Have 0 Screenshots, and 54 out of 74 Apps Have No `og_image_url`**:
   - **Live CLI Verification**:
     - `totalApps: 74`, `withScreenshots: 5`, `withOgImage: 20`, `withDescImg: 0`.
   - On the **69 apps without screenshots** (such as `/app/jaiho-rummy`), our CLI inspection of all `<img>` tags in the rendered HTML showed:
     - `Img #1`: Header Logo (`40x40`, `w_120`).
     - `Img #2`: Target App Icon (`JAIHO RUMMY app icon`, `116x116`, `w_160`).
     - `Img #3` through `Img #18` (**16 out of the 18 images on the page!**): Icons of **16 OTHER apps** (`SPIN WINNER`, `JEET SPIN`, `JAIHO PLAY`, `SLOTS WINNER`, etc.) in the "Similar Applications" section (`w_160`, `86x86`)!
     - Plus, on client hydration (`src/AppPublic.tsx` → `NewAdditions.tsx`), React injects the **New Additions ticker** at the top of the viewport containing **another 10+ icons of OTHER apps**!
   - When Google's search snippet image selector evaluates an `/app/:slug` page where the target app only has a single small square icon (`w_160`) and **zero screenshots**, while 25+ other app icons (`SPIN WINNER`, `JEET SPIN`, etc.) surround the page content, Google frequently picks one of the neighboring app icons as the search thumbnail!
2. **Fix for Image Mix-Ups on `/app/:slug` & `/news/:slug`**:
   - Give the target app's primary hero icon a high-resolution image (`w_512`, `fetchpriority="high"`, `itemprop="image"`, `data-nosnippet="false"`) and wrap the entire **"Similar Applications"** section and **"New Additions"** ticker in `<aside data-nosnippet>` so Google Search is **explicitly forbidden** from associating images or text inside "Similar Applications" or "New Additions" with the main app's search snippet!
3. **Stale State Bleed During Client Navigation (`src/pages/AppDetails.tsx` lines 41–137 & `src/components/Meta.tsx`)**:
   - In `AppDetails.tsx`, `fetchedApp` is stored in a single `useState<any | null>(null)` without `key={slug}` on `<AppDetails />`.
   - Furthermore, in `AppDetails.tsx` lines 91–118, `fallbackApp` searches `staticMockApps`, `window.__INITIAL_DATA__.apps`, and `mockApps` and merges `description_html`, `features_html`, `screenshots`, and `faqs` if the current app's fields are short or empty.
   - And in `src/hooks/useGitHubSync.ts` lines 333–366, `backupAppById` and `backupAppBySlug` merge cold backup fields from `public_backup.json` into live Firestore apps during GitHub sync.

---

### Issue 4: Why the Comment/Review Section Is Broken & Why Every Page Loads All Apps and All Comments Together

#### A. Why the Public Comment/Review Section Is Currently Broken (3 Bugs)
1. **Bug #1 — `useReviews.ts` Ref Bug Prevents Reviews From Ever Fetching When Scrolled Into View (`src/hooks/useReviews.ts` lines 173–191)**:
   - In `src/components/UserReviews.tsx` line 18, `inView` starts as `false` until the user scrolls near the reviews section, and passes `inView` as `enabled` (`useReviews(appId, appSlug, 5, inView)`).
   - Inside `src/hooks/useReviews.ts` line 173:
     ```ts
     const prevTargetKeyRef = useRef<string>(cleanAppId || cleanAppSlug);
     ```
     `prevTargetKeyRef.current` is initialized to `cleanAppId || cleanAppSlug` on the very first render while `enabled` (`inView`) is still `false`!
   - Then inside the `useEffect` (lines 175–191):
     ```ts
     const targetKey = cleanAppId || cleanAppSlug;
     if (prevTargetKeyRef.current !== targetKey) {
       prevTargetKeyRef.current = targetKey;
       // ... fetches if enabled
     } else if (enabled && initialReviews.length === 0 && !loading) {
       fetchReviews(true, false);
     }
     ```
     Look at that `else if`: if `initialReviews.length > 0` (even 1 static review) OR if `loading` was initialized to `true` (`useState<boolean>(() => initialReviews.length === 0)` on line 61 sets `loading = true` from the start!), **`!loading` is `FALSE`!**
     - Because `loading` starts as `true` when `initialReviews.length === 0`, the condition `else if (enabled && initialReviews.length === 0 && !loading)` **evaluates to `false` (`true && true && false`)**!
     - As a result, when the user scrolls down and `enabled` (`inView`) becomes `true`, **`fetchReviews()` NEVER EXECUTES**, leaving the review section permanently stuck or empty!
2. **Bug #2 — `<ReviewForm />` Is Never Rendered Inside `src/components/UserReviews.tsx`**:
   - `src/components/public/ReviewForm.tsx` exists, and `useReviews.ts` exports `addReview`, `voteHelpful`, and `reportAbuse`, **but `src/components/UserReviews.tsx` never imports or renders `<ReviewForm />`**, making it impossible for users to submit reviews on any app page!
3. **Bug #3 — `githubSyncRoutes.ts` Does Not Sync Review Components to `Dex`**:
   - Even when review files are updated, `/api/github-sync/public-core-files` (`src/server/routes/githubSyncRoutes.ts`) omits `ReviewForm.tsx`, `ReviewItem.tsx`, `useReviews.ts`, and `communityFirebase.ts` from `candidateFiles`.

#### B. Why Visiting One App Page (e.g., `/app/jaiho-rummy`) Currently Loads ALL Apps & ALL Reviews
Right now, opening a single app page loads **4 monolithic payloads**:
1. `window.__INITIAL_DATA__.apps` in the HTML contains all **74 apps** (`src/seo/initialDataOptimizer.ts`).
2. `src/contexts/DataContextPublic.tsx` (lines 283–320) triggers a 3.5-second `setTimeout` on every route that calls `loadFullStaticDataset()`, downloading the entire `src/lib/staticData.ts` bundle (all 74 apps with full HTML descriptions, all 48 news articles, all FAQs) even when the user is only viewing `/app/jaiho-rummy`.
3. `src/lib/communityFirebase.ts` (line 13) statically imports `src/lib/communityStaticReviews.json`, bundling the reviews for **every app in the catalog** into a single file instead of per-app review files.
4. `src/lib/githubSync.ts` (lines 961–975) actively deletes `public/data/*` during GitHub sync instead of generating lightweight per-app JSON files.

---

## Part 4: Step-by-Step Fix Architecture (To Execute Module by Module)

### Phase 1: Fix Per-App Isolation & Per-App Review Files (Admin Sync → Public On-Demand Loading)
1. **Generate Per-App Data & Review Files During Build & GitHub Sync**:
   - Output `/public/data/apps/<slug>.json` (containing only that app's full details + its precomputed 16 similar app cards) and `/public/data/reviews/<slug>.json` (containing only that app's static reviews + rating stats).
   - Remove the `public/data/` deletion filter in `src/lib/githubSync.ts` (lines 961–975) and update `githubSyncRoutes.ts` `candidateFiles` so all public files sync cleanly.
2. **Trim `window.__INITIAL_DATA__` on `/app/:slug` and `/news/:slug` (`src/seo/initialDataOptimizer.ts`)**:
   - On `/app/:slug`, include **only** the target app (full details) + the 16 similar apps (minimal card fields: `id`, `name`, `slug`, `icon_url`, `rating`, `category`, `version`, `file_size`) — zero unrelated apps, zero news articles.
   - Stop `DataContextPublic.tsx` from calling `loadFullStaticDataset()` on `/app/:slug` or `/moreinfo/:slug`.
3. **Fix the Broken Review System (`src/hooks/useReviews.ts` & `src/components/UserReviews.tsx`)**:
   - Fix `loading` initialization and `useEffect` trigger in `src/hooks/useReviews.ts` so `fetchReviews()` reliably executes as soon as `enabled` (`inView`) becomes `true`, or load directly from `/data/reviews/<slug>.json` + live Firestore delta.
   - Mount `<ReviewForm />` and helpful/report actions cleanly inside `src/components/UserReviews.tsx`.

### Phase 2: 100% Isolate `/moreinfo` (Secure Gateway) from the Public Website
1. Remove global Turnstile `<script>` from `index.html`; load it dynamically inside `useTurnstileVerification.ts` only when `/moreinfo` is visited.
2. Replace all `<a href="/moreinfo/...">` tags in `appDetailsRenderer.ts` and `newsRenderer.ts` with `<button type="button">` (or `/app/<slug>` on News pages) so zero `/moreinfo` URLs ever appear in public HTML.
3. Remove `scheduleTurnstileWarmup` from `AppActionButtons.tsx` and `NewsRelatedAppBox.tsx`.
4. Remove `/moreinfo/*` static generation from `scripts/prerender.ts` and make `GatewayPage.tsx` fetch only the single target app's data on demand.

### Phase 3: Fix SEO Indexing, Duplicate `Product` Schema, Title Formatting & Image Mix-Ups
1. **Fix Duplicate `Product` Schemas**:
   - In `src/seo/schemaBuilder.ts` (line 172), change `WebPage.mainEntity` from an inline `{"@type": "Product", ...}` object to an `@id` reference: `{"@id": "${appUrl}#product"}`.
   - In `src/components/Meta.tsx` (lines 148–161), deduplicate/remove existing server JSON-LD scripts (`script[type="application/ld+json"][data-rh="true"]`) before injecting client schemas so only **1 `Product` schema** ever exists in the DOM.
2. **Prevent Image Mix-Ups in Google Search**:
   - Wrap the "Similar Applications" section (`appDetailsRenderer.ts`, `newsRenderer.ts`, `AppSimilarCarousel.tsx`) and "New Additions" ticker (`NewAdditions.tsx`) in `<aside data-nosnippet>` so Google never attributes another app's icon to the current app's search result.
   - Upgrade the primary app hero icon on `/app/:slug` to `w_512` with `itemprop="image"` and `fetchpriority="high"`.
   - Deterministic category rotation for "Similar Applications" (seeded by `app.slug`) so all 74 apps receive balanced internal links instead of the same 16 apps repeating on every page.
3. **Fix Admin Save & Firestore Chunk Sync**:
   - Unify Firestore chunk size (`chunkSize = 25` everywhere or `100` everywhere), respect `apps_meta.numChunks` when reading chunks in `useDataSync.ts` and `useGitHubSync.ts`, and delete stale higher-numbered chunks when `numChunks` shrinks.
   - Remove the automatic `mockApps` description fallback in `src/hooks/useAppForm.ts` and fix `adminVaultRoutes.ts` so cold disk backups never overwrite newer Firestore records.
   - Ensure `formatPageTitle` and `Meta.tsx` never inject `"RummyDex"` or overwrite blank `seo_title` fields in Firestore.
