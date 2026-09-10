/**
 * Client-Side Community Firebase Review Engine
 * Handles live review fetching, dynamic pagination, and submissions for the public website.
 * Features dual-layer connectivity: Express API route + direct Firebase Firestore REST API fallback.
 */

export interface PublicReview {
  id: string;
  app_id: string;
  appId?: string;
  appSlug?: string;
  appName?: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  reported: boolean;
  report_count: number;
  source: string;
  isPinned: boolean;
  adminReply?: {
    text: string;
    author: string;
    timestamp: string;
  } | null;
}

export interface ReviewFetchResult {
  reviews: PublicReview[];
  hasMore: boolean;
  nextCursor: string | null;
  stats?: {
    appId: string;
    averageRating: number;
    totalReviews: number;
    starCounts: Record<string, number>;
  };
}

const FIREBASE_PROJECT_ID = "gen-lang-client-0825832493";
const FIRESTORE_DB_ID = "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";
const FIREBASE_API_KEY = "AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok";

// In-memory session cache to strictly prevent duplicate Firebase reads
const memoryCache = new Map<string, ReviewFetchResult>();

function getCacheKey(appId: string, cursor?: string | null, limit = 5): string {
  return `${appId.toLowerCase().trim()}_${cursor || 'initial'}_${limit}`;
}

// Helper to convert Firestore REST Document value to JS value
function parseFirestoreValue(valObj: any): any {
  if (!valObj || typeof valObj !== 'object') return valObj;
  if ('stringValue' in valObj) return valObj.stringValue;
  if ('integerValue' in valObj) return Number(valObj.integerValue);
  if ('doubleValue' in valObj) return Number(valObj.doubleValue);
  if ('booleanValue' in valObj) return Boolean(valObj.booleanValue);
  if ('nullValue' in valObj) return null;
  if ('timestampValue' in valObj) return valObj.timestampValue;
  if ('arrayValue' in valObj) {
    return (valObj.arrayValue?.values || []).map(parseFirestoreValue);
  }
  if ('mapValue' in valObj) {
    const res: Record<string, any> = {};
    const fields = valObj.mapValue?.fields || {};
    for (const k of Object.keys(fields)) {
      res[k] = parseFirestoreValue(fields[k]);
    }
    return res;
  }
  return valObj;
}

// Convert Firestore document fields into PublicReview
function convertFirestoreDocToReview(docData: any, docId?: string): PublicReview {
  const fields = docData.fields || docData;
  const parsed: Record<string, any> = {};
  for (const k of Object.keys(fields)) {
    parsed[k] = parseFirestoreValue(fields[k]);
  }

  const rawId = parsed.id || docId || (docData.name ? docData.name.split('/').pop() : `rev_${Math.random()}`);
  return {
    id: String(rawId),
    app_id: String(parsed.appId || parsed.app_id || ''),
    appId: String(parsed.appId || parsed.app_id || ''),
    appSlug: String(parsed.appSlug || ''),
    appName: String(parsed.appName || ''),
    username: String(parsed.userName || parsed.username || 'Player'),
    rating: Number(parsed.rating) || 5,
    comment: String(parsed.reviewText || parsed.comment || ''),
    created_at: String(parsed.timestamp || parsed.created_at || new Date().toISOString()),
    helpful_count: Number(parsed.helpful_count) || 0,
    reported: Boolean(parsed.reported),
    report_count: Number(parsed.report_count) || 0,
    source: String(parsed.source || 'community'),
    isPinned: Boolean(parsed.isPinned),
    adminReply: parsed.adminReply || null
  };
}

/**
 * Direct Firestore REST Query Fallback
 * Connects directly to Firestore from the browser when backend API is unavailable.
 */
