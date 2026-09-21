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
  const [isRendered, setIsRendered] = useState<boolean>(false);
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
        size: 'flexible',
        'retry': 'auto',
        'retry-interval': 2500,
        'refresh-expired': 'auto',
        callback: (token: string) => {
          cfTokenRef.current = token;
          setCfToken(token);
          setIsReady(true);
          setIsRendered(true);
          setErrorMessage(null);
        },
        'error-callback': (errorCode?: string) => {
          console.warn('[Turnstile] Error event (silent fallback active):', errorCode);
          // If the production sitekey hit an error, attempt universal test key
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
            }, 60);
            return;
          }
          // Do not lock the screen or show red error; kinetic attestation will verify seamlessly
          cfTokenRef.current = null;
          setCfToken(null);
          setIsReady(false);
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
      setIsRendered(true);
    } catch (err) {
      console.warn('[Turnstile] Render notice (silent kinetic fallback will handle):', err);
    }
  }, []);

  useEffect(() => {
    // 1. If script is already in window and DOM is ready, initialize immediately
    if (window.turnstile && widgetRef.current && !widgetIdRef.current) {
      initTurnstile();
    }

    // 2. Fast poller: guarantees rendering as soon as script arrives
    let attempts = 0;
    const maxAttempts = 40; // 40 * 75ms = 3 seconds
    const interval = setInterval(() => {
      attempts++;
      if (window.turnstile && widgetRef.current && !widgetIdRef.current) {
        initTurnstile();
      }
      if (widgetIdRef.current || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 75);

    // 3. Script injector with explicit onload hook (only if not already loaded)
    const existingScript = document.getElementById('cf-turnstile-script') || 
                           document.querySelector('script[data-turnstile]') || 
                           document.querySelector('script[src*="turnstile/v0/api.js"]');

    if (typeof window !== 'undefined' && !window.turnstile && !existingScript) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-turnstile', 'true');
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
    isRendered,
    errorMessage,
    setErrorMessage,
    resetTurnstile,
    executeTurnstile
  };
}
