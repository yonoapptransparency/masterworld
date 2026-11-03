import { useState, useRef, useEffect, useCallback, type MutableRefObject } from 'react';
import { TOKEN_V, SESSION_RETRY_MAX, type TokenV12 } from '../lib/gateConfig';
import type { FrozenEnvProbe } from '../lib/deviceProbe';

interface TapCaptureBuffer {
  pt: string;
  tsTime: number;
  teTime: number;
  perfStart: number;
  perfEnd: number;
  rx: number;
  ry: number;
  pr: number;
  x: number;
  y: number;
  d: number;
  gap: number;
  events: string[];
}

export interface UseClearanceDispatchOptions {
  appId: string;
  nv: 0 | 1;
  isReady: boolean;
  cfTokenRef: MutableRefObject<string | null>;
  nonceRef: MutableRefObject<string | null>;
  envRef: MutableRefObject<FrozenEnvProbe | null>;
  setIsBotBlocked: (blocked: boolean) => void;
  restartVerification: (manualReset?: boolean) => void;
  wipeSessionSecrets: () => void;
}

function utf8ToBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function useClearanceDispatch({
  appId,
  nv,
  isReady,
  cfTokenRef,
  nonceRef,
  envRef,
  setIsBotBlocked,
  restartVerification,
  wipeSessionSecrets,
}: UseClearanceDispatchOptions) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(null);
  const [needsManualRetry, setNeedsManualRetry] = useState(false);
  const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null);

  const inFlightRef = useRef(false);
  const isReadyRef = useRef(isReady);
  isReadyRef.current = isReady;

  const clickTimestampsRef = useRef<number[]>([]);
  const clearanceRetriesRef = useRef(0);

  const tapBufferRef = useRef<TapCaptureBuffer>({
    pt: '',
    tsTime: 0,
    teTime: 0,
    perfStart: 0,
    perfEnd: 0,
    rx: 0,
    ry: 0,
    pr: 0,
    x: 0,
    y: 0,
    d: 0,
    gap: 0,
    events: [],
  });

  const resetTapBuffer = useCallback(() => {
    tapBufferRef.current = {
      pt: '',
      tsTime: 0,
      teTime: 0,
      perfStart: 0,
      perfEnd: 0,
      rx: 0,
      ry: 0,
      pr: 0,
      x: 0,
      y: 0,
      d: 0,
      gap: 0,
      events: [],
    };
  }, []);

  const setButtonRef = useCallback((node: HTMLButtonElement | null) => {
    setButtonElement(node);
  }, []);

  const executeClearance = useCallback(
    async (
      isTrustedClick: boolean,
      clickTimeStamp: number,
      fallbackClientX: number,
      fallbackClientY: number
    ) => {
      if (inFlightRef.current) return;
      if (!isReadyRef.current) {
        resetTapBuffer();
        return;
      }

      const now = Date.now();
      const recent10s = clickTimestampsRef.current.filter((t) => now - t <= 10000);
      recent10s.push(now);
      clickTimestampsRef.current = recent10s;
      const recent2s = recent10s.filter((t) => now - t <= 2000);

      const tap = tapBufferRef.current;
      tap.events.push('ck');

      const endEventTs = tap.teTime > 0 ? tap.teTime : clickTimeStamp;
      const eventDuration =
        tap.tsTime > 0 && endEventTs >= tap.tsTime ? Math.round(endEventTs - tap.tsTime) : 0;
      const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const endPerf = tap.perfEnd >= tap.perfStart && tap.perfEnd > 0 ? tap.perfEnd : nowPerf;
      const perfDuration =
        tap.perfStart > 0 && endPerf >= tap.perfStart
          ? Math.round(endPerf - tap.perfStart)
          : 0;
      tap.d = Math.max(eventDuration, perfDuration);

      if (tap.teTime > 0 && clickTimeStamp >= tap.teTime) {
        tap.gap = Math.round(clickTimeStamp - tap.teTime);
      }
      if (tap.x === 0 && tap.y === 0) {
        tap.x = Math.round(fallbackClientX || 0);
        tap.y = Math.round(fallbackClientY || 0);
      }

      // §5.6 Client-side stop (disguised 404, no server call) ONLY if:
      // e.isTrusted === false, or genuine desktop mouse click on a non-touch device
      const hasTouch =
        (typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints ?? 0) >= 1) ||
        (typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          (window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(any-pointer: coarse)').matches)) ||
        (typeof window !== 'undefined' && 'ontouchstart' in window);
      const isDesktopMouse = tap.pt === 'mouse' && !hasTouch;
      const isBurst = recent2s.length >= 12 || recent10s.length > 15;

      if (!isTrustedClick || isDesktopMouse) {
        wipeSessionSecrets();
        setIsBotBlocked(true);
        return;
      }

      if (isBurst) {
        resetTapBuffer();
        restartVerification(false);
        return;
      }

      const cf = cfTokenRef.current;
      const nonce = nonceRef.current;
      const env = envRef.current;

      if (!cf || !nonce || !env) {
        restartVerification(false);
        return;
      }

      inFlightRef.current = true;
      setIsDispatching(true);
      setNeedsManualRetry(false);

      const safeAppId = appId.replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 64);
      const capturedPt =
        tap.pt && tap.pt !== 'mouse'
          ? tap.pt
          : tap.events.includes('ts') || (hasTouch && tap.events.includes('pd'))
          ? 'touch'
          : tap.pt || '';
      const tokenObj: TokenV12 = {
        v: TOKEN_V,
        id: safeAppId,
        nonce,
        nv,
        hard: env.hardStr,
        soft: env.softStr,
        tap: {
          pt: capturedPt,
          mtp: Number(typeof navigator !== 'undefined' ? navigator.maxTouchPoints ?? 0 : 0),
          coarse:
            typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            (window.matchMedia('(pointer: coarse)').matches ||
              window.matchMedia('(any-pointer: coarse)').matches)
              ? 1
              : 0,
          rx: Math.round((tap.rx || 0) * 100) / 100,
          ry: Math.round((tap.ry || 0) * 100) / 100,
          pr: Math.round((tap.pr || 0) * 100) / 100,
          x: Math.round(tap.x || fallbackClientX || 0),
          y: Math.round(tap.y || fallbackClientY || 0),
          d: Math.round(tap.d || 0),
          gap: Math.round(tap.gap || 0),
          ev: tap.events.join(','),
        },
        f: {
          wb: env.gate.wb,
          hl: env.gate.hl,
          dk: env.gate.dk,
          cb: 0,
          tr: 1,
        },
      };

      const encodedToken = utf8ToBase64Url(JSON.stringify(tokenObj));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch('/api/v1/app/session-clearance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ token: encodedToken, cf }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 404) {
          inFlightRef.current = false;
          setIsDispatching(false);
          resetTapBuffer();
          // If this is a real touch device without webdriver/headless flags, allow clean re-verification
          // instead of trapping the user on a permanent 404 screen
          if (hasTouch && env.gate.wb === 0 && env.gate.hl === 0 && env.gate.dk === 0) {
            if (clearanceRetriesRef.current < SESSION_RETRY_MAX) {
              clearanceRetriesRef.current += 1;
              restartVerification(false);
            } else {
              wipeSessionSecrets();
              setNeedsManualRetry(true);
            }
            return;
          }
          wipeSessionSecrets();
          setIsBotBlocked(true);
          return;
        }

        const data = await res.json().catch(() => null);

        if (data?.status === 'available' && typeof data.url === 'string' && data.url) {
          // §5.9: URL exists only in a local variable; never in React state, storage, console, or DOM.
          let destinationUrl: string | null = data.url;
          data.url = '';
          wipeSessionSecrets();
          resetTapBuffer();
          window.location.replace(destinationUrl);
          destinationUrl = null;
          setTimeout(() => {
            inFlightRef.current = false;
            setIsDispatching(false);
          }, 1500);
          return;
        }

        if (data?.status === 'unavailable') {
          inFlightRef.current = false;
          setIsDispatching(false);
          wipeSessionSecrets();
          setUnavailableMessage(
            typeof data.message === 'string' && data.message
              ? data.message
              : 'The package link is currently not available. It will be updated soon by the admin.'
          );
          return;
        }

        // SOFT retry handling (§5.9)
        inFlightRef.current = false;
        setIsDispatching(false);
        resetTapBuffer();

        if (data?.reload === 1) {
          try {
            if (!sessionStorage.getItem('rd_v12_reloaded')) {
              sessionStorage.setItem('rd_v12_reloaded', '1');
              window.location.reload();
              return;
            }
          } catch {
            // Ignore sessionStorage error
          }
        }

        if (clearanceRetriesRef.current < SESSION_RETRY_MAX) {
          clearanceRetriesRef.current += 1;
          restartVerification(false);
        } else {
          wipeSessionSecrets();
          setNeedsManualRetry(true);
        }
      } catch {
        clearTimeout(timeoutId);
        inFlightRef.current = false;
        setIsDispatching(false);
        resetTapBuffer();

        if (clearanceRetriesRef.current < SESSION_RETRY_MAX) {
          clearanceRetriesRef.current += 1;
          restartVerification(false);
        } else {
          wipeSessionSecrets();
          setNeedsManualRetry(true);
        }
      }
    },
    [
      appId,
      cfTokenRef,
      envRef,
      nonceRef,
      nv,
      resetTapBuffer,
      restartVerification,
      setIsBotBlocked,
      wipeSessionSecrets,
    ]
  );

  // §5.6: Attach passive listeners to the Proceed button only (re-attach if node is replaced)
  useEffect(() => {
    if (!buttonElement) return;

    const hasPriorGestureEnded = () =>
      tapBufferRef.current.events.some((ev) => ev === 'pu' || ev === 'te' || ev === 'ck');

    const onPointerDown = (e: PointerEvent) => {
      if (inFlightRef.current) return;
      if (hasPriorGestureEnded()) {
        resetTapBuffer();
      }
      tapBufferRef.current.pt = e.pointerType || tapBufferRef.current.pt || '';
      if (tapBufferRef.current.tsTime === 0) {
        tapBufferRef.current.tsTime = e.timeStamp || performance.now();
      }
      if (tapBufferRef.current.perfStart === 0) {
        tapBufferRef.current.perfStart =
          typeof performance !== 'undefined' ? performance.now() : Date.now();
      }
      if (tapBufferRef.current.x === 0 && tapBufferRef.current.y === 0) {
        tapBufferRef.current.x = Number(e.clientX ?? 0);
        tapBufferRef.current.y = Number(e.clientY ?? 0);
      }
      if (tapBufferRef.current.rx === 0 && e.width) {
        tapBufferRef.current.rx = Number(e.width) / 2;
      }
      if (tapBufferRef.current.ry === 0 && e.height) {
        tapBufferRef.current.ry = Number(e.height) / 2;
      }
      if (tapBufferRef.current.pr === 0 && e.pressure) {
        tapBufferRef.current.pr = Number(e.pressure);
      }
      tapBufferRef.current.events.push('pd');
    };

    const onTouchStart = (e: TouchEvent) => {
      if (inFlightRef.current) return;
      if (hasPriorGestureEnded() && !tapBufferRef.current.events.includes('pd')) {
        resetTapBuffer();
      }
      const t = e.touches?.[0] || e.changedTouches?.[0];
      if (tapBufferRef.current.tsTime === 0) {
        tapBufferRef.current.tsTime = e.timeStamp || performance.now();
      }
      if (tapBufferRef.current.perfStart === 0) {
        tapBufferRef.current.perfStart =
          typeof performance !== 'undefined' ? performance.now() : Date.now();
      }
      if (t) {
        tapBufferRef.current.rx = Number((t as any).radiusX ?? tapBufferRef.current.rx ?? 0);
        tapBufferRef.current.ry = Number((t as any).radiusY ?? tapBufferRef.current.ry ?? 0);
        tapBufferRef.current.pr = Number((t as any).force ?? tapBufferRef.current.pr ?? 0);
        tapBufferRef.current.x = Number(t.clientX ?? tapBufferRef.current.x ?? 0);
        tapBufferRef.current.y = Number(t.clientY ?? tapBufferRef.current.y ?? 0);
      }
      if (!tapBufferRef.current.pt || tapBufferRef.current.pt === 'mouse') {
        tapBufferRef.current.pt = 'touch';
      }
      tapBufferRef.current.events.push('ts');
    };

    const onPointerUp = (e: PointerEvent) => {
      if (inFlightRef.current) return;
      tapBufferRef.current.teTime = e.timeStamp || performance.now();
      tapBufferRef.current.perfEnd =
        typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (tapBufferRef.current.x === 0 && tapBufferRef.current.y === 0) {
        tapBufferRef.current.x = Number(e.clientX ?? 0);
        tapBufferRef.current.y = Number(e.clientY ?? 0);
      }
      tapBufferRef.current.events.push('pu');
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (inFlightRef.current) return;
      tapBufferRef.current.teTime = e.timeStamp || performance.now();
      tapBufferRef.current.perfEnd =
        typeof performance !== 'undefined' ? performance.now() : Date.now();
      const t = e.changedTouches?.[0];
      if (t && tapBufferRef.current.x === 0 && tapBufferRef.current.y === 0) {
        tapBufferRef.current.x = Number(t.clientX ?? 0);
        tapBufferRef.current.y = Number(t.clientY ?? 0);
      }
      tapBufferRef.current.events.push('te');
    };

    const onCancel = () => {
      if (inFlightRef.current) return;
      resetTapBuffer();
    };

    const onClick = (e: MouseEvent) => {
      void executeClearance(e.isTrusted, e.timeStamp, e.clientX, e.clientY);
    };

    buttonElement.addEventListener('pointerdown', onPointerDown, { passive: true });
    buttonElement.addEventListener('touchstart', onTouchStart, { passive: true });
    buttonElement.addEventListener('pointerup', onPointerUp, { passive: true });
    buttonElement.addEventListener('touchend', onTouchEnd, { passive: true });
    buttonElement.addEventListener('pointercancel', onCancel, { passive: true });
    buttonElement.addEventListener('touchcancel', onCancel, { passive: true });
    buttonElement.addEventListener('click', onClick, { passive: true });

    return () => {
      buttonElement.removeEventListener('pointerdown', onPointerDown);
      buttonElement.removeEventListener('touchstart', onTouchStart);
      buttonElement.removeEventListener('pointerup', onPointerUp);
      buttonElement.removeEventListener('touchend', onTouchEnd);
      buttonElement.removeEventListener('pointercancel', onCancel);
      buttonElement.removeEventListener('touchcancel', onCancel);
      buttonElement.removeEventListener('click', onClick);
    };
  }, [buttonElement, executeClearance, resetTapBuffer]);

  const handleManualRetry = useCallback(() => {
    clearanceRetriesRef.current = 0;
    setNeedsManualRetry(false);
    resetTapBuffer();
    restartVerification(true);
  }, [resetTapBuffer, restartVerification]);

  return {
    setButtonRef,
    isDispatching,
    unavailableMessage,
    needsManualRetry,
    handleManualRetry,
  };
}
