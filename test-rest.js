async function test() {
  const url = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0825832493/databases/ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a/documents:runQuery?key=AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'reviews' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'appId' },
          op: 'EQUAL',
          value: { stringValue: 'i5uw2apum' }
        }
      },
      limit: 10
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  console.log(res.status, await res.text());
}
test();
