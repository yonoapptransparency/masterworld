const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We need to replace the try blocks in verifyAdminToken, google-login, and verify-session.
// Or we can just create a helper function for token verification and replace all 3 places to use it.

const helper = `
async function verifyFirebaseToken(idToken: string) {
  let email = "";
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const admin = require('firebase-admin');
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      email = decodedToken.email || "";
      if (email) return email;
    }
  } catch (err) {
    console.warn("firebase-admin verifyIdToken failed, falling back to identitytoolkit...", err.message);
  }
  
  // Fallback to REST API
  try {
    const config = getRawFirebaseConfig();
    const apiKey = config?.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    if (apiKey) {
      const lookupRes = await fetch(\`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=\${apiKey}\`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
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
  } catch (err) {
    console.error("REST API verification failed:", err);
  }
  return email;
}
`;

// Insert the helper near the top of the file, maybe before verifyAdminToken
const verifyAdminTokenIdx = code.indexOf('const verifyAdminToken =');
if (verifyAdminTokenIdx !== -1) {
  code = code.substring(0, verifyAdminTokenIdx) + helper + '\n' + code.substring(verifyAdminTokenIdx);
}

// Now replace the inline verification in verifyAdminToken
const verifyTokenRegex1 = /if \(idToken\.startsWith\('ey'\)\) \{[\s\S]*?catch \(err\) \{[\s\S]*?return res\.status\(401\)\.json\(\{ error: 'Unauthorized: Invalid Firebase token\.' \}\);\s*\}\s*\}/;
const replacement1 = `if (idToken.startsWith('ey')) {
      const email = await verifyFirebaseToken(idToken);
      if (email) {
        const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
        if (email.toLowerCase().trim() === configuredAdminEmail) {
           (req as any).adminUser = { email: email.toLowerCase().trim() };
           return next();
        } else {
           return res.status(403).json({ error: 'Unauthorized: Admin access required.' });
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.' });
      }
    }`;
code = code.replace(verifyTokenRegex1, replacement1);

// Now replace the inline verification in google-login
const googleLoginRegex = /try \{[\s\S]*?let email = "";[\s\S]*?const adminDb = getFirebaseAdminDb\(\);[\s\S]*?if \(!email\) \{[\s\S]*?return res\.status\(401\)\.json\(\{ error: "Unauthorized: Could not verify identity token\." \}\);[\s\S]*?\}/;
const replacement2 = `try {
    const email = await verifyFirebaseToken(idToken);
    
    if (!email) {
      return res.status(401).json({ error: "Unauthorized: Could not verify identity token." });
    }`;
code = code.replace(googleLoginRegex, replacement2);

// Finally replace the inline verification in verify-session
const verifySessionRegex = /if \(idToken\.startsWith\('ey'\)\) \{[\s\S]*?try \{[\s\S]*?let email = "";[\s\S]*?const adminDb = getFirebaseAdminDb\(\);[\s\S]*?catch \(err\) \{[\s\S]*?return res\.status\(401\)\.json\(\{ error: 'Unauthorized: Invalid Firebase token\.' \}\);\s*\}\s*\}/;
const replacement3 = `if (idToken.startsWith('ey')) {
    const email = await verifyFirebaseToken(idToken);
    if (email) {
      const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
      if (email.toLowerCase().trim() === configuredAdminEmail) {
        return res.json({ ok: true, email: email.toLowerCase().trim() });
      } else {
        return res.status(403).json({ error: 'Unauthorized: Admin access required.' });
      }
    } else {
      return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.' });
    }
  }`;
code = code.replace(verifySessionRegex, replacement3);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with verifyFirebaseToken helper.");
