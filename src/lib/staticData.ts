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

export const mockApps: AppConfig[] = [] as any[];

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
  "disclaimer_text": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Disclaimer — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Disclaimer</h1>\n<p class=\"updated\">Last modified: August 1, 2026</p>\n\n<h2>Informational Purpose Only</h2>\n<p>RummyDex operates strictly as an independent information directory and app indexing portal. All game reviews, metrics, and technical specifications provided on this platform are for general informational and educational purposes only.</p>\n\n<h2>Independent Entity &amp; Third-Party Disclaimer</h2>\n<p>RummyDex is not affiliated, associated, authorized, endorsed by, or in any way officially connected with any game developer, software publisher, or trademark owner listed on this site. All trademarks, service marks, registered marks, and product names belong to their respective owners.</p>\n\n<h2>No Software Hosting</h2>\n<p>We do not host or store software binary files (APKs/IPAs) directly on our servers. All references, links, and redirected URLs lead to official, public third-party sources. Users are encouraged to review the privacy policies and terms of service of third-party portals before accessing their software.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>",
  "ethics_discrimination_text": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Ethics &amp; Safety — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Ethics &amp; Safety Guidelines</h1>\n<p class=\"updated\">Last modified: August 1, 2026</p>\n\n<h2>Our Ethical Commitments</h2>\n<p>At RummyDex, operational integrity and community trust are our core pillars. We enforce strict ethical standards across our platform to maintain an unbiased, safe, and transparent environment for all users.</p>\n\n<h2>Unbiased &amp; Non-Discriminatory Reviews</h2>\n<p>Our application evaluations and user safety ratings are conducted without developer bias or commercial influence. We do not accept payment to artificially elevate app ratings, alter review scores, or conceal safety warnings.</p>\n\n<h2>Anti-Discrimination &amp; Community Standards</h2>\n<p>RummyDex maintains zero tolerance for discrimination based on race, ethnicity, nationality, religion, gender, age, or disability. All community feedback, user reviews, and editorial content must strictly comply with our civil engagement parameters.</p>\n\n<h2>Proactive Content Safeguards</h2>\n<p>Every listed application undergoes hands-on security verification to check for malicious code, invasive permissions, or deceptive behavior prior to index publication.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>",
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
  "responsibility_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Responsible Gaming — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Responsible Gaming &amp; User Protection</h1>\n<p class=\"updated\">Last modified: August 1, 2026</p>\n\n<h2>Promoting Healthy Casual Entertainment</h2>\n<p>RummyDex advocates for responsible engagement with casual digital applications. Interactive games are intended strictly for leisure, mental stimulation, and social recreation.</p>\n\n<h2>Age Restrictions &amp; Compliance</h2>\n<p>Users must comply with age verification parameters required by their jurisdiction and specific game publishers. We strongly advise parental controls for minor protection across digital devices.</p>\n\n<h2>Balance &amp; Self-Regulation</h2>\n<p>We encourage all users to set healthy time limits on casual gaming sessions and prioritize personal wellness, work, and family commitments.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>",
  "portal_heading": "Official App Store & Gaming Directory",
  "disclaimer_heading": "Disclaimer",
  "important_notice_heading": "Important Notice",
  "seo_keywords": "",
  "terms_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Terms of Service — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Terms of Service</h1>\n<p class=\"updated\">Last modified: August 1, 2026</p>\n\n<h2>Acceptance of Terms</h2>\n<p>By accessing or using RummyDex, you agree to abide by these Terms of Service and all applicable local rules and regulations. If you do not agree with any part of these terms, you should discontinue use of the site.</p>\n\n<h2>Permitted Use</h2>\n<p>RummyDex grants you a non-exclusive, non-transferable license to access and view content for personal, non-commercial entertainment and informational research. Automated scraping or malicious disruption of site services is strictly prohibited.</p>\n\n<h2>Intellectual Property</h2>\n<p>All site branding, design systems, editorial review content, and index classifications are the property of RummyDex. Third-party app icons, logos, and developer names remain the intellectual property of their respective creators.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>",
  "last_updated": "2026-08-01T05:56:04.132Z",
  "important_notice": "<p>Please verify all application details and security ratings before downloading third-party software. RummyDex provides direct source links for verified mobile entertainment.</p>",
  "ethics_heading": "Ethics & Safety",
  "hero_title_visible": "false",
  "ga_tracking_id": "",
  "secure_index_title": "Secure Index",
  "privacy_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Privacy Policy — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Privacy Policy</h1>\n<p class=\"updated\">Last modified: August 1, 2026</p>\n\n<h2>Information We Collect</h2>\n<p>RummyDex is designed with privacy-first principles. We do not require account registration, personal phone numbers, or credit card details to browse our directory or access application reviews.</p>\n\n<h2>Automated Technical Logs</h2>\n<p>When you access our platform, standard non-identifying technical metadata (such as browser type, device operating system, language preferences, and anonymized IP addresses) may be temporarily processed to ensure optimal server performance and security filtering.</p>\n\n<h2>Cookies &amp; Local Preferences</h2>\n<p>We utilize essential local storage and lightweight cookies strictly for user interface preferences (such as dark mode settings and bookmark lists). We do not deploy invasive cross-site tracking cookies.</p>\n\n<h2>Data Protection &amp; Contact</h2>\n<p>If you have any questions regarding your privacy rights or data practices, please reach out through our official support channels.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>",
  "social_instagram": "",
  "social_facebook": "",
  "hero_title_color": "classic-dark",
  "social_youtube": "",
  "hero_title_text": "RUMMY STORE GAMING DIRECTORY",
  "trending_searches": "",
  "hero_title_style": "modern",
  "report_removal_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Report & Removal Policy — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Report &amp; Removal Policy</h1>\n<p class=\"updated\">Last modified: August 1, 2026</p>\n\n<h2>Notice &amp; Takedown Procedure</h2>\n<p>RummyDex respects copyright holders and developer rights. If you are a verified copyright owner or authorized representative and believe an application listed in our directory infringes upon your rights or requires removal, we provide a streamlined review process.</p>\n\n<h2>How to Submit a Removal Request</h2>\n<p>Please send a formal notice to our support team containing:</p>\n<p>1. Identification of the copyrighted work or trademark claimed to be infringed.</p>\n<p>2. Direct URL of the app listing on RummyDex.</p>\n<p>3. Official developer contact email and proof of authorization.</p>\n\n<h2>Resolution Timelines</h2>\n<p>Valid takedown requests are investigated and acted upon within 24–48 business hours.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>",
  "hero_title_animation": "fade-in",
  "about_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>About Us — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>About Us</h1>\n<p class=\"updated\">Last modified: August 1, 2026</p>\n\n<h2>The Meaning of \"Dex\" (Who We Are)</h2>\n\n<p>Welcome to RummyDex. The word \"Dex\" stands for index or directory, which perfectly describes our core identity. We are an independent digital library built to catalog, review, and provide structured, transparent information about casual games and digital applications. Our platform is designed to be a complete informational hub for entertainment enthusiasts, encompassing everything from app discovery to the latest daily updates.</p>\n\n<h2>How We Provide Information &amp; Links</h2>\n\n<p>We function strictly as an informational bridge. Instead of hosting direct software or APK files on our servers, we provide comprehensive technical breakdowns, clear guides, and safe, direct links to third-party developer sources. This ensures that our platform remains fast and secure, and that you always access applications straight from the source.</p>\n\n<h2>Real Hands-On Testing &amp; Video Highlights</h2>\n\n<p>We do not just list apps blindly. Before any application is published on our platform, our team conducts a real, hands-on test. We personally experience the app's performance, mechanics, and user interface to ensure it meets our strict entertainment standards. To give you a clear look at the gameplay, we also feature lightweight, optimized video snippets that showcase the app in action without slowing down your browsing experience.</p>\n\n<h2>Comprehensive News &amp; App Updates</h2>\n\n<p>Beyond our core app directory, RummyDex is a highly active, living ecosystem. We keep our community fully informed through our dedicated News Hub. Whether you are looking for general industry news, major platform shifts, or specific app update news detailing the latest patches and features, we provide all the necessary information so you are always up to date on your favorite digital retreats.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>",
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
