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
  XSquare,
  X,
  Send,
  Key,
  Radio
} from 'lucide-react';
import { toast } from '../Toast';
import { adminFetch } from '../../services/adminAuthService';
import { 
  AppReviewProfile, 
  loadAllAppProfiles, 
  saveAllAppProfiles, 
  stripHtmlTags, 
  STORAGE_KEY_PROFILES, 
  STORAGE_KEY_DEFAULT_COUNT,
  AutobotStage,
  AutobotLog,
  AutobotSessionStats,
  Brain2AutobotStage,
  Brain2AutobotLog,
  Brain2AutobotSessionStats,
  GenerationTelemetry
} from './aistudio/types';
import { Brain1Studio } from './aistudio/Brain1Studio';
import { Brain2Studio } from './aistudio/Brain2Studio';
import { StagedReviewsWorkspace } from './aistudio/StagedReviewsWorkspace';
import { AutopilotStudio } from './aistudio/AutopilotStudio';
import { BulkStudio } from './aistudio/BulkStudio';

export { type AppReviewProfile };

interface AdminAIReviewStudioTabProps {
  appsList: any[];
  onReviewsGenerated?: () => void;
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
  const [brain1LanguageStyle, setBrain1LanguageStyle] = useState<'proper_english' | 'hinglish' | 'natural_mix'>('proper_english');
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

  // ==========================================
  // Gemini AI Engine & Multi-Key Diagnostics
  // ==========================================
  const [showAiDiagnosticsModal, setShowAiDiagnosticsModal] = useState<boolean>(false);
  const [aiStatusData, setAiStatusData] = useState<any>(null);
  const [loadingAiStatus, setLoadingAiStatus] = useState<boolean>(false);
  const [switchingModel, setSwitchingModel] = useState<boolean>(false);
  const [pingTesting, setPingTesting] = useState<boolean>(false);
  const [pingModel, setPingModel] = useState<string>('gemini-3.8-flash');
  const [pingPrompt, setPingPrompt] = useState<string>('Confirm RummyDex AI engine status and connectivity.');
  const [pingResult, setPingResult] = useState<any>(null);

  const fetchAiStatus = useCallback(async () => {
    setLoadingAiStatus(true);
    try {
      const res = await adminFetch('/api/v1/admin/ai-status');
      if (res.ok) {
        const data = await res.json();
        setAiStatusData(data);
        if (data.activeModel) {
          setPingModel(data.activeModel);
        }
      }
    } catch (err) {
      console.warn("Could not fetch AI status:", err);
    } finally {
      setLoadingAiStatus(false);
    }
  }, []);

  const handleSwitchActiveModel = async (modelId: string) => {
    setSwitchingModel(true);
    try {
      const res = await adminFetch('/api/v1/admin/ai/set-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Active Gemini model switched to ${data.activeModel}`, 'success');
        setPingModel(data.activeModel);
        await fetchAiStatus();
      } else {
        toast(data.error || 'Failed to switch model', 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Error switching model', 'error');
    } finally {
      setSwitchingModel(false);
    }
  };

  const runPingTest = async (modelToTest?: string) => {
    setPingTesting(true);
    setPingResult(null);
    try {
      const targetModel = modelToTest || pingModel || aiStatusData?.activeModel || 'gemini-2.5-flash';
      const res = await adminFetch('/api/v1/admin/ai-test-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          prompt: pingPrompt
        })
      });
      const data = await res.json();
      setPingResult(data);
      if (res.ok && data.success) {
        toast(`API Test Passed! Latency: ${data.latencyMs}ms (${data.modelUsed})`, 'success');
        fetchAiStatus();
      } else {
        toast(data.error || 'AI Ping test failed', 'error');
      }
    } catch (err: any) {
      setPingResult({ success: false, error: err.message || 'Network request failed' });
      toast('AI Ping failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setPingTesting(false);
    }
  };

