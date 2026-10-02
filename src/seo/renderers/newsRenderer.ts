import { getField, optimizeImageUrl } from '../utils';
import { escapeHtml, sanitizeHtml } from './common';

export function renderNewsList(news: any[], _settings: any): string {
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

export function renderNewsDetail(slug: string, news: any[], settings: any, apps: any[] = []): string {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim().replace(/\/+$/, '');
  const item = news.find(n => (getField(n, 'slug') || '').toLowerCase().trim() === cleanSlug || (getField(n, 'id') || '').toLowerCase().trim() === cleanSlug);
  if (!item) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">News Article Not Found</h1><p class="text-sm text-zinc-500 mb-6">The requested news publication could not be located.</p><a href="/news" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:underline">View All News</a></div>`;
  
  const title = getField(item, 'title');
  const dateStr = getField(item, 'published_at') || getField(item, 'created_at') || getField(item, 'date') || 'Recent';
  let formattedDate = 'Recent';
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      formattedDate = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (_) {}

  const author = getField(item, 'author') || getField(item, 'ceo_name', 'Editorial Team');
  const authorRole = getField(item, 'ceo_description', 'Platform & Security Analyst');
  const cat = getField(item, 'category', 'Official Report');
  const description = getField(item, 'description', '');
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';

  // Find related app if linked
  let relatedApp: any = null;
  const relId = getField(item, 'related_app_id');
  if (relId && Array.isArray(apps)) {
    relatedApp = apps.find(a => (getField(a, 'id') || '').toLowerCase() === relId.toLowerCase() || (getField(a, 'slug') || '').toLowerCase() === relId.toLowerCase());
  }
  if (!relatedApp && getField(item, 'link') && Array.isArray(apps)) {
    const linkSlug = getField(item, 'link').replace(/^.*\/app\//, '').replace(/\/$/, '').split(/[?#]/)[0].toLowerCase();
    if (linkSlug) {
      relatedApp = apps.find(a => (getField(a, 'slug') || '').toLowerCase() === linkSlug || (getField(a, 'id') || '').toLowerCase() === linkSlug);
    }
  }
  if (!relatedApp && Array.isArray(apps)) {
    const tLower = title.toLowerCase();
    for (const a of apps) {
      const aName = (getField(a, 'name') || '').toLowerCase().trim();
      if (aName && aName.length >= 3 && tLower.includes(aName)) {
        relatedApp = a;
        break;
      }
    }
  }

  // Determine body content
  let rawContent = getField(item, 'content') || getField(item, 'description_html');
  if ((!rawContent || rawContent.trim().length < 20) && relatedApp) {
    rawContent = getField(relatedApp, 'description_html') || getField(relatedApp, 'features_html') || description;
  }
  if (!rawContent || rawContent.trim().length === 0) {
    rawContent = `<p>${escapeHtml(description)}</p>`;
  }

  const sanitizedContent = sanitizeHtml(rawContent);
  const logo = getField(item, 'logo_url') || getField(item, 'image_url');
  const optimizedLogo = logo ? optimizeImageUrl(logo, 1200) : '';

  // Download / Action link if related app or external link
  let downloadUrl = '';
  let downloadText = 'Download & Info';
  if (relatedApp) {
    downloadUrl = `/app/${encodeURIComponent(getField(relatedApp, 'slug') || getField(relatedApp, 'id'))}`;
  } else if (getField(item, 'link')) {
    downloadUrl = getField(item, 'link');
  }

  const downloadBtnHtml = downloadUrl ? `
    <div class="my-6 flex justify-start">
      <a href="${escapeHtml(downloadUrl)}" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all text-center">
        <span>↓</span>
        <span>${escapeHtml(downloadText)}</span>
      </a>
    </div>
  ` : '';

  return `
    <div class="max-w-4xl mx-auto py-4 sm:py-6 px-2 sm:px-4 text-left">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        <a href="/" class="hover:text-blue-600">Home</a>
        <span>/</span>
        <a href="/news" class="hover:text-blue-600">News</a>
        <span>/</span>
        <span class="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-md">${escapeHtml(title)}</span>
      </nav>

      <article class="animate-fade-in">
        <header class="mb-4">
          <div class="flex flex-wrap items-center gap-2 mb-2.5 text-xs">
            <span class="bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[11px] border border-blue-200/50 dark:border-blue-800/50">
              ${escapeHtml(cat)}
            </span>
            <span class="text-zinc-500 dark:text-zinc-400 font-medium">
              ${escapeHtml(formattedDate)}
            </span>
            <span class="text-zinc-300 dark:text-zinc-700">•</span>
            <span class="text-zinc-500 dark:text-zinc-400 font-medium">
              By <strong class="text-zinc-700 dark:text-zinc-300">${escapeHtml(author)}</strong>
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight mb-3">
            ${escapeHtml(title)}
          </h1>
        </header>

        ${logo ? `
          <div class="w-full overflow-hidden mb-5 rounded-2xl border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900/50 shadow-sm">
            <img src="${escapeHtml(optimizedLogo)}" loading="eager" fetchpriority="high" decoding="async" class="w-full h-auto block max-h-[500px] object-cover" alt="${escapeHtml(title)} main cover article image"/>
          </div>
        ` : ''}

        ${downloadBtnHtml}

        ${description ? `
          <div class="mb-6 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-blue-600 text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
            ${escapeHtml(description)}
          </div>
        ` : ''}

        <div class="prose dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal text-base max-w-none mb-10">
          ${sanitizedContent}
        </div>

        ${downloadBtnHtml}

        <div class="my-8 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 flex items-start gap-4 text-left">
          <div class="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
            ${escapeHtml(author.charAt(0).toUpperCase())}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100">${escapeHtml(author)}</h4>
              <span class="text-[11px] text-zinc-400">${escapeHtml(formattedDate)}</span>
            </div>
            <p class="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1.5">${escapeHtml(authorRole)}</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This publication represents verified reporting and independent testing by the ${escapeHtml(siteTitle)} editorial team.
            </p>
          </div>
        </div>
      </article>
    </div>
  `;
}
