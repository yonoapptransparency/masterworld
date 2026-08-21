const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'server', 'firebase.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const newCode = `
let cachedCommunityDb: any = null;

export function getCommunityAdminDb(): any {
  if (cachedCommunityDb) return cachedCommunityDb;

  try {
    const admin = require('firebase-admin');
    
    // Check if community app is already initialized
    const existingApp = admin.apps.find((app: any) => app.name === 'communityApp');
    if (existingApp) {
      cachedCommunityDb = existingApp.firestore();
      return cachedCommunityDb;
    }

    // Initialize community app
    const serviceAccountPath = path.join(process.cwd(), 'community-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      const communityApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      }, 'communityApp');
      
      cachedCommunityDb = communityApp.firestore();
      console.log('[Community Admin SDK] Firestore initialized successfully.');
      return cachedCommunityDb;
    } else {
      console.warn('[Community Admin SDK] community-service-account.json not found.');
      return null;
    }
  } catch (err: any) {
    console.warn('[Community Admin SDK] Initialization failed:', err.message || err);
    return null;
  }
}
`;

content = content.replace('export function convertToFirestoreValue', newCode + '\nexport function convertToFirestoreValue');

fs.writeFileSync(filePath, content);
console.log('Patched firebase.ts');
