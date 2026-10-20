import CryptoJS from "crypto-js";

export const DEFAULT_MASTER_AES_KEY = 'RummyDex_Master_Vault_Key_2026_!@#';
export const KNOWN_VAULT_KEYS: string[] = [
  'RummyDex_Master_Vault_Key_2026_!@#',
  'rd_master_vault_aes_key_2026'
];

export function getFallbackAes(): string {
  if (typeof process !== "undefined" && process.env && process.env.AES_SECRET && process.env.AES_SECRET.trim() !== '') {
    return process.env.AES_SECRET.trim();
  }
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AES_SECRET) {
      const vKey = String((import.meta as any).env.VITE_AES_SECRET).trim();
      if (vKey) return vKey;
    }
  } catch (_) {}
  if (typeof window !== "undefined" && (window as any).AES_SECRET_GLOBAL) {
    return String((window as any).AES_SECRET_GLOBAL).trim();
  }
  return DEFAULT_MASTER_AES_KEY;
}

export function getAesSecret(): string {
  if (typeof process !== "undefined" && process.env && process.env.AES_SECRET && process.env.AES_SECRET.trim() !== '') {
    return process.env.AES_SECRET.trim();
  }
  return (globalThis as any).AES_SECRET_GLOBAL || getFallbackAes();
}

export function safeDecrypt(ciphertext: string, secret?: string): string {
  if (!ciphertext || typeof ciphertext !== 'string') return '';
  const cleanCipher = ciphertext.trim().replace(/^["']|["']$/g, '');
  if (!cleanCipher) return '';

  // If already a plain URL or not AES encrypted, return directly
  if (!cleanCipher.startsWith('U2FsdGVkX1')) {
    return cleanCipher;
  }

  const fallback = getFallbackAes();
  const globalSecret = (globalThis as any).AES_SECRET_GLOBAL;
  const keys = [
    secret, 
    (typeof process !== "undefined" ? process.env.AES_SECRET : undefined), 
    globalSecret, 
    fallback,
    DEFAULT_MASTER_AES_KEY,
    ...KNOWN_VAULT_KEYS
  ].filter(Boolean) as string[];
  const uniqueKeys = Array.from(new Set(keys));
  for (const key of uniqueKeys) {
    if (!key || key.trim() === '') continue;
    try {
      const bytes = CryptoJS.AES.decrypt(cleanCipher, key);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      if (text && text.trim().length > 0) return text.trim();
    } catch (e) {
      // keep trying other keys
    }
  }
  return '';
}

export function safeEncrypt(text: string, secret?: string): string {
  if (!text) return '';
  if (text.startsWith('U2FsdGVkX1')) return text; // Prevent double encryption

  const encKey = (secret && secret.trim()) || getAesSecret() || DEFAULT_MASTER_AES_KEY;
  return CryptoJS.AES.encrypt(text, encKey).toString();
}

export async function generateSha1(str: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
  return Array.from(new Uint8Array(hash)).map(v => v.toString(16).padStart(2, '0')).join('');
}

export const isRealValue = (id: string | undefined): boolean => {
  if (!id) return false;
  const clean = id.trim();
  if (clean === '' ||
      clean === 'PLACEHOLDER' ||
      clean === 'undefined' ||
      clean === 'null' ||
      clean.includes('REPLACE_WITH_YOUR_REAL_KEY') ||
      clean.includes('YOUR_API_KEY')) return false;

  // Reject scrambled/sandbox values (contain # ! @ & * and look like a hash but aren't real)
  if (clean.includes('#') || clean.includes('!') || clean.includes('@') || clean.includes('&') || clean.includes('*') || clean.includes('$') || clean.includes('^') || clean.includes('+') || clean.includes('proj-U7m') || clean.includes('Db7!Xp2') || clean.includes('Sy8@Kp3')) return false;

  return true;
};
