import React from 'react';
import { Save } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { ensureDefaultSettings } from '../../lib/defaultLegalContent';

interface AdminSettingsTabProps {
  settings: any;
  handleSaveSettings: (e: React.FormEvent) => void;
  saving: boolean;
}

export const AdminSettingsTab = React.memo(({ settings: rawSettings, handleSaveSettings, saving }: AdminSettingsTabProps) => {
  const settings = ensureDefaultSettings(rawSettings || {});
  return (
  <div className="animate-fade-in space-y-8">
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
      <div>
        <h2 className="text-xl font-bold dark:text-white">Global Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage global identity, content, and legal text.</p>
      </div>
    </div>
    <form key={settings.last_updated || (settings.privacy_content ? 'loaded' : 'unloaded') || settings.site_title || 'settings-form'} onSubmit={handleSaveSettings} className="space-y-8">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">Branding & Identity</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Site Title</label>
            <input type="text" name="site_title" defaultValue={settings.site_title} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Global SEO Title (Overrides Site Title in SERP)</label>
            <input type="text" name="seo_title" defaultValue={settings.seo_title} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Global SEO Description</label>
            <input type="text" name="meta_description" defaultValue={settings.meta_description} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Global SEO Keywords (Comma Separated)</label>
            <input type="text" name="seo_keywords" defaultValue={settings.seo_keywords} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Google Analytics ID</label>
            <input type="text" name="ga_tracking_id" defaultValue={settings.ga_tracking_id || settings.google_analytics_id} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="G-XXXXXXXXXX" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                Main Logo URL (Website Header & Footer)
              </label>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <p><strong>Recommended Size:</strong> <span className="text-blue-600 dark:text-blue-400 font-semibold">512 × 512 px</span> (Square) or <span className="text-blue-600 dark:text-blue-400 font-semibold">800 × 250 px</span> (Horizontal)</p>
                <p><strong>Format:</strong> PNG with Transparent Background (&lt; 150 KB)</p>
                <p><strong>Where it is used:</strong> Main website Header Navigation bar, Footer brand logo, Social Media Open Graph (OG) shares.</p>
              </div>
              <ImageUpload name="logo_url" format="png" defaultValue={settings.logo_url} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                Favicon URL (Google Search, Browser Tabs & Mobile Icons)
              </label>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <p><strong>Recommended Size:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-semibold">256 × 256 px</span> or <span className="text-emerald-600 dark:text-emerald-400 font-semibold">512 × 512 px</span> (Square)</p>
                <p><strong>Format:</strong> PNG with Transparent Background (&lt; 50 KB)</p>
                <p><strong>Where it is used:</strong> Google Search snippet icon, Browser Tab Favicon, Android Chrome Home Screen shortcuts, Apple Safari bookmarks.</p>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10.5px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span><strong>Automatic Optimization Active:</strong> Our server automatically resizes your 256/512px upload into 16x16, 32x32, and 192x192 byte-sized files on demand. Zero bandwidth is wasted!</span>
                </div>
              </div>
              <ImageUpload name="favicon_url" format="png" defaultValue={settings.favicon_url} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Main Index Heading</label>
            <input type="text" name="secure_index_title" defaultValue={settings.secure_index_title ?? ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Main Index Subtitle</label>
            <input type="text" name="secure_index_subtitle" defaultValue={settings.secure_index_subtitle ?? ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Trending Searches (Comma Separated)</label>
            <input type="text" name="trending_searches" defaultValue={settings.trending_searches ? (Array.isArray(settings.trending_searches) ? settings.trending_searches.join(', ') : settings.trending_searches) : ''} placeholder="e.g. Action Games, Casual Apps, Tools" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">Legal Content</h3>
        <div className="grid gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">About Us Page Content (HTML)</label>
            <textarea name="about_content" rows={12} defaultValue={settings.about_content} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono dark:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Privacy Policy Body (HTML)</label>
            <textarea name="privacy_content" rows={12} defaultValue={settings.privacy_content} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono dark:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Terms & Conditions Body (HTML)</label>
            <textarea name="terms_content" rows={12} defaultValue={settings.terms_content} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono dark:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Platform Responsibility Clause (HTML)</label>
            <textarea name="responsibility_content" rows={12} defaultValue={settings.responsibility_content} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono dark:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="<p>Our commitment to user safety...</p>"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Report & Removal Policy Body (HTML)</label>
            <textarea name="report_removal_content" rows={12} defaultValue={settings.report_removal_content} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono dark:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="<h2>1. Overview</h2>..."></textarea>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">App Store & Disclaimers</h3>
        <div className="grid gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Portal Main Heading</label>
            <input type="text" name="portal_heading" defaultValue={settings.portal_heading} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Disclaimer Heading</label>
              <input type="text" name="disclaimer_heading" defaultValue={settings.disclaimer_heading} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ethics Heading</label>
              <input type="text" name="ethics_heading" defaultValue={settings.ethics_heading} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Disclaimer Text (HTML supported)</label>
            <textarea name="disclaimer_text" rows={3} defaultValue={settings.disclaimer_text} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ethics Text (HTML supported)</label>
            <textarea name="ethics_discrimination_text" rows={3} defaultValue={settings.ethics_discrimination_text} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Important Notice Heading (More Details Page)</label>
            <input type="text" name="important_notice_heading" defaultValue={settings.important_notice_heading} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Important Notice Content</label>
            <textarea name="important_notice" rows={2} defaultValue={settings.important_notice} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">Custom Website Title Banner</h3>
        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Enable Title Banner</label>
              <select name="hero_title_visible" defaultValue={settings.hero_title_visible !== false ? 'true' : 'false'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="true">Show Hero Banner</option>
                <option value="false">Hide Hero Banner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Banner Writing Style (Font Concept)</label>
              <select name="hero_title_style" defaultValue={settings.hero_title_style || 'modern'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="modern">Modern Display (Space Grotesk - Extra Black)</option>
                <option value="serif">Elegant Editorial (Playfair - High Contrast)</option>
                <option value="mono">Cyber Industrial (JetBrains Mono - Tech Accent)</option>
                <option value="elegant">Neo-Minimal (Inter - Balanced Sans-Serif)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Gradient Color Palette</label>
              <select name="hero_title_color" defaultValue={settings.hero_title_color || 'classic-dark'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="classic-dark">Classic High-Contrast</option>
                <option value="emerald-indigo">Emerald To Indigo</option>
                <option value="neon-sky">Neon Sky</option>
                <option value="sunset-fire">Sunset Fire</option>
                <option value="cosmic-purple">Nebula Pink</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Animation Design</label>
              <select name="hero_title_animation" defaultValue={settings.hero_title_animation || 'fade-in'} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="fade-in">Fade In (Smooth Dissolve)</option>
                <option value="slide-up" className="dark:bg-zinc-900">Slide Up (Sleek Bottom-Up Gliding)</option>
                <option value="bounce-in" className="dark:bg-zinc-900">Bounce Zoom (Snapping Elastic Expansion)</option>
                <option value="zoom-out" className="dark:bg-zinc-900">Cinematic Zoom Out (Slow Depth Entrance)</option>
                <option value="glow-pulse" className="dark:bg-zinc-900">Pulse Glow (Ethereal Periodic Illumination)</option>
                <option value="none" className="dark:bg-zinc-900">No Animation (Static Plain Render)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Hero Banner Writing Text (Title)</label>
            <input type="text" name="hero_title_text" defaultValue={settings.hero_title_text ?? ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Hero Tagline / Subtitle</label>
            <input type="text" name="hero_title_subtitle" defaultValue={settings.hero_title_subtitle ?? ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">Support & Ticker</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Announcement Ticker Text</label>
            <input type="text" name="ticker_text" defaultValue={settings.ticker_text} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Support Email</label>
            <input type="email" name="support_email" defaultValue={settings.support_email} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Telegram Link</label>
            <input type="text" name="helpline_telegram" defaultValue={settings.helpline_telegram} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">WhatsApp Link</label>
            <input type="text" name="helpline_whatsapp" defaultValue={settings.helpline_whatsapp} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">Social Media Links</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Facebook URL</label>
            <input type="text" name="social_facebook" defaultValue={settings.social_links?.facebook} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Instagram URL</label>
            <input type="text" name="social_instagram" defaultValue={settings.social_links?.instagram} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Twitter / X URL</label>
            <input type="text" name="social_twitter" defaultValue={settings.social_links?.twitter} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">LinkedIn URL</label>
            <input type="text" name="social_linkedin" defaultValue={settings.social_links?.linkedin} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">YouTube URL</label>
            <input type="text" name="social_youtube" defaultValue={settings.social_links?.youtube} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
          {saving ? 'Saving...' : <><Save className="w-5 h-5"/> Save Settings</>}
        </button>
      </div>
    </form>
  </div>
  );
});

AdminSettingsTab.displayName = 'AdminSettingsTab';

export default AdminSettingsTab;
