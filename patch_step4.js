const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `app.get("/api/v1/admin/firebase-status", async (req: any, res: any) => {
  const results: any = {
    config: false,
    firestoreRead: false,
    firestoreWrite: false,
    adminSdk: false,
    aesConfigured: false,
    details: {}
  };
  try {
    const config = getRawFirebaseConfig();
    const apiKey = config?.apiKey;
    const projectId = config?.projectId;
    const dbId = config?.firestoreDatabaseId || "(default)";
    results.config = !!(apiKey && projectId);
    results.aesConfigured = !!(process.env.AES_SECRET && process.env.AES_SECRET !== getAesSecret());
    results.details.projectId = projectId;
    results.details.databaseId = dbId;

    if (!apiKey || !projectId) {
      return res.status(503).json({ status: "offline", error: "Missing Firebase credentials", results });
    }

    // Test 1: Admin SDK
    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await adminDb.collection('store_data').doc('_status_check_').set({ ts: Date.now() });
        await adminDb.collection('store_data').doc('_status_check_').delete();
        results.adminSdk = true;
      }
    } catch (e: any) {
      results.details.adminSdkError = e.message;
    }

    // Test 2: REST API read test
    try {
      const readUrl = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/\${dbId}/documents/store_data/public_settings?key=\${apiKey}\`;
      const readRes = await fetch(readUrl);
      results.firestoreRead = readRes.status === 200 || readRes.status === 404; // 404 = doc doesn't exist but connection works
      results.details.restReadStatus = readRes.status;
    } catch (e: any) {
      results.details.restReadError = e.message;
    }

    // Test 3: REST API write test (only if read succeeded)
    if (results.firestoreRead && !results.adminSdk) {
      try {
        const writeUrl = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/\${dbId}/documents/store_data/_write_test_?key=\${apiKey}\`;
        const writeRes = await fetch(writeUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: { ts: { stringValue: new Date().toISOString() } } })
        });
        results.firestoreWrite = writeRes.ok;
        results.details.restWriteStatus = writeRes.status;
        if (!writeRes.ok) {
          const errText = await writeRes.text();
          results.details.restWriteError = errText;
        }
      } catch (e: any) {
        results.details.restWriteError = e.message;
      }
    } else if (results.adminSdk) {
      results.firestoreWrite = true; // Admin SDK write test already proved writes work
    }

    const isLive = results.firestoreRead && (results.firestoreWrite || results.adminSdk);
    const statusText = isLive ? "live" : (results.firestoreRead ? "read_only" : "offline");

    return res.json({
      status: statusText,
      results,
      details: results.details
    });
  } catch (err: any) {
    return res.status(500).json({ status: "offline", error: err.message, results });
  }
});`;

code = code.replace(/app\.get\("\/api\/v1\/admin\/firebase-status", async \(req: any, res: any\) => \{[\s\S]*?\}\);/g, newEndpoint);
fs.writeFileSync('server.ts', code);
