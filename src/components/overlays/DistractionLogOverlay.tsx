import React, { useState, useEffect, useRef } from 'react';
import { repository } from '../../data/store';
import { motion } from 'motion/react';
import { syncService } from '../../services/SyncService';

interface DistractionLogOverlayProps {
  caseId: string;
  onClose: () => void;
}

export function DistractionLogOverlay({ caseId, onClose }: DistractionLogOverlayProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      await repository.createDistractionLog({
        caseId,
        text: text.trim()
      });
      syncService.logEvent('distractionLog', { caseId });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-zinc-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6"
      >
        <h2 className="text-lg font-medium text-white mb-2">Distração</h2>
        <p className="text-sm text-zinc-400 mb-4">O que te puxou?</p>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            placeholder="Ex: WhatsApp, Instagram, sede..."
            autoComplete="off"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              Registrar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
