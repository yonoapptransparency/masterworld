import fs from 'fs';
import path from 'path';
import { getFirebaseAdminDb } from '../firebase';
import { vaultNode } from '../../lib/vaultNode';
import { clearResolvedLinkCache } from '../services/linkService';
import { clearPublicBackupCache } from '../routes/publicApiRoutes';
import { clearSeoCache } from '../../seoHelper';
import { generateAllSitemaps } from '../../lib/sitemapGenerator';
import { getAesSecret, safeEncrypt, safeDecrypt } from './vaultCrypto';

// Cached config to avoid repetitive filesystem reads
let cachedFirebaseConfig: any = null;

export function getRawFirebaseConfig() {
  if (cachedFirebaseConfig) return cachedFirebaseConfig;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      cachedFirebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return cachedFirebaseConfig;
    }
  } catch (e) {
    console.warn("Could not read firebase-applet-config.json:", e);
  }
  return null;
}

export async function adminDbGetWithTimeout<T>(docRef: any, timeoutMs = 4000): Promise<T> {
  const getPromise = docRef.get();
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Firestore Admin SDK operation timed out after ${timeoutMs}ms`)), timeoutMs)
  );
  return Promise.race([getPromise, timeoutPromise]);
}

export async function adminDbSetWithTimeout(docRef: any, data: any, options?: any, timeoutMs = 5000): Promise<any> {
  const setPromise = options ? docRef.set(data, options) : docRef.set(data);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Firestore Admin SDK set timed out after ${timeoutMs}ms`)), timeoutMs)
  );
  return Promise.race([setPromise, timeoutPromise]);
}

export async function readFirestoreRestDoc(docName: string, authToken?: string): Promise<any> {
  const config = getRawFirebaseConfig();
  if (!config || !config.projectId) return null;
  const dbId = (config.firestoreDatabaseId && config.firestoreDatabaseId.trim() !== '') ? config.firestoreDatabaseId : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
  const apiKey = config.apiKey || '';
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/store_data/${docName}${apiKey ? `?key=${apiKey}` : ''}`;
  
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (authToken) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json() as any;
    if (!data.fields) return null;

    const parseValue = (val: any): any => {
      if (val.stringValue !== undefined) return val.stringValue;
      if (val.integerValue !== undefined) return parseInt(val.integerValue, 10);
      if (val.doubleValue !== undefined) return parseFloat(val.doubleValue);
      if (val.booleanValue !== undefined) return val.booleanValue;
      if (val.nullValue !== undefined) return null;
      if (val.arrayValue) {
        return (val.arrayValue.values || []).map(parseValue);
      }
      if (val.mapValue) {
        const obj: any = {};
        const mapFields = val.mapValue.fields || {};
        for (const [k, v] of Object.entries(mapFields)) {
          obj[k] = parseValue(v);
        }
        return obj;
      }
      return null;
    };

    const result: any = {};
    for (const [key, val] of Object.entries(data.fields)) {
      result[key] = parseValue(val);
    }
    return result;
  } catch (err: any) {
    console.warn(`[SERVER] REST fetch failed for ${docName}:`, err.message);
    return null;
  }
}

export async function writeFirestoreRestDoc(docName: string, data: any, authToken?: string, merge = false): Promise<boolean> {
  const config = getRawFirebaseConfig();
  if (!config || !config.projectId) return false;
  const dbId = (config.firestoreDatabaseId && config.firestoreDatabaseId.trim() !== '') ? config.firestoreDatabaseId : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
  const apiKey = config.apiKey || '';

  const encodeValue = (val: any): any => {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'number') {
      return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
    }
    if (typeof val === 'boolean') return { booleanValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map(encodeValue) } };
    }
    if (typeof val === 'object') {
      const fields: any = {};
      for (const [k, v] of Object.entries(val)) {
        fields[k] = encodeValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  };

  const fields: any = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = encodeValue(v);
  }

  let url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/store_data/${docName}`;
  const queryParams: string[] = [];
  if (apiKey) queryParams.push(`key=${apiKey}`);
  if (merge) {
    for (const k of Object.keys(data)) {
      queryParams.push(`updateMask.fieldPaths=${encodeURIComponent(k)}`);
    }
  }
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (authToken) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok;
  } catch (err: any) {
    console.warn(`[SERVER] REST write failed for ${docName}:`, err.message);
    return false;
  }
}

