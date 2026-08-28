const fs = require('fs');
let content = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

content = content.replace(/if \(token && !verifyToken\(token, ip, sid, fingerprint, appId\)\) \{\s*console\.warn\(\`\[SECURITY\] Token verification failed for appId: \$\{appId\}\`\);\s*\}/g, `
  // MANDATORY TOKEN VERIFICATION
  if (!token || !verifyToken(token, ip, sid, fingerprint, appId)) {
    return res.status(404).send("<h1>404 Not Found</h1><p>Content not found.</p>");
  }
`);

fs.writeFileSync('src/server/routes/securityRoutes.ts', content);
