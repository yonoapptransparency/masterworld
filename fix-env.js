const fs = require('fs');

function patchFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Fix AES_SECRET
    content = content.replace(/if \(!process\.env\.AES_SECRET\) \{[\s\S]+?else \{/g, `if (!process.env.AES_SECRET) {
  console.error("AES_SECRET not set. Defaulting to 'security' fallback.");
  process.env.AES_SECRET = "security";
  global.AES_SECRET_GLOBAL = process.env.AES_SECRET;
} else {`);

    // Ensure global assignment is correct if it was outside the else
    content = content.replace(/global\.AES_SECRET_GLOBAL = process\.env\.AES_SECRET;/g, `global.AES_SECRET_GLOBAL = process.env.AES_SECRET || "security";`);

    // Fix TOKEN_SECRET and SESSION_SECRET
    content = content.replace(/if \(!process\.env\.TOKEN_SECRET \|\| !process\.env\.SESSION_SECRET\) \{[\s\S]+?const TOKEN_SECRET/g, `if (!process.env.TOKEN_SECRET || !process.env.SESSION_SECRET) {
  console.error("TOKEN/SESSION secrets not set. Defaulting to 'security' fallback.");
  process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || "security";
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || "security";
}
const TOKEN_SECRET`);

    fs.writeFileSync(filename, content);
}

patchFile('server.ts');
patchFile('api/index.ts');
console.log("Env vars patched.");
