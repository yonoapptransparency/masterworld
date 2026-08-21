"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityRouter = void 0;
exports.clearResolvedLinkCache = clearResolvedLinkCache;
exports.resolveDestinationForApp = resolveDestinationForApp;
var express_1 = __importDefault(require("express"));
var crypto_1 = __importDefault(require("crypto"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var security_1 = require("../security");
var secureVault_1 = require("../../lib/secureVault");
var vaultNode_1 = require("../../lib/vaultNode");
var crypto_2 = require("../crypto");
var firebase_1 = require("../firebase");
var seoHelper_1 = require("../../seoHelper");
exports.securityRouter = express_1.default.Router();
// In-memory fast cache for resolved links (< 2ms latency for repeated requests)
var resolvedLinkCache = new Map();
var LINK_CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache
function clearResolvedLinkCache(key) {
    if (key) {
        resolvedLinkCache.delete(key.toLowerCase());
    }
    else {
        resolvedLinkCache.clear();
    }
}
/**
 * Validates whether a target URL is safe and valid for redirection
 */
function isValidTargetUrl(url) {
    if (!url || typeof url !== 'string')
        return false;
    var clean = url.trim();
    var cleanLower = clean.toLowerCase();
    if (clean === '' || cleanLower === 'undefined' || cleanLower === 'null' || clean === '#')
        return false;
    if (cleanLower.includes('com.rummydex') || cleanLower.includes('com.example'))
        return false;
    // Reject circular loops to our own site or internal routes
    if (cleanLower.includes('rummydex.com/download/') ||
        cleanLower.includes('rummydex.com/api/') ||
        cleanLower.includes('localhost') ||
        cleanLower.includes('0.0.0.0') ||
        cleanLower.includes('127.0.0.1') ||
        cleanLower.includes('ais-dev-') ||
        cleanLower.includes('ais-pre-') ||
        cleanLower.includes('.run.app'))
        return false;
    // Check valid protocol or domain
    if (!cleanLower.startsWith('http://') && !cleanLower.startsWith('https://')) {
        if (clean.includes('.') && !clean.includes(' ')) {
            return true;
        }
        return false;
    }
    return true;
}
/**
 * Helper to search for an app's destination URL inside a parsed vault object
 */
function findUrlInVaultParsed(parsed, keysToSearch, AES_SECRET) {
    if (!parsed)
        return '';
    var searchSet = new Set(keysToSearch.map(function (k) { return k.toLowerCase().trim(); }).filter(Boolean));
    var searchSetNoSep = new Set(keysToSearch.map(function (k) { return k.toLowerCase().trim().replace(/[-_ ]/g, ''); }).filter(Boolean));
    var foundRaw = '';
    if (Array.isArray(parsed)) {
        var item = parsed.find(function (i) {
            var iId = (i.id || '').toLowerCase().trim();
            var iSlug = (i.slug || '').toLowerCase().trim();
            var iIdNoSep = iId.replace(/[-_ ]/g, '');
            var iSlugNoSep = iSlug.replace(/[-_ ]/g, '');
            return searchSet.has(iId) || searchSet.has(iSlug) || searchSetNoSep.has(iIdNoSep) || searchSetNoSep.has(iSlugNoSep);
        });
        if (item) {
            foundRaw = item.more_information_url || item.encrypted_link || item.download_url || item.payload || item.url || '';
        }
    }
    else if (parsed && typeof parsed === 'object') {
        for (var _i = 0, _a = Object.entries(parsed); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            var kClean = k.toLowerCase().trim();
            var kNoSep = kClean.replace(/[-_ ]/g, '');
            if (searchSet.has(kClean) || searchSetNoSep.has(kNoSep)) {
                if (typeof v === 'string') {
                    foundRaw = v;
                }
                else if (v && typeof v === 'object') {
                    foundRaw = v.more_information_url || v.encrypted_link || v.download_url || v.payload || v.url || '';
                }
                if (foundRaw)
                    break;
            }
        }
    }
    if (foundRaw && typeof foundRaw === 'string' && foundRaw.trim().length > 0) {
        var trimmed = foundRaw.trim();
        var finalUrl = trimmed.startsWith('U2FsdGVkX1') ? (0, crypto_2.safeDecrypt)(trimmed, AES_SECRET) : trimmed;
        if (isValidTargetUrl(finalUrl)) {
            return finalUrl.trim();
        }
    }
    // 8. Check public_backup.json fallback
    try {
        var backupPath = path_1.default.join(process.cwd(), 'src/lib/public_backup.json');
        if (fs_1.default.existsSync(backupPath)) {
            var rawStatic = fs_1.default.readFileSync(backupPath, 'utf8');
            var parsedStatic = JSON.parse(rawStatic);
            var apps = (parsedStatic === null || parsedStatic === void 0 ? void 0 : parsedStatic.apps) || (parsedStatic === null || parsedStatic === void 0 ? void 0 : parsedStatic.mockApps) || [];
            var matched = apps.find(function (a) {
                var sId = (a.id || '').toLowerCase().trim();
                var sSlug = (a.slug || '').toLowerCase().trim();
                var sIdStripped = sId.replace(/[-_ ]/g, '');
                var sSlugStripped = sSlug.replace(/[-_ ]/g, '');
                return searchKeys.includes(sId) || searchKeys.includes(sSlug) || searchKeys.includes(sIdStripped) || searchKeys.includes(sSlugStripped);
            });
            if (matched) {
                var rawUrl = matched.more_information_url || matched.encrypted_link || matched.download_url || matched.url;
                if (rawUrl && typeof rawUrl === 'string') {
                    var dec = rawUrl.startsWith('U2FsdGVkX1') ? (0, crypto_2.safeDecrypt)(rawUrl, AES_SECRET) : rawUrl;
                    if (isValidTargetUrl(dec)) {
                        resolvedLinkCache.set(lowerAppId, { url: dec.trim(), timestamp: Date.now() });
                        return dec.trim();
                    }
                }
            }
        }
    }
    catch (_) { }
    return '';
}
/**
 * Central Server-Authoritative Link Resolver
 * Looks up target destination securely without ever exposing keys or ciphertexts to the browser.
 */
function resolveDestinationForApp(appId) {
    return __awaiter(this, void 0, void 0, function () {
        var cleanAppId, lowerAppId, cached, AES_SECRET, searchKeys, serverVaultPath, fileData, parsed, found, db_1, vaultDocs, docSnaps, _i, docSnaps_1, vaultSnap, data, ciphertext, dec, parsed, foundUrl, getRawFirebaseConfig, config, dbId, apiKeyParam, vaultDocs, _a, vaultDocs_1, docName, url, restRes, data, ciphertext, dec, parsed, foundUrl, e_1, _1, payload, _2, decryptedVault, parsed, foundUrl, storeData, apps, matched, rawUrl, dec, _3, staticDataPath, rawStatic, parsedStatic, apps, matched, rawUrl, dec;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!appId || typeof appId !== 'string')
                        return [2 /*return*/, ''];
                    cleanAppId = appId.trim();
                    lowerAppId = cleanAppId.toLowerCase();
                    cached = resolvedLinkCache.get(lowerAppId);
                    if (cached && Date.now() - cached.timestamp < LINK_CACHE_TTL) {
                        return [2 /*return*/, cached.url];
                    }
                    AES_SECRET = (0, crypto_2.getAesSecret)();
                    searchKeys = Array.from(new Set([
                        cleanAppId,
                        lowerAppId,
                        lowerAppId.replace(/[-_ ]+$/, ''),
                        lowerAppId.replace(/[-_ ]/g, '')
                    ])).filter(Boolean);
                    // 2. Check local server vault (src/server/secure_vault.json)
                    try {
                        serverVaultPath = path_1.default.join(process.cwd(), 'src/server/secure_vault.json');
                        if (fs_1.default.existsSync(serverVaultPath)) {
                            fileData = fs_1.default.readFileSync(serverVaultPath, 'utf8');
                            if (fileData && fileData.trim().length > 2) {
                                parsed = JSON.parse(fileData);
                                found = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                                if (found && isValidTargetUrl(found)) {
                                    resolvedLinkCache.set(lowerAppId, { url: found, timestamp: Date.now() });
                                    return [2 /*return*/, found];
                                }
                            }
                        }
                    }
                    catch (_) { }
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 12, , 13]);
                    db_1 = (0, firebase_1.getFirebaseAdminDb)();
                    if (!db_1) return [3 /*break*/, 3];
                    vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
                    return [4 /*yield*/, Promise.all(vaultDocs.map(function (docName) { return db_1.collection('store_data').doc(docName).get().catch(function () { return null; }); }))];
                case 2:
                    docSnaps = _f.sent();
                    for (_i = 0, docSnaps_1 = docSnaps; _i < docSnaps_1.length; _i++) {
                        vaultSnap = docSnaps_1[_i];
                        if (vaultSnap && vaultSnap.exists) {
                            data = vaultSnap.data();
                            ciphertext = (data === null || data === void 0 ? void 0 : data.encryptedData) || (data === null || data === void 0 ? void 0 : data.encrypted_links);
                            if (ciphertext) {
                                dec = (0, crypto_2.safeDecrypt)(ciphertext, AES_SECRET);
                                if (dec) {
                                    try {
                                        parsed = JSON.parse(dec);
                                        vaultNode_1.vaultNode.setPayloads(parsed);
                                        foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                                        if (foundUrl && isValidTargetUrl(foundUrl)) {
                                            resolvedLinkCache.set(lowerAppId, { url: foundUrl, timestamp: Date.now() });
                                            return [2 /*return*/, foundUrl];
                                        }
                                    }
                                    catch (_) { }
                                }
                            }
                        }
                    }
                    return [3 /*break*/, 11];
                case 3:
                    getRawFirebaseConfig = require('../firebase').getRawFirebaseConfig;
                    config = getRawFirebaseConfig();
                    if (!(config && config.projectId)) return [3 /*break*/, 11];
                    dbId = config.firestoreDatabaseId || config.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
                    apiKeyParam = config.apiKey ? "?key=".concat(config.apiKey) : '';
                    vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
                    _a = 0, vaultDocs_1 = vaultDocs;
                    _f.label = 4;
                case 4:
                    if (!(_a < vaultDocs_1.length)) return [3 /*break*/, 11];
                    docName = vaultDocs_1[_a];
                    _f.label = 5;
                case 5:
                    _f.trys.push([5, 9, , 10]);
                    url = "https://firestore.googleapis.com/v1/projects/".concat(config.projectId, "/databases/").concat(dbId, "/documents/store_data/").concat(docName).concat(apiKeyParam);
                    return [4 /*yield*/, fetch(url)];
                case 6:
                    restRes = _f.sent();
                    if (!restRes.ok) return [3 /*break*/, 8];
                    return [4 /*yield*/, restRes.json()];
                case 7:
                    data = _f.sent();
                    ciphertext = ((_c = (_b = data.fields) === null || _b === void 0 ? void 0 : _b.encryptedData) === null || _c === void 0 ? void 0 : _c.stringValue) || ((_e = (_d = data.fields) === null || _d === void 0 ? void 0 : _d.encrypted_links) === null || _e === void 0 ? void 0 : _e.stringValue);
                    if (ciphertext) {
                        dec = (0, crypto_2.safeDecrypt)(ciphertext, AES_SECRET);
                        if (dec) {
                            parsed = JSON.parse(dec);
                            vaultNode_1.vaultNode.setPayloads(parsed);
                            foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                            if (foundUrl && isValidTargetUrl(foundUrl)) {
                                resolvedLinkCache.set(lowerAppId, { url: foundUrl, timestamp: Date.now() });
                                return [2 /*return*/, foundUrl];
                            }
                        }
                    }
                    _f.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    e_1 = _f.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _a++;
                    return [3 /*break*/, 4];
                case 11: return [3 /*break*/, 13];
                case 12:
                    _1 = _f.sent();
                    return [3 /*break*/, 13];
                case 13:
                    _f.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, vaultNode_1.vaultNode.getSyncPayload(cleanAppId)];
                case 14:
                    payload = _f.sent();
                    if (payload && isValidTargetUrl(payload)) {
                        resolvedLinkCache.set(lowerAppId, { url: payload, timestamp: Date.now() });
                        return [2 /*return*/, payload];
                    }
                    return [3 /*break*/, 16];
                case 15:
                    _2 = _f.sent();
                    return [3 /*break*/, 16];
                case 16:
                    // 5. Check ENCRYPTED_LINKS vault constant
                    if (secureVault_1.ENCRYPTED_LINKS) {
                        decryptedVault = (0, crypto_2.safeDecrypt)(secureVault_1.ENCRYPTED_LINKS, AES_SECRET);
                        if (decryptedVault) {
                            try {
                                parsed = JSON.parse(decryptedVault);
                                foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                                if (foundUrl && isValidTargetUrl(foundUrl)) {
                                    resolvedLinkCache.set(lowerAppId, { url: foundUrl, timestamp: Date.now() });
                                    return [2 /*return*/, foundUrl];
                                }
                            }
                            catch (_) { }
                        }
                    }
                    _f.label = 17;
                case 17:
                    _f.trys.push([17, 19, , 20]);
                    return [4 /*yield*/, (0, seoHelper_1.fetchStoreData)()];
                case 18:
                    storeData = _f.sent();
                    apps = (storeData === null || storeData === void 0 ? void 0 : storeData.apps) || [];
                    matched = apps.find(function (a) {
                        var sId = (a.id || '').toLowerCase().trim();
                        var sSlug = (a.slug || '').toLowerCase().trim();
                        var sIdStripped = sId.replace(/[-_ ]/g, '');
                        var sSlugStripped = sSlug.replace(/[-_ ]/g, '');
                        return searchKeys.includes(sId) || searchKeys.includes(sSlug) || searchKeys.includes(sIdStripped) || searchKeys.includes(sSlugStripped);
                    });
                    if (matched) {
                        rawUrl = matched.more_information_url || matched.encrypted_link || matched.download_url || matched.url;
                        if (rawUrl && typeof rawUrl === 'string') {
                            dec = rawUrl.startsWith('U2FsdGVkX1') ? (0, crypto_2.safeDecrypt)(rawUrl, AES_SECRET) : rawUrl;
                            if (isValidTargetUrl(dec)) {
                                resolvedLinkCache.set(lowerAppId, { url: dec.trim(), timestamp: Date.now() });
                                return [2 /*return*/, dec.trim()];
                            }
                        }
                    }
                    return [3 /*break*/, 20];
                case 19:
                    _3 = _f.sent();
                    return [3 /*break*/, 20];
                case 20:
                    // 7. Check staticData.json fallback directly
                    try {
                        staticDataPath = path_1.default.join(process.cwd(), 'src/lib/staticData.json');
                        if (fs_1.default.existsSync(staticDataPath)) {
                            rawStatic = fs_1.default.readFileSync(staticDataPath, 'utf8');
                            parsedStatic = JSON.parse(rawStatic);
                            apps = (parsedStatic === null || parsedStatic === void 0 ? void 0 : parsedStatic.mockApps) || [];
                            matched = apps.find(function (a) {
                                var sId = (a.id || '').toLowerCase().trim();
                                var sSlug = (a.slug || '').toLowerCase().trim();
                                var sIdStripped = sId.replace(/[-_ ]/g, '');
                                var sSlugStripped = sSlug.replace(/[-_ ]/g, '');
                                return searchKeys.includes(sId) || searchKeys.includes(sSlug) || searchKeys.includes(sIdStripped) || searchKeys.includes(sSlugStripped);
                            });
                            if (matched) {
                                rawUrl = matched.more_information_url || matched.encrypted_link || matched.download_url || matched.url;
                                if (rawUrl && typeof rawUrl === 'string') {
                                    dec = rawUrl.startsWith('U2FsdGVkX1') ? (0, crypto_2.safeDecrypt)(rawUrl, AES_SECRET) : rawUrl;
                                    if (isValidTargetUrl(dec)) {
                                        resolvedLinkCache.set(lowerAppId, { url: dec.trim(), timestamp: Date.now() });
                                        return [2 /*return*/, dec.trim()];
                                    }
                                }
                            }
                        }
                    }
                    catch (_) { }
                    return [2 /*return*/, ''];
            }
        });
    });
}
/**
 * Sends an anonymous zero-referrer bounce HTML page with strict security headers
 */
