import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Heart, X, Smile, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

interface AdminWelcomeBanner3DProps {
  sessionTimeLeft?: number;
  adminEmail?: string;
  onRefreshSession?: () => void;
}

const HAPPY_MESSAGES = [
  {
    title: "Welcome Back, Boss!",
    quote: "You make this entire platform run like magic! Wishing you a joyful, super productive & happy day ahead! ✨",
    tag: "Make Me Happy 💖",
    gradient: "from-blue-600 via-indigo-600 to-purple-600"
  },
  {
    title: "Happiness & Wins Today! 🌟",
    quote: "Your vision powers everything here! Take a deep breath, smile, and make today absolutely extraordinary! 😊",
    tag: "100% Positive Energy ✨",
    gradient: "from-emerald-600 via-teal-600 to-blue-600"
  },
  {
    title: "Great To Have You Here! 🎉",
    quote: "Every database is synced and protected. You're doing incredible work, keep shining bright! 🚀",
    tag: "Pure Joy & Success 🌈",
    gradient: "from-amber-500 via-rose-500 to-indigo-600"
  },
  {
    title: "Smile & Conquer! 💎",
    quote: "You bring positive energy to this system! May your day be filled with happiness, ease, and flawless results! 🏆",
    tag: "Spread The Smiles 😊",
    gradient: "from-cyan-500 via-blue-600 to-violet-600"
  }
];

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const STORAGE_KEY = 'rummydex_admin_welcome_last_shown';

export const AdminWelcomeBanner3D: React.FC<AdminWelcomeBanner3DProps> = ({
  sessionTimeLeft = 15 * 60,
  adminEmail,
  onRefreshSession
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isSparkling, setIsSparkling] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Check 15-minute rule on mount and periodically every 30s
  useEffect(() => {
    const checkShouldShow = () => {
      try {
        const lastShown = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();
        
        if (!lastShown || now - parseInt(lastShown, 10) >= FIFTEEN_MINUTES_MS) {
          // 15 minutes elapsed or never shown -> Show welcome card
          setIsVisible(true);
          localStorage.setItem(STORAGE_KEY, now.toString());
          // Pick a random happy message
          setQuoteIndex(Math.floor(Math.random() * HAPPY_MESSAGES.length));
        }
      } catch (e) {
        setIsVisible(true);
      }
    };

    checkShouldShow();
    const interval = setInterval(checkShouldShow, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 3D Card mouse tilt calculation for depth effect without heavy 3D engine
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max 10 deg tilt
    const tiltX = ((y - centerY) / centerY) * -8;
    const tiltY = ((x - centerX) / centerX) * 8;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleNextHappyMessage = () => {
    setIsSparkling(true);
    setTimeout(() => setIsSparkling(false), 700);
    setQuoteIndex((prev) => (prev + 1) % HAPPY_MESSAGES.length);
  };

  const currentMsg = HAPPY_MESSAGES[quoteIndex];

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -60, y: 40, scale: 0.85, rotateX: 15, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -60, scale: 0.9, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="fixed bottom-6 left-4 sm:left-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-md w-full select-none"
            style={{ perspective: 1200 }}
          >
            {/* 3D Container with GPU Hardware Acceleration */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(10px)`,
                transition: 'transform 0.15s ease-out',
                transformStyle: 'preserve-3d'
              }}
              className="relative overflow-hidden rounded-3xl bg-slate-900/95 text-white border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_35px_rgba(59,130,246,0.3)] backdrop-blur-xl"
            >
              {/* Top Specular 3D Lighting Stripe */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 opacity-90" />

              {/* 3D Ambient Glowing Orb in Background */}
              <div className="absolute -top-16 -left-16 w-40 h-40 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

              <div className="p-5 sm:p-6 relative z-10">
                {/* Header row with 3D Avatar Badge & Close button */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3.5">
                    {/* 3D Layered Glowing Badge */}
                    <div 
                      className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 p-0.5 shadow-[0_8px_20px_rgba(37,99,235,0.45)] transform transition-transform hover:scale-105"
                      style={{ transform: 'translateZ(20px)' }}
                    >
                      <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                        <Sparkles className={`w-6 h-6 text-amber-400 transition-transform duration-500 ${isSparkling ? 'rotate-180 scale-125' : ''}`} />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-60 pointer-events-none" />
                      </div>
                      {/* Active status pulse dot */}
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                          {currentMsg.title}
                        </h3>
                      </div>
                      <p className="text-[11px] font-bold text-blue-400 tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{adminEmail || 'Administrator Portal Active'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setIsVisible(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all border border-white/5 cursor-pointer shrink-0"
                    title="Dismiss welcome card"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Uplifting "Make Me Happy" Quote */}
                <div 
                  className="my-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 relative overflow-hidden transition-all duration-300"
                  style={{ transform: 'translateZ(15px)' }}
                >
                  <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-medium">
                    {currentMsg.quote}
                  </p>
                  
                  <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold text-[10px]">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" />
                      {currentMsg.tag}
                    </span>

                    {/* Button to cycle happy message */}
                    <button
                      type="button"
                      onClick={handleNextHappyMessage}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer bg-transparent border-0"
                    >
                      <Smile className="w-3.5 h-3.5" />
                      <span>Make Me Smile 😊</span>
                    </button>
                  </div>
                </div>

                {/* 15-Minute Session Timer & Sync Indicator */}
                <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Session Timer:</span>
                    <span className={`font-bold ${sessionTimeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      {formatTime(sessionTimeLeft)}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">(Resets in 15m)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onRefreshSession && (
                      <button
                        type="button"
                        onClick={onRefreshSession}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                        title="Extend session & refresh"
                      >
                        <RefreshCw size={10} />
                        <span>Keep Active</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsVisible(false)}
                      className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer border-0"
                    >
                      Let's Go! 🚀
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom 3D Session Progress Bar */}
              <div className="h-1.5 w-full bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(0, (sessionTimeLeft / (15 * 60)) * 100))}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Floating Corner Trigger (Left Corner) to reopen whenever desired */}
      {!isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsVisible(true);
            setQuoteIndex(Math.floor(Math.random() * HAPPY_MESSAGES.length));
          }}
          type="button"
          title="Open Welcome & Smile Card ✨"
          className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(37,99,235,0.4)] border border-white/20 cursor-pointer group"
          style={{ transform: 'perspective(600px) rotateY(-8deg)' }}
        >
          <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-45 transition-transform" />
          <span className="sr-only">Welcome Greeting</span>
        </motion.button>
      )}
    </>
  );
};
