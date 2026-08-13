const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');

// Create a dummy file if it doesn't exist
if (!fs.existsSync(publicBackupPath)) {
  fs.mkdirSync(path.dirname(publicBackupPath), { recursive: true });
  const dummyData = { apps: [], settings: {}, news: [], blogs: [], videos: [] };
  for(let i=0; i<100000; i++) { // Larger payload
     dummyData.apps.push({id: i, name: 'App ' + i, description: 'Description ' + i});
  }
  fs.writeFileSync(publicBackupPath, JSON.stringify(dummyData), 'utf8');
}

function measureEventLoopLag(callback) {
  const start = performance.now();
  setImmediate(() => {
    const lag = performance.now() - start;
    callback(lag);
  });
}

async function testSync() {
  return new Promise((resolve) => {
    measureEventLoopLag((lag) => {
      resolve(lag);
    });

    // Block the event loop
    try {
      const data = fs.readFileSync(publicBackupPath, 'utf8');
      JSON.parse(data);
    } catch (e) {}
  });
}

async function testAsync() {
  return new Promise(async (resolve) => {
    measureEventLoopLag((lag) => {
      resolve(lag);
    });

    // Don't block the event loop as much
    try {
      const data = await fsPromises.readFile(publicBackupPath, 'utf8');
      JSON.parse(data); // JSON.parse still blocks, but file read doesn't
    } catch (e) {}
  });
}

async function run() {
  console.log("Measuring event loop lag...");

  const ITERATIONS = 10;

  let syncLag = 0;
  for(let i = 0; i < ITERATIONS; i++) {
    syncLag += await testSync();
  }

  let asyncLag = 0;
  for(let i = 0; i < ITERATIONS; i++) {
    asyncLag += await testAsync();
  }

  console.log(`Sync event loop lag avg: ${syncLag / ITERATIONS} ms`);
  console.log(`Async event loop lag avg: ${asyncLag / ITERATIONS} ms`);
}

run();
