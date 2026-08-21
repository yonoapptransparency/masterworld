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

// Extract distinct feature sections, headings and bullet points from rich HTML
function extractAppFeatureHighlights(app: any): string[] {
  const fullHtml = `${app?.description_html || ''} ${app?.features_html || ''} ${app?.custom_admin_box_html || ''}`;
  const highlights: string[] = [];
  
  // Extract <h2> and <h3> section headings
  const headingMatches = fullHtml.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi);
  if (headingMatches) {
    headingMatches.forEach(h => {
      const clean = stripHtml(h);
      if (clean && clean.length > 3 && !highlights.includes(clean)) {
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

// Generate realistic Indian & global usernames
const USERNAME_TEMPLATES = [
  'Rahul Sharma', 'Vikas Verma', 'Amit Trivedi', 'Pooja Patel', 'Sneha_Gamer',
  'Rohit Kumar', 'Deepak_07', 'Karan Mehta', 'Ankit Singh', 'Sanjay Rajput',
  'Arun Varma', 'Manish_R', 'Priya Roy', 'Aditya Joshi', 'Kavita_99',
  'Nikhil_K', 'Gaurav Das', 'Suresh Reddy', 'Mohit_GamerX', 'Rajesh K.',
  'Pankaj_01', 'Abhishek Dubey', 'Ritu_Sharma', 'Vikram_Singh', 'Harish Nair',
  'Sunil Choudhary', 'Dinesh_Pro', 'Anand_Play', 'Manoj Kumar', 'Ajay_Tech',
  'Kunal Roy', 'Rakesh_Dev', 'Alok Verma', 'Tanmay_7', 'Saurabh J.'
];

function getRandomUserName(index: number): string {
  const base = USERNAME_TEMPLATES[(index + Math.floor(Math.random() * USERNAME_TEMPLATES.length)) % USERNAME_TEMPLATES.length];
  // Occasionally add random digits or handle style
  if (Math.random() > 0.6) {
    const num = Math.floor(Math.random() * 90) + 10;
    return `${base.replace(/\s+/g, '_').toLowerCase()}${num}`;
  }
  return base;
}

// Generate staggered ISO timestamps over the last 5 to 90 days
function getRandomPastDate(index: number, total: number): string {
  const now = Date.now();
  // Stagger across days
  const minDays = 2;
  const maxDays = 90;
  const dayOffset = minDays + (index * ((maxDays - minDays) / Math.max(1, total))) + (Math.random() * 3);
  const dateMs = now - (dayOffset * 24 * 60 * 60 * 1000) - (Math.floor(Math.random() * 43200) * 1000);
  return new Date(dateMs).toISOString();
}

/**
 * Service to generate 100% human-like app reviews using Gemini API
 */
export async function generateAIReviewsForApp(app: any, options: GenerateOptions): Promise<Partial<ReviewRecord>[]> {
  const { count, targetScore, starMix, toneFocus = 'balanced', customPrompt } = options;
  const appName = app?.name || 'Card Game';
  const appCategory = app?.category || 'Casual, Card';
  const appDeveloper = app?.developer || 'Gaming Studio';
  const rawDesc = stripHtml(app?.description_html || app?.description || '');
  const rawFeatures = stripHtml(app?.features_html || app?.features || '');
  const rawSafety = stripHtml(app?.safety_boxes?.join(' ') || app?.custom_admin_box_html || '');
  const featureHighlights = extractAppFeatureHighlights(app);
  const appFileSize = app?.file_size || 'Lightweight APK';

  // Calculate rating numbers for this batch
  const ratings = calculateRatingArray(count, targetScore, starMix);

  // Check if Gemini API key exists
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are a real-world mobile gamer, tactical player, and app store user review synthesizer.
Your goal is to write exactly ${count} authentic, vibrant, completely unique, 100% human-written reviews for this Android application.

### DETAILED APP SPECIFICATIONS (READ CAREFULLY & EXTRACT SPECIFIC CONCEPTS):
- App Name: "${appName}"
- Category / Genre: "${appCategory}"
- Studio / Developer: "${appDeveloper}"
- Download Size: "${appFileSize}"
- Tone / Focus Preference: "${toneFocus}"

### FULL APP DESCRIPTION (The admin has written every detail here):
"""
${rawDesc.substring(0, 3000)}
"""

### KEY FEATURES, GAME MODES & MECHANICS:
"""
${rawFeatures.substring(0, 2000)}
${featureHighlights.length > 0 ? `\nExtracted Feature Highlights:\n- ` + featureHighlights.join('\n- ') : ''}
"""
${rawSafety ? `### ADDITIONAL APP CONTEXT / NOTES:\n"""\n${rawSafety.substring(0, 1000)}\n"""` : ''}

### REQUIRED RATINGS TO ASSIGN (Strict):
Assign these exact integer star ratings to the ${count} reviews in order:
${JSON.stringify(ratings)}

### STRICT POLICY / SAFETY NEGATIVE CONSTRAINTS (MANDATORY):
- ABSOLUTELY NEVER mention "money", "real money", "cash", "rupees", "INR", "deposit", "withdrawal", "wallet payout", "earning", "bank account", "bonus cash", "paisa", "invest", "betting", or financial transactions.
- Instead, ground your reviews deeply in the ACTUAL mechanics, features, game modes, and descriptions provided above.

### DIVERSITY, CREATIVITY & DEEP FEATURE ANGLE MANDATES (CRUCIAL):
Every single review in this batch MUST take a DIFFERENT, CREATIVE ANGLE from the app's detailed description:
1. **Specific In-App Features & Quality of Life**: Point out specific buttons/features described in the text (e.g. Undo option, Blind bid mode, Super 8 challenge, Card history log, Auto-sort suits, Discard pile viewer, Timer extensions, Reconnect buffer, Table skin choices, Avatar selections).
2. **Game Modes & Rule Variants**: Mention specific game modes described (e.g. 13-Card table, Point/Deal/Pool tables, 7 Up 7 Down, Callbreak Spade Trump, Dragon vs Tiger, Ludo 4-player, etc.).
3. **UI/UX & Aesthetics**: Talk about the visual table felt, 3D chip animations, crisp card face contrast, dark theme, fluid 60fps animations, sound effects.
4. **Performance & Hardware**: Mention smooth play on phones (e.g. Redmi Note 12, Samsung M34, OnePlus Nord, Vivo T2, Moto G54, Pixel), low storage footprint, zero overheating during long sessions, stable 4G/5G/Wi-Fi connection.
5. **Tutorial & Learning vs Competitive**: Praise the interactive beginner tutorial, offline AI bots practice, or the rush of multiplayer matchmaking in under 3 seconds.
6. **Vary Form & Style**:
   - ~35% Short punchy comments (1 short sentence, casual slang: "mast card animations", "osm ui no lag", "superb table gameplay", "best pastime game", "smooth dealing flow").
   - ~45% Medium comments (2 natural sentences).
   - ~20% Detailed experiential stories (3-4 sentences detailing their playtime).
7. **Natural Slang & Imperfect Typing**: Mix natural Indian conversational expressions ("mast", "osm ui", "no lag at all", "superb", "pls add...", "battery friendly").
8. **Emojis**: Over 50% NO emojis. Remaining have maximum 1 subtle emoji (👍, 🔥, 💯, 👏, 👌).

${customPrompt ? `### USER CUSTOM INSTRUCTIONS (MANDATORY TO FOLLOW FOR ALL REVIEWS):\n${customPrompt}\n` : ''}
### OUTPUT FORMAT:
Return a JSON array of ${count} objects with fields:
- "userName": A realistic human name or casual gamer username (mix of Indian full names, handles like rahul_gamer, priya.k, tech_rohit, vikram07, etc.)
- "rating": The assigned integer star rating (1 to 5)
- "reviewText": The natural, human-like comment
- "helpful_count": An integer between 0 and 18 representing helpful votes
- "daysAgo": An integer between 3 and 85 indicating how many days ago it was posted`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                userName: { type: Type.STRING },
                rating: { type: Type.INTEGER },
                reviewText: { type: Type.STRING },
                helpful_count: { type: Type.INTEGER },
                daysAgo: { type: Type.INTEGER }
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
          return parsed.map((item: any, idx: number) => {
            const star = Math.max(1, Math.min(5, Number(item.rating) || ratings[idx] || 5));
            const days = Number(item.daysAgo) || (3 + idx * 4);
            const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000 - Math.random() * 3600000).toISOString();
            
            const safeText = sanitizeReviewText(String(item.reviewText || ''), app.name);

            return {
              appId: String(app.id || app.slug || '').trim(),
              appSlug: String(app.slug || '').trim(),
              appName: String(app.name || '').trim(),
              userName: String(item.userName || getRandomUserName(idx)).trim(),
              rating: star,
              reviewText: safeText,
              timestamp: pastDate,
              status: 'published',
              helpful_count: Math.max(0, Number(item.helpful_count) || Math.floor(Math.random() * 9)),
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

  // Contextual High-Quality Fallback Generator (Guarantees zero-failure operation)
  return generateContextualFallbackReviews(app, ratings);
}

// Algorithmic contextual fallback generator that parses the app's real description and features
function generateContextualFallbackReviews(app: any, ratings: number[]): Partial<ReviewRecord>[] {
  const appName = app?.name || 'this game';
  const desc = stripHtml(app?.description_html || app?.description || app?.features_html || '');
  const highlights = extractAppFeatureHighlights(app);
  const devices = ['Redmi Note 12', 'OnePlus Nord CE', 'Samsung Galaxy M34', 'Realme Narzo 60', 'iQOO Z7', 'Moto G54', 'Pixel 7a', 'Vivo T2 5G'];

  // Check specific game keywords and features from description
  const isCallbreak = /callbreak|call break|spade|trick/i.test(appName + ' ' + desc);
  const isRummy = /rummy|pure sequence|13 card|points rummy|pool/i.test(appName + ' ' + desc);
  const isTeenPatti = /teen patti|3 patti|blind|chaal|show/i.test(appName + ' ' + desc);
  const isLudo = /ludo|dice|token|board/i.test(appName + ' ' + desc);
  const hasTournaments = /tournament|championship|league|leaderboard/i.test(desc);
  const hasDailyBonus = /daily|mission|reward|wheel|spin/i.test(desc);
  const hasTutorial = /tutorial|beginner|practice|guide|learn|rules/i.test(desc);
  const hasAvatar = /avatar|profile|custom|theme|skin|table/i.test(desc);
  const hasOffline = /offline|bot|practice mode|ai/i.test(desc);
  const hasUndo = /undo|history|discard|auto-sort|sort/i.test(desc);

  // Dynamic feature mentions picked directly from the app description
  const dynamicFeature1 = highlights[0] || (isCallbreak ? 'the auto-sort spade trump rules' : isRummy ? 'the smart 13-card grouping' : isTeenPatti ? 'the fast-action blind bid tables' : 'the intuitive touch controls');
  const dynamicFeature2 = highlights[1] || (hasOffline ? 'the offline practice AI bot mode' : hasTournaments ? 'the competitive leaderboard tournaments' : 'the smooth 60fps table animations');
  const dynamicFeature3 = highlights[2] || (hasUndo ? 'the card history log and undo mechanic' : hasAvatar ? 'the custom table themes and avatar skins' : 'the lightweight APK storage optimization');

  const short5Star = [
    `mast game hai, ultra smooth animations 🔥`,
    `superb UI and quick matchmaking 👍`,
    `best card app for daily timepass`,
    `love the table visual effects! 🤩`,
    `super lightweight on storage, 5 stars`,
    `awesome card flow, zero lag`,
    `zero lag during matches, pure entertainment 🎮`,
    `very neat interface and fast response 👌`,
    `smooth 60fps frame rate on mobile`,
    `great update, ${dynamicFeature1} works flawlessly!`
  ];

  const medium5Star = [
    `Really impressed with ${dynamicFeature1} on ${appName}. Matchmaking takes less than 3 seconds and the sound effects are crisp.`,
    `One of the most optimized apps in this genre. ${dynamicFeature2} runs without any stuttering. Great battery efficiency and intuitive interface. 5 stars! 👍`,
    `The visual presentation of ${appName} is top notch. Smooth card dealing, clean dark theme, and ${dynamicFeature3}.`,
    hasTutorial 
      ? `Loved the gameplay flow. The step-by-step tutorial and ${dynamicFeature1} made the game rules very clear even for beginners.` 
      : `Solid mechanics and super responsive touch controls. ${dynamicFeature1} makes every round exciting!`,
    hasTournaments 
      ? `The tournament lobby mode is super engaging. Love the competitive leaderboard system and ${dynamicFeature2}!` 
      : `Clean table design and easy card grouping. Everything feels responsive and polished.`,
    hasDailyBonus
      ? `The daily mission rewards keep it fun every day. Very reliable and quick to launch with ${dynamicFeature1}.`
      : `Been playing with friends during lunch break. Very stable connection and fun experience with ${dynamicFeature3}.`
  ];

  const long5Star = [
    `Installed ${appName} recently on my ${devices[0]}. Impressed by how lightweight it is despite having rich table graphics. Match connection is instant, ${dynamicFeature1} is silky smooth, and battery drain is minimal. Highly recommended!`,
    `Been playing daily during my commute. The card handling is silky smooth, ${dynamicFeature2} keeps things engaging, and the interface is clear and modern. Great frame rate and no heating issues at all! 🎮`,
    hasAvatar
      ? `Really like ${dynamicFeature3} and the sound design. The visual clarity on ${appName} makes long sessions easy on the eyes. Top tier development!`
      : `The table speed and sound design on ${appName} make every match feel authentic. Extremely smooth execution with ${dynamicFeature1} on 5G network.`
  ];

  const short4Star = [
    `nice gameplay, smooth 60fps`,
    `good game, pls add more custom themes 👍`,
    `very responsive UI and clean design`,
    `enjoying the matches, ${dynamicFeature1} is great`,
    `solid performance, minor sound tweaks needed 👌`
  ];

  const medium4Star = [
    `Great game with slick animations. ${dynamicFeature1} runs super smooth on my phone. Would love to see more custom table themes in the next update!`,
    `Solid gameplay and very stable connection. The UI is straightforward and ${dynamicFeature2} is well designed. A custom card back option would make it even better.`,
    `Really fun mechanics and nice sound effects. ${dynamicFeature1} works great. Only minor request is to make the card numbers slightly larger on compact screens. 👌`,
    `Very well made app with ${dynamicFeature3}. Quick match finding and nice animations. 4 stars, just waiting for the next feature update!`
  ];

  const reviews3Star = [
    `Gameplay mechanics are fun and ${dynamicFeature1} is great, but takes a few seconds longer to connect on weak mobile data. Works great on Wi-Fi though.`,
    `Decent game with good animations and ${dynamicFeature2}. Would be great if they optimized the battery usage a bit more during extended 2-hour sessions.`,
    `Good concept and responsive touch controls. The in-game guide for ${dynamicFeature1} could be a bit more detailed for new players.`
  ];

  const reviews2Star = [
    `The core game rules and ${dynamicFeature1} are good, but the app heats up my older phone a bit after 30 minutes of continuous play. Needs optimization.`,
    `Graphics are nice, but font sizes on smaller screens feel a bit cramped. Hope the developers refine ${dynamicFeature3} in the next patch.`
  ];

  return ratings.map((star, idx) => {
    let text = '';
    const device = devices[idx % devices.length];
    const lengthType = idx % 3; // 0: short, 1: medium, 2: long/detailed

    if (star === 5) {
      if (lengthType === 0) {
        text = short5Star[idx % short5Star.length];
      } else if (lengthType === 1) {
        text = medium5Star[idx % medium5Star.length];
      } else {
        text = long5Star[idx % long5Star.length].replace(devices[0], device);
      }
    } else if (star === 4) {
      if (lengthType === 0) {
        text = short4Star[idx % short4Star.length];
      } else {
        text = medium4Star[idx % medium4Star.length];
      }
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
      timestamp: getRandomPastDate(idx, ratings.length),
      status: 'published',
      helpful_count: Math.floor(Math.random() * 8),
      source: 'ai_generated',
      isPinned: false
    };
  });
}
