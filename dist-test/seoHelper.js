"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getOgImageUrl = exports.syncFromFirestore = exports.getSafeFirebaseConfig = exports.getField = exports.SLUG_ALIAS_MAP = void 0;
exports.resolveAppSlug = resolveAppSlug;
exports.clearSeoCache = clearSeoCache;
exports.fetchStoreData = fetchStoreData;
exports.injectSeoTags = injectSeoTags;
var path_1 = __importDefault(require("path"));
var firebaseConfig_1 = require("./seo/firebaseConfig");
Object.defineProperty(exports, "getSafeFirebaseConfig", { enumerable: true, get: function () { return firebaseConfig_1.getSafeFirebaseConfig; } });
var sync_1 = require("./seo/sync");
Object.defineProperty(exports, "syncFromFirestore", { enumerable: true, get: function () { return sync_1.syncFromFirestore; } });
var utils_1 = require("./seo/utils");
Object.defineProperty(exports, "getField", { enumerable: true, get: function () { return utils_1.getField; } });
Object.defineProperty(exports, "getOgImageUrl", { enumerable: true, get: function () { return utils_1.getOgImageUrl; } });
var renderers = __importStar(require("./seo/renderers"));
var seoUtils_1 = require("./lib/seoUtils");
// Dynamically resolve staticData to bypass TSX watcher
var getStaticData = function () {
    try {
        var staticDataModulePath = path_1.default.join(process.cwd(), 'src/lib/staticData');
        return require(staticDataModulePath);
    }
    catch (e) {
        return { mockApps: [], mockSettings: {}, mockNews: [], mockBlogs: [], mockVideos: [] };
    }
};
var staticData = getStaticData();
var mockApps = staticData.mockApps || [];
var mockSettings = staticData.mockSettings || {};
var mockNews = staticData.mockNews || [];
var mockBlogs = staticData.mockBlogs || [];
var mockVideos = staticData.mockVideos || [];
var cachedData = null;
var lastFetchTime = 0;
var CACHE_TTL = 15000; // 15 seconds
var isFetchingStoreData = false;
exports.SLUG_ALIAS_MAP = {
    '567-slots': 'share-slots',
    '777-rummy': '777-game',
    'ind-club': 'jaiho-91',
    'gogo-rummy': 'love-rummy',
    'uno': 'rummy-ludo',
    'slots': 'jaiho-slots',
    'arcade': 'yono-arcade',
    'vip': 'yono-vip'
};
function resolveAppSlug(rawSlug, appsList) {
    if (!rawSlug || !Array.isArray(appsList) || appsList.length === 0)
        return null;
    var clean = decodeURIComponent(rawSlug).replace(/^\/+|\/+$/g, '').toLowerCase().trim();
    clean = clean.replace(/[-_]+$/g, ''); // Strip trailing hyphens like "uno-" -> "uno"
    if (!clean)
        return null;
    // 1. Direct exact slug match
    var matched = appsList.find(function (a) { var _a; return ((_a = (0, utils_1.getField)(a, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === clean; });
    if (matched)
        return matched;
    // 2. Direct exact ID match
    matched = appsList.find(function (a) { var _a; return ((_a = (0, utils_1.getField)(a, 'id')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === clean; });
    if (matched)
        return matched;
    // 3. Exact alias match
    var aliasTarget = exports.SLUG_ALIAS_MAP[clean];
    if (aliasTarget) {
        matched = appsList.find(function (a) { var _a; return ((_a = (0, utils_1.getField)(a, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === aliasTarget; });
        if (matched)
            return matched;
    }
    // 4. Normalized exact match (hyphens/underscores/spaces standardized)
    var normalizedClean = clean.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (normalizedClean) {
        matched = appsList.find(function (a) {
            var _a;
            var s = (_a = (0, utils_1.getField)(a, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            return s === normalizedClean;
        });
        if (matched)
            return matched;
    }
    // Strict: Do not do loose partial substring matching (e.g. s.includes(clean))
    // because that causes unrelated apps with common words like "rummy" or "slots" to cross-match!
    return null;
}
function clearSeoCache() {
    cachedData = null;
    lastFetchTime = 0;
}
function doFetchStoreData() {
    return __awaiter(this, void 0, void 0, function () {
        var now, freshStatic, fsMod, pathMod, p, backup, data_1, data;
        return __generator(this, function (_a) {
            now = Date.now();
            freshStatic = getStaticData();
            try {
                fsMod = require('fs');
                pathMod = require('path');
                p = pathMod.join(process.cwd(), 'src/lib/public_backup.json');
                backup = fsMod.existsSync(p) ? JSON.parse(fsMod.readFileSync(p, 'utf8')) : null;
                if (backup) {
                    data_1 = {
                        apps: Array.isArray(backup.apps) ? backup.apps : (freshStatic.mockApps || []),
                        settings: backup.settings || (freshStatic.mockSettings || {}),
                        news: Array.isArray(backup.news) ? backup.news : (freshStatic.mockNews || []),
                        blogs: Array.isArray(backup.blogs) ? backup.blogs : (freshStatic.mockBlogs || []),
                        videos: Array.isArray(backup.videos) ? backup.videos : (freshStatic.mockVideos || [])
                    };
                    cachedData = data_1;
                    lastFetchTime = now;
                    return [2 /*return*/, data_1];
                }
            }
            catch (e) { }
            data = {
                apps: freshStatic.mockApps || [],
                settings: freshStatic.mockSettings || {},
                news: freshStatic.mockNews || [],
                blogs: freshStatic.mockBlogs || [],
                videos: freshStatic.mockVideos || []
            };
            cachedData = data;
            lastFetchTime = now;
            return [2 /*return*/, data];
        });
    });
}
function fetchStoreData() {
    return __awaiter(this, void 0, void 0, function () {
        var now, isStale, isSuperStale;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = Date.now();
                    isStale = (now - lastFetchTime) > CACHE_TTL;
                    isSuperStale = (now - lastFetchTime) > (CACHE_TTL * 15);
                    if (cachedData && !isSuperStale) {
                        if (isStale && !isFetchingStoreData) {
                            isFetchingStoreData = true;
                            doFetchStoreData()
                                .then(function () { isFetchingStoreData = false; })
                                .catch(function (e) {
                                isFetchingStoreData = false;
                                console.warn("Background store fetch failed safely:", e);
                            });
                        }
                        return [2 /*return*/, cachedData];
                    }
                    return [4 /*yield*/, doFetchStoreData()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function cleanSeoDescription(desc) {
    if (!desc)
        return '';
    var trimmed = desc.trim();
    if (trimmed.startsWith('<') || trimmed.includes('<meta ')) {
        var metaMatch = trimmed.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
        if (metaMatch && metaMatch[1])
            return metaMatch[1].trim();
        var ogMatch = trimmed.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
        if (ogMatch && ogMatch[1])
            return ogMatch[1].trim();
        return (0, utils_1.stripHtml)(trimmed).substring(0, 160);
    }
    return trimmed;
}
function getPagePreRender(urlPath, data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, apps, _c, settings, _d, news, _e, blogs, _f, videos, _g, developers, cleanPath, cleanPathLower, bodyContent, slug_1, app, slug_2, item, parts, slug_3, item, slug_4, item, parts, slug, possibleSlug_1, app, possibleSlug_2, newsItem, blogItem, videoItem, header, footer;
        return __generator(this, function (_h) {
            _a = data || {}, _b = _a.apps, apps = _b === void 0 ? [] : _b, _c = _a.settings, settings = _c === void 0 ? {} : _c, _d = _a.news, news = _d === void 0 ? [] : _d, _e = _a.blogs, blogs = _e === void 0 ? [] : _e, _f = _a.videos, videos = _f === void 0 ? [] : _f, _g = _a.developers, developers = _g === void 0 ? [] : _g;
            cleanPath = urlPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
            cleanPathLower = cleanPath.toLowerCase();
            if (cleanPathLower.startsWith('/admin') || cleanPathLower.startsWith('/masterworld')) {
                return [2 /*return*/, "\n      <div class=\"min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans\">\n        <div class=\"flex flex-col items-center gap-3\">\n          <div class=\"w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin\"></div>\n          <span class=\"text-xs font-mono text-slate-400\">Loading Masterworld Admin...</span>\n        </div>\n      </div>\n    "];
            }
            bodyContent = '';
            if (cleanPathLower === '/' || cleanPathLower === '' || cleanPathLower === '/new-apps') {
                bodyContent = renderers.renderHome(apps, settings, news, videos);
            }
            else if (cleanPathLower.startsWith('/s/')) {
                slug_1 = cleanPath.split('/s/')[1];
                app = apps.find(function (a) { return (0, utils_1.getField)(a, 'slug').toLowerCase() === slug_1.toLowerCase(); });
                bodyContent = app ? renderers.renderGateway(slug_1, apps, settings) : renderers.render404(urlPath, settings);
            }
            else if (cleanPathLower === '/news') {
                bodyContent = renderers.renderNewsList(news, settings);
            }
            else if (cleanPathLower.startsWith('/news/')) {
                slug_2 = cleanPath.split('/news/')[1];
                item = news.find(function (n) { return (0, utils_1.getField)(n, 'slug').toLowerCase() === slug_2.toLowerCase(); });
                bodyContent = item ? renderers.renderNewsDetail(slug_2, news, settings) : renderers.render404(urlPath, settings);
            }
            else if (cleanPathLower === '/blogs') {
                bodyContent = renderers.renderBlogsList(blogs, settings);
            }
            else if (cleanPathLower.startsWith('/blog/') || cleanPathLower.startsWith('/blogs/') || cleanPathLower.startsWith('/article/')) {
                parts = cleanPath.split('/');
                slug_3 = parts[parts.length - 1];
                item = (blogs || []).find(function (b) { var _a, _b; return ((_a = (0, utils_1.getField)(b, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === slug_3.toLowerCase() || ((_b = (0, utils_1.getField)(b, 'id')) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === slug_3.toLowerCase(); });
                bodyContent = item ? renderers.renderBlogDetail(slug_3, blogs, settings) : renderers.render404(urlPath, settings);
            }
            else if (cleanPathLower === '/videos') {
                bodyContent = renderers.renderVideosList(videos, settings);
            }
            else if (cleanPathLower.startsWith('/videos/')) {
                slug_4 = cleanPath.split('/videos/')[1];
                item = videos.find(function (v) { return (0, utils_1.getField)(v, 'slug').toLowerCase() === slug_4.toLowerCase(); });
                bodyContent = item ? renderers.renderVideoDetail(slug_4, videos, settings) : renderers.render404(urlPath, settings);
            }
            else if (cleanPathLower === '/developers') {
                bodyContent = renderers.renderDevelopersList(developers, settings);
            }
            else if (cleanPathLower === '/about') {
                bodyContent = renderers.renderAbout(settings);
            }
            else if (cleanPathLower === '/contact') {
                bodyContent = renderers.renderContact(settings);
            }
            else if (cleanPathLower === '/privacy') {
                bodyContent = renderers.renderPrivacy(settings);
            }
            else if (cleanPathLower === '/report-removal') {
                bodyContent = renderers.renderReportRemoval(settings);
            }
            else if (cleanPathLower === '/terms') {
                bodyContent = renderers.renderTerms(settings);
            }
            else if (cleanPathLower === '/notice') {
                bodyContent = renderers.renderNotice(settings);
            }
            else if (cleanPathLower === '/ethics') {
                bodyContent = renderers.renderEthics(settings);
            }
            else if (cleanPathLower === '/disclaimer') {
                bodyContent = renderers.renderDisclaimer(settings);
            }
            else if (cleanPathLower === '/responsibility') {
                bodyContent = renderers.renderResponsibility(settings);
            }
            else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/') || cleanPathLower.startsWith('/gateway/') || cleanPathLower.startsWith('/download/')) {
                parts = cleanPathLower.split('/');
                slug = parts[parts.length - 1];
                bodyContent = renderers.renderGateway(slug, settings);
            }
            else if (cleanPathLower.startsWith('/app/')) {
                possibleSlug_1 = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
                app = apps.find(function (a) { var _a; return ((_a = (0, utils_1.getField)(a, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === possibleSlug_1; });
                if (app) {
                    bodyContent = renderers.renderAppDetails(possibleSlug_1, apps, settings);
                }
                else {
                    bodyContent = renderers.render404(urlPath, settings);
                }
            }
            else {
                possibleSlug_2 = cleanPathLower.replace(/^\/|\/$/g, '');
                newsItem = news.find(function (n) { var _a; return ((_a = (0, utils_1.getField)(n, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === possibleSlug_2; });
                blogItem = (blogs || []).find(function (b) { var _a, _b; return ((_a = (0, utils_1.getField)(b, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === possibleSlug_2 || ((_b = (0, utils_1.getField)(b, 'id')) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === possibleSlug_2; });
                videoItem = videos.find(function (v) { var _a; return ((_a = (0, utils_1.getField)(v, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === possibleSlug_2; });
                if (newsItem) {
                    bodyContent = renderers.renderNewsDetail(possibleSlug_2, news, settings);
                }
                else if (blogItem) {
                    bodyContent = renderers.renderBlogDetail(possibleSlug_2, blogs, settings);
                }
                else if (videoItem) {
                    bodyContent = renderers.renderVideoDetail(possibleSlug_2, videos, settings);
                }
                else {
                    bodyContent = renderers.render404(urlPath, settings);
                }
            }
            header = renderers.renderHeader(settings);
            footer = renderers.renderFooter(settings);
            return [2 /*return*/, "\n    <div class=\"flex flex-col min-h-screen\">\n      ".concat(header, "\n      <main class=\"flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative\">\n        ").concat(bodyContent, "\n      </main>\n      ").concat(footer, "\n    </div>\n  ")];
        });
    });
}
function buildJsonLdSchema(params) {
    var _a;
    var schemas = [];
    var hostOrigin = 'https://www.rummydex.com';
    try {
        var fullUrl = params.url.startsWith('http') ? params.url : "https://".concat(params.url);
        hostOrigin = new URL(fullUrl).origin;
    }
    catch (e) {
        hostOrigin = params.url.startsWith('http') ? params.url : "https://".concat(params.url);
    }
    if (params.pageType === 'gateway' || params.pageType === '404') {
        return '';
    }
    schemas.push({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "".concat(hostOrigin, "/#website"),
        "url": hostOrigin,
        "name": params.siteTitle,
        "description": params.description,
        "publisher": {
            "@type": "Organization",
            "@id": "".concat(hostOrigin, "/#organization"),
            "name": params.siteTitle,
            "url": hostOrigin,
            "logo": {
                "@type": "ImageObject",
                "url": params.logoUrl
            }
        }
    });
    if (((_a = params.settings) === null || _a === void 0 ? void 0 : _a.website_faqs) && Array.isArray(params.settings.website_faqs) && params.settings.website_faqs.length > 0) {
        var faqList = params.settings.website_faqs
            .filter(function (faq) { var _a, _b; return ((_a = (0, utils_1.getField)(faq, 'question')) === null || _a === void 0 ? void 0 : _a.trim()) && ((_b = (0, utils_1.getField)(faq, 'answer')) === null || _b === void 0 ? void 0 : _b.trim()); })
            .map(function (faq) { return ({
            "@type": "Question",
            "name": (0, utils_1.stripHtml)((0, utils_1.getField)(faq, 'question')),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": (0, utils_1.stripHtml)((0, utils_1.getField)(faq, 'answer'))
            }
        }); });
        if (faqList.length > 0) {
            schemas.push({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqList
            });
        }
    }
    if (params.pageType === 'app' && params.app) {
        var app = params.app;
        var name_1 = (0, utils_1.getField)(app, 'name');
        var category = (0, utils_1.getField)(app, 'category') || 'GameApplication';
        if (!category.includes('Application')) {
            category = 'GameApplication';
        }
        var realRating = parseFloat((0, utils_1.getField)(app, 'rating'));
        var realCount = parseInt((0, utils_1.getField)(app, 'review_count'), 10);
        var appRawIcon = (0, utils_1.getField)(app, 'icon_url') || (0, utils_1.getField)(app, 'og_image_url') || params.logoUrl;
        var appSquareIcon = (0, utils_1.optimizeImageUrl)(appRawIcon, 512) || appRawIcon;
        var desc = (0, utils_1.getField)(app, 'seo_description') || (0, utils_1.getField)(app, 'meta_description') || (0, utils_1.stripHtml)((0, utils_1.getField)(app, 'description_html')) || params.description;
        var rawCat = (0, utils_1.getField)(app, 'category');
        var specificCat = rawCat ? rawCat.split(',').map(function (c) { return c.trim(); }).filter(function (c) { return c && c.toLowerCase() !== 'all apps' && c.toLowerCase() !== 'all' && c.toLowerCase() !== 'apps' && c.toLowerCase() !== 'general'; })[0] : '';
        var developer = (0, utils_1.getField)(app, 'developer') || params.siteTitle || 'RummyDex';
        var fileSize = (0, utils_1.getField)(app, 'file_size') || '45 MB';
        var version = (0, utils_1.getField)(app, 'version') || '2.0.6';
        var softwareAppSchema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": name_1,
            "operatingSystem": "Android",
            "applicationCategory": category,
            "image": appSquareIcon,
            "logo": appSquareIcon,
            "description": desc,
            "fileSize": fileSize,
            "softwareVersion": version,
            "author": {
                "@type": "Organization",
                "name": developer
            },
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
            }
        };
        if (!isNaN(realRating) && realRating > 0 && !isNaN(realCount) && realCount > 0) {
            softwareAppSchema["aggregateRating"] = {
                "@type": "AggregateRating",
                "ratingValue": realRating.toString(),
                "ratingCount": realCount.toString(),
                "bestRating": "5",
                "worstRating": "1"
            };
        }
        var appScreenshots = (0, utils_1.getField)(app, 'screenshots');
        if (Array.isArray(appScreenshots) && appScreenshots.length > 0) {
            softwareAppSchema["screenshot"] = appScreenshots.map(function (s) { return (0, utils_1.optimizeImageUrl)(s, 1024) || s; });
        }
        schemas.push(softwareAppSchema);
        schemas.push({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "".concat(hostOrigin, "/app/").concat((0, utils_1.getField)(app, 'slug'), "#webpage"),
            "url": "".concat(hostOrigin, "/app/").concat((0, utils_1.getField)(app, 'slug')),
            "name": params.title,
            "description": desc,
            "primaryImageOfPage": {
                "@type": "ImageObject",
                "url": appSquareIcon,
                "contentUrl": appSquareIcon
            }
        });
        var breadcrumbs = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": hostOrigin
            }
        ];
        if (specificCat) {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": 2,
                "name": specificCat,
                "item": "".concat(hostOrigin, "/?tab=").concat(encodeURIComponent(specificCat))
            });
            breadcrumbs.push({
                "@type": "ListItem",
                "position": 3,
                "name": name_1,
                "item": "".concat(hostOrigin, "/app/").concat((0, utils_1.getField)(app, 'slug'))
            });
        }
        else {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": 2,
                "name": name_1,
                "item": "".concat(hostOrigin, "/app/").concat((0, utils_1.getField)(app, 'slug'))
            });
        }
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs
        });
        if (app.faqs && Array.isArray(app.faqs) && app.faqs.length > 0) {
            var faqList = app.faqs
                .filter(function (faq) { var _a, _b; return ((_a = (0, utils_1.getField)(faq, 'question')) === null || _a === void 0 ? void 0 : _a.trim()) && ((_b = (0, utils_1.getField)(faq, 'answer')) === null || _b === void 0 ? void 0 : _b.trim()); })
                .map(function (faq) { return ({
                "@type": "Question",
                "name": (0, utils_1.stripHtml)((0, utils_1.getField)(faq, 'question')),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": (0, utils_1.stripHtml)((0, utils_1.getField)(faq, 'answer'))
                }
            }); });
            if (faqList.length > 0) {
                schemas.push({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": faqList
                });
            }
        }
    }
    else if (params.pageType === 'blog' && params.blogItem) {
        var blog = params.blogItem;
        var title = (0, utils_1.getField)(blog, 'title');
        var desc = (0, utils_1.getField)(blog, 'seo_description') || (0, utils_1.getField)(blog, 'description') || (0, utils_1.getField)(blog, 'content', '').substring(0, 160) || params.description;
        var datePublished = (0, utils_1.getField)(blog, 'publish_date') || (0, utils_1.getField)(blog, 'published_at') || (0, utils_1.getField)(blog, 'created_at') || new Date().toISOString();
        var authorName = (0, utils_1.getField)(blog, 'author') || params.siteTitle;
        var cover = (0, utils_1.getField)(blog, 'cover_url') || (0, utils_1.getField)(blog, 'thumbnail_url') || params.logoUrl;
        var coverUrl = (0, utils_1.getOgImageUrl)(cover, hostOrigin);
        var blogSlug = (0, utils_1.getField)(blog, 'slug') || (0, utils_1.getField)(blog, 'id');
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": desc,
            "image": [coverUrl],
            "datePublished": datePublished,
            "dateModified": datePublished,
            "author": {
                "@type": "Person",
                "name": authorName
            },
            "publisher": {
                "@type": "Organization",
                "name": params.siteTitle,
                "logo": {
                    "@type": "ImageObject",
                    "url": params.logoUrl
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "".concat(hostOrigin, "/blog/").concat(blogSlug)
            }
        });
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": hostOrigin
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Guides & Articles",
                    "item": "".concat(hostOrigin, "/blogs")
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": title,
                    "item": "".concat(hostOrigin, "/blog/").concat(blogSlug)
                }
            ]
        });
    }
    else if (params.pageType === 'news' && params.newsItem) {
        var item = params.newsItem;
        var title = (0, utils_1.getField)(item, 'title');
        var desc = (0, utils_1.getField)(item, 'description') || params.description;
        var datePublished = (0, utils_1.getField)(item, 'created_at') || new Date().toISOString();
        var authorName = (0, utils_1.getField)(item, 'ceo_name', params.siteTitle);
        schemas.push({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "description": desc,
            "image": [params.logoUrl],
            "datePublished": datePublished,
            "dateModified": datePublished,
            "author": {
                "@type": "Organization",
                "name": authorName
            },
            "publisher": {
                "@type": "Organization",
                "name": params.siteTitle,
                "logo": {
                    "@type": "ImageObject",
                    "url": params.logoUrl
                }
            }
        });
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": hostOrigin
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "News",
                    "item": "".concat(hostOrigin, "/news")
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": title,
                    "item": "".concat(hostOrigin, "/news/").concat((0, utils_1.getField)(item, 'slug'))
                }
            ]
        });
    }
    else if (params.pageType === 'video' && params.videoItem) {
        var v = params.videoItem;
        var youtubeUrl = (0, utils_1.getField)(v, 'youtube_url') || (0, utils_1.getField)(v, 'video_url') || (0, utils_1.getField)(v, 'url');
        schemas.push({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": (0, utils_1.getField)(v, 'title'),
            "description": (0, utils_1.getField)(v, 'description') || (0, utils_1.getField)(v, 'title'),
            "thumbnailUrl": (0, utils_1.getYoutubeThumbnail)(youtubeUrl) || params.logoUrl,
            "uploadDate": (0, utils_1.getField)(v, 'created_at') || new Date().toISOString(),
            "contentUrl": youtubeUrl
        });
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": hostOrigin
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Videos",
                    "item": "".concat(hostOrigin, "/videos")
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": (0, utils_1.getField)(v, 'title'),
                    "item": "".concat(hostOrigin, "/videos/").concat((0, utils_1.getField)(v, 'slug'))
                }
            ]
        });
    }
    else if (params.pageType === 'home' && params.settings) {
        // FAQs are already injected globally, no need to duplicate them here
    }
    return schemas.map(function (s) { return "<script type=\"application/ld+json\" data-rh=\"true\">".concat(JSON.stringify(s).replace(/</g, '\\u003c'), "</script>"); }).join('\n');
}
function injectSeoTags(template_1, urlPath_1, hostUrl_1) {
    return __awaiter(this, arguments, void 0, function (template, urlPath, hostUrl, userAgent) {
        var data, apps, settings, news, blogs, videos, developers, siteTitle, title, description, keywords, keywordArray, CLOUDINARY_ICON, rawLogoUrl, faviconUrl, getFaviconWithSize, favicon32, favicon180, favicon192, logoUrl, cleanPath, cleanPathLower, isNotFound, customCanonicalUrl, pageType, targetApp, targetNews, targetBlog, targetVideo, slug_5, app, parts, slug_6, blogItem, slug_7, newsItem, slug_8, videoItem, parts, slug, app, appSlug, app, appSlug_1, newsItem, blogItem, videoItem, canonicalPath, appSlug, bSlug, canonicalUrl, pageOgImage, ytThumb, domain, preRenderedBody, jsonLdSchema, truncated, lastSpace, isNoIndexPage, robotsTag, seoTags, initialDataPayload, targetAppSlug_1, optimizedApps, targetNewsSlug_1, optimizedNews, targetBlogSlug_1, optimizedBlogs, optimizedVideos, optimizedSettings, initialDataJson, initialDataScript, finalHtml, isBot, rootContent;
        var _a, _b, _c;
        if (userAgent === void 0) { userAgent = ''; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, fetchStoreData()];
                case 1:
                    data = _d.sent();
                    if (!data || !data.settings)
                        return [2 /*return*/, { html: template, isNotFound: false }];
                    apps = data.apps || [];
                    settings = data.settings || {};
                    news = data.news || [];
                    blogs = data.blogs || [];
                    videos = data.videos || [];
                    developers = data.developers || [];
                    siteTitle = (0, utils_1.getField)(settings, 'site_title') || 'RummyDex';
                    title = siteTitle;
                    description = (0, utils_1.getField)(settings, 'meta_description', '');
                    if (!description)
                        description = "A transparency platform and directory for verified applications.";
                    keywords = (0, utils_1.getField)(settings, 'seo_keywords', '');
                    if (!keywords)
                        keywords = "app clearance, premium applications, digital tools, platform, tech specs, verified apps";
                    if (keywords) {
                        keywordArray = keywords.split(',').map(function (k) { return k.trim(); }).filter(Boolean);
                        if (keywordArray.length > 15)
                            keywords = keywordArray.slice(0, 15).join(', ');
                    }
                    CLOUDINARY_ICON = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
                    rawLogoUrl = (0, utils_1.getField)(settings, 'logo_url') || CLOUDINARY_ICON;
                    faviconUrl = (0, utils_1.getField)(settings, 'favicon_url') || CLOUDINARY_ICON;
                    getFaviconWithSize = function (url, size) {
                        if (!url)
                            return '';
                        if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
                            return url.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, "/upload/f_png,q_auto,w_".concat(size, ",h_").concat(size, ",c_fill/$1"));
                        }
                        return url;
                    };
                    favicon32 = getFaviconWithSize(faviconUrl, 32);
                    favicon180 = getFaviconWithSize(faviconUrl, 180);
                    favicon192 = getFaviconWithSize(faviconUrl, 192);
                    logoUrl = getFaviconWithSize(rawLogoUrl, 512);
                    cleanPath = urlPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
                    cleanPathLower = cleanPath.toLowerCase();
                    isNotFound = false;
                    customCanonicalUrl = undefined;
                    pageType = 'static';
                    targetApp = null;
                    targetNews = null;
                    targetBlog = null;
                    targetVideo = null;
                    if (cleanPathLower === '/' || cleanPathLower === '' || cleanPathLower === '/new-apps') {
                        pageType = 'home';
                        title = 'Official App Hub & Transparency Directory';
                    }
                    else if (cleanPathLower.startsWith('/admin') || cleanPathLower.startsWith('/masterworld')) {
                        title = "Admin Panel | Masterworld";
                        description = "Masterworld Admin Control Dashboard";
                        pageType = 'static';
                    }
                    else if (cleanPathLower.startsWith('/s/')) {
                        slug_5 = cleanPath.split('/s/')[1];
                        app = apps.find(function (a) { return (0, utils_1.getField)(a, 'slug').toLowerCase() === slug_5; });
                        if (app) {
                            title = "Download ".concat((0, utils_1.getField)(app, 'name'), " | ").concat(siteTitle);
                            description = "Secure download link for ".concat((0, utils_1.getField)(app, 'name'), ".");
                            customCanonicalUrl = (0, utils_1.getField)(app, 'canonical_url');
                            pageType = 'app';
                            targetApp = app;
                        }
                        else {
                            isNotFound = true;
                            pageType = '404';
                        }
                    }
                    else if (cleanPathLower === '/news') {
                        title = "News & Updates | ".concat(siteTitle);
                        description = "The latest gaming news, reports, and transparency updates.";
                        pageType = 'static';
                    }
                    else if (cleanPathLower === '/blogs') {
                        title = "App Updates & Walkthrough Guides | ".concat(siteTitle);
                        description = "Read expert tutorials, gameplay walkthrough guides, and developer release notes.";
                        pageType = 'static';
                    }
                    else if (cleanPathLower.startsWith('/blog/') || cleanPathLower.startsWith('/blogs/') || cleanPathLower.startsWith('/article/')) {
                        parts = cleanPath.split('/');
                        slug_6 = parts[parts.length - 1];
                        blogItem = (blogs || []).find(function (b) { var _a, _b; return ((_a = (0, utils_1.getField)(b, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === slug_6.toLowerCase() || ((_b = (0, utils_1.getField)(b, 'id')) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === slug_6.toLowerCase(); });
                        if (blogItem) {
                            title = (0, utils_1.getField)(blogItem, 'seo_title') || "".concat((0, utils_1.getField)(blogItem, 'title'), " | ").concat(siteTitle);
                            description = (0, utils_1.getField)(blogItem, 'seo_description') || (0, utils_1.getField)(blogItem, 'description') || (0, utils_1.getField)(blogItem, 'content', '').substring(0, 160);
                            customCanonicalUrl = (0, utils_1.getField)(blogItem, 'canonical_url');
                            pageType = 'blog';
                            targetBlog = blogItem;
                        }
                        else {
                            isNotFound = true;
                            pageType = '404';
                        }
                    }
                    else if (cleanPathLower === '/videos') {
                        title = "Video Reviews | ".concat(siteTitle);
                        description = "Watch deep-dive reviews and gameplay analysis.";
                        pageType = 'static';
                    }
                    else if (cleanPathLower.startsWith('/news/')) {
                        slug_7 = cleanPath.split('/news/')[1];
                        newsItem = news.find(function (n) { return (0, utils_1.getField)(n, 'slug').toLowerCase() === slug_7; });
                        if (newsItem) {
                            title = "".concat((0, utils_1.getField)(newsItem, 'title'), " | ").concat(siteTitle);
                            description = (0, utils_1.getField)(newsItem, 'description', '').substring(0, 160);
                            customCanonicalUrl = (0, utils_1.getField)(newsItem, 'canonical_url');
                            pageType = 'news';
                            targetNews = newsItem;
                        }
                        else {
                            isNotFound = true;
                            pageType = '404';
                        }
                    }
                    else if (cleanPathLower.startsWith('/videos/')) {
                        slug_8 = cleanPath.split('/videos/')[1];
                        videoItem = videos.find(function (v) { return (0, utils_1.getField)(v, 'slug').toLowerCase() === slug_8; });
                        if (videoItem) {
                            title = "".concat((0, utils_1.getField)(videoItem, 'title'), " | ").concat(siteTitle);
                            description = (0, utils_1.getField)(videoItem, 'description', '').substring(0, 160);
                            pageType = 'video';
                            targetVideo = videoItem;
                        }
                        else {
                            isNotFound = true;
                            pageType = '404';
                        }
                    }
                    else if (['/about', '/contact', '/privacy', '/report-removal', '/terms', '/notice', '/ethics', '/disclaimer', '/responsibility', '/developers'].includes(cleanPathLower)) {
                        pageType = 'static';
                        if (cleanPathLower === '/about') {
                            title = "About Us | ".concat(siteTitle);
                            description = "Learn more about ".concat(siteTitle, ", our mission, and our dedicated team.");
                        }
                        else if (cleanPathLower === '/contact') {
                            title = "Contact Support | ".concat(siteTitle);
                            description = "Get in touch with ".concat(siteTitle, " support for any queries or assistance.");
                        }
                        else if (cleanPathLower === '/privacy') {
                            title = "Privacy Policy | ".concat(siteTitle);
                            description = "Read the Privacy Policy of ".concat(siteTitle, " to understand how we protect your data.");
                        }
                        else if (cleanPathLower === '/report-removal') {
                            title = "Report & Removal | ".concat(siteTitle);
                            description = "Report content or request removal of specific applications on ".concat(siteTitle, ".");
                        }
                        else if (cleanPathLower === '/terms') {
                            title = "Terms of Service | ".concat(siteTitle);
                            description = "Review the Terms of Service and usage guidelines for ".concat(siteTitle, ".");
                        }
                        else if (cleanPathLower === '/notice') {
                            title = "Legal Notice | ".concat(siteTitle);
                            description = "Important legal notices and compliance information for ".concat(siteTitle, ".");
                        }
                        else if (cleanPathLower === '/ethics') {
                            title = "Ethics & Safety | ".concat(siteTitle);
                            description = "Our commitment to ethics, safety, and transparent reviews at ".concat(siteTitle, ".");
                        }
                        else if (cleanPathLower === '/disclaimer') {
                            title = "Disclaimer | ".concat(siteTitle);
                            description = "Read the official disclaimer regarding the content and apps on ".concat(siteTitle, ".");
                        }
                        else if (cleanPathLower === '/responsibility') {
                            title = "Responsible Gaming | ".concat(siteTitle);
                            description = "Information and resources for responsible gaming and app usage on ".concat(siteTitle, ".");
                        }
                        else if (cleanPathLower === '/developers') {
                            title = "Developer Profiles | ".concat(siteTitle);
                            description = "Browse profiles of top app developers featured on ".concat(siteTitle, ".");
                        }
                    }
                    else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/') || cleanPathLower.startsWith('/gateway/') || cleanPathLower.startsWith('/download/')) {
                        parts = cleanPathLower.split('/');
                        slug = parts[parts.length - 1];
                        app = resolveAppSlug(slug, apps);
                        if (app) {
                            title = "Verification Portal: ".concat((0, utils_1.getField)(app, 'name'), " | ").concat(siteTitle);
                            description = "Secure application verification portal.";
                            customCanonicalUrl = "https://www.rummydex.com/app/".concat((0, utils_1.getField)(app, 'slug'));
                            pageType = 'gateway';
                            targetApp = app;
                        }
                        else {
                            isNotFound = true;
                            pageType = '404';
                        }
                    }
                    else if (cleanPathLower.startsWith('/app/')) {
                        appSlug = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
                        app = resolveAppSlug(appSlug, apps);
                        if (app) {
                            title = (0, utils_1.getField)(app, 'seo_title') || "".concat((0, utils_1.getField)(app, 'name'), " - Features, Specs & Review | ").concat(siteTitle);
                            description = cleanSeoDescription((0, utils_1.getField)(app, 'seo_description') || (0, utils_1.getField)(app, 'meta_description') || (0, utils_1.stripHtml)((0, utils_1.getField)(app, 'description_html')).substring(0, 160));
                            customCanonicalUrl = "https://www.rummydex.com/app/".concat((0, utils_1.getField)(app, 'slug'));
                            pageType = 'app';
                            targetApp = app;
                        }
                        else {
                            isNotFound = true;
                            pageType = '404';
                            title = "404 - Page Not Found | ".concat(siteTitle);
                            description = "The requested page could not be found on ".concat(siteTitle, ".");
                        }
                    }
                    else {
                        appSlug_1 = cleanPathLower.replace(/^\/|\/$/g, '');
                        newsItem = news.find(function (n) { var _a, _b; return ((_a = (0, utils_1.getField)(n, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === appSlug_1 || ((_b = (0, utils_1.getField)(n, 'slug')) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === appSlug_1.replace(/[-_]+$/g, ''); });
                        blogItem = (blogs || []).find(function (b) { var _a, _b; return ((_a = (0, utils_1.getField)(b, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === appSlug_1 || ((_b = (0, utils_1.getField)(b, 'id')) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === appSlug_1; });
                        videoItem = videos.find(function (v) { var _a, _b; return ((_a = (0, utils_1.getField)(v, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === appSlug_1 || ((_b = (0, utils_1.getField)(v, 'slug')) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === appSlug_1.replace(/[-_]+$/g, ''); });
                        if (newsItem) {
                            title = "".concat((0, utils_1.getField)(newsItem, 'title'), " | ").concat(siteTitle);
                            description = (0, utils_1.getField)(newsItem, 'description', '').substring(0, 160);
                            pageType = 'news';
                            targetNews = newsItem;
                        }
                        else if (blogItem) {
                            title = (0, utils_1.getField)(blogItem, 'seo_title') || "".concat((0, utils_1.getField)(blogItem, 'title'), " | ").concat(siteTitle);
                            description = (0, utils_1.getField)(blogItem, 'seo_description') || (0, utils_1.getField)(blogItem, 'description') || (0, utils_1.getField)(blogItem, 'content', '').substring(0, 160);
                            customCanonicalUrl = (0, utils_1.getField)(blogItem, 'canonical_url');
                            pageType = 'blog';
                            targetBlog = blogItem;
                        }
                        else if (videoItem) {
                            title = "".concat((0, utils_1.getField)(videoItem, 'title'), " | ").concat(siteTitle);
                            description = (0, utils_1.getField)(videoItem, 'description', '').substring(0, 160);
                            pageType = 'video';
                            targetVideo = videoItem;
                        }
                        else {
                            isNotFound = true;
                            pageType = '404';
                            title = "404 - Page Not Found | ".concat(siteTitle);
                            description = "The requested page could not be found on ".concat(siteTitle, ".");
                        }
                    }
                    if (isNotFound) {
                        title = "404 - Page Not Found | ".concat(siteTitle);
                        description = "The requested page ".concat(cleanPath, " could not be found on ").concat(siteTitle, ".");
                    }
                    title = (0, seoUtils_1.formatPageTitle)(title, siteTitle);
                    canonicalPath = urlPath;
                    if (pageType === 'app' && targetApp) {
                        appSlug = (0, utils_1.getField)(targetApp, 'slug');
                        if (appSlug) {
                            canonicalPath = "/app/".concat(appSlug.replace(/^\/+|\/+$/g, ''));
                        }
                    }
                    else if (pageType === 'blog' && targetBlog) {
                        bSlug = (0, utils_1.getField)(targetBlog, 'slug') || (0, utils_1.getField)(targetBlog, 'id');
                        if (bSlug) {
                            canonicalPath = "/blog/".concat(bSlug.replace(/^\/+|\/+$/g, ''));
                        }
                    }
                    canonicalUrl = (pageType === 'app' && targetApp && (0, utils_1.getField)(targetApp, 'slug'))
                        ? "https://www.rummydex.com/app/".concat((0, utils_1.getField)(targetApp, 'slug'))
                        : (0, seoUtils_1.getCleanCanonicalUrl)(customCanonicalUrl, canonicalPath);
                    pageOgImage = logoUrl;
                    if (targetApp) {
                        pageOgImage = (0, utils_1.getField)(targetApp, 'og_image_url') || (0, utils_1.getField)(targetApp, 'icon_url') || logoUrl;
                    }
                    else if (targetBlog) {
                        pageOgImage = (0, utils_1.getField)(targetBlog, 'cover_url') || (0, utils_1.getField)(targetBlog, 'thumbnail_url') || logoUrl;
                    }
                    else if (targetNews) {
                        pageOgImage = (0, utils_1.getField)(targetNews, 'og_image_url') || (0, utils_1.getField)(targetNews, 'logo_url') || (0, utils_1.getField)(targetNews, 'image_url') || logoUrl;
                    }
                    else if (targetVideo) {
                        ytThumb = (0, utils_1.getYoutubeThumbnail)((0, utils_1.getField)(targetVideo, 'youtube_url'));
                        if (ytThumb)
                            pageOgImage = ytThumb;
                    }
                    domain = 'https://www.rummydex.com';
                    try {
                        domain = canonicalUrl ? new URL(canonicalUrl).origin : 'https://www.rummydex.com';
                    }
                    catch (e) { }
                    if (!pageOgImage || pageOgImage.includes('1000132678_1_ro1ftj') || pageOgImage.includes('ezgif-64180dd8ca74703b') || pageOgImage.includes('ezgif-88d07abd3ef5753f_yz8ytg') || pageOgImage.includes('ezgif-8cbbc4a0aaeb367e_s4k2nb') || pageOgImage.includes('1000134161_11zon_fgqzz6')) {
                        pageOgImage = "".concat(domain, "/logo.png");
                    }
                    pageOgImage = (0, utils_1.getOgImageUrl)(pageOgImage, domain);
                    return [4 /*yield*/, getPagePreRender(urlPath, data)];
                case 2:
                    preRenderedBody = _d.sent();
                    jsonLdSchema = buildJsonLdSchema({
                        pageType: pageType,
                        title: title,
                        description: description,
                        url: canonicalUrl,
                        logoUrl: logoUrl,
                        siteTitle: siteTitle,
                        app: targetApp,
                        newsItem: targetNews,
                        blogItem: targetBlog,
                        videoItem: targetVideo,
                        settings: settings
                    });
                    // Ensure meta description is clean and within 160 characters for Google SERP
                    if (description) {
                        description = (0, utils_1.stripHtml)(description).replace(/\s+/g, ' ').trim();
                        if (description.length > 160) {
                            truncated = description.substring(0, 157);
                            lastSpace = truncated.lastIndexOf(' ');
                            description = (lastSpace > 100 ? truncated.substring(0, lastSpace) : truncated) + '...';
                        }
                    }
                    isNoIndexPage = isNotFound ||
                        cleanPathLower.startsWith('/s/') ||
                        cleanPathLower.startsWith('/dl/') ||
                        cleanPathLower.startsWith('/out/') ||
                        cleanPathLower.startsWith('/gateway/') ||
                        cleanPathLower.startsWith('/info/') ||
                        cleanPathLower.startsWith('/moreinfo/') ||
                        cleanPathLower.startsWith('/moredetail/') ||
                        cleanPathLower.startsWith('/download/') ||
                        cleanPathLower.startsWith('/admin') ||
                        cleanPathLower.startsWith('/login') ||
                        cleanPathLower.startsWith('/masterworld');
                    robotsTag = isNoIndexPage
                        ? '<meta data-rh="true" name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">\n    <meta data-rh="true" name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">\n    <meta data-rh="true" name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">\n    <meta data-rh="true" name="slurp" content="noindex, nofollow, noarchive, nosnippet">\n    <meta data-rh="true" name="baiduspider" content="noindex, nofollow, noarchive, nosnippet">\n    <meta data-rh="true" name="yandex" content="noindex, nofollow, noarchive, nosnippet">\n    <meta data-rh="true" name="duckduckbot" content="noindex, nofollow, noarchive, nosnippet">'
                        : '<meta data-rh="true" name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';
                    seoTags = "\n    <title>".concat(title, "</title>\n    <meta name=\"description\" content=\"").concat(description, "\">\n    <meta data-rh=\"true\" name=\"keywords\" content=\"").concat(keywords, "\">\n    <meta data-rh=\"true\" name=\"application-name\" content=\"").concat(siteTitle, "\">\n    <meta data-rh=\"true\" name=\"color-scheme\" content=\"light dark\">\n    ").concat(robotsTag, "\n    <meta data-rh=\"true\" property=\"og:site_name\" content=\"").concat(siteTitle, "\">\n    <meta data-rh=\"true\" property=\"og:locale\" content=\"en_IN\">\n    <meta data-rh=\"true\" property=\"og:title\" content=\"").concat(title, "\">\n    <meta data-rh=\"true\" property=\"og:description\" content=\"").concat(description, "\">\n    <meta data-rh=\"true\" property=\"og:type\" content=\"").concat(pageType === 'blog' || pageType === 'news' ? 'article' : 'website', "\">\n    <meta data-rh=\"true\" property=\"og:url\" content=\"").concat(canonicalUrl, "\">\n    <meta data-rh=\"true\" property=\"og:image\" content=\"").concat(pageOgImage, "\">\n    <meta data-rh=\"true\" property=\"og:image:secure_url\" content=\"").concat(pageOgImage, "\">\n    <meta data-rh=\"true\" property=\"og:image:type\" content=\"").concat(pageOgImage.includes('.jpg') || pageOgImage.includes('f_jpg') ? 'image/jpeg' : 'image/png', "\">\n    <meta data-rh=\"true\" property=\"og:image:width\" content=\"1200\">\n    <meta data-rh=\"true\" property=\"og:image:height\" content=\"630\">\n    <meta data-rh=\"true\" name=\"twitter:card\" content=\"summary_large_image\">\n    <meta data-rh=\"true\" name=\"twitter:site\" content=\"@RummyDex\">\n    <meta data-rh=\"true\" name=\"twitter:creator\" content=\"@RummyDex\">\n    <meta data-rh=\"true\" name=\"twitter:title\" content=\"").concat(title, "\">\n    <meta data-rh=\"true\" name=\"twitter:description\" content=\"").concat(description, "\">\n    <meta data-rh=\"true\" name=\"twitter:image\" content=\"").concat(pageOgImage, "\">\n    <link data-rh=\"true\" rel=\"alternate\" type=\"application/rss+xml\" title=\"RummyDex News\" href=\"/rss.xml\">\n    <link data-rh=\"true\" rel=\"image_src\" href=\"").concat(pageOgImage, "\">\n    <link data-rh=\"true\" rel=\"canonical\" href=\"").concat(canonicalUrl, "\">\n    <link data-rh=\"true\" rel=\"shortcut icon\" href=\"").concat(favicon32, "\">\n    <link data-rh=\"true\" rel=\"icon\" type=\"image/png\" href=\"").concat(favicon32, "\">\n    <link data-rh=\"true\" rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"").concat(favicon32, "\">\n    <link data-rh=\"true\" rel=\"icon\" type=\"image/png\" sizes=\"192x192\" href=\"").concat(favicon192, "\">\n    <link data-rh=\"true\" rel=\"apple-touch-icon\" href=\"").concat(favicon180, "\">\n    <link data-rh=\"true\" rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"").concat(favicon180, "\">\n    <link data-rh=\"true\" rel=\"apple-touch-icon-precomposed\" href=\"").concat(favicon180, "\">\n    <link data-rh=\"true\" rel=\"manifest\" href=\"/site.webmanifest\">\n    ").concat(jsonLdSchema, "\n  ");
                    initialDataPayload = data;
                    if (data) {
                        targetAppSlug_1 = targetApp ? (_a = (0, utils_1.getField)(targetApp, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase() : null;
                        optimizedApps = Array.isArray(data.apps) ? data.apps.map(function (app) {
                            var _a;
                            var sanitizedApp = __assign({}, app);
                            delete sanitizedApp.more_information_url;
                            delete sanitizedApp.download_url;
                            delete sanitizedApp.encrypted_link;
                            delete sanitizedApp.url;
                            var isTarget = targetAppSlug_1 && ((_a = (0, utils_1.getField)(app, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === targetAppSlug_1;
                            if (isTarget)
                                return sanitizedApp;
                            return {
                                id: sanitizedApp.id,
                                name: sanitizedApp.name,
                                slug: sanitizedApp.slug,
                                icon_url: sanitizedApp.icon_url,
                                og_image_url: sanitizedApp.og_image_url,
                                category: sanitizedApp.category,
                                rating: sanitizedApp.rating,
                                review_count: sanitizedApp.review_count,
                                developer: sanitizedApp.developer,
                                file_size: sanitizedApp.file_size,
                                version: sanitizedApp.version,
                                is_featured: sanitizedApp.is_featured,
                                is_new: sanitizedApp.is_new,
                                is_hot: sanitizedApp.is_hot,
                                is_top_chart: sanitizedApp.is_top_chart,
                                top_chart_category: sanitizedApp.top_chart_category,
                                safety_status: sanitizedApp.safety_status,
                                is_coming_soon: sanitizedApp.is_coming_soon,
                                publish_date: sanitizedApp.publish_date,
                                serial_number: sanitizedApp.serial_number,
                                tags: sanitizedApp.tags
                            };
                        }) : [];
                        targetNewsSlug_1 = targetNews ? (_b = (0, utils_1.getField)(targetNews, 'slug')) === null || _b === void 0 ? void 0 : _b.toLowerCase() : null;
                        optimizedNews = Array.isArray(data.news) ? data.news.map(function (item) {
                            var _a;
                            var isTarget = targetNewsSlug_1 && ((_a = (0, utils_1.getField)(item, 'slug')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === targetNewsSlug_1;
                            if (isTarget)
                                return item;
                            return {
                                id: item.id,
                                slug: item.slug,
                                title: item.title,
                                logo_url: item.logo_url,
                                category: item.category,
                                published_at: item.published_at,
                                date: item.date,
                                read_time: item.read_time,
                                is_breaking: item.is_breaking,
                                is_new: item.is_new,
                                is_pinned: item.is_pinned
                            };
                        }) : [];
                        targetBlogSlug_1 = targetBlog ? (_c = ((0, utils_1.getField)(targetBlog, 'slug') || (0, utils_1.getField)(targetBlog, 'id'))) === null || _c === void 0 ? void 0 : _c.toLowerCase() : null;
                        optimizedBlogs = Array.isArray(data.blogs) ? data.blogs.map(function (item) {
                            var _a;
                            var isTarget = targetBlogSlug_1 && ((_a = ((0, utils_1.getField)(item, 'slug') || (0, utils_1.getField)(item, 'id'))) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === targetBlogSlug_1;
                            if (isTarget)
                                return item;
                            return {
                                id: item.id,
                                slug: item.slug,
                                title: item.title,
                                cover_image: item.cover_image,
                                category: item.category,
                                published_at: item.published_at,
                                read_time: item.read_time,
                                related_app_slug: item.related_app_slug
                            };
                        }) : [];
                        optimizedVideos = Array.isArray(data.videos) ? data.videos.map(function (item) {
                            var _a, _b;
                            var isTarget = targetVideo && ((_a = ((0, utils_1.getField)(item, 'slug') || (0, utils_1.getField)(item, 'id'))) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === ((_b = ((0, utils_1.getField)(targetVideo, 'slug') || (0, utils_1.getField)(targetVideo, 'id'))) === null || _b === void 0 ? void 0 : _b.toLowerCase());
                            if (isTarget)
                                return item;
                            return {
                                id: item.id,
                                slug: item.slug,
                                title: item.title,
                                thumbnail_url: item.thumbnail_url,
                                video_url: item.video_url,
                                duration: item.duration,
                                category: item.category
                            };
                        }) : [];
                        optimizedSettings = data.settings ? __assign({}, data.settings) : {};
                        // Prune heavy subpage bodies from initial data unless user is actively on that specific page
                        if (cleanPathLower !== '/about') {
                            delete optimizedSettings.about_us;
                            delete optimizedSettings.about_content;
                        }
                        if (cleanPathLower !== '/contact') {
                            delete optimizedSettings.contact_content;
                        }
                        if (cleanPathLower !== '/privacy') {
                            delete optimizedSettings.privacy_content;
                        }
                        if (cleanPathLower !== '/terms') {
                            delete optimizedSettings.terms_content;
                        }
                        if (cleanPathLower !== '/responsibility') {
                            delete optimizedSettings.responsibility_content;
                        }
                        if (cleanPathLower !== '/report-removal') {
                            delete optimizedSettings.report_removal_content;
                        }
                        if (cleanPathLower !== '/notice') {
                            delete optimizedSettings.important_notice;
                        }
                        if (cleanPathLower !== '/ethics') {
                            delete optimizedSettings.ethics_discrimination_text;
                        }
                        if (cleanPathLower !== '/disclaimer') {
                            delete optimizedSettings.disclaimer_text;
                        }
                        if (cleanPathLower !== '/developers') {
                            delete optimizedSettings.developers;
                        }
                        if (cleanPathLower !== '/faq' && cleanPathLower !== '/') {
                            delete optimizedSettings.website_faqs;
                        }
                        initialDataPayload = __assign(__assign({}, data), { apps: optimizedApps, news: optimizedNews, blogs: optimizedBlogs, videos: optimizedVideos, settings: optimizedSettings });
                    }
                    initialDataJson = JSON.stringify(initialDataPayload || {}).replace(/</g, '\\u003c');
                    // Aggressively rewrite raw Cloudinary URLs in the initial data payload to tiny WebP placeholders.
                    // This prevents headless bot scanners (like Pingdom) from discovering and pre-fetching unoptimized 16.7KB raw images.
                    initialDataJson = initialDataJson.replace(/https:\/\/res\.cloudinary\.com\/diewalae4\/image\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/[a-zA-Z0-9_-]+\.[a-zA-Z]+)/g, 'https://res.cloudinary.com/diewalae4/image/upload/f_webp,q_auto,w_256,h_256,c_fill/$1');
                    initialDataScript = "<script>window.__INITIAL_DATA__ = ".concat(initialDataJson, ";</script>");
                    finalHtml = template
                        .replace(/<title>[\s\S]*?<\/title>/gi, '')
                        .replace(/<meta\s+name="description"\s+[^>]*\/?>/gi, '')
                        .replace(/<meta\s+name="robots"\s+[^>]*\/?>/gi, '')
                        .replace(/<meta\s+property="og:[^"]+"\s+[^>]*\/?>/gi, '')
                        .replace(/<meta\s+name="twitter:[^"]+"\s+[^>]*\/?>/gi, '')
                        .replace(/<link\s+rel="canonical"\s+[^>]*\/?>/gi, '')
                        .replace(/<link\s+rel="(?:shortcut\s+)?icon"\s+[^>]*\/?>/gi, '')
                        .replace(/<link\s+rel="apple-touch-icon[^"]*"\s+[^>]*\/?>/gi, '');
                    // Inject dynamic SEO tags, styles & initial data script cleanly into <head>
                    if (finalHtml.includes('</head>')) {
                        finalHtml = finalHtml.replace('</head>', "".concat(seoTags, "\n").concat(initialDataScript, "\n</head>"));
                    }
                    else {
                        finalHtml = "".concat(seoTags, "\n").concat(initialDataScript, "\n").concat(finalHtml);
                    }
                    isBot = (0, utils_1.isBotUserAgent)(userAgent);
                    rootContent = isBot
                        ? preRenderedBody
                        : "<noscript>".concat(preRenderedBody, "</noscript>");
                    if (finalHtml.includes('<div id="root"></div>')) {
                        finalHtml = finalHtml.replace('<div id="root"></div>', "<div id=\"root\">".concat(rootContent, "</div>"));
                    }
                    else {
                        finalHtml = finalHtml.replace(/<div\s+id="root"[^>]*>[\s\S]*?<\/div>/i, "<div id=\"root\">".concat(rootContent, "</div>"));
                    }
                    return [2 /*return*/, { html: finalHtml, isNotFound: isNotFound, canonicalUrl: canonicalUrl, pageType: pageType, title: title, description: description }];
            }
        });
    });
}
