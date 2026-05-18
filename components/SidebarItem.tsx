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
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <div className="flex-shrink-0">
        <Icon size={20} />
      </div>
      {isOpen && <span className="font-bold text-sm tracking-tight whitespace-nowrap">{label}</span>}
    </button>
  );
};
