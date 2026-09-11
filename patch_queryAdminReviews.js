const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');
code = code.replace(
  `        const db = getCommunityAdminDb();
        if (db) {
          const snap = await db.collection('reviews').limit(5000).get();
          snap.docs.forEach((docSnap: any) => {
            const d = docSnap.data();
            this.reviews.set(docSnap.id, { id: docSnap.id, ...d });
          });
        } else {
          // REST Fallback for Admin SDK failure
          
          const restReviews = await readFirestoreRestCollection('reviews');
          if (restReviews && restReviews.length > 0) {
            restReviews.forEach((r: any) => {
              this.reviews.set(r.id, { id: r.id, ...r });
            });
          }
        }`,
  `        let sdkSuccess = false;
        const db = getCommunityAdminDb();
        if (db) {
          try {
            const snap = await db.collection('reviews').limit(5000).get();
            snap.docs.forEach((docSnap: any) => {
              const d = docSnap.data();
              this.reviews.set(docSnap.id, { id: docSnap.id, ...d });
            });
            sdkSuccess = true;
          } catch (sdkErr) {
            console.warn("[CommunityStore] Admin SDK fetch failed, falling back to REST:", sdkErr);
          }
        }
        
        if (!sdkSuccess) {
          // REST Fallback for Admin SDK failure or if no Admin DB
          const restReviews = await readFirestoreRestCollection('reviews');
          if (restReviews && restReviews.length > 0) {
            restReviews.forEach((r: any) => {
              this.reviews.set(r.id, { id: r.id, ...r });
            });
          }
        }`
);
fs.writeFileSync('src/server/services/communityStoreService.ts', code);