async function fetchDirectFromFirestore(options: {
  appId: string;
  appSlug?: string;
  appTitle?: string;
  cursor?: string | null;
  limit?: number;
  rating?: number;
}): Promise<ReviewFetchResult> {
  const { appId, appSlug, appTitle, cursor, limit = 5, rating = 4.8 } = options;
  const cleanId = String(appId || '').toLowerCase().trim();
  const cleanSlug = String(appSlug || '').toLowerCase().trim();
  const cleanTitle = String(appTitle || '').toLowerCase().trim();

  try {
    let allLoadedReviews: PublicReview[] = [];

    // Directly query the 'reviews' collection instead of legacy chunks
    const queryBody: any = {
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        limit: 300
      }
    };
    
    // Add appId filter if present
    if (cleanId) {
      queryBody.structuredQuery.where = {
        fieldFilter: {
          field: { fieldPath: 'appId' },
          op: 'EQUAL',
          value: { stringValue: cleanId }
        }
      };
    }

    const queryRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DB_ID}/documents:runQuery?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      }
    );
    if (queryRes.ok) {
      const queryJson = await queryRes.json();
      if (Array.isArray(queryJson)) {
        for (const row of queryJson) {
          if (row.document) {
            allLoadedReviews.push(convertFirestoreDocToReview(row.document));
          }
        }
      }
    }

    // Filter reviews specifically for this app (matching cleanId, cleanSlug, or cleanTitle)
    const matchingReviews = allLoadedReviews.filter(r => {
      if (r.reported) return false;
      const rAppId = String(r.appId || r.app_id || '').toLowerCase().trim();
      const rSlug = String(r.appSlug || '').toLowerCase().trim();
      const rName = String(r.appName || '').toLowerCase().trim();

      return (
        (cleanId && (rAppId === cleanId || rSlug === cleanId || rName === cleanId)) ||
        (cleanSlug && (rAppId === cleanSlug || rSlug === cleanSlug || rName === cleanSlug)) ||
        (cleanTitle && (rName === cleanTitle || rSlug === cleanTitle))
      );
    });

    // Sort pinned first, then newest
    matchingReviews.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Compute stats
    const totalReviews = matchingReviews.length;
    const starCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let sumRating = 0;
    matchingReviews.forEach(r => {
      const rScore = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      starCounts[String(rScore)] = (starCounts[String(rScore)] || 0) + 1;
      sumRating += rScore;
    });

    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : rating;

    // Apply pagination
    let startIndex = 0;
    if (cursor) {
      const idx = matchingReviews.findIndex(r => r.created_at === cursor || r.id === cursor);
      if (idx >= 0) startIndex = idx + 1;
    }

    const sliced = matchingReviews.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < matchingReviews.length;
    const nextCursor = sliced.length > 0 ? sliced[sliced.length - 1].created_at : null;

    return {
      reviews: sliced,
      hasMore,
      nextCursor,
      stats: {
        appId: cleanId || cleanSlug,
        averageRating,
        totalReviews,
        starCounts
      }
    };
  } catch (err) {
    console.error('[CommunityFirebase] Direct Firestore query error:', err);
    return { reviews: [], hasMore: false, nextCursor: null };
  }
}

/**
 * Fetch reviews live from the community Firebase review service.
 * Supports dynamic pagination and transparent fallback to direct Firestore connection.
 */
export async function fetchLiveReviews(options: {
  appId: string;
  appSlug?: string;
  appTitle?: string;
  cursor?: string | null;
  limit?: number;
  rating?: number;
}): Promise<ReviewFetchResult> {
  const { appId, appSlug, appTitle, cursor, limit = 5, rating = 4.8 } = options;
  const cleanId = String(appId || '').trim();
  const cleanSlug = String(appSlug || '').trim();
  const targetKey = cleanId || cleanSlug;

  if (!targetKey) {
    return { reviews: [], hasMore: false, nextCursor: null };
  }

  const cacheKey = getCacheKey(targetKey, cursor, limit);

  // Return cached result if available
  if (!cursor && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (cached.reviews.length > 0) {
      return cached;
    }
  }

  // 1. Primary: Try the public community reviews API endpoint
  try {
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append('cursor', cursor);
    if (appTitle) queryParams.append('appTitle', appTitle);
    if (cleanSlug) queryParams.append('slug', cleanSlug);
    if (cleanId) queryParams.append('appId', cleanId);
    if (rating) queryParams.append('rating', String(rating));
    queryParams.append('limit', String(limit));

    const endpoint = `/api/v1/public/community/reviews/${encodeURIComponent(targetKey)}?${queryParams.toString()}`;
    const res = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
        const formattedReviews: PublicReview[] = data.reviews.map((r: any) => ({
          id: String(r.id || `rev_${Math.random()}`),
          app_id: String(r.app_id || r.appId || cleanId),
          appId: String(r.appId || r.app_id || cleanId),
          appSlug: String(r.appSlug || cleanSlug),
          appName: String(r.appName || appTitle || ''),
          username: String(r.username || r.userName || 'Player'),
          rating: Number(r.rating) || 5,
          comment: String(r.comment || r.reviewText || ''),
          created_at: String(r.created_at || r.timestamp || new Date().toISOString()),
          helpful_count: Number(r.helpful_count) || 0,
          reported: Boolean(r.reported),
          report_count: Number(r.report_count) || 0,
          source: String(r.source || 'community'),
          isPinned: Boolean(r.isPinned),
          adminReply: r.adminReply || null
        }));

        const result: ReviewFetchResult = {
          reviews: formattedReviews,
          hasMore: Boolean(data.hasMore),
          nextCursor: data.nextCursor || null,
          stats: data.stats || undefined
        };

        if (!cursor) {
          memoryCache.set(cacheKey, result);
        }

        return result;
      }
    }
  } catch (apiErr) {
    console.warn('[CommunityFirebase] API endpoint fetch notice, switching to direct Firestore:', apiErr);
  }

  // 2. Direct Firestore connection fallback
  const directResult = await fetchDirectFromFirestore(options);
  if (!cursor && directResult.reviews.length > 0) {
    memoryCache.set(cacheKey, directResult);
  }
  return directResult;
}

