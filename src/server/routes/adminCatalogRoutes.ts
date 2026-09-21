import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { verifyAdminToken } from '../middleware/adminAuth';
import { getFirebaseAdminDb } from '../firebase';
import { vaultNode } from '../../lib/vaultNode';
import { clearResolvedLinkCache } from '../services/linkService';
import { clearPublicBackupCache } from './publicApiRoutes';
import { clearSeoCache } from '../../seoHelper';
import { getAesSecret, safeEncrypt, safeDecrypt } from '../vault/vaultCrypto';
import {
  adminDbGetWithTimeout,
  adminDbSetWithTimeout,
  readFirestoreRestDoc,
  writeFirestoreRestDoc,
  updateLocalBackupSection,
  getMasterApps,
  getMasterSettings,
  saveMasterAppsList
} from '../vault/vaultStorage';

export const adminCatalogRouter = Router();

// Master unified Admin data endpoint (100% Firebase-Native)
adminCatalogRouter.get("/api/v1/admin/data", verifyAdminToken, async (req: any, res: any) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  let apps: any[] = [];
  let settings: any = {};
  let news: any[] = [];
  let videos: any[] = [];
  let source = 'firebase';
  let quotaExceeded = false;

  const adminDb = getFirebaseAdminDb();
  const authToken = req.headers.authorization;

  // 1. Fetch apps
  try {
    let firestoreApps: any[] | null = null;
    if (adminDb) {
      try {
        const appsMetaSnap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('apps_meta'));
        const numChunks = appsMetaSnap.exists ? (appsMetaSnap.data()?.numChunks || 1) : 1;
        firestoreApps = [];
        for (let i = 0; i < numChunks; i++) {
          const chunkSnap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc(`apps_chunk_${i}`));
          if (chunkSnap.exists && Array.isArray(chunkSnap.data()?.items)) {
            firestoreApps.push(...chunkSnap.data().items);
          }
        }
      } catch (fsErr: any) {
        console.warn("[SERVER] Admin SDK read apps failed, falling back to REST:", fsErr.message);
        firestoreApps = null;
        if (String(fsErr.message).includes('429') || String(fsErr.message).includes('Quota')) {
          quotaExceeded = true;
        }
      }
    }
    
    if (!firestoreApps) {
      firestoreApps = [];
      const appsMetaDoc = await readFirestoreRestDoc('apps_meta', authToken);
      const numChunks = appsMetaDoc?.numChunks || 1;
      for (let i = 0; i < numChunks; i++) {
        const chunkDoc = await readFirestoreRestDoc(`apps_chunk_${i}`, authToken);
        if (chunkDoc?.items && Array.isArray(chunkDoc.items)) {
          firestoreApps.push(...chunkDoc.items);
        }
      }
    }
    
    if (firestoreApps.length > 0) {
      apps = firestoreApps;
    }
  } catch (err: any) {
    console.warn("[SERVER] Error reading apps from Firestore:", err.message);
  }

  // 2. Fetch settings
  try {
    let firestoreSettings: any = null;
    if (adminDb) {
      try {
        const snap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('public_settings'));
        if (snap.exists) {
          firestoreSettings = snap.data() || {};
        }
      } catch (fsErr: any) {
        console.warn("[SERVER] Admin SDK read settings failed, falling back to REST:", fsErr.message);
        firestoreSettings = null;
      }
    }
    
    if (!firestoreSettings) {
      const restSettings = await readFirestoreRestDoc('public_settings', authToken);
      if (restSettings && typeof restSettings === 'object') {
        firestoreSettings = restSettings;
      }
    }
    
    if (firestoreSettings) {
      settings = firestoreSettings;
    }
  } catch (err: any) {
    console.warn("[SERVER] Error reading settings from Firestore:", err.message);
  }

  // 3. Fetch news
  try {
    let firestoreNews: any[] | null = null;
    if (adminDb) {
      try {
        const snap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('news'));
        if (snap.exists && Array.isArray(snap.data()?.items)) {
          firestoreNews = snap.data().items;
        }
      } catch (fsErr: any) {
        console.warn("[SERVER] Admin SDK read news failed, falling back to REST:", fsErr.message);
        firestoreNews = null;
      }
    }
    
    if (!firestoreNews) {
      const restNews = await readFirestoreRestDoc('news', authToken);
      if (restNews?.items && Array.isArray(restNews.items)) {
        firestoreNews = restNews.items;
      }
    }
    
    if (firestoreNews) {
      news = firestoreNews;
    }
  } catch (err: any) {
    console.warn("[SERVER] Error reading news from Firestore:", err.message);
  }

  // 4. Fetch videos
  try {
    let firestoreVideos: any[] | null = null;
    if (adminDb) {
      try {
        const snap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('videos'));
        if (snap.exists && Array.isArray(snap.data()?.items)) {
          firestoreVideos = snap.data().items;
        }
      } catch (fsErr: any) {
        console.warn("[SERVER] Admin SDK read videos failed, falling back to REST:", fsErr.message);
        firestoreVideos = null;
      }
    }
    
    if (!firestoreVideos) {
      const restVideos = await readFirestoreRestDoc('videos', authToken);
      if (restVideos?.items && Array.isArray(restVideos.items)) {
        firestoreVideos = restVideos.items;
      }
    }
    
    if (firestoreVideos) {
      videos = firestoreVideos;
    }
  } catch (err: any) {
    console.warn("[SERVER] Error reading videos from Firestore:", err.message);
  }

  // If Firestore read yielded empty items, fallback gracefully to existing backup data so user data is never lost
  if (apps.length === 0) {
    const fallbackApps = await getMasterApps(req.headers.authorization);
    if (fallbackApps.length > 0) {
      apps = fallbackApps;
      source = 'local_backup';
    }
  }

  if (!settings || Object.keys(settings).length === 0) {
    try {
      const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
      if (fs.existsSync(staticJsonPath)) {
        const sj = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
        settings = sj.settings || sj.mockSettings || {};
      }
    } catch (_) {}
  }

  if (news.length === 0) {
    try {
      const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
      if (fs.existsSync(staticJsonPath)) {
        const sj = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
        news = sj.news || sj.mockNews || [];
      }
    } catch (_) {}
  }

  if (videos.length === 0) {
    try {
      const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
      if (fs.existsSync(staticJsonPath)) {
        const sj = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
        videos = sj.videos || sj.mockVideos || [];
      }
    } catch (_) {}
  }

  // Attach vault links to apps
  const dataSecret = getAesSecret();
  const mappedApps = apps.map((a: any) => {
    let link = (a.id ? vaultNode.getPayload(a.id) : '') || (a.slug ? vaultNode.getPayload(a.slug) : '') || a.more_information_url || a.encrypted_link || '';
    if (link && typeof link === 'string' && link.startsWith('U2FsdGVkX1')) {
      try {
        const dec = safeDecrypt(link, dataSecret);
        if (dec) link = dec;
      } catch (_) {}
    }
    return {
      ...a,
      more_information_url: link
    };
  });

  return res.json({
    success: true,
    source,
    quotaExceeded,
    apps: mappedApps,
    settings,
    news,
    videos
  });
});

