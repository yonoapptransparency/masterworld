const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(
`    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.045, // Ultra smooth
      wheelMultiplier: 0.8,
      smoothWheel: true,
      syncTouch: true, 
      touchMultiplier: 2.0,
      infinite: false,
    });`,
`    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Super smooth easing curve
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.2,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });`);

fs.writeFileSync('src/App.tsx', app);
