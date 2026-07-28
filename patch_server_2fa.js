const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldGet2fa = `      const config = getRawFirebaseConfig();
      if (config && config.apiKey) {
        try {
          const url = \`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${config.firestoreDatabaseId}/documents/admins_2fa/\${encodeURIComponent(email)}\${config.apiKey ? "?key=" + config.apiKey : ""}\`;
          const mfaRes = await fetch(url);
          if (mfaRes.ok) {
            const mfaDoc = await mfaRes.json() as any;
            enabled = mfaDoc.fields?.enabled?.booleanValue === true;
            secret = mfaDoc.fields?.secret?.stringValue || "";
          }
        } catch (err) {
          console.error("Error fetching Firestore 2FA config:", err);
        }
      }`;

const newGet2fa = `      try {
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
      }`;
code = code.replace(oldGet2fa, newGet2fa);


const oldSet2fa = `      const config = getRawFirebaseConfig();
      if (!config || !config.apiKey) {
        return res.status(503).json({ error: "Service Unavailable: Firebase is not configured." });
      }
      try {
        const url = \`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${config.firestoreDatabaseId}/documents/admins_2fa/\${encodeURIComponent(email)}\${config.apiKey ? "?key=" + config.apiKey : ""}\`;
        const saveRes = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              enabled: { booleanValue: true },
              secret: { stringValue: secret }
            }
          })
        });
        if (!saveRes.ok) {
          console.error("Failed to save 2FA config to Firestore:", await saveRes.text());
          return res.status(500).json({ error: "Failed to save 2FA configuration to database." });
        }
      } catch (err) {
        console.error("Firestore save 2FA exception:", err);
        return res.status(500).json({ error: "Server database configuration save error." });
      }`;

const newSet2fa = `      try {
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
          await adminDb.collection('admins_2fa').doc(email).set({
            enabled: true,
            secret: secret
          });
        } else {
           return res.status(503).json({ error: "Service Unavailable: Firebase Admin SDK not configured." });
        }
      } catch (err) {
        console.error("Firestore save 2FA exception:", err);
        return res.status(500).json({ error: "Server database configuration save error." });
      }`;
code = code.replace(oldSet2fa, newSet2fa);


const oldDisableCheck = `      const config = getRawFirebaseConfig();
      if (!config || !config.apiKey) {
        return res.status(503).json({ error: "Service Unavailable." });
      }
      try {
        const url = \`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${config.firestoreDatabaseId}/documents/admins_2fa/\${encodeURIComponent(email)}\${config.apiKey ? "?key=" + config.apiKey : ""}\`;
        const mfaRes = await fetch(url);
        if (mfaRes.ok) {
          const mfaDoc = await mfaRes.json() as any;
          if (mfaDoc.fields?.enabled?.booleanValue === true) {
            currentSecret = mfaDoc.fields?.secret?.stringValue || "";
          }
        }
      } catch (err) {
        console.error("Firestore 2FA config fetch fail on disable:", err);
      }`;
const newDisableCheck = `      try {
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
      }`;
code = code.replace(oldDisableCheck, newDisableCheck);

const oldDisableDelete = `      const config = getRawFirebaseConfig();
      if (config && config.apiKey) {
        try {
          const url = \`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${config.firestoreDatabaseId}/documents/admins_2fa/\${encodeURIComponent(email)}\${config.apiKey ? "?key=" + config.apiKey : ""}\`;
          const deleteRes = await fetch(url, { method: "DELETE" });
          if (!deleteRes.ok) {
            console.error("Failed to delete 2FA config from Firestore:", await deleteRes.text());
            return res.status(500).json({ error: "Failed to delete 2FA from database." });
          }
        } catch (err) {
          console.error("Firestore delete 2FA exception:", err);
          return res.status(500).json({ error: "Server database delete error." });
        }
      }`;

const newDisableDelete = `      try {
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
          await adminDb.collection('admins_2fa').doc(email).delete();
        }
      } catch (err) {
        console.error("Firestore delete 2FA exception:", err);
        return res.status(500).json({ error: "Server database delete error." });
      }`;
code = code.replace(oldDisableDelete, newDisableDelete);

fs.writeFileSync('server.ts', code);
