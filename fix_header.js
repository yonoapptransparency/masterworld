const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the Header component with the one that has searchOpen
const headerRegex = /function Header\(\) \{[\s\S]*?return \([\s\S]*?<\/header>\n  \);\n\}/;

const newHeader = `function Header() {
  const { settings } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
          
          <button className="p-2 text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          <LanguageSelector />
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button className="p-2 text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
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
}`;

content = content.replace(headerRegex, newHeader);
fs.writeFileSync('src/App.tsx', content, 'utf-8');
