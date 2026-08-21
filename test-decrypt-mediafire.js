const crypto = require('crypto-js');
const AES_SECRET = 'rummydex-secure-vault-2025-x891';
const ciphertext = "U2FsdGVkX19LhS1FPXUfMyt/9VsFG3Ooi/VJP8EeMmg81JRcjl3J/9uzUVPAjI6yCpUluTXTxkBBDbbZRpX1fw==";
// Actually, what if it was decrypted by safeDecrypt because safeDecrypt tries ALL keys, including KNOWN_VAULT_KEYS?