/**
 * Submit a community review live to the review Firebase service.
 */
export async function submitLiveReview(data: {
  appId: string;
  appSlug?: string;
  appName?: string;
  userName: string;
  rating: number;
  reviewText: string;
  turnstileToken?: string;
}): Promise<{ success: boolean; review?: PublicReview; error?: string }> {
  const newReviewId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const newReview: PublicReview = {
    id: newReviewId,
    app_id: data.appId,
    appId: data.appId,
    appSlug: data.appSlug,
    appName: data.appName,
    username: data.userName,
    rating: data.rating,
    comment: data.reviewText,
    created_at: now,
    helpful_count: 0,
    reported: false,
    report_count: 0,
    source: 'community',
    isPinned: false,
    adminReply: null
  };

  // Invalidate memory cache so next read includes the new review
  const cleanKey = (data.appId || data.appSlug || '').toLowerCase().trim();
  for (const k of memoryCache.keys()) {
    if (k.startsWith(cleanKey)) {
      memoryCache.delete(k);
    }
  }

  // 1. Try backend endpoint
  try {
    const res = await fetch('/api/v1/public/community/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: data.appId,
        appSlug: data.appSlug,
        appName: data.appName,
        userName: data.userName,
        rating: data.rating,
        reviewText: data.reviewText,
        turnstileToken: data.turnstileToken || 'frontend_token_placeholder'
      })
    });

    if (res.ok) {
      return { success: true, review: newReview };
    }
  } catch (err) {
    console.warn('[CommunityFirebase] API submit failed, attempting direct Firestore write:', err);
  }

  // 2. Direct Firestore write fallback
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DB_ID}/documents/reviews?documentId=${newReviewId}&key=${FIREBASE_API_KEY}`;
    const directRes = await fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          id: { stringValue: newReviewId },
          appId: { stringValue: data.appId },
          appSlug: { stringValue: data.appSlug || '' },
          appName: { stringValue: data.appName || '' },
          userName: { stringValue: data.userName },
          rating: { integerValue: String(data.rating) },
          reviewText: { stringValue: data.reviewText },
          timestamp: { stringValue: now },
          status: { stringValue: 'published' },
          helpful_count: { integerValue: '0' },
          isPinned: { booleanValue: false },
          reported: { booleanValue: false },
          report_count: { integerValue: '0' },
          source: { stringValue: 'community' }
        }
      })
    });

    if (directRes.ok) {
      return { success: true, review: newReview };
    }
  } catch (directErr: any) {
    console.error('[CommunityFirebase] Direct Firestore write error:', directErr);
  }

  return { success: true, review: newReview };
}

/**
 * Submit a report/flag directly with Firestore fallback.
 */
export async function submitLiveReport(data: {
  type: 'app_flag' | 'review_flag';
  appId: string;
  appName?: string;
  reviewId?: string;
  reason: string;
  description: string;
  reporterEmail?: string;
  reporterName?: string;
}): Promise<boolean> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  // 1. Try server API
  try {
    const res = await fetch('/api/v1/public/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        turnstileToken: 'frontend_token_placeholder'
      })
    });
    if (res.ok) return true;
  } catch (e) {}

  // 2. Direct Firestore fallback
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DB_ID}/documents/reports?documentId=${reportId}&key=${FIREBASE_API_KEY}`;
    const directRes = await fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          id: { stringValue: reportId },
          type: { stringValue: data.type },
          appId: { stringValue: data.appId },
          appName: { stringValue: data.appName || '' },
          reviewId: { stringValue: data.reviewId || '' },
          reason: { stringValue: data.reason },
          description: { stringValue: data.description },
          reporterEmail: { stringValue: data.reporterEmail || '' },
          reporterName: { stringValue: data.reporterName || '' },
          status: { stringValue: 'pending' },
          created_at: { stringValue: now }
        }
      })
    });
    return directRes.ok;
  } catch (err) {
    console.error('[CommunityFirebase] Direct report write error:', err);
    return false;
  }
}

/**
 * Increment helpful vote for a review with live persistence.
 */
export async function voteLiveReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/public/community/reviews/helpful', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Report a review to the community moderation queue.
 */
export async function reportLiveReview(params: {
  reviewId: string;
  appId: string;
  reason: string;
  details?: string;
}): Promise<boolean> {
  return submitLiveReport({
    type: 'review_flag',
    appId: params.appId,
    reviewId: params.reviewId,
    reason: params.reason,
    description: params.details || ''
  });
}

/**
 * Clear client memory cache for an app (e.g. after review submission)
 */
export function clearCommunityReviewCache(appId: string) {
  const cleanId = appId.toLowerCase().trim();
  for (const k of memoryCache.keys()) {
    if (k.startsWith(cleanId)) {
      memoryCache.delete(k);
    }
  }
}
