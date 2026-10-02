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

export function renderFooter(settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';

  return `
    <footer class="pt-8 sm:pt-10 pb-8 border-t border-black/10 dark:border-white/10 bg-slate-900 dark:bg-zinc-950 mt-10 text-left text-slate-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-800">
          <div>
            <span class="text-xl font-black text-white">${escapeHtml(siteTitle)}</span>
            <p class="text-xs text-slate-400 mt-1">Independent digital directory and verified application reviews.</p>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-300">
            <a href="/" class="hover:text-blue-400">All Apps</a>
            <a href="/new-apps" class="hover:text-blue-400">New Apps</a>
            <a href="/categories" class="hover:text-blue-400">Categories</a>
            <a href="/news" class="hover:text-blue-400">News</a>
            <a href="/videos" class="hover:text-blue-400">Videos</a>
            <a href="/developers" class="hover:text-blue-400">Developers</a>
            <a href="/about" class="hover:text-blue-400">About</a>
            <a href="/contact" class="hover:text-blue-400">Contact</a>
            <a href="/privacy" class="hover:text-blue-400">Privacy</a>
            <a href="/terms" class="hover:text-blue-400">Terms</a>
            <a href="/ethics" class="hover:text-blue-400">Ethics</a>
            <a href="/notice" class="hover:text-blue-400">Notice</a>
            <a href="/disclaimer" class="hover:text-blue-400">Disclaimer</a>
            <a href="/responsibility" class="hover:text-blue-400">Safety</a>
            <a href="/report-removal" class="hover:text-blue-400">Report & Removal</a>
          </div>
        </div>
        <div class="text-[11px] text-slate-500 pt-4">&copy; ${new Date().getFullYear()} ${escapeHtml(siteTitle)}. All rights reserved.</div>
      </div>
    </footer>
  `;
}
