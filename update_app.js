const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add imports
if (!content.includes('import StarRatingFeedback')) {
    content = content.replace("import PublicChatbot from './components/PublicChatbot';", "import PublicChatbot from './components/PublicChatbot';\nimport StarRatingFeedback from './components/StarRatingFeedback';\nimport LanguageSelector from './components/LanguageSelector';");
}

// Add StarRatingFeedback
if (!content.includes('<StarRatingFeedback />')) {
    content = content.replace("<PublicChatbot />", "<PublicChatbot />\n      <StarRatingFeedback />");
}

// Add LanguageSelector to Header next to GlobalSearch
if (!content.includes('<LanguageSelector />')) {
    content = content.replace("<GlobalSearch />", "<GlobalSearch />\n          <LanguageSelector />");
}

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log("Updated App.tsx");
