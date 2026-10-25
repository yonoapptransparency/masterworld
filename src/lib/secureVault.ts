import {
  getEnvSecretKeys,
  getAesSecret,
  encryptData,
  decryptData,
  safeEncrypt,
  safeDecrypt,
} from './cryptoUtils';

export { getEnvSecretKeys, getAesSecret, encryptData, decryptData, safeEncrypt, safeDecrypt };

export function encryptLinks(linksMap: Record<string, string>, secretKey?: string): string {
  return safeEncrypt(JSON.stringify(linksMap), secretKey);
}

export function decryptLinks(ciphertext: string, secretKey?: string): Record<string, string> {
  if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.trim()) return {};
  const dec = safeDecrypt(ciphertext.trim(), secretKey);
  if (!dec) return {};
  try {
    const parsed = JSON.parse(dec);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {}
  return {};
}

export function generateSecureVaultFile(ciphertext: string): string {
  const safeCipher = JSON.stringify(String(ciphertext || '').trim());
  return [
    "import {",
    "  getEnvSecretKeys,",
    "  getAesSecret,",
    "  encryptData,",
    "  decryptData,",
    "  safeEncrypt,",
    "  safeDecrypt,",
    "} from './cryptoUtils';",
    "",
    "export { getEnvSecretKeys, getAesSecret, encryptData, decryptData, safeEncrypt, safeDecrypt };",
    "",
    "export function encryptLinks(linksMap: Record<string, string>, secretKey?: string): string {",
    "  return safeEncrypt(JSON.stringify(linksMap), secretKey);",
    "}",
    "",
    "export function decryptLinks(ciphertext: string, secretKey?: string): Record<string, string> {",
    "  if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.trim()) return {};",
    "  const dec = safeDecrypt(ciphertext.trim(), secretKey);",
    "  if (!dec) return {};",
    "  try {",
    "    const parsed = JSON.parse(dec);",
    "    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;",
    "  } catch {}",
    "  return {};",
    "}",
    "",
    "export function generateSecureVaultFile(c: string): string {",
    "  return `export { getEnvSecretKeys, getAesSecret, encryptData, decryptData, safeEncrypt, safeDecrypt } from './cryptoUtils';\\nexport const ENCRYPTED_LINKS = ${JSON.stringify(String(c || '').trim())};\\nexport const ENCRYPTED_VAULT = ENCRYPTED_LINKS;\\n`;",
    "}",
    "",
    `export const ENCRYPTED_LINKS = ${safeCipher};`,
    "export const ENCRYPTED_VAULT = ENCRYPTED_LINKS;",
    "",
  ].join('\n');
}

export const ENCRYPTED_LINKS = "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";
export const ENCRYPTED_VAULT = ENCRYPTED_LINKS;
