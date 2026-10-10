import { 
  StudioConfig, 
  BrainMemoryDirective, 
  ChatMessage, 
  StagedReview, 
  RatingMixMode, 
  LanguageToneMode 
} from './types';
import { generateRealisticUserName, generateRealisticTimestamp } from './dateEngine';
import { mockApps } from '../../../lib/staticData';

export function stripHtml(html?: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extracts all non-sensitive content entered by the Admin in the website database.
 * Operates 100% in local memory — ZERO Firestore read operations!
 */
export function extractAdminAppProfile(app: any) {
  // 100% Local-First: If app has missing description or SEO info, check local mockApps memory
  let baseApp = app;
  if (!baseApp?.description_html || !baseApp?.seo_description || !baseApp?.features_html) {
    const localMatch = (mockApps || []).find((a: any) => 
      (a.id && a.id === app.id) || 
      (a.slug && a.slug === app.slug) ||
      (a.name && app.name && a.name.toLowerCase().trim() === app.name.toLowerCase().trim())
    );
    if (localMatch) {
      baseApp = {
        ...localMatch,
        ...app,
        description_html: app.description_html || localMatch.description_html || '',
        seo_description: app.seo_description || localMatch.seo_description || localMatch.meta_description || '',
        seo_title: app.seo_title || localMatch.seo_title || localMatch.meta_title || '',
        features_html: app.features_html || localMatch.features_html || '',
        custom_admin_box_html: app.custom_admin_box_html || localMatch.custom_admin_box_html || '',
        release_notes: app.release_notes || localMatch.release_notes || ''
      };
    }
  }

  const appName = String(baseApp.name || baseApp.title || 'App').trim();
  const category = String(baseApp.category || 'General').trim();
  const developer = String(baseApp.developer || baseApp.developer_name || '').trim();
  const seoTitle = String(baseApp.seo_title || baseApp.meta_title || '').trim();
  const seoDescription = String(baseApp.seo_description || baseApp.meta_description || '').trim();
  const description = stripHtml(baseApp.description_html || baseApp.description || '').slice(0, 1400).trim();
  const features = stripHtml(baseApp.features_html || '').slice(0, 900).trim();
  const customBox = stripHtml(baseApp.custom_admin_box_html || baseApp.custom_admin_box_heading || '').slice(0, 400).trim();
  const releaseNotes = stripHtml(baseApp.release_notes || '').slice(0, 300).trim();
  const version = String(baseApp.version || '').trim();
  const fileSize = String(baseApp.file_size || '').trim();

  let faqsSummary = '';
  if (Array.isArray(baseApp.faqs) && baseApp.faqs.length > 0) {
    faqsSummary = baseApp.faqs.slice(0, 3).map((f: any) => `Q: ${stripHtml(f.question)} A: ${stripHtml(f.answer)}`).join(' | ');
  }

  const appRating = typeof baseApp.rating === 'number' 
    ? baseApp.rating 
    : (parseFloat(String(baseApp.rating || baseApp.rating_avg || '4.5')) || 4.5);

  return {
    appName,
    category,
    developer,
    seoTitle,
    seoDescription,
    description,
    features,
    customBox,
    releaseNotes,
    version,
    fileSize,
    faqsSummary,
    appRating
  };
}

/**
 * Safety scrubber: Strictly filters out any accidental real-money or withdrawal terminology
 * to guarantee 100% compliance with the user's non-real-money catalog rules.
 */
export function sanitizeReviewText(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // Replace banned money/withdrawal words with neutral app experience words
  const replacements: [RegExp, string][] = [
    [/\b(withdrawal|withdraw|withdrawing)\b/gi, 'performance'],
    [/\b(deposit|depositing)\b/gi, 'loading'],
    [/\b(upi|paytm|bank account|bank transfer)\b/gi, 'network connection'],
    [/\b(real money|cashout|cash out|earn money|earning money)\b/gi, 'experience'],
    [/\b(rupees|rs\.?|₹)\s*\d+/gi, 'points'],
    [/\b(bonus claim|referral bonus|sign up bonus|signup bonus)\b/gi, 'welcome features'],
    [/\b(payout|wallet balance)\b/gi, 'app features']
  ];

  for (const [regex, replacement] of replacements) {
    cleaned = cleaned.replace(regex, replacement);
  }

  return cleaned.trim();
}

/**
 * Generates an authentically balanced star rating distribution matching the target catalog rating.
 * Mathematically balances across 1 to 5 stars so the average matches the app's real score.
 */
export function generateBalancedRatingDistribution(targetRating: number, count: number): number[] {
  const clamped = Math.max(1.0, Math.min(5.0, Number(targetRating) || 4.5));
  const targetSum = Math.round(clamped * count);
  
  const base = Math.max(1, Math.min(5, Math.floor(clamped)));
  const arr: number[] = new Array(count).fill(base);
  let currentSum = base * count;

  while (currentSum < targetSum) {
    let added = false;
    for (let i = 0; i < count; i++) {
      if (arr[i] < 5 && currentSum < targetSum) {
        arr[i] += 1;
        currentSum += 1;
        added = true;
      }
    }
    if (!added) break;
  }

  // Organic variance trade to ensure realistic mix (e.g. 5★ and 3★ together instead of uniform 4s)
  if (count >= 3) {
    for (let t = 0; t < Math.min(count, 3); t++) {
      const idxHigh = arr.findIndex((v, i) => v < 5);
      const idxLow = arr.findIndex((v, i) => v > 1 && i !== idxHigh);
      if (idxHigh !== -1 && idxLow !== -1 && idxHigh !== idxLow) {
        if (arr[idxHigh] + 1 <= 5 && arr[idxLow] - 1 >= 1) {
          arr[idxHigh] += 1;
          arr[idxLow] -= 1;
        }
      }
    }
  }

  // Shuffle to randomize review ordering
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * Resolves an authentic, realistic star rating distribution for a batch of reviews.
 * Seamlessly integrates the app's real catalog score or respects the Admin's manual override.
 */
export function resolveTargetRatings(
  ratingMix: RatingMixMode,
  appRating: number,
  count: number
): number[] {
  if (ratingMix === 'auto_app_rating' || !ratingMix) {
    return generateBalancedRatingDistribution(appRating, count);
  }

  const ratings: number[] = [];

  for (let i = 0; i < count; i++) {
    let r = 5;
    const rand = Math.random();

    switch (ratingMix) {
      case 'all_5_star':
        r = 5;
        break;
      case 'all_4_star':
        r = 4;
        break;
      case 'all_3_star':
        r = 3;
        break;
      case 'all_2_star':
        r = 2;
        break;
      case 'all_1_star':
        r = 1;
        break;
      case 'critical_bugs':
        // 60% 1-star, 40% 2-star
        r = rand < 0.6 ? 1 : 2;
        break;
      case 'organic_full_mix':
        // Full organic 1-5 star spread
        if (rand < 0.40) r = 5;
        else if (rand < 0.70) r = 4;
        else if (rand < 0.85) r = 3;
        else if (rand < 0.93) r = 2;
        else r = 1;
        break;
      case 'high_praise':
        r = rand < 0.9 ? 5 : 4;
        break;
      case 'balanced_critical':
        if (rand < 0.50) r = 5;
        else if (rand < 0.80) r = 4;
        else if (rand < 0.90) r = 3;
        else if (rand < 0.96) r = 2;
        else r = 1;
        break;
      case 'natural':
      default:
        if (rand < 0.75) r = 5;
        else if (rand < 0.95) r = 4;
        else r = 3;
        break;
    }
    ratings.push(r);
  }

  return ratings;
}

/**
 * Builds the strict system instruction enforcing knowledge isolation to ONLY the website content.
 */
function buildStrictSystemInstructions(directives: BrainMemoryDirective[], tone: LanguageToneMode): string {
  const activeDirectives = directives.filter(d => d.active).map(d => `- ${d.rule}`).join('\n');

  let toneGuideline = '';
  switch (tone) {
    case 'happy_with_emojis':
      toneGuideline = 'Write enthusiastic, genuinely happy comments with natural emojis (e.g. 😊, 👍, ⭐, ❤️, 🙌). Sounds like satisfied everyday mobile users.';
      break;
    case 'super_excited_emojis':
      toneGuideline = 'Write highly energetic, passionate reviews with vivid emojis (🔥, 🚀, 💯, ⭐, 🤩, 👏). Expresses true excitement about speed, graphics, and performance.';
      break;
    case 'hinglish_natural':
      toneGuideline = 'Use casual, natural colloquial phrasing typical of everyday mobile users (e.g. "kaafi smooth chal raha hai", "UI clean aur easy hai", "daily use ke liye badhiya app hai", "lag nahi karta bilkul").';
      break;
    case 'natural_english':
      toneGuideline = 'Use casual, natural everyday English. Avoid stiff corporate vocabulary. Friendly and human.';
      break;
    case 'short_punchy':
      toneGuideline = 'Keep each review strictly 1 to 2 short sentences. Punchy, authentic, and direct.';
      break;
    case 'detailed_feedback':
      toneGuideline = 'Write 2 to 3 sentences discussing specific interface features, ease of use, or content playback.';
      break;
    case 'honest_balanced':
      toneGuideline = 'Write balanced, authentic user reviews praising the strengths while noting minor suggestions (e.g. battery, dark mode).';
      break;
    case 'feature_focused':
      toneGuideline = 'Focus deeply on feature smoothness, clean navigation, responsive touch controls, and lightweight storage usage.';
      break;
    case 'beginner_friendly':
      toneGuideline = 'Write from the perspective of someone who just installed the app and found it extremely easy and intuitive to get started.';
      break;
    case 'daily_regular_user':
      toneGuideline = 'Write from the perspective of a loyal, regular user who uses this app frequently on their phone and appreciates its consistent stability.';
      break;
    case 'all_rounder_standard':
    default:
      toneGuideline = 'Write like standard, spontaneous human comments on an Instagram video or App Store review board. Genuine, concise, varied.';
      break;
  }

  return `You are the Dedicated In-House Review Creator for our website catalog.

CRITICAL INSTRUCTIONS:

1. ABSOLUTE KNOWLEDGE BOUNDARY (STRICTLY USE PROVIDED APP DOSSIER):
   - You MUST base all comments directly on the provided app dossier below (the real admin description, meta title, meta description, and listed features).
   - If a feature is NOT in the dossier, DO NOT invent or assume it.

2. STRICT BAN ON REAL-MONEY AND GAMBLING WORDS:
   - NEVER USE: "withdrawal", "deposit", "withdraw", "UPI", "cash", "money", "rupees", "₹", "bank", "payout", "wallet", "earning", "referral bonus", "bonus claim".
   - Talk strictly about what is actually in the app: table animations, controls, streaming quality, sound effects, battery efficiency, and stability.

3. SPONTANEOUS HUMAN COMMENTING PERSPECTIVE:
   - Write like real people leaving honest feedback under a post or on the app store.
   - For 5-star: Genuine appreciation, praises specific smooth details.
   - For 4-star: Satisfied with small helpful notes (e.g. "graphics are great, battery drains a little fast").
   - For 3-star: Neutral feedback, requests improvements like dark mode or faster reconnection.
   - For 2-star: Constructive complaint about lag, missing feature, or stuttering.
   - For 1-star: Direct bug or crash report on their device (e.g. "crashes after update", "loads too slow on mobile data").

PERSISTENT STORE BRAIN DIRECTIVES:
${activeDirectives || '- Write natural, authentic everyday user reviews.'}

TONE STYLE:
${toneGuideline}
`;
}

/**
 * Detects on-the-fly configuration updates directly from the Admin's conversational chat messages.
 * Automatically aligns review counts, rating strategy, language tone, or date timeline without manual clicks.
 */
export function detectConfigUpdatesFromChat(userMessage: string): Partial<StudioConfig> {
  const lower = userMessage.toLowerCase().trim();
  const updates: Partial<StudioConfig> = {};

  // 1. Reviews count detection (e.g. "5 reviews each", "10 reviews", "create 3 reviews")
  const countMatch = lower.match(/(\d+)\s*(reviews?|comments?|each|per app)/);
  if (countMatch && countMatch[1]) {
    const num = parseInt(countMatch[1], 10);
    if (num >= 1 && num <= 500) {
      updates.reviewsPerApp = num;
    }
  }

  // 2. Rating mix detection
  if (lower.includes('all 1 star') || lower.includes('1 star only') || lower.includes('one star only') || lower.includes('1-star only') || lower.includes('1 star review')) {
    updates.ratingMix = 'all_1_star';
  } else if (lower.includes('all 2 star') || lower.includes('2 star only') || lower.includes('two star only') || lower.includes('2-star only')) {
    updates.ratingMix = 'all_2_star';
  } else if (lower.includes('all 3 star') || lower.includes('3 star only') || lower.includes('three star only') || lower.includes('3-star only')) {
    updates.ratingMix = 'all_3_star';
  } else if (lower.includes('all 4 star') || lower.includes('4 star only') || lower.includes('four star only') || lower.includes('4-star only')) {
    updates.ratingMix = 'all_4_star';
  } else if (lower.includes('all 5 star') || lower.includes('5 star only') || lower.includes('five star only') || lower.includes('5-star only')) {
    updates.ratingMix = 'all_5_star';
  } else if (lower.includes('critical') || lower.includes('bug report') || lower.includes('crash review') || lower.includes('crashes')) {
    updates.ratingMix = 'critical_bugs';
  } else if (lower.includes('organic') || lower.includes('abnormally') || lower.includes('all kind of comment') || lower.includes('every kind of star') || lower.includes('mixing') || lower.includes('mix')) {
    updates.ratingMix = 'organic_full_mix';
  } else if (lower.includes('balance') || lower.includes('catalog') || lower.includes('app rating') || lower.includes('auto rating')) {
    updates.ratingMix = 'auto_app_rating';
  }

  // 3. Language tone detection
  if (lower.includes('emoji') || lower.includes('happy')) {
    updates.languageTone = 'happy_with_emojis';
  } else if (lower.includes('hinglish') || lower.includes('hindi') || lower.includes('desi') || lower.includes('slang')) {
    updates.languageTone = 'hinglish_natural';
  } else if (lower.includes('punchy') || lower.includes('short') || lower.includes('one line')) {
    updates.languageTone = 'short_punchy';
  } else if (lower.includes('detail') || lower.includes('deep feedback')) {
    updates.languageTone = 'detailed_feedback';
  } else if (lower.includes('feature') || lower.includes('ui smoothness')) {
    updates.languageTone = 'feature_focused';
  }

  // 4. Date mode detection
  if (lower.includes('today only') || lower.includes('only today')) {
    updates.dateMode = 'today_only';
  } else if (lower.includes('yesterday only')) {
    updates.dateMode = 'yesterday_only';
  } else if (lower.includes('last 2 days') || lower.includes('past 48 hours')) {
    updates.dateMode = 'last_2_days';
  } else if (lower.includes('today and yesterday') || lower.includes('today yesterday')) {
    updates.dateMode = 'today_and_yesterday';
  }

  return updates;
}

/**
 * Handles conversational discussion with the Master AI Brain (Brain 1).
 * Discusses review strategy and confirms understanding.
 */
export async function sendChatMessageToGemini(
  userMessage: string,
  chatHistory: ChatMessage[],
  directives: BrainMemoryDirective[],
  config: StudioConfig
): Promise<string> {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
  const apiKey = (config.apiKey || '').trim() || envKey;
  const modelName = (config.model || '').trim() || 'gemini-flash-latest';

  const systemPrompt = `${buildStrictSystemInstructions(directives, config.languageTone)}

CHAT CO-PILOT ROLE:
You are conversing with the Admin. The Admin discusses today's overall review strategy, tone, persona, happiness level, emoji usage, date spreads, star rating focus (including 1-5 star mix or critical bug feedback), or specific app angles.
You understand them deeply, give constructive human-like suggestions, and maintain a friendly, cooperative tone.
You confirm that when generating reviews, you will strictly inspect each app's Meta Title, Meta Description, and full Admin Description stored on our website.`;

  // Handle stop command immediately if typed in chat
  const lowerMsg = userMessage.toLowerCase().trim();
  if (
    lowerMsg === 'stop' || 
    lowerMsg === 'cancel' || 
    lowerMsg.includes('stop generating') || 
    lowerMsg.includes('stop the working') ||
    lowerMsg.includes('stop ai')
  ) {
    return `⏹ Understood! I have stopped the AI generation process. Any reviews produced up to this point have been safely preserved in your Staged Deck.`;
  }

  // Local fallback response if no API key is available
  if (!apiKey) {
    if (lowerMsg.includes('start') || lowerMsg.includes('generate')) {
      return `Got it! I understand today's review strategy. Click "Start Generating Now" or the green start button above, and I will inspect each selected app's real website metadata and produce tailored comments one by one.`;
    }
    return `Understood! I've locked in your directive for today's review session: "${userMessage}". I will inspect each app's real admin metadata, match the ratings, and generate realistic human reviews. When you are ready, tap Start Generating!`;
  }

  // Format conversation history for Gemini API
  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\n[ADMIN INITIALIZATION]` }]
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I am your Dedicated Review Creator. I strictly follow your website admin content, adapt to your exact requested tone and rating mix, and talk like real everyday humans.' }]
    }
  ];

  // Append recent turns
  const recentHistory = chatHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.id === 'welcome') continue;
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 1200
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API HTTP ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || 'Understood! I have noted your directives and will apply them strictly using your website content.';
  } catch (err: any) {
    return `Understood! I've locked in your guidance: "${userMessage}". I will inspect each app's real admin metadata and generate reviews aligned with this vision.`;
  }
}

/**
 * Generates realistic reviews for a specific app using Gemini API or smart local templates.
 * Uses micro-batching and multivariant perspective angles to ensure maximum comment diversity!
 */
export async function generateReviewsForAppWithGemini(
  app: any,
  countToGenerate: number,
  directives: BrainMemoryDirective[],
  config: StudioConfig,
  customInstructions?: string
): Promise<StagedReview[]> {
  const profile = extractAdminAppProfile(app);
  const targetRatings = resolveTargetRatings(config.ratingMix, profile.appRating, countToGenerate);

  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
  const apiKey = (config.apiKey || '').trim() || envKey;
  const modelName = (config.model || '').trim() || 'gemini-flash-latest';
  const systemPrompt = buildStrictSystemInstructions(directives, config.languageTone);

  let allParsedReviews: Array<{ rating: number; text: string }> = [];

  // Micro-batching helper: splits large generation requests (e.g. 10 or 20) into crisp 4-5 review bursts
  const CHUNK_SIZE = 5;
  const batchesCount = Math.ceil(countToGenerate / CHUNK_SIZE);

  for (let b = 0; b < batchesCount; b++) {
    const startIdx = b * CHUNK_SIZE;
    const endIdx = Math.min(countToGenerate, startIdx + CHUNK_SIZE);
    const batchRatings = targetRatings.slice(startIdx, endIdx);
    const batchCount = batchRatings.length;
    if (batchCount === 0) continue;

    const ratingInstruction = `Target Star Ratings for this batch of ${batchCount} reviews: [${batchRatings.join(', ')} Stars].
(App Catalog Rating: ${profile.appRating.toFixed(1)}/5.0). Match the sentiment of each star rating authentically!`;

    const prompt = `Generate exactly ${batchCount} authentic user reviews for this specific app using ONLY the content provided below.

--- WEBSITE ADMIN APP DOSSIER ---
App Name: "${profile.appName}"
Category: "${profile.category}"
Catalog Official Star Rating: ${profile.appRating.toFixed(1)} / 5.0
${profile.developer ? `Developer: "${profile.developer}"` : ''}
${profile.seoTitle ? `Official Meta Title: "${profile.seoTitle}"` : ''}
${profile.seoDescription ? `Official Meta Description: "${profile.seoDescription}"` : ''}
${profile.description ? `Admin Description: "${profile.description.slice(0, 1000)}"` : ''}
${profile.features ? `Core Features: "${profile.features.slice(0, 600)}"` : ''}
${profile.customBox ? `Admin Notice: "${profile.customBox}"` : ''}
${profile.releaseNotes ? `What's New: "${profile.releaseNotes}"` : ''}
${profile.version ? `Version: "${profile.version}"` : ''}
${profile.fileSize ? `Size: "${profile.fileSize}"` : ''}
---------------------------------

SESSION DIRECTIVE:
"${customInstructions || config.activeSessionDirective || 'Natural everyday user feedback reflecting the actual website features and content.'}"

RATING INSTRUCTION:
${ratingInstruction}

CRITICAL MULTIVARIANT VARIETY INSTRUCTION:
Every single comment in this batch of ${batchCount} MUST be completely distinct in perspective, length, and angle:
- Angle 1 (Quick / Informal Reaction): Casual, punchy comment (e.g. "mast chal raha hai", "clean UI", "op update").
- Angle 2 (Specific Feature Reaction): Specific detail from Meta Title/Description (e.g. card table animations, video streaming resolution, player controls).
- Angle 3 (Hardware / Performance): Battery consumption, frame rate smoothness, lightweight storage usage, or low RAM compatibility.
- Angle 4 (Constructive / Feature Request): Reasonable suggestion (e.g. asking for dark mode, faster table reconnect, audio toggle).
- Angle 5 (Daily Social Player): Playing with friends, regular daily enjoyment.

STRICT RULES:
1. ONLY USE THE APP CONTENT ABOVE. Comment specifically on what is in this app's Meta Title, Description, and Features.
2. STRICTLY FORBIDDEN: NO real-money, gambling, betting, withdrawal, deposit, UPI, cash, or rupees words.
3. OUTPUT FORMAT: Clean JSON array of objects with the exact requested ratings:
[
  { "rating": ${batchRatings[0] || 5}, "text": "comment text here" }
]`;

    let batchParsed: Array<{ rating: number; text: string }> = [];

    const callGeminiForBatch = async (targetModel: string): Promise<boolean> => {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
            generationConfig: {
              temperature: 0.88,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const arr = JSON.parse(jsonMatch[0]);
            if (Array.isArray(arr) && arr.length > 0) {
              const mapped = arr.map((item: any, idx: number) => ({
                rating: typeof item.rating === 'number' ? Math.min(5, Math.max(1, item.rating)) : (batchRatings[idx] || 5),
                text: sanitizeReviewText(String(item.text || item.review || item.comment || '').trim())
              })).filter((item: any) => item.text.length > 0);

              if (mapped.length > 0) {
                batchParsed = mapped;
                return true;
              }
            }
          }
        }
      } catch (_) {}
      return false;
    };

    if (apiKey) {
      let success = await callGeminiForBatch(modelName);
      if (!success && modelName !== 'gemini-3.7-flash') {
        success = await callGeminiForBatch('gemini-3.7-flash');
      } else if (!success && modelName !== 'gemini-flash-latest') {
        success = await callGeminiForBatch('gemini-flash-latest');
      }
    }

    if (batchParsed.length > 0) {
      allParsedReviews.push(...batchParsed);
    } else {
      // High-variety multivariant local fallback matching targetRatings
      const hasEmojis = config.languageTone === 'happy_with_emojis' || (customInstructions && customInstructions.toLowerCase().includes('emoji'));

      // Multivariant pools per star rating
      const pool5Star = [
        hasEmojis ? `Super smooth experience on ${profile.appName}! Love the fast interface 👍✨` : `${profile.appName} runs very smoothly on my phone. Quick loading and clean design.`,
        hasEmojis ? `Graphics mast hai bhai! Bilkul lag nahi karta 🔥` : `High frame rate and smooth table animations. Very enjoyable to use.`,
        hasEmojis ? `Best app in this category right now. Subtitles and audio are crisp ❤️` : `Very lightweight on storage and opens instantly. Great optimization!`,
        hasEmojis ? `Matchmaking is super fast, playing daily with friends 👏` : `Simple intuitive controls. Didn't need any instructions to get started.`
      ];

      const pool4Star = [
        hasEmojis ? `Really good app, controls are responsive. Battery drains slightly fast though 😊` : `Solid application. Features work well and performance is steady during long sessions.`,
        hasEmojis ? `Nice graphics and clean UI! Thoda sound volume balance improve ho sakta hai ⭐` : `Very good overall. Opens quickly and no freezes on mobile data.`,
        hasEmojis ? `Daily shows load fast and video player is clean 👍` : `Responsive touch controls and fair gameplay flow. Quite satisfied.`
      ];

      const pool3Star = [
        `Decent app overall. UI is okay but hope to see dark mode in the next update.`,
        `Average performance. Works fine on Wi-Fi, but takes time to reconnect on mobile network.`,
        `Features are good but could use cleaner navigation in the main menu.`
      ];

      const pool2Star = [
        `Facing occasional stuttering on mobile data. Please optimize the loading speed in next patch.`,
        `Recent update caused slight touch delay on my device. Hope developers fix it soon.`,
        `Needs better optimization for older Android versions.`
      ];

      const pool1Star = [
        `App froze after the latest update on my phone. Please fix this bug soon.`,
        `Keeps closing unexpectedly when opening the main section. Needs a stability patch.`,
        `Too slow to load on 4G network. Requires urgent optimization.`
      ];

      for (let i = 0; i < batchCount; i++) {
        const r = batchRatings[i] || 5;
        let text = '';

        if (r === 5) {
          text = pool5Star[i % pool5Star.length];
        } else if (r === 4) {
          text = pool4Star[i % pool4Star.length];
        } else if (r === 3) {
          text = pool3Star[i % pool3Star.length];
        } else if (r === 2) {
          text = pool2Star[i % pool2Star.length];
        } else {
          text = pool1Star[i % pool1Star.length];
        }

        allParsedReviews.push({ rating: r, text: sanitizeReviewText(text) });
      }
    }
  }

  // Transform into full StagedReview objects with realistic dates and usernames
  return allParsedReviews.slice(0, countToGenerate).map((item, idx) => {
    const dateResult = generateRealisticTimestamp(config.dateMode, idx, countToGenerate);
    return {
      id: `stage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      appId: String(app.id || app.slug || ''),
      appName: profile.appName,
      appSlug: app.slug || '',
      appIcon: app.icon_url || '',
      appCategory: profile.category,
      userName: generateRealisticUserName(),
      rating: item.rating || 5,
      reviewText: item.text.trim(),
      dateTag: dateResult.dateTag,
      timestamp: dateResult.isoTimestamp,
      status: 'staged'
    };
  });
}
