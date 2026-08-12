import CryptoJS from "crypto-js";
const secret = process.env.AES_SECRET || 'YonoVaultSecret2026MasterKey!';

const encUrl = "U2FsdGVkX1/PhTuzI5yNFlYVpnUbgD8Bf5kbTR9xFXe7LetZpIU/qOlnxR3Jg8vi0Wz+gGxyWo1b/pnAhOEIoA==";
const bytes = CryptoJS.AES.decrypt(encUrl, secret);
const text = bytes.toString(CryptoJS.enc.Utf8);
console.log("Decrypted URL:", text);
