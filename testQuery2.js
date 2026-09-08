async function test() {
  const targetProjectId = 'rummydexcommunity';
  const targetApiKey = 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';
  const url = `https://firestore.googleapis.com/v1/projects/${targetProjectId}/databases/(default)/documents/reviews?pageSize=1&key=${targetApiKey}`;
  const res = await fetch(url);
  console.log(await res.json());
}
test();
