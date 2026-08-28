const fs = require('fs');
let content = fs.readFileSync('src/server/firebase.ts', 'utf8');

// Restore the community override
content = content.replace(
  `    // Removed hardcoded 'rummydexcommunity' overrides so reviews go to primary db`,
  `    if (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store') {
      targetProjectId = 'rummydexcommunity';
      // Use the known public API key for rummydexcommunity if available, otherwise fallback
      targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';
    }`
);

fs.writeFileSync('src/server/firebase.ts', content);
