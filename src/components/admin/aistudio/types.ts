export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedAction?: 'generate' | 'adjust_prompt' | 'save_memory';
}

export interface BrainMemoryDirective {
  id: string;
  rule: string;
  category: 'tone' | 'topic' | 'date' | 'rating' | 'persona' | 'general';
  createdAt: string;
  active: boolean;
}

export interface StagedReview {
  id: string;
  appId: string;
  appName: string;
  appSlug?: string;
  appIcon?: string;
  appCategory?: string;
  userName: string;
  rating: number;
  reviewText: string;
  dateTag: 'Today' | 'Yesterday' | '2 Days Ago' | '3 Days Ago' | 'Custom';
  timestamp: string; // ISO date string
  status: 'staged' | 'approved' | 'published';
}

export type DateDistributionMode = 
  | 'today_and_yesterday' // 50% Today, 50% Yesterday
  | 'today_only'          // 100% Today
  | 'yesterday_only'      // 100% Yesterday
  | 'last_3_days'         // Spread evenly across today, yesterday, and 2 days ago
  | 'last_7_days';        // Spread naturally across past week

export type RatingMixMode = 
  | 'natural'             // ~80% 5-star, 15% 4-star, 5% 3-star
  | 'all_5_star'          // 100% 5-star
  | 'high_praise'         // 90% 5-star, 10% 4-star
  | 'balanced_critical';  // 60% 5-star, 30% 4-star, 10% 3-star

export type LanguageToneMode = 
  | 'hinglish_natural'    // Authentic Indian gaming slang ("bohot smooth withdrawal", "mast app hai")
  | 'natural_english'     // Casual, colloquial English ("withdrawal was fast", "good app")
  | 'mixed_pro'           // Mix of detailed and short punchy reviews
  | 'short_punchy';       // Ultra-short authentic feedback (1-2 sentences)

export type PublishMode = 
  | 'wait_approve'  // Reviews staged for manual admin inspection, edit & 1-click publish
  | 'auto_direct';  // Reviews automatically published directly to Live Community upon generation

export interface StudioConfig {
  apiKey: string;
  model: string;
  reviewsPerApp: number;
  dateMode: DateDistributionMode;
  ratingMix: RatingMixMode;
  languageTone: LanguageToneMode;
  customTopic: string;
  publishMode: PublishMode;
}
