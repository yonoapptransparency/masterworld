import { getField, optimizeImageUrl, stripHtml, cleanFaqQuestion } from '../utils';
import { resolveAppSlug } from '../../lib/slugResolver';
import communityCatalogStats from '../../lib/communityCatalogStats.json';
import { escapeHtml, sanitizeHtml } from './common';

export function renderAppDetails(slug: string, apps: any[], _settings: any, sampleReviews: any[] = [], liveStats: any = null): string {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const app = resolveAppSlug(cleanSlug, apps) || apps.find(a => getField(a, 'slug').toLowerCase() === cleanSlug);
  if (!app) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">App Not Found</h1><a href="/" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Go Home</a></div>`;

  const name = getField(app, 'name');
  const cat = getField(app, 'category', 'Card Game');
  const version = getField(app, 'version', 'Latest');
  const size = getField(app, 'file_size', 'Variable');
  const cleanId = String(getField(app, 'id')).toLowerCase().trim();

  // Unified single source of truth for SEO ratings & counts
  const catStats = (communityCatalogStats as any)?.appCounts || {};
  const hit = (cleanId && catStats[cleanId]) || (cleanSlug && catStats[cleanSlug]);

  const rawRating = parseFloat(getField(app, 'rating')) || 4.5;
  const rawCount = parseInt(getField(app, 'review_count') || getField(app, 'reviews') || '0', 10);

  let finalRating = rawRating;
  let finalCount = rawCount;

  if (liveStats && Number(liveStats.totalReviews) > 0) {
    finalRating = Number(liveStats.averageRating) || rawRating;
    finalCount = Number(liveStats.totalReviews) || rawCount;
  } else if (hit && Number(hit.published) > 0) {
    finalRating = Number(hit.avgRating) || rawRating;
    finalCount = Number(hit.published) || rawCount;
  } else if (sampleReviews.length > 0 && finalCount === 0) {
    finalCount = sampleReviews.length;
  }

  const ratingCountVal = finalCount;
  const rating = finalRating.toFixed(1);
  const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
  const icon = optimizeImageUrl(rawIcon, 256);
  const desc = app.description_html ? sanitizeHtml(app.description_html) : `<p>No comprehensive details are configured yet for ${escapeHtml(name)}.</p>`;
  const features = app.features_html ? sanitizeHtml(app.features_html) : '';
  const featureSectionContext = features ? `<div class="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80"><h2 class="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">Key Features & Highlights</h2><div class="prose dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed">${features}</div></div>` : '';
  const pkg = getField(app, 'package_name', 'Verified Listing');

  // Breadcrumbs
  const mainCat = cat.split(',')[0].trim();
  const catSlug = encodeURIComponent(mainCat.toLowerCase().replace(/\s+/g, '-'));

  // Safety & Notice Callouts
  let alertsHtml = '';
  if (app.red_box_msg) {
    alertsHtml += `
      <div class="mb-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-left text-xs sm:text-sm text-red-800 dark:text-red-300">
        <strong class="font-bold block mb-1">Safety Advisory:</strong>
        <p>${escapeHtml(app.red_box_msg)}</p>
      </div>
    `;
  }
  if (app.yellow_box_msg) {
    alertsHtml += `
      <div class="mb-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-left text-xs sm:text-sm text-amber-800 dark:text-amber-300">
        <strong class="font-bold block mb-1">Important Notice:</strong>
        <p>${escapeHtml(app.yellow_box_msg)}</p>
      </div>
    `;
  }
  if (app.idea_box_msg) {
    alertsHtml += `
      <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-left text-xs sm:text-sm text-blue-800 dark:text-blue-300">
        <strong class="font-bold block mb-1">Tips & Strategy:</strong>
        <p>${escapeHtml(app.idea_box_msg)}</p>
      </div>
    `;
  }
  if (app.custom_admin_box_html) {
    alertsHtml += `
      <div class="mb-4 p-4 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
        ${app.custom_admin_box_heading ? `<strong class="font-bold block mb-1 text-zinc-900 dark:text-zinc-100">${escapeHtml(app.custom_admin_box_heading)}</strong>` : ''}
        <div>${sanitizeHtml(app.custom_admin_box_html)}</div>
      </div>
    `;
  }

  // Release Notes / What's New
  let releaseNotesHtml = '';
  if (app.release_notes) {
    releaseNotesHtml = `
      <div class="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 text-left">
        <h2 class="text-lg font-bold mb-3 text-zinc-900 dark:text-zinc-100">What's New in Version ${escapeHtml(version)}</h2>
        <div class="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
          ${escapeHtml(app.release_notes)}
        </div>
      </div>
    `;
  }

  // FAQs
  let faqsHtml = '';
  const validFaqs = (Array.isArray(app.faqs) && app.faqs.length > 0)
    ? app.faqs.filter((f: any) => f && f.question && f.answer)
    : [
        {
          question: `How do I download and install ${escapeHtml(name)} on my Android device?`,
          answer: `To install ${escapeHtml(name)}, tap the Download button on this page to obtain the verified installation package directly. Once downloaded, tap the notification or file in your device Downloads folder and follow the standard prompts to complete setup.`
        },
        {
          question: `Is ${escapeHtml(name)} safe to use?`,
          answer: `Yes. ${escapeHtml(name)} has been verified to ensure smooth performance, thermal stability, and authentic card gaming mechanics.`
        },
        {
          question: `What are the storage requirements for ${escapeHtml(name)}?`,
          answer: `${escapeHtml(name)} has an installation footprint of approximately ${escapeHtml(size)} and is optimized for Android devices with minimal battery drain.`
        },
        {
          question: `Can I play card games with friends and family in ${escapeHtml(name)}?`,
          answer: `Yes, ${escapeHtml(name)} provides multiplayer tables and responsive matchmaking across mobile networks for card gaming anytime.`
        }
      ];

  if (validFaqs.length > 0) {
    faqsHtml = `
      <section aria-labelledby="app-faq-heading" class="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 text-left">
        <h2 id="app-faq-heading" class="text-lg sm:text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Frequently Asked Questions</h2>
        <div class="space-y-3">
          ${validFaqs.map((f: any, idx: number) => `
            <details class="group rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 p-4" ${idx === 0 ? 'open' : ''}>
              <summary class="font-bold text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer list-none flex justify-between items-center gap-3">
                <span class="flex items-start gap-2">
                  <span class="text-blue-500 font-extrabold select-none">Q.</span>
                  <span>${escapeHtml(cleanFaqQuestion(f.question))}</span>
                </span>
                <span class="text-blue-500 font-bold select-none">+</span>
              </summary>
              <div class="mt-2.5 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-5">
                ${escapeHtml(f.answer)}
              </div>
            </details>
          `).join('')}
        </div>
      </section>
    `;
  }

  let reviewsCards = '';
  if (Array.isArray(sampleReviews) && sampleReviews.length > 0) {
    reviewsCards = sampleReviews
      .filter((r: any) => r && stripHtml(r.reviewText || '').trim().length >= 3)
      .slice(0, 5)
      .map((r: any) => {
        const author = escapeHtml(r.userName || 'Verified Player');
        const revRating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
        const starsStr = '★'.repeat(revRating) + '☆'.repeat(5 - revRating);
        const text = escapeHtml(r.reviewText || '');
        const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified User';
        const dateIso = r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString();
        return `
          <article class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-left">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                  ${author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block leading-tight">${author}</strong>
                  <span class="text-[11px] text-zinc-500 dark:text-zinc-400">${dateStr}</span>
                </div>
              </div>
              <div class="flex items-center">
                <span class="text-amber-500 font-bold text-xs tracking-wider">${starsStr}</span>
              </div>
            </div>
            <p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">${text}</p>
          </article>
        `;
      }).join('');
  }

  const reviewsSectionHtml = `
    <div class="mt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6 text-left">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Ratings & Reviews</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5"><span class="font-semibold text-zinc-800 dark:text-zinc-200">${escapeHtml(rating)}</span> out of 5 stars based on <span class="font-semibold text-zinc-800 dark:text-zinc-200">${escapeHtml(String(ratingCountVal))}</span> community reviews</p>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-amber-700 dark:text-amber-300 font-bold text-sm">
          <span>★</span>
          <span>${escapeHtml(rating)}</span>
        </div>
      </div>
      ${reviewsCards ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">${reviewsCards}</div>` : ''}
    </div>
  `;

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
  const checkAppIsNew = (item: any): boolean => {
    if (!item) return false;
    if (item.is_new === true || item.is_new === 'true' || item.is_new === 1) return true;
    if (item.isNew === true || item.isNew === 'true' || item.isNew === 1) return true;
    const isNewVal = String(getField(item, 'is_new', '')).trim().toLowerCase();
    if (isNewVal === 'true' || isNewVal === '1') return true;
    const badge = String(getField(item, 'badge', '')).trim().toLowerCase();
    return badge === 'new' || badge === 'hot';
  };

  const mainCatClean = (mainCat || 'Yono Apps').toLowerCase();
  const isAllCat = mainCatClean === 'all' || mainCatClean === 'all apps';

  const newApps: any[] = [];
  const regularApps: any[] = [];
  let totalCatCount = 0;

  for (let i = 0; i < apps.length; i++) {
    const a = apps[i];
    if (!a) continue;

    const aSlug = getField(a, 'slug').toLowerCase();
    const isCurrent = aSlug === cleanSlug;
    const aCat = getField(a, 'category', '').toLowerCase();
    const matches = isAllCat || aCat.includes(mainCatClean) || mainCatClean.includes(aCat);

    if (matches) {
      totalCatCount++;
      if (!isCurrent) {
        if (checkAppIsNew(a)) {
          newApps.push(a);
        } else {
          regularApps.push(a);
        }
      }
    }
  }

  // 1. Sort new apps strictly by serial_number ascending
  newApps.sort((a: any, b: any) => {
    const sa = Number(getField(a, 'serial_number')) || 999999;
    const sb = Number(getField(b, 'serial_number')) || 999999;
    return sa - sb;
  });

  // 2. Sort regular apps strictly by serial_number ascending
  regularApps.sort((a: any, b: any) => {
    const sa = Number(getField(a, 'serial_number')) || 999999;
    const sb = Number(getField(b, 'serial_number')) || 999999;
    return sa - sb;
  });

  const maxCount = 16;
  // Pinned new apps ALWAYS appear at the very beginning (slots 1, 2...)
  const pinnedNew = newApps.slice(0, Math.min(newApps.length, maxCount));
  const remainingSlots = maxCount - pinnedNew.length;

  // Balanced Circular Internal Linking:
  // Stagger regular apps circularly starting after targetApp's position in the series.
  const pickedRegular: any[] = [];
  if (remainingSlots > 0 && regularApps.length > 0) {
    let startIndex = 0;
    const currSerial = Number(getField(app, 'serial_number'));
    if (!isNaN(currSerial) && currSerial > 0) {
      const nextIdx = regularApps.findIndex((a: any) => (Number(getField(a, 'serial_number')) || 0) > currSerial);
      startIndex = nextIdx !== -1 ? nextIdx : 0;
    } else {
      const str = String(cleanSlug || getField(app, 'id') || '');
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

  return `
    <div class="w-full max-w-5xl mx-auto py-4 sm:py-6 px-1 sm:px-4">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6 text-left">
        <a href="/" class="hover:text-blue-600">Home</a>
        <span>/</span>
        <a href="/category/${catSlug}" class="hover:text-blue-600">${escapeHtml(mainCat)}</a>
        <span>/</span>
        <span class="font-bold text-zinc-800 dark:text-zinc-200">${escapeHtml(name)}</span>
      </nav>

      <div class="flex flex-col items-center text-center pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-6">
        <img src="${escapeHtml(icon)}" itemprop="image" loading="eager" decoding="async" width="128" height="128" class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover mb-4 shadow-md border border-zinc-200/60 dark:border-zinc-700/60" alt="${escapeHtml(name)} icon"/>
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

        <div class="flex flex-col sm:flex-row w-full justify-center items-center gap-2 max-w-md mx-auto">
          <a href="/moreinfo/${encodeURIComponent(slug)}" class="w-full sm:flex-1 justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition inline-flex items-center gap-2 text-sm tracking-wide text-center no-underline">Download &rarr;</a>
          <div class="flex gap-2 w-full sm:w-auto">
            <button type="button" class="flex-1 sm:flex-none px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700">Share</button>
            <a href="/report-removal" class="flex-1 sm:flex-none px-4 py-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900 no-underline">Flag</a>
          </div>
        </div>
      </div>

      ${recommendedAppsHtml}

      ${screenshotsHtml}

      <section aria-labelledby="app-overview-heading" class="w-full my-6 text-left">
        <div class="bg-white dark:bg-zinc-900 p-5 sm:p-7 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <h2 id="app-overview-heading" class="text-lg sm:text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">About this app</h2>
          <div class="prose dark:prose-invert text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base space-y-3">${desc}</div>
          ${featureSectionContext}
          ${releaseNotesHtml}
        </div>
      </section>

      ${alertsHtml}

      ${reviewsSectionHtml}

      ${faqsHtml}
    </div>
  `;
}
