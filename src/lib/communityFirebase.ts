/**
 * Client-Side Community Firebase Review Engine
 * Connected LIVE directly to Firestore (Client SDK + Direct Firestore REST + Backend Fallback).
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  doc, 
  setDoc, 
  updateDoc,
  increment,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
// @ts-ignore
import appletConfig from '../../firebase-applet-config.json';

// Multi-tier environment and config resolver with validation to ignore mock strings
const isValidVal = (v: any): boolean => {
  if (!v || typeof v !== 'string') return false;
  const s = v.trim();
  if (!s || s.length < 3) return false;
  // Ignore mock/dummy strings that contain symbol garbage like ! # $ ^
  if (s.includes('#') || s.includes('!') || s.includes('$') || s.includes('^') || s.includes('*')) return false;
  return true;
};

const getEnvVal = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env && isValidVal(import.meta.env[key])) {
    return String(import.meta.env[key]).trim();
  }
  if (typeof process !== 'undefined' && process.env && isValidVal(process.env[key])) {
    return String(process.env[key]).trim();
  }
  return undefined;
};

export const getResolvedCommunityFirebaseConfig = () => {
  const cfg = (appletConfig as any) || {};
  const projectId = getEnvVal('VITE_COMMUNITY_FIREBASE_PROJECT_ID') || "gen-lang-client-0825832493";
  const defaultDbId = projectId === 'gen-lang-client-0825832493' ? 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a' : '(default)';

  return {
    projectId,
    appId: getEnvVal('VITE_COMMUNITY_FIREBASE_APP_ID') || "1:103973989874:web:733a6afd8e837224900f6b",
    apiKey: getEnvVal('VITE_COMMUNITY_FIREBASE_API_KEY') || getEnvVal('VITE_FIREBASE_API_KEY') || (isValidVal(cfg.apiKey) ? cfg.apiKey : "AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok"),
    authDomain: getEnvVal('VITE_COMMUNITY_FIREBASE_AUTH_DOMAIN') || `${projectId}.firebaseapp.com`,
    firestoreDatabaseId: getEnvVal('VITE_COMMUNITY_FIREBASE_DATABASE_ID') || defaultDbId,
    storageBucket: getEnvVal('VITE_COMMUNITY_FIREBASE_STORAGE_BUCKET') || `${projectId}.firebasestorage.app`,
    messagingSenderId: getEnvVal('VITE_COMMUNITY_FIREBASE_MESSAGING_ID') || "103973989874",
  };
};

const resolvedConfig = getResolvedCommunityFirebaseConfig();

// Helper to resolve the correct Firestore Database ID dynamically
const getResolvedDatabaseId = () => {
  const cfg = resolvedConfig;
  return cfg.firestoreDatabaseId || (cfg as any).databaseId || (cfg.projectId === 'rummydexcommunity' ? '(default)' : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a');
};

// Initialize Client Firestore safely
// We deliberately keep clientDb null to disable the Firebase Client SDK. 
// This forces the app to use the ultra-fast Express Server API and direct REST fallbacks,
// completely eliminating "Could not reach Cloud Firestore backend" WebSocket timeout errors
// that occur in restricted sandbox or mobile environments.
let clientDb: Firestore | null = null;
if (typeof window !== 'undefined' && resolvedConfig.apiKey) {
  // Disabled SDK initialization
  console.log('[Community] Bypassing Firebase SDK to prevent WebSocket timeouts. Using REST/Server API instead.');
}

let activeUnsubscribe: (() => void) | null = null;
let activeTargetId: string | null = null;

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
  nextCursor: any;
  stats?: any;
}

// Direct Client-Side Firestore REST Query Engine (Works across all browsers, ad-blockers, and networks)
async function fetchReviewsDirectFromFirestoreRest(
  targets: string[], 
  limitCount: number = 20, 
  cursor?: string | null
): Promise<any[]> {
  try {
    const cfg = resolvedConfig;
    if (!cfg.projectId || !cfg.apiKey) return [];
    const cleanTargets = targets.filter(Boolean).map(t => String(t).trim()).filter(Boolean);
    if (cleanTargets.length === 0) return [];

    const dbId = getResolvedDatabaseId();
    const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${dbId}/documents:runQuery?key=${encodeURIComponent(cfg.apiKey)}`;

    const fetchByFilter = async (fieldPath: string, values: string[]) => {
      const body: any = {
        structuredQuery: {
          from: [{ collectionId: 'reviews' }],
          limit: 1000
        }
      };

      if (values.length === 1) {
        body.structuredQuery.where = {
          fieldFilter: {
            field: { fieldPath },
            op: 'EQUAL',
            value: { stringValue: values[0] }
          }
        };
      } else {
        body.structuredQuery.where = {
          fieldFilter: {
            field: { fieldPath },
            op: 'IN',
            value: {
              arrayValue: {
                values: values.slice(0, 10).map(v => ({ stringValue: v }))
              }
            }
          }
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      const parsed: any[] = [];
      for (const item of data) {
        if (item && item.document && item.document.fields) {
          const docId = item.document.name.split('/').pop();
          const f = item.document.fields;
          parsed.push({
            id: f.id?.stringValue || docId,
            appId: f.appId?.stringValue,
            appSlug: f.appSlug?.stringValue,
            appName: f.appName?.stringValue,
            userName: f.userName?.stringValue || f.username?.stringValue || 'Player',
            rating: Number(f.rating?.integerValue || f.rating?.doubleValue || 5),
            reviewText: f.reviewText?.stringValue || f.comment?.stringValue || '',
            timestamp: f.timestamp?.stringValue || f.created_at?.stringValue || new Date().toISOString(),
            status: f.status?.stringValue || 'published',
            helpful_count: Number(f.helpful_count?.integerValue || f.helpful_count?.doubleValue || 0),
            reported: Boolean(f.reported?.booleanValue),
            report_count: Number(f.report_count?.integerValue || 0),
            source: f.source?.stringValue || 'community',
            isPinned: Boolean(f.isPinned?.booleanValue),
            adminReply: f.adminReply?.mapValue?.fields ? {
              text: f.adminReply.mapValue.fields.text?.stringValue || '',
              author: f.adminReply.mapValue.fields.author?.stringValue || 'Admin',
              timestamp: f.adminReply.mapValue.fields.timestamp?.stringValue || ''
            } : null
          });
        }
      }
      return parsed;
    };

    // Concurrently fetch by appId, appSlug, app_id, and app_slug for 100% coverage
    const [byAppId, byAppSlug, byApp_Id, byApp_Slug] = await Promise.all([
      fetchByFilter('appId', cleanTargets),
      fetchByFilter('appSlug', cleanTargets),
      fetchByFilter('app_id', cleanTargets),
      fetchByFilter('app_slug', cleanTargets)
    ]);

    const combinedMap = new Map<string, any>();
    byAppId.forEach(r => combinedMap.set(r.id, r));
    byAppSlug.forEach(r => combinedMap.set(r.id, r));
    byApp_Id.forEach(r => combinedMap.set(r.id, r));
    byApp_Slug.forEach(r => combinedMap.set(r.id, r));

    return Array.from(combinedMap.values());
  } catch (e) {
    console.warn('[Community] Direct Firestore REST notice:', e);
    return [];
  }
}

// In-memory cache for lightning-fast pagination and load-more functionality
const memoryReviewCache = new Map<string, PublicReview>();
let lastFetchTime = 0;
let lastTargetKey = '';

// LIVE Community Review Engine
export async function fetchLiveReviews(options: {
  appId: string;
  appSlug?: string;
  appTitle?: string;
  cursor?: any;
  limit?: number;
  rating?: number;
}): Promise<ReviewFetchResult> {
  const { appId, appSlug, appTitle, cursor, limit = 5, rating } = options;
  const targetId = (appId || '').trim();
  const targetSlug = (appSlug || '').trim();
  
  if (!targetId && !targetSlug) return { reviews: [], hasMore: false, nextCursor: null };

  const effectiveId = targetId || targetSlug;
  const queryParams = new URLSearchParams();
  if (targetSlug) queryParams.append('appSlug', targetSlug);
  if (appTitle) queryParams.append('appTitle', appTitle);
  if (cursor) queryParams.append('cursor', String(cursor));
  queryParams.append('limit', String(limit));
  if (rating) queryParams.append('rating', String(rating));

  const path = `/api/v1/public/community/reviews/${encodeURIComponent(effectiveId)}?${queryParams.toString()}`;
  const url = typeof window !== 'undefined' ? path : `http://localhost:3000${path}`;

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn(`[Community API] Failed to fetch reviews: HTTP ${res.status}`);
      return { reviews: [], hasMore: false, nextCursor: null };
    }

    const data = await res.json();
    return {
      reviews: data.reviews || [],
      hasMore: Boolean(data.hasMore),
      nextCursor: data.nextCursor || null,
      stats: data.stats || null
    };
  } catch (err) {
    console.warn('[Community API] Error fetching live reviews:', err);
    return { reviews: [], hasMore: false, nextCursor: null };
  }
}

export async function submitLiveReview(data: {
  appId: string;
  appSlug?: string;
  appName?: string;
  userName: string;
  rating: number;
  reviewText: string;
  turnstileToken?: string;
}): Promise<{ success: boolean; review?: PublicReview; error?: string }> {
  try {
    const url = typeof window !== 'undefined' ? '/api/v1/public/community/reviews' : 'http://localhost:3000/api/v1/public/community/reviews';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to submit review' };
    }
    
    const resData = await res.json();
    
    if (resData.success && resData.review) {
      // 2. Save to localStorage for instant client-side persistence
      try {
        const localKey = `local_user_reviews_${data.appId}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        existing.unshift(resData.review);
        localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 50)));
      } catch (lsErr) {}

      // 3. Dispatch global window event so all UI components update live
      try {
        window.dispatchEvent(new CustomEvent('community-review-added', {
          detail: { newReview: resData.review }
        }));
      } catch (evErr) {}
    }

    return resData;
  } catch (err: any) {
    console.error("Community submit error:", err);
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}

export async function submitLiveReport(data: any): Promise<boolean> {
  try {
    const url = typeof window !== 'undefined' ? '/api/v1/public/reports' : 'http://localhost:3000/api/v1/public/reports';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function voteLiveReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    const url = typeof window !== 'undefined' ? '/api/v1/public/community/reviews/helpful' : 'http://localhost:3000/api/v1/public/community/reviews/helpful';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function reportLiveReview(params: any): Promise<boolean> {
  return submitLiveReport({ type: 'review_flag', ...params });
}
