const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldVerify = `    if (idToken.startsWith('ey')) {
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
             const lookupRes = await fetch(\`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=\${apiKey}\`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
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
          return res.status(403).json({ error: 'Unauthorized: Admin access required.', message: 'Unauthorized: Admin access required.' });
        }
      } catch (err: any) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.', message: 'Unauthorized: Invalid Firebase token.' });
      }
    }`;

const newVerify = `    if (idToken.startsWith('ey')) {
      try {
        let email = "";
        
        // Use global token cache to prevent latency on every request (Bug 9)
        global.tokenCache = global.tokenCache || new Map();
        if (global.tokenCache.has(idToken)) {
          const cached = global.tokenCache.get(idToken);
          if (Date.now() < cached.expiresAt) {
            email = cached.email;
          } else {
            global.tokenCache.delete(idToken);
          }
        }
        
        if (!email) {
          const adminDb = getFirebaseAdminDb();
          if (adminDb) {
             const admin = require('firebase-admin');
             const decodedToken = await admin.auth().verifyIdToken(idToken);
             email = decodedToken.email || "";
          } else {
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
               }
             }
          }
          if (email) {
            // Cache the successful token for 5 minutes
            global.tokenCache.set(idToken, { email, expiresAt: Date.now() + 5 * 60 * 1000 });
          }
        }

        const configuredAdminEmail = String(process.env.ADMIN_EMAIL || "defentechscholar@gmail.com").toLowerCase();
        if (email && email.toLowerCase().trim() === configuredAdminEmail) {
          (req as any).adminUser = { email: email.toLowerCase().trim() };
          return next();
        } else {
          return res.status(403).json({ error: 'Unauthorized: Admin access required.', message: 'Unauthorized: Admin access required.' });
        }
      } catch (err: any) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Firebase token.', message: 'Unauthorized: Invalid Firebase token.' });
      }
    }`;

code = code.replace(oldVerify, newVerify);
fs.writeFileSync('server.ts', code);
