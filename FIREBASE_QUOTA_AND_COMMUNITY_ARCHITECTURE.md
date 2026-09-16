# 🛡️ RummyDex Master Architecture: Firebase Quota Shield & Community Review System

> **Source of Truth Document**: This document outlines the complete architectural blueprint designed to give RummyDex 100% uptime, zero latency, real-time community engagement, and **absolute immunity to Firebase Free-Tier and Pay-as-you-go Quota Exhaustion (`RESOURCE_EXHAUSTED` / HTTP 429)**.
>
> **Last Updated:** September 2026

---

## 📑 Table of Contents

1. [The Problem We Solved (Why Standard Firestore Crashes)](#1-the-problem-we-solved)
2. [The Dual-Firebase Air-Gap Separation](#2-the-dual-firebase-air-gap-separation)
3. [The 3-Tier Zero-Quota Persistence Engine](#3-the-3-tier-zero-quota-persistence-engine)
4. [Per-App Chunking & Math Aggregations (1 Read vs 1,000 Reads)](#4-per-app-chunking--math-aggregations)
5. [Public Website Architecture & Dynamic "Laser Loading"](#5-public-website-architecture--dynamic-laser-loading)
6. [Public Review Submission & Instant Sync Lifecycle](#6-public-review-submission--instant-sync-lifecycle)
7. [Admin Control Panel Architecture & Operations](#7-admin-control-panel-architecture--operations)
8. [Dual-Brain AI Review Studio Architecture](#8-dual-brain-ai-review-studio-architecture)
9. [Bot Filtering, Rate Limiting & SEO Crawler Shields](#9-bot-filtering-rate-limiting--seo-crawler-shields)
10. [Circuit Breaker & Disaster Recovery Engine](#10-circuit-breaker--disaster-recovery-engine)
11. [Complete File & Directory Reference](#11-complete-file--directory-reference)
12. [Golden Developer Rules (Never Break These)](#12-golden-developer-rules)

---

## 1. The Problem We Solved

### Why Standard Firestore Setups Fail Under Traffic
In naive Firebase setups:
- Every time a user visits an app page, the client queries `db.collection('reviews').where('appId', '==', id).get()`.
- If an app has 200 reviews and 1,000 visitors arrive per hour, that generates **200,000 Firestore reads per hour** (exceeding the daily Firebase free tier of 50,000 reads in under 15 minutes!).
- Calculating average rating on-the-fly forces a read of every single review in the database.
- Search engine bots (Googlebot, Bingbot, Ahrefs) crawling thousands of app URLs rapidly trigger `RESOURCE_EXHAUSTED` (HTTP 429), taking the entire website offline.

### How RummyDex Eliminates Quota Usage
1. **Air-gapped Databases**: User activity can never exhaust the main catalog database.
2. **Pre-Calculated Aggregation**: Star ratings and review totals are calculated incrementally on write. Getting stats consumes **zero extra document reads**.
3. **App-Level Chunking**: 50 reviews are packed into a single chunk document. 50 reviews = **1 read** instead of 50 reads.
4. **In-Memory + Disk Tier**: Reads are served in **0ms** from RAM with local disk backup (`community_local_backup.json`). If Firestore is offline or rate-limited, the website functions at 100% speed.
5. **Dynamic "Laser Loading"**: Only 5 reviews load initially. Additional reviews stream via an automated intersection sentinel as the user scrolls.

---

## 2. The Dual-Firebase Air-Gap Separation

We maintain two completely isolated Firebase projects that never share tokens, connections, or database instances:

```
                            ┌────────────────────────────────────────────────────────┐
                            │                    EXPRESS BACKEND                     │
                            │                      (server.ts)                       │
                            └───────────────┬────────────────────────┬───────────────┘
                                            │                        │
                    ┌───────────────────────┴──────┐   ┌─────────────┴────────────────────────┐
                    ▼                              ▼   ▼                                      ▼
     ┌──────────────────────────────┐                         ┌──────────────────────────────────────┐
     │  DATABASE A: MASTER CATALOG  │                         │   DATABASE B: COMMUNITY & REVIEWS    │
     ├──────────────────────────────┤                         ├──────────────────────────────────────┤
     │ Project ID:                  │                         │ Project ID:                          │
     │ ai-studio-yonostore-...      │                         │ rummydexcommunity                    │
     │                              │                         │                                      │
     │ Scope: ADMIN ONLY            │                         │ Scope: PUBLIC + ADMIN LIVE           │
     │                              │                         │                                      │
     │ Collections:                 │                         │ Collections:                         │
     │ - store_data (apps)          │                         │ - reviews (individual docs)          │
     │ - settings, news, videos     │                         │ - reports (abuse & flag queue)       │
     │ - quick_links, faqs          │                         │ - community_store (app chunks)       │
     │                              │                         │                                      │
     │ Protection:                  │                         │ Protection:                          │
     │ Public site NEVER queries    │                         │ 3-tier cache + debounced sync +      │
     │ this DB. Uses staticData.json│                         │ Turnstile anti-bot verification      │
     └──────────────────────────────┘                         └──────────────────────────────────────┘
```

### The Isolation Contract
- **Database A (Admin Catalog)**: Holds app specs, encrypted download links, and developer data. The public frontend **never makes Firestore calls to this project**, completely protecting its quota.
- **Database B (Community Reviews)**: Absorbs 100% of user interactions (star ratings, comments, helpful votes, content flags). Governed by `src/server/communityFirebaseAdmin.ts`.

---

## 3. The 3-Tier Zero-Quota Persistence Engine

Every read and write passes through a multi-tier resilience architecture:

```
 [User / Browser]
        │
        ▼ (HTTP REST API)
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TIER 1: FAST IN-MEMORY RAM STORE (0ms Latency, 0 Firestore Reads)       │
 │ - Map<id, ReviewRecord> reviews                                        │
 │ - Map<id, ReportRecord> reports                                        │
 │ - Map<appId, AppReviewChunkDocument> appChunkCache                     │
 └──────────────────┬─────────────────────────────────┬───────────────────┘
                    │ (Immediate synchronous write)   │ (Background debounced sync)
                    ▼                                 ▼
 ┌──────────────────────────────────────┐ ┌───────────────────────────────┐
 │ TIER 2: LOCAL DISK SNAPSHOT          │ │ TIER 3: LIVE FIRESTORE CLOUD  │
 │ file: community_local_backup.json    │ │ - Direct doc write to reviews │
 │ - Survives server restarts           │ │ - Batch chunk to              │
 │ - 0ms instant startup recovery       │ │   community_store             │
 │ - 100% uptime during cloud outages   │ │ - Rate-limit backoff handler  │
 └──────────────────────────────────────┘ └───────────────────────────────┘
```

### How the Tiers Work Together:
1. **Reads**: The backend serves reviews directly from RAM (Tier 1). No Firestore read operation is billed!
2. **Writes**:
   - The review is instantly injected into RAM (Tier 1) and saved to disk (Tier 2).
   - A direct asynchronous write is sent to Firestore (Tier 3) without blocking the user response.
   - The app's chunk document is recalculated and scheduled for sync via debounced batching.
3. **Server Startup**: `communityStoreService.ts` loads the latest snapshot from `community_local_backup.json` in milliseconds, then reconciles changes with Firestore in the background.

---

## 4. Per-App Chunking & Math Aggregations

### The Chunking Technique
Instead of reading 100 individual documents from the `reviews` collection, the server compiles all published reviews for an app into a single document in the `community_store` collection:

- **Document ID**: `app_reviews_${targetAppId}_0` (or slug equivalent)
- **Document Payload**:
  ```json
  {
    "appId": "spin-crush",
    "totalCount": 189,
    "stats": {
      "averageRating": 4.7,
      "totalReviews": 189,
      "starCounts": { "1": 4, "2": 2, "3": 11, "4": 42, "5": 130 }
    },
    "reviews": [ /* Up to 50 published reviews */ ],
    "updatedAt": "2026-09-13T10:15:00.000Z"
  }
  ```

### Key Mathematical Advantage:
- **Zero Query Aggregation**: The average rating and star breakdown bar are already calculated. The frontend displays the 5-star distribution chart instantly without fetching or looping through reviews.
- **50x Quota Reduction**: Reading 50 reviews costs **1 document read** instead of 50 document reads.

---

## 5. Public Website Architecture & Dynamic "Laser Loading"

### The User Flow on `AppDetails.tsx`:
1. **Immediate Header Stats**: The app page requests `/api/v1/public/community/reviews/:appId?limit=5`.
2. **Instant Delivery**: The server returns the pre-computed `stats` and the first **5 published reviews**.
3. **Automated "Laser Loading" (Intersection Observer)**:
   - A hidden sentinel `div` (`loadMoreSentinelRef`) sits beneath the review list.
   - When the user scrolls near the end of the 5 reviews, the observer automatically triggers `handleLoadMore()`.
   - The client fetches the next 5 reviews using `cursor=${nextCursor}`.
   - No huge payloads, zero network lag, and zero wasted data if the user doesn't scroll down.
4. **Organic Player Priority**:
   - AI-generated reviews are strictly unpinned (`isPinned: false`).
   - Genuine user reviews with real feedback appear at the very top of the list.
5. **Strict App ID Isolation**:
   - `spin-crush` only loads reviews belonging to `spin-crush`.
   - Empty or generic fallback reviews are banned from leaking across apps.

---

## 6. Public Review Submission & Instant Sync Lifecycle

```
[User clicks 'Submit Review' on AppDetails page]
   │
   ├─► 1. Frontend validation (Rating 1-5, Clean comment, Username)
   ├─► 2. Optimistic UI update (Appends to React review list & updates star bar immediately)
   │
   ▼
[POST /api/v1/public/community/reviews]
   │
   ├─► 3. Backend verifies Turnstile / Anti-Bot token
   ├─► 4. Sanitizes comment text (strips scripts, tags, profanities)
   ├─► 5. Assigns unique ID: `rev_${Date.now()}_${random}`
   ├─► 6. Injects into Tier 1 (RAM Map)
   ├─► 7. Appends to Tier 2 (`community_local_backup.json`)
   ├─► 8. Writes asynchronously to Firestore `reviews` collection
   ├─► 9. Triggers `syncAppChunksToFirestore(appId)` to update app chunk
   │
   ▼
[HTTP 200 JSON Response with normalized Review object]
   │
   └─► Dispatches window event `community-review-added` to synchronize all active widgets
```

---

## 7. Admin Control Panel Architecture & Operations

The Admin Dashboard provides full moderation without touching the master catalog database:

### A. Reviews Moderation Console (`AdminReviewsTab.tsx`)
- **API Endpoints**:
  - `GET /api/v1/admin/community/reviews`: Filter by status (`all`, `published`, `pending`, `rejected`), rating, app, or search keyword.
  - `PUT /api/v1/admin/community/reviews/:id`: Full edit capability (rating, user name, review text, status, helpful votes).
  - `PATCH /api/v1/admin/community/reviews/:id/status`: Toggle between Published and Rejected with 1 click.
  - `PATCH /api/v1/admin/community/reviews/:id/pin`: Pin high-value player reviews to the top.
  - `POST /api/v1/admin/community/reviews/:id/reply`: Add an official Developer / Admin response badge.
  - `POST /api/v1/admin/community/reviews/bulk`: Bulk publish, reject, pin, or delete reviews.

### B. User Reports & Abuse Center (`AdminReportsTab.tsx`)
- Users flag broken links, scams, or inappropriate comments via `ReportAppModal.tsx`.
- Reports are processed via `POST /api/v1/public/reports` and reviewed under `GET /api/v1/admin/reports`.
- Moderators can mark reports as `in_review`, `resolved`, or `dismissed` with internal audit notes.

---

## 8. Dual-Brain AI Review Studio Architecture

The **Admin AI Review Studio** (`AdminAIReviewStudioTab.tsx`) allows admins to populate apps with realistic player reviews using two dedicated Gemini models:

| Dimension | Brain 1: Deep Admin Dossier Engine | Brain 2: Live Market Intelligence Engine |
| :--- | :--- | :--- |
| **Model** | `gemini-2.5-pro` (1M+ context window) | `gemini-2.5-flash` / `gemini-2.0-flash` with Google Search |
| **Context** | Full internal dossier (HTML descriptions, FAQs, warnings, developer info, release notes) | Live internet search on real player sentiment, withdrawal speeds, and issues |
| **Perspective** | Highly nuanced, technically accurate feature verification | Authentic colloquial feedback from actual players across social media/forums |
| **Safety Mandate** | Generated reviews are saved with `source: 'ai_generated'` and **enforce `isPinned: false`** so organic player reviews always take precedence. |

---

## 9. Bot Filtering, Rate Limiting & SEO Crawler Shields

To prevent malicious bot scrapers and automated review spam from exhausting resources:

1. **Cloudflare Turnstile Verification**:
   - Every public review submission requires a valid Turnstile token. Automated headless requests are rejected before hitting the database.
2. **IP Rate Limiting**:
   - A single IP cannot submit more than 3 reviews per 10-minute window.
3. **SEO Crawler Bypass**:
   - Googlebot, Bingbot, and Ahrefs do not execute heavy client-side pagination queries.
   - The initial server pre-render (`seoHelper.ts`) includes meta schema aggregate ratings (`schema.org/AggregateRating`) directly in the HTML without requiring bots to make review API calls.

---

## 10. Circuit Breaker & Disaster Recovery Engine

If Google Cloud ever encounters network partition or triggers a rate limit:

1. **Circuit Breaker (`quotaExhaustedUntil`)**:
   - If Firestore returns code `8` (`RESOURCE_EXHAUSTED`) or HTTP `429`, the service sets a 15-minute circuit trip.
   - During this window, all read/write operations fall back seamlessly to Tier 1 (RAM) and Tier 2 (Disk).
   - The user experiences **zero downtime** and **zero error messages**.
2. **Background Reconciliation**:
   - When the circuit resets, buffered writes are flushed to Firestore in small batches to prevent re-triggering quota thresholds.

---

## 11. Complete File & Directory Reference

```
/
├── COMMUNITY_FIREBASE_README.md               # Quick-reference overview of community architecture
├── DUAL_DATABASE_RATING_SYSTEM.md             # Dual-database conceptual specification
├── FIREBASE_QUOTA_AND_COMMUNITY_ARCHITECTURE.md # (THIS FILE) Master structural blueprint
│
├── src/
│   ├── server/
│   │   ├── communityFirebaseAdmin.ts          # Dedicated SDK & REST connection to rummydexcommunity
│   │   ├── firebase.ts                        # Master catalog Firebase connection (Admin only)
│   │   ├── services/
│   │   │   ├── communityStoreService.ts       # 3-tier memory/disk/cloud storage & chunking engine
│   │   │   └── aiReviewGeneratorService.ts    # Dual-Brain AI Review Studio generator
│   │   └── routes/
│   │       ├── communityRoutes.ts             # Public and Admin review endpoints
│   │       └── reportRoutes.ts                # Public reporting and Admin moderation queue
│   │
│   ├── lib/
│   │   ├── communityFirebase.ts               # Public client REST requester & SWR cache
│   │   └── staticData.json                    # Master catalog fallback (protects Database A)
│   │
│   ├── hooks/
│   │   └── useReviews.ts                      # React hook for cursor pagination & laser loading
│   │
│   └── components/
│       ├── UserReviews.tsx                    # Main review container on app details page
│       ├── ReportAppModal.tsx                 # Zero-latency user flag & report modal
│       ├── public/
│       │   ├── ReviewForm.tsx                 # User review submission form
│       │   ├── ReviewItem.tsx                 # Individual review card with voting & report trigger
│       │   └── ReviewScoreSummary.tsx         # 5-star distribution bar and aggregate score
│       └── admin/
│           ├── AdminReviewsTab.tsx            # Complete reviews moderation dashboard
│           ├── AdminReportsTab.tsx            # Content flag & abuse moderation dashboard
│           └── AdminAIReviewStudioTab.tsx     # Dual-Brain review generation console
```

---

## 12. Golden Developer Rules (Never Break These)

> [!CRITICAL]
> **RULE 1: NEVER CONNECT PUBLIC CODE TO DATABASE A**
> The public website must NEVER query `ai-studio-yonostore-...`. It must only read from `staticData.json` and `rummydexcommunity`.
>
> **RULE 2: ALWAYS UNPIN AI REVIEWS**
> Any review generated by AI (`source: 'ai_generated'`) must strictly have `isPinned: false`. Pinned slots are exclusively reserved for verified human reviews or official editorial announcements.
>
> **RULE 3: NEVER CALCULATE RATINGS BY QUERYING ALL REVIEWS**
> Always use the pre-aggregated `stats` stored in the chunk document. Never loop through hundreds of reviews on page load.
>
> **RULE 4: NEVER REMOVE THE LOCAL DISK BACKUP**
> `community_local_backup.json` is the shield that keeps RummyDex online during network blips or Firebase maintenance. Never delete or bypass it.
>
> **RULE 5: MAINTAIN 5-REVIEW BATCHING**
> Always respect `limit=5` with cursor-based pagination. Never request the entire review collection at once.
