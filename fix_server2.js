const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const verifySessionRoute = `
  app.post("/api/v1/admin/verify-session", async (req, res) => {
    const ip = ((req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
    const ua = (req.headers["user-agent"] || "") as string;
    const now = new Date().toISOString();
    
    const rl = checkAdminRateLimit(ip);
    if (!rl.allowed) {
      const waitMin = Math.ceil(((rl.lockedUntil || Date.now()) - Date.now()) / 60000);
      return res.status(429).json({ error: \`Too many attempts. Wait \${waitMin} min.\` });
    }
    
    const authHeader = req.headers.authorization as string;
    if (!authHeader?.startsWith("Bearer ")) {
      recordFailedAdminAttempt(ip);
      return res.status(401).json({ error: "Unauthorized." });
    }
    
    const idToken = authHeader.split("Bearer ")[1];
    const { email, cfToken } = req.body || {};
    
    try {
      const config = getRawFirebaseConfig();
      if (!config) return res.status(503).json({ error: "Service unavailable." });
      
      if (process.env.CF_TURNSTILE_SECRET) {
        const passed = await verifyTurnstile(cfToken || "", ip);
        if (!passed) {
          recordFailedAdminAttempt(ip);
          await logAdminAttempt(config, { email: email || "unknown", ip, userAgent: ua, success: false, reason: "turnstile_failed", timestamp: now });
          return res.status(403).json({ error: "Security check failed." });
        }
      }
      
      const lookupRes = await fetch(\`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=\${config.apiKey}\`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }),
      });
      if (!lookupRes.ok) { recordFailedAdminAttempt(ip); return res.status(401).json({ error: "Unauthorized." }); }
      
      const user = (await lookupRes.json() as any).users?.[0];
      if (!user || !user.emailVerified) {
        recordFailedAdminAttempt(ip);
        await logAdminAttempt(config, { email: email || "unknown", ip, userAgent: ua, success: false, reason: "not_verified", timestamp: now });
        return res.status(401).json({ error: "Email not verified." });
      }
      
      const userEmail = (user.email || "").toLowerCase();
      const configuredAdmin = (process.env.ADMIN_EMAIL || "").toLowerCase();
      let isAdmin = configuredAdmin && userEmail === configuredAdmin;
      
      if (!isAdmin) {
        try {
          const r1 = await fetch(\`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${config.firestoreDatabaseId || "(default)"}/documents/admins/\${user.localId}\${config.apiKey ? "?key=" + config.apiKey : ""}\`, { headers: { Authorization: \`Bearer \${idToken}\` } });
          if (r1.ok) isAdmin = true;
          if (!isAdmin) {
            const r2 = await fetch(\`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${config.firestoreDatabaseId || "(default)"}/documents/admins/\${encodeURIComponent(userEmail)}\${config.apiKey ? "?key=" + config.apiKey : ""}\`, { headers: { Authorization: \`Bearer \${idToken}\` } });
            if (r2.ok) isAdmin = true;
          }
        } catch (_) { recordFailedAdminAttempt(ip); return res.status(503).json({ error: "Service unavailable." }); }
      }
      
      if (!isAdmin) {
        recordFailedAdminAttempt(ip);
        await logAdminAttempt(config, { email: userEmail, ip, userAgent: ua, success: false, reason: "not_admin", timestamp: now });
        return res.status(403).json({ error: "Access denied." });
      }
      
      clearAdminAttempts(ip);
      await logAdminAttempt(config, { email: userEmail, ip, userAgent: ua, success: true, reason: "login_success", timestamp: now });
      return res.json({ success: true, email: userEmail, uid: user.localId });
    } catch (_) {
      recordFailedAdminAttempt(ip);
      return res.status(500).json({ error: "Service error." });
    }
  });

  app.post("/api/v1/admin/login",`;

if (!code.includes('/api/v1/admin/verify-session')) {
  code = code.replace(/app\.post\("\/api\/v1\/admin\/login",/g, verifySessionRoute);
  fs.writeFileSync('server.ts', code);
}
