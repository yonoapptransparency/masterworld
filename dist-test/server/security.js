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
exports.tokenStore = exports.usedTokens = exports.nonceStore = exports.clearanceNonceStore = exports.rateLimit = exports.isSuspiciousClient = void 0;
exports.verifyTurnstile = verifyTurnstile;
exports.validateAppId = validateAppId;
exports.isFingerprintValid = isFingerprintValid;
exports.getIp = getIp;
exports.parseIpv4 = parseIpv4;
exports.isPrivateIpv4 = isPrivateIpv4;
exports.isSafeUrl = isSafeUrl;
exports.issueClearanceNonce = issueClearanceNonce;
exports.consumeClearanceNonce = consumeClearanceNonce;
exports.ensureSession = ensureSession;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
var crypto_1 = __importDefault(require("crypto"));
var dns_1 = __importDefault(require("dns"));
var config_1 = require("./config");
function verifyTurnstile(token, ip) {
    return __awaiter(this, void 0, void 0, function () {
        var params, res, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!config_1.CF_TURNSTILE_SECRET)
                        return [2 /*return*/, true];
                    if (!token) {
                        console.warn('[CF_TURNSTILE] Rejected: Token missing from request. IP:', ip);
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    params = new URLSearchParams({
                        secret: config_1.CF_TURNSTILE_SECRET,
                        response: token,
                        remoteip: ip
                    });
                    return [4 /*yield*/, fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                            method: 'POST',
                            body: params,
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (!data.success) {
                        console.warn('[CF_TURNSTILE] Failed:', data['error-codes']);
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
                case 4:
                    e_1 = _a.sent();
                    console.error('[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:', ip, e_1);
                    return [2 /*return*/, false]; // fail-closed to avoid bypassing security on network errors
                case 5: return [2 /*return*/];
            }
        });
    });
}
function validateAppId(appId) {
    if (typeof appId !== 'string')
        return null;
    var clean = appId.trim();
    if (clean.length < 1 || clean.length > 64)
        return null;
    return /^[a-zA-Z0-9-_]+$/.test(clean) ? clean.toLowerCase() : null;
}
var isSuspiciousClient = function (req) {
    var ua = (req.headers['user-agent'] || '');
    var trimmed = ua.trim();
    if (!trimmed || trimmed.length < 5)
        return true;
    if (config_1.BAD_UA.some(function (rx) { return rx.test(ua); }))
        return true;
    // Browser Context Checks: Verifies typical browser request indicators
    var acceptHeader = req.headers.accept || '';
    var hasAccept = acceptHeader.includes('text/html') || acceptHeader.includes('application/json');
    var hasSecFetch = req.headers['sec-fetch-site'] || req.headers['sec-fetch-mode'];
    var hasOrigin = req.headers.origin || req.headers.referer;
    // Real browsers sending POST should typically have an origin, referer, or sec-fetch headers
    // We only reject if ALL of these browser context indicators are completely missing (e.g. basic scripts)
    if (!hasAccept && !hasSecFetch && !hasOrigin && req.method === 'POST') {
        return true;
    }
    return false;
};
exports.isSuspiciousClient = isSuspiciousClient;
function isFingerprintValid(fp) {
    if (!fp || typeof fp !== 'string')
        return false;
    if (fp.length < 8)
        return false;
    if (/^(.)\1+$/.test(fp))
        return false; // invalid entropy payload
    return true;
}
var globalRateLimitMap = new Map();
var rateLimit = function (ip_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([ip_1], args_1, true), void 0, function (ip, limit, windowMs) {
        var now, record, _a, _b, _c, key, val;
        if (limit === void 0) { limit = config_1.MAX_HITS; }
        if (windowMs === void 0) { windowMs = config_1.WINDOW; }
        return __generator(this, function (_d) {
            try {
                now = Date.now();
                record = globalRateLimitMap.get(ip);
                if (!record || now > record.resetTime) {
                    record = { count: 0, resetTime: now + windowMs };
                }
                record.count++;
                globalRateLimitMap.set(ip, record);
                if (Math.random() < 0.01) {
                    for (_a = 0, _b = globalRateLimitMap.entries(); _a < _b.length; _a++) {
                        _c = _b[_a], key = _c[0], val = _c[1];
                        if (now > val.resetTime)
                            globalRateLimitMap.delete(key);
                    }
                }
                return [2 /*return*/, record.count > limit];
            }
            catch (e) {
                return [2 /*return*/, true]; // fail-closed for security
            }
            return [2 /*return*/];
        });
    });
};
exports.rateLimit = rateLimit;
function getIp(req) {
    var _a;
    return req.ip || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || "unknown";
}
function parseIpv4(hostname) {
    var parts = hostname.split('.');
    if (parts.length === 0 || parts.length > 4)
        return null;
    var ipBytes = [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var num = void 0;
        if (part.toLowerCase().startsWith('0x')) {
            num = parseInt(part, 16);
        }
        else if (part.startsWith('0') && part.length > 1) {
            num = parseInt(part, 8);
        }
        else {
            num = parseInt(part, 10);
        }
        if (isNaN(num) || num < 0 || num > 255)
            return null;
        ipBytes.push(num);
    }
    if (parts.length === 1) {
        var val = ipBytes[0];
        if (isNaN(val) || val < 0 || val > 0xffffffff)
            return null;
        return [
            (val >>> 24) & 255,
            (val >>> 16) & 255,
            (val >>> 8) & 255,
            val & 255
        ];
    }
    else if (parts.length === 2) {
        var a = ipBytes[0];
        var b = ipBytes[1];
        if (b > 0xffffff)
            return null;
        return [
            a,
            (b >>> 16) & 255,
            (b >>> 8) & 255,
            b & 255
        ];
    }
    else if (parts.length === 3) {
        var a = ipBytes[0];
        var b = ipBytes[1];
        var c = ipBytes[2];
        if (c > 0xffff)
            return null;
        return [
            a,
            b,
            (c >>> 8) & 255,
            c & 255
        ];
    }
    return ipBytes;
}
function isPrivateIpv4(ip) {
    var a = ip[0], b = ip[1], c = ip[2];
    if (a === 127)
        return true;
    if (a === 10)
        return true;
    if (a === 172 && b >= 16 && b <= 31)
        return true;
    if (a === 192 && b === 168)
        return true;
    if (a === 169 && b === 254)
        return true;
    if (a === 0)
        return true;
    if (a === 100 && b >= 64 && b <= 127)
        return true;
    if (a === 192 && b === 0 && c === 0)
        return true;
    if (a === 192 && b === 0 && c === 2)
        return true;
    if (a === 198 && b >= 18 && b <= 19)
        return true;
    if (a === 198 && b === 51 && c >= 100 && c <= 103)
        return true;
    if (a === 203 && b === 0 && c === 113)
        return true;
    if (a >= 224 && a <= 239)
        return true;
    if (a >= 240)
        return true;
    return false;
}
function isSafeUrl(urlString) {
    return __awaiter(this, void 0, void 0, function () {
        var parsedUrl, hostname, ipv4Bytes, badHosts, addresses, _i, addresses_1, addr, ip, parsedIp, dnsErr_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    parsedUrl = new URL(urlString);
                    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                        return [2 /*return*/, false];
                    }
                    hostname = parsedUrl.hostname.toLowerCase();
                    ipv4Bytes = parseIpv4(hostname);
                    if (ipv4Bytes) {
                        if (isPrivateIpv4(ipv4Bytes))
                            return [2 /*return*/, false];
                    }
                    if (hostname === '[::1]' || hostname === '::1' || hostname.startsWith('[fc00') || hostname.startsWith('[fe80')) {
                        return [2 /*return*/, false];
                    }
                    badHosts = ['localhost', 'loopback', 'metadata', 'metadata.google', 'metadata.google.internal'];
                    if (badHosts.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
                        return [2 /*return*/, false];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dns_1.default.promises.lookup(hostname, { all: true })];
                case 2:
                    addresses = _b.sent();
                    for (_i = 0, addresses_1 = addresses; _i < addresses_1.length; _i++) {
                        addr = addresses_1[_i];
                        ip = addr.address;
                        parsedIp = parseIpv4(ip);
                        if (parsedIp) {
                            if (isPrivateIpv4(parsedIp))
                                return [2 /*return*/, false];
                        }
                        if (ip === '::1' || ip.startsWith('fc00:') || ip.startsWith('fe80:')) {
                            return [2 /*return*/, false];
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    dnsErr_1 = _b.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/, true];
                case 5:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.clearanceNonceStore = new Map();
exports.nonceStore = new Map();
exports.usedTokens = new Set();
exports.tokenStore = new Map();
// Automated cleanup of expired security nonces & tokens
setInterval(function () {
    var now = Date.now();
    for (var _i = 0, _a = exports.clearanceNonceStore.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], nonce = _b[0], data = _b[1];
        if (data.expiresAt < now || data.consumed) {
            exports.clearanceNonceStore.delete(nonce);
        }
    }
    for (var _c = 0, _d = exports.nonceStore.entries(); _c < _d.length; _c++) {
        var _e = _d[_c], nonce = _e[0], data = _e[1];
        if (data.expiresAt < now) {
            exports.nonceStore.delete(nonce);
        }
    }
    for (var _f = 0, _g = exports.tokenStore.entries(); _f < _g.length; _f++) {
        var _h = _g[_f], token = _h[0], data = _h[1];
        if (data.expiresAt < now) {
            exports.tokenStore.delete(token);
        }
    }
}, 15000);
function issueClearanceNonce(appId, sessionId, ip, fingerprint) {
    var nonce = crypto_1.default.randomBytes(32).toString('hex');
    var now = Date.now();
    exports.clearanceNonceStore.set(nonce, {
        appId: (appId || '').toLowerCase().trim(),
        sessionId: (sessionId || '').trim(),
        ip: (ip || '').trim(),
        fingerprint: (fingerprint || '').trim(),
        createdAt: now,
        expiresAt: now + 90000, // Strict 90 seconds lifetime
        consumed: false
    });
    return nonce;
}
function consumeClearanceNonce(nonce, reqAppId, reqSessionId, reqIp) {
    if (!nonce || typeof nonce !== 'string') {
        return { valid: false, reason: 'Missing clearance nonce' };
    }
    var record = exports.clearanceNonceStore.get(nonce);
    if (!record) {
        return { valid: false, reason: 'Nonce not found or already consumed' };
    }
    var now = Date.now();
    // Check expiry
    if (now > record.expiresAt) {
        exports.clearanceNonceStore.delete(nonce);
        return { valid: false, reason: 'Clearance token expired' };
    }
    // Check consumed (Replay prevention)
    if (record.consumed) {
        exports.clearanceNonceStore.delete(nonce);
        return { valid: false, reason: 'Clearance token already used' };
    }
    // Atomically mark consumed and remove immediately
    record.consumed = true;
    exports.clearanceNonceStore.delete(nonce);
    // App ID strict binding
    var normReq = (reqAppId || '').toLowerCase().trim().replace(/[-_ ]/g, '');
    var normStored = (record.appId || '').toLowerCase().trim().replace(/[-_ ]/g, '');
    if (normReq && normStored && normReq !== normStored) {
        console.warn("[SECURITY] Clearance app ID mismatch: expected ".concat(record.appId, ", got ").concat(reqAppId));
        return { valid: false, reason: 'Token not issued for this application' };
    }
    // Session ID check if provided
    if (record.sessionId && reqSessionId && record.sessionId !== reqSessionId) {
        console.warn("[SECURITY] Clearance session mismatch: stored=".concat(record.sessionId, ", req=").concat(reqSessionId));
        return { valid: false, reason: 'Session context mismatch' };
    }
    return { valid: true };
}
function ensureSession(req, res) {
    var _a, _b;
    var existingSid = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a["__Host-sid"]) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b["sid"]);
    if (existingSid && typeof existingSid === 'string' && existingSid.length >= 16) {
        return existingSid;
    }
    var sid = crypto_1.default.randomBytes(24).toString("hex");
    try {
        res.cookie("__Host-sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 300000, secure: true, path: "/" });
        res.cookie("sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 300000, path: "/" });
    }
    catch (_) { }
    return sid;
}
function generateToken(ip, sessionId, fingerprint, appId) {
    var EXPIRY = 120; // 2 minutes expiry
    var expires = Math.floor(Date.now() / 1000) + EXPIRY;
    var payload = "".concat(ip, "|").concat(sessionId, "|").concat(fingerprint, "|").concat(appId, "|").concat(expires);
    var sig = crypto_1.default.createHmac("sha256", config_1.TOKEN_SECRET).update(payload).digest("hex");
    return Buffer.from("".concat(payload, "::").concat(sig)).toString("base64url");
}
function verifyToken(token, ip, sessionId, fingerprint, appId) {
    try {
        if (!token || typeof token !== 'string')
            return false;
        var raw = Buffer.from(token, "base64url").toString("utf8");
        var _a = raw.split("::"), payload = _a[0], sig = _a[1];
        if (!payload || !sig)
            return false;
        // Constant-time HMAC verification
        var expected = crypto_1.default.createHmac("sha256", config_1.TOKEN_SECRET).update(payload).digest("hex");
        var sigBuf = Buffer.from(sig, "hex");
        var expBuf = Buffer.from(expected, "hex");
        if (sigBuf.length !== expBuf.length || !crypto_1.default.timingSafeEqual(sigBuf, expBuf)) {
            console.warn("[SECURITY] Token signature verification failed.");
            return false;
        }
        var parts = payload.split("|");
        if (parts.length !== 5)
            return false;
        var tIp = parts[0], tSession = parts[1], tFp = parts[2], tAppId = parts[3], expires = parts[4];
        // Check expiry
        if (Math.floor(Date.now() / 1000) > parseInt(expires, 10)) {
            console.warn("[SECURITY] Token expired.");
            return false;
        }
        // Strict normalized appId check
        var normTAppId = (tAppId || '').toLowerCase().trim().replace(/[-_ ]/g, '');
        var normAppId = (appId || '').toLowerCase().trim().replace(/[-_ ]/g, '');
        if (normTAppId && normAppId && normTAppId !== normAppId) {
            console.warn("[SECURITY] Token appId mismatch: token=".concat(tAppId, ", requested=").concat(appId));
            return false;
        }
        return true;
    }
    catch (e) {
        return false;
    }
}
