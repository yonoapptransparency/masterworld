import DOMPurify from 'isomorphic-dompurify';

export function enhanceAndCleanHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return rawHtml || '';
  let clean = rawHtml.trim();

  // 1. Convert markdown headers (### -> h3, ## / # -> h2)
  clean = clean.replace(/(?:^|\n)\s*####\s+(.*?)(?=\n|<|$)/gi, '\n<h3>$1</h3>')
               .replace(/(?:^|\n)\s*###\s+(.*?)(?=\n|<|$)/gi, '\n<h3>$1</h3>')
               .replace(/(?:^|\n)\s*##\s+(.*?)(?=\n|<|$)/gi, '\n<h2>$1</h2>')
               .replace(/(?:^|\n)\s*#\s+(.*?)(?=\n|<|$)/gi, '\n<h2>$1</h2>');

  // 2. If content has no HTML tags at all, automatically format plain text paragraphs, headings, and bullet points
  if (!clean.includes('<p>') && !clean.includes('<h2>') && !clean.includes('<h3>') && !clean.includes('<div>') && !clean.includes('<ul>')) {
    const blocks = clean.split(/\n\s*\n/);
    let hasH2 = false;

    const processedBlocks = blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return '';

      // Check if list block
      const isListBlock = lines.every(l => /^[-*•]/.test(l));
      if (isListBlock) {
        const listItems = lines.map(l => {
          let itemText = l.replace(/^[-*•]\s*/, '');
          if (!itemText.includes('<strong>') && !itemText.includes('<b>') && /^([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/.test(itemText)) {
            itemText = itemText.replace(/^([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/, '<strong>$1:</strong> ');
          }
          return `<li>${itemText}</li>`;
        });
        return `<ul>\n${listItems.join('\n')}\n</ul>`;
      }

      if (lines.length === 1) {
        let lineText = lines[0];

        if (lineText.startsWith('<h2>') || lineText.startsWith('<h3>')) {
          if (lineText.startsWith('<h2>')) hasH2 = true;
          return lineText;
        }

        let isBullet = /^[-*•]\s*/.test(lineText);
        if (isBullet) {
          lineText = lineText.replace(/^[-*•]\s*/, '');
          if (!lineText.includes('<strong>') && /^([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/.test(lineText)) {
            lineText = lineText.replace(/^([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/, '<strong>$1:</strong> ');
          }
          return `<ul><li>${lineText}</li></ul>`;
        }

        // Heading candidate (H2 for primary sections, H3 for sub-sections)
        if (lineText.length < 75 && !lineText.endsWith('.') && !lineText.endsWith('!')) {
          const isMajorSection = /overview|feature|mechanic|spec|gameplay|review|highlight|installation|verdict|summary|about|faq|requirement/i.test(lineText);
          if (!hasH2 || isMajorSection) {
            hasH2 = true;
            return `<h2>${lineText}</h2>`;
          } else {
            return `<h3>${lineText}</h3>`;
          }
        }

        // Regular paragraph with title check
        if (!lineText.includes('<strong>') && /^([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/.test(lineText)) {
          lineText = lineText.replace(/^([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/, '<strong>$1:</strong> ');
        }
        return `<p>${lineText}</p>`;
      }

      const formattedLines = lines.map(l => {
        let t = l;
        if (!t.includes('<strong>') && /^([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/.test(t)) {
          t = t.replace(/^([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/, '<strong>$1:</strong> ');
        }
        return t;
      });
      return `<p>${formattedLines.join('<br />')}</p>`;
    });

    clean = processedBlocks.filter(Boolean).join('\n\n');
  }

  // 3. Convert <h1> tags to <h2>
  clean = clean.replace(/<h1([^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');

  // 4. Convert bullet text inside <p> like "<p>- Feature: ..." or "<p>• Feature: ..." into <li>
  clean = clean.replace(/<p>\s*[-•*]\s*(.*?)<\/p>/gi, '<li>$1</li>');

  // 5. Convert consecutive <h2> tags into clean <h2> -> <h3> hierarchy
  clean = clean.replace(/(<\/h2>\s*)<h2([^>]*)>(.*?)<\/h2>/gi, '$1<h3$2>$3</h3>');

  // 6. Auto-wrap "Title:" patterns at start of <p> or <li> with <strong> if not already bolded
  clean = clean.replace(/<(p|li)([^>]*)>\s*([A-Z0-9][A-Za-z0-9\s&—–-]{2,45}):\s+/g, (match, tag, attrs, title) => {
    if (title.toLowerCase().startsWith('http') || title.toLowerCase().startsWith('www')) return match;
    return `<${tag}${attrs}><strong>${title}:</strong> `;
  });

  // 7. Wrap orphaned <li> elements into <ul> if not already wrapped
  if (clean.includes('<li>') && !clean.includes('<ul>') && !clean.includes('<ol>')) {
    clean = clean.replace(/(<li>[\s\S]*?<\/li>\s*)+/gi, (match) => `<ul>\n${match}</ul>\n`);
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

