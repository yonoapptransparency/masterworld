const fs = require('fs');
const file = 'src/components/AppsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Cancel button to Form Header
const oldFormHeader = '<div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">';
const newFormHeader = '<div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">\n                <button type="button" onClick={() => setEditingAppId(null)} className="lg:hidden mr-3 p-1.5 -ml-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>';

content = content.replace(oldFormHeader, newFormHeader);
fs.writeFileSync(file, content);
console.log("Patched form header");
