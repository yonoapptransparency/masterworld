import React from 'react';
import ImageUpload from "../../../ImageUpload";

interface GeneralSectionProps {
  formFields: any;
  handleFieldChange: (field: string, value: any) => void;
  categories: string[];
}

export const GeneralSection = ({ formFields, handleFieldChange, categories }: GeneralSectionProps) => {
  return (
    <div className="animate-fade-in space-y-5">
      {/* Public Website Sync Switch */}
      <div className={`p-4 rounded-xl border transition-all ${formFields.sync_to_public !== false ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50 shadow-xs' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50 shadow-xs'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${formFields.sync_to_public !== false ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {formFields.sync_to_public !== false ? 'Sync to Public Website (Published)' : 'Admin Only / Unsynced (Draft)'}
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                formFields.sync_to_public !== false 
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}>
                {formFields.sync_to_public !== false ? 'Active' : 'Admin Only'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {formFields.sync_to_public !== false
                ? 'When enabled, this app will be pushed to the public website when synchronized, and included in public catalog, sitemaps, and prerendered SEO pages.'
                : 'When turned off, this app and all its details stay strictly inside the Admin Panel. It will NOT be sent to the public website when pushing code by sync.'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
            <input 
              type="checkbox" 
              name="sync_to_public" 
              checked={formFields.sync_to_public !== false} 
              onChange={e => handleFieldChange('sync_to_public', e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">App Name *</label>
          <input 
            type="text" 
            name="name" 
            required
            value={formFields.name} 
            onChange={e => handleFieldChange('name', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
            placeholder="e.g., Turbo VPN"
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Slug (Auto-generated if empty)</label>
          <input 
            type="text" 
            name="slug" 
            value={formFields.slug} 
            onChange={e => handleFieldChange('slug', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
            placeholder="e.g. turbo-vpn"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">App Icon URL</label>
          <div className="flex gap-3 items-center">
            <ImageUpload 
              name="icon_url" 
              value={formFields.icon_url} 
              onChange={(val) => handleFieldChange('icon_url', val)} 
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus-within:ring-2 focus-within:ring-blue-500 font-mono overflow-hidden" 
              placeholder="https://..."
            />
            <img 
              src={formFields.icon_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop'} 
              loading="lazy"
              width={40}
              height={40}
              className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 shadow-xs shrink-0" 
              alt="preview" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop';
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">YouTube Video URL (Optional)</label>
          <input 
            type="text" 
            name="video_url" 
            value={formFields.video_url || ''} 
            onChange={e => handleFieldChange('video_url', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono" 
            placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <div className="bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200/60 dark:border-blue-800/50">
          <label className="block text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Download / Target Destination URL (External APK / Store Link)</label>
          <input 
            type="text" 
            name="more_information_url" 
            value={formFields.more_information_url || ''} 
            onChange={e => handleFieldChange('more_information_url', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono" 
            placeholder="e.g. https://drive.google.com/file/d/... or https://t.me/..."
          />
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
            This is the secure destination URL that users will be redirected to after completing security clearance. Must be a valid external website or cloud storage link (e.g. Google Drive, Telegram, S3, or direct APK URL).
          </p>
        </div>
      </div>

      <div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/50">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Assign Categories</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories?.map((cat: string) => (
            <label key={cat} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <input 
                type="checkbox" 
                name="category_list" 
                value={cat} 
                onChange={(e) => {
                  const checked = e.target.checked;
                  const list = [...formFields.category_list];
                  if (checked) {
                    if (!list.includes(cat)) list.push(cat);
                  } else {
                    const idx = list.indexOf(cat);
                    if (idx > -1) list.splice(idx, 1);
                  }
                  handleFieldChange('category_list', list);
                }}
                checked={formFields.category_list.includes(cat)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
            </label>
          ))}
        </div>
        <div className="mt-3.5">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Custom Extra Categories (Comma separated)</label>
          <input 
            type="text" 
            name="custom_category" 
            placeholder="e.g. Security, Free, Premium" 
            value={formFields.custom_category}
            onChange={e => handleFieldChange('custom_category', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">App Status *</label>
          <select 
            name="safety_status" 
            value={formFields.safety_status} 
            onChange={e => handleFieldChange('safety_status', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Verified">🟢 Verified (Green)</option>
            <option value="Caution">🟡 Caution (Yellow)</option>
            <option value="Unsafe">🔴 Unsafe (Red)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Sort Order # *</label>
          <input 
            type="number" 
            name="serial_number" 
            required
            value={formFields.serial_number} 
            onChange={e => handleFieldChange('serial_number', parseInt(e.target.value) || 0)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Rating (Out of 5) *</label>
          <input 
            type="number" 
            step="0.1" 
            min="1.0" 
            max="5.0" 
            name="rating" 
            required
            value={formFields.rating} 
            onChange={e => handleFieldChange('rating', parseFloat(e.target.value) || 4.8)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Total Ratings / Review Count</label>
          <input 
            type="number" 
            min="1"
            name="review_count" 
            placeholder="e.g. 381, 1420"
            value={formFields.review_count || ''} 
            onChange={e => handleFieldChange('review_count', e.target.value ? parseInt(e.target.value, 10) : '')} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Version *</label>
          <input 
            type="text" 
            name="version" 
            required
            value={formFields.version} 
            onChange={e => handleFieldChange('version', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
            placeholder="e.g. 2.4.1"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">File Size *</label>
          <input 
            type="text" 
            name="file_size" 
            required
            value={formFields.file_size} 
            onChange={e => handleFieldChange('file_size', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
            placeholder="e.g. 28.4 MB"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Developer *</label>
          <input 
            type="text" 
            name="developer" 
            required
            value={formFields.developer} 
            onChange={e => handleFieldChange('developer', e.target.value)} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-xs">New Release Badge</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Show glowing NEW tag on app icon.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                name="is_new" 
                checked={formFields.is_new} 
                onChange={e => handleFieldChange('is_new', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-xs">Coming Soon Status</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Prevent gateway triggers on frontend.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                name="is_coming_soon" 
                checked={formFields.is_coming_soon} 
                onChange={e => handleFieldChange('is_coming_soon', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50/20 dark:bg-indigo-950/5 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
        <label className="block text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-1">Publish Launch Timer (Local Time)</label>
        <input 
          type="datetime-local" 
          name="publish_date" 
          value={formFields.publish_date} 
          onChange={e => handleFieldChange('publish_date', e.target.value)} 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
        />
        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">If set, app remains locked until this time reaches.</p>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Release Notes (What's New text format)</label>
        <textarea 
          name="release_notes" 
          value={formFields.release_notes} 
          onChange={e => handleFieldChange('release_notes', e.target.value)} 
          rows={3} 
          placeholder="* Fixed security bypass issue&#10;* Improved memory allocation efficiency" 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
        ></textarea>
      </div>
    </div>
  );
};
