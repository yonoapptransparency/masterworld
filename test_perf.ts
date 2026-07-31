import { performance } from 'perf_hooks';
import { getFirebaseAdminDb } from './src/server/firebase';
import express from 'express';

async function mockDb() {
  const mockDoc = (id) => ({
    get: async () => {
      await new Promise(r => setTimeout(r, 10)); // simulate 10ms latency
      return { exists: true, data: () => ({ id }) };
    }
  });

  return {
    collection: (name) => ({
      doc: (id) => mockDoc(id)
    }),
    getAll: async (...refs) => {
      await new Promise(r => setTimeout(r, 10)); // simulate 10ms latency for batch
      return refs.map(r => ({ exists: true, data: () => ({ id: "mock" }) }));
    }
  };
}

async function runBenchmark() {
  const db = await mockDb();

  // Baseline: N+1
  const vaultDocs = ['sec_links_vault_3', 'sec_vault', 'secure_links'];
  const start1 = performance.now();
  for (const docName of vaultDocs) {
    const vaultSnap = await db.collection('store_data').doc(docName).get();
  }
  const end1 = performance.now();

  // Optimized: getAll
  const start2 = performance.now();
  const refs = vaultDocs.map(docName => db.collection('store_data').doc(docName));
  const snaps = await db.getAll(...refs);
  const end2 = performance.now();

  console.log(`Baseline (N+1): ${(end1 - start1).toFixed(2)}ms`);
  console.log(`Optimized (getAll): ${(end2 - start2).toFixed(2)}ms`);
}

runBenchmark().catch(console.error);
