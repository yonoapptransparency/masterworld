import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { getIp, ensureSession, generateToken, verifyToken, issueClearanceNonce, consumeClearanceNonce } from '../security';
import { ENCRYPTED_LINKS } from '../../lib/secureVault';
import { vaultNode } from '../../lib/vaultNode';
import { safeDecrypt, getAesSecret } from '../crypto';
import { getFirebaseAdminDb } from '../firebase';
import { fetchStoreData } from '../../seoHelper';

export const securityRouter = express.Router();

// In-memory fast cache for resolved links (< 2ms latency for repeated requests)
const resolvedLinkCache = new Map<string, { url: string; timestamp: number }>();
const LINK_CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache

export function clearResolvedLinkCache(key?: string) {
  if (key) {
    resolvedLinkCache.delete(key.toLowerCase());
  } else {
    resolvedLinkCache.clear();
  }
}

/**
 * Validates whether a target URL is safe and valid for redirection
 */
function isValidTargetUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  const cleanLower = clean.toLowerCase();
  if (clean === '' || cleanLower === 'undefined' || cleanLower === 'null' || clean === '#') return false;
  if (cleanLower.includes('com.rummydex') || cleanLower.includes('com.example')) return false;

  // Reject circular loops to our own site or internal routes
  if (
    cleanLower.includes('rummydex.com/download/') ||
    cleanLower.includes('rummydex.com/api/') ||
    cleanLower.includes('localhost') ||
    cleanLower.includes('0.0.0.0') ||
    cleanLower.includes('127.0.0.1') ||
    cleanLower.includes('ais-dev-') ||
    cleanLower.includes('ais-pre-') ||
    cleanLower.includes('.run.app') ||
    cleanLower.includes('/download/') ||
    cleanLower.includes('/moreinfo/') ||
    cleanLower.includes('/moredetail/') ||
    cleanLower.includes('/info/') ||
    cleanLower.includes('/s/') ||
    cleanLower.includes('/app/') ||
    cleanLower.includes('/api/')
  ) return false;

  // Check valid protocol or domain
  if (!cleanLower.startsWith('http://') && !cleanLower.startsWith('https://')) {
    if (clean.includes('.') && !clean.includes(' ')) {
      return true;
    }
    return false;
  }
  return true;
}

/**
 * Helper to search for an app's destination URL inside a parsed vault object
 */
function findUrlInVaultParsed(parsed: any, keysToSearch: string[], AES_SECRET: string): string {
  if (!parsed) return '';
  const searchSet = new Set(keysToSearch.map(k => k.toLowerCase().trim()).filter(Boolean));
  const searchSetNoSep = new Set(keysToSearch.map(k => k.toLowerCase().trim().replace(/[-_ ]/g, '')).filter(Boolean));

  let foundRaw = '';

  if (Array.isArray(parsed)) {
    const item = parsed.find((i: any) => {
      const iId = (i.id || '').toLowerCase().trim();
      const iSlug = (i.slug || '').toLowerCase().trim();
      const iIdNoSep = iId.replace(/[-_ ]/g, '');
      const iSlugNoSep = iSlug.replace(/[-_ ]/g, '');
      return searchSet.has(iId) || searchSet.has(iSlug) || searchSetNoSep.has(iIdNoSep) || searchSetNoSep.has(iSlugNoSep);
    });
    if (item) {
      foundRaw = item.more_information_url || item.encrypted_link || item.download_url || item.payload || item.url || '';
    }
  } else if (parsed && typeof parsed === 'object') {
    for (const [k, v] of Object.entries(parsed)) {
      const kClean = k.toLowerCase().trim();
      const kNoSep = kClean.replace(/[-_ ]/g, '');
      if (searchSet.has(kClean) || searchSetNoSep.has(kNoSep)) {
        if (typeof v === 'string') {
          foundRaw = v;
        } else if (v && typeof v === 'object') {
          foundRaw = (v as any).more_information_url || (v as any).encrypted_link || (v as any).download_url || (v as any).payload || (v as any).url || '';
        }
        if (foundRaw) break;
      }
    }
  }

  if (foundRaw && typeof foundRaw === 'string' && foundRaw.trim().length > 0) {
    const trimmed = foundRaw.trim();
    const finalUrl = trimmed.startsWith('U2FsdGVkX1') ? safeDecrypt(trimmed, AES_SECRET) : trimmed;
    if (isValidTargetUrl(finalUrl)) {
      return finalUrl.trim();
    }
  }
  return '';
}

