import { getField, optimizeImageUrl, cleanFaqQuestion } from '../utils';
import { escapeHtml } from './common';

export function renderHome(apps: any[], settings: any, news: any[], _videos: any[]): string {
  const siteTitle = getField(settings, 'site_title');
  const desc = getField(settings, 'meta_description');
  
  let appsHtml = '';
  const sorted = [...apps].sort((a, b) => parseInt(getField(a, 'serial_number', '999'), 10) - parseInt(getField(b, 'serial_number', '999'), 10));
  
  // Render top 18 above-the-fold apps with 1:1 PlayStoreUI styling for zero-CLS paint and perfect SEO
  sorted.slice(0, 18).forEach((app, i) => {
    const name = getField(app, 'name');
    const slug = getField(app, 'slug');
    const category = getField(app, 'category', 'Game');
    const ratingRaw = getField(app, 'rating', '5.0');
    const ratingVal = typeof ratingRaw === 'number' ? ratingRaw : (parseFloat(String(ratingRaw)) || 5.0);
    const rating = ratingVal.toFixed(1);
    const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
    const icon = optimizeImageUrl(rawIcon, 180);
    const isNew = app.is_new === true || (app.is_new && app.is_new.booleanValue === true);
    const isHot = app.is_hot === true || (app.is_hot && app.is_hot.booleanValue === true);
    const isTopItem = i < 6;
    
    appsHtml += `
      <div class="relative group z-1 [content-visibility:auto] [contain-intrinsic-size:auto_84px]">
        <a href="/app/${encodeURIComponent(slug)}" class="flex items-center gap-1.5 xxs:gap-2 xs:gap-2.5 sm:gap-4 py-1.5 xxs:py-2 pl-1 pr-8 xxs:pr-9 xs:py-2.5 xs:pl-2 xs:pr-12 sm:pl-4 sm:pr-14 sm:py-3.5 mb-0 sm:mb-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 rounded-xl sm:rounded-2xl relative active:bg-black/5 dark:active:bg-white/5 w-full" title="${escapeHtml(name)}">
          <div class="w-3.5 xxs:w-4 xs:w-5 sm:w-7 text-[11px] xxs:text-xs xs:text-[14px] sm:text-[17px] font-black text-zinc-400 dark:text-zinc-500 text-center shrink-0">
            ${i + 1}
          </div>
          <div class="relative w-[52px] h-[52px] xxs:w-[60px] xxs:h-[60px] xs:w-[72px] xs:h-[72px] sm:w-[88px] sm:h-[88px] shrink-0">
            <div class="w-full h-full rounded-[14px] xxs:rounded-[16px] xs:rounded-[18px] sm:rounded-[22px] overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/10 relative z-10 transition-transform group-hover:-translate-y-0.5 duration-300">
              <img src="${escapeHtml(icon)}" ${isTopItem ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="88" height="88" class="w-full h-full object-cover block" alt="${escapeHtml(name)} app icon"/>
            </div>
            ${isHot ? `<div class="absolute -top-1.5 -right-2 z-20 pointer-events-none"><span class="bg-[#d32f2f] text-white text-[7px] xxs:text-[8px] xs:text-[9px] sm:text-[10px] font-black px-1.5 xs:px-2 py-0.5 rounded-[6px] xs:rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">HOT</span></div>` : isNew ? `<div class="absolute -top-1.5 -right-2 z-20 pointer-events-none"><span class="bg-[#008738] text-white text-[7px] xxs:text-[8px] xs:text-[9px] sm:text-[10px] font-black px-1.5 xs:px-2 py-0.5 rounded-[6px] xs:rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">NEW</span></div>` : ''}
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <h3 class="font-semibold text-xs xxs:text-sm xs:text-base sm:text-[17px] tracking-tight text-zinc-900 dark:text-zinc-100 truncate w-full">${escapeHtml(name)}</h3>
            <div class="text-[10px] xxs:text-[11px] xs:text-xs sm:text-[13px] font-normal text-zinc-500 dark:text-zinc-400 truncate">${escapeHtml(category)}</div>
            <div class="flex items-center gap-1 text-[9px] xxs:text-[10px] xs:text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span>${rating}</span>
              <svg class="w-2.5 h-2.5 xs:w-3 xs:h-3 fill-current text-zinc-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg class="w-2.5 h-2.5 xs:w-3 xs:h-3 text-blue-500 shrink-0 ml-0.5 xs:ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
          </div>
        </a>
      </div>
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

  const newApps = sorted.filter(a => a.is_new === true || (a.is_new && a.is_new.booleanValue === true));
  let newAdditionsHtml = '';
  if (newApps.length > 0) {
    newAdditionsHtml = `
      <div class="px-0 animate-fade-in">
        <h2 class="text-base xxs:text-lg xs:text-xl font-bold mb-2.5 xs:mb-4 mt-3 xs:mt-6 text-zinc-900 dark:text-zinc-100 flex items-center px-0">
          <span>New Additions</span>
          <svg class="w-4 h-4 xs:w-5 xs:h-5 text-blue-500 fill-blue-500/20 ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
        </h2>
        <div class="flex overflow-x-auto gap-2 xxs:gap-2.5 xs:gap-3.5 sm:gap-4 px-2 xxs:px-3 xs:px-4 sm:px-1 pt-1.5 pb-2 mb-2 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-2 xxs:-mx-3 xs:-mx-4 sm:-mx-0">
          ${newApps.slice(0, 10).map((app, index) => {
            const nSlug = getField(app, 'slug');
            const nName = getField(app, 'name');
            const nIcon = optimizeImageUrl(getField(app, 'icon_url'), 180);
            const nIsHot = app.is_hot === true || (app.is_hot && app.is_hot.booleanValue === true);
            return `
              <div class="flex-none w-[64px] xxs:w-[74px] xs:w-[88px] sm:w-[104px] snap-start">
                <a href="/app/${encodeURIComponent(nSlug)}" class="flex flex-col gap-1 xxs:gap-1.5 xs:gap-2 group" title="${escapeHtml(nName)}">
                  <div class="relative w-full aspect-square">
                    <div class="w-full h-full rounded-[14px] xxs:rounded-[16px] xs:rounded-[20px] sm:rounded-[24px] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 shadow-sm">
                      <img src="${escapeHtml(nIcon)}" ${index < 5 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="104" height="104" class="w-full h-full object-cover block" alt="${escapeHtml(nName)}"/>
                    </div>
                    ${nIsHot ? `<div class="absolute -top-1.5 -right-1.5 z-20 pointer-events-none"><span class="bg-[#d32f2f] text-white text-[7px] xs:text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-[6px] xs:rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">HOT</span></div>` : `<div class="absolute -top-1.5 -right-1.5 z-20 pointer-events-none"><span class="bg-[#008738] text-white text-[7px] xs:text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-[6px] xs:rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">NEW</span></div>`}
                  </div>
                  <span class="text-[10px] xxs:text-[11px] xs:text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate w-full text-center">${escapeHtml(nName)}</span>
                </a>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  const categories = Array.isArray(settings?.categories) && settings.categories.length > 0
    ? settings.categories
    : ['All Apps', 'Rummy Apps', 'Yono Apps', 'Teen Patti', 'Casino', 'Slot Games'];

  const categoryTabsHtml = `
    <nav aria-label="Game Categories" class="mb-2 sticky top-[42px] xxs:top-[46px] xs:top-[50px] sm:top-16 z-40 bg-[var(--bg-primary,#090d16)] py-1 xxs:py-1.5 xs:py-2 px-0">
      <div class="flex overflow-x-auto no-scrollbar gap-1 xxs:gap-1.5 xs:gap-2">
        <a href="/" class="whitespace-nowrap px-2.5 xxs:px-3 xs:px-4 py-1 xxs:py-1.5 xs:py-2 text-[11px] xxs:text-xs xs:text-sm font-medium transition-all rounded-full border bg-blue-500 text-white border-blue-500 shadow-sm">All Apps</a>
        ${categories.filter((c: string) => c.toLowerCase() !== 'all' && c.toLowerCase() !== 'all apps').map((c: string) => {
          const catSlug = c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return `<a href="/category/${encodeURIComponent(catSlug)}" class="whitespace-nowrap px-2.5 xxs:px-3 xs:px-4 py-1 xxs:py-1.5 xs:py-2 text-[11px] xxs:text-xs xs:text-sm font-medium transition-all rounded-full border bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-black/5 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800">${escapeHtml(c)}</a>`;
        }).join('')}
      </div>
    </nav>
  `;

  return `
    <div class="select-none min-h-screen max-w-4xl mx-auto px-2 sm:px-4 py-4 text-left">
      <header class="text-center py-4 sm:py-8 max-w-2xl mx-auto">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mb-2 tracking-tight">${escapeHtml(siteTitle)}</h1>
        <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">${escapeHtml(desc)}</p>
      </header>

      ${newAdditionsHtml}

      ${categoryTabsHtml}

      <div class="px-0 sm:px-1">
        <div class="space-y-2">
          ${appsHtml}
        </div>
      </div>

      ${Array.isArray(settings?.website_faqs) && settings.website_faqs.filter((f: any) => f && f.question && f.answer).length > 0 ? `
        <section aria-labelledby="home-faq-heading" class="mt-12 text-left bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <h2 id="home-faq-heading" class="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Frequently Asked Questions</h2>
          <div class="space-y-4">
            ${settings.website_faqs.filter((f: any) => f && f.question && f.answer).map((faq: any, idx: number) => `
              <details class="group rounded-2xl border border-black/5 dark:border-white/5 bg-zinc-50/80 dark:bg-zinc-800/50 p-4 sm:p-5" ${idx === 0 ? 'open' : ''}>
                <summary class="font-bold text-base text-zinc-900 dark:text-zinc-100 cursor-pointer list-none flex justify-between items-center gap-3">
                  <span class="flex items-start gap-2">
                    <span class="text-blue-500 font-extrabold select-none">Q.</span>
                    <span>${escapeHtml(cleanFaqQuestion(faq.question))}</span>
                  </span>
                  <span class="text-blue-500 font-bold text-lg select-none">+</span>
                </summary>
                <div class="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-black/5 dark:border-white/5 pt-3 pl-5">
                  ${escapeHtml(faq.answer)}
                </div>
              </details>
            `).join('')}
          </div>
        </section>
      ` : ''}
    </div>
  `;
}

export function renderCategory(categoryName: string, _categorySlug: string, categoryApps: any[], settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  
  let appsHtml = '';
  const sorted = [...categoryApps].sort((a, b) => parseInt(getField(a, 'serial_number', '999'), 10) - parseInt(getField(b, 'serial_number', '999'), 10));
  
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
      <a href="/app/${encodeURIComponent(slug)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5 text-left" title="${escapeHtml(name)} review and details">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${i + 1}</span>
        <img src="${escapeHtml(icon)}" ${isTopItem ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="64" height="64" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${escapeHtml(name)} app icon"/>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${escapeHtml(name)}</h3>
          <p class="text-xs text-zinc-500 truncate">${escapeHtml(category)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${escapeHtml(rating)}</span><span class="text-amber-500 font-bold">★</span>
            ${isNew ? `<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>` : ''}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">DETAILS</span>
      </a>
    `;
  });

  return `
    <div class="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        <a href="/" class="hover:text-blue-600">Home</a>
        <span>/</span>
        <a href="/categories" class="hover:text-blue-600">Categories</a>
        <span>/</span>
        <span class="font-bold text-zinc-800 dark:text-zinc-200">${escapeHtml(categoryName)}</span>
      </nav>
      <div class="text-center py-8 mb-6 bg-white dark:bg-zinc-900 rounded-[28px] border border-black/5 p-6 shadow-sm">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">${escapeHtml(categoryName)} Apps & Reviews</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Explore all ${categoryApps.length} verified ${escapeHtml(categoryName)} applications, ratings, download specifications, and reviews on ${escapeHtml(siteTitle)}.</p>
      </div>
      <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
        <div class="flex flex-col">${appsHtml || '<p class="text-center text-zinc-400 py-10">No applications listed under this category.</p>'}</div>
      </div>
    </div>
  `;
}

export function renderNewApps(newApps: any[], settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  
  let appsHtml = '';
  newApps.forEach((app, i) => {
    const name = getField(app, 'name');
    const slug = getField(app, 'slug');
    const category = getField(app, 'category');
    const rating = getField(app, 'rating', '5.0');
    const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
    const icon = optimizeImageUrl(rawIcon, 128);
    const isTopItem = i < 4;
    
    appsHtml += `
      <a href="/app/${encodeURIComponent(slug)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5 text-left" title="${escapeHtml(name)} review and details">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${i + 1}</span>
        <img src="${escapeHtml(icon)}" ${isTopItem ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="64" height="64" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${escapeHtml(name)} app icon"/>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${escapeHtml(name)}</h3>
          <p class="text-xs text-zinc-500 truncate">${escapeHtml(category)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${escapeHtml(rating)}</span><span class="text-amber-500 font-bold">★</span>
            <span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">DETAILS</span>
      </a>
    `;
  });

  return `
    <div class="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        <a href="/" class="hover:text-blue-600">Home</a>
        <span>/</span>
        <span class="font-bold text-zinc-800 dark:text-zinc-200">New Apps</span>
      </nav>
      <div class="text-center py-8 mb-6 bg-white dark:bg-zinc-900 rounded-[28px] border border-black/5 p-6 shadow-sm">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Newly Added & Updated Applications</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Discover the latest verified card, arcade, and gaming applications added to ${escapeHtml(siteTitle)}.</p>
      </div>
      <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
        <div class="flex flex-col">${appsHtml || '<p class="text-center text-zinc-400 py-10">No new applications available.</p>'}</div>
      </div>
    </div>
  `;
}
