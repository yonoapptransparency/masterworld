const CryptoJS = require('crypto-js');
const fs = require('fs');

const data = require('./fs.json');
const ciphertext = data.fields.encryptedData.stringValue;
const secret = process.env.AES_SECRET || 'yono-default-secret-2026';

const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
const dec = bytes.toString(CryptoJS.enc.Utf8);
console.log(dec);
