"use strict";
/**
 * Yono Transparency: Neutral Vault Node Manager
 * Handles in-memory sync of encrypted resource nodes with zero database latency.
 */
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
exports.vaultNode = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var crypto_1 = require("../server/crypto");
var secureVault_1 = require("./secureVault");
var VaultNodeManager = /** @class */ (function () {
    function VaultNodeManager() {
        this.cache = new Map();
        this.vaultPath = path_1.default.join(process.cwd(), 'src', 'server', 'secure_vault.json');
        this.initialize();
        this.watchVault();
    }
    VaultNodeManager.prototype.initialize = function () {
        try {
            var newCache_1 = new Map();
            var setInCache_1 = function (key, val) {
                if (!key || !val || typeof key !== 'string' || typeof val !== 'string')
                    return;
                var cleanVal = val.trim();
                if (!cleanVal)
                    return;
                var kExact = key.trim();
                var kLower = kExact.toLowerCase();
                var kClean = kLower.replace(/[-_ ]+$/, '');
                var kNoSep = kLower.replace(/[-_ ]/g, '');
                if (kExact)
                    newCache_1.set(kExact, cleanVal);
                if (kLower)
                    newCache_1.set(kLower, cleanVal);
                if (kClean)
                    newCache_1.set(kClean, cleanVal);
                if (kNoSep)
                    newCache_1.set(kNoSep, cleanVal);
            };
            // 1. Try memory from imported static vault (ENCRYPTED_LINKS)
            var staticVault = secureVault_1.ENCRYPTED_LINKS;
            if (staticVault && staticVault.length > 50) {
                try {
                    var secret = (0, crypto_1.getAesSecret)();
                    var decrypted = (0, crypto_1.safeDecrypt)(secureVault_1.ENCRYPTED_LINKS, secret);
                    if (decrypted) {
                        var data = JSON.parse(decrypted);
                        if (Array.isArray(data)) {
                            data.forEach(function (node) {
                                var target = node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url;
                                setInCache_1(node.id, target);
                                setInCache_1(node.slug, target);
                            });
                        }
                        else if (typeof data === 'object') {
                            Object.entries(data).forEach(function (_a) {
                                var key = _a[0], node = _a[1];
                                var target = typeof node === 'string' ? node : (node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url);
                                setInCache_1(key, target);
                                if (node && typeof node === 'object') {
                                    setInCache_1(node.id, target);
                                    setInCache_1(node.slug, target);
                                }
                            });
                        }
                    }
                }
                catch (e) {
                    console.warn("[VaultNode] Static vault load warning:", e);
                }
            }
            // 2. Pre-seed from staticData.mockApps for instant zero-latency lookup
            try {
                var staticDataPath = path_1.default.join(process.cwd(), 'src', 'lib', 'staticData');
                var staticData = require(staticDataPath);
                if (staticData && Array.isArray(staticData.mockApps)) {
                    staticData.mockApps.forEach(function (app) {
                        var target = app.more_information_url || app.encrypted_link || app.download_url || app.url;
                        setInCache_1(app.id, target);
                        setInCache_1(app.slug, target);
                    });
                }
            }
            catch (e) { }
            // 3. Fallback to file for local dev and persistent runtime backups
            var diskBackupPaths = [
                this.vaultPath,
                path_1.default.join(process.cwd(), '.local', 'secure_vault.json'),
                path_1.default.join(process.cwd(), '.local', 'secure_links_backup.json'),
                path_1.default.join(process.cwd(), 'src', 'lib', 'secure_links_backup.json')
            ];
            for (var _i = 0, diskBackupPaths_1 = diskBackupPaths; _i < diskBackupPaths_1.length; _i++) {
                var p = diskBackupPaths_1[_i];
                if (fs_1.default.existsSync(p)) {
                    try {
                        var raw = fs_1.default.readFileSync(p, 'utf8');
                        var data = JSON.parse(raw);
                        if (Array.isArray(data)) {
                            data.forEach(function (node) {
                                var target = node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url;
                                setInCache_1(node.id, target);
                                setInCache_1(node.slug, target);
                            });
                        }
                        else if (data && typeof data === 'object') {
                            Object.entries(data).forEach(function (_a) {
                                var key = _a[0], node = _a[1];
                                var target = typeof node === 'string' ? node : (node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url);
                                setInCache_1(key, target);
                                if (node && typeof node === 'object') {
                                    setInCache_1(node.id, target);
                                    setInCache_1(node.slug, target);
                                }
                            });
                        }
                    }
                    catch (e) { }
                }
            }
            this.cache = newCache_1;
            console.log("[VaultNode] Loaded ".concat(this.cache.size, " node key mappings into memory."));
        }
        catch (error) {
            console.error('[VaultNode] Initialization failed:', error);
        }
    };
    /**
     * Directly injects or updates a key-value mapping in memory for instant resolution.
     */
    VaultNodeManager.prototype.setPayload = function (key, url) {
        if (!key || !url || typeof key !== 'string' || typeof url !== 'string')
            return;
        var cleanUrl = url.trim();
        if (!cleanUrl)
            return;
        var kExact = key.trim();
        var kLower = kExact.toLowerCase();
        var kClean = kLower.replace(/[-_ ]+$/, '');
        var kNoSep = kLower.replace(/[-_ ]/g, '');
        if (kExact)
            this.cache.set(kExact, cleanUrl);
        if (kLower)
            this.cache.set(kLower, cleanUrl);
        if (kClean)
            this.cache.set(kClean, cleanUrl);
        if (kNoSep)
            this.cache.set(kNoSep, cleanUrl);
    };
    /**
     * Ingests an array or object of item mappings directly into memory.
     */
    VaultNodeManager.prototype.setPayloads = function (items) {
        var _this = this;
        if (!items)
            return;
        var secret = (0, crypto_1.getAesSecret)();
        var processItem = function (node) {
            if (!node)
                return;
            var target = typeof node === 'string' ? node : (node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url);
            if (!target || typeof target !== 'string')
                return;
            var trimmed = target.trim();
            if (trimmed.startsWith('U2FsdGVkX1')) {
                var dec = (0, crypto_1.safeDecrypt)(trimmed, secret);
                if (dec && dec.trim().length > 0) {
                    trimmed = dec.trim();
                }
            }
            if (typeof node === 'object') {
                if (node.id)
                    _this.setPayload(node.id, trimmed);
                if (node.slug)
                    _this.setPayload(node.slug, trimmed);
            }
        };
        if (Array.isArray(items)) {
            items.forEach(processItem);
        }
        else if (typeof items === 'object') {
            Object.entries(items).forEach(function (_a) {
                var key = _a[0], node = _a[1];
                _this.setPayload(key, typeof node === 'string' ? node : (node.more_information_url || node.encrypted_link || node.download_url || node.payload || node.url));
                if (node && typeof node === 'object') {
                    processItem(node);
                }
            });
        }
    };
    VaultNodeManager.prototype.watchVault = function () {
        var _this = this;
        try {
            fs_1.default.watchFile(this.vaultPath, function (curr, prev) {
                if (curr.mtime !== prev.mtime) {
                    console.log('[VaultNode] Vault file changed, refreshing cache...');
                    _this.initialize();
                }
            });
        }
        catch (e) { }
    };
    /**
     * Retrieves and decrypts a resource node instantly from memory.
     */
    VaultNodeManager.prototype.getSyncPayload = function (slug) {
        return __awaiter(this, void 0, void 0, function () {
            var candidates, cachedPayload, _i, candidates_1, cand, trimmed, secret, decrypted;
            return __generator(this, function (_a) {
                if (!slug || typeof slug !== 'string')
                    return [2 /*return*/, null];
                candidates = Array.from(new Set([
                    slug,
                    slug.trim(),
                    slug.toLowerCase().trim(),
                    slug.toLowerCase().trim().replace(/[-_ ]+$/, ''),
                    slug.toLowerCase().trim().replace(/[-_ ]/g, '')
                ])).filter(Boolean);
                for (_i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
                    cand = candidates_1[_i];
                    if (this.cache.has(cand)) {
                        cachedPayload = this.cache.get(cand);
                        if (cachedPayload && cachedPayload.trim().length > 0)
                            break;
                    }
                }
                if (!cachedPayload)
                    return [2 /*return*/, null];
                trimmed = cachedPayload.trim();
                if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                    return [2 /*return*/, trimmed];
                }
                if (trimmed.startsWith('U2FsdGVkX1')) {
                    try {
                        secret = (0, crypto_1.getAesSecret)();
                        decrypted = (0, crypto_1.safeDecrypt)(trimmed, secret);
                        if (decrypted && decrypted.trim().length > 0) {
                            return [2 /*return*/, decrypted.trim()];
                        }
                    }
                    catch (error) {
                        return [2 /*return*/, null];
                    }
                }
                return [2 /*return*/, trimmed];
            });
        });
    };
    /**
     * Refreshes the in-memory cache.
     */
    VaultNodeManager.prototype.refresh = function () {
        this.cache.clear();
        this.initialize();
    };
    return VaultNodeManager;
}());
exports.vaultNode = new VaultNodeManager();
