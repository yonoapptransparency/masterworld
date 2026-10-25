import { ENCRYPTED_LINKS } from '../../lib/secureVault.js';
import { decryptVaultValue } from '../crypto.js';

export interface LinkResolutionResult {
  url: string | null;
  tier: 'T0_RAM' | 'T1_VAULT' | 'T2_BACKUP' | 'T3_SEC_VAULT' | 'T4_STORE_DATA' | 'NONE';
}

const B64_FIREBASE_FALLBACK =
  'ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0K';

const ramCache = new Map<string, string>();
let t1Loaded = false;
let t2Loaded = false;
let cachedTurnstileSecretFromStore: { secret: string; expiresAt: number } | null = null;

function normalizeIdentifier(id: string): string {
  return String(id || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Validates that a resolved URL is an external http(s) destination and never
 * points back to rummydex.com, /moreinfo, or /gateway (loop guard per §5.8).
 */
export function isValidDestinationUrl(rawUrl: unknown): rawUrl is string {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'rummydex.com' ||
      host === 'www.rummydex.com' ||
      host.endsWith('.rummydex.com')
    ) {
      return false;
    }
    const pathname = parsed.pathname.toLowerCase();
    if (pathname.startsWith('/moreinfo') || pathname.startsWith('/gateway')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function setRamVaultLink(key: string, url: string): void {
  if (!key || !isValidDestinationUrl(url)) return;
  const cleanUrl = url.trim();
  ramCache.set(String(key).trim(), cleanUrl);
  ramCache.set(String(key).trim().toLowerCase(), cleanUrl);
  const norm = normalizeIdentifier(key);
  if (norm) ramCache.set(norm, cleanUrl);
}

export function primeRamVaultMap(linksMap: Record<string, string>): void {
  if (!linksMap || typeof linksMap !== 'object') return;
  for (const [k, v] of Object.entries(linksMap)) {
    if (isValidDestinationUrl(v)) {
      setRamVaultLink(k, v);
    }
  }
}

function lookupInMap(map: Map<string, string>, identifier: string): string | null {
  const exact = map.get(identifier) || map.get(identifier.toLowerCase());
  if (exact && isValidDestinationUrl(exact)) return exact;
  const norm = normalizeIdentifier(identifier);
  if (norm) {
    const byNorm = map.get(norm);
    if (byNorm && isValidDestinationUrl(byNorm)) return byNorm;
  }
  return null;
}

function lookupInRecord(record: Record<string, unknown>, identifier: string): string | null {
  if (!record || typeof record !== 'object') return null;
  const direct = record[identifier] ?? record[identifier.toLowerCase()];
  if (isValidDestinationUrl(direct)) return direct.trim();

  const targetNorm = normalizeIdentifier(identifier);
  if (!targetNorm) return null;

  for (const [k, v] of Object.entries(record)) {
    if (normalizeIdentifier(k) === targetNorm && isValidDestinationUrl(v)) {
      return v.trim();
    }
  }
  return null;
}

async function decodeLinkField(
  rawVal: unknown,
  env?: Record<string, string | undefined>
): Promise<string | null> {
  if (!rawVal || typeof rawVal !== 'string') return null;
  const trimmed = rawVal.trim();
  if (!trimmed) return null;
  if (isValidDestinationUrl(trimmed)) return trimmed;

  const decrypted = await decryptVaultValue(trimmed, env);
  if (decrypted && isValidDestinationUrl(decrypted)) {
    return decrypted.trim();
  }
  return null;
}

async function normalizeVaultPayloadToMap(
  parsed: unknown,
  env?: Record<string, string | undefined>
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (!parsed || typeof parsed !== 'object') return out;

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const obj = item as Record<string, unknown>;
      const idStr = String(obj.id ?? '').trim();
      const slugStr = String(obj.slug ?? '').trim();
      const candidates = [
        obj.more_information_url,
        obj.download_url,
        obj.link,
        obj.encrypted_link,
        obj.url,
      ];
      for (const c of candidates) {
        const resolved = await decodeLinkField(c, env);
        if (resolved) {
          if (idStr) out[idStr] = resolved;
          if (slugStr) out[slugStr] = resolved;
          break;
        }
      }
    }
    return out;
  }

  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    const resolved = await decodeLinkField(v, env);
    if (resolved) {
      out[k] = resolved;
    }
  }
  return out;
}

