/**
 * Lightweight, zero-dependency slug resolver utility.
 * Safe for both client-side React bundle and server-side execution.
 */

export const SLUG_ALIAS_MAP: Record<string, string> = {
  '567-slots': 'share-slots',
  '777-rummy': '777-game',
  'ind-club': 'jaiho-91',
  'gogo-rummy': 'love-rummy',
  'uno': 'rummy-ludo',
  'slots': 'jaiho-slots',
  'arcade': 'yono-arcade',
  'vip': 'yono-vip'
};

function getFieldSafe(obj: any, field: string): any {
  if (!obj || typeof obj !== 'object') return '';
  return obj[field] !== undefined ? obj[field] : (obj.fields && obj.fields[field] ? obj.fields[field] : '');
}

export function resolveAppSlug(rawSlug: string, appsList: any[]): any | null {
  if (!rawSlug || !Array.isArray(appsList) || appsList.length === 0) return null;
  let clean = decodeURIComponent(rawSlug).replace(/^\/+|\/+$/g, '').toLowerCase().trim();
  clean = clean.replace(/[-_]+$/g, ''); // Strip trailing hyphens like "uno-" -> "uno"

  if (!clean) return null;

  // 1. Direct exact slug match
  let matched = appsList.find((a: any) => getFieldSafe(a, 'slug')?.toLowerCase() === clean);
  if (matched) return matched;

  // 2. Direct exact ID match
  matched = appsList.find((a: any) => getFieldSafe(a, 'id')?.toLowerCase() === clean);
  if (matched) return matched;

  // 3. Exact alias match
  const aliasTarget = SLUG_ALIAS_MAP[clean];
  if (aliasTarget) {
    matched = appsList.find((a: any) => getFieldSafe(a, 'slug')?.toLowerCase() === aliasTarget);
    if (matched) return matched;
  }

  // 4. Normalized exact match (hyphens/underscores/spaces standardized)
  const normalizedClean = clean.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (normalizedClean) {
    matched = appsList.find((a: any) => {
      const s = getFieldSafe(a, 'slug')?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return s === normalizedClean;
    });
    if (matched) return matched;
  }

  // 5. Normalized ID match
  if (normalizedClean) {
    matched = appsList.find((a: any) => {
      const s = getFieldSafe(a, 'id')?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return s === normalizedClean;
    });
    if (matched) return matched;
  }

  // 6. Name match
  matched = appsList.find((a: any) => {
    const n = getFieldSafe(a, 'name')?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return n && n === normalizedClean;
  });
  if (matched) return matched;

  return null;
}
