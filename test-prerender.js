const { fetchStoreData } = require('./dist/server.cjs');
fetchStoreData().then(console.log).catch(console.error);
