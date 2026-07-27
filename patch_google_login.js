const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/v1\/admin\/google-login", async \(req: any, res: any\) => \{[\s\S]*?\n    const AES_SECRET = process\.env\.AES_SECRET \|\| AES_SECRET_GLOBAL \|\| "fallback_aes_secret";/m;

const replacement = `app.post("/api/v1/admin/google-login", async (req: any, res: any) => {
  const { idToken } = req.body ?? {};
  if (!idToken) {
    console.error("Login failed: Missing idToken");
    return res.status(400).json({ error: "Missing Firebase ID Token." });
  }

  try {
    let email = "";
    
    // Attempt 1: Verify using firebase-admin SDK if available
    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        const admin = require('firebase-admin');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        email = decodedToken.email || "";
      }
    } catch (sdkErr) {
      console.warn("Firebase Admin SDK verification failed, falling back to HTTPS lookup:", sdkErr);
    }

    // Attempt 2: Fallback to Firebase Identity Toolkit HTTPS API
    if (!email) {
      try {
        const config = getRawFirebaseConfig();
        const apiKey = config?.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
        if (apiKey) {
          const lookupRes = await fetch(
            \`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=\${apiKey}\`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            }
          );
          if (lookupRes.ok) {
            const lookupData = await lookupRes.json();
            email = lookupData?.users?.[0]?.email || "";
          } else {
             console.error("identitytoolkit lookup failed:", await lookupRes.text());
          }
        } else {
           console.error("identitytoolkit lookup failed: No API Key found");
        }
      } catch (httpsErr) {
        console.error("Firebase accounts:lookup verification failed:", httpsErr);
      }
    }

    if (!email) {
      console.error("Login failed: Could not verify identity token. idToken begins with:", idToken.substring(0, 15));
      return res.status(401).json({ error: "Unauthorized: Could not verify identity token." });
    }

    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
    console.log("Comparing emails:", email, "with configured:", configuredAdminEmail);
    if (email.toLowerCase().trim() !== configuredAdminEmail) {
      return res.status(403).json({ error: \`Unauthorized: \${email} is not configured as an administrator.\` });
    }

    // Success! Generate custom server AES token
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL || "fallback_aes_secret";`;

if (code.match(regex)) {
   code = code.replace(regex, replacement);
   fs.writeFileSync('server.ts', code);
   console.log("Patched server.ts google-login");
} else {
   console.log("Could not find regex match");
}
