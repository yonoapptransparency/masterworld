const fs = require('fs');
const filesToPatch = [
  'src/pages/About.tsx',
  'src/pages/Contact.tsx',
  'src/pages/Disclaimer.tsx',
  'src/pages/Ethics.tsx',
  'src/pages/Privacy.tsx',
  'src/pages/Responsibility.tsx',
  'src/pages/Terms.tsx',
  'src/pages/Notice.tsx',
  'src/pages/NewsPage.tsx',
  'src/components/AppsTab.tsx'
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes("import { safeHtml }")) {
      content = "import { safeHtml } from '../lib/safeHtml';\n" + content;
    }
    
    // For specific files, find dangerouslySetInnerHTML={{ __html: variable }} and wrap it
    content = content.replace(
      /dangerouslySetInnerHTML=\{\{\s*__html\s*:\s*([^}]+)\s*\}\}/g,
      'dangerouslySetInnerHTML={{ __html: safeHtml($1) }}'
    );
    
    fs.writeFileSync(file, content);
  }
});
