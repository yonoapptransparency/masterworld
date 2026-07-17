const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace("import PublicChatbot from './components/PublicChatbot';\n", "");
content = content.replace("      <PublicChatbot />\n", "");
fs.writeFileSync('src/App.tsx', content, 'utf-8');
