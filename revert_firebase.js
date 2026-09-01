const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');

code = code.replace(`export function getFirebaseAdminDb(): any {\n  if (process.env.VERCEL === '1' || process.env.VERCEL_REGION) {\n    lastAdminSdkStatusMsg = "Admin SDK disabled on Vercel to prevent timeouts (using lightweight REST fallback)";\n    console.log("[Admin SDK] Disabled in Vercel environment. Falling back to REST API.");\n    return null;\n  }\n\n  if (cachedAdminDb) return cachedAdminDb;`, 
`export function getFirebaseAdminDb(): any {\n  if (cachedAdminDb) return cachedAdminDb;`);

code = code.replace(`export function getCommunityAdminDb(): any {\n  if (process.env.VERCEL === '1' || process.env.VERCEL_REGION) {\n    console.log("[Community Admin SDK] Disabled in Vercel environment. Falling back to REST API.");\n    return null;\n  }\n\n  if (cachedCommunityDb) return cachedCommunityDb;`, 
`export function getCommunityAdminDb(): any {\n  if (cachedCommunityDb) return cachedCommunityDb;`);

fs.writeFileSync('src/server/firebase.ts', code);
console.log('Reverted');
