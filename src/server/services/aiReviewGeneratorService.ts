import { GoogleGenAI, Type } from "@google/genai";
import { ReviewRecord, sanitizeReviewText } from "./communityStoreService";
import { executeBrain2WebResearchStep } from "./brain2WebResearcherAutobotService";
import { getActiveAiModel, getCandidateModels } from "./aiModelManager";

export interface StarDistribution {
  star5?: number;
  star4?: number;
  star3?: number;
  star2?: number;
  star1?: number;
}

export interface GenerateOptions {
  count: number;
  targetScore: number;
  starMix?: StarDistribution;
  toneFocus?: 'balanced' | 'performance' | 'gameplay' | 'ui_graphics' | 'casual';
  customPrompt?: string;
  mode?: 'local' | 'research';
  languageStyle?: 'proper_english' | 'hinglish' | 'natural_mix';
}

export interface AIReviewResultObject {
  reviews: Partial<ReviewRecord>[];
  mode: 'local' | 'research';
  modelUsed: string;
  searchQueries?: string[];
  groundedSources?: Array<{ title: string; url: string; snippet?: string }>;
  searchStatus?: string;
  dossierHighlights?: string[];
}

export const BANNED_SAFETY_WORDS = [
  'deposit', 'withdraw', 'cash', 'bonus', 'real money', 'jackpot', 'bet', 
  'wager', 'winnings', 'payout', 'earn money', 'earning', 'bank account', 
  'rupees', 'inr', 'paisa', 'invest', 'financial'
];

export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Extracts comprehensive dossier highlights from the app
 */
export function extractDossierFacts(app: any): { highlights: string[]; fullSummary: string } {
  const dossier = compileFullAppDossier(app);
  return {
    highlights: dossier.highlights,
    fullSummary: dossier.fullSummary
  };
}

export const extractAppDossierFacts = extractDossierFacts;

export interface CompiledAppDossier {
  appInfo: {
    id: string;
    slug?: string;
    name: string;
    developer: string;
    category: string;
    rating: number | string;
    file_size: string;
    version: string;
    package_name?: string;
    icon_url?: string;
  };
  dossierStats: {
    totalChars: number;
    wordCount: number;
    headingsCount: number;
    detectedMechanicsCount: number;
    faqCount: number;
    hasDescription: boolean;
    hasFeatures: boolean;
    hasSafetyWarning: boolean;
    hasAdminBox: boolean;
    hasReleaseNotes: boolean;
  };
  highlights: string[];
  fullSummary: string;
  parsedSections: {
    cleanDescription: string;
    cleanFeatures: string;
    cleanAdminBox: string;
    safetyWarning: string;
    adminNotice: string;
    proTip: string;
    faqs: Array<{ question: string; answer: string }>;
    releaseNotes: string;
  };
}

/**
 * Compiles the complete, exhaustive 360° database dossier for an app without cutting or truncating details.
 */
