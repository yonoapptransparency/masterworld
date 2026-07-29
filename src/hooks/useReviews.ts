import { useState, useEffect, useCallback, useMemo } from 'react';
import { Review } from '../components/public/ReviewItem';

export function useReviews(appId: string, appTitle: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'critical'>('all');
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      
      let localReviews: Review[] = [];
      try {
        const stored = localStorage.getItem(`local_user_reviews_${appId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          localReviews = parsed.map((r: any) => ({
            ...r,
            reported: r.reported || false,
            report_count: r.report_count || 0
          }));
        }
      } catch (err) {
        console.error('Failed to parse local cached reviews', err);
      }

      let combinedReviews = [...localReviews];

      try {
        const res = await fetch(`/api/v1/public/reviews?app_id=${appId}`).catch(() => null);
        if (res && res.ok) {
          const remoteData = await res.json().catch(() => []);
          if (Array.isArray(remoteData) && remoteData.length > 0) {
            const dbIds = new Set(remoteData.map((r: any) => r.id));
            const filteredLocal = localReviews.filter(r => !dbIds.has(r.id));
            combinedReviews = [...remoteData, ...filteredLocal];
          }
        }
      } catch (dbErr) {}

      combinedReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReviews(combinedReviews);
      setLoading(false);
    };

    loadReviews();
  }, [appId, appTitle]);

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

  const handleReportReview = useCallback(async (id: string) => {
    if (reportedReviews[id]) return;

    setReportedReviews(prev => ({ ...prev, [id]: true }));
    setReviews(prev =>
      prev.map(r => {
        if (r.id === id) {
          return { 
            ...r, 
            reported: true, 
            report_count: (r.report_count || 0) + 1 
          };
        }
        return r;
      })
    );

    try {
      const stored = localStorage.getItem(`local_user_reviews_${appId}`);
      if (stored) {
        const parsed: Review[] = JSON.parse(stored);
        const updated = parsed.map(r => {
          if (r.id === id) {
            return {
              ...r,
              reported: true,
              report_count: (r.report_count || 0) + 1
            };
          }
          return r;
        });
        localStorage.setItem(`local_user_reviews_${appId}`, JSON.stringify(updated));
      }
    } catch (e) {}

    try {
      if (!id.startsWith('mock')) {
        await fetch('/api/v1/public/report-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review_id: id })
        }).catch(() => {});
      }
    } catch (e) {}
  }, [reportedReviews, appId]);

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
