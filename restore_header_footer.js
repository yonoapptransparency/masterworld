const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const originalHeaderFooter = `function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Header() {
  const { settings } = useData();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="py-3 border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 font-bold text-lg text-zinc-900">
          {settings.site_logo && (
            <img src={settings.site_logo} className="w-10 h-10 object-contain" alt="Logo" />
          )}
          {!settings.site_logo && (
             <img src="https://y4q7avawns.ucarecd.net/b391a2fa-42f7-4b3a-a0d5-605cb22aead4/-/preview/1000x1000/" className="w-10 h-10 object-contain" alt="Logo" />
          )}
          <span>{settings.site_title || "Rummydex"}</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/new-apps" className="hover:text-blue-600 transition-colors">New Apps</Link>
          <Link to="/news" className="hover:text-blue-600 transition-colors">News</Link>
          <Link to="/blogs" className="hover:text-blue-600 transition-colors">Blogs</Link>
          <Link to="/videos" className="hover:text-blue-600 transition-colors">Videos</Link>
          <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
        </nav>
        <button className="md:hidden p-2 text-zinc-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-100 p-4 flex flex-col gap-4 shadow-lg absolute w-full">
           <Link to="/" className="text-sm font-medium text-zinc-600" onClick={() => setMenuOpen(false)}>Home</Link>
           <Link to="/new-apps" className="text-sm font-medium text-zinc-600" onClick={() => setMenuOpen(false)}>New Apps</Link>
           <Link to="/news" className="text-sm font-medium text-zinc-600" onClick={() => setMenuOpen(false)}>News</Link>
           <Link to="/blogs" className="text-sm font-medium text-zinc-600" onClick={() => setMenuOpen(false)}>Blogs</Link>
           <Link to="/videos" className="text-sm font-medium text-zinc-600" onClick={() => setMenuOpen(false)}>Videos</Link>
           <Link to="/about" className="text-sm font-medium text-zinc-600" onClick={() => setMenuOpen(false)}>About</Link>
           <Link to="/contact" className="text-sm font-medium text-zinc-600" onClick={() => setMenuOpen(false)}>Contact</Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { settings } = useData();
  
  return (
    <footer className="pt-12 pb-8 border-t border-black/5 bg-zinc-50 mt-12 text-center text-zinc-500">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-xl font-bold flex items-center justify-center gap-2 text-zinc-900 mb-2">
          {settings.site_logo && (
            <img src={settings.site_logo} className="w-8 h-8 object-contain" alt="Logo" />
          )}
          {!settings.site_logo && (
             <img src="https://y4q7avawns.ucarecd.net/b391a2fa-42f7-4b3a-a0d5-605cb22aead4/-/preview/1000x1000/" className="w-8 h-8 object-contain" alt="Logo" />
          )}
          <span>{settings.site_title || "Rummydex"}</span>
        </h3>
        <p className="text-sm max-w-xl mx-auto mb-6 leading-relaxed">
          {settings.site_description || "Step into the world of Rummy - compete, challenge friends, and rise to the top on Rummydex!"}
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold mb-8 text-zinc-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          <Link to="/videos" className="hover:text-blue-600 transition-colors">Apps</Link>
          <Link to="/blogs" className="hover:text-blue-600 transition-colors">Blog</Link>
          <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
          <Link to="/notice" className="hover:text-blue-600 transition-colors">Notice</Link>
          <Link to="/ethics" className="hover:text-blue-600 transition-colors">Ethics</Link>
          <Link to="/disclaimer" className="hover:text-blue-600 transition-colors">Disclaimer</Link>
        </div>
        <div className="text-xs text-zinc-400 mt-8">
          &copy; {new Date().getFullYear()} {settings.site_title || "Rummydex"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ScrollToTop />
      <Ticker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportWidget />
      <QuickHub />
    </div>
  );
}`;

const layoutRegex = /function ScrollToTop\(\) \{[\s\S]*?function MainLayout\(\{ children \}: \{ children: React\.ReactNode \}\) \{[\s\S]*?return \([\s\S]*?<\/div>\n  \);\n\}/;
content = content.replace(layoutRegex, originalHeaderFooter);

// Also remove LanguageSelector and StarRatingFeedback imports
content = content.replace(/import LanguageSelector from '\.\/components\/LanguageSelector';\n/g, '');
content = content.replace(/import StarRatingFeedback from '\.\/components\/StarRatingFeedback';\n/g, '');

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log("Restored Header and Footer precisely!");
