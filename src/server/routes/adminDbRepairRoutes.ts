import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { verifyAdminToken } from '../middleware/adminAuth';
import { getFirebaseAdminDb } from '../firebase';
import { structureHtmlFragment } from '../../lib/safeHtml';
import { getAesSecret, safeEncrypt, safeDecrypt } from '../vault/vaultCrypto';
import {
  getRawFirebaseConfig,
  adminDbGetWithTimeout,
  adminDbSetWithTimeout,
  writeFirestoreRestDoc,
  deleteFirestoreRestDoc,
  saveMasterAppsList,
  updateLocalBackupSection
} from '../vault/vaultStorage';

export const adminDbRepairRouter = Router();

// 1. Repair DB Endpoint
adminDbRepairRouter.post("/api/v1/admin/repair-db", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    let localData: any = null;

    if (fs.existsSync(staticJsonPath)) {
      try {
        localData = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
      } catch (_) {}
    }

    if (!localData && fs.existsSync(publicBackupPath)) {
      try {
        localData = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
      } catch (_) {}
    }

    if (!localData || (!localData.apps && !localData.mockApps)) {
      return res.status(400).json({ error: "Local backup file could not be read." });
    }

    const apps = localData.apps || localData.mockApps || [];
    const settings = localData.settings || localData.mockSettings || {};
    const news = localData.news || localData.mockNews || [];
    const videos = localData.videos || localData.mockVideos || [];

    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(apps, req.headers.authorization);

    // Save Settings, News, Videos to Firestore
    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await Promise.all([
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('public_settings'), JSON.parse(JSON.stringify(settings)), { merge: true }),
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('news'), { items: JSON.parse(JSON.stringify(news)) }),
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('videos'), { items: JSON.parse(JSON.stringify(videos)) })
        ]);
      }
    } catch (e: any) {
      console.warn("Repair-db auxiliary write failed:", e.message);
    }

    res.json({
      success: true,
      message: `Database repaired with ${apps.length} apps.`,
      firestoreUpdated,
      firestoreError,
      count: apps.length
    });
  } catch (err: any) {
    res.status(500).json({ error: "Repair failed: " + err.message });
  }
});

// 2. Repair Firestore
adminDbRepairRouter.post("/api/v1/admin/repair-firestore", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (!fs.existsSync(staticJsonPath)) {
      return res.status(400).json({ error: "staticData.json not found" });
    }
    const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    const apps = data.apps || data.mockApps || [];
    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(apps, req.headers.authorization);
    res.json({ success: true, firestoreUpdated, firestoreError, count: apps.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Populate Initial DB
adminDbRepairRouter.post("/api/v1/admin/populate-initial-db", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (!fs.existsSync(staticJsonPath)) {
      return res.status(400).json({ error: "staticData.json not found" });
    }
    const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    const apps = data.apps || data.mockApps || [];
    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(apps, req.headers.authorization);
    res.json({ success: true, firestoreUpdated, firestoreError, count: apps.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Rebuild Master DB
adminDbRepairRouter.post("/api/v1/admin/rebuild-master-db", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (!fs.existsSync(staticJsonPath)) {
      return res.status(400).json({ error: "staticData.json not found" });
    }
    const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    const apps = data.apps || data.mockApps || [];
    const settings = data.settings || data.mockSettings || {};
    const news = data.news || data.mockNews || [];
    const videos = data.videos || data.mockVideos || [];

    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(apps, req.headers.authorization);

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await Promise.all([
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('public_settings'), JSON.parse(JSON.stringify(settings)), { merge: true }),
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('news'), { items: JSON.parse(JSON.stringify(news)) }),
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('videos'), { items: JSON.parse(JSON.stringify(videos)) })
        ]);
      }
    } catch (_) {}

    res.json({ success: true, count: apps.length, firestoreUpdated, firestoreError });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Fix DB Links
adminDbRepairRouter.get("/api/v1/admin/fix-db-links", verifyAdminToken, async (req: any, res: any) => {
  try {
    const config = getRawFirebaseConfig();
    if (!config) {
      return res.status(500).json({ error: 'Missing configuration.' });
    }

    const metaResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/apps_meta${config.apiKey ? "?key=" + config.apiKey : ""}`);
    const metaData = await metaResponse.json() as any;
    const numChunks = metaData?.fields?.numChunks?.integerValue ? parseInt(metaData.fields.numChunks.integerValue, 10) : 1;
    
    let apps: any[] = [];
    for (let i = 0; i < numChunks; i++) {
      const chunkResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/apps_chunk_${i}${config.apiKey ? "?key=" + config.apiKey : ""}`);
      const chunkData = await chunkResponse.json() as any;
      if (!chunkData.error && chunkData.fields?.items?.arrayValue?.values) {
        apps = apps.concat(chunkData.fields.items.arrayValue.values.map((v: any) => v.mapValue.fields.id.stringValue));
      }
    }

    const AES_SECRET = getAesSecret();
    const sampleUrls = apps.map(id => ({ id, url: `https://example.com/demo/${id}` }));
    const ciphertext = safeEncrypt(JSON.stringify(sampleUrls), AES_SECRET);

    const idToken = (req.query.token as string) || (req.headers.authorization && req.headers.authorization.split('Bearer ')[1]) || '';
    const updateMaskParams = "updateMask.fieldPaths=encryptedData";
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/secure_links?${updateMaskParams}${config.apiKey ? "&key=" + config.apiKey : ""}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          encryptedData: { stringValue: ciphertext }
        }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Nuclear Reset Firestore
adminDbRepairRouter.post("/api/v1/admin/nuclear-reset-firestore", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (!fs.existsSync(staticJsonPath)) {
      return res.status(400).json({ error: "staticData.json not found" });
    }
    const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    const apps = data.apps || data.mockApps || [];
    const settings = data.settings || data.mockSettings || {};
    const news = data.news || data.mockNews || [];
    const videos = data.videos || data.mockVideos || [];

    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(apps, req.headers.authorization);

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await Promise.all([
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('public_settings'), JSON.parse(JSON.stringify(settings)), { merge: true }),
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('news'), { items: JSON.parse(JSON.stringify(news)) }),
          adminDbSetWithTimeout(adminDb.collection('store_data').doc('videos'), { items: JSON.parse(JSON.stringify(videos)) })
        ]);
      }
    } catch (_) {}

    res.json({ success: true, count: apps.length, firestoreUpdated, firestoreError });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Wipe Empty Placeholders
