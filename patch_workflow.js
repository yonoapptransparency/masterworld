const fs = require('fs');
let code = fs.readFileSync('.github/workflows/split-sync.yml', 'utf8');

if (!code.includes('"src/AppAdmin.tsx"')) {
  code = code.replace(
    /"src\/pages\/AdminDashboard\.tsx"/,
    '"src/AppAdmin.tsx"\n            "src/contexts/DataContext.tsx"\n            "src/types.ts"\n            "src/pages/AdminDashboard.tsx"'
  );
  fs.writeFileSync('.github/workflows/split-sync.yml', code);
  console.log("Updated workflow with AppAdmin.tsx, DataContext.tsx, and types.ts");
}
