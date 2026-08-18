import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ScreenshotsEditorProps {
  initialScreenshots: string[];
  onChange?: (screenshots: string[]) => void;
}

export function ScreenshotsEditor({ initialScreenshots, onChange }: ScreenshotsEditorProps) {
  const [urls, setUrls] = useState<string[]>(initialScreenshots || []);

  useEffect(() => {
    setUrls(initialScreenshots || []);
  }, [initialScreenshots]);

  const updateAndNotify = (newUrls: string[]) => {
    setUrls(newUrls);
    if (onChange) {
      onChange(newUrls);
    }
  };

  const addUrl = () => updateAndNotify([...urls, '']);
  const removeUrl = (index: number) => updateAndNotify(urls.filter((_, i) => i !== index));
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    updateAndNotify(newUrls);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Screenshots Gallery</h3>
      <input type="hidden" name="screenshots_json" value={JSON.stringify(urls.filter(Boolean))} />
      <div className="grid gap-3">
        {urls.map((url, idx) => (
          <div key={idx} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-xs font-mono font-bold text-slate-400 w-6 text-center shrink-0">#{idx + 1}</span>
            <input 
              type="text" 
              value={url} 
              onChange={e => updateUrl(idx, e.target.value)} 
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono" 
              placeholder="e.g. https://images.unsplash.com/photo-... or custom URL" 
            />
            {url && (
              <div className="relative group w-10 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                <img 
                  src={url} 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width={40}
                  height={64}
                  className="w-full h-full object-cover" 
                  alt="preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop';
                  }}
                />
              </div>
            )}
            <button 
              type="button" 
              onClick={() => removeUrl(idx)} 
              className="text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg transition-all border-0 cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button 
        type="button" 
        onClick={addUrl} 
        className="w-full flex items-center justify-center gap-1.5 py-3 bg-blue-50 dark:bg-blue-950/20 border border-dashed border-blue-200 dark:border-blue-900/30 rounded-xl text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-950/40 transition-all font-bold cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add Screenshot URL
      </button>
    </div>
  );
}
export default ScreenshotsEditor;
