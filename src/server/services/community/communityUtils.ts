import { getStaticData } from '../../config';
import { CanonicalAppResolution } from './communityTypes';

export function getAppChunkDocId(appIdentifier: string, chunkIndex = 0): string {
  const clean = String(appIdentifier || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 80);
  return `app_reviews_${clean}_${chunkIndex}`;
}

/**
 * Strict Multi-Pass Sanitizer:
 * Purges and transforms all real-money, deposit, withdrawal, cash, rupees, betting keywords into gaming and performance terms.
 */
export function sanitizeReviewText(text: string, appName?: string): string {
  if (!text) return '';
  let clean = text;

  // Multi-pass regex replacements for complete safety
  clean = clean
    .replace(/\bdeposit\s+and\s+withdrawal\s+processing\s+are\s+instantaneous!?\b/gi, 'Matchmaking and table animations are silky smooth!')
    .replace(/\bdeposit\s+and\s+withdrawal\b/gi, 'table and matchmaking')
    .replace(/\bdeposits?\s+and\s+withdrawals?\b/gi, 'table and matchmaking')
    .replace(/\bwithdrawal\s+and\s+deposit\b/gi, 'matchmaking and table animations')
    .replace(/\bdeposit\s+processing\b/gi, 'match connection')
    .replace(/\bwithdrawal\s+processing\b/gi, 'animation rendering')
    .replace(/\binstant\s+withdrawal\b/gi, 'instant matchmaking')
    .replace(/\binstant\s+deposit\b/gi, 'instant table entry')
    .replace(/\bbonus\s+cash\b/gi, 'daily reward points')
    .replace(/\bbonus\s+money\b/gi, 'game points')
    .replace(/\breal\s+money\b/gi, 'game points')
    .replace(/\breal\s+cash\b/gi, 'game score')
    .replace(/\bwin\s+cash\b/gi, 'win points')
    .replace(/\badd\s+cash\b/gi, 'start round')
    .replace(/\bearn\s+money\b/gi, 'improve skill')
    .replace(/\bearning\s+money\b/gi, 'scoring points')
    .replace(/\bearnings?\b/gi, 'points')
    .replace(/\bdepositing\b/gi, 'loading')
    .replace(/\bdeposited\b/gi, 'loaded')
    .replace(/\bdeposits?\b/gi, 'rounds')
    .replace(/\bwithdrawing\b/gi, 'saving')
    .replace(/\bwithdrawn\b/gi, 'saved')
    .replace(/\bwithdrawals?\b/gi, 'sessions')
    .replace(/\bwithdraw\b/gi, 'save score')
    .replace(/\bpayouts?\b/gi, 'round scores')
    .replace(/\brupees\b/gi, 'points')
    .replace(/\binr\b/gi, 'pts')
    .replace(/\bpaisa\b/gi, 'points')
    .replace(/\b₹\s*\d+/g, 'points')
    .replace(/\b₹/g, '')
    .replace(/\bwallet\s+balance\b/gi, 'profile level')
    .replace(/\bwallet\b/gi, 'profile')
    .replace(/\bupi\s+transfer\b/gi, 'cloud sync')
    .replace(/\bbank\s+transfer\b/gi, 'cloud sync')
    .replace(/\bbetting\b/gi, 'card play')
    .replace(/\bbets?\b/gi, 'moves')
    .replace(/\bgambling\b/gi, 'gaming')
    .replace(/\binvestments?\b/gi, 'practice')
    .replace(/\binvesting\b/gi, 'playing')
    .replace(/\binvest\b/gi, 'play');

  return clean.trim();
}

/**
 * Helper to match any app from the static catalog strictly by ID or Slug.
 * Never matches by appName to prevent identifier mismatch or cross-app leakage.
 */
export function findAppInCatalog(appIdentifier: string): any {
  if (!appIdentifier) return null;
  const rawTarget = String(appIdentifier).toLowerCase().trim();
  if (!rawTarget) return null;

  const staticData = getStaticData();
  const apps = staticData.apps || staticData.mockApps || [];

  // 1. Exact match on app.id
  const byId = apps.find((a: any) => a && a.id !== undefined && a.id !== null && String(a.id).toLowerCase().trim() === rawTarget);
  if (byId) return byId;

  // 2. Exact match on app.slug
  const bySlug = apps.find((a: any) => a && a.slug && String(a.slug).toLowerCase().trim() === rawTarget);
  if (bySlug) return bySlug;

  // 3. Normalized slug match
  const slugified = rawTarget.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (slugified) {
    const byNormalizedSlug = apps.find((a: any) => a && a.slug && String(a.slug).toLowerCase().trim() === slugified);
    if (byNormalizedSlug) return byNormalizedSlug;
  }

  return null;
}

