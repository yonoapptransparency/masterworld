import { getCommunityAdminDb, readCommunityRestDoc, getCommunityFirebaseConfig, parseFirestoreFields } from '../../communityFirebaseAdmin';
import { getStaticData } from '../../config';
import { ReviewRecord, AppReviewChunkDocument, AppStatsCacheItem } from './communityTypes';
import { getAppChunkDocId, resolveCanonicalApp, doesReviewMatchApp, sanitizeReviewText, withTimeout, formatReviewDate } from './communityUtils';
import { communityDbHelper } from './communityDbHelper';

export class CommunityChunksManager {
  private loadedAppsMap: Map<string, number> = new Map();
  private appChunkCache: Map<string, AppReviewChunkDocument> = new Map();
  private dirtyAppIds = new Set<string>();
  private syncTimer: NodeJS.Timeout | null = null;
  private isChunkSyncing = false;

  public async loadSingleAppReviewsChunk(
    appIdentifier: string,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    forceRefresh: boolean = false
  ): Promise<number> {
    const cleanId = String(appIdentifier || '').toLowerCase().trim();
    if (!cleanId) return 0;
    if (!forceRefresh && this.loadedAppsMap.has(cleanId)) return 0;
    this.loadedAppsMap.set(cleanId, Date.now());

    if (communityDbHelper.isQuotaProtected()) return 0;

    try {
      const chunkDoc = await readCommunityRestDoc(`app_reviews_${cleanId}_0`, 'community_store');
      let loaded = 0;
      if (chunkDoc && Array.isArray(chunkDoc.reviews) && chunkDoc.reviews.length > 0) {
        chunkDoc.reviews.forEach((r: any) => {
          if (r && r.id && !deletedReviewIds.has(r.id)) {
            if (!reviewsMap.has(r.id)) {
              reviewsMap.set(r.id, {
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
              loaded++;
            }
          }
        });

        // Load all remaining chunks if app has multiple chunks
        if (chunkDoc.totalChunks && chunkDoc.totalChunks > 1) {
          for (let i = 1; i < chunkDoc.totalChunks; i++) {
            try {
              const nextChunkDoc = await readCommunityRestDoc(`app_reviews_${cleanId}_${i}`, 'community_store');
              if (nextChunkDoc && Array.isArray(nextChunkDoc.reviews)) {
                nextChunkDoc.reviews.forEach((r: any) => {
                  if (r && r.id && !deletedReviewIds.has(r.id) && !reviewsMap.has(r.id)) {
                    reviewsMap.set(r.id, {
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
                    loaded++;
                  }
                });
              }
            } catch (_) {}
          }
        }

        if (chunkDoc.stats) {
          const statsObj = {
            publishedReviewCount: Number(chunkDoc.stats.totalReviews) || loaded,
            publishedRatingSum: (Number(chunkDoc.stats.averageRating) || 5) * (Number(chunkDoc.stats.totalReviews) || loaded),
            starDistribution: chunkDoc.stats.starCounts || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
          };
          appStatsCache.set(cleanId, statsObj);
          const resolved = resolveCanonicalApp(cleanId);
          if (resolved.canonicalSlug) appStatsCache.set(resolved.canonicalSlug.toLowerCase().trim(), statsObj);
          if (resolved.canonicalId) appStatsCache.set(resolved.canonicalId.toLowerCase().trim(), statsObj);
        }
      }
      return loaded;
    } catch (e: any) {
      if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown();
      return 0;
    }
  }

  public async ensureAllReviewsLoadedForApp(
    appIdentifier: string,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    forceRefresh: boolean = false
  ): Promise<number> {
    const cleanId = String(appIdentifier || '').toLowerCase().trim();
    if (!cleanId) return 0;

    const now = Date.now();
    const lastLoaded = this.loadedAppsMap.get(cleanId) || 0;
    if (!forceRefresh && lastLoaded > 0) {
      return 0;
    }

    // Zero-Quota In-Memory Check: If reviewsMap is already populated, count matching reviews in memory first
    if (!forceRefresh && reviewsMap.size > 0) {
      const resolved = resolveCanonicalApp(cleanId);
      const targets = new Set([
        cleanId,
        resolved.canonicalId?.toLowerCase(),
        resolved.canonicalSlug?.toLowerCase()
      ].filter(Boolean) as string[]);

      let matchingInMemory = 0;
      reviewsMap.forEach(r => {
        const rAppId = (r.appId || '').toLowerCase().trim();
        const rAppSlug = (r.appSlug || '').toLowerCase().trim();
        if (targets.has(rAppId) || targets.has(rAppSlug)) {
          matchingInMemory++;
        }
      });

      this.loadedAppsMap.set(cleanId, now);
      return matchingInMemory;
    }

    let loadedCount = await this.loadSingleAppReviewsChunk(cleanId, reviewsMap, deletedReviewIds, appStatsCache, forceRefresh);

    if (forceRefresh && !communityDbHelper.isQuotaProtected()) {
      this.loadedAppsMap.set(cleanId, now);
      const resolved = resolveCanonicalApp(cleanId);
      const targets = Array.from(new Set([
        cleanId,
        resolved.canonicalId,
        resolved.canonicalId.toLowerCase(),
        resolved.canonicalSlug,
        resolved.canonicalSlug.toLowerCase()
      ].filter(Boolean)));

      const db = getCommunityAdminDb();
      if (db) {
        try {
          const snaps = await withTimeout(
            Promise.all([
              db.collection('reviews').where('appId', 'in', targets).limit(50).get(),
              db.collection('reviews').where('appSlug', 'in', targets).limit(50).get()
            ]),
            5000,
            [] as any
          );

          snaps.forEach((snap: any) => {
            if (snap && snap.docs && snap.docs.length > 0) {
              snap.docs.forEach((docSnap: any) => {
                const d = docSnap.data();
                const id = docSnap.id || d.id;
                if (id && !deletedReviewIds.has(id)) {
                  reviewsMap.set(id, {
                    id,
                    appId: d.appId || resolved.canonicalId || cleanId,
                    appSlug: d.appSlug || resolved.canonicalSlug || '',
                    appName: d.appName || resolved.canonicalName || '',
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
                    updated_at: d.updated_at || new Date().toISOString()
                  });
                  loadedCount++;
                }
              });
            }
          });
        } catch (err: any) {
          if (communityDbHelper.isQuotaError(err)) communityDbHelper.handleQuotaCooldown();
        }
      }

      // REST query fallback if Admin SDK returned 0 reviews
      if (loadedCount === 0) {
        try {
          const cfg = getCommunityFirebaseConfig();
          const queryUrl = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${cfg.firestoreDatabaseId}/documents:runQuery?key=${encodeURIComponent(cfg.apiKey)}`;
          const idFilters = targets.map(t => ({
            fieldFilter: { field: { fieldPath: "appId" }, op: "EQUAL", value: { stringValue: t } }
          }));
          const slugFilters = targets.map(t => ({
            fieldFilter: { field: { fieldPath: "appSlug" }, op: "EQUAL", value: { stringValue: t } }
          }));
          const allFilters = [...idFilters, ...slugFilters];

          const queryBody = {
            structuredQuery: {
              from: [{ collectionId: "reviews" }],
              where: {
                compositeFilter: {
                  op: "OR",
                  filters: allFilters
                }
              },
              limit: 50
            }
          };

          const queryRes = await fetch(queryUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryBody)
          });

          if (queryRes.ok) {
            const results = await queryRes.json();
            if (Array.isArray(results)) {
              results.forEach((item: any) => {
                if (item && item.document && item.document.fields) {
                  const docFields = parseFirestoreFields(item.document.fields);
                  const docPathParts = (item.document.name || '').split('/');
                  const docId = docPathParts[docPathParts.length - 1] || docFields.id;
                  if (docId && !deletedReviewIds.has(docId)) {
                    reviewsMap.set(docId, {
                      id: docId,
                      appId: docFields.appId || resolved.canonicalId || cleanId,
                      appSlug: docFields.appSlug || resolved.canonicalSlug || '',
                      appName: docFields.appName || resolved.canonicalName || '',
                      userName: docFields.userName || docFields.username || 'Player',
                      rating: Number(docFields.rating) || 5,
                      reviewText: sanitizeReviewText(docFields.reviewText || docFields.comment || ''),
                      timestamp: docFields.timestamp || docFields.created_at || new Date().toISOString(),
                      status: docFields.status || (docFields.is_approved ? 'published' : 'pending') || 'published',
                      helpful_count: Number(docFields.helpful_count) || 0,
                      isPinned: Boolean(docFields.isPinned),
                      reported: Boolean(docFields.reported),
                      report_count: Number(docFields.report_count) || 0,
                      source: docFields.source || 'community',
                      adminReply: docFields.adminReply || null,
                      updated_at: docFields.updated_at || new Date().toISOString()
                    });
                    loadedCount++;
                  }
                }
              });
            }
          }
        } catch (restErr: any) {
          console.warn('[CommunityChunks] REST fallback query notice:', restErr?.message || restErr);
        }
      }
    }

    return loadedCount;
  }

  public async syncAppChunksToFirestore(
    appIdentifier: string,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ): Promise<boolean> {
    if (!appIdentifier) return false;
    const resolved = resolveCanonicalApp(appIdentifier);
    const officialId = resolved.canonicalId;
    const officialSlug = resolved.canonicalSlug;
    const officialName = resolved.canonicalName;

    // 1. Force refresh to pull all reviews from Firestore
    await this.ensureAllReviewsLoadedForApp(officialId, reviewsMap, deletedReviewIds, appStatsCache, true);

    // 2. Also explicitly read any existing chunk doc from Firestore to guarantee old reviews are never lost
    const chunkDocIdsToCheck = Array.from(new Set([
      getAppChunkDocId(officialId, 0),
      officialSlug ? getAppChunkDocId(officialSlug, 0) : null
    ].filter(Boolean) as string[]));

    for (const docId of chunkDocIdsToCheck) {
      try {
        const existingChunkDoc = await readCommunityRestDoc(docId, 'community_store');
        if (existingChunkDoc && Array.isArray(existingChunkDoc.reviews)) {
          existingChunkDoc.reviews.forEach((r: any) => {
            if (r && r.id && !deletedReviewIds.has(r.id) && !reviewsMap.has(r.id)) {
              reviewsMap.set(r.id, {
                id: r.id,
                appId: r.appId || officialId,
                appSlug: r.appSlug || officialSlug || '',
                appName: r.appName || officialName || '',
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
            }
          });

          // Also check subsequent chunks if doc has multiple chunks
          if (existingChunkDoc.totalChunks && existingChunkDoc.totalChunks > 1) {
            for (let cIdx = 1; cIdx < existingChunkDoc.totalChunks; cIdx++) {
              try {
                const baseKey = docId.replace(/_\d+$/, '');
                const nextDoc = await readCommunityRestDoc(`${baseKey}_${cIdx}`, 'community_store');
                if (nextDoc && Array.isArray(nextDoc.reviews)) {
                  nextDoc.reviews.forEach((r: any) => {
                    if (r && r.id && !deletedReviewIds.has(r.id) && !reviewsMap.has(r.id)) {
                      reviewsMap.set(r.id, {
                        id: r.id,
                        appId: r.appId || officialId,
                        appSlug: r.appSlug || officialSlug || '',
                        appName: r.appName || officialName || '',
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
                    }
                  });
                }
              } catch (_) {}
            }
          }
        }
      } catch (_) {}
    }

    const appReviews = Array.from(reviewsMap.values()).filter(r => {
      if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
      return doesReviewMatchApp(r, officialId, officialSlug);
    });

    if (appReviews.length === 0) {
      // Do not overwrite an existing chunk doc with empty if in-memory list is 0
      return false;
    }

    appReviews.sort((a, b) => {
      const aIsPinned = Boolean(a.isPinned);
      const bIsPinned = Boolean(b.isPinned);
      if (aIsPinned !== bIsPinned) return aIsPinned ? -1 : 1;
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });

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

    const CHUNK_SIZE = 100; // Stores up to 100 reviews per app document (~30KB, well within 1MB Firestore limit)
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

  public async syncAllAppsToChunks(
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ): Promise<{ totalApps: number; totalChunks: number }> {
    if (this.isChunkSyncing) return { totalApps: 0, totalChunks: 0 };
    this.isChunkSyncing = true;
    console.log('[CommunityChunksManager] Starting App-Scoped Document Bucketing synchronization...');
    const appIds = new Set<string>();
    for (const r of reviewsMap.values()) {
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
        await this.syncAppChunksToFirestore(id, reviewsMap, deletedReviewIds, appStatsCache);
        totalApps++;
        totalChunks++;
      } catch (err: any) {
        console.warn(`[CommunityChunksManager] Error syncing chunk for ${id}:`, err?.message || err);
      }
    }

    this.isChunkSyncing = false;
    console.log(`[CommunityChunksManager] App-Scoped Bucketing complete: ${totalApps} apps synchronized.`);
    return { totalApps, totalChunks };
  }

  public markDirty(
    appId: string,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ) {
    const cleanId = String(appId).trim();
    if (!cleanId) return;
    this.dirtyAppIds.add(cleanId);
    
    if (!this.syncTimer) {
      this.syncTimer = setTimeout(() => this.flushDirtyApps(reviewsMap, deletedReviewIds, appStatsCache), 30000); // 30 seconds
    }
  }

  private async flushDirtyApps(
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>
  ) {
    if (this.dirtyAppIds.size === 0) return;
    const appsToSync = Array.from(this.dirtyAppIds);
    this.dirtyAppIds.clear();
    this.syncTimer = null;
    
    console.log(`[CommunityChunksManager] Coalesced background sync starting for ${appsToSync.length} apps...`);
    let count = 0;
    for (const appId of appsToSync) {
      try {
        await this.syncAppChunksToFirestore(appId, reviewsMap, deletedReviewIds, appStatsCache);
        count++;
      } catch (err: any) {
        console.warn(`[CommunityChunksManager] Background sync failed for ${appId}:`, err?.message || err);
      }
    }
    console.log(`[CommunityChunksManager] Coalesced background sync finished. (${count} apps synced)`);
  }

  private async safeWriteChunkDoc(docId: string, data: any): Promise<boolean> {
    const db = getCommunityAdminDb();
    try {
      if (db) {
        await db.collection('community_store').doc(docId).set(data, { merge: false });
        return true;
      }
      return await communityDbHelper.safeWriteDb(docId, data, false, 'community_store');
    } catch (e: any) {
      if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown();
      console.warn(`[CommunityChunksManager] Chunk doc write notice for ${docId}:`, e?.message || e);
      return false;
    }
  }
}

export const communityChunksManager = new CommunityChunksManager();
