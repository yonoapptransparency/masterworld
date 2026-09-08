const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

const helperCode = `
async function safeReadDb(docId: string, _unusedAuthToken?: string, collectionPath: string = 'reviews') {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      const doc = await db.collection(collectionPath).doc(docId).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error(\`[safeReadDb] Admin SDK failed for \${collectionPath}/\${docId}:\`, e);
    }
  }
  return await readFirestoreRestDoc(docId, undefined, collectionPath);
}

async function safeReadCollection(collectionPath: string) {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      const snapshot = await db.collection(collectionPath).get();
      return snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
    } catch (e) {
      console.error(\`[safeReadCollection] Admin SDK failed for \${collectionPath}:\`, e);
    }
  }
  return await readFirestoreRestCollection(collectionPath);
}

`;

code = code.replace("// Helper to try Admin SDK first, fallback to REST\nasync function safeDeleteDb", helperCode + "// Helper to try Admin SDK first, fallback to REST\nasync function safeDeleteDb");

code = code.replace(/readFirestoreRestCollection\('reviews'\)/g, "safeReadCollection('reviews')");
code = code.replace(/readFirestoreRestCollection\('reports'\)/g, "safeReadCollection('reports')");
code = code.replace(/readFirestoreRestDoc\('community_store_meta', undefined, 'community_store'\)/g, "safeReadDb('community_store_meta', undefined, 'community_store')");
code = code.replace(/readFirestoreRestDoc\(\`community_reviews_chunk_\$\{i\}\`, undefined, 'community_store'\)/g, "safeReadDb(`community_reviews_chunk_${i}`, undefined, 'community_store')");
code = code.replace(/readFirestoreRestDoc\('community_store', undefined, 'community_store'\)/g, "safeReadDb('community_store', undefined, 'community_store')");

fs.writeFileSync('src/server/services/communityStoreService.ts', code);
