/**
 * Client-Side Community Review Engine - Zero-Quota Static & Local Engine
 * The Public Website is 100% DISCONNECTED from Firebase (Zero reads, zero writes, zero quota burn).
 * Loads reviews with 0ms latency from the single atomic static reviews bundle (communityStaticReviews.json).
 */

import communityCatalogStats from './communityCatalogStats.json';
import communityStaticReviews from './communityStaticReviews.json';
import { mockApps, mockSettings } from './staticData';
const staticData = { apps: mockApps, settings: mockSettings };
import { generateNaturalStarDistribution } from '../seo/utils';

export function parseRelativeOrIsoDate(dateInput?: string | Date | number): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? new Date() : dateInput;
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  const str = String(dateInput).trim().toLowerCase();
  if (!str) return new Date();

  const now = Date.now();

  if (str === 'today' || str === 'just now') {
    return new Date();
  }
  if (str === 'yesterday') {
    const d = new Date(now - 24 * 60 * 60 * 1000);
    d.setHours(11 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
    return d;
  }
  const daysMatch = str.match(/^(\d+)\s+days?\s+ago$/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    const d = new Date(now - days * 24 * 60 * 60 * 1000);
    d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
    return d;
  }
  const hoursMatch = str.match(/^(\d+)\s+hours?\s+ago$/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    return new Date(now - hours * 60 * 60 * 1000);
  }
  const weeksMatch = str.match(/^(\d+)\s+weeks?\s+ago$/);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    const d = new Date(now - weeks * 7 * 24 * 60 * 60 * 1000);
    d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
    return d;
  }
  const monthsMatch = str.match(/^(\d+)\s+months?\s+ago$/);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    const d = new Date(now - months * 30 * 24 * 60 * 60 * 1000);
    d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
    return d;
  }

  try {
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) return parsed;
  } catch (_) {}

  return new Date();
}

export function formatReviewDate(dateInput?: string | Date | number, includeTime: boolean = true): string {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (!dateInput) {
    const now = new Date();
    return formatFull(now, includeTime, MONTHS);
  }
  // If already formatted with date and time (e.g. "28 Sep 2026, 04:15 PM")
  if (typeof dateInput === 'string' && /^\d{1,2}\s+[A-Za-z]{3}\s+\d{4},\s+\d{1,2}:\d{2}\s+(AM|PM)$/i.test(dateInput.trim())) {
    return dateInput.trim();
  }
  const d = parseRelativeOrIsoDate(dateInput);
  return formatFull(d, includeTime, MONTHS);
}

function formatFull(d: Date, includeTime: boolean, MONTHS: string[]): string {
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  if (!includeTime) {
    return `${day} ${month} ${year}`;
  }
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

const getEnvVal = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    const v = String(import.meta.env[key]).trim();
    if (v && v.length > 0 && !v.includes('!') && !v.includes('#')) return v;
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    const v = String(process.env[key]).trim();
    if (v && v.length > 0 && !v.includes('!') && !v.includes('#')) return v;
  }
  return undefined;
};

export const getResolvedCommunityFirebaseConfig = () => {
  const rawProjectId = getEnvVal('VITE_COMMUNITY_FIREBASE_PROJECT_ID') || "rummydexcommunity";
  const projectId = (rawProjectId && !rawProjectId.includes('{') && rawProjectId.length < 50) ? rawProjectId : "rummydexcommunity";
  
  const rawDbId = getEnvVal('VITE_COMMUNITY_FIREBASE_DATABASE_ID') || getEnvVal('COMMUNITY_FIREBASE_DATABASE_ID');
  const firestoreDatabaseId = (rawDbId && !rawDbId.includes('{') && !rawDbId.includes('service_account') && rawDbId.length < 40)
    ? rawDbId 
    : '(default)';

  const rawApiKey = getEnvVal('VITE_COMMUNITY_FIREBASE_API_KEY');
  const apiKey = (rawApiKey && rawApiKey.startsWith('AIza') && rawApiKey.length > 20) 
    ? rawApiKey 
    : "AIzaSyCzhWEDLQsZ-HL8iVMcINq78lB-RzYPxi0";

  const rawAppId = getEnvVal('VITE_COMMUNITY_FIREBASE_APP_ID');
  const appId = (rawAppId && rawAppId.startsWith('1:') && rawAppId.length > 20)
    ? rawAppId
    : "1:236598070230:web:df8b1b549dea13938d3277";

  return {
    projectId,
    appId,
    apiKey,
    authDomain: getEnvVal('VITE_COMMUNITY_FIREBASE_AUTH_DOMAIN') || `${projectId}.firebaseapp.com`,
    firestoreDatabaseId,
    storageBucket: getEnvVal('VITE_COMMUNITY_FIREBASE_STORAGE_BUCKET') || `${projectId}.firebasestorage.app`,
    messagingSenderId: getEnvVal('VITE_COMMUNITY_FIREBASE_MESSAGING_ID') || "236598070230",
  };
};

