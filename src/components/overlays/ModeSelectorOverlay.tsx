import React, { useState, useEffect } from 'react';
import { repository } from '../../data/store';
import { Mode } from '../../domain/models';
import { motion } from 'motion/react';

interface ModeSelectorOverlayProps {
  onClose: () => void;
  currentMode?: Mode;
  onModeChange: (mode: Mode) => void;
}

const MODES: { id: Mode; name: string; desc: string }[] = [
  { id: 'quick', name: 'QuickStart', desc: 'Sessões de 2 minutos para quebrar inércia.' },
  { id: 'deep', name: 'Deep', desc: 'Sessões de 25 minutos para foco profundo.' },
  { id: 'sprint', name: 'Sprint', desc: '5 minutos com checkpoints a cada 60s.' },
  { id: 'chain', name: 'Chain', desc: 'Roda 2 min em cada caso da fila.' },
  { id: 'no_escape', name: 'No Escape', desc: 'Qualquer tentativa de adiar abre Tribunal obrigatório.' },
];

export function ModeSelectorOverlay({ onClose, currentMode, onModeChange }: ModeSelectorOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const initialIndex = MODES.findIndex(m => m.id === (currentMode || 'quick'));
    if (initialIndex >= 0) setSelectedIndex(initialIndex);
  }, [currentMode]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < MODES.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = MODES[selectedIndex].id;
        await repository.updateUser({ settings: { ...(await repository.getOrCreateUser()).settings, mode: selected } });
        onModeChange(selected);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onClose, onModeChange]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Modo de Foco</h2>
          <p className="text-sm text-zinc-400">Selecione o modo de operação (Enter para confirmar)</p>
        </div>

        <div className="p-2 space-y-1">
          {MODES.map((m, i) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl cursor-pointer flex flex-col ${
                i === selectedIndex ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'
              }`}
              onClick={async () => {
                await repository.updateUser({ settings: { ...(await repository.getOrCreateUser()).settings, mode: m.id } });
                onModeChange(m.id);
                onClose();
              }}
            >
              <div className="font-medium flex items-center gap-2">
                {m.name}
                {m.id === currentMode && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white">ATUAL</span>}
              </div>
              <div className="text-xs opacity-60 mt-1">{m.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
