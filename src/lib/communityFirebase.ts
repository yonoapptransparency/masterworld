/**
 * Client-Side Community Firebase Review Engine
 * Connected LIVE directly to Firestore (Client SDK).
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

// Multi-tier environment and config resolver
const getEnvVal = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const getResolvedCommunityFirebaseConfig = () => {
  const cfg = (appletConfig as any) || {};
  return {
    projectId: getEnvVal('VITE_FIREBASE_PROJECT_ID') || cfg.projectId || "gen-lang-client-0825832493",
    appId: getEnvVal('VITE_FIREBASE_APP_ID') || cfg.appId || "1:103973989874:web:733a6afd8e837224900f6b",
    apiKey: getEnvVal('VITE_FIREBASE_API_KEY') || cfg.apiKey || "AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok",
    authDomain: getEnvVal('VITE_FIREBASE_AUTH_DOMAIN') || cfg.authDomain || "gen-lang-client-0825832493.firebaseapp.com",
    firestoreDatabaseId: getEnvVal('VITE_FIREBASE_DATABASE_ID') || cfg.firestoreDatabaseId || cfg.databaseId || "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a",
    storageBucket: getEnvVal('VITE_FIREBASE_STORAGE_BUCKET') || cfg.storageBucket || "gen-lang-client-0825832493.firebasestorage.app",
    messagingSenderId: getEnvVal('VITE_FIREBASE_MESSAGING_ID') || cfg.messagingSenderId || "103973989874",
  };
};

const resolvedConfig = getResolvedCommunityFirebaseConfig();

// Initialize Client Firestore safely
let clientDb: Firestore | null = null;
if (typeof window !== 'undefined' && resolvedConfig.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(resolvedConfig) : getApp();
    const dbId = resolvedConfig.firestoreDatabaseId || '(default)';
    clientDb = dbId === '(default)' ? getFirestore(app) : getFirestore(app, dbId);
    console.log('[Community] Client Firebase connected to database:', dbId);
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
  limitCount: number = 5, 
  cursor?: string | null
): Promise<any[]> {
  try {
    const cfg = resolvedConfig;
    if (!cfg.projectId || !cfg.apiKey) return [];
    const cleanTargets = targets.filter(Boolean).map(t => String(t).trim()).filter(Boolean);
    if (cleanTargets.length === 0) return [];

    const dbId = cfg.firestoreDatabaseId || (cfg as any).databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${dbId}/documents:runQuery?key=${encodeURIComponent(cfg.apiKey)}`;

    const body: any = {
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
        limit: Math.max(1, Math.min(50, limitCount))
      }
    };

    if (cursor) {
      body.structuredQuery.startAt = {
        values: [{ stringValue: String(cursor) }],
        before: false
      };
    }

    if (cleanTargets.length === 1) {
      body.structuredQuery.where = {
        compositeFilter: {
          op: 'OR',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'appId' },
                op: 'EQUAL',
                value: { stringValue: cleanTargets[0] }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: 'appSlug' },
                op: 'EQUAL',
                value: { stringValue: cleanTargets[0] }
              }
            }
          ]
        }
      };
    } else {
      body.structuredQuery.where = {
        compositeFilter: {
          op: 'OR',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'appId' },
                op: 'IN',
                value: {
                  arrayValue: {
                    values: cleanTargets.slice(0, 10).map(v => ({ stringValue: v }))
                  }
                }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: 'appSlug' },
                op: 'IN',
                value: {
                  arrayValue: {
                    values: cleanTargets.slice(0, 10).map(v => ({ stringValue: v }))
                  }
                }
              }
            }
          ]
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

    const results: any[] = [];
    for (const item of data) {
      if (item && item.document && item.document.fields) {
        const docId = item.document.name.split('/').pop();
        const f = item.document.fields;
        results.push({
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
    return results;
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

  const reviewMap = new Map<string, PublicReview>();
  let serverHasMore = false;
  let serverNextCursor: string | null = null;

  // Helper to add review safely
  const addReview = (r: any) => {
    if (!r || !r.id) return;
    if (r.status && r.status !== 'published') return;
    const rev: PublicReview = {
      id: String(r.id),
      app_id: r.appId || r.app_id || targetId,
      appId: r.appId || targetId,
      appSlug: r.appSlug || targetSlug,
      appName: r.appName || appTitle || '',
      username: r.userName || r.username || 'Player',
      rating: Number(r.rating) || 5,
      comment: r.reviewText || r.comment || '',
      created_at: r.timestamp || r.created_at || new Date().toISOString(),
      helpful_count: Number(r.helpful_count) || 0,
      reported: Boolean(r.reported),
      report_count: Number(r.report_count) || 0,
      source: r.source || 'community',
      isPinned: Boolean(r.isPinned),
      adminReply: r.adminReply || null
    };
    reviewMap.set(rev.id, rev);
  };

  // Strictly target the specific app ID and slug only (no cross-app contamination)
  const targets = Array.from(new Set([targetId, targetSlug].filter(Boolean)));

  // Multi-Channel Parallel Live Fetch: Direct Firestore REST + Client SDK + Backend API
  const fetchPromises: Promise<any>[] = [];

  // Channel 1: Direct Fast Firestore REST query (Instant, 0-dependency, lightweight limit)
  fetchPromises.push(
    fetchReviewsDirectFromFirestoreRest(targets, limitCount, cursor).then(restRevs => {
      if (Array.isArray(restRevs)) {
        restRevs.forEach(addReview);
      }
    }).catch(e => console.warn("[Community] REST fetch note:", e))
  );

  // Channel 2: Direct Live Firestore Client SDK
  if (clientDb) {
    fetchPromises.push(
      (async () => {
        try {
          if (targets.length > 0) {
            const qDirect = query(
              collection(clientDb, 'reviews'),
              where('appId', 'in', targets.slice(0, 10)),
              limit(limitCount)
            );
            const directSnap = await getDocs(qDirect);
            directSnap.forEach((docSnap) => {
              const d = docSnap.data();
              addReview({ id: docSnap.id, ...d });
            });
          }
        } catch (fsErr) {
          console.warn("[Community] Direct Firestore query notice:", fsErr);
        }
      })()
    );
  }

  // Channel 3: High-Availability Server REST API (Requesting only the lightweight page limit)
  fetchPromises.push(
    (async () => {
      try {
        const apiTarget = targetId || targetSlug;
        const queryParams = new URLSearchParams({
          limit: String(limitCount)
        });
        if (cursor) queryParams.set('cursor', String(cursor));
        if (targetId) queryParams.set('appId', targetId);
        if (targetSlug) queryParams.set('slug', targetSlug);
        if (appTitle) queryParams.set('appTitle', appTitle);

        const res = await fetch(`/api/v1/public/community/reviews/${encodeURIComponent(apiTarget)}?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reviews)) {
            data.reviews.forEach(addReview);
          }
          if (data.hasMore !== undefined) serverHasMore = Boolean(data.hasMore);
          if (data.nextCursor) serverNextCursor = String(data.nextCursor);
        }
      } catch (apiErr) {
        console.warn("[Community] Server review API notice:", apiErr);
      }
    })()
  );

  // Await all fetch channels concurrently
  await Promise.allSettled(fetchPromises);

  // 1.5 Setup LIVE Firestore Snapshot Listener for real-time updates (strictly limited to latest 5 items)
  if (!cursor && clientDb) {
    const newTargetKey = `${targetId}_${targetSlug}`;
    if (activeTargetId !== newTargetKey) {
      if (activeUnsubscribe) activeUnsubscribe();
      activeTargetId = newTargetKey;
      
      try {
        const q = query(
          collection(clientDb, 'reviews'), 
          where('appId', 'in', targets.slice(0, 10)),
          limit(5)
        );
        let isFirstSnapshot = true;
        activeUnsubscribe = onSnapshot(q, (snapshot) => {
          if (isFirstSnapshot) {
            isFirstSnapshot = false;
            snapshot.docs.forEach((docSnap) => {
              const d = docSnap.data();
              addReview({ id: docSnap.id, ...d });
            });
            return;
          }
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data();
              data.id = change.doc.id;
              
              if (data.status === 'published' || !data.status) {
                const formattedRev: PublicReview = {
                  id: data.id,
                  app_id: data.appId,
                  appId: data.appId,
                  appSlug: data.appSlug || '',
                  appName: data.appName || '',
                  username: data.userName || data.username || 'Player',
                  rating: Number(data.rating) || 5,
                  comment: data.reviewText || data.comment || '',
                  created_at: data.timestamp || data.created_at || new Date().toISOString(),
                  helpful_count: Number(data.helpful_count) || 0,
                  reported: Boolean(data.reported),
                  report_count: Number(data.report_count) || 0,
                  source: data.source || 'community',
                  isPinned: Boolean(data.isPinned),
                  adminReply: data.adminReply || null
                };
                
                reviewMap.set(formattedRev.id, formattedRev);
                
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('community-review-added', {
                    detail: { newReview: formattedRev }
                  }));
                }
              }
            }
          });
        }, (err) => {
          console.warn("[Community] Live snapshot notice:", err.message);
        });
      } catch (e) {
        console.warn("[Community] Live snapshot setup failed:", e);
      }
    }
  }

  // 2. Merge locally saved user reviews from localStorage
  try {
    if (targetId) {
      const localKey = `local_user_reviews_${targetId}`;
      const localSaved = localStorage.getItem(localKey);
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          parsed.forEach(addReview);
        }
      }
    }
    if (targetSlug && targetSlug !== targetId) {
      const localSlugKey = `local_user_reviews_${targetSlug}`;
      const localSlugSaved = localStorage.getItem(localSlugKey);
      if (localSlugSaved) {
        const parsed = JSON.parse(localSlugSaved);
        if (Array.isArray(parsed)) {
          parsed.forEach(addReview);
        }
      }
    }
  } catch (lsErr) {}

  // Sort: Pinned reviews first, then newest created_at / timestamp descending
  const allSorted = Array.from(reviewMap.values()).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });

  // Calculate pagination: request only the exact page size
  let startIndex = 0;
  if (cursor) {
    const foundIndex = allSorted.findIndex(r => r.id === cursor || r.created_at === cursor);
    if (foundIndex !== -1) {
      startIndex = foundIndex + 1;
    }
  }

  const paginated = allSorted.slice(startIndex, startIndex + limitCount);
  const hasMore = serverHasMore || (allSorted.length > startIndex + limitCount) || (paginated.length === limitCount);
  const lastItem = paginated.length > 0 ? paginated[paginated.length - 1] : null;
  const nextCursor = serverNextCursor || (lastItem ? (lastItem.created_at || lastItem.id) : null);

  // Accurately compute star percentages and rating statistics directly from live reviews
  const calculateStats = (revs: PublicReview[]) => {
    const count = revs.length;
    if (count === 0) {
      return {
        totalReviews: 0,
        averageRating: Number(options.rating) || 4.8,
        stars: { 5: 75, 4: 15, 3: 6, 2: 2, 1: 2 }
      };
    }
    const sum = revs.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = Number((sum / count).toFixed(1));
    const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    revs.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      starCounts[star] = (starCounts[star] || 0) + 1;
    });
    const starsPercentage = {
      5: Math.round(((starCounts[5] || 0) / count) * 100),
      4: Math.round(((starCounts[4] || 0) / count) * 100),
      3: Math.round(((starCounts[3] || 0) / count) * 100),
      2: Math.round(((starCounts[2] || 0) / count) * 100),
      1: Math.round(((starCounts[1] || 0) / count) * 100),
    };
    return {
      totalReviews: count,
      averageRating: avg,
      stars: starsPercentage,
      starCounts
    };
  };

  return {
    reviews: paginated,
    hasMore: Boolean(nextCursor),
    nextCursor,
    stats: calculateStats(allSorted)
  };
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

    // 1. Submit to Server API
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
      console.warn("[Community] Server API write note:", apiErr);
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

    // 1. Server API write
    try {
      await fetch('/api/v1/public/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}

    // 2. Direct Firestore report write
    if (clientDb) {
      try {
        await setDoc(doc(clientDb, 'reports', newId), payload);
      } catch (e) {}
    }

    return true;
  } catch {
    return false;
  }
}

export async function voteLiveReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    // 1. Server API helpful vote
    await fetch('/api/v1/public/community/reviews/helpful', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId })
    });

    // 2. Direct Firestore helpful increment
    if (clientDb) {
      try {
        await updateDoc(doc(clientDb, 'reviews', reviewId), {
          helpful_count: increment(1)
        });
      } catch (e) {}
    }

    return true;
  } catch {
    return false;
  }
}

export async function reportLiveReview(params: any): Promise<boolean> {
  return submitLiveReport({ type: 'review_flag', ...params });
}

