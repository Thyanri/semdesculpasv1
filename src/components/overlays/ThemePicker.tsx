import { useState } from 'react';
import { ModalShell } from '../ModalShell';
import { useTheme } from '../../hooks/useTheme';

const THEMES = [
  { id: 'default-dark', name: 'Default Dark', bg: '#323437', accent: '#e2b714' },
  { id: 'strict-red', name: 'Strict Red', bg: '#111111', accent: '#ff0000' },
  { id: 'dracula-like', name: 'Dracula', bg: '#282a36', accent: '#ff79c6' },
  { id: 'light', name: 'Light', bg: '#f0f2f5', accent: '#005a9c' },
];

export function ThemePicker({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { setTheme } = useTheme();
  const [search, setSearch] = useState('');

  const filtered = THEMES.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Theme Picker">
      <input
        type="text"
        placeholder="Buscar tema..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono mb-6 outline-none focus:border-subtext transition-colors"
        autoFocus
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => { setTheme(t.id); onClose(); }}
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-subtext transition-colors text-left"
            style={{ backgroundColor: t.bg }}
          >
            <div className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: t.accent }}></div>
            <span className="font-mono text-sm" style={{ color: t.id === 'light' ? '#333' : '#fff' }}>{t.name}</span>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}
