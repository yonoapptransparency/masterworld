import { communityStore } from './src/server/services/communityStoreService';

async function test() {
  const store = communityStore as any;
  
  // mock reviews
  store.reviews.set('rev_1', {
    id: 'rev_1', appId: 'instagram', appName: 'Instagram', reviewText: 'Insta comment', status: 'published'
  });
  store.reviews.set('rev_2', {
    id: 'rev_2', appId: '77', appName: '77', reviewText: '77 comment', status: 'published'
  });
  store.reviews.set('rev_3', {
    id: 'rev_3', appId: 'spin-crush', appName: 'Spin Crush', reviewText: 'Spin crush comment', status: 'published'
  });

  const res77 = store.getReviewsForApp('77');
  console.log('77 reviews:', res77.reviews.map((r: any) => r.reviewText));

  const resInsta = store.getReviewsForApp('instagram');
  console.log('instagram reviews:', resInsta.reviews.map((r: any) => r.reviewText));
}

test();
