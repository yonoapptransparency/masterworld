import fs from 'fs';
let content = fs.readFileSync('src/lib/communityFirebase.ts', 'utf8');

const targetStr = "  // 3. Fallback: Check for any locally saved user reviews in browser storage";
const fallbackCode = `  // 3. Static Code Fallback: from communityReviewsData.ts
  try {
    const { STATIC_COMMUNITY_REVIEWS } = require('./communityStoreFallback');
    if (STATIC_COMMUNITY_REVIEWS && STATIC_COMMUNITY_REVIEWS.length > 0) {
      const matchFallbacks = STATIC_COMMUNITY_REVIEWS.filter((r: any) => 
        r.appId === targetId || r.appSlug === targetSlug || r.appId === targetSlug
      );
      if (matchFallbacks.length > 0) {
        matchFallbacks.sort((a: any, b: any) => new Date(b.created_at || b.timestamp || 0).getTime() - new Date(a.created_at || a.timestamp || 0).getTime());
        const enriched = attachLocalUserReviews(matchFallbacks.slice(0, limit));
        const hasMoreStatic = matchFallbacks.length > limit;
        const result = { 
           reviews: enriched, 
           hasMore: hasMoreStatic, 
           nextCursor: hasMoreStatic ? enriched[enriched.length-1].id : null 
        };
        if (!cursor && filter === 'all' && sortBy === 'recent') targets.forEach(t => setCachedLiveReviews(t, result));
        return result;
      }
    }
  } catch(e) {}

  // 4. Fallback: Check for any locally saved user reviews in browser storage`;

content = content.replace(targetStr, fallbackCode);
fs.writeFileSync('src/lib/communityFirebase.ts', content);
