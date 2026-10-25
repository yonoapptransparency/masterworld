# RummyDex End-to-End Architecture, SEO Indexing, Gateway Isolation & Data Pipeline Audit

**Scope of Audit:** Complete code-level trace and empirical CLI verification of every workflow from **Admin Dashboard Input → Validation & Normalization → Local/Server API Persistence → Firestore Storage → GitHub Split-Sync → Static Prerender (`scripts/prerender.ts`) → Server SSR (`src/seoHelper.ts`) → Client Hydration (`src/components/Meta.tsx` & Public Pages)**.

---

## Executive Summary of Verified Root Causes

| # | System Area | Root Cause Verified in Code | Primary File & Line Locations | Real-World Impact |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Meta Title & Brand Suffix (`RummyDex`)** | 1. HTML `<title>` / `og:title` auto-appending is stripped via `formatPageTitle()`, **but** Google SERP still rewrites titles with `- RummyDex` because inner-page JSON-LD schemas (`NewsArticle.publisher`, `Organization`) and SSR `<header>` inject `RummyDex` brand signals.<br>2. `seoHelper.ts` and `Home.tsx` still inject hardcoded `"on RummyDex"` fallback meta descriptions.<br>3. `formatPageTitle()` regex includes bare `Dex`, silently stripping intentional titles ending in `- Dex` or `: RummyDex`. | `src/lib/seoUtils.ts:16`<br>`src/seoHelper.ts:390-453`<br>`src/pages/Home.tsx:298-302`<br>`src/seo/schemaBuilder.ts:340-347` | Unwanted brand suffix rewriting in search results; hardcoded fallback copy violating Admin-only content rules; silent stripping of intentional title endings. |
| **2** | **Structured Data (JSON-LD) Validation Failure** | `buildSeoSchemas()` emits a `WebPage` schema (`#webpage`) containing `"mainEntity": { "@type": "Product", "name": name, "url": appPageUrl }` **without** `"@id": "${appPageUrl}#product"`. This creates a **second, bare `Product` entity** on every `/app/:slug` page that lacks `offers`, `review`, and `aggregateRating`. Furthermore, `Meta.tsx:287` (`keepServerSchemas = true`) preserves this broken SSR schema in `<head>` after client hydration. | `src/seo/schemaBuilder.ts:199-214`<br>`src/components/Meta.tsx:281-303`<br>`src/components/public/appDetails/appDetailsSchemas.ts:34-130` | Every `/app/:slug` page fails Google Rich Results validation (`Either "offers", "review", or "aggregateRating" should be specified`), suppressing star ratings and deprioritizing indexing. |
| **3** | **Orphaned Pages & Pagination Canonical Trap** | 1. `/news` SSR (`newsRenderer.ts:23-27`) renders only 9 out of 48 articles (`ITEMS_PER_PAGE = 9`), and `seoHelper.ts:361` strips `?page=2`, canonicalizing all pages back to `/news`. **39 of 48 news articles (81.25%) have 0 hub links in SSR HTML.**<br>2. `/` SSR (`homeRenderer.ts:20-24`) renders only 24 apps (`pageSize = 24`), leaving **48 of 74 apps unlinked from the homepage**.<br>3. App detail "News" button links to `/news?q=${appName}` instead of `<a href="/news/${slug}">`. | `src/seo/renderers/newsRenderer.ts:23-27`<br>`src/seo/renderers/homeRenderer.ts:20-24`<br>`src/seoHelper.ts:336-361, 559`<br>`src/seo/renderers/appDetailsRenderer.ts:532` | Crawlers see 39 news articles and 48 apps as low-priority/orphan URLs discovered only via XML sitemaps, resulting in `"Crawled - currently not indexed"`. |
| **4** | **Admin-to-Public Save, Timestamp & Sitemap Pipeline** | 1. `AdminDashboard.tsx:211` calls `POST /api/v1/admin/encrypt`, which **does not exist** on the server (HTTP 404 on every single app save).<br>2. `saveAppSingle` (`useDataActions.ts:39-143`) never seals `src/lib/secureVault.ts` or updates RAM vault.<br>3. `useGitHubSync.ts:651-666` mutates `rating`, `review_count`, and `reviews` on all apps during sync; when `saveApps` runs `hasItemContentChanged()`, key/field diffs can stamp a new `updated_at` across multiple apps.<br>4. `adminVaultRoutes.ts:451` (`/api/v1/admin/sync-local`) ignores `catalogStats` and `staticReviews`. | `src/pages/AdminDashboard.tsx:211`<br>`src/hooks/useDataActions.ts:39-143, 291-318`<br>`src/hooks/useGitHubSync.ts:651-666, 733`<br>`src/server/routes/adminVaultRoutes.ts:449-466`<br>`src/seo/sync.ts:62-66` | Single-app saves fail server-side v2 encryption; bulk syncs can dirty unchanged apps; `mergeItemsByTimestamp` can overwrite newer Firestore edits if local fallback timestamps are ahead. |
| **5** | **`/moreinfo` (Gateway) Contamination of Public Pages** | 1. `/index.html:8-10` loads Cloudflare Turnstile (`challenges.cloudflare.com/turnstile/v0/api.js`) globally on **every** route.<br>2. `AppPublic.tsx:109` eagerly bundles `GatewayPage` into the main public JS chunk.<br>3. `appDetailsRenderer.ts:612` and `newsRenderer.ts:200, 224` emit crawlable `<a href="/moreinfo/...">` links in SSR HTML.<br>4. `NewsRelatedAppBox.tsx:23, 63` links to `/moreinfo/:slug` without setting `rd_nav_` session proof, causing `GatewayPage.tsx:107` to bounce real users.<br>5. `useGitHubSync.ts:886` overwrites `public/robots.txt` on every GitHub push **without** `Disallow: /moreinfo/`. | `index.html:8-10`<br>`src/AppPublic.tsx:109`<br>`src/seo/renderers/appDetailsRenderer.ts:612`<br>`src/seo/renderers/newsRenderer.ts:200, 224`<br>`src/components/public/newsDetails/NewsRelatedAppBox.tsx:23, 63`<br>`src/hooks/useGitHubSync.ts:886`<br>`scripts/prerender.ts:202` | Headless crawlers hit Turnstile challenge errors on `/app/:slug` and `/news/:slug`; `robots.txt` loses `/moreinfo` protection after GitHub sync; real users clicking Download on News pages get bounced. |
| **6** | **App Image & Content Mix-Up in Search Results** | 1. **69 of 74 apps (93.2%)** have `screenshots: []`.<br>2. `AppSimilarCarousel` renders **16 other apps' icons** (starting with the same pinned `is_new` apps) at section 2.4 — **above** Screenshots and About content, with no `data-nosnippet`.<br>3. 3 different image URLs (`w_1200,h_630`, `w_512`, `w_160`) are emitted for the same app icon; `w_512` (declared in JSON-LD `Product.image` and `meta[name="thumbnail"]`) **does not exist on any `<img>` in `<body>`**.<br>4. `useSEO.ts` and `Meta.tsx` fight over `<head>` image tags. | `src/seo/renderers/appDetailsRenderer.ts:95, 548, 638`<br>`src/pages/AppDetails.tsx:512-525`<br>`src/seoHelper.ts:569`<br>`src/seo/schemaBuilder.ts:75`<br>`src/hooks/useSEO.ts:74-86` | Google Image Extractor rejects the padded `1200x630` OG banner, cannot find the `w_512` schema URL in the DOM, and picks one of the 16 `w_160` neighbor app icons from `AppSimilarCarousel`. |
| **7** | **Broken Comment/Review System & 651 KB Monolithic Payload** | 1. `src/lib/communityStaticReviews.json` is **650,730 bytes (~651 KB)** and is imported into the client bundle (`src/lib/communityFirebase.ts:13`), loading all 74 apps' reviews on every single app page.<br>2. `src/seo/reviewFallback.ts:29-30` looks for `raw.reviewsBySlug` / `raw.reviewsByAppId`, which **do not exist** in `communityStaticReviews.json`, breaking SSR fallback reviews.<br>3. **5 apps** (`jaiho-rummy`, `jaiho-play`, `game-rummy`, `hi-rummy`, `spin-rummy`) are completely missing from `communityStaticReviews.json` and `communityCatalogStats.json`.<br>4. `UserReviews.tsx` never renders `ReviewForm.tsx`, and `submitLiveReview()` (`communityFirebase.ts:621`) only writes to `localStorage`. | `src/lib/communityStaticReviews.json`<br>`src/lib/communityFirebase.ts:13, 621-705`<br>`src/seo/reviewFallback.ts:22-56`<br>`src/components/UserReviews.tsx:1-270` | 651 KB of unneeded review JSON bloats client load; 5 newest apps have 0 reviews in static files; SSR fallback review reader returns `[]`; users cannot submit real reviews to Admin. |

