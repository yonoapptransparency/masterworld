const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const helper = `
let hasWarnedAes = false;
function getAesSecret() {
  const secret = process.env.AES_SECRET || AES_SECRET_GLOBAL;
  if (!secret) {
    if (!hasWarnedAes) {
      console.warn("WARNING: AES_SECRET environment variable is NOT SET. Using an insecure fallback key. DO NOT DO THIS IN PRODUCTION.");
      hasWarnedAes = true;
    }
    return "fallback_aes_secret";
  }
  return secret;
}
`;

code = code.replace(/const AES_SECRET = process\.env\.AES_SECRET \|\| AES_SECRET_GLOBAL \|\| "fallback_aes_secret";/g, "const AES_SECRET = getAesSecret();");
// insert helper before it's used
code = code.replace("function safeEncrypt", helper + "function safeEncrypt");
fs.writeFileSync('server.ts', code);
