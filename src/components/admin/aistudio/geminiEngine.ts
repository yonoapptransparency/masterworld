import {
  BrainMemoryDirective,
  StudioConfig,
  StagedReview,
  ChatMessage,
  RatingMixMode,
  PlatformCommentStyle
} from './types';
import { generateRealisticPastDates } from './dateEngine';

const REALISTIC_USER_NAMES = [
  'Rahul Sharma', 'Amit Patel', 'Priya Verma', 'Vikas Yadav', 'Suresh Raina',
  'Anjali Gupta', 'Deepak Kumar', 'Neha Singh', 'Rohan Mehta', 'Karan Malhotra',
  'Sneha Reddy', 'Arjun Nair', 'Pooja Joshi', 'Vikram Rathore', 'Manish Tiwari',
  'Swati Mishra', 'Abhishek Chauhan', 'Kavita Iyer', 'Sanjay Dutta', 'Gaurav Saxena',
  'Ritu Choudhary', 'Nitin Gadkari', 'Megha Kapoor', 'Tarun Gill', 'Pradeep Kashyap',
  'Harshvardhan', 'Siddharth Roy', 'Divya Bharti', 'Mayank Agarwal', 'naveen_k',
  'sachin_07', 'rohit_sharma99', 'ankit_gamer', 'rajesh_k', 'vishal_v',
  'akash_ydv', 'prashant_m', 'lokesh_b', 'tushar_p', 'sumit_tiwari',
  'Kartik Aryan', 'Shreya Ghoshal', 'Aakash Chopra', 'Pंकज त्रिपाठी', 'Rameshwar',
  'Monika B.', 'Chetan Bhagat', 'Yashraj M.', 'Ashwin R.', 'Devendra P.'
];

function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export interface RichAppProfile {
  name: string;
  category: string;
  developer: string;
  version: string;
  size: string;
  downloads: string;
  packageName: string;
  whatItProvidesSummary: string;
  fullDescription: string;
  featuresList: string;
  whatsNewText: string;
  faqsText: string;
  safetyAndTrustNotes: string;
  customHighlights: string;
  relatedVideosInfo: string;
  catalogRating: number;
}

/**
 * Extracts the complete, real website profile for an app (and any related videos)
 * so the AI understands 100% of what the app provides.
 */
export function extractAdminAppProfile(app: any, videosList: any[] = []): RichAppProfile {
  const name = app.name || app.title || 'App';
  const category = app.category || 'Entertainment & Gaming';
  const developer = app.developer || app.author || app.publisher || 'Official Publisher';
  const version = app.version || 'Latest';
  const size = app.size || 'Lightweight';
  const downloads = app.downloads || '10K+';
  const packageName = app.package_name || '';

  const rawDesc = stripHtml(app.description_html || app.description || '');
  const seoDesc = stripHtml(app.seo_description || app.short_description || '');
  const fullDescription = [seoDesc, rawDesc].filter(Boolean).join(' — ').slice(0, 1800);

  let featuresList = '';
  if (app.features_html) {
    featuresList = stripHtml(app.features_html).slice(0, 800);
  } else if (Array.isArray(app.features) && app.features.length > 0) {
    featuresList = app.features.map((f: any) => stripHtml(String(f))).join('; ').slice(0, 800);
  }

  const whatsNewText = stripHtml(app.whats_new_html || app.whats_new || '').slice(0, 500);

  let faqsText = '';
  if (Array.isArray(app.faqs) && app.faqs.length > 0) {
    faqsText = app.faqs
      .slice(0, 8)
      .map((f: any) => `Q: ${stripHtml(f.question || f.q || '')} -> A: ${stripHtml(f.answer || f.a || '')}`)
      .join(' | ')
      .slice(0, 1000);
  }

  const safetyParts: string[] = [];
  if (app.security_Notice || app.security_notice) {
    safetyParts.push(`Security Info: ${stripHtml(app.security_Notice || app.security_notice)}`);
  }
  if (app.idea_Notice || app.idea_notice) {
    safetyParts.push(`Helpful Tip: ${stripHtml(app.idea_Notice || app.idea_notice)}`);
  }
  if (app.warning_Notice || app.warning_notice) {
    safetyParts.push(`User Advisory: ${stripHtml(app.warning_Notice || app.warning_notice)}`);
  }
  const safetyAndTrustNotes = safetyParts.join(' | ').slice(0, 600);

  let customHighlights = '';
  if (Array.isArray(app.custom_boxes) && app.custom_boxes.length > 0) {
    customHighlights = app.custom_boxes
      .map((b: any) => `${b.title || ''}: ${stripHtml(b.content || b.text || '')}`)
      .join(' | ')
      .slice(0, 600);
  }

  // Match any related videos from the website video gallery
  const appNameLower = name.toLowerCase();
  const appSlugLower = String(app.slug || '').toLowerCase();
  const matchingVideos = (videosList || []).filter((v: any) => {
    const vTitle = String(v.title || '').toLowerCase();
    const vDesc = String(v.description || v.seo_description || '').toLowerCase();
    const vAppId = String(v.app_id || v.appId || v.related_app_id || '').toLowerCase();
    return (
      (vAppId && (vAppId === String(app.id).toLowerCase() || vAppId === appSlugLower)) ||
      (appNameLower.length > 3 && (vTitle.includes(appNameLower) || vDesc.includes(appNameLower)))
    );
  });

  const relatedVideosInfo = matchingVideos.length > 0
    ? matchingVideos
        .slice(0, 4)
        .map((v: any) => `Video "${v.title}": ${stripHtml(v.description || v.seo_description || 'Gameplay & tutorial walkthrough')}`)
        .join(' | ')
    : app.youtube_video_url || app.video_url
    ? `App includes an official embedded gameplay/walkthrough video (${app.youtube_video_url || app.video_url}).`
    : '';

  const whatItProvidesSummary = [
    `${name} is a ${category} application by ${developer} (v${version}, ${size}).`,
    seoDesc ? `Core Offering: ${seoDesc}` : '',
    featuresList ? `Key Features Provided: ${featuresList}` : ''
  ]
    .filter(Boolean)
    .join(' ');

  const parsedRating = parseFloat(String(app.rating || '4.5'));
  const catalogRating = !isNaN(parsedRating) && parsedRating >= 1.0 && parsedRating <= 5.0 ? parsedRating : 4.5;

  return {
    name,
    category,
    developer,
    version,
    size,
    downloads,
    packageName,
    whatItProvidesSummary,
    fullDescription: fullDescription || `${name} provides a complete ${category} experience with intuitive controls and reliable daily access.`,
    featuresList: featuresList || `Core ${category} modes, smooth navigation, quick setup, regular content updates`,
    whatsNewText,
    faqsText,
    safetyAndTrustNotes,
    customHighlights,
    relatedVideosInfo,
    catalogRating
  };
}

