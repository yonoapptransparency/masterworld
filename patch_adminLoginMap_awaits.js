const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const rl = _checkAdminRL\(ip\);/g, 'const rl = await _checkAdminRL(ip);');
code = code.replace(/_recordAdminFail\(ip\);/g, 'await _recordAdminFail(ip);');

fs.writeFileSync('server.ts', code);
