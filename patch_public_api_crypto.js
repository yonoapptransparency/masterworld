const fs = require('fs');
let content = fs.readFileSync('public-api/index.js', 'utf8');

const knownKeys = `const KNOWN_VAULT_KEYS = [
  'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\\'zgxf_,6_5*\\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg',
  'YonoVaultSecret2026MasterKey!',
  'YonoVaultSecret2026MasterKey',
  'rummydex_master_vault_key_2026',
  'rummydex_secure_link_vault_key_2026',
  'ai-studio-yonostore-key-2026',
  'fallback_aes_secret_for_local_dev_only',
  'yono-default-secret-2026'
];`;

const oldSafeDecrypt = `function safeDecrypt(ciphertext, secret) {
  if (!ciphertext) return '';
  const cleanCipher = ciphertext.trim().replace(/^["']|["']$/g, '');
  if (!cleanCipher.startsWith('U2FsdGVkX1')) return cleanCipher;

  const keys = [secret, process.env.AES_SECRET, 'fallback_aes_secret_for_local_dev_only'].filter(Boolean);
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
}`;

const newSafeDecrypt = `function safeDecrypt(ciphertext, secret) {
  if (!ciphertext) return '';
  const cleanCipher = ciphertext.trim().replace(/^["']|["']$/g, '');
  if (!cleanCipher.startsWith('U2FsdGVkX1')) return cleanCipher;

  const keys = [secret, process.env.AES_SECRET, ...KNOWN_VAULT_KEYS].filter(Boolean);
  const uniqueKeys = Array.from(new Set(keys));
  for (const key of uniqueKeys) {
    if (!key || key.trim() === '') continue;
    try {
      const bytes = CryptoJS.AES.decrypt(cleanCipher, key);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      if (text && text.trim().length > 0) return text.trim();
    } catch (e) {
      // keep trying
    }
  }
  return '';
}`;

if (!content.includes('KNOWN_VAULT_KEYS')) {
  content = content.replace('function safeDecrypt(ciphertext, secret) {', knownKeys + '\\n\\n' + newSafeDecrypt + '\\n\\n// replaced');
  content = content.replace(oldSafeDecrypt, ''); // Just in case it's still there
}

fs.writeFileSync('public-api/index.js', content);
