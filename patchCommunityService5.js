const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

const helperCode = `
// Helper to try Admin SDK first, fallback to REST
async function safeWriteDb(docId: string, data: any, _unusedAuthToken?: string, merge: boolean = true, collectionPath: string = 'reviews') {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      await db.collection(collectionPath).doc(docId).set(data, { merge });
      return true;
    } catch (e) {
      console.error(\`[safeWriteDb] Admin SDK failed for \${collectionPath}/\${docId}:\`, e);
      // Fallback to REST
    }
  }
  return await writeFirestoreRestDoc(docId, data, undefined, merge, collectionPath);
}

`;

code = code.replace("class CommunityStoreService {", helperCode + "class CommunityStoreService {");

fs.writeFileSync('src/server/services/communityStoreService.ts', code);
