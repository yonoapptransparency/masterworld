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

function checkAppIsNew(item: any): boolean {
  if (!item) return false;
  if (item.is_new === true || item.is_new === 'true' || item.is_new === 1) return true;
  if (item.isNew === true || item.isNew === 'true' || item.isNew === 1) return true;
  const isNewVal = String(getField(item, 'is_new', '')).trim().toLowerCase();
  if (isNewVal === 'true' || isNewVal === '1') return true;
  const badge = String(getField(item, 'badge', '')).trim().toLowerCase();
  return badge === 'new' || badge === 'hot';
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
  const logo = getField(item, 'image') || getField(item, 'image_url') || getField(item, 'logo_url') || getField(item, 'og_image_url');
  const optimizedLogo = logo ? optimizeImageUrl(logo, 1200) : '';

  // Download / Action link if related app or external link
  let downloadUrl = '';
  let downloadText = relatedApp ? (getField(relatedApp, 'name') || 'Application') : 'Download';
  const appSlug = relatedApp ? (getField(relatedApp, 'slug') || getField(relatedApp, 'id')) : '';
  if (relatedApp) {
    downloadUrl = `/app/${encodeURIComponent(appSlug)}`;
  } else if (getField(item, 'link')) {
    downloadUrl = getField(item, 'link');
  }

  const appDetailsUrl = appSlug ? `/app/${encodeURIComponent(appSlug)}` : (downloadUrl || '#');
  const gatewayDownloadUrl = appSlug ? `/moreinfo/${encodeURIComponent(appSlug)}` : (downloadUrl || '#');

  const downloadBtnHtml = (relatedApp || downloadUrl) ? `
    <div class="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-blue-50/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        ${relatedApp && getField(relatedApp, 'icon_url') ? `<img src="${escapeHtml(optimizeImageUrl(getField(relatedApp, 'icon_url'), 128))}" alt="${escapeHtml(downloadText)}" class="w-13 h-13 rounded-2xl object-cover shrink-0" />` : ''}
        <div>
          <h4 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">${escapeHtml(downloadText)}</h4>
        </div>
      </div>
      <div class="flex items-center gap-2.5 shrink-0">
        ${appSlug ? `<a href="${escapeHtml(appDetailsUrl)}" class="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl">App Details</a>` : ''}
        <a href="${escapeHtml(gatewayDownloadUrl)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20">Download</a>
      </div>
    </div>
  ` : '';

  // 16 Category Similar Apps (single-pass, matching Yono/Rummy category)
  let recommendedAppsHtml = '';
  if (Array.isArray(apps) && apps.length > 0) {
    const mainCat = (relatedApp ? getField(relatedApp, 'category') : (getField(item, 'category') || 'Yono Apps')).trim();
    const cleanCat = mainCat.toLowerCase();
    const isAll = cleanCat === 'all' || cleanCat === 'all apps';
    const relAppId = relatedApp ? (getField(relatedApp, 'id') || '').toLowerCase() : '';
    const relAppSlug = relatedApp ? (getField(relatedApp, 'slug') || '').toLowerCase() : '';

    const newApps: any[] = [];
    const regularApps: any[] = [];
    let totalCatCount = 0;

    for (let i = 0; i < apps.length; i++) {
      const a = apps[i];
      if (!a) continue;

      const aId = (getField(a, 'id') || '').toLowerCase();
      const aSlug = (getField(a, 'slug') || '').toLowerCase();
      const isBaseApp = Boolean(relatedApp && (aId === relAppId || aSlug === relAppSlug));

      const aCat = (getField(a, 'category') || '').toLowerCase();
      const matches = isAll || aCat.includes(cleanCat) || cleanCat.includes(aCat);

      if (matches) {
        totalCatCount++;
        if (!isBaseApp) {
          if (checkAppIsNew(a)) {
            newApps.push(a);
          } else {
            regularApps.push(a);
          }
        }
      }
    }

    newApps.sort((a, b) => (Number(getField(a, 'serial_number')) || 999999) - (Number(getField(b, 'serial_number')) || 999999));
    regularApps.sort((a, b) => (Number(getField(a, 'serial_number')) || 999999) - (Number(getField(b, 'serial_number')) || 999999));

    const maxCount = 16;
    const pinnedNew = newApps.slice(0, Math.min(newApps.length, maxCount));
    const remainingSlots = maxCount - pinnedNew.length;

    const pickedRegular: any[] = [];
    if (remainingSlots > 0 && regularApps.length > 0) {
      let startIndex = 0;
      const baseSerial = Number(relatedApp ? getField(relatedApp, 'serial_number') : null);
      if (!isNaN(baseSerial) && baseSerial > 0) {
        const nextIdx = regularApps.findIndex((a: any) => (Number(getField(a, 'serial_number')) || 0) > baseSerial);
        startIndex = nextIdx !== -1 ? nextIdx : 0;
      } else {
        const str = String(cleanSlug || getField(item, 'id') || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
        startIndex = Math.abs(hash) % regularApps.length;
      }

      const countToPick = Math.min(remainingSlots, regularApps.length);
      for (let step = 0; step < countToPick; step++) {
        const idx = (startIndex + step) % regularApps.length;
        pickedRegular.push(regularApps[idx]);
      }
    }

    const displaySimilarApps = [...pinnedNew, ...pickedRegular];

    if (displaySimilarApps.length > 0) {
      recommendedAppsHtml = `
        <section aria-labelledby="related-apps-heading" class="my-5 xs:my-6 text-left">
          <div class="flex items-center justify-between mb-3 px-1">
            <h2 id="related-apps-heading" class="text-base sm:text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <span>Similar Applications</span>
              ${mainCat && mainCat !== 'All Apps' ? `<span class="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/50">${escapeHtml(mainCat)}</span>` : ''}
            </h2>
            <a href="/?tab=${encodeURIComponent(mainCat)}" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs no-underline border border-blue-200/70 dark:border-blue-800/70">View all (${totalCatCount}) &rarr;</a>
          </div>
          <div class="grid grid-rows-2 grid-flow-col gap-x-3 xxs:gap-x-4 xs:gap-x-5 gap-y-3 xxs:gap-y-3.5 xs:gap-y-4 overflow-x-auto pt-2.5 pb-2 snap-x snap-proximity touch-pan-y overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-2 xs:-mx-4 px-2 xs:px-4 sm:mx-0 sm:px-0" style="touch-action: pan-y pan-x; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain;">
            ${displaySimilarApps.map(sim => {
              const simName = getField(sim, 'name');
              const simSlug = getField(sim, 'slug');
              const simIcon = optimizeImageUrl(getField(sim, 'icon_url') || '', 160);
              const simIsNew = checkAppIsNew(sim);
              return `
                <a href="/app/${encodeURIComponent(simSlug)}" class="flex flex-col items-center justify-start gap-1 xxs:gap-1.5 xs:gap-2 w-[68px] xxs:w-[76px] xs:w-[86px] sm:w-[98px] snap-start group shrink-0 active:scale-95 transition-transform duration-150 ease-out no-underline">
                  <div class="relative inline-block shrink-0">
                    <img src="${escapeHtml(simIcon)}" alt="${escapeHtml(simName)}" width="86" height="86" loading="lazy" decoding="async" class="w-[58px] h-[58px] xxs:w-[66px] xxs:h-[66px] xs:w-[76px] xs:h-[76px] sm:w-[86px] sm:h-[86px] rounded-[24%] shadow-[0_2px_8px_rgba(0,0,0,0.08)] object-cover group-hover:scale-105 transition-transform duration-200 block pointer-events-none select-none"/>
                    ${simIsNew ? '<span class="absolute -top-1.5 -right-1.5 z-20 bg-[#008738] text-white font-black text-[7.5px] xxs:text-[8px] xs:text-[9px] px-1.5 py-0.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-white dark:border-zinc-900 uppercase tracking-wider leading-none select-none pointer-events-none flex items-center justify-center">NEW</span>' : ''}
                  </div>
                  <span class="text-[9.5px] xxs:text-[10.5px] xs:text-[11.5px] sm:text-[12px] font-semibold text-center text-zinc-800 dark:text-zinc-200 line-clamp-2 w-full px-0.5 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pointer-events-none select-none">${escapeHtml(simName)}</span>
                </a>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }
  }

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
              Reported by <strong class="text-zinc-700 dark:text-zinc-300">${escapeHtml(author)}</strong>
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight mb-3">
            ${escapeHtml(title)}
          </h1>
        </header>

        ${logo ? `
          <div class="w-full overflow-hidden mb-5 rounded-2xl bg-transparent">
            <img src="${escapeHtml(optimizedLogo)}" loading="eager" fetchpriority="high" decoding="async" class="w-full h-auto block rounded-2xl" alt="${escapeHtml(title)} main cover article image"/>
          </div>
        ` : ''}

        ${downloadBtnHtml}

        ${recommendedAppsHtml}

        ${description ? `
          <div class="mb-6 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-blue-600 text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
            ${escapeHtml(description)}
          </div>
        ` : ''}

        <div class="prose dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal text-base max-w-none mb-10">
          ${sanitizedContent}
        </div>

        ${downloadBtnHtml}
      </article>
    </div>
  `;
}
