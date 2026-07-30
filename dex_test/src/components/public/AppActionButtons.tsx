import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Share2, Flag } from 'lucide-react';
import { AppConfig } from '../../types';

interface AppActionButtonsProps {
  app: AppConfig;
  isActuallyComingSoon: boolean;
  timeRemaining: number | null;
  handleShare: () => void;
}

export default function AppActionButtons({
  app,
  isActuallyComingSoon,
  timeRemaining,
  handleShare
}: AppActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row w-full justify-center items-center gap-3 select-none mb-6 px-3 sm:px-6">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:flex-1"
      >
        {isActuallyComingSoon ? (
          <div className="flex flex-col items-center">
            <button 
              disabled
              className="w-full bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed text-sm shadow-sm"
            >
              Coming Soon
            </button>
            {timeRemaining !== null && timeRemaining > 0 && (
              <div className="mt-2 flex gap-1 justify-center">
                {(() => {
                  const s = Math.floor(timeRemaining / 1000);
                  const d = Math.floor(s / 86400);
                  const h = Math.floor((s % 86400) / 3600);
                  const m = Math.floor((s % 3600) / 60);
                  const sec = s % 60;
                  return [
                    { label: 'D', value: d.toString().padStart(2, '0') },
                    { label: 'H', value: h.toString().padStart(2, '0') },
                    { label: 'M', value: m.toString().padStart(2, '0') },
                    { label: 'S', value: sec.toString().padStart(2, '0') }
                  ].map((unit, i) => (
                    <div key={`timer-${unit.label}-${i}`} className="flex flex-col items-center bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-1 border border-black/5 dark:border-white/5">
                      <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{unit.value}</span>
                      <span className="text-[8px] uppercase tracking-widest text-zinc-500">{unit.label}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        ) : (
          <Link 
            to={`/moreinfo/${app.slug}`}
            className="w-full premium-action-btn premium-action-btn-blowing text-white !text-white font-bold py-2.5 px-5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-sm shadow-md h-[44px]"
          >
            <span className="flex items-center gap-1.5 font-bold text-white !text-white">
              Sync Node <ArrowRight className="w-4 h-4 arrow-icon arrow-icon-loop text-white !text-white" />
            </span>
          </Link>
        )}
      </motion.div>

      <div className="flex w-full gap-3 sm:w-auto shrink-0">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 sm:w-auto sm:min-w-[130px] sm:max-w-[150px]"
        >
          <button 
            onClick={handleShare}
            className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-sm border border-black/5 dark:border-white/5 shadow-sm h-[44px] truncate"
          >
            <Share2 className="w-4 h-4 text-blue-500 shrink-0" /> <span className="truncate">Share app</span>
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 sm:w-auto sm:min-w-[130px] sm:max-w-[150px]"
        >
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-report-modal', { detail: { app } }));
            }}
            className="w-full bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-sm border border-rose-200/40 dark:border-rose-900/40 shadow-xs h-[44px] truncate"
          >
            <Flag className="w-4 h-4 text-rose-500 shrink-0" /> <span className="truncate">Flag app</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
