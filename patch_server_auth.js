const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const verifyAdminTokenRegex = /const verifyAdminToken = async \(req: express\.Request, res: express\.Response, next: express\.NextFunction\) => \{[\s\S]*?\n  \};\n/g;

const newVerifyAdminToken = `const verifyAdminToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing verification token.' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken || idToken === 'null' || idToken === 'undefined') {
      return res.status(401).json({ error: 'Unauthorized: Empty session verification token.' });
    }
    
    try {
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
      if (!AES_SECRET) return res.status(500).json({ error: 'Service Unavailable: Encryption misconfigured.' });
      
      const decrypted = safeDecrypt(idToken, AES_SECRET);
      if (!decrypted) return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
      
      const payload = JSON.parse(decrypted);
      if (!payload.admin || !payload.email || !payload.exp) {
        return res.status(401).json({ error: 'Unauthorized: Malformed token.' });
      }
      
      if (Date.now() > payload.exp) {
        return res.status(401).json({ error: 'Unauthorized: Session expired.' });
      }
      
      (req as any).adminUser = { email: payload.email };
      return next();
    } catch (err: any) {
      console.error("verifyAdminToken error:", err);
      return res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
    }
  };
`;

code = code.replace(verifyAdminTokenRegex, newVerifyAdminToken);

const verifySessionRegex = /app\.post\("\/api\/v1\/admin\/verify-session", async \(req: any, res: any\) => \{[\s\S]*?\n\}\);\n/g;

const newVerifySession = `app.post("/api/v1/admin/login", async (req: any, res: any) => {
  const ip = String((req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const rl = _checkAdminRL(ip);
  if (!rl.allowed) {
    const waitMin = Math.ceil(((rl.lockedUntil ?? Date.now()) - Date.now()) / 60000);
    return res.status(429).json({ error: \`Too many attempts. Wait \${waitMin} min.\` });
  }

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    _recordAdminFail(ip);
    return res.status(400).json({ error: "Missing email or password." });
  }

  const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "").toLowerCase();
  const configuredAdminPass = String(process.env.ADMIN_PASSWORD || "");

  if (!configuredAdminPass) {
    return res.status(503).json({ error: "Server misconfiguration: ADMIN_PASSWORD is not set." });
  }

  if (email.toLowerCase().trim() === configuredAdminEmail && password === configuredAdminPass) {
    try {
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
      const payload = JSON.stringify({ admin: true, email: configuredAdminEmail, exp: Date.now() + 86400000 });
      const token = safeEncrypt(payload, AES_SECRET);
      return res.json({ token, email: configuredAdminEmail });
    } catch (err: any) {
      console.error("Login encryption error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  _recordAdminFail(ip);
  return res.status(401).json({ error: "Invalid email or password." });
});

app.post("/api/v1/admin/verify-session", async (req: any, res: any) => {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.startsWith("Bearer ")) { return res.status(401).json({ error: "Unauthorized." }); }
  const idToken = authHeader.split("Bearer ")[1];
  
  try {
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
    const decrypted = safeDecrypt(idToken, AES_SECRET);
    if (!decrypted) return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    
    const payload = JSON.parse(decrypted);
    if (!payload.admin || Date.now() > payload.exp) {
      return res.status(401).json({ error: 'Unauthorized: Session expired.' });
    }
    
    return res.json({ ok: true, email: payload.email });
  } catch (err: any) {
    return res.status(401).json({ error: "Service error: " + (err?.message || String(err)) });
  }
});
`;

code = code.replace(verifySessionRegex, newVerifySession);

fs.writeFileSync('server.ts', code);
console.log('patched');
