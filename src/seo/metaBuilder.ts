import { escapeHtml, getOptimizedImageUrl, normalizeIsoDate } from './utils';

export interface MetaBuilderParams {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  pageOgImage: string;
  siteTitle: string;
  targetApp?: any;
  targetNews?: any;
  collectionItems?: any[];
  settings?: any;
  faviconIco: string;
  favicon32: string;
  favicon16: string;
  favicon180: string;
  cssPreloadTag?: string;
  jsonLdSchema: string;
  isNotFound: boolean;
  getField: (obj: any, key: string, fallback?: any) => any;
  pageType?: string;
}

export function buildMetaTags(params: MetaBuilderParams): string {
  const {
    title,
    description,
    keywords,
    canonicalUrl,
    pageOgImage,
    siteTitle,
    targetApp,
    targetNews,
    collectionItems,
    settings,
    faviconIco,
    favicon32,
    favicon16,
    favicon180,
    jsonLdSchema,
    isNotFound,
    getField,
    pageType
  } = params;

  const escapedTitle = escapeHtml(title);
  const escapedDesc = escapeHtml(description);
  const escapedKeywords = escapeHtml(keywords);
  const resolvedSiteName = escapeHtml(siteTitle || 'RummyDex');

  const ogImageWidth = '1200';
  const ogImageHeight = '630';
  const ogType = pageType === 'news' ? 'article' : 'website';

  // Exact 1:1 square icon for search engine thumbnails to prevent logo mismatch in search results
  const rawTargetIcon = targetApp ? (getField(targetApp, 'icon_url') || getField(targetApp, 'og_image_url')) : '';
  const searchThumbnail = rawTargetIcon ? getOptimizedImageUrl(rawTargetIcon, 512) : pageOgImage;

  const articleMetaTags = (() => {
    if (pageType !== 'news' || !targetNews) return '';
    const rawPubTime = getField(targetNews, 'published_at') || getField(targetNews, 'publish_date') || getField(targetNews, 'created_at') || getField(targetNews, 'date') || '';
    const pubTime = rawPubTime ? normalizeIsoDate(rawPubTime, '') : '';
    const rawModTime = getField(targetNews, 'updated_at') || rawPubTime;
    const modTime = rawModTime ? normalizeIsoDate(rawModTime, pubTime) : pubTime;
    const author = getField(targetNews, 'ceo_name') || getField(targetNews, 'author') || 'Editorial Team';
    const section = getField(targetNews, 'category') || 'General';
    const tags = Array.isArray(targetNews.tags) ? targetNews.tags : [];
    return [
      pubTime ? `<meta data-rh="true" property="article:published_time" content="${escapeHtml(pubTime)}">` : '',
      modTime ? `<meta data-rh="true" property="article:modified_time" content="${escapeHtml(modTime)}">` : '',
      author ? `<meta data-rh="true" property="article:author" content="${escapeHtml(author)}">` : '',
      section ? `<meta data-rh="true" property="article:section" content="${escapeHtml(section)}">` : '',
      ...tags.filter((t: any) => typeof t === 'string' && t.trim()).map((t: string) => `<meta data-rh="true" property="article:tag" content="${escapeHtml(t.trim())}">`)
    ].filter(Boolean).join('\n    ');
  })();

  if (pageType === 'gateway') {
    const noindexRule = 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate';
    return `
    <title>${escapedTitle}</title>
    <meta name="description" content="Verification Portal">
    <meta data-rh="true" name="referrer" content="no-referrer">
    <meta data-rh="true" name="robots" content="${noindexRule}">
    <meta data-rh="true" name="googlebot" content="${noindexRule}">
    <meta data-rh="true" name="bingbot" content="${noindexRule}">
    <meta data-rh="true" name="slurp" content="${noindexRule}">
    <meta data-rh="true" name="baiduspider" content="${noindexRule}">
    <meta data-rh="true" name="yandex" content="${noindexRule}">
    <meta data-rh="true" name="duckduckbot" content="${noindexRule}">
    <meta data-rh="true" name="gptbot" content="${noindexRule}">
    <meta data-rh="true" name="claudebot" content="${noindexRule}">
    <meta data-rh="true" name="perplexitybot" content="${noindexRule}">
    <link data-rh="true" rel="icon" type="image/x-icon" href="${faviconIco}">
    <link data-rh="true" rel="icon" type="image/png" sizes="32x32" href="${favicon32}">
    <link data-rh="true" rel="icon" type="image/png" sizes="16x16" href="${favicon16}">
    <link data-rh="true" rel="apple-touch-icon" sizes="180x180" href="${favicon180}">
    <link data-rh="true" rel="manifest" href="/site.webmanifest">
  `;
  }

  const isHomePage = pageType === 'home';

  return `
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDesc}">
    ${keywords ? `<meta name="keywords" content="${escapedKeywords}">` : ''}
    ${isHomePage ? `<meta data-rh="true" name="application-name" content="${resolvedSiteName}">` : ''}
    <meta data-rh="true" name="color-scheme" content="light dark">
    ${isNotFound
      ? `<meta data-rh="true" name="robots" content="noindex, nofollow, noarchive, nosnippet">`
      : `<meta data-rh="true" name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
    }
    ${isHomePage ? `<meta data-rh="true" property="og:site_name" content="${resolvedSiteName}">` : ''}
    <meta data-rh="true" property="og:locale" content="en_IN">
    <meta data-rh="true" property="og:title" content="${escapedTitle}">
    <meta data-rh="true" property="og:description" content="${escapedDesc}">
    <meta data-rh="true" property="og:type" content="${ogType}">
    <meta data-rh="true" property="og:url" content="${canonicalUrl}">
    <meta data-rh="true" property="og:image" content="${pageOgImage}">
    <meta data-rh="true" property="og:image:secure_url" content="${pageOgImage}">
    <meta data-rh="true" property="og:image:type" content="${pageOgImage.includes('.jpg') || pageOgImage.includes('f_jpg') ? 'image/jpeg' : 'image/png'}">
    <meta data-rh="true" property="og:image:width" content="${ogImageWidth}">
    <meta data-rh="true" property="og:image:height" content="${ogImageHeight}">
    ${articleMetaTags}
    <meta data-rh="true" name="twitter:card" content="summary_large_image">
    <meta data-rh="true" name="twitter:url" content="${canonicalUrl}">
    <meta data-rh="true" name="twitter:title" content="${escapedTitle}">
    <meta data-rh="true" name="twitter:description" content="${escapedDesc}">
    <meta data-rh="true" name="twitter:image" content="${pageOgImage}">
    <meta data-rh="true" name="thumbnail" content="${searchThumbnail}">
    <meta data-rh="true" itemprop="image" content="${searchThumbnail}">
    <meta data-rh="true" itemprop="thumbnailUrl" content="${searchThumbnail}">
    <link data-rh="true" rel="image_src" href="${searchThumbnail}">
    ${!isNotFound ? `<link data-rh="true" rel="canonical" href="${canonicalUrl}">` : ''}
    <link data-rh="true" rel="icon" type="image/x-icon" href="${faviconIco}">
    <link data-rh="true" rel="icon" type="image/png" sizes="32x32" href="${favicon32}">
    <link data-rh="true" rel="icon" type="image/png" sizes="16x16" href="${favicon16}">
    <link data-rh="true" rel="apple-touch-icon" sizes="180x180" href="${favicon180}">
    <link data-rh="true" rel="manifest" href="/site.webmanifest">
    ${(() => {
      if (targetApp && getField(targetApp, 'icon_url')) {
        return `<link rel="preload" as="image" href="${escapeHtml(getOptimizedImageUrl(getField(targetApp, 'icon_url'), 160))}" fetchpriority="high">`;
      }
      if (pageType === 'news' && targetNews) {
        const rawNewsHero = getField(targetNews, 'image') || getField(targetNews, 'image_url') || getField(targetNews, 'logo_url') || getField(targetNews, 'og_image_url');
        if (rawNewsHero) {
          const hero480 = escapeHtml(getOptimizedImageUrl(rawNewsHero, 480));
          const hero800 = escapeHtml(getOptimizedImageUrl(rawNewsHero, 800));
          const hero1200 = escapeHtml(getOptimizedImageUrl(rawNewsHero, 1200));
          return `<link rel="preload" as="image" href="${hero800}" imagesrcset="${hero480} 480w, ${hero800} 800w, ${hero1200} 1200w" imagesizes="(max-width: 640px) 100vw, 768px" fetchpriority="high">`;
        }
      }
      if (pageType === 'home' && settings && Array.isArray((settings as any).banners) && (settings as any).banners.length > 0 && ((settings as any).banners[0].image_url || (settings as any).banners[0].image)) {
        const rawBanner = (settings as any).banners[0].image_url || (settings as any).banners[0].image;
        const b400 = escapeHtml(getOptimizedImageUrl(rawBanner, 400));
        const b600 = escapeHtml(getOptimizedImageUrl(rawBanner, 600));
        const b800 = escapeHtml(getOptimizedImageUrl(rawBanner, 800));
        return `<link rel="preload" as="image" href="${b600}" imagesrcset="${b400} 400w, ${b600} 600w, ${b800} 800w" imagesizes="(max-width: 640px) 100vw, 800px" fetchpriority="high">`;
      }
      if (collectionItems && collectionItems.length > 0 && getField(collectionItems[0], 'icon_url')) {
        return `<link rel="preload" as="image" href="${escapeHtml(getOptimizedImageUrl(getField(collectionItems[0], 'icon_url'), 120))}" fetchpriority="high">`;
      }
      if (getField(settings, 'logo_url')) {
        return `<link rel="preload" as="image" href="${escapeHtml(getOptimizedImageUrl(getField(settings, 'logo_url'), 120))}" fetchpriority="high">`;
      }
      return '';
    })()}
    ${!isNotFound ? jsonLdSchema : ''}
  `;
}

