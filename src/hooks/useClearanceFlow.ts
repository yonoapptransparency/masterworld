import { useState, useCallback, useEffect } from 'react';
import { solveChallenge } from '../lib/security/pow';
import { generateFingerprint } from '../lib/security/fingerprint';
import { ClearancePhase, ClearanceState } from '../types/clearance';

export const useClearanceFlow = (appId: string) => {
  const [state, setState] = useState<ClearanceState>({
    phase: 'idle',
    progress: 0,
    errorMsg: '',
    token: null,
    dynamicLink: null,
    sid: null,
    tokenCountdown: 0,
  });

  // Countdown timer for token expiry
  useEffect(() => {
    let timer: any;
    if (state.tokenCountdown > 0) {
      timer = setInterval(() => {
        setState(prev => ({ ...prev, tokenCountdown: prev.tokenCountdown - 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.tokenCountdown]);

  const triggerHandshake = useCallback(async (targetWin: Window | null) => {
    setState(prev => ({ ...prev, phase: 'ready', progress: 100 }));

    const payloadUrl = `/api/v1/moreinfo-resolve?id=${encodeURIComponent(appId)}`;

    if (targetWin && !targetWin.closed) {
      targetWin.location.href = payloadUrl;
    } else {
      window.location.href = payloadUrl;
    }
  }, [appId]);

  const reset = useCallback(() => {
    setState({
      phase: 'idle',
      progress: 0,
      errorMsg: '',
      token: null,
      dynamicLink: null,
      sid: null,
      tokenCountdown: 0,
    });
  }, []);

  return { ...state, triggerHandshake, reset };
};
