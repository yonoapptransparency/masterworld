import { Router } from 'express';
import { 
  fetchAdminReviewsList, 
  fetchAdminAppReviewCounts, 
  fetchAdminCommunityOverviewStats, 
  createAdminReviewItem, 
  updateAdminReviewItem, 
  setAdminReviewStatus, 
  toggleAdminReviewPin, 
  deleteAdminReviewItem, 
  performBulkReviewsAction, 
  submitAdminReplyToReview,
  getConsolidatedReviewsForApp,
  fetchLiveReviews,
  submitLiveReview,
  voteLiveReviewHelpful,
  reportLiveReview,
  persistAuthoritativeAtomicCatalogStats,
  getLiveAtomicReviewStatsSync
} from '../../lib/communityFirebase';
import communityCatalogStats from '../../lib/communityCatalogStats.json';
import communityStaticReviews from '../../lib/communityStaticReviews.json';
import fs from 'fs';
import path from 'path';

export const communityRouter = Router();

// AI Review Studio Brain & Directives Server Persistence (Zero-Quota, 100% Reliable)
let inMemoryAiStudioBrain: any = null;
import { testGeminiConnection, executeGeminiWithRetry, normalizeGeminiModel } from '../services/geminiServerService';

const DATA_DIR = path.join(process.cwd(), '.data');
const PERSISTENT_BRAIN_FILE = path.join(DATA_DIR, 'aiStudioBrain.json');
const SEED_BRAIN_FILE = path.join(process.cwd(), 'src', 'lib', 'aiStudioBrain.json');

function ensureBrainLoaded(): any {
  if (inMemoryAiStudioBrain) return inMemoryAiStudioBrain;
  try {
    if (fs.existsSync(PERSISTENT_BRAIN_FILE)) {
      inMemoryAiStudioBrain = JSON.parse(fs.readFileSync(PERSISTENT_BRAIN_FILE, 'utf8'));
    } else if (fs.existsSync(SEED_BRAIN_FILE)) {
      inMemoryAiStudioBrain = JSON.parse(fs.readFileSync(SEED_BRAIN_FILE, 'utf8'));
    }
  } catch (_) {}
  if (!inMemoryAiStudioBrain || typeof inMemoryAiStudioBrain !== 'object') {
    inMemoryAiStudioBrain = { config: { model: 'gemini-flash-latest' }, directives: [] };
  }
  if (!inMemoryAiStudioBrain.config) {
    inMemoryAiStudioBrain.config = { model: 'gemini-flash-latest' };
  }
  return inMemoryAiStudioBrain;
}

function persistBrainToDisk(brainData: any): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PERSISTENT_BRAIN_FILE, JSON.stringify(brainData, null, 2), 'utf8');
  } catch (_) {}
}

communityRouter.get('/api/v1/admin/community/aistudio-settings', async (req, res) => {
  try {
    const brainData = ensureBrainLoaded();
    const envKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    const effectiveKey = (brainData.config?.apiKey || envKey || '').trim();
    const effectiveModel = normalizeGeminiModel(brainData.config?.model || 'gemini-flash-latest');

    const responseData = {
      ...brainData,
      hasServerKey: Boolean(effectiveKey),
      config: {
        ...brainData.config,
        ...(effectiveKey ? { apiKey: effectiveKey } : {}),
        model: effectiveModel
      }
    };

    return res.json({ success: true, data: responseData });
  } catch (err: any) {
    res.json({ success: true, data: inMemoryAiStudioBrain || null });
  }
});

