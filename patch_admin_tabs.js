const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'admin', 'AdminTabContent.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace import
content = content.replace(
  "import AdminReviewsTab from './AdminReviewsTab';",
  "import AdminCommunityTab from './AdminCommunityTab';"
);

// Replace case block
content = content.replace(
  "case 'reviews':\n      return <AdminReviewsTab db={db} />;",
  "case 'reviews':\n      return <AdminCommunityTab />;"
);

// If the import replacement failed because it wasn't there exactly:
if (!content.includes('AdminCommunityTab')) {
  // Try finding standard imports
  content = content.replace(
    "import AdminSettingsTab from './AdminSettingsTab';",
    "import AdminSettingsTab from './AdminSettingsTab';\nimport AdminCommunityTab from './AdminCommunityTab';"
  );
  content = content.replace(
    "case 'reviews':\n      return <AdminReviewsTab db={db} />;",
    "case 'reviews':\n      return <AdminCommunityTab />;"
  );
}

fs.writeFileSync(filePath, content);
console.log('Patched AdminTabContent.tsx');
