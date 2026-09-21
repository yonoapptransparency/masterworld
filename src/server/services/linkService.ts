import path from 'path';
import fs from 'fs';
import { safeDecrypt, getAesSecret } from '../crypto';
import { ENCRYPTED_LINKS } from '../../lib/secureVault';
import { vaultNode } from '../../lib/vaultNode';
import { getFirebaseAdminDb } from '../firebase';
import { fetchStoreData } from '../../seoHelper';

interface CacheEntry {
  url: string;
  timestamp: number;
}

const resolvedLinkCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes fast in-memory cache

function isValidTargetUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 8) return false;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  if (trimmed.includes('127.0.0.1') || trimmed.includes('localhost') || trimmed.includes('0.0.0.0')) return false;
  if (trimmed.toLowerCase().includes('mediafire.com')) return false;
  // Critical: prevent circular loops pointing back to the verification gateway itself
  const lower = trimmed.toLowerCase();
  if (lower.includes('rummydex.com/moreinfo/') || lower.includes('rummydex.com/info/') || lower.includes('rummydex.com/gateway/')) {
    return false;
  }
  return true;
}

function searchVaultObject(obj: any, searchKeys: string[], secret: string): string {
  if (!obj) return '';

  // 1. If payload is an Array of app/link items (like secure_vault.json)
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (!item || typeof item !== 'object') continue;
      const itemId = String(item.id || '').toLowerCase().trim();
      const itemSlug = String(item.slug || '').toLowerCase().trim();
      const itemSerial = item.serial_number !== undefined && item.serial_number !== null ? String(item.serial_number).trim() : '';
      const itemNormId = itemId.replace(/[-_ ]/g, '');
      const itemNormSlug = itemSlug.replace(/[-_ ]/g, '');

      const isMatch = searchKeys.some(k => {
        const normK = k.toLowerCase().trim().replace(/[-_ ]/g, '');
        return k.toLowerCase().trim() === itemId || 
               k.toLowerCase().trim() === itemSlug || 
               (itemSerial && k.trim() === itemSerial) ||
               normK === itemNormId || 
               normK === itemNormSlug;
      });

      if (isMatch) {
        const candidate = item.more_information_url || item.encrypted_link || item.download_url || item.url || item.payload || '';
        if (candidate && typeof candidate === 'string') {
          const decrypted = candidate.startsWith('U2FsdGVkX1') ? safeDecrypt(candidate, secret) : candidate;
          if (isValidTargetUrl(decrypted)) {
            return decrypted.trim();
          }
        }
      }
    }
    return '';
  }

  // 2. If payload is a key-value dictionary (e.g. { [appId]: url } or { [appId]: { url: ... } })
  if (typeof obj === 'object') {
    for (const key of searchKeys) {
      const rawVal = obj[key];
      if (rawVal) {
        let candidate = '';
        if (typeof rawVal === 'string') {
          candidate = rawVal;
        } else if (typeof rawVal === 'object') {
          candidate = rawVal.more_information_url || rawVal.encrypted_link || rawVal.download_url || rawVal.url || rawVal.payload || '';
        }

        if (candidate) {
          const decrypted = candidate.startsWith('U2FsdGVkX1') ? safeDecrypt(candidate, secret) : candidate;
          if (isValidTargetUrl(decrypted)) {
            return decrypted.trim();
          }
        }
      }
    }

    // Also search through entries if keys are formatted with dashes/underscores
    const entries = Object.entries(obj);
    for (const [k, v] of entries) {
      const normK = k.toLowerCase().replace(/[-_ ]/g, '');
      for (const s of searchKeys) {
        if (normK === s.toLowerCase().replace(/[-_ ]/g, '')) {
          let candidate = '';
          if (typeof v === 'string') candidate = v;
          else if (v && typeof v === 'object') candidate = (v as any).more_information_url || (v as any).encrypted_link || (v as any).download_url || (v as any).url || (v as any).payload || '';
          
          if (candidate) {
            const decrypted = candidate.startsWith('U2FsdGVkX1') ? safeDecrypt(candidate, secret) : candidate;
            if (isValidTargetUrl(decrypted)) {
              return decrypted.trim();
            }
          }
        }
      }
    }
  }

  return '';
}

