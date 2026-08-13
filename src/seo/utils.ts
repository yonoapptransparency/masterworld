export function getField(obj: any, key: string, fallback = ''): string {
  if (!obj) return fallback;
  const value = obj[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'object') {
    if ('stringValue' in value) return value.stringValue ?? fallback;
    if ('integerValue' in value) return String(value.integerValue) ?? fallback;
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
    if (!absUrl.includes('f_png') && !absUrl.includes('f_jpg') && !absUrl.includes('f_auto')) {
      absUrl = absUrl.replace('/upload/', '/upload/f_png,q_100/');
    }
  }
  return absUrl;
}


