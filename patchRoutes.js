const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');

const target = `      // LIVE FIREBASE INTEGRATION: Fetch directly from Firestore on public site
      const db = getCommunityAdminDb();
      if (db) {
        const fetchLimit = Math.min(50, Number(limit) || 5);
        const cleanAppId = String(appId).trim();
        
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
      }`;

const replacement = `      // LIVE FIREBASE INTEGRATION: Fetch directly from Firestore on public site
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
      } else {
        // Fallback to REST API for Public Site / Vercel without Admin SDK
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
          } else {
            console.warn('[Community API] REST Query failed:', await fetchRes.text());
          }
        } catch (err) {
          console.error('[Community API] REST Query exception:', err);
        }
      }`;

if (code.includes('const db = getCommunityAdminDb();')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
  console.log('Patched communityRoutes.ts');
} else {
  console.error('Target not found in communityRoutes.ts');
}
