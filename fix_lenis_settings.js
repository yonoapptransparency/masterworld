const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(
`    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease-out curve
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });`,
`    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.05, // Lower value means smoother, more fluid scrolling
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: true, // Improves touch smoothness
      touchMultiplier: 1.5,
    });`);

fs.writeFileSync('src/App.tsx', app);
