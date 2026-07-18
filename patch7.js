const fs = require('fs');
const file = 'src/components/AppsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Patch filter clicks
content = content.replace(
    'onClick={() => setFilter(\'all\')}',
    'onClick={() => { setFilter(\'all\'); setSelectedAppId(null); setEditingAppId(null); }}'
);
content = content.replace(
    'onClick={() => setFilter(\'new\')}',
    'onClick={() => { setFilter(\'new\'); setSelectedAppId(null); setEditingAppId(null); }}'
);
content = content.replace(
    'onClick={() => setFilter(\'soon\')}',
    'onClick={() => { setFilter(\'soon\'); setSelectedAppId(null); setEditingAppId(null); }}'
);

fs.writeFileSync(file, content);
console.log("Patched filters");
