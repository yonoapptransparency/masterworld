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
  dateTag: string;
  timestamp: string; // ISO date string
  status: 'staged' | 'approved' | 'published';
}

export type DateDistributionMode = 
  | 'today_and_yesterday' // 50% Today, 50% Yesterday
  | 'today_only'          // 100% Today
  | 'yesterday_only'      // 100% Yesterday
  | 'today_morning'       // Today morning / daytime
  | 'today_evening'       // Today evening / night
  | 'last_2_days'         // Strict past 48 hours
  | 'last_3_days'         // Spread evenly across today, yesterday, and 2 days ago
  | 'last_5_days'         // Spread across last 5 days
  | 'last_7_days'         // Spread naturally across past week
  | 'last_15_days'        // Spread across last 2 weeks (no future)
  | 'last_30_days';       // Spread across last month (no future)

export type RatingMixMode = 
  | 'natural'             // ~80% 5-star, 15% 4-star, 5% 3-star
  | 'all_5_star'          // 100% 5-star
  | 'high_praise'         // 90% 5-star, 10% 4-star
  | 'balanced_critical';  // 60% 5-star, 30% 4-star, 10% 3-star

export type LanguageToneMode = 
  | 'all_rounder_standard'  // Standard, normal everyday users across all categories
  | 'happy_with_emojis'     // Happy enthusiastic customers with natural emojis (😊, 👍, ⭐)
  | 'super_excited_emojis'  // Highly enthusiastic fans with energetic emojis (🔥, 🚀, ❤️, 💯)
  | 'hinglish_natural'      // Casual, colloquial Indian mobile tone
  | 'natural_english'       // Casual, everyday conversational English
  | 'short_punchy'          // Ultra-short punchy feedback (1-2 sentences)
  | 'detailed_feedback'    // Thoughtful 2-3 sentence user experience feedback
  | 'honest_balanced'       // Balanced constructive feedback praising strengths
  | 'feature_focused'       // Technical praise on UI smoothness and battery life
  | 'beginner_friendly'     // Simple friendly praise for first-time installers
  | 'daily_regular_user';   // Habitual daily user perspective praising long-term stability

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
