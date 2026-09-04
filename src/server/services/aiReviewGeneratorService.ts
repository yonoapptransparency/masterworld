import { GoogleGenAI, Type } from "@google/genai";
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

// Centralized Banned-Word Safety Array (Strictly enforced in prompts and post-generation regex filters)
export const BANNED_SAFETY_WORDS = [
  'deposit', 'withdraw', 'cash', 'bonus', 'real money', 'jackpot', 'bet', 
  'wager', 'winnings', 'payout', 'earn money', 'earning', 'bank account', 
  'rupees', 'inr', 'paisa', 'invest', 'financial'
];

// Strip HTML tags for clean AI prompt comprehension
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract distinct feature sections, headings and bullet points from rich HTML and plain text
function extractAppFeatureHighlights(app: any): string[] {
  const fullHtml = `${app?.description_html || ''} ${app?.features_html || ''} ${app?.custom_admin_box_html || ''}`;
  const highlights: string[] = [];
  
  // Extract <h2>, <h3>, <h4> section headings
  const headingMatches = fullHtml.match(/<h[234][^>]*>(.*?)<\/h[234]>/gi);
  if (headingMatches) {
    headingMatches.forEach(h => {
      const clean = stripHtml(h);
      const isEditorial = /review|hands-on|verdict|breakdown|inside the game|how does it|actually perform/i.test(clean);
      if (clean && clean.length > 3 && clean.length < 80 && !isEditorial && !highlights.includes(clean)) {
        highlights.push(clean);
      }
    });
  }

  // Extract <li> list items or <strong> feature callouts
  const listMatches = fullHtml.match(/<li[^>]*>(.*?)<\/li>/gi) || fullHtml.match(/<strong>(.*?)<\/strong>/gi);
  if (listMatches) {
    listMatches.slice(0, 8).forEach(li => {
      const clean = stripHtml(li);
      if (clean && clean.length > 5 && clean.length < 120 && !highlights.includes(clean)) {
        highlights.push(clean);
      }
    });
  }

  // Fallback to plain text bullets or line breaks if HTML tags yielded few highlights
  if (highlights.length < 3) {
    const plainSources = [app?.description, app?.features, app?.short_description, app?.seo_description].filter(Boolean).join('\n');
    const lines = plainSources.split(/[\r\n•\-\*]/).map(s => stripHtml(s)).filter(s => s.length >= 10 && s.length <= 120);
    lines.forEach(l => {
      if (highlights.length < 8 && !highlights.includes(l)) {
        highlights.push(l);
      }
    });
  }

  return highlights;
}

