const apps = [
  { id: '1', slug: 'app1', name: 'App 1', rating: 4.1, reviews: 0 },
  { id: '2', slug: 'app2', name: 'App 2', rating: 4.5, reviews: 2 }
];

const targetReviews = [
  { appId: '1', rating: 5, status: 'published' },
  { appId: '1', rating: 4, status: 'published' },
  { appId: '1', rating: 4, status: 'published' },
  { appId: '2', rating: 1, status: 'published' },
  { appId: '2', rating: 2, status: 'published' },
  { appId: '2', rating: 3, status: 'pending' }, // Should be ignored
];

const finalApps = apps.map((app) => {
  // Only published reviews as filtered earlier
  const publishedReviews = targetReviews.filter(r => r.status === 'published');
  
  const appReviews = publishedReviews.filter((r) => r.appId === app.id || r.app_id === app.id || r.appSlug === app.slug);
  if (appReviews.length > 0) {
    const total = appReviews.length;
    const sum = appReviews.reduce((acc, cur) => acc + (Number(cur.rating) || 5), 0);
    const newAvg = (sum / total).toFixed(1);
    app.rating = Number(newAvg);
    app.reviews = total;
  }
  return app;
});

console.log(JSON.stringify(finalApps, null, 2));
