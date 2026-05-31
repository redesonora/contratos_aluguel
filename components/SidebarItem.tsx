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
      className={`w-full flex items-center gap-3 p-3 transition-all duration-300 ${
        active 
          ? 'bg-[#2563EB] text-[#FFFFFF] rounded-[8px]' 
          : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 rounded-[8px]'
      }`}
    >
      <div className="flex-shrink-0">
        <Icon size={20} />
      </div>
      {isOpen && <span className="font-bold text-sm tracking-tight whitespace-nowrap">{label}</span>}
    </button>
  );
};
