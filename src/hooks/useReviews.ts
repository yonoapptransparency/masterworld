import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Review } from '../components/public/ReviewItem';
import { 
  fetchLiveReviews, 
  voteLiveReviewHelpful, 
  reportLiveReview, 
  getCachedLiveReviews,
  PublicReview, 
} from '../lib/communityFirebase';

const PAGE_SIZE = 5;

// Pure deduplication helper guaranteeing unique items by ID
function deduplicateReviewsList(list: Review[]): Review[] {
  const map = new Map<string, Review>();
  for (const item of list) {
    if (item && item.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export function useReviews(
  appId: string, 
  appTitle?: string, 
  appSlug?: string,
  category?: string,
  overallRating: number = 4.8,
  inView: boolean = true
) {
  const cleanAppId = String(appId || '').trim();
  const cleanAppSlug = String(appSlug || '').trim();
  const cleanAppTitle = String(appTitle || '').trim();

  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'critical'>('all');

  // Instant SWR Cache Initialization (0ms latency render for first 5 items)
  const initialCached = useMemo(() => {
    return getCachedLiveReviews(cleanAppId, cleanAppSlug);
  }, [cleanAppId, cleanAppSlug]);

  const [reviews, setReviews] = useState<Review[]>(() => {
    if (initialCached && initialCached.reviews.length > 0) {
      const mapped = initialCached.reviews.slice(0, PAGE_SIZE).map((r: PublicReview) => ({
        id: r.id,
        app_id: r.app_id || r.appId || cleanAppId,
        username: r.username || 'Player',
        rating: Number(r.rating) || 5,
        comment: r.comment || '',
        created_at: r.created_at || new Date().toISOString(),
        helpful_count: Number(r.helpful_count) || 0,
        reported: Boolean(r.reported),
        report_count: Number(r.report_count) || 0,
        source: r.source || 'community',
        isPinned: Boolean(r.isPinned),
        adminReply: r.adminReply || null
      }));
      return deduplicateReviewsList(mapped);
    }
    return [];
  });

  const [stats, setStats] = useState<any>(() => initialCached?.stats || null);
  const [loading, setLoading] = useState<boolean>(() => !initialCached || initialCached.reviews.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(() => Boolean(initialCached?.hasMore));
  const [nextCursor, setNextCursor] = useState<string | null>(() => initialCached?.nextCursor || null);
  const nextCursorRef = useRef<string | null>(initialCached?.nextCursor || null);

  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('voted_reviews_map') || '{}');
      } catch (e) {}
    }
    return {};
  });

  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('reported_reviews_map') || '{}');
      } catch (e) {}
    }
    return {};
  });

  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  // Dynamic Live Review Fetcher - Loads exactly 5 comments per batch
  const fetchReviews = useCallback(async (isLoadMore = false, overrideFilter?: string, overrideSort?: string) => {
    const targetKey = cleanAppId || cleanAppSlug;
    if (!targetKey) return;
    
    // Bots and crawlers skip loading dynamic reviews to keep DOM light for SEO
    const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider/i.test(navigator.userAgent || '');
    if (isCrawler) {
       setLoading(false);
       setHasMore(false);
       return;
    }

    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const cursorToUse = isLoadMore ? nextCursorRef.current : null;
      const currentFilter = overrideFilter !== undefined ? overrideFilter : activeFilter;
      const currentSort = overrideSort !== undefined ? overrideSort : sortBy;
      
      const result = await fetchLiveReviews({
        appId: cleanAppId,
        appSlug: cleanAppSlug,
        appTitle: cleanAppTitle,
        cursor: cursorToUse,
        limit: PAGE_SIZE,
        rating: overallRating,
        filter: currentFilter,
        sortBy: currentSort
      });

      const mappedReviews: Review[] = result.reviews.map((r: PublicReview) => ({
        id: r.id,
        app_id: r.app_id || r.appId || cleanAppId,
        username: r.username || 'Player',
        rating: Number(r.rating) || 5,
        comment: r.comment || '',
        created_at: r.created_at || new Date().toISOString(),
        helpful_count: Number(r.helpful_count) || 0,
        reported: Boolean(r.reported),
        report_count: Number(r.report_count) || 0,
        source: r.source || 'community',
        isPinned: Boolean(r.isPinned),
        adminReply: r.adminReply || null
      }));

      if (result.stats) {
        setStats(result.stats);
      }

      setReviews(prev => {
        if (isLoadMore) {
          return deduplicateReviewsList([...prev, ...mappedReviews]);
        } else {
          return deduplicateReviewsList(mappedReviews);
        }
      });

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
      nextCursorRef.current = result.nextCursor;

    } catch (err) {
      console.error('[useReviews] Reviews fetch pipeline error:', err);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  }, [cleanAppId, cleanAppSlug, cleanAppTitle, overallRating, activeFilter, sortBy]);

  // Initial fetch when container enters view or target app changes
  const prevTargetKeyRef = useRef<string>('');
  useEffect(() => {
    const targetKey = cleanAppId || cleanAppSlug;
    if (!targetKey || !inView) return;

    if (prevTargetKeyRef.current !== targetKey) {
      prevTargetKeyRef.current = targetKey;
      setNextCursor(null);
      nextCursorRef.current = null;
      setExpandedReviews({});
      fetchReviews(false);
    }
  }, [cleanAppId, cleanAppSlug, inView, fetchReviews]);

  // Refetch 5 items when filter or sorting changes
  const isFirstFilterMount = useRef(true);
  useEffect(() => {
    if (isFirstFilterMount.current) {
      isFirstFilterMount.current = false;
      return;
    }
    if (!inView) return;
    setNextCursor(null);
    nextCursorRef.current = null;
    fetchReviews(false, activeFilter, sortBy);
  }, [activeFilter, sortBy, inView, fetchReviews]);

  // Listen to community review events across tabs/components
  useEffect(() => {
    const handleNewReview = (e: any) => {
      const newRev = e?.detail?.newReview;
      if (newRev) {
        const matchesId = newRev.app_id === cleanAppId || newRev.appId === cleanAppId;
        const matchesSlug = cleanAppSlug && (newRev.app_id === cleanAppSlug || newRev.appSlug === cleanAppSlug);
        if (matchesId || matchesSlug) {
          setReviews(prev => {
            if (prev.some(r => r.id === newRev.id)) return prev;
            return [newRev, ...prev];
          });
        }
      }
    };

    const handleDeletedReview = (e: any) => {
      const deletedId = e?.detail?.reviewId || e?.detail?.id;
      if (deletedId) {
        setReviews(prev => prev.filter(r => r.id !== deletedId));
      }
    };

    const handleClearedReviews = (e: any) => {
      const clearedAppId = e?.detail?.appId || e?.detail?.slug;
      if (!clearedAppId || clearedAppId === cleanAppId || clearedAppId === cleanAppSlug) {
        setReviews([]);
      }
    };

    const handleReviewsUpdated = () => {
      fetchReviews(false);
    };

    window.addEventListener('community-review-added', handleNewReview);
    window.addEventListener('community-review-deleted', handleDeletedReview);
    window.addEventListener('community-reviews-cleared', handleClearedReviews);
    window.addEventListener('community-reviews-updated', handleReviewsUpdated);

    return () => {
      window.removeEventListener('community-review-added', handleNewReview);
      window.removeEventListener('community-review-deleted', handleDeletedReview);
      window.removeEventListener('community-reviews-cleared', handleClearedReviews);
      window.removeEventListener('community-reviews-updated', handleReviewsUpdated);
    };
  }, [cleanAppId, cleanAppSlug, fetchReviews]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchReviews(true);
    }
  }, [loadingMore, hasMore, fetchReviews]);

  const toggleExpandReview = useCallback((id: string) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleHelpfulVote = useCallback(async (id: string) => {
    if (votedReviews[id]) return;
    setReviews(prev =>
      prev.map(r => {
        if (r.id === id) {
          return { ...r, helpful_count: r.helpful_count + 1 };
        }
        return r;
      })
    );
    setVotedReviews(prev => ({ ...prev, [id]: true }));
    await voteLiveReviewHelpful(id);
  }, [votedReviews]);

  const handleReportReview = useCallback(async (id: string) => {
    if (reportedReviews[id]) return;
    setReportedReviews(prev => ({ ...prev, [id]: true }));
    const targetRev = reviews.find(r => r.id === id);
    setReviews(prev =>
      prev.map(r => {
        if (r.id === id) {
          return { ...r, reported: true, report_count: (r.report_count || 0) + 1 };
        }
        return r;
      })
    );
    await reportLiveReview({
      reviewId: id,
      appId: cleanAppId || cleanAppSlug,
      reason: 'User Flagged Review',
      details: targetRev?.comment || ''
    });
  }, [reportedReviews, reviews, cleanAppId, cleanAppSlug]);

  return {
    reviews,
    setReviews,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    sortBy,
    setSortBy,
    activeFilter,
    setActiveFilter,
    votedReviews,
    reportedReviews,
    expandedReviews,
    toggleExpandReview,
    handleHelpfulVote,
    handleReportReview,
    filteredReviews: reviews, // Backend handles the filtering directly!
    stats
  };
}
