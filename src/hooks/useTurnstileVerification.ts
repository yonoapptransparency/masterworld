import { useState, useEffect, useRef, useCallback, type MutableRefObject } from 'react';
import {
  TURNSTILE_ACTION,
  NONCE_REFRESH_MS,
  CLIENT_TAP_HOLD_MS,
  TURNSTILE_UI_TIMEOUT_MS,
  TURNSTILE_RETRY_INTERVAL_MS,
  TURNSTILE_SCRIPT_STALL_MS,
  TURNSTILE_WIDGET_STALL_MS,
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
  isDispatchingRef?: MutableRefObject<boolean>;
}

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const scriptLoadCallbacks = new Set<() => void>();
const scriptErrorCallbacks = new Set<() => void>();

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

/**
 * Warms only the DNS/TLS connection to challenges.cloudflare.com at runtime
 * for real mobile users without downloading api.js or touching static HTML.
 */
export function preconnectTurnstileOnly(): void {
  if (typeof window === 'undefined') return;
  ensureTurnstilePreconnect();
}

function isConstrainedClient(): boolean {
  if (typeof navigator === 'undefined') return false;
  try {
    const conn = (
      navigator as unknown as {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
          rtt?: number;
          downlink?: number;
        };
      }
    ).connection;
    if (conn) {
      if (conn.saveData) return true;
      const et = String(conn.effectiveType || '').toLowerCase();
      if (et === 'slow-2g' || et === '2g' || et === '3g') return true;
      if (typeof conn.rtt === 'number' && conn.rtt >= 400) return true;
      if (typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 1.5) return true;
    }
    const dm = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (typeof dm === 'number' && dm > 0 && dm <= 3) return true;
    const hc = navigator.hardwareConcurrency;
    if (typeof hc === 'number' && hc > 0 && hc <= 4) return true;
  } catch {
    // Ignore capability read errors
  }
  return false;
}

export function ensureTurnstileScriptLoaded(forceReload = false, bustCache = false): void {
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
    // Only cache-bust when an actual script load error occurred so slow cellular connections reuse browser HTTP cache
    s.src = bustCache
      ? `${TURNSTILE_SCRIPT_SRC}&retry=${Date.now() % 100000}`
      : TURNSTILE_SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    try {
      (s as unknown as { fetchPriority?: string }).fetchPriority = 'high';
    } catch {
      // Older browsers without fetchPriority support
    }
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
      scriptErrorCallbacks.forEach((cb) => {
        try {
          cb();
        } catch {
          // Ignore callback error
        }
      });
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
  aborted: boolean;
  startedAtMs: number;
  completedAtMs: number;
}

const preflightSessionCache = new Map<
  string,
  { promise: Promise<SessionInitOutcome>; startedAtMs: number }
>();

async function fetchSessionInitOnce(
  safeAppId: string,
  externalSignal?: AbortSignal
): Promise<SessionInitOutcome> {
  const startedAtMs = Date.now();
  const controller = new AbortController();
  let abortedByCaller = false;

  const onExternalAbort = () => {
    abortedByCaller = true;
    controller.abort();
  };
  if (externalSignal) {
    if (externalSignal.aborted) {
      return {
        ok: false,
        status: 0,
        nonce: null,
        retry: false,
        aborted: true,
        startedAtMs,
        completedAtMs: Date.now(),
      };
    }
    externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  const initTimeoutMs = isConstrainedClient()
    ? Math.max(SESSION_INIT_TIMEOUT_MS, 18000)
    : SESSION_INIT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), initTimeoutMs);
  try {
    const reqInit: RequestInit & { priority?: string } = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ appId: safeAppId }),
      signal: controller.signal,
      priority: 'high',
    };
    const res = await fetch('/api/v1/app/session-init', reqInit);
    const completedAtMs = Date.now();
    if (res.status === 404) {
      return {
        ok: false,
        status: 404,
        nonce: null,
        retry: false,
        aborted: false,
        startedAtMs,
        completedAtMs,
      };
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.status === 'retry' || typeof data.nonce !== 'string') {
      return {
        ok: false,
        status: res.status,
        nonce: null,
        retry: true,
        aborted: false,
        startedAtMs,
        completedAtMs,
      };
    }
    return {
      ok: true,
      status: res.status,
      nonce: data.nonce.trim(),
      retry: false,
      aborted: false,
      startedAtMs,
      completedAtMs,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      nonce: null,
      retry: !abortedByCaller,
      aborted: abortedByCaller,
      startedAtMs,
      completedAtMs: Date.now(),
    };
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
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

