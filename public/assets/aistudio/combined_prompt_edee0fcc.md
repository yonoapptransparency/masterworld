# SYSTEM ARCHITECT DIRECTIVE: Upgrade Security Gateway from v9.0 to v10.0 (Strict Mobile-Only, Instant 1-Click, Hardware-Attested Zero-Bot Architecture)

**CRITICAL INSTRUCTION TO AI DEVELOPER:**
You must inspect our current repository—specifically `MORE_INFO_SECURITY_ARCHITECTURE.md`, `functions/api/[[catchall]].js`, `src/server/routes/securityRoutes.ts`, `src/hooks/useTurnstileVerification.ts`, `src/hooks/useClearanceDispatch.ts`, and `src/components/ClearanceButton.tsx`—and execute a complete architectural upgrade to **Version 10.0**.

Before writing any code, read this entire architectural briefing carefully so you understand **why our previous v6.2–v9.0 architecture failed against autonomous AI browser agents**, **what the new v10.0 solution is**, **why it drastically increases bot detection predictability**, and **how you must implement it across all files**.

---

## 1. THE PROBLEM WITH OUR PREVIOUS ARCHITECTURE (WHY v6.2–v9.0 FAILED)

Despite having a 7-wall pipeline, AES-256 server-side link encryption, Upstash Redis nonce burning, and Cloudflare Turnstile, autonomous AI browser agents (such as OpenAI Operator, Claude Computer Use, Browser-Use Cloud, and stealth Playwright/CDP frameworks) were able to open `/moreinfo/:slug`, click the `"Proceed"` button, and extract our decrypted target URLs in seconds without being blocked.

Here is the exact technical root cause of why our previous system dropped our security and let AI browser bots walk straight through:

1. **Fatal Backdoor #1: The "Track B" Kinetic Attestation Fallback (`securityRoutes.ts` & `functions/api/[[catchall]].js`)**
   - *What we did wrong*: To avoid false positives when Cloudflare Turnstile was slow or blocked by adblockers, we created a dual-track "OR" system (Track A: Turnstile **OR** Track B: Client Kinetic Telemetry). If Turnstile failed or was missing, the server trusted Track B—which simply checked a Base64-encoded JSON object from the client (`wb === 0`, `hl === 0`, `cb === 0`, `tr === 1`, `el >= 250`).
   - *Why AI bots bypassed it*: Autonomous AI browsers run real Chromium instances via Chrome DevTools Protocol (CDP) or OS-level virtual displays. When an AI agent dispatches a click via CDP (`Input.dispatchMouseEvent`), the browser natively marks `e.isTrusted = true` (`tr: 1`) and assigns real `(x, y)` coordinates. Furthermore, because LLMs take 2 to 5 seconds to capture a screenshot and decide where to click, they naturally pass the `el >= 250ms` human dwell-time check. And because the token is plain Base64 JSON, any script can forge those exact values.

2. **Fatal Backdoor #2: The `invalid-input-secret` Auto-Approve Rule (Section 17.1)**
   - *What we did wrong*: Previously, when Cloudflare's `siteverify` endpoint returned `invalid-input-secret` due to an environment variable mismatch, we programmed our edge and server routers to treat it as a "server configuration notice" and **automatically let the user pass anyway** using client kinetic checks.
   - *Why AI bots bypassed it*: By failing open instead of failing closed on a secret key error, cryptographic Turnstile verification was effectively disabled whenever a configuration mismatch occurred.

3. **Fatal Backdoor #3: Allowing Desktop Browsers & Cloud Datacenter Networks**
   - *What we did wrong*: Our platform was leaving the `/moreinfo/*` gateway open to Desktop operating systems (Windows, macOS, Linux) and Cloud Datacenter IP ranges.
   - *Why AI bots bypassed it*: Almost 100% of autonomous AI browser agents, headless scrapers, and cloud browser sandboxes operate inside Linux/Windows virtual containers hosted on Cloud Datacenter ASNs (Amazon AWS, Google Cloud, Microsoft Azure, DigitalOcean, Hetzner, OVH) and interact using virtual desktop mouse pointers (`pointerType: "mouse"`). By permitting desktop environments and cloud ASNs, we fought AI bots on their home turf.

