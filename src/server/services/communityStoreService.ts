import fs from 'fs';
import path from 'path';
import { getCommunityAdminDb, writeFirestoreRestDoc, deleteFirestoreRestDoc, readFirestoreRestCollection, parseFirestoreFields, getRawFirebaseConfig } from '../firebase';
import { getStaticData } from '../config';
import { STATIC_COMMUNITY_REVIEWS } from '../../lib/communityReviewsData';

export interface ReviewRecord {
  id: string;
  appId: string;
  appSlug?: string;
  appName?: string;
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
class CommunityStoreService {
  private reviews: Map<string, ReviewRecord> = new Map();
  private reports: Map<string, ReportRecord> = new Map();
  private initialized = false;
  private isSyncing = false;
  private quotaExhaustedUntil = 0;
  private syncTimer: NodeJS.Timeout | null = null;
  private localBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');

  constructor() {
    this.loadFromLocalBackup();
    this.initFromFirestore().catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });

    // Periodically poll Firestore in the background (60s) to keep multi-instance environments synchronized
    const intervalId = setInterval(() => {
      this.initFromFirestore(true).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }, 3600000); // 1 hour polling instead of 1 minute to save quotas
    if (typeof intervalId.unref === 'function') {
      intervalId.unref();
    }
  }

  // Check if error is a Firestore quota / rate exhaustion
  private isQuotaError(err: any): boolean {
    if (!err) return false;
    const msg = String(err.message || err.details || err || '');
    const code = err.code || err.status;
    return code === 8 || code === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded');
  }

  // Load from local JSON disk backup on startup
  private loadFromLocalBackup() {
    try {
      // First seed memory cache with all verified static reviews
      if (Array.isArray(STATIC_COMMUNITY_REVIEWS)) {
        STATIC_COMMUNITY_REVIEWS.forEach((r: any) => {
          if (r && r.id) {
            this.reviews.set(r.id, {
              id: r.id,
              appId: r.appId || r.app_id || '',
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
              source: r.source || 'admin_created',
              adminReply: r.adminReply || null,
              updated_at: r.updated_at
            });
          }
        });
      }

      if (fs.existsSync(this.localBackupPath)) {
        const raw = fs.readFileSync(this.localBackupPath, 'utf8');
        const data = JSON.parse(raw);
        if (data.reviews && Array.isArray(data.reviews)) {
          data.reviews.forEach((r: ReviewRecord) => {
            if (r && r.id) {
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
        console.log(`[CommunityStore] Loaded ${this.reviews.size} reviews and ${this.reports.size} reports from local backup.`);
      }
    } catch (e) {
      console.warn('[CommunityStore] Local backup read error:', e);
    }
  }

  // Save in-memory cache to disk and queue Firestore cloud write
  private saveToDiskAndQueueCloudSync() {
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
        updated_at: new Date().toISOString()
      };
      
      const tempPath = this.localBackupPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.localBackupPath);

      // Synchronize with static TypeScript file so git sync and public website receive all reviews
      try {
        const staticTsPath = path.join(process.cwd(), 'src/lib/communityReviewsData.ts');
        const allReviewsList = Array.from(this.reviews.values());
        const tsContent = `// Auto-generated verified community reviews dataset\nexport interface StaticReviewRecord {\n  id: string;\n  appId: string;\n  appSlug?: string;\n  appName?: string;\n  userName: string;\n  rating: number;\n  reviewText: string;\n  timestamp: string;\n  status: 'published' | 'pending' | 'rejected' | string;\n  helpful_count: number;\n  isPinned?: boolean;\n  reported?: boolean;\n  report_count?: number;\n  source?: string;\n  adminReply?: {\n    text: string;\n    author: string;\n    timestamp: string;\n  } | null;\n  updated_at?: string;\n}\n\nexport const STATIC_COMMUNITY_REVIEWS: StaticReviewRecord[] = ${JSON.stringify(allReviewsList, null, 2)};\n`;
        fs.writeFileSync(staticTsPath, tsContent, 'utf8');
      } catch (tsErr) {
        console.warn('[CommunityStore] Failed to update communityReviewsData.ts:', tsErr);
      }
    } catch (e) {
      console.warn('[CommunityStore] Local backup write error:', e);
    }

    // Skip cloud sync if quota is exhausted
    if (Date.now() < this.quotaExhaustedUntil) {
      console.log('[CommunityStore] Skipping cloud sync due to quota exhaustion.');
      return;
    }

    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncAllToFirestore().catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }, 1500);
    if (typeof (this.syncTimer as any).unref === 'function') {
      (this.syncTimer as any).unref();
    }
  }

  // Initialize and pull latest from Firestore
  public async initFromFirestore(forceSync = false) {
    if ((this.initialized && !forceSync) || this.isSyncing) return;
    if (Date.now() < this.quotaExhaustedUntil) {
      if (!this.initialized) {
        this.initialized = true;
        console.log(`[CommunityStore] Active cache ready (${this.reviews.size} reviews, ${this.reports.size} reports from local storage).`);
      }
      return;
    }
    this.isSyncing = true;
    try {
      const db = getCommunityAdminDb();
      if (db) {
        // Load reviews
        try {
          const snap = await db.collection('reviews').limit(5000).get();
          snap.docs.forEach((doc: any) => {
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
        } catch (e: any) {
          if (this.isQuotaError(e)) {
            this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
            if (!this.initialized) {
              console.log(`[CommunityStore] Firestore free quota active; serving ${this.reviews.size} reviews and ${this.reports.size} reports from local storage.`);
            }
          }
        }

        // Load reports
        if (Date.now() >= this.quotaExhaustedUntil) {
          try {
            const rSnap = await db.collection('reports').limit(5000).get();
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
          } catch (e: any) {
            if (this.isQuotaError(e)) {
              this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
            } else if (!forceSync) {
              console.warn('[CommunityStore] Firestore init notice:', e?.message || e);
            }
          }
        }
      } else {
        // Fallback to REST API if Admin SDK is not initialized
        try {
          const restReviews = await readFirestoreRestCollection('reviews');
          restReviews.forEach((d: any) => {
            if (d && d.id) {
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

          const restReports = await readFirestoreRestCollection('reports');
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
      
      // Fallback REST doc check for community_store
      const config = getRawFirebaseConfig();
      if (config?.projectId) {
        const dbId = config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
        const apiKeyParam = config.apiKey ? `?key=${encodeURIComponent(config.apiKey)}` : '';
        const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/store_data/community_store${apiKeyParam}`;
        try {
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            if (json?.fields) {
              const parsed = parseFirestoreFields(json.fields);
              if (parsed?.reviews && Array.isArray(parsed.reviews)) {
                parsed.reviews.forEach((r: ReviewRecord) => {
                  if (r?.id && !this.reviews.has(r.id)) {
                    r.reviewText = sanitizeReviewText(r.reviewText);
                    this.reviews.set(r.id, r);
                  }
                });
              }
              if (parsed?.reports && Array.isArray(parsed.reports)) {
                parsed.reports.forEach((rep: ReportRecord) => {
                  if (rep?.id && !this.reports.has(rep.id)) this.reports.set(rep.id, rep);
                });
              }
            }
          }
        } catch (e) {}
      }
      if (!this.initialized && !forceSync) {
        console.log(`[CommunityStore] Firestore sync complete: ${this.reviews.size} reviews, ${this.reports.size} reports.`);
      }
      this.initialized = true;
    } catch (err) {
      if (!this.initialized) {
        console.warn('[CommunityStore] Init failed gracefully:', err);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  // Backup write to Firestore
  public async syncAllToFirestore() {
    try {
      const allReviews = Array.from(this.reviews.values());
      const data = {
        reviews: allReviews,
        reports: Array.from(this.reports.values()),
        count_reviews: allReviews.length,
        count_reports: this.reports.size,
        updated_at: new Date().toISOString()
      };
      await writeFirestoreRestDoc('community_store', data, undefined, true);
    } catch (e) {}
  }

  // ==========================================
  // REVIEWS
  // ==========================================

  public async addReview(payload: Partial<ReviewRecord>): Promise<ReviewRecord> {
    const rawAppId = String(payload.appId || '').trim();
    const matchedApp = findAppInCatalog(rawAppId) || (payload.appSlug ? findAppInCatalog(payload.appSlug) : null);
    
    const targetAppId = matchedApp ? String(matchedApp.id) : rawAppId;
    const targetAppSlug = matchedApp?.slug || payload.appSlug || '';
    const targetAppName = matchedApp?.name || payload.appName || '';

    const id = payload.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRev: ReviewRecord = {
      id,
      appId: targetAppId,
      appSlug: targetAppSlug,
      appName: targetAppName,
      userName: String(payload.userName || 'Player').trim().substring(0, 50),
      rating: Math.max(1, Math.min(5, Math.round(Number(payload.rating) || 5))),
      reviewText: sanitizeReviewText(String(payload.reviewText || ''), targetAppName),
      timestamp: payload.timestamp || new Date().toISOString(),
      status: (payload.status as any) || 'published',
      helpful_count: Number(payload.helpful_count) || 0,
      isPinned: Boolean(payload.isPinned),
      reported: Boolean(payload.reported),
      report_count: Number(payload.report_count) || 0,
      source: payload.source || 'community',
      adminReply: payload.adminReply || null,
      updated_at: new Date().toISOString()
    };

    this.reviews.set(id, newRev);

    // Save to Firestore Admin DB if available
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(id).set(newRev).catch((e: any) => {
        if (this.isQuotaError(e)) {
          this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
        }
      });
    } else {
      writeFirestoreRestDoc(id, newRev, undefined, true, 'reviews').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }

    this.saveToDiskAndQueueCloudSync();
    return newRev;
  }

  public async addMultipleReviews(reviewsList: Partial<ReviewRecord>[]): Promise<ReviewRecord[]> {
    const db = getCommunityAdminDb();
    const added: ReviewRecord[] = [];

    for (const payload of reviewsList) {
      const rawAppId = String(payload.appId || '').trim();
      const matchedApp = findAppInCatalog(rawAppId) || (payload.appSlug ? findAppInCatalog(payload.appSlug) : null);
      
      const targetAppId = matchedApp ? String(matchedApp.id) : rawAppId;
      const targetAppSlug = matchedApp?.slug || payload.appSlug || '';
      const targetAppName = matchedApp?.name || payload.appName || '';

      const id = payload.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newRev: ReviewRecord = {
        id,
        appId: targetAppId,
        appSlug: targetAppSlug,
        appName: targetAppName,
        userName: String(payload.userName || 'Player').trim().substring(0, 50),
        rating: Math.max(1, Math.min(5, Math.round(Number(payload.rating) || 5))),
        reviewText: sanitizeReviewText(String(payload.reviewText || ''), targetAppName),
        timestamp: payload.timestamp || new Date().toISOString(),
        status: (payload.status as any) || 'published',
        helpful_count: Number(payload.helpful_count) || Math.floor(Math.random() * 8),
        isPinned: Boolean(payload.isPinned),
        reported: false,
        report_count: 0,
        source: payload.source || 'ai_generated',
        adminReply: payload.adminReply || null,
        updated_at: new Date().toISOString()
      };

      this.reviews.set(id, newRev);
      added.push(newRev);

      if (db) {
        db.collection('reviews').doc(id).set(newRev).catch((e: any) => {
          if (this.isQuotaError(e)) {
            this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
          }
        });
      } else {
        writeFirestoreRestDoc(id, newRev, undefined, true, 'reviews').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
      }
    }

    this.saveToDiskAndQueueCloudSync();
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

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(reviewId).set({ helpful_count: rev.helpful_count }, { merge: true }).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    } else {
      writeFirestoreRestDoc(reviewId, { helpful_count: rev.helpful_count }, undefined, true, 'reviews').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }

    this.saveToDiskAndQueueCloudSync();
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
      if (rev) {
        db.collection('reviews').doc(reviewId).set({ reported: true, report_count: rev.report_count }, { merge: true }).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
      }
      db.collection('reports').doc(reportId).set(newReport).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    } else {
      if (rev) {
        writeFirestoreRestDoc(reviewId, { reported: true, report_count: rev.report_count }, undefined, true, 'reviews').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
      }
      writeFirestoreRestDoc(reportId, newReport, undefined, true, 'reports').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }

    this.saveToDiskAndQueueCloudSync();
    return true;
  }

  public async updateReview(id: string, updates: Partial<ReviewRecord>): Promise<ReviewRecord | null> {
    const existing = this.reviews.get(id);
    if (!existing) return null;

    const updated: ReviewRecord = {
      ...existing,
      ...updates,
      reviewText: updates.reviewText ? sanitizeReviewText(updates.reviewText, updates.appName || existing.appName) : existing.reviewText,
      updated_at: new Date().toISOString()
    };

    this.reviews.set(id, updated);

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(id).set(updated, { merge: true }).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    } else {
      writeFirestoreRestDoc(id, updated, undefined, true, 'reviews').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }

    this.saveToDiskAndQueueCloudSync();
    return updated;
  }

  public async deleteReview(id: string): Promise<boolean> {
    const existed = this.reviews.delete(id);
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(id).delete().catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    } else {
      deleteFirestoreRestDoc(id, undefined, 'reviews').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }
    this.saveToDiskAndQueueCloudSync();
    return existed;
  }

  public async deleteReviewsForApp(appIdentifier: string): Promise<number> {
    const aliasKeys = this.getAliasKeysForApp(appIdentifier);
    let count = 0;
    const db = getCommunityAdminDb();

    for (const [id, rev] of Array.from(this.reviews.entries())) {
      const revAppId = String(rev.appId || '').toLowerCase().trim();
      const revSlug = String(rev.appSlug || '').toLowerCase().trim();
      const revName = String(rev.appName || '').toLowerCase().trim();

      if (aliasKeys.has(revAppId) || aliasKeys.has(revSlug) || aliasKeys.has(revName)) {
        this.reviews.delete(id);
        count++;
        if (db) {
          db.collection('reviews').doc(id).delete().catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
        } else {
          deleteFirestoreRestDoc(id, undefined, 'reviews').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
        }
      }
    }

    if (count > 0) {
      this.saveToDiskAndQueueCloudSync();
    }
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
   * Universal App Review Resolver:
   * Accurately finds all reviews for any app by ID, Slug, Name, or Package without any cross-app mixups.
   */
  public getReviewsForApp(appIdentifier: string, cursor?: string, limitCount = 10, appTitle?: string, overallRating = 5.0, appSlug?: string) {
    const aliasKeys = this.getAliasKeysForApp(appIdentifier, appTitle, appSlug);

    // Filter published or approved reviews matching ANY of this app's alias keys
    let all = Array.from(this.reviews.values())
      .filter(r => {
        if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
        const rAppId = String(r.appId || '').toLowerCase().trim();
        const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
        const rAppName = String(r.appName || '').toLowerCase().trim();

        return (
          (rAppId && aliasKeys.has(rAppId)) ||
          (rAppSlug && aliasKeys.has(rAppSlug)) ||
          (rAppName && aliasKeys.has(rAppName))
        );
      });

    all.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    let startIndex = 0;
    if (cursor) {
      const idx = all.findIndex(r => r.timestamp === cursor || r.id === cursor);
      if (idx >= 0) startIndex = idx + 1;
    }

    const sliced = all.slice(startIndex, startIndex + limitCount);
    const hasMore = startIndex + limitCount < all.length;
    const nextCursor = sliced.length > 0 ? sliced[sliced.length - 1].timestamp : null;

    return { reviews: sliced, hasMore, nextCursor, total: all.length };
  }

  public queryAdminReviews(query: {
    appId?: string;
    status?: string;
    rating?: string | number;
    search?: string;
    isPinned?: string;
    sortBy?: string;
    limit?: number;
  }) {
    let list = Array.from(this.reviews.values());

    if (query.appId && query.appId !== 'all') {
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

    const max = query.limit ? Math.min(100000, Number(query.limit)) : 100000;
    const sliced = list.slice(0, max);

    const stats = {
      total: list.length,
      published: list.filter(r => r.status === 'published').length,
      pending: list.filter(r => r.status === 'pending').length,
      rejected: list.filter(r => r.status === 'rejected').length,
      flagged: list.filter(r => !!r.reported || (r.report_count || 0) > 0).length,
      averageRating: list.length > 0
        ? parseFloat((list.reduce((acc, cur) => acc + (cur.rating || 5), 0) / list.length).toFixed(1))
        : 5.0
    };

    return { reviews: sliced, stats, totalCount: list.length };
  }

  public getAllReviews(): ReviewRecord[] {
    return Array.from(this.reviews.values());
  }

  public getAllPublishedReviews(): ReviewRecord[] {
    return Array.from(this.reviews.values()).filter(r => r.status !== 'rejected' && r.status !== 'pending');
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
    if (db) {
      db.collection('reports').doc(id).set(newReport).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    } else {
      writeFirestoreRestDoc(id, newReport, undefined, true, 'reports').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
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
      db.collection('reports').doc(id).set(updated, { merge: true }).catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    } else {
      writeFirestoreRestDoc(id, updated, undefined, true, 'reports').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }

    this.saveToDiskAndQueueCloudSync();
    return updated;
  }

  public async deleteReport(id: string): Promise<boolean> {
    const existed = this.reports.delete(id);
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reports').doc(id).delete().catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    } else {
      deleteFirestoreRestDoc(id, undefined, 'reports').catch((e: any) => { if (this.isQuotaError(e)) this.quotaExhaustedUntil = Date.now() + 15 * 60 * 1000; });
    }
    this.saveToDiskAndQueueCloudSync();
    return existed;
  }

  public getAppStats(appIdentifier: string, fallbackRating = 4.8, appTitle?: string, appSlug?: string) {
    const aliasKeys = this.getAliasKeysForApp(appIdentifier, appTitle, appSlug);
    const matchedApp = findAppInCatalog(appIdentifier) || (appSlug ? findAppInCatalog(appSlug) : null) || (appTitle ? findAppInCatalog(appTitle) : null);

    const appReviews = Array.from(this.reviews.values())
      .filter(r => {
        if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
        const rAppId = String(r.appId || '').toLowerCase().trim();
        const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
        const rAppName = String(r.appName || '').toLowerCase().trim();
        return aliasKeys.has(rAppId) || (rAppSlug && aliasKeys.has(rAppSlug)) || (rAppName && aliasKeys.has(rAppName));
      });

    if (appReviews.length > 0) {
      const starCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      let total = 0;
      appReviews.forEach(r => {
        const star = String(Math.max(1, Math.min(5, Math.round(r.rating))));
        starCounts[star] = (starCounts[star] || 0) + 1;
        total += r.rating;
      });

      const averageRating = total / appReviews.length;

      return {
        appId: matchedApp?.id ? String(matchedApp.id) : appIdentifier,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: appReviews.length,
        starCounts
      };
    }

    // Real authentic stats
    const baseTotal = matchedApp?.review_count ? Number(matchedApp.review_count) : 0;
    const baseRating = matchedApp?.rating ? Number(matchedApp.rating) : 0;
    const starCounts = {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0
    };

    return {
      appId: matchedApp?.id ? String(matchedApp.id) : appIdentifier,
      averageRating: 0,
      totalReviews: 0,
      starCounts
    };
  }
}

export const communityStore = new CommunityStoreService();
