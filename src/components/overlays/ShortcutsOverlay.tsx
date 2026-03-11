import { ModalShell } from '../ModalShell';

export function ShortcutsOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const shortcuts = [
    { key: 'Esc', desc: 'Abre Command Line / Fecha Overlays' },
    { key: 'Ctrl+Shift+P', desc: 'Abre Command Line' },
    { key: 'Ctrl+K', desc: 'Abre Command Line' },
    { key: 'Ctrl+M', desc: 'Muda Modo de Foco' },
    { key: 'Shift+T', desc: 'Abre Theme Picker' },
    { key: 'Shift+R', desc: 'Abre Relatórios' },
    { key: 'Shift+S', desc: 'Abre Configurações' },
    { key: 'Shift+D', desc: 'Abre Daily Review' },
    { key: 'Shift+P', desc: 'Abre Perfil Social' },
    { key: 'Shift+F', desc: 'Abre Amigos' },
    { key: 'Shift+L', desc: 'Abre Ranking Global' },
    { key: 'Shift+C', desc: 'Abre Co-op Session' },
    { key: 'Shift+G', desc: 'Abre Ligas Semanais' },
    { key: 'Shift+U', desc: 'Abre Comunidade' },
    { key: 'Shift+W', desc: 'Abre Weekly Replay' },
    { key: 'N', desc: 'Novo Caso (Quick Add)' },
    { key: 'Enter', desc: 'Iniciar Caso Selecionado' },
    { key: 'D', desc: 'Adiar Caso (Tribunal)' },
    { key: 'X', desc: 'Registrar Distração' },
    { key: '1-5', desc: 'Navegação no Rodapé' },
    { key: '?', desc: 'Mostrar Atalhos' },
  ];

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Atalhos de Teclado">
      <div className="space-y-2">
        {shortcuts.map(s => (
          <div key={s.key} className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-text font-mono text-sm bg-panel px-2 py-1 rounded border border-border">{s.key}</span>
            <span className="text-subtext font-mono text-sm">{s.desc}</span>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
