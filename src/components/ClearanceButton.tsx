import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId }: ClearanceButtonProps) {
  const targetUrl = `/api/v1/moreinfo-resolve?id=${encodeURIComponent(appId)}`;
  const [stepIndex, setStepIndex] = useState<number>(-1);

  const steps = [
    { short: 'Initializing...', detail: 'Initializing secure sequence...' },
    { short: 'Encrypting...', detail: 'Encrypting data payload...' },
    { short: 'Checking...', detail: 'Checking security protocols...' },
    { short: 'Decrypting...', detail: 'Decrypting target endpoint...' },
    { short: 'Verifying...', detail: 'Verifying verification token...' },
    { short: 'Processing...', detail: 'Processing request queue...' },
    { short: 'Validating...', detail: 'Validating system routing...' },
    { short: 'Securing...', detail: 'Securing channel connection...' },
    { short: 'Almost Done...', detail: 'Almost done, preparing output...' },
    { short: 'Finalizing...', detail: 'Finalizing response structure...' },
    { short: 'Completing...', detail: 'Completing verification step...' },
    { short: 'Redirecting...', detail: 'Redirecting to destination...' },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (stepIndex !== -1) return;

    // Immediately trigger location navigation so browser works in background with 0ms delay
    window.location.href = targetUrl;

    // Instantly show loading state on the surface UI
    setStepIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % steps.length;
      setStepIndex(current);
    }, 250);

    // Safeguard to clear interval if page remains
    setTimeout(() => {
      clearInterval(interval);
    }, 20000);
  };

  const isProcessing = stepIndex !== -1;
  const currentStep = isProcessing ? steps[stepIndex] : null;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-2">
      <a
        href={targetUrl}
        onClick={handleClick}
        className={`group relative flex items-center justify-center gap-2.5 w-full py-4 px-6 text-white rounded-2xl transition-all font-bold shadow-md uppercase tracking-wider text-sm text-center no-underline select-none ${
          isProcessing
            ? 'bg-emerald-700 cursor-wait scale-[0.99]'
            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 text-emerald-100 animate-spin shrink-0" />
            <span>{currentStep?.short}</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-emerald-100 shrink-0" />
            <span>Continue</span>
          </>
        )}
      </a>

      {/* Surface loading indicator below Continue button */}
      {isProcessing ? (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{currentStep?.detail}</span>
        </div>
      ) : (
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium text-center">
          100% Encrypted & Verified
        </div>
      )}
    </div>
  );
}



