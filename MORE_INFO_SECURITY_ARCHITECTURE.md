# AUTHORITATIVE BLUEPRINT & SECURITY SPECIFICATION: More Information (`/moreinfo`) Gateway & Link Security Architecture

> [!IMPORTANT]
> **CRITICAL INSTRUCTION FOR ALL AI AGENTS & DEVELOPERS:**
> This document is the absolute **Source of Truth** for the More Information (`/moreinfo`) gateway, admin link management, link encryption/decryption, backend security resolution, bot mitigation, and vocabulary neutrality.
> 1. **You MUST read this entire document** before inspecting, modifying, or implementing any code relating to the More Information page, action buttons, link vault, admin forms, or security routes.
> 2. **You MUST update this document** immediately whenever any security rule, component, route, admin field, or vocabulary guideline is adjusted.

---

## 1. Executive Summary & Core Philosophy

The **More Information Gateway** (`/moreinfo/:slug` and `/moreinfo/:id`) serves as an ultra-fast, zero-leakage, bot-camouflaged intermediary layer connecting public catalog pages to external target destinations.

### Why Traditional Download Systems Fail & Our Strategic Countermeasures:
| Common Industry Mistake / Weakness | What Scrapers & Bad Bots Do | How RummyDex More Info Eliminates It |
| :--- | :--- | :--- |
| **Exposing Direct Target URLs in HTML** | Scrapers parse `href="https://mediafire..."` or `data-url="..."` from the DOM without rendering. | **100% Vault Encrypted**: Target URLs never exist in client HTML, bundles, or public attributes. Decryption happens dynamically on the server in memory. |
| **Predictable / Sensitive Vocabulary** | Bots query the DOM for `download`, `apk`, `mod`, `hack`, `file`, `mirror`. | **Stealth Camouflage**: The More Info gateway uses purely neutral terminology: `Proceed`, `Verification Portal`, `Technical Overview`, `Dispatch`. Bots cannot identify the page purpose. |
| **Predictable API Endpoint Names** | Automated scrapers scan network traffic for `/api/download`, `/api/get-link`. | **Neutral Service Aliases**: Endpoints use stealth routing (`/api/v1/public/secure-link`, `/api/v1/meta/resolve`, `/api/v1/node/sync`) indistinguishable from standard app metadata requests. |
| **DOM Element Identifier Leaks** | Crawlers search for `id="download-btn"` or `class="apk-download"`. | **Zero-Leakage DOM IDs**: HTML IDs and CSS classes strictly use neutral identifiers: `id="clearance-btn-..."`, `id="gateway-cta-..."`. |
| **High Latency & Broken Redirects** | Complex multi-step handshakes cause drop-offs on slow mobile connections. | **Sub-5ms In-Memory Resolution**: High-speed memory caching and asynchronous native anchors provide instant delivery (<5ms) with a permanent fallback button. |
| **Direct Cross-Origin API Scraping** | Competitors send automated POST/GET requests directly to backend endpoints. | **Multi-Layer Defensive Wall**: Bad-UA filtering, IP sliding-window rate limiting, and suspicious client heuristic rejection. |

---

## 2. Complete Link Lifecycle: From Admin Input to End-User Delivery

### Step 1: Admin Adds or Edits a Link in Admin Panel
1. **Admin UI Location**: Admin Dashboard $\rightarrow$ Catalog Management $\rightarrow$ App Editor $\rightarrow$ General Section (`src/components/admin/apps/sections/GeneralSection.tsx`).
2. **Form Field Name**: `more_information_url` (labeled *"Download / Target Destination URL (External APK / Store Link)"*).
3. **Allowed Values**: Any valid destination URL (e.g., Google Drive, Telegram, Amazon S3, CDN mirror, or official developer portal).
4. **Data Normalization**: 
   - Trimmed of extraneous whitespace.
   - Preserves protocol (`https://`).
   - Stored in the app document payload under `more_information_url` (with compatibility aliases: `download_url`, `encrypted_link`, `url`).

### Step 2: Storage & Multi-Tier Vault Synchronization
When the admin clicks **Save App**:
1. **Live Firestore Collection**:
   - Written to `store_data/apps_chunk_0` or `store_data/apps_chunk_1` using AES encryption or vault segregation.
   - Synchronized to vault collection `store_data/sec_vault` and `store_data/sec_public_links` via `/api/v1/admin/sync-local` (`src/server/routes/adminVaultRoutes.ts`).
