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
    "id": "yh9toduxk",
    "name": "SPIN CRUSH",
    "slug": "spin-crush",
    "icon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",
    "category": "All Apps, Yono",
    "encrypted_link": "",
    "rating": 4.1,
    "safety_status": "Verified",
    "serial_number": 1,
    "version": "1.0.6",
    "file_size": "44.8 MB",
    "developer": "Bingo",
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Spin Crush</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:22px;color:#202124;font-weight:500;margin-top:44px;margin-bottom:10px}\nh1:first-of-type{margin-top:0}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n</style>\n</head>\n<body>\n\n<h1>A New Standard for Casual Arcade Gaming</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<circle cx=\"40\" cy=\"40\" r=\"25\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>Spin Crush redefines mobile entertainment by bringing an entire universe of casual mini-games into one accessible platform. Instead of offering a single repetitive loop, this app houses a vast collection of highly detailed thematic games. Whether you are looking for relaxing puzzle mechanics or fast-paced arcade action, this digital playground offers something for every type of player.</p>\n\n<h1>Explore a Diverse Universe of Mini-Games</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<rect x=\"15\" y=\"15\" width=\"50\" height=\"50\" rx=\"8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n</svg>\n<p>The true strength of Spin Crush lies in its incredible variety. You can step into a virtual kitchen and match culinary ingredients in \"Baking Master,\" or explore vibrant cultural themes in \"Wild Bandito\" and \"Pinata Frenzy.\" For fans of mythology and history, \"Thor God of Lightning\" and \"Xerxes\" offer epic visual animations and dynamic virtual coin collection. Action enthusiasts can dive into the tactical environment of \"Royale Battleground\" or step into the ring with \"Boxing King.\" Nature and fantasy lovers are also covered with the prehistoric adventures of \"Jurassic Kingdom,\" the fiery visual combos of \"Coin Volcano,\" and the mystical journey of \"Wukong.\"</p>\n\n<h1>Smooth Performance &amp; Immersive Gameplay</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M25 15l40 25-40 25z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linejoin=\"round\"/>\n</svg>\n<p>Built with top-tier optimization, the app delivers a highly responsive user experience. The intuitive central lobby allows players to effortlessly navigate through different game categories without experiencing heavy loading screens. Every mini-game features sharp 3D graphics, bright colors, and satisfying sound effects that make virtual progression and matching mechanics incredibly engaging.</p>\n\n<h1>Safe, Virtual Entertainment</h1>\n<svg class=\"art\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">\n<path d=\"M20 40l14 14 26-28\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>Designed as a purely casual simulation, Spin Crush focuses entirely on risk-free fun. Players can dive into thrilling arcade features like the \"Fortune Wheel,\" \"Crazy 777,\" or \"Gemstones Gold\" utilizing strictly virtual points. It is the perfect daily companion for users seeking a polished gaming experience where the focus is on beating high scores, unlocking new visual levels, and enjoying pure digital entertainment.</p>\n\n</body>\n</html>\n",
    "features_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Features — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px;display:flex;align-items:center;gap:10px}\nh2 svg{flex-shrink:0}\np{margin:10px 0}\n</style>\n</head>\n<body>\n\n<h1>Features</h1>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><rect x=\"2\" y=\"2\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"15\" y=\"2\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"2\" y=\"15\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><rect x=\"15\" y=\"15\" width=\"9\" height=\"9\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Massive collection of thematic mini-games housed in one single app.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><circle cx=\"13\" cy=\"13\" r=\"11\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><path d=\"M10 8l8 5-8 5z\" fill=\"#1a73e8\"/></svg>Instant play mechanics with seamless switching between diverse game modes.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><rect x=\"2\" y=\"4\" width=\"22\" height=\"18\" rx=\"2\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><circle cx=\"9\" cy=\"10\" r=\"2\" fill=\"#1a73e8\"/><path d=\"M2 19l6-6 5 5 4-4 7 6\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Stunning HD graphics ranging from culinary kitchens to ancient mythology.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><path d=\"M13 2l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12V6z\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/></svg>Offline gameplay support for uninterrupted casual entertainment.</h2>\n\n<h2><svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\"><circle cx=\"13\" cy=\"13\" r=\"11\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/><path d=\"M8 13l4 4 7-8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>100% virtual rewards and safe, risk-free arcade progression systems.</h2>\n\n</body>\n</html>\n",
    "seo_title": "Spin Crush - Casual Arcade Hub & Virtual Mini-Games",
    "seo_description": "Know about Spin Crush, the ultimate casual gaming hub. Explore diverse offline mini-games, collect virtual coins, and enjoy safe arcade entertainment on RummyDex.",
    "seo_keywords": "casual game hub, arcade collection, virtual coin games, offline mini-games, spin crush app",
    "og_image_url": "",
    "canonical_url": "",
    "video_url": "",
    "publish_date": "",
    "release_notes": "",
    "red_box_msg": "",
    "yellow_box_msg": "It get slightly heat on below Android 13",
    "idea_box_msg": "",
    "is_new": true,
    "is_coming_soon": false,
    "screenshots": [],
    "faqs": [],
    "created_at": "2026-08-02T11:14:13.263Z",
    "updated_at": "2026-08-02T11:32:45.813Z"
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
  "meta_description": "",
  "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785648485/ezgif-88d07abd3ef5753f_yz8ytg.webp",
  "favicon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785648485/ezgif-88d07abd3ef5753f_yz8ytg.webp",
  "helpline_whatsapp": "",
  "helpline_telegram": "",
  "support_email": "",
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
  "website_faqs": [],
  "developers": [],
  "secure_index_subtitle": "Verified & Transparent App Marketplace",
  "hero_title_subtitle": "COMPREHENSIVE SOCIAL CASUAL E-SPORTS METRICS & UNBIASED INTEGRITY REVIEWS",
  "social_linkedin": "",
  "responsibility_content": "",
  "portal_heading": "Official App Store & Gaming Directory",
  "disclaimer_heading": "Disclaimer",
  "important_notice_heading": "Important Notice",
  "seo_keywords": "",
  "terms_content": "",
  "last_updated": "2026-08-01T05:56:04.132Z",
  "important_notice": "",
  "ethics_heading": "Ethics & Safety",
  "hero_title_visible": "false",
  "ga_tracking_id": "",
  "secure_index_title": "Secure Index",
  "privacy_content": "",
  "social_instagram": "",
  "social_facebook": "",
  "hero_title_color": "classic-dark",
  "social_youtube": "",
  "hero_title_text": "RUMMY STORE GAMING DIRECTORY",
  "trending_searches": "",
  "hero_title_style": "modern",
  "report_removal_content": "",
  "hero_title_animation": "fade-in",
  "about_content": "",
  "social_twitter": ""
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
    "slug": "rummydex-is-live",
    "title": "RummyDex is LIVE! The Ultimate App Portal is Here",
    "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",
    "description": "RummyDex is officially published! We are bringing you the absolute best in hand-tested mobile entertainment. Read our launch update while our first wave of premium apps undergoes final verification!",
    "description_html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>RummyDex is Officially LIVE!</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>🚀 Welcome to the Future of App Discovery: RummyDex is Officially LIVE!</h1>\n<p class=\"updated\">Published: August 1, 2026</p>\n\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"30\" width=\"90\" height=\"70\" rx=\"8\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M60 100l30-70 30 70\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<circle cx=\"90\" cy=\"20\" r=\"6\" fill=\"#fbbc04\"/>\n<path d=\"M90 8v6M78 14l4 5M102 14l-4 5\" stroke=\"#fbbc04\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>The moment you have been waiting for is finally here! We have officially opened the gates to RummyDex, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>\n<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>\n\n<h2>🛡️ The Power of Complete Neutrality</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the RummyDex platform.</p>\n<p>We operate with zero developer bias. When you read a RummyDex review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>\n\n<h2>⚠️ Important Update: The App Vault is Verifying...</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"60\" y=\"55\" width=\"60\" height=\"45\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M70 55v-12a20 20 0 0140 0v12\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"90\" cy=\"75\" r=\"6\" fill=\"#fbbc04\"/>\n<path d=\"M90 81v10\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>While the RummyDex website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>\n<p>Please wait just a little bit longer—our verified apps are coming very soon.</p>\n<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>\n<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
    "content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>RummyDex is Officially LIVE!</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>🚀 Welcome to the Future of App Discovery: RummyDex is Officially LIVE!</h1>\n<p class=\"updated\">Published: August 1, 2026</p>\n\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"30\" width=\"90\" height=\"70\" rx=\"8\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M60 100l30-70 30 70\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<circle cx=\"90\" cy=\"20\" r=\"6\" fill=\"#fbbc04\"/>\n<path d=\"M90 8v6M78 14l4 5M102 14l-4 5\" stroke=\"#fbbc04\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>The moment you have been waiting for is finally here! We have officially opened the gates to RummyDex, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>\n<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>\n\n<h2>🛡️ The Power of Complete Neutrality</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the RummyDex platform.</p>\n<p>We operate with zero developer bias. When you read a RummyDex review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>\n\n<h2>⚠️ Important Update: The App Vault is Verifying...</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"60\" y=\"55\" width=\"60\" height=\"45\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M70 55v-12a20 20 0 0140 0v12\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"90\" cy=\"75\" r=\"6\" fill=\"#fbbc04\"/>\n<path d=\"M90 81v10\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>While the RummyDex website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>\n<p>Please wait just a little bit longer—our verified apps are coming very soon.</p>\n<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>\n<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
    "image_url": "",
    "created_at": "2026-08-01T04:29:15.305Z",
    "date": "2026-08-01T04:29:15.305Z",
    "published_at": "2026-08-01T04:29:15.305Z",
    "is_breaking": false,
    "is_new": true,
    "category": "Announcements",
    "is_pinned": false,
    "updated_at": "2026-08-01T04:33:51.227Z",
    "ceo_name": "The RummyDex Team",
    "ceo_description": "Editorial Board",
    "seo_title": "RummyDex is LIVE - Premium App Directory & Reviews",
    "seo_description": "Welcome to RummyDex! Explore our newly launched platform dedicated to neutral, hand-tested app reviews. Our verified app vault is opening very soon.",
    "canonical_url": "https://www.rummydex.com/notice/",
    "og_image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",
    "target_region": "Global ",
    "link": "https://www.rummydex.com/rummydex-is-live"
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
