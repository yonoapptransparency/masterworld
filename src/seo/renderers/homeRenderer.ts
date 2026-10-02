import { getField, optimizeImageUrl, cleanFaqQuestion } from '../utils';
import { escapeHtml } from './common';

export function renderHome(apps: any[], settings: any, news: any[], _videos: any[]): string {
  const siteTitle = getField(settings, 'site_title');
  const desc = getField(settings, 'meta_description');
  
  let appsHtml = '';
  const sorted = [...apps].sort((a, b) => parseInt(getField(a, 'serial_number', '999'), 10) - parseInt(getField(b, 'serial_number', '999'), 10));
  
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
      ${Array.isArray(settings?.website_faqs) && settings.website_faqs.filter((f: any) => f && f.question && f.answer).length > 0 ? `
        <section aria-labelledby="home-faq-heading" class="mt-12 text-left bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[28px] border border-black/5 shadow-sm">
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
