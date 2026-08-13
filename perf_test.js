const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

const backupPath = path.join(process.cwd(), '.local/secure_links_backup.json');
fs.mkdirSync(path.dirname(backupPath), { recursive: true });
// create a moderately large file (20MB) to make blocking obvious
fs.writeFileSync(backupPath, JSON.stringify({ test: "data".repeat(4000000) }, null, 2));

app.get('/sync', (req, res) => {
  if (fs.existsSync(backupPath)) {
      try {
        const existingBackup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      } catch(e) {}
    }
  res.send('ok');
});

app.get('/async', async (req, res) => {
  try {
      await fs.promises.access(backupPath);
      const existingBackup = JSON.parse(await fs.promises.readFile(backupPath, 'utf8'));
  } catch(e) {}
  res.send('ok');
});

app.get('/ping', (req, res) => res.send('pong'));

const server = app.listen(0, async () => {
    const port = server.address().port;

    async function runTest(type) {
        console.log(`\nMeasuring ${type} Blocking...`);
        let start = performance.now();
        let pings = 0;
        let pingerActive = true;

        async function pinger() {
            while(pingerActive) {
                try {
                    await fetch(`http://localhost:${port}/ping`);
                    pings++;
                } catch(e) {}
                await new Promise(r => setTimeout(r, 10));
            }
        }

        pinger();

        const reqs = [];
        for(let i=0; i<5; i++) {
            reqs.push(fetch(`http://localhost:${port}/${type}`));
        }
        await Promise.all(reqs);
        let end = performance.now();
        pingerActive = false;

        console.log(`${type} test took ${end - start} ms, processed ${pings} pings concurrently.`);
        return { time: end-start, pings };
    }

    const syncRes = await runTest('sync');
    const asyncRes = await runTest('async');

    console.log(`\n--- RESULTS ---`);
    console.log(`Sync mode blocked the event loop. Pings processed: ${syncRes.pings}`);
    console.log(`Async mode freed the event loop. Pings processed: ${asyncRes.pings}`);
    console.log(`Pings processed increased by: ${asyncRes.pings - syncRes.pings} (${((asyncRes.pings - syncRes.pings) / syncRes.pings * 100).toFixed(2)}%)`);

    server.close();
});