async function loadT1Vault(
  env?: Record<string, string | undefined>
): Promise<Record<string, string>> {
  const vaultCipher: string = String(ENCRYPTED_LINKS || '').trim();
  if (!vaultCipher) {
    return {};
  }
  const plain = await decryptVaultValue(vaultCipher, env);
  if (!plain) return {};
  try {
    const parsed = JSON.parse(plain);
    const mapObj = await normalizeVaultPayloadToMap(parsed, env);
    if (!t1Loaded && Object.keys(mapObj).length > 0) {
      t1Loaded = true;
      primeRamVaultMap(mapObj);
    }
    return mapObj;
  } catch {
    // Ignore malformed JSON
  }
  return {};
}

async function resolveFromT2Backup(
  identifier: string,
  env?: Record<string, string | undefined>
): Promise<string | null> {
  try {
    // Dynamic import so Cloudflare Workers/Pages without Node fs never fail at module load
    if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
      return null;
    }
    const fsMod = await import('fs').catch(() => null);
    const pathMod = await import('path').catch(() => null);
    if (!fsMod || !pathMod) return null;

    const backupPath = pathMod.join(process.cwd(), 'src', 'lib', 'public_backup.json');
    if (!fsMod.existsSync(backupPath)) return null;
    const raw = fsMod.readFileSync(backupPath, 'utf-8');
    const data = JSON.parse(raw);

    if (
      data?.settings?.turnstile_secret_key &&
      typeof data.settings.turnstile_secret_key === 'string'
    ) {
      cachedTurnstileSecretFromStore = {
        secret: data.settings.turnstile_secret_key.trim(),
        expiresAt: Date.now() + 300_000,
      };
    }

    // 1. Check encrypted_links inside public_backup.json if present
    if (data?.encrypted_links && typeof data.encrypted_links === 'string') {
      const decMapStr = await decryptVaultValue(data.encrypted_links, env);
      if (decMapStr) {
        try {
          const parsed = JSON.parse(decMapStr);
          const mapObj = await normalizeVaultPayloadToMap(parsed, env);
          primeRamVaultMap(mapObj);
          const found = lookupInRecord(mapObj, identifier);
          if (found) {
            setRamVaultLink(identifier, found);
            return found;
          }
        } catch {
          // Continue to apps array
        }
      }
    }

    // 2. Check apps array inside public_backup.json
    const apps: Record<string, unknown>[] = Array.isArray(data?.apps) ? data.apps : [];
    const targetNorm = normalizeIdentifier(identifier);

    for (const app of apps) {
      const idStr = String(app.id ?? '');
      const slugStr = String(app.slug ?? '');
      const nameStr = String(app.name ?? '');
      const matched =
        idStr === identifier ||
        slugStr.toLowerCase() === identifier.toLowerCase() ||
        (targetNorm &&
          (normalizeIdentifier(idStr) === targetNorm ||
            normalizeIdentifier(slugStr) === targetNorm ||
            normalizeIdentifier(nameStr) === targetNorm));

      if (matched) {
        const candidates = [
          app.more_information_url,
          app.download_url,
          app.link,
          app.encrypted_link,
        ];
        for (const candidate of candidates) {
          const resolved = await decodeLinkField(candidate, env);
          if (resolved) {
            setRamVaultLink(identifier, resolved);
            if (idStr) setRamVaultLink(idStr, resolved);
            if (slugStr) setRamVaultLink(slugStr, resolved);
            return resolved;
          }
        }
      }
    }

    if (!t2Loaded && apps.length > 0) {
      t2Loaded = true;
    }
  } catch {
    // Ignore filesystem errors in edge environments without fs
  }
  return null;
}