/**
 * Universal Canonical App Resolver:
 * Resolves strictly by app ID and app Slug to guarantee zero cross-app leakage.
 */
export function resolveCanonicalApp(
  appIdentifier?: string,
  appSlug?: string,
  appName?: string
): CanonicalAppResolution {
  const aliasKeys = new Set<string>();

  const cleanId = String(appIdentifier || '').trim();
  const cleanSlug = String(appSlug || '').trim();

  // Search catalog strictly by ID, then Slug
  const matchedApp = (cleanId ? findAppInCatalog(cleanId) : null) ||
    (cleanSlug ? findAppInCatalog(cleanSlug) : null);

  if (matchedApp) {
    const canonicalId = String(matchedApp.id).trim();
    const canonicalSlug = String(matchedApp.slug || matchedApp.id).trim();
    const canonicalName = String(matchedApp.name || matchedApp.title || canonicalSlug).trim();
    const packageName = String(matchedApp.package_name || '').trim();

    aliasKeys.add(canonicalId.toLowerCase());
    if (canonicalSlug) aliasKeys.add(canonicalSlug.toLowerCase());

    return {
      canonicalId,
      canonicalSlug,
      canonicalName,
      packageName,
      matchedApp,
      aliasKeys
    };
  }

  // Fallback for custom or unindexed apps
  const fallbackId = cleanId || cleanSlug || 'unknown_app';
  const fallbackSlug = cleanSlug || fallbackId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown-app';
  const fallbackName = cleanSlug || fallbackId;

  aliasKeys.add(fallbackId.toLowerCase());
  if (fallbackSlug) aliasKeys.add(fallbackSlug.toLowerCase());

  return {
    canonicalId: fallbackId,
    canonicalSlug: fallbackSlug,
    canonicalName: fallbackName,
    packageName: '',
    matchedApp: null,
    aliasKeys
  };
}

/**
 * Format date to clean standard: Day Month Year (e.g. "26 Sep 2026")
 */
export function formatReviewDate(dateInput?: string | Date | number): string {
  if (!dateInput) {
    const now = new Date();
    return `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;
  }
  if (typeof dateInput === 'string' && /^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }
  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
    }
  } catch (e) {}
  return String(dateInput);
}

export function doesReviewMatchApp(
  review: { appId?: string; appSlug?: string; appName?: string },
  targetAppId: string,
  targetAppSlug?: string
): boolean {
  if (!review) return false;
  const cleanTargetId = String(targetAppId || '').toLowerCase().trim();
  const cleanTargetSlug = String(targetAppSlug || '').toLowerCase().trim();
  if (!cleanTargetId && !cleanTargetSlug) return false;

  const resolved = resolveCanonicalApp(targetAppId, targetAppSlug);
  const revAppId = String(review.appId || '').toLowerCase().trim();
  const revAppSlug = String(review.appSlug || '').toLowerCase().trim();

  // 1. Direct matches
  if (revAppId && (revAppId === cleanTargetId || revAppId === cleanTargetSlug)) return true;
  if (revAppSlug && (revAppSlug === cleanTargetId || revAppSlug === cleanTargetSlug)) return true;

  // 2. Canonical target matches
  if (resolved.aliasKeys.has(revAppId)) return true;
  if (revAppSlug && resolved.aliasKeys.has(revAppSlug)) return true;

  // 3. Resolve review canonical app
  const revResolved = resolveCanonicalApp(review.appId, review.appSlug, review.appName);
  if (resolved.canonicalId && revResolved.canonicalId && resolved.canonicalId.toLowerCase() === revResolved.canonicalId.toLowerCase()) return true;
  if (resolved.canonicalSlug && revResolved.canonicalSlug && resolved.canonicalSlug.toLowerCase() === revResolved.canonicalSlug.toLowerCase()) return true;

  return false;
}

export async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (e) {
    clearTimeout(timer!);
    return fallback;
  }
}
