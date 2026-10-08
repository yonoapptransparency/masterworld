import { escapeHtml, getOptimizedImageUrl } from './utils';

export interface MetaBuilderParams {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  pageOgImage: string;
  siteTitle: string;
  targetApp?: any;
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

  const ogImageWidth = '1200';
  const ogImageHeight = '630';
  const ogType = pageType === 'news' ? 'article' : 'website';

  // For app pages: use app's own name as application-name to prevent Google from appending site brand
  const appName = targetApp ? getField(targetApp, 'name') : '';
  const applicationName = appName ? escapeHtml(appName) : escapeHtml(siteTitle);
  const ogSiteName = appName ? escapeHtml(appName) : escapeHtml(siteTitle);

  // Exact 1:1 square icon for search engine thumbnails to prevent logo mismatch in search results
  const rawTargetIcon = targetApp ? (getField(targetApp, 'icon_url') || getField(targetApp, 'og_image_url')) : '';
  const searchThumbnail = rawTargetIcon ? getOptimizedImageUrl(rawTargetIcon, 512) : pageOgImage;

  return `
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDesc}">
    ${keywords ? `<meta name="keywords" content="${escapedKeywords}">` : ''}
    <meta data-rh="true" name="application-name" content="${applicationName}">
    <meta data-rh="true" name="color-scheme" content="light dark">
    ${isNotFound
      ? `<meta data-rh="true" name="robots" content="noindex, nofollow">`
      : `<meta data-rh="true" name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
    }
    <meta data-rh="true" property="og:site_name" content="${ogSiteName}">
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
    <meta data-rh="true" name="twitter:card" content="summary_large_image">
    ${!targetApp ? `<meta data-rh="true" name="twitter:site" content="@RummyDex">
    <meta data-rh="true" name="twitter:creator" content="@RummyDex">` : ''}
    <meta data-rh="true" name="twitter:title" content="${escapedTitle}">
    <meta data-rh="true" name="twitter:description" content="${escapedDesc}">
    <meta data-rh="true" name="twitter:image" content="${pageOgImage}">
    <meta data-rh="true" name="thumbnail" content="${searchThumbnail}">
    <meta data-rh="true" itemprop="image" content="${searchThumbnail}">
    <meta data-rh="true" itemprop="thumbnailUrl" content="${searchThumbnail}">
    <link data-rh="true" rel="image_src" href="${searchThumbnail}">
    <link data-rh="true" rel="canonical" href="${canonicalUrl}">
    <link data-rh="true" rel="icon" type="image/x-icon" href="${faviconIco}">
    <link data-rh="true" rel="icon" type="image/png" sizes="32x32" href="${favicon32}">
    <link data-rh="true" rel="icon" type="image/png" sizes="16x16" href="${favicon16}">
    <link data-rh="true" rel="apple-touch-icon" sizes="180x180" href="${favicon180}">
    <link data-rh="true" rel="manifest" href="/site.webmanifest">
    ${targetApp && getField(targetApp, 'icon_url')
      ? `<link rel="preload" as="image" href="${escapeHtml(getOptimizedImageUrl(getField(targetApp, 'icon_url'), 240))}" fetchpriority="high">`
      : (getField(settings, 'logo_url') ? `<link rel="preload" as="image" href="${escapeHtml(getOptimizedImageUrl(getField(settings, 'logo_url'), 120))}" fetchpriority="high">` : '')}
    ${jsonLdSchema}
  `;
}
