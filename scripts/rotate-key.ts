import * as fs from "fs";
import * as path from "path";
import CryptoJS from "crypto-js";

const oldKey = "Shehzad@78";
const newKey = "4a7bde29f3c158d6e0a4f5c381d9b6270fae35c890bd247165efc3a289b0de8a";

console.log("=== KEY ROTATION UTILITY ===");
console.log(`Old Key: "${oldKey}"`);
console.log(`New Key: "${newKey}"`);

// 1. Read ENCRYPTED_LINKS from secureVault.ts
const vaultPath = path.join(__dirname, "../src/lib/secureVault.ts");
const vaultContent = fs.readFileSync(vaultPath, "utf-8");

// Extract the string literal from `export const ENCRYPTED_LINKS = "..."`
const match = vaultContent.match(/export const ENCRYPTED_LINKS = "([^"]+)";/);
if (!match) {
  console.error("Could not find ENCRYPTED_LINKS in secureVault.ts");
  process.exit(1);
}

const encryptedLinksStr = match[1];
console.log(`Read ENCRYPTED_LINKS length: ${encryptedLinksStr.length}`);

// Helper decrypt function
function decrypt(ciphertext: string, key: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return "";
  }
}

// Helper encrypt function
function encrypt(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

// 2. Decrypt the outer JSON structure
const decryptedOuter = decrypt(encryptedLinksStr, oldKey);
if (!decryptedOuter) {
  console.error("FAILED to decrypt secureVault outer structure using old key!");
  process.exit(1);
}

console.log("SUCCESSFULLY decrypted outer secureVault structure.");
const linkMap = JSON.parse(decryptedOuter);
console.log(`Found ${Object.keys(linkMap).length} applications inside secureVault.`);

// 3. For each application, decrypt the inner URL, and then re-encrypt with the new key
const rotatedLinkMap: Record<string, string> = {};
const rotatedBackupMap: Record<string, string> = {};

let successCount = 0;
let failCount = 0;

for (const [id, encUrl] of Object.entries(linkMap)) {
  const decryptedUrl = decrypt(encUrl as string, oldKey);
  if (decryptedUrl && decryptedUrl.startsWith("http")) {
    // Re-encrypt the URL using the new strong key
    const newEncryptedUrl = encrypt(decryptedUrl, newKey);
    rotatedLinkMap[id] = newEncryptedUrl;
    rotatedBackupMap[id] = newEncryptedUrl;
    successCount++;
  } else {
    console.warn(`WARNING: Failed to decrypt URL for ID: ${id}. Keeping fallback or skipping.`);
    failCount++;
  }
}

console.log(`Successfully rotated ${successCount} links. Failed: ${failCount}`);

// 4. Encrypt the entire map with the new key to produce the new outer vault
const newDecryptedOuter = JSON.stringify(rotatedLinkMap);
const newEncryptedLinksStr = encrypt(newDecryptedOuter, newKey);

console.log(`New ENCRYPTED_LINKS length: ${newEncryptedLinksStr.length}`);

// Verify decryption of the new structure works with the new key
const testDecryptedOuter = decrypt(newEncryptedLinksStr, newKey);
if (testDecryptedOuter !== newDecryptedOuter) {
  console.error("CRITICAL: Verification failed! Decrypted outer string does not match written string.");
  process.exit(1);
}

const testMap = JSON.parse(testDecryptedOuter);
const firstId = Object.keys(testMap)[0];
if (firstId) {
  const testDecryptedUrl = decrypt(testMap[firstId], newKey);
  console.log(`Verification: ID ${firstId} decrypts to "${testDecryptedUrl}"`);
  if (!testDecryptedUrl.startsWith("http")) {
    console.error("CRITICAL: Decrypted test URL is invalid.");
    process.exit(1);
  }
}

console.log("CRITICAL VERIFICATION PASSED. Writing files...");

// 5. Write to src/lib/secureVault.ts
const newVaultContent = `// SECURE VAULT - DO NOT EDIT MANUALLY
export const IS_SEALED = true;
export const ENCRYPTED_LINKS = "${newEncryptedLinksStr}";
`;
fs.writeFileSync(vaultPath, newVaultContent, "utf-8");
console.log("Updated src/lib/secureVault.ts");

// 6. Write to src/lib/secure_links_backup.json
const backupPath = path.join(__dirname, "../src/lib/secure_links_backup.json");
fs.writeFileSync(backupPath, JSON.stringify(rotatedBackupMap, null, 2), "utf-8");
console.log("Updated src/lib/secure_links_backup.json");

console.log("=== KEY ROTATION COMPLETED SUCCESSFULLY ===");
