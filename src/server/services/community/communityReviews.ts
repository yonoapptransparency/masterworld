import { getCommunityAdminDb, atomicUpdateAppStats } from '../../communityFirebaseAdmin';
import { ReviewRecord, AppStatsCacheItem } from './communityTypes';
import { resolveCanonicalApp, findAppInCatalog, doesReviewMatchApp, sanitizeReviewText, formatReviewDate, withTimeout } from './communityUtils';
import { communityDbHelper } from './communityDbHelper';
import { communityStatsManager } from './communityStats';
import { communityChunksManager } from './communityChunks';

export class CommunityReviewsManager {
  public applyStatsToCache(appId: string, incs: any, appStatsCache: Map<string, AppStatsCacheItem>) {
    const resolved = resolveCanonicalApp(appId);
    const targetKey = resolved.canonicalId;

    let stats = appStatsCache.get(targetKey);
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
    appStatsCache.set(targetKey, stats);
    if (resolved.canonicalSlug && resolved.canonicalSlug !== targetKey) {
      appStatsCache.set(resolved.canonicalSlug, stats);
    }
  }

  public async addReview(
    payload: Partial<ReviewRecord> & Record<string, any>,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    onSaveCallback: () => void
  ): Promise<ReviewRecord> {
    const rawAppId = String(payload.appId || payload.app_id || '').trim();
    const resolved = resolveCanonicalApp(rawAppId, payload.appSlug, payload.appName);
    
    const targetAppId = resolved.canonicalId;
    const targetAppSlug = resolved.canonicalSlug;
    const targetAppName = resolved.canonicalName;

    const isAi = payload.source === 'ai_generated';
    const simulatedDeviceId = payload.userId ? String(payload.userId).replace('fallback_', 'device_') : `device_${Date.now()}_${Math.random().toString(16).substring(2, 10)}`;
    const deviceId = isAi ? simulatedDeviceId : (payload.deviceId || `anon_${Math.random().toString(16).substring(2, 10)}`);
    const id = payload.id || `rev_${targetAppId}_${deviceId}`;
    
    // Anti-Spam: Treat duplicate as Edit
    const existing = reviewsMap.get(id);
    if (existing) {
       return (await this.updateReview(id, payload, reviewsMap, deletedReviewIds, appStatsCache, onSaveCallback)) as ReviewRecord;
    }
    deletedReviewIds.delete(id);
    const newRev: ReviewRecord = {
      id,
      appId: targetAppId,
      appSlug: targetAppSlug,
      appName: targetAppName,
      userName: String(payload.userName || payload.username || payload.author || 'Player').trim().substring(0, 50),
      rating: Math.max(1, Math.min(5, Math.round(Number(payload.rating) || 5))),
      reviewText: sanitizeReviewText(String(payload.reviewText || payload.comment || payload.text || ''), targetAppName),
      timestamp: formatReviewDate(payload.timestamp || payload.date || payload.created_at),
      status: (payload.status as any) || 'published',
      helpful_count: Number(payload.helpful_count || payload.helpfulCount) || 0,
      isPinned: Boolean(payload.isPinned),
      reported: Boolean(payload.reported),
      report_count: Number(payload.report_count) || 0,
      source: payload.source || 'community',
      adminReply: payload.adminReply || null,
      updated_at: formatReviewDate()
    };

    reviewsMap.set(id, newRev);
    onSaveCallback();
    communityChunksManager.markDirty(targetAppId, reviewsMap, deletedReviewIds, appStatsCache);

    // Atomic stats update
    if (newRev.status === 'published' || newRev.status === 'approved') {
      const incs: any = { publishedReviewCount: 1, publishedRatingSum: newRev.rating };
      incs[`star${newRev.rating}`] = 1;
      this.applyStatsToCache(targetAppId, incs, appStatsCache);
      atomicUpdateAppStats(targetAppId, incs).catch(e => console.warn(e));
    }

    // Direct write to Firestore rummydexcommunity 'reviews' collection
    const db = getCommunityAdminDb();
    try {
      if (db) {
        db.collection('reviews').doc(id).set(newRev).catch((e: any) => {
          if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown();
          console.warn("[CommunityReviewsManager] Firestore direct review write notice:", e?.message || e);
        });
      } else {
        communityDbHelper.safeWriteDb(id, newRev, true, 'reviews').catch((e: any) => {
          if (communityDbHelper.isQuotaError(e)) communityDbHelper.handleQuotaCooldown();
          console.warn("[CommunityReviewsManager] REST review write notice:", e?.message || e);
        });
      }
    } catch (e: any) {
      console.warn("[CommunityReviewsManager] Direct review write exception:", e?.message || e);
    }

    communityChunksManager.syncAppChunksToFirestore(targetAppId, reviewsMap, deletedReviewIds, appStatsCache).catch((err: any) => {
      console.warn("[CommunityReviewsManager] Post-review chunk sync notice:", err?.message || err);
    });

    return newRev;
  }

