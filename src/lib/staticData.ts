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
    "video_url": "",
    "custom_admin_box_html": "",
    "link_configured": true,
    "icon_url": "https://res.cloudinary.com/dq34n0ncz/image/upload/f_auto,q_auto/1000119573_wzwse4",
    "seo_keywords": "",
    "canonical_url": "",
    "slug": "spin-crush-",
    "red_box_msg": "",
    "name": "SPIN CRUSH ",
    "og_image_url": "",
    "yellow_box_msg": "",
    "rating": 5,
    "id": "q82dbbwh4",
    "is_featured": false,
    "is_top_chart": true,
    "created_at": "2026-05-19T12:43:59.040Z",
    "release_notes": "Version 2.0.6 // System Update Log\nInterface Optimization: Refined the visual rendering pipeline for smoother navigation across mobile screen-time sessions.\nAlgorithmic Adjustments: Optimized data-parsing logic for faster loading of strategy modules and performance teardowns.\nStability Patch: Resolved minor UI caching discrepancies to ensure a seamless \"lag-free\" browsing experience.\nFeature Expansion: Integrated a new \"Performance Metric Dashboard\" for detailed game-logic breakdowns.",
    "seo_description": "",
    "seo_title": "",
    "category": "Yono, All App",
    "file_size": "45",
    "screenshots": [],
    "idea_box_msg": "",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "features_html": "",
    "developer": "Bingo ",
    "is_new": true,
    "target_region": "",
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "serial_number": 2,
    "version": "2.0.6",
    "faqs": []
  },
  {
    "id": "31og4l26i",
    "rating": 3.4,
    "is_featured": false,
    "name": "YONO ARCADE",
    "yellow_box_msg": "",
    "og_image_url": "",
    "release_notes": "",
    "seo_description": "",
    "created_at": "2026-05-19T19:04:26.373Z",
    "icon_url": "https://13eehe59cj.ucarecd.net/67a16d31-6771-4617-b88b-288db51d321d/-/preview/554x554/",
    "seo_keywords": "",
    "link_configured": false,
    "canonical_url": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "red_box_msg": "",
    "slug": "yono-arcade",
    "version": "1.20.1",
    "serial_number": 3,
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "faqs": [],
    "file_size": "56",
    "screenshots": [],
    "idea_box_msg": "",
    "seo_title": "",
    "category": "Yono, All App",
    "is_new": false,
    "target_region": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "features_html": "",
    "developer": "Arcade "
  },
  {
    "is_new": true,
    "target_region": "",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "features_html": "",
    "developer": "Jaiho",
    "file_size": "56",
    "screenshots": [],
    "idea_box_msg": "",
    "seo_title": "",
    "category": "Yono, All App",
    "faqs": [],
    "serial_number": 3,
    "version": "1.20.1",
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "red_box_msg": "",
    "slug": "jaiho-91",
    "link_configured": true,
    "seo_keywords": "",
    "icon_url": "https://res.cloudinary.com/dyigysy26/image/upload/f_auto,q_auto/1000119609_fkc9fm",
    "canonical_url": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "release_notes": "",
    "seo_description": "",
    "created_at": "2026-05-19T19:23:07.133Z",
    "rating": 4.8,
    "id": "s5u553ymi",
    "is_featured": false,
    "name": "JAIHO 91",
    "og_image_url": "",
    "yellow_box_msg": ""
  },
  {
    "file_size": "71",
    "idea_box_msg": "",
    "screenshots": [],
    "seo_title": "",
    "category": "Yono, All App",
    "is_new": false,
    "target_region": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "features_html": "",
    "developer": "Bingo",
    "version": "2.5V",
    "serial_number": 5,
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "faqs": [],
    "icon_url": "https://13eehe59cj.ucarecd.net/d3f6486a-b216-4582-b15d-0c735ff6b08f/-/preview/554x554/",
    "seo_keywords": "",
    "link_configured": true,
    "canonical_url": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "red_box_msg": "",
    "slug": "bingo-101",
    "id": "awus3qajs",
    "rating": 3.6,
    "is_featured": false,
    "name": "BINGO 101",
    "yellow_box_msg": "",
    "og_image_url": "",
    "release_notes": "",
    "seo_description": "",
    "created_at": "2026-05-20T03:09:33.880Z"
  },
  {
    "created_at": "2026-05-20T03:50:33.674Z",
    "release_notes": "",
    "seo_description": "",
    "name": "OK RUMMY",
    "yellow_box_msg": "",
    "og_image_url": "",
    "id": "0uiuuhdrj",
    "rating": 3,
    "is_featured": false,
    "slug": "ok-rummy",
    "red_box_msg": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/97512d34-f561-4ede-8517-2112440079eb/-/preview/554x554/",
    "link_configured": true,
    "canonical_url": "",
    "faqs": [],
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "version": "8.3.06.",
    "serial_number": 6,
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "developer": "Bingo ",
    "features_html": "",
    "is_new": false,
    "target_region": "",
    "seo_title": "",
    "category": "Yono, All App",
    "file_size": "67",
    "screenshots": [],
    "idea_box_msg": ""
  },
  {
    "name": "JAIHO SLOTS",
    "yellow_box_msg": "",
    "og_image_url": "",
    "id": "4yt0f4yd0",
    "rating": 4.9,
    "is_featured": false,
    "created_at": "2026-05-20T03:53:24.482Z",
    "seo_description": "",
    "release_notes": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/2dfe5d55-7896-4f96-8f2b-132190e44f6f/-/preview/540x540/",
    "link_configured": true,
    "canonical_url": "",
    "slug": "jaiho-slots",
    "red_box_msg": "",
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "version": "4.3",
    "serial_number": 7,
    "faqs": [],
    "seo_title": "",
    "category": "Yono, All App",
    "file_size": "70",
    "screenshots": [],
    "idea_box_msg": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "features_html": "",
    "developer": "Jaiho",
    "is_new": false,
    "target_region": ""
  },
  {
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "serial_number": 8,
    "version": "2.5V",
    "faqs": [],
    "category": "Yono, All App",
    "seo_title": "",
    "screenshots": [],
    "idea_box_msg": "",
    "file_size": "54",
    "features_html": "",
    "developer": "Arcade ",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "target_region": "",
    "is_new": false,
    "og_image_url": "",
    "yellow_box_msg": "",
    "name": "BOSS RUMMY",
    "is_featured": false,
    "rating": 4.1,
    "id": "9r044fyi0",
    "created_at": "2026-05-20T03:56:42.075Z",
    "seo_description": "",
    "release_notes": "",
    "custom_admin_box_html": "",
    "video_url": "",
    "canonical_url": "",
    "link_configured": true,
    "icon_url": "https://13eehe59cj.ucarecd.net/b5e9d896-71e8-49d6-b091-a971871161e0/-/preview/1000x1000/",
    "seo_keywords": "",
    "slug": "boss-rummy",
    "red_box_msg": ""
  },
  {
    "slug": "rummy-91",
    "red_box_msg": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "link_configured": true,
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/393c07ea-4f5e-43a9-ab0c-e12dfe7d755a/-/preview/474x474/",
    "canonical_url": "",
    "created_at": "2026-05-20T04:01:04.611Z",
    "release_notes": "",
    "seo_description": "",
    "name": "RUMMY 91",
    "og_image_url": "",
    "yellow_box_msg": "",
    "rating": 4.9,
    "id": "5b7fj0cq7",
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "developer": "Addi",
    "features_html": "",
    "is_new": false,
    "target_region": "",
    "seo_title": "",
    "category": "All App",
    "file_size": "79",
    "screenshots": [],
    "idea_box_msg": "",
    "faqs": [],
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "serial_number": 9,
    "version": "2.0.6"
  },
  {
    "name": "GOGO RUMMY ",
    "yellow_box_msg": "",
    "og_image_url": "",
    "id": "ieam3hkbq",
    "rating": 3.9,
    "is_featured": false,
    "created_at": "2026-05-20T06:58:27.643Z",
    "seo_description": "",
    "release_notes": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/0d710f11-2c9d-4312-89de-be65ce21a4fe/-/preview/750x750/",
    "seo_keywords": "",
    "link_configured": true,
    "canonical_url": "",
    "slug": "gogo-rummy-",
    "red_box_msg": "",
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "version": "5.0",
    "serial_number": 10,
    "faqs": [],
    "seo_title": "",
    "category": "Yono, All App",
    "file_size": "65",
    "screenshots": [],
    "idea_box_msg": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "features_html": "",
    "developer": "Sk varba",
    "is_new": false,
    "target_region": ""
  },
  {
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "version": "1.8",
    "serial_number": 11,
    "faqs": [],
    "category": "Yono, All App",
    "seo_title": "",
    "idea_box_msg": "",
    "screenshots": [],
    "file_size": "75",
    "features_html": "",
    "developer": "S.A vejay",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "target_region": "",
    "is_new": false,
    "yellow_box_msg": "",
    "og_image_url": "",
    "name": "CLUB INR",
    "is_featured": false,
    "id": "5j5b7qbrw",
    "rating": 4.6,
    "created_at": "2026-05-20T08:02:40.971Z",
    "seo_description": "",
    "release_notes": "",
    "custom_admin_box_html": "",
    "video_url": "",
    "canonical_url": "",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/3059d25d-1497-4cff-aead-68758187fe0b/-/preview/554x554/",
    "link_configured": true,
    "slug": "club-inr",
    "red_box_msg": ""
  },
  {
    "serial_number": 12,
    "version": "1.8",
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "faqs": [],
    "file_size": "61",
    "idea_box_msg": "",
    "screenshots": [],
    "seo_title": "",
    "category": "Yono, All App",
    "is_new": false,
    "target_region": "",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "features_html": "",
    "developer": "Addi",
    "rating": 3.9,
    "id": "f4ktp4dfi",
    "is_featured": false,
    "name": "ABC Rummy ",
    "og_image_url": "",
    "yellow_box_msg": "",
    "seo_description": "",
    "release_notes": "",
    "created_at": "2026-05-26T07:04:36.330Z",
    "link_configured": true,
    "icon_url": "https://13eehe59cj.ucarecd.net/f7108631-b74a-49e5-8abf-37cec6950f7c/-/preview/512x512/",
    "seo_keywords": "",
    "canonical_url": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "red_box_msg": "",
    "slug": "abc-rummy-"
  },
  {
    "created_at": "2026-05-26T07:09:01.068Z",
    "release_notes": "",
    "seo_description": "",
    "yellow_box_msg": "",
    "og_image_url": "",
    "name": "777.Rummy",
    "is_featured": false,
    "id": "4w1yxs6mm",
    "rating": 5,
    "slug": "777-rummy",
    "red_box_msg": "",
    "custom_admin_box_html": "",
    "video_url": "",
    "canonical_url": "",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/fb951184-b849-4ff0-8882-a4d826508fb7/-/preview/190x190/",
    "link_configured": true,
    "faqs": [],
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "version": "1.6",
    "serial_number": 13,
    "features_html": "",
    "developer": "AB Arora",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "target_region": "",
    "is_new": false,
    "category": "Yono, All App",
    "seo_title": "",
    "screenshots": [],
    "idea_box_msg": "",
    "file_size": "54"
  },
  {
    "name": "EVER 777",
    "yellow_box_msg": "",
    "og_image_url": "",
    "id": "w1sttlwv7",
    "rating": 4,
    "is_featured": false,
    "created_at": "2026-05-26T07:12:55.821Z",
    "release_notes": "",
    "seo_description": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/74347710-3cb2-468c-98eb-5666a0af487c/-/preview/190x190/",
    "link_configured": true,
    "canonical_url": "",
    "slug": "ever-777",
    "red_box_msg": "",
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "version": "1.8",
    "serial_number": 14,
    "faqs": [],
    "seo_title": "",
    "category": "Yono, All App",
    "file_size": "59",
    "idea_box_msg": "",
    "screenshots": [],
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "developer": "AZ ever",
    "features_html": "",
    "is_new": false,
    "target_region": ""
  },
  {
    "id": "dp2lcn2ae",
    "rating": 4,
    "is_featured": false,
    "name": "Game Rummy",
    "yellow_box_msg": "",
    "og_image_url": "",
    "seo_description": "",
    "release_notes": "",
    "created_at": "2026-05-26T07:16:08.600Z",
    "icon_url": "https://13eehe59cj.ucarecd.net/4b2bd57d-9855-40a8-b452-34edee84ed09/-/preview/190x190/",
    "seo_keywords": "",
    "link_configured": true,
    "canonical_url": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "red_box_msg": "",
    "slug": "game-rummy",
    "version": "2.0",
    "serial_number": 15,
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "faqs": [],
    "file_size": "75",
    "screenshots": [],
    "idea_box_msg": "",
    "seo_title": "",
    "category": "Yono, All App",
    "is_new": false,
    "target_region": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "features_html": "",
    "developer": "Raj dav"
  },
  {
    "id": "4lgypb90h",
    "rating": 4.1,
    "is_featured": false,
    "name": "Hi Rummy ",
    "yellow_box_msg": "",
    "og_image_url": "",
    "release_notes": "",
    "seo_description": "",
    "created_at": "2026-05-26T07:18:29.456Z",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/c01e9676-e748-4342-9ac7-e972030981fc/-/preview/190x190/",
    "link_configured": true,
    "canonical_url": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "red_box_msg": "",
    "slug": "hi-rummy-",
    "version": "1.9",
    "serial_number": 16,
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "faqs": [],
    "file_size": "54",
    "idea_box_msg": "",
    "screenshots": [],
    "seo_title": "",
    "category": "Yono, All App",
    "is_new": false,
    "target_region": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "developer": "Addi",
    "features_html": ""
  },
  {
    "version": "3.0",
    "serial_number": 17,
    "custom_admin_box_heading": "[ ✦ RENDER-THREAD ISOLATION // FRAME-BUFFER AUDIT ]",
    "is_coming_soon": false,
    "faqs": [
      {
        "answer": "Answer: We conduct a Variable Generation Audit to monitor how efficiently the localized application calculates its randomized data arrays. By evaluating asynchronous matrix permutation, we establish a technical baseline for how smoothly the engine computes unpredictable logic sequences off the main thread without causing the visual interface to stutter.",
        "question": "How does the registry evaluate Asynchronous Matrix Permutation in 567 Slots?"
      },
      {
        "question": "What is \"Cryptographic State Fencing\" within this software architecture?",
        "answer": "Answer: Cryptographic State Fencing refers to the engine's ability to lock its current mathematical outcome in a secure, isolated section of your device's memory. Our diagnostic teardown measures the strictness of this boundary. An optimized state fence ensures that background applications or OS interruptions cannot corrupt the matrix data before it visually renders on your screen."
      },
      {
        "question": "How does asynchronous processing impact hardware thermals?",
        "answer": "Answer: Offloading complex matrix math from the main UI thread requires sustained multi-core CPU allocation. While highly efficient for preventing screen freezing, aggressive asynchronous processing generates localized thermal load. Our Hardware Snapshot indicates that the 567 Slots engine intelligently scales back background visual particle effects when device temperatures rise, preserving core matrix generation over aesthetic graphics."
      },
      {
        "answer": "Answer: Yes, the application utilizes Dynamic Logic Downscaling to maintain system stability on older hardware architectures. While the core matrix permutation remains mathematically strict, the execution environment automatically increases the algorithmic polling interval on legacy mobile processors. This ensures that localized input processing remains uncompromised without overheating the chip.",
        "question": "Can entry-level mobile processors handle the 567 Slots permutation logic?"
      },
      {
        "answer": "Answer: No. RummyApp Online operates strictly as an independent evaluator of Client-Side Software Processing and Ergonomics. We benchmark how the specific software binary utilizes your local hardware resources to calculate its matrices and fence its logic states. We do not evaluate, monitor, or access secure server-side cryptographic logic, ensuring our metrics remain exclusively focused on localized structural software integrity.",
        "question": "Does the 567 Slots diagnostic monitor external server environments?"
      }
    ],
    "idea_box_msg": "Do not force tactical inputs faster than the localized software can poll your hardware. Observe the frame-buffer response time of the interface. Aligning your physical interactions precisely with the engine's internal input-polling rhythm guarantees optimal tactile accuracy and reduces localized input rejection.",
    "screenshots": [],
    "file_size": "79",
    "category": "Yono, All App",
    "seo_title": "INR Rummy System Architecture: Render-Thread Isolation (2026)",
    "target_region": "India (Tier 1 & Tier 2 Search Optimization)",
    "is_new": false,
    "features_html": "",
    "developer": "Arcade ",
    "safety_status": "Verified",
    "description_html": "<!-- SAFE INR RUMMY GLASSMORPHISM LISTING -->\n<!-- Fully scoped, uniquely written, safe for your website UI, E-Sports Compliant -->\n\n<section class=\"rs-inrr-wrapper\">\n\n    <div class=\"rs-inrr-glass-card\">\n\n        <!-- HEADER -->\n        <div class=\"rs-inrr-header\">\n            <h2>INR Rummy Interface</h2>\n            <span class=\"rs-inrr-badge\">National Strategy Arena</span>\n        </div>\n\n        <!-- GLASSY VIRTUAL BONUS SYSTEM -->\n        <div class=\"rs-inrr-bonus-container\">\n            <div class=\"rs-inrr-glass-box highlight-box\">\n                <span class=\"rs-inrr-bonus-title\">Virtual Welcome</span>\n                <span class=\"rs-inrr-bonus-amount\">91K</span>\n                <span class=\"rs-inrr-bonus-sub\">Practice Chips</span>\n            </div>\n            <div class=\"rs-inrr-glass-box\">\n                <span class=\"rs-inrr-bonus-title\">Daily Milestone</span>\n                <span class=\"rs-inrr-bonus-amount\">20K</span>\n                <span class=\"rs-inrr-bonus-sub\">Steady Login Reward</span>\n            </div>\n            <div class=\"rs-inrr-glass-box\">\n                <span class=\"rs-inrr-bonus-title\">Guest Access</span>\n                <span class=\"rs-inrr-bonus-amount\">Instant</span>\n                <span class=\"rs-inrr-bonus-sub\">No Login Needed</span>\n            </div>\n        </div>\n\n        <p class=\"rs-inrr-description\">\n            INR Rummy provides a premium, highly streamlined card platform designed for strategic enthusiasts. Built with a focus on tactical precision and seamless board aesthetics, this digital hub allows you to master classic card formats cleanly. Whether you are practicing layout sorting or refining valid sequences, INR Rummy offers a risk-free, competitive arena to play instantly.\n        </p>\n\n        <!-- SEO ENHANCEMENT: APP DETAILS TABLE -->\n        <div class=\"rs-inrr-section-title\">Platform Specifications</div>\n        <div class=\"rs-inrr-table-wrapper\">\n            <table class=\"rs-inrr-table\">\n                <tbody>\n                    <tr>\n                        <td><strong>Application Name</strong></td>\n                        <td>INR Rummy (Review)</td>\n                        <td><strong>Gaming Category</strong></td>\n                        <td>Card / Strategy Game</td>\n                    </tr>\n                    <tr>\n                        <td><strong>Welcome Reward</strong></td>\n                        <td>91,000 (Virtual Only)</td>\n                        <td><strong>Ongoing Rewards</strong></td>\n                        <td>Tasks & Progression</td>\n                    </tr>\n                    <tr>\n                        <td><strong>Network Play</strong></td>\n                        <td>Guest Multiplayer</td>\n                        <td><strong>Game Lobbies</strong></td>\n                        <td>Casual Practice Tables</td>\n                    </tr>\n                    <tr>\n                        <td><strong>Privacy</strong></td>\n                        <td>No Personal Info Required</td>\n                        <td><strong>Customer Help</strong></td>\n                        <td>24/7 In-App Guide</td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n\n        <!-- SEO ENHANCEMENT: FEATURES GRID -->\n        <div class=\"rs-inrr-section-title\">Professional Gaming Features</div>\n        <div class=\"rs-inrr-grid\">\n            <div class=\"rs-inrr-glass-box rounded-style\">\n                <div class=\"rs-inrr-icon\">♦️</div>\n                <h3>Standard Lobbies</h3>\n                <p>Join clear, intuitive virtual rooms where enthusiasts match skills on dedicated practice tables to hone their execution timings.</p>\n            </div>\n            <div class=\"rs-inrr-glass-box rounded-style\">\n                <div class=\"rs-inrr-icon\">🔒</div>\n                <h3>100% Anonymous</h3>\n                <p>Enjoy the card action immediately as a guest player without sharing phone numbers, filling configurations, or utilizing OTP systems.</p>\n            </div>\n            <div class=\"rs-inrr-glass-box rounded-style\">\n                <div class=\"rs-inrr-icon\">🛡️</div>\n                <h3>Standard RNG</h3>\n                <p>Fairness remains fundamental. The card distribution relies on a verified Random Number Generator algorithm to keep dealing purely mathematical.</p>\n            </div>\n            <div class=\"rs-inrr-glass-box rounded-style\">\n                <div class=\"rs-inrr-icon\">📱</div>\n                <h3>Modern Interface</h3>\n                <p>Experience zero visual clutter. Ad-free layouts with crisp responsive sorting features ensure your card melding remains entirely uninterrupted.</p>\n            </div>\n        </div>\n\n        <!-- SEO ENHANCEMENT: HOW TO PLAY -->\n        <div class=\"rs-inrr-section-title\">Steps to Start Your Virtual Practice</div>\n        <div class=\"rs-inrr-glass-box rs-inrr-list-box\">\n            <ol>\n                <li><strong>Launch the App:</strong> Open the official application natively on your smart device.</li>\n                <li><strong>Play Instantly:</strong> Enter the dashboard right away via guest mode without any registration paths.</li>\n                <li><strong>Collect Rewards:</strong> Check your localized points wallet to find your 91K welcome balance ready.</li>\n                <li><strong>Join the Table:</strong> Select your preferred variation tier and test your strategic card arrangements.</li>\n                <li><strong>Track Milestones:</strong> Record your logical victories and evaluate strategy progression on local leaderboards.</li>\n            </ol>\n        </div>\n\n        <!-- SEO ENHANCEMENT: FAQ ACCORDION -->\n        <div class=\"rs-inrr-section-title\">Frequently Asked Questions (FAQs)</div>\n        <div class=\"rs-inrr-faq-container\">\n            <details class=\"rs-inrr-faq\">\n                <summary>Is INR Rummy stable for continuous practice?</summary>\n                <p>Yes. The build is fully optimized to provide lag-free sorting transitions, keeping your training runs steady across basic mobile networks.</p>\n            </details>\n            <details class=\"rs-inrr-faq\">\n                <summary>What makes a Pure Sequence?</summary>\n                <p>A pure sequence consists of three or more consecutive cards belonging to the same identical suit, organized strictly without using a Joker.</p>\n            </details>\n            <details class=\"rs-inrr-faq\">\n                <summary>Do I need to provide my phone number?</summary>\n                <p>No, registration is completely optional. You can experience every practice variant in full guest mode without completing any OTP check.</p>\n            </details>\n        </div>\n\n        <!-- SAFE SEO KEYWORD CLOUD -->\n        <div class=\"rs-inrr-section-title\">Related Search Tags</div>\n        <div class=\"rs-inrr-keywords\">\n            <span>inr rummy</span> <span>inr rummy app</span> <span>inr rummy game</span> <span>inr rummy online</span> <span>inr rummy play</span> <span>inr rummy review</span> <span>inr rummy features</span> <span>inr rummy casual</span> <span>inr rummy interface</span> <span>inr rummy practice</span> <span>inr rummy guest mode</span> <span>inr rummy bonuses</span> <span>inr rummy rewards</span> <span>inr rummy daily check-in</span> <span>inr rummy virtual chips</span> <span>inr rummy welcome bonus</span> <span>inr rummy card game</span> <span>inr rummy strategy</span> <span>inr rummy UI</span> <span>inr rummy leaderboard</span> <span>inr rummy support</span> <span>inr rummy offline</span> <span>inr rummy local play</span> <span>inr rummy mechanics</span> <span>inr rummy gameplay</span> <span>inr rummy variants</span> <span>inr rummy points</span> <span>inr rummy deals</span> <span>inr rummy pool</span> <span>inr rummy RNG</span> <span>inr rummy updates</span> <span>inr rummy latest version</span> <span>inr rummy guide</span> <span>inr rummy tips</span> <span>inr rummy tricks</span> <span>how to play inr rummy</span> <span>win in inr rummy</span> <span>inr rummy safe</span> <span>inr rummy anonymous</span> <span>inr rummy no login</span> <span>inr rummy graphics</span> <span>inr rummy animation</span> <span>inr rummy mobile app</span> <span>inr rummy android</span> <span>inr rummy virtual portal</span> <span>inr rummy skill game</span>\n        </div>\n\n    </div>\n</section>\n\n<style>\n/* SAFE SCOPED CSS - INR RUMMY THEME (DEEP JADE/EMERALD GLASS) */\n\n.rs-inrr-wrapper {\n    width: 100%;\n    margin: 40px 0;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n    background: linear-gradient(145deg, #0a2f1d 0%, #114227 100%);\n    padding: 25px;\n    border-radius: 30px;\n    box-sizing: border-box;\n}\n\n.rs-inrr-wrapper * {\n    box-sizing: border-box;\n}\n\n/* THE GLASS CARD */\n.rs-inrr-glass-card {\n    background: rgba(255, 255, 255, 0.04);\n    backdrop-filter: blur(22px);\n    -webkit-backdrop-filter: blur(22px);\n    border-radius: 24px;\n    padding: 40px;\n    border: 1px solid rgba(46, 204, 113, 0.2);\n    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6);\n}\n\n.rs-inrr-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 15px;\n    flex-wrap: wrap;\n    margin-bottom: 30px;\n    padding-bottom: 20px;\n    border-bottom: 1px solid rgba(46, 204, 113, 0.3);\n}\n\n.rs-inrr-header h2 {\n    font-size: 38px;\n    font-weight: 900;\n    margin: 0;\n    background: linear-gradient(135deg, #2ecc71, #a3e635);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n    letter-spacing: -1px;\n}\n\n.rs-inrr-badge {\n    padding: 8px 22px;\n    border-radius: 4px;\n    background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(163, 230, 53, 0.05));\n    color: #2ecc71;\n    font-size: 13px;\n    font-weight: 800;\n    border: 1px solid rgba(46, 204, 113, 0.4);\n    text-transform: uppercase;\n    letter-spacing: 1px;\n}\n\n/* GLASSY BOXES */\n.rs-inrr-bonus-container, .rs-inrr-grid {\n    display: grid;\n    gap: 20px;\n    margin-bottom: 35px;\n}\n\n.rs-inrr-bonus-container {\n    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n}\n\n.rs-inrr-grid {\n    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n}\n\n.rs-inrr-glass-box {\n    background: rgba(255, 255, 255, 0.02);\n    border: 1px solid rgba(46, 204, 113, 0.15);\n    border-radius: 16px; \n    padding: 25px;\n    text-align: left;\n    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);\n    transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;\n}\n\n.rs-inrr-glass-box:hover {\n    transform: translateY(-5px);\n    box-shadow: 0 12px 30px rgba(46, 204, 113, 0.2);\n    border-color: rgba(46, 204, 113, 0.6);\n    background: rgba(255, 255, 255, 0.05);\n}\n\n.rs-inrr-bonus-container .rs-inrr-glass-box {\n    text-align: center;\n}\n\n.highlight-box {\n    background: linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(0, 0, 0, 0));\n    border: 1px solid rgba(46, 204, 113, 0.5);\n}\n\n.rs-inrr-bonus-title {\n    display: block;\n    font-size: 13px;\n    font-weight: 800;\n    color: #e0e0e0;\n    text-transform: uppercase;\n    margin-bottom: 12px;\n    letter-spacing: 1.5px;\n}\n\n.rs-inrr-bonus-amount {\n    display: block;\n    font-size: 44px;\n    font-weight: 900;\n    background: linear-gradient(135deg, #2ecc71, #ccff33);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n    margin-bottom: 8px;\n    line-height: 1;\n}\n\n.rs-inrr-bonus-sub {\n    display: block;\n    font-size: 13px;\n    color: #a0a0a0;\n    font-weight: 500;\n}\n\n.rs-inrr-section-title {\n    font-size: 24px;\n    font-weight: 800;\n    color: #ffffff;\n    margin: 45px 0 25px 0;\n    position: relative;\n    padding-left: 18px;\n}\n\n.rs-inrr-section-title::before {\n    content: '';\n    position: absolute;\n    left: 0;\n    top: 50%;\n    transform: translateY(-50%);\n    height: 80%;\n    width: 4px;\n    background: linear-gradient(to bottom, #2ecc71, #114227);\n    border-radius: 10px;\n}\n\n.rs-inrr-description {\n    line-height: 1.9;\n    font-size: 16px;\n    color: #e0e0e0;\n    margin-bottom: 30px;\n    padding: 25px;\n    background: rgba(0, 0, 0, 0.35);\n    border-radius: 16px;\n    border-left: 4px solid #2ecc71;\n    box-shadow: inset 0 0 20px rgba(0,0,0,0.5);\n}\n\n/* APP SPECS TABLE */\n.rs-inrr-table-wrapper {\n    overflow-x: auto;\n    margin-bottom: 30px;\n    border-radius: 16px;\n    border: 1px solid rgba(46, 204, 113, 0.2);\n    background: rgba(0, 0, 0, 0.4);\n}\n\n.rs-inrr-table {\n    width: 100%;\n    border-collapse: collapse;\n    font-size: 15px;\n}\n\n.rs-inrr-table td {\n    padding: 18px;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n    color: #c0c0c0;\n}\n\n.rs-inrr-table tr:last-child td {\n    border-bottom: none;\n}\n\n.rs-inrr-table td strong {\n    color: #2ecc71;\n}\n\n/* FEATURES GRID ICONS */\n.rs-inrr-icon {\n    font-size: 28px;\n    margin-bottom: 18px;\n    background: linear-gradient(135deg, #1f1f1f, #000000);\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 55px;\n    height: 55px;\n    border-radius: 12px; \n    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);\n    border: 1px solid rgba(46, 204, 113, 0.3);\n}\n\n.rs-inrr-glass-box h3 {\n    margin: 0 0 12px 0;\n    font-size: 19px;\n    color: #ccff33;\n    font-weight: 800;\n}\n\n.rs-inrr-glass-box p {\n    margin: 0;\n    font-size: 15px;\n    line-height: 1.7;\n    color: #b0b0b0;\n}\n\n/* HOW TO LIST */\n.rs-inrr-list-box ol {\n    margin: 0;\n    padding-left: 20px;\n    color: #e0e0e0;\n}\n\n.rs-inrr-list-box li {\n    margin-bottom: 15px;\n    line-height: 1.7;\n    font-size: 15px;\n}\n\n.rs-inrr-list-box li:last-child {\n    margin-bottom: 0;\n}\n\n.rs-inrr-list-box strong {\n    color: #2ecc71;\n}\n\n/* FAQ ACCORDION */\n.rs-inrr-faq-container {\n    display: flex;\n    flex-direction: column;\n    gap: 15px;\n    margin-bottom: 30px;\n}\n\n.rs-inrr-faq {\n    background: rgba(0, 0, 0, 0.4);\n    border: 1px solid rgba(46, 204, 113, 0.2);\n    border-radius: 16px;\n    padding: 18px 22px;\n    transition: all 0.3s ease;\n}\n\n.rs-inrr-faq[open] {\n    background: rgba(46, 204, 113, 0.05);\n    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);\n    border-color: rgba(46, 204, 113, 0.6);\n}\n\n.rs-inrr-faq summary {\n    font-weight: 800;\n    font-size: 16px;\n    color: #2ecc71;\n    cursor: pointer;\n    list-style: none;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n.rs-inrr-faq summary::-webkit-details-marker {\n    display: none;\n}\n\n.rs-inrr-faq summary::after {\n    content: '+';\n    font-size: 22px;\n    color: #ffffff;\n    transition: transform 0.3s;\n}\n\n.rs-inrr-faq[open] summary::after {\n    content: '−';\n    transform: rotate(180deg);\n}\n\n.rs-inrr-faq p {\n    margin: 15px 0 0 0;\n    color: #b0b0b0;\n    line-height: 1.7;\n    font-size: 15px;\n    border-top: 1px solid rgba(255, 255, 255, 0.1);\n    padding-top: 15px;\n}\n\n/* KEYWORD FRAMES WITH CUSTOM SCROLLBAR */\n.rs-inrr-keywords {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 12px;\n    max-height: 320px;\n    overflow-y: auto;\n    padding-right: 15px;\n}\n\n.rs-inrr-keywords::-webkit-scrollbar {\n    width: 6px;\n}\n.rs-inrr-keywords::-webkit-scrollbar-track {\n    background: rgba(255, 255, 255, 0.05);\n    border-radius: 10px;\n}\n.rs-inrr-keywords::-webkit-scrollbar-thumb {\n    background: rgba(46, 204, 113, 0.3);\n    border-radius: 10px;\n}\n\n.rs-inrr-keywords span {\n    padding: 9px 18px;\n    border-radius: 8px; \n    background: rgba(0, 0, 0, 0.5); \n    border: 1px solid rgba(46, 204, 113, 0.3); \n    color: #e0e0e0; \n    font-size: 13px;\n    font-weight: 600;\n    transition: all 0.2s ease;\n    cursor: default;\n    box-shadow: 0 2px 5px rgba(0,0,0,0.01);\n}\n\n.rs-inrr-keywords span:hover {\n    background: linear-gradient(135deg, #2ecc71, #a3e635);\n    color: #000000;\n    border-color: #ccff33;\n    transform: translateY(-2px);\n    box-shadow: 0 5px 12px rgba(46, 204, 113, 0.3);\n}\n\n/* MOBILE RESPONSIVENESS */\n@media(max-width: 768px) {\n    .rs-inrr-wrapper {\n        padding: 15px;\n    }\n    .rs-inrr-glass-card {\n        padding: 25px;\n    }\n    .rs-inrr-header h2 {\n        font-size: 30px;\n    }\n    .rs-inrr-table td {\n        display: block;\n        width: 100%;\n        text-align: left;\n        padding: 12px 18px;\n    }\n    .rs-inrr-table td:nth-child(odd) {\n        background: rgba(255, 255, 255, 0.02);\n        border-bottom: none;\n    }\n}\n</style>\n",
    "is_featured": false,
    "id": "2f90a87hv",
    "rating": 5,
    "yellow_box_msg": "To achieve the seamless input-polling frequencies detailed in this diagnostic, ensure your device's digitizer and active RAM are not bottlenecked by background applications. Render-thread isolation requires sustained, unfragmented memory allocation to dynamically update UI states without dropping touch registrations.",
    "og_image_url": "https://13eehe59cj.ucarecd.net/2a718650-0602-495f-9ca4-b13c86e58c02/-/preview/190x190/",
    "name": "INR Rummy",
    "seo_description": "Explore the INR Rummy system architecture. RummyApp Online provides an independent audit of render-thread isolation, input-polling, and frame-buffer pacing.",
    "release_notes": "Addressed localized desynchronization within the visual pacing engine. The client-side architecture now effectively utilizes render-thread isolation, ensuring that background cryptographic handshakes no longer induce micro-stutters during rapid drag-and-drop tactical inputs.",
    "created_at": "2026-05-26T07:21:55.085Z",
    "canonical_url": "https://www.rummyapp.online/inr-rummy",
    "icon_url": "https://13eehe59cj.ucarecd.net/2a718650-0602-495f-9ca4-b13c86e58c02/-/preview/190x190/",
    "seo_keywords": "INR Rummy render-thread isolation, input-polling frequency, frame-buffer pacing audit, INR Rummy system diagnostic",
    "link_configured": true,
    "custom_admin_box_html": "<!-- SAFE RUMMYAPP ONLINE \"ADVANCED TECHNICAL DIAGNOSTIC\" MODULE -->\n<!-- Bright Futuristic Modern Edition -->\n\n<section class=\"rs-tech-wrapper\">\n\n    <!-- TOP SYSTEM NOTIFICATION -->\n    <div class=\"rs-tech-alert-top\">\n        <span class=\"rs-tech-pulse\"></span> ✦ ADVANCED DIAGNOSTICS // ENGINE & LOGIC TEARDOWN\n    </div>\n\n    <!-- MAIN DEEP-DIVE INTRO CARD -->\n    <div class=\"rs-tech-glass-card rs-tech-hero\">\n        <div class=\"rs-tech-header\">\n            <h2>Technical Architecture Review</h2>\n            <span class=\"rs-tech-badge\">System Teardown</span>\n        </div>\n        \n        <p class=\"rs-tech-lead-text\">\n            Evaluating a virtual application requires probing beneath its graphical shell. In this advanced diagnostic, we bypass the marketing aesthetics to analyze the application's core rendering engine, memory allocation, and backend logic systems. By measuring frame stability, cryptographic randomization, and input latency, we provide a mathematically sound breakdown of how this application truly performs under heavy operational stress. \n        </p>\n    </div>\n\n    <!-- TECHNICAL DATA GRID -->\n    <div class=\"rs-tech-section-title\">Core Engine Metrics</div>\n    \n    <div class=\"rs-tech-grid\">\n        \n        <!-- Metric 1: RNG Logic -->\n        <div class=\"rs-tech-glass-box tech-border-slate\">\n            <div class=\"rs-tech-icon tech-glow-slate\">⚙️</div>\n            <h3>Cryptographic RNG Protocols</h3>\n            <p>True tactical simulations rely on pristine randomization. We analyze the application's Random Number Generator (RNG) logic for cryptographic seeding and sequence entropy. A robust, server-side RNG architecture ensures that card drops, virtual shuffles, and arcade mechanics are entirely immune to pattern manipulation, providing a mathematically fair environment for all practice rounds.</p>\n        </div>\n\n        <!-- Metric 2: Input Latency -->\n        <div class=\"rs-tech-glass-box tech-border-cyan\">\n            <div class=\"rs-tech-icon tech-glow-cyan\">⚡</div>\n            <h3>Input Latency & Event Listeners</h3>\n            <p>A seamless interface is dictated by response time. We measure the application's touch-start and touch-end event listeners to ensure input latency remains strictly under the 45-millisecond threshold. By minimizing payload packet delays between the client UI and the simulation server, the application translates physical screen taps into instantaneous digital reactions.</p>\n        </div>\n\n        <!-- Metric 3: Rendering Pipeline -->\n        <div class=\"rs-tech-glass-box tech-border-emerald\">\n            <div class=\"rs-tech-icon tech-glow-emerald\">🎥</div>\n            <h3>WebGL & Frame Rendering</h3>\n            <p>High-fidelity 3D environments must not compromise frame rates. We evaluate the application's draw call batching and texture compression within its WebGL/Canvas rendering pipeline. Proper optimization prevents Z-fighting and ensures a stable 60 FPS (Frames Per Second) output, preventing micro-stutters during intense, high-speed layout animations.</p>\n        </div>\n\n        <!-- Metric 4: Heap Memory -->\n        <div class=\"rs-tech-glass-box tech-border-indigo\">\n            <div class=\"rs-tech-icon tech-glow-indigo\">💾</div>\n            <h3>Heap Memory & CPU Overhead</h3>\n            <p>Bloated code leads to severe device throttling. We track the application's background memory footprint and garbage collection efficiency. A well-architected app flushes unused cache data effectively, ensuring that extended gameplay sessions do not result in CPU overheating, battery hemorrhaging, or forced application crashes on mid-tier hardware.</p>\n        </div>\n\n    </div>\n\n    <!-- TECHNICAL SUMMARY FOOTER -->\n    <div class=\"rs-tech-footer-card\">\n        <div class=\"rs-tech-flex-row\">\n            <div class=\"rs-tech-text-block\">\n                <h4>Data Verification Clause</h4>\n                <p>The diagnostic data presented in this technical review is based on isolated benchmarking. Application developers routinely deploy over-the-air (OTA) patches that may optimize or alter these engine parameters. We recommend running regular updates via authorized digital storefronts to maintain optimal software stability.</p>\n            </div>\n            \n            <div class=\"rs-tech-divider-vertical\"></div>\n\n            <div class=\"rs-tech-text-block\">\n                <h4>SEO & Search Visibility Note</h4>\n                <p>RummyApp Online actively structures our technical teardowns to provide the most transparent, data-driven insights available on the web. By focusing strictly on code architecture, UI mechanics, and tactical execution, we ensure our registry remains the definitive index for digital performance analysis.</p>\n            </div>\n        </div>\n    </div>\n\n</section>\n\n<style>\n@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');\n\n:root {\n    --primary: #0057FF;\n    --accent: #00C2FF;\n    --accent2: #7B2FFF;\n    --emerald: #00C98A;\n    --amber: #FF6B2B;\n    --text-main: #0A0F2C;\n    --text-muted: #4A5580;\n    --surface: #FFFFFF;\n    --surface-alt: #F0F5FF;\n    --border: #D6E0FF;\n    --glow-blue: rgba(0, 87, 255, 0.12);\n    --glow-cyan: rgba(0, 194, 255, 0.15);\n    --glow-purple: rgba(123, 47, 255, 0.12);\n    --glow-green: rgba(0, 201, 138, 0.12);\n}\n\n.rs-tech-wrapper {\n    width: 100%;\n    margin: 40px 0;\n    font-family: 'DM Sans', sans-serif;\n    background: linear-gradient(145deg, #EEF3FF 0%, #F7F0FF 40%, #E8F8FF 100%);\n    padding: 40px;\n    border-radius: 24px;\n    box-sizing: border-box;\n    color: var(--text-main);\n    position: relative;\n    overflow: hidden;\n    box-shadow: 0 20px 60px rgba(0, 87, 255, 0.1), 0 4px 16px rgba(0,0,0,0.06);\n    border: 1px solid var(--border);\n}\n\n.rs-tech-wrapper::before {\n    content: '';\n    position: absolute;\n    top: 0; left: 0; right: 0; bottom: 0;\n    background-image: radial-gradient(circle, rgba(0, 87, 255, 0.08) 1px, transparent 1px);\n    background-size: 28px 28px;\n    pointer-events: none;\n    z-index: 0;\n}\n\n.rs-tech-wrapper::after {\n    content: '';\n    position: absolute;\n    top: -80px;\n    right: -80px;\n    width: 320px;\n    height: 320px;\n    background: radial-gradient(circle, rgba(123, 47, 255, 0.12) 0%, transparent 70%);\n    border-radius: 50%;\n    pointer-events: none;\n    z-index: 0;\n}\n\n.rs-tech-wrapper * {\n    box-sizing: border-box;\n    position: relative;\n    z-index: 1;\n}\n\n.rs-tech-alert-top {\n    display: inline-flex;\n    align-items: center;\n    gap: 12px;\n    background: linear-gradient(90deg, rgba(0,87,255,0.08), rgba(0,194,255,0.08));\n    color: var(--primary);\n    padding: 10px 22px;\n    border-radius: 100px;\n    margin-bottom: 32px;\n    font-size: 11px;\n    font-weight: 800;\n    font-family: 'Syne', sans-serif;\n    letter-spacing: 2px;\n    text-transform: uppercase;\n    border: 1px solid rgba(0, 87, 255, 0.25);\n    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.1);\n}\n\n.rs-tech-pulse {\n    width: 8px; height: 8px;\n    background: linear-gradient(135deg, var(--primary), var(--accent));\n    border-radius: 50%;\n    animation: tech-pulse 2s infinite;\n    flex-shrink: 0;\n}\n\n@keyframes tech-pulse {\n    0% { box-shadow: 0 0 0 0 rgba(0, 87, 255, 0.6); }\n    70% { box-shadow: 0 0 0 10px rgba(0, 87, 255, 0); }\n    100% { box-shadow: 0 0 0 0 rgba(0, 87, 255, 0); }\n}\n\n.rs-tech-glass-card {\n    background: rgba(255, 255, 255, 0.85);\n    backdrop-filter: blur(20px);\n    -webkit-backdrop-filter: blur(20px);\n    border-radius: 20px;\n    padding: 40px;\n    border: 1px solid rgba(0, 87, 255, 0.12);\n    margin-bottom: 40px;\n    box-shadow: 0 8px 32px rgba(0, 87, 255, 0.07), 0 1px 4px rgba(0,0,0,0.04);\n}\n\n.rs-tech-hero {\n    border-top: 3px solid transparent;\n    background-clip: padding-box;\n    position: relative;\n}\n\n.rs-tech-hero::before {\n    content: '';\n    position: absolute;\n    top: 0; left: 0; right: 0;\n    height: 3px;\n    background: linear-gradient(90deg, var(--primary), var(--accent), var(--accent2));\n    border-radius: 20px 20px 0 0;\n    z-index: 2;\n}\n\n.rs-tech-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 15px;\n    flex-wrap: wrap;\n    margin-bottom: 25px;\n    padding-bottom: 25px;\n    border-bottom: 1px solid var(--border);\n}\n\n.rs-tech-header h2 {\n    font-size: 32px;\n    font-weight: 800;\n    margin: 0;\n    font-family: 'Syne', sans-serif;\n    background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n    background-clip: text;\n    letter-spacing: -0.5px;\n}\n\n.rs-tech-badge {\n    padding: 8px 20px;\n    border-radius: 100px;\n    background: linear-gradient(135deg, var(--primary), var(--accent2));\n    color: #fff;\n    font-size: 12px;\n    font-weight: 700;\n    font-family: 'Syne', sans-serif;\n    text-transform: uppercase;\n    letter-spacing: 1.5px;\n    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.3);\n}\n\n.rs-tech-lead-text {\n    font-size: 16px;\n    line-height: 1.9;\n    color: var(--text-muted);\n    margin: 0;\n}\n\n.rs-tech-section-title {\n    font-size: 22px;\n    font-weight: 800;\n    font-family: 'Syne', sans-serif;\n    color: var(--text-main);\n    margin: 50px 0 25px 0;\n    position: relative;\n    padding-left: 18px;\n}\n\n.rs-tech-section-title::before {\n    content: '';\n    position: absolute;\n    left: 0;\n    top: 2px;\n    bottom: 2px;\n    width: 4px;\n    background: linear-gradient(180deg, var(--primary), var(--accent));\n    border-radius: 4px;\n}\n\n.rs-tech-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n    gap: 20px;\n    margin-bottom: 40px;\n}\n\n.rs-tech-glass-box {\n    background: rgba(255, 255, 255, 0.9);\n    border: 1px solid var(--border);\n    border-radius: 16px;\n    padding: 30px 25px;\n    text-align: left;\n    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\n    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.05);\n}\n\n.rs-tech-glass-box:hover {\n    transform: translateY(-6px);\n    box-shadow: 0 16px 40px rgba(0, 87, 255, 0.12);\n}\n\n.tech-border-slate:hover { border-color: #94a3b8; box-shadow: 0 16px 40px rgba(100,116,139,0.15); }\n.tech-border-cyan:hover { border-color: var(--accent); box-shadow: 0 16px 40px var(--glow-cyan); }\n.tech-border-emerald:hover { border-color: var(--emerald); box-shadow: 0 16px 40px var(--glow-green); }\n.tech-border-indigo:hover { border-color: var(--accent2); box-shadow: 0 16px 40px var(--glow-purple); }\n\n.rs-tech-icon {\n    font-size: 24px;\n    margin-bottom: 20px;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 60px;\n    height: 60px;\n    border-radius: 14px;\n    border: 1px solid var(--border);\n}\n\n.tech-glow-slate { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); }\n.tech-glow-cyan  { background: linear-gradient(135deg, #e0f9ff, #b8f0ff); }\n.tech-glow-emerald { background: linear-gradient(135deg, #d4f9ed, #a7f3d0); }\n.tech-glow-indigo { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }\n\n.rs-tech-glass-box h3 {\n    margin: 0 0 12px 0;\n    font-size: 17px;\n    font-family: 'Syne', sans-serif;\n    color: var(--text-main);\n    font-weight: 700;\n}\n\n.rs-tech-glass-box p {\n    margin: 0;\n    font-size: 14.5px;\n    line-height: 1.75;\n    color: var(--text-muted);\n}\n\n.rs-tech-footer-card {\n    background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,245,255,0.95));\n    border: 1px solid var(--border);\n    border-radius: 16px;\n    padding: 35px;\n    box-shadow: 0 4px 20px rgba(0, 87, 255, 0.06);\n    position: relative;\n    overflow: hidden;\n}\n\n.rs-tech-footer-card::before {\n    content: '';\n    position: absolute;\n    bottom: 0; left: 0; right: 0;\n    height: 3px;\n    background: linear-gradient(90deg, var(--accent2), var(--primary), var(--accent));\n    border-radius: 0 0 16px 16px;\n}\n\n.rs-tech-flex-row {\n    display: flex;\n    gap: 35px;\n    align-items: stretch;\n}\n\n.rs-tech-text-block { flex: 1; }\n\n.rs-tech-divider-vertical {\n    width: 1px;\n    background: linear-gradient(180deg, transparent, var(--border), transparent);\n}\n\n.rs-tech-text-block h4 {\n    margin: 0 0 10px 0;\n    font-size: 16px;\n    font-weight: 700;\n    font-family: 'Syne', sans-serif;\n    color: var(--text-main);\n}\n\n.rs-tech-text-block p {\n    margin: 0;\n    font-size: 14px;\n    line-height: 1.8;\n    color: var(--text-muted);\n}\n\n@media(max-width: 900px) {\n    .rs-tech-flex-row { flex-direction: column; gap: 25px; }\n    .rs-tech-divider-vertical { display: none; }\n    .rs-tech-text-block { border-bottom: 1px solid var(--border); padding-bottom: 20px; }\n    .rs-tech-text-block:last-child { border-bottom: none; padding-bottom: 0; }\n}\n\n@media(max-width: 768px) {\n    .rs-tech-wrapper { padding: 20px; }\n    .rs-tech-glass-card { padding: 25px; }\n    .rs-tech-header h2 { font-size: 24px; }\n    .rs-tech-grid { grid-template-columns: 1fr; }\n    .rs-tech-glass-box, .rs-tech-footer-card { padding: 22px; }\n}\n</style>",
    "red_box_msg": "The render-thread metrics and input-polling speeds analyzed in this audit assume a verified, unmodified software build. Sideloaded APKs inherently corrupt the native isolation logic, resulting in severe frame-dropping and localized execution crashes. Always secure your application binaries exclusively through official developer nodes.",
    "slug": "inr-rummy"
  },
  {
    "created_at": "2026-05-26T07:26:42.606Z",
    "seo_description": "",
    "release_notes": "",
    "name": "JAIHO RUMMY ",
    "yellow_box_msg": "",
    "og_image_url": "",
    "id": "9a05609sb",
    "rating": 3.9,
    "is_featured": false,
    "slug": "jaiho-rummy-",
    "red_box_msg": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/c693366d-d543-4d76-84ba-3963a3f3c792/-/preview/190x190/",
    "seo_keywords": "",
    "link_configured": true,
    "canonical_url": "",
    "faqs": [],
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "version": "2.1",
    "serial_number": 18,
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "features_html": "",
    "developer": "PW sahar",
    "is_new": false,
    "target_region": "",
    "seo_title": "",
    "category": "Yono, All App",
    "file_size": "2.4",
    "idea_box_msg": "",
    "screenshots": []
  },
  {
    "target_region": "",
    "is_new": false,
    "developer": "Mak job",
    "features_html": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "idea_box_msg": "",
    "screenshots": [],
    "file_size": "68",
    "category": "Yono, All App",
    "seo_title": "",
    "faqs": [],
    "version": "1.6",
    "serial_number": 19,
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "red_box_msg": "",
    "slug": "love-rummy",
    "canonical_url": "",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/cf0b4466-3d5b-4eb5-bc88-afc9a8213ac4/-/preview/190x190/",
    "link_configured": true,
    "custom_admin_box_html": "",
    "video_url": "",
    "seo_description": "",
    "release_notes": "",
    "created_at": "2026-05-26T07:31:59.173Z",
    "is_featured": false,
    "id": "l7a60keix",
    "rating": 4.2,
    "yellow_box_msg": "",
    "og_image_url": "",
    "name": "Love Rummy"
  },
  {
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "version": "1.8",
    "serial_number": 20,
    "faqs": [],
    "category": "Yono, All App",
    "seo_title": "",
    "idea_box_msg": "",
    "screenshots": [],
    "file_size": "50",
    "developer": "AB Arora",
    "features_html": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "target_region": "",
    "is_new": false,
    "yellow_box_msg": "",
    "og_image_url": "",
    "name": "JOY RUMMY",
    "is_featured": false,
    "id": "4paka7kie",
    "rating": 5,
    "created_at": "2026-05-26T07:34:35.782Z",
    "seo_description": "",
    "release_notes": "",
    "custom_admin_box_html": "",
    "video_url": "",
    "canonical_url": "",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/e0898894-5d5b-47ab-a14f-13b4514b3b4f/-/preview/190x190/",
    "link_configured": false,
    "slug": "joy-rummy",
    "red_box_msg": ""
  },
  {
    "canonical_url": "",
    "link_configured": true,
    "icon_url": "https://13eehe59cj.ucarecd.net/2d664adc-3e1f-4317-805c-dea453f52389/-/preview/190x190/",
    "seo_keywords": "",
    "custom_admin_box_html": "",
    "video_url": "",
    "red_box_msg": "",
    "slug": "maha-games",
    "is_featured": false,
    "rating": 4,
    "id": "2768ohu2a",
    "og_image_url": "",
    "yellow_box_msg": "",
    "name": "MAHA GAMES",
    "release_notes": "",
    "seo_description": "",
    "created_at": "2026-05-26T07:37:07.122Z",
    "idea_box_msg": "",
    "screenshots": [],
    "file_size": "70",
    "category": "Yono, All App",
    "seo_title": "",
    "target_region": "",
    "is_new": false,
    "features_html": "",
    "developer": "AZ ever",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "serial_number": 21,
    "version": "1.0",
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "faqs": []
  },
  {
    "serial_number": 22,
    "version": "5.8",
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "faqs": [],
    "file_size": "58",
    "idea_box_msg": "",
    "screenshots": [],
    "seo_title": "",
    "category": "Yono, All App",
    "is_new": false,
    "target_region": "",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "features_html": "",
    "developer": "AZ ever",
    "rating": 3.9,
    "id": "us5xuk5bm",
    "is_featured": false,
    "name": "Rummy Ludo",
    "og_image_url": "",
    "yellow_box_msg": "",
    "release_notes": "",
    "seo_description": "",
    "created_at": "2026-05-26T07:39:44.282Z",
    "link_configured": true,
    "icon_url": "https://13eehe59cj.ucarecd.net/6aa28ca8-cef1-4d1a-b054-13e242eaef02/-/preview/190x190/",
    "seo_keywords": "",
    "canonical_url": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "red_box_msg": "",
    "slug": "rummy-ludo"
  },
  {
    "name": "Rummy 77",
    "yellow_box_msg": "",
    "og_image_url": "",
    "id": "69x1lstq7",
    "rating": 3.9,
    "is_featured": false,
    "created_at": "2026-05-26T07:42:24.615Z",
    "seo_description": "",
    "release_notes": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/d17abcfc-c8dc-4c36-8558-e3408002d37e/-/preview/190x190/",
    "seo_keywords": "",
    "link_configured": true,
    "canonical_url": "",
    "slug": "rummy-77",
    "red_box_msg": "",
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "version": "2.0.6",
    "serial_number": 23,
    "faqs": [],
    "seo_title": "",
    "category": "Yono, All App",
    "file_size": "45",
    "idea_box_msg": "",
    "screenshots": [],
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "features_html": "",
    "developer": "Arcade ",
    "is_new": false,
    "target_region": ""
  },
  {
    "is_new": false,
    "target_region": "",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "developer": "AB Arora",
    "features_html": "",
    "file_size": "58",
    "screenshots": [],
    "idea_box_msg": "",
    "seo_title": "",
    "category": "Yono, All App",
    "faqs": [],
    "version": "1.8",
    "serial_number": 24,
    "is_coming_soon": false,
    "custom_admin_box_heading": "",
    "red_box_msg": "",
    "slug": "share-slots",
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/2738be7d-f198-4f70-a7d8-c8eb5f452eb0/-/preview/190x190/",
    "link_configured": false,
    "canonical_url": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "seo_description": "",
    "release_notes": "",
    "created_at": "2026-05-26T07:44:32.442Z",
    "id": "j79n2g3l9",
    "rating": 4,
    "is_featured": false,
    "name": "Share Slots",
    "yellow_box_msg": "",
    "og_image_url": ""
  },
  {
    "target_region": "",
    "is_new": false,
    "features_html": "",
    "developer": "Tania JK ",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "idea_box_msg": "",
    "screenshots": [],
    "file_size": "65",
    "category": "Yono, All App",
    "seo_title": "",
    "faqs": [],
    "serial_number": 26,
    "version": "1.6",
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "red_box_msg": "",
    "slug": "567-slots",
    "canonical_url": "",
    "link_configured": true,
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/e4314d5e-eb77-46b9-8998-8e0f94970b38/-/preview/72x72/",
    "custom_admin_box_html": "",
    "video_url": "",
    "seo_description": "",
    "release_notes": "",
    "created_at": "2026-05-26T07:51:47.637Z",
    "is_featured": false,
    "rating": 3.5,
    "id": "n3w2vjk0b",
    "og_image_url": "",
    "yellow_box_msg": "",
    "name": "567 SLOTS"
  },
  {
    "release_notes": "",
    "seo_description": "",
    "created_at": "2026-05-26T07:56:30.478Z",
    "is_featured": false,
    "id": "owxg4aekg",
    "rating": 2.9,
    "yellow_box_msg": "",
    "og_image_url": "",
    "name": "789Jackpots",
    "red_box_msg": "",
    "slug": "789jackpots",
    "canonical_url": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/a0cedc36-33b0-4e75-a1ea-cd963b3ee0ca/-/preview/190x190/",
    "seo_keywords": "",
    "link_configured": true,
    "custom_admin_box_html": "",
    "video_url": "",
    "faqs": [],
    "version": "1.9",
    "serial_number": 27,
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "target_region": "",
    "is_new": false,
    "features_html": "",
    "developer": "Admin",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "idea_box_msg": "",
    "screenshots": [],
    "file_size": "Tanu WD",
    "category": "Yono, All App",
    "seo_title": ""
  },
  {
    "slug": "yono-vip",
    "red_box_msg": "",
    "custom_admin_box_html": "",
    "video_url": "",
    "canonical_url": "",
    "link_configured": true,
    "seo_keywords": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/d9226164-7447-425e-ba61-618d72ed28df/-/preview/190x190/",
    "created_at": "2026-05-26T08:00:01.636Z",
    "release_notes": "",
    "seo_description": "",
    "og_image_url": "",
    "yellow_box_msg": "",
    "name": "YONO VIP",
    "is_featured": false,
    "rating": 4,
    "id": "fw5wsziec",
    "features_html": "",
    "developer": "Rahul HL",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "target_region": "",
    "is_new": false,
    "category": "Yono, All App",
    "seo_title": "",
    "screenshots": [],
    "idea_box_msg": "",
    "file_size": "78",
    "faqs": [],
    "custom_admin_box_heading": "",
    "is_coming_soon": false,
    "serial_number": 28,
    "version": "1.8"
  },
  {
    "seo_title": "",
    "category": "Card",
    "file_size": "90",
    "screenshots": [],
    "idea_box_msg": "",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "developer": "Unknown ",
    "features_html": "",
    "is_new": true,
    "target_region": "",
    "is_coming_soon": true,
    "custom_admin_box_heading": "",
    "serial_number": 34,
    "version": "3",
    "faqs": [],
    "video_url": "",
    "publish_date": "2026-06-10T12:00:00.000Z",
    "custom_admin_box_html": "",
    "link_configured": true,
    "icon_url": "https://kk19a1nwwx.ucarecd.net/091fdebe-1562-41c6-99ea-b60665adb5ee/-/preview/512x512/",
    "seo_keywords": "",
    "canonical_url": "",
    "slug": "teen-patti-octro",
    "red_box_msg": "",
    "name": "Teen Patti Octro",
    "og_image_url": "",
    "yellow_box_msg": "",
    "rating": 4.2,
    "id": "t1ocq5iar",
    "is_featured": false,
    "created_at": "2026-06-03T10:17:01.058Z",
    "release_notes": "",
    "seo_description": ""
  },
  {
    "slug": "zynga-poker-texas-holdem-game",
    "red_box_msg": "",
    "video_url": "",
    "custom_admin_box_html": "",
    "seo_keywords": "",
    "icon_url": "https://kk19a1nwwx.ucarecd.net/5b72cf8f-4959-426e-9e1d-8e2150529efb/-/preview/240x240/",
    "link_configured": true,
    "canonical_url": "",
    "created_at": "2026-06-03T10:30:01.393Z",
    "release_notes": "",
    "seo_description": "",
    "name": "Zynga Poker- Texas Holdem Game",
    "yellow_box_msg": "",
    "og_image_url": "",
    "id": "rrmv44n9n",
    "rating": 5,
    "is_featured": false,
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "developer": "Admin",
    "features_html": "",
    "is_new": false,
    "target_region": "",
    "seo_title": "",
    "category": "Card",
    "file_size": "Unknown",
    "idea_box_msg": "",
    "screenshots": [],
    "faqs": [],
    "is_coming_soon": true,
    "custom_admin_box_heading": "",
    "version": "1.0",
    "serial_number": 29
  },
  {
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "developer": "Admin",
    "features_html": null,
    "is_new": true,
    "target_region": "",
    "seo_title": "",
    "category": "Card",
    "file_size": "Unknown",
    "idea_box_msg": null,
    "screenshots": [],
    "faqs": [],
    "is_coming_soon": true,
    "custom_admin_box_heading": null,
    "serial_number": 30,
    "version": "1.0",
    "slug": "uno-",
    "red_box_msg": null,
    "custom_admin_box_html": null,
    "link_configured": true,
    "seo_keywords": "",
    "icon_url": "https://1ewg1yyass.ucarecd.net/c0172402-c854-4016-876e-6b7769547c8f/-/preview/238x211/",
    "canonical_url": "",
    "created_at": "2026-06-07T10:14:11.138Z",
    "seo_description": "",
    "release_notes": "",
    "name": "UNO! ",
    "og_image_url": "",
    "yellow_box_msg": null,
    "rating": 5,
    "id": "wf59smk6l",
    "is_featured": false
  },
  {
    "created_at": "2026-06-07T10:16:45.949Z",
    "seo_description": "",
    "release_notes": "",
    "yellow_box_msg": "",
    "og_image_url": "",
    "name": "Rummy GOLD - With Fast Rummy",
    "is_featured": false,
    "id": "8epj9jjpu",
    "rating": 5,
    "slug": "rummy-gold-with-fast-rummy",
    "red_box_msg": "",
    "custom_admin_box_html": "",
    "canonical_url": "",
    "seo_keywords": "",
    "icon_url": "https://1ewg1yyass.ucarecd.net/33e0d4e8-6e41-4791-9e41-8d915a12e504/-/preview/447x447/",
    "link_configured": true,
    "faqs": [],
    "custom_admin_box_heading": "",
    "is_coming_soon": true,
    "version": "1.0",
    "serial_number": 31,
    "developer": "Admin",
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "target_region": "",
    "is_new": false,
    "category": "Card",
    "seo_title": "",
    "idea_box_msg": "",
    "screenshots": [],
    "file_size": "Unknown"
  },
  {
    "red_box_msg": null,
    "slug": "indian-rummy-3-patti-card-game",
    "canonical_url": "",
    "seo_keywords": "",
    "icon_url": "https://1ewg1yyass.ucarecd.net/2a4b59ef-16a3-4b14-bad3-1c3796af3492/-/preview/447x447/",
    "link_configured": true,
    "custom_admin_box_html": null,
    "seo_description": "",
    "release_notes": "",
    "created_at": "2026-06-07T10:19:11.616Z",
    "is_featured": false,
    "id": "8jt0hokyo",
    "rating": 5,
    "yellow_box_msg": null,
    "og_image_url": "",
    "name": "Indian Rummy 3 Patti Card Game",
    "target_region": "",
    "is_new": true,
    "developer": "Admin",
    "features_html": null,
    "safety_status": "Verified",
    "description_html": "<p>A new application.</p>",
    "screenshots": [],
    "idea_box_msg": null,
    "file_size": "Unknown",
    "category": "Card",
    "seo_title": "",
    "faqs": [],
    "version": "1.0",
    "serial_number": 32,
    "custom_admin_box_heading": null,
    "is_coming_soon": true
  },
  {
    "og_image_url": "https://1ewg1yyass.ucarecd.net/0f918f11-b247-4b5a-9d26-d510dddffbfe/-/preview/447x447/",
    "yellow_box_msg": "",
    "name": "Lucky Spin Slots",
    "is_featured": false,
    "rating": 5,
    "id": "01x9h7nfb",
    "created_at": "2026-06-07T13:13:11.211Z",
    "seo_description": "",
    "release_notes": "",
    "publish_date": "2026-07-08T13:08:00.000Z",
    "custom_admin_box_html": "",
    "canonical_url": "",
    "link_configured": true,
    "icon_url": "https://1ewg1yyass.ucarecd.net/0f918f11-b247-4b5a-9d26-d510dddffbfe/-/preview/447x447/",
    "seo_keywords": "",
    "slug": "lucky-spin-slots",
    "red_box_msg": "",
    "custom_admin_box_heading": "",
    "is_coming_soon": true,
    "serial_number": 33,
    "version": "1.0",
    "faqs": [],
    "category": "Slots",
    "seo_title": "",
    "idea_box_msg": "",
    "screenshots": [],
    "file_size": "Unknown",
    "developer": "Admin",
    "features_html": "",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "target_region": "",
    "is_new": false
  },
  {
    "publish_date": "2026-06-12T15:30:00.000Z",
    "custom_admin_box_html": "",
    "video_url": "",
    "canonical_url": "",
    "link_configured": true,
    "seo_keywords": "",
    "icon_url": "https://1ewg1yyass.ucarecd.net/9d9339e0-77d4-418b-86f8-0a0e074c1d4e/-/preview/190x190/",
    "slug": "ind-club",
    "red_box_msg": "",
    "og_image_url": "",
    "yellow_box_msg": "",
    "name": "IND Club",
    "is_featured": false,
    "rating": 4.5,
    "id": "3cflt97b5",
    "created_at": "2026-06-12T12:39:30.407Z",
    "seo_description": "",
    "release_notes": "",
    "category": "Yono",
    "seo_title": "",
    "screenshots": [],
    "idea_box_msg": "",
    "file_size": "76",
    "features_html": "",
    "developer": "AB Arora",
    "description_html": "<p>A new application.</p>",
    "safety_status": "Verified",
    "target_region": "",
    "is_new": false,
    "custom_admin_box_heading": "",
    "is_coming_soon": true,
    "serial_number": 28,
    "version": "1.0",
    "faqs": []
  }
];

