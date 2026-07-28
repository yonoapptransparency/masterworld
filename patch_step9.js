const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newAes = `function getAesSecret() {
  const secret = process.env.AES_SECRET || AES_SECRET_GLOBAL;
  if (!secret || secret === getFallbackAes()) {
    console.error("CRITICAL: AES_SECRET environment variable is NOT SET. Using insecure fallback key. " +
      "All encrypted URLs will be UNREADABLE if you later set a real AES_SECRET. " +
      "Set AES_SECRET in your environment variables immediately.");
    return getFallbackAes();
  }
  return secret;
}`;

// need to replace `function getAesSecret() { ... }` up to return secret;
code = code.replace(/function getAesSecret\(\) \{[\s\S]*?return secret;\n\}/, newAes);
fs.writeFileSync('server.ts', code);
