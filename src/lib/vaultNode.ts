/**
 * Yono Transparency: Neutral Vault Node Manager
 * Handles in-memory sync of encrypted resource nodes with zero database latency.
 */

import fs from 'fs';
import path from 'path';
import { safeDecrypt, getAesSecret } from '../server/crypto';
import { ENCRYPTED_LINKS } from './secureVault';

interface SecureNode {
  id: string;
  payload: string; // Encrypted link
  updatedAt: number;
}

class VaultNodeManager {
  private cache: Map<string, string> = new Map();
  private vaultPath = path.join(process.cwd(), 'src', 'server', 'secure_vault.json');

  constructor() {
    this.initialize();
    this.watchVault();
  }

  private initialize() {
    try {
      const newCache = new Map<string, string>();

      const setInCache = (key: string | undefined | null, val: string | undefined | null) => {
        if (!key || !val || typeof key !== 'string' || typeof val !== 'string') return;
        const cleanVal = val.trim();
        if (!cleanVal) return;

        const kExact = key.trim();
        const kLower = kExact.toLowerCase();
        const kClean = kLower.replace(/[-_ ]+$/, '');
        const kNoSep = kLower.replace(/[-_ ]/g, '');

        if (kExact) newCache.set(kExact, cleanVal);
        if (kLower) newCache.set(kLower, cleanVal);
        if (kClean) newCache.set(kClean, cleanVal);
        if (kNoSep) newCache.set(kNoSep, cleanVal);
      };

      // 1. Try memory from imported static vault (ENCRYPTED_LINKS)
      const staticVault = ENCRYPTED_LINKS as string;
      if (staticVault && staticVault.length > 50) {
        try {
          const secret = getAesSecret();
          const decrypted = safeDecrypt(ENCRYPTED_LINKS, secret);
          if (decrypted) {
            const data = JSON.parse(decrypted);
            if (Array.isArray(data)) {
              data.forEach((node: any) => {
                const target = node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url;
                setInCache(node.id, target);
                setInCache(node.slug, target);
              });
            } else if (typeof data === 'object') {
              Object.entries(data).forEach(([key, node]: [string, any]) => {
                const target = typeof node === 'string' ? node : (node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url);
                setInCache(key, target);
                if (node && typeof node === 'object') {
                  setInCache(node.id, target);
                  setInCache(node.slug, target);
                }
              });
            }
          }
        } catch (e) {
          console.warn("[VaultNode] Static vault load warning:", e);
        }
      }

      // 2. Pre-seed from staticData.mockApps for instant zero-latency lookup
      try {
        const staticDataPath = path.join(process.cwd(), 'src', 'lib', 'staticData');
        const staticData = require(staticDataPath);
        const staticDataApps = (staticData && (Array.isArray(staticData.apps) ? staticData.apps : staticData.mockApps)) || [];
        if (Array.isArray(staticDataApps)) {
          staticDataApps.forEach((app: any) => {
            const target = app.more_information_url || app.encrypted_link || app.download_url || app.url;
            setInCache(app.id, target);
            setInCache(app.slug, target);
          });
        }
      } catch (e) {}

      // 3. Fallback to file for local dev and persistent runtime backups
      const diskBackupPaths = [
        this.vaultPath,
        path.join(process.cwd(), '.local', 'secure_vault.json'),
        path.join(process.cwd(), '.local', 'secure_links_backup.json'),
        path.join(process.cwd(), 'src', 'lib', 'secure_links_backup.json')
      ];

      for (const p of diskBackupPaths) {
        if (fs.existsSync(p)) {
          try {
            const raw = fs.readFileSync(p, 'utf8');
            const data = JSON.parse(raw);
            if (Array.isArray(data)) {
              data.forEach((node: any) => {
                const target = node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url;
                setInCache(node.id, target);
                setInCache(node.slug, target);
              });
            } else if (data && typeof data === 'object') {
              Object.entries(data).forEach(([key, node]: [string, any]) => {
                const target = typeof node === 'string' ? node : (node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url);
                setInCache(key, target);
                if (node && typeof node === 'object') {
                  setInCache(node.id, target);
                  setInCache(node.slug, target);
                }
              });
            }
          } catch (e) {}
        }
      }

      this.cache = newCache;
      console.log(`[VaultNode] Loaded ${this.cache.size} node key mappings into memory.`);
    } catch (error) {
      console.error('[VaultNode] Initialization failed:', error);
    }
  }

