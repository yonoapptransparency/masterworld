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

export function getLocalFallbackReviewsForApp(appId: string, appSlug: string): SeoReviewsResult {
  try {
    const cleanId = (appId || '').toLowerCase().trim();
    const cleanSlug = (appSlug || '').toLowerCase().trim();

    // Pre-computed single atomic counts file communityCatalogStats.json (instant 0ms read for SEO aggregateRating)
    let catalogAppStats: any = null;
    const catStatsPath = path.join(process.cwd(), 'src/lib/communityCatalogStats.json');
    if (fs.existsSync(catStatsPath)) {
      try {
        const cParsed = JSON.parse(fs.readFileSync(catStatsPath, 'utf8'));
        const appCounts = cParsed?.appCounts || {};
        const countInfo = appCounts[cleanId] || (cleanSlug ? appCounts[cleanSlug] : null);
        if (countInfo && countInfo.published > 0) {
          catalogAppStats = {
            totalReviews: Number(countInfo.published),
            averageRating: Number(countInfo.avgRating || 4.5),
            starCounts: countInfo.starCounts || null
          };
        }
      } catch (e) {}
    }

    // High-availability sample reviews from static disk storage for Schema.org rich snippets
    let sampleReviews: any[] = [];
    const localBackupPath = path.join(process.cwd(), 'community_local_backup.json');
    const staticReviewsPath = path.join(process.cwd(), 'src/lib/communityStaticReviews.json');

    if (fs.existsSync(localBackupPath)) {
      try {
        const raw = fs.readFileSync(localBackupPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.reviews)) {
          sampleReviews = parsed.reviews
            .filter((r: any) => {
              if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
              const rAppId = String(r.appId || r.app_id || '').toLowerCase().trim();
              const rSlug = String(r.appSlug || '').toLowerCase().trim();
              return rAppId === cleanId || rAppId === cleanSlug || (cleanSlug && rSlug === cleanSlug);
            })
            .slice(0, 5)
            .map((r: any) => ({
              userName: r.userName || r.username || 'Player',
              rating: Number(r.rating) || 5,
              reviewText: r.reviewText || r.comment || '',
              timestamp: r.timestamp || r.created_at || new Date().toISOString()
            }));
        }
      } catch (_) {}
    }

    if (sampleReviews.length < 5 && fs.existsSync(staticReviewsPath)) {
      try {
        const raw = fs.readFileSync(staticReviewsPath, 'utf8');
        const staticMap = JSON.parse(raw);
        const list = staticMap[cleanId] || (cleanSlug ? staticMap[cleanSlug] : null);
        if (Array.isArray(list) && list.length > 0) {
          const existingTexts = new Set(sampleReviews.map(r => r.reviewText));
          const additions = list
            .filter((r: any) => !existingTexts.has(r.reviewText || r.comment))
            .slice(0, 5 - sampleReviews.length)
            .map((r: any) => ({
              userName: r.userName || r.username || 'Player',
              rating: Number(r.rating) || 5,
              reviewText: r.reviewText || r.comment || '',
              timestamp: r.timestamp || r.created_at || new Date().toISOString()
            }));
          sampleReviews = [...sampleReviews, ...additions];
        }
      } catch (_) {}
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
