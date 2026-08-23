import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Star, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Zap, 
  Search,
  BookmarkCheck,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Award,
  Scale,
  BarChart3,
  MessageSquarePlus,
  Lock,
  Info
} from 'lucide-react';
import { toast } from '../Toast';
import { adminFetch } from '../../services/adminAuthService';

export interface AppReviewProfile {
  targetScore: number;
  customDistribution: boolean;
  starMix: {
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
  toneFocus: 'balanced' | 'performance' | 'gameplay' | 'ui_graphics' | 'casual';
  singleCount: number;
  customPrompt?: string;
  updatedAt?: string;
}

interface AdminAIReviewStudioTabProps {
  appsList: any[];
  onReviewsGenerated?: () => void;
}

const STORAGE_KEY_PROFILES = 'rummydex_admin_ai_app_profiles';
const STORAGE_KEY_DEFAULT_COUNT = 'rummydex_admin_ai_review_count';

// Helper to load all per-app profiles
function loadAllAppProfiles(): Record<string, AppReviewProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to save all per-app profiles
function saveAllAppProfiles(profiles: Record<string, AppReviewProfile>) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.warn("Failed to persist AI review profiles to localStorage", e);
  }
}

// Preset distribution configurations
const PRESET_DISTRIBUTIONS = [
  {
    name: 'Overwhelmingly Positive',
    icon: Flame,
    score: 4.9,
    mix: { star5: 90, star4: 10, star3: 0, star2: 0, star1: 0 },
    color: 'from-amber-500 to-rose-500 text-amber-500'
  },
  {
    name: 'Top Tier Verified',
    icon: Award,
    score: 4.7,
    mix: { star5: 75, star4: 20, star3: 5, star2: 0, star1: 0 },
    color: 'from-blue-500 to-indigo-500 text-blue-500'
  },
  {
    name: 'Balanced Genuine',
    icon: Scale,
    score: 4.5,
    mix: { star5: 60, star4: 30, star3: 8, star2: 2, star1: 0 },
    color: 'from-emerald-500 to-teal-500 text-emerald-500'
  },
  {
    name: 'Organic Mixed',
    icon: BarChart3,
    score: 4.1,
    mix: { star5: 45, star4: 35, star3: 15, star2: 5, star1: 0 },
    color: 'from-purple-500 to-indigo-500 text-purple-500'
  }
];

