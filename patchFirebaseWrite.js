const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');

const helperTarget = `export async function writeFirestoreRestDoc(docId: string, data: any, authToken?: string, merge: boolean = true, collectionPath: string = 'store_data'): Promise<boolean> {
  try {`;

const helperReplacement = `export async function writeFirestoreRestDoc(docId: string, data: any, authToken?: string, merge: boolean = true, collectionPath: string = 'store_data'): Promise<boolean> {
  // Always try Admin SDK first if available to bypass REST rules/quota limits
  const db = (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store' || collectionPath.startsWith('community_')) ? getCommunityAdminDb() : getFirebaseAdminDb();
  if (db) {
    try {
      await adminDbSetWithTimeout(db.collection(collectionPath).doc(docId), data, merge ? { merge: true } : undefined, 5000);
      console.log(\`[SERVER] Admin SDK successfully wrote \${collectionPath}/\${docId}\`);
      return true;
    } catch (e) {
      console.error(\`[SERVER] Admin SDK failed for \${collectionPath}/\${docId}:\`, e);
      // Fall through to REST
    }
  }

  try {`;

code = code.replace(helperTarget, helperReplacement);

// Do the same for readFirestoreRestDoc and deleteFirestoreRestDoc just in case!
const readTarget = `export async function readFirestoreRestDoc(docId: string, authToken?: string, collectionPath: string = 'store_data'): Promise<any> {
  try {`;
const readReplacement = `export async function readFirestoreRestDoc(docId: string, authToken?: string, collectionPath: string = 'store_data'): Promise<any> {
  const db = (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store' || collectionPath.startsWith('community_')) ? getCommunityAdminDb() : getFirebaseAdminDb();
  if (db) {
    try {
      const doc = await adminDbGetWithTimeout(db.collection(collectionPath).doc(docId), 5000);
      if (doc.exists) return doc.data();
      return null;
    } catch (e) {
      console.error(\`[SERVER] Admin SDK failed to read \${collectionPath}/\${docId}:\`, e);
      // Fall through
    }
  }

  try {`;
code = code.replace(readTarget, readReplacement);

const delTarget = `export async function deleteFirestoreRestDoc(docId: string, authToken?: string, collectionPath: string = 'store_data'): Promise<boolean> {
  try {`;
const delReplacement = `export async function deleteFirestoreRestDoc(docId: string, authToken?: string, collectionPath: string = 'store_data'): Promise<boolean> {
  const db = (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store' || collectionPath.startsWith('community_')) ? getCommunityAdminDb() : getFirebaseAdminDb();
  if (db) {
    try {
      await db.collection(collectionPath).doc(docId).delete();
      return true;
    } catch (e) {
      console.error(\`[SERVER] Admin SDK failed to delete \${collectionPath}/\${docId}:\`, e);
      // Fall through
    }
  }

  try {`;
code = code.replace(delTarget, delReplacement);

fs.writeFileSync('src/server/firebase.ts', code);
