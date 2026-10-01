import { getOgImageUrl } from '../seo/utils';

export { getOgImageUrl };

export function formatPageTitle(rawTitle?: string, siteTitle: string = 'RummyDex'): string {
  if (!rawTitle || !rawTitle.trim()) return siteTitle;
  // If title contains multiple lines or linebreaks, take only the primary first line
  const firstLine = rawTitle.split(/\r?\n/)[0] || rawTitle;
  let clean = firstLine.trim().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  if (!clean) return siteTitle;

  // If the title itself is just the site title, return it as is
  if (clean.toLowerCase() === siteTitle.toLowerCase() || clean.toLowerCase() === 'rummydex') {
    return clean;
  }
  
  // Strip any trailing brand suffix (e.g. " - RummyDex", " | RummyDex", " - rummydex", " | siteTitle", " — RummyDex", " : RummyDex")
  const escapedSiteTitle = siteTitle ? siteTitle.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : 'RummyDex';
  const brandSuffixRegex = new RegExp(`\\s*[-|–—:•]\\s*(?:${escapedSiteTitle}|RummyDex|rummydex|Rummy\\s*Dex)\\s*$`, 'i');
  
  let prev = '';
  while (prev !== clean) {
    prev = clean;
    clean = clean.replace(brandSuffixRegex, '').trim();
  }

  return clean || siteTitle;
}

export function getCleanCanonicalUrl(rawUrl?: string, fallbackPath: string = '/'): string {
  const DEFAULT_PRIMARY_DOMAIN = 'https://www.rummydex.com';
  let input = (rawUrl || '').trim();

  if (!input) {
    const cleanPath = fallbackPath.split('?')[0].split('#')[0];
    const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    input = `${DEFAULT_PRIMARY_DOMAIN}${formattedPath}`;
  }

  try {
    const parsed = new URL(input, DEFAULT_PRIMARY_DOMAIN);

    // Always enforce primary domain (https://www.rummydex.com) for canonical URLs
    parsed.hostname = 'www.rummydex.com';
    parsed.protocol = 'https:';

    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    return `${parsed.origin}${pathname}`;
  } catch {
    let clean = input.split('?')[0].split('#')[0];
    clean = clean
      .replace(/^http:\/\//i, 'https://')
      .replace(/^https:\/\/[^\/]+/i, DEFAULT_PRIMARY_DOMAIN);
    if (clean.length > 1 && clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    return clean || DEFAULT_PRIMARY_DOMAIN;
  }
}

