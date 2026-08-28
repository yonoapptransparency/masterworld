const fs = require('fs');
let content = fs.readFileSync('src/server/firebase.ts', 'utf8');

content = content.replace(/const rawDb = config\.firestoreDatabaseId \|\| config\.databaseId;\n\s+const dbId = \(rawDb && rawDb\.trim\(\) !== ''\) \? rawDb : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';\n\s+let targetProjectId = config\.projectId;\n\s+let targetApiKey = config\.apiKey;\n\s+let dbId = \(config\.firestoreDatabaseId \|\| config\.databaseId \|\| 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a'\);/g, 
  `let targetProjectId = config.projectId;
    let targetApiKey = config.apiKey;
    let dbId = (config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a');`);

// Also fix the case in deleteFirestoreRestDoc
content = content.replace(/const rawDb = config\.firestoreDatabaseId \|\| config\.databaseId;\n\s+const dbId = \(rawDb && rawDb\.trim\(\) !== ''\) \? rawDb : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';\n\s+let targetProjectId = config\.projectId;\n\s+let targetApiKey = config\.apiKey;\n\s+let dbId = \(config\.firestoreDatabaseId \|\| config\.databaseId \|\| 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a'\);/g,
  `let targetProjectId = config.projectId;
    let targetApiKey = config.apiKey;
    let dbId = (config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a');`);

fs.writeFileSync('src/server/firebase.ts', content);
