export function calculateReadingTime(text?: string): string {
  if (!text) return '1 min read';
  const plain = String(text)
    .replace(/<(script|style|svg|head|title|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '1 min read';
  const words = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function resolveCanonicalNewsDate(itemOrDate?: any, publishedAt?: string, createdAt?: string): string {
  if (!itemOrDate) return publishedAt || createdAt || '';
  if (typeof itemOrDate === 'object') {
    return itemOrDate.published_at || itemOrDate.created_at || itemOrDate.date || '';
  }
  return publishedAt || createdAt || itemOrDate || '';
}

export function formatNewsDate(dateStr?: string, publishedAt?: string, createdAt?: string): string {
  const d = publishedAt || createdAt || dateStr;
  if (!d || d === 'Recent') return 'Recent';
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
    }
  } catch (e) {}
  return 'Recent';
}

export function getPlainTextSnippet(htmlOrText?: string, maxLength: number = 160): string {
  if (!htmlOrText) return '';
  const clean = htmlOrText
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return maxLength > 0 && clean.length > maxLength ? clean.slice(0, maxLength).trim() : clean;
}

/**
 * Deterministic "Next, Next, Next" Circular Daisy-Chain Internal Linking Engine
 *
 * Guarantees every news article links forward to the next N articles in the publication sequence,
 * wrapping around circularly so:
 * - When on article i, it displays articles (i+1), (i+2), ... (i+count) % total
 * - Navigating to the next article displays the subsequent 6 articles in the chain
 * - Every article in the catalog receives equal, balanced incoming internal backlinks and PageRank
 * - 100% deterministic between server SSR (newsRenderer.ts), initialDataOptimizer.ts, and client React (NewsDetailPage.tsx)
 */
export function getNextNewsChain(
  currentNewsItemOrKey: any,
  allNews: any[],
  count: number = 8
): any[] {
  if (!Array.isArray(allNews) || allNews.length === 0) return [];

  const validNews = allNews.filter((n: any) => n && n.sync_to_public !== false);
  if (validNews.length <= 1) return [];

  const curKey = typeof currentNewsItemOrKey === 'string'
    ? currentNewsItemOrKey.toLowerCase().trim()
    : String(currentNewsItemOrKey?.slug || currentNewsItemOrKey?.id || '').toLowerCase().trim();

  // If allNews is the pre-trimmed SSR slice for this exact target article, preserve its exact pre-computed circular order
  const precomputedChain = validNews.filter((n: any) => {
    const s = String(n.slug || n.id || '').toLowerCase().trim();
    const id = String(n.id || '').toLowerCase().trim();
    return s !== curKey && id !== curKey && typeof n._nextChainOrder === 'number';
  });
  if (precomputedChain.length > 0 && validNews.length <= count + 2) {
    return [...precomputedChain]
      .sort((a: any, b: any) => Number(a._nextChainOrder) - Number(b._nextChainOrder))
      .slice(0, count);
  }

  // Canonical sort: newest first, respecting is_pinned, then date/published_at descending, then slug/id for tie-breaking
  const sorted = [...validNews].sort((a: any, b: any) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    const dateA = new Date(a.date || a.published_at || a.created_at || 0).getTime();
    const dateB = new Date(b.date || b.published_at || b.created_at || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return String(a.slug || a.id || '').localeCompare(String(b.slug || b.id || ''));
  });

  const currentIndex = sorted.findIndex((n: any) => {
    const s = String(n.slug || n.id || '').toLowerCase().trim();
    const id = String(n.id || '').toLowerCase().trim();
    return s === curKey || id === curKey;
  });

  const targetCount = Math.min(count, sorted.length - 1);
  const result: any[] = [];

  if (currentIndex === -1) {
    return sorted.slice(0, targetCount);
  }

  // Circular forward progression: (currentIndex + step) % sorted.length
  for (let step = 1; step <= targetCount; step++) {
    const nextIdx = (currentIndex + step) % sorted.length;
    result.push(sorted[nextIdx]);
  }

  return result;
}

export function extractYoutubeId(urlStr?: string): string {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const trimmed = urlStr.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      if (
        url.pathname.startsWith('/shorts/') ||
        url.pathname.startsWith('/live/') ||
        url.pathname.startsWith('/embed/') ||
        url.pathname.startsWith('/v/')
      ) {
        const seg = url.pathname.split('/')[2] || url.pathname.split('/')[1] || '';
        return seg.split(/[?#&]/)[0] || '';
      }
      return (url.searchParams.get('v') || '').split(/[?#&]/)[0] || '';
    } else if (host.includes('youtu.be')) {
      return url.pathname.slice(1).split(/[/?#&]/)[0] || '';
    }
  } catch (e) {}
  const m = trimmed.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
  if (m && m[1]) return m[1];
  const fallbackMatch = trimmed.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([^&?\s/]+)/);
  if (fallbackMatch && fallbackMatch[1]) return fallbackMatch[1];
  return '';
}

export function getYoutubeThumbUrl(
  urlOrId?: string,
  quality: 'hqdefault' | 'mqdefault' | 'maxresdefault' | 'default' = 'hqdefault'
): string {
  const ytId = extractYoutubeId(urlOrId);
  if (!ytId) return '';
  return `https://img.youtube.com/vi/${ytId}/${quality}.jpg`;
}

export function resolveVideoRelatedApp(videoItem: any, apps: any[]): any {
  if (!videoItem || !Array.isArray(apps) || apps.length === 0) return null;
  const getVal = (obj: any, key: string): string => {
    if (!obj || obj[key] === undefined || obj[key] === null) return '';
    const v = obj[key];
    if (typeof v === 'object' && v.stringValue !== undefined) return String(v.stringValue);
    return String(v);
  };

  const relId = getVal(videoItem, 'related_app_id').toLowerCase().trim();
  if (relId) {
    const byId = apps.find((a: any) => {
      const aId = getVal(a, 'id').toLowerCase().trim();
      const aSlug = getVal(a, 'slug').toLowerCase().trim();
      return (aId && aId === relId) || (aSlug && aSlug === relId);
    });
    if (byId) return byId;
  }

  const vSlug = getVal(videoItem, 'slug').toLowerCase();
  const vTitle = getVal(videoItem, 'title').toLowerCase();
  const haystack = `${vSlug} ${vTitle}`.replace(/[^a-z0-9]+/g, ' ');
  const compactHaystack = `${vSlug}${vTitle}`.replace(/[^a-z0-9]+/g, '');

  for (const app of apps) {
    if (!app || app.sync_to_public === false) continue;
    const aSlug = getVal(app, 'slug').toLowerCase().trim();
    const aName = getVal(app, 'name').toLowerCase().trim();
    const cleanSlug = aSlug.replace(/[^a-z0-9]+/g, '');
    const cleanName = aName.replace(/[^a-z0-9]+/g, '');
    if (cleanSlug.length >= 4 && compactHaystack.includes(cleanSlug)) {
      return app;
    }
    if (cleanName.length >= 4 && compactHaystack.includes(cleanName)) {
      return app;
    }
    if (aName.length >= 4 && haystack.includes(aName)) {
      return app;
    }
  }

  return null;
}


