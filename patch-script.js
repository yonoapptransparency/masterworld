const fs = require('fs');

let content = fs.readFileSync('src/server/routes/adminVaultRoutes.ts', 'utf8');

const appsFirestoreLogic = `
async function getMasterApps(authToken?: string): Promise<any[]> {
  const adminDb = getFirebaseAdminDb();
  let firestoreApps: any[] | null = null;
  
  if (adminDb) {
    try {
      const appsMetaSnap = await adminDb.collection('store_data').doc('apps_meta').get();
      const numChunks = appsMetaSnap.exists ? (appsMetaSnap.data()?.numChunks || 1) : 1;
      firestoreApps = [];
      for (let i = 0; i < numChunks; i++) {
        const chunkSnap = await adminDb.collection('store_data').doc(\`apps_chunk_\${i}\`).get();
        if (chunkSnap.exists && Array.isArray(chunkSnap.data()?.items)) {
          firestoreApps.push(...chunkSnap.data().items);
        }
      }
    } catch (fsErr: any) {
      console.warn("[SERVER] Admin SDK read apps failed in getMasterApps:", fsErr.message);
      firestoreApps = null;
    }
  }
  
  if (!firestoreApps) {
    firestoreApps = [];
    const appsMetaDoc = await readFirestoreRestDoc('apps_meta', authToken);
    const numChunks = appsMetaDoc?.numChunks || 1;
    for (let i = 0; i < numChunks; i++) {
      const chunkDoc = await readFirestoreRestDoc(\`apps_chunk_\${i}\`, authToken);
      if (chunkDoc?.items && Array.isArray(chunkDoc.items)) {
        firestoreApps.push(...chunkDoc.items);
      }
    }
  }

  let apps = firestoreApps && firestoreApps.length > 0 ? firestoreApps : [];

  if (apps.length === 0) {
    // Fallback to local
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');

    if (fs.existsSync(publicBackupPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
        if (Array.isArray(data.apps) && data.apps.length > 0) apps = data.apps;
      } catch (_) {}
    }

    if (apps.length === 0 && fs.existsSync(staticJsonPath)) {
      try {
        const sj = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
        apps = sj.apps || sj.mockApps || [];
      } catch (_) {}
    }

    if (apps.length === 0) {
      try {
        const staticDataObj = require('../../lib/staticData');
        const lightFallbackObj = require('../../lib/lightFallback');
        apps = staticDataObj.mockApps || lightFallbackObj.mockApps || [];
      } catch (_) {}
    }
  }

  return apps.map((app: any) => {
    const vaultUrl = (app.id ? vaultNode.getPayload(app.id) : '') || (app.slug ? vaultNode.getPayload(app.slug) : '') || app.more_information_url || '';
    return {
      ...app,
      more_information_url: vaultUrl
    };
  });
}
`;

const settingsFirestoreLogic = `
async function getMasterSettings(authToken?: string): Promise<any> {
  const adminDb = getFirebaseAdminDb();
  let firestoreSettings: any = null;
  
  if (adminDb) {
    try {
      const snap = await adminDb.collection('store_data').doc('public_settings').get();
      if (snap.exists) {
        firestoreSettings = snap.data() || {};
      }
    } catch (fsErr: any) {
      console.warn("[SERVER] Admin SDK read settings failed in getMasterSettings:", fsErr.message);
    }
  }
  
  if (!firestoreSettings) {
    const restSettings = await readFirestoreRestDoc('public_settings', authToken);
    if (restSettings && typeof restSettings === 'object') {
      firestoreSettings = restSettings;
    }
  }

  let settings = firestoreSettings || {};

  if (Object.keys(settings).length === 0) {
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');

    if (fs.existsSync(publicBackupPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
        if (data.settings && typeof data.settings === 'object') settings = data.settings;
      } catch (_) {}
    }

    if (Object.keys(settings).length === 0 && fs.existsSync(staticJsonPath)) {
      try {
        const sj = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
        settings = sj.settings || sj.mockSettings || {};
      } catch (_) {}
    }

    if (Object.keys(settings).length === 0) {
      try {
        const staticDataObj = require('../../lib/staticData');
        const lightFallbackObj = require('../../lib/lightFallback');
        settings = staticDataObj.mockSettings || lightFallbackObj.mockSettings || {};
      } catch (_) {}
    }
  }
  return settings;
}
`;

content = content.replace(/function getMasterApps\(\): any\[\] \{[\s\S]*?return apps\.map\(\(app: any\) => \{[\s\S]*?\}\);\n\}/, appsFirestoreLogic.trim());
content = content.replace(/function getMasterSettings\(\): any \{[\s\S]*?return settings;\n\}/, settingsFirestoreLogic.trim());

fs.writeFileSync('src/server/routes/adminVaultRoutes.ts', content, 'utf8');
