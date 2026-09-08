const fs = require('fs');
let code = fs.readFileSync('src/server/services/communityStoreService.ts', 'utf8');
const target = `  private saveToDiskAndQueueCloudSync() {
    try {
      let existingData: any = {};`;
const replacement = `  private saveToDiskAndQueueCloudSync() {
    // PUBLIC SITE SAFEGUARD: Never run bulk syncs or local overwrites from public
    const fs = require('fs');
    const path = require('path');
    const isPublicSite = !fs.existsSync(path.join(process.cwd(), 'src/pages/AdminDashboard.tsx'));
    if (isPublicSite) return;

    try {
      let existingData: any = {};`;
code = code.replace(target, replacement);
fs.writeFileSync('src/server/services/communityStoreService.ts', code);
