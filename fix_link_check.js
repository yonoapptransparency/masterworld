const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(`  app.get("/api/v1/link-check", async (req, res) => {
  // Secured: only returns false or relies on public knowledge, or requires admin.
  // We will just return false here to prevent enumeration.
  res.json({ configured: false });
});ES_SECRET) {`, `  app.get("/api/v1/link-check", async (req, res) => {
  res.json({ configured: false });
});
  try {
    const AES_SECRET = process.env.AES_SECRET;
    if (!AES_SECRET) {`);
fs.writeFileSync('server.ts', content);
