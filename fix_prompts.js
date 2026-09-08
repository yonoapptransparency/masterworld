const fs = require('fs');
let file = fs.readFileSync('src/server/services/aiReviewGeneratorService.ts', 'utf8');

// We will replace the entire generateAIReviewsForApp function
const newFunc = `export async function generateAIReviewsForApp(appInput: any, options: GenerateOptions): Promise<Partial<ReviewRecord>[]> {
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
  
  // App specs and metadata
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
DO NOT use markdown formatting. Output raw JSON.\`;
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

DO NOT use markdown formatting. Output raw JSON.\`;
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

  return [];
}`;

const startIdx = file.indexOf('export async function generateAIReviewsForApp');
const endIdx = file.lastIndexOf('return [];\n}') + 12;

if (startIdx !== -1) {
  const newFile = file.substring(0, startIdx) + newFunc + file.substring(endIdx);
  fs.writeFileSync('src/server/services/aiReviewGeneratorService.ts', newFile);
  console.log("Updated aiReviewGeneratorService.ts");
} else {
  console.log("Could not find function start");
}
