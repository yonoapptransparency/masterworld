// Secure Storage — client-side AES-256-GCM encryption with per-payload random salt
// Uses the browser's Web Crypto API (PBKDF2-SHA256 + AES-256-GCM)

const LEGACY_SALT = 'rummy-store-salt-fixed';
const V2_PREFIX = 'v2:';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binaryStr = atob(b64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

async function getDerivedKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 150000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function getLegacyDerivedKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(LEGACY_SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

export const secureStorage = {
  encryptPayload: async (data: any, key: string): Promise<string> => {
    try {
      if (!key || typeof key !== 'string') return '';
      const payload = JSON.stringify(data);
      const enc = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const cryptoKey = await getDerivedKey(key, salt);
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        enc.encode(payload)
      );

      const encryptedArray = new Uint8Array(encrypted);
      const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(encryptedArray, salt.length + iv.length);

      return V2_PREFIX + bytesToBase64(result);
    } catch (e) {
      console.warn('secureStorage.encryptPayload failed:', e);
      return '';
    }
  },

  decryptPayload: async (ciphertext: string, key: string): Promise<any> => {
    try {
      if (!ciphertext || !key || typeof key !== 'string') return null;

      if (ciphertext.startsWith(V2_PREFIX)) {
        const bytes = base64ToBytes(ciphertext.slice(V2_PREFIX.length));
        if (bytes.byteLength <= 28) return null;
        const salt = bytes.slice(0, 16);
        const iv = bytes.slice(16, 28);
        const data = bytes.slice(28);
        const cryptoKey = await getDerivedKey(key, salt);
        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          data
        );
        return JSON.parse(new TextDecoder().decode(decrypted));
      }

      // Backward-compatible decryption for legacy v1 payloads
      const bytes = base64ToBytes(ciphertext);
      if (bytes.byteLength <= 12) return null;
      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);
      const cryptoKey = await getLegacyDerivedKey(key);
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
      console.warn('secureStorage.decryptPayload failed:', e);
      return null;
    }
  },

  setItem: (storageKey: string, value: any): void => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch (_) {}
  },

  getItem: (storageKey: string): any => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  },

  removeItem: (storageKey: string): void => {
    try {
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);
    } catch (_) {}
  }
};

export default secureStorage;
