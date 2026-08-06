// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface GlobalSettings {
  site_title: string;
  meta_description: string;
  logo_url: string;
  favicon_url: string;
  helpline_whatsapp: string;
  helpline_telegram: string;
  support_email: string;
  disclaimer_text: string;
  disclaimer_heading?: string;
  ethics_discrimination_text: string;
  ethics_heading?: string;
  portal_heading?: string;
  important_notice_heading?: string;
  ticker_text: string;
  animations_enabled: boolean;
  seo_keywords?: string;
  about_content?: string;
  contact_content?: string;
  privacy_content?: string;
  terms_content?: string;
  responsibility_content?: string;
  report_removal_content?: string;
  important_notice?: string;
  categories: string[];
  banners: Banner[];
  last_updated?: string;
  secure_index_title?: string;
  secure_index_subtitle?: string;
  trending_searches?: string[];
  hero_title_text?: string;
  hero_title_color?: string;
  hero_title_style?: string;
  hero_title_animation?: string;
  hero_title_subtitle?: string;
  hero_title_visible?: boolean;
  ga_tracking_id?: string;
  quick_links?: Array<{ title: string; subtitle?: string; icon?: string; color?: string; url: string }>;
  social_links?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; };
  website_faqs?: Array<{ question: string; answer: string }>;
  developers?: Array<{ name: string; role: string; bio?: string; image_url?: string; github?: string; twitter?: string; avatar_url?: string; social?: any }>;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  logo_url: string;
  description: string;
  ceo_name: string;
  ceo_description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords?: string;
  category?: string;
  og_image_url?: string;
  canonical_url?: string;
  target_region?: string;
  content: string;
  published_at?: string;
  link: string;
  read_time?: string;
  author?: string;
  description_html?: string;
  date?: string;
  tags?: string[];
  related_app_id?: string;
}

export interface AppConfig {
  id: string;
  name: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
  canonical_url?: string;
  target_region?: string;
  category: string;
  is_coming_soon?: boolean;
  publish_date?: string;
  version: string;
  file_size: string;
  developer: string;
  icon_url: string;
  screenshots: string[];
  description_html: string;
  red_box_msg: string;
  yellow_box_msg: string;
  idea_box_msg: string;
  safety_status: 'Verified' | 'Caution' | 'Unsafe';
  serial_number: number;
  is_featured: boolean;
  is_new: boolean;
  is_hot?: boolean;
  release_notes: string;
  rating: number;
  created_at: string;
  custom_admin_box_html?: string;
  custom_admin_box_heading?: string;
  features_html?: string;
  faqs?: {question: string; answer: string}[];
  link_configured?: boolean;
  
  video_url?: string;
  is_top_chart?: boolean;
  top_chart_category?: string;
  more_information_url?: string;
}

export interface Review {
  id: string;
  app_id: string;
  username: string;
  rating: number;
  comment: string;
  is_approved: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  cover_url: string;
  published_at: string;
  related_app_slug?: string;
  related_app_name?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  target_region?: string;
  description?: string;
  description_html?: string;
  date?: string;
  thumbnail_url?: string;
  publish_date?: string;
  read_time?: string;
  tags?: string[];
  created_at?: string;
}

export interface NewsUpdate {
  id: string;
  title: string;
  content_html: string;
  category: string;
  published_at: string;
}

export interface VideoItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  youtube_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords?: string;
  created_at: string;
}

