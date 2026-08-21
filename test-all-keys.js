const crypto = require('crypto-js');
const KNOWN_VAULT_KEYS = [
  'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\'zgxf_,6_5*\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg',
  'YonoVaultSecret2026MasterKey!',
  'YonoVaultSecret2026MasterKey',
  'rummydex_master_vault_key_2026',
  'rummydex_secure_link_vault_key_2026',
  'rummydex-secure-vault-2025-x891'
];
const ciphertext = "U2FsdGVkX19LhS1FPXUfMyt/9VsFG3Ooi/VJP8EeMmg81JRcjl3J/9uzUVPAjI6yCpUluTXTxkBBDbbZRpX1fw==";

for (const key of KNOWN_VAULT_KEYS) {
  try {
    const bytes = crypto.AES.decrypt(ciphertext, key);
    const text = bytes.toString(crypto.enc.Utf8);
    if (text) {
      console.log('Decrypted with', key, ':', text);
    }
  } catch(e) {}
}