  /**
   * Directly injects or updates a key-value mapping in memory for instant resolution.
   */
  public setPayload(key: string | undefined | null, url: string | undefined | null) {
    if (!key || !url || typeof key !== 'string' || typeof url !== 'string') return;
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    const kExact = key.trim();
    const kLower = kExact.toLowerCase();
    const kClean = kLower.replace(/[-_ ]+$/, '');
    const kNoSep = kLower.replace(/[-_ ]/g, '');

    if (kExact) this.cache.set(kExact, cleanUrl);
    if (kLower) this.cache.set(kLower, cleanUrl);
    if (kClean) this.cache.set(kClean, cleanUrl);
    if (kNoSep) this.cache.set(kNoSep, cleanUrl);
  }

  /**
   * Ingests an array or object of item mappings directly into memory.
   */
  public setPayloads(items: any) {
    if (!items) return;
    const secret = getAesSecret();

    const processItem = (node: any) => {
      if (!node) return;
      let target = typeof node === 'string' ? node : (node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url);
      if (!target || typeof target !== 'string') return;

      let trimmed = target.trim();
      if (trimmed.startsWith('U2FsdGVkX1')) {
        const dec = safeDecrypt(trimmed, secret);
        if (dec && dec.trim().length > 0) {
          trimmed = dec.trim();
        }
      }

      if (typeof node === 'object') {
        if (node.id) this.setPayload(node.id, trimmed);
        if (node.slug) this.setPayload(node.slug, trimmed);
      }
    };

    if (Array.isArray(items)) {
      items.forEach(processItem);
    } else if (typeof items === 'object') {
      Object.entries(items).forEach(([key, node]: [string, any]) => {
        this.setPayload(key, typeof node === 'string' ? node : (node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url));
        if (node && typeof node === 'object') {
          processItem(node);
        }
      });
    }
  }

  private watchVault() {
    try {
      fs.watchFile(this.vaultPath, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          console.log('[VaultNode] Vault file changed, refreshing cache...');
          this.initialize();
        }
      });
    } catch (e) {}
  }

  /**
   * Retrieves and decrypts a resource node instantly from memory.
   */
  public async getSyncPayload(slug: string): Promise<string | null> {
    if (!slug || typeof slug !== 'string') return null;
    const candidates = Array.from(new Set([
      slug,
      slug.trim(),
      slug.toLowerCase().trim(),
      slug.toLowerCase().trim().replace(/[-_ ]+$/, ''),
      slug.toLowerCase().trim().replace(/[-_ ]/g, '')
    ])).filter(Boolean);

    let cachedPayload: string | undefined;
    for (const cand of candidates) {
      if (this.cache.has(cand)) {
        cachedPayload = this.cache.get(cand);
        if (cachedPayload && cachedPayload.trim().length > 0) break;
      }
    }

    if (!cachedPayload) return null;

    const trimmed = cachedPayload.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.startsWith('U2FsdGVkX1')) {
      try {
        const secret = getAesSecret();
        const decrypted = safeDecrypt(trimmed, secret);
        if (decrypted && decrypted.trim().length > 0) {
          return decrypted.trim();
        }
      } catch (error) {
        return null;
      }
    }

    return trimmed;
  }

  /**
   * Refreshes the in-memory cache.
   */
  public refresh() {
    this.cache.clear();
    this.initialize();
  }
}

export const vaultNode = new VaultNodeManager();
