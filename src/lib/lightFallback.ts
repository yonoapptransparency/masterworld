import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../typesPublic';

export const mockSettings: GlobalSettings = {
  site_title: "RummyDex",
  meta_description: "Your trusted bridge to the best mobile card games. Explore RummyDex for hands-on reviews, real-time news, and complete app knowledge",
  logo_url: "https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png",
  favicon_url: "https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png",
  helpline_whatsapp: "",
  helpline_telegram: "",
  support_email: "support@rummydex.com",
  disclaimer_text: "",
  ethics_discrimination_text: "",
  ticker_text: "",
  animations_enabled: true,
  categories: [
    "Yono Apps",
    "Card Apps",
    "Entertainment"
  ],
  banners: [],
  quick_links: [],
  website_faqs: []
};

export const mockApps: AppConfig[] = [];
export const mockNews: NewsItem[] = [];
export const mockVideos: VideoItem[] = [];

/**
 * On-demand async loader for the complete offline dataset.
 * This completely isolates the 1MB static dataset from the critical mobile JS bundle,
 * guaranteeing zero bundle bloat while preserving 100% offline fallback capabilities.
 */
export async function loadFullStaticDataset(): Promise<{
  apps: AppConfig[];
  settings: GlobalSettings;
  news: NewsItem[];
  videos: VideoItem[];
}> {
  try {
    const mod = await import('./staticData');
    return {
      apps: mod.mockApps || [],
      settings: mod.mockSettings || mockSettings,
      news: mod.mockNews || [],
      videos: mod.mockVideos || []
    };
  } catch (e) {
    return {
      apps: [],
      settings: mockSettings,
      news: [],
      videos: []
    };
  }
}
