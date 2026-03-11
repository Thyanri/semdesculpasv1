import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { repository } from '../../data/store';
import { Template } from '../../domain/models';
import { motion } from 'motion/react';

interface QuickAddOverlayProps {
  onClose: () => void;
  onCreated: () => void;
}

export function QuickAddOverlay({ onClose, onCreated }: QuickAddOverlayProps) {
  const [tab, setTab] = useState<'templates' | 'manual'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLUListElement>(null);

  // Manual tab state
  const [title, setTitle] = useState('');
  const [step, setStep] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    repository.listTemplates().then(t => {
      setTemplates(t);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (tab === 'manual') {
      setTimeout(() => titleRef.current?.focus(), 10);
    }
  }, [tab]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (tab === 'templates') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev < templates.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && !(e.target as HTMLElement).closest('form')) {
          e.preventDefault();
          if (templates.length > 0) {
            const t = templates[selectedIndex];
            await repository.createCase({
              title: t.titlePrefix ? `${t.titlePrefix} ` : 'Novo Caso',
              nextPhysicalStep: t.defaultNextStep || 'Definir próximo passo',
              category: t.category,
              status: 'active'
            });
            onCreated();
            onClose();
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          setTab('manual');
        }
      } else if (tab === 'manual' && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        setTab('templates');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [templates, selectedIndex, onClose, onCreated, tab]);

  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      (listRef.current.children[selectedIndex] as HTMLElement).scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (title.trim() && step.trim()) {
      await repository.createCase({
        title: title.trim(),
        nextPhysicalStep: step.trim(),
        status: 'active'
      });
      onCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Tab Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'templates' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setTab('manual')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'manual' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Manual
            </button>
          </div>
          <p className="text-sm text-zinc-400">
            {tab === 'templates' ? 'Selecione um template (Enter para criar, Tab para manual)' : 'Crie um caso manualmente'}
          </p>
        </div>

        {/* Templates Tab */}
        {tab === 'templates' && (
          <div className="overflow-y-auto p-2">
            {loading ? (
              <p className="text-zinc-500 p-4 text-center">Carregando...</p>
            ) : templates.length === 0 ? (
              <p className="text-zinc-500 p-4 text-center">Nenhum template encontrado.</p>
            ) : (
              <ul ref={listRef} className="space-y-1">
                {templates.map((t, i) => (
                  <li
                    key={t.id}
                    className={`p-3 rounded-xl cursor-pointer flex justify-between items-center ${
                      i === selectedIndex ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'
                    }`}
                    onClick={async () => {
                      await repository.createCase({
                        title: t.titlePrefix ? `${t.titlePrefix} ` : 'Novo Caso',
                        nextPhysicalStep: t.defaultNextStep || 'Definir próximo passo',
                        category: t.category,
                        status: 'active'
                      });
                      onCreated();
                      onClose();
                    }}
                  >
                    <div>
                      <div className="font-medium">{t.name}</div>
                      {t.category && <div className="text-xs opacity-60 mt-0.5">{t.category}</div>}
                    </div>
                    <div className="text-xs opacity-50 font-mono">
                      {t.titlePrefix || '...'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {tab === 'manual' && (
          <div className="p-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-widest">O que é?</label>
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Terminar relatório"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-widest">Próximo passo físico?</label>
                <input
                  type="text"
                  value={step}
                  onChange={e => setStep(e.target.value)}
                  placeholder="Ex: Abrir Excel"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !step.trim()}
                  className="px-5 py-2 text-sm bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Criar (Enter)
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
