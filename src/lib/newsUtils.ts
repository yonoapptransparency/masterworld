export function calculateReadingTime(text?: string): string {
  if (!text) return '1 min read';
  const plain = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  if (!plain) return '1 min read';
  const words = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

export function resolveCanonicalNewsDate(itemOrDate?: any, publishedAt?: string, createdAt?: string): string {
  if (!itemOrDate) return publishedAt || createdAt || '';
  if (typeof itemOrDate === 'object') {
    return itemOrDate.published_at || itemOrDate.created_at || itemOrDate.date || '';
  }
  return publishedAt || createdAt || itemOrDate || '';
}

export function formatNewsDate(dateStr?: string, publishedAt?: string, createdAt?: string): string {
  const d = publishedAt || createdAt || dateStr;
  if (!d || d === 'Recent') return 'Recent';
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
    }
  } catch (e) {}
  return 'Recent';
}

export function getPlainTextSnippet(htmlOrText?: string, maxLength: number = 160): string {
  if (!htmlOrText) return '';
  const clean = htmlOrText
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return maxLength > 0 && clean.length > maxLength ? clean.slice(0, maxLength).trim() : clean;
}
