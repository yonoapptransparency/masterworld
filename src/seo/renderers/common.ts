import { getField, optimizeImageUrl } from '../utils';
import { structureHtmlFragment } from '../../lib/safeHtmlPublic';

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
  let clean = structureHtmlFragment(html);
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_match, tag, attrs) => {
    const safeAttrs = String(attrs || '').replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi, '');
    return `<${tag}${safeAttrs}>`;
  });
  clean = clean.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
  clean = clean.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '');
  clean = clean.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi, '');
  clean = clean.replace(/<!DOCTYPE\s+html[^>]*>/gi, '');
  clean = clean.replace(/<title>[^<]*<\/title>/gi, '');
  clean = clean.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');
  clean = clean.replace(/<\/?(html|head|body)\b[^>]*>/gi, '');
  // Convert any <h1> inside user content to <h2> for strict single-H1 SEO compliance
  clean = clean.replace(/<h1([^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');
  return clean.trim();
}

export function renderHeader(settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const isDefaultBrand = siteTitle.toLowerCase() === 'rummydex';
  const brandAttr = isDefaultBrand ? 'class="rd-brand-full text-xs xxs:text-sm xs:text-base sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white truncate max-w-[90px] xxs:max-w-[120px] xs:max-w-[170px] sm:max-w-none"' : `data-brand-text="${escapeHtml(siteTitle)}" class="text-xs xxs:text-sm xs:text-base sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white truncate max-w-[90px] xxs:max-w-[120px] xs:max-w-[170px] sm:max-w-none"`;
  const logoUrl = getField(settings, 'logo_url');
  const optimizedLogo = logoUrl ? optimizeImageUrl(logoUrl, 120) : '';
  const helplineTelegram = getField(settings, 'helpline_telegram');
  const telegramHref = helplineTelegram
    ? (helplineTelegram.startsWith('http') ? helplineTelegram : `https://t.me/${helplineTelegram.replace('@', '')}`)
    : '';
  const supportWidgetHtml = `
    <div class="relative inline-block z-50">
      <button type="button" class="flex items-center gap-2 w-8 h-8 xs:w-9 xs:h-9 lg:w-auto lg:h-11 lg:px-4 justify-center bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-white/10 rounded-full hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors shrink-0" aria-label="Support Widget">
        <svg width="20" height="20" class="w-3.5 h-3.5 xs:w-4 xs:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
        <span class="text-[13px] font-medium hidden lg:inline">Help</span>
      </button>
    </div>
  `;
  return `
    <header data-nosnippet class="sticky top-0 z-50 transition-transform duration-200 ease-out will-change-transform translate-y-0 pointer-events-auto bg-white dark:bg-black sm:bg-white/80 sm:dark:bg-black/80 border-b border-white/20 dark:border-white/10 py-2.5 sm:py-3">
      <div class="w-full max-w-7xl px-1.5 xxs:px-2.5 xs:px-4 sm:px-6 lg:px-8 mx-auto relative flex justify-between items-center">
        <a href="/" class="flex items-center gap-1 xxs:gap-1.5 xs:gap-2.5 sm:gap-3 group min-w-0" aria-label="Home">
          <div class="p-0 transition-transform group-hover:scale-[1.03] duration-300 shrink-0">
            ${logoUrl ? `<img src="${escapeHtml(optimizedLogo)}" decoding="async" fetchpriority="low" loading="lazy" width="40" height="40" class="w-6 h-6 xxs:w-7 xxs:h-7 xs:w-8 xs:h-8 sm:w-11 sm:h-11 object-contain drop-shadow-sm" alt="" aria-hidden="true" role="presentation"/>` : `<div class="w-6 h-6 xxs:w-7 xxs:h-7 xs:w-8 xs:h-8 sm:w-11 sm:h-11 bg-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-xs sm:text-base" aria-hidden="true">${escapeHtml(siteTitle.charAt(0))}</div>`}
          </div>
          <div class="flex flex-col leading-none min-w-0">
            <span ${brandAttr} aria-hidden="true"></span>
          </div>
        </a>
        <nav class="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium" aria-label="Primary Navigation">
          <a href="/" class="transition-all p-2 tracking-wide relative text-zinc-600 hover:text-blue-500 dark:text-zinc-300">Home</a>
          <a href="/news" class="transition-all p-2 tracking-wide relative text-zinc-600 hover:text-blue-500 dark:text-zinc-300">News</a>
          <a href="/new-apps" class="sr-only">New Apps</a>
          <a href="/categories" class="sr-only">Categories</a>
          <a href="/about" class="sr-only">About</a>
          <div class="relative group/more">
            <button type="button" aria-expanded="false" aria-haspopup="true" aria-label="More navigation links" class="transition-all p-2 tracking-wide flex items-center gap-1 relative text-zinc-600 hover:text-blue-500 dark:text-zinc-300">
              More <svg width="16" height="16" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
          <div class="flex items-center gap-3 ml-4 border-l border-zinc-200 dark:border-zinc-800 pl-4 h-6">
            <button type="button" class="flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/60 transition-all text-left px-4 py-1.5 w-44 lg:w-52 rounded-full group outline-none focus:ring-2 focus:ring-blue-500/20 border border-black/5 dark:border-white/10" aria-label="Search Store">
              <svg width="14" height="14" class="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-500 transition-colors shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span class="text-[13px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors truncate">Search</span>
            </button>
            <div class="w-40">
              <div class="relative">
                <button type="button" class="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/90 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/90 border border-black/5 dark:border-white/10 text-zinc-800 dark:text-zinc-200 transition-colors w-full">
                  <svg width="16" height="16" class="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex-1 text-left truncate">English</span>
                  <svg width="16" height="16" class="w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
            ${telegramHref ? `
              <a href="${escapeHtml(telegramHref)}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-8 h-8 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-white/10 rounded-full hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors" aria-label="Telegram">
                <svg width="14" height="14" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </a>
            ` : ''}
            ${supportWidgetHtml}
          </div>
        </nav>
        <div class="md:hidden flex items-center gap-1 xxs:gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
          <button type="button" class="flex items-center justify-center w-7 h-7 xxs:w-8 xxs:h-8 xs:w-9 xs:h-9 bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 rounded-full active:scale-95 transition-all text-zinc-600 dark:text-zinc-300" aria-label="Search">
            <svg width="16" height="16" class="w-3 h-3 xxs:w-3.5 xxs:h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          ${telegramHref ? `
            <a href="${escapeHtml(telegramHref)}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-7 h-7 xxs:w-8 xxs:h-8 xs:w-9 xs:h-9 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-white/10 rounded-full hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors" aria-label="Telegram">
              <svg width="16" height="16" class="w-3 h-3 xxs:w-3.5 xxs:h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </a>
          ` : ''}
          ${supportWidgetHtml}
          <button type="button" class="flex items-center justify-center w-7 h-7 xxs:w-8 xxs:h-8 xs:w-9 xs:h-9 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-black/5 dark:border-white/10 rounded-full active:scale-95 transition-transform" aria-label="Open menu">
            <svg width="16" height="16" class="w-3 h-3 xxs:w-3.5 xxs:h-3.5 xs:w-4 xs:h-4 text-zinc-800 dark:text-zinc-100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </header>
  `;
}

export function renderFooter(settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const isDefaultBrand = siteTitle.toLowerCase() === 'rummydex';
  const p1Attr = isDefaultBrand ? 'class="rd-brand-p1"' : `data-brand-text="${escapeHtml(siteTitle.replace(/dex$/i, ''))}"`;
  const p2Attr = isDefaultBrand ? 'class="rd-brand-p2 text-blue-600 dark:text-blue-400"' : `class="text-blue-600 dark:text-blue-400" data-brand-text="${siteTitle.match(/dex$/i) ? 'Dex' : ''}"`;
  const copyBrandAttr = isDefaultBrand ? 'class="rd-brand-full font-semibold text-zinc-700 dark:text-zinc-300"' : `class="font-semibold text-zinc-700 dark:text-zinc-300" data-brand-text="${escapeHtml(siteTitle)}"`;
  const socialLinks = settings?.social_links || {};
  const fb = socialLinks.facebook || 'https://facebook.com';
  const ig = socialLinks.instagram || 'https://instagram.com';
  const yt = socialLinks.youtube || 'https://youtube.com';
  const tw = socialLinks.twitter || '';
  const li = socialLinks.linkedin || '';

  const directoryLinks = [
    { label: 'All Apps', to: '/', icon: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>' },
    { label: 'New Apps', to: '/new-apps', icon: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>' },
    { label: 'Categories', to: '/categories', icon: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>' },
    { label: 'Industry News', to: '/news', icon: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>' },
    { label: 'Video Reviews', to: '/videos', icon: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>' },
  ];

  const complianceLinks = [
    { label: 'Privacy Policy', to: '/privacy', icon: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>' },
    { label: 'Terms of Service', to: '/terms', icon: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>' },
    { label: 'Ethics Policy', to: '/ethics', icon: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>' },
    { label: 'Legal Notice', to: '/notice', icon: '<path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>' },
    { label: 'Disclaimer', to: '/disclaimer', icon: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>' },
  ];

  const companyLinks = [
    { label: 'About Us', to: '/about', icon: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { label: 'Developer Team', to: '/developers', icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { label: 'Contact Support', to: '/contact', icon: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>' },
    { label: 'Responsible Gaming', to: '/responsibility', icon: '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>' },
    { label: 'Report / DMCA', to: '/report-removal', icon: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>' },
  ];

  const renderFooterLink = (item: { label: string; to: string; icon: string }, hoverClass: string) => `
    <a href="${item.to}" class="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white py-0.5 transition-colors group">
      <svg width="14" height="14" class="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 ${hoverClass} transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
      <span class="truncate">${item.label}</span>
    </a>
  `;

  return `
    <footer data-nosnippet class="w-full mt-8 sm:mt-12 bg-zinc-100 dark:bg-[#060913] text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-white/[0.08] transition-colors select-none" aria-label="Site Footer">
      <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-5 border-b border-zinc-200/80 dark:border-white/[0.08] mb-5 sm:mb-6">
          <div class="flex items-center gap-2.5 flex-wrap">
            <a href="/" class="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1" aria-label="Homepage">
              <span ${p1Attr} aria-hidden="true"></span>
              <span ${p2Attr} aria-hidden="true"></span>
            </a>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold tracking-wider uppercase">
              <svg width="12" height="12" class="w-3 h-3 text-blue-600 dark:text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
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
            ${directoryLinks.map(item => renderFooterLink(item, 'group-hover:text-cyan-500 dark:group-hover:text-cyan-400')).join('')}
          </div>

          <div class="flex flex-col gap-1.5">
            <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Compliance</span>
            </h3>
            ${complianceLinks.map(item => renderFooterLink(item, 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400')).join('')}
          </div>

          <div class="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>Company</span>
            </h3>
            ${companyLinks.map(item => renderFooterLink(item, 'group-hover:text-purple-500 dark:group-hover:text-purple-400')).join('')}
          </div>
        </div>

        <div class="pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-500 text-center sm:text-left">
            &copy; ${new Date().getFullYear()} <span ${copyBrandAttr} aria-hidden="true"></span>. All rights reserved.
          </p>

          <div class="flex items-center gap-2.5">
            <a href="${escapeHtml(fb)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="w-7 h-7 rounded-full bg-zinc-200/80 dark:bg-zinc-800/90 border border-black/5 dark:border-white/10 hover:bg-blue-600 dark:hover:bg-blue-600 text-zinc-700 dark:text-zinc-200 hover:text-white flex items-center justify-center transition-all">
              <svg width="14" height="14" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="${escapeHtml(ig)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="w-7 h-7 rounded-full bg-zinc-200/80 dark:bg-zinc-800/90 border border-black/5 dark:border-white/10 hover:bg-pink-600 dark:hover:bg-pink-600 text-zinc-700 dark:text-zinc-200 hover:text-white flex items-center justify-center transition-all">
              <svg width="14" height="14" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="${escapeHtml(yt)}" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="w-7 h-7 rounded-full bg-zinc-200/80 dark:bg-zinc-800/90 border border-black/5 dark:border-white/10 hover:bg-red-600 dark:hover:bg-red-600 text-zinc-700 dark:text-zinc-200 hover:text-white flex items-center justify-center transition-all">
              <svg width="14" height="14" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3v6Z"/></svg>
            </a>
            ${tw ? `
              <a href="${escapeHtml(tw)}" target="_blank" rel="noopener noreferrer" aria-label="Twitter" class="w-7 h-7 rounded-full bg-zinc-200/80 dark:bg-zinc-800/90 border border-black/5 dark:border-white/10 hover:bg-sky-500 dark:hover:bg-sky-500 text-zinc-700 dark:text-zinc-200 hover:text-white flex items-center justify-center transition-all">
                <svg width="14" height="14" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            ` : ''}
            ${li ? `
              <a href="${escapeHtml(li)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="w-7 h-7 rounded-full bg-zinc-200/80 dark:bg-zinc-800/90 border border-black/5 dark:border-white/10 hover:bg-blue-700 dark:hover:bg-blue-700 text-zinc-700 dark:text-zinc-200 hover:text-white flex items-center justify-center transition-all">
                <svg width="14" height="14" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            ` : ''}
          </div>
        </div>

      </div>
    </footer>
  `;
}

export function renderTicker(settings: any): string {
  if (settings?.ticker_enabled === false || !getField(settings, 'ticker_text')) return '';
  const tickerText = getField(settings, 'ticker_text');
  return `
    <div class="bg-transparent py-3 overflow-hidden border-t border-black/5 dark:border-white/5 flex items-center relative z-[70] select-none pointer-events-none cv-auto" style="contain: paint;">
      <div class="bg-blue-500 w-2 h-2 rounded-full absolute left-4 z-20 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
      <div class="flex whitespace-nowrap overflow-hidden pl-12 w-full relative">
        <div class="animate-marquee whitespace-nowrap min-w-full font-medium text-[13px] sm:text-[14px] tracking-wide text-zinc-600 dark:text-zinc-400">
          <span class="mx-10">${escapeHtml(tickerText)}</span>
          <span class="mx-10">${escapeHtml(tickerText)}</span>
          <span class="mx-10">${escapeHtml(tickerText)}</span>
          <span class="mx-10">${escapeHtml(tickerText)}</span>
        </div>
      </div>
    </div>
  `;
}


