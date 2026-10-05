import { getField, optimizeImageUrl } from '../utils';

export function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi, '');
  clean = clean.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
  clean = clean.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '');
  clean = clean.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi, '');
  clean = clean.replace(/<!DOCTYPE\s+html[^>]*>/gi, '');
  clean = clean.replace(/<title>[^<]*<\/title>/gi, '');
  clean = clean.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');
  clean = clean.replace(/<\/?(html|head|body)\b[^>]*>/gi, '');
  clean = clean.replace(/<svg[^>]*class=["'][^"']*art[^"']*["'][^>]*>[\s\S]*?<\/svg>/gi, '');
  clean = clean.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
  // Convert any <h1> inside user content to <h2> for strict single-H1 SEO compliance
  clean = clean.replace(/<h1([^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');
  return clean.trim();
}

export function renderHeader(settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const logoUrl = getField(settings, 'logo_url');
  const optimizedLogo = logoUrl ? optimizeImageUrl(logoUrl, 100) : '';
  return `
    <header class="py-3 border-b border-black/10 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 sticky top-0 z-40 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <a href="/" class="flex items-center gap-2.5 font-black text-lg sm:text-xl text-zinc-900 dark:text-white" aria-label="${escapeHtml(siteTitle)} Home">
          ${logoUrl ? `<img src="${escapeHtml(optimizedLogo)}" loading="eager" fetchpriority="high" decoding="async" width="36" height="36" class="w-9 h-9 object-contain rounded-xl" alt="${escapeHtml(siteTitle)} Official Logo"/>` : `<span class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">${escapeHtml(siteTitle.charAt(0))}</span>`}
          <span>${escapeHtml(siteTitle)}</span>
        </a>
        <nav class="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300" aria-label="Main Navigation">
          <a href="/" class="hover:text-blue-600 dark:hover:text-blue-400">Home</a>
          <a href="/new-apps" class="hover:text-blue-600 dark:hover:text-blue-400">New Apps</a>
          <a href="/categories" class="hover:text-blue-600 dark:hover:text-blue-400">Categories</a>
          <a href="/news" class="hover:text-blue-600 dark:hover:text-blue-400">News</a>
          <a href="/videos" class="hover:text-blue-600 dark:hover:text-blue-400">Videos</a>
          <a href="/about" class="hidden sm:inline-block hover:text-blue-600 dark:hover:text-blue-400">About</a>
        </nav>
      </div>
    </header>
  `;
}

export function renderFooter(settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';

  return `
    <footer class="w-full mt-8 sm:mt-12 bg-zinc-100 dark:bg-[#060913] text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-white/[0.08] transition-colors select-none" aria-label="Site Footer">
      <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-5 border-b border-zinc-200/80 dark:border-white/[0.08] mb-5 sm:mb-6">
          <div class="flex items-center gap-2.5 flex-wrap">
            <a href="/" class="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1" aria-label="${escapeHtml(siteTitle)} Homepage">
              <span>${escapeHtml(siteTitle.replace(/dex$/i, ''))}</span>
              <span class="text-blue-600 dark:text-blue-400">${siteTitle.match(/dex$/i) ? 'Dex' : ''}</span>
            </a>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold tracking-wider uppercase">
              <span>Verified</span>
            </span>
          </div>
          <p class="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
            Independent application transparency, safety benchmarking, and reviews.
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8 mb-6 sm:mb-8 text-left">
          <div class="flex flex-col gap-1.5">
            <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              <span>Directory</span>
            </h3>
            <a href="/" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">All Apps</a>
            <a href="/?tab=All+Apps" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">New Apps</a>
            <a href="/?tab=Categories" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Categories</a>
            <a href="/news" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Industry News</a>
            <a href="/videos" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Video Reviews</a>
          </div>

          <div class="flex flex-col gap-1.5">
            <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Compliance</span>
            </h3>
            <a href="/privacy" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Privacy Policy</a>
            <a href="/terms" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Terms of Service</a>
            <a href="/ethics" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Ethics Policy</a>
            <a href="/notice" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Legal Notice</a>
            <a href="/disclaimer" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Disclaimer</a>
          </div>

          <div class="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>Company</span>
            </h3>
            <a href="/about" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">About Us</a>
            <a href="/developers" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Developer Team</a>
            <a href="/contact" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Contact Support</a>
            <a href="/responsibility" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Responsible Gaming</a>
            <a href="/report-removal" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors">Report / DMCA</a>
          </div>
        </div>

        <div class="pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-500 text-center sm:text-left">
            &copy; ${new Date().getFullYear()} <span class="font-semibold text-zinc-700 dark:text-zinc-300">${escapeHtml(siteTitle)}</span>. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  `;
}
