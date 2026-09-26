import fs from 'fs';
import path from 'path';
import { getCommunityAdminDb, readAllAppStats, readAppStats, writeCommunityRestDoc, ExactCommunityAggregationResult } from '../../communityFirebaseAdmin';
import { getStaticData } from '../../config';
import { ReviewRecord, ReportRecord, AppStatsCacheItem } from './communityTypes';
import { resolveCanonicalApp } from './communityUtils';

export class CommunityStatsManager {
  public getCommunityOverviewMetrics(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    cachedRemoteCounts: ExactCommunityAggregationResult | null
  ) {
    const list = Array.from(reviewsMap.values());
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

    const reportList = Array.from(reportsMap.values());
    const totalReports = reportList.length;
    const pendingReportsCount = reportList.filter(rep => !rep.status || rep.status === 'pending' || rep.status === 'in_review').length;

    const averageRating = ratedCount > 0 ? parseFloat((ratingSum / ratedCount).toFixed(1)) : 4.8;

    const effectiveTotal = Math.max(totalReviews, cachedRemoteCounts?.totalReviews || 0);
    const effectivePublished = Math.max(publishedCount, cachedRemoteCounts?.publishedReviews || 0);
    const effectivePending = cachedRemoteCounts?.pendingReviews !== undefined ? cachedRemoteCounts.pendingReviews : pendingCount;
    const effectiveRejected = cachedRemoteCounts?.rejectedReviews !== undefined ? cachedRemoteCounts.rejectedReviews : rejectedCount;
    const effectiveReports = Math.max(totalReports, cachedRemoteCounts?.totalReports || 0);
    const effectivePendingReports = cachedRemoteCounts?.pendingReports !== undefined ? cachedRemoteCounts.pendingReports : pendingReportsCount;

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
      lastAggregatedAt: cachedRemoteCounts?.lastAggregatedAt || new Date().toISOString()
    };
  }

  public getAppReviewCounts(
    reviewsMap: Map<string, ReviewRecord>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    cachedRemoteCounts: ExactCommunityAggregationResult | null
  ) {
    const list = Array.from(reviewsMap.values());
    const rawAppMap: Record<string, { total: number; published: number; pending: number; rejected: number; flagged: number; ratingSum: number; ratingCount: number; starCounts: Record<string, number> }> = {};

    // 1. Initialize app counts from atomic delta stats cache (Firestore app_stats)
    appStatsCache.forEach((stats, appId) => {
      const clean = String(appId || '').toLowerCase().trim();
      if (!clean) return;
      const pubCount = Number(stats.publishedReviewCount) || 0;
      const sum = Number(stats.publishedRatingSum) || (pubCount * 5);
      const starCounts: Record<string, number> = {
        '1': Number(stats.starDistribution?.['1'] || 0),
        '2': Number(stats.starDistribution?.['2'] || 0),
        '3': Number(stats.starDistribution?.['3'] || 0),
        '4': Number(stats.starDistribution?.['4'] || 0),
        '5': Number(stats.starDistribution?.['5'] || 0)
      };
      rawAppMap[clean] = {
        total: pubCount,
        published: pubCount,
        pending: 0,
        rejected: 0,
        flagged: 0,
        ratingSum: sum,
        ratingCount: pubCount,
        starCounts
      };
    });

    // 2. Track published, pending, rejected, and flagged moderation states directly from real in-memory review records
    const inMemStats: Record<string, { published: number; pending: number; rejected: number; flagged: number; ratingSum: number; starCounts: Record<string, number> }> = {};

    list.forEach(r => {
      const status = r.status || 'published';
      const isPublished = status === 'published' || status === 'approved';
      const rating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      const isReported = !!(r.reported || (r.report_count || 0) > 0);

      const keys = new Set<string>();
      if (r.appId) keys.add(String(r.appId).toLowerCase().trim());
      if (r.appSlug) keys.add(String(r.appSlug).toLowerCase().trim());

      keys.forEach(k => {
        if (!inMemStats[k]) {
          inMemStats[k] = { published: 0, pending: 0, rejected: 0, flagged: 0, ratingSum: 0, starCounts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } };
        }
        const s = inMemStats[k];
        if (isPublished) {
          s.published++;
          s.ratingSum += rating;
          s.starCounts[String(rating)] = (s.starCounts[String(rating)] || 0) + 1;
        } else if (status === 'pending') {
          s.pending++;
        } else if (status === 'rejected') {
          s.rejected++;
        }
        if (isReported) s.flagged++;
      });
    });

    // Merge inMemStats with rawAppMap: take the maximum of cached and in-memory published counts
    for (const [k, inMem] of Object.entries(inMemStats)) {
      if (!rawAppMap[k]) {
        rawAppMap[k] = {
          total: inMem.published + inMem.pending + inMem.rejected,
          published: inMem.published,
          pending: inMem.pending,
          rejected: inMem.rejected,
          flagged: inMem.flagged,
          ratingSum: inMem.ratingSum,
          ratingCount: inMem.published,
          starCounts: { ...inMem.starCounts }
        };
      } else {
        const existing = rawAppMap[k];
        existing.pending += inMem.pending;
        existing.rejected += inMem.rejected;
        existing.flagged += inMem.flagged;
        if (inMem.published > existing.published) {
          existing.published = inMem.published;
          existing.ratingSum = inMem.ratingSum;
          existing.ratingCount = inMem.published;
          existing.starCounts = { ...inMem.starCounts };
        } else if (inMem.published > 0) {
          for (let star = 1; star <= 5; star++) {
            const sKey = String(star);
            if (!existing.starCounts[sKey]) {
              existing.starCounts[sKey] = inMem.starCounts[sKey] || 0;
            }
          }
        }
        existing.total = existing.published + existing.pending + existing.rejected;
      }
    }

    // 3. Populate aliases strictly between the app ID and its matching slug
    const staticData = getStaticData();
    const apps = staticData.apps || staticData.mockApps || [];
    apps.forEach((a: any) => {
      if (!a) return;
      const idKey = a.id !== undefined && a.id !== null ? String(a.id).toLowerCase().trim() : '';
      const slugKey = a.slug ? String(a.slug).toLowerCase().trim() : '';
      if (idKey && rawAppMap[idKey]) {
        if (slugKey && slugKey !== idKey) {
          rawAppMap[slugKey] = { ...rawAppMap[idKey] };
        }
      } else if (slugKey && rawAppMap[slugKey]) {
        if (idKey && idKey !== slugKey) {
          rawAppMap[idKey] = { ...rawAppMap[slugKey] };
        }
      }
    });

    // 4. Calculate deduplicated global database totals
    let publishedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let flaggedCount = 0;
    let ratingSum = 0;
    let ratedCount = 0;

    const seenCanonicalKeys = new Set<string>();
    apps.forEach((a: any) => {
      const canonicalKey = (a.slug || a.id || '').toLowerCase().trim();
      if (!canonicalKey || seenCanonicalKeys.has(canonicalKey)) return;
      seenCanonicalKeys.add(canonicalKey);

      const entry = rawAppMap[canonicalKey];
      if (entry) {
        publishedCount += entry.published;
        pendingCount += entry.pending;
        rejectedCount += entry.rejected;
        flaggedCount += entry.flagged;
        ratingSum += entry.ratingSum;
        ratedCount += entry.ratingCount;
      }
    });

    // Also include any reviews that might belong to apps not in the catalog
    for (const [key, item] of Object.entries(rawAppMap)) {
      if (!seenCanonicalKeys.has(key)) {
        publishedCount += item.published;
        pendingCount += item.pending;
        rejectedCount += item.rejected;
        flaggedCount += item.flagged;
        ratingSum += item.ratingSum;
        ratedCount += item.ratingCount;
      }
    }

    const appCounts: Record<string, { total: number; published: number; pending: number; rejected: number; flagged: number; avgRating: number; starCounts?: Record<string, number> }> = {};
    for (const [key, item] of Object.entries(rawAppMap)) {
      appCounts[key] = {
        total: item.total,
        published: item.published,
        pending: item.pending,
        rejected: item.rejected,
        flagged: item.flagged,
        avgRating: item.ratingCount > 0 ? parseFloat((item.ratingSum / item.ratingCount).toFixed(1)) : 5.0,
        starCounts: item.starCounts
      };
    }

    const averageRating = ratedCount > 0 ? parseFloat((ratingSum / ratedCount).toFixed(1)) : 4.8;
    const effectiveTotal = Math.max(publishedCount + pendingCount + rejectedCount, cachedRemoteCounts?.totalReviews || 0);
    const effectivePublished = Math.max(publishedCount, cachedRemoteCounts?.publishedReviews || 0);
    const effectivePending = cachedRemoteCounts?.pendingReviews !== undefined ? cachedRemoteCounts.pendingReviews : pendingCount;
    const effectiveRejected = cachedRemoteCounts?.rejectedReviews !== undefined ? cachedRemoteCounts.rejectedReviews : rejectedCount;

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

  public async syncAppStatsFromFirestore(appStatsCache: Map<string, AppStatsCacheItem>): Promise<void> {
    try {
      const statsMap = await readAllAppStats();
      if (statsMap && typeof statsMap === 'object' && Object.keys(statsMap).length > 0) {
        for (const [id, stats] of Object.entries(statsMap)) {
          const item = stats as any;
          if (item && (item.published !== undefined || item.publishedRatingSum !== undefined)) {
            appStatsCache.set(id.toLowerCase().trim(), {
              publishedReviewCount: item.published || 0,
              publishedRatingSum: item.publishedRatingSum || 0,
              starDistribution: item.starCounts || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
            });
          }
        }
      }
    } catch (e) {
      console.warn('[CommunityStatsManager] syncAppStatsFromFirestore error:', e);
    }
  }

  public getTopReviewedApps(
    reviewsMap: Map<string, ReviewRecord>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    cachedRemoteCounts: ExactCommunityAggregationResult | null,
    limit: number = 8
  ) {
    const { appCounts } = this.getAppReviewCounts(reviewsMap, appStatsCache, cachedRemoteCounts);
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
            appId: app.id,
            slug: app.slug,
            name: app.name,
            icon: app.icon_url || app.icon,
            category: app.category,
            reviewCount: countData.total,
            publishedCount: countData.published,
            avgRating: countData.avgRating,
            flaggedCount: countData.flagged
          });
        }
      }
    });

    result.sort((a, b) => b.reviewCount - a.reviewCount);
    return result.slice(0, limit);
  }

  public async getExportableCatalogStats(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    cachedRemoteCounts: ExactCommunityAggregationResult | null
  ): Promise<any> {
    // 1. Sync any existing Firestore app_stats into appStatsCache
    await this.syncAppStatsFromFirestore(appStatsCache).catch(() => {});

    // 2. Compute true app counts combining Firestore app_stats & in-memory reviews
    const { appCounts, globalStats } = this.getAppReviewCounts(reviewsMap, appStatsCache, cachedRemoteCounts);

    const staticData = getStaticData();
    const apps = staticData.apps || staticData.mockApps || [];

    const exportAppCounts: Record<string, any> = {};
    let totalReviews = 0;
    let publishedReviews = 0;
    let ratingSum = 0;
    const ratingDistribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

    apps.forEach((app: any) => {
      const slugKey = (app.slug || '').toLowerCase().trim();
      const idKey = (app.id || '').toLowerCase().trim();
      const stats = appCounts[slugKey] || appCounts[idKey];
      if (stats && stats.published > 0) {
        const starCounts = stats.starCounts || { '1': 0, '2': 0, '3': 0, '4': 0, '5': stats.published };
        const entry = {
          total: stats.published,
          published: stats.published,
          avgRating: stats.avgRating || 4.8,
          starCounts
        };
        if (slugKey) exportAppCounts[slugKey] = entry;
        if (idKey) exportAppCounts[idKey] = entry;

        totalReviews += stats.published;
        publishedReviews += stats.published;
        ratingSum += ((stats.avgRating || 4.8) * stats.published);
        for (let s = 1; s <= 5; s++) {
          ratingDistribution[String(s)] = (ratingDistribution[String(s)] || 0) + (Number(starCounts[String(s)]) || 0);
        }
      }
    });

    // Also include any reviews that belong to apps not in the static catalog
    for (const [key, stats] of Object.entries(appCounts)) {
      if (!exportAppCounts[key] && stats && stats.published > 0) {
        const starCounts = stats.starCounts || { '1': 0, '2': 0, '3': 0, '4': 0, '5': stats.published };
        exportAppCounts[key] = {
          total: stats.published,
          published: stats.published,
          avgRating: stats.avgRating || 4.8,
          starCounts
        };
        totalReviews += stats.published;
        publishedReviews += stats.published;
        ratingSum += ((stats.avgRating || 4.8) * stats.published);
        for (let s = 1; s <= 5; s++) {
          ratingDistribution[String(s)] = (ratingDistribution[String(s)] || 0) + (Number(starCounts[String(s)]) || 0);
        }
      }
    }

    const averageRating = publishedReviews > 0 ? parseFloat((ratingSum / publishedReviews).toFixed(1)) : (globalStats.averageRating || 4.8);

    const finalResult = {
      totalReviews,
      publishedReviews,
      pendingReviews: globalStats.pending,
      rejectedReviews: globalStats.rejected,
      flaggedReviews: globalStats.flagged,
      totalReports: 0,
      pendingReports: 0,
      averageRating,
      ratingDistribution,
      appCounts: exportAppCounts,
      updated_at: new Date().toISOString()
    };

    try {
      const statsPath = path.join(process.cwd(), 'src/lib/communityCatalogStats.json');
      fs.writeFileSync(statsPath, JSON.stringify(finalResult, null, 2), 'utf8');
      console.log(`[CommunityStats] ✅ Successfully exported live atomic catalog stats for ${Object.keys(exportAppCounts).length} apps (${totalReviews} total reviews) to communityCatalogStats.json`);
    } catch (writeErr) {
      console.warn('[CommunityStats] Warning writing communityCatalogStats.json:', writeErr);
    }

    return finalResult;
  }

  public async saveCatalogStatsSummary(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    cachedRemoteCounts: ExactCommunityAggregationResult | null
  ) {
    try {
      const overview = this.getCommunityOverviewMetrics(reviewsMap, reportsMap, cachedRemoteCounts);
      const { appCounts } = this.getAppReviewCounts(reviewsMap, appStatsCache, cachedRemoteCounts);
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

      const statsPath = path.join(process.cwd(), 'src/lib/communityCatalogStats.json');
      fs.writeFileSync(statsPath, JSON.stringify(payload, null, 2), 'utf8');
      
      const db = getCommunityAdminDb();
      if (db) {
        db.collection('community_store').doc('catalog_stats').set(payload, { merge: true }).catch(() => {});
      } else {
        writeCommunityRestDoc('catalog_stats', payload, true, 'community_store').catch(() => {});
      }
    } catch (e) {
      console.warn('[CommunityStatsManager] Failed to persist catalog_stats:', e);
    }
  }

  public async getAppStats(
    appIdentifier: string,
    reviewsMap: Map<string, ReviewRecord>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    fallbackRating = 4.8,
    appTitle?: string,
    appSlug?: string
  ) {
    const resolved = resolveCanonicalApp(appIdentifier, appSlug, appTitle);
    const cleanId = resolved.canonicalId;
    const matchedApp = resolved.matchedApp;
    
    const benchmarkRating = matchedApp?.rating ? Number(matchedApp.rating) : fallbackRating;
    
    let communityTotal = 0;
    let communityRatingSum = 0;
    let communityStarCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    let stats = appStatsCache.get(cleanId);
    if (!stats && resolved.canonicalSlug) {
      stats = appStatsCache.get(resolved.canonicalSlug);
    }
    if (!stats) {
      try {
        stats = await readAppStats(cleanId);
        if (stats) {
          appStatsCache.set(cleanId, stats);
          if (resolved.canonicalSlug) appStatsCache.set(resolved.canonicalSlug, stats);
        }
      } catch (e) {}
    }
    
    if (stats) {
      communityTotal = stats.publishedReviewCount || 0;
      communityRatingSum = stats.publishedRatingSum || 0;
      communityStarCounts = stats.starDistribution || communityStarCounts;
    } else {
      const appReviews = Array.from(reviewsMap.values())
        .filter(r => {
          if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
          const rAppId = String(r.appId || '').toLowerCase().trim();
          return rAppId === cleanId.toLowerCase().trim();
        });

      if (appReviews.length > 0) {
        appReviews.forEach(r => {
          const star = String(Math.max(1, Math.min(5, Math.round(r.rating))));
          communityStarCounts[star] = (communityStarCounts[star] || 0) + 1;
          communityRatingSum += Number(r.rating) || 5;
          communityTotal++;
        });
        
        const computedStats = {
          publishedReviewCount: communityTotal,
          publishedRatingSum: communityRatingSum,
          starDistribution: communityStarCounts
        };
        appStatsCache.set(cleanId, computedStats);
        if (resolved.canonicalSlug) {
          appStatsCache.set(resolved.canonicalSlug, computedStats);
        }
      }
    }

    const totalReviews = communityTotal;
    let averageRating = benchmarkRating;
    
    if (totalReviews > 0) {
       averageRating = parseFloat((communityRatingSum / totalReviews).toFixed(1));
    }

    const effectiveTotal = Math.max(1, totalReviews);
    const distribution: Record<number, number> = {
      5: totalReviews > 0 ? Math.round(((communityStarCounts['5'] || 0) / effectiveTotal) * 100) : 0,
      4: totalReviews > 0 ? Math.round(((communityStarCounts['4'] || 0) / effectiveTotal) * 100) : 0,
      3: totalReviews > 0 ? Math.round(((communityStarCounts['3'] || 0) / effectiveTotal) * 100) : 0,
      2: totalReviews > 0 ? Math.round(((communityStarCounts['2'] || 0) / effectiveTotal) * 100) : 0,
      1: totalReviews > 0 ? Math.round(((communityStarCounts['1'] || 0) / effectiveTotal) * 100) : 0,
    };

    return {
      appId: resolved.canonicalId,
      averageRating: Math.max(1, Math.min(5, averageRating)),
      totalReviews,
      starCounts: communityStarCounts,
      distribution,
      hasRealReviews: totalReviews > 0,
      aiBenchmarkRating: benchmarkRating
    };
  }

  public getGlobalStatsSummary(
    reviewsMap: Map<string, ReviewRecord>,
    reportsMap: Map<string, ReportRecord>,
    appStatsCache: Map<string, AppStatsCacheItem>,
    cachedRemoteCounts: ExactCommunityAggregationResult | null
  ) {
    const staticData = getStaticData();
    const apps = staticData.apps || staticData.mockApps || [];

    const appStatsMap: Record<string, any> = {};
    const overview = this.getCommunityOverviewMetrics(reviewsMap, reportsMap, cachedRemoteCounts);
    const { appCounts } = this.getAppReviewCounts(reviewsMap, appStatsCache, cachedRemoteCounts);

    apps.forEach((app: any) => {
      const canonical = resolveCanonicalApp(app.id, app.slug, app.name);
      const appId = canonical.canonicalId;
      const countData = appCounts[appId.toLowerCase()] || (canonical.canonicalSlug ? appCounts[canonical.canonicalSlug.toLowerCase()] : null);
      
      const total = countData?.total || 0;
      const published = countData?.published || 0;
      const pending = countData?.pending || 0;
      const rejected = countData?.rejected || 0;
      const avgRating = countData?.avgRating || (app.rating ? Number(app.rating) : 5.0);
      const starCounts = countData?.starCounts || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

      const effectiveTotal = Math.max(1, published);
      const distribution: Record<number, number> = {
        5: published > 0 ? Math.round(((starCounts['5'] || 0) / effectiveTotal) * 100) : 0,
        4: published > 0 ? Math.round(((starCounts['4'] || 0) / effectiveTotal) * 100) : 0,
        3: published > 0 ? Math.round(((starCounts['3'] || 0) / effectiveTotal) * 100) : 0,
        2: published > 0 ? Math.round(((starCounts['2'] || 0) / effectiveTotal) * 100) : 0,
        1: published > 0 ? Math.round(((starCounts['1'] || 0) / effectiveTotal) * 100) : 0,
      };

      appStatsMap[appId] = {
        appId,
        appName: app.name || canonical.canonicalName,
        total,
        published,
        pending,
        rejected,
        avgRating,
        starCounts,
        distribution
      };
    });

    return {
      global: {
        totalReviews: overview.totalReviews,
        publishedReviews: overview.publishedCount,
        pendingReviews: overview.pendingCount,
        rejectedReviews: overview.rejectedCount,
        totalReports: overview.totalReports,
        pendingReports: overview.pendingReportsCount,
        averageRating: overview.averageRating
      },
      appStats: appStatsMap
    };
  }
}

export const communityStatsManager = new CommunityStatsManager();
