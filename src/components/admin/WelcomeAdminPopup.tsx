import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Coffee, ShieldCheck, Zap } from 'lucide-react';

const MOTIVATIONAL_MESSAGES = [
  "Welcome back, Admin! Ready to make today ridiculously amazing? Let's conquer the day.",
  "Admin is back in the house! The servers missed your brilliance.",
  "Hello again! Another day, another chance to build something extraordinary.",
  "Welcome back! Keep pushing boundaries and creating magic.",
  "Greetings, Commander! The dashboard is yours to control.",
  "Welcome back! Your leadership keeps everything running smoothly. Let's roll!"
];

export function WelcomeAdminPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    setMessage(randomMessage);
    
    // Delay slightly for a nice entrance effect after page load
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    // Auto dismiss after 8 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 9000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed top-6 right-6 z-[9999] pointer-events-auto"
        >
          <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] border border-blue-100 dark:border-blue-900/50 p-5 pr-12 min-w-[320px] max-w-[420px]">
            {/* Background decorative gradient */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Welcome back, Admin! 🚀
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 p-1.5 rounded-full"
              aria-label="Close welcome message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
