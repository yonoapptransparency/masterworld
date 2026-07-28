const fs = require('fs');
let code = fs.readFileSync('src/services/adminAuthService.ts', 'utf8');

const oldDirect = `    // Step 3: Backend Direct Login Fallback (/api/v1/admin/login)
    const directRes = await fetch("/api/v1/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const directData = await directRes.json().catch(() => ({}));

    if (directRes.ok && directData.token) {`;

const newDirect = `    // Step 3: Backend Direct Login Fallback (/api/v1/admin/login)
    const directRes = await fetch("/api/v1/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code }),
    });

    const directData = await directRes.json().catch(() => ({}));
    
    if (directData?.mfaRequired) {
      return { ok: true, mfaRequired: true };
    }

    if (directRes.ok && directData.token) {`;
code = code.replace(oldDirect, newDirect);
fs.writeFileSync('src/services/adminAuthService.ts', code);
