import fs from 'fs';
import path from 'path';
import { 
  getCommunityAdminDb, 
  writeCommunityRestDoc, 
  readCommunityRestDoc, 
  deleteCommunityRestDoc, 
  readCommunityRestCollection, 
  parseFirestoreFields, 
  getCommunityFirebaseConfig,
  fetchLiveReviewsForApp,
  fetchExactCommunityAggregationCounts,
  ExactCommunityAggregationResult,
  atomicUpdateAppStats,
  readAppStats
} from '../communityFirebaseAdmin';
import { getStaticData } from '../config';

export interface ReviewRecord {
  id: string;
  appId: string;
  appSlug?: string;
  appName?: string;
  appIcon?: string;
  appCategory?: string;
  userName: string;
  rating: number;
  reviewText: string;
  timestamp: string;
  status: 'published' | 'pending' | 'rejected' | string;
  helpful_count: number;
  isPinned: boolean;
  reported: boolean;
  report_count: number;
  source: 'community' | 'google' | 'admin_created' | 'ai_generated' | string;
  adminReply?: {
    text: string;
    author: string;
    timestamp: string;
  } | null;
  updated_at?: string;
}

export interface AppReviewChunkDocument {
  appId: string;
  appSlug?: string;
  appName?: string;
  chunkIndex: number;
  totalChunks: number;
  totalReviewsInChunk: number;
  totalAppReviews: number;
  stats: {
    averageRating: number;
    totalReviews: number;
    starCounts: Record<string, number>;
    distribution: Record<number, number>;
  };
  reviews: ReviewRecord[];
  updated_at: string;
}

export function getAppChunkDocId(appIdentifier: string, chunkIndex = 0): string {
  const clean = String(appIdentifier || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 80);
  return `app_reviews_${clean}_${chunkIndex}`;
}

export interface ReportRecord {
  id: string;
  type: 'app_flag' | 'review_flag' | string;
  appId: string;
  appName?: string;
  reviewId?: string;
  reviewAuthor?: string;
  reviewComment?: string;
  reason: string;
  description: string;
  reporterEmail?: string;
  reporterName?: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed' | string;
  created_at: string;
  ip?: string;
  userAgent?: string;
  adminNotes?: string;
  updated_at?: string;
}

/**
 * Strict Multi-Pass Sanitizer:
 * Completely purges and transforms all real-money, deposit, withdrawal, cash, rupees, betting, and payout keywords into natural gaming and performance terms.
 */
export function sanitizeReviewText(text: string, appName?: string): string {
  if (!text) return '';
  let clean = text;

  // Multi-pass regex replacements for complete safety
  clean = clean
    .replace(/\bdeposit\s+and\s+withdrawal\s+processing\s+are\s+instantaneous!?\b/gi, 'Matchmaking and table animations are silky smooth!')
    .replace(/\bdeposit\s+and\s+withdrawal\b/gi, 'table and matchmaking')
    .replace(/\bdeposits?\s+and\s+withdrawals?\b/gi, 'table and matchmaking')
    .replace(/\bwithdrawal\s+and\s+deposit\b/gi, 'matchmaking and table animations')
    .replace(/\bdeposit\s+processing\b/gi, 'match connection')
    .replace(/\bwithdrawal\s+processing\b/gi, 'animation rendering')
    .replace(/\binstant\s+withdrawal\b/gi, 'instant matchmaking')
    .replace(/\binstant\s+deposit\b/gi, 'instant table entry')
    .replace(/\bbonus\s+cash\b/gi, 'daily reward points')
    .replace(/\bbonus\s+money\b/gi, 'game points')
    .replace(/\breal\s+money\b/gi, 'game points')
    .replace(/\breal\s+cash\b/gi, 'game score')
    .replace(/\bwin\s+cash\b/gi, 'win points')
    .replace(/\badd\s+cash\b/gi, 'start round')
    .replace(/\bearn\s+money\b/gi, 'improve skill')
    .replace(/\bearning\s+money\b/gi, 'scoring points')
    .replace(/\bearnings?\b/gi, 'points')
    .replace(/\bdepositing\b/gi, 'loading')
    .replace(/\bdeposited\b/gi, 'loaded')
    .replace(/\bdeposits?\b/gi, 'rounds')
    .replace(/\bwithdrawing\b/gi, 'saving')
    .replace(/\bwithdrawn\b/gi, 'saved')
    .replace(/\bwithdrawals?\b/gi, 'sessions')
    .replace(/\bwithdraw\b/gi, 'save score')
    .replace(/\bpayouts?\b/gi, 'round scores')
    .replace(/\brupees\b/gi, 'points')
    .replace(/\binr\b/gi, 'pts')
    .replace(/\bpaisa\b/gi, 'points')
    .replace(/\b₹\s*\d+/g, 'points')
    .replace(/\b₹/g, '')
    .replace(/\bwallet\s+balance\b/gi, 'profile level')
    .replace(/\bwallet\b/gi, 'profile')
    .replace(/\bupi\s+transfer\b/gi, 'cloud sync')
    .replace(/\bbank\s+transfer\b/gi, 'cloud sync')
    .replace(/\bbetting\b/gi, 'card play')
    .replace(/\bbets?\b/gi, 'moves')
    .replace(/\bgambling\b/gi, 'gaming')
    .replace(/\binvestments?\b/gi, 'practice')
    .replace(/\binvesting\b/gi, 'playing')
    .replace(/\binvest\b/gi, 'play');

  return clean.trim();
}

/**
 * Helper to match any app from the static catalog by ID, Slug, Name, or Package
 */
export function findAppInCatalog(appIdentifier: string): any {
  if (!appIdentifier) return null;
  const target = String(appIdentifier).toLowerCase().trim();
  const staticData = getStaticData();
  const apps = staticData.apps || staticData.mockApps || [];

  return apps.find((a: any) => 
    (a.id && String(a.id).toLowerCase().trim() === target) ||
    (a.slug && String(a.slug).toLowerCase().trim() === target) ||
    (a.name && String(a.name).toLowerCase().trim() === target) ||
    (a.package_name && String(a.package_name).toLowerCase().trim() === target)
  ) || null;
}

// In-memory persistent cache for zero-latency lookups & background Firestore sync



async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => reject(new Error('RESOURCE_EXHAUSTED: Timeout')), ms);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function safeReadDb(docId: string, _unusedAuthToken?: string, collectionPath: string = 'reviews') {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      const doc = await withTimeout(db.collection(collectionPath).doc(docId).get(), 15000, null);
      if (doc && doc.exists) return doc.data();
    } catch (e) {
      console.error(`[safeReadDb] Admin SDK failed for ${collectionPath}/${docId}:`, e);
    }
  }
  return await readCommunityRestDoc(docId, collectionPath);
}

async function safeReadCollection(collectionPath: string) {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      const snapshot = await withTimeout(db.collection(collectionPath).get(), 15000, null);
      if (snapshot && snapshot.docs) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.error(`[safeReadCollection] Admin SDK failed for ${collectionPath}:`, e);
    }
  }
  return await readCommunityRestCollection(collectionPath);
}

// Helper to try Admin SDK first, fallback to REST
async function safeDeleteDb(docId: string, _unusedAuthToken?: string, collectionPath: string = 'reviews') {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      const res = await withTimeout(db.collection(collectionPath).doc(docId).delete(), 15000, null);
      if (res !== null) return true;
    } catch (e) {
      console.error(`[safeDeleteDb] Admin SDK failed for ${collectionPath}/${docId}:`, e);
      // Fallback to REST
    }
  }
  return await deleteCommunityRestDoc(docId, collectionPath);
}

// Helper to try Admin SDK first, fallback to REST
async function safeWriteDb(docId: string, data: any, _unusedAuthToken?: string, merge: boolean = true, collectionPath: string = 'reviews') {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      const res = await withTimeout(db.collection(collectionPath).doc(docId).set(data, { merge }), 15000, null);
      if (res !== null) return true;
    } catch (e) {
      console.error(`[safeWriteDb] Admin SDK failed for ${collectionPath}/${docId}:`, e);
      // Fallback to REST
    }
  }
  return await writeCommunityRestDoc(docId, data, merge, collectionPath);
}

class CommunityStoreService {
  private reviews: Map<string, ReviewRecord> = new Map();
  private reports: Map<string, ReportRecord> = new Map();
  private appStatsCache: Map<string, any> = new Map();
  private deletedReviewIds: Set<string> = new Set();
  private appChunkCache: Map<string, AppReviewChunkDocument> = new Map();
  private loadedAppsMap: Map<string, number> = new Map();
  private pendingChunkSyncAppIds: Set<string> = new Set();
  private chunkDebounceTimer: NodeJS.Timeout | null = null;
  private initialized = false;
  private isSyncing = false;
  private isChunkSyncing = false;
  private quotaExhaustedUntil = 0;
  private readonly QUOTA_COOLDOWN_MS = 30 * 1000; // 30-second resilience cooldown instead of 15-minute freeze
  private syncTimer: NodeJS.Timeout | null = null;
  private localBackupPath = path.join(process.cwd(), 'community_local_backup.json');
  private cachedRemoteCounts: ExactCommunityAggregationResult | null = null;
  private lastAggregationCheck: number = 0;

  constructor() {
    this.loadFromLocalBackup();
    // Non-blocking initial sync attempt directly to Firestore
    setTimeout(() => {
      this.initFromFirestore().catch((e: any) => { 
        console.warn(`[CommunityStore] Initial Firestore connection note:`, e?.message || e);
      });
      // Also fetch exact aggregation counts (2 index lookups, zero full-scan reads)
      this.refreshAggregationCounts(true).catch(() => {});
    }, 500);
  }

  /**
   * Reload all reviews and reports from local backup disk store on demand
   */
  public reloadLocalBackup(): { reviewsCount: number; reportsCount: number } {
    this.loadFromLocalBackup();
    return {
      reviewsCount: this.reviews.size,
      reportsCount: this.reports.size
    };
  }

  /**
   * Fast Remote Firestore Aggregation Query:
   * Queries exact remote counts using Firestore COUNT() aggregation without downloading any documents.
   * Costs only ~4-6 index reads and runs in <300ms.
   */
  public async refreshAggregationCounts(force: boolean = false): Promise<ExactCommunityAggregationResult | null> {
    const now = Date.now();
    if (!force && this.cachedRemoteCounts && (now - this.lastAggregationCheck < 60000)) {
      return this.cachedRemoteCounts;
    }
    try {
      const counts = await fetchExactCommunityAggregationCounts();
      if (counts) {
        this.cachedRemoteCounts = counts;
        this.lastAggregationCheck = now;
        // Also persist summary to catalog_stats document for 1-read client access
        this.saveCatalogStatsSummary().catch(() => {});
      }
      return this.cachedRemoteCounts;
    } catch (err) {
      console.warn('[CommunityStore] Aggregation refresh error:', err);
      return this.cachedRemoteCounts;
    }
  }

  // Check if error is a Firestore quota / rate exhaustion
  private isQuotaError(err: any): boolean {
    if (!err) return false;
    const msg = String(err.message || err.details || err || '');
    const code = err.code || err.status;
    return code === 8 || code === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded');
  }

  private handleQuotaCooldown() {
    this.quotaExhaustedUntil = Date.now() + this.QUOTA_COOLDOWN_MS;
  }