/**
 * Central Server-Authoritative Link Resolver
 * Looks up target destination securely without ever exposing keys or ciphertexts to the browser.
 */
export async function resolveDestinationForApp(appId: string): Promise<string> {
  if (!appId || typeof appId !== 'string') return '';
  const cleanAppId = appId.trim();
  const lowerAppId = cleanAppId.toLowerCase();

  // 1. Check in-memory fast cache
  const cached = resolvedLinkCache.get(lowerAppId);
  if (cached && Date.now() - cached.timestamp < LINK_CACHE_TTL) {
    return cached.url;
  }

  const AES_SECRET = getAesSecret();
  const searchKeys = Array.from(new Set([
    cleanAppId,
    lowerAppId,
    lowerAppId.replace(/[-_ ]+$/, ''),
    lowerAppId.replace(/[-_ ]/g, '')
  ])).filter(Boolean);

  // 2. Check local server vault (src/server/secure_vault.json)
  try {
    const serverVaultPath = path.join(process.cwd(), 'src/server/secure_vault.json');
    if (fs.existsSync(serverVaultPath)) {
      const fileData = fs.readFileSync(serverVaultPath, 'utf8');
      if (fileData && fileData.trim().length > 2) {
        const parsed = JSON.parse(fileData);
        const found = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
        if (found && isValidTargetUrl(found)) {
          resolvedLinkCache.set(lowerAppId, { url: found, timestamp: Date.now() });
          return found;
        }
      }
    }
  } catch (_) {}

  // 3. Check Firestore live vault documents
  try {
    const db = getFirebaseAdminDb();
    if (db) {
      const vaultDocs = ['sec_public_links', 'sec_links_vault_3', 'sec_vault', 'secure_links'];
      const docSnaps = await Promise.all(
        vaultDocs.map(docName => db.collection('store_data').doc(docName).get().catch(() => null))
      );
      for (const vaultSnap of docSnaps) {
        if (vaultSnap && vaultSnap.exists) {
          const data = vaultSnap.data();
          const ciphertext = data?.encryptedData || data?.encrypted_links;
          if (ciphertext) {
            const dec = safeDecrypt(ciphertext, AES_SECRET);
            if (dec) {
              try {
                const parsed = JSON.parse(dec);
                vaultNode.setPayloads(parsed);
                const foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
                if (foundUrl && isValidTargetUrl(foundUrl)) {
                  resolvedLinkCache.set(lowerAppId, { url: foundUrl, timestamp: Date.now() });
                  return foundUrl;
                }
              } catch (_) {}
            }
          }
        }
      }
    }
  } catch (_) {}

  // 4. Check vaultNode in-memory sync
  try {
    const payload = await vaultNode.getSyncPayload(cleanAppId);
    if (payload && isValidTargetUrl(payload)) {
      resolvedLinkCache.set(lowerAppId, { url: payload, timestamp: Date.now() });
      return payload;
    }
  } catch (_) {}

  // 5. Check ENCRYPTED_LINKS vault constant
  if (ENCRYPTED_LINKS) {
    const decryptedVault = safeDecrypt(ENCRYPTED_LINKS, AES_SECRET);
    if (decryptedVault) {
      try {
        const parsed = JSON.parse(decryptedVault);
        const foundUrl = findUrlInVaultParsed(parsed, searchKeys, AES_SECRET);
        if (foundUrl && isValidTargetUrl(foundUrl)) {
          resolvedLinkCache.set(lowerAppId, { url: foundUrl, timestamp: Date.now() });
          return foundUrl;
        }
      } catch (_) {}
    }
  }

  // 6. Check Firestore store_data collection for apps
  try {
    const storeData = await fetchStoreData();
    const apps = storeData?.apps || [];
    const matched = apps.find((a: any) => {
      const sId = (a.id || '').toLowerCase().trim();
      const sSlug = (a.slug || '').toLowerCase().trim();
      return searchKeys.includes(sId) || searchKeys.includes(sSlug);
    });

    if (matched) {
      const rawUrl = matched.more_information_url || matched.encrypted_link || matched.download_url || matched.url;
      if (rawUrl && typeof rawUrl === 'string') {
        const dec = rawUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(rawUrl, AES_SECRET) : rawUrl;
        if (isValidTargetUrl(dec)) {
          resolvedLinkCache.set(lowerAppId, { url: dec.trim(), timestamp: Date.now() });
          return dec.trim();
        }
      }
    }
  } catch (_) {}

  return '';
}

/**
 * Sends an anonymous zero-referrer bounce HTML page with strict security headers
 */