4. **Fatal Backdoor #4: Unbound Cloudflare Turnstile Tokens**
   - *What we did wrong*: Our Turnstile verification only checked if `result.success === true`. It did not bind the Turnstile widget challenge to the specific `appId` via `cData` or verify the `action` and `hostname`.
   - *Why AI bots bypassed it*: Tokens generated via test keys or harvested from one session could be passed into the resolution endpoint without cryptographic proof that the token was minted specifically for that exact `appId` on our production domain.

5. **Fatal Backdoor #5: Legacy Client-Side Fallback Remnants**
   - *What we did wrong*: Earlier versions (Section 17.1) included a 4-Tier Client Resolution Matrix that attempted to resolve links from `appRecord`, `window.__INITIAL_DATA__`, or `ENCRYPTED_LINKS` on the client if the API failed.
   - *Why AI bots bypassed it*: Any fallback that exists in client memory or static bundles allows an automated browser to extract links without passing server verification.

---

## 2. THE NEW v10.0 SOLUTION: STRICT MOBILE-ONLY + INSTANT 1-CLICK + HARDWARE ATTESTATION

To permanently neutralize current and future autonomous AI browser agents while keeping the user experience effortless for real visitors, we are shifting to a **Strict Mobile-Only, Single-Tap, Hardware-Attested Architecture**.

### Core Mandate for User Experience:
- **STRICTLY ONE CLICK (SINGLE TAP) ONLY**: When a mobile user visits the `/moreinfo/:slug` page, they must ONLY tap the `"Proceed"` button **once**.
- **NO HOLD TIMERS / NO LONG-PRESS BARRIERS / NO PUZZLES**: Do NOT add a 1.5-second hold button, countdown timer, or multi-step gesture. Every single verification layer must execute **invisibly in the background** and at the **exact millisecond of the single tap**.
- **STRICTLY MOBILE USERS ONLY**: We do NOT want desktop users clicking or accessing the gateway. Even if a desktop user or AI bot turns on "Mobile Responsive View" or spoofs a mobile User-Agent string, the system must detect the underlying desktop hardware/mouse/network and immediately return our disguised **404 — Page Not Found** state.

---

## 3. HOW THE NEW SYSTEM WORKS & WHY DETECTION PREDICTABILITY IS EXPONENTIALLY HIGHER

Instead of relying on easily spoofed software flags, v10.0 enforces **Physical Reality and Infrastructure Constraints** across 5 synchronized layers. An AI bot cannot fake physical mobile hardware sensors, capacitive glass touch geometry, and consumer cellular carrier networks all at the same time.

### Layer 1: Edge Network & ASN Cloud Blackhole (`functions/api/[[catchall]].js` & `securityRoutes.ts`)
- **What to build**:
  1. Inspect the incoming request's Autonomous System Number (`request.cf.asn` and `request.cf.asOrganization` on Cloudflare Edge) and IP headers. Block all known Cloud Datacenter, Hosting, VPN, and Server ASNs (AWS, Google Cloud, Azure, DigitalOcean, Hetzner, OVH, Linode, Vultr, Choopa, Datacamp, M247, Scaleway, Oracle Cloud).
  2. Inspect HTTP User-Agent Client Hints (`Sec-CH-UA-Mobile` and `Sec-CH-UA-Platform`). If `Sec-CH-UA-Mobile === '?0'` or `Sec-CH-UA-Platform` contains `Windows`, `macOS`, `Linux`, or `Chrome OS`, reject immediately.
  3. Inspect the `User-Agent` string and reject any request that lacks native `Android` or `iPhone`/`iPad`/`iPod` signatures or contains desktop architecture strings (`Windows NT`, `Macintosh`, `X11; Linux x86_64`, `CrOS`).
