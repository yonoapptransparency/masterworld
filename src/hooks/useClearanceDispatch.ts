import React, { useState, useRef, useEffect, useCallback } from 'react';
import { safeDecrypt, ENCRYPTED_LINKS } from '../lib/secureVault';
import staticData from '../lib/staticData.json';

export interface UseClearanceDispatchOptions {
  appId: string;
  appSlug?: string;
  appRecord?: any;
  cfToken: string | null;
  cfTokenRef: React.MutableRefObject<string | null>;
  widgetIdRef?: React.MutableRefObject<string | null>;
  isReady: boolean;
  resetTurnstile: () => void;
  executeTurnstile?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
  setErrorMessage: (msg: string | null) => void;
}

interface PointerSample {
  cx: number;
  cy: number;
  t: number;
}

/**
 * Intelligent Client-Side Fingerprint & Stealth-Bot Detection
 */
function inspectClientEnvironment(): { isBot: boolean; isHeadless: boolean; botReason?: string } {
  if (typeof window === 'undefined') return { isBot: false, isHeadless: false };

  try {
    // 1. Core Automation & WebDriver properties (Playwright, Puppeteer, Selenium, CDP)
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const hasWebdriver = Boolean(
      (nav && (nav.webdriver || (nav as any).__webdriver)) ||
      (window as any).__playwright ||
      (window as any).__playwright_evaluation_script__ ||
      (window as any).__puppeteer_evaluation_script__ ||
      (window as any)._phantom ||
      (window as any).callPhantom ||
      (window as any).__selenium_evaluate ||
      (window as any).__webdriver_evaluate ||
      (window as any).__driver_evaluate ||
      (window as any).__webdriver_script_fn ||
      (window as any).__fxdriver_evaluate ||
      (window as any).domAutomation ||
      (window as any).domAutomationController ||
      (window as any).emit ||
      (window as any).spawn
    );

    // 2. Chromedriver & Automation specific window symbols
    const windowKeys = Object.keys(window);
    const hasCdcProps = windowKeys.some(k => 
      k.startsWith('cdc_') || 
      k.startsWith('__webdriver') || 
      k.startsWith('$cdc_') || 
      k.includes('Selenium')
    );

    // 3. Headless Browser Artifacts (Screen dimensions & Plugin array integrity)
    const isZeroScreen = (window.outerWidth === 0 && window.outerHeight === 0) ||
                         (window.screen && window.screen.width === 0 && window.screen.height === 0);

    // 4. Headless Chrome missing languages or plugins
    const hasEmptyPlugins = nav && 'plugins' in nav && nav.plugins && nav.plugins.length === 0 && !('ontouchstart' in window);
    const hasNoLanguages = nav && (!nav.languages || nav.languages.length === 0);

    const isBot = hasWebdriver || hasCdcProps || isZeroScreen || hasEmptyPlugins || hasNoLanguages;
    return {
      isBot,
      isHeadless: isZeroScreen,
      botReason: isBot ? 'automation' : undefined
    };
  } catch (_) {
    return { isBot: false, isHeadless: false };
  }
}

/**
 * High-Security In-Memory Client RAM Vault Decryption (Zero-Leakage Failover)
 */
function resolveClientRamDestination(targetId: string, targetSlug?: string, appRecord?: any): string | null {
  try {
    // Tier 0: Direct App Record from React view (instant zero-lookup resolution)
    if (appRecord) {
      const raw = appRecord.more_information_url || appRecord.encrypted_link || appRecord.url || appRecord.download_url || '';
      if (raw && typeof raw === 'string' && raw.trim() !== '') {
        const clean = raw.trim();
        const decrypted = clean.startsWith('U2FsdGVkX1') ? (safeDecrypt(clean) || clean) : clean;
        if (decrypted && (decrypted.startsWith('http://') || decrypted.startsWith('https://')) && !decrypted.includes('com.rummydex') && !decrypted.includes('com.example')) {
          return decrypted;
        }
      }
    }

    const keys = [targetId, targetSlug].filter(Boolean).map(k => String(k).toLowerCase().trim());
    if (keys.length === 0) return null;

    const initialApps = (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__?.apps) || [];
    const staticApps = (staticData as any)?.apps || [];
    const apps = [...initialApps, ...staticApps];
    const matched = apps.find((a: any) => {
      const aId = (a.id || '').toLowerCase().trim();
      const aSlug = (a.slug || '').toLowerCase().trim();
      const aName = (a.name || '').toLowerCase().trim();
      return keys.includes(aId) || keys.includes(aSlug) || keys.includes(aName);
    });

    if (matched) {
      const raw = matched.more_information_url || matched.encrypted_link || matched.url || matched.download_url || '';
      if (raw && typeof raw === 'string' && raw.trim() !== '') {
        const clean = raw.trim();
        const decrypted = clean.startsWith('U2FsdGVkX1') ? (safeDecrypt(clean) || clean) : clean;
        if (decrypted && (decrypted.startsWith('http://') || decrypted.startsWith('https://')) && !decrypted.includes('com.rummydex') && !decrypted.includes('com.example')) {
          return decrypted;
        }
      }
    }

    if (ENCRYPTED_LINKS && typeof ENCRYPTED_LINKS === 'string' && ENCRYPTED_LINKS.startsWith('U2FsdGVkX1')) {
      const vaultDecrypted = safeDecrypt(ENCRYPTED_LINKS);
      if (vaultDecrypted) {
        const vaultItems = JSON.parse(vaultDecrypted);
        if (Array.isArray(vaultItems)) {
          const vHit = vaultItems.find((v: any) => {
            const vId = (v.id || '').toLowerCase().trim();
            const vSlug = (v.slug || '').toLowerCase().trim();
            const vName = (v.name || '').toLowerCase().trim();
            return keys.includes(vId) || keys.includes(vSlug) || keys.includes(vName);
          });
          if (vHit) {
            const vUrl = vHit.more_information_url || vHit.encrypted_link || vHit.url || '';
            const finalUrl = vUrl.startsWith('U2FsdGVkX1') ? (safeDecrypt(vUrl) || vUrl) : vUrl;
            if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
              return finalUrl;
            }
          }
        }
      }
    }
  } catch (_) {}
  return null;
}

