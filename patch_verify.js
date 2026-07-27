const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `        if (adminDb) {
           const admin = require('firebase-admin');
           const decodedToken = await admin.auth().verifyIdToken(idToken);
           email = decodedToken.email || "";
        } else {`;
        
const replacement1 = `        if (adminDb) {
           const admin = require('firebase-admin');
           try {
             const decodedToken = await admin.auth().verifyIdToken(idToken);
             email = decodedToken.email || "";
           } catch (e) {
             console.warn("verifyIdToken failed, falling back to REST");
           }
        }
        if (!email) {`;

const target2 = `    if (adminDb) {
       const admin = require('firebase-admin');
       const decodedToken = await admin.auth().verifyIdToken(idToken);
       email = decodedToken.email || "";
    } else {`;
    
const replacement2 = `    if (adminDb) {
       const admin = require('firebase-admin');
       try {
         const decodedToken = await admin.auth().verifyIdToken(idToken);
         email = decodedToken.email || "";
       } catch (e) {
         console.warn("verifyIdToken failed, falling back to REST");
       }
    }
    if (!email) {`;

code = code.split(target1).join(replacement1);
code = code.split(target2).join(replacement2);

// Check if any occurrences are left
if (code.includes('await admin.auth().verifyIdToken(idToken);\n           email = decodedToken.email || "";\n        } else {')) {
   console.log("Still found target1");
}

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully");
