import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TURNSTILE_ACTION,
  NONCE_REFRESH_MS,
  CLIENT_TAP_HOLD_MS,
  TURNSTILE_UI_TIMEOUT_MS,
  SESSION_INIT_TIMEOUT_MS,
  DEFAULT_TURNSTILE_SITE_KEY,
  SESSION_RETRY_MAX,
} from '../lib/gateConfig';
import { collectEnv, type FrozenEnvProbe } from '../lib/deviceProbe';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export interface UseTurnstileVerificationOptions {
  appId: string;
  adminTurnstileSiteKey?: string;
}

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const scriptLoadCallbacks = new Set<() => void>();

function ensureTurnstilePreconnect(): void {
  if (typeof document === 'undefined' || !document.head) return;
  try {
    if (!document.getElementById('cf-turnstile-preconnect')) {
      const preconnect = document.createElement('link');
      preconnect.id = 'cf-turnstile-preconnect';
      preconnect.rel = 'preconnect';
      preconnect.href = 'https://challenges.cloudflare.com';
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    }
    if (!document.getElementById('cf-turnstile-dns-prefetch')) {
      const dns = document.createElement('link');
      dns.id = 'cf-turnstile-dns-prefetch';
      dns.rel = 'dns-prefetch';
      dns.href = 'https://challenges.cloudflare.com';
      document.head.appendChild(dns);
    }
  } catch {
    // Ignore DOM injection errors
  }
}

export function ensureTurnstileScriptLoaded(forceReload = false): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  ensureTurnstilePreconnect();
  if (window.turnstile && !forceReload) return;

  const existing = document.querySelector(
    'script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]'
  ) as HTMLScriptElement | null;

  if (existing) {
    if (forceReload || existing.getAttribute('data-failed') === '1') {
      try {
        existing.remove();
      } catch {
        // Ignore removal errors
      }
    } else {
      return;
    }
  }

  try {
    const s = document.createElement('script');
    s.src = forceReload ? `${TURNSTILE_SCRIPT_SRC}&retry=${Date.now() % 10000}` : TURNSTILE_SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      s.setAttribute('data-loaded', '1');
      scriptLoadCallbacks.forEach((cb) => {
        try {
          cb();
        } catch {
          // Ignore callback error
        }
      });
    };
    s.onerror = () => {
      s.setAttribute('data-failed', '1');
    };
    document.head.appendChild(s);
  } catch {
    // Ignore DOM injection errors
  }
}

interface SessionInitOutcome {
  ok: boolean;
  status: number;
  nonce: string | null;
  retry: boolean;
  startedAtMs: number;
  completedAtMs: number;
}

const preflightSessionCache = new Map<
  string,
  { promise: Promise<SessionInitOutcome>; startedAtMs: number }
>();

async function fetchSessionInitOnce(safeAppId: string): Promise<SessionInitOutcome> {
  const startedAtMs = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SESSION_INIT_TIMEOUT_MS);
  try {
    const res = await fetch('/api/v1/app/session-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ appId: safeAppId }),
      signal: controller.signal,
    });
    const completedAtMs = Date.now();
    if (res.status === 404) {
      return { ok: false, status: 404, nonce: null, retry: false, startedAtMs, completedAtMs };
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.status === 'retry' || typeof data.nonce !== 'string') {
      return { ok: false, status: res.status, nonce: null, retry: true, startedAtMs, completedAtMs };
    }
    return {
      ok: true,
      status: res.status,
      nonce: data.nonce.trim(),
      retry: false,
      startedAtMs,
      completedAtMs,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      nonce: null,
      retry: true,
      startedAtMs,
      completedAtMs: Date.now(),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pre-warms Turnstile DNS/TLS connection, script download, frozen hardware probe,
 * and (optionally) the `/api/v1/app/session-init` nonce request when the user touches
 * "Download" on `/app/:slug` so everything runs in parallel during route navigation.
 */
export function warmGatewaySession(rawAppId?: string): void {
  if (typeof window === 'undefined') return;
  ensureTurnstileScriptLoaded(false);
  void collectEnv();

  if (!rawAppId) return;
  const safeAppId = rawAppId.replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 64);
  if (!safeAppId) return;

  const existing = preflightSessionCache.get(safeAppId);
  if (existing && Date.now() - existing.startedAtMs < 8000) {
    return;
  }

  const startedAtMs = Date.now();
  const promise = fetchSessionInitOnce(safeAppId);
  preflightSessionCache.set(safeAppId, { promise, startedAtMs });
}