export function compileFullAppDossier(appInput: any): CompiledAppDossier {
  const app = hydrateAppDossier(appInput);
  const highlights: string[] = [];

  const cleanDesc = stripHtml(app?.description_html || app?.description || '');
  const cleanFeatures = stripHtml(app?.features_html || app?.features || '');
  const cleanAdminBox = stripHtml(app?.custom_admin_box_html || '');
  const cleanSafetyWarning = stripHtml(app?.red_box_msg || '');
  const cleanAdminNotice = stripHtml(app?.yellow_box_msg || '');
  const cleanProTip = stripHtml(app?.idea_box_msg || '');
  const cleanReleaseNotes = stripHtml(app?.release_notes || '');

  // Identify key game modes & technical mechanics from full text
  const allText = `${cleanDesc} ${cleanFeatures} ${cleanAdminBox} ${cleanAdminNotice} ${app?.name || ''}`;
  const modeChecks = [
    { regex: /points\s*rummy/i, label: 'Points Rummy' },
    { regex: /pool\s*101|101\s*pool/i, label: '101 Pool Rummy' },
    { regex: /pool\s*201|201\s*pool/i, label: '201 Pool Rummy' },
    { regex: /deals\s*rummy|deal\s*rummy/i, label: 'Deals Rummy' },
    { regex: /teen\s*patti/i, label: 'Teen Patti Classic' },
    { regex: /muflis/i, label: 'Muflis' },
    { regex: /ak47|ak-47/i, label: 'AK-47' },
    { regex: /andar\s*bahar/i, label: 'Andar Bahar' },
    { regex: /dragon\s*(?:vs|v)\s*tiger/i, label: 'Dragon vs Tiger' },
    { regex: /callbreak|call\s*break/i, label: 'Call Break' },
    { regex: /rummy\s*51/i, label: '51 Pool Rummy' },
    { regex: /multiplayer|multi-player/i, label: 'Real-time Multiplayer Tables' },
    { regex: /private\s*table/i, label: 'Private Friends Tables' },
    { regex: /auto[\s-]sort|sort\s*cards/i, label: 'One-Touch Card Auto-Sort' },
    { regex: /table\s*timer|timer/i, label: 'Fast Table Timers' },
    { regex: /60\s*fps|smooth\s*anim/i, label: 'Smooth 60 FPS Card Dealing' },
    { regex: /2g|3g|low\s*data|low\s*ping/i, label: 'Low Ping & 2G/3G Network Support' },
    { regex: /battery/i, label: 'Battery Saver Optimization' }
  ];

  modeChecks.forEach(m => {
    if (m.regex.test(allText) && !highlights.includes(m.label)) {
      highlights.push(m.label);
    }
  });

  // Extract explicit HTML headings or bullet points
  const headings = (app?.description_html || '').match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi) || [];
  headings.slice(0, 6).forEach((h: string) => {
    const clean = stripHtml(h);
    if (clean && clean.length > 4 && clean.length < 80 && !highlights.includes(clean)) {
      highlights.push(clean);
    }
  });

  if (cleanSafetyWarning) highlights.push('Safety Disclaimer Active');
  if (cleanAdminNotice) highlights.push('Admin Highlight Notice Active');
  if (cleanProTip) highlights.push('Pro Gameplay Tips Active');

  if (highlights.length === 0) {
    highlights.push(`${app?.category || 'Card Game'} Engine`, 'Smooth Table Mechanics', 'Multiplayer Matching');
  }

  const faqsList: Array<{ question: string; answer: string }> = Array.isArray(app?.faqs) ? app.faqs : [];

  const fullSummaryParts = [
    `APP NAME: ${app?.name || 'Card App'}`,
    `DEVELOPER / STUDIO: ${app?.developer || 'Official Studio'}`,
    `CATEGORY: ${app?.category || 'Casual, Card'}`,
    `FILE SIZE & VERSION: ${app?.file_size || 'Lightweight'} | Version ${app?.version || '1.0'}`,
    `STORE BENCHMARK RATING: ${app?.rating || '4.8'} out of 5.0 stars`,
    app?.package_name ? `PACKAGE IDENTIFIER: ${app.package_name}` : '',
    '',
    `DETECTED GAME MODES & MECHANICS:\n${highlights.map(h => `• ${h}`).join('\n')}`,
    '',
    cleanDesc ? `FULL DESCRIPTION:\n${cleanDesc}` : '',
    '',
    cleanFeatures ? `FEATURES BREAKDOWN:\n${cleanFeatures}` : '',
    '',
    cleanAdminBox ? `ADMIN SPOTLIGHT:\n${cleanAdminBox}` : '',
    cleanAdminNotice ? `IMPORTANT NOTICE:\n${cleanAdminNotice}` : '',
    cleanSafetyWarning ? `SAFETY & COMPLIANCE WARNING:\n${cleanSafetyWarning}` : '',
    cleanProTip ? `PRO STRATEGY TIPS:\n${cleanProTip}` : '',
    cleanReleaseNotes ? `RELEASE NOTES & RECENT UPDATES:\n${cleanReleaseNotes}` : '',
    faqsList.length > 0 ? `COMMUNITY FREQUENTLY ASKED QUESTIONS:\n${faqsList.map((f, i) => `Q${i + 1}: ${f.question}\nA${i + 1}: ${f.answer}`).join('\n\n')}` : ''
  ].filter(Boolean);

  const fullSummary = fullSummaryParts.join('\n');
  const totalChars = fullSummary.length;
  const wordCount = fullSummary.split(/\s+/).filter(Boolean).length;

  return {
    appInfo: {
      id: String(app?.id || app?.slug || 'app'),
      slug: app?.slug,
      name: app?.name || 'Card App',
      developer: app?.developer || 'Official Studio',
      category: app?.category || 'Card',
      rating: app?.rating || 4.8,
      file_size: app?.file_size || 'Lightweight',
      version: app?.version || '1.0',
      package_name: app?.package_name,
      icon_url: app?.icon_url
    },
    dossierStats: {
      totalChars,
      wordCount,
      headingsCount: headings.length,
      detectedMechanicsCount: highlights.length,
      faqCount: faqsList.length,
      hasDescription: !!cleanDesc,
      hasFeatures: !!cleanFeatures,
      hasSafetyWarning: !!cleanSafetyWarning,
      hasAdminBox: !!cleanAdminBox,
      hasReleaseNotes: !!cleanReleaseNotes
    },
    highlights,
    fullSummary,
    parsedSections: {
      cleanDescription: cleanDesc,
      cleanFeatures: cleanFeatures,
      cleanAdminBox: cleanAdminBox,
      safetyWarning: cleanSafetyWarning,
      adminNotice: cleanAdminNotice,
      proTip: cleanProTip,
      faqs: faqsList,
      releaseNotes: cleanReleaseNotes
    }
  };
}