function sendAnonymousBouncePage(res, targetUrl) {
    var finalUrl = targetUrl.trim();
    if (!finalUrl.toLowerCase().startsWith('http://') && !finalUrl.toLowerCase().startsWith('https://') && !finalUrl.toLowerCase().startsWith('market://')) {
        finalUrl = 'https://' + finalUrl;
    }
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    var b64Url = Buffer.from(finalUrl).toString('base64');
    var safeEscapedUrl = finalUrl.replace(/"/g, '&quot;');
    var bounceHtml = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"referrer\" content=\"no-referrer\">\n    <meta http-equiv=\"refresh\" content=\"1; url=".concat(safeEscapedUrl, "\">\n    <title>Connecting to Destination</title>\n    <style>\n      * { box-sizing: border-box; }\n      body { background: #09090b; color: #f4f4f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; }\n      .container { text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }\n      .loader { width: 44px; height: 44px; border: 3px solid #27272a; border-bottom-color: #10b981; border-radius: 50%; display: inline-block; animation: rotation 0.8s linear infinite; margin-bottom: 1.25rem; }\n      .title { font-size: 1.125rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }\n      .text { color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem; }\n      .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 0.875rem 1.5rem; background: #10b981; hover: #059669; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.95rem; letter-spacing: 0.025em; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); }\n      .btn:hover { background: #059669; }\n      .badge { display: inline-block; margin-top: 1rem; font-size: 0.75rem; color: #71717a; }\n      @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\n    </style>\n  </head>\n  <body>\n    <div class=\"container\">\n      <div class=\"loader\"></div>\n      <div class=\"title\">Connecting to Destination</div>\n      <div class=\"text\">Connecting you securely to the verified destination...</div>\n      <a id=\"direct-btn\" href=\"").concat(safeEscapedUrl, "\" target=\"_blank\" rel=\"noopener noreferrer nofollow\" class=\"btn\">\n        Click Here to Proceed\n      </a>\n      <div class=\"badge\">100% Verified & Encrypted</div>\n    </div>\n    <script>\n      (function() {\n        var _u = \"").concat(b64Url, "\";\n        var dest = \"\";\n        try {\n          dest = atob(_u);\n        } catch(e) {\n          dest = \"").concat(safeEscapedUrl, "\";\n        }\n\n        function redirect() {\n          try {\n            if (window.top && window.top !== window.self) {\n              try {\n                window.top.location.href = dest;\n                return;\n              } catch(_) {\n                // Cross-origin top navigation blocked by browser sandbox\n              }\n            }\n            window.location.replace(dest);\n          } catch(err) {\n            window.location.href = dest;\n          }\n        }\n\n        // Attempt immediate redirection\n        setTimeout(redirect, 150);\n      })();\n    </script>\n  </body>\n</html>");
    return res.status(200).send(bounceHtml);
}
/**
 * @route   POST /api/v1/public/secure-link
 * @route   GET /api/v1/public/secure-link
 * @desc    Ultra-fast, bot-protected direct link resolution (< 10ms)
 */
exports.securityRouter.all(['/api/v1/public/secure-link', '/api/v1/secure-link', '/api/v1/get-link'], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rawAppId, appId, ip, ua, isLimited, targetUrl, isJson;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                rawAppId = (((_a = req.body) === null || _a === void 0 ? void 0 : _a.appId) || ((_b = req.query) === null || _b === void 0 ? void 0 : _b.appId) || ((_c = req.body) === null || _c === void 0 ? void 0 : _c.id) || ((_d = req.query) === null || _d === void 0 ? void 0 : _d.id) || '');
                appId = (0, security_1.validateAppId)(rawAppId);
                ip = (0, security_1.getIp)(req);
                // 1. Anti-Bot Defense
                if ((0, security_1.isSuspiciousClient)(req)) {
                    console.warn(JSON.stringify({
                        timestamp: new Date().toISOString(),
                        eventType: "BOT_DETECTED",
                        clientIP: ip,
                        userAgent: req.headers['user-agent'],
                        appId: rawAppId,
                        reason: "Known scraper signature or missing browser context"
                    }));
                    return [2 /*return*/, res.status(403).json({ success: false, error: 'Forbidden: Automated access blocked.' })];
                }
                ua = (req.headers['user-agent'] || '');
                if (!ua || ua.trim().length < 5) {
                    console.warn(JSON.stringify({
                        timestamp: new Date().toISOString(),
                        eventType: "BOT_DETECTED",
                        clientIP: ip,
                        userAgent: ua,
                        appId: rawAppId,
                        reason: "Missing or truncated user agent"
                    }));
                    return [2 /*return*/, res.status(403).json({ success: false, error: 'Forbidden: Valid browser agent required.' })];
                }
                return [4 /*yield*/, (0, security_1.rateLimit)(ip, 30, 60000)];
            case 1:
                isLimited = _f.sent();
                if (isLimited) {
                    console.warn(JSON.stringify({
                        timestamp: new Date().toISOString(),
                        eventType: "RATE_LIMIT_EXCEEDED",
                        clientIP: ip,
                        userAgent: ua,
                        appId: rawAppId,
                        reason: "Exceeded 30 requests per minute"
                    }));
                    return [2 /*return*/, res.status(429).json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' })];
                }
                if (!appId) {
                    console.warn(JSON.stringify({
                        timestamp: new Date().toISOString(),
                        eventType: "INVALID_INPUT",
                        clientIP: ip,
                        userAgent: ua,
                        appId: rawAppId,
                        reason: "Malformed or missing application identifier"
                    }));
                    return [2 /*return*/, res.status(400).json({ success: false, error: 'Invalid or missing application identifier.' })];
                }
                return [4 /*yield*/, resolveDestinationForApp(appId)];
            case 2:
                targetUrl = _f.sent();
                if (!targetUrl) {
                    return [2 /*return*/, res.status(404).json({ success: false, error: 'Target destination is not available for this application.' })];
                }
                isJson = ((_e = req.headers['accept']) === null || _e === void 0 ? void 0 : _e.includes('application/json')) || req.method === 'POST';
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('Referrer-Policy', 'no-referrer');
                if (isJson) {
                    return [2 /*return*/, res.json({
                            success: true,
                            url: targetUrl,
                            appId: appId
                        })];
                }
                // If direct browser navigation, send fast zero-referrer bounce or redirect
                return [2 /*return*/, sendAnonymousBouncePage(res, targetUrl)];
        }
    });
}); });
/**
 * @route   GET /api/v1/clearance/start
 * @route   GET /api/v1/_chal
 * @desc    Initiates security challenge and returns a signed stateless challenge nonce
 */
