import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Star, 
  Play, 
  CheckCircle2, 
  Award, 
  Clock, 
  Pause, 
  Square, 
  Zap, 
  RotateCcw, 
  Activity, 
  Terminal, 
  FileText, 
  Compass, 
  Info, 
  Eye,
  Search,
  Languages
} from 'lucide-react';
import { AutobotLog, AutobotSessionStats, AutobotStage, stripHtmlTags } from './types';

interface Brain1StudioProps {
  currentApp: any;
  filteredApps: any[];
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;
  appSearch: string;
  setAppSearch: (q: string) => void;
  targetScore: number;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  brain1LanguageStyle: 'proper_english' | 'hinglish' | 'natural_mix';
  setBrain1LanguageStyle: (style: 'proper_english' | 'hinglish' | 'natural_mix') => void;
  autobotActive: boolean;
  autobotPaused: boolean;
  autobotExecutionMode: 'paced' | 'instant';
  setAutobotExecutionMode: (m: 'paced' | 'instant') => void;
  autobotSaveDirectly: boolean;
  setAutobotSaveDirectly: (val: boolean) => void;
  autobotTargetGoal: number;
  setAutobotTargetGoal: (n: number) => void;
  autobotBatchSize: number;
  setAutobotBatchSize: (n: number) => void;
  autobotCycleDelay: number;
  setAutobotCycleDelay: (n: number) => void;
  autobotCurrentStage: AutobotStage;
  autobotSessionStats: AutobotSessionStats;
  autobotLogs: AutobotLog[];
  brain1Dossier: any;
  dossierHealth: { descChars: number; featuresChars?: number; modes: string[]; hasSafety?: boolean; hasFaqs?: boolean; summary: string };
  onStartAutobot: () => void;
  onPauseAutobot: () => void;
  onResumeAutobot: () => void;
  onStopAutobot: () => void;
  onExecuteStep: (isManualTrigger?: boolean) => void;
  onResetSession: () => void;
}

