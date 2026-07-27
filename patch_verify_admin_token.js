const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const verifyAdminToken = async \(req: express\.Request, res: express\.Response, next: express\.NextFunction\) => \{[\s\S]*?\n\};/m;

if (code.match(regex)) {
   let oldCode = code.match(regex)[0];
   let newCode = oldCode.replace(
      /return res\.status\(403\)\.json\(\{ error: 'Unauthorized: Admin access required\.', message: 'Unauthorized: Admin access required\.' \}\);/,
      "console.error('verifyAdminToken failed 403. email:', email, 'configured:', configuredAdminEmail);\n          return res.status(403).json({ error: 'Unauthorized: Admin access required.', message: 'Unauthorized: Admin access required.' });"
   );
   newCode = newCode.replace(
      /return res\.status\(401\)\.json\(\{ error: 'Unauthorized: Invalid Firebase token\.', message: 'Unauthorized: Invalid Firebase token\.' \}\);/,
      "console.error('verifyAdminToken failed 401 invalid firebase token:', err);\n        return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.', message: 'Unauthorized: Invalid Firebase token.' });"
   );
   code = code.replace(oldCode, newCode);
   fs.writeFileSync('server.ts', code);
   console.log("Patched verifyAdminToken");
} else {
   console.log("Not found");
}