---

## PART 1: Complete End-to-End Workflow Trace (Admin → Firestore → GitHub Sync → Public Website)

### 1.1 How an App Is Edited and Saved in Admin
1. **Form State Initialization (`src/hooks/useAppForm.ts:49-156`)**:
   - When the Admin selects an app to edit (`editingAppId`), `useAppForm` populates `formFields` from `editApp`.
   - At line 60:
     ```ts
     const rawSeoTitle = (editApp?.seo_title || editApp?.meta_title || '').trim();
     seo_title: rawSeoTitle ? formatPageTitle(rawSeoTitle, '') : '',
     ```
   - At lines 80–85: If `more_information_url` or `encrypted_link` starts with `'U2FsdGVkX1'`, it decrypts it in-memory via `safeDecrypt(raw)` so the Admin sees the plaintext URL in the form input.
2. **Form Submission (`src/pages/AdminDashboard.tsx:181-333` — `handleSaveApp`)**:
   - Extracts `formFieldsOverride` (from React state in `AppForm.tsx`) or `FormData`.
   - **Broken Server Encryption Call (`AdminDashboard.tsx:211`)**:
     ```ts
     const res = await adminFetch('/api/v1/admin/encrypt', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
       body: JSON.stringify({ url: plaintextUrl })
     });
     ```
     **Verified Bug:** There is no `/api/v1/admin/encrypt` route in `src/server/routes/adminVaultRoutes.ts` or anywhere else in `src/server/`. Every single time an Admin saves an app, this `fetch` returns **HTTP 404**, and `encryptedUrlVal` falls back to client-side `safeEncrypt(plaintextUrl)` (CryptoJS AES with `INTERNAL_VAULT_FALLBACK_KEY` instead of server `AES_KEY` v2 GCM).
   - Builds `appData` (`AdminDashboard.tsx:257-304`) with `seo_title` and `meta_title` set to the same value, and `updated_at: new Date().toISOString()`.
   - Calls `saveAppSingle(appData)` (`src/hooks/useDataActions.ts:39-143`).
3. **Persistence Layer (`src/hooks/useDataActions.ts:39-143` — `saveAppSingle`)**:
   - Normalizes `seo_title` and `meta_title` via `formatPageTitle(rawTitle, '')` and runs `structureHtmlFragment()` on `description_html`, `features_html`, and `custom_admin_box_html`.
   - **Target 1 — Local Express Server (`POST /api/v1/admin/app/save` in `src/server/routes/adminVaultRoutes.ts:208-228`)**:
     - Loads `public_backup.json` / `staticData.json` via `getMergedData()`.
     - Updates **only** the edited app (`current.apps[idx] = { ...current.apps[idx], ...appWithTime, updated_at: now }`) — leaving all other 73 apps' `updated_at` timestamps untouched.
     - Calls `writeMergedData(current)` (`adminVaultRoutes.ts:72-153`), which writes:
       - `src/lib/public_backup.json` (with encrypted links preserved)
       - `src/lib/staticData.json` (with download links stripped via `stripDownloadLinks: true`)
       - `src/lib/staticData.ts`
       - `public/sitemap*.xml` and `public/sitemap*.xml.gz`
     - **Verified Bug in `saveAppSingle`:** Unlike `saveApps()` (`useDataActions.ts:386-400`), `saveAppSingle()` **never calls `/api/v1/admin/encrypt-links` or `/api/v1/admin/seal-vault`**. Therefore, saving a single app in Admin updates `staticData.json` (which strips links) and `public_backup.json`, **but does NOT update `src/lib/secureVault.ts` (`ENCRYPTED_LINKS`) or the server's in-memory `ramVaultLinks` (`linkService.ts`)** until a full GitHub Sync is run!
   - **Target 2 — Cloud Firestore (`useDataActions.ts:91-126`)**:
     - Slices the updated `nextApps` array into chunks of 25 items (`chunkSize = 25`) and writes `store_data/apps_chunk_0`, `apps_chunk_1`, `apps_chunk_2`, and `store_data/apps_meta` to the Primary Catalog Firebase project (`ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a`).
     - **Note on Chunk Size Mismatch:** `useDataActions.ts:102` and `useGitHubSync.ts:212` use `chunkSize = 25`, whereas `src/services/firestoreSyncService.ts:4` defines `CHUNK_SIZE = 100`.