exports.securityRouter.get(['/api/v1/clearance/start', '/api/v1/_chal'], function (req, res) {
    var appId = (req.query.appId || req.query.id || '');
    var sid = (0, security_1.ensureSession)(req, res);
    var realNonce = crypto_1.default.randomBytes(16).toString('hex');
    var difficulty = "0"; // Ultra-fast PoW check (~1ms execution)
    var expiry = Date.now() + 90000; // 90 seconds lifetime
    var secret = (0, crypto_2.getAesSecret)();
    var signature = crypto_1.default.createHmac('sha256', secret)
        .update("".concat(realNonce, ":").concat(sid, ":").concat(difficulty, ":").concat(expiry, ":").concat(appId.toLowerCase().trim()))
        .digest('hex').substring(0, 32);
    var statelessNonce = "".concat(realNonce, ".").concat(expiry, ".").concat(encodeURIComponent(appId.toLowerCase().trim()), ".").concat(signature);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Session-ID', sid);
    res.json({ nonce: statelessNonce, difficulty: difficulty, sid: sid });
});
/**
 * @route   POST /api/v1/clearance/complete
 * @route   POST /api/v1/_proc
 * @desc    Verifies challenge solution and issues single-use clearance nonce
 */
exports.securityRouter.post(['/api/v1/clearance/complete', '/api/v1/_proc'], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, nonce, solution, fingerprint, appId, clientSid, ip, cookieSid, parts, realNonce, expiry, boundAppId, signature, difficulty, secret, candidateSids, matchedSid, sessionForIssuance, check, oneTimeNonce, redirectUrl, token;
    var _b, _c;
    return __generator(this, function (_d) {
        _a = req.body, nonce = _a.nonce, solution = _a.solution, fingerprint = _a.fingerprint, appId = _a.appId, clientSid = _a.sid;
        ip = (0, security_1.getIp)(req);
        cookieSid = ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b["__Host-sid"]) || ((_c = req.cookies) === null || _c === void 0 ? void 0 : _c["sid"]);
        if (!nonce || solution === undefined || !appId) {
            return [2 /*return*/, res.status(400).json({ error: 'Incomplete security context' })];
        }
        parts = nonce.split('.');
        if (parts.length < 3) {
            return [2 /*return*/, res.status(403).json({ error: 'Challenge invalid format' })];
        }
        realNonce = '';
        expiry = '';
        boundAppId = '';
        signature = '';
        if (parts.length === 4) {
            realNonce = parts[0], expiry = parts[1], boundAppId = parts[2], signature = parts[3];
            boundAppId = decodeURIComponent(boundAppId);
        }
        else {
            realNonce = parts[0], expiry = parts[1], signature = parts[2];
        }
        difficulty = parts.length === 4 ? "0" : "0";
        secret = (0, crypto_2.getAesSecret)();
        if (Date.now() > Number(expiry)) {
            return [2 /*return*/, res.status(403).json({ error: 'Challenge expired. Please try again.' })];
        }
        candidateSids = Array.from(new Set([clientSid, cookieSid].filter(Boolean)));
        matchedSid = candidateSids.find(function (s) {
            if (parts.length === 4) {
                var sig = crypto_1.default.createHmac('sha256', secret)
                    .update("".concat(realNonce, ":").concat(s, ":").concat(difficulty, ":").concat(expiry, ":").concat((boundAppId || appId).toLowerCase().trim()))
                    .digest('hex').substring(0, 32);
                return sig === signature;
            }
            else {
                var sig = crypto_1.default.createHmac('sha256', secret)
                    .update("".concat(realNonce, ":").concat(s, ":").concat(difficulty, ":").concat(expiry))
                    .digest('hex').substring(0, 16);
                return sig === signature;
            }
        });
        if (!matchedSid && candidateSids.length > 0) {
            return [2 /*return*/, res.status(403).json({ error: 'Challenge signature verification failed.' })];
        }
        sessionForIssuance = matchedSid || clientSid || cookieSid || 'sec_session';
        check = crypto_1.default.createHash('sha256').update(nonce + solution).digest('hex');
        if (!check.startsWith(difficulty)) {
            return [2 /*return*/, res.status(403).json({ error: 'Proof of work verification failed.' })];
        }
        oneTimeNonce = (0, security_1.issueClearanceNonce)(appId, sessionForIssuance, ip, fingerprint || '');
        redirectUrl = "/api/v1/clearance/redirect?nonce=".concat(oneTimeNonce, "&appId=").concat(encodeURIComponent(appId));
        token = (0, security_1.generateToken)(ip, sessionForIssuance, fingerprint || '', appId);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.json({
            success: true,
            nonce: oneTimeNonce,
            redirectUrl: redirectUrl,
            token: token
        });
        return [2 /*return*/];
    });
}); });
/**
 * @route   GET /api/v1/clearance/redirect
 * @desc    Server-authoritative clearance destination redirection with atomic single-use nonce
 */
