const STATIC_COMMUNITY_REVIEWS: any[] = [];

export interface ReviewRecord {
  id: string;
  appId: string;
  appSlug?: string;
  appName?: string;
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

export interface AppReviewStats {
  averageRating: number;
  totalReviews: number;
  starCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewsResponse {
  reviews: ReviewRecord[];
  totalCount: number;
  nextCursor?: string;
  stats: AppReviewStats;
}

export interface CommunityStoreInterface {
  getReviewsForApp(
    appIdentifier: string,
    cursor?: string,
    limit?: number,
    appName?: string,
    benchmarkRating?: number,
    appSlug?: string
  ): ReviewsResponse;
  getAppStats(appIdentifier: string, fallbackRating?: number): AppReviewStats;
  getReviewById?(id: string): ReviewRecord | null;
}

class FallbackCommunityStore implements CommunityStoreInterface {
  private dynamicProvider: CommunityStoreInterface | null = null;

  public setDynamicProvider(provider: CommunityStoreInterface) {
    this.dynamicProvider = provider;
  }

  public getAppStats(appIdentifier: string, fallbackRating: number = 4.5): AppReviewStats {
    if (this.dynamicProvider) {
      return this.dynamicProvider.getAppStats(appIdentifier, fallbackRating);
    }

    const cleanId = (appIdentifier || '').toLowerCase().trim();
    const appReviews = STATIC_COMMUNITY_REVIEWS.filter(r => {
      const matchId = (r.appId || '').toLowerCase().trim() === cleanId;
      const matchSlug = (r.appSlug || '').toLowerCase().trim() === cleanId;
      return (matchId || matchSlug) && (r.status === 'published' || !r.status);
    });

    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (appReviews.length === 0) {
      const avg = Math.min(5, Math.max(1, fallbackRating || 4.5));
      return {
        averageRating: parseFloat(avg.toFixed(1)),
        totalReviews: 0,
        starCounts: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 6 }
      };
    }

    let sum = 0;
    appReviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      starCounts[star] = (starCounts[star] || 0) + 1;
      sum += (r.rating || 5);
    });

    const averageRating = parseFloat((sum / appReviews.length).toFixed(1));
    return {
      averageRating,
      totalReviews: appReviews.length,
      starCounts
    };
  }

  public getReviewsForApp(
    appIdentifier: string,
    cursor?: string,
    limit: number = 6,
    appName?: string,
    benchmarkRating: number = 4.5,
    appSlug?: string
  ): ReviewsResponse {
    if (this.dynamicProvider) {
      return this.dynamicProvider.getReviewsForApp(appIdentifier, cursor, limit, appName, benchmarkRating, appSlug);
    }

    const cleanId = (appIdentifier || '').toLowerCase().trim();
    const cleanSlug = (appSlug || '').toLowerCase().trim();

    const matched = STATIC_COMMUNITY_REVIEWS.filter(r => {
      const rId = (r.appId || '').toLowerCase().trim();
      const rSlug = (r.appSlug || '').toLowerCase().trim();
      const matchesTarget = (rId && (rId === cleanId || rId === cleanSlug)) ||
                            (rSlug && (rSlug === cleanId || rSlug === cleanSlug));
      const isPub = (r.status === 'published' || !r.status);
      return matchesTarget && isPub;
    }).map((r): ReviewRecord => ({
      id: r.id,
      appId: r.appId,
      appSlug: r.appSlug || appSlug || '',
      appName: r.appName || appName || 'App',
      userName: r.userName || 'Verified Player',
      rating: Number(r.rating) || 5,
      reviewText: r.reviewText || '',
      timestamp: r.timestamp || new Date().toISOString(),
      status: 'published',
      helpful_count: Number(r.helpful_count) || 0,
      isPinned: Boolean(r.isPinned),
      reported: Boolean(r.reported),
      report_count: Number(r.report_count) || 0,
      source: (r.source as any) || 'admin_created',
      adminReply: r.adminReply || null,
      updated_at: r.updated_at || r.timestamp
    }));

    // Sort: Pinned first, then helpful, then timestamp
    matched.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (b.helpful_count !== a.helpful_count) return b.helpful_count - a.helpful_count;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    let startIndex = 0;
    if (cursor) {
      const idx = matched.findIndex(r => r.id === cursor);
      if (idx !== -1) startIndex = idx + 1;
    }

    const paged = matched.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < matched.length ? paged[paged.length - 1]?.id : undefined;

    return {
      reviews: paged,
      totalCount: matched.length,
      nextCursor,
      stats: this.getAppStats(appIdentifier, benchmarkRating)
    };
  }

  public getReviewById(id: string): ReviewRecord | null {
    if (this.dynamicProvider && this.dynamicProvider.getReviewById) {
      return this.dynamicProvider.getReviewById(id);
    }
    const found = STATIC_COMMUNITY_REVIEWS.find(r => r.id === id);
    if (!found) return null;
    return {
      id: found.id,
      appId: found.appId,
      appSlug: found.appSlug,
      appName: found.appName,
      userName: found.userName,
      rating: found.rating,
      reviewText: found.reviewText,
      timestamp: found.timestamp,
      status: found.status,
      helpful_count: found.helpful_count,
      isPinned: Boolean(found.isPinned),
      reported: Boolean(found.reported),
      report_count: Number(found.report_count) || 0,
      source: (found.source as any) || 'admin_created',
      adminReply: found.adminReply || null,
      updated_at: found.updated_at
    };
  }
}

export const communityStore = new FallbackCommunityStore();