// Calculate discrete star ratings for N reviews that average to targetScore
function calculateRatingArray(count: number, targetScore: number, starMix?: StarDistribution): number[] {
  if (count <= 0) return [];
  
  // If custom percentages are provided, use them
  if (starMix && (starMix.star5 || starMix.star4 || starMix.star3 || starMix.star2 || starMix.star1)) {
    const s5 = Number(starMix.star5) || 0;
    const s4 = Number(starMix.star4) || 0;
    const s3 = Number(starMix.star3) || 0;
    const s2 = Number(starMix.star2) || 0;
    const s1 = Number(starMix.star1) || 0;
    const totalWeight = s5 + s4 + s3 + s2 + s1;
    
    if (totalWeight > 0) {
      const counts = [
        { rating: 5, num: Math.round((s5 / totalWeight) * count) },
        { rating: 4, num: Math.round((s4 / totalWeight) * count) },
        { rating: 3, num: Math.round((s3 / totalWeight) * count) },
        { rating: 2, num: Math.round((s2 / totalWeight) * count) },
        { rating: 1, num: Math.round((s1 / totalWeight) * count) },
      ];
      
      const ratings: number[] = [];
      counts.forEach(item => {
        for (let i = 0; i < item.num; i++) {
          ratings.push(item.rating);
        }
      });
      
      // Adjust if rounding created a length mismatch
      while (ratings.length < count) ratings.push(5);
      while (ratings.length > count) ratings.pop();
      return ratings;
    }
  }

  // Automatic mathematical distribution matching targetScore (e.g. 4.8, 4.6, 4.2)
  const clampedTarget = Math.max(2.0, Math.min(5.0, targetScore));
  const ratings: number[] = [];

  for (let i = 0; i < count; i++) {
    // Generate natural probabilities centered around the target score
    const rand = Math.random();
    if (clampedTarget >= 4.7) {
      // Very high rating (~4.7-4.9): 75% 5-star, 20% 4-star, 5% 3-star
      if (rand < 0.75) ratings.push(5);
      else if (rand < 0.95) ratings.push(4);
      else ratings.push(3);
    } else if (clampedTarget >= 4.4) {
      // High rating (~4.4-4.6): 60% 5-star, 30% 4-star, 8% 3-star, 2% 2-star
      if (rand < 0.60) ratings.push(5);
      else if (rand < 0.90) ratings.push(4);
      else if (rand < 0.98) ratings.push(3);
      else ratings.push(2);
    } else if (clampedTarget >= 4.0) {
      // Moderate rating (~4.0-4.3): 45% 5-star, 35% 4-star, 15% 3-star, 5% 2-star
      if (rand < 0.45) ratings.push(5);
      else if (rand < 0.80) ratings.push(4);
      else if (rand < 0.95) ratings.push(3);
      else ratings.push(2);
    } else {
      // Lower rating (~3.0-3.9): balanced mix with more 3s and 2s
      if (rand < 0.30) ratings.push(5);
      else if (rand < 0.60) ratings.push(4);
      else if (rand < 0.85) ratings.push(3);
      else ratings.push(2);
    }
  }

  // Fine-tune to hit target average closely
  const currentSum = ratings.reduce((a, b) => a + b, 0);
  const targetSum = Math.round(clampedTarget * count);
  let diff = targetSum - currentSum;

  for (let i = 0; i < ratings.length && diff !== 0; i++) {
    if (diff > 0 && ratings[i] < 5) {
      ratings[i]++;
      diff--;
    } else if (diff < 0 && ratings[i] > 2) {
      ratings[i]--;
      diff++;
    }
  }

  return ratings;
}

// Generate realistic Indian & global usernames with high diversity and zero repetition
const USERNAME_TEMPLATES = [
  'Rahul Sharma', 'Vikas Verma', 'Amit Trivedi', 'Pooja Patel', 'Sneha_Gamer',
  'Rohit Kumar', 'Deepak_07', 'Karan Mehta', 'Ankit Singh', 'Sanjay Rajput',
  'Arun Varma', 'Manish_R', 'Priya Roy', 'Aditya Joshi', 'Kavita_99',
  'Nikhil_K', 'Gaurav Das', 'Suresh Reddy', 'Mohit_GamerX', 'Rajesh K.',
  'Pankaj_01', 'Abhishek Dubey', 'Ritu_Sharma', 'Vikram_Singh', 'Harish Nair',
  'Sunil Choudhary', 'Dinesh_Pro', 'Anand_Play', 'Manoj Kumar', 'Ajay_Tech',
  'Kunal Roy', 'Rakesh_Dev', 'Alok Verma', 'Tanmay_7', 'Saurabh J.',
  'Neha_S', 'Riya_Gupta', 'Isha_Singh', 'Kritika_M', 'Simran_Kaur',
  'Akash_Deep', 'Ravi_Shankar', 'Suraj_Prasad', 'Vijay_Kumar', 'Ramesh_G',
  'Sandeep_Yadav', 'Ranjan_B', 'Ashish_T', 'Nitin_S', 'Prashant_K',
  'Tushar_Gamer', 'Gagan_Playz', 'Bipin_R', 'Hemant_S', 'Lokesh_M',
  'Gautam_D', 'Sumit_Bhai', 'Yogesh_Gaming', 'Tarun_Kumar', 'Naveen_R',
  'Mohd_Ali', 'Imran_Khan', 'Tariq_Ahmed', 'Sameer_S', 'Rizwan_M',
  'Abdul_Rahman', 'Zaid_Khan', 'Faisal_A', 'Waseem_Akram', 'Nadim_P',
  'Arif_M', 'Salman_K', 'Shoaib_M', 'Junaid_A', 'Iqbal_S',
  'ProPlayer99', 'King_Rahul', 'Master_Ankit', 'Sniper_Vikas', 'Gaming_Beast',
  'Lone_Wolf_IND', 'Ninja_Gamer', 'Shadow_Hunter', 'Mortal_Soul', 'Viper_X',
  'Dark_Knight', 'Ghost_Rider', 'Thunder_Bolt', 'Alpha_Male', 'Beta_Tester',
  'Crazy_Gamer', 'Desi_Boy', 'Cool_Dude', 'Smart_Boy', 'Bad_Boy',
  'Sweet_Girl', 'Angel_Priya', 'Cute_Munda', 'Desi_Girl', 'Punjabi_Munda',
  'Gujrati_Boy', 'Marathi_Manus', 'South_Indian_Gamer', 'Delhi_Bhai', 'Mumbai_Don',
  'Adarsh_99', 'Akshay_V', 'Bhavna_P', 'Chirag_S', 'Darshan_K',
  'Esha_N', 'Farhan_Q', 'Geeta_M', 'Himanshu_R', 'Jatin_B',
  'Kiran_L', 'Lavanya_S', 'Mehul_T', 'Nupur_G', 'Omkar_P',
  'Parul_J', 'Qasim_H', 'Rashmi_K', 'Siddharth_M', 'Tejas_W',
  'Udit_V', 'Varun_K', 'Yash_N', 'Zoya_K', 'Aftab_Alam',
  'Bhanu_Pratap', 'Chetan_B', 'Divya_Shree', 'Farooq_M', 'Gopal_K'
];

