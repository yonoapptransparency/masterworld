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
      // 1. Try memory from imported static vault (most reliable for serverless)
      const staticVault = ENCRYPTED_LINKS as string;
      if (staticVault && staticVault.length > 50) {
        try {
          const secret = getAesSecret();
          const decrypted = safeDecrypt(ENCRYPTED_LINKS, secret);
          if (decrypted) {
            const data = JSON.parse(decrypted);
            const newCache = new Map<string, string>();
            if (Array.isArray(data)) {
              data.forEach((node: any) => {
                if (node.id) newCache.set(node.id, node.url || node.payload || "");
              });
            } else {
              Object.entries(data).forEach(([slug, node]: [string, any]) => {
                newCache.set(slug, typeof node === 'string' ? node : (node.payload || node.url || ""));
              });
            }
            this.cache = newCache;
            console.log(`[VaultNode] Loaded ${this.cache.size} nodes from static vault.`);
            if (this.cache.size > 0) return;
          }
        } catch (e) {
          console.warn("[VaultNode] Static vault load failed, trying file fallback...");
        }
      }

      // 2. Fallback to file for local dev
      if (fs.existsSync(this.vaultPath)) {
        const data = JSON.parse(fs.readFileSync(this.vaultPath, 'utf8')) as Record<string, SecureNode>;
        const newCache = new Map<string, string>();
        Object.entries(data).forEach(([slug, node]) => {
          newCache.set(slug, node.payload);
        });
        this.cache = newCache;
        console.log(`[VaultNode] Loaded ${this.cache.size} nodes into memory.`);
      }
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
    const encryptedPayload = this.cache.get(slug);
    if (!encryptedPayload) return null;

    try {
      const secret = getAesSecret();
      const decrypted = safeDecrypt(encryptedPayload, secret);
      return decrypted || null;
    } catch (error) {
      console.error(`[VaultNode] Decryption failed for ${slug}:`, error);
      return null;
    }
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
