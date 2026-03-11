import React, { useState, useEffect } from 'react';
import { ModalShell } from '../ModalShell';
import { syncService } from '../../services/SyncService';
import { UserProfile, Friendship } from '../../domain/models';
import { auth } from '../../firebase';

interface FriendsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendsOverlay({ isOpen, onClose }: FriendsOverlayProps) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [handleInput, setHandleInput] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    setLoading(true);
    if (auth?.currentUser) {
      const fs = await syncService.getFriendships();
      setFriendships(fs);
      
      const uids = new Set<string>();
      fs.forEach(f => {
        if (f.user1Id !== auth.currentUser?.uid) uids.add(f.user1Id);
        if (f.user2Id !== auth.currentUser?.uid) uids.add(f.user2Id);
      });

      const profs: Record<string, UserProfile> = {};
      for (const uid of uids) {
        const p = await syncService.getUserProfile(uid);
        if (p) profs[uid] = p;
      }
      setProfiles(profs);
    }
    setLoading(false);
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim() || !auth?.currentUser) return;
    setAdding(true);
    try {
      await syncService.sendFriendRequest(handleInput.trim());
      setHandleInput("");
      await loadFriends();
    } catch (e: any) {
      alert(e.message || "Erro ao adicionar amigo.");
    }
    setAdding(false);
  };

  const handleAccept = async (friendshipId: string, targetUid: string) => {
    try {
      await syncService.acceptFriendRequest(friendshipId, targetUid);
      await loadFriends();
    } catch (e) {
      console.error("Error accepting friend request", e);
    }
  };

  if (!isOpen) return null;

  const pendingRequests = friendships.filter(f => f.status === 'pending' && f.actionUserId !== auth.currentUser?.uid);
  const sentRequests = friendships.filter(f => f.status === 'pending' && f.actionUserId === auth.currentUser?.uid);
  const acceptedFriends = friendships.filter(f => f.status === 'accepted');

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Amigos">
      <div className="space-y-8">
        {!auth?.currentUser ? (
          <div className="text-center py-8 text-subtext">Faça login no Perfil para adicionar amigos.</div>
        ) : loading ? (
          <div className="text-center py-8 text-subtext font-mono">Carregando...</div>
        ) : (
          <>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <span className="bg-bg border border-border rounded-l-lg px-4 py-2 text-subtext flex items-center">@</span>
              <input
                type="text"
                value={handleInput}
                onChange={e => setHandleInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="handle_do_amigo"
                className="flex-1 bg-bg border border-border rounded-r-lg px-4 py-2 text-text outline-none focus:border-subtext"
                required
              />
              <button 
                type="submit" 
                disabled={adding}
                className="bg-accent text-bg px-4 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
              >
                {adding ? '...' : 'Adicionar'}
              </button>
            </form>

            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-text uppercase tracking-wider">Pedidos Recebidos</h4>
                {pendingRequests.map(f => {
                  const uid = f.user1Id === auth.currentUser?.uid ? f.user2Id : f.user1Id;
                  const p = profiles[uid];
                  if (!p) return null;
                  return (
                    <div key={f.id} className="flex items-center justify-between bg-bg p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        {p.photoURL ? (
                          <img src={p.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-bold text-subtext">
                            {p.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-text">{p.displayName}</p>
                          <p className="text-xs text-subtext font-mono">@{p.handle}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAccept(f.id, uid)}
                        className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded hover:bg-emerald-500/30 transition-colors"
                      >
                        Aceitar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text uppercase tracking-wider">Seus Amigos</h4>
              {acceptedFriends.length === 0 ? (
                <p className="text-sm text-subtext italic">Nenhum amigo adicionado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {acceptedFriends.map(f => {
                    const uid = f.user1Id === auth.currentUser?.uid ? f.user2Id : f.user1Id;
                    const p = profiles[uid];
                    if (!p) return null;
                    return (
                      <div key={f.id} className="flex items-center justify-between bg-bg p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          {p.photoURL ? (
                            <img src={p.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-bold text-subtext">
                              {p.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-text">{p.displayName}</p>
                            <p className="text-xs text-subtext font-mono">@{p.handle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-text">{p.metrics.streak} dias 🔥</p>
                          <p className="text-xs font-mono text-subtext">{p.metrics.starts7d} inícios (7d)</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {sentRequests.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-medium text-subtext uppercase tracking-wider">Pedidos Enviados</h4>
                {sentRequests.map(f => {
                  const uid = f.user1Id === auth.currentUser?.uid ? f.user2Id : f.user1Id;
                  const p = profiles[uid];
                  if (!p) return null;
                  return (
                    <div key={f.id} className="flex items-center justify-between opacity-50">
                      <p className="text-sm text-text">@{p.handle}</p>
                      <p className="text-xs text-subtext">Pendente</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </ModalShell>
  );
}
