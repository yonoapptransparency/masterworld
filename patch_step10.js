const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const newCode1 = `  const [pendingReviews, setPendingReviews] = React.useState<number | null>(null);

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

  const handleDragEnd =`;

code = code.replace(/  const handleDragEnd =/, newCode1);

const newCode2 = `{pendingReviews === null ? '...' : pendingReviews}`;
code = code.replace(/<div className="text-4xl font-black text-slate-900 dark:text-white">12<\/div>/, `<div className="text-4xl font-black text-slate-900 dark:text-white">${newCode2}</div>`);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