function cleanUserReviewText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates an array of star ratings for `count` reviews that accurately
 * reflects the chosen RatingMixMode or the app's real catalog rating.
 */
export function buildTargetRatingsArray(
  count: number,
  mode: RatingMixMode,
  appCatalogRating: number,
  customDirective?: string
): number[] {
  const directiveLower = (customDirective || '').toLowerCase();

  if (directiveLower.includes('only 5 star') || directiveLower.includes('all 5 star') || directiveLower.includes('100% 5 star')) {
    return Array(count).fill(5);
  }
  if (directiveLower.includes('only 4 star') || directiveLower.includes('all 4 star')) {
    return Array(count).fill(4);
  }
  if (directiveLower.includes('only 3 star') || directiveLower.includes('all 3 star')) {
    return Array(count).fill(3);
  }
  if (directiveLower.includes('only 2 star') || directiveLower.includes('all 2 star')) {
    return Array(count).fill(2);
  }
  if (directiveLower.includes('only 1 star') || directiveLower.includes('all 1 star')) {
    return Array(count).fill(1);
  }

  switch (mode) {
    case 'all_5_star':
      return Array(count).fill(5);
    case 'all_4_star':
      return Array(count).fill(4);
    case 'all_3_star':
      return Array(count).fill(3);
    case 'all_2_star':
      return Array(count).fill(2);
    case 'all_1_star':
      return Array(count).fill(1);
    case 'critical_bugs':
      return Array.from({ length: count }, (_, i) => (i % 2 === 0 ? 2 : 1));
    case 'organic_full_mix': {
      const pool = [5, 4, 5, 3, 2, 1, 5, 4, 3, 5];
      return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
    }
    case 'balanced_critical': {
      const pool = [5, 4, 3, 5, 2, 4, 5, 1, 4, 5];
      return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
    }
    case 'high_praise':
      return Array.from({ length: count }, (_, i) => (i % 5 === 4 ? 4 : 5));
    case 'natural':
      return Array.from({ length: count }, (_, i) => {
        if (i % 6 === 5) return 3;
        if (i % 3 === 2) return 4;
        return 5;
      });
    case 'auto_app_rating':
    default: {
      const target = Math.max(1.0, Math.min(5.0, appCatalogRating));
      const ratings: number[] = [];
      let currentSum = 0;

      for (let i = 0; i < count; i++) {
        const neededAvg = (target * (i + 1)) - currentSum;
        let star = Math.round(neededAvg);
        if (star > 5) star = 5;
        if (star < 1) star = 1;

        if (count >= 3 && i === count - 1 && target < 4.7 && target >= 3.8 && !ratings.includes(4)) {
          star = 4;
        }
        ratings.push(star);
        currentSum += star;
      }
      return ratings;
    }
  }
}

export function generateRealisticHelpfulLikes(mode: string = 'subtle_1_2', index: number = 0): number {
  switch (mode) {
    case 'zero_none':
      return 0;
    case 'natural_0_3': {
      const pool = [0, 1, 2, 1, 3, 0, 2, 1];
      return pool[(index + Math.floor(Math.random() * pool.length)) % pool.length];
    }
    case 'modest_1_4': {
      const pool = [1, 2, 3, 1, 4, 2, 1, 2];
      return pool[(index + Math.floor(Math.random() * pool.length)) % pool.length];
    }
    case 'subtle_1_2':
    default: {
      const pool = [1, 2, 1, 0, 2, 1, 1, 2];
      return pool[(index + Math.floor(Math.random() * pool.length)) % pool.length];
    }
  }
}

