const fs = require('fs');
let code = fs.readFileSync('src/components/BlogsTab.tsx', 'utf8');

const search = `          <button 
            onClick={() => handleAddBlog()} 
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> 
            <span className="hidden sm:inline">New Update</span>
          </button>
        </div>`;

const replace = search + `
        <button 
          onClick={handleSaveBlogs} 
          disabled={saving}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Updates'}</span>
        </button>
`;

code = code.replace(search, replace);

// Ensure Save icon is imported
if (!code.includes('Save')) {
  code = code.replace('Plus,', 'Plus, Save,');
}

fs.writeFileSync('src/components/BlogsTab.tsx', code);
console.log("Added Save button to BlogsTab");
