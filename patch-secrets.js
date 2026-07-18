const fs = require('fs');
let code = fs.readFileSync('scripts/check-secrets.ts', 'utf8');

// Replace the fallback values with empty strings or just rely entirely on process.env
code = code.replace(
  /fs\.writeFileSync\(configPath, JSON\.stringify\(\{[\s\S]*?\}, null, 2\)\);/m,
  `fs.writeFileSync(configPath, JSON.stringify({}, null, 2));`
);

// Fix process.exit(0) for hasSecrets
code = code.replace(
  /if \(hasSecrets\) \{[\s\S]*?process\.exit\(0\);\n\}/m,
  `if (hasSecrets) {\n  console.error('\\n🚨 ERROR: Hardcoded secrets found. Deployment blocked.');\n  process.exit(1);\n}`
);

fs.writeFileSync('scripts/check-secrets.ts', code);