export const AdminAIReviewStudioTab: React.FC<AdminAIReviewStudioTabProps> = ({ 
  appsList = [],
  onReviewsGenerated 
}) => {
  // Mode: 'single' or 'bulk'
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Persistent Map of all App Profiles
  const [appProfiles, setAppProfiles] = useState<Record<string, AppReviewProfile>>(loadAllAppProfiles);

  // Selected App
  const [selectedAppId, setSelectedAppId] = useState<string>(appsList[0]?.id || '');
  const [appSearch, setAppSearch] = useState('');

  // Current Target App Details
  const currentApp = useMemo(() => {
    return appsList.find(a => a.id === selectedAppId || a.slug === selectedAppId) || appsList[0];
  }, [appsList, selectedAppId]);

  // Current App Profile State
  const targetScore = currentApp?.rating ? Math.min(5.0, Math.max(3.0, Number(currentApp.rating))) : 4.8;
  const [toneFocus, setToneFocus] = useState<'balanced' | 'performance' | 'gameplay' | 'ui_graphics' | 'casual'>('balanced');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [singleCount, setSingleCount] = useState<number>(5);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Synchronize state when selected app changes
  useEffect(() => {
    if (!currentApp) return;

    const appId = String(currentApp.id || currentApp.slug || '');
    const saved = appProfiles[appId] || appProfiles[String(currentApp.slug || '')];

    if (saved) {
      setToneFocus(saved.toneFocus ?? 'balanced');
      setSingleCount(saved.singleCount ?? 5);
      setCustomPrompt(saved.customPrompt ?? '');
      setLastSavedTime(saved.updatedAt || 'Saved');
    } else {
      setToneFocus('balanced');
      setSingleCount(5);
      setCustomPrompt('');
      setLastSavedTime(null);
    }
  }, [currentApp, appProfiles]);

  // Save current preferences for current selected app
  const persistCurrentAppProfile = useCallback((updates: Partial<AppReviewProfile>) => {
    if (!currentApp) return;
    const appId = String(currentApp.id || currentApp.slug || '');
    
    setAppProfiles(prev => {
      const current = prev[appId] || {
        targetScore: 4.8,
        customDistribution: false,
        starMix: { star5: 70, star4: 20, star3: 7, star2: 3, star1: 0 },
        toneFocus: 'balanced',
        singleCount: 5
      };

      const updated: AppReviewProfile = {
        ...current,
        ...updates,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const nextProfiles = {
        ...prev,
        [appId]: updated,
        [String(currentApp.slug || '')]: updated
      };

      saveAllAppProfiles(nextProfiles);
      setLastSavedTime(updated.updatedAt || 'Just now');
      return nextProfiles;
    });
  }, [currentApp]);

  // Handlers with instant auto-save per app
  const handleToneChange = (tone: any) => {
    setToneFocus(tone);
    persistCurrentAppProfile({ toneFocus: tone });
  };

  const handleCountChange = (count: number) => {
    setSingleCount(count);
    persistCurrentAppProfile({ singleCount: count });
    try {
      localStorage.setItem(STORAGE_KEY_DEFAULT_COUNT, String(count));
    } catch {}
    toast(`Saved ${count} reviews count for ${currentApp?.name}!`, 'success');
  };

  const handleCustomPromptBlur = () => {
    persistCurrentAppProfile({ customPrompt: customPrompt.trim() });
    toast(`Saved custom instructions for ${currentApp?.name}`, 'success');
  };

  const handleResetToAppDefault = () => {
    if (!currentApp) return;
    setToneFocus('balanced');
    setSingleCount(5);
    persistCurrentAppProfile({
      toneFocus: 'balanced',
      singleCount: 5
    });
    toast(`Reset settings to catalog default for ${currentApp.name}`, 'info');
  };

  // Staged Preview Reviews (Single App)
  const [stagedReviews, setStagedReviews] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savingStaged, setSavingStaged] = useState(false);

  // AI Model & Quota Status Check State
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string; status: 'online' | 'quota_exhausted' | 'unconfigured' | 'error'; message: string; responseSnippet?: string } | null>(null);
  const [checkingAiStatus, setCheckingAiStatus] = useState(false);

  const checkAiStatus = useCallback(async () => {
    try {
      setCheckingAiStatus(true);
      const res = await adminFetch('/api/v1/admin/ai-status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch (e) {
      console.warn("Failed to check AI status", e);
    } finally {
      setCheckingAiStatus(false);
    }
  }, []);

  useEffect(() => {
    checkAiStatus();
  }, [checkAiStatus]);


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
          customPrompt: customPrompt.trim(),
          saveDirectly: instantSave
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate reviews');

      if (instantSave) {
        toast(`Generated and published ${data.count || singleCount} reviews for ${currentApp.name}!`, "success");
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
            appSlug: currentApp.slug,
            appName: currentApp.name,
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

  // Run 1-Click Bulk Generator with per-app custom profiles
  const handleRunBulk = async () => {
    let targetApps = appsList;
    if (bulkCategory !== 'all') {
      targetApps = appsList.filter(a => a.category && a.category.toLowerCase().includes(bulkCategory.toLowerCase()));
    }

    if (targetApps.length === 0) {
      toast("No apps match the selected category", "error");
      return;
    }

    const customCount = Object.keys(appProfiles).length;
    const confirmed = window.confirm(
      `Generate authentic AI reviews for ${targetApps.length} apps (${bulkCountPerApp} reviews each = ~${targetApps.length * bulkCountPerApp} total reviews)?\n\n✓ Each app will use its own saved rating/star distribution profile (${customCount} custom app profiles active).\n✓ Apps without custom profiles will use their individual catalog rating.\n✓ Reviews will be created in smart safe batches.`
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
        const chunkAppIds = chunk.map(a => a.id || a.slug);

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
            appProfilesMap: appProfiles // Passes all per-app custom profiles to backend!
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

      toast(`Bulk generation complete! ${totalCreated} reviews created across ${targetApps.length} apps with their individual rating profiles.`, "success");
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
              Synthesize 100% human-like reviews deeply grounded in every detail of your app descriptions (specific game modes, QoL features, UI aesthetics, 60fps performance). Per-app star distributions and target scores are permanently saved.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 backdrop-blur-sm self-stretch md:self-auto">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
            <strong>Zero Financial Words Policy Active:</strong> Automatically prevents mentions of money, deposit, cash, or withdrawal. Context focuses purely on gameplay mechanics, animations, touch response, and phone FPS.
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] shrink-0">
          <span>Staggered Dates (5–90 Days)</span>
          <span>•</span>
          <span>Per-App Profiles Synced</span>
        </div>
      </div>

      {/* AI Model & Quota Live Status Widget */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            aiStatus?.status === 'online' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
            aiStatus?.status === 'quota_exhausted' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
          }`}>
            <Sparkles size={24} className={checkingAiStatus ? 'animate-spin' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Gemini Model & Quota Status Monitor
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                aiStatus?.status === 'online' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                aiStatus?.status === 'quota_exhausted' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}>
                {checkingAiStatus ? 'Checking...' : aiStatus?.status === 'online' ? 'Online & Active' : aiStatus?.status === 'quota_exhausted' ? 'Quota Exhausted' : 'Unconfigured'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {aiStatus?.message || 'Checking live API connection status for gemini-3.7-flash...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-semibold text-slate-400">MODEL</div>
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">gemini-3.7-flash</div>
          </div>
          <button
            type="button"
            onClick={checkAiStatus}
            disabled={checkingAiStatus}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={checkingAiStatus ? 'animate-spin' : ''} />
            <span>Test Live Connection</span>
          </button>
        </div>
      </div>


      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
            
            {/* Header with Auto-Saved Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <Sliders size={16} className="text-blue-600" />
                <span>Rating & Star Mix</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                <BookmarkCheck size={12} />
                <span>Saved Permanently</span>
              </div>
            </div>

            {/* Target Score Controller (Locked to App Catalog) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Target Rating for {currentApp?.name ? `"${currentApp.name}"` : 'App'}
                </label>
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black rounded-md flex items-center gap-1 border border-amber-300/40">
                  ⭐ {targetScore.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-1.5 mb-1 text-slate-700 dark:text-slate-300 font-bold">
                  <ShieldCheck size={14} className="text-amber-500" />
                  Locked to App Catalog
                </p>
                The AI will mathematically balance all generated reviews to naturally achieve a <strong>{targetScore.toFixed(1)}</strong> rating. To change this rating, edit the app in the Catalog section.
              </div>
            </div>

            {/* Persona / Tone Focus */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Review Tone & Creative Angle
              </label>
              <select
                value={toneFocus}
                onChange={(e) => handleToneChange(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="balanced">Balanced Variety (Mix of Gamers, Tech & Casuals)</option>
                <option value="performance">Performance & FPS (Smoothness, Device Mention, No Lag)</option>
                <option value="gameplay">Gameplay & In-App Mechanics (Modes, Rules, Undo, Auto-Sort)</option>
                <option value="ui_graphics">UI & Graphics (Table Felt, 3D Chips, Sound Effects, Skins)</option>
                <option value="casual">Casual Commuter (Quick Breaks, Intuitive Controls)</option>
              </select>
            </div>

            {/* Custom AI Prompt (Optional) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} className="text-blue-500" /> Optional Custom Instructions
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onBlur={handleCustomPromptBlur}
                placeholder="E.g. 'Make sure all reviews mention the new Dragon vs Tiger mode and how it helped them win.'"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
              />
              <p className="text-[10px] text-slate-500 leading-tight">Add specific keywords or themes you want the AI to include in the generated reviews for this app.</p>
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
                    <span>Select Target App & Profile</span>
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
                      className="w-12 h-12 rounded-xl object-contain shadow-xs bg-white dark:bg-slate-800 shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-bold text-blue-600 shrink-0">
                      {currentApp?.name?.charAt(0) || 'A'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="w-full text-sm font-bold bg-transparent text-slate-900 dark:text-white border-0 cursor-pointer focus:outline-none"
                    >
                      {filteredApps.map(app => {
                        const hasCustom = !!appProfiles[app.id] || !!appProfiles[app.slug];
                        return (
                          <option key={app.id} value={app.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                            {app.name} ({app.category || 'General'}) {hasCustom ? '★ Custom Saved' : `(Store: ${app.rating || '4.8'}★)`}
                          </option>
                        );
                      })}
                    </select>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-2">
                      <span>Developer: {currentApp?.developer || 'Official Studio'}</span>
                      <span>•</span>
                      <span>Catalog Rating: ⭐ {currentApp?.rating || '4.8'}</span>
                      {lastSavedTime && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Profile Saved ✓
                          </span>
                        </>
                      )}
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
                      onChange={(e) => handleCountChange(parseInt(e.target.value, 10))}
                      className="text-xs font-bold bg-white dark:bg-slate-800 border-2 border-blue-500/40 dark:border-blue-500/40 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                      title="This preset is automatically saved per app. Every time you trigger generation, this exact count will be created."
                    >
                      <option value={1}>1 Review</option>
                      <option value={3}>3 Reviews</option>
                      <option value={5}>5 Reviews (Standard)</option>
                      <option value={8}>8 Reviews (Varied Mix)</option>
                      <option value={10}>10 Reviews (Full Thread)</option>
                      <option value={15}>15 Reviews</option>
                      <option value={20}>20 Reviews</option>
                    </select>
                  </div>
                </div>

                {/* Grounded Description Notice */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
                  <Info size={16} className="shrink-0 text-blue-600 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>Creative Context Grounding Active:</strong> The AI extracts real features, game modes, and rules from <em>{currentApp?.name}</em>'s admin description. Each review takes a unique angle (table mechanics, 60fps frame rate, undo tools, UI theme).
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
                        <span>Synthesizing Contextual Reviews...</span>
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
                    <span>Instant 1-Click Publish</span>
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
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-2.5 relative">
                        <div className="absolute -top-3 -left-3 bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded-full shadow-sm">
                          #{idx + 1}
                        </div>
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
                                  size={16}
                                  onClick={() => {
                                    const copy = [...stagedReviews];
                                    copy[idx].rating = sIdx + 1;
                                    setStagedReviews(copy);
                                  }}
                                  className={`cursor-pointer transition-colors ${sIdx < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-amber-300"}`}
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
                    Populate your entire app catalog with authentic human reviews. Each app honors its own saved rating profile and specific description features!
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
                    className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="all">All Categories ({appsList.length} Apps)</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fallback Reviews Per App
                  </label>
                  <select
                    value={bulkCountPerApp}
                    onChange={(e) => setBulkCountPerApp(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value={2}>2 Reviews per App (Fallback)</option>
                    <option value={3}>3 Reviews per App (Recommended Fallback)</option>
                    <option value={5}>5 Reviews per App (Fallback)</option>
                    <option value={10}>10 Reviews per App (Fallback)</option>
                  </select>
                  <div className="text-[10px] text-slate-500">Apps without custom profiles will use this count.</div>
                </div>
              </div>

              {/* Multi-Profile Math Notice Box */}
              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-blue-900 dark:text-blue-200">Dynamic Multi-App Profile Execution:</div>
                  <div className="text-blue-700 dark:text-blue-400 text-[11px]">
                    {Object.keys(appProfiles).length} custom saved app profiles active. Non-customized apps will automatically use their individual store ratings so every app has distinct organic score averages.
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-blue-600 dark:text-blue-300 text-sm shrink-0 flex flex-col items-end">
                  <span>{bulkCategory === 'all' ? appsList.length : appsList.filter(a => a.category?.includes(bulkCategory)).length} Target Apps</span>
                  <span className="text-[11px] text-blue-500 dark:text-blue-400 font-medium tracking-tight">
                    ~ {(bulkCategory === 'all' ? appsList : appsList.filter(a => a.category?.includes(bulkCategory))).reduce((sum, app) => sum + (appProfiles[app.id || app.slug]?.singleCount || bulkCountPerApp), 0)} Total Reviews
                  </span>
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
                    <span className="font-mono text-blue-600">
                      {bulkProgress ? `${bulkProgress.current} / ${bulkProgress.total}` : 'Processing...'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: bulkProgress ? `${(bulkProgress.current / bulkProgress.total) * 100}%` : '50%' }}
                    />
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
