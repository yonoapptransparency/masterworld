const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.get\("\/api\/v1\/admin\/verify", verifyAdminToken, \(req, res\) => \{[\s\S]*?\}\);/m;
const replace = `app.get("/api/v1/admin/verify", verifyAdminToken, (req, res) => {
    console.log("verify endpoint hit successfully! adminUser:", (req as any).adminUser);
    res.json({ authorized: true, user: (req as any).adminUser });
});`;

if (code.match(regex)) {
   code = code.replace(regex, replace);
   fs.writeFileSync('server.ts', code);
   console.log("Patched verify route");
} else {
   console.log("Not found");
}