2. **High-Availability Static Failover**:
   - Backed up locally into `src/lib/staticData.json` ensuring 100% uptime even if Firestore credentials or quota fail.
3. **Cryptographic Format**:
   - Plaintext strings are transformed using AES-256 into OpenSSL-compatible ciphertext strings starting with `U2FsdGVkX1...` (`src/server/crypto.ts`).
   - Client-facing datasets never expose raw target URLs in `window.__INITIAL_DATA__` or public list queries.

### Step 3: Public Catalog Navigation
1. User browses to `/app/:slug` (rendered by `src/pages/AppDetails.tsx`).
2. The action bar (`src/components/public/AppActionButtons.tsx`) renders the primary action button labeled **"Download"**.
3. Clicking **"Download"** routes cleanly to `/moreinfo/${app.slug || app.id}`.

### Step 4: More Info Clearance Screen (`/moreinfo/:slug`)
1. Rendered by `src/pages/GatewayPage.tsx`.
2. Displays neutral application details (Package ID, Checksums, Safety Audit Badges, Version).
3. Renders the clearance controller `<ClearanceButton appId={app.slug || app.id} />`.
4. User clicks **"Proceed"**.

### Step 5: Backend Link Resolution Handshake
1. Client sends AJAX `POST /api/v1/public/secure-link` with payload `{ appId }`.
2. Server runs anti-bot checks (Bad-UA regex, suspicious client check, rate limit).
3. Server invokes `resolveDestinationForApp(appId)` across the 6-tier vault hierarchy.
4. Returns JSON `{ success: true, url: targetUrl }` in under 5ms.

### Step 6: Native Client Dispatch & Fail-Safe Fallback
1. **Automated Trigger**: Creates an invisible native `<a>` element (`target="_blank"`, `rel="noopener noreferrer nofollow"`), dispatches `.click()`, and cleans it up.
2. **Visual Fallback Trigger**: If mobile pop-up blockers suppress programmatic opening, the button morphs into a permanent high-contrast green button: **"Click Here to Proceed"** pointing directly to `targetUrl`.

---

## 3. The 6-Tier Backend Link Resolution Hierarchy (`resolveDestinationForApp`)

The resolution function (`src/server/routes/securityRoutes.ts`) executes a strict priority-based search to guarantee zero downtime:

```
[ Incoming Request: appId (slug or ID) ]
               |
               v
 [ Tier 0: In-Memory Fast Cache ] -----------> Found? Return immediately (<1ms)
               |
               v
 [ Tier 1: Local Server Vault ] -------------> Found in secure_vault.json? Decrypt & Return
               |
               v
 [ Tier 2: Live Firestore Vault Docs ] ------> Checks sec_public_links, sec_links_vault_3, sec_vault
               |                               (via Firebase Admin SDK or REST fallback)
               v
 [ Tier 3: In-Memory vaultNode Sync ] -------> Checks vaultNode.getSyncPayload(appId)
               |
               v
 [ Tier 4: Static Constant ENCRYPTED_LINKS ] -> Decrypts secureVault.ts AES ciphertext
               |
               v
 [ Tier 5: Firestore store_data Apps ] ------> Searches apps_chunk_0 / apps_chunk_1 documents
               |
               v
 [ Tier 6: High-Availability Failover ] -----> Searches staticData.json mockApps
```

### Flexible Key Matching Logic:
To prevent resolution failures due to formatting differences, the resolver constructs an exhaustive search key array for every incoming `appId`:
1. Exact string: `appId` (e.g. `"spin-crush"`)
2. Lowercase string: `lowerAppId` (e.g. `"spin-crush"`)
3. Trailing separator stripped: `lowerAppId.replace(/[-_ ]+$/, '')`
4. Separators completely removed: `lowerAppId.replace(/[-_ ]/g, '')` (e.g. `"spincrush"`)
5. ID matches (e.g. `"app_123"`) and Slug matches simultaneously.

---

## 4. Major Pitfalls & Critical Mistakes (Where AI & Developers Fail)

> [!CAUTION]
> **REVIEW THIS SECTION CAREFULLY TO AVOID BREAKING THE SYSTEM:**