- **Why this makes us stronger**: Cloud-hosted AI browser agents (Browser-Use Cloud, OpenAI Operator, Claude Computer Use, cloud Playwright clusters) run on datacenter servers. Blocking datacenter ASNs and desktop Client Hints at Wall 1 kills 95%+ of AI agents at the network edge before they even touch our vault logic, returning an instant `404 Not Found`.

### Layer 2: Deep Mobile Hardware & GPU Environment Trap (`useClearanceDispatch.ts`)
- **What to build**:
  Inspect the physical device hardware before and during the single tap:
  1. **Capacitive Multi-Touch Hardware**: Require `navigator.maxTouchPoints >= 2` and `'ontouchstart' in window`. (Desktops and default headless VMs report `0` or `1`).
  2. **CSS Media Query Hardware Lock**: Require `window.matchMedia('(pointer: coarse)').matches === true` AND `window.matchMedia('(hover: none)').matches === true`. Furthermore, inspect `any-pointer` and `any-hover`—desktop browsers emulating mobile screens via DevTools often still expose a fine mouse pointer or hover capability.
  3. **Mobile Silicon WebGL GPU Verification**: Extract the unmasked WebGL renderer (`UNMASKED_RENDERER_WEBGL`). Real smartphones use mobile SoC GPUs (`Adreno`, `Mali`, `Apple GPU`, `PowerVR`, `Xclipse`, `Maleoon`). Immediately flag and block software renderers (`SwiftShader`, `llvmpipe`, `Mesa OffScreen`, `VirtualBox`, `VMware`) AND desktop GPUs (`NVIDIA`, `GeForce`, `Radeon`, `Intel(R) UHD`, `Intel(R) Iris`).
  4. **Prototype Descriptor Integrity**: Verify `Object.getOwnPropertyDescriptor(Object.getPrototypeOf(navigator), 'webdriver')` has not been overridden or proxied by stealth plugins.
  5. **Passive Physical Sensor Telemetry (`DeviceMotionEvent` / `DeviceOrientationEvent`)**: Passively listen for micro-fluctuations in accelerometer/gyroscope events while the user is on the page and include the sample count in the telemetry payload.
- **Why this makes us stronger**: Even if a bot spoofs a mobile User-Agent string on a desktop or Linux server, it cannot spoof an `Adreno`/`Mali`/`Apple GPU` hardware pipeline, native coarse-only pointer descriptors, and multi-touch hardware limits simultaneously.

### Layer 3: Instant Single-Tap Capacitive Physics Verification (`ClearanceButton.tsx` & `useClearanceDispatch.ts`)
- **What to build**:
  When the user taps the `"Proceed"` button once (via `onPointerDown` / `onTouchStart` leading into `onClick`):
  1. **Strict Pointer Type Enforcement**: Check `e.pointerType`. If `e.pointerType === 'mouse'`, immediately reject the click and trigger the disguised 404 Bot Trap. Only `e.pointerType === 'touch'` (or native `TouchEvent` with `touches.length > 0`) is permitted.
  2. **Native OS Event Trust**: Enforce `e.nativeEvent.isTrusted === true`.
  3. **Capacitive Touch Patch Geometry**: Record the touch contact area (`radiusX`, `radiusY`, `width`, `height`, `pressure` / `force`) and screen/client coordinates (`clientX > 0`, `clientY > 0`). Real human fingers pressing glass register valid coordinates and touch contact metrics, whereas programmatic `.click()` or raw script dispatchers emit zero coordinates or mouse-like 1x1 pixel points.
- **Why this makes us stronger**: Autonomous AI agents execute actions by moving a virtual mouse cursor and clicking (`pointerType: 'mouse'`), or calling `.click()`. By requiring a single trusted capacitive `touch` event with valid touch geometry, desktop AI agents fail on the very first click without adding a single millisecond of delay for real mobile users.

