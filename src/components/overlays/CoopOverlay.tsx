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
    
    // If we have a roomId, listen to it
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
      alert("Failed to create room");
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
      alert("Failed to join room");
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
    if (roomId && room?.hostUid === auth.currentUser?.uid) {
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <Users className="w-5 h-5 text-gray-300" />
              </div>
              <h2 className="text-xl font-medium text-white">Co-op Session</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!roomId ? (
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h3 className="text-sm font-medium text-white mb-2">Create Room</h3>
                <p className="text-xs text-gray-400 mb-4">Start a new focus session and invite others.</p>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h3 className="text-sm font-medium text-white mb-2">Join Room</h3>
                <p className="text-xs text-gray-400 mb-4">Enter a room ID to join an existing session.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Room ID"
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={loading || !joinId}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/5">
                <div className="text-sm text-gray-400 mb-1">Room ID</div>
                <div className="font-mono text-lg text-white tracking-wider select-all">{roomId}</div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${room?.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-gray-300 capitalize">{room?.status || 'idle'}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Participants ({members.length})</h3>
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m.uid} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${m.presence === 'active' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                        <span className="text-sm text-white font-medium">{m.uid === auth.currentUser?.uid ? 'You' : m.uid.substring(0, 8)}</span>
                      </div>
                      {m.uid === room?.hostUid && (
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Host</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                {room?.hostUid === auth.currentUser?.uid && room?.status === 'idle' && (
                  <button
                    onClick={handleStart}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Session
                  </button>
                )}
                <button
                  onClick={handleLeave}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Room
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
