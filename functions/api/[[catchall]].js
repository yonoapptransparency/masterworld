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

async function hmacVerify(secret, message, expectedSig) {
  const actualSig = await hmacSign(secret, message);
  return actualSig === expectedSig;
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
      : 'rummydex_admin_fallback_secret_key_2026')
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

    if (normalizedEmail !== configuredEmail) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid administrator email address.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const inputHash = await sha256Hex(inputPass);
    const isDirectMatch = inputPass === configuredPassword;
    const isHashMatch = inputHash === configuredPassword.toLowerCase();

    if (!isDirectMatch && !isHashMatch) {
      return new Response(JSON.stringify({ ok: false, error: 'Incorrect administrator password.' }), {
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
  if (url.pathname === '/api/v1/admin/community/aistudio-settings') {
    const envKey = (env?.GEMINI_API_KEY || env?.VITE_GEMINI_API_KEY || '').trim();
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        data: {
          hasServerKey: Boolean(envKey),
          config: {
            ...(envKey ? { apiKey: envKey } : {}),
            model: 'gemini-2.5-flash'
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
    const requestedModel = (body?.model || 'gemini-2.5-flash').trim().replace(/^models\//i, '');

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
    if (body?.action === 'test') {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${encodeURIComponent(apiKey)}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const supported = new Set((data?.models || []).map((m) => String(m?.name || '').replace(/^models\//i, '')));
          const resolvedModel = supported.has(requestedModel)
            ? requestedModel
            : supported.has('gemini-2.5-flash')
            ? 'gemini-2.5-flash'
            : 'gemini-flash-latest';
          return new Response(JSON.stringify({
            success: true,
            model: resolvedModel,
            requestedModel,
            latencyMs: Date.now() - startTime,
            message: 'AI Connected & Verified'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        }
      } catch (_) {}
    }

    const candidates = [requestedModel, 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite']
      .filter((m, i, a) => Boolean(m) && a.indexOf(m) === i)
      .slice(0, 3);

    let lastErr = '';
    for (const modelToUse of candidates) {
      try {
        const generationConfig = {
          temperature: typeof body?.temperature === 'number' ? body.temperature : 0.85,
          ...(body?.responseMimeType ? { responseMimeType: body.responseMimeType } : {}),
          ...(modelToUse.includes('2.5-flash') || modelToUse.includes('flash-latest')
            ? { thinkingConfig: { thinkingBudget: 0 } }
            : {})
        };
        const payload = {
          contents: body?.contents || [{ role: 'user', parts: [{ text: 'Reply: OK' }] }],
          generationConfig,
          ...(body?.systemInstruction ? { systemInstruction: { parts: [{ text: String(body.systemInstruction) }] } } : {})
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
              latencyMs: Date.now() - startTime
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
          }
        } else {
          const errJson = await res.json().catch(() => ({}));
          lastErr = errJson?.error?.message || `HTTP ${res.status}`;
          if (res.status === 400 || res.status === 401 || res.status === 403) break;
        }
      } catch (e) {
        lastErr = e?.message || String(e);
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

  // 7. Public APIs (Catalog, App Details, Settings, News, Videos)
  if (url.pathname.startsWith('/api/v1/public/app/')) {
    const rawSlug = url.pathname.replace(/^\/api\/v1\/public\/app\//, '').trim();
    const clean = decodeURIComponent(rawSlug).toLowerCase().trim();
    const apps = Array.isArray(staticData?.apps) ? staticData.apps : [];
    const app =
      apps.find((a) => {
        const s = String(a.slug || a.id || '').toLowerCase().trim();
        return s === clean;
      }) || resolveAppSlug(clean, apps);
    if (app) {
      return new Response(JSON.stringify({ status: 'OK', app }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    }
    return new Response(JSON.stringify({ status: 'ERROR', error: 'App not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  if (url.pathname === '/api/v1/public/backup-data') {
    return new Response(JSON.stringify(staticData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=120, s-maxage=600',
      },
    });
  }

  if (url.pathname === '/api/v1/public/settings') {
    return new Response(JSON.stringify({ status: 'OK', settings: staticData?.settings || {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  if (url.pathname === '/api/v1/public/news') {
    return new Response(JSON.stringify({ status: 'OK', news: staticData?.news || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  if (url.pathname === '/api/v1/public/videos') {
    return new Response(JSON.stringify({ status: 'OK', videos: staticData?.videos || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  return new Response(HARD_RESPONSE_BODY, {
    status: HARD_RESPONSE_STATUS,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store, private' },
  });
}
