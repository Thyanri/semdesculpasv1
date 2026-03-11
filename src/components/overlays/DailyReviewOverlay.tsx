import React, { useState, useEffect } from 'react';
import { repository } from '../../data/store';
import { Case } from '../../domain/models';
import { motion } from 'motion/react';
import { Play, XCircle, Calendar } from 'lucide-react';

interface DailyReviewOverlayProps {
  onClose: () => void;
  onStartCase: (c: Case) => void;
}

export function DailyReviewOverlay({ onClose, onStartCase }: DailyReviewOverlayProps) {
  const [mostDelayed, setMostDelayed] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const cases = await repository.listCases('active');
      if (cases.length > 0) {
        const sorted = [...cases].sort((a, b) => b.delayCount - a.delayCount);
        setMostDelayed(sorted[0]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-panel border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-border text-center">
          <h2 className="text-2xl font-serif italic text-text mb-1">Revisão Diária</h2>
          <p className="text-sm text-subtext">Encare a realidade.</p>
        </div>

        <div className="p-6">
          {mostDelayed ? (
            <div className="space-y-6">
              <div>
                <div className="text-xs text-danger uppercase tracking-widest font-semibold mb-2">Caso Mais Adiado</div>
                <div className="bg-bg border border-border rounded-xl p-4">
                  <h3 className="text-lg font-medium text-text mb-1">{mostDelayed.title}</h3>
                  <p className="text-sm text-subtext mb-3">{mostDelayed.nextPhysicalStep}</p>
                  <div className="inline-flex items-center px-2 py-1 rounded bg-danger/10 text-danger text-xs font-mono">
                    Adiado {mostDelayed.delayCount} vezes
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg text-text mb-4">Vai continuar mentindo?</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      onStartCase(mostDelayed);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl transition-colors font-medium"
                  >
                    <Play size={16} />
                    Fazer 2 min agora
                  </button>
                  <button
                    onClick={async () => {
                      await repository.updateCase(mostDelayed.id, { status: 'lie' });
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl transition-colors font-medium"
                  >
                    <XCircle size={16} />
                    Assumir que é mentira
                  </button>
                  <button
                    onClick={async () => {
                      // Simple schedule for tomorrow
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      await repository.createSchedule({
                        caseId: mostDelayed.id,
                        scheduledAt: tomorrow.toISOString(),
                        penaltyType: 'streak'
                      });
                      await repository.updateCase(mostDelayed.id, { status: 'archived' });
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-bg text-subtext hover:text-text hover:bg-border rounded-xl transition-colors font-medium"
                  >
                    <Calendar size={16} />
                    Agendar para amanhã
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-subtext">Nenhum caso ativo para revisar.</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-full transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
