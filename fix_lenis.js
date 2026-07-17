const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

const hook = `
  useEffect(() => {
    // 120fps smooth scrolling optimization using Lenis
    // autoRaf automatically manages the requestAnimationFrame loop
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease-out curve
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    return () => {
      lenis.destroy();
    };
  }, []);
`;

app = app.replace(
`function AppContent() {
  const { settings, apps = [], news = [], blogs = [], videos = [], quotaExceeded } = useData();`,
`function AppContent() {
  const { settings, apps = [], news = [], blogs = [], videos = [], quotaExceeded } = useData();
${hook}`);

fs.writeFileSync('src/App.tsx', app);
