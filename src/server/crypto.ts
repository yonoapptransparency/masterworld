import CryptoJS from "crypto-js";
import { getFallbackAes } from "./config";

export function safeDecrypt(ciphertext: string, secret: string): string {
  const fallback = getFallbackAes();
  const globalSecret = (global as any).AES_SECRET_GLOBAL;
  const keys = [
    secret, 
    process.env.AES_SECRET, 
    globalSecret, 
    'YonoVaultSecret2026MasterKey!', 
    'YonoVaultSecret2026MasterKey',
    'rummydex_master_vault_key_2026',
    fallback
  ].filter(Boolean) as string[];
  const uniqueKeys = Array.from(new Set(keys));
  for (const key of uniqueKeys) {
    if (!key || key.trim() === '') continue;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      if (text && text.trim().length > 0) return text;
    } catch (e) {
      // keep trying
    }
  }
  return '';
}

export function getAesSecret(): string {
  return process.env.AES_SECRET || (global as any).AES_SECRET_GLOBAL || getFallbackAes();
}

export function safeEncrypt(text: string, secret: string): string {
  const encKey = secret || getAesSecret();
  if (!text || !encKey || encKey.trim() === '') {
    throw new Error('Cannot encrypt: AES_SECRET is required');
  }
  return CryptoJS.AES.encrypt(text, encKey).toString();
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
  if (clean.length > 20 && (clean.includes('#') || clean.includes('!') || clean.includes('@'))) return false;

  return true;
};
