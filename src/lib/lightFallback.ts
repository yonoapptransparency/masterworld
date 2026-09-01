import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';

export const mockApps: AppConfig[] = [];
export const mockSettings: GlobalSettings = {
  site_title: "RummyDex",
  meta_description: "Discover, compare, and download verified mobile card games on RummyDex.",
  logo_url: "/logo.png",
  favicon_url: "/favicon.ico",
  helpline_whatsapp: "",
  helpline_telegram: "",
  support_email: "support@rummydex.com",
  disclaimer_text: "",
  ethics_discrimination_text: "",
  ticker_text: "",
  animations_enabled: true,
  categories: ["All", "Rummy", "Teen Patti", "Yono", "Casino", "Slot", "Arcade"],
  banners: []
} as GlobalSettings;
export const mockNews: NewsItem[] = [];
export const mockVideos: VideoItem[] = [];

