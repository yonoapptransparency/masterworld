import { StudioConfig, BrainMemoryDirective, ChatMessage, StagedReview } from './types';

export const KEY_STUDIO_CONFIG = 'rummydex_ai_studio_config';
export const KEY_STORE_BRAIN_DIRECTIVES = 'rummydex_ai_brain_directives';
export const KEY_CHAT_HISTORY = 'rummydex_ai_chat_history';
export const KEY_SELECTED_APPS = 'rummydex_ai_selected_apps';
export const KEY_STAGED_REVIEWS = 'rummydex_ai_staged_reviews';

export const DEFAULT_DIRECTIVES: BrainMemoryDirective[] = [
  {
    id: 'dir_1',
    rule: 'Never sound robotic or like marketing copy. Write like regular, authentic everyday people on Play Store, Amazon, Flipkart, and YouTube.',
    category: 'persona',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'dir_2',
    rule: 'Deep app understanding: talk about what the app actually provides, its real features, modes, rewards, FAQs, and everyday usefulness stored on our website.',
    category: 'topic',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'dir_3',
    rule: 'Zero repetitive templates: never repeat stock phrases about battery drain, dark mode, or low RAM across multiple comments. Every comment must have a unique human angle.',
    category: 'general',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'dir_4',
    rule: 'Realistic dates: strictly past or current day timestamps (never future dates) with natural hour and minute distribution.',
    category: 'date',
    createdAt: new Date().toISOString(),
    active: true
  }
];

export const DEFAULT_STUDIO_CONFIG: StudioConfig = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  reviewsPerApp: 2,
  dateMode: 'today_and_yesterday',
  ratingMix: 'auto_app_rating',
  languageTone: 'all_rounder_standard',
  platformStyle: 'smart_multi_platform',
  likesMode: 'subtle_1_2',
  customTopic: 'What the app provides, real features, user value, and authentic experience',
  publishMode: 'wait_approve',
  activeSessionDirective: ''
};

export function sanitizeModelId(rawModel?: string): string {
  const m = String(rawModel || '').trim();
  if (!m) return 'gemini-2.5-flash';
  if (m === 'gemini-2.0-flash' || m === 'gemini-1.5-flash') {
    return 'gemini-2.5-flash';
  }
  return m;
}

export function loadStudioConfig(externalSettings?: any): StudioConfig {
  if (typeof window === 'undefined') return DEFAULT_STUDIO_CONFIG;
  try {
    const raw = localStorage.getItem(KEY_STUDIO_CONFIG);
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
    const initialSettingsKey =
      externalSettings?.gemini_api_key ||
      (window as any)?.__INITIAL_DATA__?.settings?.gemini_api_key ||
      '';
    const initialSettingsModel =
      externalSettings?.gemini_model ||
      (window as any)?.__INITIAL_DATA__?.settings?.gemini_model ||
      '';
    const fallbackKey = (envKey || initialSettingsKey || '').trim();

    if (raw) {
      const parsed = JSON.parse(raw);
      const merged: StudioConfig = {
        ...DEFAULT_STUDIO_CONFIG,
        ...parsed
      };
      // If externalSettings explicitly provides a newer non-empty key, prefer it if local is empty
      if (!merged.apiKey || merged.apiKey.trim() === '') {
        merged.apiKey = fallbackKey;
      } else {
        merged.apiKey = merged.apiKey.trim();
      }
      merged.model = sanitizeModelId(merged.model || initialSettingsModel || DEFAULT_STUDIO_CONFIG.model);
      if (!merged.platformStyle) {
        merged.platformStyle = 'smart_multi_platform';
      }
      return merged;
    }

    return {
      ...DEFAULT_STUDIO_CONFIG,
      apiKey: fallbackKey,
      model: sanitizeModelId(initialSettingsModel || DEFAULT_STUDIO_CONFIG.model)
    };
  } catch (_) {}
  return DEFAULT_STUDIO_CONFIG;
}

export function saveStudioConfig(config: StudioConfig, persistToCloud = true): void {
  if (typeof window === 'undefined') return;
  const normalized: StudioConfig = {
    ...config,
    apiKey: String(config.apiKey || '').trim(),
    model: sanitizeModelId(config.model),
    platformStyle: config.platformStyle || 'smart_multi_platform'
  };
  try {
    localStorage.setItem(KEY_STUDIO_CONFIG, JSON.stringify(normalized));
  } catch (_) {}

  if (persistToCloud) {
    saveStudioConfigToCloud(normalized).catch(() => {});
  }
}

/**
 * Immediately synchronizes local AI Studio config when Admin saves Global Settings
 * (`settings.gemini_api_key` or `settings.gemini_model`).
 */
