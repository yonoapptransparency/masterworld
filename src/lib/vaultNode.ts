/**
 * Yono Transparency: Neutral Vault Node Manager
 * Handles in-memory sync of encrypted resource nodes with zero database latency.
 */

import fs from 'fs';
import path from 'path';
import { safeDecrypt, getAesSecret } from '../server/crypto';

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
  }

  private initialize() {
    try {
      if (fs.existsSync(this.vaultPath)) {
        const data = JSON.parse(fs.readFileSync(this.vaultPath, 'utf8')) as Record<string, SecureNode>;
        Object.entries(data).forEach(([slug, node]) => {
          this.cache.set(slug, node.payload);
        });
        console.log(`[VaultNode] Loaded ${this.cache.size} nodes into memory.`);
      }
    } catch (error) {
      console.error('[VaultNode] Initialization failed:', error);
    }
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