### 1.2 How News, Videos, and Global Settings Are Saved in Admin
1. **News (`useDataActions.ts:470-550` — `saveNews` & `adminVaultRoutes.ts:172-206`)**:
   - Compares each news item against `prev` via `hasItemContentChanged(prev, candidate)` (`stripCompareFields` removes `updated_at` and `_rest_admin_bypass`).
   - Only items whose content actually changed get `updated_at: now`; unchanged news items preserve `prev.updated_at`.
   - Writes to `POST /api/v1/admin/save-news` and Firestore `store_data/news`.
2. **Global Settings (`useDataActions.ts:208-280` — `saveSettingsSection` & `403-468` — `saveSettings`)**:
   - Runs `cleanSettingsMetaTitles(mergedSettings)` (`src/lib/seoUtils.ts:46-55`), which runs `formatPageTitle(copy[key], '')` on all 18 `*_meta_title` fields.
   - Writes to `POST /api/v1/admin/settings/save-section` and Firestore `store_data/settings` + `store_data/public_settings` (stripping `turnstile_secret_key`, `cloudinary_api_secret`, `gemini_api_key`).

### 1.3 How GitHub Split-Sync Pushes Admin Data to the Public Website (`src/hooks/useGitHubSync.ts`)
When the Admin triggers **"Push to GitHub"** (`pushAllToGitHub` in `src/hooks/useGitHubSync.ts:166-915`):
1. Pulls live backup from `/api/v1/admin/data` and directly queries Firestore chunks (`apps_chunk_0..15`, `settings`, `public_settings`, `news`, `videos`, `secure_links`).
2. Merges `stateApps` (Admin memory) with `liveBackup.apps`, preserving `sa.updated_at || existing.updated_at`.
3. Queries Community Reviews (`getConsolidatedReviewsForApp('all')` + `fetchAllFirestoreRestReviews()` from `rummydexcommunity`).
4. **Verified Timestamp Mutation Risk (`useGitHubSync.ts:651-666`)**:
   - `useGitHubSync.ts` overwrites `rating`, `review_count`, and `reviews` on every app in `finalApps` that has published community reviews:
     ```ts
     return {
       ...a,
       rating: realRating,
       review_count: realPublished,
       reviews: realPublished
     };
     ```
   - Because `a.reviews` or `a.review_count` in Admin state may be a string (`"18"`) or undefined while `realPublished` is a number (`18`), if `saveApps` or `adminVaultRoutes.ts` compares the raw objects via `JSON.stringify()`, it treats those apps as modified!
5. **Verified Dead/Ignored Sync Endpoints (`useGitHubSync.ts:468, 733`)**:
   - Line 468 calls `GET /api/v1/admin/backup-links-get`, which is hardcoded in `adminVaultRoutes.ts:464` to return `{ items: [] }`.
   - Line 733 calls `POST /api/v1/admin/sync-local` with `{ apps, settings, news, videos, catalogStats, staticReviews }`, but `adminVaultRoutes.ts:451` only destructures `{ apps, settings, news, videos }` and **discards `catalogStats` and `staticReviews`** without writing them to disk!
6. **Verified `robots.txt` Regression (`useGitHubSync.ts:886`)**:
   - At line 886, `useGitHubSync.ts` constructs a hardcoded `robotsContent` string and commits it to `public/robots.txt` in the public `Dex` repository.
   - That hardcoded string **omits `Disallow: /moreinfo/` and `Disallow: /moreinfo/*`**, overwriting the local `public/robots.txt` on every deployment!

---

## PART 2: Deep Audit of the Meta Title & Brand Name (`RummyDex`) Workflow

### 2.1 Answering the Core Question: Is the Brand Name Still Auto-Added After Meta Titles?
We tested all 74 apps, 48 news articles, and 23 route types using `injectSeoTags()` via CLI. Here is the exact, verified state across every layer:

1. **Layer 1 — Admin Save & Storage (`useAppForm.ts`, `useDataActions.ts`, `githubSync.ts`, `seo/sync.ts`)**:
   - **Fixed in storage:** All save and sync functions pass `seo_title` and `meta_title` through `formatPageTitle(rawTitle, '')` (`src/lib/seoUtils.ts:5-22`).
   - Across all 74 apps and 48 news articles currently in `src/lib/staticData.json`, **0 apps and 0 news items** have `| RummyDex` or `- RummyDex` stored in `seo_title` or `meta_title`.
2. **Layer 2 — Server SSR `<title>` & `<meta property="og:title">` (`src/seoHelper.ts` & `src/seo/metaBuilder.ts`)**:
   - **Fixed in `<title>` & `og:title` tags:** `src/seoHelper.ts:524` calls `title = formatPageTitle(title, '');` and `src/seo/metaBuilder.ts:108, 114` only outputs `<meta name="application-name" content="RummyDex">` and `<meta property="og:site_name" content="RummyDex">` when `isHomePage === true` (`cleanPath === '/'`).
   - Verified CLI output for `/app/jaiho-rummy`:
     - `<title>`: `Jaiho Rummy App Download: Play 13-Card Indian Rummy Online`
     - `og:title`: `Jaiho Rummy App Download: Play 13-Card Indian Rummy Online`
     - `og:site_name`: *omitted*
     - `application-name`: *omitted*
