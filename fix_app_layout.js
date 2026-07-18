const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace Header and Footer with enhanced ones
const newHeaderFooter = `
import { cn } from './lib/utils';
import LanguageSelector from './components/LanguageSelector';
import StarRatingFeedback from './components/StarRatingFeedback';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Header() {
  const { settings } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const navLinks = [
    { to: '/', label: 'Home', icon: LayoutGrid },
    { to: '/news', label: 'News', icon: Newspaper },
    { to: '/videos', label: 'Videos', icon: Video },
    { to: '/blogs', label: 'Blog', icon: Sparkles },
    { to: '/contact', label: 'Contact', icon: Send },
  ];

  const legalLinks = [
    { to: '/notice', label: 'Notice', icon: ShieldCheck },
    { to: '/ethics', label: 'Ethics', icon: ShieldCheck },
    { to: '/disclaimer', label: 'Disclaimer', icon: ShieldCheck },
    { to: '/privacy', label: 'Privacy', icon: Shield },
    { to: '/terms', label: 'Terms', icon: Info },
  ];

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_title} className="h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="font-bold text-xl tracking-tight text-blue-600 hidden sm:block">{settings.site_title || "AppStore"}</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navLinks.map(item => {
            const active = item.to && pathname === item.to;
            return (
              <Link key={item.label} to={item.to} className={cn("px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5", active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <GlobalSearch />
          <LanguageSelector />
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden border-t border-gray-100 overflow-hidden bg-white">
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map(item => {
                 const active = item.to && pathname === item.to;
                 return (
                   <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-medium", active ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-700")}>
                     {item.icon && <item.icon className="w-5 h-5" />}
                     {item.label}
                   </Link>
                 )
              })}
              <div className="h-px bg-slate-200 my-2"></div>
              {legalLinks.map(item => (
                   <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600">
                     {item.icon && <item.icon className="w-4 h-4" />}
                     {item.label}
                   </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const { settings } = useData();
  const socialLinks = settings.social_links || {};
  
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
             {settings.logo_url ? (
               <img src={settings.logo_url} alt={settings.site_title} className="h-8 object-contain opacity-80 grayscale hover:grayscale-0 transition-all" />
             ) : (
               <div className="w-8 h-8 bg-slate-300 rounded-lg flex items-center justify-center">
                 <LayoutGrid className="w-5 h-5 text-white" />
               </div>
             )}
             <span className="font-bold text-xl tracking-tight text-slate-800">{settings.site_title || "AppStore"}</span>
          </div>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">{settings.meta_description || "Your trusted source for the best applications and updates."}</p>
          
          <div className="flex items-center gap-3">
             {socialLinks.facebook && <a href={socialLinks.facebook} className="p-2 bg-white rounded-full text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100"><Facebook className="w-4 h-4"/></a>}
             {socialLinks.twitter && <a href={socialLinks.twitter} className="p-2 bg-white rounded-full text-slate-400 hover:text-blue-400 shadow-sm border border-slate-100"><Twitter className="w-4 h-4"/></a>}
             {socialLinks.instagram && <a href={socialLinks.instagram} className="p-2 bg-white rounded-full text-slate-400 hover:text-pink-600 shadow-sm border border-slate-100"><Instagram className="w-4 h-4"/></a>}
             {socialLinks.youtube && <a href={socialLinks.youtube} className="p-2 bg-white rounded-full text-slate-400 hover:text-red-600 shadow-sm border border-slate-100"><Youtube className="w-4 h-4"/></a>}
             {socialLinks.linkedin && <a href={socialLinks.linkedin} className="p-2 bg-white rounded-full text-slate-400 hover:text-blue-700 shadow-sm border border-slate-100"><Linkedin className="w-4 h-4"/></a>}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
          <div className="flex flex-col gap-3">
            <Link to="/privacy" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Terms of Service</Link>
            <Link to="/disclaimer" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Disclaimer</Link>
            <Link to="/notice" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Notice</Link>
            <Link to="/ethics" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Ethics</Link>
            <Link to="/responsibility" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Responsibility</Link>
          </div>
        </div>
        
        <div>
           <h4 className="font-bold text-slate-900 mb-4">Company</h4>
           <div className="flex flex-col gap-3">
             <Link to="/about" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">About Us</Link>
             <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Contact</Link>
             <Link to="/developers" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Developers</Link>
             <Link to="/admin" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Admin</Link>
           </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-200 text-center flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} {settings.site_title || "AppStore"}. All rights reserved.</p>
        <p className="text-xs text-slate-400">Not affiliated with any official app stores.</p>
      </div>
    </footer>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ScrollToTop />
      <Ticker />
      <Header />
      <main className="flex-1 max-w-[100vw] overflow-x-hidden">{children}</main>
      <Footer />
      <SupportWidget />
      <QuickHub />
      <PublicChatbot />
      <StarRatingFeedback />
    </div>
  );
}
`;

// Extract imports from newHeaderFooter
const importsToAdd = "import { cn } from './lib/utils';\nimport LanguageSelector from './components/LanguageSelector';\nimport StarRatingFeedback from './components/StarRatingFeedback';\n";

content = content.replace(/function ScrollToTop\(\)[\s\S]*?function MainLayout[^{]*\{[\s\S]*?\n\}/, newHeaderFooter.replace(importsToAdd, ''));

if (!content.includes('import { cn }')) {
  content = content.replace("import { AnimatePresence } from 'framer-motion';", "import { AnimatePresence } from 'framer-motion';\n" + importsToAdd);
}

// Add the missing lucide-react imports if they aren't there
const missingIcons = ['LayoutGrid', 'Newspaper', 'Sparkles', 'Send', 'Video', 'Facebook', 'Instagram', 'Twitter', 'Linkedin', 'Youtube'];
let lucideMatch = content.match(/import \{([^}]+)\} from 'lucide-react';/);
if (lucideMatch) {
  let existingIcons = lucideMatch[1].split(',').map(s => s.trim());
  let toAdd = missingIcons.filter(icon => !existingIcons.includes(icon));
  if (toAdd.length > 0) {
    let newImport = `import { ${existingIcons.concat(toAdd).join(', ')} } from 'lucide-react';`;
    content = content.replace(lucideMatch[0], newImport);
  }
}

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log("Layout patched.");
