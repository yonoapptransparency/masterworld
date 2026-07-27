const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const startIdx = code.indexOf('const verifyAdminToken = async (req: express.Request');
const endIdx = code.indexOf('app.post("/api/v1/admin/verify-session"');

if (startIdx !== -1 && endIdx !== -1) {
    const before = code.substring(0, startIdx);
    const after = code.substring(endIdx);
    
    const newCode = `
const verifyAdminToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing verification token.' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken || idToken === 'null' || idToken === 'undefined') {
      return res.status(401).json({ error: 'Unauthorized: Empty session verification token.' });
    }
    
    if (idToken.startsWith('ey')) {
      try {
        let email = "";
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
           const admin = require('firebase-admin');
           const decodedToken = await admin.auth().verifyIdToken(idToken);
           email = decodedToken.email || "";
        } else {
           const config = getRawFirebaseConfig();
           const apiKey = config?.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
           if (apiKey) {
              const clientOrigin = req.headers.origin || req.headers.referer || "http://localhost:3000";
              const lookupRes = await fetch(\`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=\${apiKey}\`, {
                 method: "POST",
                 headers: { 
                     "Content-Type": "application/json",
                     "Referer": clientOrigin,
                     "x-client-origin": clientOrigin
                 },
                 body: JSON.stringify({ idToken }),
              });
              if (lookupRes.ok) {
                 const lookupData = await lookupRes.json();
                 email = lookupData?.users?.[0]?.email || "";
              }
           }
        }
        
        const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
        if (email && email.toLowerCase().trim() === configuredAdminEmail) {
           (req as any).adminUser = { email: email.toLowerCase().trim() };
           return next();
        } else {
           return res.status(403).json({ error: 'Unauthorized: Admin access required.' });
        }
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.' });
      }
    }
    
    // AES Token verification
    try {
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
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
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
    }
};

app.post("/api/v1/admin/login", async (req: any, res: any) => {
  const clientIp = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const rl = _checkAdminRateLimit(clientIp);
  if (!rl.allowed) {
    const waitMins = Math.ceil(((rl.lockedUntil ?? Date.now()) - Date.now()) / 60000);
    return res.status(429).json({ error: \`Too many attempts. Wait \${waitMins} min.\` });
  }
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    _recordAdminFailedAttempt(clientIp);
    return res.status(400).json({ error: "Missing email or password." });
  }
  const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
  const configuredAdminPassword = String(process.env.ADMIN_PASSWORD || "PicPass2026!");
  if (!configuredAdminPassword) return res.status(503).json({ error: "Server misconfiguration: ADMIN_PASSWORD is not set." });
  
  if (email.toLowerCase().trim() === configuredAdminEmail && password === configuredAdminPassword) {
    try {
      const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
      const payload = JSON.stringify({ admin: true, email: configuredAdminEmail, exp: Date.now() + 86400000 });
      const token = safeEncrypt(payload, AES_SECRET);
      return res.json({ token, email: configuredAdminEmail });
    } catch (err) {
      console.error("Login encryption error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
  _recordAdminFailedAttempt(clientIp);
  return res.status(401).json({ error: "Invalid email or password." });
});

app.post("/api/v1/admin/google-login", async (req: any, res: any) => {
  const { idToken } = req.body ?? {};
  if (!idToken) return res.status(400).json({ error: "Missing Firebase ID Token." });
  
  try {
    let email = "";
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
       const admin = require('firebase-admin');
       const decodedToken = await admin.auth().verifyIdToken(idToken);
       email = decodedToken.email || "";
    } else {
       const config = getRawFirebaseConfig();
       const apiKey = config?.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
       if (apiKey) {
          const clientOrigin = req.headers.origin || req.headers.referer || "http://localhost:3000";
          const lookupRes = await fetch(\`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=\${apiKey}\`, {
             method: "POST",
             headers: { 
                 "Content-Type": "application/json",
                 "Referer": clientOrigin,
                 "x-client-origin": clientOrigin
             },
             body: JSON.stringify({ idToken }),
          });
          if (lookupRes.ok) {
             const lookupData = await lookupRes.json();
             email = lookupData?.users?.[0]?.email || "";
          } else {
             console.error("identitytoolkit lookup failed:", await lookupRes.text());
          }
       } else {
          console.error("identitytoolkit lookup failed: No API Key found");
       }
    }
    
    if (!email) {
      return res.status(401).json({ error: "Unauthorized: Could not verify identity token." });
    }
    
    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
    if (email.toLowerCase().trim() !== configuredAdminEmail) {
      return res.status(403).json({ error: \`Unauthorized: \${email} is not configured as an administrator.\` });
    }
    
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";
    const payload = JSON.stringify({ admin: true, email: email.toLowerCase().trim(), exp: Date.now() + 86400000 });
    const token = safeEncrypt(payload, AES_SECRET);
    return res.json({ token, email: email.toLowerCase().trim() });
  } catch (err: any) {
    console.error("Google login backend error:", err);
    return res.status(500).json({ error: "Authentication failed on server: " + (err.message || String(err)) });
  }
});

`;
    
    code = before + newCode + after;
    fs.writeFileSync('server.ts', code);
    console.log("Rewrote auth block in server.ts");
} else {
    console.log("Could not find block boundaries in server.ts");
}