  public async bulkActionReviews(
    ids: string[],
    action: 'publish' | 'pending' | 'reject' | 'delete' | 'pin' | 'unpin',
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    onSaveCallback: () => void
  ): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    
    let count = 0;
    const affectedApps = new Set<string>();
    const appIncrements = new Map<string, any>();
    const db = getCommunityAdminDb();
    
    for (const id of ids) {
      const cleanId = String(id || '').trim();
      if (!cleanId) continue;
      
      let existing = reviewsMap.get(cleanId);
      if (!existing) continue;
      
      const resolved = resolveCanonicalApp(existing.appId, existing.appSlug, existing.appName);
      const targetAppId = resolved.canonicalId;
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
         deletedReviewIds.add(cleanId);
         reviewsMap.delete(cleanId);
         count++;
      } else {
         const updated = { 
           ...existing, 
           appId: targetAppId,
           appSlug: resolved.canonicalSlug,
           appName: resolved.canonicalName,
           updated_at: new Date().toISOString() 
         };
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
         
         deletedReviewIds.delete(cleanId);
         reviewsMap.set(cleanId, updated);
         count++;
      }
    }
    
    // Apply atomic increments
    for (const [appId, incs] of appIncrements.entries()) {
      if (Object.keys(incs).length > 0) {
        this.applyStatsToCache(appId, incs, appStatsCache);
        atomicUpdateAppStats(appId, incs).catch(e => console.warn(e));
      }
    }
    
    if (db) {
       const BATCH_LIMIT = 400;
       for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
          const batchSlice = ids.slice(i, i + BATCH_LIMIT);
          const batch = db.batch();
          batchSlice.forEach(id => {
             if (action === 'delete') {
                batch.delete(db.collection('reviews').doc(id));
             } else {
                const rev = reviewsMap.get(id);
                if (rev) batch.set(db.collection('reviews').doc(id), rev, { merge: true });
             }
          });
          batch.commit().catch(e => console.warn('[CommunityReviewsManager] Bulk batch commit error:', e));
       }
    } else {
       ids.forEach(id => {
          if (action === 'delete') {
             communityDbHelper.safeDeleteDb(id, 'reviews').catch(e => console.warn(e));
          } else {
             const rev = reviewsMap.get(id);
             if (rev) communityDbHelper.safeWriteDb(id, rev, true, 'reviews').catch(e => console.warn(e));
          }
       });
    }

    onSaveCallback();
    affectedApps.forEach(appId => {
       communityChunksManager.markDirty(appId, reviewsMap, deletedReviewIds, appStatsCache);
       communityChunksManager.syncAppChunksToFirestore(appId, reviewsMap, deletedReviewIds, appStatsCache).catch(e => console.warn(e));
    });
    
    return count;
  }

  public async addMultipleReviews(
    reviewsList: (Partial<ReviewRecord> & Record<string, any>)[],
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    onSaveCallback: () => void
  ): Promise<ReviewRecord[]> {
    const added: ReviewRecord[] = [];
    const affectedApps = new Set<string>();
    const appIncrements = new Map<string, any>();

    for (const payload of reviewsList) {
      const rawAppId = String(payload.appId || payload.app_id || '').trim();
      const resolved = resolveCanonicalApp(rawAppId, payload.appSlug, payload.appName);
      
      const targetAppId = resolved.canonicalId;
      const targetAppSlug = resolved.canonicalSlug;
      const targetAppName = resolved.canonicalName;
      
      const isAi = payload.source === 'ai_generated';
      const simulatedDeviceId = payload.userId ? String(payload.userId).replace('fallback_', 'device_') : `device_${Date.now()}_${Math.random().toString(16).substring(2, 10)}`;
      const deviceId = isAi ? simulatedDeviceId : (payload.deviceId || `anon_${Math.random().toString(16).substring(2, 10)}`);
      const id = payload.id || `rev_${targetAppId}_${deviceId}`;

      const existing = reviewsMap.get(id);
      if (existing) {
         const updated = await this.updateReview(id, payload, reviewsMap, deletedReviewIds, appStatsCache, onSaveCallback);
         if (updated) added.push(updated);
         continue;
      }
      
      deletedReviewIds.delete(id);

      const newRev: ReviewRecord = {
        id,
        appId: targetAppId,
        appSlug: targetAppSlug,
        appName: targetAppName,
        userName: String(payload.userName || payload.username || payload.author || 'Player').trim().substring(0, 50),
        rating: Math.max(1, Math.min(5, Math.round(Number(payload.rating) || 5))),
        reviewText: sanitizeReviewText(String(payload.reviewText || payload.comment || payload.text || ''), targetAppName),
        timestamp: formatReviewDate(payload.timestamp || payload.date || payload.created_at),
        status: (payload.status as any) || 'published',
        helpful_count: Number(payload.helpful_count || payload.helpfulCount) || Math.floor(Math.random() * 8),
        isPinned: Boolean(payload.isPinned),
        reported: false,
        report_count: 0,
        source: payload.source || 'community',
        adminReply: payload.adminReply || null,
        updated_at: formatReviewDate(payload.updated_at)
      };

      added.push(newRev);
      reviewsMap.set(newRev.id, newRev);
      
      if (newRev.status === 'published' || newRev.status === 'approved') {
        if (!appIncrements.has(targetAppId)) {
          appIncrements.set(targetAppId, { publishedReviewCount: 0, publishedRatingSum: 0, star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 });
        }
        const incs = appIncrements.get(targetAppId);
        incs.publishedReviewCount++;
        incs.publishedRatingSum += newRev.rating;
        incs[`star${newRev.rating}`]++;
      }
      
      affectedApps.add(targetAppId);
    }

    for (const [appId, incs] of appIncrements.entries()) {
      this.applyStatsToCache(appId, incs, appStatsCache);
      atomicUpdateAppStats(appId, incs).catch(e => console.warn(e));
    }

    onSaveCallback();
    affectedApps.forEach(appId => {
      communityChunksManager.markDirty(appId, reviewsMap, deletedReviewIds, appStatsCache);
      communityChunksManager.syncAppChunksToFirestore(appId, reviewsMap, deletedReviewIds, appStatsCache).catch(e => console.warn(e));
    });

    const db = getCommunityAdminDb();
    if (db && added.length > 0) {
      const BATCH_LIMIT = 400;
      for (let i = 0; i < added.length; i += BATCH_LIMIT) {
        const batchSlice = added.slice(i, i + BATCH_LIMIT);
        const batch = db.batch();
        batchSlice.forEach(r => {
          batch.set(db.collection('reviews').doc(r.id), r, { merge: true });
        });
        batch.commit().catch(e => console.warn('[CommunityReviewsManager] Batch commit error:', e));
      }
    }

    return added;
  }

  public async updateReview(
    id: string,
    updates: Partial<ReviewRecord>,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    onSaveCallback: () => void
  ): Promise<ReviewRecord | null> {
    let existing = reviewsMap.get(id);
    if (!existing) {
      try {
        const db = getCommunityAdminDb();
        if (db) {
          const docSnap = await db.collection('reviews').doc(id).get();
          if (docSnap.exists) {
            existing = { id, ...docSnap.data() } as ReviewRecord;
            reviewsMap.set(id, existing);
          }
        } else {
          const remoteDoc: any = await communityDbHelper.safeReadDb(id, 'reviews');
          if (remoteDoc) {
            existing = { id, ...remoteDoc } as ReviewRecord;
            reviewsMap.set(id, existing);
          }
        }
      } catch (_) {}
    }
    
    if (!existing) {
      const resolved = resolveCanonicalApp(updates.appId || 'unknown', updates.appSlug, updates.appName);
      existing = {
        id,
        appId: resolved.canonicalId,
        appSlug: resolved.canonicalSlug,
        appName: resolved.canonicalName,
        userName: updates.userName || 'Admin',
        rating: updates.rating || 5,
        reviewText: updates.reviewText || '',
        timestamp: formatReviewDate(updates.timestamp),
        status: updates.status || 'published',
        helpful_count: updates.helpful_count || 0,
        isPinned: Boolean(updates.isPinned),
        reported: Boolean(updates.reported),
        report_count: updates.report_count || 0,
        source: 'admin_edit'
      };
      reviewsMap.set(id, existing);
    }

    deletedReviewIds.delete(id);

    const resolvedApp = resolveCanonicalApp(updates.appId || existing.appId, updates.appSlug || existing.appSlug, updates.appName || existing.appName);

    const updated: ReviewRecord = {
      ...existing,
      ...updates,
      appId: resolvedApp.canonicalId,
      appSlug: resolvedApp.canonicalSlug,
      appName: resolvedApp.canonicalName,
      reviewText: updates.reviewText ? sanitizeReviewText(updates.reviewText, updates.appName || existing.appName) : existing.reviewText,
      updated_at: formatReviewDate()
    };

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
      this.applyStatsToCache(updated.appId, incs, appStatsCache);
      atomicUpdateAppStats(updated.appId, incs).catch(e => console.warn(e));
    }
    
    reviewsMap.set(id, updated);
    onSaveCallback();
    if (updated.appId) communityChunksManager.markDirty(updated.appId, reviewsMap, deletedReviewIds, appStatsCache);

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(id).set(updated, { merge: true }).catch((e: any) => console.warn(e));
    } else {
      communityDbHelper.safeWriteDb(id, updated, true, 'reviews').catch((e: any) => console.warn(e));
    }
    if (updated.appId) {
      communityChunksManager.syncAppChunksToFirestore(updated.appId, reviewsMap, deletedReviewIds, appStatsCache).catch((e: any) => console.warn(e));
    }

    return updated;
  }

  public async deleteReview(
    id: string,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    onSaveCallback: () => void
  ): Promise<boolean> {
    const cleanId = String(id || '').trim();
    if (!cleanId) return false;
    
    let existing = reviewsMap.get(cleanId);
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

    if (targetAppId) {
      const resolved = resolveCanonicalApp(targetAppId);
      targetAppId = resolved.canonicalId;
    }

    const wasPublished = existing && (existing.status === 'published' || existing.status === 'approved');
    if (wasPublished && targetAppId) {
      const incs: any = { publishedReviewCount: -1, publishedRatingSum: -existing.rating };
      incs[`star${existing.rating}`] = -1;
      this.applyStatsToCache(targetAppId, incs, appStatsCache);
      atomicUpdateAppStats(targetAppId, incs).catch(e => console.warn(e));
    }
    
    deletedReviewIds.add(cleanId);
    reviewsMap.delete(cleanId);
    onSaveCallback();
    if (targetAppId) communityChunksManager.markDirty(targetAppId, reviewsMap, deletedReviewIds, appStatsCache);

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(cleanId).delete().catch((e: any) => console.warn(e));
    } else {
      communityDbHelper.safeDeleteDb(cleanId, 'reviews').catch((e: any) => console.warn(e));
    }
    if (targetAppId) {
      communityChunksManager.syncAppChunksToFirestore(targetAppId, reviewsMap, deletedReviewIds, appStatsCache).catch((e: any) => console.warn(e));
    }

    return true;
  }

  public async deleteReviewsForApp(
    appIdentifier: string,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    onSaveCallback: () => void
  ): Promise<number> {
    const resolved = resolveCanonicalApp(appIdentifier);
    let count = 0;
    const canonicalTargetId = resolved.canonicalId;

    for (const [id, rev] of Array.from(reviewsMap.entries())) {
      const revAppId = String(rev.appId || '').toLowerCase().trim();

      if (revAppId === canonicalTargetId.toLowerCase()) {
        const existing = reviewsMap.get(id);
        if (existing && (existing.status === 'published' || existing.status === 'approved')) {
          const incs: any = { publishedReviewCount: -1, publishedRatingSum: -existing.rating };
          incs[`star${existing.rating}`] = -1;
          this.applyStatsToCache(canonicalTargetId, incs, appStatsCache);
          atomicUpdateAppStats(canonicalTargetId, incs).catch(e => console.warn(e));
        }
        deletedReviewIds.add(id);
        reviewsMap.delete(id);
        count++;
      }
    }

    onSaveCallback();
    communityChunksManager.markDirty(canonicalTargetId, reviewsMap, deletedReviewIds, appStatsCache);
    return count;
  }

  public async voteHelpful(
    reviewId: string,
    reviewsMap: Map<string, ReviewRecord>,
    onSaveCallback: () => void
  ): Promise<number> {
    const cleanId = String(reviewId || '').trim();
    if (!cleanId) return 0;

    let existing = reviewsMap.get(cleanId);
    let count = (existing?.helpful_count || 0) + 1;

    if (existing) {
      existing.helpful_count = count;
      existing.updated_at = new Date().toISOString();
      reviewsMap.set(cleanId, existing);
    }

    const db = getCommunityAdminDb();
    if (db) {
      try {
        const admin = require('firebase-admin');
        const FieldValue = admin.firestore.FieldValue;
        db.collection('reviews').doc(cleanId).set({
          helpful_count: FieldValue.increment(1),
          updated_at: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      } catch (_) {}
    }

    onSaveCallback();
    return count;
  }

  public async reportReview(
    reviewId: string,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    onSaveCallback: () => void,
    appId?: string,
    reason?: string,
    details?: string,
    ip?: string
  ): Promise<boolean> {
    const existing = reviewsMap.get(reviewId);
    if (existing) {
      existing.reported = true;
      existing.report_count = (existing.report_count || 0) + 1;
      existing.updated_at = new Date().toISOString();
      reviewsMap.set(reviewId, existing);
    }

    const db = getCommunityAdminDb();
    if (db) {
      db.collection('reviews').doc(reviewId).set({
        reported: true,
        report_count: (existing?.report_count || 1),
        updated_at: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }

    onSaveCallback();
    return true;
  }

  public async getReviewsForApp(
    appIdentifier: string,
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    cursor?: string,
    limitCount = 5,
    appTitle?: string,
    overallRating = 5.0,
    appSlug?: string,
    filter: string = 'all',
    sortBy: string = 'recent',
    isBot: boolean = false
  ) {
    const catalogApp = findAppInCatalog(appIdentifier) || (appSlug ? findAppInCatalog(appSlug) : null);
    const cleanId = catalogApp && catalogApp.id ? String(catalogApp.id).toLowerCase().trim() : String(appIdentifier || '').toLowerCase().trim();
    const effectiveSlug = appSlug || catalogApp?.slug;

    const getMatchingReviews = () => {
      return Array.from(reviewsMap.values()).filter(r => {
        if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
        return doesReviewMatchApp(r, cleanId, effectiveSlug);
      });
    };

    let memList = getMatchingReviews();

    if (memList.length === 0 && !isBot) {
      await communityChunksManager.ensureAllReviewsLoadedForApp(cleanId, reviewsMap, deletedReviewIds, appStatsCache, false);
      memList = getMatchingReviews();
    }

    let filteredList = memList;
    if (filter === 'positive') filteredList = memList.filter(r => (r.rating || 5) >= 4);
    if (filter === 'critical') filteredList = memList.filter(r => (r.rating || 5) <= 3);

    filteredList.sort((a, b) => {
      const aIsPinned = Boolean(a.isPinned);
      const bIsPinned = Boolean(b.isPinned);
      if (aIsPinned !== bIsPinned) return aIsPinned ? -1 : 1;
      if (sortBy === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      if (sortBy === 'highest') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'lowest') return (a.rating || 5) - (b.rating || 5);
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });

    let startIndex = 0;
    if (cursor) {
      const idx = filteredList.findIndex(r => r.id === cursor);
      if (idx >= 0) startIndex = idx + 1;
    }

    // Strictly limit public reviews to 5 per batch for quota efficiency
    const effectiveLimit = Math.min(5, Math.max(1, limitCount));
    const pageReviews = filteredList.slice(startIndex, startIndex + effectiveLimit);
    const hasMore = startIndex + effectiveLimit < filteredList.length;
    const nextCursor = hasMore && pageReviews.length > 0 ? pageReviews[pageReviews.length - 1].id : null;

    const fullStats = await communityStatsManager.getAppStats(cleanId, reviewsMap, appStatsCache, overallRating, appTitle, appSlug);

    return { 
      reviews: pageReviews, 
      hasMore, 
      nextCursor, 
      total: fullStats.totalReviews, 
      stats: fullStats 
    };
  }

  public async queryAdminReviews(
    query: {
      appId?: string;
      status?: string;
      rating?: string | number;
      search?: string;
      isPinned?: string;
      sortBy?: string;
      limit?: number;
      page?: number;
      refresh?: boolean;
    },
    reviewsMap: Map<string, ReviewRecord>,
    deletedReviewIds: Set<string>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    onSaveCallback: () => void
  ) {
    if (query.refresh && !communityDbHelper.isQuotaProtected()) {
      try {
        const db = getCommunityAdminDb();
        if (db) {
          try {
            const snap = await withTimeout(db.collection('reviews').orderBy('timestamp', 'desc').limit(50).get(), 5000, null);
            if (snap && snap.docs && snap.docs.length > 0) {
              snap.docs.forEach((docSnap: any) => {
                const d = docSnap.data();
                if (!deletedReviewIds.has(docSnap.id)) {
                  reviewsMap.set(docSnap.id, { id: docSnap.id, ...d });
                }
              });
              onSaveCallback();
            }
          } catch (adminErr: any) {}
        }
      } catch (e) {}
    }

    let list = Array.from(reviewsMap.values());

    if (query.appId && query.appId !== 'all') {
      const catalogApp = findAppInCatalog(query.appId);
      const targetAppId = catalogApp && catalogApp.id ? String(catalogApp.id).toLowerCase().trim() : String(query.appId).toLowerCase().trim();
      await communityChunksManager.ensureAllReviewsLoadedForApp(targetAppId, reviewsMap, deletedReviewIds, appStatsCache, Boolean(query.refresh));
      list = Array.from(reviewsMap.values());

      list = list.filter(r => {
        return doesReviewMatchApp(r, targetAppId, catalogApp?.slug);
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

    const overview = communityStatsManager.getAppReviewCounts(reviewsMap, appStatsCache, null);

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
}

export const communityReviewsManager = new CommunityReviewsManager();
