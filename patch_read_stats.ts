import fs from 'fs';
const file = 'src/server/communityFirebaseAdmin.ts';
let code = fs.readFileSync(file, 'utf8');

const newFunc = `
export async function readAppStats(appId: string): Promise<any | null> {
  try {
    const config = getCommunityFirebaseConfig();
    const dbId = config.firestoreDatabaseId || '(default)';
    const url = \`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${dbId}/documents/app_stats/\${appId}?key=\${encodeURIComponent(config.apiKey)}\`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.fields) return null;
    
    return {
      publishedReviewCount: Number(data.fields.publishedReviewCount?.integerValue || 0),
      publishedRatingSum: Number(data.fields.publishedRatingSum?.integerValue || 0),
      starDistribution: {
        '1': Number(data.fields.starDistribution?.mapValue?.fields?.['1']?.integerValue || 0),
        '2': Number(data.fields.starDistribution?.mapValue?.fields?.['2']?.integerValue || 0),
        '3': Number(data.fields.starDistribution?.mapValue?.fields?.['3']?.integerValue || 0),
        '4': Number(data.fields.starDistribution?.mapValue?.fields?.['4']?.integerValue || 0),
        '5': Number(data.fields.starDistribution?.mapValue?.fields?.['5']?.integerValue || 0),
      }
    };
  } catch (err) {
    return null;
  }
}
`;

if (!code.includes('readAppStats')) {
  code += newFunc;
  fs.writeFileSync(file, code);
  console.log("Added readAppStats");
} else {
  console.log("readAppStats already exists");
}
