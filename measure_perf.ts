import fs from 'fs';

async function runBenchmark() {
  const start = Date.now();

  // mock for appDocIds
  const appDocIds = ['id1', 'id2'];
  const targetUrl = null;
  let resultTargetUrl = null;

  // SEQUENTIAL
  const seqStart = Date.now();
  for (const targetId of appDocIds) {
    // mock fetch
    await new Promise(r => setTimeout(r, 100)); // 100ms latency
    if (targetId === 'id2') {
      resultTargetUrl = 'found';
      break;
    }
  }
  const seqEnd = Date.now();
  console.log(`Sequential time: ${seqEnd - seqStart}ms`);

  // PARALLEL
  const parStart = Date.now();
  resultTargetUrl = null;
  const promises = appDocIds.map(async (targetId) => {
    await new Promise(r => setTimeout(r, 100)); // 100ms latency
    if (targetId === 'id2') {
      return 'found';
    }
    return null;
  });
  const results = await Promise.all(promises);
  for (const res of results) {
    if (res) {
      resultTargetUrl = res;
      break;
    }
  }
  const parEnd = Date.now();
  console.log(`Parallel time: ${parEnd - parStart}ms`);
}

runBenchmark();
