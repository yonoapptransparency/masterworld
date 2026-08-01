const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function sequentialFetch() {
  let found = null;
  for (const name of [1, 2, 3]) {
    await delay(100);
    found = name;
    break; // Mocking first one succeeding
  }
  return found;
}

async function parallelFetch() {
  const promises = [1, 2, 3].map(async name => {
    await delay(100);
    return name;
  });
  const results = await Promise.all(promises);
  let found = null;
  for (const name of results) {
    found = name;
    break;
  }
  return found;
}

async function run() {
  let start = Date.now();
  await sequentialFetch();
  console.log("Sequential (first succeeds):", Date.now() - start, "ms");

  start = Date.now();
  await parallelFetch();
  console.log("Parallel (first succeeds):", Date.now() - start, "ms");
}
run();