function getRandomUserName(index: number): string {
  // Combine index, Math.random, and timestamp seed to guarantee absolute diversity
  const randIdx = Math.floor(Math.random() * USERNAME_TEMPLATES.length);
  const base = USERNAME_TEMPLATES[(index * 13 + randIdx + Math.floor(Math.random() * 50)) % USERNAME_TEMPLATES.length];
  
  const dice = Math.random();
  if (dice > 0.6) {
    const num = Math.floor(Math.random() * 9500) + 120;
    return `${base.replace(/\s+/g, '_').toLowerCase()}_${num}`;
  } else if (dice > 0.3) {
    const num = Math.floor(Math.random() * 90) + 11;
    return `${base.replace(/\s+/g, '')}${num}`;
  }
  return base;
}

// Generate staggered clean dates (YYYY-MM-DD) over the last 2 to 90 days without clock time
function getRandomPastDate(index: number, total: number): string {
  const now = Date.now();
  const minDays = 2;
  const maxDays = 90;
  const dayOffset = minDays + (index * ((maxDays - minDays) / Math.max(1, total))) + (Math.random() * 2);
  const dateMs = now - (dayOffset * 24 * 60 * 60 * 1000);
  const d = new Date(dateMs);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get today's clean date string (YYYY-MM-DD)
function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extract specific phrases, feature sentences, and description callouts directly from the app
 */
export function extractAppDossierFacts(app: any): string[] {
  const faqTexts = Array.isArray(app?.faqs) 
    ? app.faqs.map((f: any) => `${f.question || f.q || ''} ${f.answer || f.a || ''}`).join(' ')
    : '';

  const sources = [
    app?.description_html,
    app?.features_html,
    app?.yellow_box_msg,
    app?.red_box_msg,
    app?.idea_box_msg,
    app?.custom_admin_box_html,
    app?.custom_admin_box_heading,
    app?.release_notes,
    app?.content_overview,
    faqTexts,
    app?.short_description,
    app?.description,
    app?.features,
    app?.seo_description
  ].map(s => stripHtml(s || '')).filter(Boolean);

  const phrases: string[] = [];
  sources.forEach(source => {
    // Split into sentences or clause bullet points
    const chunks = source.split(/(?<=[.!?])\s+|[\r\n•\-\*]/);
    chunks.forEach(c => {
      const clean = c.trim();
      const isEditorial = /review|hands-on|verdict|breakdown|inside the game|how does it|actually perform/i.test(clean);
      if (clean.length >= 10 && clean.length <= 120 && !isEditorial && !phrases.includes(clean)) {
        phrases.push(clean);
      }
    });
  });

  return phrases;
}

function extractSpecificPhrasesFromApp(app: any): string[] {
  return extractAppDossierFacts(app);
}

/**
 * Service to generate 100% human-like app reviews using Gemini API
 */
export async function generateAIReviewsForApp(appInput: any, options: GenerateOptions): Promise<Partial<ReviewRecord>[]> {
  const { count, targetScore, starMix, toneFocus = 'balanced', customPrompt } = options;

  // Hydrate full app details if app object is missing rich content fields
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
  
  // Assemble full RAW HTML and plain text dossiers without artificial length restrictions
  const rawHtmlSections = [
    app?.description_html ? `### RAW APP DESCRIPTION (HTML):\n${app.description_html}` : '',
    app?.features_html ? `### RAW FEATURE BREAKDOWN (HTML):\n${app.features_html}` : '',
    app?.custom_admin_box_html ? `### CUSTOM ADMIN / SPECIAL NOTICES (HTML):\n${app.custom_admin_box_html}` : '',
    app?.yellow_box_msg ? `### NOTICE / HIGHLIGHT BOX (HTML):\n${app.yellow_box_msg}` : '',
    app?.red_box_msg ? `### CRITICAL NOTICE / RED BOX (HTML):\n${app.red_box_msg}` : '',
    app?.idea_box_msg ? `### IDEA / HIGHLIGHT BOX (HTML):\n${app.idea_box_msg}` : '',
    app?.content_overview ? `### CONTENT OVERVIEW:\n${app.content_overview}` : '',
    app?.release_notes ? `### RELEASE NOTES / WHAT'S NEW:\n${app.release_notes}` : '',
    Array.isArray(app?.faqs) && app.faqs.length > 0 ? `### FREQUENTLY ASKED QUESTIONS:\n${app.faqs.map((f: any) => `Q: ${f.question || f.q || ''}\nA: ${f.answer || f.a || ''}`).join('\n')}` : ''
  ].filter(Boolean).join('\n\n');

  const plainTextDossier = [
    app?.description ? `Plain Text Description:\n${app.description}` : '',
    app?.features ? `Plain Text Features:\n${app.features}` : '',
    app?.short_description ? `Short Description:\n${app.short_description}` : '',
    app?.seo_description ? `SEO Meta Description:\n${app.seo_description}` : ''
  ].filter(Boolean).join('\n\n');

  const specificPhrases = extractSpecificPhrasesFromApp(app);
  const metaTitle = app?.seo_title || app?.name || '';
  const metaDesc = app?.seo_description || app?.meta_description || '';

  // App specs and metadata
  const appSpecs = `
- App Name: "${appName}"
- Slug / ID: "${app?.slug || app?.id}"
- Category: "${appCategory}"
- Developer: "${appDeveloper}"
- Package / App ID: "${app?.package_name || app?.app_id || 'N/A'}"
- Current Store Benchmark Rating: ${app?.rating || targetScore} / 5.0
- App Size / Version: "${app?.file_size || app?.size || 'Varies'} | V${app?.version || '1.0'}"
- Safety Status: "${app?.safety_status || 'Verified Clean'}"
- Meta Title: "${metaTitle}"
- Meta Description: "${metaDesc}"
  `.trim();

  // Calculate rating numbers for this batch
  const ratings = calculateRatingArray(count, targetScore, starMix);

  const isResearchMode = options.mode === 'research';
  // Use the specific API key for research mode if provided, otherwise fallback to standard
  const apiKey = isResearchMode ? (process.env.GEMINI_RESEARCH_API_KEY || process.env.GEMINI_API_KEY) : process.env.GEMINI_API_KEY;
  
  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey });

      let prompt = '';
      if (isResearchMode) {
        prompt = `You are a Live Internet Scraper and AI Researcher. Your task is to generate ${count} ultra-realistic user reviews for the app "${appName}" by finding REAL reviews on the internet.

### 🧠 CRITICAL DIRECTIVE: LIVE WEB RESEARCH
You MUST use the Google Search tool to search for real user reviews, comments on Google Play Store, App Store, Reddit, Quora, or gaming forums about the app "${appName}".
Do NOT invent fake reviews. You can copy-paste real reviews directly or slightly paraphrase them to fit the required star ratings.

### STEP 1: GATHER REAL INFORMATION
Search for: "${appName} app review", "${appName} game play store reviews", "${appName} reddit comments".
Read the search results to find out what real people are saying. What are their actual complaints? What do they actually praise?

### STEP 2: FORMAT INTO REVIEWS
Select or adapt the real comments you found to match EXACTLY these star ratings in this exact order: ${JSON.stringify(ratings)}.
- Maintain the original tone, grammar mistakes, and Hinglish/English style used by the real reviewers on the internet.
- Create realistic Indian usernames for each review.
- NEVER start multiple reviews with the same word. Force extreme variety.

### 📱 APP DOSSIER FOR CONTEXT:
${appSpecs}

### 🚫 HARD SAFETY RULES (MANDATORY):
1. ZERO FINANCIAL WORDS: Never use deposit, withdraw, cash, bonus, real money, jackpot, bet, wager, winnings, payout, rupees, ₹. 
2. ZERO CONTAMINATION: Do not mention other app names.

### OUTPUT FORMAT:
Return ONLY a valid JSON array of exactly ${count} objects. No markdown formatting.
[
  {
    "userName": "string",
    "rating": number (1 to 5),
    "reviewText": "string",
    "date": "YYYY-MM-DD string"
  }
]`;
      } else {
        prompt = `You are a highly advanced AI analyzing the store listing for the app "${appName}". Your task is to generate ${count} ultra-realistic user reviews. 

### 🧠 CRITICAL DIRECTIVE: AVOID "AI LOOPING" & REPETITION
Your previous outputs suffered from "AI looping"—using the same sentence structures, similar commentary, and identical examples across different reviews. You must BREAK this habit. 
To prove you have a "bright brain", you must invent a COMPLETELY DIFFERENT real-world situation, personality, and focus for EVERY SINGLE REVIEW. No two reviews should sound like they were written by the same person.

### STEP 1: DEEP DOSSIER COMPREHENSION
Read everything provided in the dossier below. Do not skim.
- Find obscure features, specific game modes, UI details, and performance claims to inject into the reviews.

### STEP 2: HYPER-SPECIFIC SITUATIONAL ROLEPLAY
For each of the ${count} reviews, adopt a completely unique scenario. Force extreme variety. Real humans write differently.
- **Example angles (DO NOT reuse these exactly, invent your own)**: A user who plays on a train commute, a user comparing to an older version, a user strictly complaining about battery drain on a specific old phone, a user who loves a highly specific game mode.
- **Vary Length Drastically**: Some reviews should be 2 words ("Op app", "mast app"). Some should be 3-4 meandering sentences.
- **Vary Grammar/Spelling**: Real people make typos. Use lowercase sometimes. Use poor grammar on purpose for 30% of reviews (e.g., "plz update this", "wrost expirence").
- **Language**: Mix pure English with Indian Hinglish (e.g., "bhai ek number app hai", "time pass ke liye best").
- **Repetition Ban**: NEVER start multiple reviews with the same word. NEVER use the same phrase twice. NEVER use corporate marketing speak.

### STEP 3: CONTENT INJECTION (PROVE YOU READ THE DESCRIPTION)
- Do not just say "the game is good". Explicitly mention the specific game modes, features, or UI elements you found in the description. 

### STEP 4: RATING SENTIMENT ALIGNMENT (${JSON.stringify(ratings)})
You must strictly assign the exact integer star ratings requested in order: ${JSON.stringify(ratings)}.
- 5 stars: Absolute praise, specific feature shoutouts.
- 4 stars: Great but with a minor issue or feature request.
- 3 stars: Average, neutral, or experiencing a bug.
- 2/1 stars: Frustrated with a specific bug, lag, or UI issue.

### 📱 COMPLETE APP DOSSIER FOR "${appName}":
${appSpecs}

#### RAW HTML CONTENT & FEATURES (READ THIS CAREFULLY):
${rawHtmlSections || 'No raw HTML available.'}

#### PLAIN TEXT DOSSIER:
${plainTextDossier || 'No plain text available.'}

#### EXTRACTED KEY CLAIMS & MECHANICS:
"${specificPhrases.join(' | ')}"

### 🚫 HARD SAFETY RULES (MANDATORY):
1. ZERO FINANCIAL WORDS: Never use deposit, withdraw, cash, bonus, real money, jackpot, bet, wager, winnings, payout, rupees, ₹. 
2. Frame everything as free-to-play, casual entertainment, or skill gaming.
3. ZERO CONTAMINATION: Do not mention other app names.

### ✍️ TONE & CUSTOM INSTRUCTIONS:
Tone Focus: ${toneFocus === 'performance' ? 'Focus heavily on FPS, smoothness, lag, and phone heating.' : toneFocus === 'gameplay' ? 'Focus heavily on game rules, card dealing, matchmaking, and features.' : toneFocus === 'ui_graphics' ? 'Focus heavily on visual themes, UI buttons, sound, and graphics.' : 'Maintain a chaotic, highly varied mix of perspectives (some short, some long).'}
${customPrompt ? `\nUSER CUSTOM INSTRUCTIONS (FOLLOW STRICTLY):\n${customPrompt}\n` : ''}

### OUTPUT FORMAT:
Return ONLY a valid JSON array of exactly ${count} objects. No markdown formatting.
[
  {
    "userName": "string",
    "rating": number (1 to 5),
    "reviewText": "string",
    "date": "YYYY-MM-DD string"
  }
]`;
      }

      const config: any = {
        temperature: isResearchMode ? 0.7 : 1.15,
        topP: 0.95,
      };

      if (isResearchMode) {
        config.thinkingConfig = { thinkingLevel: "HIGH" }; // Use thinking mode for better reasoning
      } else {
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              userName: { type: Type.STRING },
              rating: { type: Type.INTEGER },
              reviewText: { type: Type.STRING },
              date: { type: Type.STRING }
            },
            required: ["userName", "rating", "reviewText"]
          }
        };
      }

      const response = await ai.models.generateContent({
        model: isResearchMode ? "gemini-3.7-flash" : "gemini-2.5-pro",
        contents: prompt,
        config
      });

      let responseText = response.text?.trim() || "";
      
      // Robust JSON parsing to handle grounding citations or markdown blocks
      if (responseText.includes('```json')) {
        responseText = responseText.split('```json')[1].split('```')[0].trim();
      } else if (responseText.includes('```')) {
        responseText = responseText.split('```')[1].split('```')[0].trim();
      }
      
      // Remove potential search grounding citations at the end of the text
      const firstBracket = responseText.indexOf('[');
      const lastBracket = responseText.lastIndexOf(']');
      if (firstBracket >= 0 && lastBracket > firstBracket) {
        responseText = responseText.substring(firstBracket, lastBracket + 1);
      }

      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Banned word validation layer
          return parsed.map((item: any, idx: number) => {
            const star = Math.max(1, Math.min(5, Number(item.rating) || ratings[idx] || 5));
            let commentText = String(item.reviewText || '').trim();

            // Run banned-word safety check
            BANNED_SAFETY_WORDS.forEach(word => {
              const regex = new RegExp(`\\b${word}\\b`, 'gi');
              if (regex.test(commentText)) {
                commentText = commentText.replace(regex, 'gameplay');
              }
            });

            const safeText = sanitizeReviewText(commentText, app.name);
            const cleanDate = item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date) 
              ? item.date 
              : getRandomPastDate(idx, count);

            return {
              appId: String(app.id || app.slug || '').trim(),
              appSlug: String(app.slug || '').trim(),
              appName: String(app.name || '').trim(),
              userName: String(item.userName || getRandomUserName(idx)).trim(),
              rating: star,
              reviewText: safeText,
              timestamp: cleanDate, // Clean YYYY-MM-DD date!
              status: 'published',
              helpful_count: Math.max(0, Math.floor(Math.random() * 15)),
              source: 'ai_generated',
              isPinned: false
            };
          });
        }
      }
    } catch (err: any) {
      console.warn("[AI Review Gen] Gemini API call error, falling back to contextual generator:", err?.message || err);
    }
  }

  // Contextual High-Quality Fallback Generator
  return generateContextualFallbackReviews(app, ratings);
}