function getPlatformPsychologyGuide(style: PlatformCommentStyle = 'smart_multi_platform'): string {
  switch (style) {
    case 'play_store_authentic':
      return `PLATFORM COMMENT STYLE — GOOGLE PLAY STORE REAL USERS:
- Write exactly how real users comment on the Google Play Store.
- People talk about: what specific features/modes they enjoy inside the app, how easy it was to get started, what changed in the recent update, daily login/usage habits, or a practical feature request (e.g., "gave 4 stars because I want more tournament tables").
- Vary length naturally: some users write a crisp 8-14 word reaction, while others write 2-3 sentences explaining why they switched to this app from others.`;

    case 'amazon_flipkart_value':
      return `PLATFORM COMMENT STYLE — AMAZON & FLIPKART VALUE / "WHAT IT PROVIDES" REVIEWS:
- Write with the practical mindset of Indian buyers on Amazon and Flipkart reviewing a product/app based on "What does this actually provide me? Is it worth my time? Does it deliver what is promised on the page?"
- People talk about: expectation vs reality ("Installed after reading the details here, and it actually provides all the modes mentioned"), value for time ("Total paisa vasool entertainment for evening break"), reliability & trust ("Genuine platform, no fake promises"), customer support responsiveness, and recommending it to family or friends.`;

    case 'youtube_video_social':
      return `PLATFORM COMMENT STYLE — YOUTUBE / VIDEO WALKTHROUGH & SOCIAL COMMENTS:
- Write how real viewers and players comment after watching an app gameplay video, tutorial, or walkthrough.
- People talk about: how watching the preview/video helped them understand the rules or features, reacting to specific highlights ("Saw the gameplay guide and tried the classic mode myself, works super smoothly"), sharing a quick tip for new users, or casual enthusiastic reactions.`;

    case 'community_player_forum':
      return `PLATFORM COMMENT STYLE — PLAYER COMMUNITY & WORD-OF-MOUTH:
- Write like experienced everyday players sharing honest word-of-mouth feedback with other community members.
- People talk about: playing with friends or cousins on weekends, which mode or table inside the app is the most fun, matchmaking fairness, beginners vs regulars, and practical tips for newcomers.`;

    case 'smart_multi_platform':
    default:
      return `PLATFORM COMMENT STYLE — SMART MULTI-PLATFORM HUMAN MIX (Play Store + Amazon/Flipkart Value + Video/Social + Player Community):
- Real humans do NOT all talk about "UI performance" or "battery drain". Different people care about a million different things!
- Across the reviews you generate, assign each review a COMPLETELY DIFFERENT human perspective:
  1. [Value & "What the App Provides" — Amazon/Flipkart mindset]: Talk about what the app actually offers (its specific modes, rewards, tools, or entertainment value), expectation vs reality, and whether it delivers what is described on the page.
  2. [Real Daily Experience — Play Store mindset]: Talk about using the app during commute/evenings, onboarding simplicity, specific features from the app's feature list, or how the latest version feels.
  3. [Social / Video / Word-of-Mouth mindset]: Talk about trying it after a friend's recommendation or after checking the video/guide, playing with friends/family, or answering a common question from the app's FAQs from a real user's point of view.
  4. [Constructive / Honest Buyer mindset]: If 4★ or 3★, praise what the app provides while mentioning one realistic, grounded suggestion or question based on the app's real category.`;
  }
}

function getToneInstruction(tone: StudioConfig['languageTone']): string {
  switch (tone) {
    case 'all_rounder_standard':
      return 'Write like normal everyday people in natural Indian English (with occasional organic Indian words only if natural). Balanced, genuine, zero exaggeration.';
    case 'happy_with_emojis':
      return 'Write as happy, satisfied users who naturally include 1 or 2 warm emojis (like 😊, 👍, ⭐, 🙌) while talking about what the app provides.';
    case 'super_excited_emojis':
      return 'Write as enthusiastic fans who love what the app provides, using energetic emojis (🔥, 🚀, ❤️, 💯) naturally.';
    case 'hinglish_natural':
      return 'Write in natural, conversational Indian Hinglish (e.g., "Bhai ye app sach me kaam ka hai...", "Kaafi sahi features provide karta hai", mixed with English). Do NOT repeat the same Hinglish phrase twice.';
    case 'natural_english':
      return 'Write in clean, casual everyday English. Sound like a real person typing on their phone, not an essay or corporate advertisement.';
    case 'short_punchy':
      return 'Keep each comment short and punchy (1 to 2 crisp sentences, 8 to 20 words) like quick mobile store ratings.';
    case 'detailed_feedback':
      return 'Write thoughtful 2 to 3 sentence reviews (25 to 50 words) explaining specifically what the app provides and why it is useful.';
    case 'honest_balanced':
      return 'Write balanced, believable reviews that highlight what the app does best alongside a grounded real-user observation.';
    case 'feature_focused':
      return 'Focus specifically on the concrete features, modes, tools, and FAQs listed in the app profile.';
    case 'beginner_friendly':
      return 'Write from the perspective of a first-time user who just installed the app and found the rules/setup easy to understand.';
    case 'daily_regular_user':
      return 'Write from the perspective of a regular user who has been using this app for weeks and appreciates its consistency.';
    default:
      return 'Write like a genuine, everyday user.';
  }
}

/**
 * Detects explicit configuration commands from chat without accidentally
 * hijacking settings when normal words appear in conversation.
 */
