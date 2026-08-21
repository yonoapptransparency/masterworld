"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOgImageUrl = void 0;
exports.formatPageTitle = formatPageTitle;
exports.getCleanCanonicalUrl = getCleanCanonicalUrl;
var utils_1 = require("../seo/utils");
Object.defineProperty(exports, "getOgImageUrl", { enumerable: true, get: function () { return utils_1.getOgImageUrl; } });
function formatPageTitle(rawTitle, siteTitle) {
    if (siteTitle === void 0) { siteTitle = 'RummyDex'; }
    if (!rawTitle || !rawTitle.trim())
        return siteTitle;
    // If title contains multiple lines or linebreaks, take only the primary first line
    var firstLine = rawTitle.split(/\r?\n/)[0] || rawTitle;
    var clean = firstLine.trim().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    var escapedSite = siteTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var repeatedSuffixRegex = new RegExp("(?:\\s*[|\\-]\\s*".concat(escapedSite, ")+\\s*$"), 'i');
    clean = clean.replace(repeatedSuffixRegex, '').trim();
    if (!clean || clean.toLowerCase() === siteTitle.toLowerCase()) {
        return siteTitle;
    }
    // Cap base title so total title stays <= 60 characters for Google SERP
    var maxBaseLength = Math.max(20, 58 - siteTitle.length - 3);
    if (clean.length > maxBaseLength) {
        var truncated = clean.substring(0, maxBaseLength);
        var lastSpace = truncated.lastIndexOf(' ');
        clean = lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated;
    }
    return "".concat(clean, " | ").concat(siteTitle);
}
function getCleanCanonicalUrl(rawUrl, fallbackPath) {
    if (fallbackPath === void 0) { fallbackPath = '/'; }
    var DEFAULT_PRIMARY_DOMAIN = 'https://www.rummydex.com';
    var input = (rawUrl || '').trim();
    if (!input) {
        var cleanPath = fallbackPath.split('?')[0].split('#')[0];
        var formattedPath = cleanPath.startsWith('/') ? cleanPath : "/".concat(cleanPath);
        input = "".concat(DEFAULT_PRIMARY_DOMAIN).concat(formattedPath);
    }
    try {
        var parsed = new URL(input, DEFAULT_PRIMARY_DOMAIN);
        // Always enforce primary domain (https://www.rummydex.com) for canonical URLs
        parsed.hostname = 'www.rummydex.com';
        parsed.protocol = 'https:';
        var pathname = parsed.pathname;
        if (pathname.length > 1 && pathname.endsWith('/')) {
            pathname = pathname.slice(0, -1);
        }
        return "".concat(parsed.origin).concat(pathname);
    }
    catch (_a) {
        var clean = input.split('?')[0].split('#')[0];
        clean = clean
            .replace(/^http:\/\//i, 'https://')
            .replace(/^https:\/\/[^\/]+/i, DEFAULT_PRIMARY_DOMAIN);
        if (clean.length > 1 && clean.endsWith('/')) {
            clean = clean.slice(0, -1);
        }
        return clean || DEFAULT_PRIMARY_DOMAIN;
    }
}
