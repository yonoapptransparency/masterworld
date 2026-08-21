const crypto = require('crypto-js');
const KNOWN_VAULT_KEYS = [
  'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\'zgxf_,6_5*\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg',
  'YonoVaultSecret2026MasterKey!',
  'YonoVaultSecret2026MasterKey',
  'rummydex_master_vault_key_2026',
  'rummydex_secure_link_vault_key_2026',
  'rummydex-secure-vault-2025-x891'
];
async function run() {
  const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
  for (const docName of vaultDocs) {
    const url = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0825832493/databases/ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a/documents/store_data/${docName}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const ciphertext = data.fields?.encryptedData?.stringValue || data.fields?.encrypted_links?.stringValue;
      if (ciphertext) {
        let dec = false;
        for (const key of KNOWN_VAULT_KEYS) {
          try {
            const bytes = crypto.AES.decrypt(ciphertext, key);
            const text = bytes.toString(crypto.enc.Utf8);
            if (text && text.includes('callbreak')) {
              console.log(`[${docName}] Decrypted with ${key}! Found callbreak.`);
              dec = true;
              break;
            }
          } catch(e) {}
        }
        if (!dec) console.log(`[${docName}] Failed to decrypt.`);
      } else {
        console.log(`[${docName}] No ciphertext found.`);
      }
    } catch(e) {
      console.log(`[${docName}] Error fetching: ${e.message}`);
    }
  }
}
run();
