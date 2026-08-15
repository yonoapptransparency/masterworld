import React, { useState, useRef } from 'react';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { solveChallenge } from '../lib/security/pow';
import { generateFingerprint } from '../lib/security/fingerprint';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId }: ClearanceButtonProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Verifying Clearance...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clickedRef = useRef<boolean>(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (clickedRef.current || isProcessing) return;

    clickedRef.current = true;
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusText('Initializing Security Check...');

    try {
      // 1. Generate browser-unique security signal
      const fingerprint = await generateFingerprint().catch(() => 'fallback_fp');

      // 2. Request stateless challenge from server
      setStatusText('Connecting to Security Gateway...');
      const startRes = await fetch(`/api/v1/_chal?appId=${encodeURIComponent(appId)}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!startRes.ok) {
        throw new Error('Security service unavailable. Please retry.');
      }

      const challengeData = await startRes.json();
      if (!challengeData || !challengeData.nonce) {
        throw new Error('Invalid security challenge received.');
      }

      // 3. Solve cryptographic Proof-of-Work challenge
      setStatusText('Verifying Proof of Humanity...');
      const solution = await solveChallenge(challengeData.nonce, challengeData.difficulty || '0');

      // 4. Complete clearance and obtain authorization token
      setStatusText('Authorizing Clearance...');
      const completeRes = await fetch('/api/v1/_proc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          nonce: challengeData.nonce,
          solution,
          fingerprint,
          appId,
          sid: challengeData.sid
        })
      });

      if (!completeRes.ok) {
        const errorData = await completeRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Verification declined.');
      }

      const result = await completeRes.json();
      if (!result.token) {
        throw new Error('Authorization response incomplete.');
      }

      setStatusText('Redirecting to Destination...');

      // 5. Navigate via Server-Authoritative Clearance Gateway
      const finalRedirect = `/api/v1/moreinfo-resolve?appId=${encodeURIComponent(appId)}&token=${encodeURIComponent(result.token)}&fp=${encodeURIComponent(fingerprint)}`;
      try {
        if (window.top && window.self !== window.top) {
          window.top.location.href = finalRedirect;
        } else {
          window.location.href = finalRedirect;
        }
      } catch (_) {
        window.location.href = finalRedirect;
      }
    } catch (err: any) {
      console.warn('[CLEARANCE] Clearance handshake notice:', err?.message || err);
      setErrorMessage(err?.message || 'Verification could not be completed.');
      setIsProcessing(false);
      clickedRef.current = false;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-2">
      <button
        type="button"
        id={`clearance-btn-${appId}`}
        onClick={handleClick}
        disabled={isProcessing}
        className={`group relative flex items-center justify-center gap-2.5 w-full py-4 px-6 text-white rounded-2xl transition-all font-bold shadow-md uppercase tracking-wider text-sm text-center select-none cursor-pointer ${
          isProcessing
            ? 'bg-emerald-700 cursor-wait scale-[0.99]'
            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 text-emerald-100 animate-spin shrink-0" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-emerald-100 shrink-0" />
            <span>Continue</span>
          </>
        )}
      </button>

      {/* Surface status indicator */}
      {isProcessing && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{statusText}</span>
        </div>
      )}

      {errorMessage && !isProcessing && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-all text-center">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage} (Tap to retry)</span>
        </div>
      )}

      {!isProcessing && !errorMessage && (
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium text-center">
          100% Encrypted & Protected
        </div>
      )}
    </div>
  );
}