function isRealTurnstileKey(k: string): boolean {
  if (!k || k.length < 10) return false;
  if (
    k.includes('<') ||
    k.includes('>') ||
    k.includes('REPLACE_') ||
    k.includes('YOUR_') ||
    k === 'PLACEHOLDER'
  ) {
    return false;
  }
  return true;
}

export function useTurnstileVerification({
  appId,
  adminTurnstileSiteKey,
}: UseTurnstileVerificationOptions) {
  const [isReady, setIsReady] = useState(false);
  const [isBotBlocked, setIsBotBlocked] = useState(false);
  const [uiTimeoutExceeded, setUiTimeoutExceeded] = useState(false);

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const cfTokenRef = useRef<string | null>(null);
  const nonceRef = useRef<string | null>(null);
  const envRef = useRef<FrozenEnvProbe | null>(null);
  const initResponseTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const keyIndexRef = useRef<number>(0);
  const wasHiddenRef = useRef<boolean>(false);

  const adminSiteKeyRef = useRef<string | undefined>(adminTurnstileSiteKey);
  adminSiteKeyRef.current = adminTurnstileSiteKey;

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uiTimeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scriptWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef<boolean>(false);

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (uiTimeoutTimerRef.current) {
      clearTimeout(uiTimeoutTimerRef.current);
      uiTimeoutTimerRef.current = null;
    }
    if (scriptWaitTimerRef.current) {
      clearTimeout(scriptWaitTimerRef.current);
      scriptWaitTimerRef.current = null;
    }
  }, []);

  const removeWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Ignore widget cleanup errors
      }
      widgetIdRef.current = null;
    }
    if (widgetRef.current) {
      widgetRef.current.innerHTML = '';
    }
  }, []);

  const resolveCandidateSiteKeys = useCallback((): string[] => {
    const hostname =
      typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
    const isProdDomain =
      hostname === 'rummydex.com' ||
      hostname === 'www.rummydex.com' ||
      hostname.endsWith('.rummydex.com') ||
      hostname.endsWith('.pages.dev');

    const envKey = String((import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '').trim();
    const adminKey = String(adminSiteKeyRef.current || '').trim();

    const candidates: string[] = [];
    const addKey = (k: string) => {
      if (!isRealTurnstileKey(k)) return;
      // §5.5 & §8 Test 15: Test keys (1x000...) are forbidden on production domains
      if (isProdDomain && k.startsWith('1x00000000000000000000')) return;
      if (!candidates.includes(k)) candidates.push(k);
    };

    // §7 Site key cascade: Admin setting -> VITE_TURNSTILE_SITE_KEY -> DEFAULT_TURNSTILE_SITE_KEY -> test key (non-production hosts only)
    addKey(adminKey);
    addKey(envKey);
    addKey(DEFAULT_TURNSTILE_SITE_KEY);
    if (!isProdDomain) {
      addKey('1x00000000000000000000AA');
    }

    return candidates;
  }, []);

  const markTokenReady = useCallback(() => {
    if (unmountedRef.current) return;
    if (!cfTokenRef.current || !nonceRef.current) {
      setIsReady(false);
      return;
    }
    if (uiTimeoutTimerRef.current) {
      clearTimeout(uiTimeoutTimerRef.current);
      uiTimeoutTimerRef.current = null;
    }
    setUiTimeoutExceeded(false);

    // Use client-monotonic midpoint of session-init RTT to prevent mobile carrier NITZ clock-skew delays
    const baselineMs = initResponseTimeRef.current > 0 ? initResponseTimeRef.current : Date.now();
    const elapsed = Math.max(0, Date.now() - baselineMs);
    const remainingHold = Math.max(0, CLIENT_TAP_HOLD_MS - elapsed);

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (remainingHold === 0) {
      setIsReady(true);
    } else {
      holdTimerRef.current = setTimeout(() => {
        if (!unmountedRef.current && cfTokenRef.current && nonceRef.current) {
          setIsReady(true);
        }
      }, remainingHold);
    }
  }, []);

  const startSessionFlow = useCallback(
    async (isSilentRetry = false) => {
      if (unmountedRef.current || !appId) return;

      ensureTurnstileScriptLoaded(false);
      clearTimers();
      removeWidget();
      cfTokenRef.current = null;
      nonceRef.current = null;
      setIsReady(false);
      // Always clear any prior timeout state when starting/retrying verification so an active
      // Turnstile widget never renders alongside a stale "Verification could not be completed" box
      setUiTimeoutExceeded(false);

      // UI Timeout guard (§5.5: only fires if Turnstile script/widget fails to mount or solve within window)
      uiTimeoutTimerRef.current = setTimeout(() => {
        if (!unmountedRef.current && !cfTokenRef.current && !widgetIdRef.current) {
          setUiTimeoutExceeded(true);
        }
      }, TURNSTILE_UI_TIMEOUT_MS);

      try {
        const candidateKeys = resolveCandidateSiteKeys();
        if (candidateKeys.length === 0) {
          clearTimers();
          setUiTimeoutExceeded(true);
          return;
        }

        const safeAppId = appId.replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 64);

        // Reuse pre-warmed session-init if fresh (< 8s) and not a retry; otherwise start immediately in parallel with collectEnv()
        let sessionInitPromise: Promise<SessionInitOutcome>;
        const cachedPreflight = !isSilentRetry ? preflightSessionCache.get(safeAppId) : undefined;
        if (cachedPreflight && Date.now() - cachedPreflight.startedAtMs < 8000) {
          preflightSessionCache.delete(safeAppId);
          sessionInitPromise = cachedPreflight.promise;
        } else {
          preflightSessionCache.delete(safeAppId);
          sessionInitPromise = fetchSessionInitOnce(safeAppId);
        }

        initResponseTimeRef.current = Date.now();

        // 1 & 2. Run frozen hardware probe (§5.3) and server nonce request (§5.4) concurrently to save 1 full step on slow mobile networks
        let [env, initOutcome] = await Promise.all([collectEnv(), sessionInitPromise]);
        if (unmountedRef.current) return;
        envRef.current = env;

        if (env.gate.failed) {
          clearTimers();
          setIsBotBlocked(true);
          return;
        }

        // If a pre-warmed request failed due to a transient network blip during navigation, transparently re-try once right away
        if (!initOutcome.ok && initOutcome.status !== 404 && cachedPreflight) {
          initOutcome = await fetchSessionInitOnce(safeAppId);
          if (unmountedRef.current) return;
        }

        // Record client-monotonic midpoint of the session-init round-trip for clock-skew-proof dwell accounting
        initResponseTimeRef.current = Math.round(
          (initOutcome.startedAtMs + initOutcome.completedAtMs) / 2
        );

        if (initOutcome.status === 404) {
          clearTimers();
          if (retryCountRef.current < SESSION_RETRY_MAX) {
            retryCountRef.current += 1;
            setTimeout(() => {
              if (!unmountedRef.current) void startSessionFlow(true);
            }, 350);
            return;
          }
          const hasTouch =
            (typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints ?? 0) >= 1) ||
            (typeof window !== 'undefined' && 'ontouchstart' in window);
          if (hasTouch && env.gate.wb === 0 && env.gate.hl === 0 && env.gate.dk === 0) {
            setUiTimeoutExceeded(true);
            return;
          }
          setIsBotBlocked(true);
          return;
        }

        if (!initOutcome.ok || !initOutcome.nonce) {
          if (retryCountRef.current < SESSION_RETRY_MAX) {
            retryCountRef.current += 1;
            setTimeout(() => {
              if (!unmountedRef.current) void startSessionFlow(true);
            }, 350);
          } else {
            clearTimers();
            setUiTimeoutExceeded(true);
          }
          return;
        }

        const nonce = initOutcome.nonce;
        const nid = nonce.split('.')[0] || '';
        if (nid.length !== 32) {
          clearTimers();
          setUiTimeoutExceeded(true);
          return;
        }

        nonceRef.current = nonce;

        // Schedule proactive silent refresh at NONCE_REFRESH_MS (90s) for idle tabs (§5.5)
        refreshTimerRef.current = setTimeout(() => {
          if (
            !unmountedRef.current &&
            typeof document !== 'undefined' &&
            document.visibilityState === 'visible'
          ) {
            retryCountRef.current = 0;
            void startSessionFlow(true);
          }
        }, NONCE_REFRESH_MS);

        const scriptWaitStartMs = Date.now();
        let didForceScriptReload = false;

        // 3. Render Turnstile with hardware commitment cData = `${appId}_${nid}_${hw}` (§5.5)
        const renderTurnstileWidget = () => {
          if (unmountedRef.current) return;
          if (!window.turnstile || !widgetRef.current) {
            // If Turnstile script stalled for > 7.5s on a weak 2G/3G connection, re-inject script once
            if (!window.turnstile && !didForceScriptReload && Date.now() - scriptWaitStartMs > 7500) {
              didForceScriptReload = true;
              ensureTurnstileScriptLoaded(true);
            }
            scriptWaitTimerRef.current = setTimeout(renderTurnstileWidget, 40);
            return;
          }
          scriptLoadCallbacks.delete(renderTurnstileWidget);

          removeWidget();

          const currentCandidates = resolveCandidateSiteKeys();
          if (currentCandidates.length === 0) {
            clearTimers();
            setUiTimeoutExceeded(true);
            return;
          }
          const idx = Math.min(keyIndexRef.current, currentCandidates.length - 1);
          const sitekey = currentCandidates[idx];

          const onWidgetError = () => {
            if (unmountedRef.current) return;
            cfTokenRef.current = null;
            widgetIdRef.current = null;
            setIsReady(false);
            // If another candidate key in the cascade is available (e.g., env key or non-prod fallback), try it immediately
            if (keyIndexRef.current + 1 < currentCandidates.length) {
              keyIndexRef.current += 1;
              renderTurnstileWidget();
              return;
            }
            if (retryCountRef.current < SESSION_RETRY_MAX) {
              retryCountRef.current += 1;
              void startSessionFlow(true);
            } else {
              removeWidget();
              setUiTimeoutExceeded(true);
            }
          };

          const softReinit = () => {
            if (unmountedRef.current) return;
            cfTokenRef.current = null;
            widgetIdRef.current = null;
            setIsReady(false);
            if (retryCountRef.current < SESSION_RETRY_MAX) {
              retryCountRef.current += 1;
              void startSessionFlow(true);
            } else {
              removeWidget();
              setUiTimeoutExceeded(true);
            }
          };

          const cData = `${safeAppId}_${nid}_${env.hw}`;

          try {
            widgetRef.current.innerHTML = '';
            setUiTimeoutExceeded(false);
            const id = window.turnstile.render(widgetRef.current, {
              sitekey,
              action: TURNSTILE_ACTION,
              cData,
              appearance: 'always',
              size: 'flexible',
              theme: 'auto',
              callback: (t: string) => {
                if (unmountedRef.current) return;
                cfTokenRef.current = t;
                retryCountRef.current = 0;
                markTokenReady();
              },
              'error-callback': onWidgetError,
              'expired-callback': softReinit,
              'timeout-callback': softReinit,
            });
            widgetIdRef.current = id;
          } catch {
            onWidgetError();
          }
        };

        if (!window.turnstile) {
          scriptLoadCallbacks.add(renderTurnstileWidget);
        }
        renderTurnstileWidget();
      } catch {
        if (!unmountedRef.current) {
          if (retryCountRef.current < SESSION_RETRY_MAX) {
            retryCountRef.current += 1;
            setTimeout(() => {
              if (!unmountedRef.current) void startSessionFlow(true);
            }, 350);
          } else {
            clearTimers();
            setUiTimeoutExceeded(true);
          }
        }
      }
    },
    [appId, clearTimers, markTokenReady, removeWidget, resolveCandidateSiteKeys]
  );

  // If adminTurnstileSiteKey hydrates asynchronously while no token/widget is active, restart automatically
  useEffect(() => {
    if (
      adminTurnstileSiteKey &&
      isRealTurnstileKey(adminTurnstileSiteKey) &&
      !cfTokenRef.current &&
      !widgetIdRef.current
    ) {
      retryCountRef.current = 0;
      keyIndexRef.current = 0;
      void startSessionFlow(true);
    }
  }, [adminTurnstileSiteKey, startSessionFlow]);

  // Initial mount + visibilitychange (hidden -> visible) & pageshow (persisted) re-verification (§5.9)
  useEffect(() => {
    unmountedRef.current = false;
    retryCountRef.current = 0;
    keyIndexRef.current = 0;
    wasHiddenRef.current = false;
    void startSessionFlow(false);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHiddenRef.current = true;
      } else if (document.visibilityState === 'visible' && wasHiddenRef.current) {
        wasHiddenRef.current = false;
        const tokenAgeMs = Date.now() - initResponseTimeRef.current;
        if (!cfTokenRef.current || !nonceRef.current || tokenAgeMs > 60000) {
          retryCountRef.current = 0;
          void startSessionFlow(true);
        }
      }
    };

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        retryCountRef.current = 0;
        void startSessionFlow(true);
      }
    };

    // Mouse pointerdown trap (§5.3: only flag genuine desktop mouse if device has NO touch capability)
    const onGlobalPointerDown = (e: PointerEvent) => {
      const hasTouch =
        (typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints ?? 0) >= 1) ||
        (typeof window !== 'undefined' && 'ontouchstart' in window);
      if (e.pointerType === 'mouse' && e.isTrusted && !hasTouch) {
        setIsBotBlocked(true);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('pointerdown', onGlobalPointerDown, { passive: true });

    return () => {
      unmountedRef.current = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('pointerdown', onGlobalPointerDown);
      clearTimers();
      removeWidget();
      cfTokenRef.current = null;
      nonceRef.current = null;
    };
  }, [clearTimers, removeWidget, startSessionFlow]);

  const restartVerification = useCallback(
    (manualReset = false) => {
      if (manualReset) {
        retryCountRef.current = 0;
        keyIndexRef.current = 0;
      }
      void startSessionFlow(!manualReset);
    },
    [startSessionFlow]
  );

  const wipeSessionSecrets = useCallback(() => {
    clearTimers();
    removeWidget();
    cfTokenRef.current = null;
    nonceRef.current = null;
    setIsReady(false);
  }, [clearTimers, removeWidget]);

  return {
    isReady,
    isBotBlocked,
    setIsBotBlocked,
    uiTimeoutExceeded,
    widgetRef,
    cfTokenRef,
    nonceRef,
    envRef,
    retryCountRef,
    restartVerification,
    wipeSessionSecrets,
  };
}
