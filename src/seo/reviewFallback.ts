import fs from 'fs';
import path from 'path';
import { stripHtml } from './utils';

export interface SeoReviewsResult {
  reviews: any[];
  stats: {
    totalReviews: number;
    averageRating: number;
    starCounts: any;
  } | null;
}

export const INITIAL_SSR_REVIEW_LIMIT = 10;

const STREAMING_BLEED_REGEX = /\b(episodes?|binge[-\s]?watch(?:ing)?|subtitles?|web\s*series|short\s*dramas?|buffering|video\s*quality)\b/i;

export function isStrictAppReviewMatch(
  r: any,
  validKeys: Set<string>,
  appCategory: string = ''
): boolean {
  if (!r || typeof r !== 'object') return false;
  if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
  if (validKeys.size === 0) return false;

  const rId = String(r.appId || r.app_id || '').toLowerCase().trim();
  const rSlug = String(r.appSlug || '').toLowerCase().trim();
  if (!rId && !rSlug) return false;

  // Both rId and rSlug (whenever present) must belong to this app's valid identifier set
  if (rId && !validKeys.has(rId)) return false;
  if (rSlug && !validKeys.has(rSlug)) return false;

  const text = stripHtml(String(r.reviewText || r.comment || '')).trim();
  if (text.length < 3) return false;

  // Category bleed guard: prevent streaming/video reviews from appearing on card/rummy/casino/game apps
  const catLower = String(appCategory || '').toLowerCase();
  const isStreamingApp = /entertainment|video|stream|drama|movie|tv|ott|short/i.test(catLower);
  if (!isStreamingApp && STREAMING_BLEED_REGEX.test(text)) {
    return false;
  }

  return true;
}

