import { useState, useRef, useEffect, FormEvent } from 'react';
import { ModalShell } from '../ModalShell';

interface QuickCreateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, step: string) => void;
}

export function QuickCreateOverlay({ isOpen, onClose, onCreate }: QuickCreateOverlayProps) {
  const [title, setTitle] = useState('');
  const [step, setStep] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setStep('');
      setTimeout(() => titleRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim() && step.trim()) {
      onCreate(title.trim(), step.trim());
      onClose();
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Novo Caso">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-mono text-subtext mb-2 uppercase tracking-widest">O que é?</label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Terminar relatório"
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-subtext mb-2 uppercase tracking-widest">Próximo passo físico?</label>
          <input
            type="text"
            value={step}
            onChange={e => setStep(e.target.value)}
            placeholder="Ex: Abrir Excel"
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded font-mono text-sm text-subtext hover:text-text transition-colors">Cancelar</button>
          <button type="submit" disabled={!title.trim() || !step.trim()} className="px-6 py-2 rounded font-mono text-sm bg-text text-bg hover:opacity-90 transition-opacity disabled:opacity-50">Criar (Enter)</button>
        </div>
      </form>
    </ModalShell>
  );
}
