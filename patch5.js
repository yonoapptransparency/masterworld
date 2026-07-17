const fs = require('fs');
const file = 'src/components/AppsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    '                      <button \n                        onClick={() => setSelectedAppId(null)} \n                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-0 cursor-pointer"\n                      >',
    '                      <button \n                        type="button"\n                        onClick={() => setSelectedAppId(null)} \n                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-0 cursor-pointer"\n                      >'
);

fs.writeFileSync(file, content);
console.log("Patched button type");
