const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/try\s*\{\s*const logFile = path\.join\(process\.cwd\(\), 'server_requests\.log'\);\s*fs\.appendFile\([^}]+\}\s*catch[^{]+\{\}/g, '');

fs.writeFileSync('server.ts', content);
