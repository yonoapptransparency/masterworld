const express = require('express');
const app = express();
app.post('/test', (req, res) => {
  try {
    throw new Error('Test');
  } catch(err) {
    return res.status(500).json({ error: "Service error: " + err.message });
  }
});
app.listen(3001, async () => {
  const res = await fetch('http://localhost:3001/test', { method: 'POST' });
  console.log(await res.text());
  process.exit(0);
});