function sendAnonymousBouncePage(res: express.Response, targetUrl: string) {
  let finalUrl = targetUrl.trim();
  if (!finalUrl.toLowerCase().startsWith('http://') && !finalUrl.toLowerCase().startsWith('https://')) {
    finalUrl = 'https://' + finalUrl;
  }

  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'");

  const bounceHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <meta http-equiv="refresh" content="0;url=${finalUrl}">
    <title>Connecting...</title>
    <style>
      body { background: #09090b; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
      .container { text-align: center; max-width: 400px; padding: 2rem; }
      .loader { width: 36px; height: 36px; border: 3px solid #27272a; border-bottom-color: #10b981; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 0.8s linear infinite; margin-bottom: 1rem; }
      .text { color: #a1a1aa; font-size: 0.875rem; font-weight: 500; }
      @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="loader"></div>
      <div class="text">Connecting to destination...</div>
    </div>
    <script>
      setTimeout(function() { window.location.replace("${finalUrl}"); }, 10);
    </script>
  </body>
</html>`;

  return res.status(200).send(bounceHtml);
}

/**
 * @route   GET /api/v1/clearance/start
 * @route   GET /api/v1/_chal
 * @desc    Initiates security challenge and returns a signed stateless challenge nonce
 */
securityRouter.get(['/api/v1/clearance/start', '/api/v1/_chal'], (req, res) => {
  const appId = (req.query.appId || req.query.id || '') as string;
  const sid = ensureSession(req, res);
  const realNonce = crypto.randomBytes(16).toString('hex');
  const difficulty = "000"; // Moderate PoW (~4096 SHA-256 iterations, ~15-40ms in browser)
  const expiry = Date.now() + 90000; // 90 seconds lifetime
  const secret = getAesSecret();

  const signature = crypto.createHmac('sha256', secret)
    .update(`${realNonce}:${sid}:${difficulty}:${expiry}:${appId.toLowerCase().trim()}`)
    .digest('hex').substring(0, 32);

  const statelessNonce = `${realNonce}.${expiry}.${encodeURIComponent(appId.toLowerCase().trim())}.${signature}`;

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('X-Session-ID', sid);
  res.json({ nonce: statelessNonce, difficulty, sid });
});

/**
 * @route   POST /api/v1/clearance/complete
 * @route   POST /api/v1/_proc
 * @desc    Verifies challenge solution and issues single-use clearance nonce
 */
securityRouter.post(['/api/v1/clearance/complete', '/api/v1/_proc'], async (req, res) => {
  const { nonce, solution, fingerprint, appId, sid: clientSid } = req.body;
  const ip = getIp(req);
  const cookieSid = req.cookies?.["__Host-sid"] || req.cookies?.["sid"];

  if (!nonce || solution === undefined || !appId) {
    return res.status(400).json({ error: 'Incomplete security context' });
  }

  // 1. Verify stateless challenge format
  const parts = nonce.split('.');
  if (parts.length < 3) {
    return res.status(403).json({ error: 'Challenge invalid format' });
  }

  let realNonce = '';
  let expiry = '';
  let boundAppId = '';
  let signature = '';

  if (parts.length === 4) {
    [realNonce, expiry, boundAppId, signature] = parts;
    boundAppId = decodeURIComponent(boundAppId);
  } else {
    [realNonce, expiry, signature] = parts;
  }

  const difficulty = parts.length === 4 ? "000" : "0";
  const secret = getAesSecret();

  if (Date.now() > Number(expiry)) {
    return res.status(403).json({ error: 'Challenge expired. Please try again.' });
  }

  // Verify HMAC signature
  const candidateSids = Array.from(new Set([clientSid, cookieSid].filter(Boolean))) as string[];
  const matchedSid = candidateSids.find(s => {
    if (parts.length === 4) {
      const sig = crypto.createHmac('sha256', secret)
        .update(`${realNonce}:${s}:${difficulty}:${expiry}:${(boundAppId || appId).toLowerCase().trim()}`)
        .digest('hex').substring(0, 32);
      return sig === signature;
    } else {
      const sig = crypto.createHmac('sha256', secret)
        .update(`${realNonce}:${s}:${difficulty}:${expiry}`)
        .digest('hex').substring(0, 16);
      return sig === signature;
    }
  });

  if (!matchedSid && candidateSids.length > 0) {
    return res.status(403).json({ error: 'Challenge signature verification failed.' });
  }

  const sessionForIssuance = matchedSid || clientSid || cookieSid || 'sec_session';

  // 2. PoW verification
  const check = crypto.createHash('sha256').update(nonce + solution).digest('hex');
  if (!check.startsWith(difficulty)) {
    return res.status(403).json({ error: 'Proof of work verification failed.' });
  }

  // 3. Issue atomic single-use clearance nonce
  const oneTimeNonce = issueClearanceNonce(appId, sessionForIssuance, ip, fingerprint || '');
  const redirectUrl = `/api/v1/clearance/redirect?nonce=${oneTimeNonce}&appId=${encodeURIComponent(appId)}`;
  const token = generateToken(ip, sessionForIssuance, fingerprint || '', appId);

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.json({
    success: true,
    nonce: oneTimeNonce,
    redirectUrl,
    token
  });
});

/**
 * @route   GET /api/v1/clearance/redirect
 * @desc    Server-authoritative clearance destination redirection with atomic single-use nonce
 */
securityRouter.get('/api/v1/clearance/redirect', async (req, res) => {
  const nonce = (req.query.nonce || req.query.n) as string;
  const appId = (req.query.appId || req.query.id) as string;
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"] || req.cookies?.["sid"] || (req.query.sid as string);

  if (!appId) {
    return res.status(400).send("<h1>400 Bad Request</h1><p>Missing application identifier.</p>");
  }

  if (!nonce) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Security Clearance Required - RummyDex</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
        <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;">
          <div style="text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #ef4444; margin-bottom: 0.5rem;">Access Denied</h2>
            <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">Direct or unauthenticated access is forbidden. Please complete the security clearance check from the app page.</p>
            <a href="/app/${encodeURIComponent(appId)}" style="display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;">Return to App Page</a>
          </div>
        </body>
      </html>
    `);
  }

  // Atomically consume single-use nonce (guarantees zero replay)
  const validation = consumeClearanceNonce(nonce, appId, sid || '', ip);
  if (!validation.valid) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Clearance Expired - RummyDex</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
        <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;">
          <div style="text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #f59e0b; margin-bottom: 0.5rem;">Session Expired or Already Used</h2>
            <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">${validation.reason || 'Your single-use clearance token has expired or already been consumed.'}</p>
            <a href="/app/${encodeURIComponent(appId)}" style="display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;">Start New Verification</a>
          </div>
        </body>
      </html>
    `);
  }

  // Resolve target URL exclusively on the server
  const targetUrl = await resolveDestinationForApp(appId);
  if (targetUrl) {
    return sendAnonymousBouncePage(res, targetUrl);
  }

  return res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Link Not Configured - RummyDex</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;">
        <div style="text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;">Link Not Available</h2>
          <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">The download link for this application has not been configured yet. Please check back later.</p>
          <a href="/app/${encodeURIComponent(appId)}" style="display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;">Go Back</a>
        </div>
      </body>
    </html>
  `);
});

