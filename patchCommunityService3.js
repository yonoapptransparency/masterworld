const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');

const helperTarget = `async function safeWriteDb(docId: string, data: any, collectionPath: string = 'reviews', merge: boolean = true) {`;
const helperReplacement = `async function safeWriteDb(docId: string, data: any, _unusedAuthToken?: string, merge: boolean = true, collectionPath: string = 'reviews') {`;

code = code.replace(helperTarget, helperReplacement);

// We also need to fix where I replaced `writeFirestoreRestDoc` but hardcoded the args incorrectly:
// I did: safeWriteDb(id, newRev, 'reviews', true)
// But wait, the new signature would be (docId, data, _unused, merge, collectionPath).
// Let's just fix the calls that I replaced manually!

code = code.replace(/safeWriteDb\(id, newRev, 'reviews', true\)/g, "safeWriteDb(id, newRev, undefined, true, 'reviews')");
code = code.replace(/safeWriteDb\(reviewId, \{ helpful_count: rev\.helpful_count \}, 'reviews', true\)/g, "safeWriteDb(reviewId, { helpful_count: rev.helpful_count }, undefined, true, 'reviews')");
code = code.replace(/safeWriteDb\(reviewId, \{ reported: true, report_count: rev\.report_count \}, 'reviews', true\)/g, "safeWriteDb(reviewId, { reported: true, report_count: rev.report_count }, undefined, true, 'reviews')");
code = code.replace(/safeWriteDb\(reportId, newReport, 'reports', true\)/g, "safeWriteDb(reportId, newReport, undefined, true, 'reports')");
code = code.replace(/safeWriteDb\(id, updated, 'reviews', true\)/g, "safeWriteDb(id, updated, undefined, true, 'reviews')");
code = code.replace(/safeWriteDb\(id, newReport, 'reports', true\)/g, "safeWriteDb(id, newReport, undefined, true, 'reports')");
code = code.replace(/safeWriteDb\(id, updated, 'reports', true\)/g, "safeWriteDb(id, updated, undefined, true, 'reports')");

fs.writeFileSync('src/server/services/communityStoreService.ts', code);
