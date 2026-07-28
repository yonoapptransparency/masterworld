const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const newCode = `  const [activeTab, setActiveTab] = useState('dashboard');
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

code = code.replace(/  const \[activeTab, setActiveTab\] = useState\('dashboard'\);/, newCode);
fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
