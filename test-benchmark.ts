import { performance } from 'perf_hooks';

const mockDb = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => {
        // Simulate network latency (e.g. 50ms)
        await new Promise(resolve => setTimeout(resolve, 50));
        return {
          exists: true,
          data: () => ({ more_information_url: `url-for-${id}` })
        };
      }
    })
  })
};

async function testSequential() {
  const db = mockDb;
  const appDocIds = ["id1", "id2"];
  const start = performance.now();
  for (const targetId of appDocIds) {
    const appSnap = await db.collection('apps').doc(targetId).get();
    if (appSnap.exists) {
      // simulate work
    }
  }
  const end = performance.now();
  return end - start;
}

async function testParallel() {
  const db = mockDb;
  const appDocIds = ["id1", "id2"];
  const start = performance.now();
  const snaps = await Promise.all(
    appDocIds.map(targetId => db.collection('apps').doc(targetId).get())
  );
  for (const appSnap of snaps) {
    if (appSnap.exists) {
      // simulate work
    }
  }
  const end = performance.now();
  return end - start;
}

async function run() {
  const seqTime = await testSequential();
  const parTime = await testParallel();
  console.log(`Sequential: ${seqTime.toFixed(2)}ms`);
  console.log(`Parallel: ${parTime.toFixed(2)}ms`);
}
run();
