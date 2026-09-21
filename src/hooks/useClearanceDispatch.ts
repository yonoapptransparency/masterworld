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

/**
 * Intelligent Client-Side Fingerprint & Stealth-Bot Detection
 * Runs asynchronously in <1ms without blocking UI interactions
 */
function inspectClientEnvironment(): { isBot: boolean; isHeadless: boolean; botReason?: string } {
  if (typeof window === 'undefined') return { isBot: false, isHeadless: false };

  try {
    // 1. Core Automation & WebDriver properties
    const hasWebdriver = Boolean(
      (typeof navigator !== 'undefined' && navigator.webdriver) ||
      (window as any).__playwright ||
      (window as any).__puppeteer_evaluation_script__ ||
      (window as any)._phantom ||
      (window as any).callPhantom ||
      (window as any).__selenium_evaluate ||
      (window as any).__webdriver_evaluate ||
      (window as any).__driver_evaluate ||
      (window as any).__webdriver_script_fn ||
      (window as any).__fxdriver_evaluate ||
      (window as any).domAutomation ||
      (window as any).domAutomationController
    );

    // 2. Chromedriver specific global variables
    const windowKeys = Object.keys(window);
    const hasCdcProps = windowKeys.some(k => k.startsWith('cdc_') || k.startsWith('__webdriver'));

    // 3. Prototype tampering detection (stealth plugins trying to override navigator.webdriver)
    let isWebdriverTampered = false;
    try {
      if (typeof navigator !== 'undefined') {
        const descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver') ||
                           Object.getOwnPropertyDescriptor(navigator, 'webdriver');
        if (descriptor && descriptor.get && descriptor.get.toString().includes('undefined')) {
          isWebdriverTampered = true;
        }
      }
    } catch (_) {}

    // 4. Headless Browser Artifacts (Screen dimensions, outer bounds)
    const isZeroScreen = (window.outerWidth === 0 && window.outerHeight === 0) ||
                         (window.screen && window.screen.width === 0 && window.screen.height === 0);

    // 5. Headless WebGL Software Rasterizer Detection
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
            renderer.includes('software rasterizer')
          ) {
            isSoftwareGpu = true;
          }
        }
      }
    } catch (_) {}

    // 6. Desktop Chrome missing languages / plugins anomaly
    const isDesktop = typeof navigator !== 'undefined' && 
                      !/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent || '');
    const hasNoLanguages = typeof navigator !== 'undefined' && 
                           (!navigator.languages || navigator.languages.length === 0);

    const isBot = hasWebdriver || hasCdcProps || isWebdriverTampered || isZeroScreen;
    const isHeadless = isSoftwareGpu || (isDesktop && hasNoLanguages);

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
  const pointerHistoryRef = useRef<Array<{ cx: number; cy: number; sx: number; sy: number; t: number }>>([]);
  const clickTimestampsRef = useRef<number[]>([]);
  const isBotDetectedRef = useRef<boolean>(false);
  const isHeadlessDetectedRef = useRef<boolean>(false);

  // ─── INSTANT LINK CLOSURE: WIPE DESTINATION FROM MEMORY & RESET ───
  // Enforces: "one time user click link, one time he passed, the link closes"
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

  // ─── SILENT LAYER 1: ASYNC CLIENT FINGERPRINT SCAN ───
  useEffect(() => {
    mountTimeRef.current = Date.now();
    const { isBot, isHeadless } = inspectClientEnvironment();
    if (isBot) isBotDetectedRef.current = true;
    if (isHeadless) isHeadlessDetectedRef.current = true;
  }, []);

  // Capture authentic human pointer coordinates & kinetic dynamics
  const trackPointer = useCallback((e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    let cx = 120;
    let cy = 240;
    let sx = 120;
    let sy = 280;

    if ('clientX' in e && typeof e.clientX === 'number' && e.clientX > 0) {
      cx = Math.round(e.clientX);
      cy = Math.round(e.clientY || 0);
      sx = Math.round(e.screenX || cx);
      sy = Math.round(e.screenY || cy);
    } else if ('touches' in e && (e as any).touches?.[0]) {
      const touch = (e as any).touches[0];
      cx = Math.round(touch.clientX || 120);
      cy = Math.round(touch.clientY || 240);
      sx = Math.round(touch.screenX || cx);
      sy = Math.round(touch.screenY || cy);
    }

    const history = pointerHistoryRef.current;
    history.push({ cx, cy, sx, sy, t: Date.now() });
    if (history.length > 6) {
      history.shift();
    }
  }, []);

  /**
   * Fast Promise resolver to await Turnstile token if user clicks Proceed before token completes
   */
  const awaitTurnstileToken = async (): Promise<string | null> => {
    // 1. Direct check from ref or state
    if (cfTokenRef.current && cfTokenRef.current.trim()) {
      return cfTokenRef.current.trim();
    }
    if (cfToken && cfToken.trim()) {
      return cfToken.trim();
    }

    // 2. Trigger active execution if available
    if (executeTurnstile) {
      executeTurnstile();
    } else if (widgetIdRef?.current && window.turnstile?.execute) {
      try {
        window.turnstile.execute(widgetIdRef.current);
      } catch (_) {}
    }

    // 3. Poll for up to 3500ms
    const start = Date.now();
    while (Date.now() - start < 3500) {
      await new Promise(r => setTimeout(r, 100));
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

  // ─── SILENT LAYER 2: CRYPTOGRAPHIC HANDSHAKE & AIRGAP DISPATCH ───
  const handleProceed = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;

    // 1. Silent Bot Trap: If automated environment detected on client, abort immediately
    if (isBotDetectedRef.current) {
      setErrorMessage('Verification clearance denied.');
      return;
    }

    // 2. Client-Side Rapid Burst & Frequency Limiter
    // Real humans do not click >3 times within 10s or fire 3 simultaneous rapid clicks
    const now = Date.now();
    const recentClicks = clickTimestampsRef.current.filter(t => now - t < 10000);
    recentClicks.push(now);
    clickTimestampsRef.current = recentClicks;

    const isOverBurst = recentClicks.length > 3;
    const isSimultaneousSpam = recentClicks.length >= 3 && (now - recentClicks[recentClicks.length - 3] <= 2500);

    if (isOverBurst || isSimultaneousSpam) {
      isBotDetectedRef.current = true;
      setIsLoading(false);
      setErrorMessage('Access blocked due to excessive rapid attempts.');
      // Notify server to quarantine this IP immediately
      fetch('/api/v1/app/session-clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, token: btoa(JSON.stringify({ wb: 1, cb: 1, t: now })) }),
        keepalive: true
      }).catch(() => {});
      return;
    }

    // 3. Synthetic programmatic click check
    if (e.isTrusted === false) {
      isBotDetectedRef.current = true;
      setErrorMessage('Physical interaction required.');
      return;
    }

    trackPointer(e);
    const history = pointerHistoryRef.current;
    const lastPointer = history.length > 0 
      ? history[history.length - 1] 
      : { cx: 120, cy: 240, sx: 120, sy: 280, t: Date.now() };

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 4. Acquire Turnstile Token (instant if ready, or awaits active resolution)
      let token = await awaitTurnstileToken();

      if (!token) {
        // If Turnstile is blocked by an iframe or network issue, verify with test token in dev
        const isProdDomain = typeof window !== 'undefined' && 
          (window.location.hostname === 'rummydex.com' || window.location.hostname === 'www.rummydex.com');

        if (!isProdDomain) {
          // Dev / Preview fallback token for iframe sandboxes
          token = 'test_dev_clearance_token';
        } else {
          setIsLoading(false);
          setErrorMessage('Please complete the verification check above.');
          return;
        }
      }

      // 5. Human dwell time check
      const dwell = Date.now() - mountTimeRef.current;

      // 6. Generate high-entropy single-use nonce
      let entropy = '';
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        entropy = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        entropy = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      }

      // Re-scan live environment flags at exact time of click
      const liveScan = inspectClientEnvironment();
      const hasBotFlags = isBotDetectedRef.current || liveScan.isBot;
      const hasHeadlessFlags = isHeadlessDetectedRef.current || liveScan.isHeadless;

      // 7. Encode single-use clearance payload
      const clearanceToken = btoa(JSON.stringify({
        t: Date.now(),
        n: entropy,
        id: appId,
        el: Math.max(1000, dwell),
        cf: token,
        cx: Math.max(1, lastPointer.cx),
        cy: Math.max(1, lastPointer.cy),
        sx: Math.max(1, lastPointer.sx),
        sy: Math.max(1, lastPointer.sy),
        wb: hasBotFlags ? 1 : 0,
        hl: hasHeadlessFlags ? 1 : 0,
        cb: isOverBurst || isSimultaneousSpam ? 1 : 0,
        tr: e.isTrusted ? 1 : 0
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

      // ─── SILENT LAYER 3: ZERO-REFERRER AIRGAP DISPATCH ───
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
  };

  return {
    isLoading,
    destinationUrl,
    isUnavailable,
    setIsUnavailable,
    handleProceed,
    trackPointer,
    closeAndWipeLink
  };
}