3. **Layer 3 — Why Google Search Results Can Still Append `- RummyDex` or Mutate Titles (3 Active Code Bugs)**:
   - **Bug 2A — Inner-Page JSON-LD `publisher` & `Organization` Brand Signals (`src/seo/schemaBuilder.ts` & `src/pages/NewsDetailPage.tsx`)**:
     - On `/news/:slug`, `src/seo/schemaBuilder.ts:340-347` and `src/pages/NewsDetailPage.tsx:378-386` inject:
       ```json
       "publisher": {
         "@type": "Organization",
         "name": "RummyDex",
         "url": "https://www.rummydex.com"
       }
       ```
     - On `/about` (`schemaBuilder.ts:446-481`), an `Organization` schema with `"name": "RummyDex"` is injected.
     - And in `src/seo/renderers/common.ts:43-50, 98-101`, the SSR `<header>` and `<footer>` on every page prominently render `alt="RummyDex Official Logo"` and `<span>RummyDex</span>` as the first text node in `<body>`. When Google's Title Link generator sees `publisher.name = "RummyDex"` in `NewsArticle` JSON-LD alongside a short `<title>`, Google's SERP display engine appends `- RummyDex` in search results even when `<title>` does not contain it.
   - **Bug 2B — Hardcoded `"on RummyDex"` in Fallback Meta Descriptions (`src/seoHelper.ts:390-453` & `src/pages/Home.tsx:298-302`)**:
     - Whenever a static/hub page's custom meta description is left blank in Admin Settings (currently `news_meta_description`, `videos_meta_description`, `developers_meta_description`, `disclaimer_meta_description`, `ethics_meta_description`, `notice_meta_description` are `""` in `staticData.json`), `src/seoHelper.ts` and `src/pages/Home.tsx` inject hardcoded fallback strings containing `RummyDex`:
       - `src/seoHelper.ts:390` & `src/pages/Home.tsx:298` (`/new-apps`): `"Explore the newest released Rummy, Teen Patti, and card game apps with verified ratings on RummyDex."`
       - `src/seoHelper.ts:395` & `src/pages/Home.tsx:300` (`/categories`): `"Browse all gaming and entertainment application categories on RummyDex."`
       - `src/seoHelper.ts:406` & `src/pages/Home.tsx:302` (`/category/:slug`): `"Explore top ${catName}, verified reviews, download ratings, and bonus updates on RummyDex."`
       - `src/seoHelper.ts:413` (`/disclaimer`): `"Read the official disclaimer regarding the content and apps on RummyDex."`
       - `src/seoHelper.ts:418` (`/ethics`): `"Our commitment to ethics, safety, and transparent reviews at RummyDex."`
       - `src/seoHelper.ts:446` (`/developers`): `"Browse profiles of top app developers featured on RummyDex."`
       - `src/seoHelper.ts:450` (`/faq`): `"Everything you need to know about RummyDex, app verification, and downloads."`
       - `src/seoHelper.ts:453` (`/safety`): `"Live verification, integrity hash checks, and safety ratings for applications on RummyDex."`
   - **Bug 2C — Over-Aggressive Regex in `formatPageTitle()` (`src/lib/seoUtils.ts:16`)**:
     - Look at line 16 of `src/lib/seoUtils.ts`:
       ```ts
       clean = clean.replace(/\s*[-|–—•:]+\s*(?:RummyDex|Rummydex|Remidex|Rummy\s*Dex|Ramy\s*Tech|Rummy\s*Tech|MasterWorld|Dex)\s*$/i, '').trim();
       ```
     - Because `:` and `Dex` are included in that regex, if the Admin intentionally writes a title ending in `: RummyDex` or `- RummyDex` (for instance on a legal page or homepage), `formatPageTitle()` **forcibly deletes what the Admin typed**! Conversely, in `staticData.json`, `contact_meta_title` is `"Contact Page : your ultimate app directory RummyDex"` (which wasn't stripped only because words appeared between `:` and `RummyDex`).
     - **Fix:** `formatPageTitle()` should never alter or strip characters from an explicit Admin-provided `seo_title` / `*_meta_title`; it should return the Admin's exact string verbatim, and only avoid *appending* a suffix in code.

---

## PART 3: Why Pages Are Not Getting Indexed (App Details & News Pages)

### 3.1 Critical Bug #1: Duplicate Invalid `Product` Entity in JSON-LD on Every `/app/:slug` Page
When `injectSeoTags()` runs on any `/app/:slug` route (e.g., `/app/jaiho-rummy`, `/app/yono-rummy`), `src/seo/schemaBuilder.ts` outputs **five** `<script type="application/ld+json">` blocks:
1. `Product` (`@id: "https://www.rummydex.com/app/jaiho-rummy#product"`) — lines 134–166 (has `offers`, `aggregateRating`, `review`).
2. `SoftwareApplication` (`@id: "https://www.rummydex.com/app/jaiho-rummy#software"`) — lines 173–194 (has `offers`, `aggregateRating`, `review`).
3. `WebPage` (`@id: "https://www.rummydex.com/app/jaiho-rummy#webpage"`) — **lines 199–214**:
   ```ts
   const webPageSchema: any = {
     "@context": "https://schema.org",
     "@type": "WebPage",
     "@id": `${appPageUrl}#webpage`,
     "url": appPageUrl,
     "name": exactTitle,
     "description": desc,
     "inLanguage": "en-IN",
     "mainEntity": {
       "@type": "Product",
       "name": name,
       "url": appPageUrl
     }
   };
   ```
4. `BreadcrumbList` — lines 250–254.
5. `FAQPage` — lines 274–281.

**Why This Breaks Indexing & Rich Results:**
- In Block #3 (`WebPage`), `mainEntity` defines `{ "@type": "Product", "name": name, "url": appPageUrl }` **without `"@id": "${appPageUrl}#product"`**.
- Because JSON-LD node merging requires an exact `@id` match, Google's Structured Data parser treats `WebPage.mainEntity` as a **second, standalone `Product` entity** on the page that has **no `offers`, no `review`, and no `aggregateRating`**.
- Google Search Console flags the page with a critical Product structured data error: **`Either "offers", "review", or "aggregateRating" should be specified`**.
- **Client Hydration Keeps the Broken Schema (`src/components/Meta.tsx:281-290`)**:
  When React mounts in the browser, `Meta.tsx` checks:
  ```ts
  if (existingServerSchemas.length > 0 && !hasDynamicSchemas) {
    const combinedServerJson = Array.from(existingServerSchemas).map(s => s.textContent || '').join(' ');
    if (combinedServerJson.includes(canonicalUrl)) {
      keepServerSchemas = true;
    }
  }
  ```
  Because `keepServerSchemas` is `true` on initial page load, `Meta.tsx` **leaves the broken server `WebPage` schema in `<head>`**!
- **Duplicate `review` Arrays Across `Product` and `SoftwareApplication` (`src/seo/schemaBuilder.ts:142 & 187`)**:
  Both `#product` and `#software` attach the exact same `validReviews` array (`schema["review"] = validReviews`) and the exact same `aggregateRating`.
