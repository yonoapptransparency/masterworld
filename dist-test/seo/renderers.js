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
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHeader = renderHeader;
exports.renderFooter = renderFooter;
exports.renderHome = renderHome;
exports.renderAppDetails = renderAppDetails;
exports.renderGateway = renderGateway;
exports.renderNewsList = renderNewsList;
exports.renderNewsDetail = renderNewsDetail;
exports.renderBlogsList = renderBlogsList;
exports.renderBlogDetail = renderBlogDetail;
exports.renderDevelopersList = renderDevelopersList;
exports.renderVideosList = renderVideosList;
exports.renderVideoDetail = renderVideoDetail;
exports.renderAbout = renderAbout;
exports.renderContact = renderContact;
exports.renderPrivacy = renderPrivacy;
exports.renderReportRemoval = renderReportRemoval;
exports.renderTerms = renderTerms;
exports.renderResponsibility = renderResponsibility;
exports.renderNotice = renderNotice;
exports.renderEthics = renderEthics;
exports.renderDisclaimer = renderDisclaimer;
exports.render404 = render404;
var utils_1 = require("./utils");
var defaultLegalContent_1 = require("../lib/defaultLegalContent");
function escapeHtml(unsafe) {
    if (!unsafe)
        return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function sanitizeHtml(html) {
    if (!html)
        return '';
    var clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi, '');
    clean = clean.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
    clean = clean.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '');
    clean = clean.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi, '');
    clean = clean.replace(/<!DOCTYPE\s+html[^>]*>/gi, '');
    clean = clean.replace(/<\/?(html|head|body)\b[^>]*>/gi, '');
    clean = clean.replace(/<svg[^>]*class=["'][^"']*art[^"']*["'][^>]*>[\s\S]*?<\/svg>/gi, '');
    clean = clean.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
    return clean.trim();
}
function renderHeader(settings) {
    var siteTitle = (0, utils_1.getField)(settings, 'site_title') || 'RummyDex';
    var logoUrl = (0, utils_1.getField)(settings, 'logo_url');
    var optimizedLogo = logoUrl ? (0, utils_1.optimizeImageUrl)(logoUrl, 100) : '';
    return "\n    <header class=\"py-3 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80\">\n      <div class=\"max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center\">\n        <a href=\"/\" class=\"flex items-center gap-3 font-bold text-lg text-zinc-900 dark:text-white\" aria-label=\"".concat(escapeHtml(siteTitle), " Home\">\n          ").concat(logoUrl ? "<img src=\"".concat(escapeHtml(optimizedLogo), "\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\" width=\"40\" height=\"40\" class=\"w-10 h-10 object-contain\" alt=\"").concat(escapeHtml(siteTitle), " Official Logo\"/>") : '', "\n          <span>").concat(escapeHtml(siteTitle), "</span>\n        </a>\n        <nav class=\"hidden md:flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300\" aria-label=\"Main Navigation\">\n          <a href=\"/\">Home</a>\n          <a href=\"/news\">News</a>\n          <a href=\"/videos\">Videos</a>\n          <a href=\"/developers\">Developers</a>\n          <a href=\"/about\">About</a>\n          <a href=\"/contact\">Contact</a>\n        </nav>\n      </div>\n    </header>\n  ");
}
function renderFooter(settings) {
    var siteTitle = (0, utils_1.getField)(settings, 'site_title') || 'RummyDex';
    var logoUrl = (0, utils_1.getField)(settings, 'logo_url');
    var metaDescription = (0, utils_1.getField)(settings, 'meta_description') || 'A transparency platform and directory for verified applications.';
    var optimizedLogo = logoUrl ? (0, utils_1.optimizeImageUrl)(logoUrl, 80) : '';
    return "\n    <footer class=\"pt-12 pb-8 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 mt-12 text-center text-zinc-500 dark:text-zinc-400\">\n      <div class=\"max-w-7xl mx-auto px-6\">\n        <h3 class=\"text-xl font-bold flex items-center justify-center gap-2 text-zinc-900 dark:text-white mb-2\">\n          ".concat(logoUrl ? "<img src=\"".concat(escapeHtml(optimizedLogo), "\" loading=\"lazy\" decoding=\"async\" width=\"32\" height=\"32\" class=\"w-8 h-8 object-contain\" alt=\"").concat(escapeHtml(siteTitle), " Brand Logo\" />") : '', "\n          <span>").concat(escapeHtml(siteTitle), "</span>\n        </h3>\n        <p class=\"text-sm max-w-xl mx-auto mb-6 leading-relaxed\">").concat(escapeHtml(metaDescription), "</p>\n        <div class=\"flex flex-wrap justify-center gap-6 text-xs font-semibold mb-8 text-zinc-600 dark:text-zinc-400\">\n          <a href=\"/\">Home</a>\n          <a href=\"/news\">News</a>\n          <a href=\"/videos\">Videos</a>\n          <a href=\"/developers\">Developers</a>\n          <a href=\"/about\">About</a>\n          <a href=\"/contact\">Contact</a>\n          <a href=\"/privacy\">Privacy</a>\n          <a href=\"/report-removal\">Report & Removal</a>\n          <a href=\"/terms\">Terms</a>\n          <a href=\"/notice\">Notice</a>\n          <a href=\"/ethics\">Ethics</a>\n          <a href=\"/disclaimer\">Disclaimer</a>\n          <a href=\"/responsibility\">Responsible Gaming</a>\n        </div>\n        <div class=\"text-xs text-zinc-400 mt-8\">&copy; ").concat(new Date().getFullYear(), " ").concat(escapeHtml(siteTitle), ". All rights reserved.</div>\n      </div>\n    </footer>\n  ");
}
function renderHome(apps, settings, news, videos) {
    var siteTitle = (0, utils_1.getField)(settings, 'site_title');
    var desc = (0, utils_1.getField)(settings, 'meta_description');
    var appsHtml = '';
    var sorted = __spreadArray([], apps, true).sort(function (a, b) { return parseInt((0, utils_1.getField)(a, 'serial_number', '999'), 10) - parseInt((0, utils_1.getField)(b, 'serial_number', '999'), 10); });
    sorted.forEach(function (app, i) {
        var name = (0, utils_1.getField)(app, 'name');
        var slug = (0, utils_1.getField)(app, 'slug');
        var category = (0, utils_1.getField)(app, 'category');
        var rating = (0, utils_1.getField)(app, 'rating', '5.0');
        var rawIcon = (0, utils_1.getField)(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
        var icon = (0, utils_1.optimizeImageUrl)(rawIcon, 128);
        var isNew = app.is_new === true || (app.is_new && app.is_new.booleanValue === true);
        var isTopItem = i < 4;
        appsHtml += "\n      <a href=\"/app/".concat(encodeURIComponent(slug), "\" class=\"flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5\" title=\"").concat(escapeHtml(name), " review and details\">\n        <span class=\"text-sm font-bold text-zinc-400 shrink-0 w-8 text-center\">").concat(i + 1, "</span>\n        <img src=\"").concat(escapeHtml(icon), "\" ").concat(isTopItem ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"', " decoding=\"async\" width=\"64\" height=\"64\" class=\"w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0\" alt=\"").concat(escapeHtml(name), " app icon\"/>\n        <div class=\"flex-1 min-w-0 text-left\">\n          <h3 class=\"font-bold text-base text-zinc-900 dark:text-zinc-100 truncate\">").concat(escapeHtml(name), "</h3>\n          <p class=\"text-xs text-zinc-500 truncate\">").concat(escapeHtml(category), "</p>\n          <div class=\"flex items-center gap-1.5 text-xs text-zinc-500 mt-1\">\n            <span>").concat(rating, "</span><span class=\"text-zinc-400\">\u2605</span>\n            ").concat(isNew ? "<span class=\"bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded\">NEW</span>" : '', "\n          </div>\n        </div>\n        <span class=\"bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none\">DETAILS</span>\n      </a>\n    ");
    });
    var newsHtml = '';
    news.slice(0, 3).forEach(function (n) {
        var title = (0, utils_1.getField)(n, 'title');
        var logo = (0, utils_1.getField)(n, 'logo_url');
        var optimizedLogo = logo ? (0, utils_1.optimizeImageUrl)(logo, 160) : '';
        newsHtml += "\n      <a href=\"/news/".concat(encodeURIComponent((0, utils_1.getField)(n, 'slug')), "\" class=\"flex gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left items-center\">\n        ").concat(logo ? "<img src=\"".concat(escapeHtml(optimizedLogo), "\" loading=\"lazy\" decoding=\"async\" width=\"60\" height=\"60\" class=\"w-15 h-15 rounded-lg object-cover shrink-0\" alt=\"").concat(escapeHtml(title), " article thumbnail\"/>") : '', "\n        <div class=\"min-w-0 flex-1\">\n          <h4 class=\"font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1 truncate\">").concat(escapeHtml(title), "</h4>\n          <p class=\"text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2\">").concat(escapeHtml((0, utils_1.getField)(n, 'description')), "</p>\n        </div>\n      </a>\n    ");
    });
    return "\n    <div>\n      <div class=\"text-center py-12 max-w-2xl mx-auto px-4\">\n        <h1 class=\"text-4xl font-extrabold text-zinc-900 dark:text-white mb-4\">".concat(escapeHtml(siteTitle), "</h1>\n        <p class=\"text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed\">").concat(escapeHtml(desc), "</p>\n      </div>\n      <div class=\"grid lg:grid-cols-[2fr,1fr] gap-8\">\n        <div class=\"bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm\">\n          <h2 class=\"text-xl font-bold mb-4 px-2 text-left\">Popular Applications</h2>\n          <div class=\"flex flex-col\">").concat(appsHtml, "</div>\n        </div>\n        <div class=\"space-y-6\">\n          <div class=\"bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm\">\n            <h3 class=\"font-bold text-md mb-4 text-left\">Latest News</h3>\n            <div class=\"flex flex-col gap-3\">").concat(newsHtml, "</div>\n            <a href=\"/news\" class=\"block text-xs font-bold text-blue-500 hover:underline mt-4 text-left\">View All Updates \u2192</a>\n          </div>\n        </div>\n      </div>\n    </div>\n  ");
}
function renderAppDetails(slug, apps, settings) {
    var cleanSlug = decodeURIComponent(slug).toLowerCase();
    var app = apps.find(function (a) { return (0, utils_1.getField)(a, 'slug').toLowerCase() === cleanSlug; });
    if (!app)
        return "<div class=\"py-12 text-center\"><h1 class=\"text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100\">App Not Found</h1><a href=\"/\" class=\"text-blue-600 dark:text-blue-400 font-semibold hover:underline\">Go Home</a></div>";
    var name = (0, utils_1.getField)(app, 'name');
    var cat = (0, utils_1.getField)(app, 'category', 'Card Game');
    var version = (0, utils_1.getField)(app, 'version', 'Latest');
    var size = (0, utils_1.getField)(app, 'file_size', 'Variable');
    var rating = (0, utils_1.getField)(app, 'rating', '5.0');
    var rawIcon = (0, utils_1.getField)(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
    var icon = (0, utils_1.optimizeImageUrl)(rawIcon, 256);
    var desc = app.description_html ? sanitizeHtml(app.description_html) : "<p>No comprehensive details are configured yet for ".concat(escapeHtml(name), ".</p>");
    var features = app.features_html ? sanitizeHtml(app.features_html) : '';
    var featureSectionContext = features ? "<div class=\"mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80\"><h2 class=\"text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100\">Key Features & Highlights</h2><div class=\"prose dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed\">".concat(features, "</div></div>") : '';
    var pkg = (0, utils_1.getField)(app, 'package_name', 'Verified Listing');
    var screenshotsHtml = '';
    if (app.screenshots && Array.isArray(app.screenshots) && app.screenshots.length > 0) {
        screenshotsHtml = "\n      <div class=\"mt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6\">\n        <h2 class=\"text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100\">Application Screenshots</h2>\n        <div class=\"flex gap-4 overflow-x-auto pb-4 scrollbar-thin\">\n          ".concat(app.screenshots.map(function (s, idx) {
            var shotUrl = (0, utils_1.optimizeImageUrl)(s, 600);
            return "<img src=\"".concat(escapeHtml(shotUrl), "\" loading=\"lazy\" decoding=\"async\" width=\"280\" height=\"160\" class=\"w-64 h-36 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 shadow-xs\" alt=\"").concat(escapeHtml(name), " screenshot ").concat(idx + 1, "\"/>");
        }).join(''), "\n        </div>\n      </div>\n    ");
    }
    var recommendedAppsHtml = '';
    var appCategory = (0, utils_1.getField)(app, 'category', '');
    var specificCats = appCategory
        ? appCategory.toLowerCase().split(',').map(function (c) { return c.trim(); }).filter(function (c) { return c && c !== 'all apps' && c !== 'all' && c !== 'apps' && c !== 'general'; })
        : [];
    var similarApps = apps.filter(function (a) {
        if ((0, utils_1.getField)(a, 'slug').toLowerCase() === cleanSlug)
            return false;
        var simCat = (0, utils_1.getField)(a, 'category', '').toLowerCase();
        var simSpecificCats = simCat.split(',').map(function (c) { return c.trim(); }).filter(function (c) { return c && c !== 'all apps' && c !== 'all' && c !== 'apps' && c !== 'general'; });
        return specificCats.some(function (sc) { return simSpecificCats.includes(sc) || simSpecificCats.some(function (asc) { return asc.includes(sc) || sc.includes(asc); }); });
    });
    if (similarApps.length < 3) {
        var matchedSlugs_1 = new Set(similarApps.map(function (a) { return (0, utils_1.getField)(a, 'slug').toLowerCase(); }));
        var remaining = apps.filter(function (a) { return (0, utils_1.getField)(a, 'slug').toLowerCase() !== cleanSlug && !matchedSlugs_1.has((0, utils_1.getField)(a, 'slug').toLowerCase()); });
        similarApps = __spreadArray(__spreadArray([], similarApps, true), remaining, true);
    }
    similarApps = similarApps.slice(0, 6);
    if (similarApps.length > 0) {
        recommendedAppsHtml = "\n      <div class=\"mt-10 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8 text-left\">\n        <h2 class=\"text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100\">Similar & Recommended Applications</h2>\n        <div class=\"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5\">\n          ".concat(similarApps.map(function (sim) {
            var simName = (0, utils_1.getField)(sim, 'name');
            var simSlug = (0, utils_1.getField)(sim, 'slug');
            var simIcon = (0, utils_1.optimizeImageUrl)((0, utils_1.getField)(sim, 'icon_url') || '', 128);
            var simRating = (0, utils_1.getField)(sim, 'rating', '4.8');
            var simCat = (0, utils_1.getField)(sim, 'category', 'Card Game');
            return "\n              <a href=\"/app/".concat(encodeURIComponent(simSlug), "\" class=\"flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-500/50 transition shadow-2xs\">\n                <img src=\"").concat(escapeHtml(simIcon), "\" loading=\"lazy\" decoding=\"async\" width=\"48\" height=\"48\" class=\"w-12 h-12 rounded-xl object-cover border border-zinc-100 dark:border-zinc-800 shrink-0\" alt=\"").concat(escapeHtml(simName), " app icon\"/>\n                <div class=\"flex-1 min-w-0\">\n                  <h3 class=\"font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate\">").concat(escapeHtml(simName), "</h3>\n                  <div class=\"flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5\">\n                    <span class=\"font-bold text-amber-500\">\u2605 ").concat(escapeHtml(simRating), "</span>\n                    <span>\u2022</span>\n                    <span class=\"truncate\">").concat(escapeHtml(simCat), "</span>\n                  </div>\n                </div>\n              </a>\n            ");
        }).join(''), "\n        </div>\n      </div>\n    ");
    }
    return "\n    <div class=\"w-full max-w-5xl mx-auto py-4 sm:py-6 px-1 sm:px-4\">\n      <div class=\"flex flex-col items-center text-center pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-8\">\n        <img src=\"".concat(escapeHtml(icon), "\" loading=\"eager\" decoding=\"async\" width=\"128\" height=\"128\" class=\"w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover mb-4 shadow-md border border-zinc-200/60 dark:border-zinc-700/60\" alt=\"").concat(escapeHtml(name), " icon\"/>\n        <h1 class=\"text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight mb-2.5\">").concat(escapeHtml(name), "</h1>\n        <div class=\"flex flex-wrap justify-center gap-2 text-xs font-semibold mb-6\">\n          <span class=\"bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50 px-3 py-1 rounded-full\">").concat(escapeHtml(cat), "</span>\n          <span class=\"bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 px-3 py-1 rounded-full\">Verified Safety</span>\n        </div>\n        \n        <div class=\"grid grid-cols-4 gap-2.5 w-full max-w-md mb-6 text-center text-xs\">\n          <div class=\"p-2.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 rounded-xl shadow-2xs\">\n            <span class=\"text-zinc-500 dark:text-zinc-400 block pb-0.5 font-medium text-[11px]\">Version</span>\n            <strong class=\"text-zinc-900 dark:text-zinc-100 font-bold\">").concat(escapeHtml(version), "</strong>\n          </div>\n          <div class=\"p-2.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 rounded-xl shadow-2xs\">\n            <span class=\"text-zinc-500 dark:text-zinc-400 block pb-0.5 font-medium text-[11px]\">Size</span>\n            <strong class=\"text-zinc-900 dark:text-zinc-100 font-bold\">").concat(escapeHtml(size), "</strong>\n          </div>\n          <div class=\"p-2.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 rounded-xl shadow-2xs\">\n            <span class=\"text-zinc-500 dark:text-zinc-400 block pb-0.5 font-medium text-[11px]\">Type</span>\n            <strong class=\"text-zinc-900 dark:text-zinc-100 font-bold truncate block\">").concat(escapeHtml(cat.split(',')[0]), "</strong>\n          </div>\n          <div class=\"p-2.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 rounded-xl shadow-2xs\">\n            <span class=\"text-zinc-500 dark:text-zinc-400 block pb-0.5 font-medium text-[11px]\">Rating</span>\n            <strong class=\"text-amber-600 dark:text-amber-400 font-bold\">").concat(escapeHtml(rating), " \u2605</strong>\n          </div>\n        </div>\n\n        <button type=\"button\" class=\"w-full sm:w-auto min-w-[200px] justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition inline-flex items-center gap-2 text-sm tracking-wide cursor-pointer\">Download Official APK &rarr;</button>\n      </div>\n\n      <div class=\"grid md:grid-cols-[2fr,1fr] gap-6 sm:gap-8\">\n        <div class=\"bg-white dark:bg-zinc-900 p-5 sm:p-7 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs text-left\">\n          <h2 class=\"text-lg sm:text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100\">About this application</h2>\n          <div class=\"prose dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base space-y-3\">").concat(desc, "</div>\n          ").concat(featureSectionContext, "\n          ").concat(screenshotsHtml, "\n        </div>\n        <div class=\"bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs h-fit text-left\">\n          <h3 class=\"text-xs font-bold mb-4 uppercase tracking-wider text-zinc-500 dark:text-zinc-400\">Technical Specifications</h3>\n          <table class=\"w-full text-xs text-left\">\n            <tr class=\"border-b border-zinc-100 dark:border-zinc-800/80\"><td class=\"py-2.5 text-zinc-500 dark:text-zinc-400 font-medium\">Developer</td><td class=\"py-2.5 font-bold text-right text-zinc-900 dark:text-zinc-100\">Store Verified</td></tr>\n            <tr class=\"border-b border-zinc-100 dark:border-zinc-800/80\"><td class=\"py-2.5 text-zinc-500 dark:text-zinc-400 font-medium\">Package Name</td><td class=\"py-2.5 font-bold text-right text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]\">").concat(escapeHtml(pkg), "</td></tr>\n            <tr class=\"border-b border-zinc-100 dark:border-zinc-800/80\"><td class=\"py-2.5 text-zinc-500 dark:text-zinc-400 font-medium\">Safety Status</td><td class=\"py-2.5 font-bold text-right text-emerald-600 dark:text-emerald-400\">Safe & Certified</td></tr>\n            <tr><td class=\"py-2.5 text-zinc-500 dark:text-zinc-400 font-medium\">Compatibility</td><td class=\"py-2.5 font-bold text-right text-zinc-900 dark:text-zinc-100\">Android 6.0+ / iOS</td></tr>\n          </table>\n        </div>\n      </div>\n\n      ").concat(recommendedAppsHtml, "\n    </div>\n  ");
}
function renderGateway(slug, settings, apps) {
    if (apps === void 0) { apps = []; }
    var cleanSlug = decodeURIComponent(slug).toLowerCase();
    var app = Array.isArray(apps) ? apps.find(function (a) { return (0, utils_1.getField)(a, 'slug').toLowerCase() === cleanSlug; }) : null;
    var siteTitle = (0, utils_1.getField)(settings, 'site_title') || 'RummyDex';
    if (!app) {
        return "\n      <div class=\"py-16 text-center max-w-2xl mx-auto px-4\">\n        <div class=\"inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl mb-4 font-bold text-2xl\">\uD83D\uDD12</div>\n        <h1 class=\"text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mb-2\">Verification Portal</h1>\n        <p class=\"text-sm text-zinc-500 dark:text-zinc-400 mb-6\">Direct access gateway for verified applications on ".concat(escapeHtml(siteTitle), ".</p>\n        <a href=\"/\" class=\"inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-md\">&larr; Return to Homepage</a>\n      </div>\n    ");
    }
    var name = (0, utils_1.getField)(app, 'name');
    var rawIcon = (0, utils_1.getField)(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
    var icon = (0, utils_1.optimizeImageUrl)(rawIcon, 160);
    return "\n    <div class=\"max-w-xl mx-auto py-10 px-6 shadow-xs bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800\">\n      <div class=\"text-center\">\n        <img src=\"".concat(escapeHtml(icon), "\" loading=\"lazy\" decoding=\"async\" width=\"80\" height=\"80\" class=\"w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-zinc-200 dark:border-zinc-700 shadow-sm\" alt=\"").concat(escapeHtml(name), " app icon\"/>\n        <h1 class=\"text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-1\">").concat(escapeHtml(name), "</h1>\n        <p class=\"text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold mb-4\">Official Listing</p>\n        <p class=\"text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8\">Access the application details, review summary, and verified specifications below.</p>\n        <a href=\"/app/").concat(encodeURIComponent(slug), "\" class=\"block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition shadow-md\">View Application Details</a>\n        <a href=\"/\" class=\"block text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:underline mt-4\">Browse All Applications</a>\n      </div>\n    </div>\n  ");
}
function renderNewsList(news, settings) {
    var cards = '';
    news.forEach(function (n) {
        var title = (0, utils_1.getField)(n, 'title');
        var logo = (0, utils_1.getField)(n, 'logo_url');
        var optimizedLogo = logo ? (0, utils_1.optimizeImageUrl)(logo, 300) : '';
        cards += "\n      <a href=\"/news/".concat(encodeURIComponent((0, utils_1.getField)(n, 'slug')), "\" class=\"flex flex-col sm:flex-row gap-4 p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left\" aria-label=\"Read full news article: ").concat(escapeHtml(title), "\">\n        ").concat(logo ? "<img src=\"".concat(escapeHtml(optimizedLogo), "\" loading=\"lazy\" decoding=\"async\" width=\"160\" height=\"120\" class=\"w-full sm:w-40 h-28 object-cover rounded-2xl shrink-0 border border-black/5\" alt=\"").concat(escapeHtml(title), " news cover banner\"/>") : '', "\n        <div class=\"flex-1\">\n          <span class=\"text-[10px] font-bold text-blue-500 uppercase\">").concat(escapeHtml((0, utils_1.getField)(n, 'category') || 'Report'), "</span>\n          <span class=\"text-[10px] font-bold text-zinc-400 uppercase ml-2\">").concat(escapeHtml((0, utils_1.getField)(n, 'created_at') || 'May 2026'), "</span>\n          <h3 class=\"text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug\">").concat(escapeHtml(title), "</h3>\n          <p class=\"text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed\">").concat(escapeHtml((0, utils_1.getField)(n, 'description')), "</p>\n          <span class=\"inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3\">Read Full Article: ").concat(escapeHtml(title), " \u2192</span>\n        </div>\n      </a>\n    ");
    });
    return "<div class=\"py-6 text-center container max-w-3xl mx-auto\"><h1 class=\"text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white\">Gaming News & Updates</h1><div class=\"flex flex-col gap-4\">".concat(cards || '<p class="text-zinc-400 py-10">No publications.</p>', "</div></div>");
}
function renderNewsDetail(slug, news, settings) {
    var cleanSlug = decodeURIComponent(slug).toLowerCase();
    var item = news.find(function (n) { return (0, utils_1.getField)(n, 'slug').toLowerCase() === cleanSlug; });
    if (!item)
        return "<div class=\"py-12 text-center\"><h1 class=\"text-2xl font-bold\">Failed to load article.</h1><a href=\"/news\" class=\"text-blue-500 hover:underline\">Go Back</a></div>";
    var title = (0, utils_1.getField)(item, 'title');
    var dateStr = (0, utils_1.getField)(item, 'created_at') || 'May 2026';
    var author = (0, utils_1.getField)(item, 'ceo_name', 'System Author');
    var cat = (0, utils_1.getField)(item, 'category', 'Report');
    var content = (0, utils_1.getField)(item, 'content') || (0, utils_1.getField)(item, 'description', '');
    var sanitizedContent = sanitizeHtml(content);
    var logo = (0, utils_1.getField)(item, 'logo_url');
    var optimizedLogo = logo ? (0, utils_1.optimizeImageUrl)(logo, 800) : '';
    return "\n    <article class=\"max-w-3xl mx-auto py-12 px-4 text-left\">\n      <header class=\"mb-6\">\n        <span class=\"text-xs text-blue-500 uppercase font-bold mr-2\">".concat(escapeHtml(cat), "</span>\n        <span class=\"text-xs text-zinc-400 uppercase font-bold\">").concat(dateStr, " | By ").concat(escapeHtml(author), "</span>\n        <h1 class=\"text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight\">").concat(escapeHtml(title), "</h1>\n      </header>\n      ").concat(logo ? "<div class=\"mb-8 rounded-3xl overflow-hidden border border-black/5\"><img src=\"".concat(escapeHtml(optimizedLogo), "\" loading=\"eager\" decoding=\"async\" width=\"800\" height=\"450\" class=\"w-full h-auto object-cover max-h-96\" alt=\"").concat(escapeHtml(title), " main cover article image\"/></div>") : '', "\n      <section class=\"prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold\">").concat(sanitizedContent.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>'), "</section>\n    </article>\n  ");
}
function renderBlogsList(blogs, settings) {
    var cards = '';
    (blogs || []).forEach(function (b) {
        var title = (0, utils_1.getField)(b, 'title');
        var slug = (0, utils_1.getField)(b, 'slug') || (0, utils_1.getField)(b, 'id');
        var cover = (0, utils_1.getField)(b, 'cover_url') || (0, utils_1.getField)(b, 'thumbnail_url');
        var optimizedCover = cover ? (0, utils_1.optimizeImageUrl)(cover, 600) : '';
        var author = (0, utils_1.getField)(b, 'author', 'Staff Editorial');
        var dateVal = (0, utils_1.getField)(b, 'publish_date') || (0, utils_1.getField)(b, 'published_at') || (0, utils_1.getField)(b, 'created_at') || 'Recent';
        var desc = (0, utils_1.getField)(b, 'seo_description') || (0, utils_1.getField)(b, 'description') || (0, utils_1.getField)(b, 'content', '').substring(0, 160);
        cards += "\n      <article class=\"flex flex-col bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl overflow-hidden hover:shadow-lg transition\">\n        <a href=\"/blog/".concat(encodeURIComponent(slug), "\" class=\"block h-56 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800\" aria-label=\"Read ").concat(escapeHtml(title), "\">\n          ").concat(cover ? "<img src=\"".concat(escapeHtml(optimizedCover), "\" loading=\"lazy\" decoding=\"async\" width=\"600\" height=\"320\" class=\"w-full h-full object-cover hover:scale-105 transition-transform duration-500\" alt=\"").concat(escapeHtml(title), " banner cover\"/>") : '', "\n        </a>\n        <div class=\"p-6 flex flex-col flex-1 text-left\">\n          <div class=\"flex items-center gap-3 text-xs text-zinc-400 font-semibold mb-2\">\n            <span class=\"text-blue-500 uppercase tracking-wider text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full\">App Update</span>\n            <time>").concat(escapeHtml(dateVal), "</time>\n            <span>\u2022</span>\n            <span>By ").concat(escapeHtml(author), "</span>\n          </div>\n          <h2 class=\"text-xl font-bold text-zinc-900 dark:text-white mb-2 leading-snug\">\n            <a href=\"/blog/").concat(encodeURIComponent(slug), "\" class=\"hover:text-blue-600 transition-colors\">").concat(escapeHtml(title), "</a>\n          </h2>\n          <p class=\"text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4 flex-1\">").concat(escapeHtml(desc), "</p>\n          <a href=\"/blog/").concat(encodeURIComponent(slug), "\" class=\"inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline\">\n            Read Full Guide &rarr;\n          </a>\n        </div>\n      </article>\n    ");
    });
    return "\n    <div class=\"py-6 container max-w-5xl mx-auto px-4 text-left\">\n      <header class=\"mb-10 text-center sm:text-left\">\n        <h1 class=\"text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-3\">Strategy Guides & Articles</h1>\n        <p class=\"text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl\">Expert walkthroughs, technical game teardowns, strategy guides, and transparency bulletins.</p>\n      </header>\n      <div class=\"grid sm:grid-cols-2 gap-8\">".concat(cards || '<p class="text-zinc-400 py-10 col-span-full text-center">No updates available at this moment.</p>', "</div>\n    </div>\n  ");
}
function renderBlogDetail(slug, blogs, settings) {
    var cleanSlug = decodeURIComponent(slug).toLowerCase();
    var blog = (blogs || []).find(function (b) { return (0, utils_1.getField)(b, 'slug').toLowerCase() === cleanSlug || (0, utils_1.getField)(b, 'id').toLowerCase() === cleanSlug; });
    if (!blog) {
        return "<div class=\"py-16 text-center max-w-xl mx-auto\"><h1 class=\"text-2xl font-bold mb-4\">Article Not Found</h1><p class=\"text-sm text-zinc-500 mb-6\">The requested article could not be located in our index.</p><a href=\"/blogs\" class=\"inline-block bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700\">View All Updates</a></div>";
    }
    var title = (0, utils_1.getField)(blog, 'title');
    var author = (0, utils_1.getField)(blog, 'author', 'Editorial Staff');
    var dateVal = (0, utils_1.getField)(blog, 'publish_date') || (0, utils_1.getField)(blog, 'published_at') || (0, utils_1.getField)(blog, 'created_at') || 'May 2026';
    var cover = (0, utils_1.getField)(blog, 'cover_url') || (0, utils_1.getField)(blog, 'thumbnail_url');
    var optimizedCover = cover ? (0, utils_1.optimizeImageUrl)(cover, 900) : '';
    var content = (0, utils_1.getField)(blog, 'content') || (0, utils_1.getField)(blog, 'description_html') || (0, utils_1.getField)(blog, 'description') || '';
    var sanitizedContent = sanitizeHtml(content);
    var relatedAppSlug = (0, utils_1.getField)(blog, 'related_app_slug');
    var relatedAppName = (0, utils_1.getField)(blog, 'related_app_name');
    return "\n    <article class=\"max-w-4xl mx-auto py-10 px-4 text-left\">\n      <nav class=\"flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-6\" aria-label=\"Breadcrumbs\">\n        <a href=\"/\" class=\"hover:text-blue-500\">Home</a>\n        <span>/</span>\n        <a href=\"/blogs\" class=\"hover:text-blue-500\">Guides & Articles</a>\n        <span>/</span>\n        <span class=\"text-zinc-600 dark:text-zinc-300 truncate max-w-xs\">".concat(escapeHtml(title), "</span>\n      </nav>\n\n      <header class=\"mb-8\">\n        <div class=\"flex items-center gap-3 text-xs font-semibold text-zinc-400 mb-3\">\n          <span class=\"bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold\">Verified Guide</span>\n          <time>").concat(escapeHtml(dateVal), "</time>\n          <span>\u2022</span>\n          <span>By ").concat(escapeHtml(author), "</span>\n        </div>\n        <h1 class=\"text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-4\">").concat(escapeHtml(title), "</h1>\n        ").concat(relatedAppName && relatedAppSlug ? "\n          <div class=\"inline-flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl text-xs font-semibold\">\n            <span class=\"text-zinc-500\">Related Application:</span>\n            <a href=\"/app/".concat(encodeURIComponent(relatedAppSlug), "\" class=\"font-bold text-blue-600 hover:underline\">").concat(escapeHtml(relatedAppName), " &rarr;</a>\n          </div>\n        ") : '', "\n      </header>\n\n      ").concat(cover ? "\n        <div class=\"mb-10 rounded-3xl overflow-hidden border border-black/5 shadow-sm max-h-[460px] bg-zinc-100\">\n          <img src=\"".concat(escapeHtml(optimizedCover), "\" loading=\"eager\" decoding=\"async\" width=\"900\" height=\"460\" class=\"w-full h-full object-cover\" alt=\"").concat(escapeHtml(title), " article header\"/>\n        </div>\n      ") : '', "\n\n      <section class=\"prose dark:prose-invert max-w-none text-zinc-750 leading-relaxed font-semibold text-base sm:text-lg\">\n        ").concat(sanitizedContent.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>'), "\n      </section>\n\n      <footer class=\"mt-12 pt-8 border-t border-black/5 flex justify-between items-center text-xs\">\n        <a href=\"/blogs\" class=\"font-bold text-blue-600 hover:underline\">&larr; Back to all updates</a>\n        <span class=\"text-zinc-400\">Published on ").concat(escapeHtml(dateVal), "</span>\n      </footer>\n    </article>\n  ");
}
function renderDevelopersList(developers, settings) {
    var cards = '';
    (developers || []).forEach(function (d) {
        var name = (0, utils_1.getField)(d, 'name') || (0, utils_1.getField)(d, 'title');
        var slug = (0, utils_1.getField)(d, 'slug');
        var logo = (0, utils_1.getField)(d, 'logo_url') || (0, utils_1.getField)(d, 'icon_url');
        var optimizedLogo = logo ? (0, utils_1.optimizeImageUrl)(logo, 120) : '';
        var desc = (0, utils_1.getField)(d, 'description') || 'Certified publisher and software developer.';
        var appCount = (0, utils_1.getField)(d, 'app_count') || '1+';
        cards += "\n      <div class=\"p-6 bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl text-left flex items-start gap-4\">\n        ".concat(logo ? "<img src=\"".concat(escapeHtml(optimizedLogo), "\" loading=\"lazy\" decoding=\"async\" width=\"64\" height=\"64\" class=\"w-16 h-16 rounded-2xl object-cover border border-black/5 shrink-0\" alt=\"").concat(escapeHtml(name), " developer brand logo\"/>") : '', "\n        <div class=\"flex-1 min-w-0\">\n          <h3 class=\"font-bold text-lg text-zinc-900 dark:text-white leading-tight\">").concat(escapeHtml(name), "</h3>\n          <span class=\"text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1 mb-2\">Verified Developer</span>\n          <p class=\"text-xs text-zinc-500 line-clamp-2 leading-relaxed\">").concat(escapeHtml(desc), "</p>\n        </div>\n      </div>\n    ");
    });
    return "\n    <div class=\"py-6 container max-w-4xl mx-auto px-4 text-left\">\n      <header class=\"mb-8 text-center sm:text-left\">\n        <h1 class=\"text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-2\">Verified Developer Directory</h1>\n        <p class=\"text-sm text-zinc-500\">Official profiles of verified software creators, studio publishers, and developer teams.</p>\n      </header>\n      <div class=\"grid sm:grid-cols-2 gap-4\">".concat(cards || '<p class="text-zinc-400 py-10 col-span-full">No developer listings registered.</p>', "</div>\n    </div>\n  ");
}
function renderVideosList(videos, settings) {
    var cards = '';
    videos.forEach(function (v) {
        var _a, _b;
        var title = (0, utils_1.getField)(v, 'title');
        var slug = (0, utils_1.getField)(v, 'slug');
        var desc = (0, utils_1.getField)(v, 'description', '');
        var videoUrl = (0, utils_1.getField)(v, 'url', '');
        var videoId = '';
        if (videoUrl.includes('v=')) {
            videoId = ((_a = videoUrl.split('v=')[1]) === null || _a === void 0 ? void 0 : _a.split('&')[0]) || '';
        }
        else if (videoUrl.includes('youtu.be/')) {
            videoId = ((_b = videoUrl.split('youtu.be/')[1]) === null || _b === void 0 ? void 0 : _b.split('?')[0]) || '';
        }
        var thumb = videoId ? "https://img.youtube.com/vi/".concat(videoId, "/hqdefault.jpg") : '';
        cards += "\n      <a href=\"/videos/".concat(encodeURIComponent(slug), "\" class=\"block p-4 border border-black/5 bg-white dark:bg-zinc-900 rounded-3xl text-left hover:shadow-md transition\">\n        ").concat(thumb ? "<img src=\"".concat(escapeHtml(thumb), "\" loading=\"lazy\" decoding=\"async\" width=\"360\" height=\"200\" class=\"w-full h-40 object-cover rounded-2xl mb-3 border border-black/5\" alt=\"").concat(escapeHtml(title), " video review thumbnail\"/>") : '', "\n        <h3 class=\"font-bold text-lg text-zinc-900 dark:text-white truncate\">").concat(escapeHtml(title), "</h3>\n        <p class=\"text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed\">").concat(escapeHtml(desc), "</p>\n      </a>\n    ");
    });
    return "<div class=\"py-6 text-center container max-w-3xl mx-auto\"><h1 class=\"text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white\">Video Reviews</h1><div class=\"grid sm:grid-cols-3 gap-4\">".concat(cards || '<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>', "</div></div>");
}
function renderVideoDetail(slug, videos, settings) {
    var _a, _b;
    var cleanSlug = decodeURIComponent(slug).toLowerCase();
    var v = videos.find(function (item) { return (0, utils_1.getField)(item, 'slug').toLowerCase() === cleanSlug || (0, utils_1.getField)(item, 'id').toLowerCase() === cleanSlug; });
    if (!v)
        return "<div class=\"py-12 text-center\"><h1 class=\"text-2xl font-bold\">Video not found.</h1><a href=\"/videos\" class=\"text-blue-500 hover:underline\">Go Back</a></div>";
    var title = (0, utils_1.getField)(v, 'title');
    var desc = (0, utils_1.getField)(v, 'description');
    var videoUrl = (0, utils_1.getField)(v, 'url', '');
    var videoId = '';
    if (videoUrl.includes('v=')) {
        videoId = ((_a = videoUrl.split('v=')[1]) === null || _a === void 0 ? void 0 : _a.split('&')[0]) || '';
    }
    else if (videoUrl.includes('youtu.be/')) {
        videoId = ((_b = videoUrl.split('youtu.be/')[1]) === null || _b === void 0 ? void 0 : _b.split('?')[0]) || '';
    }
    var thumb = videoId ? "https://img.youtube.com/vi/".concat(videoId, "/hqdefault.jpg") : '';
    return "\n    <div class=\"max-w-2xl mx-auto py-12 text-left\">\n      <h1 class=\"text-3xl font-extrabold mb-4\">".concat(escapeHtml(title), "</h1>\n      ").concat(thumb ? "<div class=\"mb-6 rounded-3xl overflow-hidden border border-black/5\"><img src=\"".concat(escapeHtml(thumb), "\" loading=\"eager\" decoding=\"async\" width=\"640\" height=\"360\" class=\"w-full h-auto object-cover max-h-80\" alt=\"").concat(escapeHtml(title), " full video preview image\"/></div>") : '', "\n      <p class=\"prose text-zinc-650 leading-relaxed font-semibold\">").concat(desc.replace(/\n\n/g, '<br/><br/>'), "</p>\n    </div>\n  ");
}
function renderAbout(settings) {
    var content = (0, utils_1.getField)(settings, 'about_content') || defaultLegalContent_1.DEFAULT_ABOUT_HTML;
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">About Us</h1><article class=\"prose text-zinc-750 leading-relaxed font-semibold\">".concat(content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>'), "</article></div>");
}
function renderContact(settings) {
    var content = (0, utils_1.getField)(settings, 'contact_content') || 'Get in touch for active client files help.';
    var email = (0, utils_1.getField)(settings, 'support_email', 'rummydex1@gmail.com');
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">Contact Us</h1><p class=\"prose mb-6 leading-relaxed font-semibold\">".concat(content, "</p><div class=\"grid gap-4 mt-6\"><div class=\"p-6 bg-zinc-50 rounded-2xl\"><strong>Email support address:</strong><p class=\"text-blue-500 font-bold mt-1\">").concat(escapeHtml(email), "</p></div><div class=\"p-6 bg-zinc-50 rounded-2xl\"><strong>Live Chat Support:</strong><p class=\"text-zinc-800 font-semibold mt-1\">Monday to Saturday, 10:00 AM - 3:00 PM (Instant reply in every section)</p></div><div class=\"p-6 bg-zinc-50 rounded-2xl\"><strong>Registered Delhi Office:</strong><p class=\"text-zinc-800 font-semibold mt-1\">Plot No. 18, 4th Floor, Commercial Complex, Sector 12, Dwarka, New Delhi, Delhi 110075, India</p></div></div></div>");
}
function renderPrivacy(settings) {
    var content = (0, utils_1.getField)(settings, 'privacy_content') || defaultLegalContent_1.DEFAULT_PRIVACY_HTML;
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">Privacy Policy</h1><article class=\"prose text-zinc-750 leading-relaxed font-semibold\">".concat(content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>'), "</article></div>");
}
function renderReportRemoval(settings) {
    var content = (0, utils_1.getField)(settings, 'report_removal_content') || defaultLegalContent_1.DEFAULT_REPORT_REMOVAL_HTML;
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">Report & Removal Policy</h1><article class=\"prose text-zinc-750 leading-relaxed font-semibold\">".concat(content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>'), "</article></div>");
}
function renderTerms(settings) {
    var content = (0, utils_1.getField)(settings, 'terms_content') || defaultLegalContent_1.DEFAULT_TERMS_HTML;
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">Terms of Service</h1><article class=\"prose text-zinc-750 leading-relaxed font-semibold\">".concat(content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>'), "</article></div>");
}
function renderResponsibility(settings) {
    var content = (0, utils_1.getField)(settings, 'responsibility_content') || defaultLegalContent_1.DEFAULT_RESPONSIBILITY_HTML;
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">Responsible Gaming</h1><article class=\"prose text-zinc-750 leading-relaxed font-semibold\">".concat(content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>'), "</article></div>");
}
function renderNotice(settings) {
    var heading = (0, utils_1.getField)(settings, 'important_notice_heading') || 'Important Notice';
    var content = (0, utils_1.getField)(settings, 'important_notice') || defaultLegalContent_1.DEFAULT_NOTICE_HTML;
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">".concat(heading, "</h1><article class=\"prose text-zinc-750 leading-relaxed font-semibold\">").concat(content, "</article></div>");
}
function renderEthics(settings) {
    var heading = (0, utils_1.getField)(settings, 'ethics_heading') || 'Ethics & Safety';
    var content = (0, utils_1.getField)(settings, 'ethics_discrimination_text') || defaultLegalContent_1.DEFAULT_ETHICS_HTML;
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">".concat(heading, "</h1><article class=\"prose text-zinc-750 leading-relaxed font-semibold\">").concat(content, "</article></div>");
}
function renderDisclaimer(settings) {
    var heading = (0, utils_1.getField)(settings, 'disclaimer_heading') || 'Disclaimer';
    var content = (0, utils_1.getField)(settings, 'disclaimer_text') || defaultLegalContent_1.DEFAULT_DISCLAIMER_HTML;
    return "<div class=\"max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5\"><h1 class=\"text-4xl font-bold mb-6\">".concat(heading, "</h1><article class=\"prose text-zinc-750 leading-relaxed font-semibold\">").concat(content, "</article></div>");
}
function render404(urlPath, settings) {
    var siteTitle = (0, utils_1.getField)(settings, 'site_title') || 'RummyDex';
    return "\n    <div class=\"py-16 text-center max-w-2xl mx-auto px-4\">\n      <div class=\"inline-flex items-center justify-center w-20 h-20 bg-red-500/10 text-red-600 dark:text-red-400 rounded-3xl mb-6 font-extrabold text-3xl\">404</div>\n      <h1 class=\"text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4\">404 - Page Not Found</h1>\n      <h2 class=\"text-lg font-bold text-zinc-600 dark:text-zinc-400 mb-6\">The requested resource could not be found on ".concat(escapeHtml(siteTitle), "</h2>\n      <p class=\"text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed\">\n        The URL <code class=\"bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-red-500 font-mono text-sm\">").concat(escapeHtml(urlPath), "</code> does not match any application listing, news bulletin, or page.\n      </p>\n      <div class=\"flex flex-wrap items-center justify-center gap-4\">\n        <a href=\"/\" class=\"bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition\">Return to Homepage</a>\n        <a href=\"/news\" class=\"bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3.5 px-8 rounded-2xl transition\">Latest News</a>\n      </div>\n    </div>\n  ");
}
