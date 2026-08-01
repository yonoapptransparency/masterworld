import express from 'express';

const app = express();
const port = 3000;

app.get('/store_data/:doc', (req, res) => {
  const doc = req.params.doc;
  const delay = doc === 'sec_links_vault_3' ? 300 : doc === 'secure_links' ? 100 : 200;

  setTimeout(() => {
    if (doc === 'sec_vault') {
       res.json({ fields: { encryptedData: { stringValue: 'mock' } } });
    } else {
       res.json({ error: 'not found' }); // Or simulate failure
    }
  }, delay);
});

const server = app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  runBenchmark();
});

async function runBenchmark() {
  const dbUrl = `http://localhost:${port}`;

  async function sequential() {
    let existingItems = null;
    for (const docName of ['sec_links_vault_3', 'secure_links', 'sec_vault']) {
      try {
        const r = await fetch(`${dbUrl}/store_data/${docName}`);
        const d = await r.json() as any;
        if (d && !d.error && d.fields?.encryptedData?.stringValue) {
          existingItems = d.fields.encryptedData.stringValue;
          break;
        }
      } catch (e) {}
    }
    return existingItems;
  }

  async function parallel() {
    let existingItems = null;
    const docNames = ['sec_links_vault_3', 'secure_links', 'sec_vault'];
    const fetchPromises = docNames.map(docName =>
      fetch(`${dbUrl}/store_data/${docName}`)
        .then(r => r.json())
        .catch(() => null)
    );

    const results = await Promise.all(fetchPromises);
    for (let i = 0; i < docNames.length; i++) {
      const d = results[i] as any;
      if (d && !d.error && d.fields?.encryptedData?.stringValue) {
        existingItems = d.fields.encryptedData.stringValue;
        break;
      }
    }
    return existingItems;
  }

  const startSeq = Date.now();
  await sequential();
  const timeSeq = Date.now() - startSeq;
  console.log(`Sequential took ${timeSeq}ms`);

  const startPar = Date.now();
  await parallel();
  const timePar = Date.now() - startPar;
  console.log(`Parallel took ${timePar}ms`);

  server.close();
  process.exit(0);
}
