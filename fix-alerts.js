const fs = require('fs');
const file = 'src/pages/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import if not exists
if (!content.includes('import { toast } from "../components/Toast"')) {
  content = content.replace(/import React, { useState, useEffect } from 'react';/, 'import React, { useState, useEffect } from \'react\';\nimport { toast } from "../components/Toast";');
}

// Replace alert with toast and map message structure
content = content.replace(/alert\((['"`].*?['"`])\)/g, "toast($1, $1.toLowerCase().includes('failed') || $1.toLowerCase().includes('error') ? 'error' : 'success')");
content = content.replace(/alert\('([^']+)' \+ ([^)]+)\)/g, "toast('$1' + $2, '$1'.toLowerCase().includes('failed') || '$1'.toLowerCase().includes('error') ? 'error' : 'success')");
content = content.replace(/alert\(`([^`]+)`\)/g, "toast(`$1`, `$1`.toLowerCase().includes('failed') || `$1`.toLowerCase().includes('error') ? 'error' : 'success')");
content = content.replace(/alert\(([^)]+\?[^:]+:[^)]+)\)/g, "toast($1, 'success')");

fs.writeFileSync(file, content);
