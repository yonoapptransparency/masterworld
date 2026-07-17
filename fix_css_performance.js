const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

const additionalTweaks = `
/* GPU Acceleration for heavy elements to ensure 120fps */
.overflow-y-auto, .overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

/* Optimize painting */
.animate-fade-in {
  will-change: opacity, transform;
}

/* Fix Lenis issues */
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
`;

if (!css.includes("will-change: opacity, transform")) {
  css += additionalTweaks;
  fs.writeFileSync('src/index.css', css);
  console.log("CSS performance tweaks added");
} else {
  console.log("CSS tweaks already present");
}