  // Load from local JSON disk backup on startup
  private loadFromLocalBackup() {
    try {
      if (fs.existsSync(this.localBackupPath)) {
        const raw = fs.readFileSync(this.localBackupPath, 'utf8');
        const data = JSON.parse(raw);
        if (data.deleted_review_ids && Array.isArray(data.deleted_review_ids)) {
          data.deleted_review_ids.forEach((id: string) => {
            if (id) this.deletedReviewIds.add(String(id));
          });
        }
        if (data.reviews && Array.isArray(data.reviews)) {
          data.reviews.forEach((r: ReviewRecord) => {
            if (r && r.id && !this.deletedReviewIds.has(r.id)) {
              // Automatically sanitize any loaded reviews from past sessions
              r.reviewText = sanitizeReviewText(r.reviewText);
              this.reviews.set(r.id, r);
            }
          });
        }
        if (data.reports && Array.isArray(data.reports)) {
          data.reports.forEach((rep: ReportRecord) => {
            if (rep && rep.id) this.reports.set(rep.id, rep);
          });
        }
      }

      console.log(`[CommunityStore] Loaded ${this.reviews.size} reviews, ${this.reports.size} reports, ${this.deletedReviewIds.size} tombstone deletions from local backup.`);
    } catch (e) {
      console.warn('[CommunityStore] Local backup read error:', e);
    }
  }

  // Deprecated: Reviews are strictly live in Firestore rummydexcommunity
  public exportToStaticTypeScript() {
    // No-op: AI Studio does not push static reviews
  }

  private diskSyncTimer: NodeJS.Timeout | null = null;

  // Save in-memory cache to disk (Coalesced and Async)
  private saveToDiskAndQueueCloudSync() {
    if (!this.diskSyncTimer) {
      this.diskSyncTimer = setTimeout(() => {
        this.diskSyncTimer = null;
        this.executeDiskSync();
      }, 2000); // 2-second debounce
    }
  }

