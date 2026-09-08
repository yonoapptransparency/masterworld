async function test() {
  const targetProjectId = 'rummydexcommunity';
  const targetApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || 'AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok';
  const dbId = '(default)';
  const cleanAppId = '2ovzpzjxy'; // test appId
  
  const url = `https://firestore.googleapis.com/v1/projects/${targetProjectId}/databases/${dbId}/documents:runQuery?key=${targetApiKey}`;
  
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'reviews' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'appId' },
                op: 'EQUAL',
                value: { stringValue: cleanAppId }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: 'status' },
                op: 'IN',
                value: {
                  arrayValue: {
                    values: [
                      { stringValue: 'published' },
                      { stringValue: 'approved' }
                    ]
                  }
                }
              }
            }
          ]
        }
      },
      orderBy: [
        { field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }
      ],
      limit: 6
    }
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