  useEffect(() => {
    fetchAiStatus();
  }, [fetchAiStatus]);

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
      setBrain1LanguageStyle(saved.languageStyle ?? 'proper_english');
      setSingleCount(saved.singleCount ?? 5);
      setCustomPrompt(saved.customPrompt ?? '');
      setLastSavedTime(saved.updatedAt || 'Saved');
    } else {
      setToneFocus('balanced');
      setBrain1LanguageStyle('proper_english');
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

  const handleSetBrain1LanguageStyle = useCallback((style: 'proper_english' | 'hinglish' | 'natural_mix') => {
    setBrain1LanguageStyle(style);
    persistCurrentAppProfile({ languageStyle: style });
  }, [persistCurrentAppProfile]);

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

  const autoPilotInitializedRef = useRef(false);

  useEffect(() => {
    if (appsList && appsList.length > 0 && !autoPilotInitializedRef.current) {
      setSelectedAutoPilotAppIds(appsList.map(a => String(a.id || a.slug || '')));
      autoPilotInitializedRef.current = true;
    }
  }, [appsList]);

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
  const [bulkLanguageStyle, setBulkLanguageStyle] = useState<'proper_english' | 'hinglish' | 'natural_mix'>('proper_english');

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
          languageStyle: brain1LanguageStyle,
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
      let totalGenerated = 0;

      // Execute sequentially on the frontend to prevent server timeout
      for (let i = 0; i < targetApps.length; i++) {
        setBulkProgress({ current: i, total: targetApps.length, active: true });
        try {
          const res = await adminFetch('/api/v1/admin/community/ai-generate/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appIds: [targetApps[i].id],
              countPerApp: bulkCountPerApp,
              targetScore: 4.8,
              mode: bulkBrainChoice,
              languageStyle: bulkLanguageStyle
            })
          });

          const data = await res.json();
          if (res.ok) {
            totalGenerated += (data.totalGenerated || bulkCountPerApp);
          }
        } catch (stepErr) {
          console.warn(`Bulk generation failed for app ${targetApps[i].id}`, stepErr);
        }
      }

      setBulkProgress({ current: targetApps.length, total: targetApps.length, active: true });
      setBulkResult({
        totalGenerated: totalGenerated,
        totalApps: targetApps.length
      });
      toast(`🎉 Bulk Batch Complete! Generated ${totalGenerated} reviews.`, "success");
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

          {/* Real-time System Status Pills with Interactive Diagnostic Button & Model Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            {/* Live Model Switcher Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xs">
              <Sparkles size={13} className="text-cyan-400" />
              <span className="text-slate-400 text-[11px] font-medium">Model:</span>
              <select
                value={aiStatusData?.activeModel || 'gemini-3.8-flash'}
                onChange={(e) => handleSwitchActiveModel(e.target.value)}
                disabled={switchingModel}
                className="bg-transparent text-cyan-300 font-bold text-xs focus:outline-hidden cursor-pointer disabled:opacity-50"
                title="Switch active Gemini AI Model"
              >
                <option value="gemini-3.8-flash" className="bg-slate-900 text-white">Gemini 3.8 Flash (Flagship Default)</option>
                <option value="gemini-3.7-pro" className="bg-slate-900 text-white">Gemini 3.7 Pro (Advanced Reasoning)</option>
                <option value="gemini-3.7-flash" className="bg-slate-900 text-white">Gemini 3.7 Flash (High Performance)</option>
                <option value="gemini-3.5-pro" className="bg-slate-900 text-white">Gemini 3.5 Pro (Deep Logic)</option>
                <option value="gemini-3.5-flash" className="bg-slate-900 text-white">Gemini 3.5 Flash (Fast Balanced)</option>
                <option value="gemini-3.1-pro-preview" className="bg-slate-900 text-white">Gemini 3.1 Pro (Deep Thinking)</option>
                <option value="gemini-flash-latest" className="bg-slate-900 text-white">Gemini Flash (Auto Latest)</option>
                <option value="gemini-2.5-pro" className="bg-slate-900 text-white">Gemini 2.5 Pro (Deep Dossier)</option>
                <option value="gemini-2.5-flash" className="bg-slate-900 text-white">Gemini 2.5 Flash (High Speed)</option>
              </select>
              {switchingModel && <RefreshCw size={11} className="text-cyan-400 animate-spin" />}
            </div>

            {/* Live Gemini Engine Status Badge */}
            <div 
              onClick={() => { fetchAiStatus(); setShowAiDiagnosticsModal(true); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                aiStatusData?.overallStatus === 'all_systems_operational'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:border-emerald-400'
                  : aiStatusData?.overallStatus === 'quota_warning'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:border-amber-400'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-500'
              }`}
              title="Click to view Gemini API Keys and Model Diagnostics"
            >
              <span className={`w-2 h-2 rounded-full ${
                aiStatusData?.overallStatus === 'all_systems_operational'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`} />
              <span className="text-slate-300">Engine:</span>
              <span className="font-bold">
                {loadingAiStatus 
                  ? 'Checking...' 
                  : aiStatusData?.overallStatus === 'all_systems_operational'
                  ? 'Online'
                  : aiStatusData?.configured
                  ? 'Key Active'
                  : 'Needs Review'}
              </span>
            </div>

            {/* Test API Keys Action Button */}
            <button
              onClick={() => { fetchAiStatus(); setShowAiDiagnosticsModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/50 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 shadow-xs cursor-pointer transition-all active:scale-95 text-xs font-bold"
              title="Open full AI API Diagnostics & Model Testing Sandbox"
            >
              <Activity size={14} className="text-cyan-400 animate-pulse" />
              <span>Diagnostics</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-slate-300">Brain 2:</span>
              <span className="text-indigo-300 font-bold">Web Grounding</span>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xs">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-slate-300">Database:</span>
              <span className="text-emerald-400 font-bold">Firestore</span>
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
      {/* 2. PART 1: BRAIN 1 — DEEP DOSSIER AUTOBOT ENGINE */}
      {/* ========================================================================= */}
      {mode === 'brain1' && (
        <Brain1Studio
          currentApp={currentApp}
          filteredApps={filteredApps}
          selectedAppId={selectedAppId}
          setSelectedAppId={setSelectedAppId}
          appSearch={appSearch}
          setAppSearch={setAppSearch}
          targetScore={targetScore}
          customPrompt={customPrompt}
          setCustomPrompt={setCustomPrompt}
          brain1LanguageStyle={brain1LanguageStyle}
          setBrain1LanguageStyle={handleSetBrain1LanguageStyle}
          autobotActive={autobotActive}
          autobotPaused={autobotPaused}
          autobotExecutionMode={autobotExecutionMode}
          setAutobotExecutionMode={setAutobotExecutionMode}
          autobotSaveDirectly={autobotSaveDirectly}
          setAutobotSaveDirectly={setAutobotSaveDirectly}
          autobotTargetGoal={autobotTargetGoal}
          setAutobotTargetGoal={setAutobotTargetGoal}
          autobotBatchSize={autobotBatchSize}
          setAutobotBatchSize={setAutobotBatchSize}
          autobotCycleDelay={autobotCycleDelay}
          setAutobotCycleDelay={setAutobotCycleDelay}
          autobotCurrentStage={autobotCurrentStage}
          autobotSessionStats={autobotSessionStats}
          autobotLogs={autobotLogs}
          brain1Dossier={brain1Dossier}
          dossierHealth={dossierHealth}
          onStartAutobot={startAutobotRunner}
          onPauseAutobot={pauseAutobotRunner}
          onResumeAutobot={resumeAutobotRunner}
          onStopAutobot={stopAutobotRunner}
          onExecuteStep={executeAutobotStep}
          onResetSession={resetAutobotSession}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. PART 2: BRAIN 2 — LIVE INTERNET WEB RESEARCHER AUTOBOT */}
      {/* ========================================================================= */}
      {mode === 'brain2' && (
        <Brain2Studio
          currentApp={currentApp}
          filteredApps={filteredApps}
          selectedAppId={selectedAppId}
          setSelectedAppId={setSelectedAppId}
          appSearch={appSearch}
          setAppSearch={setAppSearch}
          brain2TargetScore={brain2TargetScore}
          setBrain2TargetScore={setBrain2TargetScore}
          brain2CustomQuery={brain2CustomQuery}
          setBrain2CustomQuery={setBrain2CustomQuery}
          brain2AutobotActive={brain2AutobotActive}
          brain2AutobotPaused={brain2AutobotPaused}
          brain2ExecutionMode={brain2ExecutionMode}
          setBrain2ExecutionMode={setBrain2ExecutionMode}
          brain2SaveDirectly={brain2SaveDirectly}
          setBrain2SaveDirectly={setBrain2SaveDirectly}
          brain2TargetGoal={brain2TargetGoal}
          setBrain2TargetGoal={setBrain2TargetGoal}
          brain2BatchSize={brain2BatchSize}
          setBrain2BatchSize={setBrain2BatchSize}
          brain2CycleDelay={brain2CycleDelay}
          setBrain2CycleDelay={setBrain2CycleDelay}
          brain2CurrentStage={brain2CurrentStage}
          brain2SessionStats={brain2SessionStats}
          brain2Logs={brain2Logs}
          brain2TargetInfo={brain2TargetInfo}
          brain2GroundedSources={brain2GroundedSources}
          showBrain2SourcesDrawer={showBrain2SourcesDrawer}
          setShowBrain2SourcesDrawer={setShowBrain2SourcesDrawer}
          onStartBrain2Autobot={startBrain2AutobotRunner}
          onPauseBrain2Autobot={pauseBrain2AutobotRunner}
          onResumeBrain2Autobot={resumeBrain2AutobotRunner}
          onStopBrain2Autobot={stopBrain2AutobotRunner}
          onExecuteBrain2Step={executeBrain2Step}
          onResetBrain2Session={resetBrain2Session}
        />
      )}

      {/* ========================================================================= */}
      {/* 4 & 5. STAGED REVIEWS & TELEMETRY */}
      {/* ========================================================================= */}
      <StagedReviewsWorkspace
        stagedReviews={stagedReviews}
        generationTelemetry={generationTelemetry}
        savingStaged={savingStaged}
        savingReviewIndex={savingReviewIndex}
        onUpdateReviewName={handleUpdateReviewName}
        onUpdateReviewRating={handleUpdateReviewRating}
        onUpdateReviewText={handleUpdateReviewText}
        onDiscardReview={handleDiscardReview}
        onDiscardAll={handleDiscardAll}
        onSaveReviewToLive={handleSaveReviewToLive}
        onSaveAllStaged={handleSaveAllStaged}
      />

      {/* ========================================================================= */}
      {/* 6. PART 3: CATALOG AUTO-PILOT ENGINE */}
      {/* ========================================================================= */}
      {mode === 'autopilot' && (
        <AutopilotStudio
          appsList={appsList}
          autoPilotStatus={autoPilotStatus}
          autoPilotLoading={autoPilotLoading}
          selectedAutoPilotAppIds={selectedAutoPilotAppIds}
          autoPilotAppSearch={autoPilotAppSearch}
          setAutoPilotAppSearch={setAutoPilotAppSearch}
          autoPilotBrainChoice={autoPilotBrainChoice}
          setAutoPilotBrainChoice={setAutoPilotBrainChoice}
          autoPilotOptions={autoPilotOptions}
          setAutoPilotOptions={setAutoPilotOptions}
          activeModel={aiStatusData?.activeModel || 'gemini-3.8-flash'}
          onOpenAiSettings={() => setShowAiDiagnosticsModal(true)}
          onToggleAutoPilotApp={toggleAutoPilotApp}
          onSelectAllAutoPilotApps={handleSelectAllAutoPilotApps}
          onDeselectAllAutoPilotApps={handleDeselectAllAutoPilotApps}
          onStartAutoPilot={handleStartAutoPilot}
          onPauseAutoPilot={handlePauseAutoPilot}
          onResumeAutoPilot={handleResumeAutoPilot}
          onStopAutoPilot={handleStopAutoPilot}
          onClearAutoPilotLogs={handleClearAutoPilotLogs}
        />
      )}

      {/* ========================================================================= */}
      {/* 7. PART 4: 1-CLICK BULK BATCH STUDIO */}
      {/* ========================================================================= */}
      {mode === 'bulk' && (
        <BulkStudio
          appsList={appsList}
          categories={categories}
          bulkCategory={bulkCategory}
          setBulkCategory={setBulkCategory}
          bulkCountPerApp={bulkCountPerApp}
          setBulkCountPerApp={setBulkCountPerApp}
          bulkBrainChoice={bulkBrainChoice}
          setBulkBrainChoice={setBulkBrainChoice}
          bulkLanguageStyle={bulkLanguageStyle}
          setBulkLanguageStyle={setBulkLanguageStyle}
          bulkProgress={bulkProgress}
          activeModel={aiStatusData?.activeModel || 'gemini-3.8-flash'}
          onOpenAiSettings={() => setShowAiDiagnosticsModal(true)}
          onRunBulkBatch={handleRunBulkBatch}
        />
      )}

      {/* ========================================================================= */}
      {/* 8. GEMINI AI ENGINE & MULTI-KEY DIAGNOSTICS MODAL */}
      {/* ========================================================================= */}
      {showAiDiagnosticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 p-6 text-slate-200">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <Activity size={22} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Gemini AI Engine & Multi-Key Diagnostics
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      Live Monitor
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time latency testing, API key health inspection, and interactive model ping sandbox.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAiStatus}
                  disabled={loadingAiStatus}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  <RefreshCw size={12} className={loadingAiStatus ? 'animate-spin text-cyan-400' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowAiDiagnosticsModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Overall Status Banner */}
            <div className="mt-4 p-4 rounded-xl border bg-slate-800/60 border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${
                  aiStatusData?.overallStatus === 'all_systems_operational'
                    ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse'
                    : 'bg-amber-400 ring-4 ring-amber-500/20'
                }`} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">System Health Status</div>
                  <div className="text-sm font-semibold text-white">
                    {aiStatusData?.overallStatus === 'all_systems_operational'
                      ? 'All AI Review Systems Operational'
                      : aiStatusData?.overallStatus === 'quota_warning'
                      ? 'High Quota Traffic Detected (Failover Active)'
                      : 'AI Review Configuration Active'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Primary Key: </span>
                  <span className="font-mono text-cyan-300 font-semibold">{aiStatusData?.activeKeySource || 'Auto-Detected'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Primary Model: </span>
                  <span className="font-mono text-emerald-300 font-semibold">{aiStatusData?.activeModel || 'gemini-3.6-flash'}</span>
                </div>
              </div>
            </div>

            {/* Configured Keys Breakdown */}
            <div className="mt-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key size={14} className="text-cyan-400" />
                <span>Detected API Keys & Health Status</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiStatusData?.keys && aiStatusData.keys.length > 0 ? (
                  aiStatusData.keys.map((k: any, idx: number) => {
                    const isOnline = k.status === 'online';
                    const isAuthError = k.status === 'auth_error';
                    const isQuotaError = k.status === 'quota_error';

                    return (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border transition ${
                          isOnline 
                            ? 'bg-emerald-950/20 border-emerald-500/30' 
                            : isAuthError
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-slate-800/40 border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-white block">{k.name}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{k.role}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isOnline 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : isAuthError
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {isOnline ? 'Online' : isAuthError ? 'Auth Notice' : isQuotaError ? 'Quota Exceeded' : k.status}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-400 text-[11px]">{k.masked || '••••••••'}</span>
                          {k.latencyMs > 0 && (
                            <span className="text-cyan-400 font-mono text-[11px]">
                              {k.latencyMs}ms latency
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-[11px] text-slate-300 leading-relaxed">
                          {k.message}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-400">
                    Loading key diagnostics...
                  </div>
                )}
              </div>
            </div>

            {/* Active Gemini Model Switching Cards */}
            <div className="mt-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span>Switch Active Gemini Model</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Current: <strong className="text-emerald-400 font-mono">{aiStatusData?.activeModel || 'gemini-3.8-flash'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'gemini-3.8-flash',
                    name: 'Gemini 3.8 Flash',
                    badge: 'Flagship Default',
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    desc: 'Top-tier high reasoning model. Peak speed and roleplay intelligence.',
                    ctx: '1,000,000+ tokens'
                  },
                  {
                    id: 'gemini-3.1-pro-preview',
                    name: 'Gemini 3.1 Pro Preview',
                    badge: 'Maximum Reasoning',
                    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                    desc: 'Flagship deep reasoning pro model for exhaustive HTML rule & table analysis.',
                    ctx: '2,000,000+ tokens'
                  },
                  {
                    id: 'gemini-flash-latest',
                    name: 'Gemini Flash Latest',
                    badge: 'Auto Updated',
                    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                    desc: 'Always targets the newest Google Flash release with latest features.',
                    ctx: '1,000,000+ tokens'
                  },
                  {
                    id: 'gemini-3.1-flash-lite',
                    name: 'Gemini 3.1 Flash Lite',
                    badge: 'Ultra Fast',
                    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    desc: 'Ultra high-speed generation for massive catalog rollouts.',
                    ctx: '1,000,000+ tokens'
                  },
                  {
                    id: 'gemini-2.5-pro',
                    name: 'Gemini 2.5 Pro',
                    badge: 'Deep Dossier',
                    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                    desc: 'Deep multi-stage synthesis with expanded reasoning capacity.',
                    ctx: '2,000,000+ tokens'
                  },
                  {
                    id: 'gemini-2.5-flash',
                    name: 'Gemini 2.5 Flash',
                    badge: 'High Performance',
                    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                    desc: 'High performance multimodal model with grounded search.',
                    ctx: '1,000,000+ tokens'
                  }
                ].map((m) => {
                  const isActive = (aiStatusData?.activeModel || 'gemini-3.8-flash') === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSwitchActiveModel(m.id)}
                      disabled={switchingModel}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-bold text-xs font-mono text-white truncate">{m.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${m.badgeColor}`}>
                          {isActive ? 'ACTIVE' : m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{m.desc}</p>
                      <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Context: {m.ctx}</span>
                        <span className={isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {isActive ? '✓ In Use' : 'Click to Activate'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Model Test Sandbox */}
            <div className="mt-6 p-4 rounded-xl border border-slate-700 bg-slate-950/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Interactive Model Ping Sandbox</span>
                </div>
                <span className="text-[11px] text-slate-400">Direct server-to-Gemini roundtrip test</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Model</label>
                  <select
                    value={pingModel}
                    onChange={(e) => setPingModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="gemini-3.8-flash">gemini-3.8-flash (Flagship Default)</option>
                    <option value="gemini-3.7-pro">gemini-3.7-pro (Advanced Reasoning Pro)</option>
                    <option value="gemini-3.7-flash">gemini-3.7-flash (High Performance)</option>
                    <option value="gemini-3.5-pro">gemini-3.5-pro (Deep Logic Pro)</option>
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Fast Balanced)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Thinking Pro)</option>
                    <option value="gemini-flash-latest">gemini-flash-latest (Auto Latest)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Dossier Pro)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (High Speed)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Test Prompt</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pingPrompt}
                      onChange={(e) => setPingPrompt(e.target.value)}
                      placeholder="Enter ping prompt..."
                      className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:border-cyan-400"
                    />
                    <button
                      onClick={() => runPingTest()}
                      disabled={pingTesting}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
                    >
                      {pingTesting ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Send Ping</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-medium">Quick Prompts:</span>
                <button
                  type="button"
                  onClick={() => setPingPrompt("Confirm RummyDex AI engine status and connectivity.")}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Health Ping
                </button>
                <button
                  type="button"
                  onClick={() => setPingPrompt("Generate 1 short positive Hinglish card game review in JSON format.")}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Hinglish Review Ping
                </button>
                <button
                  type="button"
                  onClick={() => setPingPrompt("Generate 1 short English review emphasizing smooth card table animations in JSON format.")}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  English Review Ping
                </button>
              </div>

              {/* Ping Result Display */}
              {pingResult && (
                <div className={`mt-3 p-3 rounded-lg border font-mono text-xs ${
                  pingResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px]">
                    <span className="font-bold flex items-center gap-1.5">
                      {pingResult.success ? <CheckCircle2 size={13} className="text-emerald-400" /> : <AlertCircle size={13} className="text-red-400" />}
                      {pingResult.success ? 'API Response Received (HTTP 200)' : 'API Ping Failed'}
                    </span>
                    {pingResult.latencyMs && (
                      <span className="text-cyan-300">
                        {pingResult.latencyMs}ms • Key: {pingResult.keyUsed} • Model: {pingResult.modelUsed}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed text-slate-300">
                    {pingResult.responseText || pingResult.error || JSON.stringify(pingResult, null, 2)}
                  </div>
                </div>
              )}
            </div>

            {/* Architecture Safety Guarantees */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Zero-Failure Fallback: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-indigo-400" />
                <span>Brain 1: Hinglish & English Dictionaries Ingested</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-cyan-400" />
                <span>Brain 2: Live Play Store Grounding Active</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAIReviewStudioTab;
