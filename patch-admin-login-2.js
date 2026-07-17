const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');
content = content.replace(/let msg = err\.message \|\| 'Authentication failed';/g, `let msg = err.message || 'Authentication failed';
      if (msg === 'Failed to fetch' || msg.includes('network-request-failed')) {
        msg = "Network Connection Blocked: Your browser or an adblocker (e.g., uBlock, Brave Shields) blocked the authentication request. Please disable shields for this preview.";
      }
`);
fs.writeFileSync('src/components/AdminLogin.tsx', content);
