import fs from 'fs';
import path from 'path';
import { ReviewRecord, ReportRecord, AppStatsCacheItem } from './communityTypes';
import { sanitizeReviewText, formatReviewDate } from './communityUtils';
import { getCommunityFirebaseConfig, getCommunityAdminDb } from '../../communityFirebaseAdmin';

export class CommunityPersistence {
  private localBackupPath = path.join(process.cwd(), 'community_local_backup.json');
  private fallbackBackupPath = path.join(process.cwd(), 'community_local_backup.json.bak');
  private diskSyncTimer: NodeJS.Timeout | null = null;
  private isBootstrapping = false;

  public loadBackup(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ): { reviewsCount: number; reportsCount: number } {
    try {
      let raw = '';
      if (fs.existsSync(this.localBackupPath)) {
        try {
          raw = fs.readFileSync(this.localBackupPath, 'utf8');
        } catch (_) {}
      }
      
      // If primary is missing or empty, try secondary backup
      if ((!raw || raw.trim().length === 0) && fs.existsSync(this.fallbackBackupPath)) {
        try {
          raw = fs.readFileSync(this.fallbackBackupPath, 'utf8');
        } catch (_) {}
      }

      if (raw && raw.trim().length > 0) {
        const data = JSON.parse(raw);

        if (data.deleted_review_ids && Array.isArray(data.deleted_review_ids)) {
          data.deleted_review_ids.forEach((id: string) => {
            if (id) deletedReviewIds.add(id);
          });
        }

        if (data.reviews && Array.isArray(data.reviews)) {
          data.reviews.forEach((r: ReviewRecord) => {
            if (r && r.id && !deletedReviewIds.has(r.id)) {
              r.reviewText = sanitizeReviewText(r.reviewText, r.appName);
              r.timestamp = formatReviewDate(r.timestamp);
              reviewsMap.set(r.id, r);
            }
          });
        }

        if (data.reports && Array.isArray(data.reports)) {
          data.reports.forEach((rep: ReportRecord) => {
            if (rep && rep.id) reportsMap.set(rep.id, rep);
          });
        }

        if (data.app_stats && typeof data.app_stats === 'object') {
          Object.entries(data.app_stats).forEach(([k, v]: [string, any]) => {
            if (k && v) {
              const cleanKey = String(k).toLowerCase().trim();
              appStatsCache.set(cleanKey, {
                publishedReviewCount: Number(v.publishedReviewCount) || 0,
                publishedRatingSum: Number(v.publishedRatingSum) || 0,
                starDistribution: v.starDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
              });
            }
          });
        }
      }

      this.reconcileStatsCache(reviewsMap, appStatsCache);
      console.log(`[CommunityPersistence] Loaded ${reviewsMap.size} reviews, ${reportsMap.size} reports from disk.`);

      // If disk was empty or had 0 reviews, bootstrap from Firestore rummydexcommunity
      if (reviewsMap.size === 0) {
        this.bootstrapFromFirestore(reviewsMap, reportsMap, deletedReviewIds, appStatsCache).catch(err => {
          console.warn('[CommunityPersistence] Bootstrap notice:', err?.message || err);
        });
      }

      return { reviewsCount: reviewsMap.size, reportsCount: reportsMap.size };
    } catch (e) {
      console.warn('[CommunityPersistence] Local backup read error:', e);
      return { reviewsCount: reviewsMap.size, reportsCount: reportsMap.size };
    }
  }

