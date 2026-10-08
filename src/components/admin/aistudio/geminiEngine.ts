import { 
  StudioConfig, 
  BrainMemoryDirective, 
  ChatMessage, 
  StagedReview, 
  RatingMixMode, 
  LanguageToneMode 
} from './types';
import { generateRealisticUserName, generateRealisticTimestamp } from './dateEngine';

export function stripHtml(html?: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Builds the comprehensive system instruction containing all persistent
 * Store Brain memory directives so the model NEVER forgets what the user told it.
 */
function buildSystemInstructions(directives: BrainMemoryDirective[], tone: LanguageToneMode): string {
  const activeDirectives = directives.filter(d => d.active).map(d => `- ${d.rule}`).join('\n');
  
  return `You are the Master Review Architect for RummyDex, the premier transparency catalog for Indian card & arcade mobile apps.
Your task is to generate 100% human-realistic player comments tailored strictly to each specific application's actual characteristics, game genre, bonuses, and gameplay flow.

CRITICAL DIRECTIVES FROM ADMIN'S PERSISTENT MEMORY ("STORE BRAIN"):
${activeDirectives || '- Write natural, authentic Indian mobile gamer reviews.'}

DEEP APP UNDERSTANDING RULES:
1. SPECIFICITY OVER GENERICS: Do NOT write generic vague comments that could apply to any random app. Explicitly weave in the specific game name, its game mode (e.g. Points Rummy, Deals Rummy, Teen Patti Muflis, Dragon vs Tiger, Aviator, Pool), its specific bonus amount, or its actual UI responsiveness.
2. NO REPETITION: Every review in the batch must have a completely distinct voice, perspective, and phrasing. One player talks about fast UPI deposit/withdrawal; another praises table matchmaking with zero lag on Jio 4G; another highlights the VIP level perks or sign-up bonus claim.
3. REALISTIC RATINGS: Follow the assigned star balance. 5-star comments are enthusiastic but natural; 4-star comments might suggest a small cosmetic wish (e.g., "new table theme chahiye") while still praising overall game stability.

TONE & STYLE GUIDELINE:
${
  tone === 'hinglish_natural' 
    ? 'Use natural Hinglish & authentic Indian gamer vocabulary (e.g., "bhai withdrawal 5 minute me bank aa gaya", "table graphics ekdum mast hai", "sign up bonus bina issue claim ho gaya", "4G connection pe bhi lag free chalta hai").'
    : tone === 'natural_english'
    ? 'Use casual, conversational Indian English. Avoid stiff corporate vocabulary. Keep sentences natural and punchy.'
    : tone === 'short_punchy'
    ? 'Keep every review strictly 1 to 2 sentences. Punchy, authentic, quick reaction style.'
    : 'Mix of concise praise and genuine user experience details.'
}

ANTI-AI SLOP RULES:
- NEVER use buzzwords like: "seamless", "testament", "delve", "tapestry", "plethora", "embark", "furthermore", "in conclusion", "exceptional", "transcend".
- Write like a real person typing on an Android mobile keyboard. Natural casual phrasing is encouraged.
- Talk about real game mechanics: UPI withdrawal speed, table animations, sign up bonus credit, customer care chat response, fair deck distribution.
`;
}

/**
 * Handles conversational discussion with the AI Assistant (Brain 1).
 * Admin can converse, ask for ideas, give specific rules, or request changes.
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

  const systemPrompt = buildSystemInstructions(directives, config.languageTone);

  // If no Gemini API key is configured, provide an intelligent local assistant response
  if (!apiKey) {
    return `[Store Brain Active - Local Mode]
I have saved your directives to memory! To unlock live Google Gemini AI generation, please click "Set API Key" above and enter your free Google AI Studio key.
Currently remembering ${directives.filter(d => d.active).length} memory directives. Ready to generate reviews for your selected apps!`;
  }

  // Format conversation history for Gemini API
  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\n[ADMIN GREETING]` }]
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I am your RummyDex AI Review Brain. All Store Brain memory directives are locked in. How can I help you customize or generate reviews today?' }]
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
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 429) {
        throw new Error('Google AI Studio quota limit reached. Please switch model to Gemini 3.7 or rotate API key in settings.');
      }
      if (res.status === 503) {
        throw new Error('Google model experiencing high demand. Please retry or switch to Gemini 3.7.');
      }
      throw new Error(errData?.error?.message || `Gemini API returned ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || 'I have noted your instructions and updated our generation plan.';
  } catch (err: any) {
    return `Note: ${err.message}. Your instruction has still been saved to the local Store Brain and will guide future generations.`;
  }
}

/**
 * Generates realistic reviews for selected apps using the Gemini API.
 * Uses local app data in memory — ZERO Firestore read calls!
 */
export async function generateReviewsForAppWithGemini(
  app: any,
  countToGenerate: number,
  directives: BrainMemoryDirective[],
  config: StudioConfig,
  customInstructions?: string
): Promise<StagedReview[]> {
  const appName = app.name || 'Game App';
  const appCategory = app.category || 'Card Game';
  const appBonus = app.bonus_amount || app.refer_bonus || app.signup_bonus || '';
  const appMinWithdraw = app.min_withdrawal ? `₹${app.min_withdrawal}` : '';
  const appDesc = stripHtml(app.description_html || app.features_html || '').slice(0, 600);

  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
  const apiKey = (config.apiKey || '').trim() || envKey;
  const modelName = (config.model || '').trim() || 'gemini-flash-latest';
  const systemPrompt = buildSystemInstructions(directives, config.languageTone);

  const prompt = `Generate exactly ${countToGenerate} realistic player reviews tailored specifically to this game app:
APP PROFILE:
- Name: "${appName}"
- Genre/Category: "${appCategory}"
${appBonus ? `- Sign-up / Referral Bonus: "${appBonus}"` : ''}
${appMinWithdraw ? `- Min Withdrawal: "${appMinWithdraw}"` : ''}
${appDesc ? `- App Highlights: "${appDesc}"` : ''}
${customInstructions ? `- Admin Instructions / Topic Focus: "${customInstructions}"` : ''}

INSTRUCTIONS:
1. Each review must reflect this specific game (${appName}) and its category (${appCategory}). Mention authentic gameplay details (e.g. table speed, UPI cash out, bonus credit, 4G performance).
2. Assign star ratings naturally according to profile (${config.ratingMix}).
3. Write with varying natural lengths (15 to 40 words). No robotic AI phrases, no numbering, no bullet points.
4. Output MUST be a clean JSON array of objects:
[
  { "rating": 5, "text": "review comment here" }
]`;

  let parsedReviews: Array<{ rating: number; text: string }> = [];

  const callGeminiGenerate = async (targetModel: string): Promise<boolean> => {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.85,
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
            parsedReviews = arr.map((item: any) => ({
              rating: typeof item.rating === 'number' ? Math.min(5, Math.max(1, item.rating)) : 5,
              text: String(item.text || item.review || item.comment || '').trim()
            })).filter((item: any) => item.text.length > 0);
            return parsedReviews.length > 0;
          }
        }
      }
    } catch (_) {}
    return false;
  };

  if (apiKey) {
    const success = await callGeminiGenerate(modelName);
    // If primary model hit quota (429) or high demand spike (503), try alternate model seamlessly
    if (!success && modelName !== 'gemini-3.7-flash') {
      await callGeminiGenerate('gemini-3.7-flash');
    } else if (!success && modelName !== 'gemini-flash-latest') {
      await callGeminiGenerate('gemini-flash-latest');
    }
  }

  // Fallback high-quality templates if API was unreachable or no key
  if (!parsedReviews || parsedReviews.length === 0) {
    const templates = [
      { rating: 5, text: `Bhai withdrawal bohot smooth hai ${appName} me. UPI se 5 minute me bank me aa gaya.` },
      { rating: 5, text: `Best card gameplay experience. Lag bilkul nahi hota aur graphics clean hai.` },
      { rating: 4, text: `Table joining instant hai. Sign up bonus bhi easily credit ho gaya, solid app.` },
      { rating: 5, text: `Daily tournament mode bahut mazedar hai. Fair dealing lagti hai.` },
      { rating: 5, text: `Customer support fast reply deta hai. Mere favorite rummy apps me se ek hai.` }
    ];
    for (let i = 0; i < countToGenerate; i++) {
      const t = templates[i % templates.length];
      parsedReviews.push({ rating: t.rating, text: t.text });
    }
  }

  // Transform into full StagedReview objects with realistic dates and usernames
  return parsedReviews.slice(0, countToGenerate).map((item, idx) => {
    const dateResult = generateRealisticTimestamp(config.dateMode, idx, countToGenerate);
    return {
      id: `stage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      appId: String(app.id || app.slug || ''),
      appName: app.name || 'Card App',
      appSlug: app.slug || '',
      appIcon: app.icon_url || '',
      appCategory: app.category || 'Card',
      userName: generateRealisticUserName(),
      rating: item.rating || 5,
      reviewText: item.text.trim(),
      dateTag: dateResult.dateTag,
      timestamp: dateResult.isoTimestamp,
      status: 'staged'
    };
  });
}