export function clearResolvedLinkCache(appId?: string): void {
  if (appId) {
    const clean = appId.toLowerCase().trim();
    resolvedLinkCache.delete(clean);
    resolvedLinkCache.delete(clean.replace(/[-_ ]+$/, ''));
    resolvedLinkCache.delete(clean.replace(/[-_ ]/g, ''));
  } else {
    resolvedLinkCache.clear();
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number = 1500): Promise<T | null> {
  let timer: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Resolves the destination link for a given application ID or slug.
 * Operates entirely in memory without ever writing to client DOM or logs.
 */
export async function resolveDestinationForApp(appId: string): Promise<string> {
  if (!appId || typeof appId !== 'string') return '';
  const cleanId = appId.trim();
  const lowerId = cleanId.toLowerCase();

  // 1. In-memory fast cache
  const cached = resolvedLinkCache.get(lowerId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.url;
  }

  const secret = getAesSecret();
  const rawSearchKeys = [
    cleanId,
    lowerId,
    lowerId.replace(/[-_ ]+$/, ''),
    lowerId.replace(/[-_ ]/g, '')
  ];

  // Upfront alias expansion: find matching app from staticData to include both id & slug
  try {
    const staticDataPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (fs.existsSync(staticDataPath)) {
      const raw = fs.readFileSync(staticDataPath, 'utf8');
      const parsed = JSON.parse(raw);
      const apps = parsed?.mockApps || parsed?.apps || [];
      const foundApp = apps.find((a: any) => {
        const aId = String(a.id || '').toLowerCase().trim();
        const aSlug = String(a.slug || '').toLowerCase().trim();
        const aSerial = a.serial_number !== undefined && a.serial_number !== null ? String(a.serial_number).trim() : '';
        return rawSearchKeys.includes(aId) || rawSearchKeys.includes(aSlug) || (aSerial && rawSearchKeys.includes(aSerial));
      });
      if (foundApp) {
        if (foundApp.id !== undefined && foundApp.id !== null) {
          const strId = String(foundApp.id).trim();
          rawSearchKeys.push(strId, strId.toLowerCase());
        }
        if (foundApp.slug) {
          const strSlug = String(foundApp.slug).trim();
          rawSearchKeys.push(strSlug, strSlug.toLowerCase(), strSlug.toLowerCase().replace(/[-_ ]/g, ''));
        }
        if (foundApp.serial_number !== undefined && foundApp.serial_number !== null) {
          const strSerial = String(foundApp.serial_number).trim();
          if (strSerial) rawSearchKeys.push(strSerial);
        }
      }
    }
  } catch (_) {}

  const searchKeys = Array.from(new Set(rawSearchKeys)).filter(Boolean);

  // 2. Check in-memory VaultNode (Zero Latency)
  try {
    for (const k of searchKeys) {
      const nodePayload = await vaultNode.getSyncPayload(k);
      if (nodePayload && isValidTargetUrl(nodePayload)) {
        resolvedLinkCache.set(lowerId, { url: nodePayload.trim(), timestamp: Date.now() });
        return nodePayload.trim();
      }
    }
  } catch (_) {}

  // 3. Check local server vault (src/server/secure_vault.json)
  try {
    const vaultPath = path.join(process.cwd(), 'src/server/secure_vault.json');
    if (fs.existsSync(vaultPath)) {
      const data = fs.readFileSync(vaultPath, 'utf8');
      if (data && data.trim().length > 2) {
        const parsed = JSON.parse(data);
        const found = searchVaultObject(parsed, searchKeys, secret);
        if (found) {
          resolvedLinkCache.set(lowerId, { url: found, timestamp: Date.now() });
          return found;
        }
      }
    }
  } catch (_) {}

  // 4. Check ENCRYPTED_LINKS static vault dictionary (Zero Latency RAM)
  if (ENCRYPTED_LINKS) {
    try {
      const decryptedVault = safeDecrypt(ENCRYPTED_LINKS, secret);
      if (decryptedVault) {
        const parsed = JSON.parse(decryptedVault);
        const found = searchVaultObject(parsed, searchKeys, secret);
        if (found) {
          resolvedLinkCache.set(lowerId, { url: found, timestamp: Date.now() });
          return found;
        }
      }
    } catch (_) {}
  }

  // 5. Check high-availability staticData.json fallback (Zero Latency Local)
  try {
    const staticDataPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (fs.existsSync(staticDataPath)) {
      const raw = fs.readFileSync(staticDataPath, 'utf8');
      const parsed = JSON.parse(raw);
      const apps = parsed?.mockApps || parsed?.apps || [];
      const matched = apps.find((a: any) => {
        const sId = String(a.id || '').toLowerCase().trim();
        const sSlug = String(a.slug || '').toLowerCase().trim();
        const sSerial = a.serial_number !== undefined && a.serial_number !== null ? String(a.serial_number).trim() : '';
        return searchKeys.includes(sId) || searchKeys.includes(sSlug) || (sSerial && searchKeys.includes(sSerial));
      });

      if (matched) {
        const rawUrl = matched.more_information_url || matched.encrypted_link || matched.download_url || matched.url;
        if (rawUrl) {
          const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, secret) : rawUrl;
          if (isValidTargetUrl(dec)) {
            resolvedLinkCache.set(lowerId, { url: dec.trim(), timestamp: Date.now() });
            return dec.trim();
          }
        }
      }
    }
  } catch (_) {}

  // 5b. Check public_backup.json fallback
  try {
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      const raw = fs.readFileSync(publicBackupPath, 'utf8');
      const parsed = JSON.parse(raw);
      const apps = parsed?.apps || [];
      const matched = apps.find((a: any) => {
        const sId = String(a.id || '').toLowerCase().trim();
        const sSlug = String(a.slug || '').toLowerCase().trim();
        const sSerial = a.serial_number !== undefined && a.serial_number !== null ? String(a.serial_number).trim() : '';
        return searchKeys.includes(sId) || searchKeys.includes(sSlug) || (sSerial && searchKeys.includes(sSerial));
      });

      if (matched) {
        const rawUrl = matched.more_information_url || matched.encrypted_link || matched.download_url || matched.url;
        if (rawUrl) {
          const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, secret) : rawUrl;
          if (isValidTargetUrl(dec)) {
            resolvedLinkCache.set(lowerId, { url: dec.trim(), timestamp: Date.now() });
            return dec.trim();
          }
        }
      }
    }
  } catch (_) {}

  // 6. Check Firestore private collection and live vault documents with timeout
  try {
    const db = getFirebaseAdminDb();
    if (db) {
      // 6a. Check direct sec_vault documents (per-app private storage written on save)
      for (const k of searchKeys) {
        try {
          const directDoc = await withTimeout<any>(db.collection('sec_vault').doc(k).get(), 1000);
          if (directDoc && directDoc.exists) {
            const docData = directDoc.data();
            const cipher = docData?.payload || docData?.encrypted_link;
            if (cipher) {
              const decrypted = safeDecrypt(cipher, secret);
              if (isValidTargetUrl(decrypted)) {
                resolvedLinkCache.set(lowerId, { url: decrypted.trim(), timestamp: Date.now() });
                return decrypted.trim();
              }
            }
          }
        } catch (_) {}
      }

      // 6b. Check consolidated vault documents in store_data
      const vaultDocs = ['secure_links', 'sec_vault', 'sec_public_links'];
      for (const docName of vaultDocs) {
        try {
          const docSnap = await withTimeout<any>(db.collection('store_data').doc(docName).get(), 1000);
          if (docSnap && docSnap.exists) {
            const data = docSnap.data();
            const cipher = data?.encryptedData || data?.encrypted_links;
            if (cipher) {
              const decrypted = safeDecrypt(cipher, secret);
              if (decrypted) {
                const parsed = JSON.parse(decrypted);
                const found = searchVaultObject(parsed, searchKeys, secret);
                if (found) {
                  resolvedLinkCache.set(lowerId, { url: found, timestamp: Date.now() });
                  return found;
                }
              }
            }
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  // 7. Check catalog database (Firestore store_data apps)
  try {
    const storeData = await withTimeout(fetchStoreData(), 1000);
    const apps = storeData?.apps || [];
    const matched = apps.find((a: any) => {
      const sId = String(a.id || '').toLowerCase().trim();
      const sSlug = String(a.slug || '').toLowerCase().trim();
      const sSerial = a.serial_number !== undefined && a.serial_number !== null ? String(a.serial_number).trim() : '';
      return searchKeys.includes(sId) || searchKeys.includes(sSlug) || (sSerial && searchKeys.includes(sSerial));
    });

    if (matched) {
      const rawUrl = matched.more_information_url || matched.encrypted_link || matched.download_url || matched.url;
      if (rawUrl) {
        const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, secret) : rawUrl;
        if (isValidTargetUrl(dec)) {
          resolvedLinkCache.set(lowerId, { url: dec.trim(), timestamp: Date.now() });
          return dec.trim();
        }
      }
    }
  } catch (_) {}

  return '';
}