export function syncStudioConfigFromGlobalSettings(settings?: { gemini_api_key?: string; gemini_model?: string }): StudioConfig {
  const current = loadStudioConfig(settings);
  const next: StudioConfig = {
    ...current,
    apiKey: typeof settings?.gemini_api_key === 'string' ? settings.gemini_api_key.trim() : current.apiKey,
    model: settings?.gemini_model ? sanitizeModelId(settings.gemini_model) : current.model
  };
  saveStudioConfig(next, true);
  return next;
}

export function loadBrainDirectives(): BrainMemoryDirective[] {
  if (typeof window === 'undefined') return DEFAULT_DIRECTIVES;
  try {
    const raw = localStorage.getItem(KEY_STORE_BRAIN_DIRECTIVES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_DIRECTIVES;
}

export function saveBrainDirectives(directives: BrainMemoryDirective[], persistToCloud = false): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_STORE_BRAIN_DIRECTIVES, JSON.stringify(directives));
  } catch (_) {}

  if (persistToCloud) {
    saveBrainDirectivesToCloud(directives).catch(() => {});
  }
}

export async function saveBrainDirectivesToCloud(directives: BrainMemoryDirective[]): Promise<boolean> {
  const payload = {
    directives: directives.map(d => ({
      id: String(d.id || ''),
      rule: String(d.rule || ''),
      category: String(d.category || 'general'),
      createdAt: String(d.createdAt || new Date().toISOString()),
      active: Boolean(d.active)
    })),
    updatedAt: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/v1/admin/community/aistudio-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return true;
  } catch (_) {}

  try {
    const { getResolvedCommunityFirebaseConfig, convertToFirestoreFields } = await import('../../../lib/communityFirebase');
    const cfg = getResolvedCommunityFirebaseConfig();
    if (cfg && cfg.apiKey && cfg.projectId) {
      const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/community_store/ai_studio_brain?key=${cfg.apiKey}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: convertToFirestoreFields({ ...payload, _rest_admin_bypass: 'aistudio_preview_bypass_key' }) })
      });
      return res.ok;
    }
  } catch (_) {}

  return false;
}

export async function loadBrainDirectivesFromCloud(): Promise<BrainMemoryDirective[] | null> {
  try {
    const res = await fetch('/api/v1/admin/community/aistudio-settings');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data?.directives) && json.data.directives.length > 0) {
        const cloudDirectives: BrainMemoryDirective[] = json.data.directives.map((d: any, idx: number) => ({
          id: String(d.id || `dir_${idx}`),
          rule: String(d.rule || ''),
          category: (d.category || 'general') as any,
          createdAt: String(d.createdAt || new Date().toISOString()),
          active: Boolean(d.active !== false)
        })).filter((d: any) => Boolean(d.rule));

        try {
          localStorage.setItem(KEY_STORE_BRAIN_DIRECTIVES, JSON.stringify(cloudDirectives));
        } catch (_) {}
        return cloudDirectives;
      }
    }
  } catch (_) {}

  try {
    const { getResolvedCommunityFirebaseConfig, parseFirestoreFields } = await import('../../../lib/communityFirebase');
    const cfg = getResolvedCommunityFirebaseConfig();
    if (!cfg || !cfg.apiKey || !cfg.projectId) return null;

    const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/community_store/ai_studio_brain?key=${cfg.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    if (json && json.fields) {
      const parsed = parseFirestoreFields(json.fields);
      if (Array.isArray(parsed?.directives)) {
        const cloudDirectives: BrainMemoryDirective[] = parsed.directives.map((d: any, idx: number) => ({
          id: String(d.id || `dir_${idx}`),
          rule: String(d.rule || ''),
          category: (d.category || 'general') as any,
          createdAt: String(d.createdAt || new Date().toISOString()),
          active: Boolean(d.active !== false)
        })).filter((d: any) => Boolean(d.rule));

        try {
          localStorage.setItem(KEY_STORE_BRAIN_DIRECTIVES, JSON.stringify(cloudDirectives));
        } catch (_) {}
        return cloudDirectives;
      }
    }
  } catch (e) {
    console.warn('[AI Studio] Cloud directives load error:', e);
  }
  return null;
}

