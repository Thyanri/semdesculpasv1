import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileWarning, CheckCircle2, Plus } from 'lucide-react';
import { repository } from '../../data/store';
import { DebtItem } from '../../domain/models';

interface DebtListOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DebtListOverlay: React.FC<DebtListOverlayProps> = ({ isOpen, onClose }) => {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [newDebtTitle, setNewDebtTitle] = useState('');
  const [newDebtCost, setNewDebtCost] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadDebts();
    }
  }, [isOpen]);

  const loadDebts = async () => {
    const allDebts = await repository.listDebts();
    setDebts(allDebts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtTitle.trim()) return;

    await repository.createDebt({
      title: newDebtTitle.trim(),
      costInSessions: newDebtCost,
      status: 'pending'
    });

    setNewDebtTitle('');
    setNewDebtCost(1);
    loadDebts();
  };

  const handlePayDebt = async (id: string) => {
    await repository.updateDebt(id, { status: 'paid', paidAt: new Date().toISOString() });
    loadDebts();
  };

  if (!isOpen) return null;

  const pendingDebts = debts.filter(d => d.status === 'pending');
  const paidDebts = debts.filter(d => d.status === 'paid');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-panel border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger/10 rounded-lg">
                <FileWarning className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-text">Lista de Dívidas</h2>
                <p className="text-sm text-subtext">Tarefas que você deve focar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-subtext hover:text-text hover:bg-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddDebt} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newDebtTitle}
              onChange={(e) => setNewDebtTitle(e.target.value)}
              placeholder="Qual é a dívida?"
              className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text focus:outline-none focus:border-subtext"
            />
            <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3">
              <span className="text-xs text-subtext">Custo:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={newDebtCost}
                onChange={(e) => setNewDebtCost(parseInt(e.target.value) || 1)}
                className="w-12 bg-transparent text-sm text-text focus:outline-none text-center"
              />
            </div>
            <button
              type="submit"
              disabled={!newDebtTitle.trim()}
              className="px-4 py-2 bg-accent text-bg rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </form>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-subtext uppercase tracking-wider mb-3">Dívidas Pendentes ({pendingDebts.length})</h3>
              {pendingDebts.length === 0 ? (
                <div className="text-center py-8 bg-panel rounded-xl border border-border border-dashed">
                  <p className="text-sm text-subtext">Você não tem dívidas pendentes. Bom trabalho!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingDebts.map(debt => (
                    <div key={debt.id} className="flex items-center justify-between p-4 bg-panel rounded-xl border border-border hover:border-text/30 transition-colors">
                      <div>
                        <h4 className="text-text font-medium">{debt.title}</h4>
                        <p className="text-xs text-subtext mt-1">Custo: {debt.costInSessions} sess{debt.costInSessions > 1 ? 'ões' : 'ão'}</p>
                      </div>
                      <button
                        onClick={() => handlePayDebt(debt.id)}
                        className="px-4 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-bg rounded-lg text-sm font-medium transition-colors"
                      >
                        Pagar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {paidDebts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-subtext uppercase tracking-wider mb-3">Dívidas Pagas</h3>
                <div className="space-y-2 opacity-60">
                  {paidDebts.map(debt => (
                    <div key={debt.id} className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-text/80 line-through">{debt.title}</span>
                      </div>
                      <span className="text-xs text-subtext">
                        {new Date(debt.paidAt!).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
