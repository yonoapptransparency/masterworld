const fs = require('fs');
let code = fs.readFileSync('src/components/AppsTab.tsx', 'utf8');

const target = `<button 
                  type="button"
                  onClick={() => setEditingAppId(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-0 cursor-pointer"
                >
                  Cancel
                </button>`;

const replacement = `<div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setEditingAppId(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer border-0"
                  >
                    {saving ? 'Saving...' : <><Save className="w-3.5 h-3.5"/> Save App</>}
                  </button>
                </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/AppsTab.tsx', code);
  console.log('Successfully added save button to header');
} else {
  console.log('Target not found in AppsTab.tsx');
}