// 1. APPS (Lazy Load & Dedicated Save)
adminCatalogRouter.get("/api/v1/admin/apps", verifyAdminToken, async (req: any, res: any) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const appsMetaSnap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('apps_meta'));
      const numChunks = appsMetaSnap.exists ? (appsMetaSnap.data()?.numChunks || 1) : 1;
      let apps: any[] = [];
      for (let i = 0; i < numChunks; i++) {
        const chunkSnap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc(`apps_chunk_${i}`));
        if (chunkSnap.exists) {
          apps.push(...(chunkSnap.data()?.items || []));
        }
      }
      if (apps.length > 0) {
        // Attach vault links
        const secret = getAesSecret();
        const mapped = apps.map((a: any) => {
          let link = (a.id ? vaultNode.getPayload(a.id) : '') || (a.slug ? vaultNode.getPayload(a.slug) : '') || a.more_information_url || a.encrypted_link || '';
          if (link && typeof link === 'string' && link.startsWith('U2FsdGVkX1')) {
            try {
              const dec = safeDecrypt(link, secret);
              if (dec) link = dec;
            } catch (_) {}
          }
          return {
            ...a,
            more_information_url: link
          };
        });
        return res.json({ success: true, apps: mapped, source: 'firestore' });
      }
    }

    // Secondary fallback: Try authenticated / public REST read
    const authToken = req.headers.authorization;
    const appsMetaDoc = await readFirestoreRestDoc('apps_meta', authToken);
    const numChunks = appsMetaDoc?.numChunks || 1;
    let restApps: any[] = [];
    for (let i = 0; i < numChunks; i++) {
      const chunkDoc = await readFirestoreRestDoc(`apps_chunk_${i}`, authToken);
      if (chunkDoc?.items && Array.isArray(chunkDoc.items)) {
        restApps.push(...chunkDoc.items);
      }
    }
    if (restApps.length > 0) {
      const secret = getAesSecret();
      const mapped = restApps.map((a: any) => {
        let link = (a.id ? vaultNode.getPayload(a.id) : '') || (a.slug ? vaultNode.getPayload(a.slug) : '') || a.more_information_url || a.encrypted_link || '';
        if (link && typeof link === 'string' && link.startsWith('U2FsdGVkX1')) {
          try {
            const dec = safeDecrypt(link, secret);
            if (dec) link = dec;
          } catch (_) {}
        }
        return {
          ...a,
          more_information_url: link
        };
      });
      return res.json({ success: true, apps: mapped, source: 'firestore' });
    }

    throw new Error("Firestore returned empty apps");
  } catch (err: any) {
    console.warn("[SERVER] GET /admin/apps failed:", err.message);
    const fallbackApps = await getMasterApps(req.headers.authorization);
    return res.json({ success: true, apps: fallbackApps, source: 'local_backup', warning: err.message });
  }
});

