import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const rawData = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
    const config = JSON.parse(rawData);
    
    const projectId = config.projectId;
    const firestoreDatabaseId = config.firestoreDatabaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    const apiKey = config.apiKey;

    const gitConfigUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/sec_git/cfg${apiKey ? "?key=" + apiKey : ""}`;
    console.log("Fetching git config from Firestore REST API...");
    
    const res = await fetch(gitConfigUrl);
    if (!res.ok) {
      console.log(`Failed to fetch Git config document. Status: ${res.status}`);
      const text = await res.text();
      console.log("Response:", text);
      return;
    }

    const doc = await res.json() as any;
    if (doc && doc.fields) {
      const owner = doc.fields.owner?.stringValue || '';
      const repo = doc.fields.repo?.stringValue || '';
      const branch = doc.fields.branch?.stringValue || '';
      const hasToken = !!(doc.fields.token?.stringValue);
      const tokenLength = doc.fields.token?.stringValue?.length || 0;
      
      console.log("Firestore Git Config found:");
      console.log(`- Owner: ${owner}`);
      console.log(`- Repo: ${repo}`);
      console.log(`- Branch: ${branch}`);
      console.log(`- Has Token: ${hasToken} (Length: ${tokenLength})`);
    } else {
      console.log("No fields found in sec_git/cfg document.");
    }
  } catch (error: any) {
    console.error("Error fetching git config:", error.message);
  }
}

main();
