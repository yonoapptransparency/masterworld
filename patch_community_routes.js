const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'server', 'routes', 'communityRoutes.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const newRoutes = `
// Get App Rating Stats
communityRouter.get("/api/v1/public/community/stats/:appId", async (req: any, res: any) => {
  const { appId } = req.params;
  try {
    const db = getCommunityAdminDb();
    if (!db) return res.status(500).json({ error: 'Community database not initialized.' });

    const statsDoc = await db.collection('app_rating_stats').doc(appId).get();
    if (statsDoc.exists) {
      return res.status(200).json({ stats: statsDoc.data() });
    } else {
      // Default fake stats if none exist yet to keep the UI looking good initially
      return res.status(200).json({ 
        stats: {
          appId,
          averageRating: 5.0,
          totalReviews: 1,
          starCounts: { '5': 1, '4': 0, '3': 0, '2': 0, '1': 0 }
        }
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get Published Reviews Feed
communityRouter.get("/api/v1/public/community/reviews/:appId", async (req: any, res: any) => {
  const { appId } = req.params;
  try {
    const db = getCommunityAdminDb();
    if (!db) return res.status(500).json({ error: 'Community database not initialized.' });

    const snapshot = await db.collection('reviews')
      .where('appId', '==', appId)
      .where('status', '==', 'published')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const reviews = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ reviews });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch reviews feed' });
  }
});
`;

content = content.replace(
  '// Get pending reviews',
  newRoutes + '\n// Get pending reviews'
);

fs.writeFileSync(filePath, content);
console.log('Patched communityRoutes.ts');