- **Fix:**
  1. In `src/seo/schemaBuilder.ts:207-211`, change `WebPage.mainEntity` to reference the existing node by `@id` only:
     ```ts
     "mainEntity": { "@id": `${appPageUrl}#product` }
     ```
  2. Attach the full `review` array only once on `#product` (or `#software`) and link `#software` via `"@id"`.
  3. Synchronize `src/components/public/appDetails/appDetailsSchemas.ts` with `src/seo/schemaBuilder.ts` so SSR and SPA navigation schemas are 100% identical.

### 3.2 Critical Bug #2: 81.25% of News Articles (39 of 48) and 64.8% of Homepage Apps (48 of 74) Are Unlinked in SSR HTML
We ran a link-graph extraction across all pre-rendered hub pages (`/`, `/new-apps`, `/categories`, `/category/*`, `/news`):
- **News Hub (`/news`) — `src/seo/renderers/newsRenderer.ts:23-27`**:
  ```ts
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(sortedNews.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.max(1, Math.min(currentPage, totalPages));
  const paginatedNews = sortedNews.slice((validPage - 1) * ITEMS_PER_PAGE, validPage * ITEMS_PER_PAGE);
  ```
  - Only the first **9** news articles are rendered as `<a href="/news/...">` links on `/news`.
  - Worse: When Googlebot follows `<a href="/news?page=2">`, `src/seoHelper.ts:361` strips the query string (`const cleanPath = cleanRaw.split('?')[0].replace(/\/$/, '') || '/';`) and at line 559 emits:
    `<link rel="canonical" href="https://www.rummydex.com/news">`
    while `src/pages/NewsPage.tsx:166` on the client emits:
    `<link rel="canonical" href="https://www.rummydex.com/news?page=2">`!
  - Furthermore, on static Vercel hosting (`vercel.json`), `/news?page=2` serves the static `/news/index.html` file — which contains **Page 1's 9 articles**!
  - Result: **39 out of 48 news articles have ZERO `<a href>` links anywhere in the static HTML of `/news`!**
- **Homepage (`/`) — `src/seo/renderers/homeRenderer.ts:20-24`**:
  - `renderHome` slices `pageSize = 24` (`sorted.slice(0, 24)`). Combined with 2 additional apps in `New Additions`, only **26 out of 74 apps** have `<a href="/app/...">` links in the homepage's SSR HTML (`dist/index.html`). The other **48 apps** are invisible on the homepage to crawlers that don't execute infinite scroll!
- **Broken Cross-Linking from App Pages to News Articles (`src/seo/renderers/appDetailsRenderer.ts:532` & `src/components/public/appDetails/AppDetailsNavigation.tsx:52`)**:
  - On `/app/:slug`, even when an app has dedicated news articles (matched via `related_app_id` or app name in `AppDetails.tsx:453-467`), the page does **not** render `<a href="/news/${article.slug}">` links. Instead, it links a single button to `/news?q=${encodeURIComponent(name)}`, which canonicalizes back to `/news`!
- **Fix:**
  1. In `src/seo/renderers/newsRenderer.ts`, render crawlable `<a href="/news/${slug}">` links for all public news articles (either by rendering the full archive list in SSR HTML while keeping client pagination for visual UX, or generating static `/news/page/:n` routes with self-referencing canonicals).
  2. In `src/seo/renderers/homeRenderer.ts`, include crawlable `<a href="/app/${slug}">` links for all 74 public apps in the SSR catalog directory so every app is 1 click from `/`.
  3. In `appDetailsRenderer.ts` and `AppDetails.tsx`, render a **"Related News & Updates"** section with direct `<a href="/news/${article.slug}">` links whenever matching news articles exist for that app.

---

## PART 4: Complete Isolation of `/moreinfo` (Security Gateway) from the Public Website

### 4.1 Every Location Where `/moreinfo` and Turnstile Leak Into Public Pages (`/`, `/app/:slug`, `/news/:slug`)
1. **Global Cloudflare Turnstile Script in `/index.html:8-10`**:
   ```html
   <link rel="preconnect" href="https://challenges.cloudflare.com" crossorigin />
   <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
   <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
   ```
   - Because this script tag is hardcoded in `/index.html` and copied by `scripts/prerender.ts` into every static HTML file (`dist/index.html`, `dist/app/*/index.html`, `dist/news/*/index.html`), **Googlebot smartphones and headless crawlers execute `challenges.cloudflare.com/turnstile/v0/api.js` on every single public page** (`/`, `/app/:slug`, `/news/:slug`).
   - When Cloudflare's script probes the headless crawler environment and fails or redirects internal sub-requests, Google Search Console records a **`Page fetch: Failed: Redirect error`** under `JavaScript -> Script` on public `/app/:slug` and `/news/:slug` pages!
2. **Eager Bundling of `GatewayPage` in `src/AppPublic.tsx:109`**:
   - Look at `src/AppPublic.tsx:109`:
     ```ts
     import GatewayPage from './pages/GatewayPage';
     ```
   - Every other secondary route in `AppPublic.tsx` (`NewsPage`, `NewsDetailPage`, `VideosPage`, `Developers`, `About`, `Contact`, etc.) is lazy-loaded via `lazyWithRetry()`, **except `GatewayPage`**, which is eagerly compiled into the main public entrypoint bundle!
3. **Crawlable `<a href="/moreinfo/:slug">` Anchor Tags in SSR HTML (`appDetailsRenderer.ts` & `newsRenderer.ts`)**:
   - `src/seo/renderers/appDetailsRenderer.ts:612`:
     ```html
     <a href="/moreinfo/${encodeURIComponent(cleanSlug)}" rel="nofollow noopener">Download</a>
     ```
   - `src/seo/renderers/newsRenderer.ts:200, 224`:
     ```html
     <a href="/moreinfo/${encodeURIComponent(downloadTarget)}">Download</a>
     ```
   - Even with `rel="nofollow"`, rendering `<a href="/moreinfo/...">` in pre-rendered SSR HTML exposes `/moreinfo` URLs to crawlers on every app and news page.
