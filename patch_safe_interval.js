const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldInterval = `setInterval(() => {
  const now = Date.now();
  for (const [ip, e] of _adminLoginMap.entries()) {
    if (e.lockedUntil < now && now - e.windowStart > _ADMIN_WIN * 2) _adminLoginMap.delete(ip);
  }
}, 2 * 60 * 60 * 1000);`;

code = code.replace(oldInterval, '');
fs.writeFileSync('server.ts', code);
