import fs from 'fs';
import path from 'path';
import { getCommunityAdminDb, writeFirestoreRestDoc, parseFirestoreFields, getRawFirebaseConfig } from '../firebase';

export interface ReviewRecord {
  id: string;
  appId: string;
  userName: string;
  rating: number;
  reviewText: string;
  timestamp: string;
  status: 'published' | 'pending' | 'rejected' | string;
  helpful_count: number;
  isPinned: boolean;
  reported: boolean;
  report_count: number;
  source: 'community' | 'google' | 'admin_created' | string;
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

// In-memory persistent cache for zero-latency lookups & background Firestore sync
class CommunityStoreService {
  private reviews: Map<string, ReviewRecord> = new Map();
  private reports: Map<string, ReportRecord> = new Map();
  private initialized = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private localBackupPath = path.join(process.cwd(), 'community_local_backup.json');

  constructor() {
    this.loadFromLocalBackup();
    this.initFromFirestore().catch(() => {});
  }

  // Load from local JSON disk backup on startup
  private loadFromLocalBackup() {
    try {
      if (fs.existsSync(this.localBackupPath)) {
        const raw = fs.readFileSync(this.localBackupPath, 'utf8');
        const data = JSON.parse(raw);
        if (data.reviews && Array.isArray(data.reviews)) {
          data.reviews.forEach((r: ReviewRecord) => {
            if (r && r.id) this.reviews.set(r.id, r);
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
      const data = {
        reviews: Array.from(this.reviews.values()),
        reports: Array.from(this.reports.values()),
        updated_at: new Date().toISOString()
      };
      fs.writeFileSync(this.localBackupPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.warn('[CommunityStore] Local backup write error:', e);
    }

    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncAllToFirestore().catch(() => {});
    }, 1500);
  }

  // Initialize and pull latest from Firestore
  public async initFromFirestore() {
    if (this.initialized) return;
    try {
      const db = getCommunityAdminDb();
      if (db) {
        // Load reviews
        try {
          const snap = await db.collection('reviews').limit(500).get();
          snap.docs.forEach((doc: any) => {
            const d = doc.data();
            this.reviews.set(doc.id, {
              id: doc.id,
              appId: d.appId || '',
              userName: d.userName || 'Player',
              rating: Number(d.rating) || 5,
              reviewText: d.reviewText || '',
              timestamp: d.timestamp || new Date().toISOString(),
              status: d.status || 'published',
              helpful_count: Number(d.helpful_count) || 0,
              isPinned: Boolean(d.isPinned),
              reported: Boolean(d.reported),
              report_count: Number(d.report_count) || 0,
              source: d.source || 'community',
              adminReply: d.adminReply || null,
              updated_at: d.updated_at
            });
          });
        } catch (e) {}

        // Load reports
        try {
          const rSnap = await db.collection('reports').limit(500).get();
          rSnap.docs.forEach((doc: any) => {
            const d = doc.data();
            this.reports.set(doc.id, {
              id: doc.id,
              type: d.type || 'app_flag',
              appId: d.appId || '',
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
        } catch (e) {}
      } else {
        // Fallback REST doc check
        const config = getRawFirebaseConfig();
        if (config?.projectId) {
          const dbId = config.firestoreDatabaseId || config.databaseId || '(default)';
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
                    if (r?.id && !this.reviews.has(r.id)) this.reviews.set(r.id, r);
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
      }
      this.initialized = true;
      console.log(`[CommunityStore] Firestore sync complete: ${this.reviews.size} reviews, ${this.reports.size} reports.`);
    } catch (err) {
      console.warn('[CommunityStore] Init failed gracefully:', err);
    }
  }

  // Backup write to Firestore
  public async syncAllToFirestore() {
    try {
      const data = {
        reviews: Array.from(this.reviews.values()),
        reports: Array.from(this.reports.values()),
        count_reviews: this.reviews.size,
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
    const id = payload.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRev: ReviewRecord = {
      id,
      appId: String(payload.appId || '').trim(),
      userName: String(payload.userName || 'Player').trim().substring(0, 50),
      rating: Math.max(1, Math.min(5, Math.round(Number(payload.rating) || 5))),
      reviewText: String(payload.reviewText || '').trim(),
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
      db.collection('reviews').doc(id).set(newRev).catch((e: any) => console.warn(e));
    }

    this.saveToDiskAndQueueCloudSync();
    return newRev;
  }

  public async voteHelpful(reviewId: string): Promise<number> {
    let rev = this.reviews.get(reviewId);
    if (!rev) {
      // Create record if voting on default review
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

    // Persist to Admin DB if connected
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(reviewId).set({ helpful_count: rev.helpful_count }, { merge: true }).catch(() => {});
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

    // Create report entry
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
        db.collection('reviews').doc(reviewId).set({ reported: true, report_count: rev.report_count }, { merge: true }).catch(() => {});
      }
      db.collection('reports').doc(reportId).set(newReport).catch(() => {});
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
      updated_at: new Date().toISOString()
    };

    this.reviews.set(id, updated);

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(id).set(updated, { merge: true }).catch(() => {});
    }

    this.saveToDiskAndQueueCloudSync();
    return updated;
  }

  public async deleteReview(id: string): Promise<boolean> {
    const existed = this.reviews.delete(id);
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(id).delete().catch(() => {});
    }
    this.saveToDiskAndQueueCloudSync();
    return existed;
  }

  public getReviewsForApp(appId: string, cursor?: string, limitCount = 10) {
    const all = Array.from(this.reviews.values())
      .filter(r => (r.appId.toLowerCase() === appId.toLowerCase()) && (r.status === 'published' || !r.status))
      .sort((a, b) => {
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
      list = list.filter(r => r.appId.toLowerCase() === query.appId!.toLowerCase());
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
        (r.appId && r.appId.toLowerCase().includes(s))
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

    const max = Math.min(300, Number(query.limit) || 100);
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
      db.collection('reports').doc(id).set(newReport).catch(() => {});
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
      db.collection('reports').doc(id).set(updated, { merge: true }).catch(() => {});
    }

    this.saveToDiskAndQueueCloudSync();
    return updated;
  }

  public async deleteReport(id: string): Promise<boolean> {
    const existed = this.reports.delete(id);
    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reports').doc(id).delete().catch(() => {});
    }
    this.saveToDiskAndQueueCloudSync();
    return existed;
  }

  public getAppStats(appId: string) {
    const appReviews = Array.from(this.reviews.values())
      .filter(r => r.appId.toLowerCase() === appId.toLowerCase() && (r.status === 'published' || !r.status));

    const starCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let total = 0;
    appReviews.forEach(r => {
      const star = String(Math.max(1, Math.min(5, Math.round(r.rating))));
      starCounts[star] = (starCounts[star] || 0) + 1;
      total += r.rating;
    });

    const averageRating = appReviews.length > 0 ? parseFloat((total / appReviews.length).toFixed(1)) : 5.0;

    return {
      appId,
      averageRating,
      totalReviews: appReviews.length,
      starCounts
    };
  }
}

export const communityStore = new CommunityStoreService();