export const Brain1Studio: React.FC<Brain1StudioProps> = ({
  currentApp,
  filteredApps,
  selectedAppId,
  setSelectedAppId,
  appSearch,
  setAppSearch,
  targetScore,
  customPrompt,
  setCustomPrompt,
  brain1LanguageStyle,
  setBrain1LanguageStyle,
  autobotActive,
  autobotPaused,
  autobotExecutionMode,
  setAutobotExecutionMode,
  autobotSaveDirectly,
  setAutobotSaveDirectly,
  autobotTargetGoal,
  setAutobotTargetGoal,
  autobotBatchSize,
  setAutobotBatchSize,
  autobotCycleDelay,
  setAutobotCycleDelay,
  autobotCurrentStage,
  autobotSessionStats,
  autobotLogs,
  brain1Dossier,
  dossierHealth,
  onStartAutobot,
  onPauseAutobot,
  onResumeAutobot,
  onStopAutobot,
  onExecuteStep,
  onResetSession
}) => {
  const [showDossierDrawer, setShowDossierDrawer] = useState(false);
  const [dossierActiveTab, setDossierActiveTab] = useState<'overview' | 'description' | 'features' | 'safety' | 'faqs' | 'raw'>('overview');

  return (
    <div className="space-y-6">
      
      {/* 1. Main Brain 1 Control Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Brain 1: Deep Admin Dossier Comprehension Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  gemini-2.5-pro
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyzes complete internal app dossier (HTML description, gameplay rules, alerts, FAQs) to craft authentic Indian player reviews.
              </p>
            </div>
          </div>

          <div className="relative w-full lg:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search target app in catalog..."
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Selected App & Ingested Information Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
          
          <div className="lg:col-span-6 flex items-center gap-4">
            {currentApp?.icon_url ? (
              <img 
                src={currentApp.icon_url} 
                alt={currentApp?.name || 'App'} 
                className="w-14 h-14 rounded-2xl object-contain shadow-xs bg-white dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700" 
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-black text-emerald-600 shrink-0 text-xl">
                {currentApp?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full text-base font-black bg-transparent text-slate-900 dark:text-white border-0 cursor-pointer focus:outline-none truncate"
              >
                {filteredApps.map(app => (
                  <option key={app.id} value={app.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {app.name} ({app.category || 'General'}) • Store: {app.rating || '4.8'}★
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>Developer: <strong className="text-slate-800 dark:text-slate-200">{currentApp?.developer || 'Studio'}</strong></span>
                <span>•</span>
                <span>Category: <strong>{currentApp?.category || 'Card'}</strong></span>
                <span>•</span>
                <span>Size: <strong>{currentApp?.file_size || 'Fast DL'}</strong></span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-2 text-[11px] font-semibold">
            <div className="bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 flex items-center gap-1.5">
              <FileText size={13} className="text-emerald-500" />
              <span>Chars Ingested: <strong>{brain1Dossier?.dossierStats?.totalChars || dossierHealth.descChars}</strong></span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/70 flex items-center gap-1.5">
              <Compass size={13} className="text-blue-500" />
              <span>Mechanics: <strong>{brain1Dossier?.highlights?.length || dossierHealth.modes.length}</strong></span>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/70 flex items-center gap-1.5">
              <Info size={13} className="text-purple-500" />
              <span>FAQs: <strong>{brain1Dossier?.dossierStats?.faqCount || 0}</strong></span>
            </div>
            <button
              onClick={() => setShowDossierDrawer(!showDossierDrawer)}
              className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs"
            >
              <Eye size={13} />
              <span>{showDossierDrawer ? 'Hide 360° Info' : 'Inspect 360° App Info'}</span>
            </button>
          </div>

        </div>

        {/* Expandable 360° Broad Information Explorer */}
        {showDossierDrawer && (
          <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 overflow-hidden space-y-3 animate-in fade-in duration-200">
            <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Terminal size={15} />
                <span>Complete App Dossier Ingested by Brain 1 for "{currentApp?.name}"</span>
              </div>
              
              <div className="flex items-center gap-1">
                {(['overview', 'description', 'features', 'safety', 'faqs', 'raw'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDossierActiveTab(tab)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                      dossierActiveTab === tab
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 max-h-56 overflow-y-auto text-xs text-slate-300 leading-relaxed space-y-2 pr-3 scrollbar-thin">
              {dossierActiveTab === 'overview' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(brain1Dossier?.highlights || dossierHealth.modes).map((m: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-400 text-xs mt-2">{brain1Dossier?.descriptionSummary || dossierHealth.summary}</p>
                </div>
              )}

              {dossierActiveTab === 'description' && (
                <div className="space-y-1">
                  <div className="text-emerald-400 font-bold text-[11px]">Database App Description:</div>
                  <p className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">
                    {stripHtmlTags(currentApp?.description_html || currentApp?.description || 'No description provided')}
                  </p>
                </div>
              )}

              {dossierActiveTab === 'features' && (
                <div className="space-y-1">
                  <div className="text-emerald-400 font-bold text-[11px]">Features Breakdown:</div>
                  <p className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">
                    {stripHtmlTags(currentApp?.features_html || currentApp?.features || 'No features list provided')}
                  </p>
                </div>
              )}

              {dossierActiveTab === 'safety' && (
                <div className="space-y-2">
                  {currentApp?.red_box_msg && (
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300">
                      <span className="font-bold text-xs">Critical Notice: </span>
                      {stripHtmlTags(currentApp.red_box_msg)}
                    </div>
                  )}
                  {currentApp?.yellow_box_msg && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300">
                      <span className="font-bold text-xs">Caution Notice: </span>
                      {stripHtmlTags(currentApp.yellow_box_msg)}
                    </div>
                  )}
                  {currentApp?.idea_box_msg && (
                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300">
                      <span className="font-bold text-xs">Admin Tips: </span>
                      {stripHtmlTags(currentApp.idea_box_msg)}
                    </div>
                  )}
                  {!currentApp?.red_box_msg && !currentApp?.yellow_box_msg && !currentApp?.idea_box_msg && (
                    <p className="text-slate-400 text-xs">No special safety alerts assigned to this app.</p>
                  )}
                </div>
              )}

              {dossierActiveTab === 'faqs' && (
                <div className="space-y-2 font-mono text-[11px]">
                  {brain1Dossier?.faqsList && brain1Dossier.faqsList.length > 0 ? (
                    brain1Dossier.faqsList.map((f: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-800/60 rounded-lg">
                        <span className="text-emerald-400 font-bold">Q: {f.question}</span>
                        <p className="text-slate-300 mt-0.5">A: {f.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs">No FAQs logged for this app.</p>
                  )}
                </div>
              )}

              {dossierActiveTab === 'raw' && (
                <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-tight">
                  {brain1Dossier?.fullSummary || dossierHealth.summary}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Freedom Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>Unforced Human Freedom Engine Active</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">Zero Templates</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                The autobot creates unforced, natural Indian player thoughts based on the broad app details. No rigid formulas or repetitive phrasing.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span>Store Benchmark: <strong>{targetScore.toFixed(1)}★</strong></span>
          </div>
        </div>

        {/* Review Language & Commenter Voice Selection */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Languages size={15} />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Review Language & Commenter Voice
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select how players naturally write reviews: Proper English, Desi Hinglish, or a realistic Play Store mix.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 self-start sm:self-auto shrink-0">
              {brain1LanguageStyle === 'proper_english' ? 'Proper English Mode' : brain1LanguageStyle === 'hinglish' ? 'Hinglish Mode' : 'Balanced Mix (60/40)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Option 1: Proper English */}
            <button
              type="button"
              onClick={() => setBrain1LanguageStyle('proper_english')}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                brain1LanguageStyle === 'proper_english'
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Proper English</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">Clean</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${brain1LanguageStyle === 'proper_english' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                  {brain1LanguageStyle === 'proper_english' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Natural, fluent English as written by real players on Play Store. No Hindi words or slang.
              </p>
              <div className="text-[10px] italic font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-lg">
                "Smooth matchmaking, zero lag on 4G. Clean card auto-sorting."
              </div>
            </button>

            {/* Option 2: Casual Hinglish */}
            <button
              type="button"
              onClick={() => setBrain1LanguageStyle('hinglish')}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                brain1LanguageStyle === 'hinglish'
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Casual Hinglish</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">Desi</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${brain1LanguageStyle === 'hinglish' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                  {brain1LanguageStyle === 'hinglish' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Conversational blend of Hindi & English gaming terms as used in Indian chat & reviews.
              </p>
              <div className="text-[10px] italic font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-lg">
                "Bhai mast game hai, table turant join hota hai aur lag bilkul nahi hai."
              </div>
            </button>

            {/* Option 3: Natural Mix */}
            <button
              type="button"
              onClick={() => setBrain1LanguageStyle('natural_mix')}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                brain1LanguageStyle === 'natural_mix'
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Natural Mix (Balanced)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">60/40</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${brain1LanguageStyle === 'natural_mix' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                  {brain1LanguageStyle === 'natural_mix' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Real-world Play Store mix: ~60% crisp casual English and ~40% conversational Hinglish.
              </p>
              <div className="text-[10px] italic font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-lg">
                Organically alternates styles for maximum natural diversity across batches.
              </div>
            </button>
          </div>
        </div>

        {/* Autobot Execution Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Play size={13} className="text-emerald-500" />
              Autobot Execution Mode
            </label>
            <select
              value={autobotExecutionMode}
              onChange={(e) => setAutobotExecutionMode(e.target.value as any)}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="paced">Paced Stream (Loop with live reasoning)</option>
              <option value="instant">Instant Batch (Fast 1-shot generation)</option>
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Paced stream shows live thinking & drafting in terminal.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              Publishing Destination
            </label>
            <select
              value={autobotSaveDirectly ? 'direct' : 'staging'}
              onChange={(e) => setAutobotSaveDirectly(e.target.value === 'direct')}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="staging">Staging Deck (Inspect & 1-Click Approve)</option>
              <option value="direct">Autonomous Auto-Publish (Direct to Live DB)</option>
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Safe staging lets you verify or edit before publishing.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={13} className="text-emerald-500" />
              Target Review Goal
            </label>
            <select
              value={autobotTargetGoal}
              onChange={(e) => setAutobotTargetGoal(parseInt(e.target.value, 10))}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={5}>5 Reviews Total</option>
              <option value={10}>10 Reviews Total</option>
              <option value={20}>20 Reviews Total</option>
              <option value={30}>30 Reviews Total</option>
              <option value={50}>50 Reviews Total</option>
              <option value={-1}>Continuous Loop (Run until stopped)</option>
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Autobot stops automatically when goal is reached.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-emerald-500" />
              Cycle Pace & Rate
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={autobotBatchSize}
                onChange={(e) => setAutobotBatchSize(parseInt(e.target.value, 10))}
                className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={1}>1 / cycle</option>
                <option value={2}>2 / cycle</option>
                <option value={3}>3 / cycle</option>
                <option value={5}>5 / cycle</option>
              </select>
              <select
                value={autobotCycleDelay}
                onChange={(e) => setAutobotCycleDelay(parseInt(e.target.value, 10))}
                className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={2}>2s delay</option>
                <option value={3}>3s delay</option>
                <option value={5}>5s delay</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Controls generation rhythm and rate limiting.</p>
          </div>
        </div>

        {/* Optional Topic Spark */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            <Sparkles size={14} className="text-emerald-500" />
            <span>Optional Topic Spark:</span>
          </div>
          <input
            type="text"
            placeholder="E.g., 'Mention fast card auto-sort or smooth table felt' (Soft guidance only, does not force AI)"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {!autobotActive ? (
              <button
                onClick={onStartAutobot}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400/40 hover:scale-[1.02]"
              >
                <Play size={15} className="fill-white" />
                <span>Start Autobot Runner (Autonomous Flow)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {autobotPaused ? (
                  <button
                    onClick={onResumeAutobot}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play size={14} className="fill-white" />
                    <span>Resume Autobot</span>
                  </button>
                ) : (
                  <button
                    onClick={onPauseAutobot}
                    className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Pause size={14} />
                    <span>Pause Autobot</span>
                  </button>
                )}
                <button
                  onClick={onStopAutobot}
                  className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Square size={14} className="fill-white" />
                  <span>Stop & Disengage</span>
                </button>
              </div>
            )}

            <button
              onClick={() => onExecuteStep(true)}
              disabled={autobotActive}
              className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Zap size={14} className="text-emerald-500" />
              <span>Run Single Step (1-Shot)</span>
            </button>
          </div>

          <button
            onClick={onResetSession}
            className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset session telemetry and logs"
          >
            <RotateCcw size={13} />
            <span>Reset Session</span>
          </button>
        </div>

      </div>

      {/* 2. Telemetry HUD & Live Terminal Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        
        {/* Stage Pipeline Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider">
            <Activity size={15} className="text-emerald-400" />
            <span>Multitask Reasoning & Execution Pipeline</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            {[
              { key: 'ingesting', label: '1. Ingest Dossier' },
              { key: 'reasoning', label: '2. Human Reasoning' },
              { key: 'synthesizing', label: '3. Draft Reviews' },
              { key: 'sanitizing', label: '4. Safety Guard' },
              { key: 'published', label: '5. Commit Store' }
            ].map((step) => {
              const isCurrent = autobotCurrentStage === step.key;
              return (
                <div
                  key={step.key}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                      : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Generated</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{autobotSessionStats.totalGenerated}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Auto-Published</div>
            <div className="text-xl font-black text-blue-400 mt-0.5">{autobotSessionStats.autoPublished}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Staged In Deck</div>
            <div className="text-xl font-black text-purple-400 mt-0.5">{autobotSessionStats.staged}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Cycles Run</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{autobotSessionStats.cyclesCompleted}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Engine Model</div>
            <div className="text-xs font-bold text-slate-300 mt-1 truncate">
              {autobotSessionStats.lastModel || 'gemini-3.8-flash'}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Last Latency</div>
            <div className="text-xs font-bold text-slate-300 mt-1">
              {autobotSessionStats.lastLatencyMs ? `${(autobotSessionStats.lastLatencyMs / 1000).toFixed(1)}s` : 'Ready'}
            </div>
          </div>
        </div>

        {/* Live Terminal Log Feed */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Terminal size={14} />
              <span>Autobot Live Telemetry Feed</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {autobotLogs.length} events logged this session
            </span>
          </div>

          <div className="h-44 overflow-y-auto font-mono text-[11px] space-y-1.5 pr-2 scrollbar-thin text-slate-300">
            {autobotLogs.length === 0 ? (
              <div className="text-slate-600 italic py-6 text-center">
                Autobot telemetry terminal ready. Click "Start Autobot Runner" or "Run Single Step" to begin streaming reviews.
              </div>
            ) : (
              autobotLogs.map((log) => {
                let colorClass = 'text-slate-300';
                if (log.type === 'success') colorClass = 'text-emerald-400 font-semibold';
                if (log.type === 'reasoning') colorClass = 'text-blue-400';
                if (log.type === 'safety') colorClass = 'text-purple-300';
                if (log.type === 'warn') colorClass = 'text-amber-400';

                return (
                  <div key={log.id} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-500 shrink-0 text-[10px]">[{log.time}]</span>
                    <span className={`${colorClass} flex-1 break-words`}>{log.text}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
