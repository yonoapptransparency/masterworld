import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ExternalLink, Timer } from 'lucide-react';

interface Props {
  dynamicLink: string;
  countdown: number;
}

export const ClearanceReady: React.FC<Props> = ({ dynamicLink, countdown }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }} 
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center gap-4 w-full"
  >
    <a
      href={dynamicLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
      <span className="font-bold tracking-tight">Access Information</span>
      <ExternalLink size={14} className="opacity-50" />
    </a>
    
    <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-widest">
      <div className="flex items-center gap-1">
        <Timer size={12} />
        <span>Expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
      </div>
      <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
      <span>Single-Use Only</span>
    </div>
  </motion.div>
);
