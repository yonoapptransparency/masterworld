const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

const separatorRegex = /<div className="relative py-2">\s*<div className="absolute inset-0 flex items-center">\s*<div className="w-full border-t border-zinc-100 dark:border-zinc-800" \/>\s*<\/div>\s*<div className="relative flex justify-center text-\[10px\] uppercase">\s*<span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400 dark:text-zinc-500 font-bold tracking-widest">Administrative Directory<\/span>\s*<\/div>\s*<\/div>/g;

code = code.replace(separatorRegex, '');
fs.writeFileSync('src/components/AdminLogin.tsx', code);
console.log('patched2');