// Single App Read
adminCatalogRouter.get("/api/v1/admin/app/:id", verifyAdminToken, async (req: any, res: any) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const { id } = req.params;
    const masterApps = await getMasterApps(req.headers.authorization);
    const app = masterApps.find((a: any) => a.id === id || a.slug === id);
    if (!app) {
      return res.status(404).json({ error: "App not found." });
    }
    res.json({ success: true, app });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read app: " + err.message });
  }
});

// Single App Atomic Save (Surgical - Protects all other apps from erosion)
adminCatalogRouter.post("/api/v1/admin/app/save", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { app } = req.body;
    if (!app || typeof app !== 'object') {
      return res.status(400).json({ error: "App object is required." });
    }

    const appId = String(app.id || '').trim();
    const appName = String(app.name || '').trim() || 'Untitled App';
    const appSlug = String(app.slug || '').trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-') || appName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const inputUrl = String(app.more_information_url || '').trim();

    const masterApps = await getMasterApps(req.headers.authorization);
    let existingIndex = -1;

    if (appId) {
      existingIndex = masterApps.findIndex((a: any) => a.id === appId);
    }
    if (existingIndex === -1 && appSlug) {
      existingIndex = masterApps.findIndex((a: any) => a.slug === appSlug);
    }

    let mergedApp: any = {};
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = masterApps[existingIndex];
      mergedApp = {
        ...existing,
        ...app,
        id: existing.id || appId || Math.random().toString(36).substring(2, 9),
        name: appName,
        slug: appSlug,
        more_information_url: inputUrl || existing.more_information_url || '',
        created_at: existing.created_at || now,
        updated_at: now
      };
      masterApps[existingIndex] = mergedApp;
    } else {
      mergedApp = {
        ...app,
        id: appId || Math.random().toString(36).substring(2, 9),
        name: appName,
        slug: appSlug,
        category: app.category || 'General',
        rating: typeof app.rating === 'number' ? app.rating : 4.8,
        safety_status: app.safety_status || 'Verified',
        serial_number: app.serial_number || (masterApps.length + 1),
        more_information_url: inputUrl,
        created_at: now,
        updated_at: now
      };
      masterApps.push(mergedApp);
    }

    // Update link vault specifically for this app
    const actualId = mergedApp.id;
    const actualSlug = mergedApp.slug;
    const secret = getAesSecret();

    if (inputUrl && typeof inputUrl === 'string' && !inputUrl.toLowerCase().includes('mediafire.com')) {
      const trimmedUrl = inputUrl.trim();
      let normalized = trimmedUrl;
      if (!normalized.startsWith('U2FsdGVkX1') && !normalized.toLowerCase().startsWith('http://') && !normalized.toLowerCase().startsWith('https://')) {
        normalized = 'https://' + normalized;
      }
      const plaintext = normalized.startsWith('U2FsdGVkX1') ? (safeDecrypt(normalized, secret) || normalized) : normalized;
      const encrypted = normalized.startsWith('U2FsdGVkX1') ? normalized : safeEncrypt(plaintext, secret);

      mergedApp.more_information_url = plaintext;
      mergedApp.encrypted_link = encrypted;

      vaultNode.setPayload(actualId, plaintext);
      if (actualSlug) vaultNode.setPayload(actualSlug, plaintext);

      // Save encrypted link to persistent vault in Firestore
      try {
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
          const writePromises = [
            adminDb.collection('sec_vault').doc(actualId).set({ payload: encrypted, last_updated: now })
          ];
          if (actualSlug) {
            writePromises.push(adminDb.collection('sec_vault').doc(actualSlug).set({ payload: encrypted, last_updated: now }));
          }
          await Promise.all(writePromises);
        }
      } catch (vaultErr) {
        console.warn("[SERVER] Could not write single link to Firestore sec_vault:", vaultErr);
      }

      // Update local secure_vault.json
      try {
        const vaultPath = path.join(process.cwd(), 'src/server/secure_vault.json');
        let vaultItems: any[] = [];
        if (fs.existsSync(vaultPath)) {
          try { vaultItems = JSON.parse(fs.readFileSync(vaultPath, 'utf8')); } catch (_) {}
        }
        const existingIdx = vaultItems.findIndex((it: any) => it.id === actualId || (actualSlug && it.slug === actualSlug));
        const vaultEntry = {
          id: actualId,
          slug: actualSlug || '',
          name: mergedApp.name,
          more_information_url: encrypted,
          encrypted_link: encrypted
        };
        if (existingIdx >= 0) {
          vaultItems[existingIdx] = vaultEntry;
        } else {
          vaultItems.push(vaultEntry);
        }
        fs.writeFileSync(vaultPath, JSON.stringify(vaultItems, null, 2), 'utf8');
      } catch (jsonErr) {
        console.warn("[SERVER] Could not update local secure_vault.json:", jsonErr);
      }
    } else if (!inputUrl) {
      // Admin deliberately cleared the link
      vaultNode.setPayload(actualId, '');
      if (actualSlug) vaultNode.setPayload(actualSlug, '');

      try {
        const adminDb = getFirebaseAdminDb();
        if (adminDb) {
          await adminDb.collection('sec_vault').doc(actualId).delete().catch(() => {});
          if (actualSlug) await adminDb.collection('sec_vault').doc(actualSlug).delete().catch(() => {});
        }
      } catch (_) {}

      try {
        const vaultPath = path.join(process.cwd(), 'src/server/secure_vault.json');
        if (fs.existsSync(vaultPath)) {
          let vaultItems = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
          vaultItems = vaultItems.filter((it: any) => it.id !== actualId && it.slug !== actualSlug);
          fs.writeFileSync(vaultPath, JSON.stringify(vaultItems, null, 2), 'utf8');
        }
      } catch (_) {}
    }

    // Purge cache for instant live update
    clearResolvedLinkCache(actualId);
    if (actualSlug) clearResolvedLinkCache(actualSlug);

    // Save master apps list atomically
    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(masterApps, req.headers.authorization);

    res.json({
      success: true,
      message: firestoreUpdated ? `App "${mergedApp.name}" saved to Cloud Firestore.` : `App "${mergedApp.name}" saved locally (Firestore: ${firestoreError || 'offline'}).`,
      app: mergedApp,
      totalCount: masterApps.length,
      firestoreUpdated
    });
  } catch (err: any) {
    console.error("Single app save error:", err);
    res.status(500).json({ error: "Failed to save app: " + err.message });
  }
});