### ❌ Mistake 1: Exposing Direct URLs in Public Client JSON / SSR Data
- **The Error**: Passing plain `more_information_url` inside `window.__INITIAL_DATA__`, public app list APIs, or public static JSON.
- **Why it breaks security**: Scrapers and bots can extract every link on the site in one GET request without ever visiting the More Info page.
- **The Correct Rule**: Public app listings must only expose `slug`, `id`, and metadata. Download URLs must ONLY be returned by `/api/v1/public/secure-link` after bot validation.

### ❌ Mistake 2: Case-Sensitive or Slug-Only Matching
- **The Error**: Resolving only by `item.id === req.body.appId` or failing when the client passes a slug like `"yono-rummy"` but the database has `"app_042"`.
- **Why it breaks security/functionality**: The user sees a "Link Unavailable" error even though the app exists in the database.
- **The Correct Rule**: Always search both `id` and `slug`, with punctuation-stripped fallback (`yono-rummy` == `yonorummy`).

### ❌ Mistake 3: Double Encryption / Corrupted Ciphertexts
- **The Error**: Calling `safeEncrypt()` on a string that is already encrypted (`U2FsdGVkX1...`).
- **Why it breaks security/functionality**: The decryption function fails to produce a valid URL, outputting garbage characters.
- **The Correct Rule**: Always check `url.startsWith('U2FsdGVkX1')` before attempting encryption or decryption.

### ❌ Mistake 4: Environment Secret Mismatch (`AES_SECRET`)
- **The Error**: Hardcoding a fallback secret in one file while reading from `process.env.AES_SECRET` in another, causing decryption failure.
- **Why it breaks security/functionality**: Encrypted links created in Admin cannot be decrypted by the public resolver.
- **The Correct Rule**: All encryption and decryption must strictly route through `getAesSecret()` in `src/server/crypto.ts`.

### ❌ Mistake 5: Hardcoding Direct External Links on Catalog Pages
- **The Error**: Placing `<a href={app.more_information_url}>` on `/app/:slug` to "simplify" the code.
- **Why it breaks security/functionality**: Completely bypasses bot protection, scraper defense, rate limiting, and referrer stripping.
- **The Correct Rule**: App pages must ALWAYS navigate to `/moreinfo/:slug`, and `/moreinfo/:slug` must ALWAYS trigger the clearance button.

### ❌ Mistake 6: Triggering Anti-Bot Rejections on Genuine Mobile Users
- **The Error**: Blocking requests if standard mobile headers (like touch event headers or non-standard Safari UAs) are present.
- **Why it breaks security/functionality**: Real users on mobile browsers get 403 Forbidden errors.
- **The Correct Rule**: Only reject known scraper signatures (`python`, `curl`, `puppeteer`, `scrapy`, etc.) or completely empty/truncated UAs (< 5 characters).

### ❌ Mistake 7: Forgetting High-Availability Static Failover
- **The Error**: Relying solely on a live Firestore connection with no local backup.
- **Why it breaks security/functionality**: If Firebase experiences downtime, quota exhaustion, or cold-start timeouts, the entire download system crashes.
- **The Correct Rule**: Always maintain `src/lib/staticData.json` and `src/lib/secureVault.ts` as fallbacks in Tier 4 and Tier 6.

---

## 5. Strict Neutral Vocabulary Protocol (Bot Camouflage)

To prevent automated scraper heuristics, ad networks, and bot networks from recognizing the page as an APK distributor, strictly enforce these naming rules:

| UI / Code Context | Strictly Prohibited ❌ | Mandatory Neutral Terminology ✅ |
| :--- | :--- | :--- |
| **Catalog App Button Label** | "Download APK", "Get APK", "Free Mod", "Install App" | **"Download"** |
| **More Info Main Button** | "Download APK", "Start Download", "Get File" | **"Proceed"** |
| **More Info Fallback Button** | "Click to Download APK", "Direct APK Link" | **"Click Here to Proceed"** |
| **More Info Page Title (`<title>`)** | "APK Download Mirror", "Download Portal" | **"Verification Portal"**, **"Information & Verification"** |
| **More Info Meta Description** | "Download the latest APK file for Android..." | **"Technical specifications and verified mirror gateway for..."** |
| **More Info Status Text** | "Downloading APK...", "Decrypting File..." | **"Connecting..."**, **"Ready"** |
| **Bounce Page Header** | "Redirecting to APK Download..." | **"Connecting to Destination"** |
| **Bounce Page Button** | "Click here to download" | **"Click Here to Proceed"** |
| **DOM Element IDs** | `id="download-btn"`, `id="apk-link"` | `id="clearance-btn-..."`, `id="gateway-cta-..."` |

