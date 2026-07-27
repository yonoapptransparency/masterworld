const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/catch \(err: any\) \{\n        return res\.status\(401\)\.json\(\{ error: 'Unauthorized: Invalid Firebase token\.', message: 'Unauthorized: Invalid Firebase token\.' \}\);\n      \}/, `catch (err: any) {
        console.error('Firebase token verification error:', err);
        return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.', message: 'Unauthorized: Invalid Firebase token. ' + (err.message || '') });
      }`);

fs.writeFileSync('server.ts', code);
console.log('Patched verifyAdminToken successfully');
