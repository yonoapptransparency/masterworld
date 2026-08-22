async function test() {
  const appIds = ['spin-crush', 'yh9toduxk'];
  let projectId = 'gen-lang-client-0825832493';
  const dbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
  const apiKey = '';
  const apiSuffix = apiKey ? `?key=${apiKey}` : '';
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents`;

  for (const appId of appIds) {
      console.log("Checking appId:", appId);
      const query1 = {
        structuredQuery: {
          from: [{ collectionId: "reviews" }],
          where: {
            fieldFilter: { field: { fieldPath: "appId" }, op: "EQUAL", value: { stringValue: appId } }
          },
          limit: { value: 100 }
        }
      };
      
      const fetchRes1 = await fetch(`${baseUrl}:runQuery${apiSuffix}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query1)
      });
      const data1 = fetchRes1.ok ? await fetchRes1.json() : [];
      console.log(`Found ${data1.length > 0 && data1[0].document ? data1.length : 0} reviews for ${appId} (field: appId)`);
      
      const query2 = {
        structuredQuery: {
          from: [{ collectionId: "reviews" }],
          where: {
            fieldFilter: { field: { fieldPath: "app_id" }, op: "EQUAL", value: { stringValue: appId } }
          },
          limit: { value: 100 }
        }
      };
      
      const fetchRes2 = await fetch(`${baseUrl}:runQuery${apiSuffix}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query2)
      });
      const data2 = fetchRes2.ok ? await fetchRes2.json() : [];
      console.log(`Found ${data2.length > 0 && data2[0].document ? data2.length : 0} reviews for ${appId} (field: app_id)`);
  }
}
test();