export function detectConfigUpdatesFromChat(text: string): Partial<StudioConfig> {
  const lower = text.toLowerCase().trim();
  const updates: Partial<StudioConfig> = {};

  // Explicit count commands: e.g. "generate 5 reviews per app", "set 10 comments each"
  const countMatch = lower.match(/(?:generate|make|create|set|write|give)\s+(\d{1,3})\s+(?:reviews?|comments?)/i) ||
                     lower.match(/\b(\d{1,3})\s+(?:reviews?|comments?)\s+(?:per|for each|each)\s+app/i);
  if (countMatch) {
    const num = parseInt(countMatch[1], 10);
    if (num >= 1 && num <= 500) {
      updates.reviewsPerApp = num;
    }
  }

  // Explicit platform style commands
  if (lower.includes('amazon') || lower.includes('flipkart')) {
    updates.platformStyle = 'amazon_flipkart_value';
  } else if (lower.includes('play store style') || lower.includes('playstore style')) {
    updates.platformStyle = 'play_store_authentic';
  } else if (lower.includes('youtube style') || lower.includes('video style') || lower.includes('video comment')) {
    updates.platformStyle = 'youtube_video_social';
  } else if (lower.includes('forum style') || lower.includes('community style')) {
    updates.platformStyle = 'community_player_forum';
  } else if (lower.includes('multi platform') || lower.includes('all platform')) {
    updates.platformStyle = 'smart_multi_platform';
  }

  // Explicit star rating commands
  if (lower.includes('match catalog') || lower.includes('auto rating') || lower.includes('match app rating')) {
    updates.ratingMix = 'auto_app_rating';
  } else if (lower.includes('all 5 star') || lower.includes('only 5 star') || lower.includes('100% 5 star')) {
    updates.ratingMix = 'all_5_star';
  } else if (lower.includes('all 4 star') || lower.includes('only 4 star')) {
    updates.ratingMix = 'all_4_star';
  } else if (lower.includes('all 3 star') || lower.includes('only 3 star')) {
    updates.ratingMix = 'all_3_star';
  } else if (lower.includes('all 2 star') || lower.includes('only 2 star')) {
    updates.ratingMix = 'all_2_star';
  } else if (lower.includes('all 1 star') || lower.includes('only 1 star')) {
    updates.ratingMix = 'all_1_star';
  } else if (lower.includes('1 to 5 star') || lower.includes('1-5 star') || lower.includes('organic mix')) {
    updates.ratingMix = 'organic_full_mix';
  }

  // Explicit likes commands
  if (lower.includes('no likes') || lower.includes('zero likes') || lower.includes('0 likes')) {
    updates.likesMode = 'zero_none';
  } else if (lower.includes('subtle likes') || lower.includes('1-2 likes')) {
    updates.likesMode = 'subtle_1_2';
  }

  // Explicit tone commands
  if (lower.includes('hinglish')) {
    updates.languageTone = 'hinglish_natural';
  } else if (lower.includes('super excited')) {
    updates.languageTone = 'super_excited_emojis';
  } else if (lower.includes('with emoji') || lower.includes('use emoji')) {
    updates.languageTone = 'happy_with_emojis';
  }

  // Explicit date commands
  if (lower.includes('today only') || lower.includes('100% today')) {
    updates.dateMode = 'today_only';
  } else if (lower.includes('yesterday only')) {
    updates.dateMode = 'yesterday_only';
  } else if (lower.includes('last 7 days') || lower.includes('past week')) {
    updates.dateMode = 'last_7_days';
  } else if (lower.includes('last 30 days') || lower.includes('past month')) {
    updates.dateMode = 'last_30_days';
  }

  return updates;
}

/**
 * Builds a strictly valid, alternating user/model `contents` array for Gemini API.
 * Fixes the HTTP 400 INVALID_ARGUMENT bug where consecutive roles or leading model
 * messages caused the API to fail and fall back to a canned string.
 */
function buildValidGeminiContents(chatHistory: ChatMessage[], currentUserMessage: string): any[] {
  // Filter out automated progress logs and static welcome placeholder
  const cleanMessages = (chatHistory || []).filter(m => {
    if (!m || !m.text || !m.text.trim()) return false;
    if (m.id === 'welcome') return false;
    const t = m.text.trim();
    if (t.startsWith('⏳ [') || t.startsWith('✅ [') || t.startsWith('⚠️ [') || t.startsWith('⏹ ')) {
      return false;
    }
    return true;
  });

  // Avoid duplicating the currentUserMessage if it was already appended to chatHistory
  const lastMsg = cleanMessages[cleanMessages.length - 1];
  const historyWithoutCurrent =
    lastMsg && lastMsg.sender === 'user' && lastMsg.text.trim() === currentUserMessage.trim()
      ? cleanMessages.slice(0, -1)
      : cleanMessages;

  const recentSlice = historyWithoutCurrent.slice(-14);

  const turns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of recentSlice) {
    const role: 'user' | 'model' = msg.sender === 'user' ? 'user' : 'model';
    const text = msg.text.trim();
    if (!text) continue;

    // Gemini requires the first turn in `contents` to be `user`
    if (turns.length === 0 && role === 'model') {
      continue;
    }

    const prevTurn = turns[turns.length - 1];
    if (prevTurn && prevTurn.role === role) {
      // Merge consecutive same-role messages so turns strictly alternate
      prevTurn.parts[0].text += `\n\n${text}`;
    } else {
      turns.push({ role, parts: [{ text }] });
    }
  }

  // Ensure the final turn is the current user message
  const lastTurn = turns[turns.length - 1];
  if (lastTurn && lastTurn.role === 'user') {
    lastTurn.parts[0].text += `\n\n${currentUserMessage.trim()}`;
  } else {
    turns.push({
      role: 'user',
      parts: [{ text: currentUserMessage.trim() }]
    });
  }

  return turns;
}

