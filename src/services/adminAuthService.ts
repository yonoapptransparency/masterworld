/**
 * adminAuthService.ts
 * Handles Firebase admin authentication, token refresh, and session management.
 * Drop this file into src/services/ in your project.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface AdminSession {
  idToken: string;
  refreshToken: string;
  email: string;
  expiresAt: number; // epoch ms
}

export interface AuthResult {
  ok: boolean;
  session?: AdminSession;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_KEY = "__adm_session";
const TOKEN_LIFETIME_MS = 55 * 60 * 1000; // 55 minutes (Firebase tokens last 60m)
const appletConfig: any = {};
const isFirebaseApiKeyReal = (key: string | undefined): boolean => {
  if (!key) return false;
  const clean = key.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY')) return false;
  if (clean.length > 15 && (clean.includes('#') || clean.includes('!') || clean.includes('@') || clean.includes('$') || clean.includes('Sy8@'))) return false;
  return true;
};

const rawApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY || (appletConfig as any).apiKey || "";
const FIREBASE_API_KEY = isFirebaseApiKeyReal(rawApiKey) ? rawApiKey : "AIzaSyBey9sUbeWlrcXS2kl4ewOzkTy4arg03Ok";
const IS_API_KEY_REAL = isFirebaseApiKeyReal(FIREBASE_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// SESSION STORAGE (sessionStorage — cleared when tab closes)
// ─────────────────────────────────────────────────────────────────────────────
export function saveSession(session: AdminSession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (_) {}
}

export function loadSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: AdminSession = JSON.parse(raw);
    if (!parsed.idToken || !parsed.expiresAt) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}

export function isSessionExpired(session: AdminSession): boolean {
  return Date.now() >= session.expiresAt;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN REFRESH
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshIdToken(
  refreshToken: string
): Promise<{ idToken: string; expiresAt: number } | null> {
  if (refreshToken === 'MOCK_ADMIN_REFRESH' || refreshToken === 'SERVER_SESSION' || !refreshToken || !IS_API_KEY_REAL) {
    const session = loadSession();
    if (session && session.idToken) {
      return {
        idToken: session.idToken,
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
    }
  }

  try {
    const res = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      }
    );
    if (!res.ok) {
      const session = loadSession();
      if (session && session.idToken && Date.now() < session.expiresAt) {
        return {
          idToken: session.idToken,
          expiresAt: Date.now() + TOKEN_LIFETIME_MS,
        };
      }
      return null;
    }
    const data = await res.json();
    return {
      idToken: data.id_token,
      expiresAt: Date.now() + TOKEN_LIFETIME_MS,
    };
  } catch (_) {
    const session = loadSession();
    if (session && session.idToken && Date.now() < session.expiresAt) {
      return {
        idToken: session.idToken,
        expiresAt: Date.now() + TOKEN_LIFETIME_MS,
      };
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET VALID TOKEN — refreshes automatically if close to expiry
// ─────────────────────────────────────────────────────────────────────────────
export async function getValidAdminToken(): Promise<string | null> {
  const session = loadSession();
  if (!session) return null;

  // Token still valid (with 2-min buffer)
  if (Date.now() < session.expiresAt - 2 * 60 * 1000) {
    return session.idToken;
  }

  // Attempt refresh
  const refreshed = await refreshIdToken(session.refreshToken);
  if (!refreshed) {
    clearSession();
    return null;
  }

  const updated: AdminSession = {
    ...session,
    idToken: refreshed.idToken,
    expiresAt: refreshed.expiresAt,
  };
  saveSession(updated);
  return updated.idToken;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────────────────────────────────────
export function signOutAdmin(): void {
  clearSession();
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN API FETCH — wrapper that auto-injects auth header + refresh
// ─────────────────────────────────────────────────────────────────────────────
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidAdminToken();
  const existingAuth = (options.headers as any)?.Authorization || (options.headers as any)?.authorization;
  if (!token && !existingAuth) {
    // Return a fake 401 response
    return new Response(JSON.stringify({ error: "Session expired" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

    const finalHeaders = {
    ...options.headers,
    "Content-Type": "application/json",
  } as any;
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers: finalHeaders });
}
