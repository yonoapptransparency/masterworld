import re

with open('src/components/clearance/ClearanceLoading.tsx', 'r') as f:
    content = f.read()

new_content = """import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';

interface Props {
  progress: number;
  phase: 'handshake' | 'solving';
}

export const ClearanceLoading: React.FC<Props> = ({ progress, phase }) => {
  const [syncMessage, setSyncMessage] = useState('Connecting to secure node...');

  useEffect(() => {
    const msgs = [
      "Verifying Security...", 
      "Checking Human...", 
      "Connecting Node...",
      "Generating Link...",
      "Almost Ready..."
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      setSyncMessage(msgs[msgIdx]);
    }, 1000);
    
    return () => clearInterval(msgInterval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
      </div>
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 h-6">
        <Loader2 size={16} className="animate-spin" />
        <AnimatePresence mode="wait">
          <motion.span 
            key={syncMessage}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium uppercase tracking-wider"
          >
            {syncMessage}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-900/30 rounded-full">
        <ShieldCheck size={14} />
        <span className="text-[10px] font-bold uppercase">Secure connection active</span>
      </div>
    </div>
  );
};
"""

with open('src/components/clearance/ClearanceLoading.tsx', 'w') as f:
    f.write(new_content)

