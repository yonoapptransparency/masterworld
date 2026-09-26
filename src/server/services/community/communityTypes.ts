import { ExactCommunityAggregationResult } from '../../communityFirebaseAdmin';

export interface ReviewRecord {
  id: string;
  appId: string;
  appSlug?: string;
  appName?: string;
  appIcon?: string;
  appCategory?: string;
  userName: string;
  rating: number;
  reviewText: string;
  timestamp: string;
  status: 'published' | 'pending' | 'rejected' | string;
  helpful_count: number;
  isPinned: boolean;
  reported: boolean;
  report_count: number;
  source: 'community' | 'google' | 'admin_created' | 'ai_generated' | string;
  adminReply?: {
    text: string;
    author: string;
    timestamp: string;
  } | null;
  updated_at?: string;
}

export interface AppReviewChunkDocument {
  appId: string;
  appSlug?: string;
  appName?: string;
  chunkIndex: number;
  totalChunks: number;
  totalReviewsInChunk: number;
  totalAppReviews: number;
  stats: {
    averageRating: number;
    totalReviews: number;
    starCounts: Record<string, number>;
    distribution: Record<number, number>;
  };
  reviews: ReviewRecord[];
  updated_at: string;
}

export interface ReportRecord {
  id: string;
  type: 'app_flag' | 'review_flag' | string;
  appId: string;
  appName?: string;
  reviewId?: string;
  reviewAuthor?: string;
  reviewComment?: string;
  reason: string;
  description: string;
  reporterEmail?: string;
  reporterName?: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed' | string;
  created_at: string;
  ip?: string;
  userAgent?: string;
  adminNotes?: string;
  updated_at?: string;
}

export interface CanonicalAppResolution {
  canonicalId: string;
  canonicalSlug: string;
  canonicalName: string;
  packageName: string;
  matchedApp: any | null;
  aliasKeys: Set<string>;
}

export interface AppStatsCacheItem {
  publishedReviewCount: number;
  publishedRatingSum: number;
  starDistribution: Record<string, number>;
}

export interface GlobalCommunityStats {
  total: number;
  published: number;
  pending: number;
  rejected: number;
  flagged: number;
  averageRating: number;
}