export function calculateRatingArray(count: number, targetScore: number, starMix?: StarDistribution): number[] {
  if (count <= 0) return [];
  if (starMix && (starMix.star5 || starMix.star4 || starMix.star3 || starMix.star2 || starMix.star1)) {
    const s5 = Number(starMix.star5) || 0;
    const s4 = Number(starMix.star4) || 0;
    const s3 = Number(starMix.star3) || 0;
    const s2 = Number(starMix.star2) || 0;
    const s1 = Number(starMix.star1) || 0;
    const totalWeight = s5 + s4 + s3 + s2 + s1;
    if (totalWeight > 0) {
      const results: number[] = [];
      const addStars = (starVal: number, pct: number) => {
        const amount = Math.round((pct / totalWeight) * count);
        for (let i = 0; i < amount; i++) results.push(starVal);
      };
      addStars(5, s5); addStars(4, s4); addStars(3, s3); addStars(2, s2); addStars(1, s1);
      while (results.length < count) {
        if (s5 >= s1) results.push(5); else results.push(1);
      }
      return results.slice(0, count).sort((a, b) => b - a);
    }
  }
  
  const results: number[] = [];
  let currentSum = 0;
  for (let i = 0; i < count; i++) {
    const remainingCount = count - i;
    const neededSum = (targetScore * count) - currentSum;
    let idealNext = Math.round(neededSum / remainingCount);
    idealNext = Math.max(1, Math.min(5, idealNext));
    
    if (remainingCount > 1 && Math.random() > 0.5) {
      if (idealNext < 5 && Math.random() > 0.5) idealNext++;
      else if (idealNext > 1) idealNext--;
    }
    
    results.push(idealNext);
    currentSum += idealNext;
  }
  return results.sort((a, b) => b - a);
}

/**
 * Resolves working Gemini API key
 */
function getWorkingGeminiApiKeys(): string[] {
  const keys: string[] = [];
  if (process.env.GEMINI_RESEARCH_API_KEY && process.env.GEMINI_RESEARCH_API_KEY.trim()) {
    keys.push(process.env.GEMINI_RESEARCH_API_KEY.trim());
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() && !keys.includes(process.env.GEMINI_API_KEY.trim())) {
    keys.push(process.env.GEMINI_API_KEY.trim());
  }
  return keys;
}

/**
 * Hydrates app with static data if description is missing
 */
function hydrateAppDossier(appInput: any): any {
  let app = { ...appInput };
  if ((!app.description_html && !app.description) && (app.id || app.slug || app.name)) {
    try {
      const fsMod = require('fs');
      const pathMod = require('path');
      const staticP = pathMod.join(process.cwd(), 'src/lib/staticData.json');
      if (fsMod.existsSync(staticP)) {
        const staticData = JSON.parse(fsMod.readFileSync(staticP, 'utf8'));
        const catalog = staticData.apps || staticData.mockApps || [];
        const matched = catalog.find((a: any) => 
          (a.id && String(a.id).toLowerCase() === String(app.id || app.slug).toLowerCase()) ||
          (a.slug && String(a.slug).toLowerCase() === String(app.slug || app.id).toLowerCase()) ||
          (a.name && String(a.name).toLowerCase() === String(app.name).toLowerCase())
        );
        if (matched) {
          app = { ...matched, ...app };
        }
      }
    } catch (e) {
      console.warn("[AI Review Gen] Dossier hydration notice:", e);
    }
  }
  return app;
}

