const fs = require('fs');
const file = 'src/components/AppsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Right Column classes
const oldRightCol = '<div className={`${(editingAppId !== null || selectedAppId) ? \'lg:col-span-12 xl:col-span-12 flex\' : \'lg:col-span-7 xl:col-span-7 hidden lg:flex\'} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl h-[500px] lg:h-[780px] flex-col overflow-hidden shadow-sm`}>';
const newRightCol = '<div className={`${(editingAppId !== null || selectedAppId) ? \'fixed inset-0 z-[100] rounded-none h-[100dvh] w-full flex lg:relative lg:inset-auto lg:z-auto lg:rounded-2xl lg:h-[780px] lg:w-auto lg:col-span-12 xl:col-span-12\' : \'hidden lg:flex lg:h-[780px] lg:col-span-7 xl:col-span-7 rounded-2xl h-[500px]\'} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex-col overflow-hidden shadow-sm`}>';

content = content.replace(oldRightCol, newRightCol);

fs.writeFileSync(file, content);
console.log("Patched full screen");
