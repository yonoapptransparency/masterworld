const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLogin = `  const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
  const configuredAdminPass = String(process.env.ADMIN_PASSWORD || "PicPass2026!");
  if (!configuredAdminPass) {
    return res.status(503).json({ error: "Server misconfiguration: ADMIN_PASSWORD is not set." });
  }`;

const newLogin = `  if (!process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: "Server misconfiguration: ADMIN_PASSWORD is not set. Refusing login." });
  }
  const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
  const configuredAdminPass = String(process.env.ADMIN_PASSWORD);
  if (!configuredAdminPass) {
    return res.status(503).json({ error: "Server misconfiguration: ADMIN_PASSWORD is not set." });
  }`;

code = code.replace(oldLogin, newLogin);
fs.writeFileSync('server.ts', code);
