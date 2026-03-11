import { Case } from '../domain/models';

interface ArenaProps {
  cases: Case[];
  selectedCaseId: string | null;
  onSelectCase: (id: string) => void;
  onStartCase: (c: Case) => void;
  onDelayCase: (c: Case) => void;
  onCompleteCase: (c: Case) => void;
  onQuickCreate: () => void;
  filter: 'all' | 'today';
  onFilterChange: (filter: 'all' | 'today') => void;
  dailyMinimumDone?: boolean;
  hasDailyMinimum?: boolean;
}

export function Arena({ cases, selectedCaseId, onSelectCase, onStartCase, onDelayCase, onCompleteCase, onQuickCreate, filter, onFilterChange, dailyMinimumDone, hasDailyMinimum }: ArenaProps) {
  const selectedCase = cases.find(c => c.id === selectedCaseId);

  const todayStr = new Date().toISOString().split('T')[0];
  const filteredCases = filter === 'today' 
    ? cases.filter(c => c.nextDueDate && c.nextDueDate.split('T')[0] === todayStr)
    : cases;

  if (!selectedCase) {
    // IDLE STATE (Inbox)
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="w-full space-y-4">
          {hasDailyMinimum && (
            <div className="text-center mb-2">
              <span className={`text-xs font-mono ${dailyMinimumDone ? 'text-accent' : 'text-subtext'}`}>
                {dailyMinimumDone ? 'Hoje: feito.' : 'Hoje: 0/1'}
              </span>
            </div>
          )}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => onFilterChange('today')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === 'today' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              Hoje
            </button>
          </div>

          {filteredCases.length === 0 ? (
            <div className="text-center space-y-4">
              <p className="text-subtext text-lg">
                {filter === 'today' ? 'Nenhum caso para hoje.' : 'Nenhum caso ativo.'}
              </p>
              <button 
                onClick={onQuickCreate}
                className="text-sm font-mono text-text bg-panel border border-border px-4 py-2 rounded-md hover:bg-border transition-colors"
              >
                Pressione 'N' para criar
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-subtext text-sm uppercase tracking-widest">Selecione um caso</h2>
                <span className="text-xs text-subtext font-mono">↑↓ para navegar, Enter para focar</span>
              </div>
              <div className="space-y-2">
                {filteredCases.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex justify-between items-center ${
                      selectedCaseId === c.id 
                        ? 'bg-panel border-text shadow-sm' 
                        : 'bg-transparent border-border hover:border-subtext/50'
                    }`}
                  >
                    <div>
                      <h3 className={`font-medium ${selectedCaseId === c.id ? 'text-text' : 'text-subtext'}`}>{c.title}</h3>
                      <p className="text-xs text-subtext mt-1 truncate max-w-md">{c.nextPhysicalStep}</p>
                    </div>
                    {c.delayCount > 0 && (
                      <span className="text-xs text-danger font-mono bg-danger/10 px-2 py-1 rounded">
                        Adiado {c.delayCount}x
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE STATE
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full text-center space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-subtext uppercase tracking-widest">{selectedCase.title}</p>
          <div className="relative inline-block">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-mono font-bold text-text leading-tight tracking-tight max-w-3xl mx-auto">
              {selectedCase.nextPhysicalStep}
              <span className="inline-block w-3 h-8 sm:h-12 bg-accent ml-2 align-middle animate-blink"></span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-12">
          <button 
            onClick={() => onStartCase(selectedCase)}
            className="text-sm font-mono text-bg bg-text px-6 py-3 rounded hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Começar 2 min <span className="opacity-50 text-xs">(Enter)</span>
          </button>
          <button 
            onClick={() => onDelayCase(selectedCase)}
            className="text-sm font-mono text-text bg-panel border border-border px-6 py-3 rounded hover:bg-border transition-colors flex items-center gap-2"
          >
            Adiar <span className="opacity-50 text-xs">(D)</span>
          </button>
          <button 
            onClick={() => onCompleteCase(selectedCase)}
            className="text-sm font-mono text-subtext hover:text-text px-6 py-3 transition-colors"
          >
            Concluir
          </button>
          <button 
            onClick={() => onSelectCase('')}
            className="text-sm font-mono text-subtext hover:text-text px-6 py-3 transition-colors"
          >
            Voltar (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