### Layer 4: Deletion of "Track B" & Mandatory Dual-Lock Verification (`AND` Logic)
- **What to build**:
  1. **Completely delete "Track B" fallback** from `src/server/routes/securityRoutes.ts` and `functions/api/[[catchall]].js`.
  2. **Completely delete the `invalid-input-secret` auto-pass rule**. If `TURNSTILE_SECRET_KEY` is missing or invalid, or if Cloudflare `siteverify` returns `success: false`, the server MUST fail closed and reject the request.
  3. **Change verification from `OR` to strict `AND`**: Every link resolution request MUST pass **BOTH**:
     - **Cryptographic Cloudflare Turnstile Verification** (`siteverify` returns `success === true`), **AND**
     - **Strict Mobile Hardware & Single-Tap Capacitive Validation**.
     If either check fails, immediately quarantine the IP in Upstash Redis for 30 minutes and return the disguised `404 Not Found` response.

### Layer 5: Cryptographic Turnstile `cData` & Action Binding (`useTurnstileVerification.ts`)
- **What to build**:
  1. When rendering the Cloudflare Turnstile widget on the client, pass `action: 'mobile_clearance'` and `cData: appId.toLowerCase().trim()`.
  2. Never use the fallback `1x00000000000000000000AA` dummy test key in production builds or on production domains.
  3. On the backend (`securityRoutes.ts` and `functions/api/[[catchall]].js`), inspect the JSON response from `https://challenges.cloudflare.com/turnstile/v0/siteverify` and verify:
     - `result.success === true`
     - `result.action === 'mobile_clearance'` (if returned)
     - `result.cdata === expectedAppId` (if returned)
- **Why this makes us stronger**: This cryptographically binds every Turnstile token to the exact application page the user is viewing. A bot cannot solve a challenge once or use a test token and replay it across our catalog.

---

## 4. SUMMARY OF BENEFITS WE GAIN WITH v10.0

1. **Near-100% Detection Predictability Against AI Browser Agents**: Because cloud AI browsers (Operator, Browser-Use, Claude, Playwright) run on Datacenter ASNs, Linux/Desktop OS platforms, Desktop/Software GPUs (`SwiftShader`/`llvmpipe`), and virtual mouse pointers, they get caught at 4 independent layers simultaneously.
2. **Zero Friction for Real Mobile Users (1-Click Only)**: Real users on Android and iOS phones experience zero added friction—no hold timers, no sliders, no annoying puzzles. They tap `"Proceed"` once and are immediately connected in `<100ms`.
3. **Zero False-Open Backdoors**: Removing Track B and the `invalid-input-secret` bypass guarantees that no bot can ever skip Cloudflare Turnstile by forging client JSON payloads.
4. **Total Disguised 404 Camouflage**: Any desktop user, cloud server IP, or automated browser agent that touches the gateway or API is silently presented with a realistic `404 Not Found` screen and quarantined in Upstash Redis, giving attackers zero feedback on why they were blocked.

---

## 5. YOUR EXECUTION CHECKLIST

Please execute the following tasks in order right now:
1. **Audit & Clean**: Inspect `src/hooks/useTurnstileVerification.ts`, `src/hooks/useClearanceDispatch.ts`, `src/components/ClearanceButton.tsx`, `src/server/routes/securityRoutes.ts`, and `functions/api/[[catchall]].js`. Identify and remove all Track B bypasses, `invalid-input-secret` auto-passes, and any remaining client-side link resolution fallbacks.
2. **Implement Frontend v10.0**: Rewrite `useTurnstileVerification.ts`, `useClearanceDispatch.ts`, and `ClearanceButton.tsx` to enforce strict Mobile-Only hardware/GPU/media-query inspection, passive motion sensor counting, `cData: appId` Turnstile binding, and instant 1-Click capacitive touch validation (`pointerType === 'touch'`). Ensure there are NO hold timers.
3. **Implement Backend & Edge v10.0**: Rewrite `src/server/routes/securityRoutes.ts` and `functions/api/[[catchall]].js` with full parity so both enforce:
   - Cloud Datacenter ASN blocking (`request.cf.asn`)
   - Desktop Client-Hint & User-Agent blocking (`Sec-CH-UA-Mobile`, `Sec-CH-UA-Platform`, `User-Agent`)
   - Mandatory strict `AND` verification (Cryptographic Turnstile `siteverify` with `cdata` check **AND** Mobile Single-Tap Hardware Payload validation)
   - Atomic Upstash Redis nonce burning (`SET nonce:<id> 1 EX 90 NX`) and 30-minute IP quarantine on any violation.
