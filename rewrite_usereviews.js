const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'hooks', 'useReviews.ts');

const newContent = `import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

      const url = new URL(\`/api/v1/public/community/reviews/\${appId}\`, window.location.origin);
      if (isLoadMore && nextCursor) {
        url.searchParams.append('cursor', nextCursor);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        
        let remoteReviews = data.reviews || [];
        // Map backend community structure to frontend Review interface if needed
        remoteReviews = remoteReviews.map((r: any) => ({
          ...r,
          id: r.id,
          app_id: r.appId,
          username: r.userName,
          rating: r.rating,
          comment: r.reviewText,
          created_at: r.timestamp,
          helpful_count: r.helpful_count || 0,
          reported: false,
          report_count: 0,
          source: 'community'
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
              const stored = localStorage.getItem(\`local_user_reviews_\${appId}\`);
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
  }, [appId, nextCursor]);

  // Initial lazy load trigger
  useEffect(() => {
    if (inView && !initialLoadDone && !loading) {
      fetchReviews(false);
    }
  }, [inView, initialLoadDone, loading, fetchReviews]);

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
  }, [votedReviews]);

  const handleReportReview = useCallback((id: string) => {
    if (reportedReviews[id]) return;
    setReportedReviews(prev => ({ ...prev, [id]: true }));
    setReviews(prev =>
      prev.map(r => {
        if (r.id === id) {
          return { ...r, reported: true, report_count: (r.report_count || 0) + 1 };
        }
        return r;
      })
    );
  }, [reportedReviews]);

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
`;

fs.writeFileSync(filePath, newContent);
console.log('Rewrote useReviews.ts for lazy loading & pagination');