exports.securityRouter.get('/api/v1/clearance/redirect', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var nonce, appId, ip, sid, validation, targetUrl;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                nonce = (req.query.nonce || req.query.n);
                appId = (req.query.appId || req.query.id);
                ip = (0, security_1.getIp)(req);
                sid = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a["__Host-sid"]) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b["sid"]) || req.query.sid;
                if (!appId) {
                    return [2 /*return*/, res.status(400).send("<h1>400 Bad Request</h1><p>Missing application identifier.</p>")];
                }
                if (!nonce) {
                    return [2 /*return*/, res.status(403).send("\n      <!DOCTYPE html>\n      <html>\n        <head><title>Security Clearance Required - RummyDex</title><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" /></head>\n        <body style=\"font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;\">\n          <div style=\"text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;\">\n            <h2 style=\"font-size: 1.25rem; font-weight: 800; color: #ef4444; margin-bottom: 0.5rem;\">Access Denied</h2>\n            <p style=\"color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;\">Direct or unauthenticated access is forbidden. Please complete the security clearance check from the app page.</p>\n            <a href=\"/app/".concat(encodeURIComponent(appId), "\" style=\"display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;\">Return to App Page</a>\n          </div>\n        </body>\n      </html>\n    "))];
                }
                validation = (0, security_1.consumeClearanceNonce)(nonce, appId, sid || '', ip);
                if (!validation.valid) {
                    return [2 /*return*/, res.status(403).send("\n      <!DOCTYPE html>\n      <html>\n        <head><title>Clearance Expired - RummyDex</title><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" /></head>\n        <body style=\"font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;\">\n          <div style=\"text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;\">\n            <h2 style=\"font-size: 1.25rem; font-weight: 800; color: #f59e0b; margin-bottom: 0.5rem;\">Session Expired or Already Used</h2>\n            <p style=\"color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;\">".concat(validation.reason || 'Your single-use clearance token has expired or already been consumed.', "</p>\n            <a href=\"/app/").concat(encodeURIComponent(appId), "\" style=\"display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;\">Start New Verification</a>\n          </div>\n        </body>\n      </html>\n    "))];
                }
                return [4 /*yield*/, resolveDestinationForApp(appId)];
            case 1:
                targetUrl = _c.sent();
                if (targetUrl) {
                    return [2 /*return*/, sendAnonymousBouncePage(res, targetUrl)];
                }
                return [2 /*return*/, res.status(404).send("\n    <!DOCTYPE html>\n    <html>\n      <head><title>Link Not Configured - RummyDex</title><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" /></head>\n      <body style=\"font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;\">\n        <div style=\"text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;\">\n          <h2 style=\"font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;\">Link Not Available</h2>\n          <p style=\"color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;\">The target destination for this application has not been configured yet. Please check back later.</p>\n          <a href=\"/app/".concat(encodeURIComponent(appId), "\" style=\"display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;\">Go Back</a>\n        </div>\n      </body>\n    </html>\n  "))];
        }
    });
}); });
/**
 * @route   GET /api/v1/moreinfo-resolve
 * @desc    Backward-compatible resolver
 */
