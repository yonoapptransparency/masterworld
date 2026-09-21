import { useState, useRef, useEffect, useCallback } from 'react';

const PROD_TURNSTILE_SITE_KEY = '0x4AAAAAAE99nFmDXDivmDJV';
const TEST_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

export function isValidTurnstileKey(key: string | undefined | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return /^(0x4|1x|2x|3x)[a-zA-Z0-9_-]{10,60}$/.test(trimmed);
}

export function getTurnstileSiteKey(): string {
  if (typeof window !== 'undefined') {
    const customKey = 
      (import.meta.env?.VITE_TURNSTILE_SITE_KEY as string) || 
      (import.meta.env?.VITE_CF_TURNSTILE_SITE_KEY as string);
    if (isValidTurnstileKey(customKey)) return customKey.trim();

    const host = window.location.hostname.toLowerCase();
    if (host === 'rummydex.com' || host === 'www.rummydex.com') {
      return PROD_TURNSTILE_SITE_KEY;
    }
    // Development, preview, and Cloud Run environments use universal interactive test key
    return TEST_TURNSTILE_SITE_KEY;
  }
  return PROD_TURNSTILE_SITE_KEY;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, any>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId: string, options?: Record<string, any>) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
    onTurnstileLoad?: () => void;
  }
}

export interface UseTurnstileOptions {
  onError?: () => void;
}

export function useTurnstileVerification(options?: UseTurnstileOptions) {
  const [cfToken, setCfToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const cfTokenRef = useRef<string | null>(null);
  const activeKeyRef = useRef<string>(getTurnstileSiteKey());

  const resetTurnstile = useCallback(() => {
    setCfToken(null);
    cfTokenRef.current = null;
    setIsReady(false);
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (_) {}
    }
  }, []);

  const executeTurnstile = useCallback(() => {
    if (widgetIdRef.current && window.turnstile?.execute) {
      try {
        window.turnstile.execute(widgetIdRef.current);
      } catch (_) {}
    }
  }, []);

  const initTurnstile = useCallback(() => {
    if (!widgetRef.current || !window.turnstile || widgetIdRef.current) return;

    try {
      widgetRef.current.innerHTML = '';
      const siteKey = activeKeyRef.current;

      const wid = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        size: 'normal',
        'retry': 'auto',
        'retry-interval': 3000,
        'refresh-expired': 'auto',
        callback: (token: string) => {
          cfTokenRef.current = token;
          setCfToken(token);
          setIsReady(true);
          setErrorMessage(null);
        },
        'error-callback': (errorCode?: string) => {
          console.warn('[Turnstile] Error event:', errorCode);
          // Resilient fallback to universal interactive test key in preview/dev
          if (activeKeyRef.current !== TEST_TURNSTILE_SITE_KEY) {
            activeKeyRef.current = TEST_TURNSTILE_SITE_KEY;
            if (widgetIdRef.current && window.turnstile) {
              try {
                window.turnstile.remove(widgetIdRef.current);
              } catch (_) {}
              widgetIdRef.current = null;
            }
            if (widgetRef.current) {
              widgetRef.current.innerHTML = '';
            }
            setTimeout(() => {
              if (widgetRef.current && window.turnstile && !widgetIdRef.current) {
                initTurnstile();
              }
            }, 80);
            return;
          }
          cfTokenRef.current = null;
          setCfToken(null);
          setIsReady(false);
          setErrorMessage('Verification was interrupted. Please tap Proceed to retry.');
          if (options?.onError) options.onError();
        },
        'expired-callback': () => {
          cfTokenRef.current = null;
          setCfToken(null);
          setIsReady(false);
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.reset(widgetIdRef.current);
            } catch (_) {}
          }
        },
        'timeout-callback': () => {
          cfTokenRef.current = null;
          setCfToken(null);
          setIsReady(false);
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.reset(widgetIdRef.current);
            } catch (_) {}
          }
        }
      });
      widgetIdRef.current = wid;
    } catch (err) {
      console.warn('[Turnstile] Render failed:', err);
      if (activeKeyRef.current !== TEST_TURNSTILE_SITE_KEY) {
        activeKeyRef.current = TEST_TURNSTILE_SITE_KEY;
        if (widgetRef.current) {
          widgetRef.current.innerHTML = '';
        }
        widgetIdRef.current = null;
        setTimeout(() => {
          if (widgetRef.current && window.turnstile && !widgetIdRef.current) {
            initTurnstile();
          }
        }, 100);
      }
    }
  }, [options]);

  useEffect(() => {
    // 1. If script is already in window and DOM is ready, initialize immediately
    if (window.turnstile && widgetRef.current && !widgetIdRef.current) {
      initTurnstile();
    }

    // 2. Fast poller: guarantees rendering as soon as script arrives
    let attempts = 0;
    const maxAttempts = 50; // 50 * 80ms = 4 seconds
    const interval = setInterval(() => {
      attempts++;
      if (window.turnstile && widgetRef.current && !widgetIdRef.current) {
        initTurnstile();
      }
      if (widgetIdRef.current || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 80);

    // 3. Script injector with explicit onload hook
    if (typeof window !== 'undefined' && !window.turnstile && !document.querySelector('script[data-turnstile]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-turnstile', 'true');
      script.onerror = () => {
        setErrorMessage('Verification service could not be loaded. Please check your network.');
      };
      window.onTurnstileLoad = () => {
        if (widgetRef.current && window.turnstile && !widgetIdRef.current) {
          initTurnstile();
        }
      };
      document.head.appendChild(script);
    } else if (window.onTurnstileLoad === undefined) {
      window.onTurnstileLoad = () => {
        if (widgetRef.current && window.turnstile && !widgetIdRef.current) {
          initTurnstile();
        }
      };
    }

    return () => {
      clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [initTurnstile]);

  return {
    widgetRef,
    widgetIdRef,
    cfToken,
    cfTokenRef,
    isReady,
    errorMessage,
    setErrorMessage,
    resetTurnstile,
    executeTurnstile
  };
}
