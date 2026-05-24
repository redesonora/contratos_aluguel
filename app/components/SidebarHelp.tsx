'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';

export default function SidebarHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
      >
        <HelpCircle size={14} />
        Ajuda / FAQ
      </button>
      {isOpen && <HelpModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