4. **Update Blueprint Documentation**: Update `MORE_INFO_SECURITY_ARCHITECTURE.md` to **Version 10.0**, documenting the removal of Track B, the Root Cause Analysis of previous AI agent bypasses, and the new 5-Layer Mobile-Only Single-Click Hardware Attestation architecture.
5. **Verify Build**: Run linting and compilation checks to ensure zero TypeScript or build errors.

# ⚠️ CRITICAL META-INSTRUCTION & EXECUTION PROTOCOL FOR THE AI AGENT (READ BEFORE TOUCHING ANY CODE)

You are acting as a Principal Security Systems Architect. The blueprint provided came from an external architectural review that **does not have direct visibility into our live repository structure**. You, however, DO have direct access to our files. Therefore, you must NOT blindly copy-paste or hallucinate assumptions. You must execute this upgrade with surgical precision by following these 6 mandatory operational rules:

### 1. DEEP REPOSITORY & DATA-FLOW AUDIT FIRST (ZERO HALLUCINATION RULE)
Before writing or modifying a single line of code, you MUST deeply read and map out the exact current state of our live website and the `/moreinfo` flow:
- Inspect how public routes (`AppPublic.tsx`, `GatewayPage.tsx`), client hooks (`useTurnstileVerification.ts`, `useClearanceDispatch.ts`), UI components (`ClearanceButton.tsx`), and our dual-backend entrypoints (`server.ts`, `src/server/routes/securityRoutes.ts`, `src/server/services/linkService.ts`, `functions/api/[[catchall]].js`, and `public-api/index.js`) actually connect and pass data.
- Inspect how `secureVault.ts`, `staticData.json`, `public_backup.json`, and Admin GitHub Split-Sync (`useGitHubSync.ts`) currently store, strip, and resolve encrypted links.
- **Find Hidden Leaks Independently**: While auditing our actual codebase, if you discover *any* additional security loopholes, leftover client-side fallbacks, exposed JSON fields, or route bypasses that were not mentioned in the prompt, **you are strictly required to fix those too**. Do not leave any weak spots behind.

### 2. STRICT SEQUENTIAL GATEKEEPING (ONE-BY-ONE EXECUTION — NEVER OPEN THE VAULT EARLY)
Security verification MUST execute in a strict, fast, sequential chain where **the encrypted vault (`ENCRYPTED_LINKS` / `resolveDestinationForApp`) is at the very end of the pipeline and is NEVER loaded, touched, or decrypted until 100% of prior checks succeed**:
- **Gate 1 (Fastest — <0.1ms)**: Edge Network, Datacenter ASN, User-Agent, and Client-Hint Mobile Filter. *(If fail → Instant 404. Stop execution.)*
- **Gate 2 (<1ms)**: IP Rate Limit, Rapid Burst Check, & Quarantine Check. *(If fail → Instant 404. Stop execution.)*
- **Gate 3 (<1ms)**: Clearance Token Presence, Base64 Structural Integrity, Timestamp Freshness, AppID Affinity, and Strict Mobile Hardware/Single-Tap Telemetry Validation (`pointerType === 'touch'`, `isTrusted`, coarse pointer, mobile GPU, `webdriver === false`). *(If fail → Quarantine IP + Instant 404. Stop execution.)*
- **Gate 4 (~10–30ms)**: Atomic Single-Use Nonce Burn via Upstash Redis (`SET NX`). *(If fail/replayed → Quarantine IP + Instant 404. Stop execution.)*
- **Gate 5 (~30–50ms)**: Server-to-Server Cryptographic Cloudflare Turnstile `siteverify` (strictly verifying `success === true` and `cdata`). *(If fail → Quarantine IP + Instant 404. Stop execution.)*
- **Gate 6 (FINAL STEP ONLY)**: **ONLY AFTER Gates 1, 2, 3, 4, and 5 have all explicitly passed**, invoke the in-memory AES-256 vault decryption to resolve and emit the destination URL. Under no circumstances may the vault or JSON link store be accessed before Gate 5 completes.

