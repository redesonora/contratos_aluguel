import React, { useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  Palette
} from 'lucide-react';

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  activeDropdown?: 'size' | 'color' | null;
  setActiveDropdown?: (val: 'size' | 'color' | null) => void;
}

export const RichEditor: React.FC<RichEditorProps> = ({ 
  content, 
  onChange,
  activeDropdown,
  setActiveDropdown
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const [currentFontSize, setCurrentFontSize] = React.useState<string>('');

  useEffect(() => {
    const updateFormat = () => {
      if (typeof document !== 'undefined') {
        setCurrentFontSize(document.queryCommandValue('fontSize') || '');
      }
    };
    document.addEventListener('selectionchange', updateFormat);
    return () => document.removeEventListener('selectionchange', updateFormat);
  }, []);

  // Sync content property to the editable div, but only if it's different from current innerHTML
  // to avoid cursor jumps.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="flex flex-col border border-slate-200 rounded-[2rem] overflow-hidden focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100/50 transition-all bg-white h-[450px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => execCommand('bold')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Negrito"><Bold size={16} /></button>
          <button onClick={() => execCommand('italic')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Itálico"><Italic size={16} /></button>
          <button onClick={() => execCommand('underline')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Sublinhado"><Underline size={16} /></button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Alinhar à Esquerda"><AlignLeft size={16} /></button>
          <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Centralizar"><AlignCenter size={16} /></button>
          <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Alinhar à Direita"><AlignRight size={16} /></button>
          <button onClick={() => execCommand('justifyFull')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Justificar"><AlignJustify size={16} /></button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="relative">
          <button 
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Evita perder foco
              setActiveDropdown?.(activeDropdown === 'size' ? null : 'size');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Type size={14} />
            Tamanho {currentFontSize ? `(${currentFontSize})` : ''}
          </button>
          {activeDropdown === 'size' && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-[60] flex flex-col gap-1 min-w-[200px]">
              <div className="text-[9px] font-black uppercase text-slate-400 px-2 py-1">Tamanho do Texto</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map(size => {
                  const isActive = currentFontSize === size.toString();
                  return (
                    <button 
                      key={size}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Evita perder foco do texto selecionado
                        execCommand('fontSize', size.toString());
                        setCurrentFontSize(size.toString());
                        setActiveDropdown?.(null);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 hover:text-blue-600 text-slate-600'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="relative ml-1">
          <button 
            type="button"
            onClick={() => setActiveDropdown?.(activeDropdown === 'color' ? null : 'color')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Palette size={14} />
            Cor
          </button>
          {activeDropdown === 'color' && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-[60] grid grid-cols-5 gap-2 min-w-[180px]">
              {['#000000', '#475569', '#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#db2777', '#0891b2', '#7c3aed'].map(color => (
                <button 
                  key={color}
                  type="button"
                  onClick={() => {
                    execCommand('foreColor', color);
                    setActiveDropdown?.(null);
                  }}
                  className="w-6 h-6 rounded-full shadow-inner border border-slate-200"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editable Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-8 outline-none text-slate-800 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 contract-content"
      />
    </div>
  );
};
