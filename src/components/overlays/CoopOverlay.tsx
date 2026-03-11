import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Play, Pause, LogOut, Plus } from 'lucide-react';
import { syncService } from '../../services/SyncService';
import { auth } from '../../firebase';

interface CoopOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoopOverlay: React.FC<CoopOverlayProps> = ({ isOpen, onClose }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    if (roomId) {
      const unsub = syncService.listenRoom(roomId, (r, m) => {
        setRoom(r);
        setMembers(m);
      });
      return () => unsub();
    }
  }, [isOpen, roomId]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const newRoomId = await syncService.createRoom(25, 'public');
      setRoomId(newRoomId);
    } catch (e) {
      console.error(e);
      alert("Falha ao criar sala");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinId) return;
    setLoading(true);
    try {
      await syncService.joinRoom(joinId);
      setRoomId(joinId);
    } catch (e) {
      console.error(e);
      alert("Falha ao entrar na sala");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (roomId) {
      await syncService.leaveRoom(roomId);
      setRoomId(null);
      setRoom(null);
      setMembers([]);
    }
  };

  const handleStart = async () => {
    if (roomId && room?.hostUid === auth?.currentUser?.uid) {
      await syncService.startRoom(roomId);
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
          className="bg-panel border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-bg rounded-lg">
                <Users className="w-5 h-5 text-text" />
              </div>
              <h2 className="text-xl font-medium text-text">Sessão Co-op</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-subtext hover:text-text hover:bg-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!roomId ? (
            <div className="space-y-6">
              <div className="p-4 bg-bg rounded-xl border border-border">
                <h3 className="text-sm font-medium text-text mb-2">Criar Sala</h3>
                <p className="text-xs text-subtext mb-4">Inicie uma sessão de foco e convide outros.</p>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-accent text-bg rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {loading ? 'Criando...' : 'Criar Sala'}
                </button>
              </div>

              <div className="p-4 bg-bg rounded-xl border border-border">
                <h3 className="text-sm font-medium text-text mb-2">Entrar em Sala</h3>
                <p className="text-xs text-subtext mb-4">Insira o ID da sala para participar.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="ID da Sala"
                    className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-subtext"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={loading || !joinId}
                    className="px-4 py-2 bg-accent/20 text-accent rounded-lg font-medium hover:bg-accent/30 transition-colors disabled:opacity-50"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-6 bg-bg rounded-xl border border-border">
                <div className="text-sm text-subtext mb-1">ID da Sala</div>
                <div className="font-mono text-lg text-text tracking-wider select-all">{roomId}</div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${room?.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-text capitalize">{room?.status || 'aguardando'}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-subtext mb-3 uppercase tracking-wider">Participantes ({members.length})</h3>
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m.uid} className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${m.presence === 'active' ? 'bg-emerald-500' : 'bg-subtext'}`} />
                        <span className="text-sm text-text font-medium">{m.uid === auth?.currentUser?.uid ? 'Você' : m.uid.substring(0, 8)}</span>
                      </div>
                      {m.uid === room?.hostUid && (
                        <span className="text-xs text-subtext bg-bg px-2 py-1 rounded border border-border">Host</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                {room?.hostUid === auth?.currentUser?.uid && room?.status === 'idle' && (
                  <button
                    onClick={handleStart}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent text-bg rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Sessão
                  </button>
                )}
                <button
                  onClick={handleLeave}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-danger/20 text-danger rounded-lg font-medium hover:bg-danger/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da Sala
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
