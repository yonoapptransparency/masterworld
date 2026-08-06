import DOMPurify from 'isomorphic-dompurify';

export function enhanceAndCleanHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return rawHtml || '';
  let clean = rawHtml.trim();

  // 1. Convert <h1> tags to <h2>
  clean = clean.replace(/<h1([^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');

  // 2. Convert bullet text inside <p> like "<p>- Feature: ..." into <li>
  clean = clean.replace(/<p>\s*[-•*]\s*(.*?)<\/p>/gi, '<li>$1</li>');

  // 3. Auto-wrap "Title:" patterns at start of <p> or <li> with <strong> if not already bolded
  clean = clean.replace(/<(p|li)([^>]*)>\s*([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/g, (match, tag, attrs, title) => {
    if (title.toLowerCase().startsWith('http') || title.toLowerCase().startsWith('www')) return match;
    return `<${tag}${attrs}><strong>${title}:</strong> `;
  });

  // 4. Wrap orphaned <li> elements into <ul> if not already wrapped
  if (clean.includes('<li>') && !clean.includes('<ul>') && !clean.includes('<ol>')) {
    clean = clean.replace(/(<li>[\s\S]*?<\/li>\s*)+/gi, (match) => `<ul className="my-4 space-y-2.5 list-disc pl-5">\n${match}</ul>\n`);
  }

  return clean;
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

  const enhancedStr = enhanceAndCleanHtml(rawStr);

  try {
    // DOMPurify is fully compatible with both browser and node contexts
    return DOMPurify.sanitize(enhancedStr);
  } catch (err) {
    console.warn("DOMPurify sanitization fallback:", err);
    return enhancedStr;
  }
}

