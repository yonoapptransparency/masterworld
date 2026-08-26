export function escapeHtml(unsafe: string) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function isBotUserAgent(userAgent?: string): boolean {
  if (!userAgent) return false;
  return /googlebot|google-inspectiontool|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/|slackbot|vkShare|W3C_Validator|whatsapp|telegrambot|discordbot|applebot|petalbot|crawler|spider|screaming frog|semrushbot|ahrefsbot|rogerbot|exabot|dotbot|chatgpt|gptbot|oai-searchbot|anthropic|claude|cohere|perplexity|amazonbot|bytespider/i.test(userAgent);
}

export function getField(obj: any, key: string, fallback = ''): string {
  if (!obj) return fallback;
  const value = obj[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'object') {
    if ('stringValue' in value) return value.stringValue ?? fallback;
    if ('integerValue' in value) return String(value.integerValue) ?? fallback;
    if ('doubleValue' in value) return String(value.doubleValue) ?? fallback;
    if ('booleanValue' in value) return String(value.booleanValue) ?? fallback;
    return fallback;
  }
  return String(value);
}

export function stripHtml(html: string) {
  if (!html) return '';
  const stripped = html.replace(/<[^>]*>?/gm, ' ');
  return stripped.replace(/\s+/g, ' ').trim();
}

export function normalizeSchemaCategory(rawCategory?: string): string {
  if (!rawCategory || typeof rawCategory !== 'string') return 'GameApplication';
  const clean = rawCategory.replace(/[\r\n\t]+/g, ' ').trim();
  const lower = clean.toLowerCase();
  
  if (
    lower.includes('card') ||
    lower.includes('game') ||
    lower.includes('rummy') ||
    lower.includes('teen patti') ||
    lower.includes('patti') ||
    lower.includes('yono') ||
    lower.includes('casino') ||
    lower.includes('arcade') ||
    lower.includes('slots') ||
    lower.includes('poker') ||
    lower.includes('board') ||
    lower.includes('puzzle')
  ) {
    return 'GameApplication';
  }
  
  if (lower.includes('tool') || lower.includes('utilit')) {
    return 'UtilitiesApplication';
  }
  if (lower.includes('social') || lower.includes('chat') || lower.includes('communication')) {
    return 'SocialNetworkingApplication';
  }
  if (lower.includes('finance') || lower.includes('money') || lower.includes('wallet') || lower.includes('pay')) {
    return 'FinanceApplication';
  }
  if (lower.includes('business') || lower.includes('productivity')) {
    return 'BusinessApplication';
  }
  if (lower.includes('shop') || lower.includes('store') || lower.includes('ecommerce')) {
    return 'ShoppingApplication';
  }
  if (lower.includes('entertain') || lower.includes('media') || lower.includes('video') || lower.includes('music')) {
    return 'EntertainmentApplication';
  }
  
  return 'GameApplication';
}

export function optimizeImageUrl(url: string, width = 128): string {
  if (!url) return '';
  // Cloudinary image WebP and quality optimization
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/') && !url.includes('f_webp') && !url.includes('f_auto')) {
      return url.replace('/upload/', `/upload/f_webp,q_auto,w_${width}/`);
    }
    return url;
  }
  // Unsplash image WebP optimization
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('fm=webp')) {
      return `${url}${url.includes('?') ? '&' : '?'}fm=webp&q=80&w=${width}`;
    }
  }
  // Firebase Storage optimization
  if (url.includes('firebasestorage.app') || url.includes('firebasestorage.googleapis.com')) {
    return url.includes('?') ? `${url}&alt=media` : `${url}?alt=media`;
  }
  return url;
}

export function getYoutubeThumbnail(urlStr: string): string {
  if (!urlStr) return '';
  let id = '';
  try {
    const url = new URL(urlStr);
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/live/') || url.pathname.startsWith('/embed/') || url.pathname.startsWith('/v/')) {
        id = url.pathname.split('/')[2] || url.pathname.split('/')[1] || '';
      } else {
        id = url.searchParams.get('v') || '';
      }
    } else if (url.hostname.includes('youtu.be')) {
      id = url.pathname.slice(1);
    }
  } catch (e) {
    if (urlStr.length === 11 && !urlStr.includes('/')) id = urlStr;
  }
  if (!id) {
    const m = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    if (m && m[1]) id = m[1];
    else id = urlStr.split('/').pop()?.split('?')[0] || '';
  }
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

export function ensureAbsoluteUrl(imgUrl?: string, origin = 'https://www.rummydex.com'): string {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
    return imgUrl;
  }
  return `${origin}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
}

export function getOgImageUrl(url?: string, origin = 'https://www.rummydex.com'): string {
  if (!url) return '';
  let absUrl = ensureAbsoluteUrl(url, origin);
  if (absUrl.includes('res.cloudinary.com') && absUrl.includes('/upload/')) {
    if (absUrl.includes('w_1200') && absUrl.includes('h_630')) {
      return absUrl;
    }
    let finalUrl = absUrl.replace(
      /\/upload\/(?:(?:[a-z]{1,3}_[a-zA-Z0-9_.:-]+,?)+\/)*(?:(v\d+)\/)?/,
      (_match, version) => {
        const v = version ? `${version}/` : '';
        return `/upload/f_jpg,q_auto,w_1200,h_630,c_fill/${v}`;
      }
    );
    return finalUrl.replace(/\.webp$/i, ".jpg").replace(/\.png$/i, ".jpg");
  }
  return absUrl;
}

export function getOptimizedImageUrl(url?: string, width = 160): string {
  if (!url) return '';
  // Cloudinary dynamic optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.includes(`w_${width}`)) {
      return url;
    }
    return url.replace(
      /\/upload\/(?:(?:[a-z]{1,3}_[a-zA-Z0-9_.:-]+,?)+\/)*(?:(v\d+)\/)?/,
      (_match, version) => {
        const v = version ? `${version}/` : '';
        return `/upload/f_webp,q_auto,w_${width}/${v}`;
      }
    );
  }
  // Unsplash dynamic optimization
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('fm=webp') && !url.includes('auto=format')) {
      return `${url}${url.includes('?') ? '&' : '?'}auto=format&fit=crop&q=80&w=${width}`;
    }
  }
  return url;
}


