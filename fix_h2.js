const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const replacement = `      <PlayStoreTabs activeTab={activeTab} onTabChange={setActiveTab} hideOnSearch={!!searchTerm} />

      {activeTab.toLowerCase() !== 'categories' && (
        <div className={\`px-4 mb-4 mt-2 flex flex-wrap items-center gap-4 \${(!searchTerm && (activeTab.toLowerCase() === 'all apps' || activeTab.toLowerCase() === 'all' || activeTab.toLowerCase() === 'home' || activeTab.toLowerCase() === 'apps')) ? 'justify-end' : 'justify-between'}\`}>
          {(!(!searchTerm && (activeTab.toLowerCase() === 'all apps' || activeTab.toLowerCase() === 'all' || activeTab.toLowerCase() === 'home' || activeTab.toLowerCase() === 'apps'))) && (
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 m-0">
              {searchTerm ? 'Search Results' : 
               activeTab.toLowerCase() === 'top charts' ? 'Top Charts' : 
               activeTab}
            </h2>
          )}
          <div className="flex items-center gap-3 flex-wrap">`;

const regex = /<PlayStoreTabs[\s\S]*?<div className="flex items-center gap-3 flex-wrap">/;
content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/Home.tsx', content);
