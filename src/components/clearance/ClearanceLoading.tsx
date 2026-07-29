import React from 'react';
import { motion } from 'motion/react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface Props {
  progress: number;
  phase: 'handshake' | 'solving';
}

export const ClearanceLoading: React.FC<Props> = ({ progress, phase }) => (
  <div className="flex flex-col items-center gap-4 w-full">
    <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div 
        className="absolute top-0 left-0 h-full bg-indigo-600 dark:bg-indigo-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', damping: 20 }}
      />
    </div>
    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-xs font-medium uppercase tracking-wider">
        {phase === 'handshake' ? 'Initiating Secure Handshake...' : 'Solving Cryptographic Challenge...'}
      </span>
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-900/30 rounded-full">
      <ShieldCheck size={14} />
      <span className="text-[10px] font-bold uppercase">Encrypted Tunnel Active</span>
    </div>
  </div>
);