const KEY_OR_DOMAIN_ERROR_CODES = new Set(['110100', '110110', '110200', '400020']);

function getProgressiveBackoffMs(attempt: number): number {
  const schedule = [300, 800, 1600, 2500];
  const base = schedule[Math.min(Math.max(0, attempt - 1), schedule.length - 1)];
  return base + Math.floor(Math.random() * 120);
}

export function useTurnstileVerification({
  appId,
  adminTurnstileSiteKey,
  isDispatchingRef,
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
  const isInteractiveRef = useRef<boolean>(false);
  const uiTimeoutExceededRef = useRef<boolean>(false);
  const isBotBlockedRef = useRef<boolean>(false);
  uiTimeoutExceededRef.current = uiTimeoutExceeded;
  isBotBlockedRef.current = isBotBlocked;

  const adminSiteKeyRef = useRef<string | undefined>(adminTurnstileSiteKey);
  adminSiteKeyRef.current = adminTurnstileSiteKey;
  const prevAdminSiteKeyRef = useRef<string | undefined>(adminTurnstileSiteKey);

  // Monotonic generation ID + active abort/script-callback handles to prevent overlapping flow races
  const runIdRef = useRef<number>(0);
  const activeAbortRef = useRef<AbortController | null>(null);
  const activeScriptLoadCbRef = useRef<(() => void) | null>(null);
  const activeScriptErrorCbRef = useRef<(() => void) | null>(null);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uiTimeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const widgetStallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scriptWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    if (widgetStallTimerRef.current) {
      clearTimeout(widgetStallTimerRef.current);
      widgetStallTimerRef.current = null;
    }
    if (scriptWaitTimerRef.current) {
      clearTimeout(scriptWaitTimerRef.current);
      scriptWaitTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const detachScriptCallbacks = useCallback(() => {
    if (activeScriptLoadCbRef.current) {
      scriptLoadCallbacks.delete(activeScriptLoadCbRef.current);
      activeScriptLoadCbRef.current = null;
    }
    if (activeScriptErrorCbRef.current) {
      scriptErrorCallbacks.delete(activeScriptErrorCbRef.current);
      activeScriptErrorCbRef.current = null;
    }
  }, []);

  const abortInFlightInit = useCallback(() => {
    if (activeAbortRef.current) {
      try {
        activeAbortRef.current.abort();
      } catch {
        // Ignore abort errors
      }
      activeAbortRef.current = null;
    }
  }, []);

  const removeWidget = useCallback(() => {
    isInteractiveRef.current = false;
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

  const markTokenReady = useCallback((expectedRunId: number) => {
    if (unmountedRef.current || expectedRunId !== runIdRef.current) return;
    if (!cfTokenRef.current || !nonceRef.current) {
      setIsReady(false);
      return;
    }
    if (uiTimeoutTimerRef.current) {
      clearTimeout(uiTimeoutTimerRef.current);
      uiTimeoutTimerRef.current = null;
    }
    if (widgetStallTimerRef.current) {
      clearTimeout(widgetStallTimerRef.current);
      widgetStallTimerRef.current = null;
    }
    isInteractiveRef.current = false;
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
        if (
          !unmountedRef.current &&
          expectedRunId === runIdRef.current &&
          cfTokenRef.current &&
          nonceRef.current
        ) {
          setIsReady(true);
        }
      }, remainingHold);
    }
  }, []);

  const startSessionFlow = useCallback(
    async (isSilentRetry = false, forceScriptReload = false) => {
      if (unmountedRef.current || !appId) return;

      // Increment generation ID so any prior overlapping run immediately yields
      const myRunId = ++runIdRef.current;
      const isStale = () => unmountedRef.current || myRunId !== runIdRef.current;

      abortInFlightInit();
      detachScriptCallbacks();
      clearTimers();
      removeWidget();
      ensureTurnstileScriptLoaded(forceScriptReload);

      cfTokenRef.current = null;
      nonceRef.current = null;
      setIsReady(false);
      // Always clear any prior timeout state when starting/retrying verification
      setUiTimeoutExceeded(false);

      const abortController = new AbortController();
      activeAbortRef.current = abortController;

      const scheduleSafeRetry = (delayMs: number, reloadScript = false) => {
        if (isStale()) return;
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          if (!isStale()) {
            void startSessionFlow(true, reloadScript);
          }
        }, delayMs);
      };

      const constrained = isConstrainedClient();
      const adaptiveUiTimeoutMs = constrained
        ? Math.max(TURNSTILE_UI_TIMEOUT_MS, 55000)
        : TURNSTILE_UI_TIMEOUT_MS;
      const adaptiveScriptStallMs = constrained
        ? Math.max(TURNSTILE_SCRIPT_STALL_MS, 18000)
        : TURNSTILE_SCRIPT_STALL_MS;
      const adaptiveWidgetStallMs = constrained
        ? Math.max(TURNSTILE_WIDGET_STALL_MS, 55000)
        : TURNSTILE_WIDGET_STALL_MS;

      // UI Timeout guard (§5.5: guards script load & session-init before widget mounts)
      uiTimeoutTimerRef.current = setTimeout(() => {
        if (!isStale() && !cfTokenRef.current && !widgetIdRef.current) {
          setUiTimeoutExceeded(true);
        }
      }, adaptiveUiTimeoutMs);

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
          sessionInitPromise = fetchSessionInitOnce(safeAppId, abortController.signal);
        }

        initResponseTimeRef.current = Date.now();

        // 1 & 2. Run frozen hardware probe (§5.3) and server nonce request (§5.4) concurrently
        let [env, initOutcome] = await Promise.all([collectEnv(), sessionInitPromise]);
        if (isStale()) return;
        envRef.current = env;

        if (env.gate.failed) {
          clearTimers();
          setIsBotBlocked(true);
          return;
        }

        // If a pre-warmed request failed due to a transient blip during navigation, transparently retry once right away
        if (!initOutcome.ok && !initOutcome.aborted && initOutcome.status !== 404 && cachedPreflight) {
          initOutcome = await fetchSessionInitOnce(safeAppId, abortController.signal);
          if (isStale()) return;
        }

        if (initOutcome.aborted) return;

        // Record client-monotonic midpoint of the session-init round-trip for clock-skew-proof dwell accounting
        initResponseTimeRef.current = Math.round(
          (initOutcome.startedAtMs + initOutcome.completedAtMs) / 2
        );

        if (initOutcome.status === 404) {
          clearTimers();
          if (retryCountRef.current < SESSION_RETRY_MAX) {
            retryCountRef.current += 1;
            scheduleSafeRetry(getProgressiveBackoffMs(retryCountRef.current));
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
            scheduleSafeRetry(getProgressiveBackoffMs(retryCountRef.current));
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
        // Defers cleanly if a human is actively interacting with a challenge or dispatching clearance
        const scheduleIdleRefresh = (delayMs: number) => {
          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(() => {
            if (isStale()) return;
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            if (isDispatchingRef?.current || isInteractiveRef.current) {
              scheduleIdleRefresh(15000);
              return;
            }
            retryCountRef.current = 0;
            void startSessionFlow(true);
          }, delayMs);
        };
        scheduleIdleRefresh(NONCE_REFRESH_MS);

        let scriptAttemptStartMs = Date.now();
        let scriptReloadAttempts = 0;
        let localWidgetRetries = 0;

        const armWidgetStallWatchdog = (delayMs: number) => {
          if (widgetStallTimerRef.current) clearTimeout(widgetStallTimerRef.current);
          widgetStallTimerRef.current = setTimeout(() => {
            if (isStale() || cfTokenRef.current) return;
            // Never interrupt a real user actively solving an interactive checkbox/challenge
            if (isInteractiveRef.current) {
              armWidgetStallWatchdog(15000);
              return;
            }
            if (retryCountRef.current < SESSION_RETRY_MAX) {
              retryCountRef.current += 1;
              void startSessionFlow(true, !window.turnstile);
            } else {
              removeWidget();
              setUiTimeoutExceeded(true);
            }
          }, delayMs);
        };

        // 3. Render Turnstile with hardware commitment cData = `${appId}_${nid}_${hw}` (§5.5)
        const renderTurnstileWidget = () => {
          if (isStale()) return;
          if (!window.turnstile || !widgetRef.current) {
            // Only re-inject if script genuinely stalled while online (never kill a live slow download prematurely)
            const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
            if (
              !window.turnstile &&
              isOnline &&
              scriptReloadAttempts < 2 &&
              Date.now() - scriptAttemptStartMs > adaptiveScriptStallMs
            ) {
              scriptReloadAttempts += 1;
              scriptAttemptStartMs = Date.now();
              ensureTurnstileScriptLoaded(true, false);
            }
            // s.onload triggers renderTurnstileWidget immediately at 0ms; 250ms fallback saves 80% timer wakeups on low-end CPUs
            scriptWaitTimerRef.current = setTimeout(renderTurnstileWidget, 250);
            return;
          }

          detachScriptCallbacks();
          if (scriptWaitTimerRef.current) {
            clearTimeout(scriptWaitTimerRef.current);
            scriptWaitTimerRef.current = null;
          }

          removeWidget();

          const currentCandidates = resolveCandidateSiteKeys();
          if (currentCandidates.length === 0) {
            clearTimers();
            setUiTimeoutExceeded(true);
            return;
          }
          const idx = Math.min(keyIndexRef.current, currentCandidates.length - 1);
          const sitekey = currentCandidates[idx];

          const onWidgetError = (errorCode?: string | number) => {
            if (isStale()) return;
            cfTokenRef.current = null;
            widgetIdRef.current = null;
            isInteractiveRef.current = false;
            setIsReady(false);

            const codeStr = String(errorCode ?? '').trim();
            const isKeyOrDomainErr = KEY_OR_DOMAIN_ERROR_CODES.has(codeStr);

            // Rotate sitekey ONLY on key/domain errors (reusing the still-valid nonce with 0 extra RTT!)
            if (isKeyOrDomainErr && keyIndexRef.current + 1 < currentCandidates.length) {
              keyIndexRef.current += 1;
              renderTurnstileWidget();
              return;
            }

            // If device just lost cellular signal, let the online event listener recover cleanly instead of burning retries
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
              return;
            }

            // On transient network/challenge error while nonce is still fresh (<75s), re-render gently without wasting a session-init RTT
            const nonceAgeMs = Date.now() - initResponseTimeRef.current;
            if (nonceRef.current && nonceAgeMs < 75000 && localWidgetRetries < 2) {
              localWidgetRetries += 1;
              const backoffMs = (constrained ? 2000 : 1200) * localWidgetRetries;
              if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
              retryTimerRef.current = setTimeout(() => {
                if (!isStale()) renderTurnstileWidget();
              }, backoffMs);
              return;
            }

            if (retryCountRef.current < SESSION_RETRY_MAX) {
              retryCountRef.current += 1;
              scheduleSafeRetry(getProgressiveBackoffMs(retryCountRef.current));
            } else {
              removeWidget();
              setUiTimeoutExceeded(true);
            }
          };

          const softReinit = () => {
            if (isStale()) return;
            cfTokenRef.current = null;
            widgetIdRef.current = null;
            isInteractiveRef.current = false;
            setIsReady(false);
            if (retryCountRef.current < SESSION_RETRY_MAX) {
              retryCountRef.current += 1;
              scheduleSafeRetry(300);
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
              retry: 'auto',
              'retry-interval': TURNSTILE_RETRY_INTERVAL_MS,
              'refresh-expired': 'auto',
              'refresh-timeout': 'auto',
              'before-interactive-callback': () => {
                if (!isStale()) isInteractiveRef.current = true;
              },
              'after-interactive-callback': () => {
                if (!isStale()) isInteractiveRef.current = false;
              },
              callback: (t: string) => {
                if (isStale()) return;
                cfTokenRef.current = t;
                retryCountRef.current = 0;
                localWidgetRetries = 0;
                markTokenReady(myRunId);
              },
              'error-callback': onWidgetError,
              'expired-callback': softReinit,
              'timeout-callback': softReinit,
            });
            widgetIdRef.current = id;
            armWidgetStallWatchdog(adaptiveWidgetStallMs);
          } catch {
            onWidgetError();
          }
        };

        // React immediately to script load OR network error
        const onScriptError = () => {
          if (isStale() || window.turnstile) return;
          if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
          if (scriptReloadAttempts < 3) {
            scriptReloadAttempts += 1;
            const backoffMs = scriptReloadAttempts === 1 ? 1000 : scriptReloadAttempts === 2 ? 2500 : 4500;
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            retryTimerRef.current = setTimeout(() => {
              if (!isStale() && !window.turnstile) {
                scriptAttemptStartMs = Date.now();
                ensureTurnstileScriptLoaded(true, true);
              }
            }, backoffMs);
          } else {
            detachScriptCallbacks();
            clearTimers();
            setUiTimeoutExceeded(true);
          }
        };

        if (!window.turnstile) {
          activeScriptLoadCbRef.current = renderTurnstileWidget;
          activeScriptErrorCbRef.current = onScriptError;
          scriptLoadCallbacks.add(renderTurnstileWidget);
          scriptErrorCallbacks.add(onScriptError);
        }
        renderTurnstileWidget();
      } catch {
        if (!isStale()) {
          if (retryCountRef.current < SESSION_RETRY_MAX) {
            retryCountRef.current += 1;
            scheduleSafeRetry(getProgressiveBackoffMs(retryCountRef.current));
          } else {
            clearTimers();
            setUiTimeoutExceeded(true);
          }
        }
      }
    },
    [
      abortInFlightInit,
      appId,
      clearTimers,
      detachScriptCallbacks,
      isDispatchingRef,
      markTokenReady,
      removeWidget,
      resolveCandidateSiteKeys,
    ]
  );

  // Only restart if adminTurnstileSiteKey ACTUALLY changes after initial mount to a different real key
  // (Prevents the duplicate concurrent mount race that previously aborted preflightSessionCache)
  useEffect(() => {
    const prevKey = prevAdminSiteKeyRef.current;
    prevAdminSiteKeyRef.current = adminTurnstileSiteKey;
    if (
      adminTurnstileSiteKey &&
      adminTurnstileSiteKey !== prevKey &&
      isRealTurnstileKey(adminTurnstileSiteKey) &&
      !cfTokenRef.current &&
      !widgetIdRef.current
    ) {
      retryCountRef.current = 0;
      keyIndexRef.current = 0;
      void startSessionFlow(true);
    }
  }, [adminTurnstileSiteKey, startSessionFlow]);

  // Initial mount + visibilitychange (hidden -> visible), pageshow (persisted), and online auto-recovery (§5.9)
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
        if (isDispatchingRef?.current || isInteractiveRef.current || isBotBlockedRef.current) {
          return;
        }
        const tokenAgeMs = Date.now() - initResponseTimeRef.current;
        const needsRecovery =
          uiTimeoutExceededRef.current ||
          !nonceRef.current ||
          (!cfTokenRef.current && !widgetIdRef.current) ||
          tokenAgeMs > 60000;
        if (needsRecovery) {
          retryCountRef.current = 0;
          void startSessionFlow(true, !window.turnstile);
        }
      }
    };

    const onOnline = () => {
      if (
        unmountedRef.current ||
        isBotBlockedRef.current ||
        isDispatchingRef?.current ||
        cfTokenRef.current
      ) {
        return;
      }
      // Mobile device just regained cellular/Wi-Fi signal — recover immediately instead of staying stalled
      if (uiTimeoutExceededRef.current || !window.turnstile || !nonceRef.current) {
        retryCountRef.current = 0;
        void startSessionFlow(true, !window.turnstile);
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
    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('pointerdown', onGlobalPointerDown, { passive: true });

    return () => {
      unmountedRef.current = true;
      runIdRef.current += 1;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('pointerdown', onGlobalPointerDown);
      abortInFlightInit();
      detachScriptCallbacks();
      clearTimers();
      removeWidget();
      cfTokenRef.current = null;
      nonceRef.current = null;
    };
  }, [
    abortInFlightInit,
    clearTimers,
    detachScriptCallbacks,
    isDispatchingRef,
    removeWidget,
    startSessionFlow,
  ]);

  const restartVerification = useCallback(
    (manualReset = false) => {
      if (manualReset) {
        retryCountRef.current = 0;
        keyIndexRef.current = 0;
      }
      const needsScriptReload = manualReset && !window.turnstile;
      void startSessionFlow(!manualReset, needsScriptReload);
    },
    [startSessionFlow]
  );

  const wipeSessionSecrets = useCallback(() => {
    runIdRef.current += 1;
    abortInFlightInit();
    detachScriptCallbacks();
    clearTimers();
    removeWidget();
    cfTokenRef.current = null;
    nonceRef.current = null;
    setIsReady(false);
  }, [abortInFlightInit, clearTimers, detachScriptCallbacks, removeWidget]);

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
