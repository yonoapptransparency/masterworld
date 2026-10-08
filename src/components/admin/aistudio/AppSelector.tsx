import React, { useMemo } from 'react';
import { Search, CheckSquare, Square, Filter, Layers, Check } from 'lucide-react';

interface AppSelectorProps {
  appsList: any[];
  selectedAppIds: string[];
  onChangeSelection: (ids: string[]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const AppSelector: React.FC<AppSelectorProps> = ({
  appsList,
  selectedAppIds,
  onChangeSelection,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    appsList.forEach(a => {
      if (a.category) set.add(a.category);
    });
    return ['all', ...Array.from(set)];
  }, [appsList]);

  // Filtered list
  const filteredApps = useMemo(() => {
    let list = appsList;
    if (selectedCategory !== 'all') {
      list = list.filter(a => (a.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        (a.name || '').toLowerCase().includes(q) || 
        (a.slug || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [appsList, selectedCategory, searchQuery]);

  const allFilteredSelected = useMemo(() => {
    if (filteredApps.length === 0) return false;
    return filteredApps.every(a => selectedAppIds.includes(String(a.id || a.slug)));
  }, [filteredApps, selectedAppIds]);

  const toggleApp = (id: string) => {
    if (selectedAppIds.includes(id)) {
      onChangeSelection(selectedAppIds.filter(item => item !== id));
    } else {
      onChangeSelection([...selectedAppIds, id]);
    }
  };

  const handleToggleAllFiltered = () => {
    if (allFilteredSelected) {
      // Unselect filtered
      const filteredIdSet = new Set(filteredApps.map(a => String(a.id || a.slug)));
      onChangeSelection(selectedAppIds.filter(id => !filteredIdSet.has(id)));
    } else {
      // Select filtered
      const combined = new Set([...selectedAppIds, ...filteredApps.map(a => String(a.id || a.slug))]);
      onChangeSelection(Array.from(combined));
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col h-full overflow-hidden">
      {/* Header with counter and Select All */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs sm:text-sm font-semibold text-slate-200">Catalog Apps</span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
            {selectedAppIds.length} / {appsList.length}
          </span>
        </div>

        <button
          onClick={handleToggleAllFiltered}
          className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 flex-shrink-0"
        >
          {allFilteredSelected ? (
            <>
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>Deselect All</span>
            </>
          ) : (
            <>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select All ({filteredApps.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by app name or slug..."
          className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Categories chips */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 scrollbar-none flex-shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap transition capitalize ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Apps Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
        {filteredApps.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No matching apps found</div>
        ) : (
          filteredApps.map(app => {
            const id = String(app.id || app.slug);
            const isSelected = selectedAppIds.includes(id);

            return (
              <div
                key={id}
                onClick={() => toggleApp(id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border text-xs ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt=""
                      className="w-6 h-6 rounded-md object-cover flex-shrink-0 bg-slate-800"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center flex-shrink-0 text-[10px] text-slate-400 font-bold">
                      {(app.name || 'A')[0]}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="font-medium truncate">{app.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{app.category || 'Card'}</div>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ml-2 transition ${
                    isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
