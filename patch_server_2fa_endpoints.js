const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// replace the enable endpoint
const enableRegex = /app\.post\("\/api\/v1\/admin\/2fa\/enable", verifyAdminToken, async \(req: any, res\) => \{[\s\S]*?return res\.json\(\{ success: true \}\);\s*\}\);/;

const newEnable = `app.post("/api/v1/admin/2fa/enable", verifyAdminToken, async (req: any, res) => {
    const email = req.adminUser?.email?.toLowerCase().trim();
    const { secret, code } = req.body || {};

    if (!email || !secret || !code) {
      return res.status(400).json({ error: "Missing required fields (email, secret, code)." });
    }

    if (!verifyTOTPToken(code, secret)) {
      return res.status(400).json({ error: "Invalid verification code. Please make sure your device clock is synchronized and try again." });
    }

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await adminDb.collection('admins_2fa').doc(email).set({
          enabled: true,
          secret: secret
        });
      } else {
         return res.status(503).json({ error: "Service Unavailable: Firebase Admin SDK not configured." });
      }
    } catch (err: any) {
      console.error("Firestore save 2FA exception:", err);
      return res.status(500).json({ error: "Server database write error." });
    }

    return res.json({ success: true });
  });`;

code = code.replace(enableRegex, newEnable);

// replace the disable endpoint
const disableRegex = /app\.post\("\/api\/v1\/admin\/2fa\/disable", verifyAdminToken, async \(req: any, res\) => \{[\s\S]*?return res\.json\(\{ success: true \}\);\s*\}\);/;

const newDisable = `app.post("/api/v1/admin/2fa/disable", verifyAdminToken, async (req: any, res) => {
    const email = req.adminUser?.email?.toLowerCase().trim();
    const { code } = req.body || {};

    if (!email || !code) {
      return res.status(400).json({ error: "Missing required fields (email, code)." });
    }

    let currentSecret = "";
    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        const docSnap = await adminDb.collection('admins_2fa').doc(email).get();
        if (docSnap.exists) {
          const data = docSnap.data();
          if (data?.enabled === true) {
            currentSecret = data?.secret || "";
          }
        }
      }
    } catch (err) {
      console.error("Firestore 2FA config fetch fail on disable:", err);
    }

    if (!currentSecret) {
      return res.status(400).json({ error: "2FA is not currently enabled." });
    }

    if (!verifyTOTPToken(code, currentSecret)) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await adminDb.collection('admins_2fa').doc(email).delete();
      }
    } catch (err) {
      console.error("Firestore delete 2FA exception:", err);
      return res.status(500).json({ error: "Server database delete error." });
    }

    return res.json({ success: true });
  });`;

code = code.replace(disableRegex, newDisable);

// replace the config endpoint
const configRegex = /app\.get\("\/api\/v1\/admin\/2fa\/config", verifyAdminToken, async \(req: any, res\) => \{[\s\S]*?return res\.json\(\{\s*enabled: false,\s*tempSecret,\s*qrCodeUri\s*\}\);\s*\}\s*\}\);/;

const newConfig = `app.get("/api/v1/admin/2fa/config", verifyAdminToken, async (req: any, res) => {
    const email = req.adminUser?.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ error: "Missing admin email." });

    let enabled = false;
    let secret = "";

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        const docSnap = await adminDb.collection('admins_2fa').doc(email).get();
        if (docSnap.exists) {
          const data = docSnap.data();
          enabled = data?.enabled === true;
          secret = data?.secret || "";
        }
      }
    } catch (err) {
      console.error("Error fetching Firestore 2FA config with Admin SDK:", err);
    }

    if (enabled) {
      return res.json({ enabled: true });
    } else {
      const tempSecret = generateTOTPSecret();
      const qrCodeUri = getTOTPURI(email, tempSecret);
      return res.json({
        enabled: false,
        tempSecret,
        qrCodeUri
      });
    }
  });`;

code = code.replace(configRegex, newConfig);


fs.writeFileSync('server.ts', code);
