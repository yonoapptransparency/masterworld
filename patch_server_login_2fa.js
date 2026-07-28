const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const helper = `async function check2FAForLogin(email: string, code?: string) {
  let isEnabled = false;
  let secret = "";
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const docSnap = await adminDb.collection('admins_2fa').doc(email).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data?.enabled) {
          isEnabled = true;
          secret = data.secret;
        }
      }
    }
  } catch (err) {
    console.error("Failed to check 2FA status:", err);
  }
  
  if (!isEnabled) {
    return { ok: true };
  }
  
  if (!code) {
    return { mfaRequired: true };
  }
  
  const { authenticator } = require('otplib');
  const isValid = authenticator.verify({ token: code, secret });
  if (!isValid) {
    return { ok: false, error: 'Invalid 2FA code.' };
  }
  return { ok: true };
}`;

// inject helper
code = code.replace(/app\.post\("\/api\/v1\/admin\/login",/, helper + '\n\napp.post("/api/v1/admin/login",');

const oldLogin2 = `  if (email.toLowerCase().trim() === configuredAdminEmail && password === configuredAdminPass) {
    try {
      const AES_SECRET = getAesSecret();
      const payload = JSON.stringify({ admin: true, email: configuredAdminEmail, exp: Date.now() + 86400000 });
      const token = safeEncrypt(payload, AES_SECRET);
      return res.json({ token, email: configuredAdminEmail });
    } catch (err: any) {
      console.error("Login encryption error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }`;
const newLogin2 = `  if (email.toLowerCase().trim() === configuredAdminEmail && password === configuredAdminPass) {
    const code = req.body.code;
    const mfaCheck = await check2FAForLogin(configuredAdminEmail, code);
    if (mfaCheck.mfaRequired) {
      return res.json({ mfaRequired: true });
    }
    if (!mfaCheck.ok) {
      return res.status(401).json({ error: mfaCheck.error });
    }

    try {
      const AES_SECRET = getAesSecret();
      const payload = JSON.stringify({ admin: true, email: configuredAdminEmail, exp: Date.now() + 86400000 });
      const token = safeEncrypt(payload, AES_SECRET);
      return res.json({ token, email: configuredAdminEmail });
    } catch (err: any) {
      console.error("Login encryption error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }`;
code = code.replace(oldLogin2, newLogin2);


const oldVerifySession = `      const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
      if (email && email.toLowerCase().trim() === configuredAdminEmail) {
        return res.json({ ok: true, email: email.toLowerCase().trim() });
      } else {`;
const newVerifySession = `      const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
      if (email && email.toLowerCase().trim() === configuredAdminEmail) {
        const code = req.body.code;
        const mfaCheck = await check2FAForLogin(email.toLowerCase().trim(), code);
        if (mfaCheck.mfaRequired) {
          return res.json({ mfaRequired: true });
        }
        if (!mfaCheck.ok) {
          return res.status(401).json({ error: mfaCheck.error });
        }
        return res.json({ ok: true, email: email.toLowerCase().trim(), token: idToken });
      } else {`;
code = code.replace(oldVerifySession, newVerifySession);

fs.writeFileSync('server.ts', code);
