import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowUp, ArrowDown, Minus, X } from 'lucide-react';
import { syncService } from '../../services/SyncService';
import { auth } from '../../firebase';

interface LeagueOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeagueOverlay: React.FC<LeagueOverlayProps> = ({ isOpen, onClose }) => {
  const [leagueState, setLeagueState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLeague();
    }
  }, [isOpen]);

  const loadLeague = async () => {
    setLoading(true);
    try {
      const state = await syncService.getLeagueState();
      setLeagueState(state);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-panel border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-text">Liga Semanal</h2>
                <p className="text-sm text-subtext">Compita com 30 usuários do mesmo nível</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-subtext hover:text-text hover:bg-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-border border-t-text rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {!auth?.currentUser && (
                <div className="text-center py-2 bg-text/10 rounded-lg text-subtext text-xs uppercase tracking-widest font-mono">Modo Offline Simulado</div>
              )}
              {!leagueState ? (
            <div className="text-center py-12 bg-bg rounded-xl border border-border">
              <Trophy className="w-12 h-12 text-subtext mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">Sem Liga no Momento</h3>
              <p className="text-sm text-subtext max-w-md mx-auto mb-6">
                Complete pelo menos uma sessão de foco esta semana para ser colocado em um grupo da liga.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-accent text-bg rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Começar a Focar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-bg rounded-xl border border-border">
                <div>
                  <div className="text-sm text-subtext uppercase tracking-wider mb-1">Liga Atual</div>
                  <div className="text-2xl font-bold text-text capitalize">Liga {leagueState.tier}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-subtext uppercase tracking-wider mb-1">Termina em</div>
                  <div className="text-xl font-mono text-text">2d 14h</div>
                </div>
              </div>

              <div className="bg-bg/50 rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-medium text-subtext uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-6">Usuário</div>
                  <div className="col-span-3 text-right">Pontos</div>
                  <div className="col-span-2 text-center">Tendência</div>
                </div>
                <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                  {/* Mock Data */}
                  {[
                    { rank: 1, handle: 'focus_master', score: 1250, trend: 'up', isMe: false },
                    { rank: 2, handle: 'study_bot', score: 1100, trend: 'same', isMe: false },
                    { rank: 3, handle: 'você', score: 950, trend: 'up', isMe: true },
                    { rank: 4, handle: 'procrastinator', score: 800, trend: 'down', isMe: false },
                    { rank: 5, handle: 'newbie', score: 450, trend: 'same', isMe: false },
                  ].map((entry) => (
                    <div
                      key={entry.rank}
                      className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                        entry.isMe ? 'bg-accent/10' : 'hover:bg-bg'
                      }`}
                    >
                      <div className="col-span-1 text-center font-mono text-sm text-subtext">
                        {entry.rank}
                      </div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-medium text-text">
                          {entry.handle.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`text-sm font-medium ${entry.isMe ? 'text-text font-bold' : 'text-text/80'}`}>
                          {entry.handle} {entry.isMe && '(Você)'}
                        </span>
                      </div>
                      <div className="col-span-3 text-right font-mono text-sm text-accent">
                        {entry.score}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {entry.trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-500" />}
                        {entry.trend === 'down' && <ArrowDown className="w-4 h-4 text-danger" />}
                        {entry.trend === 'same' && <Minus className="w-4 h-4 text-subtext" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-subtext px-2">
                <span>Top 5 sobem de liga</span>
                <span>Últimos 5 caem de liga</span>
              </div>
            </div>
          )}
          </div>
        )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
