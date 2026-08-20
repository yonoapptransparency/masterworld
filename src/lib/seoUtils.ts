import { getOgImageUrl } from '../seo/utils';

export { getOgImageUrl };

export function formatPageTitle(rawTitle?: string, siteTitle: string = 'RummyDex'): string {
  if (!rawTitle || !rawTitle.trim()) return siteTitle;
  // If title contains multiple lines or linebreaks, take only the primary first line
  const firstLine = rawTitle.split(/\r?\n/)[0] || rawTitle;
  let clean = firstLine.trim().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  const escapedSite = siteTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const repeatedSuffixRegex = new RegExp(`(?:\\s*[|\\-]\\s*${escapedSite})+\\s*$`, 'i');
  clean = clean.replace(repeatedSuffixRegex, '').trim();

  if (!clean || clean.toLowerCase() === siteTitle.toLowerCase()) {
    return siteTitle;
  }

  // Cap base title so total title stays <= 60 characters for Google SERP
  const maxBaseLength = Math.max(20, 58 - siteTitle.length - 3);
  if (clean.length > maxBaseLength) {
    const truncated = clean.substring(0, maxBaseLength);
    const lastSpace = truncated.lastIndexOf(' ');
    clean = lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated;
  }

  return `${clean} | ${siteTitle}`;
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

