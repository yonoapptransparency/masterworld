const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

const optimizations = `
@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    -webkit-overflow-scrolling: touch;
  }
}

/* Force Hardware Acceleration for smooth 120fps scrolling */
.gpu-accelerated, img, .glass-panel, .glass-navbar, button {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Optimization for lists */
li, .flex-none {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
`;

if (!css.includes("scroll-behavior: smooth")) {
  css += optimizations;
  fs.writeFileSync('src/index.css', css, 'utf-8');
  console.log("CSS optimized");
} else {
  console.log("CSS already optimized");
}
