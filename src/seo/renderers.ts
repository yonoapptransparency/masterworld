import { getField, optimizeImageUrl } from './utils';
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
  const optimizedLogo = logoUrl ? optimizeImageUrl(logoUrl, 100) : '';
  return `
    <header class="py-3 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        <a href="/" class="flex items-center gap-3 font-bold text-lg text-zinc-900 dark:text-white" aria-label="${escapeHtml(siteTitle)} Home">
          ${logoUrl ? `<img src="${escapeHtml(optimizedLogo)}" loading="eager" fetchpriority="high" decoding="async" width="40" height="40" class="w-10 h-10 object-contain" alt="${escapeHtml(siteTitle)} Official Logo"/>` : ''}
          <span>${escapeHtml(siteTitle)}</span>
        </a>
        <nav class="hidden md:flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300" aria-label="Main Navigation">
          <a href="/">Home</a>
          <a href="/news">News</a>
          <a href="/videos">Videos</a>
          <a href="/developers">Developers</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </header>
  `;
}

export function renderFooter(settings: any) {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const logoUrl = getField(settings, 'logo_url');
  const metaDescription = getField(settings, 'meta_description') || 'A transparency platform and directory for verified applications.';
  const optimizedLogo = logoUrl ? optimizeImageUrl(logoUrl, 80) : '';

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

export function renderHome(apps: any[], settings: any, news: any[], videos: any[]) {
  const siteTitle = getField(settings, 'site_title');
  const desc = getField(settings, 'meta_description');
  
  let appsHtml = '';
  const sorted = [...apps].sort((a,b) => parseInt(getField(a, 'serial_number','999'), 10) - parseInt(getField(b, 'serial_number','999'), 10));
  
  sorted.forEach((app, i) => {
    const name = getField(app, 'name');
    const slug = getField(app, 'slug');
    const category = getField(app, 'category');
    const rating = getField(app, 'rating', '5.0');
    const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
    const icon = optimizeImageUrl(rawIcon, 128);
    const isNew = app.is_new === true || (app.is_new && app.is_new.booleanValue === true);
    const isTopItem = i < 4;
    
    appsHtml += `
      <a href="/app/${encodeURIComponent(slug)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5" title="${escapeHtml(name)} review and details">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${i + 1}</span>
        <img src="${escapeHtml(icon)}" ${isTopItem ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="64" height="64" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${escapeHtml(name)} app icon"/>
        <div class="flex-1 min-w-0 text-left">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${escapeHtml(name)}</h3>
          <p class="text-xs text-zinc-500 truncate">${escapeHtml(category)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${rating}</span><span class="text-zinc-400">★</span>
            ${isNew ? `<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>` : ''}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">DETAILS</span>
      </a>
    `;
  });

  let newsHtml = '';
  news.slice(0, 3).forEach(n => {
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
    <div>
      <div class="text-center py-12 max-w-2xl mx-auto px-4">
        <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">${escapeHtml(siteTitle)}</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">${escapeHtml(desc)}</p>
      </div>
      <div class="grid lg:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
          <h2 class="text-xl font-bold mb-4 px-2 text-left">Popular Applications</h2>
          <div class="flex flex-col">${appsHtml}</div>
        </div>
        <div class="space-y-6">
          <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
            <h3 class="font-bold text-md mb-4 text-left">Latest News</h3>
            <div class="flex flex-col gap-3">${newsHtml}</div>
            <a href="/news" class="block text-xs font-bold text-blue-500 hover:underline mt-4 text-left">View All Updates →</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderAppDetails(slug: string, apps: any[], settings: any) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const app = apps.find(a => getField(a, 'slug').toLowerCase() === cleanSlug);
  if (!app) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">App Not Found</h1><a href="/" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Go Home</a></div>`;

  const name = getField(app, 'name');
  const cat = getField(app, 'category', 'Card Game');
  const version = getField(app, 'version', 'Latest');
  const size = getField(app, 'file_size', 'Variable');
  const rating = getField(app, 'rating', '5.0');
  const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
  const icon = optimizeImageUrl(rawIcon, 256);
  const desc = app.description_html ? sanitizeHtml(app.description_html) : `<p>No comprehensive details are configured yet for ${escapeHtml(name)}.</p>`;
  const features = app.features_html ? sanitizeHtml(app.features_html) : '';
  const featureSectionContext = features ? `<div class="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80"><h2 class="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">Key Features & Highlights</h2><div class="prose dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed">${features}</div></div>` : '';
  const pkg = getField(app, 'package_name', 'Verified Listing');

  let screenshotsHtml = '';
  if (app.screenshots && Array.isArray(app.screenshots) && app.screenshots.length > 0) {
    screenshotsHtml = `
      <div class="mt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6">
        <h2 class="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">Application Screenshots</h2>
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          ${app.screenshots.map((s: string, idx: number) => {
            const shotUrl = optimizeImageUrl(s, 600);
            return `<img src="${escapeHtml(shotUrl)}" loading="lazy" decoding="async" width="280" height="160" class="w-64 h-36 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 shadow-xs" alt="${escapeHtml(name)} screenshot ${idx + 1}"/>`;
          }).join('')}
        </div>
      </div>
    `;
  }

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
  similarApps = similarApps.slice(0, 6);

  if (similarApps.length > 0) {
    recommendedAppsHtml = `
      <div class="mt-10 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8 text-left">
        <h2 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Similar & Recommended Applications</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          ${similarApps.map(sim => {
            const simName = getField(sim, 'name');
            const simSlug = getField(sim, 'slug');
            const simIcon = optimizeImageUrl(getField(sim, 'icon_url') || '', 128);
            const simRating = getField(sim, 'rating', '4.8');
            const simCat = getField(sim, 'category', 'Card Game');
            return `
              <a href="/app/${encodeURIComponent(simSlug)}" class="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-500/50 transition shadow-2xs">
                <img src="${escapeHtml(simIcon)}" loading="lazy" decoding="async" width="48" height="48" class="w-12 h-12 rounded-xl object-cover border border-zinc-100 dark:border-zinc-800 shrink-0" alt="${escapeHtml(simName)} app icon"/>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">${escapeHtml(simName)}</h3>
                  <div class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span class="font-bold text-amber-500">★ ${escapeHtml(simRating)}</span>
                    <span>•</span>
                    <span class="truncate">${escapeHtml(simCat)}</span>
                  </div>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="w-full max-w-5xl mx-auto py-4 sm:py-6 px-1 sm:px-4">
      <div class="flex flex-col items-center text-center pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-8">
        <img src="${escapeHtml(icon)}" loading="eager" decoding="async" width="128" height="128" class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover mb-4 shadow-md border border-zinc-200/60 dark:border-zinc-700/60" alt="${escapeHtml(name)} icon"/>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight mb-2.5">${escapeHtml(name)}</h1>
        <div class="flex flex-wrap justify-center gap-2 text-xs font-semibold mb-6">
          <span class="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50 px-3 py-1 rounded-full">${escapeHtml(cat)}</span>
          <span class="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 px-3 py-1 rounded-full">Verified Safety</span>
        </div>
        
        <div class="grid grid-cols-4 gap-2.5 w-full max-w-md mb-6 text-center text-xs">
          <div class="p-2.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 rounded-xl shadow-2xs">
            <span class="text-zinc-500 dark:text-zinc-400 block pb-0.5 font-medium text-[11px]">Version</span>
            <strong class="text-zinc-900 dark:text-zinc-100 font-bold">${escapeHtml(version)}</strong>
          </div>
          <div class="p-2.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 rounded-xl shadow-2xs">
            <span class="text-zinc-500 dark:text-zinc-400 block pb-0.5 font-medium text-[11px]">Size</span>
            <strong class="text-zinc-900 dark:text-zinc-100 font-bold">${escapeHtml(size)}</strong>
          </div>
          <div class="p-2.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 rounded-xl shadow-2xs">
            <span class="text-zinc-500 dark:text-zinc-400 block pb-0.5 font-medium text-[11px]">Type</span>
            <strong class="text-zinc-900 dark:text-zinc-100 font-bold truncate block">${escapeHtml(cat.split(',')[0])}</strong>
          </div>
          <div class="p-2.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 rounded-xl shadow-2xs">
            <span class="text-zinc-500 dark:text-zinc-400 block pb-0.5 font-medium text-[11px]">Rating</span>
            <strong class="text-amber-600 dark:text-amber-400 font-bold">${escapeHtml(rating)} ★</strong>
          </div>
        </div>

        <button type="button" class="w-full sm:w-auto min-w-[200px] justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition inline-flex items-center gap-2 text-sm tracking-wide cursor-pointer">Download Official APK &rarr;</button>
      </div>

      <div class="grid md:grid-cols-[2fr,1fr] gap-6 sm:gap-8">
        <div class="bg-white dark:bg-zinc-900 p-5 sm:p-7 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs text-left">
          <h2 class="text-lg sm:text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">About this application</h2>
          <div class="prose dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base space-y-3">${desc}</div>
          ${featureSectionContext}
          ${screenshotsHtml}
        </div>
        <div class="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs h-fit text-left">
          <h3 class="text-xs font-bold mb-4 uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Technical Specifications</h3>
          <table class="w-full text-xs text-left">
            <tr class="border-b border-zinc-100 dark:border-zinc-800/80"><td class="py-2.5 text-zinc-500 dark:text-zinc-400 font-medium">Developer</td><td class="py-2.5 font-bold text-right text-zinc-900 dark:text-zinc-100">Store Verified</td></tr>
            <tr class="border-b border-zinc-100 dark:border-zinc-800/80"><td class="py-2.5 text-zinc-500 dark:text-zinc-400 font-medium">Package Name</td><td class="py-2.5 font-bold text-right text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">${escapeHtml(pkg)}</td></tr>
            <tr class="border-b border-zinc-100 dark:border-zinc-800/80"><td class="py-2.5 text-zinc-500 dark:text-zinc-400 font-medium">Safety Status</td><td class="py-2.5 font-bold text-right text-emerald-600 dark:text-emerald-400">Safe & Certified</td></tr>
            <tr><td class="py-2.5 text-zinc-500 dark:text-zinc-400 font-medium">Compatibility</td><td class="py-2.5 font-bold text-right text-zinc-900 dark:text-zinc-100">Android 6.0+ / iOS</td></tr>
          </table>
        </div>
      </div>

      ${recommendedAppsHtml}
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
        ${logo ? `<img src="${escapeHtml(optimizedLogo)}" loading="lazy" decoding="async" width="160" height="120" class="w-full sm:w-40 h-28 object-cover rounded-2xl shrink-0 border border-black/5" alt="${escapeHtml(title)} news cover banner"/>` : ''}
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
      ${logo ? `<div class="mb-8 rounded-3xl overflow-hidden border border-black/5"><img src="${escapeHtml(optimizedLogo)}" loading="eager" decoding="async" width="800" height="450" class="w-full h-auto object-cover max-h-96" alt="${escapeHtml(title)} main cover article image"/></div>` : ''}
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${sanitizedContent.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</section>
    </article>
  `;
}

export function renderBlogsList(blogs: any[], settings: any) {
  let cards = '';
  (blogs || []).forEach(b => {
    const title = getField(b, 'title');
    const slug = getField(b, 'slug') || getField(b, 'id');
    const cover = getField(b, 'cover_url') || getField(b, 'thumbnail_url');
    const optimizedCover = cover ? optimizeImageUrl(cover, 600) : '';
    const author = getField(b, 'author', 'Staff Editorial');
    const dateVal = getField(b, 'publish_date') || getField(b, 'published_at') || getField(b, 'created_at') || 'Recent';
    const desc = getField(b, 'seo_description') || getField(b, 'description') || getField(b, 'content', '').substring(0, 160);

    cards += `
      <article class="flex flex-col bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl overflow-hidden hover:shadow-lg transition">
        <a href="/blog/${encodeURIComponent(slug)}" class="block h-56 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800" aria-label="Read ${escapeHtml(title)}">
          ${cover ? `<img src="${escapeHtml(optimizedCover)}" loading="lazy" decoding="async" width="600" height="320" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="${escapeHtml(title)} banner cover"/>` : ''}
        </a>
        <div class="p-6 flex flex-col flex-1 text-left">
          <div class="flex items-center gap-3 text-xs text-zinc-400 font-semibold mb-2">
            <span class="text-blue-500 uppercase tracking-wider text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">App Update</span>
            <time>${escapeHtml(dateVal)}</time>
            <span>•</span>
            <span>By ${escapeHtml(author)}</span>
          </div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white mb-2 leading-snug">
            <a href="/blog/${encodeURIComponent(slug)}" class="hover:text-blue-600 transition-colors">${escapeHtml(title)}</a>
          </h2>
          <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4 flex-1">${escapeHtml(desc)}</p>
          <a href="/blog/${encodeURIComponent(slug)}" class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Read Full Guide &rarr;
          </a>
        </div>
      </article>
    `;
  });

  return `
    <div class="py-6 container max-w-5xl mx-auto px-4 text-left">
      <header class="mb-10 text-center sm:text-left">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-3">Strategy Guides & Articles</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">Expert walkthroughs, technical game teardowns, strategy guides, and transparency bulletins.</p>
      </header>
      <div class="grid sm:grid-cols-2 gap-8">${cards || '<p class="text-zinc-400 py-10 col-span-full text-center">No updates available at this moment.</p>'}</div>
    </div>
  `;
}

export function renderBlogDetail(slug: string, blogs: any[], settings: any) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const blog = (blogs || []).find(b => getField(b, 'slug').toLowerCase() === cleanSlug || getField(b, 'id').toLowerCase() === cleanSlug);
  if (!blog) {
    return `<div class="py-16 text-center max-w-xl mx-auto"><h1 class="text-2xl font-bold mb-4">Article Not Found</h1><p class="text-sm text-zinc-500 mb-6">The requested article could not be located in our index.</p><a href="/blogs" class="inline-block bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700">View All Updates</a></div>`;
  }

  const title = getField(blog, 'title');
  const author = getField(blog, 'author', 'Editorial Staff');
  const dateVal = getField(blog, 'publish_date') || getField(blog, 'published_at') || getField(blog, 'created_at') || 'May 2026';
  const cover = getField(blog, 'cover_url') || getField(blog, 'thumbnail_url');
  const optimizedCover = cover ? optimizeImageUrl(cover, 900) : '';
  const content = getField(blog, 'content') || getField(blog, 'description_html') || getField(blog, 'description') || '';
  const sanitizedContent = sanitizeHtml(content);
  const relatedAppSlug = getField(blog, 'related_app_slug');
  const relatedAppName = getField(blog, 'related_app_name');

  return `
    <article class="max-w-4xl mx-auto py-10 px-4 text-left">
      <nav class="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-6" aria-label="Breadcrumbs">
        <a href="/" class="hover:text-blue-500">Home</a>
        <span>/</span>
        <a href="/blogs" class="hover:text-blue-500">Guides & Articles</a>
        <span>/</span>
        <span class="text-zinc-600 dark:text-zinc-300 truncate max-w-xs">${escapeHtml(title)}</span>
      </nav>

      <header class="mb-8">
        <div class="flex items-center gap-3 text-xs font-semibold text-zinc-400 mb-3">
          <span class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold">Verified Guide</span>
          <time>${escapeHtml(dateVal)}</time>
          <span>•</span>
          <span>By ${escapeHtml(author)}</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-4">${escapeHtml(title)}</h1>
        ${relatedAppName && relatedAppSlug ? `
          <div class="inline-flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl text-xs font-semibold">
            <span class="text-zinc-500">Related Application:</span>
            <a href="/app/${encodeURIComponent(relatedAppSlug)}" class="font-bold text-blue-600 hover:underline">${escapeHtml(relatedAppName)} &rarr;</a>
          </div>
        ` : ''}
      </header>

      ${cover ? `
        <div class="mb-10 rounded-3xl overflow-hidden border border-black/5 shadow-sm max-h-[460px] bg-zinc-100">
          <img src="${escapeHtml(optimizedCover)}" loading="eager" decoding="async" width="900" height="460" class="w-full h-full object-cover" alt="${escapeHtml(title)} article header"/>
        </div>
      ` : ''}

      <section class="prose dark:prose-invert max-w-none text-zinc-750 leading-relaxed font-semibold text-base sm:text-lg">
        ${sanitizedContent.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}
      </section>

      <footer class="mt-12 pt-8 border-t border-black/5 flex justify-between items-center text-xs">
        <a href="/blogs" class="font-bold text-blue-600 hover:underline">&larr; Back to all updates</a>
        <span class="text-zinc-400">Published on ${escapeHtml(dateVal)}</span>
      </footer>
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
