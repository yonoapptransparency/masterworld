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
      className="group relative flex items-center justify-center gap-3 w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-widest text-sm"
    >
      <span>Access Information</span>
    </a>
    
    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
      <Timer size={12} />
      <span>Node expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
    </div>
  </motion.div>
);
