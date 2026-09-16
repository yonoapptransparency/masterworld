const fs = require('fs');
let md = fs.readFileSync('AGENTS.md', 'utf8');
const splitStr = '## 14. EXCLUSIVE PUBLIC FIREBASE CONNECTION RULE: Community Reviews Only';

if (md.includes(splitStr)) {
  md = md.substring(0, md.indexOf(splitStr));
  md += `## 14. EXCLUSIVE LIVE PUBLIC FIREBASE RULE: Community Reviews & App Flags

> [!CRITICAL]
> **MANDATORY INSTRUCTION:** The **ONLY** Firebase database fully functional and actively connected to the Public Main Website is the **Community Firebase** (used strictly for Reviews, Comments, and App Flags).

- **100% Live Functionality:** The Community Firebase is working live on the public website. When people post reviews, comments, or report flags, they can see the comments directly and instantly.
- **NO GitHub Push Required for Reviews:** Unlike the main app catalog, you **DO NOT** need to use the GitHub Sync or push code from the Admin website to the Public website to show new comments. Reviews and flags are live-fetched in real-time. 
- **Environment Variables:** The Community Firebase uses its own dedicated ENV variables to securely connect the public website to the reviews database without exposing the main catalog database.
- **The Single Exception:** This is the ONLY exception to Rule 12. The main app database (\`store_data\`) remains static and requires a GitHub push for the public site, but the Community database is entirely LIVE and auto-updating.
`;
  fs.writeFileSync('AGENTS.md', md);
  console.log('AGENTS.md updated successfully.');
} else {
  console.log('Could not find the target string in AGENTS.md.');
}