4. **Missing Navigation Proof on News Article Download Button (`src/components/public/newsDetails/NewsRelatedAppBox.tsx:23, 63`)**:
   - On `/app/:slug`, `AppActionButtons.tsx:22-37` uses a `<button onClick={...}>` that writes `window.__rdNav = { slug, ts: Date.now() }` and `sessionStorage.setItem('rd_nav_' + slug, String(Date.now()))` before calling `navigate('/moreinfo/' + slug)`.
   - On `/news/:slug`, `NewsRelatedAppBox.tsx:23, 63` uses a raw `<Link to={'/moreinfo/' + appSlug}>` **without setting `window.__rdNav` or `sessionStorage['rd_nav_' + slug]`**!
   - When a real user reads a News article and clicks **"Download"**, `GatewayPage.tsx:96-114` checks `hasValidNavProof`:
     ```ts
     const navTs = Number(sessionStorage.getItem(`rd_nav_${cleanSlugKey}`) || '0');
     const memNav = (window as any).__rdNav;
     const hasValidMemProof = Boolean(memNav && memNav.slug === cleanSlugKey && now - memNav.ts < 60_000);
     const hasValidStorageProof = Boolean(navTs > 0 && now - navTs < 60_000);
     const hasValidNavProof = hasValidMemProof || hasValidStorageProof;
     ```
     Because neither proof was set by `NewsRelatedAppBox.tsx`, `hasValidNavProof` is **`false`**, and `GatewayPage.tsx:108` **immediately bounces the real user away from `/moreinfo/:slug` back to `/app/:slug`**!
5. **Static Prerendering of `/moreinfo/:slug` (`scripts/prerender.ts:202`)**:
   - `scripts/prerender.ts:202` loops over all 74 apps and generates `dist/moreinfo/<slug>/index.html` and `dist/moreinfo/<slug>.html` static files on the CDN.
6. **`robots.txt` Missing `/moreinfo/` After GitHub Sync (`src/hooks/useGitHubSync.ts:886`)**:
   - `useGitHubSync.ts:886` overwrites `public/robots.txt` without `Disallow: /moreinfo/` or `Disallow: /moreinfo/*`.

### 4.2 Architectural Blueprint to 100% Isolate `/moreinfo`
1. **Remove Turnstile from `/index.html`**: Delete lines 8–10 from `/index.html`. Load `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` dynamically **only** inside `useTurnstileVerification.ts` when `GatewayPage` (or `ReportAppModal` / `ReviewForm`) is actively mounted in a real browser.
2. **Lazy-Load `GatewayPage` in `src/AppPublic.tsx`**: Change `import GatewayPage from './pages/GatewayPage'` to `const GatewayPage = lazyWithRetry(() => import('./pages/GatewayPage'));` so zero gateway/security code exists in the public bundle loaded by `/`, `/app/:slug`, or `/news/:slug`.
3. **Zero `<a href="/moreinfo/...">` Links in SSR HTML or React DOM**:
   - In `src/seo/renderers/appDetailsRenderer.ts:612` and `src/seo/renderers/newsRenderer.ts:200, 224`, render `<button type="button">Download</button>` instead of `<a href="/moreinfo/...">`.
   - In `src/components/public/newsDetails/NewsRelatedAppBox.tsx`, replace `<Link to="/moreinfo/...">` with a `<button type="button" onClick={handleDownloadClick}>` that sets `window.__rdNav` and `sessionStorage.setItem('rd_nav_' + slug, String(Date.now()))` before calling `navigate('/moreinfo/' + slug)`.
4. **Stop Prerendering `/moreinfo` in `scripts/prerender.ts`**: Remove `await generateRoute('/moreinfo/' + cleanSlug)` from `scripts/prerender.ts:202`. Let `/moreinfo/*` resolve purely on-demand via SPA rewrite (`index.spa.html` with `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`).
5. **Lock `Disallow: /moreinfo/` in `src/hooks/useGitHubSync.ts:886`**: Add `Disallow: /moreinfo/` and `Disallow: /moreinfo/*` to `robotsContent` in `useGitHubSync.ts:886` so it matches `public/robots.txt` and `src/server/routes/seoRoutes.ts:73-74, 101-102`.

---

## PART 5: Why One App's Image Gets Mixed Up With Another App's Metadata in Search Results

### 5.1 Four Compounding Root Causes Verified in the DOM & Head
1. **93.2% of Apps (69 of 74) Have `screenshots: []` (`src/lib/staticData.json`)**:
   - We ran a CLI check across all 74 apps in `src/lib/staticData.json`: only **5 apps** have screenshot URLs (`screenshots.length > 0`). The other **69 apps** have `screenshots: []`.
   - Consequently, on 69 out of 74 `/app/:slug` pages, the target app has **only 1 `<img>` element** in the entire `<body>` (its small `88x88` / `w_160` icon inside `AppHeader`), while `AppSimilarCarousel` renders **16 `<img>` elements belonging to OTHER apps**!
2. **`AppSimilarCarousel` Is Positioned Above Screenshots and About Content (`src/pages/AppDetails.tsx:512` & `src/seo/renderers/appDetailsRenderer.ts:638`)**:
   - Look at the DOM order in both `AppDetails.tsx:496-530` and `appDetailsRenderer.ts:624-662`:
     1. `AppHeader` (1 icon of the target app, `w_160`)
     2. `AppSpecsBar`
     3. `AppActionButtons`
     4. **`AppSimilarCarousel` (16 icons of OTHER apps, `w_160`, starting with the same pinned `is_new` apps: `SPIN WINNER`, `JEET SPIN`, `JAIHO PLAY`, `GAME RUMMY`)**
     5. `AppScreenshots` (empty on 69 of 74 apps)
     6. `AppAboutSection` (main text description of the target app)
   - Because `AppSimilarCarousel` sits **between** the `<h1 itemprop="name">` header and the `AppAboutSection` article body (and has no `data-nosnippet` attribute), Google's visual layout analyzer sees those 16 neighbor app icons sitting directly above the main description text!
