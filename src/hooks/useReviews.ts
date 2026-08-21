import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Review } from '../components/public/ReviewItem';

export function useReviews(appId: string, appTitle: string, inView: boolean = true) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'critical'>('all');
  
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  const fetchReviews = useCallback(async (isLoadMore = false) => {
    if (!appId) return;
    
    // Bots and crawlers skip loading dynamic reviews to keep DOM light for SEO.
    const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider/i.test(navigator.userAgent || '');
    if (isCrawler) {
       setLoading(false);
       setHasMore(false);
       return;
    }

    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const queryParams = new URLSearchParams();
      if (isLoadMore && nextCursor) {
        queryParams.append('cursor', nextCursor);
      }
      if (appTitle) {
        queryParams.append('appTitle', appTitle);
      }

      const queryString = queryParams.toString();
      const endpoint = `/api/v1/public/community/reviews/${encodeURIComponent(appId)}${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        
        let remoteReviews = (data.reviews || []).map((r: any) => ({
          id: r.id,
          app_id: r.app_id || r.appId || appId,
          username: r.username || r.userName || 'Player',
          rating: Number(r.rating) || 5,
          comment: r.comment || r.reviewText || '',
          created_at: r.created_at || r.timestamp || new Date().toISOString(),
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
            const newUnique = remoteReviews.filter((r: any) => !existingIds.has(r.id));
            return [...prev, ...newUnique];
          } else {
            // For initial load, we also merge local optimistic reviews
            let localReviews: Review[] = [];
            try {
              const stored = localStorage.getItem(`local_user_reviews_${appId}`);
              if (stored) {
                localReviews = JSON.parse(stored);
              }
            } catch (err) {}
            
            const dbIds = new Set(remoteReviews.map((r: any) => r.id));
            const filteredLocal = localReviews.filter(r => !dbIds.has(r.id));
            return [...remoteReviews, ...filteredLocal];
          }
        });

        setHasMore(data.hasMore || false);
        setNextCursor(data.nextCursor || null);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
      setInitialLoadDone(true);
    }
  }, [appId, appTitle, nextCursor]);

  // Initial load trigger on mount or appId change
  useEffect(() => {
    setInitialLoadDone(false);
    fetchReviews(false);
  }, [appId, fetchReviews]);

  // Listen to community-review-added event across tabs/components
  useEffect(() => {
    const handleNewReview = (e: any) => {
      const newRev = e?.detail?.newReview;
      if (newRev && (newRev.app_id === appId || newRev.appId === appId)) {
        setReviews(prev => {
          if (prev.some(r => r.id === newRev.id)) return prev;
          return [newRev, ...prev];
        });
      }
    };

    window.addEventListener('community-review-added', handleNewReview);
    return () => window.removeEventListener('community-review-added', handleNewReview);
  }, [appId]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchReviews(true);
    }
  }, [loadingMore, hasMore, fetchReviews]);

  const toggleExpandReview = useCallback((id: string) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleHelpfulVote = useCallback((id: string) => {
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
    fetch('/api/v1/public/community/reviews/helpful', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: id })
    }).catch(() => {});
  }, [votedReviews]);

  const handleReportReview = useCallback((id: string) => {
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
    fetch('/api/v1/public/community/reviews/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewId: id,
        appId: appId,
        reason: 'User Flagged Review',
        details: targetRev?.comment || ''
      })
    }).catch(() => {});
  }, [reportedReviews, reviews, appId]);

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'helpful') {
      return list.sort((a, b) => {
        if (b.helpful_count !== a.helpful_count) {
          return b.helpful_count - a.helpful_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