/**
 * @route   GET /api/v1/moreinfo-resolve
 * @desc    Backward-compatible resolver
 */
securityRouter.get("/api/v1/moreinfo-resolve", async (req, res) => {
  const token = (req.query.token || req.query.t) as string;
  const appId = (req.query.id || req.query.appId) as string;
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"] || (req.query.sid as string) || '';
  const fingerprint = (req.query.fp as string) || '';

  if (!appId) {
    return res.status(400).send("<h1>400 Bad Request</h1><p>Missing application identifier.</p>");
  }

  // Verify token if provided
  if (token && !verifyToken(token, ip, sid, fingerprint, appId)) {
    console.warn(`[SECURITY] Token verification failed for appId: ${appId}`);
  }

  const targetUrl = await resolveDestinationForApp(appId);
  if (targetUrl) {
    return sendAnonymousBouncePage(res, targetUrl);
  }

  return res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Link Not Configured - RummyDex</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;">
        <div style="text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;">Link Not Available</h2>
          <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">The download link for this application has not been configured yet.</p>
          <a href="/app/${encodeURIComponent(appId)}" style="display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;">Go Back</a>
        </div>
      </body>
    </html>
  `);
});

/**
 * @route   GET /api/v1/link-check
 * @desc    Checks if an app has a configured link in the vault without returning any URLs
 */
securityRouter.get('/api/v1/link-check', async (req, res) => {
  const appId = req.query.id as string;
  if (!appId) return res.json({ configured: false });

  try {
    const targetUrl = await resolveDestinationForApp(appId);
    return res.json({ configured: !!targetUrl });
  } catch (_) {
    return res.json({ configured: false });
  }
});