export const mockApps: AppConfig[] = [
  {
    "screenshots": [],
    "developer": "Bingo",
    "category": "All Apps, Yono Apps",
    "faqs": [],
    "safety_status": "Verified",
    "publish_date": "",
    "seo_description": "Know about Spin Crush, the ultimate casual gaming hub. Explore diverse offline mini-games, collect virtual coins, and enjoy safe arcade entertainment on RummyDex.",
    "id": "yh9toduxk",
    "file_size": "44.8 MB",
    "release_notes": "",
    "seo_title": "Spin Crush - Casual Arcade Hub & Virtual Mini-Games",
    "features_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Features — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px;display:flex;align-items:center;gap:10px}\nh2 svg{flex-shrink:0}\np{margin:10px 0}\n</style>\n</head>\n<body>\n\n<h1>Features</h1>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><rect x=\"2\" y=\"2\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"15\" y=\"2\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"2\" y=\"15\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"15\" y=\"15\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Massive collection of thematic mini-games housed in one single app.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><circle cx=\"13\" cy=\"13\" r=\"11\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><path d=\"M10 8l8 5-8 5z\" fill=\"#1a73e8\"/></svg>Instant play mechanics with seamless switching between diverse game modes.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><rect x=\"2\" y=\"4\" width=\"22\" height=\"18\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><circle cx=\"9\" cy=\"10\" r=\"2\" fill=\"#1a73e8\"/><path d=\"M2 19l6-6 5 5 4-4 7 6\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Stunning HD graphics ranging from culinary kitchens to ancient mythology.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><path d=\"M13 2l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12V6z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Offline gameplay support for uninterrupted casual entertainment.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><circle cx=\"13\" cy=\"13\" r=\"11\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><path d=\"M8 13l4 4 7-8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>100% virtual rewards and safe, risk-free arcade progression systems.</h2>\n\n</body>\n</html>\n",
    "encrypted_link": "",
    "rating": 4.1,
    "created_at": "2026-08-02T11:14:13.263Z",
    "name": "SPIN CRUSH",
    "updated_at": "2026-08-06T05:58:04.453Z",
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",
    "slug": "spin-crush",
    "red_box_msg": "",
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Spin Crush</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:22px;color:#202124;font-weight:500;margin-top:44px;margin-bottom:10px}\nh1:first-of-type{margin-top:0}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n</style>\n</head>\n<body>\n\n<h1>A New Standard for Casual Arcade Gaming</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<circle cx=\"40\" cy=\"40\" r=\"25\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>Spin Crush redefines mobile entertainment by bringing an entire universe of casual mini-games into one accessible platform. Instead of offering a single repetitive loop, this app houses a vast collection of highly detailed thematic games. Whether you are looking for relaxing puzzle mechanics or fast-paced arcade action, this digital playground offers something for every type of player.</p>\n\n<h1>Explore a Diverse Universe of Mini-Games</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<rect x=\"15\" y=\"15\" width=\"50\" height=\"50\" rx=\"8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>The true strength of Spin Crush lies in its incredible variety. You can step into a virtual kitchen and match culinary ingredients in \"Baking Master,\" or explore vibrant cultural themes in \"Wild Bandito\" and \"Pinata Frenzy.\" For fans of mythology and history, \"Thor God of Lightning\" and \"Xerxes\" offer epic visual animations and dynamic virtual coin collection. Action enthusiasts can dive into the tactical environment of \"Royale Battleground\" or step into the ring with \"Boxing King.\" Nature and fantasy lovers are also covered with the prehistoric adventures of \"Jurassic Kingdom,\" the fiery visual combos of \"Coin Volcano,\" and the mystical journey of \"Wukong.\"</p>\n\n<h1>Smooth Performance &amp; Immersive Gameplay</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M25 15l40 25-40 25z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linejoin=\"round\"/>\n</svg>\n<p>Built with top-tier optimization, the app delivers a highly responsive user experience. The intuitive central lobby allows players to effortlessly navigate through different game categories without experiencing heavy loading screens. Every mini-game features sharp 3D graphics, bright colors, and satisfying sound effects that make virtual progression and matching mechanics incredibly engaging.</p>\n\n<h1>Safe, Virtual Entertainment</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M20 40l14 14 26-28\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>Designed as a purely casual simulation, Spin Crush focuses entirely on risk-free fun. Players can dive into thrilling arcade features like the \"Fortune Wheel,\" \"Crazy 777,\" or \"Gemstones Gold\" utilizing strictly virtual points. It is the perfect daily companion for users seeking a polished gaming experience where the focus is on beating high scores, unlocking new visual levels, and enjoying pure digital entertainment.</p>\n\n</body>\n</html>\n",
    "video_url": "",
    "is_coming_soon": false,
    "is_new": true,
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",
    "version": "1.0.6",
    "yellow_box_msg": "It get slightly heat on below Android 13",
    "serial_number": 6,
    "canonical_url": "https://www.rummydex.com/app/spin-crush",
    "seo_keywords": "casual game hub, arcade collection, virtual coin games, offline mini-games, spin crush app",
    "idea_box_msg": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": ""
  },
  {
    "yellow_box_msg": "Play in limit doing anything excess is not good so if you in limit everything are good ",
    "seo_description": "We went hands-on with Rummy 77. Read our neutral review detailing the actual table mechanics, card sorting features, and real-world battery performance.",
    "is_coming_soon": false,
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Inside the Game: What Are You Actually Playing?</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:22px;color:#202124;font-weight:500;margin-top:44px;margin-bottom:14px}\nh1:first-of-type{margin-top:0}\nh2{font-size:17px;color:#202124;font-weight:500;margin-top:26px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:10px 0}\n.art{display:block;margin:18px 0}\n</style>\n</head>\n<body>\n\n<h1>🃏 Inside the Game: What Are You Actually Playing?</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<rect x=\"15\" y=\"15\" width=\"50\" height=\"50\" rx=\"8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>At its core, Rummy 77 is a straightforward, classic 13-card rummy experience. The app doesn't try to reinvent the wheel with heavy 3D graphics or complicated storylines; instead, it focuses entirely on the mechanics of the game itself.</p>\n<p>The moment you launch the app, you are greeted with a remarkably clean lobby. Matchmaking is snappy—during our tests, it rarely took more than a few seconds to find a seat at a virtual table.</p>\n\n<h2>The Table Experience:</h2>\n<p>Once you are in a match, the layout is highly intuitive. The center of the screen houses the closed deck and the open discard pile, while your 13 cards are fanned out clearly at the bottom.</p>\n<ul>\n<li><strong>Auto-Sort Mechanics:</strong> One feature we genuinely appreciated was the responsive \"Sort\" button. With a single tap, the app automatically groups your cards by suit and color, which is a massive time-saver when you are trying to spot potential pure sequences or sets under a time limit.</li>\n<li><strong>Dragging and Discarding:</strong> Moving cards feels natural. The touch response is tight—there is no frustrating lag when you are trying to drag a card to the discard pile right before your turn timer runs out.</li>\n<li><strong>Visual Clarity:</strong> The developers opted for a high-contrast green felt background with large, bold card faces. If you are playing on a smaller phone screen, you won't have to squint to tell the difference between a Spade and a Club.</li>\n</ul>\n\n<h1>⚙️ How Does It Actually Perform?</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<circle cx=\"40\" cy=\"40\" r=\"25\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>We didn't just look at the gameplay; we monitored how the app handled device resources during extended play sessions.</p>\n<ul>\n<li><strong>Fluidity and Frame Rates:</strong> We tested Rummy 77 on both a modern flagship phone and a three-year-old budget Android device. On both, the game maintained a rock-solid 60 FPS. The card dealing animations are smooth, and transitioning in and out of lobbies happens without any frustrating loading screens.</li>\n<li><strong>Battery &amp; Thermal Check:</strong> Card games shouldn't turn your phone into a hand-warmer. Because Rummy 77 relies on clean 2D assets rather than heavy background rendering, it is incredibly lightweight. We played continuously for over an hour, and the battery drain was minimal. More importantly, the back of the device stayed perfectly cool.</li>\n</ul>\n\n<h1>🎯 Our Verdict</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M20 40l14 14 26-28\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>If you are looking for a hyper-realistic casino simulator with heavy 3D avatars, this might not be for you. The UI is admittedly a bit simple. However, if your goal is pure, uninterrupted rummy with excellent touch controls, reliable matchmaking, and zero battery anxiety, Rummy 77 completely hits the mark. It does exactly what it promises, and it does it well.</p>\n\n</body>\n</html>\n",
    "red_box_msg": "",
    "serial_number": 2,
    "id": "i5uw2apum",
    "canonical_url": "https://www.rummydex.com/app/rummy-77",
    "encrypted_link": "",
    "video_url": "",
    "faqs": [],
    "version": "1.0.6",
    "publish_date": "",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785722974/1000132690_11zon_1_l43qhv.jpg",
    "name": "RUMMY 77",
    "screenshots": [],
    "created_at": "2026-08-03T02:13:03.477Z",
    "category": "All Apps, Yono",
    "slug": "rummy-77",
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785722974/1000132690_11zon_1_l43qhv.jpg",
    "updated_at": "2026-08-03T02:38:06.645Z",
    "seo_title": "Rummy 77 - Hands On Review - Gameplay, Features & Performance | RummyDex",
    "is_new": false,
    "file_size": " 49.2 MB",
    "idea_box_msg": "",
    "release_notes": "",
    "features_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Rummy 77: Our Hands-On Review & Gameplay Breakdown</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:24px;color:#202124;font-weight:500;margin-bottom:20px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n</style>\n</head>\n<body>\n\n<h1>Rummy 77: Our Hands-On Review &amp; Gameplay Breakdown</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M25 15l40 25-40 25z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linejoin=\"round\"/>\n</svg>\n\n<p>When it comes to digital card games, the market is flooded with apps that prioritize flashy menus over actual gameplay. When our team sat down to test Rummy 77, we wanted to see if it actually delivered a solid, reliable card-playing experience or if it was just another generic clone.</p>\n<p>After hours of hands-on testing across multiple devices, here is our neutral, unfiltered breakdown of exactly what Rummy 77 has to offer.</p>\n\n</body>\n</html>\n",
    "seo_keywords": "rummy 77 app, real rummy gameplay, rummy 77 review, 13 card rummy",
    "developer": "Arena studio",
    "safety_status": "Verified",
    "rating": 4.2
  },
  {
    "screenshots": [],
    "idea_box_msg": "Almost In every android phone it can run well no issues ",
    "encrypted_link": "",
    "seo_keywords": "",
    "faqs": [],
    "seo_title": "Rummy 91: The Ultimate Casual Card & Board Game App 🚀",
    "description_html": "<section>\n  <h2>Inside Rummy 91: The Game Library</h2>\n\n  <article>\n    <h3>1. Strategy &amp; Skill Rooms (Classic Rummy)</h3>\n\n    <h4>The Experience</h4>\n    <p>\n      Point, Pool, and Deals Rummy designed for mental exercise and strategy building.\n    </p>\n\n    <h4>Real User Benefit</h4>\n    <p>\n      It acts as a great brain-training tool. Users can sharpen their memory and card-matching skills in practice rooms at their own pace. The interface includes auto-sort features, making it incredibly easy for players to organize their hands without frustration.\n    </p>\n  </article>\n\n  <article>\n    <h3>2. The Social Lounge (Teen Patti &amp; Card Classics)</h3>\n\n    <h4>The Experience</h4>\n    <p>\n      Traditional 3-card games built around community and casual multiplayer fun.\n    </p>\n\n    <h4>Real User Benefit</h4>\n    <p>\n      Perfect for social gamers. Users can connect with friends or join quick casual matches. The inclusion of in-game emojis and animated avatars keeps the atmosphere lighthearted, relaxed, and focused on pure entertainment.\n    </p>\n  </article>\n\n  <article>\n    <h3>3. Quick-Play Arcade (Dragon vs Tiger &amp; Mini-Games)</h3>\n\n    <h4>The Experience</h4>\n    <p>\n      Fast-paced, visually vibrant intuitive games that require zero complex tutorials.\n    </p>\n\n    <h4>Real User Benefit</h4>\n    <p>\n      Ideal for users who only have a few minutes to spare, like during a commute. These quick-tap games test observation and intuition. The lightweight code ensures the animations run smoothly without draining the phone's battery.\n    </p>\n  </article>\n\n  <article>\n    <h3>4. Nostalgic Board Games (Ludo)</h3>\n\n    <h4>The Experience</h4>\n    <p>\n      A digital, multiplayer recreation of the classic family board game.\n    </p>\n\n    <h4>Real User Benefit</h4>\n    <p>\n      Brings classic offline fun to the mobile screen. Users get a simple, familiar interface that appeals to all age groups, offering a relaxing break from the heavier strategy-based card games.\n    </p>\n  </article>\n</section>",
    "file_size": "47.8 MB",
    "yellow_box_msg": "",
    "version": "1.07.9",
    "is_coming_soon": false,
    "id": "s4oc5m16b",
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785780996/download_22_vgi4h1_1_jjm7jx.webp",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785780996/download_22_vgi4h1_1_jjm7jx.webp",
    "serial_number": 3,
    "developer": "Ariyan Chowdhury studio ",
    "canonical_url": "https://www.rummydex.com/app/rummy-91",
    "updated_at": "2026-08-04T04:23:29.327Z",
    "category": "All Apps, Yono Apps",
    "rating": 4.4,
    "red_box_msg": "",
    "seo_description": "Master your skills with Rummy 91! 🃏 Play traditional Rummy, fast-paced Teen Patti, and classic Ludo in one lightweight app. Join the practice lobbies today. ✨",
    "created_at": "2026-08-03T18:10:16.344Z",
    "publish_date": "",
    "name": "RUMMY 91",
    "is_new": false,
    "safety_status": "Verified",
    "slug": "rummy-91",
    "release_notes": "",
    "features_html": "",
    "video_url": ""
  },
  {
    "release_notes": "",
    "publish_date": "",
    "rating": 4,
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785819278/images_21_1_g770hi.webp",
    "features_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Callbreak: What It's Actually Like to Play</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:24px;color:#202124;font-weight:400;margin-bottom:6px}\n.tagline{color:#5f6368;font-size:14px;margin-bottom:28px;font-style:italic}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:40px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n</style>\n</head>\n<body>\n\n<h1>Callbreak: What It's Actually Like to Play</h1>\n<p class=\"tagline\">A look at how the game feels day to day — the wins, the friction, and everything in between.</p>\n\n<h2>First Impressions</h2>\n<p>Callbreak comes across as an engaging, easy-to-pick-up card game that brings the traditional South Asian trick-taking game to mobile in a way that feels smooth, polished, and beginner-friendly right from the start. Having offline AI play, online multiplayer, and quick matches all in one place gives players real flexibility, and that's a big part of why people keep coming back.</p>\n<p>The overall feeling is positive, but with some caveats. The core card game itself is satisfying and genuinely addictive — the friction tends to come from the ads, monetization, and occasional technical hiccups around the edges.</p>\n\n<h2>Getting Started</h2>\n<p>New players are guided in rather than dropped into a confusing menu. A beginner-friendly tutorial walks through the rules of Callbreak, bidding, trump suits, and trick-taking, and an in-app rulebook covers everything from the basics to more advanced strategy for players who want to improve over time.</p>\n<p>Difficulty settings run from novice to advanced, so beginners can ease in while experienced players have room to push themselves. Most people find the rules easy to pick up, while the strategy stays deep enough to hold their interest. The onboarding experience overall feels welcoming and low-pressure — most new players feel ready to jump in within minutes.</p>\n\n<h2>How a Match Feels</h2>\n<p>Quick match options get you into a game fast, while standard matches feel more like a complete session. Bidding sits at the center of the experience, and the interface makes calling your number straightforward. Touch controls for selecting and playing cards feel smooth and intuitive.</p>\n<p>Little quality-of-life touches make a real difference — the ability to undo a mis-tap takes the stress out of quick decisions, reviewing card history helps with strategic planning, and being able to reshuffle a genuinely bad hand is appreciated. Animations move at a good pace, and game speed can be adjusted if you want things faster or slower.</p>\n<p>Altogether, the gameplay loop feels rhythmic and satisfying — bid, play, win or lose the trick, watch the score update. The tactile card play and animated trick collection give it a real card-table feel.</p>\n\n<h2>Playing Against the AI</h2>\n<p>AI opponents are generally described as challenging and smart, adapting to how you play. That said, more advanced players report that the AI becomes predictable after extended play, which can wear down long-term replay value. One specific quirk that comes up is bots sometimes playing only their lowest available card, which can feel less realistic or strategically shallow.</p>\n<p>Being able to play entirely offline is a strong point, especially for anyone dealing with unreliable connectivity, and practice mode is genuinely useful for building up strategy before jumping into matches against real people. Overall, single-player is solid and convenient, though it can start to feel repetitive for players who've mastered the AI's patterns.</p>\n\n<h2>Playing With Others</h2>\n<p>Real-time matches against players from around the world add excitement and unpredictability that AI matches can't match. Matchmaking uses a skill-rating system to pair similar-level players, though some users report inconsistencies — trouble connecting with random opponents or with friends specifically.</p>\n<p>Private tables for playing with friends or family are well-liked, and local Wi-Fi play is praised for situations without internet access, like travel or gatherings. In-game chat and emojis add a bit of social warmth, though they're fairly minimal compared to dedicated chat apps. Network interruptions are a real pain point — they can cause bid failures, auto-resets, or disconnections mid-match. Referral-code invites and Facebook integration exist for connecting with friends, though some users run into friction there too.</p>\n<p>When it works, multiplayer is fun and competitive — but connection instability and matchmaking hiccups can make the experience inconsistent.</p>\n\n<h2>Look and Sound</h2>\n<p>The app gets frequent praise for its visuals — people describe the card animations as beautiful and the interface as sleek. The game board has a modern, premium look that adds to the overall sense of polish. Multiple card designs and table themes let players personalize things, and dealing, trick collection, and win/loss animations all feel smooth and satisfying.</p>\n<p>Sound design leans into authentic, realistic card shuffling and playing sounds, with background music and customization options available too. On supported devices, haptic feedback adds an extra layer of tactile feel. Altogether, the visuals and audio work together to create a premium, polished card-room atmosphere.</p>\n\n<h2>Controls and Navigation</h2>\n<p>Touch controls come across as smooth and intuitive, and the interface is generally easy to navigate. The main menu and home screen are clean, though some players wish settings were more directly accessible. Colorblind mode and multi-language support help make the app accessible to a wider audience.</p>\n<p>One recurring complaint is being forced to play a specific card in certain situations, when players would rather have more freedom. That said, the app is easy to operate one-handed, which matters a lot for a mobile card game — most of the friction comes from gameplay rules like forced suit-following rather than the interface itself.</p>\n\n<h2>Ads and Monetization</h2>\n<p>The game is genuinely free to download and play, which keeps the barrier to entry low. But ad frequency is by far the most frequently cited pain point — some users describe feeling like they spend the vast majority of their time watching ads rather than playing. Ads tend to show up between games or at natural breaks, but how often and how long they run can break immersion.</p>\n<p>A \"Remove Ads\" purchase is available, but some users report ads still showing up even after paying — which creates real frustration and damages trust. Gem packs are offered for unlocking assets; some players are fine with that, others feel pushed toward spending. The daily reward wheel and login bonuses add a sense of progression, though the rewards themselves can feel small.</p>\n<p>Monetization is the single biggest source of dissatisfaction here, and ads persisting after a paid removal is the kind of thing that really damages trust with paying users.</p>\n\n<h2>Progression and Rewards</h2>\n<p>Daily login rewards and the spin-based daily wheel encourage regular use and add small moments of anticipation. Global leaderboards give players a long-term goal to chase, and league progression — Bronze, Gold, Platinum, and so on — adds a sense of advancement. Detailed stats let players track their own improvement and compare themselves to others, and small skill-point bonuses for extra tricks offer little moments of satisfaction along the way.</p>\n<p>These systems are generally effective at keeping people engaged, though the rewards are modest and the competitive pace may feel slow for more casual players.</p>\n\n<h2>Where Things Get Frustrating</h2>\n<ul>\n<li><strong>Excessive ads</strong> — breaks immersion, fragments sessions, and is enough to make some players uninstall.</li>\n<li><strong>Ads after paying to remove them</strong> — a trust-breaking experience that has led to refund requests.</li>\n<li><strong>AI predictability</strong> — reduces long-term challenge for more experienced players.</li>\n<li><strong>Multiplayer connection issues</strong> — bid failures, disconnections, and trouble connecting with friends specifically.</li>\n<li><strong>No Nil Bid option</strong> — players coming from Spades or more advanced Callbreak variants miss this strategic choice.</li>\n<li><strong>Forced card play</strong> — some players want more freedom in which card they play.</li>\n<li><strong>Crashes and freezes</strong> — technical instability that can interrupt games and cost progress.</li>\n<li><strong>Login issues</strong> — problems signing in that affect multiplayer access and reward tracking.</li>\n<li><strong>Missing cards bug</strong> — connectivity or sync issues that can make cards appear to vanish mid-play.</li>\n</ul>\n\n<h2>The Emotional Highs and Lows</h2>\n<p>The delight moments are the ones you'd expect from a good card game — winning a tricky bid, watching a smooth animation play out, pulling off a perfect hand, unlocking a new theme, or beating a friend at a private table. The friction moments are just as clear: sitting through another ad, losing connection mid-bid, discovering ads still show up after paying to remove them, or watching the AI make another predictable low-card play.</p>\n<p>Long-term, the app is addictive and fun as a casual card game, but frequent players tend to hit a ceiling where the ads and AI predictability start to wear thin. The social multiplayer side keeps a lot of people engaged — but only when the connection actually holds up.</p>\n\n<h2>The Bottom Line</h2>\n<p>Callbreak delivers a polished, accessible, and strategically satisfying card game that works well for both casual players and longtime fans of the format. Its strongest points are its visual polish, smooth controls, offline flexibility, and social features. Its biggest weaknesses are ad overload and technical instability, especially around multiplayer and after paying to remove ads. Most players genuinely enjoy the core experience, but frequently wish for fewer ads, more reliable servers, and deeper AI strategy.</p>\n\n</body>\n</html>\n",
    "faqs": [
      {
        "answer": "Yes. Callbreak features robust offline AI single-player matches as well as local Wi-Fi connectivity, allowing you to play anywhere without an internet connection.",
        "question": "Q1: Can I play Callbreak fully offline without mobile data?"
      },
      {
        "answer": "Yes. Callbreak features robust offline AI single-player matches as well as local Wi-Fi connectivity, allowing you to play anywhere without an internet connection.",
        "question": "Q2: Are the in-game Gems and Coins tied to real-money rewards?"
      },
      {
        "answer": "Because the app utilizes clean 2D graphics and lightweight processing, it runs smoothly at 60 FPS on older devices while keeping battery drain and heat output very low.",
        "question": "Q3: How does Callbreak perform on older or lower-spec smartphones?"
      },
      {
        "question": "Q4: What extra game modes are included besides standard 5-round matches?",
        "answer": "The platform includes Super 8 Bid Challenge (racing to win eight hands against aggressive AI) and Blind Bid Mode (bidding before viewing player hands)."
      }
    ],
    "safety_status": "Verified",
    "video_url": "",
    "is_new": false,
    "id": "ha76icslh",
    "screenshots": [],
    "serial_number": 1,
    "canonical_url": "https://www.rummydex.com/app/callbreak",
    "version": "1.0",
    "developer": "People Lovin Games",
    "idea_box_msg": "",
    "seo_keywords": "",
    "encrypted_link": "",
    "red_box_msg": "",
    "name": "CALLBREAK",
    "seo_description": "Explore Callbreak: Classic Card Games on RummyDex. Check gameplay modes, features. Hand tested review on real experience ",
    "slug": "callbreak",
    "created_at": "2026-08-04T05:18:55.084Z",
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Callbreak: Classic Card Games</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.tagline{color:#5f6368;font-size:14px;margin-bottom:28px;font-style:italic}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n.art{display:block;margin:18px 0}\n</style>\n</head>\n<body>\n\n<h1>Callbreak: Classic Card Games</h1>\n<p class=\"tagline\">Strategic trick-taking card battles, built for both casual rounds and serious competition.</p>\n\n<h2>What This Game Is</h2>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<rect x=\"15\" y=\"15\" width=\"50\" height=\"50\" rx=\"8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>Callbreak is a digital take on the classic South Asian trick-taking card game of the same name, also known as Lakadi in some regions. It's a mainstay across Nepal, India, Bangladesh, and Bhutan, and this app brings that same experience to mobile — whether you want to play against AI bots, challenge friends, or jump into a match with strangers online.</p>\n<p>Each of four players is dealt thirteen cards from a standard deck. Before a round begins, everyone calls a bid — how many tricks they expect to win. Cards are then played trick by trick, and players who hit or beat their bid score points, while falling short costs them. A full match typically runs five rounds, with scores adding up as you go.</p>\n\n<h2>How the Game Plays</h2>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M25 15l40 25-40 25z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linejoin=\"round\"/>\n</svg>\n<p>The rules stick closely to traditional Callbreak. It's a standard 52-card deck with no jokers, four players holding thirteen cards each, and spades set as the permanent trump suit — though some in-app modes let you choose a different trump. Players have to follow the leading suit if they can; otherwise, they're free to trump or discard.</p>\n<p>Scoring rewards players who meet their bid, with small bonuses for extra tricks, while missing a bid costs points equal to what was called. If you're dealt a particularly rough hand, there's a reshuffle option to redeal. An undo feature lets you take back your last move, and a card history tool lets you review what's already been played during a match.</p>\n\n<h2>Ways to Play</h2>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<circle cx=\"28\" cy=\"40\" r=\"16\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n<circle cx=\"55\" cy=\"40\" r=\"16\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>There's a mode here for however you like to play. Go offline against AI bots when you don't have a connection, or jump into real-time online multiplayer against players worldwide. You can set up a private table and invite friends or family with a referral code, or play locally over the same Wi-Fi network with no internet required at all.</p>\n<p>Difficulty settings run from novice to advanced, and there are a couple of standout variations worth trying: Super 8 Bid Challenge, where you're racing to win eight hands in a round while the bots try to stop you, and Blind Bid Mode, where you place your bid before seeing how anyone else is playing. There's also a dedicated practice mode for sharpening your skills against AI before taking on real opponents.</p>\n\n<h2>Social &amp; Competitive Play</h2>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M20 40l14 14 26-28\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>Global leaderboards and a league system — with tiers like Bronze, Gold, and Platinum — give competitive players something to climb toward, and matchmaking uses a skill rating to pair you with opponents around your level. During matches, in-game chat and emoji reactions keep things social, and you can invite friends directly to private tables. Stats tracking lets you see how you're performing round over round and compare yourself against other players. Anti-cheat measures are built in to keep matches fair.</p>\n\n<h2>Rewards &amp; In-App Purchases</h2>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<circle cx=\"40\" cy=\"40\" r=\"25\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>Gems are the main currency for unlocking in-game extras, and they can't be redeemed for real money or cash prizes. Coins serve as a secondary currency, mainly tied to timer bonuses and a daily reward wheel. There are daily log-in rewards on top of that. The app is free to download and ad-supported, with an option to remove ads through a purchase, and several gem pack tiers available for players who want to buy in.</p>\n\n<h2>Look, Feel &amp; Accessibility</h2>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M20 20l40 40M60 20L20 60\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>The interface is built to feel approachable whether you're new to Callbreak or you've played for years. You can pick from multiple card designs and table themes, and matches come with smooth card animations and satisfying trick-collection visuals. Avatars represent players and bots, especially in single-player games. Sound effects, background music, and haptic feedback round out the experience, and there's a colorblind mode along with support for a wide range of languages including English, Hindi, Spanish, French, and many others.</p>\n\n<h2>Settings You Can Adjust</h2>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<rect x=\"15\" y=\"15\" width=\"50\" height=\"50\" rx=\"8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>Players have a good amount of control over how a match runs — sound and volume, game speed, and which mode to play, whether that's standard, Super 8, or Blind Bid. You can also choose the number of rounds instead of sticking with the default five, and in some variants, pick your own trump suit. Undo, reshuffle, and card history can all be toggled from the settings as well.</p>\n\n</body>\n</html>\n",
    "yellow_box_msg": "",
    "file_size": "51.11 MB",
    "category": "Card Apps, All Apps",
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785819278/images_21_1_g770hi.webp",
    "updated_at": "2026-08-06T05:57:42.651Z",
    "is_coming_soon": false,
    "seo_title": "Callbreak: Classic Card Games — Review, Rating & Download Info",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": ""
  },
  {
    "id": "colrcaih7",
    "name": "Card Game 29",
    "slug": "card-game-29",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785935258/1000133067_11zon_1_n04bav.jpg",
    "category": "All Apps, Card Apps",
    "encrypted_link": "",
    "rating": 4.1,
    "safety_status": "Verified",
    "serial_number": 5,
    "version": "1.0",
    "file_size": "23.2 MB",
    "developer": "ZLEVEL LABS LLP",
    "description_html": "<section class=\"content-section\">\n  <h2>About the Application (Deep Dive)</h2>\n\n  <p>\n    Card Game 29 is not just a digital pastime; it is a massive, widely established platform dedicated to preserving and modernizing a beloved South Asian card game.\n    Developed and maintained by Z Level Labs (also known as ZLEVEL LABS LLP), the application has built a massive community since its initial launch over a decade ago on September 2, 2014.\n  </p>\n\n  <h3>What the Application Provides</h3>\n\n  <p>\n    The primary goal of the application is to offer a comprehensive, portable version of \"29\" (or Twenty-Nine), a highly strategic trick-taking game famous across India, Bangladesh, Nepal, and other parts of South Asia.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>The Core Experience</h4>\n    <p>\n      The app provides a virtual card table where you can play against AI, connect with local friends, or match up with a global player base.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Language Accessibility</h4>\n    <p>\n      To ensure it reaches its core demographic natively, the app features full language support for English, Hindi, Bengali, and Spanish.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Constant Evolution</h4>\n    <p>\n      The developers actively maintain the game, with recent updates rolling out as late as August 2026 to introduce modernized menus, smoother multiplayer sessions, and critical bug fixes.\n    </p>\n  </div>\n\n  <h3>Technical Footprint and Accessibility</h3>\n\n  <p>\n    For an application that offers real-time multiplayer, Card Game 29 is remarkably lightweight and accessible for a wide range of devices.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>Device Requirements</h4>\n    <p>\n      It is built for Android (though the developer publishes similar games for iOS) and requires Android version 5.0/6.0 or higher.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Storage Space</h4>\n    <p>\n      The installation size varies slightly depending on your specific device and version, generally taking up only 26.4 MB to 42.5 MB of space.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Global Reach</h4>\n    <p>\n      This accessibility has translated into massive success, boasting over 10 million downloads and maintaining a solid 4.13 out of 5.0 rating from over 105,000 user reviews.\n    </p>\n  </div>\n\n  <h3>Monetization and the In-App Economy</h3>\n\n  <p>\n    The app operates on a \"freemium\" model, meaning it is completely free to download and play, but it is heavily ad-supported.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>Premium Options</h4>\n    <p>\n      For players who want a cleaner experience or extra features, the app offers a premium pass and various in-app purchases.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Pricing Structure</h4>\n    <p>\n      These optional purchases range from as low as $0.49 to a massive $129.99 for premium bundles, which can be used to remove advertisements, unlock cosmetic items, or access special features.\n    </p>\n  </div>\n\n  <h3>Behind the Scenes: Privacy and Permissions</h3>\n\n  <p>\n    To facilitate its online and local multiplayer features, as well as its advertising model, the app requires a robust set of device permissions.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>System Access</h4>\n    <p>\n      The app asks for access to your camera, internet network state, vibration functions, external storage (for saving data), and wake lock (to keep your screen from turning off mid-game).\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Data Handling</h4>\n    <p>\n      According to the game's privacy policy, it does collect personal information, device identifiers, and performance data.\n      This data is shared with trusted third parties, primarily to deliver targeted advertisements and ensure the app functions correctly across different devices.\n    </p>\n  </div>\n</section>",
    "features_html": "<section class=\"content-section\">\n  <h2>Key Features and Deep Dive into Card Game 29</h2>\n\n  <p>\n    Card Game 29 isn't just a simple mobile game; it is a meticulous digital recreation of the beloved South Asian trick-taking classic.\n    The app is designed to bring the traditional flavor of the game to your smartphone, blending memory, intense strategy, and partnership coordination.\n  </p>\n\n  <h3>The Core Game Mechanics</h3>\n\n  <p>\n    At its heart, the app authentically replicates the traditional rules.\n    You play in a four-player setup with two fixed partnerships sitting across from one another.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>The Stripped Deck</h4>\n    <p>\n      The game removes the lower cards, utilizing a specific 32-card deck consisting only of the\n      7, 8, 9, 10, Jack, Queen, King, and Ace.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Unique Card Values</h4>\n    <p>\n      Unlike standard games, the Jack is the ultimate powerhouse worth 3 points, followed by the 9\n      (worth 2 points), and the Ace and 10 (worth 1 point each). The total deck holds 28 points,\n      and winning the final trick grants the namesake 29th point.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>The Bidding War</h4>\n    <p>\n      The app beautifully captures the tension of the bidding phase. Players must bid between\n      16 and 28 points based on their hand's strength, and the highest bidder earns the crucial\n      right to set the trump suit.\n    </p>\n  </div>\n\n  <h3>Customizable House Rules</h3>\n\n  <p>\n    One of the most impressive features of the app is its \"Rules Popup\" configuration panel,\n    which respects that different regions have their own local variations. You can deeply\n    customize your match by enabling:\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>Double &amp; Re-Double</h4>\n    <p>\n      To aggressively increase the stakes and score multipliers of a single hand.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Pair / Marriage</h4>\n    <p>\n      A system that rewards bonus points if you are lucky enough to hold both the King and Queen\n      of the active trump suit.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Specialized Trumping</h4>\n    <p>\n      Options like the \"7th Card Trump\" (where your 7th dealt card dictates the suit) or using\n      a Joker as a designated trump card.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Single Hand &amp; Tenny</h4>\n    <p>\n      Niche modes where a solo player attempts to win the hand under special conditions,\n      or tries to sweep all four tricks without even relying on a trump card.\n    </p>\n  </div>\n\n  <h3>Versatile Play Modes</h3>\n\n  <p>\n    The application caters to exactly how you want to play at any given moment:\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>Offline AI Mode</h4>\n    <p>\n      Perfect for offline practice, allowing you to play against computer-controlled opponents\n      without needing any internet connection.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Online Multiplayer</h4>\n    <p>\n      You can jump into public matches or create private rooms with shareable links to play\n      with friends worldwide.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Local Bluetooth</h4>\n    <p>\n      A standout feature that lets you connect locally with friends in the same room without\n      consuming any mobile data.\n    </p>\n  </div>\n</section>",
    "seo_title": "Card Game 29 — Challenge Friends & Master the Bids | RummyDex",
    "seo_description": "Join RummyDex to play Card Game 29: sharpen your bidding, team up with partners, and win against players worldwide in fast, competitive rounds.",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": false,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [
      {
        "answer": "Yes. Card Game 29 is free to download and play. The app also offers optional in-app purchases and displays advertisements, allowing users to unlock additional features or enjoy a more streamlined experience if they choose.",
        "question": "1. Is Card Game 29 free to download and play?"
      },
      {
        "question": "2. Can I play Card Game 29 without an internet connection?",
        "answer": "Yes. The game includes an offline mode where you can play against AI opponents without an internet connection. However, online multiplayer features require an active internet connection."
      },
      {
        "answer": "Yes. Card Game 29 supports multiple ways to play, including online multiplayer, private rooms with friends, and local multiplayer options on supported devices, depending on the available features in your version of the app.",
        "question": "3. Does Card Game 29 support multiplayer gameplay?"
      },
      {
        "question": "4. Is Card Game 29 suitable for beginners?",
        "answer": "Yes. While the game is based on the traditional rules of Twenty-Nine, its straightforward interface and offline practice mode make it accessible for new players. Experienced players can also enjoy advanced gameplay through bidding, partnerships, and customizable rule variations."
      }
    ],
    "created_at": "2026-08-05T14:01:20.004Z",
    "updated_at": "2026-08-05T14:04:44.286Z"
  },
  {
    "id": "e1qcs5ik7",
    "name": "JOY RUMMY",
    "slug": "joy-rummy",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784879087/download_32_cyvkev.webp",
    "category": "All Apps, Yono Apps",
    "encrypted_link": "",
    "rating": 4.3,
    "safety_status": "Verified",
    "serial_number": 4,
    "version": "1.0",
    "file_size": "35 MB",
    "developer": "Pixel Card Studios",
    "description_html": "<section class=\"content-section\">\n  <h2>Technical Architecture and Application Details</h2>\n\n  <p>\n    Featured prominently on RummyDex, Joy Rummy combines a lightweight system footprint with a robust multiplayer architecture to ensure accessibility across a wide array of mobile devices.\n  </p>\n\n  <h3>System Specifications and Footprint</h3>\n\n  <div class=\"feature-item\">\n    <h4>Device Compatibility</h4>\n    <p>\n      Optimized for modern operating standards, requiring Android 6.0 or higher for stable background synchronization.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Storage Efficiency</h4>\n    <p>\n      The application package maintains a streamlined download size of approximately 35 MB, ensuring rapid installation even on limited network bandwidth.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Content Governance</h4>\n    <p>\n      Rated \"Everyone\" on major app distribution channels, ensuring compliance with broad family-friendly content guidelines.\n    </p>\n  </div>\n\n  <h3>Monetization Framework and App Economy</h3>\n\n  <div class=\"feature-item\">\n    <h4>Freemium Model</h4>\n    <p>\n      The core application is freely accessible, sustained via integrated digital advertisements.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Cosmetic Enhancements</h4>\n    <p>\n      Optional in-app purchases (ranging from minor customization packs to extensive visual upgrades) are strictly restricted to aesthetic elements—such as unique card back designs, custom table felt colors, and avatar portraits—ensuring zero pay-to-win mechanics.\n    </p>\n  </div>\n\n  <h3>Essential Permissions</h3>\n\n  <p>\n    The application requests minimal system permissions strictly required for core functionality.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>Network State Access</h4>\n    <p>\n      Necessary for maintaining real-time lobby synchronization, global leaderboard updates, and multiplayer packet delivery.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Haptic Integration</h4>\n    <p>\n      Interfaces with device vibration hardware to deliver tactile feedback during card draws and turn notifications.\n    </p>\n  </div>\n</section>",
    "features_html": "<section class=\"content-section\">\n  <h2>Key Features</h2>\n\n  <p>\n    Joy Rummy is a meticulously crafted, skill-based mobile card application designed to bring the traditional 13-card strategy experience directly to digital screens. Built as an interactive hub for cognitive engagement and casual entertainment, the platform serves enthusiasts seeking a structured, immersive environment to test their memory, pattern recognition, and tactical decision-making.\n  </p>\n\n  <h3>Comprehensive Application Purpose and Educational Value</h3>\n\n  <p>\n    Beyond simple entertainment, the application functions as an interactive digital academy for card game strategy, helping users sharpen their analytical skills.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>Cognitive Skill Enhancement</h4>\n    <p>\n      Players naturally develop advanced probability calculations by tracking discarded cards and evaluating the statistical likelihood of drawing missing sequences.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Strategic Planning</h4>\n    <p>\n      The app teaches disciplined resource management, requiring participants to balance defensive melding with offensive card collection under strict turn-based constraints.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Accessibility to Traditional Rules</h4>\n    <p>\n      By digitizing classic South Asian card mechanics, the platform acts as an educational bridge, allowing younger generations to learn traditional cultural card games in an organized, modern format.\n    </p>\n  </div>\n\n  <h3>The Core Game Mechanics</h3>\n\n  <p>\n    The application faithfully models traditional rummy architecture, ensuring an authentic experience across every digital match.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>The Table Setup</h4>\n    <p>\n      Matches accommodate 2 to 6 players per virtual table. Each participant receives a starting hand of 13 cards dealt from standard decks, while remaining cards populate the central draw and discard pools.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>The Primary Objective</h4>\n    <p>\n      Participants must systematically draw and discard cards on each sequential turn to organize their hand into valid structural configurations, specifically \"Sets\" (three or four matching rank cards) and \"Runs\" (consecutive sequences of the same suit).\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Point Evaluation and Resolution</h4>\n    <p>\n      A round successfully concludes when a player completes all required melds and declares their hand. Scoring calculates penalties based strictly on unmelded cards remaining in opponent hands, rewarding efficient tactical play.\n    </p>\n  </div>\n\n  <h3>Engaging Play Modes</h3>\n\n  <p>\n    To accommodate diverse user schedules and strategic goals, Joy Rummy incorporates multiple distinct operational environments.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>AI Practice Arena</h4>\n    <p>\n      An offline sandbox environment where users can experiment with unconventional card combinations and refine their strategies against computer-controlled opponents featuring adjustable difficulty scaling.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Custom Friend Lobbies</h4>\n    <p>\n      A dedicated social architecture allowing hosts to generate secure, private room codes for seamless, remote multiplayer sessions with family and friends.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Global Matchmaking</h4>\n    <p>\n      An automated quick-play queue pairing users globally with opponents of comparable skill tiers, complemented by a monthly competitive leaderboard tracking overall strategic milestones.\n    </p>\n  </div>\n</section>",
    "seo_title": "Joy Rummy App Review: Features, Gameplay, and User Guide | RummyDex",
    "seo_description": "Explore a comprehensive review of Joy Rummy on RummyDex. Discover core 13-card gameplay mechanics, engaging play modes, and user experiences",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": false,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [
      {
        "question": "1. What type of rummy gameplay does Joy Rummy offer?",
        "answer": "Joy Rummy is built around the traditional 13-card rummy format, where players organize cards into valid sequences and sets before declaring their hand. The gameplay emphasizes strategic planning, memory, and decision-making rather than relying solely on chance."
      },
      {
        "question": "2. Does Joy Rummy include both practice and competitive game modes?",
        "answer": "Yes. The application offers offline AI practice for learning strategies and improving gameplay, along with online matchmaking and private multiplayer rooms for users who want to compete with friends or players from around the world."
      },
      {
        "answer": "No. The core gameplay is available without making any purchases. Optional in-app purchases primarily focus on cosmetic enhancements and personalization features, allowing players to customize their experience without affecting competitive balance.",
        "question": "3. Are in-app purchases required to enjoy the complete gameplay experience?"
      },
      {
        "question": "4. What makes Joy Rummy suitable for long-term players?",
        "answer": "Joy Rummy combines skill-based gameplay with features such as global matchmaking, private rooms, AI practice, and regular content improvements. These features provide both new and experienced players with a consistent and engaging environment to refine their strategies over time."
      }
    ],
    "created_at": "2026-08-05T15:42:57.962Z",
    "updated_at": "2026-08-06T05:58:39.493Z",
    "custom_admin_box_heading": "Hands-On Review",
    "custom_admin_box_html": "<section class=\"content-section\">\n  <h2>The Hands-On User Experience</h2>\n\n  <p>\n    The user interface of Joy Rummy is purposefully engineered to eliminate visual clutter, allowing players to focus entirely on tactical execution and board awareness.\n  </p>\n\n  <h3>Visual Design and Interaction Dynamics</h3>\n\n  <div class=\"feature-item\">\n    <h4>Fluid Drag-and-Drop Controls</h4>\n    <p>\n      Card movement relies on a responsive physics-based system where cards snap securely into position, offering satisfying tactile feedback during fast-paced turns.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Smart Organization Tools</h4>\n    <p>\n      To alleviate screen-space limitations on smaller mobile displays, the app includes an \"Auto-Group\" feature that instantly categorizes hand components by suit and color.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Distraction-Free Signaling</h4>\n    <p>\n      The digital table utilizes minimalist, high-contrast aesthetics, featuring subtle visual glows that indicate valid meld formations without pulling focus from the broader game state.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Structured Communication</h4>\n    <p>\n      To maintain a positive community atmosphere, open text chat is replaced by a curated suite of animated emotes and quick phrases, enabling efficient expression without interrupting match pacing.\n    </p>\n  </div>\n\n  <h3>Player Engagement and Community Feedback</h3>\n\n  <p>\n    User interaction patterns and reviews highlight several core operational strengths alongside areas for continuous technical refinement.\n  </p>\n\n  <div class=\"feature-item\">\n    <h4>Rapid Match Initiation</h4>\n    <p>\n      Players frequently praise the speed of the global matchmaking queue, noting an average transition time of under ten seconds from the home screen to an active table.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Pacing and Advertisement Flow</h4>\n    <p>\n      As a freemium platform, video advertisements are displayed between completed rounds. While necessary for platform maintenance, some users observe that ad frequency can occasionally disrupt long gaming sessions.\n    </p>\n  </div>\n\n  <div class=\"feature-item\">\n    <h4>Interface Density</h4>\n    <p>\n      While the responsive layout adapts well to modern devices, users operating older, compact smartphones occasionally report that managing 13 stacked cards requires precise touch inputs to avoid accidental discards.\n    </p>\n  </div>\n</section>"
  },
  {
    "id": "to56xasfo",
    "name": "JAIHO 91",
    "slug": "jaiho-91",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784877512/download_16_fznggx.webp",
    "category": "All Apps, Yono Apps",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 7,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:22:37.662Z",
    "updated_at": "2026-08-06T06:22:37.662Z"
  },
  {
    "id": "x1mivt2cj",
    "name": "OK RUMMY",
    "slug": "ok-rummy",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784877617/download_19_w2sxhp.webp",
    "category": "All Apps, Yono Apps",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 8,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:23:32.759Z",
    "updated_at": "2026-08-06T06:23:32.759Z"
  },
  {
    "id": "ozhj4pz5s",
    "name": "JAIHO SLOTS",
    "slug": "jaiho-slots",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784877660/download_20_x106v3.webp",
    "category": "All Apps, Yono Apps",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 9,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:24:15.614Z",
    "updated_at": "2026-08-06T06:24:15.614Z"
  },
  {
    "id": "l7e8oyo9m",
    "name": "YONO ARCADE",
    "slug": "yono-arcade",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784877459/download_14_krbwrv.webp",
    "category": "All Apps, Yono Apps",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 10,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:25:01.322Z",
    "updated_at": "2026-08-06T06:25:01.322Z"
  },
  {
    "id": "jr5xf2b1s",
    "name": "BINGO 101",
    "slug": "bingo-101",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784877567/download_18_lljdaa.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 11,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:25:34.518Z",
    "updated_at": "2026-08-06T06:25:34.518Z"
  },
  {
    "id": "08exxq5q9",
    "name": "ABC RUMMY",
    "slug": "abc-rummy",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784878050/download_26_awtrna.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 12,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:25:57.922Z",
    "updated_at": "2026-08-06T06:25:57.922Z"
  },
  {
    "id": "kc3u0sl2h",
    "name": "EVER 777",
    "slug": "ever-777",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784878592/download_28_mhxps5.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 13,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:26:23.645Z",
    "updated_at": "2026-08-06T06:26:23.645Z"
  },
  {
    "id": "v9ky6l07h",
    "name": "LOVE RUMMY",
    "slug": "love-rummy",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784878950/download_31_s7fonv.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 14,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:26:53.266Z",
    "updated_at": "2026-08-06T06:26:53.266Z"
  },
  {
    "id": "0jfvh7lrx",
    "name": "SHARE SLOTS",
    "slug": "share-slots",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784879544/download_36_zeiyxs.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 15,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:27:21.563Z",
    "updated_at": "2026-08-06T06:27:21.563Z"
  },
  {
    "id": "89d79z398",
    "name": "YONO VIP",
    "slug": "yono-vip",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784879809/download_39_znq2ql.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 16,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:28:39.740Z",
    "updated_at": "2026-08-06T06:28:39.740Z"
  },
  {
    "id": "m6bwb6cnb",
    "name": "MAHA GAMES",
    "slug": "maha-games",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784879172/download_33_d1pgy0.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 17,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:29:16.107Z",
    "updated_at": "2026-08-06T06:29:16.107Z"
  },
  {
    "id": "y7lefyq14",
    "name": "RUMMY LUDO",
    "slug": "rummy-ludo",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784879252/download_34_wrdzdw.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 18,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:29:45.975Z",
    "updated_at": "2026-08-06T06:29:45.975Z"
  },
  {
    "id": "lzcn7ehst",
    "name": "789 JACKPORTS",
    "slug": "789-jackports",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784879711/download_38_pmpbnu.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 19,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:30:34.425Z",
    "updated_at": "2026-08-06T06:30:34.425Z"
  },
  {
    "id": "jl9bx9llw",
    "name": "777 GAME",
    "slug": "777-game",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784878294/download_27_ex1vzp.webp",
    "category": "General",
    "encrypted_link": "",
    "rating": 5,
    "safety_status": "Verified",
    "serial_number": 20,
    "version": "1.0",
    "file_size": "Unknown",
    "developer": "Admin",
    "description_html": "",
    "features_html": "",
    "custom_admin_box_heading": "",
    "custom_admin_box_html": "",
    "seo_title": "",
    "seo_description": "",
    "seo_keywords": "",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-06T06:31:18.240Z",
    "updated_at": "2026-08-06T06:31:18.240Z"
  }
] as any[];

