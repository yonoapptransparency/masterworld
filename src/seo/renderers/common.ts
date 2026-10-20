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
  const optimizedLogo = logoUrl ? optimizeImageUrl(logoUrl, 120) : '';
  return `
    <header class="sticky top-0 z-50 transition-transform duration-200 ease-out will-change-transform translate-y-0 pointer-events-auto bg-white dark:bg-black sm:bg-white/80 sm:dark:bg-black/80 border-b border-white/20 dark:border-white/10 py-2.5 sm:py-3">
      <div class="w-full max-w-7xl px-1.5 xxs:px-2.5 xs:px-4 sm:px-6 lg:px-8 mx-auto relative flex justify-between items-center">
        <a href="/" class="flex items-center gap-1 xxs:gap-1.5 xs:gap-2.5 sm:gap-3 group min-w-0" aria-label="${escapeHtml(siteTitle)} Home">
          <div class="p-0 transition-transform group-hover:scale-[1.03] duration-300 shrink-0">
            ${logoUrl ? `<img src="${escapeHtml(optimizedLogo)}" loading="eager" decoding="async" width="40" height="40" class="w-6 h-6 xxs:w-7 xxs:h-7 xs:w-8 xs:h-8 sm:w-11 sm:h-11 object-contain drop-shadow-sm" alt="${escapeHtml(siteTitle)} Official Logo"/>` : `<div class="w-6 h-6 xxs:w-7 xxs:h-7 xs:w-8 xs:h-8 sm:w-11 sm:h-11 bg-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-xs sm:text-base">${escapeHtml(siteTitle.charAt(0))}</div>`}
          </div>
          <div class="flex flex-col leading-none min-w-0">
            <span class="text-xs xxs:text-sm xs:text-base sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white truncate max-w-[90px] xxs:max-w-[120px] xs:max-w-[170px] sm:max-w-none">${escapeHtml(siteTitle)}</span>
          </div>
        </a>
        <nav class="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300" aria-label="Main Navigation">
          <a href="/" class="hover:text-blue-600 dark:hover:text-blue-400 p-2">Home</a>
          <a href="/news" class="hover:text-blue-600 dark:hover:text-blue-400 p-2">News</a>
          <a href="/new-apps" class="hover:text-blue-600 dark:hover:text-blue-400 p-2">New Apps</a>
          <a href="/categories" class="hover:text-blue-600 dark:hover:text-blue-400 p-2">Categories</a>
          <a href="/about" class="hover:text-blue-600 dark:hover:text-blue-400 p-2">About</a>
        </nav>
        <div class="md:hidden flex items-center gap-1 xxs:gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
          <button type="button" class="flex items-center justify-center w-7 h-7 xxs:w-8 xxs:h-8 xs:w-9 xs:h-9 bg-zinc-100 dark:bg-zinc-800 rounded-full active:scale-95 transition-all text-zinc-500" aria-label="Search">
            <svg class="w-3 h-3 xxs:w-3.5 xxs:h-3.5 xs:w-4 xs:h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          <div class="relative inline-block z-50">
            <button type="button" class="flex items-center gap-2 w-8 h-8 xs:w-9 xs:h-9 lg:w-auto lg:h-11 lg:px-4 justify-center bg-blue-50 text-blue-500 rounded-full hover:bg-blue-100 transition-colors shrink-0" aria-label="Support Widget">
              <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </button>
          </div>
          <button type="button" class="flex items-center justify-center w-7 h-7 xxs:w-8 xxs:h-8 xs:w-9 xs:h-9 bg-zinc-900 dark:bg-white rounded-full active:scale-95 transition-transform" aria-label="Open menu">
            <svg class="w-3 h-3 xxs:w-3.5 xxs:h-3.5 xs:w-4 xs:h-4 text-white dark:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
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
