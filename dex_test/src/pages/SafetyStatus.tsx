/**
 * SafetyStatus Page
 * Neutral, lightning-fast landing page for resource synchronization.
 */

import { useParams, Link, Navigate } from 'react-router-dom';
import { useData } from '../contexts/DataContextPublic';
import Meta from '../components/Meta';
import { ShieldCheck, ArrowLeft, Sparkles, LayoutGrid, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import NeutralSyncButton from '../components/NeutralSyncButton';
import { useMemo } from 'react';

export default function SafetyStatus() {
  const { apps = [], loading } = useData();
  const { slug } = useParams();
  
  const app = useMemo(() => apps.find(a => a.slug?.toLowerCase() === slug?.toLowerCase()), [apps, slug]);

  if (loading && !app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Synchronizing Metadata...</p>
      </div>
    );
  }

  if (!app) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 sm:px-6">
      <Meta 
        title={`Safety Status - ${app.name}`}
        description={`Resource node synchronization for ${app.name}.`}
        image={app.icon_url}
        noindex={true}
      />

      {/* Neutral Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <Link 
          to={`/app/${app.slug}`}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
        </Link>
      </div>

      <div className="max-w-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Neutral Icon Frame */}
            <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-[24px] p-1 border border-black/[0.05] dark:border-white/[0.05] mb-8 shadow-inner overflow-hidden">
              {app.icon_url ? (
                <img src={app.icon_url} alt="" className="w-full h-full object-cover rounded-[20px]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
              {app.name}
            </h1>
            
            <div className="flex items-center gap-2 mb-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Node ID: {app.serial_number}</span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Resource Active</span>
            </div>

            {/* The Neutral Sync Button */}
            <NeutralSyncButton appId={app.id} slug={app.slug} status={app.safety_status} />

            <div className="mt-12 grid grid-cols-3 gap-4 w-full pt-10 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Original</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Official</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Informational context (Neutral) */}
        <div className="mt-8 px-6">
          <div className="flex items-start gap-3 bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              This synchronization node ensures a secure connection between your device and the official resource server. 
              The process is encrypted and takes less than a second to finalize.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
