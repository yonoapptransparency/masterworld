import { getOgImageUrl } from '../seo/utils';

export { getOgImageUrl };

export function formatPageTitle(rawTitle?: string, fallbackTitle: string = ''): string {
  if (!rawTitle || !rawTitle.trim()) return fallbackTitle;
  // If title contains multiple lines or linebreaks, take only the primary first line
  const firstLine = rawTitle.split(/\r?\n/)[0] || rawTitle;
  let clean = firstLine.trim().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  // Clean any leading or trailing stray separator punctuation without removing Admin-authored words
  clean = clean.replace(/^[:\s\-|–—•]+/, '').replace(/[:\s\-|–—•]+$/, '').trim();

  return clean || fallbackTitle;
}

const SETTINGS_META_TITLE_KEYS = [
  'seo_title',
  'meta_title',
  'disclaimer_meta_title',
  'ethics_meta_title',
  'about_meta_title',
  'contact_meta_title',
  'privacy_meta_title',
  'terms_meta_title',
  'responsibility_meta_title',
  'report_removal_meta_title',
  'notice_meta_title',
  'developers_meta_title',
  'news_meta_title',
  'videos_meta_title',
  'faq_meta_title',
  'safety_meta_title',
  'new_apps_meta_title',
  'categories_meta_title'
];

export function cleanSettingsMetaTitles<T extends Record<string, any>>(settings: T): T {
  if (!settings || typeof settings !== 'object') return settings;
  const copy: any = { ...settings };
  for (const key of SETTINGS_META_TITLE_KEYS) {
    if (typeof copy[key] === 'string' && copy[key].trim()) {
      copy[key] = formatPageTitle(copy[key], '');
    }
  }
  return copy as T;
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

export function cleanFaqQuestion(q?: string): string {
  if (!q || typeof q !== 'string') return '';
  return q
    .trim()
    .replace(/^(?:Q\s*[:.-]?\s*|\d+\s*[:.)-]\s*|Q\d+\s*[:.)-]?\s*)+/i, '')
    .trim();
}

