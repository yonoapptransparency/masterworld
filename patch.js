const fs = require('fs');
const file = 'src/components/AppsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    '        <div className={`lg:col-span-5 xl:col-span-5 ${(editingAppId !== null || selectedAppId) ? \'hidden lg:flex\' : \'flex\'} bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 h-[500px] lg:h-[780px] flex-col justify-between`}>',
    '        <div className={`lg:col-span-5 xl:col-span-5 ${(editingAppId !== null || selectedAppId) ? \'hidden\' : \'flex\'} bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 h-[500px] lg:h-[780px] flex-col justify-between`}>'
);

content = content.replace(
    '        <div className={`lg:col-span-7 xl:col-span-7 ${(editingAppId !== null || selectedAppId) ? \'flex\' : \'hidden lg:flex\'} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl h-[500px] lg:h-[780px] flex-col overflow-hidden shadow-sm`}>',
    '        <div className={`${(editingAppId !== null || selectedAppId) ? \'lg:col-span-12 xl:col-span-12 flex\' : \'lg:col-span-7 xl:col-span-7 hidden lg:flex\'} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl h-[500px] lg:h-[780px] flex-col overflow-hidden shadow-sm`}>'
);

content = content.replace(
    '                      <button \n                        onClick={() => setSelectedAppId(null)} \n                        className="lg:hidden flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-0 cursor-pointer"\n                      >',
    '                      <button \n                        onClick={() => setSelectedAppId(null)} \n                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-0 cursor-pointer"\n                      >'
);

content = content.replace(
    '                  <LayoutDashboard className="w-14 h-14 text-slate-300 dark:text-slate-700 animate-pulse mb-3" />\n                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Catalog is Empty</h3>\n                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">\n                    Click the "New App" button in the upper corner to construct your very first app configuration.\n                  </p>',
    '                  <LayoutDashboard className="w-14 h-14 text-slate-300 dark:text-slate-700 animate-pulse mb-3" />\n                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Select an App</h3>\n                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">\n                    Select an application from the list to view its details or edit configuration.\n                  </p>'
);

fs.writeFileSync(file, content);
console.log("Patched successfully");
