const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

// Replace fetch("/api/v1/admin/verify-session") with error catching
content = content.replace(/const verifyRes = await fetch\("\/api\/v1\/admin\/verify-session", \{/g, `
      let verifyRes;
      try {
        verifyRes = await fetch("/api/v1/admin/verify-session", {
`);

content = content.replace(/body: JSON\.stringify\(\{ email \}\),\n      \}\);/g, `body: JSON.stringify({ email }),
        });
      } catch (fetchErr: any) {
        console.error("verify-session fetch error:", fetchErr);
        throw new Error("Backend API Connection Failed: " + fetchErr.message + ". Please disable adblockers or check your connection.");
      }
`);

fs.writeFileSync('src/components/AdminLogin.tsx', content);
