import { useState, useEffect } from 'react';
import { ModalShell } from '../ModalShell';
import { User, DailyProgress } from '../../domain/models';
import { repository } from '../../data/store';
import { computeReports, Reports as ReportsData } from '../../domain/reports';
import { computeQualityStreak, getDominantPlusOneTag, computeAverageEvolution, daysAgo } from '../../domain/dailyProgress';

export function ReportsOverlay({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: User | null }) {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [daysRange, setDaysRange] = useState<7 | 30 | 90>(7);
  const [isLoading, setIsLoading] = useState(true);
  const [qualityStreak, setQualityStreak] = useState(0);
  const [dominantTag, setDominantTag] = useState<{ tag: string; count: number } | null>(null);
  const [evo7d, setEvo7d] = useState(0);
  const [evo30d, setEvo30d] = useState(0);

  useEffect(() => {
    if (!isOpen || !user) return;
    const loadData = async () => {
      setIsLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - daysRange);
      
      const startISO = start.toISOString();
      const endISO = end.toISOString();

      const sessions = await repository.listSessionsByDateRange(startISO, endISO);
      const allCases = await repository.listCases();
      
      const computed = computeReports(sessions, allCases, { startISO, endISO });
      setReports(computed);

      // Daily progress data
      const today = new Date().toISOString().split('T')[0];
      const progress90d = await repository.listDailyProgressByRange(daysAgo(90), today);
      const progress30d = progress90d.filter(p => p.date >= daysAgo(30));
      const progress7d = progress30d.filter(p => p.date >= daysAgo(7));

      setQualityStreak(computeQualityStreak(progress90d));
      setDominantTag(getDominantPlusOneTag(progress30d));
      setEvo7d(computeAverageEvolution(progress7d));
      setEvo30d(computeAverageEvolution(progress30d));

      setIsLoading(false);
    };
    loadData();
  }, [isOpen, daysRange, user]);

  if (!user) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Relatórios" fullScreen>
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <p className="text-subtext font-mono text-sm">Sem história. Só dados.</p>
          <select 
            value={daysRange.toString()} 
            onChange={(e) => setDaysRange(Number(e.target.value) as 7 | 30 | 90)}
            className="bg-panel border border-border rounded-lg px-3 py-1.5 text-text font-mono text-sm outline-none focus:border-subtext transition-colors appearance-none"
          >
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
        </div>

        {isLoading || !reports ? (
          <div className="text-center py-12 text-subtext font-mono">Carregando...</div>
        ) : (
          <div className="space-y-6">

            {/* Weekly Replay Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-panel p-5 rounded-xl border border-border">
                <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-3">Quality Streak</h3>
                <p className="text-3xl font-mono font-bold text-text">{qualityStreak}<span className="text-sm text-subtext ml-1">dias</span></p>
                <p className="text-xs text-subtext mt-2 font-mono">Dias seguidos com mínimo + melhoria.</p>
              </div>
              <div className="bg-panel p-5 rounded-xl border border-border">
                <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-3">+1 Dominante</h3>
                {dominantTag ? (
                  <>
                    <p className="text-xl font-mono font-bold text-text">{dominantTag.tag}</p>
                    <p className="text-xs text-subtext mt-2 font-mono">{dominantTag.count}x nos últimos 30d.</p>
                  </>
                ) : (
                  <p className="text-sm text-subtext font-mono">Nenhum +1 registrado.</p>
                )}
              </div>
              <div className="bg-panel p-5 rounded-xl border border-border">
                <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-3">Evolução</h3>
                <div className="flex items-baseline gap-3">
                  <div>
                    <p className="text-2xl font-mono font-bold text-text">{evo7d.toFixed(1)}</p>
                    <p className="text-[10px] text-subtext font-mono">7d</p>
                  </div>
                  <span className="text-subtext">vs</span>
                  <div>
                    <p className="text-2xl font-mono font-bold text-subtext">{evo30d.toFixed(1)}</p>
                    <p className="text-[10px] text-subtext font-mono">30d</p>
                  </div>
                </div>
                <p className="text-xs text-subtext mt-2 font-mono">Score médio (0-3).</p>
              </div>
            </div>

            <div className="bg-panel p-6 rounded-xl border border-border">
              <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-4">Casos Concluídos (Últimos {daysRange} dias)</h3>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: daysRange }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (daysRange - 1 - i));
                  const dateStr = d.toISOString().split('T')[0];
                  const count = reports.completedCasesByDay[dateStr] || 0;
                  
                  let bgClass = 'bg-white/5';
                  if (count > 0) bgClass = 'bg-emerald-500/20';
                  if (count > 2) bgClass = 'bg-emerald-500/40';
                  if (count > 4) bgClass = 'bg-emerald-500/60';
                  if (count > 6) bgClass = 'bg-emerald-500/80';
                  if (count > 8) bgClass = 'bg-emerald-500';

                  return (
                    <div 
                      key={dateStr} 
                      className={`w-3 h-3 rounded-sm ${bgClass} transition-colors`}
                      title={`${dateStr}: ${count} casos`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-panel p-6 rounded-xl border border-border">
                <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-4">Taxa: Começou vs Fugiu</h3>
                <p className="text-4xl font-mono font-bold text-text">{Math.round(reports.start2minRate * 100)}%</p>
                <p className="text-xs text-subtext mt-2 font-mono">{reports.do2minCount} começos em {reports.totalDelayVerdicts} tentativas.</p>
              </div>
              <div className="bg-panel p-6 rounded-xl border border-border">
                <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-4">Total de Sessões</h3>
                <p className="text-4xl font-mono font-bold text-text">{reports.totalSessions}</p>
                <p className="text-xs text-subtext mt-2 font-mono">Nos últimos {daysRange} dias.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-panel p-6 rounded-xl border border-border">
                <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-4">Top Desculpas</h3>
                <div className="space-y-3">
                  {reports.topExcuses.map((e, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-text font-mono truncate pr-4">{e.tag}</span>
                      <span className="text-sm text-subtext font-mono">{e.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-panel p-6 rounded-xl border border-border">
                <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-4">Casos Mais Adiados</h3>
                <div className="space-y-3">
                  {reports.mostDelayedCases.map((c, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-text font-mono truncate pr-4">{c.title}</span>
                      <span className="text-sm text-danger font-mono">{c.delayCount}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-panel p-6 rounded-xl border border-border">
              <h3 className="text-xs font-mono text-subtext uppercase tracking-widest mb-6">Horário do Adiamento</h3>
              <div className="flex items-end justify-between h-32 gap-1">
                {reports.delaysByHour.map((count, hour) => {
                  const max = Math.max(...reports.delaysByHour, 1);
                  const height = `${(count / max) * 100}%`;
                  return (
                    <div key={hour} className="flex flex-col items-center flex-1 group">
                      <div className="w-full flex items-end justify-center h-full relative">
                        <div className="w-full bg-border group-hover:bg-text transition-colors rounded-t-sm" style={{ height: count > 0 ? height : '2px' }} />
                        {count > 0 && <div className="absolute -top-6 opacity-0 group-hover:opacity-100 text-[10px] text-text font-mono">{count}</div>}
                      </div>
                      <span className="text-[10px] text-subtext mt-2 font-mono">{hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

