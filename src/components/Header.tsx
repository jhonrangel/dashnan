import React, { useState, useRef, useEffect } from 'react';
import { CursorType } from '../types/claims';
import { StorageMetadata } from '../utils/storage';
import { FileUp, Download, RotateCcw, Smile, Hand, Anchor, MousePointer, Database, CheckCircle2, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  cursorType: CursorType;
  onCursorChange: (type: CursorType) => void;
  onOpenUpload: () => void;
  onExport: () => void;
  onResetData: () => void;
  totalRecords: number;
  storageMeta: StorageMetadata;
}

const CURSOR_OPTIONS: { id: CursorType; label: string; icon: React.ComponentType<{ className?: string }>; emoji: string; desc: string }[] = [
  { id: 'hand', label: 'Manito Bacana', icon: Hand, emoji: '👆', desc: 'Puntero interactivo' },
  { id: 'happy', label: 'Carita Feliz', icon: Smile, emoji: '😊', desc: 'Con destellos y brillos' },
  { id: 'anchor', label: 'Ancla KN', icon: Anchor, emoji: '⚓', desc: 'Emblema oficial KN' },
  { id: 'default', label: 'Normal', icon: MousePointer, emoji: '🖱️', desc: 'Cursor estándar' }
];

export const Header: React.FC<HeaderProps> = ({
  cursorType,
  onCursorChange,
  onOpenUpload,
  onExport,
  onResetData,
  totalRecords,
  storageMeta
}) => {
  const [isCursorMenuOpen, setIsCursorMenuOpen] = useState(false);
  const cursorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cursorMenuRef.current && !cursorMenuRef.current.contains(e.target as Node)) {
        setIsCursorMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCursor = CURSOR_OPTIONS.find((c) => c.id === cursorType) || CURSOR_OPTIONS[0];
  const CurrentIcon = currentCursor.icon;

  return (
    <header className="bg-[#003366] text-white border-b border-[#002244] shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Zone: Kuehne + Nagel Official Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/assets/aistudio/image_f6080bd2.png"
              alt="Kuehne + Nagel Logo"
              className="h-8 w-auto object-contain brightness-105"
              referrerPolicy="no-referrer"
            />
            <div className="hidden lg:block border-l border-white/20 pl-3">
              <h1 className="text-xs font-bold tracking-tight text-white leading-none">
                Gestión de Novedades & Claims Adidas
              </h1>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Dashboard 3D Operativo Kuehne + Nagel
              </p>
            </div>
          </div>

          {/* Center: Online Storage Status Badge */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-xs">
            <Database className="w-3.5 h-3.5 text-white shrink-0" />
            <div className="truncate max-w-[220px]">
              <span className="text-[10px] text-slate-300 block leading-tight">Data en Línea Guardada:</span>
              <span className="font-mono font-bold text-white text-[11px] truncate block" title={storageMeta.fileName}>
                {storageMeta.fileName} ({totalRecords} filas)
              </span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          </div>

          {/* Center-Right: Cursor Selector as a compact button with dropdown list ("un botoncito pequeño en plan lista") */}
          <div className="relative" ref={cursorMenuRef}>
            <button
              onClick={() => setIsCursorMenuOpen(!isCursorMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold text-white transition-all shadow-2xs select-none"
              title="Elegir cursor del mouse (Manito, Carita Feliz, etc.)"
            >
              <CurrentIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline text-xs">{currentCursor.label}</span>
              <span className="sm:hidden">{currentCursor.emoji}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-300 transition-transform ${
                  isCursorMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCursorMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Elegir Cursor del Mouse
                </div>
                <div className="space-y-0.5">
                  {CURSOR_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = cursorType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          onCursorChange(opt.id);
                          setIsCursorMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                          isSelected
                            ? 'bg-slate-100 text-[#003366] font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#003366] text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="leading-tight text-xs flex items-center gap-1">
                              <span>{opt.label}</span>
                              <span>{opt.emoji}</span>
                            </div>
                            <div className="text-[10px] text-slate-600 font-normal">
                              {opt.desc}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#003366] bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all whitespace-nowrap"
              title="Cargar nuevo archivo Excel y reemplazar la base en línea"
            >
              <FileUp className="w-4 h-4 text-[#003366]" />
              <span>Cargar Excel</span>
            </button>

            <button
              onClick={onExport}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-lg transition-colors whitespace-nowrap"
              title="Exportar base actual filtrada"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            {storageMeta.source === 'upload' && (
              <button
                onClick={onResetData}
                className="p-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Restablecer a la base inicial de ejemplo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
