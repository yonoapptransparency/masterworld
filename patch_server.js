const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(filePath, 'utf-8');

if (!content.includes("communityRouter")) {
  content = content.replace(
    "import { adminAuthRouter } from './src/server/routes/adminAuthRoutes';",
    "import { adminAuthRouter } from './src/server/routes/adminAuthRoutes';\nimport { communityRouter } from './src/server/routes/communityRoutes';"
  );
  
  content = content.replace(
    "app.use(adminAuthRouter);",
    "app.use(adminAuthRouter);\n  app.use(communityRouter);"
  );
  
  fs.writeFileSync(filePath, content);
  console.log('Patched server.ts');
} else {
  console.log('Already patched');
}
