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
    setState(prev => ({ ...prev, phase: 'handshake', progress: 10, errorMsg: '' }));

    try {
      // 1. Get Challenge
      const chalRes = await fetch('/api/v1/_chal');
      if (!chalRes.ok) throw new Error('Security Node Unreachable');
      const { nonce, difficulty, sid } = await chalRes.json();
      
      setState(prev => ({ ...prev, phase: 'solving', progress: 30, sid }));

      // 2. Solve PoW and Fingerprint
      const fingerprint = await generateFingerprint();
      const solution = await solveChallenge(nonce, difficulty);

      setState(prev => ({ ...prev, progress: 70 }));

      // 3. Verify Solution
      const procRes = await fetch('/api/v1/_proc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, solution, fingerprint, appId, sid }),
      });

      const procData = await procRes.json();
      if (!procRes.ok) throw new Error(procData.error || 'Verification Failed');

      const token = procData.token;
      const params = new URLSearchParams({ t: token, id: appId, sid: sid || '', fp: fingerprint });
      const payloadUrl = `/api/v1/moreinfo-resolve?${params.toString()}`;

      setState(prev => ({
        ...prev,
        phase: 'ready',
        progress: 100,
        token,
        dynamicLink: payloadUrl,
        tokenCountdown: 600
      }));

      // 4. Redirect the pre-opened tab
      if (targetWin && !targetWin.closed) {
        targetWin.location.href = payloadUrl;
      } else {
        setState(prev => ({ ...prev, errorMsg: 'Pop-up was closed. Please use the direct link below.' }));
      }

    } catch (err: any) {
      console.error('[ClearanceFlow] Error:', err);
      setState(prev => ({
        ...prev,
        phase: 'error',
        errorMsg: err.message || 'An unexpected security error occurred.'
      }));
      if (targetWin) targetWin.close();
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