---

## 6. Complete Directory & Component Map

```
/
├── MORE_INFO_SECURITY_ARCHITECTURE.md     # Authoritative Security Specification (THIS FILE)
├── AGENTS.md                              # System Agent Rules (Referencing this specification)
│
├── src/
│   ├── pages/
│   │   ├── GatewayPage.tsx                # More Info gateway view (/moreinfo/:slug & /moreinfo/:id)
│   │   └── AppDetails.tsx                 # App details view (/app/:slug)
│   │
│   ├── components/
│   │   ├── ClearanceButton.tsx            # Main neutral clearance button ("Proceed" -> "Click Here to Proceed")
│   │   ├── NeutralSyncButton.tsx          # Secondary inline neutral resolution button
│   │   ├── public/
│   │   │   └── AppActionButtons.tsx       # App page hero action bar (strictly labeled "Download")
│   │   └── admin/
│   │       └── apps/sections/
│   │           └── GeneralSection.tsx     # Admin input field for more_information_url
│   │
│   ├── server/
│   │   ├── config.ts                      # Bad-UA regex pattern database & scraper signatures
│   │   ├── crypto.ts                      # AES safeEncrypt, safeDecrypt, and getAesSecret
│   │   ├── security.ts                    # isSuspiciousClient, rateLimit, and IP extraction
│   │   └── routes/
│   │       ├── adminVaultRoutes.ts        # Admin encryption, decryption, and sync endpoints
│   │       └── securityRoutes.ts          # /api/v1/public/secure-link & resolveDestinationForApp
│   │
│   └── lib/
│       ├── vaultNode.ts                   # In-memory Node AES decryption key mappings
│       ├── secureVault.ts                 # AES-256 encrypted link ciphers
│       └── staticData.json                # High-availability catalogue fallback dataset
```

---

## 7. Verification & Automated Integration Testing

Run these tests in the terminal to verify the security wall:

```bash
# TEST 1: Genuine Browser Request (Expected: Status 200 OK + Decrypted Target URL)
node -e '
async function test() {
  const res = await fetch("http://localhost:3000/api/v1/public/secure-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
    },
    body: JSON.stringify({ appId: "spin-crush" })
  });
  console.log("Browser Request Status:", res.status);
  console.log("Browser Response Data:", await res.json());
}
test();
'

# TEST 2: Automated Scraper Bot (Expected: Status 403 Forbidden)
node -e '
async function test() {
  const res = await fetch("http://localhost:3000/api/v1/public/secure-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "python-requests/2.31.0"
    },
    body: JSON.stringify({ appId: "spin-crush" })
  });
  console.log("Scraper Bot Status (Expected 403):", res.status);
  console.log("Scraper Bot Data:", await res.json());
}
test();
'

# TEST 3: Headless Automation Tool (Expected: Status 403 Forbidden)
node -e '
async function test() {
  const res = await fetch("http://localhost:3000/api/v1/public/secure-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/118.0.0.0 Safari/537.36"
    },
    body: JSON.stringify({ appId: "spin-crush" })
  });
  console.log("Headless Bot Status (Expected 403):", res.status);
  console.log("Headless Bot Data:", await res.json());
}
test();
'
```

---

## 8. Mandatory Maintenance Checklist for Future Updates

