"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = escapeHtml;
exports.isBotUserAgent = isBotUserAgent;
exports.getField = getField;
exports.stripHtml = stripHtml;
exports.optimizeImageUrl = optimizeImageUrl;
exports.getYoutubeThumbnail = getYoutubeThumbnail;
exports.ensureAbsoluteUrl = ensureAbsoluteUrl;
exports.getOgImageUrl = getOgImageUrl;
exports.getOptimizedImageUrl = getOptimizedImageUrl;
function escapeHtml(unsafe) {
    if (!unsafe)
        return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function isBotUserAgent(userAgent) {
    if (!userAgent)
        return false;
    return /googlebot|google-inspectiontool|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/|slackbot|vkShare|W3C_Validator|whatsapp|telegrambot|discordbot|applebot|petalbot|crawler|spider|screaming frog|semrushbot|ahrefsbot|rogerbot|exabot|dotbot|chatgpt|gptbot|oai-searchbot|anthropic|claude|cohere|perplexity|amazonbot|bytespider/i.test(userAgent);
}
function getField(obj, key, fallback) {
    var _a, _b, _c;
    if (fallback === void 0) { fallback = ''; }
    if (!obj)
        return fallback;
    var value = obj[key];
    if (value === undefined || value === null)
        return fallback;
    if (typeof value === 'object') {
        if ('stringValue' in value)
            return (_a = value.stringValue) !== null && _a !== void 0 ? _a : fallback;
        if ('integerValue' in value)
            return (_b = String(value.integerValue)) !== null && _b !== void 0 ? _b : fallback;
        if ('booleanValue' in value)
            return (_c = String(value.booleanValue)) !== null && _c !== void 0 ? _c : fallback;
        return fallback;
    }
    return String(value);
}
function stripHtml(html) {
    if (!html)
        return '';
    var stripped = html.replace(/<[^>]*>?/gm, ' ');
    return stripped.replace(/\s+/g, ' ').trim();
}
function optimizeImageUrl(url, width) {
    if (width === void 0) { width = 128; }
    if (!url)
        return '';
    // Cloudinary image WebP and quality optimization
    if (url.includes('res.cloudinary.com')) {
        if (url.includes('/upload/') && !url.includes('f_webp') && !url.includes('f_auto')) {
            return url.replace('/upload/', "/upload/f_webp,q_auto,w_".concat(width, "/"));
        }
        return url;
    }
    // Unsplash image WebP optimization
    if (url.includes('images.unsplash.com')) {
        if (!url.includes('fm=webp')) {
            return "".concat(url).concat(url.includes('?') ? '&' : '?', "fm=webp&q=80&w=").concat(width);
        }
    }
    // Firebase Storage optimization
    if (url.includes('firebasestorage.app') || url.includes('firebasestorage.googleapis.com')) {
        return url.includes('?') ? "".concat(url, "&alt=media") : "".concat(url, "?alt=media");
    }
    return url;
}
function getYoutubeThumbnail(urlStr) {
    var _a;
    if (!urlStr)
        return '';
    var id = '';
    try {
        var url = new URL(urlStr);
        if (url.hostname.includes('youtube.com')) {
            if (url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/live/') || url.pathname.startsWith('/embed/') || url.pathname.startsWith('/v/')) {
                id = url.pathname.split('/')[2] || url.pathname.split('/')[1] || '';
            }
            else {
                id = url.searchParams.get('v') || '';
            }
        }
        else if (url.hostname.includes('youtu.be')) {
            id = url.pathname.slice(1);
        }
    }
    catch (e) {
        if (urlStr.length === 11 && !urlStr.includes('/'))
            id = urlStr;
    }
    if (!id) {
        var m = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
        if (m && m[1])
            id = m[1];
        else
            id = ((_a = urlStr.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0]) || '';
    }
    return id ? "https://img.youtube.com/vi/".concat(id, "/mqdefault.jpg") : '';
}
function ensureAbsoluteUrl(imgUrl, origin) {
    if (origin === void 0) { origin = 'https://www.rummydex.com'; }
    if (!imgUrl)
        return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
        return imgUrl;
    }
    return "".concat(origin).concat(imgUrl.startsWith('/') ? '' : '/').concat(imgUrl);
}
function getOgImageUrl(url, origin) {
    if (origin === void 0) { origin = 'https://www.rummydex.com'; }
    if (!url)
        return '';
    var absUrl = ensureAbsoluteUrl(url, origin);
    if (absUrl.includes('res.cloudinary.com') && absUrl.includes('/upload/')) {
        if (absUrl.includes('w_1200') && absUrl.includes('h_630')) {
            return absUrl;
        }
        return absUrl.replace(/\/upload\/(?:(?:[a-z]{1,3}_[a-zA-Z0-9_.:-]+,?)+\/)*(?:(v\d+)\/)?/, function (_match, version) {
            var v = version ? "".concat(version, "/") : '';
            return "/upload/f_jpg,q_auto,w_1200,h_630,c_fill/".concat(v);
        });
    }
    return absUrl;
}
function getOptimizedImageUrl(url, width) {
    if (width === void 0) { width = 160; }
    if (!url)
        return '';
    // Cloudinary dynamic optimization
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        if (url.includes("w_".concat(width))) {
            return url;
        }
        return url.replace(/\/upload\/(?:(?:[a-z]{1,3}_[a-zA-Z0-9_.:-]+,?)+\/)*(?:(v\d+)\/)?/, function (_match, version) {
            var v = version ? "".concat(version, "/") : '';
            return "/upload/f_webp,q_auto,w_".concat(width, "/").concat(v);
        });
    }
    // Unsplash dynamic optimization
    if (url.includes('images.unsplash.com')) {
        if (!url.includes('fm=webp') && !url.includes('auto=format')) {
            return "".concat(url).concat(url.includes('?') ? '&' : '?', "auto=format&fit=crop&q=80&w=").concat(width);
        }
    }
    return url;
}
