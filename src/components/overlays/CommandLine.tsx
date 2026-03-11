import { useState, useEffect, useRef, FormEvent } from 'react';
import { ModalShell } from '../ModalShell';
import { COMMAND_CATALOG } from '../../domain/appActions';

interface CommandLineProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (cmd: string) => void;
}

export function CommandLine({ isOpen, onClose, onExecute }: CommandLineProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onExecute(input.trim());
      onClose();
    }
  };

  // Fuzzy filter: match commands where input is a substring of the command
  const query = input.toLowerCase().trim();
  const filtered = query
    ? COMMAND_CATALOG.filter(c => c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query))
    : COMMAND_CATALOG;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <span className="text-accent font-mono text-xl">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite um comando..."
          className="flex-1 bg-transparent border-none outline-none text-text font-mono text-lg placeholder-subtext/50"
        />
      </form>
      <div className="mt-8 space-y-2">
        <p className="text-xs text-subtext font-mono uppercase tracking-widest mb-4">
          {query ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}` : 'Comandos Disponíveis'}
        </p>
        <div className="grid grid-cols-1 gap-3 text-sm font-mono text-subtext max-h-[40vh] overflow-y-auto pr-2">
          {filtered.map((c, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-border pb-2 cursor-pointer hover:text-text transition-colors"
              onClick={() => {
                // If it's a simple command (no args), execute directly
                const simpleCommands = ['today', 'review', '+1', 'report', 'theme', 'mode', 'coop', 'league', 'community', 'replay', 'debt', 'shortcuts', 'profile', 'friends', 'delay'];
                const base = c.cmd.split(' ')[0];
                if (simpleCommands.includes(base) && !c.cmd.includes('[') && !c.cmd.includes('"')) {
                  onExecute(c.cmd);
                  onClose();
                } else {
                  setInput(c.cmd);
                  inputRef.current?.focus();
                }
              }}
            >
              <span className="text-text">{c.cmd}</span>
              <span className="opacity-50 text-xs">{c.desc}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center opacity-50 py-4">Nenhum comando encontrado.</p>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
