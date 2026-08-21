const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'server', 'routes', 'communityRoutes.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const newFeedRoute = `
// Get Published Reviews Feed (Paginated)
communityRouter.get("/api/v1/public/community/reviews/:appId", async (req: any, res: any) => {
  const { appId } = req.params;
  const { cursor } = req.query; // ISO timestamp string
  try {
    const db = getCommunityAdminDb();
    if (!db) return res.status(500).json({ error: 'Community database not initialized.' });

    let query = db.collection('reviews')
      .where('appId', '==', appId)
      .where('status', '==', 'published')
      .orderBy('timestamp', 'desc');

    if (cursor) {
      query = query.startAfter(cursor);
    }

    const snapshot = await query.limit(10).get();

    const reviews = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    const hasMore = reviews.length === 10;
    const nextCursor = reviews.length > 0 ? reviews[reviews.length - 1].timestamp : null;

    return res.status(200).json({ reviews, hasMore, nextCursor });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch reviews feed' });
  }
});
`;

// Replace the existing feed route
content = content.replace(
  /\/\/ Get Published Reviews Feed[\s\S]*?\}\);/m,
  newFeedRoute.trim()
);

fs.writeFileSync(filePath, content);
console.log('Patched communityRoutes.ts for pagination');