communityRouter.post('/api/v1/admin/community/aistudio-settings', async (req, res) => {
  try {
    const existing = ensureBrainLoaded();
    const payload = req.body || {};
    const incomingConfig = payload.config || {};

    const mergedConfig: Record<string, any> = {
      ...(existing.config || {})
    };

    for (const [k, v] of Object.entries(incomingConfig)) {
      if (v !== undefined) {
        if (k === 'apiKey') {
          const clean = String(v || '').trim();
          // Only overwrite apiKey if non-empty or explicitly cleared via clearKey flag
          if (clean || payload.clearKey === true) {
            mergedConfig.apiKey = clean;
          }
        } else if (k === 'model') {
          const cleanModel = String(v || '').trim();
          if (cleanModel) {
            mergedConfig.model = cleanModel;
          }
        } else {
          mergedConfig[k] = v;
        }
      }
    }

    inMemoryAiStudioBrain = {
      ...existing,
      ...(Array.isArray(payload.directives) ? { directives: payload.directives } : {}),
      config: mergedConfig,
      updatedAt: new Date().toISOString()
    };

    persistBrainToDisk(inMemoryAiStudioBrain);
    res.json({
      success: true,
      message: 'Settings saved permanently in brain memory.',
      config: inMemoryAiStudioBrain.config
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Dedicated Server-Side Gemini Execution Proxy with Auto-Retry & Model Fallback
communityRouter.post('/api/v1/admin/community/aistudio-gemini', async (req, res) => {
  try {
    const brainData = ensureBrainLoaded();
    const {
      action,
      apiKey: reqKey,
      model: reqModel,
      systemInstruction,
      contents,
      temperature,
      responseMimeType,
      useReviewSchema
    } = req.body || {};

    const apiKey =
      (reqKey || '').trim() ||
      (brainData?.config?.apiKey || '').trim() ||
      (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();

    const targetModel =
      (reqModel || '').trim() ||
      (brainData?.config?.model || '').trim() ||
      'gemini-flash-latest';

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key is required. Click the Key button in AI Studio to paste your Google AI Studio key.'
      });
    }

    // If a new key or model was passed in the request, keep server brain synced
    if ((reqKey && reqKey.trim() !== brainData?.config?.apiKey) || (reqModel && reqModel.trim() !== brainData?.config?.model)) {
      brainData.config = {
        ...(brainData.config || {}),
        ...(reqKey && reqKey.trim() ? { apiKey: reqKey.trim() } : {}),
        ...(reqModel && reqModel.trim() ? { model: reqModel.trim() } : {})
      };
      inMemoryAiStudioBrain = brainData;
      persistBrainToDisk(inMemoryAiStudioBrain);
    }

    if (action === 'test') {
      const result = await testGeminiConnection(apiKey, targetModel);
      return res.json(result);
    }

    // Standard generate or chat execution
    const result = await executeGeminiWithRetry({
      apiKey,
      model: targetModel,
      systemInstruction,
      contents,
      temperature: typeof temperature === 'number' ? temperature : 0.85,
      responseMimeType,
      useReviewSchema: Boolean(useReviewSchema)
    });

    if (!result.success) {
      return res.status(502).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Server error calling Gemini' });
  }
});


// ============================================================================
// AUTHORITATIVE SERVER-SIDE REVIEW & ATOMIC STATS ENGINE (Zero Quota Burn)
// ============================================================================

const STATIC_DATA_FILE = path.join(process.cwd(), 'src', 'lib', 'staticData.json');
const STATIC_REVIEWS_FILE = path.join(process.cwd(), 'src', 'lib', 'communityStaticReviews.json');
const CATALOG_STATS_FILE = path.join(process.cwd(), 'src', 'lib', 'communityCatalogStats.json');

let _serverReviewsCache: Record<string, any[]> | null = null;
let _serverAppsCache: any[] | null = null;
let _serverStatsCache: {
  globalStats: {
    total: number;
    published: number;
    pending: number;
    rejected: number;
    flagged: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
  };
  appCounts: Record<string, any>;
} | null = null;

function getServerCatalogApps(): any[] {
  if (_serverAppsCache && _serverAppsCache.length > 0) return _serverAppsCache;
  try {
    if (fs.existsSync(STATIC_DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STATIC_DATA_FILE, 'utf8'));
      const apps = Array.isArray(parsed.apps) ? parsed.apps : (parsed.mockApps || []);
      if (apps.length > 0) {
        _serverAppsCache = apps;
        return apps;
      }
    }
  } catch (_) {}
  return [];
}

function getServerReviewsMap(forceReload = false): Record<string, any[]> {
  if (_serverReviewsCache && !forceReload) return _serverReviewsCache;
  try {
    if (fs.existsSync(STATIC_REVIEWS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STATIC_REVIEWS_FILE, 'utf8'));
      if (parsed && typeof parsed === 'object') {
        _serverReviewsCache = parsed;
        return _serverReviewsCache!;
      }
    }
  } catch (_) {}
  _serverReviewsCache = { ...(communityStaticReviews as any) };
  return _serverReviewsCache!;
}

function resolveServerAppIdentity(idOrSlug?: string, fallbackSlug?: string, fallbackName?: string): {
  idKey: string;
  slugKey: string;
  nameKey: string;
  displayName: string;
  allKeys: string[];
} {
  const k1 = String(idOrSlug || '').trim().toLowerCase();
  const k2 = String(fallbackSlug || '').trim().toLowerCase();
  const k3 = String(fallbackName || '').trim().toLowerCase();
  const apps = getServerCatalogApps();

  for (const a of apps) {
    if (!a) continue;
    const aid = String(a.id || '').trim().toLowerCase();
    const aslug = String(a.slug || '').trim().toLowerCase();
    const aname = String(a.name || '').trim().toLowerCase();
    if (
      (k1 && (aid === k1 || aslug === k1 || aname === k1)) ||
      (k2 && (aid === k2 || aslug === k2 || aname === k2)) ||
      (k3 && aname === k3)
    ) {
      const idKey = aid || aslug || k1;
      const slugKey = aslug || aid || k2 || k1;
      return {
        idKey,
        slugKey,
        nameKey: aname,
        displayName: String(a.name || fallbackName || ''),
        allKeys: Array.from(new Set([idKey, slugKey, aname, k1, k2].filter(Boolean)))
      };
    }
  }

  // Fallback: check existing reviews map for matching appId / appSlug
  const revMap = getServerReviewsMap();
  for (const [bKey, arr] of Object.entries(revMap)) {
    if (!Array.isArray(arr) || arr.length === 0) continue;
    const sample = arr[0];
    const sid = String(sample?.appId || bKey || '').trim().toLowerCase();
    const sslug = String(sample?.appSlug || '').trim().toLowerCase();
    const sname = String(sample?.appName || '').trim().toLowerCase();
    if (
      (k1 && (sid === k1 || sslug === k1 || sname === k1)) ||
      (k2 && (sid === k2 || sslug === k2 || sname === k2))
    ) {
      const idKey = sid || sslug || k1;
      const slugKey = sslug || sid || k2 || k1;
      return {
        idKey,
        slugKey,
        nameKey: sname,
        displayName: String(sample?.appName || fallbackName || ''),
        allKeys: Array.from(new Set([idKey, slugKey, sname, k1, k2].filter(Boolean)))
      };
    }
  }

  const idKey = k1 || k2;
  const slugKey = k2 || k1;
  return {
    idKey,
    slugKey,
    nameKey: k3,
    displayName: String(fallbackName || ''),
    allKeys: Array.from(new Set([idKey, slugKey, k3].filter(Boolean)))
  };
}

function recomputeServerAtomicStats(persistToDisk = false): {
  globalStats: {
    total: number;
    published: number;
    pending: number;
    rejected: number;
    flagged: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
  };
  appCounts: Record<string, any>;
} {
  const apps = getServerCatalogApps();
  const revMap = getServerReviewsMap();

  const uniqueById = new Map<string, any>();
  const compactedMap: Record<string, any[]> = {};

  for (const [bucketKey, arr] of Object.entries(revMap)) {
    if (!Array.isArray(arr)) continue;
    for (const r of arr) {
      if (!r || !r.id || uniqueById.has(r.id)) continue;
      const identity = resolveServerAppIdentity(r.appId || bucketKey, r.appSlug, r.appName);
      const normalized = {
        id: String(r.id),
        appId: identity.idKey || r.appId || bucketKey,
        appSlug: identity.slugKey || r.appSlug || bucketKey,
        appName: identity.displayName || r.appName || '',
        userName: r.userName || r.username || 'Verified Player',
        rating: Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5))),
        reviewText: r.reviewText || r.comment || '',
        timestamp: r.timestamp || r.created_at || new Date().toISOString(),
        status: r.status || 'published',
        helpful_count: Number(r.helpful_count) || 0,
        isPinned: Boolean(r.isPinned),
        reported: Boolean(r.reported),
        report_count: Number(r.report_count) || 0,
        source: r.source || 'community',
        adminReply: r.adminReply || null
      };
      uniqueById.set(normalized.id, normalized);
      const targetBucket = identity.idKey || identity.slugKey || bucketKey;
      if (!compactedMap[targetBucket]) compactedMap[targetBucket] = [];
      compactedMap[targetBucket].push(normalized);
    }
  }

  // Sort each bucket pinned first, then newest
  for (const k of Object.keys(compactedMap)) {
    compactedMap[k].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });
  }

  _serverReviewsCache = compactedMap;

  const appCounts: Record<string, any> = {};
  const processedBuckets = new Set<string>();
  let totalReviews = 0;
  let publishedReviews = 0;
  let pendingReviews = 0;
  let rejectedReviews = 0;
  let globalRatingSum = 0;
  const ratingDistribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

  const computeStatForReviews = (revs: any[]) => {
    const count = revs.length;
    let pub = 0;
    let pend = 0;
    let rej = 0;
    let sum = 0;
    const starCounts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const r of revs) {
      const st = r.status || 'published';
      if (st === 'published') pub++;
      else if (st === 'pending') pend++;
      else if (st === 'rejected') rej++;
      const star = String(Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5))));
      starCounts[star] = (starCounts[star] || 0) + 1;
      ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
      sum += Number(r.rating) || 5;
    }
    const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 4.5;
    totalReviews += count;
    publishedReviews += pub;
    pendingReviews += pend;
    rejectedReviews += rej;
    globalRatingSum += sum;
    return {
      total: count,
      published: pub,
      pending: pend,
      rejected: rej,
      flagged: 0,
      ratingSum: sum,
      avgRating: avg,
      starCounts
    };
  };

  for (const app of apps) {
    if (!app) continue;
    const idKey = String(app.id || '').trim().toLowerCase();
    const slugKey = String(app.slug || '').trim().toLowerCase();
    const revs = (idKey && compactedMap[idKey]) || (slugKey && compactedMap[slugKey]) || [];
    if (idKey) processedBuckets.add(idKey);
    if (slugKey) processedBuckets.add(slugKey);
    const stat = computeStatForReviews(revs);
    if (idKey) appCounts[idKey] = stat;
    if (slugKey) appCounts[slugKey] = stat;
  }

  for (const [bKey, revs] of Object.entries(compactedMap)) {
    const cleanKey = bKey.toLowerCase().trim();
    if (processedBuckets.has(cleanKey)) continue;
    const identity = resolveServerAppIdentity(cleanKey);
    const stat = computeStatForReviews(revs);
    if (identity.idKey) appCounts[identity.idKey] = stat;
    if (identity.slugKey) appCounts[identity.slugKey] = stat;
    appCounts[cleanKey] = stat;
  }

  const averageRating = totalReviews > 0 ? Math.round((globalRatingSum / totalReviews) * 10) / 10 : 4.2;

  const result = {
    globalStats: {
      total: totalReviews,
      published: publishedReviews,
      pending: pendingReviews,
      rejected: rejectedReviews,
      flagged: 0,
      averageRating,
      ratingDistribution
    },
    appCounts
  };

  _serverStatsCache = result;

  if (persistToDisk) {
    try {
      fs.writeFileSync(STATIC_REVIEWS_FILE, JSON.stringify(compactedMap, null, 2), 'utf8');
    } catch (e) {
      console.warn('[communityRoutes] Failed writing communityStaticReviews.json:', e);
    }
    try {
      const catalogStatsPayload = {
        totalReviews: result.globalStats.total,
        publishedReviews: result.globalStats.published,
        pendingReviews: result.globalStats.pending,
        rejectedReviews: result.globalStats.rejected,
        flaggedReviews: 0,
        averageRating: result.globalStats.averageRating,
        ratingDistribution: result.globalStats.ratingDistribution,
        appCounts: result.appCounts
      };
      fs.writeFileSync(CATALOG_STATS_FILE, JSON.stringify(catalogStatsPayload, null, 2), 'utf8');
    } catch (e) {
      console.warn('[communityRoutes] Failed writing communityCatalogStats.json:', e);
    }
  }

  return result;
}

