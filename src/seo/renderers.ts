import { getField, optimizeImageUrl, stripHtml } from './utils';
import { resolveAppSlug } from '../lib/slugResolver';
import communityCatalogStats from '../lib/communityCatalogStats.json';
import {
  DEFAULT_DISCLAIMER_HTML,
  DEFAULT_ETHICS_HTML,
  DEFAULT_PRIVACY_HTML,
  DEFAULT_TERMS_HTML,
  DEFAULT_RESPONSIBILITY_HTML,
  DEFAULT_REPORT_REMOVAL_HTML,
  DEFAULT_NOTICE_HTML,
  DEFAULT_ABOUT_HTML
} from '../lib/defaultLegalContent';

function escapeHtml(unsafe: string) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeHtml(html: string): string {
  if (!html) return '';
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
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

export function renderHeader(settings: any) {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const logoUrl = getField(settings, 'logo_url');
  const optimizedLogo = logoUrl ? optimizeImageUrl(logoUrl, 120) : '';
  return `
    <header class="sticky top-0 z-50 bg-white dark:bg-black sm:bg-white/80 sm:dark:bg-black/80 border-b border-white/20 dark:border-white/10 py-2.5 sm:py-3">
      <div class="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto relative flex justify-between items-center">
        <a href="/" class="flex items-center gap-2.5 sm:gap-3 group" aria-label="${escapeHtml(siteTitle)} Home">
          <div class="p-0 shrink-0">
            ${logoUrl ? `<img src="${escapeHtml(optimizedLogo)}" loading="eager" fetchpriority="high" decoding="async" width="56" height="56" class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-sm" alt="${escapeHtml(siteTitle)} Official Logo"/>` : `<div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">${escapeHtml(siteTitle.substring(0, 1))}</div>`}
          </div>
          <div class="flex flex-col leading-none">
            <span class="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">${escapeHtml(siteTitle)}</span>
          </div>
        </a>
        <nav class="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium" aria-label="Main Navigation">
          <a href="/" class="text-blue-600 font-medium">Home</a>
          <a href="/news" class="text-zinc-600 dark:text-zinc-300 hover:text-blue-500">News</a>
          <a href="/videos" class="text-zinc-600 dark:text-zinc-300 hover:text-blue-500">Videos</a>
          <a href="/developers" class="text-zinc-600 dark:text-zinc-300 hover:text-blue-500">Developers</a>
          <a href="/about" class="text-zinc-600 dark:text-zinc-300 hover:text-blue-500">About</a>
          <a href="/contact" class="text-zinc-600 dark:text-zinc-300 hover:text-blue-500">Contact</a>
        </nav>
      </div>
    </header>
  `;
}

export function renderFooter(settings: any) {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const logoUrl = getField(settings, 'logo_url');
  const metaDescription = getField(settings, 'meta_description') || 'A transparency platform and directory for verified applications.';
  const optimizedLogo = logoUrl ? optimizeImageUrl(logoUrl, 100) : '';

  return `
    <footer class="pt-12 pb-8 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 mt-12 text-center text-zinc-500 dark:text-zinc-400">
      <div class="max-w-7xl mx-auto px-6">
        <h3 class="text-xl font-bold flex items-center justify-center gap-2 text-zinc-900 dark:text-white mb-2">
          ${logoUrl ? `<img src="${escapeHtml(optimizedLogo)}" loading="lazy" decoding="async" width="32" height="32" class="w-8 h-8 object-contain" alt="${escapeHtml(siteTitle)} Brand Logo" />` : ''}
          <span>${escapeHtml(siteTitle)}</span>
        </h3>
        <p class="text-sm max-w-xl mx-auto mb-6 leading-relaxed">${escapeHtml(metaDescription)}</p>
        <div class="flex flex-wrap justify-center gap-6 text-xs font-semibold mb-8 text-zinc-600 dark:text-zinc-400">
          <a href="/">Home</a>
          <a href="/news">News</a>
          <a href="/videos">Videos</a>
          <a href="/developers">Developers</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/report-removal">Report & Removal</a>
          <a href="/terms">Terms</a>
          <a href="/notice">Notice</a>
          <a href="/ethics">Ethics</a>
          <a href="/disclaimer">Disclaimer</a>
          <a href="/responsibility">Responsible Gaming</a>
        </div>
        <div class="text-xs text-zinc-400 mt-8">&copy; ${new Date().getFullYear()} ${escapeHtml(siteTitle)}. All rights reserved.</div>
      </div>
    </footer>
  `;
}

export function renderAppItemHtml(app: any, index: number): string {
  const name = getField(app, 'name');
  const slug = getField(app, 'slug');
  const category = getField(app, 'category');
  const rating = getField(app, 'rating', '5.0');
  const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
  const icon = optimizeImageUrl(rawIcon, 160);
  const isNew = app.is_new === true || (app.is_new && app.is_new.booleanValue === true);
  const isHot = app.is_hot === true || (app.is_hot && app.is_hot.booleanValue === true);
  const isTopItem = index < 6;

  return `
    <div class="relative group [content-visibility:auto] [contain-intrinsic-size:auto_84px]">
      <a href="/app/${encodeURIComponent(slug)}" class="flex items-center gap-2.5 sm:gap-4 py-2.5 pl-2 pr-12 sm:pl-4 sm:pr-14 sm:py-3.5 mb-0 sm:mb-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 rounded-xl sm:rounded-2xl relative active:bg-black/5 dark:active:bg-white/5 w-full text-left" title="${escapeHtml(name)} review and details">
        <div class="w-5 sm:w-7 text-[15px] sm:text-[17px] font-black text-zinc-400 dark:text-zinc-500 text-center shrink-0">
          ${index + 1}
        </div>
        <div class="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] shrink-0">
          <div class="w-full h-full rounded-[18px] overflow-hidden bg-white shadow-sm border border-black/5 dark:border-white/10 relative z-10 transition-transform group-hover:-translate-y-0.5 duration-300">
            <img src="${escapeHtml(icon)}" alt="${escapeHtml(name)} app icon" width="84" height="84" ${isTopItem ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" class="w-full h-full object-cover" />
          </div>
          ${isHot ? `<div class="absolute -top-1.5 -right-2.5 z-20 pointer-events-none"><span class="bg-[#d32f2f] text-white text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-[10px] shadow-sm uppercase tracking-wider block">HOT</span></div>` : ''}
          ${!isHot && isNew ? `<div class="absolute -top-1.5 -right-2.5 z-20 pointer-events-none"><span class="bg-[#008738] text-white text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-[10px] shadow-sm uppercase tracking-wider block">NEW</span></div>` : ''}
        </div>
        <div class="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <h3 class="font-semibold text-base sm:text-[17px] tracking-tight text-zinc-900 dark:text-zinc-100 truncate w-full">${escapeHtml(name)}</h3>
          <div class="text-xs sm:text-[13px] font-normal text-zinc-500 dark:text-zinc-400 truncate">${escapeHtml(category)}</div>
          <div class="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span>${escapeHtml(rating)}</span>
            <span class="text-zinc-400">★</span>
            <span class="text-blue-500 text-[11px] font-medium ml-1">Verified</span>
          </div>
        </div>
        <div class="absolute bottom-0 right-4 left-[110px] sm:left-[138px] border-b border-black/5 dark:border-white/5 opacity-50"></div>
      </a>
    </div>
  `;
}

export function renderHome(apps: any[], settings: any, news: any[], videos: any[]) {
  const heroTitle = settings.hero_title_text || settings.site_title || 'RummyDex';
  const heroSubtitle = settings.hero_title_subtitle || settings.meta_description || '';
  
  const sorted = [...apps].sort((a,b) => parseInt(getField(a, 'serial_number','999'), 10) - parseInt(getField(b, 'serial_number','999'), 10));
  const appsHtml = sorted.slice(0, 30).map((app, i) => renderAppItemHtml(app, i)).join('');

  let newsHtml = '';
  (news || []).slice(0, 3).forEach(n => {
    const title = getField(n, 'title');
    const logo = getField(n, 'logo_url');
    const optimizedLogo = logo ? optimizeImageUrl(logo, 160) : '';
    newsHtml += `
      <a href="/news/${encodeURIComponent(getField(n, 'slug'))}" class="flex gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left items-center">
        ${logo ? `<img src="${escapeHtml(optimizedLogo)}" loading="lazy" decoding="async" width="60" height="60" class="w-15 h-15 rounded-lg object-cover shrink-0" alt="${escapeHtml(title)} article thumbnail"/>` : ''}
        <div class="min-w-0 flex-1">
          <h4 class="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1 truncate">${escapeHtml(title)}</h4>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">${escapeHtml(getField(n, 'description'))}</p>
        </div>
      </a>
    `;
  });

  return `
    <div class="w-full select-none">
      <div class="relative w-full overflow-hidden pt-4 pb-3 sm:pt-6 sm:pb-4 px-4">
        <div class="max-w-4xl mx-auto flex flex-col items-center justify-center gap-1">
          <h1 class="font-sans font-black tracking-tight text-center leading-none text-xl sm:text-2xl md:text-3.5xl bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-900 bg-clip-text text-transparent dark:from-white dark:via-zinc-200 dark:to-zinc-300 block max-w-3xl">
            ${escapeHtml(heroTitle)}
          </h1>
          ${heroSubtitle ? `<p class="text-[9px] sm:text-[10px] font-bold tracking-[0.18em] text-zinc-900/60 dark:text-zinc-100/60 uppercase max-w-2xl pt-0.5 leading-tight">${escapeHtml(heroSubtitle)}</p>` : ''}
          <div class="h-[2px] w-12 rounded-full mt-1 bg-zinc-200 dark:bg-zinc-800"></div>
        </div>
      </div>

      <div class="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 mt-2">
        <div class="flex flex-col space-y-1 sm:space-y-2">
          ${appsHtml}
        </div>
      </div>

      ${newsHtml ? `
        <div class="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 mt-10">
          <h2 class="text-lg sm:text-xl font-bold mb-4 text-left text-zinc-900 dark:text-zinc-100">Latest Updates & News</h2>
          <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">${newsHtml}</div>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderCategory(categoryName: string, categorySlug: string, categoryApps: any[], settings: any) {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const sorted = [...categoryApps].sort((a,b) => parseInt(getField(a, 'serial_number','999'), 10) - parseInt(getField(b, 'serial_number','999'), 10));
  const appsHtml = sorted.map((app, i) => renderAppItemHtml(app, i)).join('');

  return `
    <div class="w-full max-w-7xl mx-auto py-6 px-2 sm:px-4 md:px-6">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6 text-left">
        <a href="/" class="hover:text-blue-600">Home</a>
        <span>/</span>
        <a href="/categories" class="hover:text-blue-600">Categories</a>
        <span>/</span>
        <span class="font-bold text-zinc-800 dark:text-zinc-200">${escapeHtml(categoryName)}</span>
      </nav>
      <div class="text-center py-6 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">${escapeHtml(categoryName)} Apps & Reviews</h1>
        <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Explore all ${categoryApps.length} verified ${escapeHtml(categoryName)} applications, ratings, download specifications, and reviews on ${escapeHtml(siteTitle)}.</p>
      </div>
      <div class="flex flex-col space-y-1 sm:space-y-2">
        ${appsHtml || '<p class="text-center text-zinc-400 py-10">No applications listed under this category.</p>'}
      </div>
    </div>
  `;
}

export function renderNewApps(newApps: any[], settings: any) {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const appsHtml = newApps.map((app, i) => renderAppItemHtml(app, i)).join('');

  return `
    <div class="w-full max-w-7xl mx-auto py-6 px-2 sm:px-4 md:px-6">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6 text-left">
        <a href="/" class="hover:text-blue-600">Home</a>
        <span>/</span>
        <span class="font-bold text-zinc-800 dark:text-zinc-200">New Apps</span>
      </nav>
      <div class="text-center py-6 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">Newly Added Applications</h1>
        <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Discover the latest game releases, new apps, and updates on ${escapeHtml(siteTitle)}.</p>
      </div>
      <div class="flex flex-col space-y-1 sm:space-y-2">
        ${appsHtml || '<p class="text-center text-zinc-400 py-10">No newly added applications found.</p>'}
      </div>
    </div>
  `;
}

export function renderCategoriesList(categoriesList: Array<{ name: string; slug: string; count: number }>, settings: any) {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  
  let catsHtml = '';
  categoriesList.forEach(cat => {
    catsHtml += `
      <a href="/category/${encodeURIComponent(cat.slug)}" class="p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/30 rounded-3xl transition flex flex-col justify-between text-left shadow-2xs">
        <div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white mb-1.5">${escapeHtml(cat.name)}</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">${cat.count} verified ${cat.count === 1 ? 'application' : 'applications'}</p>
        </div>
        <span class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-4">Browse Category →</span>
      </a>
    `;
  });

  return `
    <div class="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        <a href="/" class="hover:text-blue-600">Home</a>
        <span>/</span>
        <span class="font-bold text-zinc-800 dark:text-zinc-200">Categories</span>
      </nav>
      <div class="text-center py-8 mb-6 bg-white dark:bg-zinc-900 rounded-[28px] border border-black/5 p-6 shadow-sm">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Application Categories</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Browse apps by game genre and category on ${escapeHtml(siteTitle)}.</p>
      </div>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${catsHtml || '<p class="text-center text-zinc-400 py-10 col-span-full">No categories available.</p>'}
      </div>
    </div>
  `;
}

export function renderAppDetails(slug: string, apps: any[], settings: any, sampleReviews: any[] = [], liveStats: any = null) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const app = resolveAppSlug(cleanSlug, apps) || apps.find(a => getField(a, 'slug').toLowerCase() === cleanSlug);
  if (!app) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">App Not Found</h1><a href="/" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Go Home</a></div>`;

  const name = getField(app, 'name');
  const cat = getField(app, 'category', 'Card Game');
  const version = getField(app, 'version', 'Latest');
  const size = getField(app, 'file_size', 'Variable');
  const cleanId = String(getField(app, 'id')).toLowerCase().trim();
  const developerName = getField(app, 'developer', 'Developer');
  const isNew = app.is_new === true || (app.is_new && app.is_new.booleanValue === true);

  // Unified single source of truth for SEO ratings & counts
  const catStats = (communityCatalogStats as any)?.appCounts || {};
  const hit = (cleanId && catStats[cleanId]) || (cleanSlug && catStats[cleanSlug]);

  const rawRating = parseFloat(getField(app, 'rating')) || 4.5;
  const rawCount = parseInt(getField(app, 'review_count') || getField(app, 'reviews') || '0', 10);

  let finalRating = rawRating;
  let finalCount = rawCount;

  if (liveStats && Number(liveStats.totalReviews) > 0) {
    finalRating = Number(liveStats.averageRating) || rawRating;
    finalCount = Number(liveStats.totalReviews) || rawCount;
  } else if (hit && Number(hit.published) > 0) {
    finalRating = Number(hit.avgRating) || rawRating;
    finalCount = Number(hit.published) || rawCount;
  } else if (sampleReviews.length > 0 && finalCount === 0) {
    finalCount = sampleReviews.length;
  }

  const ratingCountVal = finalCount;
  const rating = finalRating.toFixed(1);
  const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
  const icon = optimizeImageUrl(rawIcon, 256);
  const desc = app.description_html ? sanitizeHtml(app.description_html) : `<p>Comprehensive application profile and details for <strong>${escapeHtml(name)}</strong>.</p>`;
  const features = app.features_html ? sanitizeHtml(app.features_html) : '';
  const pkg = getField(app, 'package_name', 'Verified Listing');

  // Breadcrumbs
  const mainCat = cat.split(',')[0].trim();
  const catSlug = encodeURIComponent(mainCat.toLowerCase().replace(/\s+/g, '-'));

  // Safety & Notice Callouts (1:1 with AppSafetyBoxes.tsx)
  let alertsHtml = '';
  const hasRed = app.red_box_msg && app.red_box_msg.trim() !== '.' && app.red_box_msg.trim() !== '';
  const hasYellow = app.yellow_box_msg && app.yellow_box_msg.trim() !== '.' && app.yellow_box_msg.trim() !== '';
  const hasIdea = app.idea_box_msg && app.idea_box_msg.trim() !== '.' && app.idea_box_msg.trim() !== '';

  if (hasRed || hasYellow || hasIdea) {
    alertsHtml = `
      <div class="px-1 sm:px-4 md:px-6 space-y-3 mb-8 w-full">
        ${hasRed ? `
          <div class="bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-4 rounded-2xl flex items-start gap-4 shadow-sm group text-left">
            <div class="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl text-rose-600 shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="text-sm font-medium text-rose-800 dark:text-rose-200 leading-relaxed pt-0.5">
              ${escapeHtml(app.red_box_msg)}
            </div>
          </div>
        ` : ''}
        ${hasYellow ? `
          <div class="bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 p-4 rounded-2xl flex items-start gap-4 shadow-sm group text-left">
            <div class="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-xl text-orange-600 shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div class="text-sm font-medium text-orange-800 dark:text-orange-200 leading-relaxed pt-0.5">
              ${escapeHtml(app.yellow_box_msg)}
            </div>
          </div>
        ` : ''}
        ${hasIdea ? `
          <div class="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-2xl flex items-start gap-4 shadow-sm group text-left">
            <div class="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div class="text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed pt-0.5">
              ${escapeHtml(app.idea_box_msg)}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Similar / Recommended Applications (1:1 with lines 480-527 of AppDetails.tsx)
  let recommendedAppsHtml = '';
  const appCategory = getField(app, 'category', '');
  const specificCats = appCategory
    ? appCategory.toLowerCase().split(',').map((c: string) => c.trim()).filter((c: string) => c && c !== 'all apps' && c !== 'all' && c !== 'apps' && c !== 'general')
    : [];

  let similarApps = apps.filter((a: any) => {
    if (getField(a, 'slug').toLowerCase() === cleanSlug) return false;
    const simCat = getField(a, 'category', '').toLowerCase();
    const simSpecificCats = simCat.split(',').map((c: string) => c.trim()).filter((c: string) => c && c !== 'all apps' && c !== 'all' && c !== 'apps' && c !== 'general');
    return specificCats.some((sc: string) => simSpecificCats.includes(sc) || simSpecificCats.some((asc: string) => asc.includes(sc) || sc.includes(asc)));
  });

  if (similarApps.length < 3) {
    const matchedSlugs = new Set(similarApps.map((a: any) => getField(a, 'slug').toLowerCase()));
    const remaining = apps.filter((a: any) => getField(a, 'slug').toLowerCase() !== cleanSlug && !matchedSlugs.has(getField(a, 'slug').toLowerCase()));
    similarApps = [...similarApps, ...remaining];
  }
  similarApps = similarApps.slice(0, 12);

  if (similarApps.length > 0) {
    recommendedAppsHtml = `
      <section aria-labelledby="related-apps-heading" class="my-6 px-0">
        <div class="flex items-center justify-between mb-3 px-1 sm:px-4 md:px-6">
          <h2 id="related-apps-heading" class="text-lg sm:text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <span>Similar Applications</span>
            ${mainCat && mainCat !== 'All Apps' ? `
              <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                ${escapeHtml(mainCat)}
              </span>
            ` : ''}
          </h2>
          <a href="/?tab=${encodeURIComponent(mainCat)}" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors group" title="Explore all ${escapeHtml(mainCat)} apps">
            <span>View all (${similarApps.length})</span>
            <span class="inline-block transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </a>
        </div>
        <div class="grid grid-rows-2 grid-flow-col gap-x-6 gap-y-6 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          ${similarApps.map((sim, index) => {
            const simName = getField(sim, 'name');
            const simSlug = getField(sim, 'slug');
            const simIcon = optimizeImageUrl(getField(sim, 'icon_url') || '', 200);
            return `
              <a href="/app/${encodeURIComponent(simSlug)}" class="flex flex-col items-center justify-start gap-2 w-[92px] sm:w-[110px] snap-start group text-left">
                <img src="${escapeHtml(simIcon)}" alt="${escapeHtml(simName)}" width="100" height="100" decoding="async" class="w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-[24%] shadow-[0_2px_8px_rgba(0,0,0,0.08)] object-cover" loading="${index < 4 ? 'eager' : 'lazy'}" />
                <span class="text-[11px] sm:text-[13px] font-semibold text-center text-zinc-800 dark:text-zinc-200 line-clamp-2 w-full px-0.5 leading-tight">${escapeHtml(simName)}</span>
              </a>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  // Screenshots Gallery (1:1 with AppScreenshots.tsx portrait 9/16)
  let screenshotsHtml = '';
  if (app.screenshots && Array.isArray(app.screenshots) && app.screenshots.length > 0) {
    screenshotsHtml = `
      <div class="w-full mb-6">
        <div class="flex overflow-x-auto hide-scrollbar gap-3 px-4 sm:px-0 pb-3 snap-x items-center -mx-4 sm:-mx-0">
          ${app.screenshots.map((s: string, idx: number) => {
            const shotUrl = optimizeImageUrl(s, 400);
            return `
              <div class="flex-none w-[150px] sm:w-[220px] aspect-[9/16] rounded-xl overflow-hidden snap-center bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/10">
                <img src="${escapeHtml(shotUrl)}" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async" class="w-full h-full object-cover select-none pointer-events-none" alt="${escapeHtml(name)} screenshot ${idx + 1} - gameplay preview"/>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // FAQs
  let faqsHtml = '';
  if (Array.isArray(app.faqs) && app.faqs.length > 0) {
    const validFaqs = app.faqs.filter((f: any) => f && f.question && f.answer);
    if (validFaqs.length > 0) {
      faqsHtml = `
        <div class="w-full my-4 px-0 sm:px-2 text-left">
          <div class="bg-slate-50/90 dark:bg-zinc-900/80 border border-black/5 dark:border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs">
            <h2 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Frequently Asked Questions</h2>
            <div class="space-y-3">
              ${validFaqs.map((f: any) => `
                <div class="p-3.5 bg-white/70 dark:bg-zinc-950/60 rounded-xl border border-black/5 dark:border-white/5">
                  <h3 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">${escapeHtml(f.question)}</h3>
                  <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">${escapeHtml(f.answer)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }

  // Reviews Cards
  let reviewsCards = '';
  if (Array.isArray(sampleReviews) && sampleReviews.length > 0) {
    reviewsCards = sampleReviews
      .filter((r: any) => r && stripHtml(r.reviewText || '').trim().length >= 3)
      .map((r: any) => {
        const author = escapeHtml(r.userName || 'Verified Player');
        const revRating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
        const starsStr = '★'.repeat(revRating) + '☆'.repeat(5 - revRating);
        const text = escapeHtml(r.reviewText || '');
        const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified User';
        return `
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/10 space-y-2 text-left">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                  ${author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block leading-tight">${author}</strong>
                  <span class="text-[11px] text-zinc-500 dark:text-zinc-400">${dateStr}</span>
                </div>
              </div>
              <span class="text-amber-500 font-bold text-xs tracking-wider">${starsStr}</span>
            </div>
            <p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">${text}</p>
          </div>
        `;
      }).join('');
  }

  const reviewsSectionHtml = `
    <div class="border-t border-black/5 dark:border-white/5 pt-6 text-left">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Ratings & Reviews</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5"><span class="font-semibold text-zinc-800 dark:text-zinc-200">${escapeHtml(rating)}</span> out of 5 stars based on <span class="font-semibold text-zinc-800 dark:text-zinc-200">${escapeHtml(String(ratingCountVal))}</span> community reviews</p>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-amber-700 dark:text-amber-300 font-bold text-sm">
          <span>★</span>
          <span>${escapeHtml(rating)}</span>
        </div>
      </div>
      ${reviewsCards ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">${reviewsCards}</div>` : ''}
    </div>
  `;

  return `
    <div class="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4">
      <!-- Breadcrumb & Top Bar -->
      <div class="flex items-center justify-between gap-3 px-1 sm:px-4 md:px-6 mb-4">
        <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors group shrink-0">
          <div class="p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:-translate-x-1 transition-transform">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </div>
          <span>Back to storefront</span>
        </a>
        <a href="/news?q=${encodeURIComponent(name)}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 transition-all shadow-xs shrink-0" title="Read latest news and updates for ${escapeHtml(name)}">
          <span>News</span>
        </a>
      </div>

      <!-- App Hero Header (1:1 with AppHeader.tsx) -->
      <div class="flex w-full items-center gap-3.5 sm:gap-6 mb-5 px-1 sm:px-4 md:px-6 mt-2 text-left">
        <div class="relative w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] shrink-0">
          <div class="w-full h-full rounded-[20px] overflow-hidden shadow-sm bg-white border border-black/5 dark:border-white/10 relative z-10">
            <img src="${escapeHtml(icon)}" alt="${escapeHtml(name)} app icon" loading="eager" fetchpriority="high" decoding="async" width="128" height="128" class="w-full h-full object-cover" />
          </div>
        </div>
        <div class="flex flex-col justify-center flex-1 min-w-0">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black sm:font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug sm:leading-tight mb-1 break-words">
            ${escapeHtml(name)}
          </h1>
          <div class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
            ${escapeHtml(developerName)}
          </div>
          <div class="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            ${isNew ? `<span class="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider">New</span>` : ''}
            <span class="text-emerald-600 font-medium">Verified</span>
          </div>
        </div>
      </div>

      <!-- Specs Metric Bar (1:1 with AppSpecsBar.tsx) -->
      <div class="w-full grid grid-cols-4 py-4 mb-6 border-y border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-900/10">
        <div class="flex flex-col items-center justify-center px-2 text-center">
          <div class="flex items-center gap-0.5 font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
            <span>${escapeHtml(rating)}</span>
            <span class="text-orange-500">★</span>
          </div>
          <div class="text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">Rating</div>
        </div>
        <div class="flex flex-col items-center justify-center px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80">
          <div class="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">${escapeHtml(size)}</div>
          <div class="text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">Size</div>
        </div>
        <div class="flex flex-col items-center justify-center px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80">
          <a href="/?tab=${encodeURIComponent(mainCat)}" class="font-extrabold text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full leading-none truncate max-w-full">${escapeHtml(mainCat)}</a>
          <div class="text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5">Type</div>
        </div>
        <div class="flex flex-col items-center justify-center px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80">
          <div class="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">${escapeHtml(version)}</div>
          <div class="text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">Version</div>
        </div>
      </div>

      <!-- Action Buttons (1:1 with AppActionButtons.tsx) -->
      <div class="flex flex-col sm:flex-row w-full justify-center items-center gap-3 select-none mb-5 px-1 sm:px-4 md:px-6">
        <div class="w-full sm:flex-1">
          <a href="/moreinfo/${encodeURIComponent(cleanSlug)}" class="w-full premium-action-btn cursor-pointer text-white !text-white font-bold py-2.5 px-5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-sm shadow-md h-[44px]">
            <span class="flex items-center gap-1.5 font-bold text-white !text-white">
              <span>Download</span>
              <span>&rarr;</span>
            </span>
          </a>
        </div>
        <div class="flex w-full gap-3 sm:w-auto shrink-0">
          <div class="flex-1 sm:w-auto sm:min-w-[130px] sm:max-w-[150px]">
            <button type="button" data-action="share" class="w-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-sm border border-black/5 dark:border-white/5 shadow-sm h-[44px] cursor-pointer transition-colors">Share app</button>
          </div>
          <div class="flex-1 sm:w-auto sm:min-w-[130px] sm:max-w-[150px]">
            <button type="button" data-action="flag" class="w-full bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-sm border border-rose-200/40 dark:border-rose-900/40 shadow-xs h-[44px] cursor-pointer transition-colors">Flag app</button>
          </div>
        </div>
      </div>

      <!-- Similar Applications (Placed directly below action buttons, 1:1 with AppDetails.tsx) -->
      ${recommendedAppsHtml}

      <!-- Screenshots Gallery (1:1 with AppScreenshots.tsx) -->
      ${screenshotsHtml}

      <!-- App Overview & About Section (1:1 with AppAboutSection.tsx) -->
      <section aria-labelledby="app-overview-heading" class="w-full my-3 px-0 sm:px-2 text-left">
        <div class="bg-slate-50/90 dark:bg-zinc-900/80 border border-black/5 dark:border-white/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
          <!-- Header Bar -->
          <div class="w-full p-3.5 sm:p-5 flex items-center justify-between text-left select-none border-b border-black/5 dark:border-white/5">
            <div class="flex items-center gap-2.5 sm:gap-3 flex-1 pr-2 sm:pr-3">
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <h2 id="app-overview-heading" class="text-xs sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  About this app
                </h2>
                <p class="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Overview & features
                </p>
              </div>
            </div>
          </div>

          <!-- Content Body -->
          <div class="p-3.5 sm:p-6 space-y-6 sm:space-y-8 bg-white/50 dark:bg-zinc-950/40">
            ${app.custom_admin_box_html ? `
              <div class="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl p-3.5 sm:p-5 shadow-xs">
                ${app.custom_admin_box_heading ? `<h3 class="text-sm sm:text-base font-bold mb-2 text-amber-900 dark:text-amber-200">${escapeHtml(app.custom_admin_box_heading)}</h3>` : ''}
                <div class="w-full text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">${sanitizeHtml(app.custom_admin_box_html)}</div>
              </div>
            ` : ''}

            <!-- Main Description -->
            <div>
              <div class="w-full text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3">
                ${desc}
              </div>
            </div>

            <!-- Key Features -->
            ${features ? `
              <div class="pt-5 sm:pt-6 border-t border-black/5 dark:border-white/5">
                <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 sm:mb-3">
                  Key App Features
                </h3>
                <div class="w-full text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2">
                  ${features}
                </div>
              </div>
            ` : ''}

            <!-- Release Notes -->
            ${app.release_notes ? `
              <div class="pt-5 sm:pt-6 border-t border-black/5 dark:border-white/5">
                <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 sm:mb-3">
                  What's New in Version ${escapeHtml(version)}
                </h3>
                <div class="bg-slate-50 dark:bg-zinc-900 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap border border-black/5 dark:border-white/5">
                  ${escapeHtml(app.release_notes)}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </section>

      <!-- App Safety & Security Highlight Notices (1:1 with AppSafetyBoxes.tsx) -->
      ${alertsHtml}

      <!-- FAQs -->
      ${faqsHtml}

      <!-- Verified Peer Ratings & Reviews Section (1:1 with ReviewScoreSummary & ReviewItem) -->
      <div class="px-1 sm:px-4 md:px-6 mb-8">
        ${reviewsSectionHtml}
      </div>
    </div>
  `;
}

export function renderGateway(slug: string, settings: any, apps: any[] = []) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const app = Array.isArray(apps) ? apps.find(a => getField(a, 'slug').toLowerCase() === cleanSlug) : null;
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';

  if (!app) {
    return `
      <div class="py-16 text-center max-w-2xl mx-auto px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl mb-4 font-bold text-2xl">🔒</div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">Verification Portal</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Direct access gateway for verified applications on ${escapeHtml(siteTitle)}.</p>
        <a href="/" class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-md">&larr; Return to Homepage</a>
      </div>
    `;
  }

  const name = getField(app, 'name');
  const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
  const icon = optimizeImageUrl(rawIcon, 160);
  
  return `
    <div class="max-w-xl mx-auto py-10 px-6 shadow-xs bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
      <div class="text-center">
        <img src="${escapeHtml(icon)}" loading="lazy" decoding="async" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-zinc-200 dark:border-zinc-700 shadow-sm" alt="${escapeHtml(name)} app icon"/>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-1">${escapeHtml(name)}</h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold mb-4">Official Listing</p>
        <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8">Access the application details, review summary, and verified specifications below.</p>
        <a href="/app/${encodeURIComponent(slug)}" class="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition shadow-md">View Application Details</a>
        <a href="/" class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:underline mt-4">Browse All Applications</a>
      </div>
    </div>
  `;
}

export function renderNewsList(news: any[], settings: any) {
  let cards = '';
  news.forEach(n => {
    const title = getField(n, 'title');
    const logo = getField(n, 'logo_url');
    const optimizedLogo = logo ? optimizeImageUrl(logo, 300) : '';

    cards += `
      <a href="/news/${encodeURIComponent(getField(n, 'slug'))}" class="flex flex-col sm:flex-row gap-4 p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left" aria-label="Read full news article: ${escapeHtml(title)}">
        ${logo ? `<div class="w-full sm:w-48 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center overflow-hidden shrink-0 border border-black/5 p-2"><img src="${escapeHtml(optimizedLogo)}" loading="lazy" decoding="async" class="max-w-full max-h-32 object-contain rounded-lg" alt="${escapeHtml(title)} news cover banner"/></div>` : ''}
        <div class="flex-1">
          <span class="text-[10px] font-bold text-blue-500 uppercase">${escapeHtml(getField(n, 'category') || 'Report')}</span>
          <span class="text-[10px] font-bold text-zinc-400 uppercase ml-2">${escapeHtml(getField(n, 'created_at') || 'May 2026')}</span>
          <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${escapeHtml(title)}</h3>
          <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${escapeHtml(getField(n, 'description'))}</p>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3">Read Full Article: ${escapeHtml(title)} →</span>
        </div>
      </a>
    `;
  });
  return `<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Gaming News & Updates</h1><div class="flex flex-col gap-4">${cards || '<p class="text-zinc-400 py-10">No publications.</p>'}</div></div>`;
}

export function renderNewsDetail(slug: string, news: any[], settings: any) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const item = news.find(n => getField(n, 'slug').toLowerCase() === cleanSlug);
  if (!item) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load article.</h1><a href="/news" class="text-blue-500 hover:underline">Go Back</a></div>`;
  
  const title = getField(item, 'title');
  const dateStr = getField(item, 'created_at') || 'May 2026';
  const author = getField(item, 'ceo_name', 'System Author');
  const cat = getField(item, 'category', 'Report');
  const content = getField(item, 'content') || getField(item, 'description', '');
  const sanitizedContent = sanitizeHtml(content);
  const logo = getField(item, 'logo_url');
  const optimizedLogo = logo ? optimizeImageUrl(logo, 800) : '';

  return `
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6">
        <span class="text-xs text-blue-500 uppercase font-bold mr-2">${escapeHtml(cat)}</span>
        <span class="text-xs text-zinc-400 uppercase font-bold">${dateStr} | By ${escapeHtml(author)}</span>
        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${escapeHtml(title)}</h1>
      </header>
      ${logo ? `<div class="mb-8 flex justify-center items-center rounded-2xl overflow-hidden border border-black/5 bg-zinc-50 dark:bg-zinc-900/50 p-2 sm:p-0"><img src="${escapeHtml(optimizedLogo)}" loading="eager" decoding="async" class="max-w-full h-auto max-h-[600px] object-contain block rounded-xl sm:rounded-none" alt="${escapeHtml(title)} main cover article image"/></div>` : ''}
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${sanitizedContent.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</section>
    </article>
  `;
}

export function renderDevelopersList(developers: any[], settings: any) {
  let cards = '';
  (developers || []).forEach(d => {
    const name = getField(d, 'name') || getField(d, 'title');
    const slug = getField(d, 'slug');
    const logo = getField(d, 'logo_url') || getField(d, 'icon_url');
    const optimizedLogo = logo ? optimizeImageUrl(logo, 120) : '';
    const desc = getField(d, 'description') || 'Certified publisher and software developer.';
    const appCount = getField(d, 'app_count') || '1+';

    cards += `
      <div class="p-6 bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl text-left flex items-start gap-4">
        ${logo ? `<img src="${escapeHtml(optimizedLogo)}" loading="lazy" decoding="async" width="64" height="64" class="w-16 h-16 rounded-2xl object-cover border border-black/5 shrink-0" alt="${escapeHtml(name)} developer brand logo"/>` : ''}
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-lg text-zinc-900 dark:text-white leading-tight">${escapeHtml(name)}</h3>
          <span class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1 mb-2">Verified Developer</span>
          <p class="text-xs text-zinc-500 line-clamp-2 leading-relaxed">${escapeHtml(desc)}</p>
        </div>
      </div>
    `;
  });

  return `
    <div class="py-6 container max-w-4xl mx-auto px-4 text-left">
      <header class="mb-8 text-center sm:text-left">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Verified Developer Directory</h1>
        <p class="text-sm text-zinc-500">Official profiles of verified software creators, studio publishers, and developer teams.</p>
      </header>
      <div class="grid sm:grid-cols-2 gap-4">${cards || '<p class="text-zinc-400 py-10 col-span-full">No developer listings registered.</p>'}</div>
    </div>
  `;
}

export function renderVideosList(videos: any[], settings: any) {
  let cards = '';
  videos.forEach(v => {
    const title = getField(v, 'title');
    const slug = getField(v, 'slug');
    const desc = getField(v, 'description','');
    const videoUrl = getField(v, 'url', '');
    let videoId = '';
    if (videoUrl.includes('v=')) {
      videoId = videoUrl.split('v=')[1]?.split('&')[0] || '';
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

    cards += `
      <a href="/videos/${encodeURIComponent(slug)}" class="block p-4 border border-black/5 bg-white dark:bg-zinc-900 rounded-3xl text-left hover:shadow-md transition">
        ${thumb ? `<img src="${escapeHtml(thumb)}" loading="lazy" decoding="async" width="360" height="200" class="w-full h-40 object-cover rounded-2xl mb-3 border border-black/5" alt="${escapeHtml(title)} video review thumbnail"/>` : ''}
        <h3 class="font-bold text-lg text-zinc-900 dark:text-white truncate">${escapeHtml(title)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${escapeHtml(desc)}</p>
      </a>
    `;
  });
  return `<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${cards || '<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`;
}

export function renderVideoDetail(slug: string, videos: any[], settings: any) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const v = videos.find(item => getField(item, 'slug').toLowerCase() === cleanSlug || getField(item, 'id').toLowerCase() === cleanSlug);
  if (!v) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>`;
  const title = getField(v, 'title');
  const desc = getField(v, 'description');
  const videoUrl = getField(v, 'url', '');
  let videoId = '';
  if (videoUrl.includes('v=')) {
    videoId = videoUrl.split('v=')[1]?.split('&')[0] || '';
  } else if (videoUrl.includes('youtu.be/')) {
    videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

  return `
    <div class="max-w-2xl mx-auto py-12 text-left">
      <h1 class="text-3xl font-extrabold mb-4">${escapeHtml(title)}</h1>
      ${thumb ? `<div class="mb-6 rounded-3xl overflow-hidden border border-black/5"><img src="${escapeHtml(thumb)}" loading="eager" decoding="async" width="640" height="360" class="w-full h-auto object-cover max-h-80" alt="${escapeHtml(title)} full video preview image"/></div>` : ''}
      <p class="prose text-zinc-650 leading-relaxed font-semibold">${desc.replace(/\n\n/g, '<br/><br/>')}</p>
    </div>
  `;
}

export function renderAbout(settings: any) {
  const content = getField(settings, 'about_content') || DEFAULT_ABOUT_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderContact(settings: any) {
  const content = getField(settings, 'contact_content') || 'Get in touch for active client files help.';
  const email = getField(settings, 'support_email', 'rummydex1@gmail.com');
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${content}</p><div class="grid gap-4 mt-6"><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${escapeHtml(email)}</p></div><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Live Chat Support:</strong><p class="text-zinc-800 font-semibold mt-1">Monday to Saturday, 10:00 AM - 3:00 PM (Instant reply in every section)</p></div><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Registered Delhi Office:</strong><p class="text-zinc-800 font-semibold mt-1">Plot No. 18, 4th Floor, Commercial Complex, Sector 12, Dwarka, New Delhi, Delhi 110075, India</p></div></div></div>`;
}

export function renderPrivacy(settings: any) {
  const content = getField(settings, 'privacy_content') || DEFAULT_PRIVACY_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderReportRemoval(settings: any) {
  const content = getField(settings, 'report_removal_content') || DEFAULT_REPORT_REMOVAL_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Report & Removal Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderTerms(settings: any) {
  const content = getField(settings, 'terms_content') || DEFAULT_TERMS_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderResponsibility(settings: any) {
  const content = getField(settings, 'responsibility_content') || DEFAULT_RESPONSIBILITY_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderNotice(settings: any) {
  const heading = getField(settings, 'important_notice_heading') || 'Important Notice';
  const content = getField(settings, 'important_notice') || DEFAULT_NOTICE_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}

export function renderEthics(settings: any) {
  const heading = getField(settings, 'ethics_heading') || 'Ethics & Safety';
  const content = getField(settings, 'ethics_discrimination_text') || DEFAULT_ETHICS_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}

export function renderDisclaimer(settings: any) {
  const heading = getField(settings, 'disclaimer_heading') || 'Disclaimer';
  const content = getField(settings, 'disclaimer_text') || DEFAULT_DISCLAIMER_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}

export function render404(urlPath: string, settings: any) {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  return `
    <div class="py-16 text-center max-w-2xl mx-auto px-4">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 text-red-600 dark:text-red-400 rounded-3xl mb-6 font-extrabold text-3xl">404</div>
      <h1 class="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4">404 - Page Not Found</h1>
      <h2 class="text-lg font-bold text-zinc-600 dark:text-zinc-400 mb-6">The requested resource could not be found on ${escapeHtml(siteTitle)}</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
        The URL <code class="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-red-500 font-mono text-sm">${escapeHtml(urlPath)}</code> does not match any application listing, news bulletin, or page.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition">Return to Homepage</a>
        <a href="/news" class="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3.5 px-8 rounded-2xl transition">Latest News</a>
      </div>
    </div>
  `;
}