adminDbRepairRouter.post("/api/v1/admin/wipe-empty-placeholders", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (!fs.existsSync(staticJsonPath)) {
      return res.status(400).json({ error: "staticData.json not found" });
    }
    const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    let apps = data.apps || data.mockApps || [];

    const validApps = apps.filter((a: any) => {
      const name = (a.name || '').trim();
      return name.length > 0 && !name.toLowerCase().includes('placeholder') && !name.toLowerCase().includes('untitled');
    });

    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(validApps, req.headers.authorization);
    res.json({ success: true, originalCount: apps.length, newCount: validApps.length, firestoreUpdated, firestoreError });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Sanitize Descriptions
adminDbRepairRouter.post("/api/v1/admin/sanitize-descriptions", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (!fs.existsSync(staticJsonPath)) {
      return res.status(400).json({ error: "staticData.json not found" });
    }
    const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    let apps = data.apps || data.mockApps || [];

    let modifiedCount = 0;
    const sanitizedApps = apps.map((app: any) => {
      let modified = false;
      const appCopy = { ...app };
      if (appCopy.description_html) {
        const cleaned = structureHtmlFragment(appCopy.description_html);
        if (cleaned !== appCopy.description_html) {
          appCopy.description_html = cleaned;
          modified = true;
        }
      }
      if (appCopy.features_html) {
        const cleaned = structureHtmlFragment(appCopy.features_html);
        if (cleaned !== appCopy.features_html) {
          appCopy.features_html = cleaned;
          modified = true;
        }
      }
      if (modified) modifiedCount++;
      return appCopy;
    });

    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(sanitizedApps, req.headers.authorization);
    res.json({ success: true, modifiedCount, totalApps: sanitizedApps.length, firestoreUpdated, firestoreError });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Clean Bad URLs
adminDbRepairRouter.post("/api/v1/admin/clean-bad-urls", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (!fs.existsSync(staticJsonPath)) {
      return res.status(400).json({ error: "staticData.json not found" });
    }
    const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    let apps = data.apps || data.mockApps || [];

    let cleanedCount = 0;
    const cleanedApps = apps.map((app: any) => {
      const appCopy = { ...app };
      const rawUrl = appCopy.more_information_url || appCopy.encrypted_link || '';
      if (rawUrl && typeof rawUrl === 'string') {
        const trimmed = rawUrl.trim();
        if (trimmed.toLowerCase().includes('mediafire.com') || trimmed.includes('com.rummydex') || trimmed.includes('com.example')) {
          delete appCopy.more_information_url;
          delete appCopy.encrypted_link;
          cleanedCount++;
        }
      }
      delete appCopy.download_url;
      delete appCopy.encrypted_download_url;
      return appCopy;
    });

    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(cleanedApps, req.headers.authorization);
    res.json({ success: true, cleanedCount, totalApps: cleanedApps.length, firestoreUpdated, firestoreError });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Repair Chunk 0
adminDbRepairRouter.post("/api/v1/admin/repair-chunk-0", verifyAdminToken, async (req: any, res: any) => {
  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (!fs.existsSync(staticJsonPath)) {
      return res.status(400).json({ error: "staticData.json not found" });
    }
    const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    const apps = data.apps || data.mockApps || [];
    const chunk0 = apps.slice(0, 25);

    const adminDb = getFirebaseAdminDb();
    let firestoreUpdated = false;
    let firestoreError: string | null = null;

    if (adminDb) {
      try {
        await adminDbSetWithTimeout(adminDb.collection('store_data').doc('apps_chunk_0'), { items: chunk0 });
        firestoreUpdated = true;
      } catch (e: any) {
        firestoreError = e.message;
      }
    }

    if (!firestoreUpdated) {
      const ok = await writeFirestoreRestDoc('apps_chunk_0', { items: chunk0 }, req.headers.authorization);
      if (ok) firestoreUpdated = true;
    }

    res.json({ success: true, chunk0Size: chunk0.length, firestoreUpdated, firestoreError });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