// Single App Atomic Delete
adminCatalogRouter.post("/api/v1/admin/app/delete", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "App ID is required." });
    }

    const masterApps = await getMasterApps(req.headers.authorization);
    const filteredApps = masterApps.filter((a: any) => a.id !== id && a.slug !== id);

    if (filteredApps.length === masterApps.length) {
      return res.json({ success: true, message: "App not found or already deleted.", totalCount: masterApps.length });
    }

    // Clear from vault
    try {
      const deletedApp = masterApps.find((a: any) => a.id === id || a.slug === id);
      vaultNode.setPayload(id, '');
      if (deletedApp?.slug) vaultNode.setPayload(deletedApp.slug, '');

      clearResolvedLinkCache(id);
      if (deletedApp?.slug) clearResolvedLinkCache(deletedApp.slug);

      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await adminDb.collection('sec_vault').doc(id).delete().catch(() => {});
        if (deletedApp?.slug) {
          await adminDb.collection('sec_vault').doc(deletedApp.slug).delete().catch(() => {});
        }
      }

      const vaultPath = path.join(process.cwd(), 'src/server/secure_vault.json');
      if (fs.existsSync(vaultPath)) {
        let vaultItems = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
        vaultItems = vaultItems.filter((it: any) => it.id !== id && (!deletedApp?.slug || it.slug !== deletedApp.slug));
        fs.writeFileSync(vaultPath, JSON.stringify(vaultItems, null, 2), 'utf8');
      }
    } catch (_) {}

    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(filteredApps, req.headers.authorization);

    res.json({
      success: true,
      message: firestoreUpdated ? "App deleted from Cloud Firestore." : `App deleted locally (Firestore: ${firestoreError || 'offline'}).`,
      totalCount: filteredApps.length,
      firestoreUpdated
    });
  } catch (err: any) {
    console.error("Single app delete error:", err);
    res.status(500).json({ error: "Failed to delete app: " + err.message });
  }
});