export interface PublicReview {
  id: string;
  app_id: string;
  appId?: string;
  appSlug?: string;
  appName?: string;
  username: string;
  userName?: string;
  rating: number;
  comment: string;
  reviewText?: string;
  created_at: string;
  timestamp?: string;
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
  nextCursor: any;
  stats?: {
    averageRating: number;
    totalReviews: number;
    distribution?: Record<number, number>;
    starCounts?: Record<string, number>;
    counts?: Record<number, number>;
  } | null;
}

export function parseFirestoreFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  if (!fields || typeof fields !== 'object') return result;

  for (const [key, valueObj] of Object.entries(fields)) {
    if (!valueObj || typeof valueObj !== 'object') continue;

    if ('stringValue' in valueObj) {
      result[key] = valueObj.stringValue;
    } else if ('integerValue' in valueObj) {
      result[key] = parseInt(valueObj.integerValue, 10);
    } else if ('doubleValue' in valueObj) {
      result[key] = parseFloat(valueObj.doubleValue);
    } else if ('booleanValue' in valueObj) {
      result[key] = valueObj.booleanValue;
    } else if ('nullValue' in valueObj) {
      result[key] = null;
    } else if ('timestampValue' in valueObj) {
      result[key] = valueObj.timestampValue;
    } else if ('arrayValue' in valueObj) {
      const arr = valueObj.arrayValue?.values || [];
      result[key] = arr.map((item: any) => {
        if (!item || typeof item !== 'object') return item;
        if ('stringValue' in item) return item.stringValue;
        if ('integerValue' in item) return parseInt(item.integerValue, 10);
        if ('doubleValue' in item) return parseFloat(item.doubleValue);
        if ('booleanValue' in item) return item.booleanValue;
        if ('mapValue' in item) return parseFirestoreFields(item.mapValue?.fields || {});
        const parsed = parseFirestoreFields({ temp: item });
        return parsed.temp;
      });
    } else if ('mapValue' in valueObj) {
      result[key] = parseFirestoreFields(valueObj.mapValue?.fields || {});
    }
  }
  return result;
}

export function convertToFirestoreFields(data: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  if (!data || typeof data !== 'object') return fields;

  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue;
    if (val === null) {
      fields[key] = { nullValue: null };
    } else if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: val.toString() };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map(item => {
            if (item === null || item === undefined) return { nullValue: null };
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return Number.isInteger(item) ? { integerValue: item.toString() } : { doubleValue: item };
            if (typeof item === 'boolean') return { booleanValue: item };
            if (typeof item === 'object') return { mapValue: { fields: convertToFirestoreFields(item) } };
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof val === 'object') {
      fields[key] = {
        mapValue: {
          fields: convertToFirestoreFields(val)
        }
      };
    }
  }
  return fields;
}

// In-Memory cache for instant UI response
const MEMORY_CACHE = new Map<string, { result: ReviewFetchResult; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000;

export function invalidateReviewCache(appId?: string, appSlug?: string) {
  if (!appId && !appSlug) {
    MEMORY_CACHE.clear();
    return;
  }
  const keys = [appId, appSlug].filter(Boolean).map(k => String(k).trim());
  keys.forEach(k => {
    MEMORY_CACHE.delete(k);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`cache_rev_${k}`);
      } catch (e) {}
    }
  });
}

