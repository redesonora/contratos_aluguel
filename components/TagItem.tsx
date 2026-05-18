import React from 'react';

interface TagItemProps {
  label: string;
  tag: string;
  onClick?: (tag: string) => void;
}

export const TagItem: React.FC<TagItemProps> = ({ label, tag, onClick }) => {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.(tag);
      }}
      className="flex flex-col items-start p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left w-full active:scale-95"
    >
      <code className="text-blue-600 font-bold text-xs">{tag}</code>
      <span className="text-[10px] text-slate-500 font-medium tracking-tight">{label}</span>
    </button>
  );
};
