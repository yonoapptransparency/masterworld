const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target3 = `      if (adminDb) {
         const admin = require('firebase-admin');
         const decodedToken = await admin.auth().verifyIdToken(idToken);
         email = decodedToken.email || "";
      } else {`;
    
const replacement3 = `      if (adminDb) {
         const admin = require('firebase-admin');
         try {
           const decodedToken = await admin.auth().verifyIdToken(idToken);
           email = decodedToken.email || "";
         } catch (e) {
           console.warn("verifyIdToken failed, falling back to REST");
         }
      }
      if (!email) {`;

code = code.split(target3).join(replacement3);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully part 2");