export async function saveStudioConfigToCloud(config: StudioConfig): Promise<boolean> {
  const payload = {
    apiKey: String(config.apiKey || '').trim(),
    model: sanitizeModelId(config.model),
    reviewsPerApp: Number(config.reviewsPerApp) || 2,
    languageTone: String(config.languageTone || 'all_rounder_standard'),
    platformStyle: String(config.platformStyle || 'smart_multi_platform'),
    dateMode: String(config.dateMode || 'today_and_yesterday'),
    ratingMix: String(config.ratingMix || 'auto_app_rating'),
    likesMode: String(config.likesMode || 'subtle_1_2'),
    publishMode: String(config.publishMode || 'wait_approve'),
    customTopic: String(config.customTopic || ''),
    activeSessionDirective: String(config.activeSessionDirective || ''),
    updatedAt: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/v1/admin/community/aistudio-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: payload })
    });
    if (res.ok) return true;
  } catch (_) {}

  try {
    const { getResolvedCommunityFirebaseConfig, convertToFirestoreFields } = await import('../../../lib/communityFirebase');
    const cfg = getResolvedCommunityFirebaseConfig();
    if (cfg && cfg.apiKey && cfg.projectId) {
      const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/community_store/ai_studio_config?key=${cfg.apiKey}`;
      // Do not store sensitive apiKey in public Firestore document
      const { apiKey: _omit, ...safeFirestorePayload } = payload;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: convertToFirestoreFields({ ...safeFirestorePayload, _rest_admin_bypass: 'aistudio_preview_bypass_key' }) })
      });
      return res.ok;
    }
  } catch (_) {}

  return false;
}

/**
 * Loads studio config from server / Cloud Firestore without ever overwriting
 * existing local API keys or custom models with undefined values.
 */
export async function loadStudioConfigFromCloud(): Promise<{ config: Partial<StudioConfig>; hasServerKey: boolean } | null> {
  try {
    const res = await fetch('/api/v1/admin/community/aistudio-settings');
    if (res.ok) {
      const json = await res.json();
      const cfg = json?.data?.config;
      const hasServerKey = Boolean(json?.data?.hasServerKey || cfg?.apiKey);
      if (cfg) {
        const cleanResult: Partial<StudioConfig> = {};
        if (cfg.apiKey && String(cfg.apiKey).trim()) {
          cleanResult.apiKey = String(cfg.apiKey).trim();
        }
        if (cfg.model && String(cfg.model).trim()) {
          cleanResult.model = sanitizeModelId(String(cfg.model).trim());
        }
        if (typeof cfg.reviewsPerApp === 'number' && cfg.reviewsPerApp > 0) {
          cleanResult.reviewsPerApp = cfg.reviewsPerApp;
        }
        if (cfg.languageTone) cleanResult.languageTone = cfg.languageTone;
        if (cfg.platformStyle) cleanResult.platformStyle = cfg.platformStyle;
        if (cfg.dateMode) cleanResult.dateMode = cfg.dateMode;
        if (cfg.ratingMix) cleanResult.ratingMix = cfg.ratingMix;
        if (cfg.likesMode) cleanResult.likesMode = cfg.likesMode;
        if (cfg.publishMode) cleanResult.publishMode = cfg.publishMode;
        if (typeof cfg.activeSessionDirective === 'string' && cfg.activeSessionDirective.trim()) {
          cleanResult.activeSessionDirective = cfg.activeSessionDirective;
        }
        return { config: cleanResult, hasServerKey };
      }
    }
  } catch (_) {}

  try {
    const { getResolvedCommunityFirebaseConfig, parseFirestoreFields } = await import('../../../lib/communityFirebase');
    const cfg = getResolvedCommunityFirebaseConfig();
    if (!cfg || !cfg.apiKey || !cfg.projectId) return null;

    const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/community_store/ai_studio_config?key=${cfg.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    if (json && json.fields) {
      const parsed = parseFirestoreFields(json.fields);
      if (parsed) {
        const cleanResult: Partial<StudioConfig> = {};
        if (parsed.model && String(parsed.model).trim()) {
          cleanResult.model = sanitizeModelId(String(parsed.model).trim());
        }
        if (parsed.reviewsPerApp) cleanResult.reviewsPerApp = Number(parsed.reviewsPerApp) || 2;
        if (parsed.languageTone) cleanResult.languageTone = parsed.languageTone;
        if (parsed.platformStyle) cleanResult.platformStyle = parsed.platformStyle;
        if (parsed.dateMode) cleanResult.dateMode = parsed.dateMode;
        if (parsed.ratingMix) cleanResult.ratingMix = parsed.ratingMix;
        if (parsed.publishMode) cleanResult.publishMode = parsed.publishMode;
        if (parsed.activeSessionDirective) cleanResult.activeSessionDirective = parsed.activeSessionDirective;
        return { config: cleanResult, hasServerKey: false };
      }
    }
  } catch (e) {
    console.warn('[AI Studio] Cloud config load error:', e);
  }
  return null;
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_CHAT_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am your AI Review Studio Brain. I remember our full conversation and inspect every app’s complete profile (what it provides, features, FAQs, rewards, and related videos) to write 100% authentic human comments in Play Store, Amazon/Flipkart, YouTube, or Community style. Tell me how you want the comments built today!',
      timestamp: new Date().toISOString()
    }
  ];
}

export function saveChatHistory(history: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_CHAT_HISTORY, JSON.stringify(history.slice(-40)));
  } catch (_) {}
}

export function loadStagedReviews(): StagedReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_STAGED_REVIEWS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

export function saveStagedReviews(reviews: StagedReview[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_STAGED_REVIEWS, JSON.stringify(reviews));
  } catch (_) {}
}

export function loadSelectedAppIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_SELECTED_APPS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

export function saveSelectedAppIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_SELECTED_APPS, JSON.stringify(ids));
  } catch (_) {}
}
