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
  seo_title?: string;
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

import staticDataJson from './staticData.json';

const staticData = staticDataJson as any;

export const mockApps: AppConfig[] = (staticData.mockApps || staticData.apps || []).slice();

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
  "meta_description": "Your trusted bridge to the best mobile card games. Explore RummyDex for hands-on reviews, real-time news, and complete app knowledge.",
  "logo_url": "data:image/png;base64,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",
  "favicon_url": "https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png",
  "helpline_whatsapp": "",
  "helpline_telegram": "",
  "support_email": "rummydex1@gmail.com",
  "disclaimer_text": "",
  "ethics_discrimination_text": "",
  "ticker_text": "",
  "animations_enabled": true,
  "categories": [
    "Yono Apps",
    "Card Apps",
    "Funny games"
  ],
  "banners": [],
  "quick_links": [],
  "website_faqs": [
    {
      "question": "​Q1: What is RummyDex, and how does it help me find the best apps?",
      "answer": "RummyDex is an all-in-one digital discovery portal. We simplify your search for quality mobile apps by providing curated app listings, hands-on performance reviews, lightweight video previews, and daily industry news—all in one structured directory."
    },
    {
      "answer": "Every application featured on our platform undergoes real, hands-on evaluation by our team. We analyze frame rate stability, thermal efficiency, battery consumption, and overall interface responsiveness so you know exactly how an app behaves before you install it.",
      "question": "Q2: How does RummyDex ensure listed apps perform well on my device?"
    },
    {
      "answer": "No. We function as a secure informational bridge. We review software and provide verified, direct routing to official developer sources. This guarantees you always access authentic, unalterable releases straight from the original creators.",
      "question": "Q3: Does RummyDex host software files directly on its servers?"
    },
    {
      "answer": "Not at all. RummyDex is an open-access resource. You can explore our full app index, stream video review highlights, read technical breakdowns, and check daily platform news completely free, with no account registration required.",
      "question": "Q4: Do I need an account or subscription to use RummyDex?"
    },
    {
      "answer": "Our News section keeps you updated on major software patches, developer announcements, and mobile trends. Our Video section offers fast, lightweight gameplay and UI clips so you can visually inspect an app’s performance before visiting the developer source",
      "question": "Q5: What will I find in the News and Video sections?"
    },
    {
      "question": "Q6: How frequently are new reviews and apps added?",
      "answer": "Our catalog is constantly growing. We continuously evaluate new submissions, test software updates, and publish fresh insights to ensure our directory reflects the newest and most reliable mobile applications available."
    }
  ],
  "developers": [
    {
      "role": "CEO",
      "image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785064868/download_47_tltvqo.webp",
      "bio": "Chief Executive Officer (CEO), RummyDex\nAs the visionary architect behind RummyDex, the CEO is dedicated to transforming how users discover and experience mobile entertainment. Driven by a strict commitment to digital transparency and platform integrity, the CEO leads the strategic direction of the directory, ensuring that every featured application meets rigorous standards for performance, safety, and overall quality. By championing a zero-bias, hands-on review process and prioritizing a seamless, secure user experience, the CEO drives RummyDex’s mission to be the internet’s most trusted, authoritative hub for premium offline and online casual games.",
      "name": "Jeet Roj",
      "twitter": "",
      "github": ""
    },
    {
      "image_url": "https://res.cloudinary.com/diewalae4/image/upload/v1785718054/1000132675_11zon_pogxm7.jpg",
      "twitter": "",
      "github": "",
      "name": "Shehzad .L",
      "role": "Chief Technology Officer (CTO)",
      "bio": "As the lead technical architect of RummyDex, the CTO drives the core engineering, database infrastructure, and platform security of the website. Responsible for maintaining a high-performance framework, the CTO ensures lightning-fast search indexing, real-time content delivery for our active News Hub, and robust server stability under heavy traffic. By continuously optimizing back-end operations and system architecture, the CTO guarantees that navigating RummyDex remains an exceptionally fast, smooth, and reliable experience for every user."
    }
  ],
  "hero_title_subtitle": "​Your trusted bridge to the best mobile card games. Explore RummyDex for hands-on reviews, real-time news, and complete app knowledge.",
  "trending_searches": "",
  "social_linkedin": "",
  "social_youtube": "",
  "hero_title_color": "sunset-fire",
  "responsibility_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Platform Responsibility Clause — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Platform Responsibility Clause</h1>\n<p class=\"updated\">Last modified: August 2, 2026</p>\n\n<h2>1. Technical Operations &amp; Secure Routing</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M96 54l9 8-9 8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<circle cx=\"52\" cy=\"62\" r=\"4\" fill=\"#3c4043\"/>\n<circle cx=\"128\" cy=\"62\" r=\"4\" fill=\"#3c4043\"/>\n</svg>\n<p>Our operational responsibility is strictly limited to maintaining the RummyDex directory infrastructure. We ensure that our platform accurately catalogs applications and that all outbound links securely and correctly route users to legitimate, third-party developer sources at the time of publication.</p>\n\n<h2>2. Limits of Content &amp; Software Liability</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 40h44M68 55h44M68 70h30\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"93\" r=\"9\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n<path d=\"M86 93h8M90 89v8\" stroke=\"#ea4335\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex does not host software, APK files, or proprietary code on our servers. Because our control is limited entirely to our own website interface, we are not liable for the performance, data practices, or digital security of external third-party destinations. Downloading or installing software from external sources is conducted solely at the user's own risk.</p>\n\n<h2>3. Post-Listing Developer Modifications</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"40\" y=\"35\" width=\"55\" height=\"60\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M52 50h30M52 62h30M52 74h18\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<path d=\"M108 45l14 14-14 14\" fill=\"none\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<rect x=\"115\" y=\"70\" width=\"30\" height=\"30\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M122 85h16M122 92h10\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>While our team conducts hands-on evaluations prior to listing any application, we do not govern external developers. We are not responsible for unannounced updates, post-launch mechanic changes, or software modifications implemented by third parties after an app has been published on our site.</p>\n\n<h2>4. Policy Enforcement &amp; User Experience</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"65\" cy=\"55\" r=\"14\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M35 100c0-18 13-30 30-30s30 12 30 30\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"112\" y=\"35\" width=\"40\" height=\"52\" rx=\"4\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/>\n<path d=\"M120 50h24M120 61h24M120 72h16\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>For information regarding how RummyDex handles non-compliant developer updates, community oversight, and user-submitted reports, please refer to our dedicated Terms &amp; Conditions and our App Reporting system.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "social_links": {
    "youtube": "https://www.youtube.com/@rummydex",
    "linkedin": "",
    "instagram": "https://www.instagram.com/rummydex?igsh=MTJjaGR3c3hmdjhnZA==",
    "facebook": "https://www.facebook.com/share/1951euBy3d/",
    "twitter": ""
  },
  "important_notice_heading": "Important Notice",
  "social_twitter": "",
  "social_facebook": "",
  "privacy_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Privacy Policy — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:40px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:6px 0}\n.art{display:block;margin:16px 0}\n.note{color:#5f6368;font-size:13px;margin-top:36px;border-top:1px solid #dadce0;padding-top:14px}\na{color:#1a73e8}\n</style>\n</head>\n<body>\n\n<h1>Privacy Policy</h1>\n<p class=\"updated\">Effective Date: August 2 2026</p>\n\n<h2>1. Introduction</h2>\n<svg class=\"art\" width=\"150\" height=\"100\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n</svg>\n<p>Welcome to RummyDex. This Privacy Policy governs the manner in which RummyDex collects, uses, maintains, and discloses information collected from users visiting our digital directory, news portal, and software index. We are dedicated to safeguarding your privacy and ensuring complete transparency regarding how data is handled while you explore our app listings, news updates, and video reviews.</p>\n\n<h2>2. Information Collection</h2>\n<p>RummyDex operates primarily as an open informational resource. We do not require visitors to register an account, subscribe, or submit sensitive personal identification information to access our app directory, read our news, or view video reviews.</p>\n<p><strong>Non-Personal Technical Data:</strong> Whenever you interact with RummyDex, our system may automatically collect non-personally identifiable technical information. This includes your browser type, device specifications, operating system, internet service provider (ISP), referring URLs, IP address, general geographic region, and interaction metrics on our site.</p>\n<p><strong>Direct Communication Data:</strong> If you contact us directly via email for support or feedback, we collect the email address and information you voluntarily provide to address your inquiry.</p>\n\n<h2>3. Web Browser Cookies &amp; Analytics</h2>\n<svg class=\"art\" width=\"150\" height=\"100\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"38\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"75\" cy=\"48\" r=\"5\" fill=\"#fbbc04\"/>\n<circle cx=\"100\" cy=\"55\" r=\"4\" fill=\"#1a73e8\"/>\n<circle cx=\"105\" cy=\"78\" r=\"5\" fill=\"#ea4335\"/>\n</svg>\n<p>Our website utilizes \"cookies\" and similar web technologies to enhance user navigation, measure traffic patterns, and optimize the overall performance of our directory.</p>\n<ul>\n<li>A cookie is a small text file placed on your device's storage for record-keeping and traffic analysis.</li>\n<li>Cookies help us understand which app reviews, news articles, and video features are most useful to our community.</li>\n</ul>\n<p><strong>User Control:</strong> You retain full authority over your browser settings. You may set your web browser to reject cookies or alert you when cookies are being transmitted. Please note that disabling cookies may affect certain non-essential layout features on our site.</p>\n\n<h2>4. News, Media, and Lightweight Video Features</h2>\n<p>To provide comprehensive reviews, RummyDex features lightweight video snippets and daily news updates. Interacting with these features operates under strict data-minimization standards:</p>\n<ul>\n<li>Viewing media content embedded directly on RummyDex does not harvest personal user files or device storage.</li>\n<li>Aggregated, anonymous metrics (such as video view counts or news reading time) may be processed to help us improve content delivery and bandwidth efficiency.</li>\n</ul>\n\n<h2>5. External Links and Third-Party Software</h2>\n<svg class=\"art\" width=\"150\" height=\"100\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#fbbc04\" stroke-width=\"3\"/>\n<circle cx=\"128\" cy=\"62\" r=\"6\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n</svg>\n<p>RummyDex functions strictly as an informational bridge. We do not host, store, or distribute APK files, application packages, or software directly on our primary servers. Instead, we evaluate software and provide safe, verified outgoing links to official developer sites or third-party platforms.</p>\n<p><strong>Leaving Our Portal:</strong> Clicking an external link directs you outside the jurisdiction of RummyDex.</p>\n<p><strong>Third-Party Policies:</strong> We do not own, manage, or control the privacy standards, security protocols, or data collection practices of external websites or applications. Interaction on any external platform is governed entirely by that third party's privacy policy and terms.</p>\n\n<h2>6. Data Security Practices</h2>\n<p>We implement appropriate data collection, storage, and processing practices alongside standard security measures to protect against unauthorized access, modification, or disclosure of technical log data stored on our servers. While we maintain rigorous standards to safeguard our digital portal, no electronic storage or internet transmission can be guaranteed as 100% immune to all vulnerabilities.</p>\n\n<h2>7. Changes to This Privacy Policy</h2>\n<p>RummyDex reserves the right to update, modify, or revise this Privacy Policy at any time. When updates occur, the revised date at the top of this page will be updated accordingly. We encourage users to periodically review this page to stay informed about how we protect visitor data.</p>\n\n<h2>8. Acceptance of These Terms</h2>\n<p>By utilizing RummyDex, you signify your explicit acceptance of this Privacy Policy. If you do not agree with these terms, please discontinue use of our platform. Your continued navigation of the site following posted policy updates constitutes acceptance of those changes.</p>\n\n<h2>9. Contacting Us</h2>\n<p>If you have questions, feedback, or concerns regarding this Privacy Policy or your interactions with our platform, please reach out to our team at:</p>\n<p>Support Email: <a href=\"mailto:rummydex1@gmail.com\">rummydex1@gmail.com</a></p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "seo_keywords": "",
  "ethics_heading": "Ethics & Safety",
  "important_notice": "",
  "hero_title_visible": true,
  "hero_title_animation": "bounce-in",
  "ga_tracking_id": "",
  "secure_index_subtitle": "​Your trusted bridge to the best mobile card games. Explore RummyDex for hands-on reviews, real-time news, and complete app knowledge.",
  "terms_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Terms & Conditions — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\na{color:#1a73e8;text-decoration:none}\na:hover{text-decoration:underline}\n</style>\n</head>\n<body>\n\n<h1>Terms &amp; Conditions</h1>\n<p class=\"updated\">Effective Date: August 2, 2026</p>\n\n<h2>1. Agreement to Terms</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 40h44M68 55h44M68 70h44\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<path d=\"M70 88l10 10 20-20\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>By accessing RummyDex, you agree to be bound by these Terms &amp; Conditions. If you disagree with any part of these terms, please do not use our app directory, news portal, or video features.</p>\n\n<h2>2. Intellectual Property</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40a20 20 0 100 40 20 20 0 100-40\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\"/>\n<path d=\"M90 46v28M78 60h24\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex retains ownership of its original content, design, and editorial features. However, we do not claim ownership of the third-party apps listed on our site. All app names, logos, and trademarks belong to their respective original developers.</p>\n\n<h2>3. Acceptable Use</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"55\" r=\"30\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 33l44 44\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M40 108h100\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>RummyDex is provided for your personal, non-commercial use. You agree not to:</p>\n<ul>\n<li>Use automated bots or scrapers to extract our data or reviews.</li>\n<li>Interfere with the security or performance of our website.</li>\n<li>Submit false or spam requests through our App Reporting system.</li>\n</ul>\n\n<h2>4. Third-Party Links Disclaimer</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#fbbc04\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<circle cx=\"128\" cy=\"62\" r=\"6\" fill=\"none\" stroke=\"#ea4335\" stroke-width=\"2\"/>\n<path d=\"M125 62h6M128 59v6\" stroke=\"#ea4335\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>RummyDex acts solely as an informational bridge and does not host APK or software files on our servers.</p>\n<ul>\n<li>Clicking an external link directs you to a third-party destination that we do not control.</li>\n<li>Downloading and installing third-party software is done entirely at your own risk. RummyDex is not responsible for any device damage or data loss.</li>\n</ul>\n\n<h2>5. App Reporting &amp; Compliance</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M60 40h60l-6 68H66z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M72 30h36l4 10H68z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M78 55v38M90 55v38M102 55v38\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>We enforce a strict zero-tolerance policy against apps containing malicious code or unauthorized real-money mechanics. We investigate user reports and reserve the right to remove or delist any application from our directory at any time without prior notice.</p>\n\n<h2>6. Limitation of Liability</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v26\" stroke=\"#fbbc04\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"78\" r=\"3\" fill=\"#fbbc04\"/>\n</svg>\n<p>RummyDex is provided on an \"as is\" and \"as available\" basis. To the maximum extent permitted by law, RummyDex and its team shall not be liable for any direct or indirect damages, losses, or issues resulting from your use of our platform or the third-party apps we link to.</p>\n\n<h2>7. Modifications</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M65 45a30 30 0 1130 40\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M60 38l5 12 12-4\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<rect x=\"55\" y=\"90\" width=\"70\" height=\"18\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>We reserve the right to update these terms at any time. By continuing to use RummyDex after changes are posted, you agree to be bound by the revised terms.</p>\n\n<h2>8. Contact Information</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"35\" y=\"40\" width=\"110\" height=\"55\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M35 46l55 35 55-35\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>If you have any questions regarding these Terms &amp; Conditions, please contact us at:</p>\n<p>Support Email: <a href=\"mailto:rummydex1@gmail.com\">rummydex1@gmail.com</a></p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "hero_title_text": "RummyDex",
  "disclaimer_heading": "Disclaimer",
  "social_instagram": "",
  "about_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>About Us — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>About Us</h1>\n<p class=\"updated\">Last modified: August 2, 2026</p>\n\n<h2>The Meaning of \"Dex\" (Who We Are)</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"55\" y=\"20\" width=\"70\" height=\"90\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M68 38h44M68 52h44M68 66h44M68 80h30\" stroke=\"#1a73e8\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>Welcome to RummyDex. The word \"Dex\" stands for index or directory, which perfectly describes our core identity. We are an independent digital library built to catalog, review, and provide structured, transparent information about casual games and digital applications. Our platform is designed to be a complete informational hub for entertainment enthusiasts, encompassing everything from app discovery to the latest daily updates.</p>\n\n<h2>How We Provide Information &amp; Links</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"30\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<rect x=\"105\" y=\"45\" width=\"45\" height=\"35\" rx=\"4\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M75 62h30\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M96 54l9 8-9 8\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>We function strictly as an informational bridge. Instead of hosting direct software or APK files on our servers, we provide comprehensive technical breakdowns, clear guides, and safe, direct links to third-party developer sources. This ensures that our platform remains fast and secure, and that you always access applications straight from the source.</p>\n\n<h2>Real Hands-On Testing &amp; Video Highlights</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"30\" width=\"90\" height=\"60\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M80 48l22 12-22 12z\" fill=\"#1a73e8\"/>\n<path d=\"M65 100l10-10M115 100l-10-10\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>We do not just list apps blindly. Before any application is published on our platform, our team conducts a real, hands-on test. We personally experience the app's performance, mechanics, and user interface to ensure it meets our strict entertainment standards. To give you a clear look at the gameplay, we also feature lightweight, optimized video snippets that showcase the app in action without slowing down your browsing experience.</p>\n\n<h2>Comprehensive News &amp; App Updates</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"50\" y=\"25\" width=\"80\" height=\"80\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M64 45h52M64 58h52M64 71h35\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"122\" cy=\"90\" r=\"14\" fill=\"#fbbc04\"/>\n<path d=\"M117 90h10M122 85v10\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n<p>Beyond our core app directory, RummyDex is a highly active, living ecosystem. We keep our community fully informed through our dedicated News Hub. Whether you are looking for general industry news, major platform shifts, or specific app update news detailing the latest patches and features, we provide all the necessary information so you are always up to date on your favorite digital retreats.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "secure_index_title": "RummyDex",
  "report_removal_content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Report & Removal Policy — RummyDex</title>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>\nbody{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}\nh1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}\n.updated{color:#5f6368;font-size:13px;margin-bottom:28px}\nh2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}\np{margin:10px 0}\nul{margin:10px 0;padding-left:22px}\nli{margin:8px 0}\n.art{display:block;margin:18px 0}\n.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}\n</style>\n</head>\n<body>\n\n<h1>Report &amp; Removal Policy</h1>\n<p class=\"updated\">Effective Date: August 2, 2026</p>\n\n<h2>1. Our Commitment to a Safe Directory</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M74 78 86 90 112 58\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>\n<p>RummyDex is dedicated to providing a secure, purely entertainment-focused digital index. Because third-party developers can alter their apps dynamically after our initial review, we rely on active community oversight to help maintain our platform's integrity.</p>\n\n<h2>2. What You Should Report</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v26\" stroke=\"#ea4335\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<circle cx=\"90\" cy=\"78\" r=\"3\" fill=\"#ea4335\"/>\n<path d=\"M40 105h100\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n</svg>\n<p>Please immediately report any listed application that exhibits the following violations:</p>\n<ul>\n<li><strong>Real-Money Gaming (RMG):</strong> The sudden introduction of mandatory deposits, gambling, or real-money betting mechanics.</li>\n<li><strong>Deceptive Updates:</strong> Drastic changes to core gameplay (e.g., an offline puzzle updating into an unverified casino app).</li>\n<li><strong>Broken or Malicious Links:</strong> A resource link that redirects to an unsafe, unverified page instead of the official developer source.</li>\n<li><strong>Intrusive Ads or Malware:</strong> Applications that introduce unskippable system-level ads or malicious behavior that compromises device performance.</li>\n</ul>\n\n<h2>3. How to Submit a Report</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<rect x=\"45\" y=\"20\" width=\"90\" height=\"70\" rx=\"6\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M60 40h60M60 55h60M60 70h35\" stroke=\"#3c4043\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<rect x=\"70\" y=\"95\" width=\"40\" height=\"18\" rx=\"4\" fill=\"#1a73e8\"/>\n</svg>\n<p>Reporting is simple and direct. Use the \"Report App\" button located at the bottom of every individual app review page. Select the reason for your report and provide a brief description of the issue you experienced.</p>\n\n<h2>4. Our Review Process</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"75\" cy=\"45\" r=\"16\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M40 105c0-22 16-38 35-38s35 16 35 38\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<circle cx=\"122\" cy=\"82\" r=\"18\" fill=\"none\" stroke=\"#1a73e8\" stroke-width=\"3\"/>\n<path d=\"M135 95l14 14\" stroke=\"#1a73e8\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>Every submitted report goes directly to our moderation team. We do not use automated bots for this process; a real team member will manually re-test the application and verify the outbound links to confirm the reported violations.</p>\n\n<h2>5. The 100% Permanent Removal Guarantee</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<path d=\"M60 40h60l-6 68H66z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M72 30h36l4 10H68z\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M78 55v38M90 55v38M102 55v38\" stroke=\"#ea4335\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n<p>We operate with a strict zero-tolerance policy for financial risk mechanisms and deceptive software. If we verify that an application violates our safety guidelines:</p>\n<ul>\n<li>The application's dedicated page will be immediately taken down.</li>\n<li>All outbound links to the software will be permanently severed.</li>\n<li>The developer will be strictly prohibited from relisting the application on our directory.</li>\n</ul>\n\n<h2>6. False Reporting</h2>\n<svg class=\"art\" width=\"180\" height=\"130\" viewBox=\"0 0 180 130\">\n<circle cx=\"90\" cy=\"60\" r=\"42\" fill=\"none\" stroke=\"#3c4043\" stroke-width=\"2\"/>\n<path d=\"M90 40v22\" stroke=\"#fbbc04\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<path d=\"M90 62l14 8\" stroke=\"#fbbc04\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n</svg>\n<p>We highly value genuine community feedback. However, deliberately spamming the system or submitting false claims to maliciously target specific games may result in a restriction of your ability to submit future reports or interact with platform features.</p>\n\n<p class=\"note\">RummyDex — keeping the directory safe, together.</p>\n\n</body>\n</html>\n",
  "last_updated": "2026-08-13T12:32:30.948Z",
  "hero_title_style": "serif",
  "portal_heading": "Official App Store & Gaming Directory"
} as any;

export const saveMockSettings = (settings: GlobalSettings) => {
  try {
    localStorage.setItem('rummystore_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('saveMockSettings storage failed:', e);
  }
  Object.assign(mockSettings, settings);
};

export const mockNews: NewsItem[] = (staticData.mockNews || staticData.news || []).slice();

export const saveMockNews = (newsList: NewsItem[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockVideos: VideoItem[] = (staticData.mockVideos || staticData.videos || []).slice();

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
