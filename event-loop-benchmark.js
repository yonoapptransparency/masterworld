const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');

const app = express();
const file = path.join(process.cwd(), 'package-lock.json');

app.get('/sync', (req, res) => {
  let data;
  if (fs.existsSync(file)) {
    data = fs.readFileSync(file, 'utf8');
  }
  res.send('ok');
});

app.get('/async', async (req, res) => {
  try {
    const data = await fs.promises.readFile(file, 'utf8');
  } catch (err) {}
  res.send('ok');
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

async function runBenchmark(endpoint, name) {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const pings = [];
  let isRunning = true;

  // Continuously ping the server to measure event loop blocking
  const pingLoop = async () => {
    while (isRunning) {
      const start = performance.now();
      await fetch(`${baseUrl}/ping`);
      pings.push(performance.now() - start);
      await new Promise(r => setTimeout(r, 5));
    }
  };

  pingLoop();

  // Hit the target endpoint concurrently
  const start = performance.now();
  const promises = [];
  for (let i = 0; i < 500; i++) {
    promises.push(fetch(`${baseUrl}${endpoint}`));
  }
  await Promise.all(promises);
  const duration = performance.now() - start;

  isRunning = false;
  server.close();

  const avgPing = pings.reduce((a, b) => a + b, 0) / (pings.length || 1);
  const maxPing = Math.max(...pings, 0);

  console.log(`--- ${name} ---`);
  console.log(`Total duration: ${duration.toFixed(2)}ms`);
  console.log(`Avg ping latency (blocking): ${avgPing.toFixed(2)}ms`);
  console.log(`Max ping latency (blocking): ${maxPing.toFixed(2)}ms`);
  console.log();
}

async function main() {
  await runBenchmark('/sync', 'Synchronous Read');
  await runBenchmark('/async', 'Asynchronous Read');
}

main();