function getServerReviewsForApp(appIdParam?: string): any[] {
  const revMap = getServerReviewsMap();
  const raw = String(appIdParam || '').trim();
  if (!raw || raw === 'all') {
    const all: any[] = [];
    const seen = new Set<string>();
    for (const arr of Object.values(revMap)) {
      if (!Array.isArray(arr)) continue;
      for (const r of arr) {
        if (r && r.id && !seen.has(r.id)) {
          all.push(r);
          seen.add(r.id);
        }
      }
    }
    return all;
  }

  const identity = resolveServerAppIdentity(raw);
  const matchKeys = new Set([identity.idKey, identity.slugKey, identity.nameKey, raw.toLowerCase()].filter(Boolean));
  const list: any[] = [];
  const seen = new Set<string>();

  for (const k of matchKeys) {
    if (Array.isArray(revMap[k])) {
      for (const r of revMap[k]) {
        if (r && r.id && !seen.has(r.id)) {
          list.push(r);
          seen.add(r.id);
        }
      }
    }
  }

  for (const arr of Object.values(revMap)) {
    if (!Array.isArray(arr)) continue;
    for (const r of arr) {
      if (!r || !r.id || seen.has(r.id)) continue;
      const k1 = String(r.appId || '').trim().toLowerCase();
      const k2 = String(r.appSlug || '').trim().toLowerCase();
      const k3 = String(r.appName || '').trim().toLowerCase();
      if (matchKeys.has(k1) || matchKeys.has(k2) || matchKeys.has(k3)) {
        list.push(r);
        seen.add(r.id);
      }
    }
  }

  return list;
}