/**
 * BRAIN 1: Deep Admin Dossier Engine
 * Ingests full database dossier (description, features, rules, warnings, FAQs, specs)
 * and generates diverse, hyper-realistic, Indian player reviews with unforced human creativity.
 */
export async function generateBrain1DossierReviews(
  appInput: any, 
  options: GenerateOptions
): Promise<AIReviewResultObject & { dossierStats?: any }> {
  const dossier = compileFullAppDossier(appInput);
  const app = dossier.appInfo;
  const appName = app?.name || 'Card Game';
  const { count, targetScore, starMix, customPrompt, languageStyle = 'proper_english' } = options;
  const ratings = calculateRatingArray(count, targetScore, starMix);
  const { highlights, fullSummary, dossierStats } = dossier;

  const apiKeys = getWorkingGeminiApiKeys();
  if (apiKeys.length === 0) {
    throw new Error("No Gemini API keys found. Please set GEMINI_API_KEY or GEMINI_RESEARCH_API_KEY.");
  }

  let languagePromptSection = '';
  if (languageStyle === 'proper_english') {
    languagePromptSection = `=========================================
LANGUAGE MANDATE: STRICTLY NATURAL PROPER ENGLISH (NO HINDI / HINGLISH SLANG)
=========================================
CRITICAL: Every single review MUST be written in 100% natural, fluent, conversational English as written by real English-speaking mobile game players on the Google Play Store or App Store.
- STRICT NEGATIVE CONSTRAINT: Absolutely DO NOT use any Hindi or Hinglish words (NO 'bhai', 'mast', 'achha', 'hai', 'badiya', 'sahi', 'hota', 'kar', 'karo', 'yaar', 'ekdum', 'lag', 'chalta', etc.).
- The comments must sound like authentic human players giving spontaneous feedback:
  * Short reactions: "Smooth matchmaking, no lag on 4G.", "Clean UI, tables join instantly.", "Really nice card dealing animations."
  * Gameplay observations: "Card sorting is automatic and fast. Good practice game to play with friends.", "Interface is neat and battery drain is minimal on my Samsung."
  * Constructive suggestions for 3 or 4 stars: "Good overall experience, but the discard table timer is slightly fast. Hope to see more table themes.", "Decent tables, plays well without crashing. Graphics could be a bit more modern."
- User Names: Diverse and natural (e.g. Rahul Sharma, Priya_M, Kevin D., Sarah_K, Amit Verma, Vikram99, Sneha_R, Karthik K., Ananya_Gamer, Rohit_CardMaster, Deepali K., Harpreet_S, Aman Joshi).`;
  } else if (languageStyle === 'hinglish') {
    languagePromptSection = `=========================================
LANGUAGE MANDATE: CASUAL CONVERSATIONAL HINGLISH
=========================================
Every review should be written in natural, conversational Hinglish (Hindi written in Roman English alphabet mixed with English gaming terms) as casually used everyday by Indian mobile gamers.
- Examples of authentic human Hinglish player reviews:
  * Short reactions: "Bhai mast app hai, zero lag.", "Timepass ke liye ekdum sahi game.", "Table turant mil jata hai."
  * Gameplay observations: "Card arrangement smooth laga mujhe, battery bhi zyada nahi khata.", "Friends ke sath khelne me maza aaya, smooth animations hain."
  * Constructive suggestions for 3 or 4 stars: "Game accha hai par timer thoda jaldi khatam ho jata hai. Baki sab badiya hai.", "Graphics theek hain, bas internet slow hone par kabhi kabhi reconnect hota hai."
- User Names: Authentic Indian player names (e.g. Rohan V., Aniket_92, Swati M., Devendra K., Preeti G., Sunny_Cards, Arjun Nair, Harpreet_S, Pooja Sharma, Kunal99, Deepak Yadav).`;
  } else {
    languagePromptSection = `=========================================
LANGUAGE MANDATE: REAL-WORLD PLAYER DIVERSITY (ORGANIC MIX OF ENGLISH & HINGLISH)
=========================================
Real app store comment sections are naturally heterogeneous: roughly 60% of players write in crisp casual English, while 40% write in natural Hinglish or short conversational phrasing.
- Spontaneously vary the language across the batch: produce some comments in crisp proper English, and others in natural conversational Hinglish so the collection feels 100% authentic, spontaneous, and unmanufactured.
- User Names: Diverse mix of modern screen names and player handles across Indian states.`;
  }

  const prompt = `You are Brain 1 — The Autonomous Dossier Intelligence & Auto-Commenter Bot for RummyDex.
You have been provided with the complete, exhaustive 360° app information and database dossier for "${appName}".

=========================================
EXHAUSTIVE 360° APP INFORMATION & DOSSIER:
=========================================
${fullSummary}

=========================================
TARGET RATINGS TO GENERATE (EXACTLY IN THIS ORDER):
=========================================
${JSON.stringify(ratings)}

${customPrompt ? `ADMIN OPTIONAL NOTES (OPTIONAL INSPIRATION ONLY - DO NOT FORCE):\n${customPrompt}\n` : ''}

=========================================
HUMAN FREEDOM MANDATE — REAL HUMAN DIVERSITY (UNFORCED CREATION):
=========================================
CRITICAL INSTRUCTION: DO NOT force the reviews to follow any rigid formula, persona template, or repetitive checklist.
You are given the broad, complete app information above. Each review must feel like it was spontaneously written by an entirely different real human player who downloaded and played this game.

As real humans, players have spontaneous, independent reactions:
- One player might focus on a quick positive impression (e.g., table responsiveness, instant matching, clean card sort).
- Another player might talk about a casual evening playing with friends or family.
- Another player might comment on graphics, sound effects, or card dealing animation.
- Another player might mention how well it runs on their mobile phone (Redmi, Samsung, Vivo, OnePlus, etc.) without heating.
- Another player might talk about table speed, quick matching, or a specific variant they tried.
- Another player might write an ultra-short, natural 3-to-5 word reaction.
- Another player giving 3 or 4 stars might appreciate the gameplay while offering a thoughtful, balanced observation or suggestion.

YOU HAVE COMPLETE CREATIVE FREEDOM:
Draw naturally from ANY part of the broad app information above. Never repeat sentence openings or phrasing across reviews. Do not start multiple reviews with the same word. Let each comment reflect genuine, varied human spontaneity.

${languagePromptSection}

STRICT SAFETY SANITIZATION:
- ZERO financial or gambling terms permitted. FORBIDDEN WORDS: deposit, withdraw, cash, bonus, real money, jackpot, bet, wager, winnings, payout, earn money, rupees, ₹, inr, paisa.
- If referring to game stakes or rewards, use only: chips, practice coins, points, or tournament scores.

RETURN FORMAT:
Output ONLY a valid JSON array of objects. Each object must have:
- "userName": string
- "rating": number (matching the exact rating in order)
- "reviewText": string
- "date": string (e.g. "Yesterday", "2 days ago", "1 week ago", "Just now")

Do not wrap in markdown or backticks. Return raw JSON array only.`;

  const candidateModels = getCandidateModels(getActiveAiModel());

  for (const key of apiKeys) {
    const ai = new GoogleGenAI({ apiKey: key });

    for (const modelCandidate of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: prompt,
          config: {
            temperature: 0.9,
            topP: 0.95
          }
        });

        if (response && response.text) {
          let text = response.text.trim();
          const firstBracket = text.indexOf('[');
          const lastBracket = text.lastIndexOf(']');
          if (firstBracket >= 0 && lastBracket > firstBracket) {
            text = text.substring(firstBracket, lastBracket + 1);
          }

          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitizedReviews: Partial<ReviewRecord>[] = parsed.map((item: any, idx: number) => {
              const star = Math.max(1, Math.min(5, Number(item.rating) || ratings[idx] || 5));
              let commentText = String(item.reviewText || '').trim();

              BANNED_SAFETY_WORDS.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                if (regex.test(commentText)) {
                  commentText = commentText.replace(regex, 'chips');
                }
              });

              return {
                appId: String(app.id || app.slug || 'unknown').trim(),
                userId: 'brain1_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                userName: item.userName || `Player_${Math.floor(Math.random() * 9000) + 1000}`,
                rating: star,
                reviewText: sanitizeReviewText(commentText),
                helpfulCount: Math.floor(Math.random() * 18),
                status: 'pending',
                source: 'ai_generated',
                createdAt: new Date().toISOString(),
              };
            });

            return {
              reviews: sanitizedReviews,
              mode: 'local',
              modelUsed: modelCandidate,
              dossierHighlights: highlights,
              dossierStats,
              searchStatus: 'Dossier Analyzed & Grounded'
            };
          }
        }
      } catch (err: any) {
        console.warn(`[Brain 1 Dossier] Model ${modelCandidate} notice:`, err?.message || err);
      }
    }
  }

  // Resilient Zero-Failure Fallback: In case of API quota exhaustion, generate authentic grounded reviews from dossier
  console.warn("[Brain 1 Dossier] Remote Gemini generation could not complete. Executing resilient dossier fallback.");
  const fallbackReviews = generateAIReviewsForAppFallback(app, options);
  return {
    reviews: fallbackReviews,
    mode: 'local',
    modelUsed: 'Resilient Dossier Synthesizer (API Quota Safe)',
    dossierHighlights: highlights,
    dossierStats,
    searchStatus: 'Synthesized from App Dossier (Resilient Mode)'
  };
}

