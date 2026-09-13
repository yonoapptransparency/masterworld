/**
 * Dedicated Admin Community Firebase Client Module
 * Exclusively manages community reviews, ratings, reports, and moderation for the Admin Control Panel.
 * Completely isolated from the Master Catalog Firebase to prevent project collision.
 */

import { adminFetch } from '../services/adminAuthService';

export interface AdminReviewItem {
  id: string;
  appId: string;
  app_id?: string;
  appSlug?: string;
  appName?: string;
  userName: string;
  username?: string;
  rating: number;
  reviewText: string;
  comment?: string;
  timestamp: string;
  created_at?: string;
  status: 'published' | 'pending' | 'rejected' | string;
  helpful_count?: number;
  isPinned?: boolean;
  reported?: boolean;
  report_count?: number;
  source?: string;
  adminReply?: {
    text: string;
    author: string;
    timestamp: string;
  } | null;
  updated_at?: string;
}

export interface AdminCommunityStats {
  totalReviews: number;
  publishedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
  flaggedReviews: number;
  totalReports: number;
  pendingReports: number;
  averageRating: number;
  liveStatus: 'live' | 'checking' | 'error';
  statusMessage: string;
  projectId: string;
}

/**
 * Fetch high-level community platform metrics for the Admin Overview Dashboard
 */
export async function fetchAdminCommunityOverviewStats(): Promise<AdminCommunityStats> {
  try {
    const res = await adminFetch('/api/v1/admin/community/health/ping');
    if (res.ok) {
      const data = await res.json();
      return {
        totalReviews: data.reviewsCount || 0,
        publishedReviews: data.publishedCount || Math.max(0, (data.reviewsCount || 0) - (data.pendingCount || 0)),
        pendingReviews: data.pendingCount || 0,
        rejectedReviews: data.rejectedCount || 0,
        flaggedReviews: data.flaggedCount || data.reportsCount || 0,
        totalReports: data.reportsCount || 0,
        pendingReports: data.pendingReportsCount || data.reportsCount || 0,
        averageRating: data.averageRating || 4.8,
        liveStatus: data.firestoreRead ? 'live' : (data.inMemoryReady ? 'live' : 'error'),
        statusMessage: data.details?.readMode || `${data.details?.project || 'rummydexcommunity'} Connected`,
        projectId: data.details?.project || 'rummydexcommunity'
      };
    }
  } catch (err) {
    console.warn('[AdminCommunity] Failed to ping community health:', err);
  }

  return {
    totalReviews: 0,
    publishedReviews: 0,
    pendingReviews: 0,
    rejectedReviews: 0,
    flaggedReviews: 0,
    totalReports: 0,
    pendingReports: 0,
    averageRating: 5.0,
    liveStatus: 'error',
    statusMessage: 'Unable to reach community backend service',
    projectId: 'rummydexcommunity'
  };
}

export interface AppReviewCountsData {
  total: number;
  published: number;
  pending: number;
  rejected: number;
  flagged: number;
  avgRating: number;
}

export interface AdminReviewsListResponse {
  reviews: AdminReviewItem[];
  totalCount: number;
  stats?: {
    total: number;
    published: number;
    pending: number;
    rejected: number;
    flagged: number;
    averageRating: number;
  };
  globalStats?: {
    total: number;
    published: number;
    pending: number;
    rejected: number;
    flagged: number;
    averageRating: number;
  };
  appCounts?: Record<string, AppReviewCountsData>;
}

/**
 * Query live admin reviews with fine-grained filters, per-app scoping, and search
 */
export async function fetchAdminReviewsList(params: {
  appId?: string;
  status?: string;
  rating?: string | number;
  search?: string;
  sortBy?: string;
  isPinned?: boolean | string;
  limit?: number;
  page?: number;
  refresh?: boolean;
}): Promise<AdminReviewsListResponse & { page?: number; totalPages?: number; total?: number }> {
  const query = new URLSearchParams();
  if (params.appId && params.appId !== 'all') query.set('appId', params.appId);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.rating && params.rating !== 'all') query.set('rating', String(params.rating));
  if (params.search && params.search.trim()) query.set('search', params.search.trim());
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.isPinned !== undefined) query.set('isPinned', String(params.isPinned));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.page) query.set('page', String(params.page));
  if (params.refresh) query.set('refresh', 'true');

  const res = await adminFetch(`/api/v1/admin/community/reviews?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load admin reviews: HTTP ${res.status}`);
  }

  const data = await res.json();
  return {
    reviews: data.reviews || [],
    totalCount: data.total || data.totalCount || (data.reviews ? data.reviews.length : 0),
    total: data.total || data.totalCount || 0,
    page: data.page || 1,
    totalPages: data.totalPages || 1,
    stats: data.stats,
    globalStats: data.globalStats,
    appCounts: data.appCounts
  };
}

