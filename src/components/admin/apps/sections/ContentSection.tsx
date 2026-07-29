import React from 'react';
import { adminFetch } from '../../../../services/adminAuthService';

interface ContentSectionProps {
  formFields: any;
  handleFieldChange: (field: string, value: any) => void;
}

export const ContentSection = ({ formFields, handleFieldChange }: ContentSectionProps) => {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Primary Gateway Access Link (Target URL to secure & encrypt)</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            name="more_information_url" 
            value={formFields.more_information_url} 
            onChange={e => handleFieldChange('more_information_url', e.target.value)} 
            placeholder="https://..." 
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono" 
          />
          {formFields.more_information_url.startsWith('U2FsdGVkX1') && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await adminFetch('/api/v1/admin/decrypt-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', },
                    body: JSON.stringify({ encryptedUrl: formFields.more_information_url })
                  });
                  const data = await res.json();
                  if (data.decrypted) {
                    try {
                        await navigator.clipboard.writeText(data.decrypted);
                        alert('Link copied to clipboard (hidden for security)');
                      } catch (e) {
                        console.log('Failed to copy');
                      }
                  } else {
                    alert('Failed to decrypt URL.');
                  }
                } catch(e) {
                  alert('Error decrypting URL.');
                }
              }}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer border-0"
            >
              Reveal Link
            </button>
          )}
        </div>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">On save, APK-Gatekeeper will securely hash and encrypt this link on the server, keeping backend code completely invisible to client browsers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Key Features HTML List</label>
          <textarea 
            name="features_html" 
            value={formFields.features_html} 
            onChange={e => handleFieldChange('features_html', e.target.value)} 
            rows={6} 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-blue-500"
            placeholder="<li>Secure encryption</li>&#10;<li>Unlimited bandwidth</li>"
          ></textarea>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Custom Extra Box Banner Title</label>
            <input 
              type="text" 
              name="custom_admin_box_heading" 
              value={formFields.custom_admin_box_heading} 
              onChange={e => handleFieldChange('custom_admin_box_heading', e.target.value)} 
              placeholder="e.g. SPECIAL COMPATIBILITY NOTE"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Custom Extra Box HTML Description</label>
            <textarea 
              name="custom_admin_box_html" 
              value={formFields.custom_admin_box_html} 
              onChange={e => handleFieldChange('custom_admin_box_html', e.target.value)} 
              rows={3} 
              placeholder="<p>This VPN might require Google Services framework to operate optimally on newer tablets.</p>"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-400 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Full Description Rich HTML Body</label>
        <textarea 
          name="description_html" 
          value={formFields.description_html} 
          onChange={e => handleFieldChange('description_html', e.target.value)} 
          rows={12} 
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          placeholder="<p>Write standard paragraph HTML here...</p>"
        ></textarea>
      </div>
    </div>
  );
};
