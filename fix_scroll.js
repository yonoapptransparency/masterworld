const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(
`    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };`,
`    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          setScrolled(prev => {
            if (prev !== isScrolled) return isScrolled;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };`);

app = app.replace(
`    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > window.innerHeight / 2);
          ticking = false;
        });
        ticking = true;
      }
    };`,
`    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isVisible = window.scrollY > window.innerHeight / 2;
          setVisible(prev => {
            if (prev !== isVisible) return isVisible;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };`);

fs.writeFileSync('src/App.tsx', app);
