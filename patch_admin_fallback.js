const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(adminDb\) \{\n\s*const admin = require\('firebase-admin'\);\n\s*const decodedToken = await admin\.auth\(\)\.verifyIdToken\(idToken\);\n\s*email = decodedToken\.email \|\| "";\n\s*\} else \{\n\s*const config = getRawFirebaseConfig\(\);[\s\S]*?\}\n\s*\}/;

const replacement = `let verifiedViaAdmin = false;
        if (adminDb) {
           try {
             const admin = require('firebase-admin');
             const decodedToken = await admin.auth().verifyIdToken(idToken);
             email = decodedToken.email || "";
             verifiedViaAdmin = true;
           } catch (adminErr) {
             console.warn("admin.auth().verifyIdToken failed, falling back to REST API", adminErr);
           }
        }
        
        if (!verifiedViaAdmin) {
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
               throw new Error("REST API lookup failed: " + await lookupRes.text());
             }
           } else {
             throw new Error("No API key available for fallback token verification.");
           }
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log('Patched fallback authentication');
