async function simulateSequentialFetch(ids: string[]) {
    for (const id of ids) {
        await new Promise(resolve => setTimeout(resolve, 50)); // simulate latency
    }
}

async function simulateConcurrentFetch(ids: string[]) {
    await Promise.all(ids.map(id => new Promise(resolve => setTimeout(resolve, 50))));
}

async function runBenchmark() {
    const ids = ['id1', 'id2'];

    console.log("Benchmarking Sequential vs Concurrent Fetching for 2 items (50ms latency each)...\n");

    const startSeq = performance.now();
    await simulateSequentialFetch(ids);
    const endSeq = performance.now();
    console.log(`Sequential Fetching took: ${(endSeq - startSeq).toFixed(2)}ms`);

    const startConc = performance.now();
    await simulateConcurrentFetch(ids);
    const endConc = performance.now();
    console.log(`Concurrent Fetching took: ${(endConc - startConc).toFixed(2)}ms`);

    console.log(`\nImprovement: ${((endSeq - startSeq) / (endConc - startConc)).toFixed(2)}x faster`);
}

runBenchmark();
