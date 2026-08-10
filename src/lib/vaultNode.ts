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
        if (staticData && Array.isArray(staticData.mockApps)) {
          staticData.mockApps.forEach((app: any) => {
            const target = app.more_information_url || app.encrypted_link || app.download_url || app.url;
            setInCache(app.id, target);
            setInCache(app.slug, target);
          });
        }
      } catch (e) {}

      // 3. Fallback to file for local dev
      if (fs.existsSync(this.vaultPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(this.vaultPath, 'utf8')) as Record<string, SecureNode>;
          Object.entries(data).forEach(([slug, node]) => {
            setInCache(slug, node.payload);
            setInCache(node.id, node.payload);
          });
        } catch (e) {}
      }

      this.cache = newCache;
      console.log(`[VaultNode] Loaded ${this.cache.size} node key mappings into memory.`);
    } catch (error) {
      console.error('[VaultNode] Initialization failed:', error);
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
