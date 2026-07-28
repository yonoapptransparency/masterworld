const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const response = await fetch\(`https:\/\/firestore\.googleapis\.com\/v1\/projects\/\$\{projectId\}\/databases\/\$\{dbId\}\/documents\/store_data\?key=\$\{apiKey\}`\);([\s\S]*?)return res\.status\(500\)\.json\(\{ status: "offline", error: err\.message \}\);\n    \}\n  \}\);/;

const newCode = `let adminSdkLive = false;
        try {
            const adminDb = getFirebaseAdminDb();
            if (adminDb) {
                await adminDb.collection('store_data').doc('apps_meta').get();
                adminSdkLive = true;
            }
        } catch (e) {
            adminSdkLive = false;
        }
        
        const response = await fetch(\`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/\${dbId}/documents/store_data?key=\${apiKey}\`);
        
        if (adminSdkLive) {
            return res.json({ status: "live", details: "Admin SDK Connected" });
        } else if (response.status === 200) {
            return res.json({ status: "live", details: "REST Connected (No Admin SDK)" });
        } else if (response.status === 403) {
            return res.status(403).json({ status: "permission_denied", error: "Permission Denied (Admin SDK misconfigured)" });
        }
        return res.status(503).json({ status: "offline", error: "Firestore unreachable" });
    } catch (err: any) {
        return res.status(500).json({ status: "offline", error: err.message });
    }
  });`;

code = code.replace(regex, newCode);
fs.writeFileSync('server.ts', code);
