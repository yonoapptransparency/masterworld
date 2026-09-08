const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

const helperCode = `
// Helper to try Admin SDK first, fallback to REST
async function safeDeleteDb(docId: string, _unusedAuthToken?: string, collectionPath: string = 'reviews') {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      await db.collection(collectionPath).doc(docId).delete();
      return true;
    } catch (e) {
      console.error(\`[safeDeleteDb] Admin SDK failed for \${collectionPath}/\${docId}:\`, e);
      // Fallback to REST
    }
  }
  return await deleteFirestoreRestDoc(docId, undefined, collectionPath);
}

`;

code = code.replace("// Helper to try Admin SDK first, fallback to REST\nasync function safeWriteDb", helperCode + "// Helper to try Admin SDK first, fallback to REST\nasync function safeWriteDb");

code = code.replace(/deleteFirestoreRestDoc\(cleanId, undefined, 'reviews'\)/g, "safeDeleteDb(cleanId, undefined, 'reviews')");
code = code.replace(/deleteFirestoreRestDoc\(id, undefined, 'reviews'\)/g, "safeDeleteDb(id, undefined, 'reviews')");
code = code.replace(/deleteFirestoreRestDoc\(id, undefined, 'reports'\)/g, "safeDeleteDb(id, undefined, 'reports')");

fs.writeFileSync('src/server/services/communityStoreService.ts', code);
