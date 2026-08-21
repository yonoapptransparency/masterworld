const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'admin', 'AdminCommunityTab.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  "import { toast } from 'sonner';",
  "import { toast } from '../Toast';"
);

content = content.replace(/toast\.error\(/g, "toast(");
content = content.replace(/toast\.success\(/g, "toast(");

// Fix the arguments for the custom toast (msg, type)
content = content.replace(/toast\('Failed to fetch pending reviews'\)/g, "toast('Failed to fetch pending reviews', 'error')");
content = content.replace(/toast\('Review published successfully!'\)/g, "toast('Review published successfully!', 'success')");
content = content.replace(/toast\('Failed to publish review'\)/g, "toast('Failed to publish review', 'error')");
content = content.replace(/toast\('Error processing request'\)/g, "toast('Error processing request', 'error')");
content = content.replace(/toast\('Review deleted'\)/g, "toast('Review deleted', 'success')");
content = content.replace(/toast\('Failed to delete review'\)/g, "toast('Failed to delete review', 'error')");

fs.writeFileSync(filePath, content);
console.log('Patched toast');
