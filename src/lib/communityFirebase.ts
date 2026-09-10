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
  orderBy, 
  doc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  startAfter,
  increment,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

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

// Hardcoded LIVE Community Database Credentials
const communityConfig = {
  projectId: "gen-lang-client-0825832493",
  apiKey: "AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok"
};
const FIRESTORE_DB_ID = "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";

const app = getApps().find(a => a.name === 'communityLive') || initializeApp(communityConfig, 'communityLive');
// Initialize with specific database ID
export const communityDb = getFirestore(app, FIRESTORE_DB_ID);

export async function fetchLiveReviews(options: {
  appId: string;
  appSlug?: string;
  appTitle?: string;
  cursor?: any;
  limit?: number;
  rating?: number;
}): Promise<ReviewFetchResult> {
  const { appId, appSlug, cursor, limit: limitCount = 5 } = options;
  const targetId = (appId || appSlug || '').trim();
  
  if (!targetId) return { reviews: [], hasMore: false, nextCursor: null };

  try {
    const reviewsRef = collection(communityDb, 'reviews');
    
    // Create base query checking BOTH appId and appSlug aliases
    let q = query(
      reviewsRef,
      where('appId', '==', targetId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    if (cursor) {
      q = query(q, startAfter(cursor));
    }

    const snap = await getDocs(q);
    
    // If empty by appId, try by appSlug
    let finalDocs = snap.docs;
    if (finalDocs.length === 0 && appSlug) {
      let slugQ = query(
        reviewsRef,
        where('appSlug', '==', appSlug),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      if (cursor) slugQ = query(slugQ, startAfter(cursor));
      const slugSnap = await getDocs(slugQ);
      finalDocs = slugSnap.docs;
    }

    const reviews: PublicReview[] = finalDocs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        app_id: d.appId || d.app_id || targetId,
        appId: d.appId || targetId,
        appSlug: d.appSlug || '',
        appName: d.appName || '',
        username: d.userName || d.username || 'Player',
        rating: Number(d.rating) || 5,
        comment: d.reviewText || d.comment || '',
        created_at: d.timestamp || d.created_at || new Date().toISOString(),
        helpful_count: Number(d.helpful_count) || 0,
        reported: Boolean(d.reported),
        report_count: Number(d.report_count) || 0,
        source: d.source || 'community',
        isPinned: Boolean(d.isPinned),
        adminReply: d.adminReply || null
      };
    });

    const nextCursor = finalDocs.length === limitCount ? finalDocs[finalDocs.length - 1].data().timestamp || finalDocs[finalDocs.length - 1].data().created_at : null;

    return {
      reviews,
      hasMore: !!nextCursor,
      nextCursor
    };
  } catch (err) {
    console.error("Live Firebase fetch error:", err);
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
    const newId = `rev_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    const docRef = doc(communityDb, 'reviews', newId);
    
    const now = new Date().toISOString();
    await setDoc(docRef, {
      id: newId,
      appId: data.appId,
      app_id: data.appId,
      appSlug: data.appSlug || '',
      appName: data.appName || '',
      userName: data.userName,
      username: data.userName,
      rating: data.rating,
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
    });

    return { 
      success: true, 
      review: {
        id: newId,
        app_id: data.appId,
        appId: data.appId,
        username: data.userName,
        rating: data.rating,
        comment: data.reviewText,
        created_at: now,
        helpful_count: 0,
        reported: false,
        report_count: 0,
        isPinned: false,
        source: 'community'
      } 
    };
  } catch (err: any) {
    console.error("Live Firebase submit error:", err);
    return { success: false, error: err.message };
  }
}

export async function submitLiveReport(data: any): Promise<boolean> {
  try {
    const newId = `rep_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    await setDoc(doc(communityDb, 'reports', newId), {
      id: newId,
      ...data,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
    return true;
  } catch {
    return false;
  }
}

export async function voteLiveReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    const ref = doc(communityDb, 'reviews', reviewId);
    await updateDoc(ref, {
      helpful_count: increment(1)
    });
    return true;
  } catch {
    return false;
  }
}

export async function reportLiveReview(params: any): Promise<boolean> {
  return submitLiveReport({ type: 'review_flag', ...params });
}