/**
 * Summarizes the recent conversation between Admin and AI so that review generation
 * remembers every detail discussed in the chat session (including video/app instructions).
 */
export function buildConversationMemorySummary(chatHistory: ChatMessage[], activeDirective?: string): string {
  const relevantTurns = (chatHistory || [])
    .filter(m => {
      if (!m || !m.text || m.id === 'welcome') return false;
      const t = m.text.trim();
      if (t.startsWith('⏳ [') || t.startsWith('✅ [') || t.startsWith('⚠️ [') || t.startsWith('⏹ ')) return false;
      const lower = t.toLowerCase();
      if (lower === 'start' || lower === 'start generating' || lower === 'generate now') return false;
      return true;
    })
    .slice(-10);

  const lines: string[] = [];
  if (activeDirective && activeDirective.trim()) {
    lines.push(`Primary Active Focus: "${activeDirective.trim()}"`);
  }

  if (relevantTurns.length > 0) {
    lines.push('Recent Admin-AI Conversation History (MUST REMEMBER & FOLLOW):');
    for (const m of relevantTurns) {
      const speaker = m.sender === 'user' ? 'ADMIN INSTRUCTION' : 'AI AGREEMENT';
      lines.push(`- ${speaker}: ${m.text.trim().slice(0, 350)}`);
    }
  }

  return lines.join('\n');
}

export interface ChatResponseResult {
  replyText: string;
  modelUsed: string;
  latencyMs?: number;
}

// Client-side model discovery cache (per API key) so browser fallback never wastes round-trips on 404 models
const clientModelCache = new Map<string, { models: Set<string>; fetchedAt: number }>();
const CLIENT_CACHE_TTL_MS = 15 * 60 * 1000;

const CLIENT_MODEL_ALIAS_MAP: Record<string, string[]> = {
  'gemini-3.8-flash': ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'],
  'gemini-3.1-flash-lite': ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'],
  'gemini-2.0-flash': ['gemini-2.5-flash', 'gemini-flash-latest'],
  'gemini-1.5-flash': ['gemini-2.5-flash', 'gemini-flash-latest']
};

async function getClientAvailableModels(apiKey: string): Promise<Set<string> | null> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return null;
  const cached = clientModelCache.get(cleanKey);
  if (cached && Date.now() - cached.fetchedAt < CLIENT_CACHE_TTL_MS) {
    return cached.models;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${encodeURIComponent(cleanKey)}`,
      { method: 'GET', signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const models = new Set<string>();
    if (Array.isArray(data?.models)) {
      for (const m of data.models) {
        const methods: string[] = m.supportedGenerationMethods || [];
        if (methods.includes('generateContent')) {
          models.add(String(m.name || '').replace(/^models\//, ''));
        }
      }
    }
    if (models.size > 0) {
      clientModelCache.set(cleanKey, { models, fetchedAt: Date.now() });
      return models;
    }
  } catch (_) {
    clearTimeout(timer);
  }
  return null;
}

function buildClientCandidateModels(requestedModel: string, discovered: Set<string> | null): string[] {
  const req = (requestedModel || 'gemini-2.5-flash').trim().replace(/^models\//, '');
  const rawOrder = [
    ...(CLIENT_MODEL_ALIAS_MAP[req] || [req]),
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite'
  ];
  const unique = Array.from(new Set(rawOrder.filter(Boolean)));
  if (discovered && discovered.size > 0) {
    const valid = unique.filter(m => discovered.has(m));
    if (valid.length > 0) return valid.slice(0, 2);
  }
  return unique.slice(0, 2);
}

/**
 * Direct ultra-fast client-side Gemini caller with `thinkingBudget: 0` (disabling 15-45s hidden thinking delay)
 * and strict AbortController timeout.
 */
async function callClientGeminiDirect(params: {
  apiKey: string;
  requestedModel: string;
  systemInstruction?: string;
  contents: any[];
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  timeoutMs?: number;
}): Promise<{ text: string; modelUsed: string; latencyMs: number }> {
  const startMs = performance.now();
  const discovered = await getClientAvailableModels(params.apiKey);
  const candidates = buildClientCandidateModels(params.requestedModel, discovered);
  let lastError = 'Gemini API request failed.';

  for (const modelId of candidates) {
    const controller = new AbortController();
    const timeoutMs = params.timeoutMs || 10500;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const generationConfig: Record<string, any> = {
        temperature: typeof params.temperature === 'number' ? params.temperature : 0.85,
        maxOutputTokens: params.maxOutputTokens || 1536
      };

      if (params.responseMimeType) {
        generationConfig.responseMimeType = params.responseMimeType;
      }

      // Disable hidden thinking tokens on 2.5/flash models for sub-second response times
      const mLower = modelId.toLowerCase();
      if ((mLower.includes('2.5-flash') || mLower.includes('flash-latest')) && !mLower.includes('pro')) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      const payload: Record<string, any> = {
        contents: params.contents,
        generationConfig
      };

      if (params.systemInstruction) {
        payload.systemInstruction = { parts: [{ text: params.systemInstruction }] };
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(params.apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': params.apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP ${response.status}`;
        lastError = msg;
        if (msg.toLowerCase().includes('api key not valid') || msg.toLowerCase().includes('api_key_invalid')) {
          throw new Error('Invalid Gemini API Key. Please check your key in the Key modal.');
        }
        continue;
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const replyText = parts.map((p: any) => p.text || '').join('').trim();
      if (replyText) {
        return {
          text: replyText,
          modelUsed: modelId,
          latencyMs: Math.round(performance.now() - startMs)
        };
      }
    } catch (err: any) {
      clearTimeout(timer);
      if (err?.message?.includes('Invalid Gemini API Key')) {
        throw err;
      }
      lastError = err?.name === 'AbortError' ? `Model ${modelId} timed out` : (err?.message || lastError);
    }
  }

  throw new Error(lastError);
}

