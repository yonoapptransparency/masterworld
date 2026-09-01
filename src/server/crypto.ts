import CryptoJS from "crypto-js";
import { getFallbackAes } from "./config";

const KNOWN_VAULT_KEYS = [
  'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\'zgxf_,6_5*\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg',
  'YonoVaultSecret2026MasterKey!',
  'YonoVaultSecret2026MasterKey',
  'rummydex_master_vault_key_2026',
  'rummydex_secure_link_vault_key_2026',
  'ai-studio-yonostore-key-2026',
  'fallback_aes_secret_for_local_dev_only'
];

export function safeDecrypt(ciphertext: string, secret?: string): string {
  if (!ciphertext || typeof ciphertext !== 'string') return '';
  const cleanCipher = ciphertext.trim().replace(/^["']|["']$/g, '');
  if (!cleanCipher) return '';

  // If already a plain URL or not AES encrypted, return directly
  if (!cleanCipher.startsWith('U2FsdGVkX1')) {
    return cleanCipher;
  }

  const fallback = getFallbackAes();
  const globalSecret = (global as any).AES_SECRET_GLOBAL;
  const keys = [
    secret, 
    process.env.AES_SECRET, 
    globalSecret, 
    ...KNOWN_VAULT_KEYS,
    fallback
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

export function getAesSecret(): string {
  return process.env.AES_SECRET || (global as any).AES_SECRET_GLOBAL || getFallbackAes();
}

export function safeEncrypt(text: string, secret: string): string {
  if (!text) return '';
  if (text.startsWith('U2FsdGVkX1')) return text; // Prevent double encryption

  const encKey = secret || getAesSecret();
  if (!encKey || encKey.trim() === '') {
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
  if (clean.includes('#') || clean.includes('!') || clean.includes('@') || clean.includes('&') || clean.includes('*') || clean.includes('$') || clean.includes('^') || clean.includes('+') || clean.includes('proj-U7m') || clean.includes('Db7!Xp2') || clean.includes('Sy8@Kp3')) return false;

  return true;
};
