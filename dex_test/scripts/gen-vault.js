const CryptoJS = require('crypto-js');
const fs = require('fs');

const AES_SECRET = process.env.AES_SECRET || "fallback_aes_secret_for_local_dev_only";

const mockApps = [
  { id: "com.whatsapp", url: "https://www.whatsapp.com/download" },
  { id: "com.instagram.android", url: "https://www.instagram.com/" },
  { id: "com.facebook.katana", url: "https://www.facebook.com/" }
];

const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(mockApps), AES_SECRET).toString();
console.log("Encrypted Vault Ciphertext:");
console.log(ciphertext);

const content = `export const ENCRYPTED_LINKS = "${ciphertext}";\n`;
fs.writeFileSync('src/lib/secureVault.ts', content);
console.log("src/lib/secureVault.ts updated.");
