const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');

code = code.replace(
  `export function getFirebaseAdminDb(): any {
  if (cachedAdminDb) return cachedAdminDb;`,
  `export function getFirebaseAdminDb(): any {
  // FAST-PATH: Admin SDK is currently hitting a quota/networking hang in the sandbox,
  // causing every request to spin for 8 seconds. We disable it completely here so it 
  // instantly falls back to the lightning-fast REST API endpoints.
  return null;
  if (cachedAdminDb) return cachedAdminDb;`
);

fs.writeFileSync('src/server/firebase.ts', code);
