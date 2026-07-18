const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace mock checks in verifyAdminToken (lines around 888)
content = content.replace(/if \(idToken === 'MOCK_ADMIN_TOKEN'\) \{[\s\S]+?return next\(\);\s*\}/, '');

// Replace mock checks in /api/v1/admin/verify-session (lines around 983)
content = content.replace(/if \(idToken === "MOCK_ADMIN_TOKEN"\) \{[\s\S]+?return res\.json\([^)]+\);\s*\}/, '');

// For endpoints that use `const isMock = ...`, we just set `isMock` to false or remove it
content = content.replace(/const isMock = req\.headers\.authorization\?\.split\('Bearer '\)\[1\] === 'MOCK_ADMIN_TOKEN';/g, 'const isMock = false;');

fs.writeFileSync('server.ts', content);
