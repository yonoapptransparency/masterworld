const fs = require('fs');
const file = 'public-api/index.js';
let code = fs.readFileSync(file, 'utf8');

const backupCode = `
    // Tier 5.5: public_backup.json
    try {
      const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
      if (fs.existsSync(backupPath)) {
        const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const mockApps = data.apps || [];
        const matchedApp = resolveAppSlug(appId, mockApps);
        if (matchedApp) {
          const url = extractUrlFromApp(matchedApp);
          if (url) return respondWithUrl(url);
        }
      }
    } catch(e) {}
`;

if (!code.includes('Tier 5.5: public_backup.json')) {
    code = code.replace(
        `// Tier 6: High-Availability Failover`,
        backupCode + '\n    // Tier 6: High-Availability Failover'
    );
}

// Fix FIREBASE_PROJECT_ID
if (!code.includes("if (FIREBASE_PROJECT_ID && FIREBASE_PROJECT_ID.includes('!'))")) {
    code = code.replace(
        `const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;`,
        `let FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0825832493';
    if (FIREBASE_PROJECT_ID && FIREBASE_PROJECT_ID.includes('!')) FIREBASE_PROJECT_ID = 'gen-lang-client-0825832493';`
    );
}

fs.writeFileSync(file, code);
console.log("Patched public-api/index.js");
