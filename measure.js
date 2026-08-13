const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');

// Create a dummy file if it doesn't exist
if (!fs.existsSync(publicBackupPath)) {
  fs.mkdirSync(path.dirname(publicBackupPath), { recursive: true });
  const dummyData = { apps: [], settings: {}, news: [], blogs: [], videos: [] };
  // Make the file a bit larger to simulate a real backup
  for(let i=0; i<10000; i++) {
     dummyData.apps.push({id: i, name: 'App ' + i, description: 'Description ' + i});
  }
  fs.writeFileSync(publicBackupPath, JSON.stringify(dummyData), 'utf8');
}

async function measureSync() {
  const start = performance.now();
  let existingBackup;
  try {
    existingBackup = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
  } catch (e) {}
  const end = performance.now();
  return end - start;
}

async function measureAsync() {
  const start = performance.now();
  let existingBackup;
  try {
    const data = await fsPromises.readFile(publicBackupPath, 'utf8');
    existingBackup = JSON.parse(data);
  } catch (e) {}
  const end = performance.now();
  return end - start;
}

async function run() {
  console.log("Measuring...");

  let syncTime = 0;
  let asyncTime = 0;

  // Warmup
  await measureSync();
  await measureAsync();

  const ITERATIONS = 100;

  for(let i = 0; i < ITERATIONS; i++) {
    syncTime += await measureSync();
  }

  for(let i = 0; i < ITERATIONS; i++) {
    asyncTime += await measureAsync();
  }

  console.log(`Sync time avg: ${syncTime / ITERATIONS} ms`);
  console.log(`Async time avg: ${asyncTime / ITERATIONS} ms`);
}

run();
