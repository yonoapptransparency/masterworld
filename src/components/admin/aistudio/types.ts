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
  languageStyle?: 'proper_english' | 'hinglish' | 'natural_mix';
  singleCount: number;
  customPrompt?: string;
  updatedAt?: string;
}

export type AutobotStage = 'idle' | 'ingesting' | 'reasoning' | 'synthesizing' | 'sanitizing' | 'staged' | 'published';

export interface AutobotLog {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'success' | 'reasoning' | 'safety' | 'warn';
}

export interface AutobotSessionStats {
  totalGenerated: number;
  autoPublished: number;
  staged: number;
  cyclesCompleted: number;
  lastModel: string;
  lastLatencyMs: number;
}

export type Brain2AutobotStage = 'idle' | 'resolving_target' | 'web_searching' | 'extracting_reviews' | 'rating_aligning' | 'sanitizing' | 'staged' | 'published';

export interface Brain2AutobotLog {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'success' | 'reasoning' | 'safety' | 'warn';
}

export interface Brain2AutobotSessionStats {
  totalGenerated: number;
  autoPublished: number;
  staged: number;
  cyclesCompleted: number;
  queriesRun: number;
  lastModel: string;
  lastLatencyMs: number;
}

export interface GenerationTelemetry {
  mode: 'local' | 'research';
  modelUsed?: string;
  searchQueries?: string[];
  groundedSources?: Array<{ title: string; url: string; snippet?: string }>;
  searchStatus?: string;
  dossierHighlights?: string[];
}

export const STORAGE_KEY_PROFILES = 'rummydex_admin_ai_app_profiles';
export const STORAGE_KEY_DEFAULT_COUNT = 'rummydex_admin_ai_review_count';

export function loadAllAppProfiles(): Record<string, AppReviewProfile> {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAllAppProfiles(profiles: Record<string, AppReviewProfile>) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.warn("Failed to persist AI review profiles to localStorage", e);
  }
}

export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
