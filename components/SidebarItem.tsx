import React from 'react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  isOpen?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, isOpen = true }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 text-left ${
        active 
          ? 'bg-zinc-900 text-white shadow-xs' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
      }`}
    >
      <div className="flex-shrink-0">
        <Icon size={16} strokeWidth={active ? 2 : 1.75} className={active ? 'text-white' : 'text-zinc-500'} />
      </div>
      {isOpen && <span className="tracking-normal truncate">{label}</span>}
    </button>
  );
};