export function getCachedLiveReviews(appId?: string, appSlug?: string): ReviewFetchResult | null {
  const keys = [appId, appSlug].filter(Boolean).map(k => String(k).trim()).filter(Boolean);
  if (keys.length === 0) return null;

  for (const targetKey of keys) {
    const mem = MEMORY_CACHE.get(targetKey);
    if (mem && (Date.now() - mem.timestamp < CACHE_TTL_MS)) {
      return mem.result;
    }
  }

  // Bundled static reviews baseline for 0ms initial render
  const staticReviewsMap: Record<string, any> = (communityStaticReviews as any) || {};
  for (const targetKey of keys) {
    const list = staticReviewsMap[targetKey.toLowerCase()] || staticReviewsMap[targetKey];
    if (Array.isArray(list) && list.length > 0) {
      const normalized: PublicReview[] = list.map((r: any) => {
        const uName = (r.userName && r.userName.trim() && r.userName.toLowerCase() !== 'player')
          ? r.userName.trim()
          : (r.username && r.username.trim() ? r.username.trim() : (r.userName || 'Player'));
        const text = r.reviewText || r.comment || '';
        const date = r.created_at || r.timestamp || new Date().toISOString();
        return {
          id: r.id || `rev_${Math.random().toString(36).slice(2)}`,
          app_id: r.appId || r.app_id || targetKey,
          appId: r.appId || targetKey,
          appSlug: r.appSlug || targetKey,
          appName: r.appName || '',
          username: uName,
          userName: uName,
          rating: Number(r.rating) || 5,
          comment: text,
          reviewText: text,
          created_at: formatReviewDate(date),
          timestamp: date,
          helpful_count: Number(r.helpful_count) || 0,
          reported: Boolean(r.reported),
          report_count: Number(r.report_count) || 0,
          source: r.source || 'community',
          isPinned: Boolean(r.isPinned),
          adminReply: r.adminReply || null
        };
      });

      return {
        reviews: normalized.slice(0, 20),
        hasMore: normalized.length > 20,
        nextCursor: normalized.length > 20 ? '20' : null,
        stats: getCachedLiveAppStats(appId, appSlug)
      };
    }
  }

  return null;
}

export function getCachedLiveAppStats(appId?: string, appSlug?: string): {
  averageRating: number;
  totalReviews: number;
  starCounts: Record<string, number>;
  distribution: Record<string, number>;
} | null {
  const cleanId = String(appId || '').trim().toLowerCase();
  const cleanSlug = String(appSlug || '').trim().toLowerCase();
  if (!cleanId && !cleanSlug) return null;

  // Static catalog stats baseline from split-sync (communityCatalogStats.json)
  const catalogCounts: Record<string, any> = (communityCatalogStats as any)?.appCounts || {};
  const hit = (cleanId && catalogCounts[cleanId]) || (cleanSlug && catalogCounts[cleanSlug]);
  if (hit) {
    const pub = Number(hit.published) || Number(hit.total) || 0;
    const avg = Number(hit.avgRating) || 4.5;
    const starCounts = (hit.starCounts && Object.values(hit.starCounts).some((v: any) => Number(v) > 0))
      ? (hit.starCounts as Record<string, number>)
      : generateNaturalStarDistribution(avg, pub);
    return {
      averageRating: avg,
      totalReviews: pub,
      starCounts,
      distribution: starCounts
    };
  }

  return null;
}

function setCachedLiveReviews(targetKey: string, result: ReviewFetchResult) {
  if (!targetKey) return;
  const now = Date.now();
  MEMORY_CACHE.set(targetKey, { result, timestamp: now });
}

/**
 * 100% Zero-Quota Client Review Loader
 * Reads strictly from the single atomic reviews bundle (communityStaticReviews.json)
 * and client-side localStorage. ZERO network requests, ZERO Firebase reads.
 */
