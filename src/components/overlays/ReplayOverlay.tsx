import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Calendar, Share2, Download, TrendingUp, Clock, Target } from 'lucide-react';
import { syncService } from '../../services/SyncService';
import { auth } from '../../firebase';

interface ReplayOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReplayOverlay: React.FC<ReplayOverlayProps> = ({ isOpen, onClose }) => {
  const [replay, setReplay] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadReplay();
    }
  }, [isOpen]);

  const loadReplay = async () => {
    setLoading(true);
    try {
      const currentWeekId = '2026-W11';
      const data = await syncService.getWeeklyReplay(currentWeekId);
      setReplay(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert("Exportando replay como imagem...");
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
                <PlayCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-text">Replay Semanal</h2>
                <p className="text-sm text-subtext">Sua jornada de foco nesta semana</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-subtext hover:text-text hover:bg-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!auth?.currentUser && !loading && (
            <div className="text-center mb-6 py-2 bg-text/10 rounded-lg text-subtext text-xs uppercase tracking-widest font-mono">Modo Offline Simulado</div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-border border-t-text rounded-full animate-spin" />
            </div>
          ) : !replay ? (
            <div className="text-center py-12 bg-bg rounded-xl border border-border">
              <Calendar className="w-12 h-12 text-subtext mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">Sem Replay Disponível</h3>
              <p className="text-sm text-subtext max-w-md mx-auto mb-6">
                Complete mais sessões de foco esta semana para gerar seu replay semanal. Volte no domingo!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-accent text-bg rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Replay Content */}
              <div className="bg-bg rounded-2xl border border-border p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-text mb-1">Semana 11, 2026</h3>
                      <p className="text-accent/80">9 de Março - 15 de Março</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-subtext uppercase tracking-wider mb-1">Score de Foco</div>
                      <div className="text-3xl font-mono text-emerald-400">{replay.score || 850}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-panel border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 text-subtext mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Trabalho Profundo</span>
                      </div>
                      <div className="text-2xl font-medium text-text">{Math.floor((replay.totalMinutes || 120) / 60)}h {(replay.totalMinutes || 120) % 60}m</div>
                    </div>
                    <div className="bg-panel border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 text-subtext mb-2">
                        <Target className="w-4 h-4" />
                        <span className="text-sm">Sessões</span>
                      </div>
                      <div className="text-2xl font-medium text-text">{replay.sessionsCount || 5}</div>
                    </div>
                    <div className="bg-panel border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 text-subtext mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Consistência</span>
                      </div>
                      <div className="text-2xl font-medium text-text">{replay.consistencyScore || 92}%</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-subtext uppercase tracking-wider mb-3">Principais Conquistas</h4>
                    <ul className="space-y-2">
                      {(replay.highlights || ['Completou 3 casos sem adiar', 'Manteve ofensiva de 5 dias', 'Focou principalmente no "Projeto X"']).map((h: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text/80">
                          <span className="text-accent mt-0.5">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-bg text-text rounded-lg font-medium hover:bg-border border border-border transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar Imagem
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-bg rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
