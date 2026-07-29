const { safeEncrypt, safeDecrypt } = require('./src/server/crypto');
const secret = process.env.AES_SECRET || "fallback_aes_secret_for_local_dev_only";

const url = "https://example.com";
const enc = safeEncrypt(url, secret);
console.log("Encrypted URL:", enc);
const dec = safeDecrypt(enc, secret);
console.log("Decrypted URL:", dec);

const items = [{ id: "test", url: enc }];
const plain = JSON.stringify(items);
const outerEnc = safeEncrypt(plain, secret);
console.log("Outer Encrypted:", outerEnc);
const outerDec = safeDecrypt(outerEnc, secret);
console.log("Outer Decrypted:", outerDec);