// Section-Level Atomic Settings Save (Categories, Banners, FAQs, Developers, Quick Links, General)
adminCatalogRouter.post("/api/v1/admin/settings/save-section", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { section, data } = req.body;
    if (!section || data === undefined) {
      return res.status(400).json({ error: "section and data are required." });
    }

    const masterSettings = await getMasterSettings(req.headers.authorization);
    const now = new Date().toISOString();

    if (section === 'general' || section === 'seo') {
      if (typeof data === 'object' && data !== null) {
        Object.assign(masterSettings, data);
      }
    } else if (['categories', 'banners', 'quick_links', 'website_faqs', 'developers'].includes(section)) {
      masterSettings[section] = Array.isArray(data) ? data : (data?.items || []);
    } else {
      masterSettings[section] = data;
    }
    masterSettings.last_updated = now;

    let firestoreUpdated = false;
    let firestoreError: string | null = null;

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await adminDbSetWithTimeout(adminDb.collection('store_data').doc('public_settings'), JSON.parse(JSON.stringify(masterSettings)), { merge: true });
        firestoreUpdated = true;
      }
    } catch (fsErr: any) {
      firestoreError = fsErr.message;
    }

    if (!firestoreUpdated) {
      try {
        const authToken = req.headers.authorization;
        const writeOk = await writeFirestoreRestDoc('public_settings', JSON.parse(JSON.stringify(masterSettings)), authToken, true);
        if (writeOk) {
          firestoreUpdated = true;
          firestoreError = null;
        } else {
          firestoreError = "REST API fallback failed";
        }
      } catch (restErr: any) {
        firestoreError = restErr.message;
      }
    }

    updateLocalBackupSection('settings', masterSettings);

    res.json({
      success: true,
      message: firestoreUpdated ? `Section "${section}" saved to Cloud Firestore.` : `Section "${section}" saved locally (Firestore: ${firestoreError || 'offline'}).`,
      section,
      settings: masterSettings,
      firestoreUpdated
    });
  } catch (err: any) {
    console.error("Save section error:", err);
    res.status(500).json({ error: "Failed to save settings section: " + err.message });
  }
});

adminCatalogRouter.post("/api/v1/admin/save-apps", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { apps } = req.body;
    if (!Array.isArray(apps)) {
      return res.status(400).json({ error: "Apps array is required." });
    }

    const { firestoreUpdated, firestoreError } = await saveMasterAppsList(apps, req.headers.authorization);

    res.json({
      success: true,
      message: firestoreUpdated ? "Apps saved to Cloud Firestore." : `Apps saved locally (Firestore: ${firestoreError || 'offline'}).`,
      firestoreUpdated,
      count: apps.length
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save apps: " + err.message });
  }
});

// 2. SETTINGS (Lazy Load & Dedicated Save - includes FAQs, Categories, Developers, Banners, Quick Links)
adminCatalogRouter.get("/api/v1/admin/settings", verifyAdminToken, async (req: any, res: any) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const snap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('public_settings'));
      if (snap.exists) {
        return res.json({ success: true, settings: snap.data(), source: 'firestore' });
      }
    }
    
    // REST fallback
    const authToken = req.headers.authorization;
    const restSettings = await readFirestoreRestDoc('public_settings', authToken);
    if (restSettings && Object.keys(restSettings).length > 0) {
      return res.json({ success: true, settings: restSettings, source: 'firestore' });
    }

    throw new Error("Firestore public_settings doc empty or uninitialized");
  } catch (err: any) {
    console.warn("[SERVER] GET /admin/settings failed:", err.message);
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    let fallbackSettings: any = {};
    if (fs.existsSync(publicBackupPath)) {
      try { fallbackSettings = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8')).settings || {}; } catch (_) {}
    }
    return res.json({ success: true, settings: fallbackSettings, source: 'local_backup', warning: err.message });
  }
});

