const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');

const replacement = `      const db = getCommunityAdminDb();
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
        
        const body = {
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
            const liveReviews = [];
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
          }
        } catch (err) {}
      }`;

// Regex to replace the whole block starting from `const db = getCommunityAdminDb();` to `result.nextCursor = ...; }`
const regex = /const db = getCommunityAdminDb\(\);[\s\S]*?result\.nextCursor = [^;]+;/m;
code = code.replace(regex, replacement);
// Then remove the extra `}` that was left over because the regex stopped at the semicolon.
code = code.replace(/if \(!cursor\) publicReviewsCache\.set\(cacheKey, { data: result, timestamp: Date\.now\(\) }\);\n\s*}\s*}/g, 'if (!cursor) publicReviewsCache.set(cacheKey, { data: result, timestamp: Date.now() });\n      }\n      }');

fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
