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
    "faqs": [],
    "encrypted_link": "",
    "description_html": "",
    "id": "2verxalsv",
    "red_box_msg": "",
    "slug": "spin-crush",
    "video_url": "",
    "name": "Spin crush ",
    "canonical_url": "",
    "developer": "Admin",
    "updated_at": "2026-07-31T12:02:16.275Z",
    "file_size": "Unknown",
    "icon_url": "",
    "safety_status": "Verified",
    "og_image_url": "",
    "seo_description": "Nsnsndndn",
    "features_html": "",
    "rating": 5,
    "version": "1.0",
    "seo_keywords": "",
    "idea_box_msg": "",
    "yellow_box_msg": "",
    "serial_number": 1,
    "publish_date": "",
    "is_new": false,
    "created_at": "2026-07-31T12:02:16.275Z",
    "is_coming_soon": false,
    "release_notes": "",
    "category": "General",
    "seo_title": "Ehhehjsjsjs",
    "screenshots": []
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
  "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",
  "favicon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",
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
    "Card",
    "Fun games"
  ],
  "banners": [],
  "quick_links": [],
  "website_faqs": [],
  "developers": [],
  "last_updated": "2026-07-31T03:07:07.494Z",
  "social_facebook": "",
  "secure_index_subtitle": ".",
  "about_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>About Us — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>About Us</h1>\n<p class=\"updated\">Last modified: July 27, 2026</p>\n\n<h2>The Meaning of \"Dex\" (Who We Are)</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 38h44M68 52h44M68 66h44M68 80h30\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>Welcome to RummyDex. The word \"Dex\" stands for index or directory, which perfectly describes our core identity. We are an independent digital library built to catalog, review, and provide structured, transparent information about casual games and digital applications. Our platform is designed to be a complete informational hub for entertainment enthusiasts, encompassing everything from app discovery to the latest daily updates.</p>\n\n<h2>How We Provide Information &amp; Links</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M96 54l9 8-9 8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>We function strictly as an informational bridge. Instead of hosting direct software or APK files on our servers, we provide comprehensive technical breakdowns, clear guides, and safe, direct links to third-party developer sources. This ensures that our platform remains fast and secure, and that you always access applications straight from the source.</p>\n\n<h2>Real Hands-On Testing &amp; Video Highlights</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"30\" width=\"90\" height=\"60\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M80 48l22 12-22 12z\" fill=\"#1a73e8\"/>\n<path d=\"M65 100l10-10M115 100l-10-10\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>We do not just list apps blindly. Before any application is published on our platform, our team conducts a real, hands-on test. We personally experience the app's performance, mechanics, and user interface to ensure it meets our strict entertainment standards. To give you a clear look at the gameplay, we also feature lightweight, optimized video snippets that showcase the app in action without slowing down your browsing experience.</p>\n\n<h2>Comprehensive News &amp; App Updates</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"50\" y=\"25\" width=\"80\" height=\"80\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M64 45h52M64 58h52M64 71h35\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"122\" cy=\"90\" r=\"14\" fill=\"#fbbc04\"/>\n<path d=\"M117 90h10M122 85v10\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>Beyond our core app directory, RummyDex is a highly active, living ecosystem. We keep our community fully informed through our dedicated News Hub. Whether you are looking for general industry news, major platform shifts, or specific app update news detailing the latest patches and features, we provide all the necessary information so you are always up to date on your favorite digital retreats.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "hero_title_style": "modern",
  "report_removal_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Report & Removal Policy — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Report &amp; Removal Policy</h1>\n<p class=\"updated\">Effective Date: July 2026</p>\n\n<h2>1. Our Commitment to a Safe Directory</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>RummyDex is dedicated to providing a secure, purely entertainment-focused digital index. Because third-party developers can alter their apps dynamically after our initial review, we rely on active community oversight to help maintain our platform's integrity.</p>\n\n<h2>2. What You Should Report</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v26\" stroke=\"#ea4335\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"78\" r=\"3\" fill=\"#ea4335\"/>\n<path d=\"M40 105h100\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>Please immediately report any listed application that exhibits the following violations:</p>\n<ul>\n<li><strong>Real-Money Gaming (RMG):</strong> The sudden introduction of mandatory deposits, gambling, or real-money betting mechanics.</li>\n<li><strong>Deceptive Updates:</strong> Drastic changes to core gameplay (e.g., an offline puzzle updating into an unverified casino app).</li>\n<li><strong>Broken or Malicious Links:</strong> A resource link that redirects to an unsafe, unverified page instead of the official developer source.</li>\n<li><strong>Intrusive Ads or Malware:</strong> Applications that introduce unskippable system-level ads or malicious behavior that compromises device performance.</li>\n</ul>\n\n<h2>3. How to Submit a Report</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"20\" width=\"90\" height=\"70\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M60 40h60M60 55h60M60 70h35\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<rect x=\"70\" y=\"95\" width=\"40\" height=\"18\" rx=\"4\" fill=\"#1a73e8\"/>\n</svg>\n<p>Reporting is simple and direct. Use the \"Report App\" button located at the bottom of every individual app review page. Select the reason for your report and provide a brief description of the issue you experienced.</p>\n\n<h2>4. Our Review Process</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"75\" cy=\"45\" r=\"16\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M40 105c0-22 16-38 35-38s35 16 35 38\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"122\" cy=\"82\" r=\"18\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n<path d=\"M135 95l14 14\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>Every submitted report goes directly to our moderation team. We do not use automated bots for this process; a real team member will manually re-test the application and verify the outbound links to confirm the reported violations.</p>\n\n<h2>5. The 100% Permanent Removal Guarantee</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M60 40h60l-6 68H66z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M72 30h36l4 10H68z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M78 55v38M90 55v38M102 55v38\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>We operate with a strict zero-tolerance policy for financial risk mechanisms and deceptive software. If we verify that an application violates our safety guidelines:</p>\n<ul>\n<li>The application's dedicated page will be immediately taken down.</li>\n<li>All outbound links to the software will be permanently severed.</li>\n<li>The developer will be strictly prohibited from relisting the application on our directory.</li>\n</ul>\n\n<h2>6. False Reporting</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v22\" stroke=\"#fbbc04\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<path d=\"M90 62l14 8\" stroke=\"#fbbc04\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n</svg>\n<p>We highly value genuine community feedback. However, deliberately spamming the system or submitting false claims to maliciously target specific games may result in a restriction of your ability to submit future reports or interact with platform features.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "important_notice_heading": "",
  "responsibility_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Platform Responsibility Clause — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Platform Responsibility Clause</h1>\n<p class=\"updated\">Last modified: July 27, 2026</p>\n\n<h2>1. Technical Operations &amp; Secure Routing</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M96 54l9 8-9 8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<circle cx=\"52\" cy=\"62\" r=\"4\" fill=\"#3c4043\"/>\n<circle cx=\"128\" cy=\"62\" r=\"4\" fill=\"#3c4043\"/>\n</svg>\n<p>Our operational responsibility is strictly limited to maintaining the RummyDex directory infrastructure. We ensure that our platform accurately catalogs applications and that all outbound links securely and correctly route users to legitimate, third-party developer sources at the time of publication.</p>\n\n<h2>2. Limits of Content &amp; Software Liability</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 40h44M68 55h44M68 70h30\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"93\" r=\"9\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n<path d=\"M86 93h8M90 89v8\" stroke=\"#ea4335\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex does not host software, APK files, or proprietary code on our servers. Because our control is limited entirely to our own website interface, we are not liable for the performance, data practices, or digital security of external third-party destinations. Downloading or installing software from external sources is conducted solely at the user's own risk.</p>\n\n<h2>3. Post-Listing Developer Modifications</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"40\" y=\"35\" width=\"55\" height=\"60\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M52 50h30M52 62h30M52 74h18\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<path d=\"M108 45l14 14-14 14\" fill=\"none\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<rect x=\"115\" y=\"70\" width=\"30\" height=\"30\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M122 85h16M122 92h10\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>While our team conducts hands-on evaluations prior to listing any application, we do not govern external developers. We are not responsible for unannounced updates, post-launch mechanic changes, or software modifications implemented by third parties after an app has been published on our site.</p>\n\n<h2>4. Policy Enforcement &amp; User Experience</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"65\" cy=\"55\" r=\"14\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M35 100c0-18 13-30 30-30s30 12 30 30\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"112\" y=\"35\" width=\"40\" height=\"52\" rx=\"4\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/>\n<path d=\"M120 50h24M120 61h24M120 72h16\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>For information regarding how RummyDex handles non-compliant developer updates, community oversight, and user-submitted reports, please refer to our dedicated Terms &amp; Conditions and our App Reporting system.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "hero_title_animation": "fade-in",
  "portal_heading": "",
  "social_youtube": "",
  "seo_keywords": "",
  "hero_title_subtitle": "COMPREHENSIVE SOCIAL CASUAL E-SPORTS METRICS & UNBIASED INTEGRITY REVIEWS",
  "hero_title_visible": "true",
  "privacy_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Privacy Policy — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\na{color:#1a73e8;text-decoration:none}\na:hover{text-decoration:underline}\n</style>\n</head>\n<body>\n\n<h1>Privacy Policy</h1>\n<p class=\"updated\">Effective Date: July 2026</p>\n\n<h2>1. Introduction</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>Welcome to RummyDex. This Privacy Policy governs the manner in which RummyDex collects, uses, maintains, and discloses information collected from users visiting our digital directory, news portal, and software index. We are dedicated to safeguarding your privacy and ensuring complete transparency regarding how data is handled while you explore our app listings, news updates, and video reviews.</p>\n\n<h2>2. Information Collection</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 40h44M68 55h44M68 70h30\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"93\" r=\"9\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/>\n<path d=\"M86 93h8M90 89v8\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex operates primarily as an open informational resource. We do not require visitors to register an account, subscribe, or submit sensitive personal identification information to access our app directory, read our news, or view video reviews.</p>\n<p><strong>Non-Personal Technical Data:</strong> Whenever you interact with RummyDex, our system may automatically collect non-personally identifiable technical information. This includes your browser type, device specifications, operating system, internet service provider (ISP), referring URLs, IP address, general geographic region, and interaction metrics on our site.</p>\n<p><strong>Direct Communication Data:</strong> If you contact us directly via email for support or feedback, we collect the email address and information you voluntarily provide to address your inquiry.</p>\n\n<h2>3. Web Browser Cookies &amp; Analytics</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"38\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"75\" cy=\"48\" r=\"5\" fill=\"#fbbc04\"/>\n<circle cx=\"100\" cy=\"55\" r=\"4\" fill=\"#1a73e8\"/>\n<circle cx=\"80\" cy=\"72\" r=\"4\" fill=\"#3c4043\"/>\n<circle cx=\"105\" cy=\"78\" r=\"5\" fill=\"#ea4335\"/>\n</svg>\n<p>Our website utilizes \"cookies\" and similar web technologies to enhance user navigation, measure traffic patterns, and optimize the overall performance of our directory.</p>\n<ul>\n<li>A cookie is a small text file placed on your device's storage for record-keeping and traffic analysis.</li>\n<li>Cookies help us understand which app reviews, news articles, and video features are most useful to our community.</li>\n</ul>\n<p><strong>User Control:</strong> You retain full authority over your browser settings. You may set your web browser to reject cookies or alert you when cookies are being transmitted. Please note that disabling cookies may affect certain non-essential layout features on our site.</p>\n\n<h2>4. News, Media, and Lightweight Video Features</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"30\" width=\"90\" height=\"60\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M80 48l22 12-22 12z\" fill=\"#1a73e8\"/>\n<path d=\"M65 100l10-10M115 100l-10-10\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>To provide comprehensive reviews, RummyDex features lightweight video snippets and daily news updates. Interacting with these features operates under strict data-minimization standards:</p>\n<ul>\n<li>Viewing media content embedded directly on RummyDex does not harvest personal user files or device storage.</li>\n<li>Aggregated, anonymous metrics (such as video view counts or news reading time) may be processed to help us improve content delivery and bandwidth efficiency.</li>\n</ul>\n\n<h2>5. External Links and Third-Party Software</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<circle cx=\"128\" cy=\"62\" r=\"6\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n<path d=\"M125 62h6M128 59v6\" stroke=\"#ea4335\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex functions strictly as an informational bridge. We do not host, store, or distribute APK files, application packages, or software directly on our primary servers. Instead, we evaluate software and provide safe, verified outgoing links to official developer sites or third-party platforms.</p>\n<p><strong>Leaving Our Portal:</strong> Clicking an external link directs you outside the jurisdiction of RummyDex.</p>\n<p><strong>Third-Party Policies:</strong> We do not own, manage, or control the privacy standards, security protocols, or data collection practices of external websites or applications. Interaction on any external platform is governed entirely by that third party's privacy policy and terms.</p>\n\n<h2>6. Data Security Practices</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"60\" y=\"55\" width=\"60\" height=\"45\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M70 55v-12a20 20 0 0140 0v12\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"90\" cy=\"75\" r=\"6\" fill=\"#1a73e8\"/>\n<path d=\"M90 81v10\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>We implement appropriate data collection, storage, and processing practices alongside standard security measures to protect against unauthorized access, modification, or disclosure of technical log data stored on our servers. While we maintain rigorous standards to safeguard our digital portal, no electronic storage or internet transmission can be guaranteed as 100% immune to all vulnerabilities.</p>\n\n<h2>7. Changes to This Privacy Policy</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M65 45a30 30 0 1130 40\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M60 38l5 12 12-4\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<rect x=\"55\" y=\"90\" width=\"70\" height=\"18\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>RummyDex reserves the right to update, modify, or revise this Privacy Policy at any time. When updates occur, the revised date at the top of this page will be updated accordingly. We encourage users to periodically review this page to stay informed about how we protect visitor data.</p>\n\n<h2>8. Acceptance of These Terms</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M70 88l10 10 20-20\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>By utilizing RummyDex, you signify your explicit acceptance of this Privacy Policy. If you do not agree with these terms, please discontinue use of our platform. Your continued navigation of the site following posted policy updates constitutes acceptance of those changes.</p>\n\n<h2>9. Contacting Us</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"35\" y=\"40\" width=\"110\" height=\"55\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M35 46l55 35 55-35\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>If you have questions, feedback, or concerns regarding this Privacy Policy or your interactions with our platform, please reach out to our team at:</p>\n<p>Support Email: <a href=\"mailto:rummydex1@gmail.com\">rummydex1@gmail.com</a></p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "secure_index_title": ".",
  "terms_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Terms & Conditions — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\na{color:#1a73e8;text-decoration:none}\na:hover{text-decoration:underline}\n</style>\n</head>\n<body>\n\n<h1>Terms &amp; Conditions</h1>\n<p class=\"updated\">Effective Date: July 2026</p>\n\n<h2>1. Agreement to Terms</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 40h44M68 55h44M68 70h44\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<path d=\"M70 88l10 10 20-20\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>By accessing RummyDex, you agree to be bound by these Terms &amp; Conditions. If you disagree with any part of these terms, please do not use our app directory, news portal, or video features.</p>\n\n<h2>2. Intellectual Property</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40a20 20 0 100 40 20 20 0 100-40\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/>\n<path d=\"M90 46v28M78 60h24\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex retains ownership of its original content, design, and editorial features. However, we do not claim ownership of the third-party apps listed on our site. All app names, logos, and trademarks belong to their respective original developers.</p>\n\n<h2>3. Acceptable Use</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"55\" r=\"30\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 33l44 44\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M40 108h100\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>RummyDex is provided for your personal, non-commercial use. You agree not to:</p>\n<ul>\n<li>Use automated bots or scrapers to extract our data or reviews.</li>\n<li>Interfere with the security or performance of our website.</li>\n<li>Submit false or spam requests through our App Reporting system.</li>\n</ul>\n\n<h2>4. Third-Party Links Disclaimer</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<circle cx=\"128\" cy=\"62\" r=\"6\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n<path d=\"M125 62h6M128 59v6\" stroke=\"#ea4335\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex acts solely as an informational bridge and does not host APK or software files on our servers.</p>\n<ul>\n<li>Clicking an external link directs you to a third-party destination that we do not control.</li>\n<li>Downloading and installing third-party software is done entirely at your own risk. RummyDex is not responsible for any device damage or data loss.</li>\n</ul>\n\n<h2>5. App Reporting &amp; Compliance</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M60 40h60l-6 68H66z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M72 30h36l4 10H68z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M78 55v38M90 55v38M102 55v38\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>We enforce a strict zero-tolerance policy against apps containing malicious code or unauthorized real-money mechanics. We investigate user reports and reserve the right to remove or delist any application from our directory at any time without prior notice.</p>\n\n<h2>6. Limitation of Liability</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v26\" stroke=\"#fbbc04\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"78\" r=\"3\" fill=\"#fbbc04\"/>\n</svg>\n<p>RummyDex is provided on an \"as is\" and \"as available\" basis. To the maximum extent permitted by law, RummyDex and its team shall not be liable for any direct or indirect damages, losses, or issues resulting from your use of our platform or the third-party apps we link to.</p>\n\n<h2>7. Modifications</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M65 45a30 30 0 1130 40\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M60 38l5 12 12-4\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<rect x=\"55\" y=\"90\" width=\"70\" height=\"18\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>We reserve the right to update these terms at any time. By continuing to use RummyDex after changes are posted, you agree to be bound by the revised terms.</p>\n\n<h2>8. Contact Information</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"35\" y=\"40\" width=\"110\" height=\"55\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M35 46l55 35 55-35\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>If you have any questions regarding these Terms &amp; Conditions, please contact us at:</p>\n<p>Support Email: <a href=\"mailto:rummydex1@gmail.com\">rummydex1@gmail.com</a></p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "important_notice": "",
  "hero_title_text": "RUMMY STORE GAMING DIRECTORY",
  "social_twitter": "",
  "disclaimer_heading": "",
  "social_linkedin": "",
  "social_instagram": "",
  "social_links": {
    "linkedin": "",
    "youtube": "",
    "instagram": "",
    "twitter": "",
    "facebook": ""
  },
  "ethics_heading": "",
  "hero_title_color": "classic-dark",
  "trending_searches": "",
  "ga_tracking_id": ""
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
    "canonical_url": "https://www.rummydex.com/news/rummydex-is-live",
    "ceo_name": "The RummyDex Team",
    "link": "https://www.rummydex.com/",
    "updated_at": "2026-07-30T17:13:46.892Z",
    "seo_title": "RummyDex is LIVE - Premium App Directory & Reviews",
    "ceo_description": "Editorial Board",
    "seo_description": "Welcome to RummyDex! Explore our newly launched platform dedicated to neutral, hand-tested app reviews. Our verified app vault is opening very soon.",
    "seo_keywords": "rummydex launch, premium app directory, hand-tested app reviews, neutral app reviews, verified casual games",
    "created_at": "2026-07-30T15:41:58.172Z",
    "category": "Announcements",
    "content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>RummyDex is LIVE 🚀</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\n*{box-sizing:border-box}\nbody{margin:0;font-family:Arial,Helvetica,sans-serif;color:#fff;background:linear-gradient(-45deg,#0f0c29,#302b63,#24243e,#1a1a2e);background-size:400% 400%;animation:bg 12s ease infinite;overflow-x:hidden}\n@keyframes bg{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}\n.wrap{max-width:700px;margin:0 auto;padding:50px 22px 60px}\nh1{font-size:32px;line-height:1.25;margin:0 0 6px;text-shadow:0 0 18px #ff2e9a,0 0 40px #7b2ff7}\n.tag{color:#ffd76b;font-weight:bold;letter-spacing:2px;font-size:12px;text-transform:uppercase;margin-bottom:24px;animation:pulse 1.6s ease-in-out infinite}\n@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}\nh2{font-size:21px;margin-top:46px;background:linear-gradient(90deg,#ff2e9a,#ffd76b);-webkit-background-clip:text;background-clip:text;color:transparent;display:inline-block}\np{font-size:15.5px;line-height:1.75;margin:10px 0;color:#e6e6f0}\n.icon{display:block;margin:22px auto;filter:drop-shadow(0 0 10px rgba(255,255,255,.35))}\n.spin{animation:spin 6s linear infinite;transform-origin:90px 65px}\n@keyframes spin{to{transform:rotate(360deg)}}\n.bounce{animation:bounce 1.8s ease-in-out infinite}\n@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}\n.badge{display:inline-block;margin-top:24px;padding:10px 20px;border-radius:30px;background:linear-gradient(90deg,#ff2e9a,#7b2ff7);font-weight:bold;font-size:13px;letter-spacing:1px;box-shadow:0 0 20px rgba(255,46,154,.6);animation:glow 2s ease-in-out infinite}\n@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,46,154,.6)}50%{box-shadow:0 0 34px rgba(123,47,247,.9)}}\n.note{color:#9d9db0;font-size:12.5px;margin-top:50px;border-top:1px solid rgba(255,255,255,.15);padding-top:16px}\n</style>\n</head>\n<body>\n<div class=\"wrap\">\n\n<p class=\"tag\">⚡ Launch Broadcast ⚡</p>\n<h1>🚀 Welcome to the Future of App Discovery: RummyDex is Officially LIVE!</h1>\n\n<p>The moment you have been waiting for is finally here! We have officially opened the gates to RummyDex, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>\n<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>\n\n<svg class=\"icon bounce\" width=\"120\" height=\"120\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"30\" width=\"90\" height=\"70\" rx=\"8\" fill=\"none\" stroke=\"#ffd76b\" stroke-width=\"3\"/>\n<path d=\"M60 100l30-70 30 70\" fill=\"none\" stroke=\"#ff2e9a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<circle cx=\"90\" cy=\"18\" r=\"7\" fill=\"#ffd76b\"/>\n</svg>\n\n<h2>🛡️ The Power of Complete Neutrality</h2>\n<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the RummyDex platform.</p>\n<p>We operate with zero developer bias. When you read a RummyDex review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>\n\n<svg class=\"icon spin\" width=\"120\" height=\"120\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#7b2ff7\" stroke-width=\"3\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#ffd76b\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n\n<h2>⚠️ Important Update: The App Vault is Verifying...</h2>\n<p>While the RummyDex website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>\n<p>Please wait just a little bit longer—our verified apps are coming very soon.</p>\n<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>\n<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>\n\n<span class=\"badge\">🔥 VAULT UNLOCKING SOON 🔥</span>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</div>\n</body>\n</html>\n",
    "description": "News description...RummyDex is officially published! We are bringing you the absolute best in hand-tested mobile entertainment. Read our launch update while our first wave of premium apps undergoes final verification!",
    "is_pinned": false,
    "title": "RummyDex is LIVE! The Ultimate App Portal is Here",
    "image_url": "",
    "id": "4s56x1qfl",
    "is_breaking": false,
    "slug": "rummydex-is-live",
    "logo_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",
    "target_region": "Global",
    "is_new": true,
    "description_html": "<p>Content...</p>"
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
