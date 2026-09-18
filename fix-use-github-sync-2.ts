import fs from 'fs';
let content = fs.readFileSync('src/hooks/useGitHubSync.ts', 'utf8');

const strToFind = "try {\n      log(`GitHub Sync: Building AES Encrypted Vault for ${targetRepo}...`);";
const endToFind = "      await updateLocalContainerBackup(finalApps, targetSettings, targetNews, targetVideos);";

const idx = content.indexOf(strToFind);
const idxEnd = content.indexOf(endToFind);

if (idx !== -1 && idxEnd !== -1) {
  content = content.substring(0, idx) + "    try {\n" + content.substring(idxEnd);
  fs.writeFileSync('src/hooks/useGitHubSync.ts', content);
} else {
  console.log("NOT FOUND", idx, idxEnd);
}
