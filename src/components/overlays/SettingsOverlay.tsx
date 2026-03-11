import { useState, useEffect } from 'react';
import { ModalShell } from '../ModalShell';
import { User, PenaltyType } from '../../domain/models';
import { repository } from '../../data/store';

export function SettingsOverlay({ isOpen, onClose, user, onUserUpdate }: { isOpen: boolean, onClose: () => void, user: User | null, onUserUpdate: () => void }) {
  const [axioms, setAxioms] = useState<string[]>(['', '', '']);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerStatus, setPartnerStatus] = useState('');
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    if (isOpen && user) {
      setAxioms([...user.axioms, '', '', ''].slice(0, 3));
      setSettings(user.settings || {});
      
      repository.getPartnerLink().then(link => {
        if (link) {
          setPartnerEmail(link.partnerEmail);
          setPartnerStatus(link.status);
        }
      });
    }
  }, [isOpen, user]);

  const handleSaveAxioms = async () => {
    await repository.updateUser({ axioms: axioms as [string, string, string] });
    onUserUpdate();
  };

  const handleSaveSettings = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await repository.updateUser({ settings: newSettings });
    onUserUpdate();
  };

  const handleInvitePartner = async () => {
    if (!partnerEmail.trim()) return;
    await repository.createPartnerLink(partnerEmail);
    setPartnerStatus('pending');
  };

  if (!user) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Settings" fullScreen>
      <div className="max-w-2xl mx-auto w-full space-y-12 pb-12">
        
        <section className="space-y-4">
          <h3 className="text-xs font-mono text-subtext uppercase tracking-widest border-b border-border pb-2">Axiomas</h3>
          <p className="text-sm text-subtext font-mono">Princípios que aparecem no Tribunal.</p>
          <div className="space-y-3">
            {axioms.map((ax, i) => (
              <input 
                key={i}
                type="text"
                value={ax}
                onChange={e => {
                  const newAx = [...axioms];
                  newAx[i] = e.target.value;
                  setAxioms(newAx);
                }}
                onBlur={handleSaveAxioms}
                placeholder={`Axioma ${i+1}`}
                className="w-full bg-panel border border-border rounded-lg px-4 py-3 text-text font-mono text-sm outline-none focus:border-subtext transition-colors"
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-mono text-subtext uppercase tracking-widest border-b border-border pb-2">Comportamento</h3>
          
          <div className="flex items-center justify-between p-4 bg-panel rounded-lg border border-border">
            <div>
              <p className="text-sm text-text font-mono">Atalhos de Teclado</p>
              <p className="text-xs text-subtext font-mono mt-1">Ativar navegação por teclado</p>
            </div>
            <button 
              onClick={() => handleSaveSettings('keybindsOn', settings.keybindsOn !== false)}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.keybindsOn !== false ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-bg absolute top-1 transition-transform ${settings.keybindsOn !== false ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-panel rounded-lg border border-border">
            <div>
              <p className="text-sm text-text font-mono">Penalidade Padrão</p>
              <p className="text-xs text-subtext font-mono mt-1">Ao agendar no Tribunal</p>
            </div>
            <select 
              value={settings.penaltyTypeDefault || 'streak'}
              onChange={e => handleSaveSettings('penaltyTypeDefault', e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-1.5 text-text font-mono text-sm outline-none focus:border-subtext transition-colors appearance-none"
            >
              <option value="streak">Zerar Streak</option>
              <option value="lie_mark">Marca de Mentira</option>
              <option value="internal_cost">Custo Interno</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-mono text-subtext uppercase tracking-widest border-b border-border pb-2">Mínimo Diário</h3>
          <p className="text-sm text-subtext font-mono">1 ação mínima por dia. Escolha qual conta.</p>
          <div className="space-y-2">
            {([
              { value: 'start2min', label: '1 início de 2 minutos' },
              { value: 'tribunalVerdict', label: '1 decisão no Tribunal' },
              { value: 'debtPaid', label: '1 dívida paga' },
              { value: 'deepSession', label: '5 min deep session' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSaveSettings('dailyMinimum', opt.value)}
                className={`w-full text-left p-3 rounded-lg border text-sm font-mono transition-colors ${
                  settings.dailyMinimum === opt.value
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-border bg-panel text-subtext hover:border-subtext/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
            {settings.dailyMinimum && (
              <button
                onClick={() => handleSaveSettings('dailyMinimum', undefined)}
                className="text-xs font-mono text-subtext hover:text-text transition-colors mt-1"
              >
                Remover mínimo
              </button>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-mono text-subtext uppercase tracking-widest border-b border-border pb-2">Parceiro de Responsabilidade</h3>
          <div className="p-4 bg-panel rounded-lg border border-border space-y-4">
            <p className="text-sm text-subtext font-mono">Convide alguém para monitorar seus adiamentos.</p>
            <div className="flex gap-2">
              <input 
                type="email"
                value={partnerEmail}
                onChange={e => setPartnerEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-text font-mono text-sm outline-none focus:border-subtext transition-colors"
              />
              <button 
                onClick={handleInvitePartner}
                className="px-4 py-2 rounded-lg bg-text text-bg font-mono text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Convidar
              </button>
            </div>
            {partnerStatus && (
              <p className="text-xs font-mono text-accent">Status: {partnerStatus.toUpperCase()}</p>
            )}
          </div>
        </section>

      </div>
    </ModalShell>
  );
}
