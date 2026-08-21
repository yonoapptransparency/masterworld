const crypto = require('crypto-js');
const AES_SECRET = 'rummydex-secure-vault-2025-x891';
const ciphertext = "U2FsdGVkX19LhS1FPXUfMyt/9VsFG3Ooi/VJP8EeMmg81JRcjl3J/9uzUVPAjI6yCpUluTXTxkBBDbbZRpX1fw==";
const bytes = crypto.AES.decrypt(ciphertext, AES_SECRET);
const originalText = bytes.toString(crypto.enc.Utf8);
console.log(originalText);