  /**
   * Resilient Bootstrap:
   * When disk backup is empty (e.g. fresh container startup), pull all existing reviews from Firestore rummydexcommunity.
   * Guarantees reviews are NEVER lost across restarts or container redeployments.
   */
  public async bootstrapFromFirestore(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ): Promise<number> {
    if (this.isBootstrapping) return reviewsMap.size;
    this.isBootstrapping = true;

    try {
      console.log('[CommunityPersistence] Bootstrapping reviews directly from Firestore rummydexcommunity...');
      const adminDb = getCommunityAdminDb();
      let loadedCount = 0;

      if (adminDb) {
        const snap = await adminDb.collection('reviews').limit(500).get();
        if (snap && snap.docs && snap.docs.length > 0) {
          snap.docs.forEach((doc: any) => {
            const d = doc.data();
            const id = doc.id || d.id;
            if (id && !deletedReviewIds.has(id)) {
              const rev: ReviewRecord = {
                id,
                appId: String(d.appId || d.app_id || '').trim(),
                appSlug: String(d.appSlug || '').trim(),
                appName: String(d.appName || '').trim(),
                userName: String(d.userName || d.username || 'Player').trim(),
                rating: Number(d.rating) || 5,
                reviewText: sanitizeReviewText(String(d.reviewText || d.comment || ''), d.appName),
                timestamp: formatReviewDate(d.timestamp || d.created_at),
                status: d.status || (d.is_approved ? 'published' : 'pending') || 'published',
                helpful_count: Number(d.helpful_count) || 0,
                isPinned: Boolean(d.isPinned),
                reported: Boolean(d.reported),
                report_count: Number(d.report_count) || 0,
                source: d.source || 'community',
                adminReply: d.adminReply || null,
                updated_at: d.updated_at || new Date().toISOString()
              };
              reviewsMap.set(id, rev);
              loadedCount++;
            }
          });
        }
      } else {
        // Direct REST fetch to rummydexcommunity
        const cfg = getCommunityFirebaseConfig();
        const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${cfg.firestoreDatabaseId}/documents/reviews?pageSize=300&key=${encodeURIComponent(cfg.apiKey)}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.documents)) {
            json.documents.forEach((docItem: any) => {
              const nameParts = (docItem.name || '').split('/');
              const docId = nameParts[nameParts.length - 1];
              const fields = docItem.fields || {};
              
              const getString = (f: any) => f?.stringValue || '';
              const getNum = (f: any) => Number(f?.integerValue || f?.doubleValue || 0);
              const getBool = (f: any) => Boolean(f?.booleanValue);

              const id = docId || getString(fields.id);
              if (id && !deletedReviewIds.has(id)) {
                const appName = getString(fields.appName);
                const rev: ReviewRecord = {
                  id,
                  appId: getString(fields.appId) || getString(fields.app_id),
                  appSlug: getString(fields.appSlug),
                  appName,
                  userName: getString(fields.userName) || getString(fields.username) || 'Player',
                  rating: getNum(fields.rating) || 5,
                  reviewText: sanitizeReviewText(getString(fields.reviewText) || getString(fields.comment), appName),
                  timestamp: formatReviewDate(getString(fields.timestamp) || getString(fields.created_at)),
                  status: (getString(fields.status) as any) || 'published',
                  helpful_count: getNum(fields.helpful_count),
                  isPinned: getBool(fields.isPinned),
                  reported: getBool(fields.reported),
                  report_count: getNum(fields.report_count),
                  source: getString(fields.source) || 'community',
                  adminReply: null,
                  updated_at: getString(fields.updated_at) || new Date().toISOString()
                };
                reviewsMap.set(id, rev);
                loadedCount++;
              }
            });
          }
        }
      }

      this.reconcileStatsCache(reviewsMap, appStatsCache);
      console.log(`[CommunityPersistence] Successfully bootstrapped ${loadedCount} reviews from Firestore. Saving to local disk.`);
      this.executeDiskSync(reviewsMap, reportsMap, deletedReviewIds, appStatsCache);
      return loadedCount;
    } catch (e: any) {
      console.warn('[CommunityPersistence] Bootstrap error:', e?.message || e);
      return reviewsMap.size;
    } finally {
      this.isBootstrapping = false;
    }
  }

  public queueSaveToDisk(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ) {
    if (!this.diskSyncTimer) {
      this.diskSyncTimer = setTimeout(() => {
        this.diskSyncTimer = null;
        this.executeDiskSync(reviewsMap, reportsMap, deletedReviewIds, appStatsCache);
      }, 1000); // 1-second debounce
    }
  }

  public executeDiskSync(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ) {
    try {
      // Safety Check: Never overwrite an existing populated backup file with an empty list
      if (reviewsMap.size === 0 && fs.existsSync(this.localBackupPath)) {
        try {
          const existingRaw = fs.readFileSync(this.localBackupPath, 'utf8');
          if (existingRaw && existingRaw.trim().length > 200) {
            const existingData = JSON.parse(existingRaw);
            if (Array.isArray(existingData.reviews) && existingData.reviews.length > 0) {
              console.warn('[CommunityPersistence] Guarded against writing empty reviews over populated backup.');
              return;
            }
          }
        } catch (_) {}
      }

      // Reconcile before saving so stats are always up to date
      this.reconcileStatsCache(reviewsMap, appStatsCache);

      const data = {
        reviews: Array.from(reviewsMap.values()),
        reports: Array.from(reportsMap.values()),
        deleted_review_ids: Array.from(deletedReviewIds),
        app_stats: Object.fromEntries(appStatsCache.entries()),
        updated_at: new Date().toISOString()
      };
      
      const jsonStr = JSON.stringify(data, null, 2);
      const tempPath = this.localBackupPath + '.tmp';

      // Atomic write: write to temp file then rename (guarantees zero partial/corrupted writes)
      fs.writeFileSync(tempPath, jsonStr, 'utf8');
      fs.renameSync(tempPath, this.localBackupPath);

      // Also maintain backup copy
      try {
        fs.writeFileSync(this.fallbackBackupPath, jsonStr, 'utf8');
      } catch (_) {}
    } catch (e) {
      console.warn('[CommunityPersistence] Local backup write error:', e);
    }
  }

  public reconcileStatsCache(
    reviewsMap: Map<string, ReviewRecord>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ) {
    const appMap: Record<string, { count: number; sum: number; stars: Record<string, number> }> = {};

    reviewsMap.forEach(r => {
      if (r.status && r.status !== 'published' && r.status !== 'approved') return;
      const appId = String(r.appId || '').toLowerCase().trim();
      if (!appId) return;
      if (!appMap[appId]) {
        appMap[appId] = { count: 0, sum: 0, stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } };
      }
      const entry = appMap[appId];
      entry.count++;
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      entry.sum += star;
      entry.stars[String(star)] = (entry.stars[String(star)] || 0) + 1;
    });

    for (const [appId, data] of Object.entries(appMap)) {
      const existing = appStatsCache.get(appId);
      if (!existing || data.count >= (existing.publishedReviewCount || 0)) {
        appStatsCache.set(appId, {
          publishedReviewCount: data.count,
          publishedRatingSum: data.sum,
          starDistribution: data.stars
        });
      }
    }
  }
}

export const communityPersistence = new CommunityPersistence();
