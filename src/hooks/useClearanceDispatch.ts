import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface UseClearanceDispatchOptions {
  appId: string;
  appSlug?: string;
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

    // Headless Chrome missing languages or plugins
    const hasEmptyPlugins = nav && 'plugins' in nav && nav.plugins && nav.plugins.length === 0 && !('ontouchstart' in window);
    const hasNoLanguages = nav && (!nav.languages || nav.languages.length === 0);

    // 4. Headless WebGL Software Rasterizer Detection
    let isSoftwareGpu = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
          if (
            renderer.includes('swiftshader') ||
            renderer.includes('llvmpipe') ||
            renderer.includes('mesa offscreen') ||
            renderer.includes('software rasterizer') ||
            renderer.includes('vmware') ||
            renderer.includes('virtualbox')
          ) {
            isSoftwareGpu = true;
          }
        }
      }
    } catch (_) {}

    const isBot = hasWebdriver || hasCdcProps || isZeroScreen || hasEmptyPlugins || hasNoLanguages;
    const isHeadless = isSoftwareGpu;

    return {
      isBot,
      isHeadless,
      botReason: isBot ? 'automation' : isHeadless ? 'headless_gpu' : undefined
    };
  } catch (_) {
    return { isBot: false, isHeadless: false };
  }
}

export function useClearanceDispatch({
  appId,
  appSlug,
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
  const isHeadlessDetectedRef = useRef<boolean>(false);

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
    const { isBot, isHeadless } = inspectClientEnvironment();
    if (isBot) isBotDetectedRef.current = true;
    if (isHeadless) isHeadlessDetectedRef.current = true;
  }, []);

  // Track physical continuous pointer motion & micro-jitter
  const trackPointerMotion = useCallback((e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
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

    // Keep the most recent 12 touch points
    if (samples.length > 12) {
      samples.shift();
    }
  }, []);

  /**
   * Fast Promise resolver to await Turnstile token if it is actively running during the hold
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
    } else if (widgetIdRef?.current && window.turnstile?.execute) {
      try {
        window.turnstile.execute(widgetIdRef.current);
      } catch (_) {}
    }

    const start = Date.now();
    while (Date.now() - start < 800) {
      await new Promise(r => setTimeout(r, 40));
      if (cfTokenRef.current && cfTokenRef.current.trim()) {
        return cfTokenRef.current.trim();
      }
      if (widgetIdRef?.current && window.turnstile?.getResponse) {
        try {
          const resp = window.turnstile.getResponse(widgetIdRef.current);
          if (resp && resp.trim()) {
            cfTokenRef.current = resp.trim();
            return resp.trim();
          }
        } catch (_) {}
      }
    }

    return null;
  };

  // ─── KINETIC CLEARANCE HANDSHAKE TO SERVER ───
  const handleKineticProceed = useCallback(async () => {
    if (isLoading) return;

    const now = Date.now();
    const pageElapsed = now - mountTimeRef.current;
    const gestureDuration = gestureStartTimeRef.current > 0 ? (now - gestureStartTimeRef.current) : 550;
    const effectiveElapsed = Math.max(pageElapsed, gestureDuration, 550);

    // Reset gesture tracker
    gestureStartTimeRef.current = 0;

    if (isBotDetectedRef.current) {
      setErrorMessage('Verification clearance denied.');
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

      // 3. Compute micro-jitter variance across the physical touch samples
      const samples = pointerSamplesRef.current;
      let coordVariance = 0;
      if (samples.length >= 2) {
        const diffs = samples.slice(1).map((s, i) => Math.abs(s.cx - samples[i].cx) + Math.abs(s.cy - samples[i].cy));
        coordVariance = diffs.reduce((a, b) => a + b, 0);
      }

      const lastSample = samples.length > 0 ? samples[samples.length - 1] : { cx: 140, cy: 300, t: now };

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
        hl: isHeadlessDetectedRef.current ? 1 : 0,
        tr: 1 // Human physical hold
      }));

      // High-priority direct clearance route with fallback
      const candidateRoutes = [
        '/api/v1/app/session-clearance',
        '/api/v1/app/resolve-link'
      ];

      let res: Response | null = null;
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
            body: JSON.stringify({ id: appId, appId, token: clearanceToken, cfToken: token }),
            cache: 'no-store',
            credentials: 'same-origin'
          });

          res = attempt;
          if (attempt.status === 404 || attempt.status === 403 || attempt.ok) {
            break;
          }
        } catch (_) {}
      }

      if (!res) {
        setIsUnavailable(true);
        setIsLoading(false);
        return;
      }

      // If blackholed with 404 or 403: Bot or spoofer caught by server wall
      if (res.status === 404 || res.status === 403) {
        isBotDetectedRef.current = true;
        setIsLoading(false);
        setErrorMessage('Verification clearance denied.');
        if (onError) onError();
        return;
      }

      if (res.status === 429) {
        setIsLoading(false);
        setErrorMessage('Too many verification attempts. Access paused.');
        return;
      }

      if (!res.ok) {
        throw new Error(`Verification error (HTTP ${res.status}).`);
      }

      const data = await res.json();
      const targetUrl = data?.destination || data?.url;

      if (data.status === 'unavailable' || !targetUrl) {
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

      // Immediate wipe of destination URL and tokens from memory after passage
      setTimeout(() => {
        closeAndWipeLink();
      }, 1000);

      // Direct window location navigation (Popup-blocker proof)
      try {
        window.location.assign(targetUrl);
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
  }, [isLoading, appId, awaitTurnstileToken, closeAndWipeLink, onError, onSuccess, resetTurnstile, setErrorMessage]);

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
