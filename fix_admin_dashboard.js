const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

if (!code.includes("import BlogsTab")) {
  code = code.replace("import AppsTab from '../components/AppsTab';", "import AppsTab from '../components/AppsTab';\nimport BlogsTab from '../components/BlogsTab';");
}

const startMarker = 'const BlogsTab = React.memo(({ blogs, handleAddBlog, handleDeleteBlog, handleBlogChange, handleSaveBlogs, saving }: any) => {';
const startIndex = code.indexOf(startMarker);
if (startIndex !== -1) {
  const endMarker = 'const VideosTab = React.memo(({ videosList';
  const endIndex = code.indexOf(endMarker);
  
  if (endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
    console.log("Inline BlogsTab removed and external BlogsTab imported");
  } else {
    console.log("Could not find end of BlogsTab");
  }
} else {
  console.log("Inline BlogsTab not found");
}