export const saveMockApps = (apps: AppConfig[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: GlobalSettings = {
  "categories": [
    "Yono",
    "Card",
    "Slots"
  ],
  "ethics_heading": "ETHNICS",
  "support_email": "support@rummyapp.online",
  "disclaimer_text": "<div ",
  "terms_content": "<!-- ",
  "last_updated": "2026-07-18T19:16:36.966Z",
  "trending_searches": [
    "RummyApp Online",
    "rummyapp.online",
    "rummyapp",
    "rummy app online review",
    "official rummy app online",
    "go rummy",
    "rummy store application reviews",
    "online gaming facts 2026",
    "gaming blogs india",
    "safe platform gaming",
    "top tier gaming experience",
    "digital entertainment portal",
    "guest play card games",
    "anonymous gaming portal",
    "no login card games",
    "free practice gaming events",
    "Rummy 91 review",
    "Rummy 91 casual app",
    "Rummy 91 game interface",
    "Rummy 91 virtual bonus",
    "play Rummy 91 online",
    "Gogo Rummy app",
    "Gogo Rummy game",
    "Gogo Rummy online",
    "Gogo Rummy review",
    "Gogo Rummy features",
    "Gogo Rummy interface",
    "Gogo Rummy guest mode",
    "Club INR app",
    "Club INR game",
    "Club INR online",
    "Club INR play",
    "Club INR review",
    "Club INR features",
    "Club INR guest mode",
    "ABC Rummy app",
    "ABC Rummy game",
    "ABC Rummy online",
    "ABC Rummy review",
    "ABC Rummy features",
    "ABC Rummy guest mode",
    "777 Rummy app",
    "777 Rummy online",
    "777 Rummy play",
    "777 Rummy review",
    "777 Rummy features",
    "777 Rummy guest mode",
    "Ever 777 app",
    "Ever 777 game",
    "Ever 777 online",
    "Ever 777 play",
    "Ever 777 review",
    "Ever 777 features",
    "Game Rummy app",
    "Game Rummy game",
    "Game Rummy online",
    "Game Rummy review",
    "Game Rummy features",
    "Hi Rummy app",
    "Hi Rummy game",
    "Hi Rummy online",
    "Hi Rummy play",
    "Hi Rummy review",
    "Hi Rummy features",
    "INR Rummy app",
    "INR Rummy game",
    "INR Rummy online",
    "INR Rummy play",
    "INR Rummy review",
    "INR Rummy features",
    "Jaiho Rummy app",
    "Jaiho Rummy game",
    "Jaiho Rummy online",
    "Jaiho Rummy play",
    "Jaiho Rummy review",
    "Love Rummy app",
    "Love Rummy game",
    "Love Rummy online",
    "Love Rummy play",
    "Love Rummy review",
    "Joy Rummy app",
    "Joy Rummy game",
    "Joy Rummy online",
    "Joy Rummy play",
    "Joy Rummy review",
    "Maha Games app",
    "Maha Games game",
    "Maha Games online",
    "Maha Games play",
    "Maha Games review",
    "Rummy Lodo app",
    "Rummy Lodo game",
    "Rummy Lodo online",
    "Rummy Lodo play",
    "Rummy Lodo review",
    "Rummy 77 app",
    "Rummy 77 game",
    "Rummy 77 online",
    "Rummy 77 play",
    "Rummy 77 review",
    "Share Slots app",
    "Share Slots game",
    "Share Slots online",
    "Share Slots play",
    "Share Slots review",
    "567 Slots app",
    "567 Slots game",
    "567 Slots online",
    "567 Slots play",
    "567 Slots review",
    "789 Jackpots app",
    "789 Jackpots game",
    "789 Jackpots online",
    "789 Jackpots play",
    "789 Jackpots review",
    "Yono VIP app",
    "Yono VIP game",
    "Yono VIP online",
    "Yono VIP play",
    "Yono VIP review",
    "yono games alternative",
    "indian rummy variations",
    "13 card rummy strategy",
    "pure sequence logic",
    "pure sequence guide",
    "joker card casual rules",
    "points rummy logic rules",
    "pool rummy strategy",
    "deals rummy tips",
    "drop point logic rules",
    "advanced rummy tactics",
    "beginner rummy tutorial",
    "real skill rummy simulation",
    "virtual skill rummy portal",
    "smooth card sorting",
    "lag free rummy gaming",
    "digital rummy table",
    "virtual gaming wallet",
    "premium strategy rummy platform",
    "drop rules in rummy",
    "skill based gaming portal",
    "lucky casual slot games"
  ],
  "website_faqs": [
    {
      "question": "Adil",
      "answer": "New Answer"
    }
  ],
  "hero_title_animation": "slide-up",
  "hero_title_visible": true,
  "animations_enabled": true,
  "important_notice_heading": "VERY IMPORTANT NOTICE ",
  "hero_title_style": "mono",
  "about_content": "<!-- SA",
  "favicon_url": "https://y4q7avawns.ucarecd.net/b391a2fa-42f7-4b3a-a0d5-605cb22aead4/-/preview/1000x1000/",
  "privacy_content": "<!-- ",
  "disclaimer_heading": "DISCLAIMER ",
  "hero_title_color": "neon-sky",
  "helpline_whatsapp": "+918653034735",
  "responsibility_content": "<!-- ",
  "secure_index_title": "RummyApp Online ",
  "quick_links": [],
  "portal_heading": "IMPORTANT NOTICE ",
  "hero_title_text": "RummyApp Online ",
  "site_title": "RummyDex ",
  "important_notice": "<div ",
  "banners": [
    {
      "id": "mgg408of3",
      "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
      "title": "New Banner",
      "link": "/",
      "subtitle": "Subtitle text"
    }
  ],
  "meta_description": "Ok ",
  "seo_keywords": "M",
  "social_links": {
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "linkedin": "",
    "youtube": ""
  },
  "hero_title_subtitle": "Step into the world of Rummy - compete, challenge friends, and rise to the top on RummyApp Online!",
  "ticker_text": "LIVE: Unbiased words. Uncompromised truth. RummyApp Online  delivers pure transparency through independent reviews. ✒️",
  "secure_index_subtitle": "The Ultimate Registry for Strategic Card Simulation, Arcade Logic, and Premium Virtual Gameplay Guides",
  "helpline_telegram": "https://t.me/+d_B",
  "ethics_discrimination_text": "<div ",
  "contact_content": "<p>Have questions or feedback? We'd love to hear from you. Our team typically responds within 24-48 hours.</p>",
  "logo_url": "https://y4q7avawns.ucarecd.net/b391a2fa-42f7-4b3a-a0d5-605cb22aead4/-/preview/1000x1000/"
};

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
    "id": "3tgueni4s",
    "og_image_url": "",
    "logo_url": "https://1ewg1yyass.ucarecd.net/6697c775-4605-43f9-9b6d-66b6447f53da/-/preview/1000x563/",
    "seo_description": "Discover the latest Slot game addition on Spin Crush via rummyapp.online. Featuring the new \"Super Spin\" style mechanic, first-time players can unlock a randomized introductory bonus between 1,000 and 25,000 free coins.",
    "title": "Spin crush ",
    "date": "2026-06-08T14:30:50.982Z",
    "link": "https://www.rummyapp.online/spin-crush-",
    "author": "Admin",
    "canonical_url": "https://www.rummyapp.online/news/spin-crush-new-slot-game-update",
    "read_time": "2 min",
    "seo_keywords": "",
    "tags": [],
    "category": "Yono",
    "ceo_description": "",
    "content": "<div style=\"max-width: 800px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.08); overflow: hidden;\">\n \n <!-- Premium Header -->\n <div style=\"background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px 20px; text-align: center; color: #ffffff;\">\n <h2 style=\"margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;\">Spin Crush Platform Update</h2>\n <p style=\"margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 300;\">Introducing the New Super Spin Slots</p>\n </div>\n \n <!-- Main Content Body -->\n <div style=\"padding: 35px 30px;\">\n \n <p style=\"font-size: 16px; line-height: 1.8; color: #444444; margin-bottom: 25px;\">\n We are pleased to announce the latest expansion to the <strong>Spin Crush</strong> game library on <em>rummyapp.online</em>. A new gameplay variation has been integrated into our classic slot category, officially designated as <strong>Super Spin Slots</strong>. This update brings a modernized slot matrix directly to your existing dashboard.\n </p>\n\n <!-- Highlighted Bonus Box -->\n <div style=\"background-color: #fff9e6; border-left: 6px solid #ffc107; padding: 25px; border-radius: 6px; margin: 30px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);\">\n <h3 style=\"margin: 0 0 12px 0; color: #b28900; font-size: 22px; font-weight: 600;\">Exclusive First-Play Welcome Bonus</h3>\n <p style=\"margin: 0 0 15px 0; font-size: 16px; color: #555555; line-height: 1.6;\">\n To celebrate the launch of this specific slot variation, all eligible users interacting with Super Spin Slots for the first time will receive an automated promotional credit drop.\n </p>\n \n <ul style=\"margin: 0; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;\">\n <li><strong>Bonus Range:</strong> <span style=\"color: #28a745; font-weight: bold;\">1,000 (1K) to 25,000 (25K) Free Coins</span></li>\n <li><strong>Eligibility Requirement:</strong> Granted strictly upon initial game loading.</li>\n <li><strong>Distribution Logic:</strong> Powered by a verified random generator.</li>\n </ul>\n </div>\n\n <!-- Technical Neutrality Section -->\n <h3 style=\"color: #2c3e50; font-size: 20px; margin-bottom: 12px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;\">Platform Neutrality & Fair Play</h3>\n <p style=\"font-size: 16px; line-height: 1.8; color: #444444; margin-bottom: 30px;\">\n In strict alignment with standard industry practices, the initial coin allocation relies entirely on an unbiased algorithm to ensure complete neutrality. The game mechanics have undergone technical optimization to guarantee equitable payout rates and a seamless, high-speed experience across both desktop and mobile platforms.\n </p>\n\n <!-- Call to Action Footer -->\n <div style=\"text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eeeeee;\">\n <p style=\"font-size: 16px; color: #666666; margin-bottom: 20px;\">\n The Super Spin Slots system is fully deployed.\n </p>\n <!-- Faux Button to look beautiful -->\n <span style=\"display: inline-block; background-color: #2a5298; color: #ffffff; padding: 14px 32px; border-radius: 30px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(42, 82, 152, 0.3);\">\n Play Now on Spin Crush\n </span>\n </div>\n\n </div>\n</div>\n",
    "seo_title": "",
    "ceo_name": "Spin Crush Adds New Super Spin Slot Game: Claim 1K to 25K Free Coins",
    "description": "Spin Crush has officially integrated a new traditional \"Super Spin\" style Slot game variation into its platform. First-time players can claim a welcome bonus ranging from 1,000 to 25,000 free coins upon their initial spin.",
    "target_region": "Indian ",
    "description_html": "<p>News HTML...</p>",
    "slug": "spin-crush-new-slot-game-update"
  },
  {
    "description_html": "<p>News HTML...</p>",
    "slug": "yono-rummy-fortune-reels-deployment",
    "description": "Notice of system expansion for Yono Rummy. A new slot-mechanic module, \"Fortune Reels,\" has been successfully deployed, featuring a randomized 1K–25K coin initialization credit for all active accounts on their first session.",
    "target_region": "Global",
    "ceo_name": "YONO RUMMY",
    "seo_title": "News SEO Title",
    "tags": [],
    "content": "<div style=\"max-width: 800px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; border: 1px solid #d3d3d3; background-color: #fdfdfd;\">\n \n <!-- System Bulletin Header -->\n <div style=\"background-color: #111111; padding: 25px 30px; border-bottom: 4px solid #e67e22;\">\n <h2 style=\"margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; tracking: 1px;\">SYSTEM RELEASE NOTES: YONO RUMMY</h2>\n <p style=\"margin: 5px 0 0 0; color: #aaaaaa; font-size: 14px;\">Module Deployment • Effective June 2026</p>\n </div>\n\n <div style=\"padding: 30px;\">\n \n <h3 style=\"color: #333333; font-size: 18px; text-transform: uppercase; border-left: 3px solid #e67e22; padding-left: 10px; margin-top: 0;\">1. Module Expansion: Fortune Reels</h3>\n <p style=\"font-size: 15px; color: #555555; line-height: 1.7; margin-bottom: 25px;\">\n Effective immediately, the core catalog of the <strong>Yono Rummy</strong> application via <em>rummyapp.online</em> has been expanded. Our engineering and development teams have successfully integrated a new slot-based interaction module, cataloged under the title <strong>\"Fortune Reels\"</strong>. This deployment introduces modernized reel mechanics into the existing rummy-focused ecosystem without disrupting current user workflows.\n </p>\n\n <h3 style=\"color: #333333; font-size: 18px; text-transform: uppercase; border-left: 3px solid #e67e22; padding-left: 10px;\">2. Initialization Credit Allocation</h3>\n <p style=\"font-size: 15px; color: #555555; line-height: 1.7; margin-bottom: 15px;\">\n To facilitate user onboarding for this specific module, a one-time automated credit protocol has been activated. Upon the first successful load of the Fortune Reels interface, the system will execute a randomized deposit into the user's primary wallet.\n </p>\n\n <!-- Data Table Format instead of a List -->\n <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 15px;\">\n <thead>\n <tr style=\"background-color: #eeeeee; color: #333333; text-align: left;\">\n <th style=\"padding: 12px; border: 1px solid #cccccc;\">Parameter</th>\n <th style=\"padding: 12px; border: 1px solid #cccccc;\">Specification</th>\n </tr>\n </thead>\n <tbody>\n <tr>\n <td style=\"padding: 12px; border: 1px solid #cccccc; color: #555;\">Credit Type</td>\n <td style=\"padding: 12px; border: 1px solid #cccccc; color: #111; font-weight: bold;\">Free Play Coins</td>\n </tr>\n <tr style=\"background-color: #fafafa;\">\n <td style=\"padding: 12px; border: 1px solid #cccccc; color: #555;\">Allocation Range</td>\n <td style=\"padding: 12px; border: 1px solid #cccccc; color: #27ae60; font-weight: bold;\">1,000 (Minimum) — 25,000 (Maximum)</td>\n </tr>\n <tr>\n <td style=\"padding: 12px; border: 1px solid #cccccc; color: #555;\">Trigger Mechanism</td>\n <td style=\"padding: 12px; border: 1px solid #cccccc; color: #111;\">Initial launch of the \"Fortune Reels\" game mode.</td>\n </tr>\n </tbody>\n </table>\n\n <h3 style=\"color: #333333; font-size: 18px; text-transform: uppercase; border-left: 3px solid #e67e22; padding-left: 10px;\">3. Algorithmic Integrity</h3>\n <p style=\"font-size: 15px; color: #555555; line-height: 1.7; margin-bottom: 25px;\">\n The initialization credit is governed by a secure Random Number Generation (RNG) script. This guarantees strict neutrality; no account variables influence the drop rate, ensuring every profile experiences an equal mathematical probability of securing the maximum 25K threshold. All deployment protocols have been verified for stability.\n </p>\n\n <!-- Minimalist Footer -->\n <div style=\"background-color: #f9f9f9; border-top: 1px solid #dddddd; padding: 15px; text-align: left;\">\n <p style=\"margin: 0; font-size: 14px; color: #888888;\">\n <strong>Action Required:</strong> None. The update is live. Users may access the new module directly from their primary navigation menu.\n </p>\n </div>\n\n </div>\n</div>\n",
    "ceo_description": "Yono Rummy now game ",
    "read_time": "2 min",
    "seo_keywords": "",
    "canonical_url": "https://www.rummyapp.online/news/yono-rummy-fortune-reels-deployment",
    "author": "Admin",
    "link": "https://www.rummyapp.online/yono-rummy",
    "date": "2026-06-08T16:21:55.959Z",
    "seo_description": "Yono Rummy System Update: Fortune Reels Slot Deployed (1K-25K Bonus)",
    "title": "Yono Rummy",
    "logo_url": "https://1ewg1yyass.ucarecd.net/3ae635cf-5f0f-4dc8-8eaa-21b9fb819bca/-/preview/1000x560/",
    "og_image_url": "https://1ewg1yyass.ucarecd.net/3ae635cf-5f0f-4dc8-8eaa-21b9fb819bca/-/preview/1000x560/",
    "id": "uvh4n2yob"
  }
];

export const saveMockNews = (newsList: NewsItem[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockBlogs: BlogPost[] = [];

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = [
  {
    "youtube_url": "https://youtu.be/0uPeAuXIRdQ?si=aP9WFCyYCHKW2z5F",
    "id": "1",
    "seo_description": "",
    "title": "RummyApp Online ",
    "description": "Looking for the best UI SMOOTH experience rummy ",
    "seo_title": "Rummy ",
    "slug": "",
    "created_at": "2026-05-22T12:22:35.244Z"
  },
  {
    "seo_title": "",
    "id": "73jeeqtsr",
    "seo_keywords": "",
    "youtube_url": "",
    "slug": "",
    "created_at": "2026-05-29T14:26:28.226Z",
    "description": "",
    "title": "",
    "seo_description": ""
  }
];

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
