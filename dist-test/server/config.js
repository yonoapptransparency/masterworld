"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticData = exports.MOCK_2FA_FILE = exports.MAX_HITS = exports.WINDOW = exports.BAD_UA = exports.CF_TURNSTILE_SECRET = exports.isRealValueForSecret = exports.SESSION_SECRET = exports.TOKEN_SECRET = exports.getFallbackAes = void 0;
var path_1 = __importDefault(require("path"));
// Use a static fallback for development so encrypted data isn't lost on server restart
var runtimeAesSecret = 'fallback_aes_secret_for_local_dev_only';
var runtimeTokenSecret = 'fallback_token_secret_for_local_dev_only';
var runtimeSessionSecret = 'fallback_session_secret_for_local_dev_only';
if (!process.env.AES_SECRET) {
    console.warn("[SECURITY] AES_SECRET not configured in environment. Using static fallback secret. Links will be secure but please configure a real secret for production.");
}
if (!process.env.ADMIN_EMAIL) {
    console.warn("[SECURITY] ADMIN_EMAIL not configured.");
    process.env.ADMIN_EMAIL = "defentechscholar@gmail.com";
}
global.AES_SECRET_GLOBAL = process.env.AES_SECRET || runtimeAesSecret;
var getFallbackAes = function () { return global.AES_SECRET_GLOBAL; };
exports.getFallbackAes = getFallbackAes;
exports.TOKEN_SECRET = process.env.TOKEN_SECRET || runtimeTokenSecret;
exports.SESSION_SECRET = process.env.SESSION_SECRET || runtimeSessionSecret;
if (!process.env.TOKEN_SECRET) {
    console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");
}
if (!process.env.SESSION_SECRET) {
    console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");
}
var rawTurnstileSecret = process.env.CF_TURNSTILE_SECRET || '';
var isRealValueForSecret = function (val) {
    if (!val)
        return false;
    var clean = val.trim();
    if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY'))
        return false;
    if (/[#@!$^&*()_+\s]/.test(clean))
        return false;
    if (clean.length > 100)
        return false;
    return true;
};
exports.isRealValueForSecret = isRealValueForSecret;
exports.CF_TURNSTILE_SECRET = (0, exports.isRealValueForSecret)(rawTurnstileSecret) ? rawTurnstileSecret : '';
exports.BAD_UA = [
    /zgrab/i, /masscan/i, /nmap/i, /nuclei/i, /sqlmap/i,
    /nikto/i, /dirbuster/i, /gobuster/i, /wfuzz/i,
    /python-requests/i, /python-urllib/i, /curl\//i, /wget\//i,
    /scrapy/i, /postmanruntime/i, /httpclient/i, /go-http-client/i,
    /headlesschrome/i, /phantomjs/i, /selenium/i, /puppeteer/i, /playwright/i,
    /spider/i, /crawl/i, /bot\b/i, /crawler/i, /scraper/i
];
exports.WINDOW = 60 * 1000;
exports.MAX_HITS = 30;
exports.MOCK_2FA_FILE = path_1.default.join(process.cwd(), "src/lib/mock_2fa_store.json");
var getStaticData = function () {
    try {
        var staticDataModulePath = path_1.default.join(process.cwd(), "src/lib/staticData.json");
        try {
            var resolvedPath = require.resolve(staticDataModulePath);
            delete require.cache[resolvedPath];
        }
        catch (_) { }
        return require(staticDataModulePath);
    }
    catch (e) {
        console.error("Failed to load staticData dynamically:", e);
        return { mockApps: [], mockSettings: {}, mockNews: [], mockBlogs: [], mockVideos: [] };
    }
};
exports.getStaticData = getStaticData;
