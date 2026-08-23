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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'critical'>('all');
  
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  const cleanAppId = String(appId || '').trim();
  const cleanAppSlug = String(appSlug || '').trim();
  const cleanAppTitle = String(appTitle || '').trim();

  const getStaticFallbackReviews = useCallback((): Review[] => {
    const targetId = (cleanAppId || '').toLowerCase().trim();
    const targetSlug = (cleanAppSlug || '').toLowerCase().trim();
    const targetTitle = (cleanAppTitle || '').toLowerCase().trim();

    return STATIC_COMMUNITY_REVIEWS.filter(r => {
      const rAppId = String(r.appId || '').toLowerCase().trim();
      const rAppSlug = String(r.appSlug || '').toLowerCase().trim();
      const rAppName = String(r.appName || '').toLowerCase().trim();

      return (targetId && rAppId === targetId) ||
             (targetSlug && rAppSlug === targetSlug) ||
             (targetTitle && rAppName === targetTitle);
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
      source: r.source || 'admin_created',
      isPinned: Boolean(r.isPinned),
      adminReply: r.adminReply || null
    }));
  }, [cleanAppId, cleanAppSlug, cleanAppTitle]);

  // Multi-tier resilient review fetcher
  const fetchReviews = useCallback(async (isLoadMore = false) => {
    if (!cleanAppId && !cleanAppSlug) return;
    
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

      let fetchedReviews: Review[] = [];
      let serverHasMore = false;
      let serverNextCursor: string | null = null;

      // -------------------------------------------------------------
      // TIER 1: Try Local API Route (/api/v1/public/community/reviews)
      // -------------------------------------------------------------
      try {
        const queryParams = new URLSearchParams();
        if (isLoadMore && nextCursor) queryParams.append('cursor', nextCursor);
        if (cleanAppTitle) queryParams.append('appTitle', cleanAppTitle);
        if (cleanAppSlug) queryParams.append('slug', cleanAppSlug);
        if (cleanAppId) queryParams.append('appId', cleanAppId);
        if (overallRating) queryParams.append('rating', String(overallRating));

        const targetKey = cleanAppId || cleanAppSlug;
        const queryString = queryParams.toString();
        const endpoint = `/api/v1/public/community/reviews/${encodeURIComponent(targetKey)}${queryString ? `?${queryString}` : ''}`;

        console.log("Fetching reviews from", endpoint);
        const res = await fetch(endpoint);
        console.log("Response status:", res.status);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            console.log("Fetched review data:", data.reviews?.length);
            if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
              fetchedReviews = data.reviews.map((r: any) => ({
                id: r.id || `rev_${Math.random()}`,
                app_id: r.app_id || r.appId || cleanAppId,
                username: r.username || r.userName || 'Verified Player',
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
        // Tier 1 fallback silently
      }

      // -------------------------------------------------------------
      // TIER 3: Local Storage Merge & Optimistic Reviews
      // -------------------------------------------------------------
      let localReviews: Review[] = [];
      try {
        const localKey1 = `local_user_reviews_${cleanAppId}`;
        const localKey2 = cleanAppSlug ? `local_user_reviews_${cleanAppSlug}` : null;
        
        const stored1 = localStorage.getItem(localKey1);
        const stored2 = localKey2 ? localStorage.getItem(localKey2) : null;
        
        if (stored1) localReviews = [...localReviews, ...JSON.parse(stored1)];
        if (stored2) localReviews = [...localReviews, ...JSON.parse(stored2)];
      } catch (e) {}

      // -------------------------------------------------------------
      // TIER 4: Guaranteed Never-Empty Verified Reviews Fallback
      // -------------------------------------------------------------
      const staticReviews = getStaticFallbackReviews();
      const combinedFetched = fetchedReviews.length > 0 ? fetchedReviews : staticReviews;

      // Merge remote, local, and default items smoothly
      setReviews(prev => {
        if (isLoadMore) {
          const existingIds = new Set(prev.map(p => p.id));
          const newUnique = combinedFetched.filter(r => !existingIds.has(r.id));
          return [...prev, ...newUnique];
        } else {
          const dbIds = new Set(combinedFetched.map(r => r.id));
          const filteredLocal = localReviews.filter(r => !dbIds.has(r.id));
          return [...filteredLocal, ...combinedFetched];
        }
      });

      setHasMore(serverHasMore);
      setNextCursor(serverNextCursor);

    } catch (err) {
      console.error('Reviews load pipeline error:', err);
      // Fallback on catastrophic failure
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
    const targetKey = cleanAppId || cleanAppSlug;
    if (prevAppRef.current !== null && prevAppRef.current !== targetKey) {
      setReviews([]);
      setNextCursor(null);
      setHasMore(false);
    }
    prevAppRef.current = targetKey;

    setInitialLoadDone(false);
    console.log("TRIGGERING fetchReviews for:", cleanAppId, cleanAppSlug);
    fetchReviews(false);
  }, [cleanAppId, cleanAppSlug]);

  // Listen to community-review-added event across tabs/components
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

    window.addEventListener('community-review-added', handleNewReview);
    return () => window.removeEventListener('community-review-added', handleNewReview);
  }, [cleanAppId, cleanAppSlug]);

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