/**
 * BRAIN 2: Live Internet Web Researcher
 * Executes real-time Google Search grounding targeting Reddit, Play Store, and forums
 * to discover genuine player complaints, bugs, updates, and community chatter.
 */
export async function generateBrain2WebResearchReviews(
  appInput: any, 
  options: GenerateOptions
): Promise<AIReviewResultObject> {
  const app = hydrateAppDossier(appInput);
  const { count, targetScore, starMix, customPrompt } = options;

  const stepResult = await executeBrain2WebResearchStep(app, {
    count,
    targetScore,
    starMix: starMix ? {
      fiveStar: starMix.star5 || 0,
      fourStar: starMix.star4 || 0,
      threeStar: starMix.star3 || 0,
      twoStar: starMix.star2 || 0,
      oneStar: starMix.star1 || 0,
    } : undefined,
    customPrompt
  });

  return {
    reviews: stepResult.reviews,
    mode: 'research',
    modelUsed: stepResult.modelUsed,
    searchQueries: stepResult.searchQueries,
    groundedSources: stepResult.groundedSources,
    searchStatus: stepResult.searchStatus
  };
}

/**
 * Master dispatcher for AI Review Generation.
 * Returns an Array of reviews that ALSO has metadata properties attached,
 * ensuring 100% backward and forward compatibility.
 */
