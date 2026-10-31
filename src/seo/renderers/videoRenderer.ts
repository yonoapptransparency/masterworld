import { getField, optimizeImageUrl } from '../utils';
import { escapeHtml } from './common';
import { extractYoutubeId, formatNewsDate, resolveCanonicalNewsDate, resolveVideoRelatedApp } from '../../lib/newsUtils';

const ITEMS_PER_PAGE = 6;

export function renderVideosList(videos: any[], _settings: any, pageNum: number = 1): string {
  const allVideos = Array.isArray(videos) ? videos.filter(Boolean) : [];
  const totalPages = Math.max(1, Math.ceil(allVideos.length / ITEMS_PER_PAGE));
  const safePage = Math.max(1, Math.min(pageNum || 1, totalPages));
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedVideos = allVideos.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const remainingVideos = allVideos.filter((_, idx) => idx < startIdx || idx >= startIdx + ITEMS_PER_PAGE);

  let cards = '';
  paginatedVideos.forEach((v, index) => {
    const title = getField(v, 'title') || 'Video Guide';
    const slug = getField(v, 'slug') || getField(v, 'id');
    const desc = getField(v, 'description', '');
    const videoUrl = getField(v, 'youtube_url') || getField(v, 'video_url') || getField(v, 'url', '');
    const videoId = extractYoutubeId(videoUrl);
    const thumb = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : '/logo.png';
    const category = getField(v, 'category') || 'Video Guide';
    const duration = getField(v, 'duration', '');
    const rawDate = resolveCanonicalNewsDate(v, getField(v, 'published_at'), getField(v, 'created_at'));
    const dateLabel = formatNewsDate(rawDate, getField(v, 'published_at'), getField(v, 'created_at'));
    const isHero = index === 0;

    cards += `
      <article class="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-colors text-left">
        <a href="/videos/${encodeURIComponent(slug)}" class="relative aspect-video w-full overflow-hidden bg-zinc-900 block">
          <img src="${escapeHtml(thumb)}" alt="${escapeHtml(title)}" referrerpolicy="no-referrer" decoding="async" loading="${isHero ? 'eager' : 'lazy'}" fetchpriority="${isHero ? 'high' : 'auto'}" width="480" height="270" class="w-full h-full ${videoId ? 'object-cover' : 'object-contain p-8'} transition-transform duration-300 group-hover:scale-[1.03]" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-black/65 text-white border border-white/25 flex items-center justify-center shadow-lg group-hover:bg-blue-600 group-hover:scale-105 transition-all">
              <svg class="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
            </div>
          </div>
          ${duration ? `<span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono font-semibold">${escapeHtml(duration)}</span>` : ''}
        </a>
        <div class="p-4 sm:p-5 flex-1 flex flex-col">
          <div class="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            <span class="text-blue-600 dark:text-blue-400 uppercase tracking-wider">${escapeHtml(category)}</span>
            <span aria-hidden="true">·</span>
            <time>${escapeHtml(dateLabel)}</time>
          </div>
          <h2 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <a href="/videos/${encodeURIComponent(slug)}">${escapeHtml(title)}</a>
          </h2>
          ${desc ? `<p class="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">${escapeHtml(desc)}</p>` : ''}
          <div class="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Verified Walkthrough</span>
            <a href="/videos/${encodeURIComponent(slug)}" class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
              <span>Watch Video</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </article>
    `;
  });

  const archiveHtml = remainingVideos.length > 0 ? `
    <nav aria-label="Complete Video Archive" data-nosnippet class="mt-10 pt-6 border-t border-zinc-200/70 dark:border-zinc-800/80">
      <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Complete Video Directory</h2>
      <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs">
        ${remainingVideos.map((v: any) => {
          const vSlug = getField(v, 'slug') || getField(v, 'id');
          const vTitle = getField(v, 'title');
          return `<li class="truncate"><a href="/videos/${encodeURIComponent(vSlug)}" class="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">${escapeHtml(vTitle)}</a></li>`;
        }).join('')}
      </ul>
    </nav>
  ` : '';

  return `
    <div class="min-h-screen max-w-6xl mx-auto plain-content px-3 sm:px-6 pb-16 text-left">
      <nav aria-label="Breadcrumb" class="mb-4 sm:mb-6 pt-2 sm:pt-4 flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
        <a href="/" class="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
          <span>← Home</span>
        </a>
        <span aria-hidden="true">/</span>
        <span class="text-zinc-700 dark:text-zinc-300 font-semibold">Videos</span>
      </nav>

      <header class="mb-6 sm:mb-8 pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Visual Walkthroughs</p>
          <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white m-0">Videos &amp; Guides</h1>
          <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">Verified gameplay walkthroughs, feature reviews, and platform guides.</p>
        </div>
        <div class="relative w-full sm:w-72">
          <input
            type="text"
            aria-label="Search videos"
            placeholder="Search videos..."
            value=""
            readonly
            class="block w-full py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 placeholder-zinc-400 text-sm rounded-xl px-3.5 pr-9 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </header>

      ${paginatedVideos.length === 0 ? `
        <div class="text-center py-20 max-w-md mx-auto">
          <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">No videos found</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">No videos have been published yet.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">${cards}</div>
      `}

      ${archiveHtml}

      <nav aria-label="Explore Directory" class="mt-10 pt-6 border-t border-zinc-200/70 dark:border-zinc-800/80">
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <span class="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Explore RummyDex:</span>
          <div class="flex flex-wrap items-center gap-4">
            <a href="/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">App Directory</a>
            <a href="/news" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">News &amp; Updates</a>
            <a href="/new-apps" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">New Releases</a>
            <a href="/categories" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Categories</a>
            <a href="/faq" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQs</a>
          </div>
        </div>
      </nav>
    </div>
  `;
}

export function renderVideoDetail(slug: string, videos: any[], _settings: any, apps: any[] = []): string {
  const cleanSlug = decodeURIComponent(slug || '').toLowerCase().trim().replace(/\/+$/, '').split(/[?#]/)[0];
  const allVideos = Array.isArray(videos) ? videos.filter(Boolean) : [];
  const v = allVideos.find(item => {
    const vSlug = (getField(item, 'slug') || '').toLowerCase().trim();
    const vId = (getField(item, 'id') || '').toLowerCase().trim();
    return (vSlug && vSlug === cleanSlug) || (vId && vId === cleanSlug);
  });

  if (!v) {
    return `
      <div class="py-20 text-center max-w-md mx-auto min-h-[60vh] px-4">
        <h1 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Video Not Found</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">The requested video walkthrough could not be found.</p>
        <a href="/videos" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">← Back to Videos</a>
      </div>
    `;
  }

  const title = getField(v, 'title') || 'Video Guide';
  const desc = getField(v, 'description', '');
  const videoUrl = getField(v, 'youtube_url') || getField(v, 'video_url') || getField(v, 'url', '');
  const videoId = extractYoutubeId(videoUrl);
  const thumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : '/logo.png';
  const category = getField(v, 'category') || 'Video Guide';
  const rawDate = resolveCanonicalNewsDate(v, getField(v, 'published_at'), getField(v, 'created_at'));
  const dateLabel = formatNewsDate(rawDate, getField(v, 'published_at'), getField(v, 'created_at'));
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` : videoUrl;

  const relatedApp = resolveVideoRelatedApp(v, apps);
  let relatedAppHtml = '';
  if (relatedApp) {
    const appName = getField(relatedApp, 'name');
    const appSlug = getField(relatedApp, 'slug') || getField(relatedApp, 'id');
    const appIcon = optimizeImageUrl(getField(relatedApp, 'icon_url') || '/logo.png', 120);
    const appCat = getField(relatedApp, 'category') || 'Application';
    const appRating = Number(getField(relatedApp, 'rating') || 4.5).toFixed(1);

    relatedAppHtml = `
      <section aria-label="Featured Application" class="mt-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <p class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Featured Application in This Guide</p>
        <a href="/app/${encodeURIComponent(appSlug)}" class="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-blue-500/40 transition-colors group">
          <div class="flex items-center gap-3 min-w-0">
            <img src="${escapeHtml(appIcon)}" alt="${escapeHtml(appName)}" width="48" height="48" loading="lazy" decoding="async" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/5 dark:border-white/10" />
            <div class="min-w-0">
              <h2 class="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(appName)}</h2>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${escapeHtml(appCat)} · ★ ${escapeHtml(appRating)}</p>
            </div>
          </div>
          <span class="shrink-0 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold group-hover:bg-blue-700 transition-colors">View App</span>
        </a>
      </section>
    `;
  }

  const otherVideos = allVideos.filter(item => {
    const s = (getField(item, 'slug') || getField(item, 'id') || '').toLowerCase().trim();
    return s && s !== cleanSlug;
  }).slice(0, 3);

  const moreVideosHtml = otherVideos.length > 0 ? `
    <section aria-label="More Videos" class="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">More Videos &amp; Guides</h2>
        <a href="/videos" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View All →</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${otherVideos.map(ov => {
          const ovTitle = getField(ov, 'title') || 'Video Guide';
          const ovSlug = getField(ov, 'slug') || getField(ov, 'id');
          const ovUrl = getField(ov, 'youtube_url') || getField(ov, 'video_url') || getField(ov, 'url', '');
          const ovId = extractYoutubeId(ovUrl);
          const ovThumb = ovId ? `https://img.youtube.com/vi/${ovId}/mqdefault.jpg` : '/logo.png';
          return `
            <a href="/videos/${encodeURIComponent(ovSlug)}" class="group flex sm:flex-col gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 hover:border-blue-500/40 transition-colors">
              <div class="relative w-28 sm:w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                <img src="${escapeHtml(ovThumb)}" alt="${escapeHtml(ovTitle)}" width="320" height="180" loading="lazy" decoding="async" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">${escapeHtml(ovTitle)}</h3>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </section>
  ` : '';

  return `
    <div class="max-w-4xl mx-auto px-3 sm:px-6 pb-14 text-left">
      <nav aria-label="Breadcrumb" class="mb-4 sm:mb-6 pt-2 sm:pt-4 flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 overflow-x-auto whitespace-nowrap no-scrollbar">
        <a href="/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
        <span aria-hidden="true">/</span>
        <a href="/videos" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Videos</a>
        <span aria-hidden="true">/</span>
        <span class="text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-[220px] sm:max-w-md">${escapeHtml(title)}</span>
      </nav>

      <article class="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
        <div class="relative w-full bg-zinc-950 aspect-video overflow-hidden">
          ${videoId ? `
            <button type="button" aria-label="Play video: ${escapeHtml(title)}" class="group relative w-full h-full block text-left cursor-pointer focus:outline-none">
              <img src="${escapeHtml(thumb)}" alt="${escapeHtml(title)}" width="1280" height="720" loading="eager" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10"></div>
              <div class="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600/95 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl border-2 border-white/30 transition-transform duration-300 group-hover:scale-105">
                  <svg class="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                </div>
                <span class="px-3 py-1 rounded-full bg-black/70 text-white text-xs font-semibold tracking-wide border border-white/15">Tap to Play Video</span>
              </div>
            </button>
          ` : `
            <div class="flex items-center justify-center h-full text-zinc-400 font-medium text-sm">Video stream unavailable</div>
          `}
        </div>

        <div class="p-4 sm:p-8">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <div class="flex items-center gap-1.5">
              <span class="text-blue-600 dark:text-blue-400 uppercase tracking-wider">${escapeHtml(category)}</span>
              <span aria-hidden="true">·</span>
              <time>${escapeHtml(dateLabel)}</time>
            </div>
            ${watchUrl ? `
              <a href="${escapeHtml(watchUrl)}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Watch on YouTube ↗
              </a>
            ` : ''}
          </div>

          <h1 class="text-xl sm:text-3xl font-extrabold leading-snug mb-4 tracking-tight text-zinc-900 dark:text-zinc-100">${escapeHtml(title)}</h1>

          <div class="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            <p>${escapeHtml(desc)}</p>
          </div>

          ${relatedAppHtml}
          ${moreVideosHtml}

          <nav aria-label="Related Directory Links" class="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <a href="/videos" class="text-blue-600 dark:text-blue-400 hover:underline">← All Videos &amp; Guides</a>
            <div class="flex flex-wrap items-center gap-4">
              <a href="/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">App Directory</a>
              <a href="/news" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Latest News</a>
              <a href="/new-apps" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">New Apps</a>
              <a href="/categories" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Categories</a>
            </div>
          </nav>
        </div>
      </article>
    </div>
  `;
}