// Public reviews endpoints
communityRouter.get('/api/v1/public/community/reviews', async (req, res) => {
  try {
    const appId = String(req.query.appId || req.query.id || '');
    const appSlug = String(req.query.appSlug || req.query.slug || '');
    const limit = Number(req.query.limit) || 15;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const filter = String(req.query.filter || 'all');
    const sortBy = String(req.query.sortBy || 'recent');

    const targetKey = appSlug || appId;
    if (targetKey) {
      let published = getServerReviewsForApp(targetKey).filter(r => (r.status || 'published') === 'published');
      if (filter && filter !== 'all') {
        const starFilter = Number(filter);
        if (!isNaN(starFilter) && starFilter >= 1 && starFilter <= 5) {
          published = published.filter(r => Math.round(Number(r.rating) || 5) === starFilter);
        }
      }
      published.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (sortBy === 'helpful') return (Number(b.helpful_count) || 0) - (Number(a.helpful_count) || 0);
        if (sortBy === 'highest') return (Number(b.rating) || 5) - (Number(a.rating) || 5);
        if (sortBy === 'lowest') return (Number(a.rating) || 5) - (Number(b.rating) || 5);
        return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
      });

      let startIndex = 0;
      if (cursor) {
        const idx = published.findIndex(r => r.id === cursor);
        if (idx >= 0) startIndex = idx + 1;
      }
      const slice = published.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < published.length;
      const nextCursor = hasMore && slice.length > 0 ? slice[slice.length - 1].id : null;

      return res.json({
        reviews: slice,
        hasMore,
        nextCursor,
        totalCount: published.length
      });
    }

    const result = await fetchLiveReviews({
      appId,
      appSlug,
      limit,
      cursor,
      filter,
      sortBy
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error fetching public reviews', reviews: [], hasMore: false });
  }
});

