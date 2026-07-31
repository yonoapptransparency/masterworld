const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');

const app = express();
app.get('/sync', (req, res) => {
  const file = path.join(process.cwd(), 'package.json');
  let data;
  if (fs.existsSync(file)) {
    data = fs.readFileSync(file, 'utf8');
  }
  res.send('ok');
});

app.get('/async', async (req, res) => {
  const file = path.join(process.cwd(), 'package.json');
  try {
    const data = await fs.promises.readFile(file, 'utf8');
  } catch (err) {}
  res.send('ok');
});

async function run() {
  console.time('sync');
  for (let i = 0; i < 1000; i++) {
    await request(app).get('/sync');
  }
  console.timeEnd('sync');

  console.time('async');
  for (let i = 0; i < 1000; i++) {
    await request(app).get('/async');
  }
  console.timeEnd('async');
}
run();
