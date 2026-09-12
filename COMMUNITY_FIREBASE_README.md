# RUMMYDEX COMMUNITY FIREBASE: LIVE ARCHITECTURE & NO-STATIC-DATA POLICY

This document serves as the permanent specification and architectural reference for the **Rummydex Community Firebase** system.

---

## 1. Absolute "No Static Data" Policy

> ### 🛑 STRICT ENFORCEMENT
> - **Zero Static Fallback Datasets**: The community reviews, ratings, and reports architecture operates strictly on **LIVE** data. No hardcoded or pre-baked static mock JSON review datasets exist or are ever imported.
> - **Live Firestore Reads & Writes**: All user-submitted reviews, helpful votes, abuse flags/reports, moderator approvals, status changes, and administrator replies are read from and written to the live Firestore database in real-time.
> - **Dynamic In-Memory Caching (Zero-Downtime Guarantee)**: In-memory maps (`reviews`, `reports`, `appChunkCache`) and localStorage caches operate strictly as transient performance/latency accelerators and quota shields. They synchronize with live Firestore and do not replace live state.

---

## 2. Complete Dual-Database Separation (Zero Cross-Pollution)

RummyDex uses two completely distinct, isolated Firebase projects. They have separate credentials, separate service accounts, separate endpoints, and completely independent code files:

| Attribute | 1. Master Catalog Firebase (ADMIN ONLY) | 2. Community Firebase (PUBLIC + ADMIN LIVE) |
| :--- | :--- | :--- |
| **Project ID** | `ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a` | `rummydexcommunity` |
| **Database ID** | `(default)` | `(default)` |
| **Purpose** | App catalog entries, global settings, news, videos, FAQs, admin auth | Public player reviews, star ratings, helpful votes, content flags & reports |
| **Source File** | `src/server/firebase.ts` | `src/server/communityFirebaseAdmin.ts` |
| **Access Rule** | Admin Dashboard ONLY. Public website never queries this database directly to protect quota. | Live on BOTH Public Website and Admin Console. |

### Anti-Pollution & Decoupling Guarantees
- `src/server/communityFirebaseAdmin.ts` is the single source of truth for `rummydexcommunity`.
- No configuration, access tokens, or Admin SDK instances are shared between projects.
- Any attempt to query community paths (`reviews`, `reports`, `community_store`) is isolated from catalog paths (`store_data`, `settings`).

---

## 3. Dynamic Loading & High-Efficiency File Management

To guarantee minimal payload sizes, lightning-fast rendering, and complete immunity to Firebase free-tier quota exhaustion, the system uses an optimized dynamic loading model:

### A. One File/Document per App
- Reviews are segmented per app. Instead of scanning entire collections, the system queries either:
  1. Specifically for documents where `appId == targetAppId` (limit 5).
  2. The dedicated app bucket document in the `community_store` collection: `app_reviews_${targetAppId}_0`.
- Only the specific document for the currently viewed application is loaded. No other apps' review data is fetched or parsed.

### B. Exactly 5 Comments Per Batch (Dynamic Pagination)
- **Initial Load**: Only the first **5 published comments** for the active app are retrieved and rendered to the user.
- **Triggered Loading ("Load More")**: Additional batches of 5 comments are requested **only on user interaction** (clicking "Load More" or changing filter tabs).
- **Cursor-Based Traversal**: Pagination uses lightweight document cursor tokens (`nextCursor`) to fetch subsequent slices of 5 reviews without re-reading previous items.
- **Search Engine Bots (Crawlers)**: Search crawlers (Googlebot, Bingbot, etc.) skip heavy review query execution to ensure maximum SEO score and rapid time-to-first-byte (TTFB).

---

## 4. Multi-Tier Zero-Downtime Resilience Engine

Even during peak traffic or transient network hiccups, user experience remains completely seamless:

1. **Tier 1: Client SWR & Memory Cache (0ms)**
   - Instant cached review rendering while fresh data is queried in the background.
2. **Tier 2: Direct Community Firestore REST & Admin SDK**
   - High-throughput direct Firestore REST calls (`documents:runQuery` / `documents:batchGet`) with Admin SDK fallback.
3. **Tier 3: Local Resilient Persistence**
   - Writes are confirmed locally and buffered in the background to ensure no player review or report is ever lost during transient cloud connectivity drops.

---

## 5. Directory & File Reference

- `src/server/communityFirebaseAdmin.ts`: Dedicated backend initializer, configuration manager, Admin SDK, and REST communication suite for `rummydexcommunity`.
- `src/server/services/communityStoreService.ts`: Business logic layer managing review retrieval, app bucket document assembly, helpful voting, moderation status, and report queues.
- `src/server/routes/communityRoutes.ts`: Express API router handling `/api/v1/public/community/*` and `/api/v1/admin/community/*`.
- `src/server/routes/reportRoutes.ts`: Express API router handling zero-latency abuse flagging and report submissions.
- `src/lib/communityFirebase.ts`: Client-side Firestore REST client and instant SWR cache manager.
- `src/hooks/useReviews.ts`: React hook orchestrating dynamic 5-review pagination, sorting, voting, and report triggers.
