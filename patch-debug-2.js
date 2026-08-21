const fs = require('fs');
let code = fs.readFileSync('public-api/index.js', 'utf8');
code = code.replace(
  `const matchedApp = resolveAppSlug(appId, mockApps);`,
  `const matchedApp = resolveAppSlug(appId, mockApps); console.log("Did we match?", !!matchedApp, appId);`
);
fs.writeFileSync('public-api-debug2.js', code);
