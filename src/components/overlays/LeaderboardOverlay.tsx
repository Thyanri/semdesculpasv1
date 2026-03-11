import { useState, useEffect } from 'react';
import { ModalShell } from '../ModalShell';
import { syncService } from '../../services/SyncService';
import { LeaderboardEntry, UserProfile } from '../../domain/models';
import { auth } from '../../firebase';

interface LeaderboardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardOverlay({ isOpen, onClose }: LeaderboardOverlayProps) {
  const [category, setCategory] = useState<'streak' | 'consistency' | 'courage' | 'focus'>('streak');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen, category, period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await syncService.getLeaderboard(category, period);
    setEntries(data);
    
    const uids = new Set<string>();
    data.forEach(e => uids.add(e.uid));
    
    const profs: Record<string, UserProfile> = {};
    for (const uid of uids) {
      const p = await syncService.getUserProfile(uid);
      if (p) profs[uid] = p;
    }
    setProfiles(profs);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Ranking Global">
      <div className="space-y-6">
        {!auth.currentUser && !loading && (
          <div className="text-center py-2 bg-text/10 rounded-lg text-subtext text-xs uppercase tracking-widest font-mono">Modo Offline Simulado</div>
        )}
        <>
            <div className="flex gap-2 bg-bg p-1 rounded-lg border border-border">
              {(['streak', 'consistency', 'courage', 'focus'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-colors ${category === c ? 'bg-accent text-bg' : 'text-subtext hover:text-text'}`}
                >
                  {c === 'streak' ? 'Streak' : c === 'consistency' ? 'Consistência' : c === 'courage' ? 'Coragem' : 'Foco'}
                </button>
              ))}
            </div>

            <div className="flex gap-2 justify-center">
              {(['weekly', 'monthly', 'allTime'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${period === p ? 'bg-white/10 text-text' : 'text-subtext hover:text-text'}`}
                >
                  {p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensal' : 'Geral'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-subtext font-mono">Carregando...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-subtext italic">Nenhum dado encontrado para este período.</div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, index) => {
                  const p = profiles[entry.uid];
                  if (!p) return null;
                  const currentUid = auth.currentUser?.uid || 'local';
                  const isMe = currentUid === entry.uid;
                  return (
                    <div key={entry.uid} className={`flex items-center justify-between p-3 rounded-lg border ${isMe ? 'bg-accent/10 border-accent/30' : 'bg-bg border-border'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-6 text-center font-mono font-bold text-subtext">
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          {p.photoURL ? (
                            <img src={p.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-bold text-subtext">
                              {p.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className={`text-sm font-bold ${isMe ? 'text-accent' : 'text-text'}`}>
                              {p.displayName} {isMe && '(Você)'}
                            </p>
                            <p className="text-xs text-subtext font-mono">@{p.handle}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-mono font-bold text-text">
                          {entry.score}
                          <span className="text-xs font-sans font-normal text-subtext ml-1">
                            {category === 'streak' || category === 'consistency' ? 'dias' : category === 'focus' ? 'min' : 'pts'}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
      </div>
    </ModalShell>
  );
}
