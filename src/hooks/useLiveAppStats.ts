import { useState, useEffect } from 'react';
import { getCachedLiveAppStats } from '../lib/communityFirebase';
import { generateNaturalStarDistribution } from '../seo/utils';

export function useLiveAppStats(
  appId: string, 
  appSlug?: string, 
  fallbackRating: number = 4.8, 
  fallbackTotal: number = 0
) {
  const cleanId = String(appId || '').trim();
  const cleanSlug = String(appSlug || '').trim();

  const [stats, setStats] = useState<any>(() => {
    const cached = getCachedLiveAppStats(cleanId, cleanSlug);
    if (cached) return cached;
    if (fallbackTotal > 0 || fallbackRating > 0) {
      const starCounts = generateNaturalStarDistribution(fallbackRating, fallbackTotal);
      return {
        averageRating: fallbackRating,
        totalReviews: fallbackTotal,
        starCounts,
        distribution: starCounts
      };
    }
    return null;
  });

  useEffect(() => {
    if (!cleanId && !cleanSlug) return;

    // 1. Conditionally sync with cache if stats differ
    const immediate = getCachedLiveAppStats(cleanId, cleanSlug);
    if (immediate) {
      setStats((prev: any) => {
        if (prev && prev.totalReviews === immediate.totalReviews && prev.averageRating === immediate.averageRating) {
          return prev;
        }
        return immediate;
      });
    }

    // 2. Query live stats endpoint asynchronously to catch any new reviews since build
    let isMounted = true;
    const fetchFresh = async () => {
      try {
        const queryTarget = cleanId || cleanSlug;
        const res = await fetch(`/api/v1/public/community/stats/${encodeURIComponent(queryTarget)}?appSlug=${encodeURIComponent(cleanSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.stats) {
            setStats((prev: any) => {
              if (prev && prev.totalReviews === data.stats.totalReviews && prev.averageRating === data.stats.averageRating) {
                return prev;
              }
              return data.stats;
            });
          }
        }
      } catch (_) {}
    };
    fetchFresh();

    // 3. Listen for immediate local updates
    const handleUpdate = (e: any) => {
      const addedReview = e?.detail?.newReview;
      if (addedReview) {
        setStats((prev: any) => {
          if (!prev) {
            return {
              totalReviews: 1,
              averageRating: addedReview.rating,
              starCounts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, [String(addedReview.rating)]: 1 },
              distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, [String(addedReview.rating)]: 1 }
            };
          }
          const currentTotal = prev.totalReviews || 0;
          const currentSum = (prev.averageRating || fallbackRating) * currentTotal;
          const newTotal = currentTotal + 1;
          const newAverage = (currentSum + addedReview.rating) / newTotal;
          const newCounts = { ...prev.starCounts };
          newCounts[String(addedReview.rating)] = (newCounts[String(addedReview.rating)] || 0) + 1;
          return {
            ...prev,
            averageRating: newAverage,
            totalReviews: newTotal,
            starCounts: newCounts,
            distribution: newCounts
          };
        });
      }
    };
    
    const handleReviewsUpdated = () => {
      fetchFresh();
    };

    window.addEventListener('community-review-added', handleUpdate);
    window.addEventListener('community-reviews-updated', handleReviewsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('community-review-added', handleUpdate);
      window.removeEventListener('community-reviews-updated', handleReviewsUpdated);
    };
  }, [cleanId, cleanSlug, fallbackRating, fallbackTotal]);

  return stats;
}
