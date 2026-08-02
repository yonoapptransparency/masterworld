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

    // Enforce primary domain (https://www.rummydex.com) for any rummydex.com variant
    if (parsed.hostname === 'rummydex.com' || parsed.hostname === 'www.rummydex.com') {
      parsed.hostname = 'www.rummydex.com';
      parsed.protocol = 'https:';
    } else if (!rawUrl) {
      parsed.hostname = 'www.rummydex.com';
      parsed.protocol = 'https:';
    }

    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    return `${parsed.origin}${pathname}`;
  } catch {
    let clean = input.split('?')[0].split('#')[0];
    if (clean.includes('rummydex.com')) {
      clean = clean
        .replace(/^http:\/\//i, 'https://')
        .replace('https://rummydex.com', 'https://www.rummydex.com');
    }
    if (clean.length > 1 && clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    return clean || DEFAULT_PRIMARY_DOMAIN;
  }
}
