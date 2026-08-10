import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId, status = 'Verified' }: ClearanceButtonProps) {
  const targetUrl = `/api/v1/moreinfo-resolve?id=${encodeURIComponent(appId)}`;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-3">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>100% Verified & Secure Link</span>
      </div>

      <a
        href={targetUrl}
        className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] font-black shadow-lg shadow-emerald-200 dark:shadow-none uppercase tracking-widest text-sm text-center no-underline"
      >
        <Lock className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
        <span>Continue</span>
      </a>

      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium text-center">
        Fast SSL End-to-End Encrypted Tunnel
      </p>
    </div>
  );
}

