"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRealValue = void 0;
exports.safeDecrypt = safeDecrypt;
exports.getAesSecret = getAesSecret;
exports.safeEncrypt = safeEncrypt;
var crypto_js_1 = __importDefault(require("crypto-js"));
var config_1 = require("./config");
var KNOWN_VAULT_KEYS = [
    'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\'zgxf_,6_5*\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg',
    'YonoVaultSecret2026MasterKey!',
    'YonoVaultSecret2026MasterKey',
    'rummydex_master_vault_key_2026',
    'rummydex_secure_link_vault_key_2026',
    'ai-studio-yonostore-key-2026',
    'fallback_aes_secret_for_local_dev_only'
];
function safeDecrypt(ciphertext, secret) {
    if (!ciphertext || typeof ciphertext !== 'string')
        return '';
    var cleanCipher = ciphertext.trim().replace(/^["']|["']$/g, '');
    if (!cleanCipher)
        return '';
    // If already a plain URL or not AES encrypted, return directly
    if (!cleanCipher.startsWith('U2FsdGVkX1')) {
        return cleanCipher;
    }
    var fallback = (0, config_1.getFallbackAes)();
    var globalSecret = global.AES_SECRET_GLOBAL;
    var keys = __spreadArray(__spreadArray([
        secret,
        process.env.AES_SECRET,
        globalSecret
    ], KNOWN_VAULT_KEYS, true), [
        fallback
    ], false).filter(Boolean);
    var uniqueKeys = Array.from(new Set(keys));
    for (var _i = 0, uniqueKeys_1 = uniqueKeys; _i < uniqueKeys_1.length; _i++) {
        var key = uniqueKeys_1[_i];
        if (!key || key.trim() === '')
            continue;
        try {
            var bytes = crypto_js_1.default.AES.decrypt(cleanCipher, key);
            var text = bytes.toString(crypto_js_1.default.enc.Utf8);
            if (text && text.trim().length > 0)
                return text.trim();
        }
        catch (e) {
            // keep trying other keys
        }
    }
    return '';
}
function getAesSecret() {
    return process.env.AES_SECRET || global.AES_SECRET_GLOBAL || (0, config_1.getFallbackAes)();
}
function safeEncrypt(text, secret) {
    if (!text)
        return '';
    if (text.startsWith('U2FsdGVkX1'))
        return text; // Prevent double encryption
    var encKey = secret || getAesSecret();
    if (!encKey || encKey.trim() === '') {
        throw new Error('Cannot encrypt: AES_SECRET is required');
    }
    return crypto_js_1.default.AES.encrypt(text, encKey).toString();
}
var isRealValue = function (id) {
    if (!id)
        return false;
    var clean = id.trim();
    if (clean === '' ||
        clean === 'PLACEHOLDER' ||
        clean === 'undefined' ||
        clean === 'null' ||
        clean.includes('REPLACE_WITH_YOUR_REAL_KEY') ||
        clean.includes('YOUR_API_KEY'))
        return false;
    // Reject scrambled/sandbox values (contain # ! @ & * and look like a hash but aren't real)
    if (clean.length > 20 && (clean.includes('#') || clean.includes('!') || clean.includes('@')))
        return false;
    return true;
};
exports.isRealValue = isRealValue;
