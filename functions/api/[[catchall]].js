import { handleSessionInit, handleSessionClearance } from '../../src/server/security/gateCore';
import { HARD_RESPONSE_STATUS, HARD_RESPONSE_BODY } from '../../src/lib/gateConfig';
import { resolveAppSlug } from '../../src/lib/slugResolver';
import staticData from '../../src/lib/staticData.json';

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSign(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function timingSafeEqualStr(a, b) {
  const strA = String(a || '');
  const strB = String(b || '');
  const len = Math.max(strA.length, strB.length);
  let diff = strA.length ^ strB.length;
  for (let i = 0; i < len; i++) {
    diff |= (strA.charCodeAt(i) || 0) ^ (strB.charCodeAt(i) || 0);
  }
  return diff === 0;
}

async function hmacVerify(secret, message, expectedSig) {
  if (!secret || !expectedSig) return false;
  const actualSig = await hmacSign(secret, message);
  return timingSafeEqualStr(actualSig, expectedSig);
}

function parseAdminConfig(env) {
  const configuredEmail = (
    env?.ADMIN_EMAIL ||
    env?.VITE_ADMIN_EMAIL ||
    ''
  ).toLowerCase().trim();

  const configuredPassword = (
    env?.ADMIN_PASSWORD ||
    env?.VITE_ADMIN_PASSWORD ||
    ''
  ).trim();

  return { configuredEmail, configuredPassword };
}

async function getAdminSessionSecret(env, configuredPassword) {
  return (
    env?.ADMIN_SESSION_SECRET ||
    env?.SESSION_SECRET ||
    (configuredPassword
      ? await sha256Hex(configuredPassword + '_salt_rummydex')
      : '')
  );
}

async function generateAdminToken(email, sessionSecret) {
  const payload = {
    email,
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 55 * 60 * 1000,
  };
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = btoa(unescape(encodeURIComponent(payloadJson)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const signature = await hmacSign(sessionSecret, payloadB64);
  return `adm_v1.${payloadB64}.${signature}`;
}

async function verifyAdminToken(token, sessionSecret, configuredEmail) {
  if (!token) return { valid: false };
  try {
    const raw = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    if (raw.startsWith('adm_v1.')) {
      const parts = raw.split('.');
      if (parts.length === 3) {
        const [, payloadB64, sig] = parts;
        const validSig = await hmacVerify(sessionSecret, payloadB64, sig);
        if (validSig) {
          const binary = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
          const payload = JSON.parse(decodeURIComponent(escape(binary)));
          if (payload && payload.exp > Date.now() && payload.role === 'admin') {
            if (!configuredEmail || payload.email.toLowerCase() === configuredEmail) {
              return { valid: true, email: payload.email };
            }
          }
        }
      }
    }
  } catch (_) {}
  return { valid: false };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const headers = {};
  request.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  const rawBody = request.method === 'POST' ? await request.text().catch(() => '') : '';
  const ctx = {
    method: request.method,
    path: url.pathname,
    headers,
    rawBody,
    ip: headers['cf-connecting-ip'] || (headers['x-forwarded-for'] || '').split(',')[0].trim() || '0.0.0.0',
    cf: request.cf ? {
      asn: request.cf.asn ? Number(request.cf.asn) : undefined,
      asOrganization: request.cf.asOrganization,
      httpProtocol: request.cf.httpProtocol,
      tlsVersion: request.cf.tlsVersion,
    } : undefined,
    adapter: 'cloudflare',
    env: { NODE_ENV: 'production', ...(env || {}) },
  };

  // 1. Mobile Clearance Gateway Routes (§5.1)
  if (url.pathname === '/api/v1/app/session-init') {
    const out = await handleSessionInit(ctx);
    return new Response(out.body, { status: out.status, headers: out.headers });
  }
  if (url.pathname === '/api/v1/app/session-clearance') {
    const out = await handleSessionClearance(ctx);
    return new Response(out.body, { status: out.status, headers: out.headers });
  }

  // 2. Admin Authentication - Login (/api/v1/admin/login & /api/v1/admin/auth/login)
  if (url.pathname === '/api/v1/admin/login' || url.pathname === '/api/v1/admin/auth/login') {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    let body = {};
    try { body = JSON.parse(rawBody || '{}'); } catch (_) {}
    const { email, password } = body;
    const { configuredEmail, configuredPassword } = parseAdminConfig(env);
    const sessionSecret = await getAdminSessionSecret(env, configuredPassword);

    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'Email and password are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const inputPass = String(password).trim();

    if (!configuredEmail) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'ADMIN_EMAIL is not configured in Cloudflare environment variables.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    if (!configuredPassword) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'ADMIN_PASSWORD is not configured in Cloudflare environment variables.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    if (!timingSafeEqualStr(normalizedEmail, configuredEmail)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid administrator credentials.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const inputHash = await sha256Hex(inputPass);
    const isDirectMatch = timingSafeEqualStr(inputPass, configuredPassword);
    const isHashMatch = timingSafeEqualStr(inputHash, configuredPassword.toLowerCase());

    if (!isDirectMatch && !isHashMatch) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid administrator credentials.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const token = await generateAdminToken(normalizedEmail, sessionSecret);
    return new Response(JSON.stringify({
      ok: true,
      success: true,
      token,
      session: {
        idToken: token,
        refreshToken: 'SERVER_SESSION',
        email: normalizedEmail,
        expiresAt: Date.now() + 55 * 60 * 1000,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  // 3. Admin Authentication - Session Verification
  if (
    url.pathname === '/api/v1/admin/verify' ||
    url.pathname === '/api/v1/admin/verify-session' ||
    url.pathname === '/api/v1/admin/auth/me' ||
    url.pathname === '/api/v1/admin/auth/check-session'
  ) {
    let body = {};
    try { body = JSON.parse(rawBody || '{}'); } catch (_) {}
    const authHeader = headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || body?.idToken || body?.token;
    const { configuredEmail, configuredPassword } = parseAdminConfig(env);
    const sessionSecret = await getAdminSessionSecret(env, configuredPassword);
    const { valid, email } = await verifyAdminToken(token, sessionSecret, configuredEmail);

    if (valid) {
      return new Response(JSON.stringify({
        authorized: true,
        valid: true,
        authenticated: true,
        role: 'admin',
        email,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    return new Response(JSON.stringify({ authorized: false, valid: false, error: 'Unauthorized session.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store, private' },
    });
  }

  // 4. Admin Authentication - Refresh Token
  if (url.pathname === '/api/v1/admin/refresh-token') {
    let body = {};
    try { body = JSON.parse(rawBody || '{}'); } catch (_) {}
    const authHeader = headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || body?.idToken || body?.token;
    const { configuredEmail, configuredPassword } = parseAdminConfig(env);
    const sessionSecret = await getAdminSessionSecret(env, configuredPassword);
    const { valid, email } = await verifyAdminToken(token, sessionSecret, configuredEmail);

    if (valid && email) {
      const newToken = await generateAdminToken(email, sessionSecret);
      return new Response(JSON.stringify({ token: newToken, expiresAt: Date.now() + 55 * 60 * 1000 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid or expired token.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  // 5. Admin Authentication - Logout
  if (url.pathname === '/api/v1/admin/logout' || url.pathname === '/api/v1/admin/auth/logout') {
    return new Response(JSON.stringify({ ok: true, success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  // 6. Admin AI Review Studio Edge Endpoints (/api/v1/admin/community/aistudio-settings & aistudio-gemini)
  if (
    url.pathname === '/api/v1/admin/community/aistudio-settings' ||
    url.pathname === '/api/v1/admin/community/aistudio-gemini'
  ) {
    const authHeader = headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const { configuredEmail, configuredPassword } = parseAdminConfig(env);
    const sessionSecret = await getAdminSessionSecret(env, configuredPassword);
    const authCheck = await verifyAdminToken(token, sessionSecret, configuredEmail);
    if (!authCheck.valid) {
      return new Response(JSON.stringify({
        success: false,
        ok: false,
        error: 'Administrator authentication required.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
  }

  if (url.pathname === '/api/v1/admin/community/aistudio-settings') {
    const envKey = (env?.GEMINI_API_KEY || env?.VITE_GEMINI_API_KEY || '').trim();
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        data: {
          hasServerKey: Boolean(envKey),
          config: {
            model: 'gemini-3.8-flash'
          }
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
    if (request.method === 'POST') {
      let body = {};
      try { body = JSON.parse(rawBody || '{}'); } catch (_) {}
      return new Response(JSON.stringify({
        success: true,
        config: body?.config || {}
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
  }

  if (url.pathname === '/api/v1/admin/community/aistudio-gemini' && request.method === 'POST') {
    let body = {};
    try { body = JSON.parse(rawBody || '{}'); } catch (_) {}
    const apiKey = (body?.apiKey || env?.GEMINI_API_KEY || env?.VITE_GEMINI_API_KEY || '').trim();
    const rawRequested = (body?.model || 'gemini-3.8-flash').trim().replace(/^models\//i, '');
    const requestedModel =
      rawRequested === 'gemini-2.5-flash' || rawRequested === 'gemini-2.0-flash' || rawRequested === 'gemini-1.5-flash'
        ? 'gemini-3.8-flash'
        : rawRequested;

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Gemini API key is required. Paste your Google AI Studio key in the Key modal.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const startTime = Date.now();
    const candidates = [requestedModel, 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest']
      .filter((m, i, a) => Boolean(m) && m !== 'gemini-2.5-flash' && a.indexOf(m) === i)
      .slice(0, 3);

    const isTestAction = body?.action === 'test';
    const contentsToUse = isTestAction
      ? [{ role: 'user', parts: [{ text: 'Reply with one word: Connected' }] }]
      : body?.contents || [{ role: 'user', parts: [{ text: 'Reply: OK' }] }];

    let lastErr = '';
    for (const modelToUse of candidates) {
      for (const useThinkingCfg of [true, false]) {
        try {
          const isGemini3 = modelToUse.includes('3.') || modelToUse === 'gemini-flash-latest';
          const generationConfig = {
            temperature: isTestAction ? 0.1 : (typeof body?.temperature === 'number' ? body.temperature : 0.85),
            ...(body?.responseMimeType && !isTestAction ? { responseMimeType: body.responseMimeType } : {}),
            ...(useThinkingCfg && isGemini3 ? { thinkingConfig: { thinkingLevel: 'MINIMAL' } } : {})
          };
          const payload = {
            contents: contentsToUse,
            generationConfig,
            ...(body?.systemInstruction && !isTestAction
              ? { systemInstruction: { parts: [{ text: String(body.systemInstruction) }] } }
              : {})
          };
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelToUse)}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
              body: JSON.stringify(payload)
            }
          );
          if (res.ok) {
            const data = await res.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            const textPart = parts.find((p) => typeof p?.text === 'string' && !p?.thought) || parts[0];
            const text = String(textPart?.text || '').trim();
            if (text) {
              return new Response(JSON.stringify({
                success: true,
                text,
                model: modelToUse,
                modelUsed: modelToUse,
                requestedModel,
                latencyMs: Date.now() - startTime,
                message: 'AI Connected & Verified'
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
              });
            }
          } else {
            const errJson = await res.json().catch(() => ({}));
            lastErr = errJson?.error?.message || `HTTP ${res.status}`;
            if (res.status === 401 || res.status === 403 || lastErr.includes('API_KEY_INVALID') || lastErr.includes('API key not valid')) {
              return new Response(JSON.stringify({
                success: false,
                modelUsed: modelToUse,
                requestedModel,
                latencyMs: Date.now() - startTime,
                error: 'Invalid Gemini API Key. Please check your key in Google AI Studio.'
              }), {
                status: 400,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
              });
            }
            if (useThinkingCfg && res.status === 400 && (lastErr.toLowerCase().includes('thinking') || lastErr.toLowerCase().includes('invalid argument'))) {
              continue; // retry same model without thinkingConfig
            }
            break; // move to next candidate model
          }
        } catch (e) {
          lastErr = e?.message || String(e);
          break;
        }
      }
    }

    return new Response(JSON.stringify({
      success: false,
      modelUsed: requestedModel,
      requestedModel,
      latencyMs: Date.now() - startTime,
      error: lastErr || 'Gemini call failed'
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 6b. Admin GitHub Sync Edge Fallback Proxy (/api/github-sync/test, /remote-tree, /create-blob, /commit-tree)
  if (
    url.pathname === '/api/github-sync/test' ||
    url.pathname === '/api/github-sync/remote-tree' ||
    url.pathname === '/api/github-sync/create-blob' ||
    url.pathname === '/api/github-sync/commit-tree'
  ) {
    const jsonNoStore = (payload, status = 200) =>
      new Response(JSON.stringify(payload), {
        status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, private',
        },
      });

    if (request.method !== 'POST') {
      return jsonNoStore({ success: false, error: 'Method Not Allowed' }, 405);
    }

    const authHeader = headers['authorization'] || '';
    const adminToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const { configuredEmail, configuredPassword } = parseAdminConfig(env);
    const sessionSecret = await getAdminSessionSecret(env, configuredPassword);
    const authCheck = await verifyAdminToken(adminToken, sessionSecret, configuredEmail);
    if (!authCheck.valid) {
      return jsonNoStore({ success: false, error: 'Administrator authentication required.' }, 401);
    }

    let body = {};
    try { body = JSON.parse(rawBody || '{}'); } catch (_) {}

    const cleanOwner = String(body?.owner || '').trim();
    const cleanRepo = String(body?.repo || '').trim();
    const cleanBranch = String(body?.branch || 'main').replace(/^refs\/heads\//, '').trim() || 'main';
    const cleanToken = String(body?.token || env?.GITHUB_TOKEN || env?.PAT || '').trim();

    const validSeg = (s) => /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(s) && !s.includes('..');
    const validBranch = (b) =>
      b.length > 0 &&
      b.length <= 120 &&
      /^[A-Za-z0-9._/-]+$/.test(b) &&
      !b.startsWith('/') &&
      !b.endsWith('/') &&
      !b.includes('..') &&
      !b.includes('//');

    if (!validSeg(cleanOwner) || !validSeg(cleanRepo)) {
      return jsonNoStore({ success: false, error: 'Invalid GitHub owner or repository name.' }, 400);
    }
    if (!cleanToken) {
      return jsonNoStore({ success: false, error: 'GitHub Personal Access Token (PAT) is required.' }, 400);
    }

    const ghAuth = cleanToken.toLowerCase().startsWith('ghp_') ? `token ${cleanToken}` : `Bearer ${cleanToken}`;
    const ghReadHeaders = {
      'Authorization': ghAuth,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'RummyDex-Edge-Sync',
    };
    const ghWriteHeaders = {
      ...ghReadHeaders,
      'Content-Type': 'application/json',
    };

    const FORBIDDEN_PREFIXES = [
      '.git/',
      '.github/',
      '.aistudio/',
      'src/components/admin/',
      'src/server/middleware/',
      'src/server/routes/admin',
      'public/assets/aistudio/',
      'docs/',
    ];
    const FORBIDDEN_EXACT = new Set([
      'server.ts',
      'firestore.rules',
      'firebase.json',
      '.firebaserc',
      'mock-2fa-state.json',
      'community_local_backup.json',
      'src/AppAdmin.tsx',
      'src/pages/AdminDashboard.tsx',
      'src/pages/AdminLogin.tsx',
      'src/lib/public_backup.json',
      'src/lib/secure_links_backup.json',
      'src/lib/aiStudioBrain.json',
      'src/lib/totp.ts',
      'src/lib/secureStorage.ts',
      'src/lib/firebase.ts',
      'src/server/routes/githubSyncRoutes.ts',
    ]);
    const PRUNE_REMOTE = new Set([
      'src/lib/public_backup.json',
      'src/lib/secure_links_backup.json',
      'src/lib/aiStudioBrain.json',
    ]);

    const validatePublicPath = (rawPath) => {
      const clean = String(rawPath || '').replace(/\\/g, '/').replace(/^\/+/, '').trim();
      if (!clean || clean.includes('\0')) return { ok: false, cleanPath: clean, reason: 'Invalid path' };
      const segs = clean.split('/');
      if (segs.some((s) => s === '' || s === '.' || s === '..')) {
        return { ok: false, cleanPath: clean, reason: 'Path traversal blocked' };
      }
      const base = segs[segs.length - 1].toLowerCase();
      if (base === '.env' || base.startsWith('.env.')) {
        return { ok: false, cleanPath: clean, reason: 'Environment secret file blocked' };
      }
      const lower = clean.toLowerCase();
      for (const prefix of FORBIDDEN_PREFIXES) {
        if (lower.startsWith(prefix.toLowerCase())) {
          return { ok: false, cleanPath: clean, reason: `Admin/internal prefix "${prefix}" blocked` };
        }
      }
      if (FORBIDDEN_EXACT.has(clean)) {
        return { ok: false, cleanPath: clean, reason: `Admin/internal file "${clean}" blocked` };
      }
      return { ok: true, cleanPath: clean };
    };

    const encodeUtf8Base64 = (str) => {
      const bytes = new TextEncoder().encode(String(str ?? ''));
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.byteLength; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
        binary += String.fromCharCode.apply(null, chunk);
      }
      return btoa(binary);
    };

    const encOwner = encodeURIComponent(cleanOwner);
    const encRepo = encodeURIComponent(cleanRepo);

    try {
      if (url.pathname === '/api/github-sync/test') {
        const res = await fetch(`https://api.github.com/repos/${encOwner}/${encRepo}`, { headers: ghReadHeaders });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          return jsonNoStore({
            success: false,
            error: errJson?.message || `GitHub API returned HTTP ${res.status}`,
          }, res.status === 401 || res.status === 403 || res.status === 404 ? res.status : 502);
        }
        const repoData = await res.json();
        return jsonNoStore({
          success: true,
          message: `Successfully connected to repository "${repoData.full_name}" (branch: ${cleanBranch})`,
          permissions: repoData.permissions || { push: true, pull: true, admin: false },
          defaultBranch: repoData.default_branch,
          repoDetails: {
            name: repoData.name,
            private: repoData.private,
            default_branch: repoData.default_branch,
          },
        });
      }

      if (url.pathname === '/api/github-sync/remote-tree') {
        if (!validBranch(cleanBranch)) {
          return jsonNoStore({ success: false, error: 'Invalid branch name.' }, 400);
        }
        const encBranch = encodeURIComponent(cleanBranch);
        let parentCommitSha = '';
        const refRes = await fetch(
          `https://api.github.com/repos/${encOwner}/${encRepo}/git/ref/heads/${encBranch}?_t=${Date.now()}`,
          { headers: ghReadHeaders }
        );
        if (refRes.ok) {
          const refData = await refRes.json();
          parentCommitSha = refData?.object?.sha || '';
        }
        if (!parentCommitSha) {
          const brRes = await fetch(
            `https://api.github.com/repos/${encOwner}/${encRepo}/branches/${encBranch}?_t=${Date.now()}`,
            { headers: ghReadHeaders }
          );
          if (brRes.ok) {
            const brData = await brRes.json();
            parentCommitSha = brData?.commit?.sha || '';
          }
        }
        if (!parentCommitSha) {
          return jsonNoStore({ success: false, error: `Could not resolve HEAD commit for branch "${cleanBranch}".` }, 404);
        }
        const commitRes = await fetch(
          `https://api.github.com/repos/${encOwner}/${encRepo}/git/commits/${encodeURIComponent(parentCommitSha)}`,
          { headers: ghReadHeaders }
        );
        if (!commitRes.ok) {
          return jsonNoStore({ success: false, error: 'Failed to read parent commit.' }, 502);
        }
        const commitData = await commitRes.json();
        const baseTreeSha = commitData?.tree?.sha;
        if (!baseTreeSha) {
          return jsonNoStore({ success: false, error: 'Parent commit missing tree SHA.' }, 502);
        }
        const treeRes = await fetch(
          `https://api.github.com/repos/${encOwner}/${encRepo}/git/trees/${encodeURIComponent(baseTreeSha)}?recursive=1`,
          { headers: ghReadHeaders }
        );
        if (!treeRes.ok) {
          return jsonNoStore({ success: false, error: 'Failed to read remote git tree.' }, 502);
        }
        const treeData = await treeRes.json();
        const blobShas = {};
        if (Array.isArray(treeData?.tree)) {
          for (const entry of treeData.tree) {
            if (entry?.type === 'blob' && typeof entry.path === 'string' && typeof entry.sha === 'string') {
              blobShas[entry.path] = entry.sha;
            }
          }
        }
        return jsonNoStore({ success: true, parentCommitSha, baseTreeSha, blobShas });
      }

      if (cleanRepo.toLowerCase() === 'masterworld') {
        return jsonNoStore({
          success: false,
          error: 'Refused to push public static bundle to admin repository "masterworld".',
        }, 403);
      }

      if (url.pathname === '/api/github-sync/create-blob') {
        const check = validatePublicPath(body?.path);
        if (!check.ok) {
          return jsonNoStore({
            success: false,
            error: `Path "${body?.path || ''}" blocked from public sync: ${check.reason}`,
          }, 403);
        }
        const b64 = encodeUtf8Base64(body?.content ?? '');
        const blobRes = await fetch(`https://api.github.com/repos/${encOwner}/${encRepo}/git/blobs`, {
          method: 'POST',
          headers: ghWriteHeaders,
          body: JSON.stringify({ content: b64, encoding: 'base64' }),
        });
        if (!blobRes.ok) {
          const errJson = await blobRes.json().catch(() => ({}));
          return jsonNoStore({
            success: false,
            error: errJson?.message || `GitHub blob API returned HTTP ${blobRes.status}`,
          }, blobRes.status >= 400 && blobRes.status < 500 ? blobRes.status : 502);
        }
        const blobData = await blobRes.json();
        return jsonNoStore({ success: true, path: check.cleanPath, sha: blobData?.sha });
      }

      if (url.pathname === '/api/github-sync/commit-tree') {
        if (!validBranch(cleanBranch)) {
          return jsonNoStore({ success: false, error: 'Invalid branch name.' }, 400);
        }
        const rawTree = Array.isArray(body?.tree) ? body.tree : [];
        const deduped = new Map();
        for (const item of rawTree) {
          if (!item || typeof item.path !== 'string' || typeof item.sha !== 'string') continue;
          const check = validatePublicPath(item.path);
          if (!check.ok) {
            return jsonNoStore({
              success: false,
              error: `Path "${item.path}" blocked from public sync: ${check.reason}`,
            }, 403);
          }
          deduped.set(check.cleanPath, {
            path: check.cleanPath,
            mode: item.mode === '100755' ? '100755' : '100644',
            type: 'blob',
            sha: item.sha,
          });
        }
        if (deduped.size === 0) {
          return jsonNoStore({ success: false, error: 'No valid tree entries provided to commit.' }, 400);
        }

        const commitMessage = String(body?.message || 'Admin atomic sync update').trim().slice(0, 500);
        const encBranch = encodeURIComponent(cleanBranch);
        const MAX_REBASE = 3;

        for (let attempt = 1; attempt <= MAX_REBASE; attempt++) {
          let parentCommitSha = '';
          const refRes = await fetch(
            `https://api.github.com/repos/${encOwner}/${encRepo}/git/ref/heads/${encBranch}?_t=${Date.now()}`,
            { headers: ghReadHeaders }
          );
          if (refRes.ok) {
            const refData = await refRes.json();
            parentCommitSha = refData?.object?.sha || '';
          }
          if (!parentCommitSha) {
            const brRes = await fetch(
              `https://api.github.com/repos/${encOwner}/${encRepo}/branches/${encBranch}?_t=${Date.now()}`,
              { headers: ghReadHeaders }
            );
            if (brRes.ok) {
              const brData = await brRes.json();
              parentCommitSha = brData?.commit?.sha || '';
            }
          }
          if (!parentCommitSha) {
            return jsonNoStore({ success: false, error: `Could not find HEAD commit for branch "${cleanBranch}".` }, 404);
          }

          const parentRes = await fetch(
            `https://api.github.com/repos/${encOwner}/${encRepo}/git/commits/${encodeURIComponent(parentCommitSha)}`,
            { headers: ghReadHeaders }
          );
          if (!parentRes.ok) {
            return jsonNoStore({ success: false, error: 'Failed to read parent commit.' }, 502);
          }
          const parentData = await parentRes.json();
          const baseTreeSha = parentData?.tree?.sha;
          if (!baseTreeSha) {
            return jsonNoStore({ success: false, error: 'Parent commit missing tree SHA.' }, 502);
          }

          const treeEntries = Array.from(deduped.values());
          try {
            const baseTreeRes = await fetch(
              `https://api.github.com/repos/${encOwner}/${encRepo}/git/trees/${encodeURIComponent(baseTreeSha)}?recursive=1`,
              { headers: ghReadHeaders }
            );
            if (baseTreeRes.ok) {
              const baseTreeData = await baseTreeRes.json();
              if (Array.isArray(baseTreeData?.tree)) {
                for (const t of baseTreeData.tree) {
                  if (t?.type === 'blob' && t?.path && PRUNE_REMOTE.has(t.path) && !deduped.has(t.path)) {
                    treeEntries.push({ path: t.path, mode: '100644', type: 'blob', sha: null });
                  }
                }
              }
            }
          } catch (_) {}

          const createTreeRes = await fetch(`https://api.github.com/repos/${encOwner}/${encRepo}/git/trees`, {
            method: 'POST',
            headers: ghWriteHeaders,
            body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
          });
          if (!createTreeRes.ok) {
            const errJson = await createTreeRes.json().catch(() => ({}));
            return jsonNoStore({ success: false, error: errJson?.message || 'Failed to create git tree.' }, 502);
          }
          const newTreeData = await createTreeRes.json();

          const createCommitRes = await fetch(`https://api.github.com/repos/${encOwner}/${encRepo}/git/commits`, {
            method: 'POST',
            headers: ghWriteHeaders,
            body: JSON.stringify({ message: commitMessage, tree: newTreeData.sha, parents: [parentCommitSha] }),
          });
          if (!createCommitRes.ok) {
            const errJson = await createCommitRes.json().catch(() => ({}));
            return jsonNoStore({ success: false, error: errJson?.message || 'Failed to create git commit.' }, 502);
          }
          const newCommitData = await createCommitRes.json();

          const updateRefRes = await fetch(
            `https://api.github.com/repos/${encOwner}/${encRepo}/git/refs/heads/${encBranch}`,
            {
              method: 'PATCH',
              headers: ghWriteHeaders,
              body: JSON.stringify({ sha: newCommitData.sha, force: false }),
            }
          );
          if (updateRefRes.ok) {
            return jsonNoStore({
              success: true,
              commitSha: newCommitData.sha,
              treeSha: newTreeData.sha,
              attempt,
              message: `Successfully created atomic commit ${String(newCommitData.sha || '').substring(0, 7)}`,
            });
          }

          const refErr = await updateRefRes.json().catch(() => ({}));
          if (updateRefRes.status === 422 && attempt < MAX_REBASE) {
            await new Promise((r) => setTimeout(r, 600 * attempt));
            continue;
          }
          return jsonNoStore({
            success: false,
            error: refErr?.message || `Failed to update branch ref "${cleanBranch}" (HTTP ${updateRefRes.status})`,
          }, updateRefRes.status >= 400 && updateRefRes.status < 500 ? updateRefRes.status : 502);
        }

        return jsonNoStore({
          success: false,
          error: `Branch "${cleanBranch}" moved concurrently multiple times. Please retry sync.`,
        }, 409);
      }
    } catch (ghErr) {
      return jsonNoStore({
        success: false,
        error: ghErr?.message || 'Edge GitHub sync proxy error',
      }, 502);
    }
  }

  // 7. Public APIs (Health, Catalog, App Details, Settings, News, Videos, Developers, FAQs)
  const safeDecodeSegment = (raw) => {
    try {
      return decodeURIComponent(raw || '');
    } catch {
      return String(raw || '');
    }
  };

  const getPublicApps = () =>
    (Array.isArray(staticData?.apps) ? staticData.apps : []).filter((a) => a && a.sync_to_public !== false);

  const getPublicNews = () =>
    (Array.isArray(staticData?.news) ? staticData.news : []).filter((n) => n && n.sync_to_public !== false);

  const sanitizePublicSettingsEdge = (rawSettings) => {
    if (!rawSettings || typeof rawSettings !== 'object') return {};
    const out = { ...rawSettings };
    const privateKeys = [
      'turnstile_secret_key',
      'cloudinary_api_secret',
      'cloudinary_api_key',
      'cloudinary_cloud_name',
      'cloudinary_upload_preset',
      'gemini_api_key',
      'gemini_model',
      '_rest_admin_bypass',
      'test_ping',
      'github_token',
      'admin_email',
      'admin_password',
    ];
    for (const k of privateKeys) delete out[k];
    return out;
  };

  const stripRichAppFields = (app) => {
    if (!app || typeof app !== 'object') return app;
    const {
      description_html,
      features_html,
      screenshots,
      faqs,
      custom_admin_box_html,
      custom_admin_box_heading,
      yellow_box_msg,
      red_box_msg,
      idea_box_msg,
      release_notes,
      more_information_url,
      encrypted_link,
      encrypted_download_url,
      download_url,
      ...card
    } = app;
    return card;
  };

  const stripRichNewsFields = (item) => {
    if (!item || typeof item !== 'object') return item;
    const { content, description_html, ...card } = item;
    return card;
  };

  if (url.pathname === '/api/ping' || url.pathname === '/api/health') {
    return new Response(JSON.stringify({ status: 'OK', ok: true, edge: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  if (url.pathname.startsWith('/api/v1/public/app/')) {
    const rawSlug = url.pathname.replace(/^\/api\/v1\/public\/app\//, '').trim();
    const clean = safeDecodeSegment(rawSlug).toLowerCase().trim().replace(/\/+$/, '');
    const apps = getPublicApps();
    const app =
      apps.find((a) => {
        const s = String(a.slug || a.id || '').toLowerCase().trim();
        return s === clean;
      }) || resolveAppSlug(clean, apps);
    if (app) {
      const payloadApp =
        url.searchParams.get('lite') === '1'
          ? {
              id: app.id,
              name: app.name,
              slug: app.slug,
              icon_url: app.icon_url || '',
              version: app.version || '1.0',
              serial_number: app.serial_number ?? undefined,
              safety_status: app.safety_status || 'Verified',
              is_coming_soon: Boolean(app.is_coming_soon),
            }
          : app;
      return new Response(JSON.stringify({ status: 'OK', app: payloadApp }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      });
    }
    return new Response(JSON.stringify({ status: 'NOT_FOUND', error: 'App not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  if (url.pathname === '/api/v1/public/backup-data') {
    const publicApps = getPublicApps().map(stripRichAppFields);
    const publicNews = getPublicNews().map(stripRichNewsFields);
    const publicVideos = Array.isArray(staticData?.videos) ? staticData.videos.filter(Boolean) : [];
    const publicSettings = sanitizePublicSettingsEdge(staticData?.settings || {});
    return new Response(
      JSON.stringify({
        apps: publicApps,
        settings: publicSettings,
        news: publicNews,
        videos: publicVideos,
        reviews: [],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=600',
        },
      }
    );
  }

  if (url.pathname === '/api/v1/public/settings') {
    return new Response(JSON.stringify({ status: 'OK', settings: sanitizePublicSettingsEdge(staticData?.settings || {}) }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  }

  if (url.pathname.startsWith('/api/v1/public/news/')) {
    const rawSlug = url.pathname.replace(/^\/api\/v1\/public\/news\//, '').trim();
    const clean = safeDecodeSegment(rawSlug).toLowerCase().trim().replace(/\/+$/, '');
    const newsList = getPublicNews();
    const newsItem = newsList.find((n) => {
      const s = String(n.slug || '').toLowerCase().trim();
      const id = String(n.id || '').toLowerCase().trim();
      return s === clean || id === clean;
    });
    if (newsItem) {
      return new Response(JSON.stringify({ status: 'OK', news: newsItem }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=604800',
        },
      });
    }
    return new Response(JSON.stringify({ status: 'NOT_FOUND', error: 'News article not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  if (url.pathname === '/api/v1/public/news') {
    return new Response(JSON.stringify({ status: 'OK', news: getPublicNews().map(stripRichNewsFields) }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
      },
    });
  }

  if (url.pathname === '/api/v1/public/videos') {
    const videos = Array.isArray(staticData?.videos) ? staticData.videos.filter(Boolean) : [];
    return new Response(JSON.stringify({ status: 'OK', videos }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=1200, stale-while-revalidate=86400',
      },
    });
  }

  if (url.pathname === '/api/v1/public/developers') {
    const developers = staticData?.developers || staticData?.settings?.developers || [];
    return new Response(JSON.stringify({ status: 'OK', developers }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  if (url.pathname === '/api/v1/public/faqs') {
    const faqs = staticData?.settings?.website_faqs || [];
    return new Response(JSON.stringify({ status: 'OK', faqs }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  return new Response(HARD_RESPONSE_BODY, {
    status: HARD_RESPONSE_STATUS,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store, private' },
  });
}
