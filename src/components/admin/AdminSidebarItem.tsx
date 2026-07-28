import React from 'react';

interface SidebarItemProps {
  id: string;
  active: boolean;
  onClick: (id: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export const AdminSidebarItem = React.memo(({ 
  id, 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: SidebarItemProps) => {
  return (
    <button 
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all min-h-[48px] font-semibold text-sm group border-0 cursor-pointer ${
        active 
          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon className={`w-4 h-4 transition-transform group-active:scale-95 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} /> 
      {label}
    </button>
  );
});

AdminSidebarItem.displayName = 'AdminSidebarItem';

export default AdminSidebarItem;
