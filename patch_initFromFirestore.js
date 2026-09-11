const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');
code = code.replace(
  `      const db = getCommunityAdminDb();
      if (db) {
        // Load reviews
        const snap = await db.collection('reviews').limit(5000).get();
        snap.docs.forEach((docSnap: any) => {
          const d = docSnap.data();
          this.reviews.set(docSnap.id, { id: docSnap.id, ...d });
        });

        // Load reports
        const rSnap = await db.collection('reports').limit(5000).get();
        rSnap.docs.forEach((docSnap: any) => {
          const d = docSnap.data();
          this.reports.set(docSnap.id, { id: docSnap.id, ...d });
        });
      } else {
        // Fallback to REST
        const [restReviews, restReports] = await Promise.all([
          readFirestoreRestCollection('reviews'),
          readFirestoreRestCollection('reports')
        ]);
        if (restReviews) {
          restReviews.forEach((r: any) => {
            this.reviews.set(r.id, { id: r.id, ...r });
          });
        }
        if (restReports) {
          restReports.forEach((r: any) => {
            this.reports.set(r.id, { id: r.id, ...r });
          });
        }
      }`,
  `      let sdkSuccess = false;
      const db = getCommunityAdminDb();
      if (db) {
        try {
          // Load reviews
          const snap = await db.collection('reviews').limit(5000).get();
          snap.docs.forEach((docSnap: any) => {
            const d = docSnap.data();
            this.reviews.set(docSnap.id, { id: docSnap.id, ...d });
          });

          // Load reports
          const rSnap = await db.collection('reports').limit(5000).get();
          rSnap.docs.forEach((docSnap: any) => {
            const d = docSnap.data();
            this.reports.set(docSnap.id, { id: docSnap.id, ...d });
          });
          sdkSuccess = true;
        } catch (sdkErr) {
          console.warn("[CommunityStore] Admin SDK init failed, falling back to REST:", sdkErr);
        }
      }
      
      if (!sdkSuccess) {
        // Fallback to REST
        const [restReviews, restReports] = await Promise.all([
          readFirestoreRestCollection('reviews'),
          readFirestoreRestCollection('reports')
        ]);
        if (restReviews) {
          restReviews.forEach((r: any) => {
            this.reviews.set(r.id, { id: r.id, ...r });
          });
        }
        if (restReports) {
          restReports.forEach((r: any) => {
            this.reports.set(r.id, { id: r.id, ...r });
          });
        }
      }`
);
fs.writeFileSync('src/server/services/communityStoreService.ts', code);
