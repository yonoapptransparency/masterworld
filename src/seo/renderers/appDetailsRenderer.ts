import { getField, optimizeImageUrl, stripHtml, cleanFaqQuestion } from '../utils';
import { resolveAppSlug } from '../../lib/slugResolver';
import communityCatalogStats from '../../lib/communityCatalogStats.json';
import { escapeHtml, sanitizeHtml } from './common';

export function renderAppDetails(slug: string, apps: any[], _settings: any, sampleReviews: any[] = [], liveStats: any = null): string {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim().replace(/\/+$/, '');
  const app = resolveAppSlug(cleanSlug, apps) || apps.find(a => getField(a, 'slug').toLowerCase() === cleanSlug || String(getField(a, 'id')).toLowerCase() === cleanSlug);
  if (!app) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">App Not Found</h1><a href="/" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Go Home</a></div>`;

  const name = getField(app, 'name');
  const cat = getField(app, 'category', 'Card Game');
  const version = getField(app, 'version', 'Latest');
  const size = getField(app, 'file_size', 'Variable');
  const developer = getField(app, 'developer', 'Verified Developer');
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
  const icon = optimizeImageUrl(rawIcon, 160);

  const rawDesc = app.description_html ? sanitizeHtml(app.description_html) : `<p>Comprehensive application profile and details for <strong>${escapeHtml(name)}</strong>.</p>`;
  const desc = rawDesc;
  const features = app.features_html ? sanitizeHtml(app.features_html) : '';

  // Breadcrumbs category
  const mainCat = cat.split(',')[0].trim() || 'General';

  // Safety Advisory Messages
  const hasRed = Boolean(app.red_box_msg && app.red_box_msg.trim() !== '.' && app.red_box_msg.trim() !== '');
  const hasYellow = Boolean(app.yellow_box_msg && app.yellow_box_msg.trim() !== '.' && app.yellow_box_msg.trim() !== '');
  const hasIdea = Boolean(app.idea_box_msg && app.idea_box_msg.trim() !== '.' && app.idea_box_msg.trim() !== '');

  let alertsHtml = '';
  if (hasRed || hasYellow || hasIdea) {
    alertsHtml = `
      <div class="px-1 xs:px-2 sm:px-4 md:px-6 space-y-2.5 xs:space-y-3 mb-6 xs:mb-8 w-full text-left">
        ${hasRed ? `
          <div class="bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3 xs:p-4 rounded-xl xs:rounded-2xl flex items-start gap-2.5 xs:gap-4 shadow-sm group">
            <div class="p-1.5 xs:p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg xs:rounded-xl text-rose-600 shrink-0">
              <svg class="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div class="text-xs xs:text-sm font-medium text-rose-800 dark:text-rose-200 leading-relaxed pt-0.5">
              ${escapeHtml(app.red_box_msg)}
            </div>
          </div>
        ` : ''}
        ${hasYellow ? `
          <div class="bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 p-3 xs:p-4 rounded-xl xs:rounded-2xl flex items-start gap-2.5 xs:gap-4 shadow-sm group">
            <div class="p-1.5 xs:p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg xs:rounded-xl text-orange-600 shrink-0">
              <svg class="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div class="text-xs xs:text-sm font-medium text-orange-800 dark:text-orange-200 leading-relaxed pt-0.5">
              ${escapeHtml(app.yellow_box_msg)}
            </div>
          </div>
        ` : ''}
        ${hasIdea ? `
          <div class="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 xs:p-4 rounded-xl xs:rounded-2xl flex items-start gap-2.5 xs:gap-4 shadow-sm group">
            <div class="p-1.5 xs:p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg xs:rounded-xl text-blue-600 shrink-0">
              <svg class="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            </div>
            <div class="text-xs xs:text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed pt-0.5">
              ${escapeHtml(app.idea_box_msg)}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // FAQs Accordion (strictly rendered from Admin database)
  let faqsHtml = '';
  const validFaqs = (Array.isArray(app.faqs) && app.faqs.length > 0)
    ? app.faqs.filter((f: any) => f && f.question && f.answer)
    : [];

  if (validFaqs.length > 0) {
    faqsHtml = `
      <section aria-labelledby="faq-heading" class="mb-8 sm:mb-12 px-1 sm:px-4 md:px-6 text-left">
        <div class="py-8 border-t border-black/5 dark:border-white/5">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h2 id="faq-heading" class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <span class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full">
              ${validFaqs.length} FAQs
            </span>
          </div>
          <div class="space-y-3 sm:space-y-4">
            ${validFaqs.map((faq: any) => `
              <details class="group rounded-xl sm:rounded-2xl border transition-colors duration-200 overflow-hidden bg-slate-50/70 dark:bg-zinc-900/60 border-black/5 dark:border-white/5 open:bg-slate-50 open:dark:bg-zinc-900/90 open:border-blue-200 open:dark:border-blue-900/40 shadow-xs" open>
                <summary class="list-none [&::-webkit-details-marker]:hidden w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 select-none">
                  <h3 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-start gap-3">
                    <span class="text-blue-600 dark:text-blue-400 font-extrabold shrink-0 select-none">Q.</span>
                    <span class="leading-snug">${escapeHtml(cleanFaqQuestion(faq.question))}</span>
                  </h3>
                  <div class="p-1 rounded-lg transition-transform duration-200 shrink-0 text-zinc-400 dark:text-zinc-500 group-open:rotate-180 group-open:text-blue-600 group-open:dark:text-blue-400 group-open:bg-blue-50 group-open:dark:bg-blue-900/30">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </summary>
                <div class="px-4 sm:px-5 pb-5 pt-1 border-t border-black/5 dark:border-white/5 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <div class="pl-6 sm:pl-7 pt-2">
                    <div class="prose prose-zinc dark:prose-invert prose-sm sm:prose-base max-w-none w-full break-words overflow-wrap-anywhere whitespace-normal">
                      ${sanitizeHtml(faq.answer)}
                    </div>
                  </div>
                </div>
              </details>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  // Reviews List
  let reviewsCards = '';
  if (Array.isArray(sampleReviews) && sampleReviews.length > 0) {
    reviewsCards = sampleReviews
      .filter((r: any) => r && stripHtml(r.reviewText || '').trim().length >= 3)
      .slice(0, 10)
      .map((r: any) => {
        const author = escapeHtml(r.userName || 'Verified Player');
        const revRating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
        const starsStr = '★'.repeat(revRating) + '☆'.repeat(5 - revRating);
        const text = escapeHtml(r.reviewText || '');
        const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified User';
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

  const canLoadMoreReviews = ratingCountVal > 10 || (Array.isArray(sampleReviews) && sampleReviews.length >= 10);
  const reviewsSectionHtml = `
    <div id="ratings-and-reviews-section" class="px-1 xs:px-2 sm:px-4 md:px-6 mb-6 xs:mb-8 text-left">
      <div class="border-t border-black/5 dark:border-white/5 pt-6">
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
        ${canLoadMoreReviews ? `
          <div class="pt-5 flex flex-col items-center justify-center">
            <button type="button" class="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              Load More Reviews
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Screenshots: 9:16 Portrait Gallery (Matching AppScreenshots.tsx)
  let screenshotsHtml = '';
  if (app.screenshots && Array.isArray(app.screenshots) && app.screenshots.length > 0) {
    screenshotsHtml = `
      <div class="w-full mb-6">
        <div class="flex overflow-x-auto hide-scrollbar gap-3 px-4 sm:px-0 pb-3 snap-x items-center -mx-4 sm:-mx-0">
          ${app.screenshots.slice(0, 3).map((imgUrl: string, i: number) => {
            const shotUrl = optimizeImageUrl(imgUrl, 400);
            return `
              <div class="flex-none w-[150px] sm:w-[220px] aspect-[9/16] rounded-xl overflow-hidden snap-center bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/10">
                <img src="${escapeHtml(shotUrl)}" alt="${escapeHtml(name)} screenshot ${i + 1} - gameplay preview" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" class="w-full h-full object-cover select-none pointer-events-none" />
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 16 Similar Applications: 2-Row Horizontal Scroll Grid (Matching AppSimilarCarousel.tsx)
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

  newApps.sort((a: any, b: any) => (Number(getField(a, 'serial_number')) || 999999) - (Number(getField(b, 'serial_number')) || 999999));
  regularApps.sort((a: any, b: any) => (Number(getField(a, 'serial_number')) || 999999) - (Number(getField(b, 'serial_number')) || 999999));

  const maxCount = 16;
  const pinnedNew = newApps.slice(0, Math.min(newApps.length, maxCount));
  const remainingSlots = maxCount - pinnedNew.length;

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
  let recommendedAppsHtml = '';

  if (displaySimilarApps.length > 0) {
    recommendedAppsHtml = `
      <section aria-labelledby="related-apps-heading" class="my-5 xs:my-6 px-0 text-left">
        <div class="flex items-center justify-between gap-2 mb-3 px-1 xs:px-2 sm:px-4 md:px-6">
          <div class="flex items-center gap-2 min-w-0">
            <h2 id="related-apps-heading" class="text-base xs:text-lg sm:text-xl font-bold flex items-center gap-1.5 xs:gap-2 text-zinc-900 dark:text-zinc-100 truncate">
              <span>Similar Applications</span>
              ${mainCat && mainCat !== 'All Apps' ? `<span class="text-[10px] xs:text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 xs:px-2.5 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/50 truncate">${escapeHtml(mainCat)}</span>` : ''}
            </h2>
          </div>
          <a href="/?tab=${encodeURIComponent(mainCat)}" class="inline-flex items-center gap-1.5 px-3 py-1 xs:px-3.5 xs:py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 active:scale-95 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs xs:text-xs transition-all border border-blue-200/70 dark:border-blue-800/70 shadow-2xs group shrink-0 no-underline" title="Explore all ${totalCatCount} ${escapeHtml(mainCat)} apps">
            <span>View all (${totalCatCount})</span>
            <svg class="w-3 h-3 xs:w-3.5 xs:h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
        </div>
        <div class="grid grid-rows-2 grid-flow-col gap-x-3 xxs:gap-x-4 xs:gap-x-5 gap-y-3 xxs:gap-y-3.5 xs:gap-y-4 overflow-x-auto pt-2.5 pb-2 snap-x snap-proximity [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-2 xs:-mx-4 px-2 xs:px-4 sm:mx-0 sm:px-0" style="-webkit-overflow-scrolling: touch;">
          ${displaySimilarApps.map((sim, simIdx) => {
            const simName = getField(sim, 'name');
            const simSlug = getField(sim, 'slug');
            const simIcon = optimizeImageUrl(getField(sim, 'icon_url') || '', 160);
            const simIsHot = sim.is_hot === true || (sim.is_hot && sim.is_hot.booleanValue === true);
            const simIsNew = checkAppIsNew(sim);
            const isEager = simIdx < 8;
            const imgSrc = escapeHtml(simIcon);
            return `
              <a href="/app/${encodeURIComponent(simSlug)}" class="flex flex-col items-center justify-start gap-1 xxs:gap-1.5 xs:gap-2 w-[68px] xxs:w-[76px] xs:w-[86px] sm:w-[98px] snap-start group shrink-0 active:scale-95 transition-transform duration-150 ease-out no-underline">
                <div class="relative inline-block shrink-0">
                  <img src="${imgSrc}" alt="${escapeHtml(simName)}" width="86" height="86" decoding="async" class="w-[58px] h-[58px] xxs:w-[66px] xxs:h-[66px] xs:w-[76px] xs:h-[76px] sm:w-[86px] sm:h-[86px] rounded-[24%] shadow-[0_2px_8px_rgba(0,0,0,0.08)] object-cover group-hover:scale-105 transition-transform duration-200 block pointer-events-none select-none" loading="${isEager ? 'eager' : 'lazy'}" />
                  ${simIsHot && simIsNew ? '<span class="absolute -top-1.5 -right-1.5 z-20 inline-flex items-center rounded-full overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-white dark:border-zinc-900 font-black text-[7.5px] xxs:text-[8px] xs:text-[9px] uppercase tracking-wider leading-none select-none pointer-events-none"><span class="bg-[#d32f2f] text-white px-1 xs:px-1.5 py-0.5">HOT</span><span class="bg-[#008738] text-white px-1 xs:px-1.5 py-0.5">NEW</span></span>' : simIsHot ? '<span class="absolute -top-1.5 -right-1.5 z-20 bg-[#d32f2f] text-white font-black text-[7.5px] xxs:text-[8px] xs:text-[9px] px-1.5 py-0.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-white dark:border-zinc-900 uppercase tracking-wider leading-none select-none pointer-events-none flex items-center justify-center">HOT</span>' : simIsNew ? '<span class="absolute -top-1.5 -right-1.5 z-20 bg-[#008738] text-white font-black text-[7.5px] xxs:text-[8px] xs:text-[9px] px-1.5 py-0.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-white dark:border-zinc-900 uppercase tracking-wider leading-none select-none pointer-events-none flex items-center justify-center">NEW</span>' : ''}
                </div>
                <span class="text-[9.5px] xxs:text-[10.5px] xs:text-[11.5px] sm:text-[12px] font-semibold text-center text-zinc-800 dark:text-zinc-200 line-clamp-2 w-full px-0.5 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pointer-events-none select-none">${escapeHtml(simName)}</span>
              </a>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  // 1:1 Layout Match with AppDetails.tsx
  return `
    <div class="w-full">
      <!-- 1. AppDetailsNavigation -->
      <div class="flex items-center justify-between gap-2 xs:gap-3 px-1 xs:px-2 sm:px-4 md:px-6 mb-3 xs:mb-4">
        <a href="/" class="inline-flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors group shrink-0 no-underline">
          <div class="p-1 xs:p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:-translate-x-1 transition-transform">
            <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </div>
          <span>Back to storefront</span>
        </a>
        <a href="/news?q=${encodeURIComponent(name)}" class="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-[11px] xs:text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200/90 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-black/5 dark:border-white/10 transition-all shadow-xs group cursor-pointer active:scale-95 shrink-0 no-underline" title="Read latest news and updates for ${escapeHtml(name)}">
          <div class="p-0.5 xs:p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <svg class="w-3 h-3 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
          <span>News</span>
          <svg class="w-2.5 h-2.5 xs:w-3 xs:h-3 text-zinc-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>

      <!-- 2. Main App Content Wrapper -->
      <div class="w-full">
        <!-- 2.1 AppHeader -->
        <div class="flex w-full items-center gap-2.5 xxs:gap-3 xs:gap-4 sm:gap-6 mb-3.5 sm:mb-6 px-1 xs:px-2 sm:px-4 md:px-6 mt-1 sm:mt-2 text-left">
          <div class="relative w-[56px] h-[56px] xxs:w-[66px] xxs:h-[66px] xs:w-[80px] xs:h-[80px] sm:w-[102px] sm:h-[102px] md:w-[116px] md:h-[116px] shrink-0">
            <div class="w-full h-full rounded-[14px] xxs:rounded-[16px] xs:rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-sm bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 relative">
              <img src="${escapeHtml(icon)}" alt="${escapeHtml(name)} app icon" loading="eager" fetchpriority="high" decoding="async" width="116" height="116" class="w-full h-full object-cover block relative z-10" />
            </div>
          </div>
          <div class="flex flex-col justify-center flex-1 min-w-0">
            <h1 class="text-base xxs:text-lg xs:text-2xl sm:text-3xl md:text-4xl font-black sm:font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug sm:leading-tight mb-0.5 xs:mb-1 break-words">
              ${escapeHtml(name)}
            </h1>
            <div class="text-[11px] xxs:text-xs xs:text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 mb-0.5 xs:mb-1 truncate">
              ${escapeHtml(developer)}
            </div>
            <div class="text-[8px] xxs:text-[9px] xs:text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-1.5 xs:gap-x-2.5 gap-y-0.5 mt-0.5 font-medium">
              ${(() => {
                const isAppHot = app.is_hot === true || (app.is_hot && app.is_hot.booleanValue === true);
                const isAppNew = checkAppIsNew(app);
                if (isAppHot && isAppNew) {
                  return '<span class="inline-flex items-center rounded overflow-hidden shadow-xs font-black uppercase tracking-wider text-[8px] xxs:text-[9px] xs:text-[10px]"><span class="bg-[#d32f2f] text-white px-1.5 py-0.5">HOT</span><span class="bg-[#008738] text-white px-1.5 py-0.5">NEW</span></span>';
                }
                if (isAppHot) {
                  return '<span class="bg-[#d32f2f] text-white px-1.5 py-0.5 rounded uppercase font-black tracking-wider text-[8px] xxs:text-[9px] xs:text-[10px] shadow-xs">HOT</span>';
                }
                if (isAppNew) {
                  return '<span class="bg-[#008738] text-white px-1.5 py-0.5 rounded uppercase font-black tracking-wider text-[8px] xxs:text-[9px] xs:text-[10px] shadow-xs">NEW</span>';
                }
                return '';
              })()}
              <span class="flex items-center text-emerald-600 dark:text-emerald-400 gap-1 font-semibold">
                <svg class="w-3 h-3 xxs:w-3.5 xxs:h-3.5 xs:w-4 xs:h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> Verified
              </span>
            </div>
          </div>
        </div>

        <!-- 2.2 AppSpecsBar -->
        <div class="w-full grid grid-cols-4 py-2 xxs:py-2.5 xs:py-3.5 sm:py-4 mb-3 sm:mb-6 border-y border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-900/10">
          <div class="flex flex-col items-center justify-center px-0.5 xxs:px-1 xs:px-2 text-center min-w-0">
            <div class="flex items-center gap-0.5 font-extrabold text-[11px] xxs:text-xs xs:text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              <span>${escapeHtml(rating)}</span>
              <span class="text-orange-500 text-xs">★</span>
            </div>
            <div class="text-[7px] xxs:text-[8px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5 xs:mt-1 truncate max-w-full">Rating</div>
          </div>
          <div class="flex flex-col items-center justify-center px-0.5 xxs:px-1 xs:px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80 min-w-0">
            <div class="font-extrabold text-[11px] xxs:text-xs xs:text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate max-w-full">${escapeHtml(size)}</div>
            <div class="text-[7px] xxs:text-[8px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5 xs:mt-1">Size</div>
          </div>
          <div class="flex flex-col items-center justify-center px-0.5 xxs:px-1 xs:px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80 min-w-0">
            <a href="/?tab=${encodeURIComponent(mainCat)}" class="font-extrabold text-[9px] xxs:text-[10px] xs:text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-1 xxs:px-1.5 xs:px-2.5 py-0.5 rounded-full leading-none truncate max-w-full transition-colors no-underline" title="View all ${escapeHtml(mainCat)} apps">${escapeHtml(mainCat)}</a>
            <div class="text-[7px] xxs:text-[8px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5 xs:mt-1.5">Type</div>
          </div>
          <div class="flex flex-col items-center justify-center px-0.5 xxs:px-1 xs:px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80 min-w-0">
            <div class="font-extrabold text-[11px] xxs:text-xs xs:text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate max-w-full">${escapeHtml(version)}</div>
            <div class="text-[7px] xxs:text-[8px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5 xs:mt-1">Version</div>
          </div>
        </div>

        <!-- 2.3 AppActionButtons -->
        <div class="flex flex-col sm:flex-row w-full justify-center items-center gap-1.5 xxs:gap-2 xs:gap-3 select-none mb-3 sm:mb-5 px-1 xs:px-2 sm:px-4 md:px-6">
          <div class="w-full sm:flex-1 transition-transform duration-150">
            <div class="w-full flex flex-col items-center gap-1.5">
              <a href="/moreinfo/${encodeURIComponent(cleanSlug)}" class="w-full premium-action-btn premium-action-btn-blowing cursor-pointer text-white !text-white font-bold py-2 xxs:py-2.5 px-3 xxs:px-4 xs:px-5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-[11px] xxs:text-xs xs:text-sm shadow-md h-[38px] xxs:h-[40px] xs:h-[44px] no-underline">
                <span class="flex items-center gap-1.5 font-bold text-white !text-white">
                  <span>Download</span>
                  <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </span>
              </a>
            </div>
          </div>
          <div class="flex w-full gap-1.5 xxs:gap-2 xs:gap-3 sm:w-auto shrink-0">
            <div class="flex-1 sm:w-auto sm:min-w-[100px] xxs:sm:min-w-[120px] sm:max-w-[150px]">
              <button type="button" class="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold py-2 xxs:py-2.5 px-2 xs:px-3 rounded-xl flex items-center justify-center gap-1 xs:gap-1.5 transition-all text-[11px] xxs:text-xs xs:text-sm border border-black/5 dark:border-white/5 shadow-sm h-[38px] xxs:h-[40px] xs:h-[44px] truncate cursor-pointer">
                <svg class="w-3 h-3 xs:w-4 xs:h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                <span class="truncate">Share</span>
              </button>
            </div>
            <div class="flex-1 sm:w-auto sm:min-w-[100px] xxs:sm:min-w-[120px] sm:max-w-[150px]">
              <a href="/report-removal" class="w-full bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold py-2 xxs:py-2.5 px-2 xs:px-3 rounded-xl flex items-center justify-center gap-1 xs:gap-1.5 transition-all text-[11px] xxs:text-xs xs:text-sm border border-rose-200/40 dark:border-rose-900/40 shadow-xs h-[38px] xxs:h-[40px] xs:h-[44px] truncate cursor-pointer no-underline">
                <svg class="w-3 h-3 xs:w-4 xs:h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
                <span class="truncate">Flag</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 2.4 AppSimilarCarousel -->
        ${recommendedAppsHtml}

        <!-- 2.5 AppScreenshots -->
        <div>
          ${screenshotsHtml}
        </div>

        <!-- 2.6 AppAboutSection -->
        <section aria-labelledby="app-overview-heading" class="w-full my-3 px-0 sm:px-2 text-left">
          <div class="bg-slate-50/90 dark:bg-zinc-900/80 border border-black/5 dark:border-white/5 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 shadow-xs">
            <div class="w-full p-3 xs:p-3.5 sm:p-5 flex items-center justify-between text-left select-none group border-b border-black/5 dark:border-white/5">
              <div class="flex items-center gap-2 xs:gap-2.5 sm:gap-3 flex-1 pr-2 sm:pr-3">
                <div class="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                  <h2 id="app-overview-heading" class="text-xs sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">About this app</h2>
                  <p class="text-[10px] xs:text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Overview & features</p>
                </div>
              </div>
            </div>
            <div class="p-3 xs:p-3.5 sm:p-6 space-y-5 xs:space-y-6 sm:space-y-8 bg-white/50 dark:bg-zinc-950/40">
              ${app.custom_admin_box_html ? `
                <div class="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl p-3.5 sm:p-5 shadow-xs">
                  ${app.custom_admin_box_heading ? `<h3 class="text-sm sm:text-base font-bold mb-2 text-amber-900 dark:text-amber-200">${escapeHtml(app.custom_admin_box_heading)}</h3>` : ''}
                  <div class="w-full text-xs xs:text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">${sanitizeHtml(app.custom_admin_box_html)}</div>
                </div>
              ` : ''}
              <div>
                <div class="w-full text-xs xs:text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">${desc}</div>
              </div>
              ${features ? `
                <div class="pt-5 sm:pt-6 border-t border-black/5 dark:border-white/5">
                  <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 sm:mb-3">Key App Features</h3>
                  <div class="w-full text-xs xs:text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">${features}</div>
                </div>
              ` : ''}
              ${app.release_notes ? `
                <div class="pt-5 sm:pt-6 border-t border-black/5 dark:border-white/5">
                  <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 sm:mb-3">What's New in Version ${escapeHtml(version)}</h3>
                  <div class="bg-slate-50 dark:bg-zinc-900 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap border border-black/5 dark:border-white/5">${escapeHtml(app.release_notes)}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </section>

        <!-- 2.7 AppSafetyBoxes -->
        <div>
          ${alertsHtml}
        </div>
      </div>

      <!-- 3. Reviews Section -->
      <div>
        ${reviewsSectionHtml}
      </div>

      <!-- 4. FAQs Section -->
      <div>
        ${faqsHtml}
      </div>
    </div>
  `;
}
