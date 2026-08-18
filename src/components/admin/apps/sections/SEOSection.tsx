import React from 'react';
import ImageUpload from "../../../ImageUpload";

interface SEOSectionProps {
  formFields: any;
  handleFieldChange: (field: string, value: any) => void;
}

export const SEOSection = ({ formFields, handleFieldChange }: SEOSectionProps) => {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Live Google SERP Simulator Preview</label>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs max-w-full font-sans">
          <div className="text-[12px] text-slate-500 dark:text-slate-400 font-normal truncate flex items-center gap-1">
            <span>https://apk-gatekeeper.com</span>
            <span className="text-slate-400">› {formFields.slug || 'url-slug'}</span>
          </div>
          <div className="text-[18px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer leading-tight truncate mt-0.5">
            {formFields.seo_title || formFields.name || 'Set SEO title below...'}
          </div>
          <p className="text-[13px] text-slate-600 dark:text-slate-400 font-normal leading-normal mt-1 line-clamp-2">
            {formFields.seo_description || 'Write an eye-catching SEO description to maximize organic click-through rate on Google...'}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">SEO Meta Title Tag</label>
        <input 
          type="text" 
          name="seo_title" 
          value={formFields.seo_title} 
          onChange={e => handleFieldChange('seo_title', e.target.value)} 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
          placeholder="e.g. Free VPN Download - Safe APK Gatekeeper"
        />
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">SEO Description Tag</label>
        <textarea 
          name="seo_description" 
          value={formFields.seo_description} 
          onChange={e => handleFieldChange('seo_description', e.target.value)} 
          rows={3} 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
          placeholder="Securely download VPN tool. Rated 4.8/5 on catalog."
        ></textarea>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">SEO Meta Keywords</label>
        <input 
          type="text" 
          name="seo_keywords" 
          value={formFields.seo_keywords} 
          onChange={e => handleFieldChange('seo_keywords', e.target.value)} 
          placeholder="Comma separated: vpn, secure, tools, download" 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Canonical URL</label>
          <input 
            type="url" 
            name="canonical_url" 
            value={formFields.canonical_url} 
            onChange={e => handleFieldChange('canonical_url', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono" 
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Target Audience Region</label>
          <input 
            type="text" 
            name="target_region" 
            value={formFields.target_region} 
            onChange={e => handleFieldChange('target_region', e.target.value)} 
            placeholder="Global" 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">OpenGraph OG Image URL (Social Sharing thumbnail)</label>
        <div className="flex gap-3 items-center">
          <ImageUpload 
            name="og_image_url" 
            value={formFields.og_image_url} 
            onChange={(val) => handleFieldChange('og_image_url', val)} 
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus-within:ring-2 focus-within:ring-blue-500 font-mono overflow-hidden" 
            placeholder="https://..."
          />
          <img 
            src={formFields.og_image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80'} 
            loading="lazy"
            width={64}
            height={40}
            className="w-16 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 shadow-xs shrink-0" 
            alt="og-preview" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80';
            }}
          />
        </div>
      </div>
    </div>
  );
};
