import CryptoJS from 'crypto-js';

// Cache the secret in memory to avoid repeated environment / disk checks
let cachedSecret: string | null = null;

export function getAesSecret(): string {
  if (cachedSecret && cachedSecret.trim() !== '') {
    return cachedSecret;
  }
  const secret = process.env.AES_SECRET || (globalThis as any).AES_SECRET_GLOBAL || 'RUMMYDEX_MASTER_AES_SECRET_KEY_2025';
  if (secret && secret.trim() !== '') {
    cachedSecret = secret.trim();
  }
  return cachedSecret || 'RUMMYDEX_MASTER_AES_SECRET_KEY_2025';
}

export function safeEncrypt(text: string, secret?: string): string {
  if (!text || typeof text !== 'string') return '';
  const key = (secret && secret.trim() !== '') ? secret.trim() : getAesSecret();
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (err) {
    console.error('Encryption error:', err);
    return '';
  }
}

export function safeDecrypt(ciphertext: string, secret?: string): string {
  if (!ciphertext || typeof ciphertext !== 'string') return '';
  const key = (secret && secret.trim() !== '') ? secret.trim() : getAesSecret();
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || '';
  } catch (err) {
    return '';
  }
}
