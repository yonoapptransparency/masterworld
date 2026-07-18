const fs = require('fs');
const file = 'src/components/AppsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /<div className="bg-slate-50 dark:bg-slate-900 border border-slate-200\/40 dark:border-slate-800\/80 p-3\.5 rounded-xl flex items-center justify-between">\s*<span>Description:<\/span>\s*<span className="bg-slate-200 dark:bg-slate-800 px-2 py-0\.5 rounded font-mono font-bold text-slate-500">\s*\{selectedApp\.description_html\?\.length \|\| 0\} chars\s*<\/span>\s*<\/div>/g,
    `<button type="button" onClick={() => { setEditingAppId(selectedApp.id); setActiveFormTab('content'); }} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left w-full">
                          <span>Description:</span>
                          <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-500">
                            {selectedApp.description_html?.length || 0} chars
                          </span>
                        </button>`
);

content = content.replace(
    /<div className="bg-slate-50 dark:bg-slate-900 border border-slate-200\/40 dark:border-slate-800\/80 p-3\.5 rounded-xl flex items-center justify-between">\s*<span>Features List:<\/span>\s*<span className="bg-slate-200 dark:bg-slate-800 px-2 py-0\.5 rounded font-mono font-bold text-slate-500">\s*\{selectedApp\.features_html\?\.length \|\| 0\} chars\s*<\/span>\s*<\/div>/g,
    `<button type="button" onClick={() => { setEditingAppId(selectedApp.id); setActiveFormTab('content'); }} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left w-full">
                          <span>Features List:</span>
                          <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-500">
                            {selectedApp.features_html?.length || 0} chars
                          </span>
                        </button>`
);

fs.writeFileSync(file, content);
console.log("Patched using regex");
