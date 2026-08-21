import { useState, useEffect, useCallback, useMemo } from 'react';
import { Review } from '../components/public/ReviewItem';

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
        if (overallRating) queryParams.append('rating', String(overallRating));

        const targetKey = cleanAppId || cleanAppSlug;
        const queryString = queryParams.toString();
        const endpoint = `/api/v1/public/community/reviews/${encodeURIComponent(targetKey)}${queryString ? `?${queryString}` : ''}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
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
      // TIER 2: Firestore Direct REST API Fallback (for static site)
      // -------------------------------------------------------------
      if (fetchedReviews.length === 0 && !isLoadMore) {
        try {
          const projectId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
          const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/store_data/community_store`;
          
          const fsRes = await fetch(firestoreUrl);
          if (fsRes.ok) {
            const fsData = await fsRes.json();
            const rawReviews = fsData?.fields?.reviews?.arrayValue?.values;
            if (Array.isArray(rawReviews)) {
              const matchedReviews: Review[] = [];
              const searchKeys = new Set([
                cleanAppId.toLowerCase(),
                cleanAppSlug.toLowerCase(),
                cleanAppTitle.toLowerCase()
              ].filter(Boolean));

              rawReviews.forEach((item: any) => {
                const map = item?.mapValue?.fields;
                if (map) {
                  const rAppId = (map.appId?.stringValue || '').toLowerCase().trim();
                  const rAppSlug = (map.appSlug?.stringValue || '').toLowerCase().trim();
                  const rAppName = (map.appName?.stringValue || '').toLowerCase().trim();
                  const rStatus = map.status?.stringValue || 'published';

                  if (rStatus === 'published' && (searchKeys.has(rAppId) || searchKeys.has(rAppSlug) || searchKeys.has(rAppName))) {
                    matchedReviews.push({
                      id: map.id?.stringValue || `rev_${Math.random()}`,
                      app_id: map.appId?.stringValue || cleanAppId,
                      username: map.userName?.stringValue || 'Verified Player',
                      rating: Number(map.rating?.integerValue || map.rating?.doubleValue || 5),
                      comment: map.reviewText?.stringValue || '',
                      created_at: map.timestamp?.stringValue || new Date().toISOString(),
                      helpful_count: Number(map.helpful_count?.integerValue || 0),
                      reported: Boolean(map.reported?.booleanValue),
                      report_count: Number(map.report_count?.integerValue || 0),
                      source: map.source?.stringValue || 'community',
                      isPinned: Boolean(map.isPinned?.booleanValue),
                      adminReply: map.adminReply?.mapValue?.fields ? {
                        text: map.adminReply.mapValue.fields.text?.stringValue || '',
                        author: map.adminReply.mapValue.fields.author?.stringValue || 'Support Team',
                        timestamp: map.adminReply.mapValue.fields.timestamp?.stringValue || ''
                      } : null
                    });
                  }
                }
              });

              if (matchedReviews.length > 0) {
                fetchedReviews = matchedReviews;
              }
            }
          }
        } catch (tier2Err) {
          // Tier 2 fallback silently
        }
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
      // Removed default verified reviews to ensure reviews are only from real sources or AI generation studio

      // Merge remote, local, and default items smoothly
      setReviews(prev => {
        if (isLoadMore) {
          const existingIds = new Set(prev.map(p => p.id));
          const newUnique = fetchedReviews.filter(r => !existingIds.has(r.id));
          return [...prev, ...newUnique];
        } else {
          const dbIds = new Set(fetchedReviews.map(r => r.id));
          const filteredLocal = localReviews.filter(r => !dbIds.has(r.id));
          return [...filteredLocal, ...fetchedReviews];
        }
      });

      setHasMore(serverHasMore);
      setNextCursor(serverNextCursor);

    } catch (err) {
      console.error('Reviews load pipeline error:', err);
      // Fallback on catastrophic failure
      if (!isLoadMore) {
        setReviews([]);
      }
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
      setInitialLoadDone(true);
    }
  }, [cleanAppId, cleanAppSlug, cleanAppTitle, category, overallRating, nextCursor]);

  // Initial load trigger on mount or appId change
  useEffect(() => {
    setInitialLoadDone(false);
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
