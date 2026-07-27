const CryptoJS = require('crypto-js');

function safeDecrypt(ciphertext, secret, legacyKeys) {
    const keys = [secret, ...(legacyKeys || [])];
    for (const key of keys) {
        if (!key) continue;
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, key);
            const text = bytes.toString(CryptoJS.enc.Utf8);
            if (text && text.trim().length > 0) return text;
        } catch (e) {
        }
    }
    return '';
}

function safeEncrypt(text, secret) {
    return CryptoJS.AES.encrypt(text, secret).toString();
}

const secret = "fallback_aes_secret";
const payload = JSON.stringify({ admin: true, email: "test@example.com", exp: Date.now() + 86400000 });
const token = safeEncrypt(payload, secret);
console.log("Token:", token);
const decrypted = safeDecrypt(token, secret);
console.log("Decrypted:", decrypted);
