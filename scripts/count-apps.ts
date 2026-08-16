import { syncFromFirestore } from '../src/seoHelper';
async function count() {
  const data = await syncFromFirestore();
  console.log('Apps:', data?.apps?.length || 0);
  const uniqueSlugs = new Set(data.apps.map((a: any) => a.slug));
  console.log('Unique Slugs:', uniqueSlugs.size);
}
count();
