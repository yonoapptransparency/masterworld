const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');

const regex = /communityRouter\.get\("\/api\/v1\/public\/community\/reviews\/:appId"[\s\S]*?communityRouter\.get\("\/api\/v1\/public\/community\/stats\/:appId"/;

const newBlock = `communityRouter.get("/api/v1/public/community/reviews/:appId", async (req: any, res: any) => {
  console.log("[GET REVIEWS API] Requested appId:", req.params.appId, "query:", req.query);
  const { appId } = req.params;
  const { cursor, limit = 10, appTitle, rating, slug, appSlug } = req.query;
  const targetSlug = slug || appSlug;

  try {
    const isPublicSite = !fs.existsSync(path.join(process.cwd(), 'src/pages/AdminDashboard.tsx'));
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

    if (isPublicSite) {
      // LIVE FIREBASE INTEGRATION: Fetch directly from Firestore on public site
      const db = getCommunityAdminDb();
      const fetchLimit = Math.min(50, Number(limit) || 5);
      const cleanAppId = String(appId).trim();

      if (db) {
        let query = db.collection('reviews')
          .where('status', 'in', ['published', 'approved'])
          .where('appId', '==', cleanAppId)
          .orderBy('timestamp', 'desc')
          .limit(fetchLimit + 1);
        
        if (cursor) {
          query = query.startAfter(cursor);
        }
        const snap = await query.get();
        const liveReviews = snap.docs.map((doc: any) => doc.data());
        
        result.hasMore = liveReviews.length > fetchLimit;
        if (result.hasMore) liveReviews.pop();
        
        result.reviews = liveReviews;
        result.nextCursor = liveReviews.length > 0 ? liveReviews[liveReviews.length - 1].timestamp : null;
        if (!cursor) publicReviewsCache.set(cacheKey, { data: result, timestamp: Date.now() });
      } else {
        const targetProjectId = 'rummydexcommunity';
        const targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';
        const url = \`https://firestore.googleapis.com/v1/projects/\${targetProjectId}/databases/(default)/documents:runQuery?key=\${targetApiKey}\`;
        
        const body: any = {
          structuredQuery: {
            from: [{ collectionId: 'reviews' }],
            where: {
              compositeFilter: {
                op: 'AND',
                filters: [
                  { fieldFilter: { field: { fieldPath: 'appId' }, op: 'EQUAL', value: { stringValue: cleanAppId } } },
                  { fieldFilter: { field: { fieldPath: 'status' }, op: 'IN', value: { arrayValue: { values: [{ stringValue: 'published' }, { stringValue: 'approved' }] } } } }
                ]
              }
            },
            orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
            limit: fetchLimit + 1
          }
        };

        if (cursor) {
          body.structuredQuery.startAt = { values: [{ stringValue: cursor }], before: false };
        }

        try {
          const fetchRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (fetchRes.ok) {
            const data = await fetchRes.json();
            const { parseFirestoreFields } = require('../firebase');
            const liveReviews: any[] = [];
            for (const item of data) {
              if (item.document) {
                liveReviews.push({
                  id: item.document.name.split('/').pop(),
                  ...parseFirestoreFields(item.document.fields)
                });
              }
            }
            
            result.hasMore = liveReviews.length > fetchLimit;
            if (result.hasMore) liveReviews.pop();
            
            result.reviews = liveReviews;
            result.nextCursor = liveReviews.length > 0 ? liveReviews[liveReviews.length - 1].timestamp : null;
            if (!cursor) publicReviewsCache.set(cacheKey, { data: result, timestamp: Date.now() });
          } else {
            console.warn('[Community API] REST Query failed:', await fetchRes.text());
          }
        } catch (err) {
          console.error('[Community API] REST Query exception:', err);
        }
      }
      
      // Fallback stats
      stats = communityStore.getAppStats(
        String(appId).trim(), 
        Number(rating) || 4.8, 
        appTitle ? String(appTitle) : undefined, 
        targetSlug ? String(targetSlug) : undefined
      );

    } else {
      // Admin Site: Use memory cache
      result = communityStore.getReviewsForApp(
        String(appId).trim(),
        cursor ? String(cursor) : undefined,
        Math.min(50, Number(limit) || 10),
        appTitle ? String(appTitle) : undefined,
        Number(rating) || 5.0,
        targetSlug ? String(targetSlug) : undefined
      );
      stats = communityStore.getAppStats(
        String(appId).trim(), 
        Number(rating) || 4.8, 
        appTitle ? String(appTitle) : undefined, 
        targetSlug ? String(targetSlug) : undefined
      );
    }

    return res.status(200).json({
      success: true,
      reviews: result.reviews.map((r: any) => ({
        id: r.id,
        app_id: r.appId,
        username: r.userName,
        rating: r.rating,
        comment: r.reviewText,
        created_at: r.timestamp,
        helpful_count: r.helpful_count || 0,
        source: r.source || 'community',
        reported: r.reported || false,
        report_count: r.report_count || 0,
        isPinned: r.isPinned || false,
        adminReply: r.adminReply || null
      })),
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      stats
    });

  } catch (err: any) {
    console.error("Error fetching public community reviews:", err);
    return res.status(500).json({ error: 'Failed to fetch reviews: ' + (err.message || String(err)) });
  }
});

communityRouter.get("/api/v1/public/community/stats/:appId"`;

code = code.replace(regex, newBlock);
fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
