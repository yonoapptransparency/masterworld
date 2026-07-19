const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix AES_SECRET global block
code = code.replace(
  /declare global \{ var AES_SECRET_GLOBAL: string; \}[\s\S]*?\} else \{[\s\S]*?\}/m,
  `declare global { var AES_SECRET_GLOBAL: string; }
if (!process.env.AES_SECRET) {
  console.error("CRITICAL: AES_SECRET is not set.");
  process.exit(1);
}
global.AES_SECRET_GLOBAL = process.env.AES_SECRET;`
);

// Fix safeDecrypt
code = code.replace(
  /const keys = \[[\s\S]*?\]\.filter\(Boolean\);/m,
  `const keys = [secret, process.env.AES_SECRET].filter(Boolean);`
);

// Fix TOKEN_SECRET and SESSION_SECRET
code = code.replace(
  /process\.env\.TOKEN_SECRET\s*=\s*process\.env\.TOKEN_SECRET\s*\|\|\s*"security";/g,
  `if (!process.env.TOKEN_SECRET) { console.error("CRITICAL: TOKEN_SECRET is not set."); process.exit(1); }`
);
code = code.replace(
  /process\.env\.SESSION_SECRET\s*=\s*process\.env\.SESSION_SECRET\s*\|\|\s*"security";/g,
  `if (!process.env.SESSION_SECRET) { console.error("CRITICAL: SESSION_SECRET is not set."); process.exit(1); }`
);

fs.writeFileSync('server.ts', code);
