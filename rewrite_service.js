const fs = require('fs');

const code = `import { GoogleGenAI, Type } from "@google/genai";
import { ReviewRecord, sanitizeReviewText } from "./communityStoreService";

interface StarDistribution {
  star5?: number;
  star4?: number;
  star3?: number;
  star2?: number;
  star1?: number;
}

interface GenerateOptions {
  count: number;
  targetScore: number;
  starMix?: StarDistribution;
  toneFocus?: 'balanced' | 'performance' | 'gameplay' | 'ui_graphics' | 'casual';
  customPrompt?: string;
  mode?: 'local' | 'research';
}

export const BANNED_SAFETY_WORDS = [
  'deposit', 'withdraw', 'cash', 'bonus', 'real money', 'jackpot', 'bet', 
  'wager', 'winnings', 'payout', 'earn money', 'earning', 'bank account', 
  'rupees', 'inr', 'paisa', 'invest', 'financial'
];

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[\\s\\S]*?<\\/style>/gi, ' ')
    .replace(/<script[\\s\\S]*?<\\/script>/gi, ' ')
    .replace(/<\\/?[^>]+(>|$)/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\\s+/g, ' ')
    .trim();
}

function extractAppFeatureHighlights(app: any): string[] {
  const fullHtml = \`\${app?.description_html || ''} \${app?.features_html || ''} \${app?.custom_admin_box_html || ''}\`;
  const highlights: string[] = [];
  
  const headingMatches = fullHtml.match(/<h[234][^>]*>(.*?)<\\/h[234]>/gi);
  if (headingMatches) {
    headingMatches.forEach(h => {
      const clean = stripHtml(h);
      const isEditorial = /review|hands-on|verdict|breakdown|inside the game|how does it|actually perform/i.test(clean);
      if (clean && clean.length > 3 && clean.length < 80 && !isEditorial && !highlights.includes(clean)) {
        highlights.push(clean);
      }
    });
  }

  const listMatches = fullHtml.match(/<li[^>]*>(.*?)<\\/li>/gi) || fullHtml.match(/<strong>(.*?)<\\/strong>/gi);
  if (listMatches) {
    listMatches.slice(0, 8).forEach(li => {
      const clean = stripHtml(li);
      if (clean && clean.length > 5 && clean.length < 120 && !highlights.includes(clean)) {
        highlights.push(clean);
      }
    });
  }

  if (highlights.length < 3) {
    const plainSources = [app?.description, app?.features, app?.short_description, app?.seo_description].filter(Boolean).join('\\n');
    const lines = plainSources.split(/[\\r\\n•\\-\\*]/).map(s => stripHtml(s)).filter(s => s.length >= 10 && s.length <= 120);
    lines.forEach(l => {
      if (highlights.length < 8 && !highlights.includes(l)) {
        highlights.push(l);
      }
    });
  }
  return highlights;
}

function extractSpecificPhrasesFromApp(app: any): string[] {
  return extractAppFeatureHighlights(app);
}

function calculateRatingArray(count: number, targetScore: number, starMix?: StarDistribution): number[] {
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
    
    // Add some variance
    if (remainingCount > 1 && Math.random() > 0.5) {
        if (idealNext < 5 && Math.random() > 0.5) idealNext++;
        else if (idealNext > 1) idealNext--;
    }
    
    results.push(idealNext);
    currentSum += idealNext;
  }
  return results.sort((a, b) => b - a);
}

export async function generateAIReviewsForApp(appInput: any, options: GenerateOptions): Promise<Partial<ReviewRecord>[]> {
  const { count, targetScore, starMix, toneFocus = 'balanced', customPrompt } = options;

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
      console.warn("[AI Review Gen] Full app hydration warning:", e);
    }
  }

  const appName = app?.name || 'Card Game';
  const appCategory = app?.category || 'Casual, Card';
  const appDeveloper = app?.developer || 'Gaming Studio';
  const shortDesc = app?.short_description || app?.meta_description || app?.seo_description || '';
  
  const appSpecs = \`
- App Name: "\${appName}"
- Category: "\${appCategory}"
- Developer: "\${appDeveloper}"
- Current Store Benchmark Rating: \${app?.rating || targetScore} / 5.0
- App Size / Version: "\${app?.file_size || app?.size || 'Varies'} | V\${app?.version || '1.0'}"
  \`.trim();

  const ratings = calculateRatingArray(count, targetScore, starMix);
  const isResearchMode = options.mode === 'research';
  const apiKey = isResearchMode ? (process.env.GEMINI_RESEARCH_API_KEY || process.env.GEMINI_API_KEY) : process.env.GEMINI_API_KEY;
  
  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      let prompt = '';
      
      if (isResearchMode) {
        prompt = \`You are an elite Live Internet AI Researcher (Brain 2). Your task is to generate \${count} hyper-realistic user reviews for the Indian mobile game "\${appName}" by explicitly researching the web.

CRITICAL DIRECTIVE: YOU MUST USE GOOGLE SEARCH.
Search for things like "\${appName} game review", "\${appName} reddit", "\${appName} complaints", "\${appName} play store comments".
Synthesize what REAL PEOPLE are actually saying on the internet. DO NOT INVENT FAKE FEATURES.

FORMATTING RULES:
1. Target Ratings to generate exactly in this order: \${JSON.stringify(ratings)}.
2. Tone: Mix natural Indian-English and Hinglish. Do not make them sound robotic.
3. Content: Ground EVERY review in actual research results. Mention specific bugs, UI complaints, or praised features found online.

APP INFO:
\${appSpecs}

\${customPrompt ? \`CUSTOM INSTRUCTION:\\n\${customPrompt}\` : ''}

STRICT SAFETY RULES:
ZERO FINANCIAL WORDS: Never use deposit, withdraw, cash, bonus, real money, jackpot, bet, wager, winnings, payout, rupees, ₹.
DO NOT use markdown formatting. Output raw JSON array.\`;
      } else {
        const specificPhrases = extractSpecificPhrasesFromApp(app);
        prompt = \`You are Brain 1, an expert Deep Dossier AI engine. Your task is to analyze the deep context of the Indian app "\${appName}" and generate \${count} completely distinct, hyper-realistic user reviews.

APP INFO:
\${appSpecs}

KEY DOSSIER HIGHLIGHTS (EXTRACTED FROM APP PAGE):
\${specificPhrases.join('\\n')}

\${customPrompt ? \`CUSTOM INSTRUCTION:\\n\${customPrompt}\` : ''}

CRITICAL RULES:
1. DIVERSITY: Previous reviews were generic. You MUST vary the length, tone, and grammar. Include very short (2-3 word) punchy reviews, and 1-2 longer strategic ones.
2. HINGLISH: Use authentic Indian expressions naturally (mast, ekdum, bhai, timepass).
3. RATINGS: Generate exactly these ratings in order: \${JSON.stringify(ratings)}.
4. NO TEMPLATES: Do not start reviews with "Very", "Nice", "Good".
5. SAFETY: ZERO REAL MONEY WORDS (deposit, withdraw, cash, real money, bet, wager, ₹).

DO NOT use markdown formatting. Output raw JSON array.\`;
      }

      const config: any = {
        temperature: isResearchMode ? 0.6 : 0.9,
        topP: 0.9,
      };

      if (isResearchMode) {
        config.tools = [{ googleSearch: {} }];
      } else {
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              userName: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviewText: { type: Type.STRING },
              date: { type: Type.STRING }
            }
          }
        };
      }

      const candidateModels = isResearchMode 
        ? ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-2.5-pro"]
        : ["gemini-2.5-pro", "gemini-3.8-flash", "gemini-2.5-flash"];

      let response: any = null;
      let modelUsed = candidateModels[0];

      for (const modelCandidate of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents: prompt,
            config
          });
          modelUsed = modelCandidate;
          if (response && response.text) break;
        } catch (modelErr: any) {
          console.warn(\`[AI Review Gen] Attempt with model \${modelCandidate} notice:\`, modelErr?.message || modelErr);
        }
      }

      if (!response || !response.text) {
        throw new Error("All AI models failed to return content.");
      }

      let responseText = response.text;
      
      const firstBracket = responseText.indexOf('[');
      const lastBracket = responseText.lastIndexOf(']');
      if (firstBracket >= 0 && lastBracket > firstBracket) {
        responseText = responseText.substring(firstBracket, lastBracket + 1);
      }

      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const generatedReviews = parsed.map((item: any, idx: number) => {
            const star = Math.max(1, Math.min(5, Number(item.rating) || ratings[idx] || 5));
            let commentText = String(item.reviewText || '').trim();

            BANNED_SAFETY_WORDS.forEach(word => {
              const regex = new RegExp(\`\\\\b\${word}\\\\b\`, 'gi');
              if (regex.test(commentText)) {
                commentText = commentText.replace(regex, 'chips');
              }
            });

            return {
              appId: app.id || app.slug || 'unknown',
              userId: 'ai_bot_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              userName: item.userName || \`User\${Math.floor(Math.random() * 9000) + 1000}\`,
              rating: star,
              reviewText: sanitizeReviewText(commentText),
              helpfulCount: Math.floor(Math.random() * 15),
              status: 'pending',
              source: isResearchMode ? 'live_web_research' : 'ai_generated',
              createdAt: new Date().toISOString(),
            };
          });

          return generatedReviews as Partial<ReviewRecord>[];
        }
      }
    } catch (apiError) {
      console.error("[AI Review Gen] Critical API Error:", apiError);
    }
  }

  return generateAIReviewsForAppFallback(appInput, options);
}

export function generateAIReviewsForAppFallback(app: any, options: GenerateOptions): Partial<ReviewRecord>[] {
  const ratings = calculateRatingArray(options.count, options.targetScore, options.starMix);
  
  return ratings.map((star, idx) => {
    return {
      appId: String(app.id || app.slug || '').trim(),
      userName: 'User' + Math.floor(Math.random() * 9000 + 1000),
      rating: star,
      reviewText: 'Fallback generated review. Real AI generation failed.',
      helpfulCount: 0,
      status: 'pending',
      source: 'ai_generated'
    };
  });
}
`;

fs.writeFileSync('src/server/services/aiReviewGeneratorService.ts', code);
console.log('Successfully rewrote aiReviewGeneratorService.ts');