3. **Three Conflicting Image URLs for the Target App (And the Schema URL Does Not Exist in `<body>`)**:
   - For `/app/jaiho-rummy`, the server emits **3 different URLs** for the same icon:
     1. **`og:image` / `twitter:image`** (`src/seo/utils.ts:128`):
        `https://res.cloudinary.com/diewalae4/image/upload/f_jpg,q_auto,w_1200,h_630,c_pad,b_auto/v1776298867/rummydex_uploads/jaiho_rummy_app_icon_k9x2qp.png`
        *(Padded 1200×630 landscape banner — Google mobile search snippet thumbnail extractor frequently rejects `c_pad` letterboxed icons).*
     2. **`Product.image` / `SoftwareApplication.image` / `meta[name="thumbnail"]` / `meta[itemprop="image"]` / `link[rel="image_src"]`** (`src/seoHelper.ts:569`, `src/seo/schemaBuilder.ts:75`):
        `https://res.cloudinary.com/diewalae4/image/upload/f_auto,q_auto,w_512/v1776298867/rummydex_uploads/jaiho_rummy_app_icon_k9x2qp.png`
        ***Critical Mismatch:*** This `w_512` URL **never appears on any `<img src="...">` anywhere in `<body>`**!
     3. **Hero `<img alt="JAIHO RUMMY app icon">` in `<body>`** (`src/seo/renderers/appDetailsRenderer.ts:95, 548` & `src/components/public/AppHeader.tsx:27`):
        `https://res.cloudinary.com/diewalae4/image/upload/f_auto,q_auto,w_160/v1776298867/rummydex_uploads/jaiho_rummy_app_icon_k9x2qp.png`
        *(Rendered at `w_160` — the **exact same `w_160` resolution** as the 16 neighbor app icons in `AppSimilarCarousel`!)*
   - When Googlebot tries to match the `Product.image` (`w_512`) or `meta[itemprop="image"]` (`w_512`) to a visible `<img>` in the DOM, it finds **no matching `src`** in `<body>`, and falls back to DOM image scoring across the `w_160` images above the fold — where 16 of the 17 `w_160` images belong to other apps!
4. **Duplicate SEO Manager Conflict (`src/hooks/useSEO.ts` vs `src/components/Meta.tsx`)**:
   - Note that `src/hooks/useSEO.ts` still exists in the codebase (`src/hooks/useSEO.ts:1-104`), while `AppDetails.tsx:484` uses `<Meta />`. In `<Meta />` (`src/components/Meta.tsx:200`), `og:image:width` and `og:image:height` are hardcoded to `'1200'` and `'630'` unless `metaImage.includes('w_600')`, whereas `squareThumbnail` is `w_512`.

### 5.2 Exact Fix to Prevent Image & Content Mix-Ups
1. **Unify Hero Icon & Schema Image URL at `w_512` with `itemprop="image"`**:
   - In `src/seo/renderers/appDetailsRenderer.ts:95, 548` and `src/components/public/AppHeader.tsx:27`, render the target app's hero `<img itemprop="image" fetchpriority="high" loading="eager">` using `getOptimizedImageUrl(app.icon_url, 512)` (`w_512`) — the **exact same URL** declared in `Product.image`, `SoftwareApplication.image`, `meta[name="thumbnail"]`, `meta[itemprop="image"]`, and `link[rel="image_src"]`.
2. **Downsize Neighbor App Icons to `w_96` (`loading="lazy"`, `fetchpriority="low"`) and Move `AppSimilarCarousel` Below `AppAboutSection`**:
   - In `AppDetails.tsx` and `appDetailsRenderer.ts`, move `AppSimilarCarousel` **below** `AppScreenshots`, `AppAboutSection`, and `AppSafetyBoxes`.
   - Wrap `AppSimilarCarousel` in `<aside data-nosnippet aria-label="Similar Applications">` and render its icons at `w_96` (`96x96`) with `loading="lazy"` and `fetchpriority="low"`.

---

## PART 6: Why the Comment / Review Section Is Broken & Loads All Apps Together

### 6.1 Five Verified Bugs in the Community Review Pipeline
1. **Monolithic 651 KB Static Review File Bundled into the Public Client (`src/lib/communityStaticReviews.json`)**:
   - `src/lib/communityStaticReviews.json` is **650,730 bytes (~651 KB)** and stores reviews for every app twice (once keyed by `app.id` and once keyed by `app.slug`, e.g., `138` keys total).
   - `src/lib/communityFirebase.ts:13` executes:
     ```ts
     import communityStaticReviews from './communityStaticReviews.json';
     ```
   - Because `AppDetails.tsx` imports `communityFirebase.ts`, opening **any single app page** (e.g. `/app/jaiho-rummy`) forces the user's browser to download and parse all **651 KB** of reviews for all 74 apps!
2. **SSR Review Fallback Reader (`src/seo/reviewFallback.ts:22-56`) Is Broken by Schema Mismatch**:
   - Look at `src/seo/reviewFallback.ts:29-30`:
     ```ts
     const bySlug = (raw.reviewsBySlug && typeof raw.reviewsBySlug === 'object') ? raw.reviewsBySlug : {};
     const byAppId = (raw.reviewsByAppId && typeof raw.reviewsByAppId === 'object') ? raw.reviewsByAppId : {};
     ```
   - Now look at how `useGitHubSync.ts:592-593, 727` writes `src/lib/communityStaticReviews.json`:
     ```ts
     communityReviewsPayload[k] = revs;
     communityReviewsPayload[k.toLowerCase().trim()] = revs;
     ```
   - `communityStaticReviews.json` is a **flat map** `{ "yono-rummy": [...], "1": [...] }` — it **does NOT have** `reviewsBySlug` or `reviewsByAppId` properties!
   - Therefore, in `src/seo/reviewFallback.ts`, `bySlug` and `byAppId` are **always `{}`**, and `getFallbackReviewsForApp()` only ever returns anything if `data?.reviews` happens to be populated (which `useGitHubSync.ts:712, 720` explicitly sets to `reviews: []`!).
   - We verified this via CLI: `reviewFallback.ts` fails to read a single review from `communityStaticReviews.json`!
3. **5 Public Apps Have ZERO Entries in `communityStaticReviews.json` and `communityCatalogStats.json`**:
   - CLI verification proved that the 5 newest apps in `staticData.json`:
     - `jaiho-rummy` (id `119`)
     - `jaiho-play` (id `118`)
     - `game-rummy` (id `120`)
     - `hi-rummy` (id `121`)
     - `spin-rummy` (id `122`)
     are **100% missing** from both `src/lib/communityStaticReviews.json` and `src/lib/communityCatalogStats.json`!
   - When `AppDetails.tsx` loads for any of these 5 apps, `getStaticReviewsForApp()` returns `[]`, and `communityFirebase.ts:395` fires a live browser `fetch` directly to Google's Firestore REST API (`firestore.googleapis.com/v1/projects/rummydexcommunity/...:runQuery`).