function decodeBase64Json(b64: string): Record<string, any> | null {
  try {
    const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
    const jsonStr =
      typeof atob === 'function'
        ? atob(clean)
        : typeof Buffer !== 'undefined'
          ? Buffer.from(clean, 'base64').toString('utf-8')
          : '';
    if (!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function getFirebaseConfig(env?: Record<string, string | undefined>): {
  projectId: string;
  apiKey: string;
  databaseId: string;
} | null {
  const procEnv =
    typeof process !== 'undefined' && process.env
      ? (process.env as Record<string, string | undefined>)
      : {};

  let projectId =
    env?.FIREBASE_PROJECT_ID ||
    env?.VITE_FIREBASE_PROJECT_ID ||
    procEnv.FIREBASE_PROJECT_ID ||
    procEnv.VITE_FIREBASE_PROJECT_ID ||
    '';
  let apiKey =
    env?.FIREBASE_API_KEY ||
    env?.VITE_FIREBASE_API_KEY ||
    procEnv.FIREBASE_API_KEY ||
    procEnv.VITE_FIREBASE_API_KEY ||
    '';
  let databaseId =
    env?.FIREBASE_DATABASE_ID ||
    env?.VITE_FIREBASE_DATABASE_ID ||
    procEnv.FIREBASE_DATABASE_ID ||
    procEnv.VITE_FIREBASE_DATABASE_ID ||
    '';

  if (!projectId || !apiKey || !databaseId) {
    const fallback = decodeBase64Json(B64_FIREBASE_FALLBACK);
    if (fallback) {
      projectId = projectId || String(fallback.projectId || '');
      apiKey = apiKey || String(fallback.apiKey || '');
      databaseId =
        databaseId ||
        String(
          fallback.firestoreDatabaseId ||
            'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a'
        );
    }
  }

  if (!projectId || !apiKey) return null;
  return {
    projectId: projectId.trim(),
    apiKey: apiKey.trim(),
    databaseId: (databaseId || '(default)').trim(),
  };
}

let firestoreQuotaCooldownUntil = 0;

async function fetchFirestoreDocWithTimeout(
  collectionAndDoc: string,
  timeoutMs: number,
  env?: Record<string, string | undefined>
): Promise<Record<string, any> | null> {
  if (Date.now() < firestoreQuotaCooldownUntil) {
    return null;
  }

  const cfg = getFirebaseConfig(env);
  if (!cfg) return null;

  const dbCandidates = Array.from(
    new Set([
      cfg.databaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a',
      '(default)',
    ])
  );

  for (const dbId of dbCandidates) {
    if (Date.now() < firestoreQuotaCooldownUntil) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${encodeURIComponent(
        dbId
      )}/documents/${collectionAndDoc}?key=${cfg.apiKey}`;
      const res = await fetch(url, { signal: controller.signal });
      if (res.status === 429 || res.status === 403) {
        firestoreQuotaCooldownUntil = Date.now() + 60_000;
        return null;
      }
      if (res.ok) {
        const json = (await res.json()) as Record<string, any>;
        if (json?.fields) return json;
      }
      if (res.status === 404 && dbId === cfg.databaseId) {
        // Document genuinely does not exist in primary database
        return null;
      }
    } catch {
      // Try next databaseId candidate if network failed
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function resolveFromT3SecVault(
  identifier: string,
  env?: Record<string, string | undefined>
): Promise<string | null> {
  if (Date.now() < firestoreQuotaCooldownUntil) return null;
  const docPaths = ['store_data/sec_vault', 'sec_vault/links', 'store_data/secure_links'];
  for (const docPath of docPaths) {
    if (Date.now() < firestoreQuotaCooldownUntil) break;
    const doc = await fetchFirestoreDocWithTimeout(docPath, 1500, env);
    if (!doc?.fields) continue;

    const cipher =
      doc.fields?.encrypted_links?.stringValue ||
      doc.fields?.ciphertext?.stringValue ||
      doc.fields?.vault?.stringValue;
    if (cipher && typeof cipher === 'string') {
      const plain = await decryptVaultValue(cipher, env);
      if (plain) {
        try {
          const parsed = JSON.parse(plain);
          const mapObj = await normalizeVaultPayloadToMap(parsed, env);
          primeRamVaultMap(mapObj);
          const found = lookupInRecord(mapObj, identifier);
          if (found) return found;
        } catch {
          // Ignore parse failure
        }
      }
    }

    if (doc.fields?.items?.arrayValue?.values) {
      const items = parseFirestoreValue(doc.fields.items);
      const mapObj = await normalizeVaultPayloadToMap(items, env);
      primeRamVaultMap(mapObj);
      const found = lookupInRecord(mapObj, identifier);
      if (found) return found;
    }
  }
  return null;
}

function parseFirestoreValue(valObj: any): any {
  if (!valObj || typeof valObj !== 'object') return undefined;
  if ('stringValue' in valObj) return valObj.stringValue;
  if ('integerValue' in valObj) return Number(valObj.integerValue);
  if ('doubleValue' in valObj) return Number(valObj.doubleValue);
  if ('booleanValue' in valObj) return Boolean(valObj.booleanValue);
  if ('nullValue' in valObj) return null;
  if ('mapValue' in valObj) {
    const fields = valObj.mapValue?.fields || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = parseFirestoreValue(v);
    }
    return out;
  }
  if ('arrayValue' in valObj) {
    const values = valObj.arrayValue?.values || [];
    return values.map(parseFirestoreValue);
  }
  return undefined;
}

async function resolveFromT4StoreData(
  identifier: string,
  env?: Record<string, string | undefined>
): Promise<string | null> {
  if (Date.now() < firestoreQuotaCooldownUntil) return null;
  const chunkNames = [
    'store_data/secure_links',
    'store_data/apps_chunk_0',
    'store_data/apps_chunk_1',
    'store_data/apps_chunk_2',
    'store_data/apps_chunk_3',
    'store_data/apps_chunk_4',
    'store_data/apps_chunk_5',
    'store_data/apps_chunk_6',
    'store_data/apps_chunk_7',
  ];
  const targetNorm = normalizeIdentifier(identifier);

  for (const chunkName of chunkNames) {
    if (Date.now() < firestoreQuotaCooldownUntil) break;
    const doc = await fetchFirestoreDocWithTimeout(chunkName, 1500, env);
    if (!doc?.fields) continue;

    if (doc.fields.links?.mapValue?.fields) {
      const mapObj = parseFirestoreValue(doc.fields.links);
      const normalizedMap = await normalizeVaultPayloadToMap(mapObj, env);
      primeRamVaultMap(normalizedMap);
      const found = lookupInRecord(normalizedMap, identifier);
      if (found) {
        setRamVaultLink(identifier, found);
        return found;
      }
    }

    const items =
      parseFirestoreValue(doc.fields.items) || parseFirestoreValue(doc.fields.apps);
    if (Array.isArray(items)) {
      for (const app of items) {
        if (!app || typeof app !== 'object') continue;
        const idStr = String(app.id ?? '');
        const slugStr = String(app.slug ?? '');
        const nameStr = String(app.name ?? '');
        const matched =
          idStr === identifier ||
          slugStr.toLowerCase() === identifier.toLowerCase() ||
          (targetNorm &&
            (normalizeIdentifier(idStr) === targetNorm ||
              normalizeIdentifier(slugStr) === targetNorm ||
              normalizeIdentifier(nameStr) === targetNorm));

        if (matched) {
          const candidates = [
            app.more_information_url,
            app.download_url,
            app.link,
            app.encrypted_link,
            app.url,
          ];
          for (const candidate of candidates) {
            const resolved = await decodeLinkField(candidate, env);
            if (resolved) {
              setRamVaultLink(identifier, resolved);
              if (idStr) setRamVaultLink(idStr, resolved);
              if (slugStr) setRamVaultLink(slugStr, resolved);
              return resolved;
            }
          }
        }
      }
    }
  }
  return null;
}

/**
 * Resolves all candidate Cloudflare Turnstile secret keys across:
 * 1. Admin Settings `turnstile_secret_key` (from local `public_backup.json` or Firestore `store_data/settings`)
 * 2. Environment variable `TURNSTILE_SECRET_KEY`
 * Putting Admin Settings first matches the client-side `useTurnstileVerification.ts` site key priority
 * (`settings?.turnstile_site_key` before `VITE_TURNSTILE_SITE_KEY`), while keeping env var as fallback.
 */
export async function getCandidateTurnstileSecrets(
  env?: Record<string, string | undefined>
): Promise<string[]> {
  const procEnv =
    typeof process !== 'undefined' && process.env
      ? (process.env as Record<string, string | undefined>)
      : {};
  const secrets: string[] = [];
  const addSecret = (s: unknown) => {
    if (typeof s === 'string' && s.trim() && !secrets.includes(s.trim())) {
      secrets.push(s.trim());
    }
  };

  // 1. Check cached store secret first
  if (
    cachedTurnstileSecretFromStore &&
    cachedTurnstileSecretFromStore.secret &&
    Date.now() < cachedTurnstileSecretFromStore.expiresAt
  ) {
    addSecret(cachedTurnstileSecretFromStore.secret);
    addSecret(env?.TURNSTILE_SECRET_KEY);
    addSecret(procEnv.TURNSTILE_SECRET_KEY);
    return secrets;
  }

  // 2. Try reading from local public_backup.json (Node server)
  try {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      const fsMod = await import('fs').catch(() => null);
      const pathMod = await import('path').catch(() => null);
      if (fsMod && pathMod) {
        const backupPath = pathMod.join(process.cwd(), 'src', 'lib', 'public_backup.json');
        if (fsMod.existsSync(backupPath)) {
          const raw = fsMod.readFileSync(backupPath, 'utf-8');
          const parsed = JSON.parse(raw);
          const sec = parsed?.settings?.turnstile_secret_key;
          if (typeof sec === 'string' && sec.trim()) {
            cachedTurnstileSecretFromStore = {
              secret: sec.trim(),
              expiresAt: Date.now() + 300_000,
            };
            addSecret(sec);
            addSecret(env?.TURNSTILE_SECRET_KEY);
            addSecret(procEnv.TURNSTILE_SECRET_KEY);
            return secrets;
          }
        }
      }
    }
  } catch {
    // Ignore local fs errors on Edge
  }

  // 3. Fallback on Cloudflare Edge: query Firestore store_data/settings if not in quota cooldown
  if (Date.now() >= firestoreQuotaCooldownUntil) {
    try {
      const doc = await fetchFirestoreDocWithTimeout('store_data/settings', 1200, env);
      const sec = doc?.fields?.turnstile_secret_key?.stringValue;
      if (typeof sec === 'string' && sec.trim()) {
        cachedTurnstileSecretFromStore = {
          secret: sec.trim(),
          expiresAt: Date.now() + 300_000,
        };
        addSecret(sec);
      }
    } catch {
      // Ignore
    }
  }

  addSecret(env?.TURNSTILE_SECRET_KEY);
  addSecret(procEnv.TURNSTILE_SECRET_KEY);

  return secrets;
}

/**
 * Resolves an app identifier (ID or slug) across T0 -> T1 -> T2 -> T3 -> T4
 * per §5.8 of MORE_INFO_SECURITY_ARCHITECTURE.md v11.1.
 */
export async function resolveDestinationUrl(
  appId: string,
  env?: Record<string, string | undefined>
): Promise<LinkResolutionResult> {
  const cleanId = String(appId || '').trim();
  if (!cleanId) return { url: null, tier: 'NONE' };

  // T0: RAM Cache
  const t0 = lookupInMap(ramCache, cleanId);
  if (t0) {
    return { url: t0, tier: 'T0_RAM' };
  }

  // T1: ENCRYPTED_LINKS from src/lib/secureVault.ts
  const t1Map = await loadT1Vault(env);
  const t1 = lookupInRecord(t1Map, cleanId);
  if (t1) {
    setRamVaultLink(cleanId, t1);
    return { url: t1, tier: 'T1_VAULT' };
  }

  // T2: src/lib/public_backup.json
  const t2 = await resolveFromT2Backup(cleanId, env);
  if (t2) {
    return { url: t2, tier: 'T2_BACKUP' };
  }

  // T3: Firestore sec_vault (1.5s timeout)
  const t3 = await resolveFromT3SecVault(cleanId, env);
  if (t3) {
    setRamVaultLink(cleanId, t3);
    return { url: t3, tier: 'T3_SEC_VAULT' };
  }

  // T4: Firestore store_data (1.5s timeout)
  const t4 = await resolveFromT4StoreData(cleanId, env);
  if (t4) {
    setRamVaultLink(cleanId, t4);
    return { url: t4, tier: 'T4_STORE_DATA' };
  }

  return { url: null, tier: 'NONE' };
}
