import { StudioConfig, BrainMemoryDirective, ChatMessage, StagedReview } from './types';

export const KEY_STUDIO_CONFIG = 'rummydex_ai_studio_config';
export const KEY_STORE_BRAIN_DIRECTIVES = 'rummydex_ai_brain_directives';
export const KEY_CHAT_HISTORY = 'rummydex_ai_chat_history';
export const KEY_SELECTED_APPS = 'rummydex_ai_selected_apps';
export const KEY_STAGED_REVIEWS = 'rummydex_ai_staged_reviews';

export const DEFAULT_DIRECTIVES: BrainMemoryDirective[] = [
  {
    id: 'dir_1',
    rule: 'Never sound robotic or like marketing copy. Write like regular, authentic everyday people who downloaded the app.',
    category: 'persona',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'dir_2',
    rule: 'Deep app understanding: strictly ground every comment in the specific app’s real features, category, UI, and content stored on our website.',
    category: 'topic',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'dir_3',
    rule: 'All-rounder adaptability: adapt vocabulary naturally to the app genre (entertainment, card game, casual arcade, tools) without forcing money or gambling terms.',
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
  model: 'gemini-flash-latest',
  reviewsPerApp: 2,
  dateMode: 'today_and_yesterday',
  ratingMix: 'natural',
  languageTone: 'all_rounder_standard',
  customTopic: 'Core features, smooth performance, authentic user experience',
  publishMode: 'wait_approve'
};

export function loadStudioConfig(): StudioConfig {
  if (typeof window === 'undefined') return DEFAULT_STUDIO_CONFIG;
  try {
    const raw = localStorage.getItem(KEY_STUDIO_CONFIG);
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
    const initialSettingsKey = (window as any)?.__INITIAL_DATA__?.settings?.gemini_api_key || '';
    const initialSettingsModel = (window as any)?.__INITIAL_DATA__?.settings?.gemini_model || '';
    const fallbackKey = envKey || initialSettingsKey;

    if (raw) {
      const parsed = JSON.parse(raw);
      const merged: StudioConfig = { ...DEFAULT_STUDIO_CONFIG, ...parsed };
      // If storage key is empty, check environment variable or admin settings fallback
      if (!merged.apiKey || merged.apiKey.trim() === '') {
        merged.apiKey = fallbackKey;
      }
      if (
        !merged.model ||
        merged.model === 'gemini-2.5-flash' ||
        merged.model === 'gemini-2.0-flash' ||
        merged.model === 'gemini-1.5-flash'
      ) {
        merged.model = initialSettingsModel || 'gemini-flash-latest';
      }
      return merged;
    }
    if (fallbackKey) {
      return { 
        ...DEFAULT_STUDIO_CONFIG, 
        apiKey: fallbackKey,
        model: initialSettingsModel || DEFAULT_STUDIO_CONFIG.model
      };
    }
  } catch (_) {}
  return DEFAULT_STUDIO_CONFIG;
}

export function saveStudioConfig(config: StudioConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_STUDIO_CONFIG, JSON.stringify(config));
  } catch (_) {}
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

export function saveBrainDirectives(directives: BrainMemoryDirective[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_STORE_BRAIN_DIRECTIVES, JSON.stringify(directives));
  } catch (_) {}
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_CHAT_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am your AI Review Studio Brain. I retain all custom directives in memory and build 100% human-realistic reviews based on your local app data. Tell me what topic, tone, or specific details you want to focus on, or select apps and ask me to generate reviews for Today and Yesterday!',
      timestamp: new Date().toISOString()
    }
  ];
}

export function saveChatHistory(history: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_CHAT_HISTORY, JSON.stringify(history.slice(-30))); // Keep last 30 messages
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