adminCatalogRouter.post("/api/v1/admin/save-settings", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: "Valid settings object is required." });
    }

    let firestoreUpdated = false;
    let firestoreError: string | null = null;

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await adminDbSetWithTimeout(adminDb.collection('store_data').doc('public_settings'), JSON.parse(JSON.stringify(settings)), { merge: true });
        firestoreUpdated = true;
      }
    } catch (fsErr: any) {
      firestoreError = fsErr.message;
    }

    if (!firestoreUpdated) {
      try {
        const authToken = req.headers.authorization;
        const writeOk = await writeFirestoreRestDoc('public_settings', JSON.parse(JSON.stringify(settings)), authToken, true);
        if (writeOk) {
          firestoreUpdated = true;
          firestoreError = null;
        } else {
          firestoreError = "REST API fallback failed";
        }
      } catch (restErr: any) {
        firestoreError = restErr.message;
      }
    }

    updateLocalBackupSection('settings', settings);

    res.json({
      success: true,
      message: firestoreUpdated ? "Settings saved to Cloud Firestore." : `Settings saved locally (Firestore: ${firestoreError || 'offline'}).`,
      firestoreUpdated
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save settings: " + err.message });
  }
});

// 3. NEWS (Lazy Load & Dedicated Save)
adminCatalogRouter.get("/api/v1/admin/news", verifyAdminToken, async (req: any, res: any) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const snap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('news'));
      if (snap.exists) {
        return res.json({ success: true, news: snap.data()?.items || [], source: 'firestore' });
      }
    }

    // REST fallback
    const authToken = req.headers.authorization;
    const restNews = await readFirestoreRestDoc('news', authToken);
    if (restNews?.items && Array.isArray(restNews.items)) {
      return res.json({ success: true, news: restNews.items, source: 'firestore' });
    }

    throw new Error("Firestore news doc empty or uninitialized");
  } catch (err: any) {
    console.warn("[SERVER] GET /admin/news failed:", err.message);
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    let fallbackNews: any[] = [];
    if (fs.existsSync(publicBackupPath)) {
      try { fallbackNews = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8')).news || []; } catch (_) {}
    }
    return res.json({ success: true, news: fallbackNews, source: 'local_backup', warning: err.message });
  }
});

adminCatalogRouter.post("/api/v1/admin/save-news", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { news } = req.body;
    if (!Array.isArray(news)) {
      return res.status(400).json({ error: "News array is required." });
    }

    let firestoreUpdated = false;
    let firestoreError: string | null = null;

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await adminDbSetWithTimeout(adminDb.collection('store_data').doc('news'), { items: JSON.parse(JSON.stringify(news)) });
        firestoreUpdated = true;
      }
    } catch (fsErr: any) {
      firestoreError = fsErr.message;
    }

    if (!firestoreUpdated) {
      try {
        const authToken = req.headers.authorization;
        const writeOk = await writeFirestoreRestDoc('news', { items: JSON.parse(JSON.stringify(news)) }, authToken);
        if (writeOk) {
          firestoreUpdated = true;
          firestoreError = null;
        } else {
          firestoreError = "REST API fallback failed";
        }
      } catch (restErr: any) {
        firestoreError = restErr.message;
      }
    }

    updateLocalBackupSection('news', news);

    res.json({
      success: true,
      message: firestoreUpdated ? "News saved to Cloud Firestore." : `News saved locally (Firestore: ${firestoreError || 'offline'}).`,
      firestoreUpdated
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save news: " + err.message });
  }
});