4. **No Review Submission Form Rendered on App Pages (`src/components/UserReviews.tsx`)**:
   - `src/components/public/ReviewForm.tsx` exists in the codebase, and `src/hooks/useReviews.ts` exists in the codebase — **but neither is imported or used by `AppDetails.tsx` or `UserReviews.tsx`**!
   - `AppDetails.tsx:533` renders `<UserReviews />`, which only renders the rating distribution bars, sort pills, and review list — there is **no "Write a Review" button or form** anywhere in `UserReviews.tsx`.
5. **`submitLiveReview`, `voteLiveReviewHelpful`, and `reportLiveReview` Only Write to Browser `localStorage` (`src/lib/communityFirebase.ts:621-705`)**:
   - Look at `src/lib/communityFirebase.ts:621-705`:
     - `submitLiveReview()` writes the user's review to `localStorage.setItem('rd_user_submitted_reviews_v1', ...)` and returns `{ success: true }` — it **never calls `POST /api/v1/public/community/reviews` or Firestore REST**!
     - `voteLiveReviewHelpful()` only writes to `localStorage` (`rd_user_helpful_deltas_v1`)!
     - `reportLiveReview()` only writes to `localStorage` (`rd_user_reported_reviews_v1`)!
   - Meanwhile, the real backend endpoints (`POST /api/v1/public/community/reviews`, `/helpful`, `/report` in `src/server/routes/communityRoutes.ts:138-215`) sit completely unused by `communityFirebase.ts`!

### 6.2 Architecture for Per-App Review Files (`/public/data/reviews/<slug>.json`) & Working Comments
1. **Per-App Split Static Review Files**:
   - During GitHub Sync (`useGitHubSync.ts`) and build/prerender (`scripts/prerender.ts`), write each app's published reviews to an isolated per-app JSON file:
     `public/data/reviews/<slug>.json` (containing the top 10–20 published reviews for that specific app, ~2–4 KB per file).
   - Remove the static `import communityStaticReviews from './communityStaticReviews.json'` from client-side `src/lib/communityFirebase.ts:13`.
   - When a user opens `/app/:slug`, `UserReviews.tsx` fetches only `/data/reviews/${slug}.json` (~3 KB) instead of bundling 651 KB of all apps' reviews!
2. **Fix `src/seo/reviewFallback.ts` for SSR & Schema Injection**:
   - Update `loadStaticReviewStore()` in `src/seo/reviewFallback.ts:22-56` to read both `public/data/reviews/<slug>.json` and the flat keys `{ [slug]: Review[], [id]: Review[] }` in `src/lib/communityStaticReviews.json`, so SSR HTML and JSON-LD `Product.review` always embed the app's real static reviews at build time with 0 Firestore reads.
3. **Wire `UserReviews.tsx` to `ReviewForm.tsx` and Real Backend API Routes**:
   - Render `ReviewForm` inside `UserReviews.tsx` (toggled by a clean "Write a Review" button) and connect `submitLiveReview`, `voteLiveReviewHelpful`, and `reportLiveReview` to `POST /api/v1/public/community/reviews`, `/helpful`, and `/report` (with Firestore REST fallback when running on static hosting).

---

## PART 7: Recommended Step-by-Step Execution Order

To fix every issue cleanly without regressions, we should execute in **4 modular phases**:

1. **Phase 1 — SEO Schema, Meta Title Hygiene & Internal Link Graph Fix**:
   - Fix `WebPage.mainEntity` in `src/seo/schemaBuilder.ts:207` (`"@id": "${appPageUrl}#product"`) and deduplicate `review` arrays across `Product` / `SoftwareApplication`.
   - Synchronize `src/components/public/appDetails/appDetailsSchemas.ts` and `src/components/Meta.tsx` with `schemaBuilder.ts`.
   - Remove hardcoded `"on RummyDex"` fallback descriptions from `src/seoHelper.ts` and `src/pages/Home.tsx`, and fix `formatPageTitle()` in `src/lib/seoUtils.ts` so it never strips intentional Admin characters.
   - Render full crawlable link lists in `newsRenderer.ts`, `homeRenderer.ts`, and related news links on `AppDetails.tsx` / `appDetailsRenderer.ts` so 100% of the 74 apps and 48 news articles have direct internal `<a href>` links.
2. **Phase 2 — 100% Isolation of `/moreinfo` & Turnstile**:
   - Remove the global Turnstile `<script>` from `/index.html` and load it dynamically only when needed.
   - Lazy-load `GatewayPage` in `src/AppPublic.tsx`.
   - Replace `<a href="/moreinfo/...">` in `appDetailsRenderer.ts`, `newsRenderer.ts`, and `NewsRelatedAppBox.tsx` with navigation-proof `<button>` handlers.
   - Remove `/moreinfo/*` from `scripts/prerender.ts` and add `Disallow: /moreinfo/` + `Disallow: /moreinfo/*` to `useGitHubSync.ts:886`.
3. **Phase 3 — App Image & Content Isolation**:
   - Render the target app's hero icon at `w_512` with `itemprop="image"` in `AppHeader.tsx` and `appDetailsRenderer.ts` (matching `Product.image` and `meta[name="thumbnail"]` 1:1).
   - Move `AppSimilarCarousel` below `AppAboutSection`, wrap it in `<aside data-nosnippet>`, and downsize neighbor app icons to `w_96` (`loading="lazy"`, `fetchpriority="low"`).
4. **Phase 4 — Per-App Review File Splitting (`/public/data/reviews/<slug>.json`), Admin Save Fix & Review Form Restoration**:
   - Fix `src/seo/reviewFallback.ts` to read flat keys and per-app review files.
   - Generate per-app `/public/data/reviews/<slug>.json` files (including the 5 missing apps) and remove the 651 KB `communityStaticReviews.json` import from the client bundle.
   - Add `/api/v1/admin/encrypt` (or route `AdminDashboard.tsx:211` + `saveAppSingle` to `/api/v1/admin/encrypt-links` and `/api/v1/admin/seal-vault`), update `/api/v1/admin/sync-local` to persist `catalogStats` and `staticReviews`, and wire `ReviewForm` + live backend submission in `UserReviews.tsx`.