/**
 * Fast aggregate counts lookup for all apps in catalog (<1ms)
 */
export async function fetchAdminAppReviewCounts(): Promise<{
  globalStats: {
    total: number;
    published: number;
    pending: number;
    rejected: number;
    flagged: number;
    averageRating: number;
  };
  appCounts: Record<string, AppReviewCountsData>;
}> {
  const res = await adminFetch('/api/v1/admin/community/app-counts');
  if (!res.ok) {
    throw new Error(`Failed to load app review counts: HTTP ${res.status}`);
  }
  const data = await res.json();
  return {
    globalStats: data.globalStats,
    appCounts: data.appCounts || {}
  };
}

/**
 * Update an existing review in Firestore
 */
export async function updateAdminReviewItem(
  reviewId: string, 
  updates: Partial<AdminReviewItem>
): Promise<AdminReviewItem> {
  const res = await adminFetch(`/api/v1/admin/community/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to update review: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.review;
}

/**
 * Quickly toggle review moderation status (published, pending, rejected)
 */
export async function setAdminReviewStatus(
  reviewId: string, 
  status: 'published' | 'pending' | 'rejected'
): Promise<boolean> {
  const res = await adminFetch(`/api/v1/admin/community/reviews/${encodeURIComponent(reviewId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  return res.ok;
}

/**
 * Toggle pinned status for a review
 */
export async function toggleAdminReviewPin(
  reviewId: string, 
  isPinned: boolean
): Promise<boolean> {
  const res = await adminFetch(`/api/v1/admin/community/reviews/${encodeURIComponent(reviewId)}/pin`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPinned })
  });

  return res.ok;
}

/**
 * Delete a review permanently from live Firestore and app bucket documents
 */
export async function deleteAdminReviewItem(reviewId: string): Promise<boolean> {
  const res = await adminFetch(`/api/v1/admin/community/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE'
  });

  return res.ok;
}

/**
 * Perform bulk moderation actions across multiple reviews
 */
export async function performBulkReviewsAction(
  action: 'publish' | 'pending' | 'reject' | 'delete' | 'pin' | 'unpin', 
  reviewIds: string[]
): Promise<{ success: boolean; count: number }> {
  const res = await adminFetch('/api/v1/admin/community/reviews/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, reviewIds })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Bulk review action failed');
  }

  const data = await res.json();
  return { success: true, count: data.count || reviewIds.length };
}

/**
 * Add an official verified developer/support reply to a review
 */
export async function submitAdminReplyToReview(
  reviewId: string, 
  replyText: string, 
  author = 'RummyDex Official Support'
): Promise<boolean> {
  const res = await adminFetch(`/api/v1/admin/community/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminReply: {
        text: replyText.trim(),
        author: author.trim(),
        timestamp: new Date().toISOString()
      }
    })
  });

  return res.ok;
}

/**
 * Query user reports from the moderation queue
 */
export async function fetchAdminReportsList(params: {
  status?: string;
  type?: string;
  appId?: string;
  search?: string;
  limit?: number;
}): Promise<{ reports: any[]; totalCount: number }> {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.type && params.type !== 'all') query.set('type', params.type);
  if (params.appId && params.appId !== 'all') query.set('appId', params.appId);
  if (params.search && params.search.trim()) query.set('search', params.search.trim());
  if (params.limit) query.set('limit', String(params.limit));

  const res = await adminFetch(`/api/v1/admin/reports?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load admin reports: HTTP ${res.status}`);
  }

  const data = await res.json();
  return {
    reports: data.reports || [],
    totalCount: data.totalCount || (data.reports ? data.reports.length : 0)
  };
}

/**
 * Update report status or notes
 */
export async function updateAdminReportItem(
  reportId: string, 
  updates: { status?: string; adminNotes?: string }
): Promise<boolean> {
  const res = await adminFetch(`/api/v1/admin/reports/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.ok;
}

/**
 * Permanently delete a report
 */
export async function deleteAdminReportItem(reportId: string): Promise<boolean> {
  const res = await adminFetch(`/api/v1/admin/reports/${encodeURIComponent(reportId)}`, {
    method: 'DELETE'
  });
  return res.ok;
}
