const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');

const target = `export const communityRouter = Router();`;
const replacement = `export const communityRouter = Router();

// In-memory cache to prevent Firebase quota exhaustion on public site
const publicReviewsCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL_MS = 60000; // 60 seconds cache for live reviews
`;

code = code.replace(target, replacement);

const target2 = `    const isPublicSite = !fs.existsSync(path.join(process.cwd(), 'src/pages/AdminDashboard.tsx'));
    let result: any = { reviews: [], hasMore: false, nextCursor: null };
    let stats = { average_rating: Number(rating) || 4.8, total_reviews: 0, rating_distribution: {1:0, 2:0, 3:0, 4:0, 5:0} };`;

const replacement2 = `    const isPublicSite = !fs.existsSync(path.join(process.cwd(), 'src/pages/AdminDashboard.tsx'));
    let result: any = { reviews: [], hasMore: false, nextCursor: null };
    let stats = { average_rating: Number(rating) || 4.8, total_reviews: 0, rating_distribution: {1:0, 2:0, 3:0, 4:0, 5:0} };

    // Check cache first if it's the first page
    const cacheKey = \`\${appId}_\${limit}\`;
    if (isPublicSite && !cursor) {
      const cached = publicReviewsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        result = cached.data;
        // Fallback stats
        stats = communityStore.getAppStats(
          String(appId).trim(), 
          Number(rating) || 4.8, 
          appTitle ? String(appTitle) : undefined, 
          targetSlug ? String(targetSlug) : undefined
        );
        return res.status(200).json({ success: true, reviews: result.reviews, stats, hasMore: result.hasMore, nextCursor: result.nextCursor });
      }
    }
`;

code = code.replace(target2, replacement2);

const target3 = `            result.reviews = liveReviews;
            result.nextCursor = liveReviews.length > 0 ? liveReviews[liveReviews.length - 1].timestamp : null;
          } else {`;
const replacement3 = `            result.reviews = liveReviews;
            result.nextCursor = liveReviews.length > 0 ? liveReviews[liveReviews.length - 1].timestamp : null;
            
            // Cache the result for first page
            if (!cursor) {
              publicReviewsCache.set(cacheKey, { data: result, timestamp: Date.now() });
            }
          } else {`;

code = code.replace(target3, replacement3);

const target4 = `        result.reviews = liveReviews;
        result.nextCursor = liveReviews.length > 0 ? liveReviews[liveReviews.length - 1].timestamp : null;
      } else {`;
const replacement4 = `        result.reviews = liveReviews;
        result.nextCursor = liveReviews.length > 0 ? liveReviews[liveReviews.length - 1].timestamp : null;

        // Cache the result for first page
        if (!cursor) {
          publicReviewsCache.set(cacheKey, { data: result, timestamp: Date.now() });
        }
      } else {`;

code = code.replace(target4, replacement4);

fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
console.log('Added cache to communityRoutes.ts');
