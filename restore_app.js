const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the entire ScrollToTop to MainLayout section with the original content
const originalLayout = `function ScrollToTop() {
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
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl tracking-tight text-blue-600">
          {settings.site_title || "App Hub"}
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-blue-600">Home</Link>
          <Link to="/news" className="text-sm font-medium hover:text-blue-600">News</Link>
          <Link to="/blogs" className="text-sm font-medium hover:text-blue-600">Blog</Link>
          <Link to="/videos" className="text-sm font-medium hover:text-blue-600">Videos</Link>
          <Link to="/contact" className="text-sm font-medium hover:text-blue-600">Contact</Link>
          <GlobalSearch />
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-100 p-4 flex flex-col gap-4">
           <Link to="/" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
           <Link to="/news" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>News</Link>
           <Link to="/blogs" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Blog</Link>
           <Link to="/contact" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Contact</Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { settings } = useData();
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">{settings.site_title || "App Hub"}</h3>
          <p className="text-sm text-zinc-500">Your trusted source for the best applications and updates.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <div className="flex flex-col gap-2">
            <Link to="/privacy" className="text-sm text-zinc-500 hover:text-blue-600">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-zinc-500 hover:text-blue-600">Terms of Service</Link>
            <Link to="/disclaimer" className="text-sm text-zinc-500 hover:text-blue-600">Disclaimer</Link>
            <Link to="/notice" className="text-sm text-zinc-500 hover:text-blue-600">Notice</Link>
            <Link to="/ethics" className="text-sm text-zinc-500 hover:text-blue-600">Ethics</Link>
            <Link to="/responsibility" className="text-sm text-zinc-500 hover:text-blue-600">Responsibility</Link>
          </div>
        </div>
        <div>
           <h4 className="font-bold mb-4">Company</h4>
           <div className="flex flex-col gap-2">
             <Link to="/about" className="text-sm text-zinc-500 hover:text-blue-600">About Us</Link>
             <Link to="/contact" className="text-sm text-zinc-500 hover:text-blue-600">Contact</Link>
             <Link to="/developers" className="text-sm text-zinc-500 hover:text-blue-600">Developers</Link>
           </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-zinc-200 text-center text-sm text-zinc-400">
        &copy; {new Date().getFullYear()} {settings.site_title || "App Hub"}. All rights reserved.
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
      <PublicChatbot />
    </div>
  );
}`;

content = content.replace(/function ScrollToTop\(\)[\s\S]*?function MainLayout[^{]*\{[\s\S]*?\n\}/, originalLayout);

// Restore imports
content = content.replace("import { cn } from './lib/utils';\nimport LanguageSelector from './components/LanguageSelector';\nimport StarRatingFeedback from './components/StarRatingFeedback';\n", "");
content = content.replace("import { AnimatePresence, motion } from 'framer-motion';", "import { AnimatePresence } from 'framer-motion';");

// Restore lucide-react imports to original: ShieldCheck, Info, ArrowRight, X, Menu, Search
content = content.replace(/import \{.*?\} from 'lucide-react';/, "import { ShieldCheck, Info, ArrowRight, X, Menu, Search } from 'lucide-react';");

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log("Layout restored.");
