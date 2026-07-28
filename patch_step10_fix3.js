const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Remove from AdminDashboard
code = code.replace(`  const [pendingReviews, setPendingReviews] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isFirebaseReal || !db) return;
    const { collection, query, where, onSnapshot } = require('firebase/firestore');
    try {
      const q = query(collection(db, 'reviews'), where('is_approved', '==', false));
      const unsub = onSnapshot(q, (snap: any) => {
        setPendingReviews(snap.size);
      }, () => {
        setPendingReviews(0);
      });
      return () => unsub();
    } catch(e) {}
  }, []);\n`, '');

// Add to DashboardTab
const dashboardStart = `const DashboardTab = React.memo(({ apps, news }: { apps: any[], news: any[] }) => {
  const [pendingReviews, setPendingReviews] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isFirebaseReal || !db) return;
    const { collection, query, where, onSnapshot } = require('firebase/firestore');
    try {
      const q = query(collection(db, 'reviews'), where('is_approved', '==', false));
      const unsub = onSnapshot(q, (snap: any) => {
        setPendingReviews(snap.size);
      }, () => {
        setPendingReviews(0);
      });
      return () => unsub();
    } catch(e) {}
  }, []);
`;

code = code.replace(/const DashboardTab = React\.memo\(\(\{ apps, news \}: \{ apps: any\[\], news: any\[\] \}\) => \{/, dashboardStart);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
