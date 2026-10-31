import { escapeHtml, getOptimizedImageUrl, normalizeIsoDate, getImageMimeType } from './utils';

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

  const ogType = pageType === 'news' ? 'article' : 'website';

  // Search engine thumbnails & unpadded square icon fallback:
  // When an app does not feature a custom widescreen og_image_url, use clean 1:1 square format (f_auto,q_auto,w_512)
  // for og:image, twitter:image, and meta[name="thumbnail"] rather than letterboxing with w_1200,h_630,c_pad,b_auto
  const customAppOgImage = targetApp ? getField(targetApp, 'og_image_url') : '';
  const rawTargetIcon = targetApp ? (getField(targetApp, 'icon_url') || getField(targetApp, 'logo_url') || customAppOgImage) : '';
  const rawNewsHero = (pageType === 'news' && targetNews) ? (getField(targetNews, 'image') || getField(targetNews, 'image_url') || getField(targetNews, 'logo_url') || getField(targetNews, 'og_image_url')) : '';
  const squareAppIcon = rawTargetIcon ? getOptimizedImageUrl(rawTargetIcon, 512) : '';
  const searchThumbnail = squareAppIcon
    ? squareAppIcon
    : (rawNewsHero ? getOptimizedImageUrl(rawNewsHero, 1200) : pageOgImage);

  const isUnpaddedAppSquare = Boolean(targetApp && !customAppOgImage && squareAppIcon);
  const effectiveOgImage = isUnpaddedAppSquare ? squareAppIcon : pageOgImage;
  const isSquareOg = isUnpaddedAppSquare || effectiveOgImage.includes('w_512');
  const ogImageWidth = isSquareOg ? '512' : '1200';
  const ogImageHeight = isSquareOg ? '512' : '630';
  const ogImageMimeType = getImageMimeType(effectiveOgImage);

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
    <meta data-rh="true" property="og:image" content="${effectiveOgImage}">
    <meta data-rh="true" property="og:image:secure_url" content="${effectiveOgImage}">
    <meta data-rh="true" property="og:image:type" content="${ogImageMimeType}">
    <meta data-rh="true" property="og:image:width" content="${ogImageWidth}">
    <meta data-rh="true" property="og:image:height" content="${ogImageHeight}">
    ${articleMetaTags}
    <meta data-rh="true" name="twitter:card" content="summary_large_image">
    <meta data-rh="true" name="twitter:url" content="${canonicalUrl}">
    <meta data-rh="true" name="twitter:title" content="${escapedTitle}">
    <meta data-rh="true" name="twitter:description" content="${escapedDesc}">
    <meta data-rh="true" name="twitter:image" content="${effectiveOgImage}">
    <meta data-rh="true" name="thumbnail" content="${searchThumbnail}">
    <meta data-rh="true" itemprop="image" content="${searchThumbnail}">
    <meta data-rh="true" itemprop="thumbnailUrl" content="${searchThumbnail}">
    <link data-rh="true" rel="image_src" href="${searchThumbnail}">
    ${!isNotFound ? `<link data-rh="true" rel="canonical" href="${canonicalUrl}">` : ''}
    <link data-rh="true" rel="icon" type="image/x-icon" href="${faviconIco}">
    <link data-rh="true" rel="icon" type="image/png" sizes="32x32" href="${favicon32}">
    <link data-rh="true" rel="icon" type="image/png" sizes="16x16" href="${favicon16}">
    <link data-rh="true" rel="apple-touch-icon" sizes="180x180" href="${favicon180}">
    ${isHomePage ? `<link data-rh="true" rel="manifest" href="/site.webmanifest">` : ''}
    ${(() => {
      if (targetApp && getField(targetApp, 'icon_url')) {
        return `<link rel="preload" as="image" href="${escapeHtml(getOptimizedImageUrl(getField(targetApp, 'icon_url'), 512))}" fetchpriority="high">`;
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
      if (pageType === 'video' && effectiveOgImage) {
        return `<link rel="preload" as="image" href="${escapeHtml(effectiveOgImage)}" fetchpriority="high">`;
      }
      if (collectionItems && collectionItems.length > 0 && (getField(collectionItems[0], 'icon_url') || getField(collectionItems[0], 'image'))) {
        const firstIcon = getField(collectionItems[0], 'icon_url');
        const firstImg = firstIcon || getField(collectionItems[0], 'image');
        const preloadWidth = (firstIcon || pageType === 'home') ? 120 : 600;
        return `<link rel="preload" as="image" href="${escapeHtml(getOptimizedImageUrl(firstImg, preloadWidth))}" fetchpriority="high">`;
      }
      return '';
    })()}
    ${!isNotFound ? jsonLdSchema : ''}
  `;
}

