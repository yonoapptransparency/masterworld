const fs = require('fs');
let content = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

content = content.replace(/const difficulty = "0000"; \/\/ PoW check \(\~50ms execution\)/g, 'const difficulty = "00000"; // PoW check (~1000ms execution, very high security)');

// Add missing HTTP response headers in the JSON route
content = content.replace(/if \(isJson\) \{/g, `
  // Add strict security headers directly to the secure endpoint
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (isJson) {`);

fs.writeFileSync('src/server/routes/securityRoutes.ts', content);
