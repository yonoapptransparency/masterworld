const fs = require('fs');
let file = fs.readFileSync('src/components/admin/AdminAIReviewStudioTab.tsx', 'utf8');

// 1. Change initial state of mode
file = file.replace(
  "const [mode, setMode] = useState<'autopilot' | 'single' | 'bulk'>('autopilot');",
  "const [mode, setMode] = useState<'autopilot' | 'brain1' | 'brain2' | 'bulk'>('autopilot');"
);

// 2. Change the tab switchers
const tabsRegex = /\{\/\* Mode Switcher Tabs \*\/\}[\s\S]*?(?=<div className="grid)/;
const newTabs = `          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 backdrop-blur-sm self-stretch md:self-auto gap-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('autopilot')}
              className={\`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer \${
                mode === 'autopilot'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-1 ring-blue-400/50'
                  : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              <Bot size={16} className="text-amber-400" />
              <span>🚀 Auto-Pilot</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('brain1'); setAiGenerationMode('local'); }}
              className={\`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer \${
                mode === 'brain1'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              <Cpu size={16} />
              <span>Brain 1: Deep Dossier</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('brain2'); setAiGenerationMode('research'); }}
              className={\`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer \${
                mode === 'brain2'
                  ? 'bg-purple-600 text-white shadow-md ring-1 ring-purple-400/50'
                  : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              <Globe size={16} className={mode === 'brain2' ? 'text-amber-400' : ''} />
              <span>Brain 2: Web Research</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('bulk')}
              className={\`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer \${
                mode === 'bulk'
                  ? 'bg-slate-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              <Terminal size={16} />
              <span>Bulk Engine</span>
            </button>
          </div>
`;
file = file.replace(tabsRegex, newTabs);

// 3. Fix the conditional rendering
file = file.replace(
  "mode === 'single' ? (",
  "(mode === 'brain1' || mode === 'brain2') ? ("
);

// 4. Remove the old AI Brain Engine selector from within Single App Studio
const oldSelectorRegex = /<div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">[\s\S]*?<span>Brain 2: Live Web Research<\/span>[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>/;
file = file.replace(oldSelectorRegex, '');

// 5. Change the titles dynamically based on mode
file = file.replace(
  /<span>Single App Studio<\/span>/g,
  "{mode === 'brain1' ? <span>Brain 1: Deep Dossier Studio</span> : <span>Brain 2: Live Web Research Studio</span>}"
);

file = file.replace(
  /Single App Studio Controls/g,
  "{mode === 'brain1' ? 'Brain 1 Parameter Controls' : 'Brain 2 Search Controls'}"
);

file = file.replace(
  /Brain 1: Deep Dossier Deep Reasoning Engine/g,
  "Brain 1: Deep Dossier Deep Reasoning Engine" // just making sure it's valid if there's any
);

fs.writeFileSync('src/components/admin/AdminAIReviewStudioTab.tsx', file);
console.log("Updated AdminAIReviewStudioTab UI");
