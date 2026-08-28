const fs = require('fs');
let content = fs.readFileSync('src/server/firebase.ts', 'utf8');

content = content.replace(
  /export async function readFirestoreRestDoc\([^\{]+(?:\{[\s\S]*?)let targetProjectId = config\.projectId;\s+let targetApiKey = config\.apiKey;/g,
  (match) => match + `\n    if (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store') { targetProjectId = 'rummydexcommunity'; targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok'; }`
);

content = content.replace(
  /export async function readFirestoreRestCollection\([^\{]+(?:\{[\s\S]*?)let targetProjectId = config\.projectId;\s+let targetApiKey = config\.apiKey;/g,
  (match) => match + `\n    if (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store') { targetProjectId = 'rummydexcommunity'; targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok'; }`
);

fs.writeFileSync('src/server/firebase.ts', content);
