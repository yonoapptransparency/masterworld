const fs = require('fs');
const path = 'src/server/routes/communityRoutes.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `    // 1. Force explicitly LIVE fetch from Firestore to guarantee the most up-to-date data for admin editing.
    // If the Firestore fetch fails, it elegantly falls back to the in-memory cache managed by communityStore.
    let liveReviews: any[] = [];
    try {
      const { readFirestoreRestCollection } = require('../firebase');
      const docs = await readFirestoreRestCollection('reviews');
      if (docs && docs.length > 0) {
        liveReviews = docs;
      }
    } catch (firebaseErr) {
      console.warn("Failed to fetch live admin reviews from Firestore, falling back to cache.", firebaseErr);
    }`;

const replacement = `    // 1. Force explicitly LIVE fetch from Firestore to guarantee the most up-to-date data for admin editing.
    let liveReviews: any[] = [];
    try {
      const { getCommunityAdminDb } = require('../firebase');
      const db = getCommunityAdminDb();
      if (db) {
        const snapshot = await db.collection('reviews').orderBy('timestamp', 'desc').limit(500).get();
        snapshot.forEach((doc: any) => {
          liveReviews.push({ id: doc.id, ...doc.data() });
        });
        console.log(\`[Admin API] Fetched \${liveReviews.length} live reviews from Firestore\`);
      }
    } catch (firebaseErr) {
      console.warn("Failed to fetch live admin reviews from Firestore, falling back to cache.", firebaseErr);
    }`;

if (content.includes(target)) {
  fs.writeFileSync(path, content.replace(target, replacement));
  console.log("Patched communityRoutes.ts successfully");
} else {
  console.log("Target not found in communityRoutes.ts");
}