export const saveMockApps = (apps: AppConfig[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: GlobalSettings = {
  "site_title": "RummyDex",
  "meta_description": "RummyDex is the ultimate game directory. Access hand-tested reviews, verified secure links, and daily news to elevate your mobile experience.",
  "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785719943/1000132603_ym7nto.jpg",
  "favicon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png",
  "helpline_whatsapp": "",
  "helpline_telegram": "",
  "support_email": "rummydex1@gmail.com",
  "disclaimer_text": "",
  "ethics_discrimination_text": "",
  "ticker_text": "",
  "animations_enabled": true,
  "categories": [
    "All Apps",
    "Yono Apps",
    "Card Apps",
    "Funny games"
  ],
  "banners": [],
  "quick_links": [],
  "website_faqs": [
    {
      "answer": "RummyDex is an all-in-one digital discovery portal. We simplify your search for quality mobile apps by providing curated app listings, hands-on performance reviews, lightweight video previews, and daily industry news—all in one structured directory.",
      "question": "​Q1: What is RummyDex, and how does it help me find the best apps?"
    },
    {
      "question": "Q2: How does RummyDex ensure listed apps perform well on my device?",
      "answer": "Every application featured on our platform undergoes real, hands-on evaluation by our team. We analyze frame rate stability, thermal efficiency, battery consumption, and overall interface responsiveness so you know exactly how an app behaves before you install it."
    },
    {
      "question": "Q3: Does RummyDex host software files directly on its servers?",
      "answer": "No. We function as a secure informational bridge. We review software and provide verified, direct routing to official developer sources. This guarantees you always access authentic, unalterable releases straight from the original creators."
    },
    {
      "question": "Q4: Do I need an account or subscription to use RummyDex?",
      "answer": "Not at all. RummyDex is an open-access resource. You can explore our full app index, stream video review highlights, read technical breakdowns, and check daily platform news completely free, with no account registration required."
    },
    {
      "question": "Q5: What will I find in the News and Video sections?",
      "answer": "Our News section keeps you updated on major software patches, developer announcements, and mobile trends. Our Video section offers fast, lightweight gameplay and UI clips so you can visually inspect an app’s performance before visiting the developer source"
    },
    {
      "question": "Q6: How frequently are new reviews and apps added?",
      "answer": "Our catalog is constantly growing. We continuously evaluate new submissions, test software updates, and publish fresh insights to ensure our directory reflects the newest and most reliable mobile applications available."
    }
  ],
  "developers": [
    {
      "bio": "Chief Executive Officer (CEO), RummyDex\nAs the visionary architect behind RummyDex, the CEO is dedicated to transforming how users discover and experience mobile entertainment. Driven by a strict commitment to digital transparency and platform integrity, the CEO leads the strategic direction of the directory, ensuring that every featured application meets rigorous standards for performance, safety, and overall quality. By championing a zero-bias, hands-on review process and prioritizing a seamless, secure user experience, the CEO drives RummyDex’s mission to be the internet’s most trusted, authoritative hub for premium offline and online casual games.",
      "role": "CEO",
      "github": "",
      "image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785064868/download_47_tltvqo.webp",
      "twitter": "",
      "name": "Jeet Roj"
    },
    {
      "name": "Shehzad .L",
      "role": "Chief Technology Officer (CTO)",
      "image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785718054/1000132675_11zon_pogxm7.jpg",
      "github": "",
      "twitter": "",
      "bio": "As the lead technical architect of RummyDex, the CTO drives the core engineering, database infrastructure, and platform security of the website. Responsible for maintaining a high-performance framework, the CTO ensures lightning-fast search indexing, real-time content delivery for our active News Hub, and robust server stability under heavy traffic. By continuously optimizing back-end operations and system architecture, the CTO guarantees that navigating RummyDex remains an exceptionally fast, smooth, and reliable experience for every user."
    }
  ],
  "secure_index_subtitle": "RummyDex is the ultimate game directory. Access hand-tested reviews, verified secure links, and daily news to elevate your mobile experience.",
  "hero_title_subtitle": "RummyDex is the ultimate game directory. Access hand-tested reviews, verified secure links, and daily news to elevate your mobile experience.",
  "social_linkedin": "",
  "responsibility_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Platform Responsibility Clause — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Platform Responsibility Clause</h1>\n<p class=\"updated\">Last modified: August 2, 2026</p>\n\n<h2>1. Technical Operations &amp; Secure Routing</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M96 54l9 8-9 8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<circle cx=\"52\" cy=\"62\" r=\"4\" fill=\"#3c4043\"/>\n<circle cx=\"128\" cy=\"62\" r=\"4\" fill=\"#3c4043\"/>\n</svg>\n<p>Our operational responsibility is strictly limited to maintaining the RummyDex directory infrastructure. We ensure that our platform accurately catalogs applications and that all outbound links securely and correctly route users to legitimate, third-party developer sources at the time of publication.</p>\n\n<h2>2. Limits of Content &amp; Software Liability</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 40h44M68 55h44M68 70h30\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"93\" r=\"9\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n<path d=\"M86 93h8M90 89v8\" stroke=\"#ea4335\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex does not host software, APK files, or proprietary code on our servers. Because our control is limited entirely to our own website interface, we are not liable for the performance, data practices, or digital security of external third-party destinations. Downloading or installing software from external sources is conducted solely at the user's own risk.</p>\n\n<h2>3. Post-Listing Developer Modifications</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"40\" y=\"35\" width=\"55\" height=\"60\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M52 50h30M52 62h30M52 74h18\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<path d=\"M108 45l14 14-14 14\" fill=\"none\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<rect x=\"115\" y=\"70\" width=\"30\" height=\"30\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M122 85h16M122 92h10\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>While our team conducts hands-on evaluations prior to listing any application, we do not govern external developers. We are not responsible for unannounced updates, post-launch mechanic changes, or software modifications implemented by third parties after an app has been published on our site.</p>\n\n<h2>4. Policy Enforcement &amp; User Experience</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"65\" cy=\"55\" r=\"14\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M35 100c0-18 13-30 30-30s30 12 30 30\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"112\" y=\"35\" width=\"40\" height=\"52\" rx=\"4\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/>\n<path d=\"M120 50h24M120 61h24M120 72h16\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>For information regarding how RummyDex handles non-compliant developer updates, community oversight, and user-submitted reports, please refer to our dedicated Terms &amp; Conditions and our App Reporting system.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "portal_heading": "Official App Store & Gaming Directory",
  "disclaimer_heading": "Disclaimer",
  "important_notice_heading": "Important Notice",
  "seo_keywords": "",
  "terms_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Terms & Conditions — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\na{color:#1a73e8;text-decoration:none}\na:hover{text-decoration:underline}\n</style>\n</head>\n<body>\n\n<h1>Terms &amp; Conditions</h1>\n<p class=\"updated\">Effective Date: August 2, 2026</p>\n\n<h2>1. Agreement to Terms</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 40h44M68 55h44M68 70h44\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<path d=\"M70 88l10 10 20-20\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>By accessing RummyDex, you agree to be bound by these Terms &amp; Conditions. If you disagree with any part of these terms, please do not use our app directory, news portal, or video features.</p>\n\n<h2>2. Intellectual Property</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40a20 20 0 100 40 20 20 0 100-40\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/>\n<path d=\"M90 46v28M78 60h24\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex retains ownership of its original content, design, and editorial features. However, we do not claim ownership of the third-party apps listed on our site. All app names, logos, and trademarks belong to their respective original developers.</p>\n\n<h2>3. Acceptable Use</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"55\" r=\"30\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 33l44 44\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M40 108h100\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>RummyDex is provided for your personal, non-commercial use. You agree not to:</p>\n<ul>\n<li>Use automated bots or scrapers to extract our data or reviews.</li>\n<li>Interfere with the security or performance of our website.</li>\n<li>Submit false or spam requests through our App Reporting system.</li>\n</ul>\n\n<h2>4. Third-Party Links Disclaimer</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<circle cx=\"128\" cy=\"62\" r=\"6\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n<path d=\"M125 62h6M128 59v6\" stroke=\"#ea4335\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex acts solely as an informational bridge and does not host APK or software files on our servers.</p>\n<ul>\n<li>Clicking an external link directs you to a third-party destination that we do not control.</li>\n<li>Downloading and installing third-party software is done entirely at your own risk. RummyDex is not responsible for any device damage or data loss.</li>\n</ul>\n\n<h2>5. App Reporting &amp; Compliance</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M60 40h60l-6 68H66z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M72 30h36l4 10H68z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M78 55v38M90 55v38M102 55v38\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>We enforce a strict zero-tolerance policy against apps containing malicious code or unauthorized real-money mechanics. We investigate user reports and reserve the right to remove or delist any application from our directory at any time without prior notice.</p>\n\n<h2>6. Limitation of Liability</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v26\" stroke=\"#fbbc04\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"78\" r=\"3\" fill=\"#fbbc04\"/>\n</svg>\n<p>RummyDex is provided on an \"as is\" and \"as available\" basis. To the maximum extent permitted by law, RummyDex and its team shall not be liable for any direct or indirect damages, losses, or issues resulting from your use of our platform or the third-party apps we link to.</p>\n\n<h2>7. Modifications</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M65 45a30 30 0 1130 40\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M60 38l5 12 12-4\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<rect x=\"55\" y=\"90\" width=\"70\" height=\"18\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>We reserve the right to update these terms at any time. By continuing to use RummyDex after changes are posted, you agree to be bound by the revised terms.</p>\n\n<h2>8. Contact Information</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"35\" y=\"40\" width=\"110\" height=\"55\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M35 46l55 35 55-35\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>If you have any questions regarding these Terms &amp; Conditions, please contact us at:</p>\n<p>Support Email: <a href=\"mailto:rummydex1@gmail.com\">rummydex1@gmail.com</a></p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "last_updated": "2026-08-03T16:10:13.769Z",
  "important_notice": "",
  "ethics_heading": "Ethics & Safety",
  "hero_title_visible": true,
  "ga_tracking_id": "",
  "secure_index_title": "RummyDex",
  "privacy_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Privacy Policy — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:40px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:6px 0}\n.art{display:block;margin:16px 0}\n.note{color:#5f6368;font-size:13px;margin-top:36px;border-top:1px solid #dadce0;padding-top:14px}\na{color:#1a73e8}\n</style>\n</head>\n<body>\n\n<h1>Privacy Policy</h1>\n<p class=\"updated\">Effective Date: August 2 2026</p>\n\n<h2>1. Introduction</h2>\n<svg class=\"art\" width=\"150\" height=\"100\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n</svg>\n<p>Welcome to RummyDex. This Privacy Policy governs the manner in which RummyDex collects, uses, maintains, and discloses information collected from users visiting our digital directory, news portal, and software index. We are dedicated to safeguarding your privacy and ensuring complete transparency regarding how data is handled while you explore our app listings, news updates, and video reviews.</p>\n\n<h2>2. Information Collection</h2>\n<p>RummyDex operates primarily as an open informational resource. We do not require visitors to register an account, subscribe, or submit sensitive personal identification information to access our app directory, read our news, or view video reviews.</p>\n<p><strong>Non-Personal Technical Data:</strong> Whenever you interact with RummyDex, our system may automatically collect non-personally identifiable technical information. This includes your browser type, device specifications, operating system, internet service provider (ISP), referring URLs, IP address, general geographic region, and interaction metrics on our site.</p>\n<p><strong>Direct Communication Data:</strong> If you contact us directly via email for support or feedback, we collect the email address and information you voluntarily provide to address your inquiry.</p>\n\n<h2>3. Web Browser Cookies &amp; Analytics</h2>\n<svg class=\"art\" width=\"150\" height=\"100\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"38\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"75\" cy=\"48\" r=\"5\" fill=\"#fbbc04\"/>\n<circle cx=\"100\" cy=\"55\" r=\"4\" fill=\"#1a73e8\"/>\n<circle cx=\"105\" cy=\"78\" r=\"5\" fill=\"#ea4335\"/>\n</svg>\n<p>Our website utilizes \"cookies\" and similar web technologies to enhance user navigation, measure traffic patterns, and optimize the overall performance of our directory.</p>\n<ul>\n<li>A cookie is a small text file placed on your device's storage for record-keeping and traffic analysis.</li>\n<li>Cookies help us understand which app reviews, news articles, and video features are most useful to our community.</li>\n</ul>\n<p><strong>User Control:</strong> You retain full authority over your browser settings. You may set your web browser to reject cookies or alert you when cookies are being transmitted. Please note that disabling cookies may affect certain non-essential layout features on our site.</p>\n\n<h2>4. News, Media, and Lightweight Video Features</h2>\n<p>To provide comprehensive reviews, RummyDex features lightweight video snippets and daily news updates. Interacting with these features operates under strict data-minimization standards:</p>\n<ul>\n<li>Viewing media content embedded directly on RummyDex does not harvest personal user files or device storage.</li>\n<li>Aggregated, anonymous metrics (such as video view counts or news reading time) may be processed to help us improve content delivery and bandwidth efficiency.</li>\n</ul>\n\n<h2>5. External Links and Third-Party Software</h2>\n<svg class=\"art\" width=\"150\" height=\"100\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#fbbc04\" stroke-width=\"3\"/>\n<circle cx=\"128\" cy=\"62\" r=\"6\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n</svg>\n<p>RummyDex functions strictly as an informational bridge. We do not host, store, or distribute APK files, application packages, or software directly on our primary servers. Instead, we evaluate software and provide safe, verified outgoing links to official developer sites or third-party platforms.</p>\n<p><strong>Leaving Our Portal:</strong> Clicking an external link directs you outside the jurisdiction of RummyDex.</p>\n<p><strong>Third-Party Policies:</strong> We do not own, manage, or control the privacy standards, security protocols, or data collection practices of external websites or applications. Interaction on any external platform is governed entirely by that third party's privacy policy and terms.</p>\n\n<h2>6. Data Security Practices</h2>\n<p>We implement appropriate data collection, storage, and processing practices alongside standard security measures to protect against unauthorized access, modification, or disclosure of technical log data stored on our servers. While we maintain rigorous standards to safeguard our digital portal, no electronic storage or internet transmission can be guaranteed as 100% immune to all vulnerabilities.</p>\n\n<h2>7. Changes to This Privacy Policy</h2>\n<p>RummyDex reserves the right to update, modify, or revise this Privacy Policy at any time. When updates occur, the revised date at the top of this page will be updated accordingly. We encourage users to periodically review this page to stay informed about how we protect visitor data.</p>\n\n<h2>8. Acceptance of These Terms</h2>\n<p>By utilizing RummyDex, you signify your explicit acceptance of this Privacy Policy. If you do not agree with these terms, please discontinue use of our platform. Your continued navigation of the site following posted policy updates constitutes acceptance of those changes.</p>\n\n<h2>9. Contacting Us</h2>\n<p>If you have questions, feedback, or concerns regarding this Privacy Policy or your interactions with our platform, please reach out to our team at:</p>\n<p>Support Email: <a href=\"mailto:rummydex1@gmail.com\">rummydex1@gmail.com</a></p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "social_instagram": "",
  "social_facebook": "",
  "hero_title_color": "classic-dark",
  "social_youtube": "",
  "hero_title_text": "RummyDex",
  "trending_searches": "",
  "hero_title_style": "modern",
  "report_removal_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Report & Removal Policy — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Report &amp; Removal Policy</h1>\n<p class=\"updated\">Effective Date: August 2, 2026</p>\n\n<h2>1. Our Commitment to a Safe Directory</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>RummyDex is dedicated to providing a secure, purely entertainment-focused digital index. Because third-party developers can alter their apps dynamically after our initial review, we rely on active community oversight to help maintain our platform's integrity.</p>\n\n<h2>2. What You Should Report</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v26\" stroke=\"#ea4335\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"78\" r=\"3\" fill=\"#ea4335\"/>\n<path d=\"M40 105h100\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>Please immediately report any listed application that exhibits the following violations:</p>\n<ul>\n<li><strong>Real-Money Gaming (RMG):</strong> The sudden introduction of mandatory deposits, gambling, or real-money betting mechanics.</li>\n<li><strong>Deceptive Updates:</strong> Drastic changes to core gameplay (e.g., an offline puzzle updating into an unverified casino app).</li>\n<li><strong>Broken or Malicious Links:</strong> A resource link that redirects to an unsafe, unverified page instead of the official developer source.</li>\n<li><strong>Intrusive Ads or Malware:</strong> Applications that introduce unskippable system-level ads or malicious behavior that compromises device performance.</li>\n</ul>\n\n<h2>3. How to Submit a Report</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"20\" width=\"90\" height=\"70\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M60 40h60M60 55h60M60 70h35\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<rect x=\"70\" y=\"95\" width=\"40\" height=\"18\" rx=\"4\" fill=\"#1a73e8\"/>\n</svg>\n<p>Reporting is simple and direct. Use the \"Report App\" button located at the bottom of every individual app review page. Select the reason for your report and provide a brief description of the issue you experienced.</p>\n\n<h2>4. Our Review Process</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"75\" cy=\"45\" r=\"16\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M40 105c0-22 16-38 35-38s35 16 35 38\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"122\" cy=\"82\" r=\"18\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n<path d=\"M135 95l14 14\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>Every submitted report goes directly to our moderation team. We do not use automated bots for this process; a real team member will manually re-test the application and verify the outbound links to confirm the reported violations.</p>\n\n<h2>5. The 100% Permanent Removal Guarantee</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M60 40h60l-6 68H66z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M72 30h36l4 10H68z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M78 55v38M90 55v38M102 55v38\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>We operate with a strict zero-tolerance policy for financial risk mechanisms and deceptive software. If we verify that an application violates our safety guidelines:</p>\n<ul>\n<li>The application's dedicated page will be immediately taken down.</li>\n<li>All outbound links to the software will be permanently severed.</li>\n<li>The developer will be strictly prohibited from relisting the application on our directory.</li>\n</ul>\n\n<h2>6. False Reporting</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v22\" stroke=\"#fbbc04\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<path d=\"M90 62l14 8\" stroke=\"#fbbc04\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n</svg>\n<p>We highly value genuine community feedback. However, deliberately spamming the system or submitting false claims to maliciously target specific games may result in a restriction of your ability to submit future reports or interact with platform features.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "hero_title_animation": "fade-in",
  "about_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>About Us — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>About Us</h1>\n<p class=\"updated\">Last modified: August 2, 2026</p>\n\n<h2>The Meaning of \"Dex\" (Who We Are)</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 38h44M68 52h44M68 66h44M68 80h30\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>Welcome to RummyDex. The word \"Dex\" stands for index or directory, which perfectly describes our core identity. We are an independent digital library built to catalog, review, and provide structured, transparent information about casual games and digital applications. Our platform is designed to be a complete informational hub for entertainment enthusiasts, encompassing everything from app discovery to the latest daily updates.</p>\n\n<h2>How We Provide Information &amp; Links</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M96 54l9 8-9 8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>We function strictly as an informational bridge. Instead of hosting direct software or APK files on our servers, we provide comprehensive technical breakdowns, clear guides, and safe, direct links to third-party developer sources. This ensures that our platform remains fast and secure, and that you always access applications straight from the source.</p>\n\n<h2>Real Hands-On Testing &amp; Video Highlights</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"30\" width=\"90\" height=\"60\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M80 48l22 12-22 12z\" fill=\"#1a73e8\"/>\n<path d=\"M65 100l10-10M115 100l-10-10\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>We do not just list apps blindly. Before any application is published on our platform, our team conducts a real, hands-on test. We personally experience the app's performance, mechanics, and user interface to ensure it meets our strict entertainment standards. To give you a clear look at the gameplay, we also feature lightweight, optimized video snippets that showcase the app in action without slowing down your browsing experience.</p>\n\n<h2>Comprehensive News &amp; App Updates</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"50\" y=\"25\" width=\"80\" height=\"80\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M64 45h52M64 58h52M64 71h35\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"122\" cy=\"90\" r=\"14\" fill=\"#fbbc04\"/>\n<path d=\"M117 90h10M122 85v10\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>Beyond our core app directory, RummyDex is a highly active, living ecosystem. We keep our community fully informed through our dedicated News Hub. Whether you are looking for general industry news, major platform shifts, or specific app update news detailing the latest patches and features, we provide all the necessary information so you are always up to date on your favorite digital retreats.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "social_twitter": "",
  "social_links": {
    "twitter": "",
    "linkedin": "",
    "instagram": "https://www.instagram.com/rummydex?igsh=MTJjaGR3c3hmdjhnZA==",
    "youtube": "https://www.youtube.com/@rummydex",
    "facebook": "https://www.facebook.com/share/1951euBy3d/"
  }
} as any;

export const saveMockSettings = (settings: GlobalSettings) => {
  try {
    localStorage.setItem('rummystore_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('saveMockSettings storage failed:', e);
  }
  Object.assign(mockSettings, settings);
};

export const mockNews: NewsItem[] = [
  {
    "content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Application Hub is Officially LIVE!</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>🚀 Welcome to the Future of App Discovery: Application Hub is Officially LIVE!</h1>\n<p class=\"updated\">Published: August 1, 2026</p>\n\n<p>The moment you have been waiting for is finally here! We have officially opened the gates to Application Hub, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>\n<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>\n\n<h2>🛡️ The Power of Complete Neutrality</h2>\n<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the Application Hub platform.</p>\n<p>We operate with zero developer bias. When you read an Application Hub review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>\n\n<h2>⚠️ Important Update: The App Vault is Verifying...</h2>\n<p>While the Application Hub website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>\n<p>Please wait just a little bit longer—our verified apps are coming very soon.</p>\n<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>\n<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>\n\n<p class=\"note\">Application Hub — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
    "ceo_name": "The Editorial Team",
    "id": "vw78pxmf9",
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Application Hub is Officially LIVE!</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>🚀 Welcome to the Future of App Discovery: Application Hub is Officially LIVE!</h1>\n<p class=\"updated\">Published: August 1, 2026</p>\n\n<p>The moment you have been waiting for is finally here! We have officially opened the gates to Application Hub, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>\n<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>\n\n<h2>🛡️ The Power of Complete Neutrality</h2>\n<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the Application Hub platform.</p>\n<p>We operate with zero developer bias. When you read an Application Hub review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>\n\n<h2>⚠️ Important Update: The App Vault is Verifying...</h2>\n<p>While the Application Hub website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>\n<p>Please wait just a little bit longer—our verified apps are coming very soon.</p>\n<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>\n<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>\n\n<p class=\"note\">Application Hub — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
    "target_region": "Global ",
    "created_at": "2026-08-01T04:29:15.305Z",
    "title": "Application Hub is LIVE! The Ultimate App Portal is Here",
    "date": "2026-08-01T04:29:15.305Z",
    "canonical_url": "https://www.example.com/notice/",
    "is_breaking": false,
    "seo_description": "Welcome to Application Hub! Explore our newly launched platform dedicated to neutral, hand-tested app reviews. Our verified app vault is opening very soon.",
    "seo_title": "Application Hub is LIVE - Premium App Directory & Reviews",
    "is_pinned": false,
    "link": "https://www.example.com/app-hub-is-live",
    "description": "Application Hub is officially published! We are bringing you the absolute best in hand-tested mobile entertainment. Read our launch update while our first wave of premium apps undergoes final verification!",
    "ceo_description": "Editorial Board",
    "image_url": "",
    "published_at": "2026-08-01T04:29:15.305Z",
    "is_new": true,
    "category": "Announcements",
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",
    "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",
    "updated_at": "2026-08-01T04:33:51.227Z",
    "slug": "app-hub-is-live"
  },
  {
    "slug": "callbreak-live-on-rummydex",
    "description_html": "Callbreak Joins the RummyDex Vault: Full Hands-On Breakdown Now Live\nWe are excited to announce that Callbreak: Classic Card Games has officially been added to our growing digital directory!\nOur benchmark and review team spent hours putting Callbreak through real-world testing across multiple devices. Whether you are a seasoned player familiar with trick-taking strategy or a casual gamer looking for a smooth mobile experience, our full listing gives you an unfiltered look at what it is actually like to play.\nWhat We Tested in Our Callbreak Review\nInstead of just listing game features, our newly published review breaks down the actual day-to-day feel of the application, including:\nGameplay Flexibility: How the game handles offline single-player AI matches, local Wi-Fi tables, and global real-time multiplayer.\nTactical Quality-of-Life Tools: A close look at in-game features like the Undo button, Reshuffle option, and Card History logs that make matches smoother for strategic players.\nSpecial Game Modes: Details on unique variants featured in the app, including the high-stakes Blind Bid Mode and the fast-paced Super 8 Bid Challenge.\nHardware & Battery Benchmarks: Real data on frame rate stability (60 FPS), thermal output, and battery consumption on standard mobile devices.\nUnfiltered Friction Points: Honest feedback on ad frequency between matches, AI predictability patterns, and server stability during peak multiplayer times.\nExplore the Full Review Today\nBefore you download or sit down at a virtual table, get the full breakdown on RummyDex. We tell you exactly how the game plays, where it shines, and where it gets frustrating—so you can decide if it’s the right fit for your mobile setup.",
    "created_at": "2026-08-04T17:08:11.833Z",
    "is_new": true,
    "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785865490/1000133006_11zon_fvsjpe.webp",
    "image_url": "",
    "description": "The popular South Asian trick-taking card game Callbreak has officially arrived on RummyDex. Explore our neutral, hand-tested review covering offline AI performance, table mechanics, and real-world friction points.",
    "category": "Card Apps ",
    "title": "Callbreak is Now Live on RummyDex: Read Our Full Hands-On Review",
    "updated_at": "2026-08-04T17:54:21.650Z",
    "is_breaking": false,
    "related_app_id": "ha76icslh",
    "published_at": "2026-08-04T17:08:11.833Z",
    "date": "2026-08-04T17:08:11.833Z",
    "id": "5hc6ok8fj",
    "is_pinned": false,
    "seo_title": ": Callbreak Review - Technical Performance & Gameplay | RummyDex",
    "seo_description": "Read our neutral, hand-tested review of Callbreak. Discover battery usage, thermal efficiency, multiplayer stability, and friction points before downloading",
    "content": "Callbreak Joins the RummyDex Vault: Full Hands-On Breakdown Now Live\nWe are excited to announce that Callbreak: Classic Card Games has officially been added to our growing digital directory!\nOur benchmark and review team spent hours putting Callbreak through real-world testing across multiple devices. Whether you are a seasoned player familiar with trick-taking strategy or a casual gamer looking for a smooth mobile experience, our full listing gives you an unfiltered look at what it is actually like to play.\nWhat We Tested in Our Callbreak Review\nInstead of just listing game features, our newly published review breaks down the actual day-to-day feel of the application, including:\nGameplay Flexibility: How the game handles offline single-player AI matches, local Wi-Fi tables, and global real-time multiplayer.\nTactical Quality-of-Life Tools: A close look at in-game features like the Undo button, Reshuffle option, and Card History logs that make matches smoother for strategic players.\nSpecial Game Modes: Details on unique variants featured in the app, including the high-stakes Blind Bid Mode and the fast-paced Super 8 Bid Challenge.\nHardware & Battery Benchmarks: Real data on frame rate stability (60 FPS), thermal output, and battery consumption on standard mobile devices.\nUnfiltered Friction Points: Honest feedback on ad frequency between matches, AI predictability patterns, and server stability during peak multiplayer times.\nExplore the Full Review Today\nBefore you download or sit down at a virtual table, get the full breakdown on RummyDex. We tell you exactly how the game plays, where it shines, and where it gets frustrating—so you can decide if it’s the right fit for your mobile setup.",
    "canonical_url": "https://www.rummydex.com/news/callbreak-live-on-rummydex",
    "link": "https://www.rummydex.com/app/callbreak"
  }
] as any[];

export const saveMockNews = (newsList: NewsItem[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockBlogs: BlogPost[] = [] as any[];

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = [] as any[];

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
