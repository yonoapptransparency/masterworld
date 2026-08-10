import React from 'react';

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
        className="group relative flex items-center justify-center gap-3 w-full py-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] font-black shadow-lg shadow-emerald-200 dark:shadow-none uppercase tracking-widest text-sm text-center no-underline"
      >
        <span>Continue</span>
      </a>
    </div>
  );
}

