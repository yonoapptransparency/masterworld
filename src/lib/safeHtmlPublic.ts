import DOMPurify from 'dompurify';

const DOMPURIFY_CONFIG = {
  USE_PROFILES: { html: true, svg: true, svgFilters: true },
  ADD_TAGS: [
    'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse',
    'g', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask',
    'pattern', 'text', 'tspan', 'use', 'symbol', 'title', 'desc',
    'section', 'article', 'header', 'footer', 'nav', 'aside', 'figure', 'figcaption',
    'details', 'summary', 'mark', 'time', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'
  ],
  ADD_ATTR: [
    'target', 'rel', 'data-discover', 'loading', 'decoding', 'fetchpriority', 'srcset', 'sizes',
    'viewBox', 'viewbox', 'xmlns', 'width', 'height', 'fill', 'stroke', 'stroke-width',
    'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit',
    'stroke-opacity', 'fill-opacity', 'fill-rule', 'clip-rule', 'opacity', 'd', 'points',
    'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'transform',
    'gradientUnits', 'gradientTransform', 'spreadMethod', 'offset', 'stop-color', 'stop-opacity',
    'clip-path', 'mask', 'text-anchor', 'dominant-baseline', 'font-size', 'font-weight', 'font-family',
    'preserveAspectRatio', 'role', 'aria-label', 'aria-hidden', 'focusable', 'colspan', 'rowspan', 'scope'
  ]
};

