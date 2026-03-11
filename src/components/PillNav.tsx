interface PillNavProps {
  onNav: (tab: string) => void;
  hasActiveCase: boolean;
}

export function PillNav({ onNav, hasActiveCase }: PillNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 bg-panel border border-border rounded-full px-4 py-2 shadow-lg z-40 overflow-x-auto max-w-[90vw]">
      <button onClick={() => onNav('inbox')} className="text-xs sm:text-sm font-medium text-subtext hover:text-text transition-colors px-2 whitespace-nowrap">
        Inbox <span className="opacity-50 text-[10px] ml-1">1</span>
      </button>
      <div className="w-px h-4 bg-border shrink-0"></div>
      <button 
        onClick={() => hasActiveCase && onNav('arena')} 
        className={`text-xs sm:text-sm font-medium transition-colors px-2 whitespace-nowrap ${hasActiveCase ? 'text-subtext hover:text-text' : 'text-subtext/30 cursor-not-allowed'}`}
      >
        Lista de Foco <span className="opacity-50 text-[10px] ml-1">2</span>
      </button>
      <div className="w-px h-4 bg-border shrink-0"></div>
      <button 
        onClick={() => hasActiveCase && onNav('tribunal')} 
        className={`text-xs sm:text-sm font-medium transition-colors px-2 whitespace-nowrap ${hasActiveCase ? 'text-subtext hover:text-text' : 'text-subtext/30 cursor-not-allowed'}`}
      >
        Adiamentos <span className="opacity-50 text-[10px] ml-1">3</span>
      </button>
    </div>
  );
}
