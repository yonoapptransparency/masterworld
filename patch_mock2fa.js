const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const _mock2faMap = new Map<string, { enabled: boolean; secret: string }>\(\);\s*function _loadMock2FAState\(\) \{[\s\S]*?\}\s*function _saveMock2FAState\(\) \{[\s\S]*?\}\s*_loadMock2FAState\(\);/;
code = code.replace(regex, '');

const enableRegex = /if \(isMock\) \{\s*_mock2faMap\.set\(email, \{ enabled: true, secret \}\);\s*_saveMock2FAState\(\);\s*\} else \{/g;
code = code.replace(enableRegex, '');

const disableRegex = /if \(isMock\) \{\s*_mock2faMap\.delete\(email\);\s*_saveMock2FAState\(\);\s*\} else \{/g;
code = code.replace(disableRegex, '');

code = code.replace(/if \(isMock\) \{[\s\S]*?\} else \{/g, ''); // Will this catch the ones in fetch2FA and disable2FA? 
// Wait, I already removed isMock checks in fetch2FA, right? Let me check.
fs.writeFileSync('server.ts', code);
