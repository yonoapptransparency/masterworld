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
    <footer class="w-full mt-12 bg-slate-900 dark:bg-zinc-950 text-slate-300 border-t border-black/10 dark:border-white/10" aria-label="Site Footer">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div class="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12">
          
          <div class="flex flex-col items-start max-w-sm">
            <a href="/" class="text-xl sm:text-2xl font-black text-white hover:text-blue-400 transition-colors inline-flex items-center gap-2 mb-2" aria-label="${escapeHtml(siteTitle)} Homepage">
              <span>${escapeHtml(siteTitle)}</span>
              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Verified
              </span>
            </a>
            <p class="text-xs text-slate-400 leading-relaxed font-normal">
              Independent digital directory, application benchmarking, and transparent reviews.
            </p>
          </div>

          <div class="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 text-left text-xs sm:text-sm">
            
            <div class="flex flex-col gap-2">
              <span class="text-white font-bold text-[11px] uppercase tracking-wider mb-1 text-slate-100">
                Directory
              </span>
              <a href="/" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">All Apps</a>
              <a href="/new-apps" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">New Apps</a>
              <a href="/categories" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Categories</a>
              <a href="/news" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Industry News</a>
              <a href="/videos" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Video Reviews</a>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-white font-bold text-[11px] uppercase tracking-wider mb-1 text-slate-100">
                Company
              </span>
              <a href="/about" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">About Us</a>
              <a href="/developers" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Developer Team</a>
              <a href="/contact" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Contact Support</a>
              <a href="/responsibility" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Responsible Gaming</a>
              <a href="/report-removal" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Report / DMCA</a>
            </div>

            <div class="flex flex-col gap-2 col-span-2 sm:col-span-1">
              <span class="text-white font-bold text-[11px] uppercase tracking-wider mb-1 text-slate-100">
                Compliance
              </span>
              <a href="/privacy" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Privacy Policy</a>
              <a href="/terms" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Terms of Service</a>
              <a href="/ethics" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Ethics Policy</a>
              <a href="/notice" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Legal Notice</a>
              <a href="/disclaimer" class="text-slate-400 hover:text-blue-400 transition-colors py-0.5">Disclaimer</a>
            </div>

          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-[11px] text-slate-500 text-center sm:text-left">
            &copy; ${new Date().getFullYear()} ${escapeHtml(siteTitle)}. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  `;
}
