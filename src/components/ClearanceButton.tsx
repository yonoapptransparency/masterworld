import React from 'react';
import { Lock } from 'lucide-react';

interface ClearanceButtonProps {
  appId: string;
  status?: 'Verified' | 'Caution' | 'Unsafe';
  variant?: 'default' | 'compact';
}

export default function ClearanceButton({ appId }: ClearanceButtonProps) {
  const targetUrl = `/api/v1/moreinfo-resolve?id=${encodeURIComponent(appId)}`;

  return (
    <div className="w-full max-w-sm mx-auto">
      <a
        href={targetUrl}
        className="group relative flex items-center justify-center gap-2 w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] font-bold shadow-md uppercase tracking-wider text-sm text-center no-underline"
      >
        <Lock className="w-4 h-4 text-emerald-100" />
        <span>Continue</span>
      </a>
    </div>
  );
}


