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
    "safety_status": "Verified",
    "is_new": true,
    "file_size": "44.8 MB",
    "id": "yh9toduxk",
    "seo_description": "Know about Spin Crush, the ultimate casual gaming hub. Explore diverse offline mini-games, collect virtual coins, and enjoy safe arcade entertainment on RummyDex.",
    "developer": "Bingo",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",
    "release_notes": "",
    "canonical_url": "https://www.rummydex.com/app/spin-crush",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "version": "1.0.6",
    "seo_keywords": "casual game hub, arcade collection, virtual coin games, offline mini-games, spin crush app",
    "updated_at": "2026-08-03T02:37:24.987Z",
    "publish_date": "",
    "encrypted_link": "",
    "category": "All Apps, Yono",
    "screenshots": [],
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",
    "created_at": "2026-08-02T11:14:13.263Z",
    "red_box_msg": "",
    "slug": "spin-crush",
    "features_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Features — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px;display:flex;align-items:center;gap:10px}\nh2 svg{flex-shrink:0}\np{margin:10px 0}\n</style>\n</head>\n<body>\n\n<h1>Features</h1>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><rect x=\"2\" y=\"2\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"15\" y=\"2\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"2\" y=\"15\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"15\" y=\"15\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Massive collection of thematic mini-games housed in one single app.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><circle cx=\"13\" cy=\"13\" r=\"11\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><path d=\"M10 8l8 5-8 5z\" fill=\"#1a73e8\"/></svg>Instant play mechanics with seamless switching between diverse game modes.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><rect x=\"2\" y=\"4\" width=\"22\" height=\"18\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><circle cx=\"9\" cy=\"10\" r=\"2\" fill=\"#1a73e8\"/><path d=\"M2 19l6-6 5 5 4-4 7 6\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Stunning HD graphics ranging from culinary kitchens to ancient mythology.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><path d=\"M13 2l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12V6z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Offline gameplay support for uninterrupted casual entertainment.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><circle cx=\"13\" cy=\"13\" r=\"11\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><path d=\"M8 13l4 4 7-8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>100% virtual rewards and safe, risk-free arcade progression systems.</h2>\n\n</body>\n</html>\n",
    "seo_title": "Spin Crush - Casual Arcade Hub & Virtual Mini-Games",
    "name": "SPIN CRUSH",
    "faqs": [],
    "video_url": "",
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Spin Crush</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:22px;color:#202124;font-weight:500;margin-top:44px;margin-bottom:10px}\nh1:first-of-type{margin-top:0}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n</style>\n</head>\n<body>\n\n<h1>A New Standard for Casual Arcade Gaming</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<circle cx=\"40\" cy=\"40\" r=\"25\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>Spin Crush redefines mobile entertainment by bringing an entire universe of casual mini-games into one accessible platform. Instead of offering a single repetitive loop, this app houses a vast collection of highly detailed thematic games. Whether you are looking for relaxing puzzle mechanics or fast-paced arcade action, this digital playground offers something for every type of player.</p>\n\n<h1>Explore a Diverse Universe of Mini-Games</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<rect x=\"15\" y=\"15\" width=\"50\" height=\"50\" rx=\"8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>The true strength of Spin Crush lies in its incredible variety. You can step into a virtual kitchen and match culinary ingredients in \"Baking Master,\" or explore vibrant cultural themes in \"Wild Bandito\" and \"Pinata Frenzy.\" For fans of mythology and history, \"Thor God of Lightning\" and \"Xerxes\" offer epic visual animations and dynamic virtual coin collection. Action enthusiasts can dive into the tactical environment of \"Royale Battleground\" or step into the ring with \"Boxing King.\" Nature and fantasy lovers are also covered with the prehistoric adventures of \"Jurassic Kingdom,\" the fiery visual combos of \"Coin Volcano,\" and the mystical journey of \"Wukong.\"</p>\n\n<h1>Smooth Performance &amp; Immersive Gameplay</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M25 15l40 25-40 25z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linejoin=\"round\"/>\n</svg>\n<p>Built with top-tier optimization, the app delivers a highly responsive user experience. The intuitive central lobby allows players to effortlessly navigate through different game categories without experiencing heavy loading screens. Every mini-game features sharp 3D graphics, bright colors, and satisfying sound effects that make virtual progression and matching mechanics incredibly engaging.</p>\n\n<h1>Safe, Virtual Entertainment</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M20 40l14 14 26-28\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>Designed as a purely casual simulation, Spin Crush focuses entirely on risk-free fun. Players can dive into thrilling arcade features like the \"Fortune Wheel,\" \"Crazy 777,\" or \"Gemstones Gold\" utilizing strictly virtual points. It is the perfect daily companion for users seeking a polished gaming experience where the focus is on beating high scores, unlocking new visual levels, and enjoying pure digital entertainment.</p>\n\n</body>\n</html>\n",
    "yellow_box_msg": "It get slightly heat on below Android 13",
    "serial_number": 1,
    "rating": 4.1
  },
  {
    "id": "i5uw2apum",
    "name": "RUMMY 77",
    "slug": "rummy-77",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785722974/1000132690_11zon_1_l43qhv.jpg",
    "category": "All Apps, Yono",
    "encrypted_link": "",
    "rating": 4.2,
    "safety_status": "Verified",
    "serial_number": 2,
    "version": "1.0.6",
    "file_size": " 49.2 MB",
    "developer": "Arena studio",
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Inside the Game: What Are You Actually Playing?</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:22px;color:#202124;font-weight:500;margin-top:44px;margin-bottom:14px}\nh1:first-of-type{margin-top:0}\nh2{font-size:17px;color:#202124;font-weight:500;margin-top:26px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:10px 0}\n.art{display:block;margin:18px 0}\n</style>\n</head>\n<body>\n\n<h1>🃏 Inside the Game: What Are You Actually Playing?</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<rect x=\"15\" y=\"15\" width=\"50\" height=\"50\" rx=\"8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>At its core, Rummy 77 is a straightforward, classic 13-card rummy experience. The app doesn't try to reinvent the wheel with heavy 3D graphics or complicated storylines; instead, it focuses entirely on the mechanics of the game itself.</p>\n<p>The moment you launch the app, you are greeted with a remarkably clean lobby. Matchmaking is snappy—during our tests, it rarely took more than a few seconds to find a seat at a virtual table.</p>\n\n<h2>The Table Experience:</h2>\n<p>Once you are in a match, the layout is highly intuitive. The center of the screen houses the closed deck and the open discard pile, while your 13 cards are fanned out clearly at the bottom.</p>\n<ul>\n<li><strong>Auto-Sort Mechanics:</strong> One feature we genuinely appreciated was the responsive \"Sort\" button. With a single tap, the app automatically groups your cards by suit and color, which is a massive time-saver when you are trying to spot potential pure sequences or sets under a time limit.</li>\n<li><strong>Dragging and Discarding:</strong> Moving cards feels natural. The touch response is tight—there is no frustrating lag when you are trying to drag a card to the discard pile right before your turn timer runs out.</li>\n<li><strong>Visual Clarity:</strong> The developers opted for a high-contrast green felt background with large, bold card faces. If you are playing on a smaller phone screen, you won't have to squint to tell the difference between a Spade and a Club.</li>\n</ul>\n\n<h1>⚙️ How Does It Actually Perform?</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<circle cx=\"40\" cy=\"40\" r=\"25\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>We didn't just look at the gameplay; we monitored how the app handled device resources during extended play sessions.</p>\n<ul>\n<li><strong>Fluidity and Frame Rates:</strong> We tested Rummy 77 on both a modern flagship phone and a three-year-old budget Android device. On both, the game maintained a rock-solid 60 FPS. The card dealing animations are smooth, and transitioning in and out of lobbies happens without any frustrating loading screens.</li>\n<li><strong>Battery &amp; Thermal Check:</strong> Card games shouldn't turn your phone into a hand-warmer. Because Rummy 77 relies on clean 2D assets rather than heavy background rendering, it is incredibly lightweight. We played continuously for over an hour, and the battery drain was minimal. More importantly, the back of the device stayed perfectly cool.</li>\n</ul>\n\n<h1>🎯 Our Verdict</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M20 40l14 14 26-28\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>If you are looking for a hyper-realistic casino simulator with heavy 3D avatars, this might not be for you. The UI is admittedly a bit simple. However, if your goal is pure, uninterrupted rummy with excellent touch controls, reliable matchmaking, and zero battery anxiety, Rummy 77 completely hits the mark. It does exactly what it promises, and it does it well.</p>\n\n</body>\n</html>\n",
    "features_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Rummy 77: Our Hands-On Review & Gameplay Breakdown</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:24px;color:#202124;font-weight:500;margin-bottom:20px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n</style>\n</head>\n<body>\n\n<h1>Rummy 77: Our Hands-On Review &amp; Gameplay Breakdown</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M25 15l40 25-40 25z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linejoin=\"round\"/>\n</svg>\n\n<p>When it comes to digital card games, the market is flooded with apps that prioritize flashy menus over actual gameplay. When our team sat down to test Rummy 77, we wanted to see if it actually delivered a solid, reliable card-playing experience or if it was just another generic clone.</p>\n<p>After hours of hands-on testing across multiple devices, here is our neutral, unfiltered breakdown of exactly what Rummy 77 has to offer.</p>\n\n</body>\n</html>\n",
    "seo_title": "Rummy 77 - Hands On Review - Gameplay, Features & Performance | RummyDex",
    "seo_description": "We went hands-on with Rummy 77. Read our neutral review detailing the actual table mechanics, card sorting features, and real-world battery performance.",
    "seo_keywords": "rummy 77 app, real rummy gameplay, rummy 77 review, 13 card rummy",
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785722974/1000132690_11zon_1_l43qhv.jpg",
    "canonical_url": "https://www.rummydex.com/app/rummy-77",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "Play in limit doing anything excess is not good so if you in limit everything are good ",
    "idea_box_msg": "",
    "is_new": false,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-03T02:13:03.477Z",
    "updated_at": "2026-08-03T02:38:06.645Z"
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
  "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png",
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
    "Yono",
    "Card"
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
  "last_updated": "2026-08-03T01:31:07.069Z",
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
    "id": "vw78pxmf9",
    "slug": "app-hub-is-live",
    "title": "Application Hub is LIVE! The Ultimate App Portal is Here",
    "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",
    "description": "Application Hub is officially published! We are bringing you the absolute best in hand-tested mobile entertainment. Read our launch update while our first wave of premium apps undergoes final verification!",
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Application Hub is Officially LIVE!</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>🚀 Welcome to the Future of App Discovery: Application Hub is Officially LIVE!</h1>\n<p class=\"updated\">Published: August 1, 2026</p>\n\n<p>The moment you have been waiting for is finally here! We have officially opened the gates to Application Hub, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>\n<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>\n\n<h2>🛡️ The Power of Complete Neutrality</h2>\n<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the Application Hub platform.</p>\n<p>We operate with zero developer bias. When you read an Application Hub review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>\n\n<h2>⚠️ Important Update: The App Vault is Verifying...</h2>\n<p>While the Application Hub website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>\n<p>Please wait just a little bit longer—our verified apps are coming very soon.</p>\n<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>\n<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>\n\n<p class=\"note\">Application Hub — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
    "content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Application Hub is Officially LIVE!</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>🚀 Welcome to the Future of App Discovery: Application Hub is Officially LIVE!</h1>\n<p class=\"updated\">Published: August 1, 2026</p>\n\n<p>The moment you have been waiting for is finally here! We have officially opened the gates to Application Hub, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>\n<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>\n\n<h2>🛡️ The Power of Complete Neutrality</h2>\n<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the Application Hub platform.</p>\n<p>We operate with zero developer bias. When you read an Application Hub review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>\n\n<h2>⚠️ Important Update: The App Vault is Verifying...</h2>\n<p>While the Application Hub website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>\n<p>Please wait just a little bit longer—our verified apps are coming very soon.</p>\n<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>\n<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>\n\n<p class=\"note\">Application Hub — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
    "image_url": "",
    "created_at": "2026-08-01T04:29:15.305Z",
    "date": "2026-08-01T04:29:15.305Z",
    "published_at": "2026-08-01T04:29:15.305Z",
    "is_breaking": false,
    "is_new": true,
    "category": "Announcements",
    "is_pinned": false,
    "updated_at": "2026-08-03T01:45:32.163Z",
    "ceo_name": "The Editorial Team",
    "ceo_description": "Editorial Board",
    "seo_title": "Application Hub is LIVE - Premium App Directory & Reviews",
    "seo_description": "Welcome to Application Hub! Explore our newly launched platform dedicated to neutral, hand-tested app reviews. Our verified app vault is opening very soon.",
    "canonical_url": "https://www.example.com/app-hub-is-live",
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",
    "target_region": "Global ",
    "link": "https://www.rummydex.com/"
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
