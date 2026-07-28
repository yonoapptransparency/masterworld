import CryptoJS from "crypto-js";
import { getFallbackAes } from "./config";

export function safeDecrypt(ciphertext: string, secret: string): string {
  const keys = [secret, process.env.AES_SECRET].filter(Boolean);
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
  const secret = process.env.AES_SECRET;
  if (!secret || secret === getFallbackAes()) {
    console.error("CRITICAL: AES_SECRET environment variable is NOT SET.");
    throw new Error("AES_SECRET environment variable is NOT SET. Server misconfiguration.");
  }
  return secret;
}

export function safeEncrypt(text: string, secret: string): string {
  if (!text || !secret || secret.trim() === '') {
    throw new Error('Cannot encrypt: AES_SECRET is required');
  }
  return CryptoJS.AES.encrypt(text, secret).toString();
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
