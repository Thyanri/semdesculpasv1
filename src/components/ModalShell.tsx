import { ReactNode, useEffect, useRef } from 'react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  fullScreen?: boolean;
  preventCloseOnClickOutside?: boolean;
}

export function ModalShell({ isOpen, onClose, children, title, fullScreen, preventCloseOnClickOutside }: ModalShellProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus management or body scroll lock if needed
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !preventCloseOnClickOutside) onClose();
      }}
    >
      <div 
        ref={overlayRef}
        className={`bg-panel border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${fullScreen ? 'w-full h-full max-w-4xl' : 'w-full max-w-lg max-h-[90vh]'}`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
            <h2 className="text-lg font-semibold text-text">{title}</h2>
            <button onClick={onClose} className="text-subtext hover:text-text transition-colors">
              <span className="sr-only">Close</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