// Algorithmic contextual fallback generator that directly synthesizes natural human reviews from the app's real facts
function generateContextualFallbackReviews(app: any, ratings: number[]): Partial<ReviewRecord>[] {
  const appName = app?.name || 'this app';
  const rawPhrases = extractSpecificPhrasesFromApp(app);

  // Clean phrases into natural lower-case fragments without punctuation or quotes
  const cleanPhrases = rawPhrases.map(p => {
    return p.replace(/^[^\w]+|[^\w]+$/g, '').replace(/["']/g, '').trim();
  }).filter(p => p.length > 5 && p.length < 80);

  const p1 = cleanPhrases[0] || `${appName} has very smooth controls and quick dealing`;
  const p2 = cleanPhrases[1] || `the table animations and UI layout look super clean`;
  const p3 = cleanPhrases[2] || `fast matchmaking with zero lag during card games`;
  const p4 = cleanPhrases[3] || `lightweight installation and fast loading speed`;

  const reviews5Star = [
    `Honestly impressed with ${appName}! The gameplay feels very responsive and ${p1.toLowerCase()} is super smooth. 🔥`,
    `Really smooth experience playing ${appName}. ${p2.toLowerCase()} makes it a joy to play every evening.`,
    `Extremely well optimized app! Tested for a few matches today and ${p3.toLowerCase()} worked flawlessly. Great job! 👍`,
    `Super fluid performance on my device. ${appName} loads fast and ${p4.toLowerCase()} is really convenient. 5 stars!`,
    `Best app for casual card gaming! Clean design, zero lag, and very intuitive interface.`
  ];

  const reviews4Star = [
    `Good experience overall with ${appName}. The game runs nicely and ${p1.toLowerCase()} is well designed. Hope for more themes soon.`,
    `Solid and reliable app! ${p2.toLowerCase()} works well as described. Minor visual polish would make it 5 stars. 👌`,
    `Enjoyed playing ${appName} with friends. Very fast card dealing and clean table layouts.`
  ];

  const reviews3Star = [
    `App is decent overall and ${p1.toLowerCase()} works fine, but connection takes a bit longer on weak mobile signals.`,
    `Nice table design and concept, but battery consumption could be slightly better during long sessions.`
  ];

  const reviews2Star = [
    `The interface looks fine, but text size on compact screens feels slightly small during fast matches.`,
    `Decent graphics, but needs better frame rate optimization for older budget devices.`
  ];

  return ratings.map((star, idx) => {
    let text = '';
    if (star === 5) {
      text = reviews5Star[idx % reviews5Star.length];
    } else if (star === 4) {
      text = reviews4Star[idx % reviews4Star.length];
    } else if (star === 3) {
      text = reviews3Star[idx % reviews3Star.length];
    } else {
      text = reviews2Star[idx % reviews2Star.length];
    }

    return {
      appId: String(app.id || app.slug || '').trim(),
      appSlug: String(app.slug || '').trim(),
      appName: String(app.name || '').trim(),
      userName: getRandomUserName(idx),
      rating: star,
      reviewText: sanitizeReviewText(text, app.name),
      timestamp: getRandomPastDate(idx, ratings.length), // Clean YYYY-MM-DD date!
      status: 'published',
      helpful_count: Math.floor(Math.random() * 8),
      source: 'ai_generated',
      isPinned: false
    };
  });
}