/**
 * Sends a conversational strategy message to Gemini with full awareness of
 * selected apps, related videos, persistent directives, and multi-turn history.
 */
export async function sendChatMessageToGemini(
  userMessage: string,
  chatHistory: ChatMessage[],
  directives: BrainMemoryDirective[],
  config: StudioConfig,
  contextData?: {
    selectedApps?: any[];
    videosList?: any[];
  }
): Promise<ChatResponseResult> {
  const apiKey = (config.apiKey || '').trim();
  const activeRules = directives
    .filter(d => d.active)
    .map((d, i) => `${i + 1}. [${d.category.toUpperCase()}] ${d.rule}`)
    .join('\n');

  const selectedApps = contextData?.selectedApps || [];
  const videosList = contextData?.videosList || [];

  const selectedAppsBrief = selectedApps.length > 0
    ? selectedApps
        .slice(0, 12)
        .map(a => {
          const prof = extractAdminAppProfile(a, videosList);
          return `• ${prof.name} (${prof.category}, ${prof.catalogRating}★): ${prof.whatItProvidesSummary.slice(0, 220)}${prof.relatedVideosInfo ? ` | Video: ${prof.relatedVideosInfo.slice(0, 140)}` : ''}`;
        })
        .join('\n')
    : 'No specific apps selected yet.';

  const videosBrief = videosList.length > 0
    ? videosList
        .slice(0, 8)
        .map((v: any) => `• Video "${v.title}": ${stripHtml(v.description || v.seo_description || '').slice(0, 120)}`)
        .join('\n')
    : '';

  const systemInstruction = `You are the Master AI Review Studio Brain for RummyDex Admin.
You are an expert in human consumer psychology across Google Play Store, Amazon, Flipkart, YouTube video comments, and gaming communities.

YOUR CORE RESPONSIBILITIES:
1. Remember everything the Admin tells you in this conversation. Never forget previous turns or instructions.
2. When the Admin discusses how people comment on Amazon, Flipkart, Play Store, or YouTube videos, or specifies what angle/features/value to highlight, actively analyze their instruction and confirm exactly how you will craft the reviews.
3. If the Admin asks you to draft or preview sample comments right here in chat, write 2-3 ultra-realistic sample comments right away so they can see the quality.
4. Keep your response concise, sharp, and directly responsive to what the Admin just said. NEVER give a generic canned reply.

CURRENT STUDIO CONFIGURATION:
- Selected Model: ${config.model || 'gemini-2.5-flash'}
- Platform Comment Style: ${config.platformStyle || 'smart_multi_platform'}
- Reviews Per App: ${config.reviewsPerApp}
- Star Rating Strategy: ${config.ratingMix}
- Tone & Persona: ${config.languageTone}
- Date Distribution: ${config.dateMode}
- Active Session Instruction: "${config.activeSessionDirective || config.customTopic}"

PERSISTENT BRAIN DIRECTIVES:
${activeRules || 'Write authentic, non-repetitive human reviews grounded in each app’s real features and what it provides.'}

CURRENTLY SELECTED TARGET APPS (${selectedApps.length}):
${selectedAppsBrief}
${videosBrief ? `\nPLATFORM VIDEOS / TUTORIALS CONTEXT:\n${videosBrief}` : ''}`;

  const contents = buildValidGeminiContents(chatHistory, userMessage);
  const modelToUse = (config.model || 'gemini-2.5-flash').trim();

  // 1. Primary: Server-side execution via /api/v1/admin/community/aistudio-gemini with strict 11s timeout
  const srvController = new AbortController();
  const srvTimer = setTimeout(() => srvController.abort(), 11000);
  try {
    const srvRes = await fetch('/api/v1/admin/community/aistudio-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        apiKey,
        model: modelToUse,
        systemInstruction,
        contents,
        temperature: 0.85
      }),
      signal: srvController.signal
    });
    clearTimeout(srvTimer);

    const srvData = await srvRes.json().catch(() => ({}));
    if (srvRes.ok && srvData.success && srvData.text) {
      return {
        replyText: srvData.text,
        modelUsed: srvData.modelUsed || modelToUse,
        latencyMs: srvData.latencyMs
      };
    }

    if (!apiKey && srvData.error) {
      throw new Error(srvData.error);
    }
  } catch (srvErr: any) {
    clearTimeout(srvTimer);
    if (!apiKey) {
      throw new Error(srvErr?.message || 'Gemini API key is not configured. Click the Key button to add your key.');
    }
  }

  // 2. Fallback: Direct low-latency client-side call if apiKey is available in browser
  if (!apiKey) {
    throw new Error('Gemini API key is required. Click the Key button at the top to configure your Google AI Studio API key.');
  }

  const directResult = await callClientGeminiDirect({
    apiKey,
    requestedModel: modelToUse,
    systemInstruction,
    contents,
    temperature: 0.85,
    maxOutputTokens: 1024,
    timeoutMs: 10500
  });

  return {
    replyText: directResult.text,
    modelUsed: directResult.modelUsed,
    latencyMs: directResult.latencyMs
  };
}