Whenever any developer or AI agent modifies More Info gateway logic:
1. [ ] **Admin Field Continuity**: Verify `more_information_url` in `GeneralSection.tsx` correctly saves and syncs to vault structures.
2. [ ] **Verify Vocabulary**: Ensure no sensitive words (`APK`, `Mod`, `Direct Hack`, `File Mirror`) are introduced into UI labels, DOM IDs, metadata, or status indicators.
3. [ ] **Preserve Defensive Layers**: Ensure `BAD_UA` checks, `isSuspiciousClient`, and `rateLimit` remain active in `securityRoutes.ts`.
4. [ ] **Preserve Multi-Tier Resolution**: Verify `resolveDestinationForApp` retains all 6 fallback tiers and flexible key matching (slug, ID, lowercase, punctuation-stripped).
5. [ ] **Verify Fail-Safe**: Ensure `<ClearanceButton />` maintains the permanent fallback button (`"Click Here to Proceed"`) for blocked popups.
6. [ ] **Update This Specification**: Document any changes in `MORE_INFO_SECURITY_ARCHITECTURE.md`.
7. [ ] **Run Verification**: Execute `npm run lint` and `npm run build` to confirm zero errors.

---

## 9. Vercel Serverless Architecture (Dex Repository)

**CRITICAL DEPLOYMENT CONTEXT**: The primary Express server (`server.ts` / `src/server/routes/securityRoutes.ts`) is used for local development and the Admin Masterworld deployment. However, the public website (`www.rummydex.com`) is deployed to **Vercel** via the isolated Dex repository.

- **Vercel API Entrypoint**: `public-api/index.js` (which is automatically renamed to `api/index.js` by the `.github/workflows/split-sync.yml` action during deployment).
- **Standalone Nature**: `public-api/index.js` is completely standalone. It does NOT import from `src/server/`. It has its own isolated implementation of `safeDecrypt`, `isValidTargetUrl`, and the `/api/v1/public/secure-link` endpoint.
- **Why this matters**: If you update the link resolution logic in `src/server/routes/securityRoutes.ts`, **you MUST also manually patch `public-api/index.js`** to ensure the public Vercel production site receives the security updates. Failure to do so will result in 404 "Endpoint not found" errors on production because Vercel routes `/api/*` to `public-api/index.js`.

---

## 10. Lightweight High-Performance Defense Shields (Best Practices)

To maintain lightning-fast response times (<5ms) while guaranteeing bulletproof security against bots and scrapers, the system adopts these 5 lightweight defense shields:

### Shield 1: Strict Whitelist Input Validation ⛔
Reject malformed or malicious inputs before touching cache, database, or crypto engines:
```javascript
export function validateAppId(appId) {
  if (typeof appId !== 'string') return null;
  const clean = appId.trim();
  if (clean.length < 1 || clean.length > 64) return null;
  // Strictly allow alphanumeric characters, hyphens, and underscores only
  return /^[a-zA-Z0-9\-_]+$/.test(clean) ? clean.toLowerCase() : null;
}
```
*Benefits*: Instantly prevents path traversal (`../`), SQLi/NoSQL injection payloads, and XSS probe attempts.

### Shield 2: Browser Signal Verification & Scraper Signatures 🎯
Real browsers naturally transmit contextual headers that basic scrapers (Python, curl, headless tools) omit or mismatch:
- **Bot Signature Blacklist**: Detects known scraper tools (`python-requests`, `curl`, `wget`, `scrapy`, `selenium`, `puppeteer`, `headlesschrome`, `nmap`, etc.).
- **Browser Context Checks**: Verifies typical browser request indicators (e.g. `sec-fetch-site`, `accept`, `origin` / `referer`).

### Shield 3: Zero-Overhead IP Sliding Window Rate Limiting 🚦
Restricts rapid-fire automated scraping with minimal memory overhead:
- **Limit**: Max 30 requests per minute per IP address.
- **Eviction**: Automatically purges expired timestamps older than 60 seconds.

### Shield 4: Target URL Integrity & Double-Encryption Protection 🔐
- Checks `url.startsWith('U2FsdGVkX1')` before encrypting or decrypting to prevent ciphertext corruption.
- Verifies resolved target URLs have valid `http://` or `https://` protocols and filters out internal self-referencing loops.

### Shield 5: Structured Security Audit Logging 📊
Logs security incidents in structured JSON format for instant observability without degrading server throughput:
```javascript
{
  "timestamp": "2026-08-20T17:40:00.000Z",
  "eventType": "BOT_DETECTED" | "RATE_LIMIT_EXCEEDED" | "INVALID_INPUT",
  "clientIP": "203.0.113.1",
  "userAgent": "python-requests/2.31.0",
  "appId": "spin-crush",
  "reason": "Known scraper signature detected"
}
```