exports.securityRouter.get("/api/v1/moreinfo-resolve", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, appId, ip, sid, fingerprint, targetUrl;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                token = (req.query.token || req.query.t);
                appId = (req.query.id || req.query.appId);
                ip = (0, security_1.getIp)(req);
                sid = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a["__Host-sid"]) || req.query.sid || '';
                fingerprint = req.query.fp || '';
                if (!appId) {
                    return [2 /*return*/, res.status(400).send("<h1>400 Bad Request</h1><p>Missing application identifier.</p>")];
                }
                // Verify token if provided
                if (token && !(0, security_1.verifyToken)(token, ip, sid, fingerprint, appId)) {
                    console.warn("[SECURITY] Token verification failed for appId: ".concat(appId));
                }
                return [4 /*yield*/, resolveDestinationForApp(appId)];
            case 1:
                targetUrl = _b.sent();
                if (targetUrl) {
                    return [2 /*return*/, sendAnonymousBouncePage(res, targetUrl)];
                }
                return [2 /*return*/, res.status(404).send("\n    <!DOCTYPE html>\n    <html>\n      <head><title>Link Not Configured - RummyDex</title><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" /></head>\n      <body style=\"font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;\">\n        <div style=\"text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;\">\n          <h2 style=\"font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;\">Link Not Available</h2>\n          <p style=\"color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;\">The target destination for this application has not been configured yet.</p>\n          <a href=\"/app/".concat(encodeURIComponent(appId), "\" style=\"display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;\">Go Back</a>\n        </div>\n      </body>\n    </html>\n  "))];
        }
    });
}); });
/**
 * @route   GET /api/v1/link-check
 * @desc    Checks if an app has a configured link in the vault without returning any URLs
 */
exports.securityRouter.get('/api/v1/link-check', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var appId, targetUrl, _4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                appId = req.query.id;
                if (!appId)
                    return [2 /*return*/, res.json({ configured: false })];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, resolveDestinationForApp(appId)];
            case 2:
                targetUrl = _a.sent();
                return [2 /*return*/, res.json({ configured: !!targetUrl })];
            case 3:
                _4 = _a.sent();
                return [2 /*return*/, res.json({ configured: false })];
            case 4: return [2 /*return*/];
        }
    });
}); });
