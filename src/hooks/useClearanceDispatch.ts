import React, { useState, useRef, useEffect, useCallback } from 'react';

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
 * Deep Hardware, WebGL, Prototype Descriptor & Stealth-Bot Trap
 * Runs zero-latency inspection to catch Playwright, Puppeteer, Selenium, CDP, and virtualized headless GPUs.
 */
function inspectClientEnvironment(): { isBot: boolean; isHeadless: boolean; botReason?: string } {
  if (typeof window === 'undefined') return { isBot: false, isHeadless: false };

  try {
    const nav = typeof navigator !== 'undefined' ? navigator : null;

    // 1. Core Automation & WebDriver globals (Playwright, Puppeteer, Selenium, CDP)
    const hasWebdriverFlag = Boolean(
      (nav && (nav.webdriver === true || (nav as any).__webdriver)) ||
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
      (window as any).domAutomationController
    );

    // 2. Prototype & Property Descriptor Tampering (catches puppeteer-extra-plugin-stealth)
    let hasTamperedDescriptor = false;
    if (nav) {
      try {
        const ownDesc = Object.getOwnPropertyDescriptor(nav, 'webdriver');
        const protoDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(nav), 'webdriver');
        if (ownDesc !== undefined) {
          // Real browsers define webdriver on Navigator.prototype, never as an own property on navigator instance
          hasTamperedDescriptor = true;
        } else if (protoDesc && protoDesc.get) {
          const getterSrc = Function.prototype.toString.call(protoDesc.get);
          if (!getterSrc.includes('[native code]')) {
            hasTamperedDescriptor = true;
          }
        }
      } catch (_) {}
    }

    // 3. Chromedriver & CDP injected window properties
    const windowKeys = Object.keys(window);
    const hasCdcProps = windowKeys.some(k =>
      k.startsWith('cdc_') ||
      k.startsWith('__webdriver') ||
      k.startsWith('$cdc_') ||
      k.startsWith('__pw_') ||
      k.includes('Selenium')
    );

    // 4. Headless Screen & Viewport Geometry Trap
    const isZeroScreen =
      (window.outerWidth === 0 && window.outerHeight === 0) ||
      (window.screen && (window.screen.width === 0 || window.screen.height === 0));

    // 5. Missing Browser Languages Trap
    const hasNoLanguages = Boolean(nav && (!nav.languages || nav.languages.length === 0));

    // 6. WebGL Hardware Renderer Inspection (detects SwiftShader, llvmpipe, Mesa OffScreen)
    let isVirtualGpu = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
          const vendor = String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '').toLowerCase();
          if (
            renderer.includes('swiftshader') ||
            renderer.includes('llvmpipe') ||
            renderer.includes('mesa offscreen') ||
            renderer.includes('virtualbox') ||
            (vendor.includes('google') && renderer.includes('swiftshader'))
          ) {
            isVirtualGpu = true;
          }
        }
      }
    } catch (_) {}

    const isBot = hasWebdriverFlag || hasTamperedDescriptor || hasCdcProps || isZeroScreen || hasNoLanguages;
    const isHeadless = isZeroScreen || isVirtualGpu;

    return {
      isBot,
      isHeadless,
      botReason: isBot ? 'automation_detected' : isHeadless ? 'headless_gpu' : undefined
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
  resetTurnstile,
  executeTurnstile,
  onSuccess,
  onError,
  setErrorMessage
}: UseClearanceDispatchOptions) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState<boolean>(false);

  // Silent behavioral, hardware & kinetic telemetry refs
  const mountTimeRef = useRef<number>(Date.now());
  const gestureStartTimeRef = useRef<number>(0);
  const pointerSamplesRef = useRef<PointerSample[]>([]);
  const clickTimestampsRef = useRef<number[]>([]);
  const isBotDetectedRef = useRef<boolean>(false);
  const isHeadlessGpuRef = useRef<boolean>(false);
  const isClientBurstRef = useRef<boolean>(false);

  // ─── INSTANT LINK CLOSURE: WIPE DESTINATION FROM MEMORY & RESET ───
  const closeAndWipeLink = useCallback(() => {
    setDestinationUrl(null);
    setIsLoading(false);
    resetTurnstile();
  }, [resetTurnstile]);

  // ─── RE-ENTRY LISTENER: IMMEDIATELY CLOSE LINK ON TAB SWITCH OR BACK/FORWARD ───
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

  // Client environment hardware scan on mount
  useEffect(() => {
    mountTimeRef.current = Date.now();
    const { isBot, isHeadless } = inspectClientEnvironment();
    if (isBot) isBotDetectedRef.current = true;
    if (isHeadless) isHeadlessGpuRef.current = true;
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

    if (samples.length > 15) {
      samples.shift();
    }
  }, []);

  /**
   * Fast Promise resolver to await Turnstile token if it is actively resolving
   */
  const awaitTurnstileToken = useCallback(async (): Promise<string | null> => {
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
    while (Date.now() - start < 850) {
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
  }, [cfToken, cfTokenRef, executeTurnstile, widgetIdRef]);

  // ─── KINETIC CLEARANCE HANDSHAKE TO SERVER / CLOUDFLARE EDGE ───
  const handleKineticProceed = useCallback(async (e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (isLoading) return;

    const now = Date.now();

    // 1. Check Synthetic Event & Zero-Coordinate Click Trap
    let clickX = 0;
    let clickY = 0;
    if (e) {
      if (e.isTrusted === false) {
        isBotDetectedRef.current = true;
      }
      if ('clientX' in e && typeof e.clientX === 'number') {
        clickX = Math.round(e.clientX);
        clickY = Math.round(e.clientY || 0);
        if (clickX === 0 && clickY === 0 && (e as React.MouseEvent).screenX === 0 && (e as React.MouseEvent).screenY === 0) {
          isBotDetectedRef.current = true;
        }
      }
    }

    // 2. Enforce 3-Click / 10-Second Rolling Window & <=2000ms Simultaneous Burst Trap
    const recentClicks = clickTimestampsRef.current.filter(ts => now - ts < 10000);
    recentClicks.push(now);
    clickTimestampsRef.current = recentClicks;

    const microBurstClicks = recentClicks.filter(ts => now - ts <= 2000);
    if (recentClicks.length > 3 || microBurstClicks.length >= 3) {
      isClientBurstRef.current = true;
      isBotDetectedRef.current = true;
    }

    const pageElapsed = now - mountTimeRef.current;
    const gestureDuration = gestureStartTimeRef.current > 0 ? (now - gestureStartTimeRef.current) : pageElapsed;
    const effectiveElapsed = Math.max(pageElapsed, gestureDuration);
    gestureStartTimeRef.current = 0;

    // Sub-human machine dwell check (< 200ms from mount)
    if (pageElapsed < 200) {
      isBotDetectedRef.current = true;
    }

    // Generate cryptographic single-use nonce
    let entropy = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      entropy = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      entropy = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    }

    // If bot or rapid burst is detected on client, fire silent quarantine report to Edge/Server and trigger Phantom 404
    if (isBotDetectedRef.current || isClientBurstRef.current) {
      const trapToken = btoa(JSON.stringify({
        t: now,
        n: entropy,
        id: appId,
        el: effectiveElapsed,
        cx: clickX,
        cy: clickY,
        var: 0,
        samples: 0,
        wb: isBotDetectedRef.current ? 1 : 0,
        hl: isHeadlessGpuRef.current ? 1 : 0,
        cb: isClientBurstRef.current ? 1 : 0,
        tr: 0
      }));
      try {
        fetch('/api/v1/app/session-clearance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-clearance-token': trapToken },
          body: JSON.stringify({ id: appId, appId, appSlug, token: trapToken }),
          keepalive: true
        }).catch(() => {});
      } catch (_) {}

      setErrorMessage('Not Found');
      if (onError) onError();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 3. Acquire Turnstile Token
      let token = await awaitTurnstileToken();
      if (!token) {
        token = 'attest_' + entropy;
      }

      // 4. Compute micro-jitter variance across pointer/touch trajectory samples
      const samples = pointerSamplesRef.current;
      let coordVariance = 0;
      if (samples.length >= 2) {
        const diffs = samples.slice(1).map((s, i) => Math.abs(s.cx - samples[i].cx) + Math.abs(s.cy - samples[i].cy));
        coordVariance = diffs.reduce((a, b) => a + b, 0);
      }

      const lastSample = samples.length > 0 ? samples[samples.length - 1] : { cx: clickX, cy: clickY, t: now };
      const finalCx = lastSample.cx || clickX;
      const finalCy = lastSample.cy || clickY;
      const isGenuineTrusted = !isBotDetectedRef.current && (samples.length > 0 || finalCx > 0 || finalCy > 0);

      // 5. Encode single-use clearance payload with full 7-Wall telemetry contract
      const clearanceToken = btoa(JSON.stringify({
        t: Date.now(),
        n: entropy,
        id: appId,
        slug: appSlug || appId,
        el: effectiveElapsed,
        cf: token,
        cx: finalCx,
        cy: finalCy,
        var: coordVariance,
        samples: samples.length,
        wb: isBotDetectedRef.current ? 1 : 0,
        hl: isHeadlessGpuRef.current ? 1 : 0,
        cb: isClientBurstRef.current ? 1 : 0,
        tr: isGenuineTrusted ? 1 : 0
      }));

      // Authoritative Server & Cloudflare Edge routes (Zero client-side vault fallback)
      const candidateRoutes = [
        '/api/v1/app/session-clearance',
        '/api/v1/app/resolve-link',
        '/api/v1/public/secure-link'
      ];

      let targetUrl: string | null = null;
      let botDeniedByServer = false;

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
              break;
            } else if (data && data.status === 'unavailable') {
              setIsLoading(false);
              setIsUnavailable(true);
              return;
            } else if (data && data.status === 'challenge_required') {
              setIsLoading(false);
              setErrorMessage('Please complete the verification check above to proceed.');
              resetTurnstile();
              if (executeTurnstile) executeTurnstile();
              return;
            }
          } else if (attempt.status === 404) {
            // Check if server explicitly returned disguised 404 bot denial JSON
            try {
              const errData = await attempt.json();
              if (errData && errData.success === false && errData.error === 'Not found') {
                botDeniedByServer = true;
                break;
              }
            } catch (_) {}
            continue;
          } else if (attempt.status === 429 || attempt.status === 403) {
            setIsLoading(false);
            setErrorMessage('Verification access temporarily paused. Please try again later.');
            return;
          }
        } catch (_) {
          continue;
        }
      }

      if (botDeniedByServer) {
        setIsLoading(false);
        if (onError) onError();
        return;
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

        try {
          window.location.assign(targetUrl);
        } catch (_) {
          window.location.href = targetUrl;
        }

        // Ephemeral 20-second memory auto-reset (wipes link from RAM if user remains on page)
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
      resetTurnstile();
    }
  }, [isLoading, appId, appSlug, awaitTurnstileToken, closeAndWipeLink, executeTurnstile, onError, onSuccess, resetTurnstile, setErrorMessage]);

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

