import fs from 'fs';
import path from 'path';
import { ReviewRecord, ReportRecord, AppStatsCacheItem } from './communityTypes';
import { sanitizeReviewText, formatReviewDate, resolveCanonicalApp } from './communityUtils';
import { getCommunityFirebaseConfig, getCommunityAdminDb, writeCommunityRestDoc } from '../../communityFirebaseAdmin';
import { getStaticData } from '../../config';

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
              r.timestamp = r.timestamp || new Date().toISOString();
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

      // Zero-Quota Shield: If disk was empty (e.g. serverless or fresh cloud container),
      // load from committed static reviews and catalog stats to avoid burning Firestore reads.
      if (reviewsMap.size === 0) {
        try {
          const staticReviewsPath = path.join(process.cwd(), 'src/lib/communityStaticReviews.json');
          if (fs.existsSync(staticReviewsPath)) {
            const staticReviewsMap = JSON.parse(fs.readFileSync(staticReviewsPath, 'utf8'));
            if (staticReviewsMap && typeof staticReviewsMap === 'object') {
              Object.values(staticReviewsMap).forEach((revList: any) => {
                if (Array.isArray(revList)) {
                  revList.forEach((r: any) => {
                    if (r && r.id && !deletedReviewIds.has(r.id) && !reviewsMap.has(r.id)) {
                      reviewsMap.set(r.id, {
                        id: r.id,
                        appId: String(r.appId || '').trim(),
                        appSlug: String(r.appSlug || '').trim(),
                        appName: String(r.appName || '').trim(),
                        userName: String(r.userName || r.username || 'Player').trim(),
                        rating: Number(r.rating) || 5,
                        reviewText: sanitizeReviewText(String(r.reviewText || r.comment || ''), r.appName),
                        timestamp: r.timestamp || r.created_at || new Date().toISOString(),
                        status: r.status || 'published',
                        helpful_count: Number(r.helpful_count) || 0,
                        isPinned: Boolean(r.isPinned),
                        reported: false,
                        report_count: 0,
                        source: 'community',
                        adminReply: r.adminReply || null,
                        updated_at: r.updated_at || new Date().toISOString()
                      });
                    }
                  });
                }
              });
              console.log(`[CommunityPersistence] Zero-Quota Shield: Loaded ${reviewsMap.size} reviews from committed static reviews file.`);
            }
          }

          const catStatsPath = path.join(process.cwd(), 'src/lib/communityCatalogStats.json');
          if (fs.existsSync(catStatsPath)) {
            const catStats = JSON.parse(fs.readFileSync(catStatsPath, 'utf8'));
            if (catStats?.appCounts && typeof catStats.appCounts === 'object') {
              Object.entries(catStats.appCounts).forEach(([k, v]: [string, any]) => {
                if (k && v) {
                  const cleanKey = String(k).toLowerCase().trim();
                  if (!appStatsCache.has(cleanKey)) {
                    appStatsCache.set(cleanKey, {
                      publishedReviewCount: Number(v.published ?? v.total ?? 0),
                      publishedRatingSum: (Number(v.published ?? v.total ?? 0)) * (Number(v.avgRating ?? 4.8)),
                      starDistribution: v.starCounts || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
                    });
                  }
                }
              });
            }
          }
        } catch (staticErr) {
          console.warn('[CommunityPersistence] Static shield fallback error:', staticErr);
        }
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
                timestamp: d.timestamp || d.created_at || new Date().toISOString(),
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
        // Direct REST fetch to rummydexcommunity with pagination support
        const cfg = getCommunityFirebaseConfig();
        let pageToken = '';
        let hasMorePages = true;
        let pageCounter = 0;

        while (hasMorePages && pageCounter < 5) {
          pageCounter++;
          let url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${cfg.firestoreDatabaseId}/documents/reviews?pageSize=300&key=${encodeURIComponent(cfg.apiKey)}`;
          if (pageToken) {
            url += `&pageToken=${encodeURIComponent(pageToken)}`;
          }

          const res = await fetch(url);
          if (!res.ok) break;

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
                let parsedReply = null;
                if (fields.adminReply?.mapValue?.fields) {
                  const rFields = fields.adminReply.mapValue.fields;
                  parsedReply = {
                    text: getString(rFields.text),
                    author: getString(rFields.author) || 'Official Moderator',
                    timestamp: getString(rFields.timestamp) || new Date().toISOString()
                  };
                }

                const rev: ReviewRecord = {
                  id,
                  appId: getString(fields.appId) || getString(fields.app_id),
                  appSlug: getString(fields.appSlug),
                  appName,
                  userName: getString(fields.userName) || getString(fields.username) || 'Player',
                  rating: getNum(fields.rating) || 5,
                  reviewText: sanitizeReviewText(getString(fields.reviewText) || getString(fields.comment), appName),
                  timestamp: getString(fields.timestamp) || getString(fields.created_at) || new Date().toISOString(),
                  status: (getString(fields.status) as any) || 'published',
                  helpful_count: getNum(fields.helpful_count),
                  isPinned: getBool(fields.isPinned),
                  reported: getBool(fields.reported),
                  report_count: getNum(fields.report_count),
                  source: getString(fields.source) || 'community',
                  adminReply: parsedReply,
                  updated_at: getString(fields.updated_at) || new Date().toISOString()
                };
                reviewsMap.set(id, rev);
                loadedCount++;
              }
            });
          }

          if (json.nextPageToken) {
            pageToken = json.nextPageToken;
          } else {
            hasMorePages = false;
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

  public flushSaveToDisk(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ) {
    if (this.diskSyncTimer) {
      clearTimeout(this.diskSyncTimer);
      this.diskSyncTimer = null;
    }
    this.executeDiskSync(reviewsMap, reportsMap, deletedReviewIds, appStatsCache);
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

      // Atomically sync communityCatalogStats.json for instant 0ms SEO and client stat reads
      try {
        const catStatsPath = path.join(process.cwd(), 'src/lib/communityCatalogStats.json');
        let pubCount = 0;
        let pendCount = 0;
        let rejCount = 0;
        let ratingSum = 0;
        const globalDist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        const appCountsOutput: Record<string, any> = {};

        const staticData = getStaticData();
        const catalogApps = staticData.apps || staticData.mockApps || [];

        reviewsMap.forEach(r => {
          const s = r.status || 'published';
          if (s === 'published' || s === 'approved') {
            pubCount++;
            const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
            ratingSum += star;
            globalDist[String(star)] = (globalDist[String(star)] || 0) + 1;
          } else if (s === 'pending') {
            pendCount++;
          } else if (s === 'rejected') {
            rejCount++;
          }
        });

        // 1. Populate appCountsOutput from appStatsCache
        appStatsCache.forEach((stats, key) => {
          const count = Number(stats.publishedReviewCount) || 0;
          if (count <= 0) return;
          const sum = Number(stats.publishedRatingSum) || (count * 5);
          const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 5.0;
          appCountsOutput[key] = {
            total: count,
            published: count,
            avgRating: avg,
            starCounts: stats.starDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': count }
          };
        });

        // 2. Ensure both ID and Slug exist for every catalog app that has reviews
        catalogApps.forEach((a: any) => {
          if (!a) return;
          const idKey = a.id !== undefined && a.id !== null ? String(a.id).toLowerCase().trim() : '';
          const slugKey = a.slug ? String(a.slug).toLowerCase().trim() : '';
          if (idKey && appCountsOutput[idKey]) {
            if (slugKey && !appCountsOutput[slugKey]) {
              appCountsOutput[slugKey] = { ...appCountsOutput[idKey] };
            }
          } else if (slugKey && appCountsOutput[slugKey]) {
            if (idKey && !appCountsOutput[idKey]) {
              appCountsOutput[idKey] = { ...appCountsOutput[slugKey] };
            }
          }
        });

        const catalogStatsData = {
          totalReviews: pubCount + pendCount + rejCount,
          publishedReviews: pubCount,
          pendingReviews: pendCount,
          rejectedReviews: rejCount,
          flaggedReviews: 0,
          totalReports: reportsMap.size,
          pendingReports: Array.from(reportsMap.values()).filter(r => r.status === 'pending' || r.status === 'in_review').length,
          averageRating: pubCount > 0 ? parseFloat((ratingSum / pubCount).toFixed(1)) : 4.8,
          ratingDistribution: globalDist,
          appCounts: appCountsOutput,
          updated_at: new Date().toISOString()
        };

        const catTmpPath = catStatsPath + '.tmp';
        fs.writeFileSync(catTmpPath, JSON.stringify(catalogStatsData, null, 2), 'utf8');
        fs.renameSync(catTmpPath, catStatsPath);

        // Sync to single document in Firestore (catalog_stats & atomic_counts)
        // This is 1 SINGLE document write to the community Firebase, consuming minimal quota!
        const db = getCommunityAdminDb();
        if (db) {
          db.collection('community_store').doc('catalog_stats').set(catalogStatsData, { merge: true }).catch(() => {});
          db.collection('community_store').doc('atomic_counts').set(catalogStatsData, { merge: true }).catch(() => {});
        } else {
          writeCommunityRestDoc('catalog_stats', catalogStatsData, true, 'community_store').catch(() => {});
          writeCommunityRestDoc('atomic_counts', catalogStatsData, true, 'community_store').catch(() => {});
        }
      } catch (catErr) {
        console.warn('[CommunityPersistence] Catalog stats write notice:', catErr);
      }
    } catch (e) {
      console.warn('[CommunityPersistence] Local backup write error:', e);
    }
  }

  public reconcileStatsCache(
    reviewsMap: Map<string, ReviewRecord>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ) {
    const appMap: Record<string, { count: number; sum: number; stars: Record<string, number>; canonicalId: string; canonicalSlug: string }> = {};

    reviewsMap.forEach(r => {
      if (r.status && r.status !== 'published' && r.status !== 'approved') return;
      const rawId = String(r.appId || r.appSlug || '').trim();
      if (!rawId) return;
      const resolved = resolveCanonicalApp(rawId, r.appSlug, r.appName);
      const canonicalKey = resolved.canonicalId.toLowerCase().trim();

      if (!appMap[canonicalKey]) {
        appMap[canonicalKey] = {
          count: 0,
          sum: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          canonicalId: resolved.canonicalId,
          canonicalSlug: resolved.canonicalSlug
        };
      }
      const entry = appMap[canonicalKey];
      entry.count++;
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      entry.sum += star;
      entry.stars[String(star)] = (entry.stars[String(star)] || 0) + 1;
    });

    for (const [canonicalKey, data] of Object.entries(appMap)) {
      const existing = appStatsCache.get(canonicalKey);
      let count = data.count;
      let sum = data.sum;
      let stars = { ...data.stars };

      // Retain historical volume baseline if older reviews were archived or chunked across sessions
      if (existing && existing.publishedReviewCount > data.count) {
        count = existing.publishedReviewCount;
        sum = Math.max(existing.publishedRatingSum, data.sum);
        for (let s = 1; s <= 5; s++) {
          const sKey = String(s);
          stars[sKey] = Math.max(existing.starDistribution?.[sKey] || 0, data.stars[sKey] || 0);
        }
      }

      const statsItem: AppStatsCacheItem = {
        publishedReviewCount: count,
        publishedRatingSum: sum,
        starDistribution: stars
      };
      appStatsCache.set(canonicalKey, statsItem);
      if (data.canonicalSlug) {
        appStatsCache.set(data.canonicalSlug.toLowerCase().trim(), statsItem);
      }
    }
  }
}

export const communityPersistence = new CommunityPersistence();