### 3. PRAGMATIC VALIDATION: PROTECT REAL MOBILE USERS (BENEFIT VS. RISK BALANCE)
Your goal is **100% elimination of desktop/cloud AI browser bots** while maintaining **100% smooth, instant 1-click reliability for real humans on real mobile phones (Android & iOS, Chrome, Safari, Samsung Internet, Brave, and in-app mobile browsers)**.
- **Validate Every Check Against Real Mobile Behaviour**: Before locking in any hardware or sensor check, ask yourself: *"Could this specific check accidentally block a real human using an Android or iPhone?"*
- *Example — DeviceMotion/Gyroscope*: Modern iOS Safari and some Android browsers block `DeviceMotionEvent` unless explicit permission is requested, or a user's phone might be resting flat on a table. Therefore, use motion sensors as a positive signal, **NOT** a hard-fail blocker that breaks real users whose phones lack active gyro permissions!
- *Example — Client Hints (`Sec-CH-UA-*`)*: iOS Safari and Firefox Mobile do not always send `Sec-CH-UA-Mobile` headers (only Chromium/Android browsers send them consistently). Therefore, block if `Sec-CH-UA-Mobile` is *explicitly* `'?0'` (Desktop Chrome/Edge/Playwright), or if `Sec-CH-UA-Platform` is *explicitly* Windows/macOS/Linux, **do not fail if the header is simply absent on an iPhone!**
- Apply your engineering judgment: if any specific heuristic in the prompt would cause false-positive errors for legitimate mobile users or break our existing architecture, **adapt and refine that check** so it catches bots without hurting real mobile traffic.

### 4. ANTI-LAZINESS & ANTI-TRUNCATION MANDATE
- **Do NOT write placeholders** like `// ... existing code ...` or `// implement validation here`.
- **Do NOT leave old bypasses dormant in comments** or keep "Track B" as a silent fallback "just in case." Delete all legacy bypasses completely.
- **Do NOT break existing working features** such as Admin link saving, GitHub Split-Sync, or Upstash Redis fallback handling. Ensure that all environment variable names (`VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) match the exact variable names already used across our project.

### 5. ULTRA-FAST EXECUTION (<100ms FEEL)
Every check in Gates 1–3 must execute in pure memory in under `1ms`. Gate 4 (Redis) and Gate 5 (Turnstile `siteverify`) can run in parallel (`Promise.all`) after Gate 3 passes so that legitimate mobile users clicking `"Proceed"` experience an ultra-fast, seamless redirect on their very first tap.

### 6. SELF-VERIFICATION BEFORE FINISHING
After applying your changes, review every modified file line-by-line:
1. Verify that an AI browser bot running on AWS/GCP/Desktop Linux clicking `"Proceed"` is blocked at Gate 1 and Gate 3 with a disguised `404`.
2. Verify that a real human on an Android phone or iPhone tapping `"Proceed"` once passes Gates 1–5 cleanly and gets redirected immediately.
3. Run TypeScript/build checks (`npm run lint` / build verification) to guarantee zero syntax, type, or import errors.