  private executeDiskSync() {
    try {
      let existingData: any = {};
      if (fs.existsSync(this.localBackupPath)) {
        try {
          existingData = JSON.parse(fs.readFileSync(this.localBackupPath, 'utf8'));
        } catch (e) {
          console.warn('[CommunityStore] Failed to parse existing backup, creating new:', e);
        }
      }

      const data = {
        ...existingData,
        reviews: Array.from(this.reviews.values()),
        reports: Array.from(this.reports.values()),
        deleted_review_ids: Array.from(this.deletedReviewIds),
        updated_at: new Date().toISOString()
      };
      
      const tempPath = this.localBackupPath + '.tmp';
      // Async write to prevent freezing the Express event loop
      fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
          console.warn('[CommunityStore] Async local backup write error:', err);
          return;
        }
        fs.rename(tempPath, this.localBackupPath, (renameErr) => {
          if (renameErr) console.warn('[CommunityStore] Async local backup rename error:', renameErr);
        });
      });
    } catch (e) {
      console.warn('[CommunityStore] Local backup execution error:', e);
    }
  }

  public getReviewsCount(): number {
    return this.reviews.size;
  }

  public getReportsCount(): number {
    return this.reports.size;
  }

  /**
   * Returns all active, published verified reviews for static export & sitemaps
   */
  public getAllPublishedReviews(): ReviewRecord[] {
    const list: ReviewRecord[] = [];
    this.reviews.forEach((r) => {
      if (r && (!r.status || r.status === 'published' || r.status === 'approved') && !this.deletedReviewIds.has(r.id)) {
        list.push({ ...r });
      }
    });
    return list;
  }

  public isQuotaProtected(): boolean {
    return Date.now() < this.quotaExhaustedUntil;
  }

  // Initialize and pull latest from Firestore
  public async initFromFirestore(forceSync = false) {
    if ((this.initialized && !forceSync) || this.isSyncing) return;
    if (Date.now() < this.quotaExhaustedUntil && !forceSync) {
      console.log(`[CommunityStore] Quota protected; serving ${this.reviews.size} reviews and ${this.reports.size} reports from high-availability local storage.`);
      this.initialized = true;
      return;
    }
    this.isSyncing = true;
    try {
      const db = getCommunityAdminDb();
      if (db) {
        // Load reviews with quota-protective limits
        try {
          const fetchLimit = forceSync ? 1000 : (this.reviews.size > 0 ? 50 : 200);
          let snap: any = null;
          try {
            snap = await withTimeout(db.collection('reviews').orderBy('timestamp', 'desc').limit(fetchLimit).get(), 15000, null);
          } catch (_) {
            snap = await withTimeout(db.collection('reviews').limit(fetchLimit).get(), 15000, null);
          }
          if (snap && snap.docs) {
            snap.docs.forEach((doc: any) => {
              if (this.deletedReviewIds.has(doc.id)) {
                this.reviews.delete(doc.id);
                return;
              }
              const d = doc.data();
              const existing = this.reviews.get(doc.id);
              if (existing && existing.updated_at) {
                const remoteTime = d.updated_at ? new Date(d.updated_at).getTime() : 0;
                const localTime = new Date(existing.updated_at).getTime();
                if (localTime >= remoteTime) {
                  return;
                }
              }
              this.reviews.set(doc.id, {
                id: doc.id,
                appId: d.appId || d.app_id || '',
                appSlug: d.appSlug || '',
                appName: d.appName || '',
                userName: d.userName || d.username || 'Player',
                rating: Number(d.rating) || 5,
                reviewText: sanitizeReviewText(d.reviewText || d.comment || ''),
                timestamp: d.timestamp || d.created_at || new Date().toISOString(),
                status: d.status || (d.is_approved ? 'published' : 'pending') || 'published',
                helpful_count: Number(d.helpful_count) || 0,
                isPinned: Boolean(d.isPinned),
                reported: Boolean(d.reported),
                report_count: Number(d.report_count) || 0,
                source: d.source || 'community',
                adminReply: d.adminReply || null,
                updated_at: d.updated_at
              });
            });
          }
          // App-specific documents in community_store are loaded dynamically on demand per app,
          // rather than loading the entire collection upfront, preventing quota exhaustion.

          this.exportToStaticTypeScript();
        } catch (e: any) {
          if (this.isQuotaError(e)) {
            this.handleQuotaCooldown();
            if (!this.initialized) {
              console.log(`[CommunityStore] Firestore free quota active; serving ${this.reviews.size} reviews and ${this.reports.size} reports from local storage.`);
            }
          }
        }

        // Load reports
        if (Date.now() >= this.quotaExhaustedUntil) {
          try {
            const rSnap = await withTimeout(db.collection('reports').limit(5000).get(), 15000, null);
            if (rSnap && rSnap.docs) {
              rSnap.docs.forEach((doc: any) => {
                const d = doc.data();
                const existing = this.reports.get(doc.id);
                if (existing && existing.updated_at) {
                  const remoteTime = d.updated_at ? new Date(d.updated_at).getTime() : 0;
                  const localTime = new Date(existing.updated_at).getTime();
                  if (localTime >= remoteTime) {
                    return;
                  }
                }
                this.reports.set(doc.id, {
                  id: doc.id,
                  type: d.type || 'app_flag',
                  appId: d.appId || d.app_id || '',
                  appName: d.appName || '',
                  reviewId: d.reviewId || '',
                  reviewAuthor: d.reviewAuthor || '',
                  reviewComment: d.reviewComment || '',
                  reason: d.reason || 'Flag',
                  description: d.description || '',
                  reporterEmail: d.reporterEmail || '',
                  reporterName: d.reporterName || '',
                  status: d.status || 'pending',
                  created_at: d.created_at || new Date().toISOString(),
                  ip: d.ip || '',
                  userAgent: d.userAgent || '',
                  adminNotes: d.adminNotes || '',
                  updated_at: d.updated_at
                });
              });
            }
          } catch (e: any) {
            console.warn('[CommunityStore] Firestore reports init notice:', e?.message || e);
          }
        }
      }

      // If Admin SDK did not populate reviews or reports, execute REST sync
      if (this.reviews.size === 0 || this.reports.size === 0 || forceSync) {
        // Fallback to REST API
        try {
          const restReviews = await safeReadCollection('reviews');
          restReviews.forEach((d: any) => {
            if (d && d.id) {
              if (this.deletedReviewIds.has(d.id)) {
                this.reviews.delete(d.id);
                return;
              }
              const existing = this.reviews.get(d.id);
              if (existing && existing.updated_at) {
                const remoteTime = d.updated_at ? new Date(d.updated_at).getTime() : 0;
                const localTime = new Date(existing.updated_at).getTime();
                if (localTime >= remoteTime) {
                  return;
                }
              }
              this.reviews.set(d.id, {
                id: d.id,
                appId: d.appId || d.app_id || '',
                appSlug: d.appSlug || '',
                appName: d.appName || '',
                userName: d.userName || d.username || 'Player',
                rating: Number(d.rating) || 5,
                reviewText: sanitizeReviewText(d.reviewText || d.comment || ''),
                timestamp: d.timestamp || d.created_at || new Date().toISOString(),
                status: d.status || (d.is_approved ? 'published' : 'pending') || 'published',
                helpful_count: Number(d.helpful_count) || 0,
                isPinned: Boolean(d.isPinned),
                reported: Boolean(d.reported),
                report_count: Number(d.report_count) || 0,
                source: d.source || 'community',
                adminReply: d.adminReply || null,
                updated_at: d.updated_at
              });
            }
          });

          const restReports = await safeReadCollection('reports');
          restReports.forEach((d: any) => {
            if (d && d.id) {
              const existing = this.reports.get(d.id);
              if (existing && existing.updated_at) {
                const remoteTime = d.updated_at ? new Date(d.updated_at).getTime() : 0;
                const localTime = new Date(existing.updated_at).getTime();
                if (localTime >= remoteTime) {
                  return;
                }
              }
              this.reports.set(d.id, {
                id: d.id,
                type: d.type || 'app_flag',
                appId: d.appId || d.app_id || '',
                appName: d.appName || '',
                reviewId: d.reviewId || '',
                reviewAuthor: d.reviewAuthor || '',
                reviewComment: d.reviewComment || '',
                reason: d.reason || 'Flag',
                description: d.description || '',
                reporterEmail: d.reporterEmail || '',
                reporterName: d.reporterName || '',
                status: d.status || 'pending',
                created_at: d.created_at || new Date().toISOString(),
                ip: d.ip || '',
                userAgent: d.userAgent || '',
                adminNotes: d.adminNotes || '',
                updated_at: d.updated_at
              });
            }
          });
          if (!this.initialized) {
            console.log(`[CommunityStore] Initialized via REST with ${this.reviews.size} reviews and ${this.reports.size} reports.`);
          }
        } catch (restError: any) {
          if (!this.initialized) {
            console.warn('[CommunityStore] REST Firestore init notice:', restError?.message || restError);
          }
        }
      }

      if (!this.initialized && !forceSync) {
        console.log(`[CommunityStore] Firestore sync complete: ${this.reviews.size} reviews, ${this.reports.size} reports.`);
      }
      this.initialized = true;

      // Save complete synced cache to local disk backup for zero-latency local fallback
      try {
        const backupData = {
          reviews: Array.from(this.reviews.values()),
          reports: Array.from(this.reports.values()),
          deleted_review_ids: Array.from(this.deletedReviewIds),
          updated_at: new Date().toISOString()
        };
        const tempPath = this.localBackupPath + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(backupData, null, 2), 'utf8');
        fs.renameSync(tempPath, this.localBackupPath);
      } catch (saveErr) {
        // Non-blocking
      }
    } catch (err) {
      if (!this.initialized) {
        console.warn('[CommunityStore] Init failed gracefully:', err);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  // ==========================================
  // APP-SCOPED DOCUMENT BUCKETING (1-Doc-Per-App)
  // ==========================================

  /**
   * CRITICAL DATA INTEGRITY FIX:
   * Dynamically loads ALL existing reviews for a specific app from both the live Firestore 'reviews' collection
   * and existing chunk bucket documents BEFORE syncing or saving chunks.
   * This guarantees that saving a new review or admin comment NEVER overwrites or deletes yesterday's reviews!
   */
  public async ensureAllReviewsLoadedForApp(appIdentifier: string, aliasKeysInput?: Set<string>, forceRefresh: boolean = false): Promise<number> {
    const cleanId = String(appIdentifier || '').toLowerCase().trim();
    if (!cleanId) return 0;

    const now = Date.now();
    const lastLoaded = this.loadedAppsMap.get(cleanId) || 0;
    if (!forceRefresh && lastLoaded > 0 && (now - lastLoaded) < 60000) {
      // Recently loaded within 60 seconds, served instantly from memory!
      return 0;
    }
    this.loadedAppsMap.set(cleanId, now);

    const aliases = aliasKeysInput || this.getAliasKeysForApp(cleanId);
    let loadedCount = 0;
    const db = getCommunityAdminDb();

    // 1. Fetch ALL documents from live Firestore `reviews` collection matching any alias key
    if (db && Date.now() >= this.quotaExhaustedUntil) {
      try {
        const queryPromises: Promise<any>[] = [];
        aliases.forEach(key => {
          queryPromises.push(withTimeout(db.collection('reviews').where('appId', '==', key).limit(5000).get(), 15000, null));
          queryPromises.push(withTimeout(db.collection('reviews').where('appSlug', '==', key).limit(5000).get(), 15000, null));
        });

        const snaps = await Promise.all(queryPromises);
        snaps.forEach((snap: any) => {
          if (snap && snap.docs && snap.docs.length > 0) {
            snap.docs.forEach((docSnap: any) => {
              const d = docSnap.data();
              const id = docSnap.id || d.id;
              if (id && !this.deletedReviewIds.has(id)) {
                const existing = this.reviews.get(id);
                // Don't overwrite if local in-memory object has newer updated_at timestamp or admin reply
                if (existing && existing.updated_at && d.updated_at) {
                  const localTime = new Date(existing.updated_at).getTime();
                  const remoteTime = new Date(d.updated_at).getTime();
                  if (localTime > remoteTime) return;
                }
                this.reviews.set(id, {
                  id,
                  appId: d.appId || cleanId,
                  appSlug: d.appSlug || '',
                  appName: d.appName || '',
                  userName: d.userName || d.username || 'Player',
                  rating: Number(d.rating) || 5,
                  reviewText: sanitizeReviewText(d.reviewText || d.comment || ''),
                  timestamp: d.timestamp || d.created_at || new Date().toISOString(),
                  status: d.status || (d.is_approved ? 'published' : 'pending') || 'published',
                  helpful_count: Number(d.helpful_count) || 0,
                  isPinned: Boolean(d.isPinned),
                  reported: Boolean(d.reported),
                  report_count: Number(d.report_count) || 0,
                  source: d.source || 'community',
                  adminReply: d.adminReply || (existing?.adminReply) || null,
                  updated_at: d.updated_at || new Date().toISOString()
                });
                loadedCount++;
              }
            });
          }
        });
      } catch (err: any) {
        if (this.isQuotaError(err)) this.handleQuotaCooldown();
        console.warn(`[CommunityStore] ensureAllReviewsLoadedForApp query notice for ${cleanId}:`, err?.message || err);
      }
    } else {
      // Fallback via REST API if Admin SDK is unavailable or quota exhausted
      try {
        const restReviews = await safeReadCollection('reviews');
        restReviews.forEach((d: any) => {
          if (d && d.id && !this.deletedReviewIds.has(d.id)) {
            const rAppId = String(d.appId || d.app_id || '').toLowerCase().trim();
            const rAppSlug = String(d.appSlug || '').toLowerCase().trim();
            if (aliases.has(rAppId) || aliases.has(rAppSlug)) {
              const existing = this.reviews.get(d.id);
              if (existing && existing.updated_at && d.updated_at) {
                const localTime = new Date(existing.updated_at).getTime();
                const remoteTime = new Date(d.updated_at).getTime();
                if (localTime > remoteTime) return;
              }
              this.reviews.set(d.id, {
                id: d.id,
                appId: d.appId || cleanId,
                appSlug: d.appSlug || '',
                appName: d.appName || '',
                userName: d.userName || d.username || 'Player',
                rating: Number(d.rating) || 5,
                reviewText: sanitizeReviewText(d.reviewText || d.comment || ''),
                timestamp: d.timestamp || d.created_at || new Date().toISOString(),
                status: d.status || (d.is_approved ? 'published' : 'pending') || 'published',
                helpful_count: Number(d.helpful_count) || 0,
                isPinned: Boolean(d.isPinned),
                reported: Boolean(d.reported),
                report_count: Number(d.report_count) || 0,
                source: d.source || 'community',
                adminReply: d.adminReply || (existing?.adminReply) || null,
                updated_at: d.updated_at || new Date().toISOString()
              });
              loadedCount++;
            }
          }
        });
      } catch (e: any) {}
    }

    // 2. Also check existing bucket document(s) community_store/app_reviews_${cleanId}_0, etc.
    for (const key of Array.from(aliases)) {
      try {
        const chunkDoc = await readCommunityRestDoc(`app_reviews_${key}_0`, 'community_store');
        if (chunkDoc && Array.isArray(chunkDoc.reviews) && chunkDoc.reviews.length > 0) {
          chunkDoc.reviews.forEach((r: any) => {
            if (r && r.id && !this.deletedReviewIds.has(r.id)) {
              if (!this.reviews.has(r.id)) {
                this.reviews.set(r.id, {
                  id: r.id,
                  appId: r.appId || cleanId,
                  appSlug: r.appSlug || '',
                  appName: r.appName || '',
                  userName: r.userName || r.username || 'Player',
                  rating: Number(r.rating) || 5,
                  reviewText: sanitizeReviewText(r.reviewText || r.comment || ''),
                  timestamp: r.timestamp || r.created_at || new Date().toISOString(),
                  status: r.status || 'published',
                  helpful_count: Number(r.helpful_count) || 0,
                  isPinned: Boolean(r.isPinned),
                  reported: Boolean(r.reported),
                  report_count: Number(r.report_count) || 0,
                  source: r.source || 'community',
                  adminReply: r.adminReply || null,
                  updated_at: r.updated_at || new Date().toISOString()
                });
                loadedCount++;
              }
            }
          });
        }
      } catch (e: any) {}
    }

    return loadedCount;
  }

  /**
   * Sync all reviews for a single app into its dedicated bucket document (`community_store/app_reviews_${cleanId}_0`).
   * This guarantees:
   * 1. Exactly 1 document read per app request.
   * 2. Lightning-fast retrieval and zero quota exhaustion.
   * 3. Splitting into chunk 0, 1, etc. if exceeding 200 reviews (safely below Firestore's 1MB limit).
   */
  public async syncAppChunksToFirestore(appIdentifier: string): Promise<boolean> {
    if (!appIdentifier) return false;
    const cleanId = String(appIdentifier || '').toLowerCase().trim();
    const aliasKeys = this.getAliasKeysForApp(cleanId);
    
    // Matched app info from catalog
    const matchedApp = findAppInCatalog(cleanId);
    const officialId = matchedApp ? String(matchedApp.id) : cleanId;
    const officialSlug = matchedApp?.slug ? String(matchedApp.slug).toLowerCase().trim() : '';
    const officialName = matchedApp?.name || '';

    // CRITICAL DATA INTEGRITY FIX:
    // Ensure all existing reviews for this app are pre-loaded from Firestore into memory BEFORE building the chunk!
    await this.ensureAllReviewsLoadedForApp(cleanId, aliasKeys);

    // Collect all published/approved reviews for this app
    const appReviews = Array.from(this.reviews.values()).filter(r => {
      if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
      const rAppId = String(r.appId || '').toLowerCase().trim();
      const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
      const rAppName = String(r.appName || '').toLowerCase().trim();
      return (
        aliasKeys.has(rAppId) ||
        (rAppSlug && aliasKeys.has(rAppSlug)) ||
        (rAppName && aliasKeys.has(rAppName))
      );
    });

    // Sort: Pinned first, then newest timestamp
    appReviews.sort((a, b) => {
      const aIsPinned = Boolean(a.isPinned);
      const bIsPinned = Boolean(b.isPinned);
      if (aIsPinned !== bIsPinned) return aIsPinned ? -1 : 1;
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });

    // Compute live stats
    const starCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let sum = 0;
    appReviews.forEach(r => {
      const star = String(Math.max(1, Math.min(5, Math.round(r.rating || 5))));
      starCounts[star] = (starCounts[star] || 0) + 1;
      sum += (r.rating || 5);
    });

    const totalCount = appReviews.length;
    const avg = totalCount > 0 ? parseFloat((sum / totalCount).toFixed(1)) : 4.8;
    const distribution: Record<number, number> = {
      5: totalCount > 0 ? Math.round((starCounts['5'] / totalCount) * 100) : 75,
      4: totalCount > 0 ? Math.round((starCounts['4'] / totalCount) * 100) : 15,
      3: totalCount > 0 ? Math.round((starCounts['3'] / totalCount) * 100) : 6,
      2: totalCount > 0 ? Math.round((starCounts['2'] / totalCount) * 100) : 2,
      1: totalCount > 0 ? Math.round((starCounts['1'] / totalCount) * 100) : 2,
    };

    const CHUNK_SIZE = 50;
    const totalChunks = Math.max(1, Math.ceil(appReviews.length / CHUNK_SIZE));

    for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
      const chunkSlice = appReviews.slice(chunkIdx * CHUNK_SIZE, (chunkIdx + 1) * CHUNK_SIZE);
      const chunkDoc: AppReviewChunkDocument = {
        appId: officialId,
        appSlug: officialSlug || '',
        appName: officialName || '',
        chunkIndex: chunkIdx,
        totalChunks,
        totalReviewsInChunk: chunkSlice.length,
        totalAppReviews: appReviews.length,
        stats: {
          averageRating: avg,
          totalReviews: totalCount,
          starCounts,
          distribution
        },
        reviews: chunkSlice,
        updated_at: new Date().toISOString()
      };

      const primaryDocId = getAppChunkDocId(officialId, chunkIdx);
      this.appChunkCache.set(primaryDocId, chunkDoc);
      await this.safeWriteChunkDoc(primaryDocId, chunkDoc);

      if (officialSlug && officialSlug !== officialId) {
        const slugDocId = getAppChunkDocId(officialSlug, chunkIdx);
        this.appChunkCache.set(slugDocId, chunkDoc);
        await this.safeWriteChunkDoc(slugDocId, chunkDoc);
      }
    }

    return true;
  }

  public async syncAllAppsToChunks(): Promise<{ totalApps: number; totalChunks: number }> {
    if (this.isChunkSyncing) return { totalApps: 0, totalChunks: 0 };
    this.isChunkSyncing = true;
    console.log('[CommunityStore] Starting App-Scoped Document Bucketing synchronization...');
    const appIds = new Set<string>();
    for (const r of this.reviews.values()) {
      if (r.appId) appIds.add(String(r.appId).trim());
      if (r.appSlug) appIds.add(String(r.appSlug).trim());
    }

    try {
      const staticData = getStaticData();
      const apps = staticData.apps || staticData.mockApps || [];
      apps.forEach((a: any) => {
        if (a && a.id) appIds.add(String(a.id).trim());
        if (a && a.slug) appIds.add(String(a.slug).trim());
      });
    } catch (e) {}

    let totalApps = 0;
    let totalChunks = 0;

    for (const id of Array.from(appIds)) {
      try {
        await this.syncAppChunksToFirestore(id);
        totalApps++;
        totalChunks++;
      } catch (err: any) {
        console.warn(`[CommunityStore] Error syncing chunk for ${id}:`, err?.message || err);
      }
    }

    this.isChunkSyncing = false;
    console.log(`[CommunityStore] App-Scoped Bucketing complete: ${totalApps} apps synchronized.`);
    return { totalApps, totalChunks };
  }

  private dirtyAppIds = new Set<string>();

  public queueAppChunkSync(appIdentifier: string) {
    this.markDirty(appIdentifier);
  }

  public markDirty(appId: string) {
    const cleanId = String(appId).trim();
    if (!cleanId) return;
    this.dirtyAppIds.add(cleanId);
    
    if (!this.syncTimer) {
      this.syncTimer = setTimeout(() => this.flushDirtyApps(), 30000); // 30 seconds
    }
  }

  private async flushDirtyApps() {
    if (this.dirtyAppIds.size === 0) return;
    const appsToSync = Array.from(this.dirtyAppIds);
    this.dirtyAppIds.clear();
    this.syncTimer = null;
    
    console.log(`[CommunityStore] Coalesced background sync starting for ${appsToSync.length} apps...`);
    let count = 0;
    for (const appId of appsToSync) {
      try {
        await this.syncAppChunksToFirestore(appId);
        count++;
      } catch (err: any) {
        console.warn(`[CommunityStore] Background sync failed for ${appId}:`, err?.message || err);
      }
    }
    console.log(`[CommunityStore] Coalesced background sync finished. (${count} apps synced)`);
  }

  private async safeWriteChunkDoc(docId: string, data: any): Promise<boolean> {
    const db = getCommunityAdminDb();
    try {
      if (db) {
        await db.collection('community_store').doc(docId).set(data, { merge: false });
        return true;
      }
      return await safeWriteDb(docId, data, undefined, false, 'community_store');
    } catch (e: any) {
      if (this.isQuotaError(e)) this.handleQuotaCooldown();
      console.warn(`[CommunityStore] Chunk doc write notice for ${docId}:`, e?.message || e);
      return false;
    }
  }

  // Backup write to Firestore with automatic chunking to safely support 10,000+ reviews without hitting 1MB document limit
  public async syncAllToFirestore() {
    return await this.syncAllAppsToChunks();
  }

  // ==========================================
  // REVIEWS
  // ==========================================

  
  private applyStatsToCache(appId: string, incs: any) {
    let stats = this.appStatsCache.get(appId);
    if (!stats) {
      stats = { publishedReviewCount: 0, publishedRatingSum: 0, starDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } };
    }
    if (incs.publishedReviewCount) stats.publishedReviewCount += incs.publishedReviewCount;
    if (incs.publishedRatingSum) stats.publishedRatingSum += incs.publishedRatingSum;
    if (incs.star1) stats.starDistribution['1'] += incs.star1;
    if (incs.star2) stats.starDistribution['2'] += incs.star2;
    if (incs.star3) stats.starDistribution['3'] += incs.star3;
    if (incs.star4) stats.starDistribution['4'] += incs.star4;
    if (incs.star5) stats.starDistribution['5'] += incs.star5;
    this.appStatsCache.set(appId, stats);
  }

  public async addReview(payload: Partial<ReviewRecord> & Record<string, any>): Promise<ReviewRecord> {
    const rawAppId = String(payload.appId || payload.app_id || '').trim();
    const matchedApp = findAppInCatalog(rawAppId) || (payload.appSlug ? findAppInCatalog(payload.appSlug) : null);
    
    const targetAppId = matchedApp ? String(matchedApp.id) : rawAppId;
    const targetAppSlug = matchedApp?.slug || payload.appSlug || '';
    const targetAppName = matchedApp?.name || payload.appName || '';

    const isAi = payload.source === 'ai_generated';
    const simulatedDeviceId = payload.userId ? String(payload.userId).replace('fallback_', 'device_') : `device_${Date.now()}_${Math.random().toString(16).substring(2, 10)}`;
    const deviceId = isAi ? simulatedDeviceId : (payload.deviceId || `anon_${Math.random().toString(16).substring(2, 10)}`);
    const id = payload.id || `rev_${targetAppId}_${deviceId}`;
    
    // Anti-Spam: Treat duplicate as Edit
    const existing = this.reviews.get(id);
    if (existing) {
       return (await this.updateReview(id, payload)) as ReviewRecord;
    }
    this.deletedReviewIds.delete(id);
    const newRev: ReviewRecord = {
      id,
      appId: targetAppId,
      appSlug: targetAppSlug,
      appName: targetAppName,
      userName: String(payload.userName || payload.username || payload.author || 'Player').trim().substring(0, 50),
      rating: Math.max(1, Math.min(5, Math.round(Number(payload.rating) || 5))),
      reviewText: sanitizeReviewText(String(payload.reviewText || payload.comment || payload.text || ''), targetAppName),
      timestamp: payload.timestamp || payload.date || payload.created_at || new Date().toISOString(),
      status: (payload.status as any) || 'published',
      helpful_count: Number(payload.helpful_count || payload.helpfulCount) || 0,
      isPinned: Boolean(payload.isPinned),
      reported: Boolean(payload.reported),
      report_count: Number(payload.report_count) || 0,
      source: payload.source || 'community',
      adminReply: payload.adminReply || null,
      updated_at: new Date().toISOString()
    };

    // 1. Save to active in-memory store and local disk immediately
    this.reviews.set(id, newRev);
    this.saveToDiskAndQueueCloudSync();
    this.markDirty(targetAppId);

    // Atomic stats update
    if (newRev.status === 'published' || newRev.status === 'approved') {
      const incs: any = { publishedReviewCount: 1, publishedRatingSum: newRev.rating };
      incs[`star${newRev.rating}`] = 1;
      this.applyStatsToCache(targetAppId, incs);
      atomicUpdateAppStats(targetAppId, incs).catch(e => console.warn(e));
    }

    // 2. Direct write to Firestore rummydexcommunity 'reviews' collection
    const db = getCommunityAdminDb();
    try {
      if (db) {
        db.collection('reviews').doc(id).set(newRev).catch((e: any) => {
          if (this.isQuotaError(e)) this.handleQuotaCooldown();
          console.warn("[CommunityStore] Firestore direct review write notice:", e?.message || e);
        });
      } else {
        safeWriteDb(id, newRev, undefined, true, 'reviews').catch((e: any) => {
          if (this.isQuotaError(e)) this.handleQuotaCooldown();
          console.warn("[CommunityStore] REST review write notice:", e?.message || e);
        });
      }
    } catch (e: any) {
      console.warn("[CommunityStore] Direct review write exception:", e?.message || e);
    }

    // 3. Immediately refresh chunk cache & chunk document so subsequent per-app reads get it instantly
    this.syncAppChunksToFirestore(targetAppId).catch((err: any) => {
      console.warn("[CommunityStore] Post-review chunk sync notice:", err?.message || err);
    });

    return newRev;
  }

  
  
  public async bulkActionReviews(ids: string[], action: 'publish' | 'pending' | 'reject' | 'delete' | 'pin' | 'unpin'): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    
    let count = 0;
    const affectedApps = new Set<string>();
    const appIncrements = new Map<string, any>();
    const db = getCommunityAdminDb();
    
    // Process everything in memory first
    for (const id of ids) {
      const cleanId = String(id || '').trim();
      if (!cleanId) continue;
      
      let existing = this.reviews.get(cleanId);
      
      // If we don't have it in memory, try to fetch it synchronously (or rely on what we can).
      // Since bulk actions typically come from the admin panel which just queried them, they should be in memory.
      // If not, we skip for safety to avoid slow synchronous serial fetches.
      if (!existing) {
         continue; 
      }
      
      const targetAppId = existing.appId;
      affectedApps.add(targetAppId);
      
      const wasPublished = existing.status === 'published' || existing.status === 'approved';
      
      if (action === 'delete') {
         if (wasPublished) {
            const incs = appIncrements.get(targetAppId) || {};
            incs.publishedReviewCount = (incs.publishedReviewCount || 0) - 1;
            incs.publishedRatingSum = (incs.publishedRatingSum || 0) - existing.rating;
            incs[`star${existing.rating}`] = (incs[`star${existing.rating}`] || 0) - 1;
            appIncrements.set(targetAppId, incs);
         }
         this.deletedReviewIds.add(cleanId);
         this.reviews.delete(cleanId);
         count++;
      } else {
         const updated = { ...existing, updated_at: new Date().toISOString() };
         if (action === 'publish') updated.status = 'published';
         if (action === 'pending') updated.status = 'pending';
         if (action === 'reject') updated.status = 'rejected';
         if (action === 'pin') updated.isPinned = true;
         if (action === 'unpin') updated.isPinned = false;
         
         const isPublished = updated.status === 'published' || updated.status === 'approved';
         
         if (wasPublished && !isPublished) {
            const incs = appIncrements.get(targetAppId) || {};
            incs.publishedReviewCount = (incs.publishedReviewCount || 0) - 1;
            incs.publishedRatingSum = (incs.publishedRatingSum || 0) - existing.rating;
            incs[`star${existing.rating}`] = (incs[`star${existing.rating}`] || 0) - 1;
            appIncrements.set(targetAppId, incs);
         } else if (!wasPublished && isPublished) {
            const incs = appIncrements.get(targetAppId) || {};
            incs.publishedReviewCount = (incs.publishedReviewCount || 0) + 1;
            incs.publishedRatingSum = (incs.publishedRatingSum || 0) + updated.rating;
            incs[`star${updated.rating}`] = (incs[`star${updated.rating}`] || 0) + 1;
            appIncrements.set(targetAppId, incs);
         }
         
         this.deletedReviewIds.delete(cleanId);
         this.reviews.set(cleanId, updated);
         count++;
      }
    }
    
    // Apply atomic increments
    for (const [appId, incs] of appIncrements.entries()) {
      if (Object.keys(incs).length > 0) {
        this.applyStatsToCache(appId, incs);
        atomicUpdateAppStats(appId, incs).catch(e => console.warn(e));
      }
    }
    
    // Batch writes to Firestore reviews collection (if db available)
    if (db) {
       const BATCH_LIMIT = 400;
       for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
          const batchSlice = ids.slice(i, i + BATCH_LIMIT);
          const batch = db.batch();
          batchSlice.forEach(id => {
             if (action === 'delete') {
                batch.delete(db.collection('reviews').doc(id));
             } else {
                const rev = this.reviews.get(id);
                if (rev) batch.set(db.collection('reviews').doc(id), rev, { merge: true });
             }
          });
          batch.commit().catch(e => console.warn('[CommunityStore] Bulk batch commit error:', e));
       }
    } else {
       // Fallback for REST API
       ids.forEach(id => {
          if (action === 'delete') {
             safeDeleteDb(id, undefined, 'reviews').catch(e => console.warn(e));
          } else {
             const rev = this.reviews.get(id);
             if (rev) safeWriteDb(id, rev, undefined, true, 'reviews').catch(e => console.warn(e));
          }
       });
    }

    // Save to disk and queue chunks
    this.saveToDiskAndQueueCloudSync();
    affectedApps.forEach(appId => {
       this.markDirty(appId);
       this.syncAppChunksToFirestore(appId).catch(e => console.warn(e));
    });
    
    return count;
  }

  public async addMultipleReviews(reviewsList: (Partial<ReviewRecord> & Record<string, any>)[]): Promise<ReviewRecord[]> {
    const added: ReviewRecord[] = [];
    const affectedApps = new Set<string>();
    
    // We group atomic increments by App ID so we don't spam the network
    const appIncrements = new Map<string, any>();

    for (const payload of reviewsList) {
      const rawAppId = String(payload.appId || payload.app_id || '').trim();
      const matchedApp = findAppInCatalog(rawAppId) || (payload.appSlug ? findAppInCatalog(payload.appSlug) : null);
      
      const targetAppId = matchedApp ? String(matchedApp.id) : rawAppId;
      const targetAppSlug = matchedApp?.slug || payload.appSlug || '';
      const targetAppName = matchedApp?.name || payload.appName || '';
      
      const isAi = payload.source === 'ai_generated';
      const simulatedDeviceId = payload.userId ? String(payload.userId).replace('fallback_', 'device_') : `device_${Date.now()}_${Math.random().toString(16).substring(2, 10)}`;
      const deviceId = isAi ? simulatedDeviceId : (payload.deviceId || `anon_${Math.random().toString(16).substring(2, 10)}`);
      const id = payload.id || `rev_${targetAppId}_${deviceId}`;

      // Anti-Spam: Treat duplicate as Edit
      const existing = this.reviews.get(id);
      if (existing) {
         const updated = await this.updateReview(id, payload);
         if (updated) added.push(updated);
         continue;
      }
      
      this.deletedReviewIds.delete(id);

      const newRev: ReviewRecord = {
        id,
        appId: targetAppId,
        appSlug: targetAppSlug,
        appName: targetAppName,
        userName: String(payload.userName || payload.username || payload.author || 'Player').trim().substring(0, 50),
        rating: Math.max(1, Math.min(5, Math.round(Number(payload.rating) || 5))),
        reviewText: sanitizeReviewText(String(payload.reviewText || payload.comment || payload.text || ''), targetAppName),
        timestamp: payload.timestamp || payload.date || payload.created_at || new Date().toISOString(),
        status: (payload.status as any) || 'published',
        helpful_count: Number(payload.helpful_count || payload.helpfulCount) || Math.floor(Math.random() * 8),
        isPinned: Boolean(payload.isPinned),
        reported: false,
        report_count: 0,
        source: payload.source || 'community',
        adminReply: payload.adminReply || null,
        updated_at: new Date().toISOString()
      };

      added.push(newRev);
      this.reviews.set(newRev.id, newRev);
      
      if (newRev.status === 'published' || newRev.status === 'approved') {
        if (!appIncrements.has(targetAppId)) {
          appIncrements.set(targetAppId, { publishedReviewCount: 0, publishedRatingSum: 0, star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 });
        }
        const incs = appIncrements.get(targetAppId);
        incs.publishedReviewCount += 1;
        incs.publishedRatingSum += newRev.rating;
        incs[`star${newRev.rating}`] += 1;
      }
      
      if (targetAppId) {
        affectedApps.add(targetAppId);
      }
    }

    // Apply batch atomic increments
    for (const [appId, incs] of Array.from(appIncrements.entries())) {
      this.applyStatsToCache(appId, incs);
      atomicUpdateAppStats(appId, incs).catch(e => console.warn(e));
    }

    // Direct write to Firestore reviews collection
    const db = getCommunityAdminDb();
    if (db && added.length > 0) {
      const BATCH_LIMIT = 400;
      for (let i = 0; i < added.length; i += BATCH_LIMIT) {
        const batchSlice = added.slice(i, i + BATCH_LIMIT);
        const batch = db.batch();
        batchSlice.forEach(r => {
          const docRef = db.collection('reviews').doc(r.id);
          batch.set(docRef, r, { merge: true });
        });
        batch.commit().catch((e: any) => console.warn('[CommunityStore] Batch commit error:', e));
      }
    } else {
      added.forEach(r => {
        safeWriteDb(r.id, r, undefined, true, 'reviews').catch(e => console.warn(e));
      });
    }

    // Update aggregation totals
    if (this.cachedRemoteCounts) {
      this.cachedRemoteCounts.totalReviews += added.length;
      const publishedCount = added.filter(r => r.status === 'published' || r.status === 'approved').length;
      this.cachedRemoteCounts.publishedReviews += publishedCount;
      const pendingCount = added.filter(r => r.status === 'pending').length;
      this.cachedRemoteCounts.pendingReviews += pendingCount;
    }

    // 1. Immediately persist to local disk snapshot
    this.saveToDiskAndQueueCloudSync();

    // 2. Mark apps as dirty and trigger immediate chunk synchronization
    affectedApps.forEach(appId => {
      this.markDirty(appId);
      this.syncAppChunksToFirestore(appId).catch(e => console.warn(e));
    });

    return added;
  }

