'use client';

import { useState } from 'react';
import HelpModal from './HelpModal';

export default function SidebarHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest p-2 transition-colors text-left w-full"
      >
        Ajuda / FAQ
      </button>
      {isOpen && <HelpModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
