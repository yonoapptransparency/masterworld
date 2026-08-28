const fs = require('fs');
let content = fs.readFileSync('src/server/firebase.ts', 'utf8');

// For writeFirestoreRestDoc
content = content.replace(
  /let targetProjectId = config\.projectId;\s+let targetApiKey = config\.apiKey;\s+if \(collectionPath === 'reviews' \|\| collectionPath === 'reports' \|\| collectionPath === 'community_store'\) \{\s+targetProjectId = 'rummydexcommunity';\s+\/\/ Use the known public API key for rummydexcommunity if available, otherwise fallback\s+targetApiKey = process\.env\.COMMUNITY_FIREBASE_API_KEY \|\| 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';\s+\}\s+const rawDb = config\.firestoreDatabaseId \|\| config\.databaseId;\s+const dbId = \(rawDb && rawDb\.trim\(\) !== ''\) \? rawDb : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';/g,
  `let targetProjectId = config.projectId;
    let targetApiKey = config.apiKey;
    let dbId = (config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a');
    if (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store') {
      targetProjectId = 'rummydexcommunity';
      targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';
      dbId = '(default)';
    }`
);

// For deleteFirestoreRestDoc
content = content.replace(
  /let targetProjectId = config\.projectId;\s+let targetApiKey = config\.apiKey;\s+const finalApiKeyParam = targetApiKey \? `\?key=\$\{targetApiKey\}` : '';/g,
  `let targetProjectId = config.projectId;
    let targetApiKey = config.apiKey;
    let dbId = (config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a');
    if (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store') {
      targetProjectId = 'rummydexcommunity';
      targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';
      dbId = '(default)';
    }
    const finalApiKeyParam = targetApiKey ? \`?key=\${targetApiKey}\` : '';`
);

// For readFirestoreRestDoc and Collection, let's fix dbId
content = content.replace(
  /const rawDb = config\.firestoreDatabaseId \|\| config\.databaseId;\s+const dbId = \(rawDb && rawDb\.trim\(\) !== ''\) \? rawDb : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';\s+let targetProjectId = config\.projectId;\s+let targetApiKey = config\.apiKey;\s+if \(collectionPath === 'reviews' \|\| collectionPath === 'reports' \|\| collectionPath === 'community_store'\) \{ targetProjectId = 'rummydexcommunity'; targetApiKey = process\.env\.COMMUNITY_FIREBASE_API_KEY \|\| 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok'; \}/g,
  `let targetProjectId = config.projectId;
    let targetApiKey = config.apiKey;
    let dbId = (config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a');
    if (collectionPath === 'reviews' || collectionPath === 'reports' || collectionPath === 'community_store') {
      targetProjectId = 'rummydexcommunity';
      targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';
      dbId = '(default)';
    }`
);

fs.writeFileSync('src/server/firebase.ts', content);