// Public per-app aggregate rating stats endpoint
communityRouter.get('/api/v1/public/community/stats/:appId', async (req, res) => {
  try {
    const rawId = String(req.params.appId || '').toLowerCase().trim();
    const stats = _serverStatsCache || recomputeServerAtomicStats(false);
    const identity = resolveServerAppIdentity(rawId);
    const stat =
      stats.appCounts[rawId] ||
      stats.appCounts[identity.slugKey] ||
      stats.appCounts[identity.idKey];

    if (stat) {
      return res.json({
        success: true,
        stats: {
          totalReviews: Number(stat.published ?? stat.total ?? 0),
          averageRating: Number(stat.avgRating ?? 4.5),
          starCounts: stat.starCounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }

    res.json({
      success: true,
      stats: {
        totalReviews: 0,
        averageRating: 4.5,
        starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    });
  } catch (err: any) {
    res.json({
      success: true,
      stats: {
        totalReviews: 0,
        averageRating: 4.5,
        starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    });
  }
});

communityRouter.post('/api/v1/public/community/reviews', async (req, res) => {
  try {
    const result = await submitLiveReview(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Error submitting review' });
  }
});

communityRouter.post('/api/v1/public/community/reviews/helpful', async (req, res) => {
  try {
    const { reviewId, appId } = req.body || {};
    const success = await voteLiveReviewHelpful(reviewId, appId);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.post('/api/v1/public/community/reviews/report', async (req, res) => {
  try {
    const success = await reportLiveReview(req.body);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Admin reviews endpoints
communityRouter.get('/api/v1/admin/community/reviews', async (req, res) => {
  try {
    const appId = req.query.appId ? String(req.query.appId) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const rating = req.query.rating ? String(req.query.rating) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : undefined;
    const isPinned = req.query.isPinned !== undefined ? String(req.query.isPinned) === 'true' : undefined;
    const limit = Math.max(1, Number(req.query.limit) || 50);
    const page = Math.max(1, Number(req.query.page) || 1);
    const refresh = req.query.refresh === 'true';

    if (refresh) {
      getServerReviewsMap(true);
    }

    const liveStats = (_serverStatsCache && !refresh) ? _serverStatsCache : recomputeServerAtomicStats(false);
    const allReviews = getServerReviewsForApp(appId);

    let appSummary: any = undefined;
    if (appId && appId !== 'all') {
      const identity = resolveServerAppIdentity(appId);
      appSummary =
        liveStats.appCounts[identity.slugKey] ||
        liveStats.appCounts[identity.idKey] ||
        liveStats.appCounts[appId.toLowerCase().trim()];
    }

    let filtered = [...allReviews];

    if (status && status !== 'all') {
      filtered = filtered.filter(r => (r.status || 'published') === status);
    }
    if (rating && rating !== 'all') {
      const rNum = Number(rating);
      filtered = filtered.filter(r => Math.round(Number(r.rating) || 5) === rNum);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(r =>
        (r.userName && r.userName.toLowerCase().includes(q)) ||
        (r.reviewText && r.reviewText.toLowerCase().includes(q)) ||
        (r.appName && r.appName.toLowerCase().includes(q)) ||
        (r.appSlug && r.appSlug.toLowerCase().includes(q))
      );
    }
    if (isPinned !== undefined) {
      filtered = filtered.filter(r => Boolean(r.isPinned) === isPinned);
    }

    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortBy === 'highest') return (Number(b.rating) || 5) - (Number(a.rating) || 5);
      if (sortBy === 'lowest') return (Number(a.rating) || 5) - (Number(b.rating) || 5);
      if (sortBy === 'oldest') return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIdx = (page - 1) * limit;
    const paged = filtered.slice(startIdx, startIdx + limit);

    res.json({
      reviews: paged,
      total,
      totalCount: total,
      page,
      totalPages,
      globalStats: liveStats.globalStats,
      appCounts: liveStats.appCounts,
      appSummary
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message, reviews: [] });
  }
});

communityRouter.post('/api/v1/admin/community/reviews', async (req, res) => {
  try {
    const body = req.body || {};
    const identity = resolveServerAppIdentity(body.appId, body.appSlug, body.appName);
    const reviewId = body.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReview = {
      id: reviewId,
      appId: identity.idKey || body.appId || '',
      appSlug: identity.slugKey || body.appSlug || '',
      appName: identity.displayName || body.appName || '',
      userName: body.userName || 'Verified Player',
      rating: Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5))),
      reviewText: body.reviewText || '',
      timestamp: body.timestamp || new Date().toISOString(),
      status: body.status || 'published',
      helpful_count: Number(body.helpful_count) || 0,
      isPinned: Boolean(body.isPinned),
      reported: false,
      report_count: 0,
      source: body.source || 'admin',
      adminReply: body.adminReply || null
    };

    const revMap = getServerReviewsMap();
    const bucketKey = identity.idKey || identity.slugKey || String(newReview.appId || newReview.appSlug).toLowerCase().trim();
    if (bucketKey) {
      if (!Array.isArray(revMap[bucketKey])) revMap[bucketKey] = [];
      const existingIdx = revMap[bucketKey].findIndex(r => r && r.id === reviewId);
      if (existingIdx >= 0) {
        revMap[bucketKey][existingIdx] = newReview;
      } else {
        revMap[bucketKey].unshift(newReview);
      }
    }

    const updatedStats = recomputeServerAtomicStats(true);
    res.json({
      success: true,
      review: newReview,
      globalStats: updatedStats.globalStats,
      appCounts: updatedStats.appCounts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.post('/api/v1/admin/community/reviews/batch-create', async (req, res) => {
  try {
    const { reviews } = req.body || {};
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ success: false, error: 'No reviews array provided' });
    }
    const revMap = getServerReviewsMap();
    const created: any[] = [];

    for (const body of reviews) {
      if (!body) continue;
      const identity = resolveServerAppIdentity(body.appId, body.appSlug, body.appName);
      const reviewId = body.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newReview = {
        id: reviewId,
        appId: identity.idKey || body.appId || '',
        appSlug: identity.slugKey || body.appSlug || '',
        appName: identity.displayName || body.appName || '',
        userName: body.userName || 'Verified Player',
        rating: Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5))),
        reviewText: body.reviewText || '',
        timestamp: body.timestamp || new Date().toISOString(),
        status: body.status || 'published',
        helpful_count: Number(body.helpful_count) || 0,
        isPinned: Boolean(body.isPinned),
        reported: false,
        report_count: 0,
        source: body.source || 'ai_generated',
        adminReply: body.adminReply || null
      };
      const bucketKey = identity.idKey || identity.slugKey || String(newReview.appId || newReview.appSlug).toLowerCase().trim();
      if (bucketKey) {
        if (!Array.isArray(revMap[bucketKey])) revMap[bucketKey] = [];
        const existingIdx = revMap[bucketKey].findIndex(r => r && r.id === reviewId);
        if (existingIdx >= 0) {
          revMap[bucketKey][existingIdx] = newReview;
        } else {
          revMap[bucketKey].unshift(newReview);
        }
      }
      created.push(newReview);
    }

    const updatedStats = recomputeServerAtomicStats(true);
    res.json({
      success: true,
      count: created.length,
      reviews: created,
      globalStats: updatedStats.globalStats,
      appCounts: updatedStats.appCounts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.put('/api/v1/admin/community/reviews/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    const revMap = getServerReviewsMap();
    let updatedItem: any = { id, ...updates };

    for (const [bKey, arr] of Object.entries(revMap)) {
      if (!Array.isArray(arr)) continue;
      const idx = arr.findIndex(r => r && r.id === id);
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...updates };
        updatedItem = arr[idx];
      }
    }

    const updatedStats = recomputeServerAtomicStats(true);
    res.json({
      success: true,
      review: updatedItem,
      globalStats: updatedStats.globalStats,
      appCounts: updatedStats.appCounts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.patch('/api/v1/admin/community/reviews/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};
    const revMap = getServerReviewsMap();

    for (const arr of Object.values(revMap)) {
      if (!Array.isArray(arr)) continue;
      const idx = arr.findIndex(r => r && r.id === id);
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], status };
      }
    }

    const updatedStats = recomputeServerAtomicStats(true);
    res.json({
      success: true,
      globalStats: updatedStats.globalStats,
      appCounts: updatedStats.appCounts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.patch('/api/v1/admin/community/reviews/:id/pin', async (req, res) => {
  try {
    const id = req.params.id;
    const { isPinned } = req.body || {};
    const revMap = getServerReviewsMap();

    for (const arr of Object.values(revMap)) {
      if (!Array.isArray(arr)) continue;
      const idx = arr.findIndex(r => r && r.id === id);
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], isPinned: Boolean(isPinned) };
      }
    }

    const updatedStats = recomputeServerAtomicStats(true);
    res.json({
      success: true,
      globalStats: updatedStats.globalStats,
      appCounts: updatedStats.appCounts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.delete('/api/v1/admin/community/reviews/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const revMap = getServerReviewsMap();

    for (const k of Object.keys(revMap)) {
      if (Array.isArray(revMap[k])) {
        revMap[k] = revMap[k].filter(r => r && r.id !== id);
      }
    }

    const updatedStats = recomputeServerAtomicStats(true);
    res.json({
      success: true,
      globalStats: updatedStats.globalStats,
      appCounts: updatedStats.appCounts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.post('/api/v1/admin/community/recalculate', async (req, res) => {
  try {
    getServerReviewsMap(true);
    const result = recomputeServerAtomicStats(true);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.post('/api/v1/admin/community/reviews/bulk', async (req, res) => {
  try {
    const { action, reviewIds } = req.body || {};
    const idSet = new Set<string>(Array.isArray(reviewIds) ? reviewIds : []);
    const revMap = getServerReviewsMap();

    for (const k of Object.keys(revMap)) {
      if (!Array.isArray(revMap[k])) continue;
      if (action === 'delete') {
        revMap[k] = revMap[k].filter(r => r && !idSet.has(r.id));
      } else {
        revMap[k] = revMap[k].map(r => {
          if (!r || !idSet.has(r.id)) return r;
          if (action === 'pin' || action === 'unpin') {
            return { ...r, isPinned: action === 'pin' };
          }
          if (['publish', 'pending', 'reject'].includes(action)) {
            const st = action === 'publish' ? 'published' : (action === 'pending' ? 'pending' : 'rejected');
            return { ...r, status: st };
          }
          return r;
        });
      }
    }

    const updatedStats = recomputeServerAtomicStats(true);
    res.json({
      success: true,
      count: idSet.size,
      globalStats: updatedStats.globalStats,
      appCounts: updatedStats.appCounts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

communityRouter.get('/api/v1/admin/community/app-counts', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    if (force) getServerReviewsMap(true);
    const result = (_serverStatsCache && !force) ? _serverStatsCache : recomputeServerAtomicStats(force);
    res.json(result);
  } catch (err: any) {
    res.json({ globalStats: communityCatalogStats, appCounts: (communityCatalogStats as any).appCounts || {} });
  }
});

communityRouter.get('/api/v1/admin/community/overview', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    if (force) getServerReviewsMap(true);
    const atomicStats = (_serverStatsCache && !force) ? _serverStatsCache : recomputeServerAtomicStats(false);
    const metrics = {
      totalReviews: atomicStats.globalStats?.total || 0,
      publishedCount: atomicStats.globalStats?.published || 0,
      pendingCount: atomicStats.globalStats?.pending || 0,
      rejectedCount: atomicStats.globalStats?.rejected || 0,
      flaggedCount: atomicStats.globalStats?.flagged || 0,
      totalReports: 0,
      pendingReportsCount: 0,
      averageRating: atomicStats.globalStats?.averageRating || 4.5,
      ratingDistribution: atomicStats.globalStats?.ratingDistribution,
      appCounts: atomicStats.appCounts || {}
    };
    res.json({ success: true, metrics, projectId: 'rummydexcommunity' });
  } catch (err: any) {
    res.json({ success: true, metrics: communityCatalogStats, projectId: 'rummydexcommunity' });
  }
});

communityRouter.get('/api/v1/admin/community/export-stats', async (req, res) => {
  try {
    const liveStats = recomputeServerAtomicStats(false);
    res.json({
      success: true,
      stats: {
        totalReviews: liveStats.globalStats.total,
        publishedReviews: liveStats.globalStats.published,
        pendingReviews: liveStats.globalStats.pending,
        rejectedReviews: liveStats.globalStats.rejected,
        flaggedReviews: 0,
        averageRating: liveStats.globalStats.averageRating,
        ratingDistribution: liveStats.globalStats.ratingDistribution,
        appCounts: liveStats.appCounts,
        globalStats: liveStats.globalStats
      }
    });
  } catch (err: any) {
    res.json({ success: true, stats: { appCounts: {}, totalReviews: 0 } });
  }
});

communityRouter.get('/api/v1/admin/community/export-static-reviews', async (req, res) => {
  try {
    const revMap = getServerReviewsMap();
    res.json({ success: true, reviews: revMap });
  } catch (err: any) {
    res.json({ success: true, reviews: {} });
  }
});
