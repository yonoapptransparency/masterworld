const { syncFromFirestore } = require('./dist/server.cjs');
syncFromFirestore().then(console.log).catch(console.error);
