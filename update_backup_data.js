const fs = require('fs');
const path = 'src/server/routes/publicApiRoutes.ts';
let code = fs.readFileSync(path, 'utf8');

const backupFullCode = `
publicApiRouter.get(["/api/v1/public/backup-data-full", "/api/v1/backup-data-full"], async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  try {
    const storeData = await fetchStoreData();
    if (storeData && Array.isArray(storeData.apps) && storeData.apps.length > 0) {
      return res.json({
        apps: storeData.apps,
        settings: storeData.settings || {},
        news: storeData.news || [],
        videos: storeData.videos || [],
        reviews: storeData.reviews || []
      });
    }
    
    // Fallback
    const publicBackupPath = require('path').join(process.cwd(), 'src/lib/public_backup.json');
    if (require('fs').existsSync(publicBackupPath)) {
      return res.json(JSON.parse(require('fs').readFileSync(publicBackupPath, 'utf8')));
    }
    
    return res.json(getStaticData());
  } catch (err) {
    return res.json(getStaticData());
  }
});
`;

if (!code.includes('backup-data-full')) {
  code = code.replace(
    /publicApiRouter\.get\(\["\/api\/v1\/public\/backup-data",/g,
    backupFullCode + '\npublicApiRouter.get(["/api/v1/public/backup-data",'
  );
  fs.writeFileSync(path, code);
  console.log("Added /api/v1/public/backup-data-full");
} else {
  console.log("Already exists");
}