function normalizeEmbeddedHtmlHygiene(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    // Strip inline style="..." and legacy <font> tags to prevent dark/light theme contrast pollution
    .replace(/\s+style\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')
    .replace(/<\/?font\b[^>]*>/gi, '')
    // Convert any embedded <h1> to <h2> for strict single-H1 SEO compliance
    .replace(/<h1(\b[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>')
    // Automatically optimize embedded Cloudinary images inside rich HTML content
    .replace(/(<img\b[^>]*src=["'])(https?:\/\/res\.cloudinary\.com\/[^"'\s]+\/image\/upload\/)(?!f_auto)([^"']+)(["'][^>]*>)/gi, '$1$2f_auto,q_auto,w_800/$3$4')
    // Ensure embedded images have lazy loading and async decoding if not explicitly set
    .replace(/<img\b([^>]*)>/gi, (match, attrs) => {
      let updatedAttrs = String(attrs || '');
      if (!/\bloading\s*=/i.test(updatedAttrs)) updatedAttrs += ' loading="lazy"';
      if (!/\bdecoding\s*=/i.test(updatedAttrs)) updatedAttrs += ' decoding="async"';
      return `<img${updatedAttrs}>`;
    })
    // Ensure external links open safely in a new tab while preserving SEO link equity
    .replace(/<a\b([^>]*)>/gi, (match, attrs) => {
      const attrStr = String(attrs || '');
      const hrefMatch = attrStr.match(/\bhref\s*=\s*["']([^"']+)["']/i);
      if (!hrefMatch) return match;
      const href = hrefMatch[1].trim();
      const isExternal = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?rummydex\.com/i.test(href);
      if (!isExternal) return match;
      let nextAttrs = attrStr;
      if (!/\btarget\s*=/i.test(nextAttrs)) {
        nextAttrs += ' target="_blank"';
      }
      if (!/\brel\s*=/i.test(nextAttrs)) {
        nextAttrs += ' rel="noopener"';
      }
      return `<a${nextAttrs}>`;
    });
}

function serverSanitize(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return normalizeEmbeddedHtmlHygiene(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/\son\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, 'blocked-scheme:')
    .replace(/vbscript:/gi, 'blocked-scheme:')
    .replace(/data:\s*text\/html/gi, 'blocked-data:');
}

const STRUCTURE_CACHE = new Map<string, string>();
const SAFE_HTML_CACHE = new Map<string, string>();
const MAX_HTML_CACHE_SIZE = 250;

export function structureHtmlFragment(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  const cached = STRUCTURE_CACHE.get(rawHtml);
  if (cached !== undefined) return cached;

  let str = rawHtml.trim();

  const isFullHtmlDoc = /<!DOCTYPE|<html\b|<body\b/i.test(str);

  // 1. Strip document wrappers if present while preserving embedded <svg>, <img>, <a>, and <section> tags
  str = str.replace(/<!DOCTYPE[^>]*>/gi, '')
           .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
           .replace(/<\/?(html|head|body)[^>]*>/gi, '')
           .replace(/<title>[^<]*<\/title>/gi, '')
           .replace(/<(meta|link)\b[^>]*>/gi, '')
           .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
           .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
           .replace(/<div\b[^>]*class=["\'][^"\']*rd-news-meta[^"\']*["\'][^>]*>[\s\S]*?<\/div>/gi, '')
           .trim();

  // Strip the single leading <h1>...</h1> title inside full HTML documents since the page template already renders the primary <h1>
  if (isFullHtmlDoc) {
    str = str.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  }

  // 2. Enforce content hygiene: demote embedded <h1> to <h2>, strip inline styles & <font>, optimize Cloudinary images & external links
  str = normalizeEmbeddedHtmlHygiene(str);

  // 3. Convert markdown headers if present
  str = str.replace(/(?:^|\n)\s*####\s+(.*?)(?=\n|<|$)/gi, '\n<h3>$1</h3>')
           .replace(/(?:^|\n)\s*###\s+(.*?)(?=\n|<|$)/gi, '\n<h3>$1</h3>')
           .replace(/(?:^|\n)\s*##\s+(.*?)(?=\n|<|$)/gi, '\n<h2>$1</h2>')
           .replace(/(?:^|\n)\s*#\s+(.*?)(?=\n|<|$)/gi, '\n<h2>$1</h2>');

  // If input ALREADY has structured HTML block tags (p, h2, h3, ul, ol, li, div, section, article, table, figure, blockquote, svg)
  const hasStructuredTags = /<(p|h[23456]|ul|ol|li|div|section|article|table|figure|blockquote|svg)\b/i.test(str);

  if (hasStructuredTags) {
    let clean = str;

    // Remove any <p> that wraps block elements like <ul>, <ol>, <h2>, <h3>, <li>, <div>, <section>, <table>, <figure>, <blockquote>, <svg>
    clean = clean.replace(/<p\b[^>]*>\s*(<(?:ul|ol|h[23456]|li|div|section|article|table|figure|blockquote|svg)[^>]*>)/gi, '$1')
                 .replace(/(<\/(?:ul|ol|h[23456]|li|div|section|article|table|figure|blockquote|svg)>)\s*<\/p>/gi, '$1');

    // Auto-bold Topic: inside <p> or <li> if not already bolded
    clean = clean.replace(/<(p|li)([^>]*)>\s*([A-Z0-9][A-Za-z0-9\s&—–-]{2,50}):\s+/g, (match, tag, attrs, title) => {
      if (title.toLowerCase().startsWith('http') || title.toLowerCase().startsWith('www')) return match;
      return `<${tag}${attrs}><strong>${title}:</strong> `;
    });

    // Clean up empty tags like <p></p>, <h3></h3>, <h2></h2>, <ul></ul>
    clean = clean.replace(/<p\b[^>]*>\s*<\/p>/gi, '')
                 .replace(/<h[23456]\b[^>]*>\s*<\/h[23456]>/gi, '')
                 .replace(/<ul\b[^>]*>\s*<\/ul>/gi, '')
                 .replace(/<ol\b[^>]*>\s*<\/ol>/gi, '');

    const finalClean = clean.trim();
    if (STRUCTURE_CACHE.size >= MAX_HTML_CACHE_SIZE) STRUCTURE_CACHE.clear();
    STRUCTURE_CACHE.set(rawHtml, finalClean);
    return finalClean;
  }

  // Otherwise, if raw text/markdown without HTML block structure, build paragraphs & lists cleanly
  str = str.replace(/<br\s*\/?>/gi, '\n');

  const rawLines = str.split(/\n+/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return '';

  const output: string[] = [];
  let currentList: string[] = [];
  let hasH2 = false;

  const flushList = () => {
    if (currentList.length > 0) {
      output.push(`<ul>\n${currentList.join('\n')}\n</ul>`);
      currentList = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i];

    // Check if line is already an HTML tag or starts with <
    if (/^<(h[23]|p|ul|ol|li)\b[^>]*>[\s\S]*<\/(h[23]|p|ul|ol|li)>$/i.test(line) || /^<\/?(ul|ol|li|h[23]|p|div)\b/i.test(line)) {
      flushList();
      if (/^<h2/i.test(line)) hasH2 = true;
      output.push(line);
      continue;
    }

    // Strip outer p tag if present
    line = line.replace(/^<p\b[^>]*>/i, '').replace(/<\/p>$/i, '').trim();
    if (!line) continue;

    // Check Major Section Heading
    const isPartHeading = /^(?:<strong>)?\s*(Part\s+\d+:?|Section\s+\d+:?|Chapter\s+\d+:?|Overview|Key Features|Core Mechanics|User Experience|Technical Architecture|Monetization|Data Safety|Conclusion|Verdict|FAQ|Frequently Asked Questions)/i.test(line);

    if (isPartHeading) {
      flushList();
      hasH2 = true;
      let title = line.replace(/<\/?strong>/gi, '').replace(/<\/?b>/gi, '').trim();
      title = title.replace(/^[:\s-]+/, '').trim();
      output.push(`<h2>${title}</h2>`);
      continue;
    }

    // Check Bullet Item
    const isExplicitBullet = /^[-*•]\s*/.test(line);
    const isFeatureTopicBullet = /^<strong>([A-Z0-9][A-Za-z0-9\s&—–-]{2,50}):<\/strong>\s+/.test(line) ||
                                 (/^([A-Z0-9][A-Za-z0-9\s&—–-]{2,50}):\s+[A-Z]/.test(line) && line.length > 35 && !/[.!?]$/.test(line.split(':')[0]));

    if (isExplicitBullet || isFeatureTopicBullet) {
      let itemText = line.replace(/^[-*•]\s*/, '');
      if (!itemText.includes('<strong>') && !itemText.includes('<b>') && /^([A-Z0-9][A-Za-z0-9\s&—–-]{2,50}):\s+/.test(itemText)) {
        itemText = itemText.replace(/^([A-Z0-9][A-Za-z0-9\s&—–-]{2,50}):\s+/, '<strong>$1:</strong> ');
      }
      currentList.push(`  <li>${itemText}</li>`);
      continue;
    }

    // Check Sub-heading (H3): short text (<75 chars), no ending punctuation, doesn't contain HTML tags except strong
    const isSubHead = line.length < 75 && !/[.!?:;]$/.test(line) && !line.startsWith('<ul') && !line.startsWith('<ol') && !line.startsWith('<li');
    if (isSubHead) {
      flushList();
      let subTitle = line.replace(/<\/?strong>/gi, '').replace(/<\/?b>/gi, '').trim();
      if (!hasH2) {
        hasH2 = true;
        output.push(`<h2>${subTitle}</h2>`);
      } else {
        output.push(`<h3>${subTitle}</h3>`);
      }
      continue;
    }

    // Regular paragraph
    flushList();
    let pText = line;
    if (!pText.includes('<strong>') && !pText.includes('<b>') && /^([A-Z0-9][A-Za-z0-9\s&—–-]{2,50}):\s+/.test(pText)) {
      pText = pText.replace(/^([A-Z0-9][A-Za-z0-9\s&—–-]{2,50}):\s+/, '<strong>$1:</strong> ');
    }
    output.push(`<p>${pText}</p>`);
  }

  flushList();

  let result = output.join('\n\n');

  // Clean empty tags
  result = result.replace(/<p\b[^>]*>\s*<\/p>/gi, '')
                 .replace(/<h[23456]\b[^>]*>\s*<\/h[23456]>/gi, '')
                 .replace(/<ul\b[^>]*>\s*<\/ul>/gi, '');

  const finalResult = result.trim();
  if (STRUCTURE_CACHE.size >= MAX_HTML_CACHE_SIZE) STRUCTURE_CACHE.clear();
  STRUCTURE_CACHE.set(rawHtml, finalResult);
  return finalResult;
}

export function enhanceAndCleanHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return rawHtml || '';
  return structureHtmlFragment(rawHtml);
}

export function safeHtml(val: any, fallback: string = ''): string {
  if (!val) return fallback;
  
  let rawStr = '';
  if (typeof val === 'string') {
    rawStr = val;
  } else if (typeof val === 'object' && 'stringValue' in val) {
    rawStr = val.stringValue || fallback;
  } else {
    rawStr = String(val);
  }

  if (!rawStr) return fallback;

  const cached = SAFE_HTML_CACHE.get(rawStr);
  if (cached !== undefined) return cached;

  const enhancedStr = enhanceAndCleanHtml(rawStr);

  let sanitized = '';
  try {
    if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.sanitize === 'function') {
      sanitized = DOMPurify.sanitize(enhancedStr, DOMPURIFY_CONFIG);
    } else {
      sanitized = serverSanitize(enhancedStr);
    }
  } catch (err) {
    sanitized = serverSanitize(enhancedStr);
  }

  if (SAFE_HTML_CACHE.size >= MAX_HTML_CACHE_SIZE) SAFE_HTML_CACHE.clear();
  SAFE_HTML_CACHE.set(rawStr, sanitized);
  return sanitized;
}



