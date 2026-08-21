const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'admin', 'AdminTabContent.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  "import { AdminReviewsTab } from './AdminReviewsTab';",
  "import AdminCommunityTab from './AdminCommunityTab';"
);

fs.writeFileSync(filePath, content);
console.log('Patched imports in AdminTabContent.tsx');
