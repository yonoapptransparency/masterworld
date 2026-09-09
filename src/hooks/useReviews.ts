import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Review } from '../components/public/ReviewItem';
import { STATIC_COMMUNITY_REVIEWS } from '../lib/communityReviewsData';

interface AppReviewSeedConfig {
  appId: string;
  appTitle?: string;
  appSlug?: string;
  category?: string;
  overallRating?: number;
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

  const getStaticFallbackReviews = useCallback((): Review[] => {
    const targetId = (cleanAppId || '').toLowerCase().trim();
    const targetSlug = (cleanAppSlug || '').toLowerCase().trim();
    const targetTitle = (cleanAppTitle || '').toLowerCase().trim();

    return STATIC_COMMUNITY_REVIEWS.filter(r => {
      if (r.status && r.status !== 'published' && r.status !== 'approved') return false;
      const rAppId = String(r.appId || '').toLowerCase().trim();
      const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
      const rAppName = String(r.appName || '').toLowerCase().trim();

      const matchesId = Boolean(targetId && rAppId && rAppId === targetId);
      const matchesSlug = Boolean(targetSlug && rAppSlug && rAppSlug === targetSlug);
      const matchesTitle = Boolean(targetTitle && rAppName && rAppName === targetTitle);

      return matchesId || matchesSlug || matchesTitle;
    }).map((r: any) => ({
      id: r.id || `rev_${Math.random()}`,
      app_id: r.appId || cleanAppId,
      username: r.userName || 'Verified Player',
      rating: Number(r.rating) || 5,
      comment: r.reviewText || '',
      created_at: r.timestamp || new Date().toISOString(),
      helpful_count: Number(r.helpful_count) || 0,
      reported: Boolean(r.reported),
      report_count: Number(r.report_count) || 0,
      source: r.source || 'community',
      isPinned: Boolean(r.isPinned),
      adminReply: r.adminReply || null
    }));
  }, [cleanAppId, cleanAppSlug, cleanAppTitle]);

  const [reviews, setReviews] = useState<Review[]>(() => getStaticFallbackReviews());
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

  // Multi-tier resilient review fetcher
  const fetchReviews = useCallback(async (isLoadMore = false) => {
    if (!cleanAppId && !cleanAppSlug) return;
    
    // Bots and crawlers skip loading dynamic reviews to keep DOM light for SEO
    const isCrawler = typeof navigator !== 'undefined' && /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|crawler|spider/i.test(navigator.userAgent || '');
    if (isCrawler) {
       setReviews(getStaticFallbackReviews());
       setLoading(false);
       setHasMore(false);
       return;
    }

    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      let fetchedReviews: Review[] = [];
      let serverHasMore = false;
      let serverNextCursor: string | null = null;
      let isServerResponseOk = false;

      // -------------------------------------------------------------
      // TIER 1: Try Local API Route (/api/v1/public/community/reviews)
      // -------------------------------------------------------------
      try {
        const queryParams = new URLSearchParams();
        const cursorToUse = isLoadMore ? (nextCursorRef.current || nextCursor) : null;
        if (cursorToUse) queryParams.append('cursor', cursorToUse);
        if (cleanAppTitle) queryParams.append('appTitle', cleanAppTitle);
        if (cleanAppSlug) queryParams.append('slug', cleanAppSlug);
        if (cleanAppId) queryParams.append('appId', cleanAppId);
        if (overallRating) queryParams.append('rating', String(overallRating));
        queryParams.append('limit', '5');

        const targetKey = cleanAppId || cleanAppSlug;
        const queryString = queryParams.toString();
        const endpoint = `/api/v1/public/community/reviews/${encodeURIComponent(targetKey)}${queryString ? `?${queryString}` : ''}`;

        
        const res = await fetch(endpoint);
        
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            
            if (data && Array.isArray(data.reviews)) {
              isServerResponseOk = true;
              const targetId = cleanAppId.toLowerCase();
              const targetSlug = cleanAppSlug.toLowerCase();
              const targetTitle = cleanAppTitle.toLowerCase();

              fetchedReviews = data.reviews
                .filter((r: any) => {
                  const rId = String(r.app_id || r.appId || '').toLowerCase().trim();
                  const rSlug = String(r.appSlug || '').toLowerCase().trim();
                  const rName = String(r.appName || '').toLowerCase().trim();

                  if (targetId && rId && rId === targetId) return true;
                  if (targetSlug && rSlug && rSlug === targetSlug) return true;
                  if (targetTitle && rName && rName === targetTitle) return true;
                  return Boolean((targetId && rId === targetId) || (targetSlug && rSlug === targetSlug));
                })
                .map((r: any) => ({
                  id: r.id || `rev_${Math.random()}`,
                  app_id: r.app_id || r.appId || cleanAppId,
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
              serverHasMore = Boolean(data.hasMore);
              serverNextCursor = data.nextCursor || null;
            }
          }
        }
      } catch (tier1Err) {
        // Network or offline fallback
      }

      // Update reviews state strictly for the current app context
      setReviews(prev => {
        if (isLoadMore) {
          const existingIds = new Set(prev.map(p => p.id));
          const newUnique = fetchedReviews.filter(r => !existingIds.has(r.id));
          return [...prev, ...newUnique];
        } else {
          // If server successfully replied, use its authoritative list!
          // If server returned [] (0 reviews or all deleted by admin), keep []!
          if (isServerResponseOk) {
            return fetchedReviews;
          }
          return getStaticFallbackReviews();
        }
      });

      setHasMore(serverHasMore);
      setNextCursor(serverNextCursor);
      nextCursorRef.current = serverNextCursor;

    } catch (err) {
      console.error('Reviews load pipeline error:', err);
      if (!isLoadMore) {
        setReviews(getStaticFallbackReviews());
      }
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
      setInitialLoadDone(true);
    }
  }, [cleanAppId, cleanAppSlug, cleanAppTitle, category, overallRating, nextCursor, getStaticFallbackReviews]);

  const prevAppRef = useRef<string | null>(null);

  // Initial load trigger on mount or appId change
  useEffect(() => {
    const targetKey = cleanAppId || cleanAppSlug || cleanAppTitle;
    if (prevAppRef.current !== null && prevAppRef.current !== targetKey) {
      setReviews(getStaticFallbackReviews());
      setNextCursor(null);
      nextCursorRef.current = null;
      setHasMore(false);
      setVotedReviews({});
      setReportedReviews({});
      setExpandedReviews({});
    }
    prevAppRef.current = targetKey;

    setInitialLoadDone(false);
    
    fetchReviews(false);
  }, [cleanAppId, cleanAppSlug, cleanAppTitle, getStaticFallbackReviews]);

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
        appId: cleanAppId || cleanAppSlug,
        reason: 'User Flagged Review',
        details: targetRev?.comment || ''
      })
    }).catch(() => {});
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