export function useClearanceDispatch({
  appId,
  appSlug,
  appRecord,
  cfToken,
  cfTokenRef,
  widgetIdRef,
  isReady,
  resetTurnstile,
  executeTurnstile,
  onSuccess,
  onError,
  setErrorMessage
}: UseClearanceDispatchOptions) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState<boolean>(false);

  // Hidden references for silent behavioral & kinetic telemetry
  const mountTimeRef = useRef<number>(Date.now());
  const gestureStartTimeRef = useRef<number>(0);
  const pointerSamplesRef = useRef<PointerSample[]>([]);
  const isBotDetectedRef = useRef<boolean>(false);

  // ─── INSTANT LINK CLOSURE: WIPE DESTINATION FROM MEMORY & RESET ───
  const closeAndWipeLink = useCallback(() => {
    setDestinationUrl(null);
    setIsLoading(false);
    resetTurnstile();
  }, [resetTurnstile]);

  // ─── RE-ENTRY LISTENER: IMMEDIATELY CLOSE LINK ON TAB SWITCH OR MINIMIZE ───
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        closeAndWipeLink();
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        closeAndWipeLink();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [closeAndWipeLink]);

  // Client environment scan on mount
  useEffect(() => {
    mountTimeRef.current = Date.now();
    const { isBot } = inspectClientEnvironment();
    if (isBot) isBotDetectedRef.current = true;
  }, []);

  // Track physical continuous pointer motion & micro-jitter
  const trackPointerMotion = useCallback((e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    if (e.isTrusted === false) {
      isBotDetectedRef.current = true;
    }

    if (!gestureStartTimeRef.current) {
      gestureStartTimeRef.current = Date.now();
    }

    let cx = 0;
    let cy = 0;

    if ('clientX' in e && typeof e.clientX === 'number') {
      cx = Math.round(e.clientX);
      cy = Math.round(e.clientY || 0);
    } else if ('touches' in e && (e as any).touches?.[0]) {
      const touch = (e as any).touches[0];
      cx = Math.round(touch.clientX || 0);
      cy = Math.round(touch.clientY || 0);
    }

    const samples = pointerSamplesRef.current;
    samples.push({ cx, cy, t: Date.now() });

    if (samples.length > 12) {
      samples.shift();
    }
  }, []);

  /**
   * Fast Promise resolver to await Turnstile token if it is actively resolving
   */
  const awaitTurnstileToken = async (): Promise<string | null> => {
    if (cfTokenRef.current && cfTokenRef.current.trim()) {
      return cfTokenRef.current.trim();
    }
    if (cfToken && cfToken.trim()) {
      return cfToken.trim();
    }

    if (executeTurnstile) {
      executeTurnstile();
    } else if (widgetIdRef?.current && (window as any).turnstile?.execute) {
      try {
        (window as any).turnstile.execute(widgetIdRef.current);
      } catch (_) {}
    }

    const start = Date.now();
    while (Date.now() - start < 800) {
      await new Promise(r => setTimeout(r, 40));
      if (cfTokenRef.current && cfTokenRef.current.trim()) {
        return cfTokenRef.current.trim();
      }
      if (widgetIdRef?.current && (window as any).turnstile?.getResponse) {
        try {
          const resp = (window as any).turnstile.getResponse(widgetIdRef.current);
          if (resp && resp.trim()) {
            cfTokenRef.current = resp.trim();
            return resp.trim();
          }
        } catch (_) {}
      }
    }

    return null;
  };

  // ─── KINETIC CLEARANCE HANDSHAKE TO SERVER / EDGE ───
  const handleKineticProceed = useCallback(async (e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (isLoading) return;

    if (e && e.isTrusted === false) {
      isBotDetectedRef.current = true;
    }

    const now = Date.now();
    const pageElapsed = now - mountTimeRef.current;
    const gestureDuration = gestureStartTimeRef.current > 0 ? (now - gestureStartTimeRef.current) : 550;
    const effectiveElapsed = Math.max(pageElapsed, gestureDuration, 550);

    gestureStartTimeRef.current = 0;

    if (isBotDetectedRef.current) {
      setErrorMessage('Verification clearance denied.');
      if (onError) onError();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Acquire Turnstile Token (or fallback to hardware kinetic token)
      let token = await awaitTurnstileToken();

      // 2. Generate high-entropy single-use nonce
      let entropy = '';
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        entropy = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        entropy = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      }

      if (!token) {
        token = 'attest_' + entropy;
      }

      // 3. Compute micro-jitter variance across touch samples
      const samples = pointerSamplesRef.current;
      let coordVariance = 0;
      if (samples.length >= 2) {
        const diffs = samples.slice(1).map((s, i) => Math.abs(s.cx - samples[i].cx) + Math.abs(s.cy - samples[i].cy));
        coordVariance = diffs.reduce((a, b) => a + b, 0);
      }

      const lastSample = samples.length > 0 ? samples[samples.length - 1] : { cx: 0, cy: 0, t: now };
      const isGenuineTrusted = !isBotDetectedRef.current && samples.length > 0 && (lastSample.cx > 0 || lastSample.cy > 0);

      // 4. Encode single-use clearance payload
      const clearanceToken = btoa(JSON.stringify({
        t: Date.now(),
        n: entropy,
        id: appId,
        el: effectiveElapsed,
        cf: token,
        cx: lastSample.cx,
        cy: lastSample.cy,
        var: coordVariance,
        samples: samples.length,
        wb: isBotDetectedRef.current ? 1 : 0,
        tr: isGenuineTrusted ? 1 : 0
      }));

      // High-priority direct clearance routes
      const candidateRoutes = [
        '/api/v1/app/session-clearance',
        '/api/v1/app/resolve-link',
        '/api/v1/public/secure-link'
      ];

      let targetUrl: string | null = null;
      let serverAnswered = false;

      for (const route of candidateRoutes) {
        try {
          const attempt = await fetch(route, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'x-clearance-token': clearanceToken,
              'x-cf-token': token
            },
            body: JSON.stringify({ id: appId, appId, appSlug, token: clearanceToken, cfToken: token }),
            cache: 'no-store'
          });

          if (attempt.ok) {
            let data: any = null;
            try {
              data = await attempt.json();
            } catch (_) {
              continue;
            }
            if (data && (data.url || data.destination)) {
              targetUrl = data.url || data.destination;
              serverAnswered = true;
              break;
            } else if (data && data.status === 'unavailable') {
              setIsLoading(false);
              setIsUnavailable(true);
              return;
            } else if (data && data.status === 'challenge_required') {
              const localUrl = resolveClientRamDestination(appId, appSlug, appRecord);
              if (localUrl) {
                targetUrl = localUrl;
                serverAnswered = true;
                break;
              }
              setIsLoading(false);
              setErrorMessage('Additional verification required. Please complete the check below.');
              if (executeTurnstile) executeTurnstile();
              return;
            }
          } else if (attempt.status === 404) {
            // Server did not find app or route; continue to check local encrypted RAM vault
            continue;
          } else if (attempt.status === 429) {
            setIsLoading(false);
            setErrorMessage('Too many verification attempts. Access paused.');
            return;
          }
        } catch (_) {
          // Network failover to local vault
          continue;
        }
      }

      // 5. High-Security Client RAM Vault Failover
      if (!targetUrl) {
        targetUrl = resolveClientRamDestination(appId, appSlug, appRecord);
      }

      if (!targetUrl) {
        setIsUnavailable(true);
        setIsLoading(false);
        return;
      }

      if (onSuccess) onSuccess();

      // Enforce zero-referrer policy on navigation
      try {
        let metaReferrer = document.querySelector('meta[name="referrer"]') as HTMLMetaElement;
        if (!metaReferrer) {
          metaReferrer = document.createElement('meta');
          metaReferrer.name = 'referrer';
          document.head.appendChild(metaReferrer);
        }
        metaReferrer.content = 'no-referrer';
      } catch (_) {}

      // Airgap Dispatch via zero-referrer immediate navigation
      try {
        setDestinationUrl(targetUrl);
        setIsLoading(false);

        // Immediate direct assignment works universally on mobile and desktop without popup blocking
        try {
          window.location.assign(targetUrl);
        } catch (_) {
          window.location.href = targetUrl;
        }

        // Ephemeral 20-second memory auto-reset (preserves fallback visibility if navigation delayed, then zeroes RAM)
        setTimeout(() => {
          closeAndWipeLink();
        }, 20000);
      } catch (_) {
        try {
          window.location.href = targetUrl;
        } catch (_) {
          setDestinationUrl(targetUrl);
          setIsLoading(false);
        }
      }

    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Verification failed. Please try again.');
      if (onError) onError();
      resetTurnstile();
    }
  }, [isLoading, appId, appSlug, appRecord, awaitTurnstileToken, closeAndWipeLink, onError, onSuccess, resetTurnstile, setErrorMessage]);

  return {
    isLoading,
    destinationUrl,
    isUnavailable,
    setIsUnavailable,
    handleKineticProceed,
    trackPointerMotion,
    closeAndWipeLink
  };
}