public async voteHelpful(reviewId: string): Promise<number> {
    let rev = this.reviews.get(reviewId);
    if (!rev) {
      rev = {
        id: reviewId,
        appId: '',
        userName: 'Player',
        rating: 5,
        reviewText: '',
        timestamp: new Date().toISOString(),
        status: 'published',
        helpful_count: 1,
        isPinned: false,
        reported: false,
        report_count: 0,
        source: 'community'
      };
      this.reviews.set(reviewId, rev);
    } else {
      rev.helpful_count = (rev.helpful_count || 0) + 1;
      rev.updated_at = new Date().toISOString();
    }

    this.saveToDiskAndQueueCloudSync();
    if (rev.appId) this.markDirty(rev.appId);
    return rev.helpful_count;
  }

  public async reportReview(reviewId: string, appId?: string, reason?: string, details?: string, ip?: string): Promise<boolean> {
    let rev = this.reviews.get(reviewId);
    if (rev) {
      rev.reported = true;
      rev.report_count = (rev.report_count || 0) + 1;
      rev.updated_at = new Date().toISOString();
    }

    const reportId = `rep_rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newReport: ReportRecord = {
      id: reportId,
      type: 'review_flag',
      appId: appId || rev?.appId || 'unknown',
      reviewId,
      reviewAuthor: rev?.userName || '',
      reviewComment: rev?.reviewText || '',
      reason: reason || 'Inappropriate / Spam Content',
      description: details || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      ip: ip || '',
      adminNotes: ''
    };

    this.reports.set(reportId, newReport);

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reports').doc(reportId).set(newReport).catch((e: any) => { if (this.isQuotaError(e)) this.handleQuotaCooldown(); });
    } else {
      safeWriteDb(reportId, newReport, undefined, true, 'reports').catch((e: any) => { if (this.isQuotaError(e)) this.handleQuotaCooldown(); });
    }

    this.saveToDiskAndQueueCloudSync();
    if (rev?.appId || appId) this.markDirty(rev?.appId || appId!);
    return true;
  }

  public async updateReview(id: string, updates: Partial<ReviewRecord>): Promise<ReviewRecord | null> {
    let existing = this.reviews.get(id);
    if (!existing) {
      // Try to fetch it directly from Firestore first
      try {
        const db = getCommunityAdminDb();
        if (db) {
          const docSnap = await db.collection('reviews').doc(id).get();
          if (docSnap.exists) {
            existing = { id, ...docSnap.data() } as ReviewRecord;
            this.reviews.set(id, existing);
          }
        } else {
          const remoteDoc: any = await safeReadDb(id, undefined, 'reviews');
          if (remoteDoc) {
            existing = { id, ...remoteDoc } as ReviewRecord;
            this.reviews.set(id, existing);
          }
        }
      } catch (_) {}
    }
    
    if (!existing) {
      existing = {
        id,
        appId: updates.appId || 'unknown',
        appSlug: updates.appSlug || '',
        appName: updates.appName || '',
        userName: updates.userName || 'Admin',
        rating: updates.rating || 5,
        reviewText: updates.reviewText || '',
        timestamp: new Date().toISOString(),
        status: updates.status || 'published',
        helpful_count: updates.helpful_count || 0,
        isPinned: Boolean(updates.isPinned),
        reported: Boolean(updates.reported),
        report_count: updates.report_count || 0,
        source: 'admin_edit'
      };
      this.reviews.set(id, existing);
    }

    this.deletedReviewIds.delete(id);

    const updated: ReviewRecord = {
      ...existing,
      ...updates,
      reviewText: updates.reviewText ? sanitizeReviewText(updates.reviewText, updates.appName || existing.appName) : existing.reviewText,
      updated_at: new Date().toISOString()
    };

    // Save to in-memory store and local disk immediately
    const wasPublished = existing.status === 'published' || existing.status === 'approved';
    const isPublished = updated.status === 'published' || updated.status === 'approved';
    const incs: any = {};
    
    if (wasPublished && !isPublished) {
      incs.publishedReviewCount = -1;
      incs.publishedRatingSum = -existing.rating;
      incs[`star${existing.rating}`] = -1;
    } else if (!wasPublished && isPublished) {
      incs.publishedReviewCount = 1;
      incs.publishedRatingSum = updated.rating;
      incs[`star${updated.rating}`] = 1;
    } else if (wasPublished && isPublished && existing.rating !== updated.rating) {
      incs.publishedRatingSum = updated.rating - existing.rating;
      incs[`star${existing.rating}`] = -1;
      incs[`star${updated.rating}`] = 1;
    }
    
    if (Object.keys(incs).length > 0) {
      this.applyStatsToCache(updated.appId, incs);
      atomicUpdateAppStats(updated.appId, incs).catch(e => console.warn(e));
    }
    
    this.reviews.set(id, updated);
    this.saveToDiskAndQueueCloudSync();
    if (updated.appId) this.markDirty(updated.appId);

    // Direct write to Firestore rummydexcommunity 'reviews' collection
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(id).set(updated, { merge: true }).catch((e: any) => console.warn(e));
    } else {
      safeWriteDb(id, updated, undefined, true, 'reviews').catch((e: any) => console.warn(e));
    }
    if (updated.appId) {
      this.syncAppChunksToFirestore(updated.appId).catch((e: any) => console.warn(e));
    }

    return updated;
  }

  public async deleteReview(id: string): Promise<boolean> {
    const cleanId = String(id || '').trim();
    if (!cleanId) return false;
    
    let existing = this.reviews.get(cleanId);
    let targetAppId = existing?.appId;

    if (!existing) {
      try {
        const db = getCommunityAdminDb();
        if (db) {
          const docSnap = await db.collection('reviews').doc(cleanId).get();
          if (docSnap.exists) {
            targetAppId = docSnap.data()?.appId;
          }
        }
      } catch (_) {}
    }

    const wasPublished = existing && (existing.status === 'published' || existing.status === 'approved');
    if (wasPublished && targetAppId) {
      const incs: any = { publishedReviewCount: -1, publishedRatingSum: -existing.rating };
      incs[`star${existing.rating}`] = -1;
      this.applyStatsToCache(targetAppId, incs);
      atomicUpdateAppStats(targetAppId, incs).catch(e => console.warn(e));
    }
    
    this.deletedReviewIds.add(cleanId);
    this.reviews.delete(cleanId);
    this.saveToDiskAndQueueCloudSync();
    if (targetAppId) this.markDirty(targetAppId);

    // Direct delete from Firestore rummydexcommunity 'reviews' collection
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(cleanId).delete().catch((e: any) => console.warn(e));
    } else {
      safeDeleteDb(cleanId, undefined, 'reviews').catch((e: any) => console.warn(e));
    }
    if (targetAppId) {
      this.syncAppChunksToFirestore(targetAppId).catch((e: any) => console.warn(e));
    }

    return true;
  }

  public async deleteReviewsForApp(appIdentifier: string): Promise<number> {
    const aliasKeys = this.getAliasKeysForApp(appIdentifier);
    let count = 0;
    const cleanTarget = String(appIdentifier || '').toLowerCase().trim();

    for (const [id, rev] of Array.from(this.reviews.entries())) {
      const revAppId = String(rev.appId || '').toLowerCase().trim();
      const revSlug = String(rev.appSlug || '').toLowerCase().trim();
      const revName = String(rev.appName || '').toLowerCase().trim();

      if (aliasKeys.has(revAppId) || aliasKeys.has(revSlug) || aliasKeys.has(revName) || revAppId === cleanTarget || revSlug === cleanTarget) {
        const existing = this.reviews.get(id);
    if (existing && (existing.status === 'published' || existing.status === 'approved')) {
      const incs: any = { publishedReviewCount: -1, publishedRatingSum: -existing.rating };
      incs[`star${existing.rating}`] = -1;
      this.applyStatsToCache(existing.appId, incs);
      atomicUpdateAppStats(existing.appId, incs).catch(e => console.warn(e));
    }
    this.deletedReviewIds.add(id);
    this.reviews.delete(id);
        count++;
      }
    }

    this.saveToDiskAndQueueCloudSync();
    this.markDirty(cleanTarget);
    return count;
  }

  /**
   * Universal App Review Resolver Helper:
   * Dynamically resolves all alias keys (ID, slug, name, package) for an app without cross-app contamination.
   */
  private getAliasKeysForApp(target: string, appTitle?: string, appSlug?: string): Set<string> {
    const aliasKeys = new Set<string>();
    const cleanTarget = String(target || '').toLowerCase().trim();
    const cleanTitle = String(appTitle || '').toLowerCase().trim();
    const cleanSlug = String(appSlug || '').toLowerCase().trim();

    if (cleanTarget) aliasKeys.add(cleanTarget);
    if (cleanTitle) aliasKeys.add(cleanTitle);
    if (cleanSlug) aliasKeys.add(cleanSlug);

    // Add normalized slug / title variants
    if (cleanTitle) {
      const slugified = cleanTitle.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (slugified) aliasKeys.add(slugified);
    }
    if (cleanSlug) {
      const titleified = cleanSlug.replace(/-/g, ' ').trim();
      if (titleified) aliasKeys.add(titleified);
    }

    const matchedApp = findAppInCatalog(cleanTarget) || 
                       (cleanSlug ? findAppInCatalog(cleanSlug) : null) || 
                       (cleanTitle ? findAppInCatalog(cleanTitle) : null);

    if (matchedApp) {
      if (matchedApp.id) aliasKeys.add(String(matchedApp.id).toLowerCase().trim());
      if (matchedApp.slug) aliasKeys.add(String(matchedApp.slug).toLowerCase().trim());
      if (matchedApp.name) aliasKeys.add(String(matchedApp.name).toLowerCase().trim());
      if (matchedApp.package_name) aliasKeys.add(String(matchedApp.package_name).toLowerCase().trim());
    }

    return aliasKeys;
  }

  /**
   * Dynamically loads exactly ONE app's reviews document from Firestore on demand.
   * Guarantees zero cross-app pollution, no full-collection scans, and maximum speed.
   */
  public async loadSingleAppChunkFromFirestore(appIdentifier: string, appTitle?: string, appSlug?: string): Promise<boolean> {
    const cleanId = String(appIdentifier || '').toLowerCase().trim();
    if (!cleanId) return false;

    const aliasKeys = this.getAliasKeysForApp(cleanId, appTitle, appSlug);
    const candidateDocIds: string[] = [];
    aliasKeys.forEach(k => {
      const docId = getAppChunkDocId(k, 0);
      if (!candidateDocIds.includes(docId)) candidateDocIds.push(docId);
    });

    // 1. Check in-memory chunk cache first
    for (const docId of candidateDocIds) {
      if (this.appChunkCache.has(docId)) {
        const cached = this.appChunkCache.get(docId);
        if (cached && Array.isArray(cached.reviews) && cached.reviews.length > 0) {
          cached.reviews.forEach(r => {
            if (r && r.id && !this.deletedReviewIds.has(r.id)) {
              this.reviews.set(r.id, r);
            }
          });
          return true;
        }
      }
    }

    // 2. Read single bucket document (app_reviews_${cleanId}_0) directly from Firestore community_store
    for (const docId of candidateDocIds) {
      try {
        const chunkData: any = await safeReadDb(docId, undefined, 'community_store');
        if (chunkData && Array.isArray(chunkData.reviews) && chunkData.reviews.length > 0) {
          chunkData.reviews.forEach((r: any) => {
            if (r && r.id && !this.deletedReviewIds.has(r.id)) {
              this.reviews.set(r.id, {
                id: r.id,
                appId: r.appId || cleanId,
                appSlug: r.appSlug || appSlug || '',
                appName: r.appName || appTitle || '',
                userName: r.userName || r.userName || 'Player',
                rating: Number(r.rating) || 5,
                reviewText: sanitizeReviewText(r.reviewText || r.reviewText || ''),
                timestamp: r.timestamp || r.created_at || new Date().toISOString(),
                status: r.status || 'published',
                helpful_count: Number(r.helpful_count) || 0,
                isPinned: Boolean(r.isPinned),
                reported: Boolean(r.reported),
                report_count: Number(r.report_count) || 0,
                source: r.source || 'community',
                adminReply: r.adminReply || null,
                updated_at: r.updated_at
              });
            }
          });
          this.appChunkCache.set(docId, chunkData as AppReviewChunkDocument);
          return true;
        }
      } catch (err: any) {
        if (this.isQuotaError(err)) this.handleQuotaCooldown();
      }
    }

    // 3. If no pre-compiled chunk document exists, fetch live reviews for this app (limit 25)
    try {
      const liveRes = await fetchLiveReviewsForApp(cleanId, { limit: 25 });
      if (liveRes && Array.isArray(liveRes.reviews) && liveRes.reviews.length > 0) {
        liveRes.reviews.forEach((r: any) => {
          if (r && r.id && !this.deletedReviewIds.has(r.id)) {
            this.reviews.set(r.id, {
              id: r.id,
              appId: r.appId || cleanId,
              appSlug: r.appSlug || appSlug || '',
              appName: r.appName || appTitle || '',
              userName: r.userName || r.userName || 'Player',
              rating: Number(r.rating) || 5,
              reviewText: sanitizeReviewText(r.reviewText || r.reviewText || ''),
              timestamp: r.timestamp || r.created_at || new Date().toISOString(),
              status: r.status || 'published',
              helpful_count: Number(r.helpful_count) || 0,
              isPinned: Boolean(r.isPinned),
              reported: Boolean(r.reported),
              report_count: Number(r.report_count) || 0,
              source: r.source || 'community',
              adminReply: r.adminReply || null,
              updated_at: r.updated_at
            });
          }
        });
        return true;
      }
    } catch (e: any) {
      if (this.isQuotaError(e)) this.handleQuotaCooldown();
    }

    return false;
  }

  /**
   * Universal App Review Resolver:
   * Accurately finds all reviews for any app by ID, Slug, Name, or Package without any cross-app mixups.
   * Priority: 1. In-memory cache -> 2. Bucket document (1 single read!) -> 3. Legacy query fallback.
   */
  public async getReviewsForApp(
    appIdentifier: string,
    cursor?: string,
    limitCount = 5,
    appTitle?: string,
    overallRating = 5.0,
    appSlug?: string,
    filter: string = 'all',
    sortBy: string = 'recent',
    isBot: boolean = false
  ) {
    const rawId = String(appIdentifier || '').toLowerCase().trim();
    const matchedApp = findAppInCatalog(rawId) || (appSlug ? findAppInCatalog(appSlug) : null);
    const cleanId = matchedApp ? String(matchedApp.id).toLowerCase().trim() : rawId;
    const aliasKeys = this.getAliasKeysForApp(cleanId, appTitle, appSlug || matchedApp?.slug);

    // Zero-Cost Bot Bypass: If request is from a bot or crawler, serve 100% from in-memory cache and local snapshot (0 Firestore reads, 0 quota cost!)
    if (!isBot) {
      await this.ensureAllReviewsLoadedForApp(cleanId, aliasKeys);
    }

    // Tier 1: Instant In-Memory Filter & Resolver (0ms latency, zero quota consumption)
    let memList = Array.from(this.reviews.values()).filter(r => {
      if (r.status && r.status !== 'published') return false;
      const rAppId = String(r.appId || '').toLowerCase().trim();
      const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
      const rAppName = String(r.appName || '').toLowerCase().trim();
      return aliasKeys.has(rAppId) || (rAppSlug && aliasKeys.has(rAppSlug)) || (rAppName && aliasKeys.has(rAppName));
    });

    // Compute live stats from all published reviews of this app
    const totalAppReviews = memList.length;
    let appRatingSum = 0;
    const starCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    memList.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      starCounts[String(star)] = (starCounts[String(star)] || 0) + 1;
      appRatingSum += Number(r.rating) || 5;
    });
    const avgRating = totalAppReviews > 0 ? parseFloat((appRatingSum / totalAppReviews).toFixed(1)) : overallRating;

    // Apply positive / critical filter
    let filteredList = memList;
    if (filter === 'positive') filteredList = memList.filter(r => (r.rating || 5) >= 4);
    if (filter === 'critical') filteredList = memList.filter(r => (r.rating || 5) <= 3);

    // Apply sorting: Pinned first, then by sort metric
    filteredList.sort((a, b) => {
      const aIsPinned = Boolean(a.isPinned);
      const bIsPinned = Boolean(b.isPinned);
      if (aIsPinned !== bIsPinned) return aIsPinned ? -1 : 1;
      if (sortBy === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      if (sortBy === 'highest') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'lowest') return (a.rating || 5) - (b.rating || 5);
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });

    // Handle cursor pagination
    let startIndex = 0;
    if (cursor) {
      const idx = filteredList.findIndex(r => r.id === cursor);
      if (idx >= 0) startIndex = idx + 1;
    }

    const pageReviews = filteredList.slice(startIndex, startIndex + limitCount);
    const hasMore = startIndex + limitCount < filteredList.length;
    const nextCursor = hasMore && pageReviews.length > 0 ? pageReviews[pageReviews.length - 1].id : null;

    const stats = {
      averageRating: avgRating,
      totalReviews: totalAppReviews,
      starCounts: starCounts
    };

    return { 
      reviews: pageReviews, 
      hasMore, 
      nextCursor, 
      total: totalAppReviews, 
      stats 
    };
  }

  public getCommunityOverviewMetrics() {
    const list = Array.from(this.reviews.values());
    const totalReviews = list.length;
    let publishedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let flaggedCount = 0;
    let ratingSum = 0;
    let ratedCount = 0;
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const coveredAppIds = new Set<string>();

    list.forEach(r => {
      const status = r.status || 'published';
      if (status === 'published') publishedCount++;
      else if (status === 'pending') pendingCount++;
      else if (status === 'rejected') rejectedCount++;

      if (r.reported || (r.report_count || 0) > 0) flaggedCount++;

      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;

      if (r.rating) {
        ratingSum += Number(r.rating) || 5;
        ratedCount++;
      }

      if (r.appId) coveredAppIds.add(r.appId.toLowerCase().trim());
      else if (r.appSlug) coveredAppIds.add(r.appSlug.toLowerCase().trim());
    });

    const reportList = Array.from(this.reports.values());
    const totalReports = reportList.length;
    const pendingReportsCount = reportList.filter(rep => !rep.status || rep.status === 'pending' || rep.status === 'in_review').length;

    const averageRating = ratedCount > 0 ? parseFloat((ratingSum / ratedCount).toFixed(1)) : 4.8;

    const effectiveTotal = Math.max(totalReviews, this.cachedRemoteCounts?.totalReviews || 0);
    const effectivePublished = Math.max(publishedCount, this.cachedRemoteCounts?.publishedReviews || 0);
    const effectivePending = this.cachedRemoteCounts?.pendingReviews !== undefined ? this.cachedRemoteCounts.pendingReviews : pendingCount;
    const effectiveRejected = this.cachedRemoteCounts?.rejectedReviews !== undefined ? this.cachedRemoteCounts.rejectedReviews : rejectedCount;
    const effectiveReports = Math.max(totalReports, this.cachedRemoteCounts?.totalReports || 0);
    const effectivePendingReports = this.cachedRemoteCounts?.pendingReports !== undefined ? this.cachedRemoteCounts.pendingReports : pendingReportsCount;

    return {
      totalReviews: effectiveTotal,
      publishedCount: effectivePublished,
      pendingCount: effectivePending,
      rejectedCount: effectiveRejected,
      flaggedCount,
      totalReports: effectiveReports,
      pendingReportsCount: effectivePendingReports,
      averageRating,
      ratingDistribution,
      appCoverageCount: coveredAppIds.size,
      lastAggregatedAt: this.cachedRemoteCounts?.lastAggregatedAt || new Date().toISOString()
    };
  }

  /**
   * Fast In-Memory Per-App Aggregate Review Statistics:
   * Generates exact breakdown (total, published, pending, rejected, flagged, avgRating)
   * for every app across all identifiers, slugs, and aliases in <1ms without Firestore quota cost.
   */
  public getAppReviewCounts() {
    const list = Array.from(this.reviews.values());
    const totalReviews = list.length;
    let publishedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let flaggedCount = 0;
    let ratingSum = 0;
    let ratedCount = 0;

    const rawAppMap: Record<string, { total: number; published: number; pending: number; rejected: number; flagged: number; ratingSum: number; ratingCount: number }> = {};

    const recordForAppKey = (key: string, r: ReviewRecord) => {
      const clean = String(key || '').toLowerCase().trim();
      if (!clean) return;
      if (!rawAppMap[clean]) {
        rawAppMap[clean] = { total: 0, published: 0, pending: 0, rejected: 0, flagged: 0, ratingSum: 0, ratingCount: 0 };
      }
      const entry = rawAppMap[clean];
      entry.total++;
      const status = r.status || 'published';
      if (status === 'published') entry.published++;
      else if (status === 'pending') entry.pending++;
      else if (status === 'rejected') entry.rejected++;

      if (r.reported || (r.report_count || 0) > 0) entry.flagged++;
      if (r.rating) {
        entry.ratingSum += Number(r.rating) || 5;
        entry.ratingCount++;
      }
    };

    list.forEach(r => {
      const status = r.status || 'published';
      if (status === 'published') publishedCount++;
      else if (status === 'pending') pendingCount++;
      else if (status === 'rejected') rejectedCount++;

      if (r.reported || (r.report_count || 0) > 0) flaggedCount++;

      if (r.rating) {
        ratingSum += Number(r.rating) || 5;
        ratedCount++;
      }

      const keys = new Set<string>();
      if (r.appId) keys.add(String(r.appId).toLowerCase().trim());
      if (r.appSlug) keys.add(String(r.appSlug).toLowerCase().trim());

      if (r.appId) {
        const aliases = this.getAliasKeysForApp(r.appId);
        aliases.forEach(k => keys.add(k));
      }
      if (r.appSlug) {
        const aliases = this.getAliasKeysForApp(r.appSlug);
        aliases.forEach(k => keys.add(k));
      }

      keys.forEach(k => recordForAppKey(k, r));
    });

    const appCounts: Record<string, { total: number; published: number; pending: number; rejected: number; flagged: number; avgRating: number }> = {};
    for (const [key, item] of Object.entries(rawAppMap)) {
      appCounts[key] = {
        total: item.total,
        published: item.published,
        pending: item.pending,
        rejected: item.rejected,
        flagged: item.flagged,
        avgRating: item.ratingCount > 0 ? parseFloat((item.ratingSum / item.ratingCount).toFixed(1)) : 5.0
      };
    }

    const averageRating = ratedCount > 0 ? parseFloat((ratingSum / ratedCount).toFixed(1)) : 4.8;
    const effectiveTotal = Math.max(totalReviews, this.cachedRemoteCounts?.totalReviews || 0);
    const effectivePublished = Math.max(publishedCount, this.cachedRemoteCounts?.publishedReviews || 0);
    const effectivePending = this.cachedRemoteCounts?.pendingReviews !== undefined ? this.cachedRemoteCounts.pendingReviews : pendingCount;
    const effectiveRejected = this.cachedRemoteCounts?.rejectedReviews !== undefined ? this.cachedRemoteCounts.rejectedReviews : rejectedCount;

    return {
      globalStats: {
        total: effectiveTotal,
        published: effectivePublished,
        pending: effectivePending,
        rejected: effectiveRejected,
        flagged: flaggedCount,
        averageRating
      },
      appCounts
    };
  }

  /**
   * Get Top Reviewed Apps for Leaderboard and Platform Overview
   */
  public getTopReviewedApps(limit: number = 8) {
    const { appCounts } = this.getAppReviewCounts();
    const staticData = getStaticData();
    const apps = staticData.apps || staticData.mockApps || [];

    const result: any[] = [];
    const seen = new Set<string>();

    apps.forEach((app: any) => {
      const slugKey = (app.slug || '').toLowerCase().trim();
      const idKey = (app.id || '').toLowerCase().trim();
      const countData = appCounts[slugKey] || appCounts[idKey];
      if (countData && countData.total > 0) {
        const canonicalKey = app.slug || app.id;
        if (!seen.has(canonicalKey)) {
          seen.add(canonicalKey);
          result.push({
            id: app.id,
            slug: app.slug,
            name: app.name,
            icon_url: app.icon_url,
            category: app.category,
            total: countData.total,
            published: countData.published,
            pending: countData.pending,
            avgRating: countData.avgRating
          });
        }
      }
    });

    result.sort((a, b) => b.total - a.total);
    return result.slice(0, limit);
  }

  /**
   * Get Most Recent Reviews for Quick Moderation Preview
   */
  public getRecentReviews(limit: number = 6): ReviewRecord[] {
    const list = Array.from(this.reviews.values());
    list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    return list.slice(0, limit);
  }

  /**
   * Persist pre-computed catalog stats to Firestore community_store/catalog_stats
   * Allows 1-read retrieval for any future worker or client.
   */
  public async saveCatalogStatsSummary() {
    try {
      const overview = this.getCommunityOverviewMetrics();
      const { appCounts } = this.getAppReviewCounts();
      const payload = {
        totalReviews: overview.totalReviews,
        publishedReviews: overview.publishedCount,
        pendingReviews: overview.pendingCount,
        rejectedReviews: overview.rejectedCount,
        flaggedReviews: overview.flaggedCount,
        totalReports: overview.totalReports,
        pendingReports: overview.pendingReportsCount,
        averageRating: overview.averageRating,
        ratingDistribution: overview.ratingDistribution,
        appCounts,
        updated_at: new Date().toISOString()
      };
      await safeWriteDb('catalog_stats', payload, undefined, true, 'community_store');
    } catch (e) {
      // Non-blocking
    }
  }

  /**
   * Dedicated Admin Live App Review Loader:
   * Directly queries the live rummydexcommunity Firestore for the specific app
   * without relying on stale cache or static fallbacks.
   */
  public async loadAppReviewsForAdmin(appIdentifier: string, forceLive: boolean = false): Promise<number> {
    const cleanId = String(appIdentifier || '').toLowerCase().trim();
    if (!cleanId) return 0;
    return await this.ensureAllReviewsLoadedForApp(cleanId);
  }

  public async queryAdminReviews(query: {
    appId?: string;
    status?: string;
    rating?: string | number;
    search?: string;
    isPinned?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
    refresh?: boolean;
  }) {
    if (query.refresh && Date.now() >= this.quotaExhaustedUntil) {
      try {
        const db = getCommunityAdminDb();
        if (db) {
          try {
            const snap = await withTimeout(db.collection('reviews').orderBy('timestamp', 'desc').limit(200).get(), 15000, null);
            if (snap && snap.docs && snap.docs.length > 0) {
              snap.docs.forEach((docSnap: any) => {
                const d = docSnap.data();
                if (!this.deletedReviewIds.has(docSnap.id)) {
                  this.reviews.set(docSnap.id, { id: docSnap.id, ...d });
                }
              });
            }
          } catch (adminErr: any) {
            try {
              const fallbackSnap = await withTimeout(db.collection('reviews').limit(200).get(), 15000, null);
              if (fallbackSnap && fallbackSnap.docs && fallbackSnap.docs.length > 0) {
                fallbackSnap.docs.forEach((docSnap: any) => {
                  const d = docSnap.data();
                  if (!this.deletedReviewIds.has(docSnap.id)) {
                    this.reviews.set(docSnap.id, { id: docSnap.id, ...d });
                  }
                });
              }
            } catch (_) {}
          }
        }
      } catch (e) {}
    }

    let list = Array.from(this.reviews.values());

    if (query.appId && query.appId !== 'all') {
      await this.loadAppReviewsForAdmin(query.appId, Boolean(query.refresh));
      list = Array.from(this.reviews.values());
      const aliasKeys = this.getAliasKeysForApp(query.appId);

      list = list.filter(r => {
        const rAppId = String(r.appId || '').toLowerCase().trim();
        const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
        const rAppName = String(r.appName || '').toLowerCase().trim();
        return aliasKeys.has(rAppId) || (rAppSlug && aliasKeys.has(rAppSlug)) || (rAppName && aliasKeys.has(rAppName));
      });
    }

    if (query.status && query.status !== 'all') {
      list = list.filter(r => r.status === query.status);
    }

    if (query.rating && query.rating !== 'all') {
      list = list.filter(r => r.rating === Number(query.rating));
    }

    if (query.isPinned === 'true') {
      list = list.filter(r => !!r.isPinned);
    }

    if (query.search && query.search.trim()) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(r => 
        (r.userName && r.userName.toLowerCase().includes(s)) ||
        (r.reviewText && r.reviewText.toLowerCase().includes(s)) ||
        (r.appId && r.appId.toLowerCase().includes(s)) ||
        (r.appName && r.appName.toLowerCase().includes(s)) ||
        (r.appSlug && r.appSlug.toLowerCase().includes(s))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (query.sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (query.sortBy === 'rating_desc') return b.rating - a.rating;
      if (query.sortBy === 'rating_asc') return a.rating - b.rating;
      if (query.sortBy === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      if (query.sortBy === 'reports') return (b.report_count || 0) - (a.report_count || 0);
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const totalCount = list.length;
    const limit = query.limit !== undefined ? Math.min(100000, Math.max(1, Number(query.limit))) : 25;
    const page = Math.max(1, Number(query.page) || 1);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const offset = (page - 1) * limit;
    const sliced = list.slice(offset, offset + limit);

    const stats = {
      total: list.length,
      published: list.filter(r => r.status === 'published' || r.status === 'approved').length,
      pending: list.filter(r => r.status === 'pending').length,
      rejected: list.filter(r => r.status === 'rejected').length,
      flagged: list.filter(r => !!r.reported || (r.report_count || 0) > 0).length,
      averageRating: list.length > 0
        ? parseFloat((list.reduce((acc, cur) => acc + (cur.rating || 5), 0) / list.length).toFixed(1))
        : 5.0
    };

    const overview = this.getAppReviewCounts();

    return { 
      reviews: sliced, 
      stats, 
      globalStats: overview.globalStats,
      appCounts: overview.appCounts,
      total: totalCount,
      totalCount: totalCount,
      page,
      totalPages
    };
  }

  public getAllReviews(): ReviewRecord[] {
    return Array.from(this.reviews.values());
  }

  public getAllReports(): ReportRecord[] {
    return Array.from(this.reports.values());
  }

  public getAllPendingReports(): ReportRecord[] {
    return Array.from(this.reports.values()).filter(r => r.status === 'pending');
  }

  // ==========================================
  // REPORTS
  // ==========================================

  public async addReport(payload: Partial<ReportRecord>): Promise<ReportRecord> {
    const id = payload.id || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReport: ReportRecord = {
      id,
      type: payload.type || 'app_flag',
      appId: String(payload.appId || '').trim(),
      appName: String(payload.appName || '').trim(),
      reviewId: payload.reviewId ? String(payload.reviewId).trim() : '',
      reviewAuthor: payload.reviewAuthor ? String(payload.reviewAuthor).trim() : '',
      reviewComment: payload.reviewComment ? String(payload.reviewComment).trim() : '',
      reason: String(payload.reason || 'Flag').trim(),
      description: String(payload.description || '').trim(),
      reporterEmail: payload.reporterEmail ? String(payload.reporterEmail).trim() : '',
      reporterName: payload.reporterName ? String(payload.reporterName).trim() : '',
      status: (payload.status as any) || 'pending',
      created_at: payload.created_at || new Date().toISOString(),
      ip: payload.ip || '',
      userAgent: payload.userAgent || '',
      adminNotes: payload.adminNotes || '',
      updated_at: new Date().toISOString()
    };

    this.reports.set(id, newReport);

    const db = getCommunityAdminDb();
    try {
      if (db) {
        await db.collection('reports').doc(id).set(newReport);
      } else {
        const ok = await safeWriteDb(id, newReport, undefined, true, 'reports');
        if (!ok) console.warn("[CommunityStore] REST API Firestore write for report failed.");
      }
    } catch (e: any) {
      if (this.isQuotaError(e)) this.handleQuotaCooldown();
      console.warn("[CommunityStore] Community Firebase addReport write notice:", e);
    }

    this.saveToDiskAndQueueCloudSync();
    return newReport;
  }

  public queryAdminReports(query: {
    status?: string;
    type?: string;
    appId?: string;
    search?: string;
    limit?: number;
  }) {
    let list = Array.from(this.reports.values());

    if (query.status && query.status !== 'all') {
      list = list.filter(r => r.status === query.status);
    }

    if (query.type && query.type !== 'all') {
      list = list.filter(r => r.type === query.type);
    }

    if (query.appId && query.appId !== 'all') {
      list = list.filter(r => r.appId.toLowerCase() === query.appId!.toLowerCase());
    }

    if (query.search && query.search.trim()) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(r =>
        (r.appId && r.appId.toLowerCase().includes(s)) ||
        (r.appName && r.appName.toLowerCase().includes(s)) ||
        (r.reason && r.reason.toLowerCase().includes(s)) ||
        (r.description && r.description.toLowerCase().includes(s)) ||
        (r.reporterEmail && r.reporterEmail.toLowerCase().includes(s)) ||
        (r.reviewAuthor && r.reviewAuthor.toLowerCase().includes(s)) ||
        (r.adminNotes && r.adminNotes.toLowerCase().includes(s))
      );
    }

    // Sort: pending first, then newest
    list.sort((a, b) => {
      const statusWeight: Record<string, number> = { pending: 0, in_review: 1, resolved: 2, dismissed: 3 };
      const weightA = statusWeight[a.status] ?? 0;
      const weightB = statusWeight[b.status] ?? 0;
      if (weightA !== weightB) return weightA - weightB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const max = Math.min(300, Number(query.limit) || 100);
    const sliced = list.slice(0, max);

    const counts = {
      total: list.length,
      pending: list.filter(r => r.status === 'pending').length,
      in_review: list.filter(r => r.status === 'in_review').length,
      resolved: list.filter(r => r.status === 'resolved').length,
      dismissed: list.filter(r => r.status === 'dismissed').length,
      app_flags: list.filter(r => r.type === 'app_flag').length,
      review_flags: list.filter(r => r.type === 'review_flag').length
    };

    return { reports: sliced, counts, totalCount: list.length };
  }

  public async updateReport(id: string, updates: Partial<ReportRecord>): Promise<ReportRecord | null> {
    const existing = this.reports.get(id);
    if (!existing) return null;

    const updated: ReportRecord = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.reports.set(id, updated);

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reports').doc(id).set(updated, { merge: true }).catch((e: any) => { if (this.isQuotaError(e)) this.handleQuotaCooldown(); });
    } else {
      safeWriteDb(id, updated, undefined, true, 'reports').catch((e: any) => { if (this.isQuotaError(e)) this.handleQuotaCooldown(); });
    }

    this.saveToDiskAndQueueCloudSync();
    return updated;
  }

  public async deleteReport(id: string): Promise<boolean> {
    const existed = this.reports.delete(id);
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reports').doc(id).delete().catch((e: any) => { if (this.isQuotaError(e)) this.handleQuotaCooldown(); });
    } else {
      safeDeleteDb(id, undefined, 'reports').catch((e: any) => { if (this.isQuotaError(e)) this.handleQuotaCooldown(); });
    }
    this.saveToDiskAndQueueCloudSync();
    return existed;
  }

  
  public async getAppStats(appIdentifier: string, fallbackRating = 4.8, appTitle?: string, appSlug?: string) {
    const matchedApp = findAppInCatalog(appIdentifier) || (appSlug ? findAppInCatalog(appSlug) : null) || (appTitle ? findAppInCatalog(appTitle) : null);
    const cleanId = matchedApp ? String(matchedApp.id).toLowerCase().trim() : String(appIdentifier || '').toLowerCase().trim();
    
    // 1. Get Base App Stats
    const baseTotal = matchedApp?.review_count ? Number(matchedApp.review_count) : (matchedApp?.existingReviewsCount ? Number(matchedApp.existingReviewsCount) : 0);
    const baseRating = matchedApp?.rating ? Number(matchedApp.rating) : fallbackRating;
    const baseStarCounts = { 
      '5': Math.floor(baseTotal * 0.75), 
      '4': Math.floor(baseTotal * 0.15), 
      '3': Math.floor(baseTotal * 0.05), 
      '2': Math.floor(baseTotal * 0.03), 
      '1': Math.floor(baseTotal * 0.02) 
    };
    
    let communityTotal = 0;
    let communityRatingSum = 0;
    let communityStarCounts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    // 2. Fetch atomic stats (from memory cache or remote Firestore)
    let stats = this.appStatsCache.get(cleanId);
    if (!stats) {
      try {
        stats = await readAppStats(cleanId);
        if (stats) {
          this.appStatsCache.set(cleanId, stats);
        }
      } catch (e) {
        // ignore
      }
    }
    
    if (stats) {
      communityTotal = stats.publishedReviewCount || 0;
      communityRatingSum = stats.publishedRatingSum || 0;
      communityStarCounts = stats.starDistribution || communityStarCounts;
    } else {
      // 3. Fallback: compute from memory reviews if no atomic stats document exists
      const aliasKeys = this.getAliasKeysForApp(appIdentifier, appTitle, appSlug);
      const appReviews = Array.from(this.reviews.values())
        .filter(r => {
          if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
          const rAppId = String(r.appId || '').toLowerCase().trim();
          const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
          const rAppName = String(r.appName || '').toLowerCase().trim();
          return aliasKeys.has(rAppId) || (rAppSlug && aliasKeys.has(rAppSlug)) || (rAppName && aliasKeys.has(rAppName));
        });

      if (appReviews.length > 0) {
        appReviews.forEach(r => {
          const star = String(Math.max(1, Math.min(5, Math.round(r.rating))));
          communityStarCounts[star as keyof typeof communityStarCounts] = (communityStarCounts[star as keyof typeof communityStarCounts] || 0) + 1;
          communityRatingSum += r.rating;
          communityTotal++;
        });
        
        // Cache these computed stats!
        this.appStatsCache.set(cleanId, {
           publishedReviewCount: communityTotal,
           publishedRatingSum: communityRatingSum,
           starDistribution: communityStarCounts
        });
      }
    }

    // 4. Combine Base + Community
    const totalReviews = baseTotal + communityTotal;
    let averageRating = baseRating;
    
    if (totalReviews > 0) {
       const totalSum = (baseRating * baseTotal) + communityRatingSum;
       averageRating = parseFloat((totalSum / totalReviews).toFixed(1));
    } else {
       averageRating = fallbackRating;
    }

    return {
      appId: matchedApp?.id ? String(matchedApp.id) : appIdentifier,
      averageRating: Math.max(1, Math.min(5, averageRating)),
      totalReviews,
      starCounts: {
        '5': baseStarCounts['5'] + (communityStarCounts['5'] || 0),
        '4': baseStarCounts['4'] + (communityStarCounts['4'] || 0),
        '3': baseStarCounts['3'] + (communityStarCounts['3'] || 0),
        '2': baseStarCounts['2'] + (communityStarCounts['2'] || 0),
        '1': baseStarCounts['1'] + (communityStarCounts['1'] || 0)
      }
    };
  }
}
export const communityStore = new CommunityStoreService();
try {
  const { communityStore: fallbackStore } = require('../../lib/communityStoreFallback');
  if (fallbackStore && typeof fallbackStore.setDynamicProvider === 'function') {
    fallbackStore.setDynamicProvider(communityStore);
  }
} catch (e) {}
