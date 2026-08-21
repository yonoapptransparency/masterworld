import { GoogleGenAI, Type } from "@google/genai";
import { ReviewRecord } from "./communityStoreService";

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
}

// Strip HTML tags for clean AI prompt comprehension
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
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
  const { count, targetScore, starMix, toneFocus = 'balanced' } = options;
  const appName = app?.name || 'Card Game';
  const appCategory = app?.category || 'Casual, Card';
  const appDeveloper = app?.developer || 'Gaming Studio';
  const rawDesc = stripHtml(app?.description_html || app?.description || '');
  const rawFeatures = stripHtml(app?.features_html || app?.features || '');
  const appFileSize = app?.file_size || 'Unknown size';

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

      const prompt = `You are a real-world mobile gamer and app store user review synthesizer.
Your goal is to write exactly ${count} authentic, 100% human-written reviews for the Android application detailed below.

### REAL APP INFORMATION (Grounded Context):
- App Name: "${appName}"
- Category / Genre: "${appCategory}"
- Studio / Developer: "${appDeveloper}"
- App Download Size: "${appFileSize}"
- About App & Description: "${rawDesc.substring(0, 1400)}"
- Key Features & Mechanics: "${rawFeatures.substring(0, 800)}"

### REQUIRED RATINGS TO ASSIGN (Strict):
Assign these exact integer star ratings to the ${count} reviews in order:
${JSON.stringify(ratings)}

### STRICT POLICY / SAFETY NEGATIVE CONSTRAINTS (MANDATORY):
- NEVER mention "money", "real money", "cash", "rupees", "INR", "deposit", "withdrawal", "wallet payout", "earning", "bank account", "bonus cash", "paisa", "invest", or betting.
- Instead, talk ONLY about:
  * Gameplay mechanics, table speed, card shuffling, 3D chip animations, UI layout
  * 60fps smoothness, touch latency, app load times, battery efficiency, phone models (e.g. Redmi, OnePlus, Samsung Galaxy, Realme, Vivo, iQOO)
  * Sound effects, background music, dark table themes, avatars, bots/multiplayer lobby, offline modes
  * Fun factor, casual pastime, friendly competition, learning rules

### HUMAN REALISM & LINGUISTIC TRAINING (CRITICAL):
1. **Dynamic Length Variety**:
   - ~40% SHORT reviews (1 punchy line, 4-10 words): e.g. "mast game hai, smooth animations 🔥", "superb ui no lag at all 👍", "Best card game for timepass 💯"
   - ~40% MEDIUM reviews (2-3 natural sentences): e.g. "Been playing this daily during my metro commute. The card dealing animation is silky smooth and rules are easy to understand. Loved the dark theme 🤩"
   - ~20% DETAILED/EXPERIENTIAL reviews (3-4 sentences): e.g. "Downloaded ${appName} last week on my Redmi Note 12. Impressed by how lightweight it is despite having 3D table graphics. Matchmaking takes less than 3 seconds. Highly recommended! 👏"

2. **Casual Human Imperfections & Slang**:
   - Real humans don't write like formal essays. Use casual typing styles:
   - Occasional lowercase starts (e.g. "very nice game...", "smooth gameplay...")
   - Casual abbreviations & slang (e.g. "op game", "vry smooth", "mast", "osm ui", "no lag", "superb", "pls add...", "battery friendly")
   - Varied punctuation (some with '!', some with '...', some with just an emoji at the end).

3. **Natural Emoji Usage (SUBTLE - DO NOT OVERUSE)**:
   - Real humans do NOT put emojis in every review!
   - At least 50% to 60% of reviews should have NO emojis at all (plain text only with normal punctuation).
   - ~30% of reviews should have just ONE subtle emoji at the end (e.g. 👍, 🔥, 💯, 👏, 👌).
   - Only ~10% to 15% should have 2 emojis (e.g. 🎮✨).
   - Never use more than 2 emojis in a single review. Overusing emojis looks fake and bot-like.

4. **Sentiment Matching by Star Rating**:
   - **5 Stars**: Enthusiastic praise for speed, graphics, zero lag, intuitive touch controls, lightweight APK.
   - **4 Stars**: Great appreciation for the core game, but includes a natural wish-list item (e.g., "Pls add custom card backs", "Great graphics, hope you add more sound options in next update").
   - **3 Stars**: Balanced real feedback (e.g., "Good table design, but takes a few seconds to connect on mobile data. Works fine on Wi-Fi though").
   - **2 Stars**: Constructive feedback about minor technical aspects (e.g., "Core rules are fun, but font size is a bit small on compact screens. Hope devs optimize it").

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
            
            // Clean reviewText to strictly filter any accidental banned financial keywords
            let safeText = String(item.reviewText || '')
              .replace(/\b(money|real money|deposit|withdrawal|withdraw|cash|earning|rupees|inr|payout)\b/gi, 'game points')
              .trim();

            return {
              appId: String(app.id || app.slug || '').trim(),
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

// Algorithmic contextual fallback generator adhering strictly to user guidelines
function generateContextualFallbackReviews(app: any, ratings: number[]): Partial<ReviewRecord>[] {
  const appName = app?.name || 'this app';
  const devices = ['Redmi Note 12', 'OnePlus Nord', 'Samsung M34', 'Realme 11', 'iQOO Z7', 'Moto G54', 'Pixel 7a', 'Vivo T2'];

  const short5Star = [
    `mast game hai, smooth animations`,
    `Superb UI and fast matching 👍`,
    `Best card game for timepass`,
    `Love the 3D table graphics! 🤩`,
    `Very smooth on my phone, 5 stars`,
    `Awesome gameplay bro`,
    `Zero lag, pure fun 🎮`
  ];

  const medium5Star = [
    `Really impressed with the 3D graphics and table animations. The matchmaking is instant and the UI is very clean.`,
    `One of the best optimized apps in this category. Great battery efficiency and intuitive interface. 5 stars! 👍`,
    `The visual presentation of ${appName} is top notch. Smooth dealing animations and great sound effects.`,
    `Loved the gameplay flow. Zero lag even during long sessions and the tutorial made the rules very easy to learn.`,
    `Clean dark theme table design and easy touch controls. Everything feels responsive and polished. ✨`
  ];

  const long5Star = [
    `Downloaded ${appName} last week on my ${devices[0]}. Impressed by how lightweight it is despite having rich 3D table graphics. Matchmaking takes less than 3 seconds. Highly recommended!`,
    `Been playing daily during my commute. The card dealing animation is silky smooth and rules are easy to understand. Great frame rate and no overheating at all! 🎮🔥`
  ];

  const short4Star = [
    `Nice gameplay, smooth 60fps`,
    `Good game, pls add more themes 👍`,
    `Very responsive UI and clean design`,
    `Enjoying it a lot with friends`
  ];

  const medium4Star = [
    `Great card game with slick animations. Runs super smooth on my phone. Would love to see more custom table themes in the next update!`,
    `Solid gameplay and very stable connection. The UI is straightforward. A landscape view option would make it even better.`,
    `Really fun mechanics and nice sound effects. Only minor request is to make the card fonts slightly bigger on small screens. 👌`,
    `Very well made app. Quick match finding and nice animations. 4 stars, just waiting for the next feature update!`
  ];

  const reviews3Star = [
    `Gameplay mechanics are fun and table design is great, but takes a few seconds longer to load on mobile 4G data. Works great on Wi-Fi though.`,
    `Decent card game with good animations. Would be great if they optimized the battery usage a bit more during extended play.`,
    `Good concept and responsive touch controls. The in-game guide could be a bit more detailed for new players.`
  ];

  const reviews2Star = [
    `The core game rules are good, but the app heats up my older phone a bit after 30 minutes of continuous play. Needs optimization.`,
    `Graphics are nice, but font sizes on smaller screens feel a bit cramped. Hope the developers address this in the next patch.`
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
      userName: getRandomUserName(idx),
      rating: star,
      reviewText: text,
      timestamp: getRandomPastDate(idx, ratings.length),
      status: 'published',
      helpful_count: Math.floor(Math.random() * 8),
      source: 'ai_generated',
      isPinned: false
    };
  });
}
