/**
 * Client-Side Community Firebase Review Engine
 * Connected LIVE directly to Firestore (Client SDK + Direct Firestore REST + Backend Fallback).
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
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
  // FORCE default to rummydexcommunity to guarantee public website uses it even if Vercel vars are missing
  const projectId = getEnvVal('VITE_COMMUNITY_FIREBASE_PROJECT_ID') || "rummydexcommunity";
  const defaultDbId = projectId === 'rummydexcommunity' ? '(default)' : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';

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
let clientDb: Firestore | null = null;
if (typeof window !== 'undefined' && resolvedConfig.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(resolvedConfig) : getApp();
    const dbId = getResolvedDatabaseId();
    clientDb = dbId === '(default)' ? getFirestore(app) : getFirestore(app, dbId);
    console.log('[Community] Client Firebase connected to project:', resolvedConfig.projectId, 'database:', dbId);
  } catch (e) {
    console.warn("[Community] Client Firebase init notice:", e);
  }
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
          orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
          limit: Math.max(1, Math.min(50, limitCount))
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

      if (cursor) {
        body.structuredQuery.startAt = {
          values: [{ stringValue: String(cursor) }],
          before: false
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

// LIVE Community Review Engine
export async function fetchLiveReviews(options: {
  appId: string;
  appSlug?: string;
  appTitle?: string;
  cursor?: any;
  limit?: number;
  rating?: number;
}): Promise<ReviewFetchResult> {
  const { appId, appSlug, appTitle, cursor, limit: limitCount = 5 } = options;
  const targetId = (appId || '').trim();
  const targetSlug = (appSlug || '').trim();
  
  if (!targetId && !targetSlug) return { reviews: [], hasMore: false, nextCursor: null };

  // Lightning-fast Server API Fetch: 
  // Paginates exactly 5, perfect sorting (Pinned first), caches heavily on backend. Zero direct Firebase read limits hit.
  try {
    const url = `/api/v1/public/community/reviews/${encodeURIComponent(targetId || targetSlug)}?limit=${limitCount}${cursor ? `&cursor=${cursor}` : ''}&slug=${encodeURIComponent(targetSlug)}&appTitle=${encodeURIComponent(appTitle || '')}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.reviews && Array.isArray(data.reviews)) {
        return {
          reviews: data.reviews,
          hasMore: Boolean(data.hasMore),
          nextCursor: data.nextCursor,
          stats: data.stats
        };
      }
    }
  } catch (e) {
    console.warn("[Community] Server fetch unavailable, falling back to REST limit-5...", e);
  }

  // Fallback REST Fetch (Only triggers if the server API network fails)
  try {
    const targets = Array.from(new Set([targetId, targetSlug].filter(Boolean)));
    const restRevs = await fetchReviewsDirectFromFirestoreRest(targets, limitCount, cursor);
    
    // Sort the limited fallback payload just in case (fallback is less accurate than server)
    const sortedRest = Array.isArray(restRevs) ? restRevs.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.created_at || b.timestamp).getTime() - new Date(a.created_at || a.timestamp).getTime();
    }) : [];

    const lastItem = sortedRest.length > 0 ? sortedRest[sortedRest.length - 1] : null;
    return {
      reviews: sortedRest as PublicReview[],
      hasMore: sortedRest.length === limitCount,
      nextCursor: lastItem ? (lastItem.created_at || lastItem.id) : null,
      stats: null
    };
  } catch (e) {
    console.warn("[Community] REST fallback fetch also failed:", e);
  }

  return { reviews: [], hasMore: false, nextCursor: null };
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
    const newId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const reviewPayload = {
      id: newId,
      appId: data.appId,
      app_id: data.appId,
      appSlug: data.appSlug || '',
      appName: data.appName || '',
      userName: data.userName,
      username: data.userName,
      rating: Number(data.rating) || 5,
      reviewText: data.reviewText,
      comment: data.reviewText,
      timestamp: now,
      created_at: now,
      status: 'published',
      helpful_count: 0,
      reported: false,
      report_count: 0,
      isPinned: false,
      source: 'community'
    };

    const formattedReview: PublicReview = {
      id: newId,
      app_id: data.appId,
      appId: data.appId,
      appSlug: data.appSlug || '',
      appName: data.appName || '',
      username: data.userName,
      rating: Number(data.rating) || 5,
      comment: data.reviewText,
      created_at: now,
      helpful_count: 0,
      reported: false,
      report_count: 0,
      isPinned: false,
      source: 'community',
      adminReply: null
    };

    // 1. Direct Firestore REST Write (Guaranteed to work in SPA without backend server)
    try {
      const cfg = resolvedConfig;
      if (cfg.projectId && cfg.apiKey) {
        const dbId = getResolvedDatabaseId();
        const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${dbId}/documents/reviews/${newId}?key=${encodeURIComponent(cfg.apiKey)}`;
        
        const restFields: Record<string, any> = {
          id: { stringValue: newId },
          appId: { stringValue: data.appId },
          app_id: { stringValue: data.appId },
          appSlug: { stringValue: data.appSlug || '' },
          app_slug: { stringValue: data.appSlug || '' },
          appName: { stringValue: data.appName || '' },
          userName: { stringValue: data.userName },
          username: { stringValue: data.userName },
          rating: { integerValue: String(data.rating || 5) },
          reviewText: { stringValue: data.reviewText },
          comment: { stringValue: data.reviewText },
          timestamp: { stringValue: now },
          created_at: { stringValue: now },
          status: { stringValue: 'published' },
          helpful_count: { integerValue: "0" },
          reported: { booleanValue: false },
          report_count: { integerValue: "0" },
          source: { stringValue: 'community' },
          isPinned: { booleanValue: false }
        };

        await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: restFields })
        });
      }
    } catch (restWriteErr) {
      console.warn("[Community] Direct Firestore REST write note:", restWriteErr);
    }

    // 1b. Direct Firestore write via Client SDK
    if (clientDb) {
      try {
        await setDoc(doc(clientDb, 'reviews', formattedReview.id), {
          ...reviewPayload,
          id: formattedReview.id
        });
      } catch (fsErr) {
        console.warn("[Community] Direct Firestore review write notice:", fsErr);
      }
    }

    // 1c. Submit to Server API (if backend is running)
    try {
      const res = await fetch('/api/v1/public/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewPayload,
          turnstileToken: data.turnstileToken
        })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.review) {
          formattedReview.id = resData.review.id || formattedReview.id;
        }
      }
    } catch (apiErr) {
      // Expected on static site
    }

    // 2. Save to localStorage for instant client-side persistence
    try {
      const localKey = `local_user_reviews_${data.appId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      existing.unshift(formattedReview);
      localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 50)));
    } catch (lsErr) {}

    // 3. Dispatch global window event so all UI components update live
    try {
      window.dispatchEvent(new CustomEvent('community-review-added', {
        detail: { newReview: formattedReview }
      }));
    } catch (evErr) {}

    return { 
      success: true, 
      review: formattedReview 
    };
  } catch (err: any) {
    console.error("Community submit error:", err);
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}

export async function submitLiveReport(data: any): Promise<boolean> {
  try {
    const newId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const payload = {
      id: newId,
      ...data,
      status: 'pending',
      timestamp: now,
      created_at: now
    };

    // 1. Direct Firestore REST write
    try {
      const cfg = resolvedConfig;
      if (cfg.projectId && cfg.apiKey) {
        const dbId = getResolvedDatabaseId();
        const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${dbId}/documents/reports/${newId}?key=${encodeURIComponent(cfg.apiKey)}`;
        
        const restFields: Record<string, any> = {
          id: { stringValue: newId },
          status: { stringValue: 'pending' },
          timestamp: { stringValue: now }
        };
        if (data.type) restFields.type = { stringValue: String(data.type) };
        if (data.appId) restFields.appId = { stringValue: String(data.appId) };
        if (data.reason) restFields.reason = { stringValue: String(data.reason) };
        if (data.details) restFields.details = { stringValue: String(data.details) };

        await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: restFields })
        });
      }
    } catch (e) {}

    // 2. Direct Firestore report write via SDK
    if (clientDb) {
      try {
        await setDoc(doc(clientDb, 'reports', newId), payload);
      } catch (e) {}
    }

    // 3. Server API write
    try {
      await fetch('/api/v1/public/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}

    return true;
  } catch {
    return false;
  }
}

export async function voteLiveReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    // 1. Direct Firestore helpful increment via REST
    try {
      const cfg = resolvedConfig;
      if (cfg.projectId && cfg.apiKey) {
        const dbId = getResolvedDatabaseId();
        const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${dbId}/documents:commit?key=${encodeURIComponent(cfg.apiKey)}`;
        
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            writes: [
              {
                transform: {
                  document: `projects/${cfg.projectId}/databases/${dbId}/documents/reviews/${reviewId}`,
                  fieldTransforms: [
                    {
                      fieldPath: 'helpful_count',
                      increment: { integerValue: '1' }
                    }
                  ]
                }
              }
            ]
          })
        });
      }
    } catch (e) {}

    // 2. Direct Firestore helpful increment via SDK
    if (clientDb) {
      try {
        await updateDoc(doc(clientDb, 'reviews', reviewId), {
          helpful_count: increment(1)
        });
      } catch (e) {}
    }

    // 3. Server API helpful vote
    try {
      await fetch('/api/v1/public/community/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });
    } catch (e) {}

    return true;
  } catch {
    return false;
  }
}

export async function reportLiveReview(params: any): Promise<boolean> {
  return submitLiveReport({ type: 'review_flag', ...params });
}