export async function generateAIReviewsForApp(
  appInput: any, 
  options: GenerateOptions
): Promise<any> {
  let result: AIReviewResultObject;

  if (options.mode === 'research') {
    result = await generateBrain2WebResearchReviews(appInput, options);
  } else {
    result = await generateBrain1DossierReviews(appInput, options);
  }

  // Create an array that also has all metadata properties attached to it!
  const returnList: any = [...result.reviews];
  returnList.reviews = result.reviews;
  returnList.mode = result.mode;
  returnList.modelUsed = result.modelUsed;
  returnList.searchQueries = result.searchQueries || [];
  returnList.groundedSources = result.groundedSources || [];
  returnList.searchStatus = result.searchStatus || 'Completed';
  returnList.dossierHighlights = result.dossierHighlights || [];

  return returnList;
}

export function generateAIReviewsForAppFallback(app: any, options: GenerateOptions): Partial<ReviewRecord>[] {
  const ratings = calculateRatingArray(options.count, options.targetScore, options.starMix);
  const appName = app?.name || 'Card Game';
  const developer = app?.developer || 'Studio';
  const isHinglish = options.languageStyle === 'hinglish';

  const userNamesEnglish = [
    'Rohan Mehta', 'Vikram S.', 'Pooja Sharma', 'Aditya Nair', 'Kunal Sen',
    'Neha Joshi', 'Siddharth Iyer', 'Ananya Roy', 'Rajesh K.', 'Amitabh D.',
    'Tanvi Patel', 'Gaurav Gill', 'Sneha V.', 'Manoj Pillai', 'Deepak Chauhan'
  ];

  const userNamesHinglish = [
    'Rohan_Gamer', 'Vikram_Bhai', 'Pooja99', 'Aditya_Pro', 'Kunal_Boss',
    'Neha_Sweet', 'Sid_RummyKing', 'Ananya_Cards', 'Rajesh_Delhi', 'Amitabh_007',
    'Tanvi_P', 'Gaurav_Speed', 'Sneha_Cool', 'Manoj_Player', 'Deepak_Winner'
  ];

  const namesPool = isHinglish ? userNamesHinglish : userNamesEnglish;

  const englishTemplatesByStar: Record<number, string[]> = {
    5: [
      `Really impressed by ${appName}. The UI transitions are smooth, matchmaking is fast, and table mechanics feel natural.`,
      `Excellent interface and stable connection even on mobile data. Kudos to ${developer} for this polished experience.`,
      `Very responsive card sorting and zero noticeable lag during long sessions. Easily one of the cleanest apps in this category.`,
      `Smooth controls, crisp visuals, and straightforward table selection. Works great without draining excessive battery.`
    ],
    4: [
      `Overall a solid experience with ${appName}. The gameplay is very fluid, just hoping the next update adds more custom card themes.`,
      `Great responsiveness and quick table joins. Occasionally takes a few extra seconds to reconnect after switching apps, but otherwise flawless.`,
      `Clean layout and intuitive rules. Performance is smooth, would just appreciate a toggle for low-power mode.`
    ],
    3: [
      `Decent performance and fair matchmaking, but the sound effects can get slightly repetitive. Good casual app overall.`,
      `Works well most of the time. Had a slight stutter during animations on an older handset, but manageable on newer devices.`
    ],
    2: [
      `UI is modern, but the app occasionally lags when returning from the background. Needs performance optimization for budget phones.`,
      `Good concept, but reconnection prompt took too long after a network switch. Hoping ${developer} pushes a fix soon.`
    ],
    1: [
      `Encountered animation freeze on the results screen. Needs a stability patch for Android 14.`
    ]
  };

  const hinglishTemplatesByStar: Record<number, string[]> = {
    5: [
      `Bhai ekdum mast game hai ${appName}! Smooth interface aur table animation bahut fast hai. Maza aa gaya.`,
      `Superb experience! Koi lag nahi, cards sorting ekdum quick hota hai. Best app for casual practice.`,
      `Bahut clean UI banaya hai ${developer} ne. Matchmaking fast hai aur background music bhi accha hai.`,
      `Mast gameplay! Network drop hone par bhi jaldi reconnect hota hai. Full 5 stars!`
    ],
    4: [
      `Accha app hai, graphics bahut badhiya hain. Bas ek suggestion hai ki battery optimization thoda improve karein.`,
      `Gameplay smooth hai aur rules clear hain. Thoda sound volume control aur detailed chahiye tha baki sab first class.`,
      `Overall badiya performance. Kabhi kabhi peak hours me thoda slow hota hai par normally smoothly chalta hai.`
    ],
    3: [
      `Theek-thaak app hai. Khelne me koi issue nahi hai par themes aur custom tables thode kam hain.`,
      `Average speed. Purane phone pe thoda warm hota hai par normal gameplay smooth hai.`
    ],
    2: [
      `App accha hai par update ke baad thoda stutter karta hai. Please fix loading time.`,
      `Network switch karne par reconnect hone me time lagta hai. Update required.`
    ],
    1: [
      `Frame drop aur animation freeze ho gaya tha match ke beech me. Stability improve karo.`
    ]
  };

  const templatesPool = isHinglish ? hinglishTemplatesByStar : englishTemplatesByStar;

  return ratings.map((star, idx) => {
    const starList = templatesPool[star] || templatesPool[5];
    const text = starList[idx % starList.length];
    const userName = namesPool[idx % namesPool.length];

    return {
      appId: String(app.id || app.slug || 'unknown').trim(),
      userId: `fallback_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
      userName: userName,
      rating: star,
      reviewText: sanitizeReviewText(text),
      helpfulCount: Math.floor(Math.random() * 14) + 1,
      status: 'pending',
      source: 'ai_generated',
      createdAt: new Date().toISOString()
    };
  });
}