// 4. VIDEOS (Lazy Load & Dedicated Save)
adminCatalogRouter.get("/api/v1/admin/videos", verifyAdminToken, async (req: any, res: any) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const snap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('videos'));
      if (snap.exists) {
        return res.json({ success: true, videos: snap.data()?.items || [], source: 'firestore' });
      }
    }

    // REST fallback
    const authToken = req.headers.authorization;
    const restVideos = await readFirestoreRestDoc('videos', authToken);
    if (restVideos?.items && Array.isArray(restVideos.items)) {
      return res.json({ success: true, videos: restVideos.items, source: 'firestore' });
    }

    throw new Error("Firestore videos doc empty or uninitialized");
  } catch (err: any) {
    console.warn("[SERVER] GET /admin/videos failed:", err.message);
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    let fallbackVideos: any[] = [];
    if (fs.existsSync(publicBackupPath)) {
      try { fallbackVideos = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8')).videos || []; } catch (_) {}
    }
    return res.json({ success: true, videos: fallbackVideos, source: 'local_backup', warning: err.message });
  }
});

adminCatalogRouter.post("/api/v1/admin/save-videos", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { videos } = req.body;
    if (!Array.isArray(videos)) {
      return res.status(400).json({ error: "Videos array is required." });
    }

    let firestoreUpdated = false;
    let firestoreError: string | null = null;

    try {
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        await adminDbSetWithTimeout(adminDb.collection('store_data').doc('videos'), { items: JSON.parse(JSON.stringify(videos)) });
        firestoreUpdated = true;
      }
    } catch (fsErr: any) {
      firestoreError = fsErr.message;
    }

    if (!firestoreUpdated) {
      try {
        const authToken = req.headers.authorization;
        const writeOk = await writeFirestoreRestDoc('videos', { items: JSON.parse(JSON.stringify(videos)) }, authToken);
        if (writeOk) {
          firestoreUpdated = true;
          firestoreError = null;
        } else {
          firestoreError = "REST API fallback failed";
        }
      } catch (restErr: any) {
        firestoreError = restErr.message;
      }
    }

    updateLocalBackupSection('videos', videos);

    res.json({
      success: true,
      message: firestoreUpdated ? "Videos saved to Cloud Firestore." : `Videos saved locally (Firestore: ${firestoreError || 'offline'}).`,
      firestoreUpdated
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save videos: " + err.message });
  }
});

// Sync local data to JSON backup and regenerate sitemaps
adminCatalogRouter.post("/api/v1/admin/sync-local", verifyAdminToken, async (req: any, res: any) => {
  try {
    const { apps, settings, news, videos } = req.body;
    const backupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');

    let current: any = {};
    if (fs.existsSync(backupPath)) {
      try {
        current = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      } catch (_) {}
    } else if (fs.existsSync(staticJsonPath)) {
      try {
        current = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
      } catch (_) {}
    }

    if (Array.isArray(apps)) current.apps = apps;
    if (settings && typeof settings === 'object') current.settings = settings;
    if (Array.isArray(news)) current.news = news;
    if (Array.isArray(videos)) current.videos = videos;
    current.last_updated = new Date().toISOString();

    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(current, null, 2), 'utf8');
    fs.writeFileSync(staticJsonPath, JSON.stringify(current, null, 2), 'utf8');

    if (req.body.catalogStats && typeof req.body.catalogStats === 'object') {
      try {
        const catStatsPath = path.join(process.cwd(), 'src/lib/communityCatalogStats.json');
        fs.writeFileSync(catStatsPath, JSON.stringify(req.body.catalogStats, null, 2), 'utf8');
      } catch (_) {}
    }

    // Update in-memory public caches
    clearPublicBackupCache();
    clearSeoCache();

    // Regenerate sitemaps
    try {
      const { generateAllSitemaps } = require('../../lib/sitemapGenerator');
      const sitemaps = generateAllSitemaps(current);
      const publicDir = path.join(process.cwd(), 'public');
      const distDir = path.join(process.cwd(), 'dist');
      for (const [filename, xmlContent] of Object.entries(sitemaps)) {
        if (fs.existsSync(publicDir)) {
          fs.writeFileSync(path.join(publicDir, filename), xmlContent as string, 'utf8');
        }
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, filename), xmlContent as string, 'utf8');
        }
      }
    } catch (smErr) {
      console.warn('[SERVER] Could not regenerate sitemaps during sync-local:', smErr);
    }

    res.json({
      success: true,
      message: "Local static files, sitemaps, and public caches synchronized successfully.",
      totalApps: current.apps?.length || 0,
      timestamp: current.last_updated
    });
  } catch (err: any) {
    console.error("[SERVER] sync-local error:", err);
    res.status(500).json({ error: "Failed to sync local data: " + err.message });
  }
});
