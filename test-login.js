const fs = require('fs');
async function run() {
  const rawData = fs.readFileSync('firebase-applet-config.json', 'utf8');
  const config = JSON.parse(rawData);
  console.log("Got config");
  // we cannot test idToken without generating one
}
run();
