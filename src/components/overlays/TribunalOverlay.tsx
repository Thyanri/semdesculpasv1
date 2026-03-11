import { useState, useEffect } from 'react';
import { ModalShell } from '../ModalShell';
import { Case, Verdict, PenaltyType, Card } from '../../domain/models';
import { repository } from '../../data/store';
import { markClarityEdit } from '../../domain/dailyProgress';
import { syncService } from '../../services/SyncService';

const EXCUSE_TAGS = [
  "Não sei por onde começar",
  "Perfeccionismo",
  "Medo de errar",
  "Sem energia",
  "Tarefa grande demais",
  "Distrações",
  "Não é importante",
  "Depois eu faço"
];

interface TribunalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: Case | null;
  onVerdict: (verdict: Verdict, caseItem: Case) => void;
}

export function TribunalOverlay({ isOpen, onClose, caseItem, onVerdict }: TribunalOverlayProps) {
  const [step, setStep] = useState(1);
  const [axiom, setAxiom] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  
  const [nextStep, setNextStep] = useState("");
  const [excuseTag, setExcuseTag] = useState("");
  const [excuseText, setExcuseText] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [penaltyType, setPenaltyType] = useState<PenaltyType>("streak");

  useEffect(() => {
    if (isOpen && caseItem) {
      setStep(1);
      setNextStep(caseItem.nextPhysicalStep);
      setExcuseTag("");
      setExcuseText("");
      setSearch("");
      setSelectedCardId("");
      setShowScheduleForm(false);
      setScheduledAt("");
      setPenaltyType("streak");

      repository.getOrCreateUser().then(u => {
        const validAxioms = u.axioms.filter(a => a.trim() !== "");
        if (validAxioms.length > 0) {
          const randomAxiom = validAxioms[Math.floor(Math.random() * validAxioms.length)];
          setAxiom(randomAxiom);
        } else {
          setAxiom("");
        }
        
        repository.listPacks().then(packs => {
          const packIds = packs.map(p => p.id);
          repository.listCards(packIds).then(setCards);
        });
      });
    }
  }, [isOpen, caseItem]);

  if (!caseItem) return null;

  const handleNext1 = async () => {
    if (!nextStep.trim()) return;
    if (nextStep !== caseItem.nextPhysicalStep) {
      await repository.updateCase(caseItem.id, { nextPhysicalStep: nextStep });
      await markClarityEdit(repository);
    }
    setStep(2);
  };

  const finishTribunal = async (verdict: Verdict) => {
    await repository.createSession({
      caseId: caseItem.id,
      actionAttempted: "delay",
      excuseTag,
      excuseText,
      judgeCardId: selectedCardId,
      verdict
    });

    if (verdict === "schedule") {
      await repository.createSchedule({
        caseId: caseItem.id,
        scheduledAt,
        penaltyType
      });
    } else if (verdict === "archiveLie") {
      await repository.updateCase(caseItem.id, { status: "lie" });
    }

    syncService.logEvent('delayVerdict', { caseId: caseItem.id, verdict });

    onVerdict(verdict, caseItem);
    onClose();
  };

  const filteredCards = cards.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.question.toLowerCase().includes(search.toLowerCase())
  );
  const selectedCard = cards.find(c => c.id === selectedCardId);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} fullScreen>
      <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
        <header className="pb-6 border-b border-border flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text">Tribunal</h2>
            <p className="text-sm text-subtext mt-1">{caseItem.title}</p>
          </div>
          <div className="flex gap-2">
            {[1,2,3,4].map(s => (
              <div key={s} className={`w-8 h-1 rounded-full ${s <= step ? 'bg-accent' : 'bg-border'}`}></div>
            ))}
          </div>
        </header>
        
        {axiom && (
          <div className="py-4 text-center">
            <p className="text-sm font-mono text-subtext italic">"{axiom}"</p>
          </div>
        )}

        <div className="flex-1 py-8 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-text">PROMOTOR</h2>
              <p className="text-subtext font-mono">Qual é o próximo passo físico?</p>
              <input 
                type="text"
                value={nextStep} 
                onChange={e => setNextStep(e.target.value)} 
                autoFocus
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-text">DEFESA</h2>
              <p className="text-subtext font-mono">Qual é a desculpa real?</p>
              
              <select 
                value={excuseTag} 
                onChange={e => setExcuseTag(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors appearance-none"
              >
                <option value="" disabled>Selecione uma desculpa...</option>
                {EXCUSE_TAGS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              <textarea 
                placeholder="Detalhes (opcional, máx 160 carac.)" 
                maxLength={160}
                value={excuseText}
                onChange={e => setExcuseText(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors resize-none h-32"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-text">JUIZ</h2>
              <p className="text-subtext font-mono">Escolha uma pergunta.</p>
              
              <input 
                type="text"
                placeholder="Buscar card..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCards.map(c => (
                  <button 
                    key={c.id} 
                    className={`p-4 rounded-lg border text-left transition-colors ${selectedCardId === c.id ? 'border-accent bg-accent/10' : 'border-border hover:border-subtext'}`}
                    onClick={() => setSelectedCardId(c.id)}
                  >
                    <h3 className="font-medium text-text">{c.title}</h3>
                  </button>
                ))}
              </div>

              {selectedCard && (
                <div className="mt-8 p-6 bg-bg rounded-lg border border-border space-y-2">
                  <p className="font-medium text-text text-lg">"{selectedCard.question}"</p>
                  {selectedCard.followup && (
                    <p className="text-sm text-subtext font-mono">{selectedCard.followup}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-text">SENTENÇA</h2>
              <p className="text-subtext font-mono">Decida.</p>
              
              {!showScheduleForm ? (
                <div className="space-y-4">
                  <button className="w-full py-4 rounded-lg bg-text text-bg font-mono font-bold hover:opacity-90 transition-opacity" onClick={() => finishTribunal("do2min")}>
                    COMEÇAR (2 MIN)
                  </button>
                  <button className="w-full py-4 rounded-lg bg-bg border border-border text-text font-mono hover:border-subtext transition-colors" onClick={() => setShowScheduleForm(true)}>
                    AGENDAR COM CUSTO
                  </button>
                  <button className="w-full py-4 rounded-lg bg-danger/10 text-danger font-mono hover:bg-danger/20 transition-colors" onClick={() => finishTribunal("archiveLie")}>
                    ARQUIVAR (MENTIRA)
                  </button>
                </div>
              ) : (
                <div className="space-y-6 p-6 border border-border rounded-lg bg-bg">
                  <h3 className="font-medium text-text font-mono">Agendar</h3>
                  <div>
                    <label className="block text-xs text-subtext font-mono mb-2 uppercase tracking-widest">Quando?</label>
                    <input 
                      type="datetime-local" 
                      value={scheduledAt}
                      onChange={e => setScheduledAt(e.target.value)}
                      className="w-full bg-panel border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-subtext font-mono mb-2 uppercase tracking-widest">Custo (Penalidade)</label>
                    <select 
                      value={penaltyType} 
                      onChange={e => setPenaltyType(e.target.value as PenaltyType)}
                      className="w-full bg-panel border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors appearance-none"
                    >
                      <option value="streak">Zerar Streak</option>
                      <option value="lie_mark">Marca de Mentira</option>
                      <option value="internal_cost">Custo Interno</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button className="flex-1 py-3 rounded-lg bg-panel border border-border text-subtext font-mono hover:text-text transition-colors" onClick={() => setShowScheduleForm(false)}>VOLTAR</button>
                    <button 
                      className="flex-1 py-3 rounded-lg bg-text text-bg font-mono font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                      disabled={!scheduledAt}
                      onClick={() => finishTribunal("schedule")}
                    >
                      CONFIRMAR
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="pt-6 border-t border-border shrink-0 flex justify-end gap-4">
          {step > 1 && (
            <button className="px-6 py-2 rounded font-mono text-sm text-subtext hover:text-text transition-colors" onClick={() => setStep(s => s - 1)}>VOLTAR</button>
          )}
          {step === 1 && (
            <button className="px-6 py-2 rounded font-mono text-sm bg-text text-bg hover:opacity-90 transition-opacity disabled:opacity-50" onClick={handleNext1} disabled={!nextStep.trim()}>PRÓXIMO</button>
          )}
          {step === 2 && (
            <button className="px-6 py-2 rounded font-mono text-sm bg-text text-bg hover:opacity-90 transition-opacity disabled:opacity-50" onClick={() => setStep(3)} disabled={!excuseTag}>PRÓXIMO</button>
          )}
          {step === 3 && (
            <button className="px-6 py-2 rounded font-mono text-sm bg-text text-bg hover:opacity-90 transition-opacity disabled:opacity-50" onClick={() => setStep(4)} disabled={!selectedCardId}>PRÓXIMO</button>
          )}
        </footer>
      </div>
    </ModalShell>
  );
}
