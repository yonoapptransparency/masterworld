/**
 * Secure local storage utility using AES cryptography.
 * Encrypts sensitive portal keys and data payloads client-side.
 */

import CryptoJS from 'crypto-js';

// Derive a unique key to make it harder to guess or decrypt externally
const getStorageSecret = (): string => {
  const base = "RUMMY_PORTAL_CLIENT_SEC_2026_PROD_SHIELD";
  return base + "_KINETICS_HASH_V2";
};

// Obfuscate local storage keys so they aren't easily searchable (e.g. from extensions)
export function getObfuscatedKey(key: string): string {
  if (key.startsWith('rummystore_')) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return `_app_sec_chunk_${Math.abs(hash).toString(16)}`;
  }
  return key;
}

let activeGets = 0;
let activeSets = 0;

export const secureStorage = {
  getItem: (key: string): string | null => {
    activeGets++;
    if (activeGets > 10) {
      console.error("[DEBUG RECURSION ERROR] secureStorage.getItem recursive loop detected! Depth:", activeGets, "Key:", key);
      activeGets--;
      throw new Error("secureStorage.getItem recursive loop detected");
    }
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
      const realKey = getObfuscatedKey(key);
      const raw = localStorage.getItem(realKey);
      if (!raw) {
        const legacyRaw = localStorage.getItem(key);
        if (legacyRaw) {
          // Encrypt legacy plain text on discovery
          secureStorage.setItem(key, legacyRaw);
          return legacyRaw;
        }
        return null;
      }
      
      // Decrypt using AES
      const secret = getStorageSecret();
      const bytes = CryptoJS.AES.decrypt(raw, secret);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        // If decryption failed, return original value or null
        return null;
      }
      return decrypted;
    } catch (e) {
      console.warn("Secure storage read fallback:", e);
      return null;
    } finally {
      activeGets--;
    }
  },
  
  setItem: (key: string, value: string): void => {
    activeSets++;
    if (activeSets > 10) {
      console.error("[DEBUG RECURSION ERROR] secureStorage.setItem recursive loop detected! Depth:", activeSets, "Key:", key);
      activeSets--;
      throw new Error("secureStorage.setItem recursive loop detected");
    }
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      const realKey = getObfuscatedKey(key);
      
      // Encrypt value using AES
      const secret = getStorageSecret();
      const encrypted = CryptoJS.AES.encrypt(value, secret).toString();
      
      localStorage.setItem(realKey, encrypted);
      
      // Clean up legacy plain text if present
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn("Secure storage write failed:", e);
    } finally {
      activeSets--;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      const realKey = getObfuscatedKey(key);
      localStorage.removeItem(realKey);
      localStorage.removeItem(key); // Also clean up legacy plain-text entry if any
    } catch (e) {
      console.warn("Secure storage delete failed:", e);
    }
  },
  
  clear: (): void => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      localStorage.clear();
    } catch (e) {
      console.warn("Storage clear failed:", e);
    }
  }
};