export async function deleteFirestoreRestDoc(docName: string, authToken?: string): Promise<boolean> {
  const config = getRawFirebaseConfig();
  if (!config || !config.projectId) return false;
  const dbId = (config.firestoreDatabaseId && config.firestoreDatabaseId.trim() !== '') ? config.firestoreDatabaseId : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
  const apiKey = config.apiKey || '';
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/store_data/${docName}${apiKey ? `?key=${apiKey}` : ''}`;
  
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (authToken) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { method: 'DELETE', headers, signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch (err: any) {
    console.warn(`[SERVER] REST delete failed for ${docName}:`, err.message);
    return false;
  }
}

export function updateLocalBackupSection(section: 'apps' | 'settings' | 'news' | 'videos', data: any) {
  try {
    let sanitizedData = data;
    if (section === 'settings' && data && typeof data === 'object') {
      const settingsCopy = { ...data };
      // Never leak the server-side turnstile secret key to the public static bundle
      delete settingsCopy.turnstile_secret_key;
      sanitizedData = settingsCopy;
    }
    if (section === 'apps' && Array.isArray(data)) {
      const secret = getAesSecret();
      sanitizedData = data.map((app: any) => {
        const appCopy = { ...app };
        const rawLink = appCopy.more_information_url || appCopy.encrypted_link || '';
        if (rawLink && typeof rawLink === 'string') {
          const trimmed = rawLink.trim();
          if (trimmed.toLowerCase().includes('mediafire.com')) {
            delete appCopy.more_information_url;
            delete appCopy.encrypted_link;
          } else if (trimmed.startsWith('U2FsdGVkX1')) {
            appCopy.more_information_url = trimmed;
            appCopy.encrypted_link = trimmed;
          } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            const enc = safeEncrypt(trimmed, secret);
            appCopy.more_information_url = enc;
            appCopy.encrypted_link = enc;
          } else {
            delete appCopy.more_information_url;
            delete appCopy.encrypted_link;
          }
        } else {
          delete appCopy.more_information_url;
          delete appCopy.encrypted_link;
        }
        delete appCopy.download_url;
        delete appCopy.encrypted_download_url;
        return appCopy;
      });
    }

    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    let current: any = { apps: [], settings: {}, news: [], videos: [] };
    if (fs.existsSync(publicBackupPath)) {
      try { current = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8')); } catch (_) {}
    }
    current[section] = sanitizedData;
    fs.writeFileSync(publicBackupPath, JSON.stringify(current, null, 2), 'utf8');

    // Also sync to staticData.json for fallback consistency
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    let staticCur: any = {};
    if (fs.existsSync(staticJsonPath)) {
      try { staticCur = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8')); } catch (_) {}
    }
    if (section === 'apps') {
      staticCur.mockApps = sanitizedData;
      staticCur.apps = sanitizedData;
    }
    if (section === 'settings') {
      staticCur.mockSettings = sanitizedData;
      staticCur.settings = sanitizedData;
    }
    if (section === 'news') {
      staticCur.mockNews = sanitizedData;
      staticCur.news = sanitizedData;
    }
    if (section === 'videos') {
      staticCur.mockVideos = sanitizedData;
      staticCur.videos = sanitizedData;
    }
    fs.writeFileSync(staticJsonPath, JSON.stringify(staticCur, null, 2), 'utf8');

    const publicApiJsonPath = path.join(process.cwd(), 'public-api/staticData.json');
    if (fs.existsSync(path.dirname(publicApiJsonPath))) {
      fs.writeFileSync(publicApiJsonPath, JSON.stringify(staticCur, null, 2), 'utf8');
    }

    // Automatically regenerate all static sitemaps so search crawlers always see new apps
    try {
      const sitemaps = generateAllSitemaps(current);
      for (const [filename, content] of Object.entries(sitemaps)) {
        const publicSmPath = path.join(process.cwd(), 'public', filename);
        fs.writeFileSync(publicSmPath, content as string, 'utf8');
        const distSmPath = path.join(process.cwd(), 'dist', filename);
        if (fs.existsSync(path.dirname(distSmPath))) {
          fs.writeFileSync(distSmPath, content as string, 'utf8');
        }
      }
    } catch (smErr) {
      console.warn('[SERVER] Auto-regenerate sitemaps warning:', smErr);
    }

    clearPublicBackupCache();
    clearSeoCache();
  } catch (e) {
    console.warn(`[SERVER] Failed to update local backup section ${section}:`, e);
  }
}

export async function getMasterApps(authToken?: string): Promise<any[]> {
  const adminDb = getFirebaseAdminDb();
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
      console.warn("[SERVER] Admin SDK read apps failed in getMasterApps:", fsErr.message);
      firestoreApps = null;
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
    let vaultUrl = (app.id ? vaultNode.getPayload(app.id) : '') || 
                   (app.slug ? vaultNode.getPayload(app.slug) : '') || 
                   (app.serial_number !== undefined && app.serial_number !== null ? vaultNode.getPayload(String(app.serial_number)) : '') || 
                   app.more_information_url || 
                   app.encrypted_link || '';
    if (vaultUrl && typeof vaultUrl === 'string' && vaultUrl.startsWith('U2FsdGVkX1')) {
      try {
        const dec = safeDecrypt(vaultUrl, getAesSecret());
        if (dec) vaultUrl = dec;
      } catch (_) {}
    }
    return {
      ...app,
      more_information_url: vaultUrl
    };
  });
}

export async function getMasterSettings(authToken?: string): Promise<any> {
  const adminDb = getFirebaseAdminDb();
  let firestoreSettings: any = null;
  
  if (adminDb) {
    try {
      const snap = await adminDbGetWithTimeout<any>(adminDb.collection('store_data').doc('public_settings'));
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

export async function saveMasterAppsList(apps: any[], authToken?: string): Promise<{ firestoreUpdated: boolean; firestoreError: string | null }> {
  let firestoreUpdated = false;
  let firestoreError: string | null = null;

  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const CHUNK_SIZE = 25;
      const numChunks = Math.ceil(apps.length / CHUNK_SIZE) || 1;
      const chunkPromises: Promise<any>[] = [];
      for (let i = 0; i < numChunks; i++) {
        const chunk = JSON.parse(JSON.stringify(apps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
        chunk.forEach((app: any) => {
          const targetUrl = app.more_information_url || app.encrypted_link;
          if (targetUrl && typeof targetUrl === 'string') {
            const raw = targetUrl.trim();
            if (raw.startsWith('U2FsdGVkX1')) {
              app.encrypted_link = raw;
            } else if (raw.length > 0) {
              let normalized = raw;
              if (!normalized.toLowerCase().startsWith('http://') && !normalized.toLowerCase().startsWith('https://')) {
                normalized = 'https://' + normalized;
              }
              app.encrypted_link = safeEncrypt(normalized, getAesSecret());
            }
          }
          delete app.more_information_url;
          delete app.encrypted_download_url;
          delete app.download_url;
        });
        chunkPromises.push(adminDbSetWithTimeout(adminDb.collection('store_data').doc(`apps_chunk_${i}`), { items: chunk }));
      }
      await Promise.all(chunkPromises);
      await adminDbSetWithTimeout(adminDb.collection('store_data').doc('apps_meta'), { numChunks, last_updated: new Date().toISOString() });
      firestoreUpdated = true;
    }
  } catch (fsErr: any) {
    firestoreError = fsErr.message;
  }

  if (!firestoreUpdated) {
    try {
      const CHUNK_SIZE = 25;
      const numChunks = Math.ceil(apps.length / CHUNK_SIZE) || 1;
      const chunkPromises: Promise<boolean>[] = [];
      for (let i = 0; i < numChunks; i++) {
        const chunk = JSON.parse(JSON.stringify(apps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
        chunk.forEach((app: any) => {
          const targetUrl = app.more_information_url || app.encrypted_link;
          if (targetUrl && typeof targetUrl === 'string') {
            const raw = targetUrl.trim();
            if (raw.startsWith('U2FsdGVkX1')) {
              app.encrypted_link = raw;
            } else if (raw.length > 0) {
              let normalized = raw;
              if (!normalized.toLowerCase().startsWith('http://') && !normalized.toLowerCase().startsWith('https://')) {
                normalized = 'https://' + normalized;
              }
              app.encrypted_link = safeEncrypt(normalized, getAesSecret());
            }
          }
          delete app.more_information_url;
          delete app.encrypted_download_url;
          delete app.download_url;
        });
        chunkPromises.push(writeFirestoreRestDoc(`apps_chunk_${i}`, { items: chunk }, authToken));
      }
      const results = await Promise.all(chunkPromises);
      const metaResult = await writeFirestoreRestDoc('apps_meta', { numChunks, last_updated: new Date().toISOString() }, authToken);
      if (results.every(r => r === true) && metaResult) {
        firestoreUpdated = true;
        firestoreError = null;
      } else {
        firestoreError = "REST API fallback failed to save all chunks.";
      }
    } catch (restErr: any) {
      firestoreError = restErr.message;
    }
  }

  // Update backup file, staticData.ts, and in-memory cache
  updateLocalBackupSection('apps', apps);

  // Update vault node and files
  const secret = getAesSecret();
  apps.forEach((app: any) => {
    let target = app.more_information_url || app.encrypted_link || '';
    if (target && typeof target === 'string' && target.startsWith('U2FsdGVkX1')) {
      try {
        const dec = safeDecrypt(target, secret);
        if (dec) target = dec;
      } catch (_) {}
    }
    if (target && app.id) vaultNode.setPayload(app.id, target);
    if (target && app.slug) vaultNode.setPayload(app.slug, target);
    if (target && app.serial_number !== undefined && app.serial_number !== null) vaultNode.setPayload(String(app.serial_number), target);
    if (app.id) clearResolvedLinkCache(app.id);
    if (app.slug) clearResolvedLinkCache(app.slug);
    if (app.serial_number !== undefined && app.serial_number !== null) clearResolvedLinkCache(String(app.serial_number));
  });

  return { firestoreUpdated, firestoreError };
}
