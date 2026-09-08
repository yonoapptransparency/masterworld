const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');

const target = `const targetProjectId = 'rummydexcommunity';
        const targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';
        const url = \`https://firestore.googleapis.com/v1/projects/\${targetProjectId}/databases/(default)/documents:runQuery?key=\${targetApiKey}\`;`;

const replacement = `const { getRawFirebaseConfig } = require('../firebase');
        const config = getRawFirebaseConfig();
        const targetProjectId = config.projectId;
        const targetApiKey = config.apiKey;
        const dbId = config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
        const url = \`https://firestore.googleapis.com/v1/projects/\${targetProjectId}/databases/\${dbId}/documents:runQuery?key=\${targetApiKey}\`;`;

code = code.replace(target, replacement);

fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
