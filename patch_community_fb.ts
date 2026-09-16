import fs from 'fs';
const file = 'src/server/communityFirebaseAdmin.ts';
let code = fs.readFileSync(file, 'utf8');

const newFunc = `
/**
 * Atomic Increment for App Stats (Zero-Scan Aggregation)
 */
export async function atomicUpdateAppStats(appId: string, increments: {
  publishedReviewCount?: number;
  publishedRatingSum?: number;
  star1?: number;
  star2?: number;
  star3?: number;
  star4?: number;
  star5?: number;
}): Promise<boolean> {
  try {
    const config = getCommunityFirebaseConfig();
    const dbId = config.firestoreDatabaseId || '(default)';
    const url = \`https://firestore.googleapis.com/v1/projects/\${config.projectId}/databases/\${dbId}/documents:commit?key=\${encodeURIComponent(config.apiKey)}\`;

    const fieldTransforms: any[] = [];
    
    if (increments.publishedReviewCount) {
      fieldTransforms.push({ fieldPath: "publishedReviewCount", increment: { integerValue: String(increments.publishedReviewCount) } });
    }
    if (increments.publishedRatingSum) {
      fieldTransforms.push({ fieldPath: "publishedRatingSum", increment: { integerValue: String(increments.publishedRatingSum) } });
    }
    if (increments.star1) {
      fieldTransforms.push({ fieldPath: "starDistribution.1", increment: { integerValue: String(increments.star1) } });
    }
    if (increments.star2) {
      fieldTransforms.push({ fieldPath: "starDistribution.2", increment: { integerValue: String(increments.star2) } });
    }
    if (increments.star3) {
      fieldTransforms.push({ fieldPath: "starDistribution.3", increment: { integerValue: String(increments.star3) } });
    }
    if (increments.star4) {
      fieldTransforms.push({ fieldPath: "starDistribution.4", increment: { integerValue: String(increments.star4) } });
    }
    if (increments.star5) {
      fieldTransforms.push({ fieldPath: "starDistribution.5", increment: { integerValue: String(increments.star5) } });
    }

    if (fieldTransforms.length === 0) return true;

    const payload = {
      writes: [
        {
          transform: {
            document: \`projects/\${config.projectId}/databases/\${dbId}/documents/app_stats/\${appId}\`,
            fieldTransforms
          }
        }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[CommunityStore] Atomic Update Failed:', err);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[CommunityStore] Atomic Update Exception:', error);
    return false;
  }
}
`;

if (!code.includes('atomicUpdateAppStats')) {
  code += newFunc;
  fs.writeFileSync(file, code);
  console.log("Added atomicUpdateAppStats");
} else {
  console.log("atomicUpdateAppStats already exists");
}