export async function fetchLiveReviews(options: {
  appId: string;
  appSlug?: string;
  appTitle?: string;
  cursor?: any;
  limit?: number;
  rating?: number;
  filter?: string;
  sortBy?: string;
}): Promise<ReviewFetchResult> {
  const { appId, appSlug, appTitle, cursor, limit = 5, filter = 'all', sortBy = 'recent' } = options;
  const rawId = (appId || '').trim();
  const rawSlug = (appSlug || '').trim();
  if (!rawId && !rawSlug) return { reviews: [], hasMore: false, nextCursor: null };

  const matchedApp = (staticData.apps || []).find((a: any) => 
    (rawId && (a.id === rawId || a.slug === rawId)) ||
    (rawSlug && (a.id === rawSlug || a.slug === rawSlug))
  );

  const canonicalId = matchedApp?.id || rawId;
  const canonicalSlug = matchedApp?.slug || rawSlug;
  const canonicalName = matchedApp?.name || appTitle || '';

  const targets = Array.from(new Set([
    canonicalId, 
    canonicalSlug, 
    rawId, 
    rawSlug
  ].filter(Boolean) as string[]));

  // Helper to attach locally authored user reviews at the top so user immediately sees their review
  const attachLocalUserReviews = (baseReviews: PublicReview[]): PublicReview[] => {
    if (typeof window === 'undefined') return baseReviews;
    try {
      const localReviewsMap = new Map<string, PublicReview>();
      targets.forEach(t => {
        const stored = localStorage.getItem(`local_user_reviews_${t}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((r: any) => {
              if (r && r.id && !localReviewsMap.has(r.id)) {
                localReviewsMap.set(r.id, r);
              }
            });
          }
        }
      });
      if (localReviewsMap.size === 0) return baseReviews;

      const seenIds = new Set(baseReviews.map(r => r.id));
      const newLocals: PublicReview[] = [];
      localReviewsMap.forEach((rev, id) => {
        if (!seenIds.has(id)) {
          newLocals.push(rev);
        }
      });

      const combined = [...newLocals, ...baseReviews];
      const resultMap = new Map<string, PublicReview>();
      combined.forEach(r => {
        if (r && r.id && !resultMap.has(r.id)) {
          resultMap.set(r.id, r);
        }
      });
      return Array.from(resultMap.values());
    } catch (e) {
      return baseReviews;
    }
  };

  try {
    const staticReviewsMap: Record<string, any> = (communityStaticReviews as any) || {};
    const keysToCheck = [canonicalSlug, canonicalId, rawId].filter(Boolean) as string[];
    let rawReviews: any[] | null = null;
    for (const key of keysToCheck) {
      const cleanKey = String(key).toLowerCase().trim();
      if (Array.isArray(staticReviewsMap[cleanKey]) && staticReviewsMap[cleanKey].length > 0) {
        rawReviews = staticReviewsMap[cleanKey];
        break;
      }
      if (Array.isArray(staticReviewsMap[key]) && staticReviewsMap[key].length > 0) {
        rawReviews = staticReviewsMap[key];
        break;
      }
    }

    let list: any[] = rawReviews && Array.isArray(rawReviews) ? [...rawReviews] : [];

    // Filter
    if (filter === 'positive') {
      list = list.filter(r => Number(r.rating) >= 4);
    } else if (filter === 'critical') {
      list = list.filter(r => Number(r.rating) <= 3);
    }

    // Sort
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortBy === 'helpful') {
        return (Number(b.helpful_count) || 0) - (Number(a.helpful_count) || 0);
      }
      const dateB = new Date(b.timestamp || b.created_at || 0).getTime();
      const dateA = new Date(a.timestamp || a.created_at || 0).getTime();
      return dateB - dateA;
    });

    const offset = cursor ? parseInt(String(cursor), 10) || 0 : 0;
    const pageItems = list.slice(offset, offset + limit);
    const hasMore = offset + limit < list.length;
    const nextCursor = hasMore ? String(offset + limit) : null;

    const mappedPage: PublicReview[] = pageItems.map(r => ({
      id: r.id || `rev_${Math.random().toString(36).slice(2)}`,
      app_id: r.app_id || r.appId || canonicalId,
      appId: r.appId || canonicalId,
      appSlug: r.appSlug || canonicalSlug,
      appName: r.appName || canonicalName,
      username: r.userName || r.username || 'Player',
      userName: r.userName || r.username || 'Player',
      rating: Number(r.rating) || 5,
      comment: r.reviewText || r.comment || '',
      reviewText: r.reviewText || r.comment || '',
      created_at: formatReviewDate(r.timestamp || r.created_at),
      timestamp: r.timestamp || r.created_at || new Date().toISOString(),
      helpful_count: Number(r.helpful_count) || 0,
      reported: Boolean(r.reported),
      report_count: Number(r.report_count) || 0,
      source: r.source || 'community',
      isPinned: Boolean(r.isPinned),
      adminReply: r.adminReply || null
    }));

    const enrichedReviews = attachLocalUserReviews(mappedPage);
    const result: ReviewFetchResult = {
      reviews: enrichedReviews,
      hasMore,
      nextCursor,
      stats: getCachedLiveAppStats(canonicalId, canonicalSlug)
    };
    if (!cursor && filter === 'all' && sortBy === 'recent') {
      targets.forEach(t => setCachedLiveReviews(t, result));
    }
    return result;
  } catch (_) {
    const localEnriched = attachLocalUserReviews([]);
    return {
      reviews: localEnriched.slice(0, limit),
      hasMore: localEnriched.length > limit,
      nextCursor: null,
      stats: getCachedLiveAppStats(canonicalId, canonicalSlug)
    };
  }
}

/**
 * Public Review Submission: Stored securely in client local storage
 * ZERO writes to Firebase to protect database quota.
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
  const cleanAppId = String(data.appId || '').trim();
  const cleanAppSlug = String(data.appSlug || '').trim();
  const cleanAppName = String(data.appName || '').trim();
  const cleanUserName = String(data.userName || '').trim() || 'Player';
  const cleanRating = Math.max(1, Math.min(5, Math.round(Number(data.rating) || 5)));
  const cleanComment = String(data.reviewText || '').trim();

  const generatedId = `rev_local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanDate = formatReviewDate();

  const newReview: PublicReview = {
    id: generatedId,
    app_id: cleanAppId,
    appId: cleanAppId,
    appSlug: cleanAppSlug,
    appName: cleanAppName,
    username: cleanUserName,
    userName: cleanUserName,
    rating: cleanRating,
    comment: cleanComment,
    reviewText: cleanComment,
    created_at: cleanDate,
    timestamp: new Date().toISOString(),
    helpful_count: 0,
    reported: false,
    report_count: 0,
    source: 'community',
    isPinned: false,
    adminReply: null
  };

  // Save to client localStorage so the user sees their submitted review immediately
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `local_user_reviews_${cleanAppId}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existing.unshift(newReview);
      localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, 10)));
      if (cleanAppSlug) {
        localStorage.setItem(`local_user_reviews_${cleanAppSlug}`, JSON.stringify(existing.slice(0, 10)));
      }
      invalidateReviewCache(cleanAppId, cleanAppSlug);
    } catch (_) {}
  }

  return { success: true, review: newReview };
}

/**
 * Vote Helpful: Stored in client localStorage with ZERO writes to Firebase
 */
export async function voteLiveReviewHelpful(reviewId: string, appId?: string): Promise<boolean> {
  if (!reviewId) return false;

  if (typeof window !== 'undefined') {
    try {
      const voted = JSON.parse(localStorage.getItem('voted_reviews_map') || '{}');
      voted[reviewId] = true;
      localStorage.setItem('voted_reviews_map', JSON.stringify(voted));
    } catch (e) {}
  }

  return true;
}

/**
 * Report Review: Flag stored in client localStorage with ZERO writes to Firebase
 */
export async function reportLiveReview(data: {
  reviewId: string;
  appId?: string;
  reason?: string;
  details?: string;
}): Promise<boolean> {
  if (!data.reviewId) return false;

  if (typeof window !== 'undefined') {
    try {
      const reported = JSON.parse(localStorage.getItem('reported_reviews_map') || '{}');
      reported[data.reviewId] = true;
      localStorage.setItem('reported_reviews_map', JSON.stringify(reported));
    } catch (e) {}
  }

  return true;
}

/**
 * General App Report: Stored locally with ZERO writes to Firebase
 */
export async function submitLiveReport(data: {
  type?: string;
  appId: string;
  appName?: string;
  reason: string;
  description: string;
  reporterEmail?: string;
  reporterName?: string;
}): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const key = `local_reports_${data.appId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift({
        id: `rep_${Date.now()}`,
        ...data,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 5)));
    } catch (e) {}
  }

  return true;
}
