import { useState } from 'react';
import { PlusOneTag } from '../../domain/models';

const PLUS_ONE_TAGS: { tag: PlusOneTag; label: string }[] = [
  { tag: 'Clareza', label: 'Clareza — tarefa virou passo físico' },
  { tag: 'Coragem', label: 'Coragem — encarei o adiamento' },
  { tag: 'Consistência', label: 'Consistência — fiz mesmo sem vontade' },
  { tag: 'Dívida', label: 'Dívida — paguei o atrasado' },
  { tag: 'Foco', label: 'Foco — deep session' },
];

interface PlusOneModalProps {
  onSelect: (tag: PlusOneTag) => void;
  onSkip: () => void;
}

export function PlusOneModal({ onSelect, onSkip }: PlusOneModalProps) {
  const [selected, setSelected] = useState<PlusOneTag | null>(null);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-panel border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-mono text-text uppercase tracking-widest">Marcar +1</h3>
          <p className="text-xs text-subtext font-mono mt-1">Qual foi a micro-melhoria de hoje?</p>
        </div>
        <div className="p-4 space-y-2">
          {PLUS_ONE_TAGS.map(({ tag, label }) => (
            <button
              key={tag}
              onClick={() => setSelected(tag)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-mono transition-colors ${
                selected === tag
                  ? 'bg-accent/20 text-text border border-accent/40'
                  : 'bg-bg border border-border text-subtext hover:border-subtext/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-lg text-xs font-mono text-subtext hover:text-text transition-colors"
          >
            Pular
          </button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="flex-1 py-2.5 px-6 rounded-lg text-xs font-mono bg-text text-bg font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
