const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

// We want to replace the writeFirestoreRestDoc calls with Admin SDK calls where possible.
// Wait, I can just create a helper in communityStoreService.ts that tries Admin SDK first!

const helperTarget = `export class CommunityStoreService {`;
const helperReplacement = `
// Helper to try Admin SDK first, fallback to REST
async function safeWriteDb(docId: string, data: any, collectionPath: string = 'reviews', merge: boolean = true) {
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

export class CommunityStoreService {`;

code = code.replace(helperTarget, helperReplacement);

// Now replace all writeFirestoreRestDoc(id, data, undefined, true, 'reviews') with safeWriteDb(id, data, 'reviews', true)
code = code.replace(/writeFirestoreRestDoc\('community_store_meta', metaData, undefined, true, 'community_store'\)/g, "safeWriteDb('community_store_meta', metaData, 'community_store', true)");
code = code.replace(/writeFirestoreRestDoc\(\`community_reviews_chunk_\$\{i\}\`, \{/g, "safeWriteDb(`community_reviews_chunk_${i}`, {");
// Chunk writes don't easily fit a regex because they span lines. I'll just regex replace the specific function calls.
code = code.replace(/writeFirestoreRestDoc\(id, newRev, undefined, true, 'reviews'\)/g, "safeWriteDb(id, newRev, 'reviews', true)");
code = code.replace(/writeFirestoreRestDoc\(reviewId, \{ helpful_count: rev.helpful_count \}, undefined, true, 'reviews'\)/g, "safeWriteDb(reviewId, { helpful_count: rev.helpful_count }, 'reviews', true)");
code = code.replace(/writeFirestoreRestDoc\(reviewId, \{ reported: true, report_count: rev.report_count \}, undefined, true, 'reviews'\)/g, "safeWriteDb(reviewId, { reported: true, report_count: rev.report_count }, 'reviews', true)");
code = code.replace(/writeFirestoreRestDoc\(reportId, newReport, undefined, true, 'reports'\)/g, "safeWriteDb(reportId, newReport, 'reports', true)");
code = code.replace(/writeFirestoreRestDoc\(id, updated, undefined, true, 'reviews'\)/g, "safeWriteDb(id, updated, 'reviews', true)");
code = code.replace(/writeFirestoreRestDoc\(id, newReport, undefined, true, 'reports'\)/g, "safeWriteDb(id, newReport, 'reports', true)");
code = code.replace(/writeFirestoreRestDoc\(id, updated, undefined, true, 'reports'\)/g, "safeWriteDb(id, updated, 'reports', true)");

// The chunk writes might have different format, let's fix them manually.
fs.writeFileSync('src/server/services/communityStoreService.ts', code);
