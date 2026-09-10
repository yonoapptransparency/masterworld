import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Review } from '../components/public/ReviewItem';
import { 
  fetchLiveReviews, 
  voteLiveReviewHelpful, 
  reportLiveReview, 
  PublicReview, 
} from '../lib/communityFirebase';

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

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'critical'>('all');
  
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  // App key tracker to prevent duplicate initial fetches while guaranteeing trigger on targetKey ready
  const fetchedTargetKeyRef = useRef<string | null>(null);

  // Dynamic Live Review Fetcher - Protected with session cache & on-demand trigger
  const fetchReviews = useCallback(async (isLoadMore = false) => {
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

      const cursorToUse = isLoadMore ? (nextCursorRef.current || nextCursor) : null;
      
      const result = await fetchLiveReviews({
        appId: cleanAppId,
        appSlug: cleanAppSlug,
        appTitle: cleanAppTitle,
        cursor: cursorToUse,
        limit: 5,
        rating: overallRating
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

      setReviews(prev => {
        if (isLoadMore) {
          const existingIds = new Set(prev.map(p => p.id));
          const newUnique = mappedReviews.filter(r => !existingIds.has(r.id));
          return [...prev, ...newUnique];
        } else {
          return mappedReviews;
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
      setInitialLoadDone(true);
    }
  }, [cleanAppId, cleanAppSlug, cleanAppTitle, overallRating]);

  // Trigger review fetch whenever targetKey is valid and has not been fetched yet
  useEffect(() => {
    const targetKey = cleanAppId || cleanAppSlug;
    if (!targetKey) return;
    if (!inView) return;

    if (fetchedTargetKeyRef.current !== targetKey) {
      setReviews([]);
      setNextCursor(null);
      nextCursorRef.current = null;
      setHasMore(false);
      setVotedReviews({});
      setReportedReviews({});
      setExpandedReviews({});
      setInitialLoadDone(false);
      fetchedTargetKeyRef.current = targetKey;
      fetchReviews(false);
    }
  }, [cleanAppId, cleanAppSlug, inView, fetchReviews]);

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

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'helpful') {
      return list.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        if (b.helpful_count !== a.helpful_count) {
          return b.helpful_count - a.helpful_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      return list.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
  }, [reviews, sortBy]);

  const filteredReviews = useMemo(() => {
    return sortedReviews.filter(rev => {
      if (activeFilter === 'positive') return rev.rating >= 4;
      if (activeFilter === 'critical') return rev.rating <= 3;
      return true;
    });
  }, [sortedReviews, activeFilter]);

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
    filteredReviews
  };
}
