const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');
code = code.replace(
  /const dbId = process\.env\.COMMUNITY_FIREBASE_DATABASE_ID \|\| 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';/g,
  `const dbId = (process.env.COMMUNITY_FIREBASE_DATABASE_ID && process.env.COMMUNITY_FIREBASE_DATABASE_ID !== '(default)') 
    ? process.env.COMMUNITY_FIREBASE_DATABASE_ID 
    : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';`
);
fs.writeFileSync('src/server/firebase.ts', code);
