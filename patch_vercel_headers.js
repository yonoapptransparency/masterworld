const fs = require('fs');
let config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

// Find the global source / (.*)
let globalHeaders = config.headers.find(h => h.source === "/(.*)");
if (globalHeaders) {
  // Filter out existing security headers if any
  globalHeaders.headers = globalHeaders.headers.filter(h => !securityHeaders.map(sh => sh.key).includes(h.key));
  // Add new security headers
  globalHeaders.headers.push(...securityHeaders);
} else {
  config.headers.push({
    source: "/(.*)",
    headers: securityHeaders
  });
}

fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2));
