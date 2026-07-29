import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  error: string;
  onRetry: () => void;
}

export const ClearanceError: React.FC<Props> = ({ error, onRetry }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }}
    className="flex flex-col items-center gap-3 p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-2xl"
  >
    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
      <ShieldAlert size={18} />
      <span className="text-sm font-semibold">Security Alert</span>
    </div>
    <p className="text-xs text-center text-slate-600 dark:text-slate-400 max-w-[240px]">
      {error}
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors"
    >
      <RefreshCcw size={14} />
      Try Again
    </button>
  </motion.div>
);
