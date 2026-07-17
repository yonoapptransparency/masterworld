import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AgeVerificationModal() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDenied, setIsDenied] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already verified
    const isVerified = localStorage.getItem('age_verified') === 'true';
    if (!isVerified) {
      setShowModal(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('age_verified', 'true');
    setShowModal(false);
  };

  const handleDeny = () => {
    setIsDenied(true);
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md"
        />

        {/* Modal Card Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center"
        >
          {!isDenied ? (
            <>
              {/* Shield Icon Accent */}
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 text-blue-400">
                <ShieldAlert className="w-8 h-8" />
              </div>

              {/* Header Title */}
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-white">
                Age Verification Required
              </h2>

              {/* Explanation Text */}
              <p className="text-sm sm:text-base text-zinc-400 mb-6 leading-relaxed">
                This store contains real-money card games and entertainment applications. You must be at least <strong>18 years of age or older</strong> to access the content.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
                <button
                  id="btn-age-verify-success"
                  onClick={handleVerify}
                  className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base rounded-xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <CheckCircle className="w-5 h-5" />
                  I am 18 or older
                </button>
                <button
                  id="btn-age-verify-deny"
                  onClick={handleDeny}
                  className="flex-1 py-3 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm sm:text-base rounded-xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-zinc-700"
                >
                  <XCircle className="w-5 h-5" />
                  I am under 18
                </button>
              </div>

              {/* Legal Links */}
              <p className="text-[11px] text-zinc-500 leading-normal max-w-sm">
                By entering this site, you acknowledge and agree to our{' '}
                <Link to="/terms" onClick={() => setShowModal(false)} className="text-blue-400 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" onClick={() => setShowModal(false)} className="text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              {/* Access Blocked Icon */}
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 text-red-400">
                <XCircle className="w-8 h-8" />
              </div>

              {/* Access Blocked Title */}
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 text-red-500">
                Access Restricted
              </h2>

              {/* Explanation Text */}
              <p className="text-sm sm:text-base text-zinc-400 mb-6 leading-relaxed max-w-sm">
                We are sorry, but you must be at least 18 years old to access our gaming store. You cannot proceed to any downloads or pages.
              </p>

              {/* Help Link */}
              <p className="text-xs text-zinc-500">
                Need more information? Read our{' '}
                <Link to="/responsibility" onClick={() => setShowModal(false)} className="text-blue-400 hover:underline">
                  Responsible Gaming guidelines
                </Link>
                .
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
