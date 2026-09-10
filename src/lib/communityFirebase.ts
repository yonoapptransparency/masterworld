/**
 * Client-Side Community Firebase Review Engine
 * Connected LIVE directly to Firestore (Client SDK).
 */
import { initializeApp, getApps } from 'firebase/app';
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
  increment
} from 'firebase/firestore';
import { STATIC_COMMUNITY_REVIEWS } from './communityReviewsData';

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

// LIVE Community Database Configuration
const communityConfig = {
  projectId: "gen-lang-client-0825832493",
  apiKey: "AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok"
};
const FIRESTORE_DB_ID = "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";

const app = getApps().find(a => a.name === 'communityLive') || initializeApp(communityConfig, 'communityLive');
export const communityDb = getFirestore(app, FIRESTORE_DB_ID);

export async function fetchLiveReviews(options: {
  appId: string;
  appSlug?: string;
  appTitle?: string;
  cursor?: any;
  limit?: number;
  rating?: number;
}): Promise<ReviewFetchResult> {
  const { appId, appSlug, appTitle, cursor, limit: limitCount = 10 } = options;
  const targetId = (appId || '').trim();
  const targetSlug = (appSlug || '').trim();
  
  if (!targetId && !targetSlug) return { reviews: [], hasMore: false, nextCursor: null };

  const reviewMap = new Map<string, PublicReview>();

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

  // 1. Try Live Firestore Direct Client SDK Query (NO composite index needed)
  try {
    const reviewsRef = collection(communityDb, 'reviews');
    
    // Query by appId
    if (targetId) {
      const q1 = query(reviewsRef, where('appId', '==', targetId), limit(50));
      const snap1 = await getDocs(q1);
      snap1.docs.forEach(d => addReview({ id: d.id, ...d.data() }));

      // Also check app_id field
      const q2 = query(reviewsRef, where('app_id', '==', targetId), limit(50));
      const snap2 = await getDocs(q2);
      snap2.docs.forEach(d => addReview({ id: d.id, ...d.data() }));
    }

    // Query by appSlug
    if (targetSlug) {
      const q3 = query(reviewsRef, where('appSlug', '==', targetSlug), limit(50));
      const snap3 = await getDocs(q3);
      snap3.docs.forEach(d => addReview({ id: d.id, ...d.data() }));
    }
  } catch (fsErr) {
    console.warn("[Community] Live Firestore query notice:", fsErr);
  }

  // 2. Fetch from Backend REST API for server-synced reviews
  try {
    const apiTarget = targetId || targetSlug;
    const res = await fetch(`/api/v1/public/community/reviews/${encodeURIComponent(apiTarget)}?limit=50`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.reviews)) {
        data.reviews.forEach(addReview);
      }
    }
  } catch (apiErr) {}

  // 3. Merge locally saved user reviews from localStorage
  try {
    const localKey = `local_user_reviews_${targetId}`;
    const localSaved = localStorage.getItem(localKey);
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed)) {
        parsed.forEach(addReview);
      }
    }
    if (targetSlug) {
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

  // 4. Merge verified static baseline reviews for this app
  try {
    if (Array.isArray(STATIC_COMMUNITY_REVIEWS)) {
      const staticMatches = STATIC_COMMUNITY_REVIEWS.filter(r => 
        (targetId && (r.appId === targetId || (r as any).app_id === targetId)) ||
        (targetSlug && r.appSlug === targetSlug)
      );
      staticMatches.forEach(addReview);
    }
  } catch (statErr) {}

  // Sort: Pinned reviews first, then newest created_at / timestamp descending
  const allSorted = Array.from(reviewMap.values()).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });

  // Calculate pagination
  let startIndex = 0;
  if (cursor) {
    const foundIndex = allSorted.findIndex(r => r.id === cursor || r.created_at === cursor);
    if (foundIndex !== -1) {
      startIndex = foundIndex + 1;
    }
  }

  const paginated = allSorted.slice(startIndex, startIndex + limitCount);
  const nextItem = allSorted[startIndex + limitCount];
  const nextCursor = nextItem ? nextItem.id : null;

  return {
    reviews: paginated,
    hasMore: Boolean(nextCursor),
    nextCursor
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

    // 1. Direct write to Firestore Client SDK
    try {
      const docRef = doc(communityDb, 'reviews', newId);
      await setDoc(docRef, reviewPayload);
    } catch (fsErr) {
      console.warn("[Community] Direct Firestore write note:", fsErr);
    }

    // 2. Dual-write to Server API (persists via Admin SDK)
    try {
      await fetch('/api/v1/public/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewPayload,
          turnstileToken: data.turnstileToken
        })
      });
    } catch (apiErr) {
      console.warn("[Community] Server API dual-write note:", apiErr);
    }

    // 3. Save to localStorage for instant client-side persistence
    try {
      const localKey = `local_user_reviews_${data.appId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      existing.unshift(formattedReview);
      localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 50)));
    } catch (lsErr) {}

    // 4. Dispatch global window event so all UI components update live
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
    console.error("Live Firebase submit error:", err);
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

    // 1. Direct Firestore write
    try {
      await setDoc(doc(communityDb, 'reports', newId), payload);
    } catch (e) {}

    // 2. Server API write
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
    // 1. Direct Firestore update
    try {
      const ref = doc(communityDb, 'reviews', reviewId);
      await updateDoc(ref, {
        helpful_count: increment(1)
      });
    } catch (e) {}

    // 2. Server API helpful vote
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