/**
 * Generates ultra-authentic, platform-diverse human reviews for a specific app,
 * grounded in the app's complete website dossier + full chat conversation memory.
 */
export async function generateReviewsForAppWithGemini(
  app: any,
  count: number,
  directives: BrainMemoryDirective[],
  config: StudioConfig,
  customInstruction?: string,
  chatHistory: ChatMessage[] = [],
  videosList: any[] = []
): Promise<StagedReview[]> {
  const dates = generateRealisticPastDates(count, config.dateMode);
  const apiKey = (config.apiKey || '').trim();
  const profile = extractAdminAppProfile(app, videosList);
  const targetRatings = buildTargetRatingsArray(count, config.ratingMix, profile.catalogRating, customInstruction);
  const conversationMemory = buildConversationMemorySummary(chatHistory, customInstruction || config.activeSessionDirective);

  // Build rich fallback pool grounded in the actual app profile (only used if API is completely unreachable)
  const buildProfileGroundedFallback = (): StagedReview[] => {
    const shuffledNames = [...REALISTIC_USER_NAMES].sort(() => 0.5 - Math.random());
    const featureSnippets = profile.featuresList
      .split(/[;,.|]/)
      .map(s => s.trim())
      .filter(s => s.length > 4);

    const f1 = featureSnippets[0] || `the ${profile.category} modes`;
    const f2 = featureSnippets[1] || 'quick onboarding and daily access';
    const f3 = featureSnippets[2] || 'smooth table controls';

    const multiPlatformTemplates = [
      `Installed ${profile.name} after checking what it provides on the page. Honestly delivers on ${f1} and feels genuinely reliable for daily use.`,
      `Been using ${profile.name} (v${profile.version}) for a few days now. Everything from ${f2} to the main ${profile.category.toLowerCase()} section works just as expected.`,
      `Worth downloading if you want a straightforward ${profile.category.toLowerCase()} app by ${profile.developer}. Really liked ${f3} and how easy it is to get started.`,
      `Tried ${profile.name} on my cousin's recommendation. It actually provides ${f1} without unnecessary clutter, very satisfied with the overall value.`,
      `Good experience with ${profile.name} so far. Checked the details and walkthrough first, and the real app matches what is described.`
    ];

    return Array.from({ length: count }).map((_, idx) => {
      const d = dates[idx] || dates[0];
      const star = targetRatings[idx] ?? 5;
      const text = multiPlatformTemplates[idx % multiPlatformTemplates.length];
      return {
        id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`,
        appId: String(app.id || app.slug || ''),
        appName: profile.name,
        appSlug: app.slug || '',
        appIcon: app.icon || app.logo || app.image || '',
        appCategory: profile.category,
        userName: shuffledNames[idx % shuffledNames.length],
        rating: star,
        reviewText: text,
        dateTag: d.dateTag,
        timestamp: d.isoString,
        status: 'staged',
        helpful_count: generateRealisticHelpfulLikes(config.likesMode, idx)
      };
    });
  };

  const activeRules = directives
    .filter(d => d.active)
    .map(d => `- ${d.rule}`)
    .join('\n');

  const platformGuide = getPlatformPsychologyGuide(config.platformStyle || 'smart_multi_platform');
  const toneGuide = getToneInstruction(config.languageTone);

  const systemInstruction = `You are an elite human consumer review simulator that understands how real people write comments on Google Play Store, Amazon, Flipkart, YouTube videos, and player communities.

CRITICAL ANTI-FAKE RULES (NEVER VIOLATE):
1. NEVER write generic AI-looking filler about "battery drain", "dark mode", "low RAM phone", "clean layout", or "minimalist interface" unless the Admin explicitly asked for it.
2. Real people talk about a MILLION practical things:
   - What the app actually provides (its specific modes, rewards, tools, entertainment value, or daily usefulness).
   - Expectation vs. reality ("I read the details / watched the video and installed it, and it actually gives...").
   - Specific details from the app's real description, features list, FAQs, version updates, or developer reputation.
   - How they use it in real life (playing with friends/family, evening break, learning via the tutorial/walkthrough).
3. Every single comment in the batch MUST sound like a completely different human being with a different sentence structure, different vocabulary, and different length (mix short 10-word reactions with thoughtful 25-45 word reviews).
4. Strictly obey the ADMIN SESSION INSTRUCTIONS & CONVERSATION MEMORY below.`;

  const prompt = `Generate exactly ${count} authentic, human-written user reviews for "${profile.name}".

=== COMPLETE APP DOSSIER (GROUND EVERY REVIEW IN THESE FACTS) ===
- App Name: ${profile.name}
- Category: ${profile.category}
- Developer / Publisher: ${profile.developer}
- Version & Size: v${profile.version} (${profile.size}), Downloads: ${profile.downloads}
- Official Catalog Rating: ${profile.catalogRating.toFixed(1)} / 5.0
- What This App Provides: ${profile.whatItProvidesSummary}
- Detailed Description: ${profile.fullDescription}
- Key Features Provided: ${profile.featuresList}
${profile.whatsNewText ? `- Recent Update / What's New: ${profile.whatsNewText}` : ''}
${profile.faqsText ? `- App FAQs (Questions real users ask): ${profile.faqsText}` : ''}
${profile.safetyAndTrustNotes ? `- Trust & Safety Highlights: ${profile.safetyAndTrustNotes}` : ''}
${profile.customHighlights ? `- Additional Highlights: ${profile.customHighlights}` : ''}
${profile.relatedVideosInfo ? `- Related Gameplay Video / Tutorial Info: ${profile.relatedVideosInfo}` : ''}

=== ADMIN SESSION INSTRUCTIONS & CONVERSATION MEMORY (HIGHEST PRIORITY) ===
${conversationMemory || `Focus Topic: ${config.customTopic || 'What the app provides, real features, and authentic user value'}`}

=== PLATFORM PSYCHOLOGY & TONE ===
${platformGuide}

TONE & VOICE:
${toneGuide}

PERSISTENT DIRECTIVES:
${activeRules}

=== EXACT STAR RATINGS REQUIRED FOR THE ${count} REVIEWS ===
Assign these exact integer star ratings in order: ${JSON.stringify(targetRatings)}
- For 5★: Genuine satisfaction with what the app provides, specific features, value, or ease of use.
- For 4★: Positive experience with what the app provides + a natural minor wish or observation.
- For 3★: Decent/average feedback with a realistic question or suggestion.
- For 1★ or 2★: Realistic user frustration (e.g., slow loading during peak evening hours, confusion about a rule, wanting faster update) without defamatory or robotic language.

Return ONLY a valid JSON array of ${count} objects with keys: "userName" (string), "rating" (integer 1-5), "reviewText" (string).`;

  const modelToUse = (config.model || 'gemini-2.5-flash').trim();

  try {
    let rawJsonText = '';

    // 1. Primary: Server-side Gemini execution with strict 11.5s timeout
    const srvController = new AbortController();
    const srvTimer = setTimeout(() => srvController.abort(), 11500);
    try {
      const srvRes = await fetch('/api/v1/admin/community/aistudio-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          apiKey,
          model: modelToUse,
          systemInstruction,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          temperature: 0.92,
          responseMimeType: 'application/json',
          useReviewSchema: true
        }),
        signal: srvController.signal
      });
      clearTimeout(srvTimer);

      const srvData = await srvRes.json().catch(() => ({}));
      if (srvRes.ok && srvData.success && srvData.text) {
        rawJsonText = srvData.text;
      } else if (!apiKey && srvData.error) {
        throw new Error(srvData.error);
      }
    } catch (srvErr: any) {
      clearTimeout(srvTimer);
      if (!apiKey) {
        throw srvErr;
      }
    }

    // 2. Fallback: Direct low-latency client-side call if server proxy didn't return text and browser has apiKey
    if (!rawJsonText && apiKey) {
      const directResult = await callClientGeminiDirect({
        apiKey,
        requestedModel: modelToUse,
        systemInstruction,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        temperature: 0.92,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        timeoutMs: 11000
      });
      rawJsonText = directResult.text;
    }

    if (!rawJsonText) {
      return buildProfileGroundedFallback();
    }

    const cleanedJson = rawJsonText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    let parsed: any[] = [];
    try {
      parsed = JSON.parse(cleanedJson);
    } catch (_) {
      const bracketMatch = cleanedJson.match(/\[[\s\S]*\]/);
      if (bracketMatch) {
        parsed = JSON.parse(bracketMatch[0]);
      }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return buildProfileGroundedFallback();
    }

    const shuffledFallbackNames = [...REALISTIC_USER_NAMES].sort(() => 0.5 - Math.random());

    return parsed.slice(0, count).map((item: any, idx: number) => {
      const d = dates[idx] || dates[0];
      const targetStar = targetRatings[idx] ?? 5;
      const aiStar = Number(item.rating);
      const finalRating =
        config.ratingMix === 'auto_app_rating' || config.ratingMix.startsWith('all_')
          ? targetStar
          : !isNaN(aiStar) && aiStar >= 1 && aiStar <= 5
          ? Math.round(aiStar)
          : targetStar;

      return {
        id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`,
        appId: String(app.id || app.slug || ''),
        appName: profile.name,
        appSlug: app.slug || '',
        appIcon: app.icon || app.logo || app.image || '',
        appCategory: profile.category,
        userName: (item.userName && String(item.userName).trim()) || shuffledFallbackNames[idx % shuffledFallbackNames.length],
        rating: finalRating,
        reviewText: cleanUserReviewText(item.reviewText || `${profile.name} provides a solid ${profile.category.toLowerCase()} experience.`),
        dateTag: d.dateTag,
        timestamp: d.isoString,
        status: 'staged',
        helpful_count: generateRealisticHelpfulLikes(config.likesMode, idx)
      };
    });
  } catch (err) {
    console.warn('[AI Review Studio] Generation error, using profile-grounded fallback:', err);
    return buildProfileGroundedFallback();
  }
}
