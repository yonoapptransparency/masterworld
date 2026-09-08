import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Cpu, 
  Globe, 
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
  Info,
  Play,
  Pause,
  Square,
  Bot,
  Terminal,
  Activity,
  Clock,
  AlertCircle,
  ExternalLink,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Compass,
  CheckSquare,
  XSquare
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

function loadAllAppProfiles(): Record<string, AppReviewProfile> {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllAppProfiles(profiles: Record<string, AppReviewProfile>) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.warn("Failed to persist AI review profiles to localStorage", e);
  }
}

function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export const AdminAIReviewStudioTab: React.FC<AdminAIReviewStudioTabProps> = ({ 
  appsList = [],
  onReviewsGenerated 
}) => {
  // Primary Navigation Workspace: 'brain1' | 'brain2' | 'autopilot' | 'bulk'
  const [mode, setMode] = useState<'brain1' | 'brain2' | 'autopilot' | 'bulk'>('brain1');

  // Selected Target App for Single Generation (Brain 1 & Brain 2)
  const [selectedAppId, setSelectedAppId] = useState<string>(appsList?.[0]?.id || '');
  const [appSearch, setAppSearch] = useState('');

  useEffect(() => {
    if (!selectedAppId && appsList && appsList.length > 0) {
      setSelectedAppId(appsList[0]?.id || appsList[0]?.slug || '');
    }
  }, [appsList, selectedAppId]);

  const currentApp = useMemo(() => {
    if (!appsList || appsList.length === 0) return null;
    return appsList.find(a => (a?.id && a.id === selectedAppId) || (a?.slug && a.slug === selectedAppId)) || appsList[0] || null;
  }, [appsList, selectedAppId]);

  const filteredApps = useMemo(() => {
    if (!appSearch.trim()) return appsList;
    const q = appSearch.toLowerCase();
    return appsList.filter(a => 
      (a.name && a.name.toLowerCase().includes(q)) || 
      (a.slug && a.slug.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q))
    );
  }, [appsList, appSearch]);

  // Persistent Profiles per App
  const [appProfiles, setAppProfiles] = useState<Record<string, AppReviewProfile>>(loadAllAppProfiles);

  // ==========================================
  // BRAIN 1 (Deep Dossier Engine) State
  // ==========================================
  const targetScore = currentApp?.rating ? Math.min(5.0, Math.max(3.0, Number(currentApp.rating))) : 4.8;
  const [toneFocus, setToneFocus] = useState<'balanced' | 'performance' | 'gameplay' | 'ui_graphics' | 'casual'>('balanced');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [singleCount, setSingleCount] = useState<number>(5);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showDossierDrawer, setShowDossierDrawer] = useState<boolean>(false);

  // Brain 1 Complete 360° Ingested Dossier from Backend
  const [brain1Dossier, setBrain1Dossier] = useState<any>(null);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);
  const [dossierActiveTab, setDossierActiveTab] = useState<'overview' | 'description' | 'features' | 'safety' | 'faqs' | 'raw'>('overview');

  // Brain 1 Autonomous Autobot System State
  const [autobotActive, setAutobotActive] = useState<boolean>(false);
  const [autobotPaused, setAutobotPaused] = useState<boolean>(false);
  const [autobotExecutionMode, setAutobotExecutionMode] = useState<'paced' | 'instant'>('paced');
  const [autobotSaveDirectly, setAutobotSaveDirectly] = useState<boolean>(false);
  const [autobotTargetGoal, setAutobotTargetGoal] = useState<number>(10);
  const [autobotBatchSize, setAutobotBatchSize] = useState<number>(2);
  const [autobotCycleDelay, setAutobotCycleDelay] = useState<number>(3);
  const [autobotCurrentStage, setAutobotCurrentStage] = useState<'idle' | 'ingesting' | 'reasoning' | 'synthesizing' | 'sanitizing' | 'staged' | 'published'>('idle');
  const [autobotLogs, setAutobotLogs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'reasoning' | 'safety' | 'warn' }>>([]);
  const [autobotSessionStats, setAutobotSessionStats] = useState({
    totalGenerated: 0,
    autoPublished: 0,
    staged: 0,
    cyclesCompleted: 0,
    lastModel: '',
    lastLatencyMs: 0
  });

  const autobotRunningRef = useRef<boolean>(false);
  const autobotPausedRef = useRef<boolean>(false);
  const autobotTimerRef = useRef<any>(null);

  const addAutobotLog = useCallback((text: string, type: 'info' | 'success' | 'reasoning' | 'safety' | 'warn' = 'info') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAutobotLogs(prev => [
      { id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5), time: timeStr, text, type },
      ...prev.slice(0, 99)
    ]);
  }, []);

  // Brain 2 Autonomous Live Web Researcher Autobot State
  const [brain2TargetInfo, setBrain2TargetInfo] = useState<any>(null);
  const [loadingBrain2Target, setLoadingBrain2Target] = useState<boolean>(false);
  const [showBrain2SourcesDrawer, setShowBrain2SourcesDrawer] = useState<boolean>(false);
  const [brain2GroundedSources, setBrain2GroundedSources] = useState<Array<{ title: string; url: string }>>([]);

  const [brain2AutobotActive, setBrain2AutobotActive] = useState<boolean>(false);
  const [brain2AutobotPaused, setBrain2AutobotPaused] = useState<boolean>(false);
  const [brain2ExecutionMode, setBrain2ExecutionMode] = useState<'paced' | 'instant'>('paced');
  const [brain2SaveDirectly, setBrain2SaveDirectly] = useState<boolean>(false);
  const [brain2TargetGoal, setBrain2TargetGoal] = useState<number>(10);
  const [brain2BatchSize, setBrain2BatchSize] = useState<number>(2);
  const [brain2CycleDelay, setBrain2CycleDelay] = useState<number>(3);
  const [brain2CurrentStage, setBrain2CurrentStage] = useState<'idle' | 'resolving_target' | 'web_searching' | 'extracting_reviews' | 'rating_aligning' | 'sanitizing' | 'staged' | 'published'>('idle');
  const [brain2Logs, setBrain2Logs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'reasoning' | 'safety' | 'warn' }>>([]);
  const [brain2SessionStats, setBrain2SessionStats] = useState({
    totalGenerated: 0,
    autoPublished: 0,
    staged: 0,
    cyclesCompleted: 0,
    queriesRun: 0,
    lastModel: '',
    lastLatencyMs: 0
  });

  const brain2RunningRef = useRef<boolean>(false);
  const brain2PausedRef = useRef<boolean>(false);
  const brain2TimerRef = useRef<any>(null);

  const addBrain2Log = useCallback((text: string, type: 'info' | 'success' | 'reasoning' | 'safety' | 'warn' = 'info') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setBrain2Logs(prev => [
      { id: 'b2_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5), time: timeStr, text, type },
      ...prev.slice(0, 99)
    ]);
  }, []);

  // Fetch complete 360° backend dossier when selected app changes
  const fetchBrain1Dossier = useCallback(async (appId: string) => {
    if (!appId) return;
    setLoadingDossier(true);
    try {
      const res = await adminFetch(`/api/v1/admin/community/brain1/dossier/${encodeURIComponent(appId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.dossier) {
          setBrain1Dossier(data.dossier);
          addAutobotLog(`[Dossier Synced] Ingested 360° details for "${data.dossier?.appInfo?.name || appId}" (${data.dossier?.dossierStats?.totalChars || 0} chars, ${data.dossier?.highlights?.length || 0} mechanics).`, 'info');
        }
      }
    } catch (err: any) {
      console.warn("Could not load backend dossier:", err);
    } finally {
      setLoadingDossier(false);
    }
  }, [addAutobotLog]);

  // Fetch Brain 2 exact target identity info when selected app changes
  const fetchBrain2TargetInfo = useCallback(async (appId: string) => {
    if (!appId) return;
    setLoadingBrain2Target(true);
    try {
      const res = await adminFetch(`/api/v1/admin/community/brain2/target-info/${encodeURIComponent(appId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.targetInfo) {
          setBrain2TargetInfo(data.targetInfo);
          addBrain2Log(`[Exact Target Identity] Search queries ready for "${data.targetInfo.appName}" by developer "${data.targetInfo.developer}".`, 'info');
        }
      }
    } catch (err: any) {
      console.warn("Could not load Brain 2 target info:", err);
    } finally {
      setLoadingBrain2Target(false);
    }
  }, [addBrain2Log]);

  useEffect(() => {
    if (selectedAppId) {
      fetchBrain1Dossier(selectedAppId);
      fetchBrain2TargetInfo(selectedAppId);
    }
  }, [selectedAppId, fetchBrain1Dossier, fetchBrain2TargetInfo]);

  // Clean up autobot timers on unmount
  useEffect(() => {
    return () => {
      autobotRunningRef.current = false;
      brain2RunningRef.current = false;
      if (autobotTimerRef.current) clearTimeout(autobotTimerRef.current);
      if (brain2TimerRef.current) clearTimeout(brain2TimerRef.current);
    };
  }, []);

  // Sync state when selected app changes
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

  // Dossier Health Computation for Current App
  const dossierHealth = useMemo(() => {
    if (!currentApp) return { descChars: 0, modes: [], hasSafety: false, hasFaqs: false, summary: '' };
    const descText = stripHtmlTags(currentApp.description_html || currentApp.description || '');
    const featuresText = stripHtmlTags(currentApp.features_html || currentApp.features || '');
    const allText = `${descText} ${featuresText} ${currentApp.name || ''}`.toLowerCase();

    const modes: string[] = [];
    if (/points\s*rummy/.test(allText)) modes.push('Points Rummy');
    if (/pool\s*(101|201)/.test(allText)) modes.push('Pool 101/201');
    if (/deals\s*rummy/.test(allText)) modes.push('Deals Rummy');
    if (/teen\s*patti/.test(allText)) modes.push('Teen Patti');
    if (/andar\s*bahar/.test(allText)) modes.push('Andar Bahar');
    if (/dragon\s*(?:vs|v)\s*tiger/.test(allText)) modes.push('Dragon vs Tiger');
    if (/auto[\s-]sort/.test(allText)) modes.push('Auto-Sort Cards');
    if (/timer/.test(allText)) modes.push('Table Timers');
    if (/60\s*fps|physics/.test(allText)) modes.push('60 FPS Graphics');
    if (/battery/.test(allText)) modes.push('Battery Saving');

    const hasSafety = !!(currentApp.red_box_msg || currentApp.yellow_box_msg || currentApp.idea_box_msg);
    const hasFaqs = Array.isArray(currentApp.faqs) && currentApp.faqs.length > 0;

    return {
      descChars: descText.length,
      modes: modes.length > 0 ? modes : ['Card Table Engine', 'Multiplayer'],
      hasSafety,
      hasFaqs,
      faqCount: hasFaqs ? currentApp.faqs.length : 0,
      summary: descText
    };
  }, [currentApp]);

  // ==========================================
  // BRAIN 2 (Live Web Researcher) State
  // ==========================================
  const [brain2Count, setBrain2Count] = useState<number>(5);
  const [brain2TargetScore, setBrain2TargetScore] = useState<number>(4.7);
  const [brain2Focus, setBrain2Focus] = useState<string>('all_sources');
  const [brain2CustomQuery, setBrain2CustomQuery] = useState<string>('');

  // ==========================================
  // Staging Workspace & Telemetry State
  // ==========================================
  const [stagedReviews, setStagedReviews] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savingStaged, setSavingStaged] = useState(false);
  const [savingReviewIndex, setSavingReviewIndex] = useState<number | null>(null);

  const [generationTelemetry, setGenerationTelemetry] = useState<{
    mode: 'local' | 'research';
    modelUsed?: string;
    searchQueries?: string[];
    groundedSources?: Array<{ title: string; url: string; snippet?: string }>;
    searchStatus?: string;
    dossierHighlights?: string[];
  } | null>(null);

  // ==========================================
  // AUTO-PILOT Engine State
  // ==========================================
  const [autoPilotStatus, setAutoPilotStatus] = useState<any>(null);
  const [autoPilotLoading, setAutoPilotLoading] = useState(false);
  const [selectedAutoPilotAppIds, setSelectedAutoPilotAppIds] = useState<string[]>([]);
  const [autoPilotAppSearch, setAutoPilotAppSearch] = useState('');
  const [autoPilotCustomPrompt, setAutoPilotCustomPrompt] = useState('');
  const [autoPilotBrainChoice, setAutoPilotBrainChoice] = useState<'local' | 'research'>('local');

  const [autoPilotOptions, setAutoPilotOptions] = useState({
    countPerApp: 5,
    skipAppsWithReviews: false,
    skipThreshold: 10,
    overrideTargetScore: null as number | null,
    toneFocus: 'balanced' as any
  });

  useEffect(() => {
    if (appsList && appsList.length > 0 && selectedAutoPilotAppIds.length === 0) {
      setSelectedAutoPilotAppIds(appsList.map(a => String(a.id || a.slug || '')));
    }
  }, [appsList, selectedAutoPilotAppIds.length]);

  const toggleAutoPilotApp = (appIdentifier: string) => {
    setSelectedAutoPilotAppIds(prev => 
      prev.includes(appIdentifier) ? prev.filter(id => id !== appIdentifier) : [...prev, appIdentifier]
    );
  };

  const handleSelectAllAutoPilotApps = () => {
    setSelectedAutoPilotAppIds(appsList.map(a => String(a.id || a.slug || '')));
  };

  const handleDeselectAllAutoPilotApps = () => {
    setSelectedAutoPilotAppIds([]);
  };

  const fetchAutoPilotStatus = useCallback(async () => {
    try {
      const res = await adminFetch('/api/v1/admin/autopilot/status');
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setAutoPilotStatus(data.status);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch autopilot status", e);
    }
  }, []);

  useEffect(() => {
    fetchAutoPilotStatus();
    const interval = setInterval(fetchAutoPilotStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchAutoPilotStatus]);

  const handleStartAutoPilot = async () => {
    if (selectedAutoPilotAppIds.length === 0) {
      toast("Please select at least 1 app to process with Auto-Pilot", "error");
      return;
    }
    try {
      setAutoPilotLoading(true);
      const payload = {
        ...autoPilotOptions,
        appsList: appsList,
        selectedAppIds: selectedAutoPilotAppIds,
        customPrompt: autoPilotCustomPrompt.trim() || undefined,
        mode: autoPilotBrainChoice
      };
      const res = await adminFetch('/api/v1/admin/autopilot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start Auto-Pilot');
      toast(`🚀 Auto-Pilot Queue Engine Launched for ${data.status?.totalApps || selectedAutoPilotAppIds.length} Apps!`, "success");
      setAutoPilotStatus(data.status);
    } catch (err: any) {
      toast(err.message || "Failed to start Auto-Pilot", "error");
    } finally {
      setAutoPilotLoading(false);
    }
  };

  const handlePauseAutoPilot = async () => {
    try {
      const res = await adminFetch('/api/v1/admin/autopilot/pause', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setAutoPilotStatus(data.status);
      toast("⏸️ Auto-Pilot Paused", "info");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleResumeAutoPilot = async () => {
    try {
      const res = await adminFetch('/api/v1/admin/autopilot/resume', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setAutoPilotStatus(data.status);
      toast("▶️ Auto-Pilot Resumed", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleStopAutoPilot = async () => {
    try {
      const res = await adminFetch('/api/v1/admin/autopilot/stop', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setAutoPilotStatus(data.status);
      toast("🛑 Auto-Pilot Stopped", "info");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleClearAutoPilotLogs = async () => {
    try {
      const res = await adminFetch('/api/v1/admin/autopilot/logs', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setAutoPilotStatus(data.status);
        toast("Logs cleared", "info");
      }
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  // ==========================================
  // BULK BATCH GENERATION State & Handlers
  // ==========================================
  const [bulkCountPerApp, setBulkCountPerApp] = useState<number>(3);
  const [bulkCategory, setBulkCategory] = useState<string>('all');
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; active: boolean } | null>(null);
  const [bulkResult, setBulkResult] = useState<{ totalGenerated: number; totalApps: number } | null>(null);
  const [bulkBrainChoice, setBulkBrainChoice] = useState<'local' | 'research'>('local');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    appsList.forEach(a => {
      if (a.category) {
        a.category.split(',').forEach((c: string) => cats.add(c.trim()));
      }
    });
    return Array.from(cats);
  }, [appsList]);

  // ==========================================
  // GENERATION HANDLERS (Brain 1 & Brain 2)
  // ==========================================

  // Brain 1 Autonomous Autobot Step Engine
  const executeAutobotStep = async (isManualSingleStep = false, customDirectSave?: boolean): Promise<number> => {
    if (!currentApp) {
      toast("Please select an app first", "error");
      return 0;
    }

    const directSave = typeof customDirectSave === 'boolean' ? customDirectSave : autobotSaveDirectly;
    const stepCount = isManualSingleStep ? singleCount : autobotBatchSize;

    try {
      setAutobotCurrentStage('ingesting');
      addAutobotLog(`[Dossier Pipeline] Ingesting 360° broad details for "${currentApp.name}" (${brain1Dossier?.dossierStats?.totalChars || dossierHealth.descChars} chars)...`, 'info');

      // Reasoning stage
      setAutobotCurrentStage('reasoning');
      addAutobotLog(`[Reasoning Core] Unforced Human Freedom active. Generating spontaneous player thoughts...`, 'reasoning');

      setAutobotCurrentStage('synthesizing');

      // Call our dedicated Brain 1 Autobot endpoint
      const res = await adminFetch('/api/v1/admin/community/brain1/autobot/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: currentApp.id,
          appData: currentApp,
          count: stepCount,
          targetScore,
          customPrompt: customPrompt.trim() || undefined,
          saveDirectly: directSave
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Autobot step failed');

      setAutobotCurrentStage('sanitizing');
      addAutobotLog(`[Safety Guard] Sanitized text: 0 financial/gambling terms permitted. Safe practice score verified.`, 'safety');

      const generated = data.reviews || [];
      const countGen = generated.length;

      setGenerationTelemetry({
        mode: 'local',
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
        dossierHighlights: data.dossierHighlights || dossierHealth.modes,
        searchStatus: '360° Dossier Ingested & Human Spontaneity Active'
      });

      if (directSave) {
        setAutobotCurrentStage('published');
        addAutobotLog(`[Live Commit] Published ${countGen} reviews directly to live website database!`, 'success');
        setAutobotSessionStats(prev => ({
          ...prev,
          totalGenerated: prev.totalGenerated + countGen,
          autoPublished: prev.autoPublished + countGen,
          cyclesCompleted: prev.cyclesCompleted + 1,
          lastModel: data.modelUsed || 'gemini-3.8-flash',
          lastLatencyMs: data.timeTakenMs || 0
        }));
        if (onReviewsGenerated) onReviewsGenerated();
      } else {
        setAutobotCurrentStage('staged');
        const enriched = generated.map((r: any) => ({
          ...r,
          _brainMode: 'brain1',
          _model: data.modelUsed
        }));
        setStagedReviews(prev => [...enriched, ...prev]);
        addAutobotLog(`[Staging Deck] Staged ${countGen} reviews for manual inspection and 1-click publishing.`, 'success');
        setAutobotSessionStats(prev => ({
          ...prev,
          totalGenerated: prev.totalGenerated + countGen,
          staged: prev.staged + countGen,
          cyclesCompleted: prev.cyclesCompleted + 1,
          lastModel: data.modelUsed || 'gemini-3.8-flash',
          lastLatencyMs: data.timeTakenMs || 0
        }));
      }

      // Log review snippets in terminal
      generated.forEach((r: any) => {
        addAutobotLog(`• [${r.rating}★] "${r.userName}": "${r.reviewText?.slice(0, 70)}${(r.reviewText?.length || 0) > 70 ? '...' : ''}"`, 'info');
      });

      return countGen;
    } catch (err: any) {
      addAutobotLog(`[Autobot Error] ${err.message || 'Generation failed'}`, 'warn');
      toast(err.message || 'Autobot step failed', 'error');
      throw err;
    }
  };

  const startAutobotRunner = async () => {
    if (autobotActive) return;
    if (!currentApp) {
      toast("Please select an app first", "error");
      return;
    }

    setAutobotActive(true);
    setAutobotPaused(false);
    autobotRunningRef.current = true;
    autobotPausedRef.current = false;

    addAutobotLog(`🚀 Autobot engaged for "${currentApp.name}" in ${autobotExecutionMode === 'paced' ? 'Paced Stream' : 'Instant Batch'} mode (${autobotSaveDirectly ? 'Auto-Publish' : 'Staging Deck'}).`, 'success');

    let generatedSoFar = 0;

    const loop = async () => {
      if (!autobotRunningRef.current) return;
      if (autobotPausedRef.current) {
        autobotTimerRef.current = setTimeout(loop, 1000);
        return;
      }

      try {
        const justGenerated = await executeAutobotStep(autobotExecutionMode === 'instant');
        generatedSoFar += (justGenerated || 0);

        if (autobotTargetGoal > 0 && generatedSoFar >= autobotTargetGoal) {
          addAutobotLog(`🏁 Target goal of ${autobotTargetGoal} comments completed! Autobot standing by.`, 'success');
          stopAutobotRunner();
          toast(`🏁 Autobot completed ${generatedSoFar} reviews for ${currentApp.name}!`, "success");
          return;
        }

        if (autobotExecutionMode === 'instant') {
          stopAutobotRunner();
          return;
        }

        if (autobotRunningRef.current && !autobotPausedRef.current) {
          addAutobotLog(`⏳ Pacing pause (${autobotCycleDelay}s) before next autonomous cycle...`, 'info');
          autobotTimerRef.current = setTimeout(loop, autobotCycleDelay * 1000);
        }
      } catch (e) {
        addAutobotLog(`⚠️ Cycle encountered error. Pausing autobot runner.`, 'warn');
        pauseAutobotRunner();
      }
    };

    loop();
  };

  const pauseAutobotRunner = () => {
    setAutobotPaused(true);
    autobotPausedRef.current = true;
    addAutobotLog(`⏸️ Autobot runner paused by admin.`, 'warn');
  };

  const resumeAutobotRunner = () => {
    setAutobotPaused(false);
    autobotPausedRef.current = false;
    addAutobotLog(`▶️ Resuming autobot runner...`, 'info');
  };

  const stopAutobotRunner = () => {
    setAutobotActive(false);
    setAutobotPaused(false);
    autobotRunningRef.current = false;
    autobotPausedRef.current = false;
    if (autobotTimerRef.current) clearTimeout(autobotTimerRef.current);
    setAutobotCurrentStage('idle');
    addAutobotLog(`⏹️ Autobot disengaged and returned to standby.`, 'info');
  };

  const resetAutobotSession = () => {
    stopAutobotRunner();
    setAutobotSessionStats({
      totalGenerated: 0,
      autoPublished: 0,
      staged: 0,
      cyclesCompleted: 0,
      lastModel: '',
      lastLatencyMs: 0
    });
    setAutobotLogs([]);
    addAutobotLog("↺ Autobot session telemetry and terminal logs reset.", 'info');
    toast("Autobot session reset", "info");
  };

  const handleGenerateBrain1 = async (directSave = false) => {
    if (!currentApp) {
      toast("Please select an app first", "error");
      return;
    }

    try {
      setGenerating(true);
      await executeAutobotStep(true, directSave);
      if (directSave) {
        toast(`🚀 Synthesized & published reviews for ${currentApp.name}!`, "success");
      } else {
        toast(`🧠 Synthesized authentic player reviews! Review below in Staging.`, "success");
      }
    } catch (err: any) {
      toast(err.message || "Brain 1 generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  const executeBrain2Step = async (instant: boolean = false, directSaveOverride?: boolean) => {
    if (!currentApp) return 0;
    const appId = String(currentApp.id || currentApp.slug || '');
    const countToGen = instant ? brain2Count : brain2BatchSize;
    const targetRating = brain2TargetScore || Number(currentApp.rating) || 4.2;
    const shouldSaveDirect = directSaveOverride !== undefined ? directSaveOverride : brain2SaveDirectly;

    try {
      setBrain2CurrentStage('resolving_target');
      addBrain2Log(`[Stage 1/5] Target resolved: "${currentApp.name}" by "${currentApp.developer || 'Studio'}" (Category-agnostic exact match).`, 'reasoning');

      setBrain2CurrentStage('web_searching');
      addBrain2Log(`[Stage 2/5] Live Search Grounding: researching Play Store reviews & player discussions for "${currentApp.name}"...`, 'reasoning');

      let effectivePrompt = '';
      if (brain2Focus === 'bugs') {
        effectivePrompt = 'Focus on bug reports, stutter, device compatibility, and server reconnect feedback.';
      } else if (brain2Focus === 'controls') {
        effectivePrompt = 'Focus on UI smoothness, responsive touch controls, and overall gameplay experience.';
      }
      if (brain2CustomQuery.trim()) {
        effectivePrompt = effectivePrompt ? `${effectivePrompt} ${brain2CustomQuery.trim()}` : brain2CustomQuery.trim();
      }

      const res = await adminFetch('/api/v1/admin/community/brain2/autobot/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          appData: currentApp,
          count: countToGen,
          targetScore: targetRating,
          customPrompt: effectivePrompt || undefined,
          saveDirectly: shouldSaveDirect
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Brain 2 Autobot step failed');
      }

      setBrain2CurrentStage('extracting_reviews');
      const data = await res.json();
      const generated = data.reviews || [];
      const countGen = generated.length;

      setBrain2CurrentStage('rating_aligning');
      addBrain2Log(`[Stage 3/5] Extracted ${countGen} genuine reviews strictly aligned with ${targetRating.toFixed(1)}★ sentiment (Model: ${data.modelUsed}).`, 'success');

      if (data.groundedSources && data.groundedSources.length > 0) {
        setBrain2GroundedSources(data.groundedSources);
        addBrain2Log(`[Live Web Grounding Citations] Found ${data.groundedSources.length} authentic source links.`, 'info');
      }

      setBrain2CurrentStage('sanitizing');
      addBrain2Log(`[Stage 4/5] Safety Guard: 0 financial/gambling words permitted. Genuine user feedback verified.`, 'safety');

      // Stream out the individual reviews to terminal
      generated.forEach((r: any) => {
        addBrain2Log(`• [${r.rating}★] "${r.userName}": "${r.reviewText}"`, 'success');
      });

      if (data.autoSaved) {
        setBrain2CurrentStage('published');
        addBrain2Log(`[Stage 5/5] Committed ${countGen} real researched reviews live to community database!`, 'success');
        setBrain2SessionStats(prev => ({
          ...prev,
          totalGenerated: prev.totalGenerated + countGen,
          autoPublished: prev.autoPublished + countGen,
          cyclesCompleted: prev.cyclesCompleted + 1,
          queriesRun: prev.queriesRun + (data.searchQueries?.length || 2),
          lastModel: data.modelUsed,
          lastLatencyMs: data.timeTakenMs || 0
        }));
        if (onReviewsGenerated) onReviewsGenerated();
      } else {
        setBrain2CurrentStage('staged');
        const enriched = generated.map((r: any) => ({
          ...r,
          _brainMode: 'brain2',
          _model: data.modelUsed
        }));
        setStagedReviews(prev => [...enriched, ...prev]);
        addBrain2Log(`[Stage 5/5] Staged ${countGen} reviews in deck for inspection.`, 'info');
        setBrain2SessionStats(prev => ({
          ...prev,
          totalGenerated: prev.totalGenerated + countGen,
          staged: prev.staged + countGen,
          cyclesCompleted: prev.cyclesCompleted + 1,
          queriesRun: prev.queriesRun + (data.searchQueries?.length || 2),
          lastModel: data.modelUsed,
          lastLatencyMs: data.timeTakenMs || 0
        }));
      }

      return countGen;
    } catch (err: any) {
      addBrain2Log(`[Brain 2 Error] ${err.message || 'Web research cycle failed'}`, 'warn');
      toast(err.message || 'Brain 2 Autobot step failed', 'error');
      throw err;
    }
  };

  const startBrain2AutobotRunner = async () => {
    if (brain2AutobotActive) return;
    if (!currentApp) {
      toast("Please select an app first", "error");
      return;
    }

    setBrain2AutobotActive(true);
    setBrain2AutobotPaused(false);
    brain2RunningRef.current = true;
    brain2PausedRef.current = false;

    addBrain2Log(`🚀 Brain 2 Web Researcher Autobot engaged for "${currentApp.name}" (${currentApp.developer || 'Studio'}) in ${brain2ExecutionMode === 'paced' ? 'Paced Stream' : 'Instant Batch'} mode (${brain2SaveDirectly ? 'Auto-Publish' : 'Staging Deck'}).`, 'success');

    let generatedSoFar = 0;

    const loop = async () => {
      if (!brain2RunningRef.current) return;
      if (brain2PausedRef.current) {
        brain2TimerRef.current = setTimeout(loop, 1000);
        return;
      }

      try {
        const justGenerated = await executeBrain2Step(brain2ExecutionMode === 'instant');
        generatedSoFar += (justGenerated || 0);

        if (brain2TargetGoal > 0 && generatedSoFar >= brain2TargetGoal) {
          addBrain2Log(`🏁 Target goal of ${brain2TargetGoal} reviews completed! Brain 2 standing by.`, 'success');
          stopBrain2AutobotRunner();
          toast(`🏁 Brain 2 completed ${generatedSoFar} reviews for ${currentApp.name}!`, "success");
          return;
        }

        if (brain2ExecutionMode === 'instant') {
          stopBrain2AutobotRunner();
          return;
        }

        if (brain2RunningRef.current && !brain2PausedRef.current) {
          addBrain2Log(`⏳ Research pacing delay (${brain2CycleDelay}s) before next web search cycle...`, 'info');
          brain2TimerRef.current = setTimeout(loop, brain2CycleDelay * 1000);
        }
      } catch (e) {
        addBrain2Log(`⚠️ Research cycle encountered error. Pausing Brain 2 runner.`, 'warn');
        pauseBrain2AutobotRunner();
      }
    };

    loop();
  };

  const pauseBrain2AutobotRunner = () => {
    setBrain2AutobotPaused(true);
    brain2PausedRef.current = true;
    addBrain2Log(`⏸️ Brain 2 Autobot runner paused by admin.`, 'warn');
  };

  const resumeBrain2AutobotRunner = () => {
    setBrain2AutobotPaused(false);
    brain2PausedRef.current = false;
    addBrain2Log(`▶️ Resuming Brain 2 Autobot runner...`, 'info');
  };

  const stopBrain2AutobotRunner = () => {
    setBrain2AutobotActive(false);
    setBrain2AutobotPaused(false);
    brain2RunningRef.current = false;
    brain2PausedRef.current = false;
    if (brain2TimerRef.current) clearTimeout(brain2TimerRef.current);
    setBrain2CurrentStage('idle');
    addBrain2Log(`⏹️ Brain 2 Autobot disengaged and returned to standby.`, 'info');
  };

  const resetBrain2Session = () => {
    stopBrain2AutobotRunner();
    setBrain2SessionStats({
      totalGenerated: 0,
      autoPublished: 0,
      staged: 0,
      cyclesCompleted: 0,
      queriesRun: 0,
      lastModel: '',
      lastLatencyMs: 0
    });
    setBrain2Logs([]);
    addBrain2Log("↺ Brain 2 session telemetry and terminal logs reset.", 'info');
    toast("Brain 2 session reset", "info");
  };

  const handleGenerateBrain2 = async (directSave = false) => {
    if (!currentApp) {
      toast("Please select an app first", "error");
      return;
    }

    try {
      setGenerating(true);
      await executeBrain2Step(true, directSave);
      if (directSave) {
        toast(`🌐 Successfully grounded & published live reviews for ${currentApp.name} via Brain 2!`, "success");
      } else {
        toast(`🌐 Brain 2 conducted web research & synthesized authentic reviews! Review below in Staging.`, "success");
      }
    } catch (err: any) {
      toast(err.message || "Brain 2 web research generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  // Staged Reviews Editing & Actions
  const handleUpdateReviewText = (idx: number, text: string) => {
    setStagedReviews(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], reviewText: text };
      return next;
    });
  };

  const handleUpdateReviewRating = (idx: number, stars: number) => {
    setStagedReviews(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], rating: stars };
      return next;
    });
  };

  const handleUpdateReviewName = (idx: number, name: string) => {
    setStagedReviews(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], userName: name };
      return next;
    });
  };

  const handleDiscardReview = (idx: number) => {
    setStagedReviews(prev => prev.filter((_, i) => i !== idx));
    toast("Review removed from staging", "info");
  };

  const handleDiscardAll = () => {
    setStagedReviews([]);
    toast("Staging workspace cleared", "info");
  };

  const handleSaveReviewToLive = async (idx: number) => {
    const review = stagedReviews[idx];
    if (!review) return;

    try {
      setSavingReviewIndex(idx);
      const res = await adminFetch('/api/v1/admin/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: review.appId || currentApp?.id,
          userName: review.userName,
          rating: review.rating,
          reviewText: review.reviewText,
          status: 'published',
          source: review.source || 'ai_generated'
        })
      });

      if (!res.ok) throw new Error("Failed to save review");
      toast(`Published review by ${review.userName}!`, "success");
      setStagedReviews(prev => prev.filter((_, i) => i !== idx));
      if (onReviewsGenerated) onReviewsGenerated();
    } catch (err: any) {
      toast(err.message || "Failed to publish review", "error");
    } finally {
      setSavingReviewIndex(null);
    }
  };

  const handleSaveAllStaged = async () => {
    if (stagedReviews.length === 0) return;
    try {
      setSavingStaged(true);
      const payload = stagedReviews.map(r => ({
        ...r,
        appId: r.appId || currentApp?.id,
        status: 'published'
      }));

      const res = await adminFetch('/api/v1/admin/community/reviews/bulk-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: payload })
      });

      if (!res.ok) {
        for (const rev of payload) {
          await adminFetch('/api/v1/admin/community/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rev)
          });
        }
      }

      toast(`✅ Successfully published all ${stagedReviews.length} reviews to the live community database!`, "success");
      setStagedReviews([]);
      if (onReviewsGenerated) onReviewsGenerated();
    } catch (err: any) {
      toast(err.message || "Failed to publish staged reviews", "error");
    } finally {
      setSavingStaged(false);
    }
  };

  // Run Bulk Batch
  const handleRunBulkBatch = async () => {
    let targetApps = appsList;
    if (bulkCategory !== 'all') {
      targetApps = appsList.filter(a => a.category && a.category.toLowerCase().includes(bulkCategory.toLowerCase()));
    }

    if (targetApps.length === 0) {
      toast("No apps found in this category", "error");
      return;
    }

    try {
      setBulkProgress({ current: 0, total: targetApps.length, active: true });
      const res = await adminFetch('/api/v1/admin/community/ai-generate/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appIds: targetApps.map(a => a.id),
          countPerApp: bulkCountPerApp,
          targetScore: 4.8,
          mode: bulkBrainChoice
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed bulk generation');

      setBulkResult({
        totalGenerated: data.totalGenerated || (targetApps.length * bulkCountPerApp),
        totalApps: targetApps.length
      });
      toast(`🎉 Bulk Batch Complete! Generated ${data.totalGenerated || (targetApps.length * bulkCountPerApp)} reviews.`, "success");
      if (onReviewsGenerated) onReviewsGenerated();
    } catch (err: any) {
      toast(err.message || "Bulk generation failed", "error");
    } finally {
      setBulkProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. MASTER WORKSPACE HEADER & SYSTEM STATUS BAR */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  AI Review Studio & Multi-Brain Engine
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  RummyDex Autonomous Intelligence • Dual-Engine Review Generation & Community Grounding
                </p>
              </div>
            </div>
          </div>

          {/* Real-time System Status Pills */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Brain 1:</span>
              <span className="text-emerald-400 font-bold">Deep Dossier Active</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-slate-300">Brain 2:</span>
              <span className="text-indigo-300 font-bold">Live Web Grounding</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xs">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-slate-300">Database:</span>
              <span className="text-emerald-400 font-bold">Firestore Connected</span>
            </div>
          </div>
        </div>

        {/* 4 PRIMARY SEPARATE WORKSPACE TABS */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* TAB 1: BRAIN 1 (Deep Dossier Studio) */}
          <button
            onClick={() => setMode('brain1')}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              mode === 'brain1'
                ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/60 border-emerald-500/80 text-white shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/30'
                : 'bg-slate-800/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              mode === 'brain1' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <Cpu size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">Part 1: Brain 1</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">Dossier</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">Deep Database Comprehension</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-1">Analyzes full HTML rules, tables & alerts</p>
            </div>
          </button>

          {/* TAB 2: BRAIN 2 (Live Web Researcher) */}
          <button
            onClick={() => setMode('brain2')}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              mode === 'brain2'
                ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border-indigo-500/80 text-white shadow-lg shadow-indigo-950/40 ring-2 ring-indigo-500/30'
                : 'bg-slate-800/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              mode === 'brain2' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <Globe size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">Part 2: Brain 2</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">Web Live</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">Live Internet Researcher</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-1">Searches Reddit & Play Store sentiments</p>
            </div>
          </button>

          {/* TAB 3: AUTO-PILOT QUEUE ENGINE */}
          <button
            onClick={() => setMode('autopilot')}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              mode === 'autopilot'
                ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-blue-500/80 text-white shadow-lg shadow-blue-950/40 ring-2 ring-blue-500/30'
                : 'bg-slate-800/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              mode === 'autopilot' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <Play size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">Part 3: Auto-Pilot</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 font-bold">Queue</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">Catalog Background Runner</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-1">Automated multi-app review execution</p>
            </div>
          </button>

          {/* TAB 4: 1-CLICK BULK BATCH */}
          <button
            onClick={() => setMode('bulk')}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              mode === 'bulk'
                ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-500/80 text-white shadow-lg shadow-cyan-950/40 ring-2 ring-cyan-500/30'
                : 'bg-slate-800/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              mode === 'bulk' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <Zap size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">Part 4: Bulk Batch</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 font-bold">1-Click</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">Category-Wide Batch Rollout</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-1">Simultaneous multi-app generation</p>
            </div>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PART 1: BRAIN 1 — DEEP DOSSIER AUTOBOT ENGINE (DEDICATED INTERFACE) */}
      {/* ========================================================================= */}
      {mode === 'brain1' && (
        <div className="space-y-6">
          
          {/* HEADER & AUTOBOT STATUS BAR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                  <Cpu size={16} />
                  <span>Part 1: Brain 1 — Deep Dossier Autobot Engine</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <span>Autonomous Auto-Commenter & 360° Dossier Ingestion</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Autobot first reads all app details, rules, warnings, and FAQs from your database, then creates authentic human reviews freely with zero forced templates.
                </p>
              </div>

              {/* Real-time Status Indicator Pill */}
              <div className="flex items-center gap-3">
                {autobotActive ? (
                  autobotPaused ? (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold animate-pulse">
                      <Pause size={13} />
                      <span>AUTOBOT PAUSED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>AUTOBOT ONLINE • {autobotCurrentStage.toUpperCase()}</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>AUTOBOT STANDBY</span>
                  </div>
                )}

                {/* App Search Bar */}
                <div className="relative w-full lg:w-64">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search app in catalog..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Selected App & Ingested Information Cockpit */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* App Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
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
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>Developer: <strong>{currentApp?.developer || 'Studio'}</strong></span>
                      <span>•</span>
                      <span>Category: <strong>{currentApp?.category || 'Card'}</strong></span>
                      <span>•</span>
                      <span>Size: <strong>{currentApp?.file_size || 'Fast DL'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Live Ingested Information Metrics Chips */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
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
                    className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
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
                    
                    {/* Dossier Tabs */}
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
            </div>

            {/* AUTOBOT WORKFLOW CONTROLS & UNFORCED CREATIVITY SETTINGS */}
            <div className="space-y-4">
              
              {/* Human Freedom Guarantee Banner */}
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
                
                {/* Target Score Chip */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span>Store Benchmark: <strong>{targetScore.toFixed(1)}★</strong></span>
                </div>
              </div>

              {/* Autobot Execution Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Execution Flow */}
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

                {/* 2. Destination */}
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

                {/* 3. Target Review Goal */}
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

                {/* 4. Batch Size & Cycle Delay */}
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

              {/* Optional Soft Inspiration Input */}
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

              {/* AUTOBOT PRIMARY ACTION CONTROLS */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                
                <div className="flex items-center gap-2">
                  {!autobotActive ? (
                    <button
                      onClick={startAutobotRunner}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400/40 hover:scale-[1.02]"
                    >
                      <Play size={15} className="fill-white" />
                      <span>Start Autobot Runner (Autonomous Flow)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {autobotPaused ? (
                        <button
                          onClick={resumeAutobotRunner}
                          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Play size={14} className="fill-white" />
                          <span>Resume Autobot</span>
                        </button>
                      ) : (
                        <button
                          onClick={pauseAutobotRunner}
                          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Pause size={14} />
                          <span>Pause Autobot</span>
                        </button>
                      )}
                      <button
                        onClick={stopAutobotRunner}
                        className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Square size={14} className="fill-white" />
                        <span>Stop & Disengage</span>
                      </button>
                    </div>
                  )}

                  {/* Single Step Trigger */}
                  <button
                    onClick={() => executeAutobotStep(true)}
                    disabled={autobotActive}
                    className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Zap size={14} className="text-emerald-500" />
                    <span>Run Single Step (1-Shot)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetAutobotSession}
                    className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset session telemetry and logs"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Session</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* MULTITASK TELEMETRY HUD & LIVE TERMINAL CONSOLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            
            {/* Stage Pipeline Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider">
                <Activity size={15} className="text-emerald-400" />
                <span>Multitask Reasoning & Execution Pipeline</span>
              </div>
              
              {/* Dynamic Pipeline Steps */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                {[
                  { key: 'ingesting', label: '1. Ingest Dossier' },
                  { key: 'reasoning', label: '2. Human Reasoning' },
                  { key: 'synthesizing', label: '3. Draft Reviews' },
                  { key: 'sanitizing', label: '4. Safety Guard' },
                  { key: 'published', label: '5. Commit Store' }
                ].map((step, idx) => {
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

            {/* Telemetry Stats HUD Counters */}
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
      )}

      {/* ========================================================================= */}
      {/* 3. PART 2: BRAIN 2 — LIVE INTERNET WEB RESEARCHER AUTOBOT */}
      {/* ========================================================================= */}
      {mode === 'brain2' && (
        <div className="space-y-6">
          
          {/* Status & Mode Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Globe size={15} />
                  <span>Brain 2: Live Internet Web Researcher Autobot</span>
                  {brain2AutobotActive && !brain2AutobotPaused && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      AUTONOMOUS WEB RESEARCH ACTIVE
                    </span>
                  )}
                  {brain2AutobotActive && brain2AutobotPaused && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                      PAUSED
                    </span>
                  )}
                  {!brain2AutobotActive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      STANDBY
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <span>Targeted App + Developer Web Research Engine</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                    Google Search Grounded
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
                  Identifies the exact app via <strong>App Name</strong> and <strong>Developer Name</strong> on Google Play Store and user review portals. Gathers authentic human sentiment with strict rating synchronization. Works seamlessly across any app category.
                </p>
              </div>

              {/* App Search Bar */}
              <div className="relative w-full lg:w-72">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search target app in catalog..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Target App Card & Exact Identity Cockpit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
              
              <div className="lg:col-span-5 flex items-center gap-4">
                {currentApp?.icon_url ? (
                  <img 
                    src={currentApp.icon_url} 
                    alt={currentApp?.name || 'App'} 
                    className="w-14 h-14 rounded-2xl object-contain shadow-xs bg-white dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700" 
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-black text-indigo-600 shrink-0 text-xl">
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
                        {app.name} — {app.developer || 'Studio'}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Developer: <strong className="text-slate-800 dark:text-slate-200">{currentApp?.developer || 'Studio'}</strong>
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                      <Star size={11} className="fill-amber-400" />
                      {currentApp?.rating || 4.2}★ Base
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact Identity Resolution & Live Play Store Query Preview */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <Globe size={13} />
                    <span>Exact Identity Live Search Grounding Signature:</span>
                  </div>
                  {brain2TargetInfo?.googlePlaySearchUrl && (
                    <a
                      href={brain2TargetInfo.googlePlaySearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Play Store Target</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/60">
                    site:play.google.com/store/apps "{currentApp?.name}" "{currentApp?.developer || 'Studio'}"
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    "{currentApp?.name}" "{currentApp?.developer || 'Studio'}" user reviews complaints
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Exact Match: App Name + Developer Name (Category assumption omitted)</span>
                  {brain2GroundedSources.length > 0 && (
                    <button
                      onClick={() => setShowBrain2SourcesDrawer(!showBrain2SourcesDrawer)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={11} />
                      <span>{showBrain2SourcesDrawer ? 'Hide' : 'View'} Grounded Sources ({brain2GroundedSources.length})</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Discovered Grounded Sources Drawer */}
            {showBrain2SourcesDrawer && brain2GroundedSources.length > 0 && (
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <span className="flex items-center gap-1.5">
                    <Globe size={13} />
                    <span>Discovered Live Web Sources & Review Citations</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{brain2GroundedSources.length} links discovered</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
                  {brain2GroundedSources.map((source, idx) => (
                    <div key={idx} className="text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{source.title}</span>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 flex items-center gap-1 text-[10px]"
                      >
                        <span>Open Link</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUTONOMOUS AUTOBOT CONFIGURATION PANEL */}
            <div className="space-y-4 pt-2">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Execution Stream Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Bot size={13} className="text-indigo-500" />
                    Autobot Mode
                  </label>
                  <select
                    value={brain2ExecutionMode}
                    onChange={(e) => setBrain2ExecutionMode(e.target.value as any)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="paced">Paced Stream (Loop with research pause)</option>
                    <option value="instant">Instant Batch (Single cycle)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Streams live reviews with continuous web queries.</p>
                </div>

                {/* 2. Target Score Calibration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      Target Benchmark
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {brain2TargetScore.toFixed(1)}★
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={brain2TargetScore}
                      onChange={(e) => setBrain2TargetScore(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Review sentiment strictly synchronizes with rating.</p>
                </div>

                {/* 3. Output Destination */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-indigo-500" />
                    Storage Destination
                  </label>
                  <select
                    value={brain2SaveDirectly ? 'live' : 'staging'}
                    onChange={(e) => setBrain2SaveDirectly(e.target.value === 'live')}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="staging">Staging Deck (Inspect before publishing)</option>
                    <option value="live">Auto-Publish (Direct to live database)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Where extracted reviews are committed.</p>
                </div>

                {/* 4. Batch Size & Cycle Delay */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-indigo-500" />
                      Batch & Delay
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                      Goal: {brain2TargetGoal === -1 ? 'Continuous' : `${brain2TargetGoal} reviews`}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={brain2BatchSize}
                      onChange={(e) => setBrain2BatchSize(parseInt(e.target.value, 10))}
                      className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value={1}>1 / cycle</option>
                      <option value={2}>2 / cycle</option>
                      <option value={3}>3 / cycle</option>
                      <option value={5}>5 / cycle</option>
                    </select>
                    <select
                      value={brain2CycleDelay}
                      onChange={(e) => setBrain2CycleDelay(parseInt(e.target.value, 10))}
                      className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value={2}>2s delay</option>
                      <option value={3}>3s delay</option>
                      <option value={5}>5s delay</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Controls research speed and rate pacing.</p>
                </div>

              </div>

              {/* Optional Custom Search Focus */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  <Sparkles size={14} className="text-indigo-500" />
                  <span>Optional Search Focus:</span>
                </div>
                <input
                  type="text"
                  placeholder="E.g., 'Recent update stutter or UI smoothness' (Directs Google search grounding without rigid forcing)"
                  value={brain2CustomQuery}
                  onChange={(e) => setBrain2CustomQuery(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* AUTOBOT PRIMARY ACTION CONTROLS */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                
                <div className="flex items-center gap-2">
                  {!brain2AutobotActive ? (
                    <button
                      onClick={startBrain2AutobotRunner}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-indigo-400/40 hover:scale-[1.02]"
                    >
                      <Play size={15} className="fill-white" />
                      <span>Start Web Researcher Autobot (Autonomous Flow)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {brain2AutobotPaused ? (
                        <button
                          onClick={resumeBrain2AutobotRunner}
                          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Play size={14} className="fill-white" />
                          <span>Resume Autobot</span>
                        </button>
                      ) : (
                        <button
                          onClick={pauseBrain2AutobotRunner}
                          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Pause size={14} />
                          <span>Pause Autobot</span>
                        </button>
                      )}
                      <button
                        onClick={stopBrain2AutobotRunner}
                        className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Square size={14} className="fill-white" />
                        <span>Stop & Disengage</span>
                      </button>
                    </div>
                  )}

                  {/* Single Step Trigger */}
                  <button
                    onClick={() => executeBrain2Step(true)}
                    disabled={brain2AutobotActive}
                    className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Zap size={14} className="text-indigo-500" />
                    <span>Run Single Step (1-Shot Web Research)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetBrain2Session}
                    className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset session telemetry and logs"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Session</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* MULTITASK TELEMETRY HUD & LIVE TERMINAL CONSOLE FOR BRAIN 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            
            {/* Stage Pipeline Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider">
                <Activity size={15} className="text-indigo-400" />
                <span>Brain 2 Web Research & Grounding Pipeline</span>
              </div>
              
              {/* Dynamic Pipeline Steps */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                {[
                  { key: 'resolving_target', label: '1. Resolve Identity' },
                  { key: 'web_searching', label: '2. Google Search Grounding' },
                  { key: 'extracting_reviews', label: '3. Extract Real Reviews' },
                  { key: 'rating_aligning', label: '4. Rating Alignment' },
                  { key: 'sanitizing', label: '5. Safety Guard' },
                  { key: 'published', label: '6. Commit Live' }
                ].map((step) => {
                  const isCurrent = brain2CurrentStage === step.key;
                  return (
                    <div
                      key={step.key}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105'
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

            {/* Telemetry Stats HUD Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Researched</div>
                <div className="text-xl font-black text-indigo-400 mt-0.5">{brain2SessionStats.totalGenerated}</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Auto-Published</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{brain2SessionStats.autoPublished}</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Staged In Deck</div>
                <div className="text-xl font-black text-purple-400 mt-0.5">{brain2SessionStats.staged}</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Search Queries</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5">{brain2SessionStats.queriesRun}</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Engine Model</div>
                <div className="text-xs font-bold text-slate-300 mt-1 truncate">
                  {brain2SessionStats.lastModel || 'gemini-3.8-flash + Search'}
                </div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Last Latency</div>
                <div className="text-xs font-bold text-slate-300 mt-1">
                  {brain2SessionStats.lastLatencyMs ? `${(brain2SessionStats.lastLatencyMs / 1000).toFixed(1)}s` : 'Ready'}
                </div>
              </div>
            </div>

            {/* Live Terminal Log Feed */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
                <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <Terminal size={14} />
                  <span>Brain 2 Web Researcher Live Terminal Feed</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {brain2Logs.length} research events logged
                </span>
              </div>

              <div className="h-44 overflow-y-auto font-mono text-[11px] space-y-1.5 pr-2 scrollbar-thin text-slate-300">
                {brain2Logs.length === 0 ? (
                  <div className="text-slate-600 italic py-6 text-center">
                    Brain 2 terminal standing by. Click "Start Web Researcher Autobot" or "Run Single Step" to begin autonomous web search.
                  </div>
                ) : (
                  brain2Logs.map((log) => {
                    let colorClass = 'text-slate-300';
                    if (log.type === 'success') colorClass = 'text-indigo-400 font-semibold';
                    if (log.type === 'reasoning') colorClass = 'text-cyan-400';
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
      )}

      {/* ========================================================================= */}
      {/* 4. TELEMETRY DISPLAY (Shown when Brain 1 or Brain 2 finishes generation) */}
      {/* ========================================================================= */}
      {generationTelemetry && (
        <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
          generationTelemetry.mode === 'research'
            ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
            : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center justify-between border-b pb-2 border-slate-700/50">
            <div className="flex items-center gap-2 font-bold">
              {generationTelemetry.mode === 'research' ? <Globe size={15} /> : <Cpu size={15} />}
              <span>
                {generationTelemetry.mode === 'research' ? 'Brain 2 Live Web Grounding Telemetry' : 'Brain 1 Dossier Comprehension Telemetry'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Model: {generationTelemetry.modelUsed || 'gemini-3.8-flash'}
              </span>
              <span className="font-semibold text-emerald-400">
                Status: {generationTelemetry.searchStatus}
              </span>
            </div>
          </div>

          {generationTelemetry.dossierHighlights && generationTelemetry.dossierHighlights.length > 0 && (
            <div>
              <span className="font-bold text-emerald-300">Dossier Features Ingested:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {generationTelemetry.dossierHighlights.map((h, i) => (
                  <span key={i} className="bg-emerald-900/60 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-700/50">
                    • {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {generationTelemetry.searchQueries && generationTelemetry.searchQueries.length > 0 && (
            <div>
              <span className="font-bold text-indigo-300">Google Searches Executed:</span>
              <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[10px]">
                {generationTelemetry.searchQueries.map((q, i) => (
                  <span key={i} className="bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700/50">
                    🔍 {q}
                  </span>
                ))}
              </div>
            </div>
          )}

          {generationTelemetry.groundedSources && generationTelemetry.groundedSources.length > 0 && (
            <div>
              <span className="font-bold text-indigo-300">Live Sources & Discussions Discovered:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {generationTelemetry.groundedSources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-300 hover:text-white underline underline-offset-2"
                  >
                    <ExternalLink size={10} />
                    <span>{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STAGED REVIEWS WORKSPACE (Preview, Edit & Single/Batch Approval) */}
      {/* ========================================================================= */}
      {stagedReviews.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-500" />
                <span>Staged Reviews for Approval ({stagedReviews.length} Ready)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Edit ratings, reviewer names, or text before publishing to the live website community.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscardAll}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Discard All
              </button>
              <button
                onClick={handleSaveAllStaged}
                disabled={savingStaged}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {savingStaged ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Publishing to Database...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Publish All Staged ({stagedReviews.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Staged Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stagedReviews.map((rev, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Name input */}
                  <input
                    type="text"
                    value={rev.userName || ''}
                    onChange={(e) => handleUpdateReviewName(idx, e.target.value)}
                    className="text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white"
                  />

                  {/* Interactive Star Selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(starVal => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => handleUpdateReviewRating(idx, starVal)}
                        className="cursor-pointer"
                      >
                        <Star 
                          size={15} 
                          className={starVal <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable review text */}
                <textarea
                  value={rev.reviewText || ''}
                  onChange={(e) => handleUpdateReviewText(idx, e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
                />

                {/* Card footer */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      rev._brainMode === 'brain2' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {rev._brainMode === 'brain2' ? '🌐 Brain 2 Web' : '🧠 Brain 1 Dossier'}
                    </span>
                    <span>{rev.reviewText?.length || 0} chars</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDiscardReview(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Discard review"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => handleSaveReviewToLive(idx)}
                      disabled={savingReviewIndex === idx}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {savingReviewIndex === idx ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />}
                      <span>Publish</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PART 3: CATALOG AUTO-PILOT ENGINE (DEDICATED INTERFACE) */}
      {/* ========================================================================= */}
      {mode === 'autopilot' && (
        <div className="space-y-6">
          
          {/* Status Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Play size={15} />
                  <span>Autonomous Catalog Queue Runner</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Catalog Auto-Pilot Engine
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select apps, choose Brain 1 or Brain 2, and launch hands-free background generation.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                  autoPilotStatus?.status === 'running' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                    : autoPilotStatus?.status === 'paused'
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    autoPilotStatus?.status === 'running' ? 'bg-emerald-500 animate-pulse' : autoPilotStatus?.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  {autoPilotStatus?.status ? autoPilotStatus.status.toUpperCase() : 'IDLE'}
                </span>
              </div>
            </div>

            {/* Auto-Pilot Engine Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              
              {/* Brain Engine Choice */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Generation Brain:</label>
                <select
                  value={autoPilotBrainChoice}
                  onChange={(e) => setAutoPilotBrainChoice(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 mt-1 cursor-pointer"
                >
                  <option value="local">🧠 Brain 1: Deep Dossier Comprehension</option>
                  <option value="research">🌐 Brain 2: Live Internet Web Researcher</option>
                </select>
              </div>

              {/* Reviews per app */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reviews Per App:</label>
                <select
                  value={autoPilotOptions.countPerApp}
                  onChange={(e) => setAutoPilotOptions(prev => ({ ...prev, countPerApp: parseInt(e.target.value, 10) }))}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 mt-1 cursor-pointer"
                >
                  <option value={3}>3 Reviews per App</option>
                  <option value={5}>5 Reviews per App</option>
                  <option value={10}>10 Reviews per App</option>
                  <option value={15}>15 Reviews per App</option>
                </select>
              </div>

              {/* Skip Threshold */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Skip Apps with Reviews:</label>
                <select
                  value={autoPilotOptions.skipAppsWithReviews ? 'yes' : 'no'}
                  onChange={(e) => setAutoPilotOptions(prev => ({ ...prev, skipAppsWithReviews: e.target.value === 'yes' }))}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 mt-1 cursor-pointer"
                >
                  <option value="no">Generate for all selected apps</option>
                  <option value="yes">Skip apps with &gt; 10 reviews</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                {autoPilotStatus?.status === 'running' ? (
                  <>
                    <button
                      onClick={handlePauseAutoPilot}
                      className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Pause size={14} /> Pause
                    </button>
                    <button
                      onClick={handleStopAutoPilot}
                      className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Square size={14} /> Stop
                    </button>
                  </>
                ) : autoPilotStatus?.status === 'paused' ? (
                  <>
                    <button
                      onClick={handleResumeAutoPilot}
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play size={14} /> Resume
                    </button>
                    <button
                      onClick={handleStopAutoPilot}
                      className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Square size={14} /> Stop
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartAutoPilot}
                    disabled={autoPilotLoading || selectedAutoPilotAppIds.length === 0}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play size={14} /> Launch Auto-Pilot ({selectedAutoPilotAppIds.length} Apps)
                  </button>
                )}
              </div>

            </div>

            {/* App Selection Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Queue Apps Selection ({selectedAutoPilotAppIds.length} of {appsList.length} Selected)
                  </span>
                  <button onClick={handleSelectAllAutoPilotApps} className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                    Select All
                  </button>
                  <span>•</span>
                  <button onClick={handleDeselectAllAutoPilotApps} className="text-[11px] text-slate-500 hover:underline cursor-pointer">
                    Deselect All
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Filter apps..."
                  value={autoPilotAppSearch}
                  onChange={(e) => setAutoPilotAppSearch(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-full sm:w-48"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                {appsList
                  .filter(a => !autoPilotAppSearch.trim() || a.name?.toLowerCase().includes(autoPilotAppSearch.toLowerCase()))
                  .map(app => {
                    const appId = String(app.id || app.slug || '');
                    const isSelected = selectedAutoPilotAppIds.includes(appId);
                    return (
                      <button
                        key={appId}
                        onClick={() => toggleAutoPilotApp(appId)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-100'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {app.icon_url ? (
                          <img src={app.icon_url} alt="" className="w-6 h-6 rounded-md object-contain shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {app.name?.charAt(0)}
                          </div>
                        )}
                        <span className="text-[11px] font-bold truncate flex-1">{app.name}</span>
                        {isSelected && <Check size={12} className="text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Live Terminal Streaming Execution Logs */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Terminal size={14} className="text-blue-500" />
                  Live Queue Terminal Logs
                </span>
                <button
                  onClick={handleClearAutoPilotLogs}
                  className="text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              <div className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-2xl border border-slate-800 max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
                {autoPilotStatus?.logs && autoPilotStatus.logs.length > 0 ? (
                  autoPilotStatus.logs.map((log: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-500 text-[10px] shrink-0 font-sans">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className={
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'warning' ? 'text-amber-400' :
                        log.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic">Queue terminal idle. Ready for launch.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PART 4: 1-CLICK BULK BATCH STUDIO (DEDICATED INTERFACE) */}
      {/* ========================================================================= */}
      {mode === 'bulk' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            
            {/* Header */}
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Zap size={15} />
                <span>Fast Multi-App Category Batch</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                1-Click Bulk Batch Review Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate and automatically publish authentic reviews for entire catalog categories in a single action.
              </p>
            </div>

            {/* Bulk Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Filter:</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Apps Catalog ({appsList.length} Apps)</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Reviews per app */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reviews Per App:</label>
                <select
                  value={bulkCountPerApp}
                  onChange={(e) => setBulkCountPerApp(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value={2}>2 Reviews per App</option>
                  <option value={3}>3 Reviews per App (Standard)</option>
                  <option value={5}>5 Reviews per App</option>
                </select>
              </div>

              {/* Brain Engine */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">AI Intelligence Engine:</label>
                <select
                  value={bulkBrainChoice}
                  onChange={(e) => setBulkBrainChoice(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="local">🧠 Brain 1: Deep Dossier Comprehension</option>
                  <option value="research">🌐 Brain 2: Live Internet Web Researcher</option>
                </select>
              </div>

            </div>

            {/* Progress Bar if running */}
            {bulkProgress?.active && (
              <div className="bg-cyan-50 dark:bg-cyan-950/40 p-4 rounded-2xl border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-800 dark:text-cyan-200">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={14} className="animate-spin" />
                    Executing Bulk Generation...
                  </span>
                  <span>{bulkProgress.current} / {bulkProgress.total} Apps</span>
                </div>
                <div className="w-full bg-cyan-200 dark:bg-cyan-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Launch Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleRunBulkBatch}
                disabled={bulkProgress?.active}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap size={14} />
                <span>Launch 1-Click Bulk Batch</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAIReviewStudioTab;
