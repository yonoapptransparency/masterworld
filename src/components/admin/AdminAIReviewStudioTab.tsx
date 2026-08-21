import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Bot, 
  Smartphone, 
  Layers, 
  Star, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Trash2, 
  Edit3, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Zap,
  Users,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { toast } from '../Toast';
import { adminFetch } from '../../services/adminAuthService';

interface AdminAIReviewStudioTabProps {
  appsList: any[];
  onReviewsGenerated?: () => void;
}

export const AdminAIReviewStudioTab: React.FC<AdminAIReviewStudioTabProps> = ({ 
  appsList = [],
  onReviewsGenerated 
}) => {
  // Mode: 'single' or 'bulk'
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single App Settings (Persisted in localStorage)
  const [selectedAppId, setSelectedAppId] = useState<string>(appsList[0]?.id || '');
  const [appSearch, setAppSearch] = useState('');
  const [singleCount, setSingleCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('rummydex_admin_ai_review_count');
      return saved ? Math.max(1, parseInt(saved, 10)) : 5;
    } catch {
      return 5;
    }
  });
  const [targetScore, setTargetScore] = useState<number>(4.8);
  const [toneFocus, setToneFocus] = useState<'balanced' | 'performance' | 'gameplay' | 'ui_graphics' | 'casual'>('balanced');

  // Handle saving the user's preset default count
  const handleUpdateSingleCount = (count: number) => {
    setSingleCount(count);
    try {
      localStorage.setItem('rummydex_admin_ai_review_count', String(count));
      toast(`Saved ${count} reviews as your default 1-click preset!`, 'success');
    } catch (e) {
      console.warn(e);
    }
  };
  
  // Custom Distribution Toggle
  const [customDistribution, setCustomDistribution] = useState(false);
  const [starMix, setStarMix] = useState({
    star5: 70,
    star4: 20,
    star3: 7,
    star2: 3,
    star1: 0
  });

  // Staged Preview Reviews (Single App)
  const [stagedReviews, setStagedReviews] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savingStaged, setSavingStaged] = useState(false);

  // Bulk Generation State
  const [bulkCountPerApp, setBulkCountPerApp] = useState<number>(3);
  const [bulkCategory, setBulkCategory] = useState<string>('all');
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; active: boolean } | null>(null);
  const [bulkResult, setBulkResult] = useState<{ totalGenerated: number; totalApps: number } | null>(null);

  // Filtered Apps for Single Selector
  const filteredApps = useMemo(() => {
    if (!appSearch.trim()) return appsList;
    const q = appSearch.toLowerCase();
    return appsList.filter(a => 
      (a.name && a.name.toLowerCase().includes(q)) || 
      (a.slug && a.slug.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q))
    );
  }, [appsList, appSearch]);

  // Current Target App Details
  const currentApp = useMemo(() => {
    return appsList.find(a => a.id === selectedAppId || a.slug === selectedAppId) || appsList[0];
  }, [appsList, selectedAppId]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    appsList.forEach(a => {
      if (a.category) {
        a.category.split(',').forEach((c: string) => cats.add(c.trim()));
      }
    });
    return Array.from(cats);
  }, [appsList]);

  // Generate for Single App (Preview/Stage)
  const handleGenerateSingle = async (instantSave = false) => {
    if (!currentApp) {
      toast("Please select an app first", "error");
      return;
    }

    try {
      setGenerating(true);
      const res = await adminFetch('/api/v1/admin/community/ai-generate/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: currentApp.id,
          appData: currentApp,
          count: singleCount,
          targetScore,
          toneFocus,
          starMix: customDistribution ? starMix : undefined,
          saveDirectly: instantSave
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate reviews');

      if (instantSave) {
        toast(`Generated and published ${data.count || singleCount} reviews!`, "success");
        setStagedReviews([]);
        if (onReviewsGenerated) onReviewsGenerated();
      } else {
        setStagedReviews(data.reviews || []);
        toast(`Generated ${data.reviews?.length || 0} reviews ready for your review!`, "success");
      }
    } catch (err: any) {
      toast(err.message || "Generation error", "error");
    } finally {
      setGenerating(false);
    }
  };

  // Publish Staged Reviews
  const handlePublishStaged = async () => {
    if (stagedReviews.length === 0) return;
    try {
      setSavingStaged(true);
      for (const rev of stagedReviews) {
        await adminFetch('/api/v1/admin/community/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appId: currentApp.id,
            userName: rev.userName,
            rating: rev.rating,
            reviewText: rev.reviewText,
            status: 'published',
            helpful_count: rev.helpful_count || 0
          })
        });
      }

      toast(`Successfully published ${stagedReviews.length} reviews to ${currentApp.name}!`, "success");
      setStagedReviews([]);
      if (onReviewsGenerated) onReviewsGenerated();
    } catch (err: any) {
      toast(err.message || "Failed to publish staged reviews", "error");
    } finally {
      setSavingStaged(false);
    }
  };

  // Run 1-Click Bulk Generator in Safe Batches of 5 apps
  const handleRunBulk = async () => {
    let targetApps = appsList;
    if (bulkCategory !== 'all') {
      targetApps = appsList.filter(a => a.category && a.category.toLowerCase().includes(bulkCategory.toLowerCase()));
    }

    if (targetApps.length === 0) {
      toast("No apps match the selected category", "error");
      return;
    }

    const confirmed = window.confirm(
      `Generate AI reviews for ${targetApps.length} apps (${bulkCountPerApp} reviews each = ~${targetApps.length * bulkCountPerApp} total reviews)?\n\nThis will process smoothly in smart batches to ensure peak quality and save directly into the database.`
    );
    if (!confirmed) return;

    try {
      setGenerating(true);
      setBulkProgress({ current: 0, total: targetApps.length, active: true });
      setBulkResult(null);

      const BATCH_SIZE = 5;
      let totalCreated = 0;

      for (let i = 0; i < targetApps.length; i += BATCH_SIZE) {
        const chunk = targetApps.slice(i, i + BATCH_SIZE);
        const chunkAppIds = chunk.map(a => a.id);

        setBulkProgress({
          current: Math.min(i + BATCH_SIZE, targetApps.length),
          total: targetApps.length,
          active: true
        });

        const res = await adminFetch('/api/v1/admin/community/ai-generate/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appIds: chunkAppIds,
            countPerApp: bulkCountPerApp,
            targetScore,
            toneFocus,
            starMix: customDistribution ? starMix : undefined
          })
        });

        if (res.ok) {
          const data = await res.json();
          totalCreated += data.totalGenerated || (chunk.length * bulkCountPerApp);
        }
      }

      setBulkResult({
        totalGenerated: totalCreated,
        totalApps: targetApps.length
      });

      toast(`Bulk generation complete! ${totalCreated} reviews created across ${targetApps.length} apps.`, "success");
      if (onReviewsGenerated) onReviewsGenerated();
    } catch (err: any) {
      toast(err.message || "Bulk generation encountered an issue", "error");
    } finally {
      setGenerating(false);
      setBulkProgress(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold backdrop-blur-md border border-blue-400/30">
              <Sparkles size={14} className="animate-spin text-amber-400" />
              <span>Gemini 3.7 Flash AI Review Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Authentic AI Peer Reviews Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Generate 100% human-sounding, contextual reviews referencing real game mechanics, 60fps performance, table animations, and device responsiveness. Full control over star rating distributions (5★, 4★, 3★, 2★) with zero financial trigger words.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 backdrop-blur-sm self-stretch md:self-auto">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'single'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone size={16} />
              <span>Single App Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('bulk')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'bulk'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={16} />
              <span>1-Click Bulk Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety and Quality Policy Strip */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-medium">
          <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Anti-Financial Guardrails Active:</strong> Reviews focus strictly on game graphics, UI animations, touch responsiveness, matchmaking speed, and device FPS. Real money / cash / deposit keywords are automatically sanitized.
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] shrink-0">
          <span>Staggered Dates (5–90 Days)</span>
          <span>•</span>
          <span>Google Schema Synced</span>
        </div>
      </div>

      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sliders size={16} className="text-blue-600" />
              <span>Rating & Persona Controls</span>
            </div>

            {/* Target Score Controller */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Target Average Score
                </label>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-black rounded-md flex items-center gap-1">
                  ⭐ {targetScore.toFixed(1)} / 5.0
                </span>
              </div>
              <input
                type="range"
                min="3.0"
                max="5.0"
                step="0.1"
                value={targetScore}
                onChange={(e) => setTargetScore(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>3.0 (Mixed/Critique)</span>
                <span>4.5 (High Quality)</span>
                <span>4.8 (Top Tier)</span>
                <span>5.0 (Flawless)</span>
              </div>
            </div>

            {/* Persona / Tone Focus */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Review Tone & Focus
              </label>
              <select
                value={toneFocus}
                onChange={(e: any) => setToneFocus(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="balanced">Balanced Variety (Mix of Gamers & Casuals)</option>
                <option value="performance">Performance & FPS (Smoothness, Device Mention, No Lag)</option>
                <option value="ui_graphics">UI & Graphics (Table Design, 3D Chips, Audio)</option>
                <option value="gameplay">Gameplay & Rules (Fast Rounds, Matchmaking, Offline)</option>
                <option value="casual">Casual Commuter (Quick Breaks, Intuitive Controls)</option>
              </select>
            </div>

            {/* Custom Star Mix Accordion */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Star Mix</span>
                <button
                  type="button"
                  onClick={() => setCustomDistribution(!customDistribution)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    customDistribution 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {customDistribution ? 'Custom Active' : 'Auto Calculate'}
                </button>
              </div>

              {customDistribution && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 font-bold">5 Stars</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={starMix.star5}
                      onChange={(e) => setStarMix({...starMix, star5: parseInt(e.target.value) || 0})}
                      className="w-16 text-right px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs" 
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 font-bold">4 Stars</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={starMix.star4}
                      onChange={(e) => setStarMix({...starMix, star4: parseInt(e.target.value) || 0})}
                      className="w-16 text-right px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs" 
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 font-bold">3 Stars</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={starMix.star3}
                      onChange={(e) => setStarMix({...starMix, star3: parseInt(e.target.value) || 0})}
                      className="w-16 text-right px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs" 
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 font-bold">2 Stars</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={starMix.star2}
                      onChange={(e) => setStarMix({...starMix, star2: parseInt(e.target.value) || 0})}
                      className="w-16 text-right px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs" 
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Single App Studio or Bulk Generator Panel */}
        <div className="lg:col-span-2 space-y-6">
          {mode === 'single' ? (
            /* Single App Studio */
            <div className="space-y-6">
              {/* App Selector Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Smartphone size={16} className="text-blue-600" />
                    <span>Select Target App</span>
                  </div>

                  {/* Search Bar for Apps */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search app by name..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Selected App Card & Dropdown */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {currentApp?.icon_url ? (
                    <img 
                      src={currentApp.icon_url} 
                      alt={currentApp.name} 
                      className="w-12 h-12 rounded-xl object-contain shadow-xs bg-white dark:bg-slate-800" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-bold text-blue-600">
                      {currentApp?.name?.charAt(0) || 'A'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="w-full text-sm font-bold bg-transparent text-slate-900 dark:text-white border-0 cursor-pointer focus:outline-none"
                    >
                      {filteredApps.map(app => (
                        <option key={app.id} value={app.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                          {app.name} ({app.category || 'General'})
                        </option>
                      ))}
                    </select>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Developer: {currentApp?.developer || 'Official Studio'} • Size: {currentApp?.file_size || 'N/A'} • ID: {currentApp?.id}
                    </div>
                  </div>

                  {/* Quantity to generate (Persistent Preset) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Preset Count:</label>
                      <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Auto-Saved</span>
                    </div>
                    <select
                      value={singleCount}
                      onChange={(e) => handleUpdateSingleCount(parseInt(e.target.value, 10))}
                      className="text-xs font-bold bg-white dark:bg-slate-800 border-2 border-blue-500/40 dark:border-blue-500/40 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-600 shadow-xs"
                      title="This preset is automatically saved. Every time you trigger generation, this exact count will be created."
                    >
                      <option value={1}>1 Review (Single)</option>
                      <option value={3}>3 Reviews</option>
                      <option value={5}>5 Reviews (Recommended)</option>
                      <option value={8}>8 Reviews (Varied Mix)</option>
                      <option value={10}>10 Reviews (Full Thread)</option>
                      <option value={15}>15 Reviews</option>
                      <option value={20}>20 Reviews</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateSingle(false)}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {generating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Synthesizing Authentic Reviews...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generate & Preview ({singleCount} Reviews)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateSingle(true)}
                    disabled={generating}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Instant Publish</span>
                  </button>
                </div>
              </div>

              {/* Staged Reviews Preview Cards */}
              {stagedReviews.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span>Staged AI Reviews ({stagedReviews.length})</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Edit text or usernames before publishing to Firestore.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishStaged}
                      disabled={savingStaged}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {savingStaged ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Publish All to Database</span>
                    </button>
                  </div>

                  {/* List of generated reviews */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {stagedReviews.map((rev, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={rev.userName}
                              onChange={(e) => {
                                const copy = [...stagedReviews];
                                copy[idx].userName = e.target.value;
                                setStagedReviews(copy);
                              }}
                              className="text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded"
                            />
                            <div className="flex items-center text-amber-500 text-xs">
                              {Array.from({ length: 5 }).map((_, sIdx) => (
                                <Star
                                  key={sIdx}
                                  size={13}
                                  className={sIdx < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {rev.timestamp ? new Date(rev.timestamp).toLocaleDateString() : 'Recent'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setStagedReviews(stagedReviews.filter((_, i) => i !== idx));
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={rev.reviewText}
                          onChange={(e) => {
                            const copy = [...stagedReviews];
                            copy[idx].reviewText = e.target.value;
                            setStagedReviews(copy);
                          }}
                          className="w-full text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 1-Click Bulk Generator Panel */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    1-Click Bulk Review Deployment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Populate your entire app catalog with authentic human reviews in a single batch operation.
                  </p>
                </div>
              </div>

              {/* Bulk Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Target Category Filter
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">All Categories ({appsList.length} Apps)</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Reviews Per App
                  </label>
                  <select
                    value={bulkCountPerApp}
                    onChange={(e) => setBulkCountPerApp(parseInt(e.target.value))}
                    className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value={2}>2 Reviews per App</option>
                    <option value={3}>3 Reviews per App (Recommended)</option>
                    <option value={5}>5 Reviews per App</option>
                    <option value={10}>10 Reviews per App</option>
                  </select>
                </div>
              </div>

              {/* Estimated Math Box */}
              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-blue-900 dark:text-blue-200">Estimated Generation Volume:</div>
                  <div className="text-blue-700 dark:text-blue-400 text-[11px]">
                    Target Average: ⭐ {targetScore.toFixed(1)} • Staggered dates across 90 days • Schema Synced
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-blue-600 dark:text-blue-300 text-sm">
                  {bulkCategory === 'all' ? appsList.length : appsList.filter(a => a.category?.includes(bulkCategory)).length} Apps × {bulkCountPerApp} = ~
                  {(bulkCategory === 'all' ? appsList.length : appsList.filter(a => a.category?.includes(bulkCategory)).length) * bulkCountPerApp} Reviews
                </div>
              </div>

              {/* Progress Bar during Bulk Generation */}
              {generating && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-blue-600" />
                      <span>Synthesizing batch reviews with Gemini AI...</span>
                    </span>
                    <span className="font-mono text-blue-600">Processing...</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full animate-pulse w-full rounded-full" />
                  </div>
                </div>
              )}

              {/* Result Banner */}
              {bulkResult && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold">Batch Generation Successfully Completed!</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Created {bulkResult.totalGenerated} reviews across {bulkResult.totalApps} catalog applications.
                    </div>
                  </div>
                </div>
              )}

              {/* Launch Bulk Button */}
              <button
                type="button"
                onClick={handleRunBulk}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {generating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Processing Bulk Catalog...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Start 1-Click Bulk Generation for All Selected Apps</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAIReviewStudioTab;