export function getLocalFallbackReviewsForApp(appId: string, appSlug: string): SeoReviewsResult {
  try {
    let cleanId = (appId || '').toLowerCase().trim();
    let cleanSlug = (appSlug || '').toLowerCase().trim();
    let appCategory = '';

    // Resolve canonical appId, appSlug, and category from staticData.json so both keys are always known
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    let matchedCatalogApp: any = null;
    if (fs.existsSync(staticJsonPath)) {
      try {
        const sParsed = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
        const apps = Array.isArray(sParsed?.apps) ? sParsed.apps : [];
        matchedCatalogApp = apps.find((a: any) => {
          const aId = String(a?.id || '').toLowerCase().trim();
          const aSlug = String(a?.slug || '').toLowerCase().trim();
          return (cleanId && (aId === cleanId || aSlug === cleanId)) ||
                 (cleanSlug && (aId === cleanSlug || aSlug === cleanSlug));
        });
        if (matchedCatalogApp) {
          if (matchedCatalogApp.id) cleanId = String(matchedCatalogApp.id).toLowerCase().trim();
          if (matchedCatalogApp.slug) cleanSlug = String(matchedCatalogApp.slug).toLowerCase().trim();
          appCategory = String(matchedCatalogApp.category || '');
        }
      } catch (_) {}
    }

    const validKeys = new Set<string>([cleanId, cleanSlug].filter(Boolean));

    // Pre-computed single atomic counts file communityCatalogStats.json (instant 0ms read for SEO aggregateRating)
    let catalogAppStats: any = null;
    const catStatsPath = path.join(process.cwd(), 'src/lib/communityCatalogStats.json');
    if (fs.existsSync(catStatsPath)) {
      try {
        const cParsed = JSON.parse(fs.readFileSync(catStatsPath, 'utf8'));
        const appCounts = cParsed?.appCounts || {};
        const countInfo = (cleanId && appCounts[cleanId]) || (cleanSlug ? appCounts[cleanSlug] : null);
        if (countInfo && countInfo.published > 0) {
          catalogAppStats = {
            totalReviews: Number(countInfo.published),
            averageRating: Number(countInfo.avgRating || 4.5),
            starCounts: countInfo.starCounts || null
          };
        }
      } catch (e) {}
    }

    if (!catalogAppStats && matchedCatalogApp) {
      const revCount = Number(matchedCatalogApp.review_count || matchedCatalogApp.reviews || 0);
      const avgRating = Number(matchedCatalogApp.rating || 4.5);
      if (revCount > 0) {
        catalogAppStats = {
          totalReviews: revCount,
          averageRating: avgRating,
          starCounts: null
        };
      }
    }

    // Collect strictly isolated app-specific reviews from local backup and static bundle
    const collected: any[] = [];
    const seenIds = new Set<string>();
    const seenTexts = new Set<string>();

    const pushReviewIfValid = (r: any, idx: number, prefix: string) => {
      if (!isStrictAppReviewMatch(r, validKeys, appCategory)) return;
      const id = String(r.id || `${prefix}_${cleanSlug || cleanId}_${idx}`).trim();
      const text = String(r.reviewText || r.comment || '').trim();
      const textKey = text.toLowerCase();
      if (seenIds.has(id) || seenTexts.has(textKey)) return;
      seenIds.add(id);
      seenTexts.add(textKey);

      const ts = r.timestamp || r.created_at || new Date().toISOString();
      collected.push({
        id,
        appId: r.appId || r.app_id || cleanId || cleanSlug,
        app_id: r.app_id || r.appId || cleanId || cleanSlug,
        appSlug: r.appSlug || cleanSlug || cleanId,
        userName: r.userName || r.username || 'Player',
        username: r.username || r.userName || 'Player',
        rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
        reviewText: text,
        comment: text,
        timestamp: ts,
        created_at: r.created_at || ts,
        helpful_count: Number(r.helpful_count) || 0,
        isPinned: Boolean(r.isPinned),
        reported: Boolean(r.reported),
        report_count: Number(r.report_count) || 0,
        source: r.source || 'community',
        adminReply: r.adminReply || null
      });
    };

    const localBackupPath = path.join(process.cwd(), 'community_local_backup.json');
    const staticReviewsPath = path.join(process.cwd(), 'src/lib/communityStaticReviews.json');

    if (fs.existsSync(localBackupPath)) {
      try {
        const raw = fs.readFileSync(localBackupPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.reviews)) {
          parsed.reviews.forEach((r: any, idx: number) => pushReviewIfValid(r, idx, 'rev'));
        }
      } catch (_) {}
    }

    if (fs.existsSync(staticReviewsPath)) {
      try {
        const raw = fs.readFileSync(staticReviewsPath, 'utf8');
        const staticMap = JSON.parse(raw);
        const candidateLists = [
          cleanSlug ? staticMap[cleanSlug] : null,
          cleanId ? staticMap[cleanId] : null
        ].filter(Array.isArray);
        for (const list of candidateLists) {
          list.forEach((r: any, idx: number) => pushReviewIfValid(r, idx, 'rev_static'));
        }
      } catch (_) {}
    }

    // Sort deterministically: pinned first, then most recent timestamp descending (100% parity with client default sort)
    collected.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const dateB = new Date(b.timestamp || b.created_at || 0).getTime();
      const dateA = new Date(a.timestamp || a.created_at || 0).getTime();
      return dateB - dateA;
    });

    const sampleReviews = collected.slice(0, INITIAL_SSR_REVIEW_LIMIT);

    if (catalogAppStats && collected.length > catalogAppStats.totalReviews) {
      catalogAppStats.totalReviews = collected.length;
    } else if (!catalogAppStats && collected.length > 0) {
      const sum = collected.reduce((acc, item) => acc + (Number(item.rating) || 5), 0);
      catalogAppStats = {
        totalReviews: collected.length,
        averageRating: Math.round((sum / collected.length) * 10) / 10,
        starCounts: null
      };
    }

    return {
      reviews: sampleReviews,
      stats: catalogAppStats
    };
  } catch (err) {
    return { reviews: [], stats: null };
  }
}

export async function fetchSEOReviewsForApp(appId: string, appSlug: string, _rating?: number, _appName?: string): Promise<SeoReviewsResult> {
  const localData = getLocalFallbackReviewsForApp(appId, appSlug);
  if (localData) {
    return localData;
  }
  return { reviews: [], stats: null };
}
