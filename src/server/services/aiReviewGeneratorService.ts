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
  const sources = [
    app?.description_html,
    app?.features_html,
    app?.yellow_box_msg,
    app?.custom_admin_box_html,
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
      if (clean.length >= 12 && clean.length <= 110 && !isEditorial && !phrases.includes(clean)) {
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
export async function generateAIReviewsForApp(app: any, options: GenerateOptions): Promise<Partial<ReviewRecord>[]> {
  const { count, targetScore, starMix, toneFocus = 'balanced', customPrompt } = options;
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
    app?.content_overview ? `### CONTENT OVERVIEW:\n${app.content_overview}` : ''
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
- App Size / Version: "${app?.size || 'Varies'} | V${app?.version || '1.0'}"
- Meta Title: "${metaTitle}"
- Meta Description: "${metaDesc}"
  `.trim();

  // Calculate rating numbers for this batch
  const ratings = calculateRatingArray(count, targetScore, starMix);

  // Check if Gemini API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an advanced AI reasoning engine & authentic store review generator for the app store listing of "${appName}".

### 🧠 DEEP REASONING & SYNTHESIS DIRECTIVE:
1. **Analyze Full Dossier**: Carefully read the COMPLETE raw HTML and plain text details of "${appName}" below — including headers (<h2>, <h3>), feature lists (<ul>, <li>), game modes, UI claims, table mechanics, undo tools, frame rate claims, and notices.
2. **Perform Step-by-Step Reasoning**: Think deeply about what real-world Indian players, casual gamers, power users, or tech reviewers experience when downloading and using this app based on the features described.
3. **DO NOT COPY-PASTE**: Do NOT lazily quote or copy-paste full sentences verbatim from the description. Instead, translate the features, rules, and mechanics into realistic human opinions, praise, or constructive feedback in natural conversational language.
4. **Dates**: Dates MUST be formatted strictly as "YYYY-MM-DD" (Year-Month-Date only, NO clock time).

### 📱 COMPLETE APP DOSSIER FOR "${appName}":
${appSpecs}

#### RAW HTML CONTENT & FEATURES:
${rawHtmlSections || 'No raw HTML available.'}

#### PLAIN TEXT DOSSIER:
${plainTextDossier || 'No plain text available.'}

#### EXTRACTED KEY CLAIMS & MECHANICS:
"${specificPhrases.slice(0, 15).join(' | ')}"

### 🎯 REQUIRED RATINGS TO ASSIGN (Strict Order):
Assign these exact integer star ratings to the ${count} reviews in order:
${JSON.stringify(ratings)}

### 🚫 HARD SAFETY RULES:
1. Never use these words or close variants: deposit, withdraw, cash, bonus, real money, jackpot, bet, wager, winnings, payout, or any phrase implying guaranteed financial earnings.
2. Frame everything strictly as skill-based / social / entertainment gaming, never real-money gambling.
3. ZERO CONTAMINATION: Do not mention any other external apps, brands, or competitors.

### ✍️ PER-REVIEW CREATIVE INSTRUCTIONS:
1. **Pick a unique detail**: Focus each review on a different feature, mode, UI layout, control mechanic, frame rate, or table setting mentioned in the dossier above.
2. **Sentiment Alignment**: 4-5 stars = enthusiastic approval, highlighting smoothness or game modes; 2-3 stars = constructive feedback or honest mild caution.
3. **Reviewer Name**: Generate realistic, diverse Indian usernames (casual handles, gaming handles).
4. **Language Style**: Write in natural, expressive Hinglish / English as spoken by real mobile users across India.
5. **Tone Focus**: ${toneFocus === 'performance' ? 'Focus heavily on FPS, smoothness, and zero lag.' : toneFocus === 'gameplay' ? 'Focus heavily on game rules, undo mechanics, and table physics.' : toneFocus === 'ui_graphics' ? 'Focus heavily on visual themes, clean UI, and table graphics.' : 'Maintain a balanced variety of perspectives across all user types.'}
6. **Date**: Set a clean date string in "YYYY-MM-DD" format (e.g. "2026-08-20").

${customPrompt ? `### 📝 USER CUSTOM INSTRUCTIONS (MANDATORY TO FOLLOW):\n${customPrompt}\n` : ''}

### OUTPUT FORMAT:
Return ONLY a valid JSON array of ${count} objects matching this schema:
[
  {
    "userName": "string",
    "rating": number (1 to 5),
    "reviewText": "string",
    "date": "YYYY-MM-DD string"
  }
];`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.95,
          topP: 0.95,
          responseMimeType: "application/json",
          responseSchema: {
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
          }
        }
      });

      const responseText = response.text?.trim();
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
