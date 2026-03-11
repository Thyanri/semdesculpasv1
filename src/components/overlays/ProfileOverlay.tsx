import React, { useState, useEffect } from 'react';
import { ModalShell } from '../ModalShell';
import { syncService } from '../../services/SyncService';
import { UserProfile, PrivacySetting } from '../../domain/models';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface ProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileOverlay({ isOpen, onClose }: ProfileOverlayProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [handleInput, setHandleInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    if (auth?.currentUser) {
      const p = await syncService.getUserProfile(auth.currentUser.uid);
      setProfile(p);
    } else {
      // Offline fallback
      const p = await syncService.getUserProfile('local');
      setProfile(p);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    try {
      if (!auth) return;
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await loadProfile();
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    setProfile(null);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim() || !auth?.currentUser) return;
    setIsCreating(true);
    try {
      // Check if handle exists
      const existing = await syncService.getProfileByHandle(handleInput.trim());
      if (existing) {
        alert("Handle já está em uso.");
        setIsCreating(false);
        return;
      }
      const p = await syncService.createProfile(handleInput.trim(), auth!.currentUser!.displayName || 'Usuário');
      if (p) setProfile(p);
    } catch (e) {
      console.error("Error creating profile", e);
    }
    setIsCreating(false);
  };

  const handlePrivacyChange = async (privacy: PrivacySetting) => {
    if (!profile) return;
    setProfile({ ...profile, privacy });
    await syncService.updateProfile({ privacy });
  };

  if (!isOpen) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Perfil Social">
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8 text-subtext font-mono">Carregando...</div>
        ) : profile ? (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-16 h-16 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center text-xl font-bold text-subtext">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-text">{profile.displayName}</h3>
                <p className="text-subtext font-mono">@{profile.handle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg p-4 rounded-xl border border-border">
                <p className="text-xs text-subtext uppercase tracking-wider mb-1">Streak Atual</p>
                <p className="text-2xl font-mono font-bold text-text">{profile.metrics.streak} <span className="text-sm font-sans font-normal text-subtext">dias</span></p>
              </div>
              <div className="bg-bg p-4 rounded-xl border border-border">
                <p className="text-xs text-subtext uppercase tracking-wider mb-1">Dias Ativos (7d)</p>
                <p className="text-2xl font-mono font-bold text-text">{profile.metrics.activeDays7d} <span className="text-sm font-sans font-normal text-subtext">/ 7</span></p>
              </div>
              <div className="bg-bg p-4 rounded-xl border border-border">
                <p className="text-xs text-subtext uppercase tracking-wider mb-1">Inícios (7d)</p>
                <p className="text-2xl font-mono font-bold text-text">{profile.metrics.starts7d}</p>
              </div>
              <div className="bg-bg p-4 rounded-xl border border-border">
                <p className="text-xs text-subtext uppercase tracking-wider mb-1">Foco Profundo (7d)</p>
                <p className="text-2xl font-mono font-bold text-text">{profile.metrics.deepMinutes7d} <span className="text-sm font-sans font-normal text-subtext">min</span></p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text">Privacidade</h4>
              <div className="flex gap-2">
                {(['private', 'friends', 'public'] as PrivacySetting[]).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePrivacyChange(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${profile.privacy === p ? 'bg-accent text-bg' : 'bg-bg text-subtext hover:text-text border border-border'}`}
                  >
                    {p === 'private' ? 'Privado' : p === 'friends' ? 'Amigos' : 'Público'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-subtext">
                {profile.privacy === 'private' && 'Apenas você vê suas métricas.'}
                {profile.privacy === 'friends' && 'Apenas seus amigos veem suas métricas.'}
                {profile.privacy === 'public' && 'Qualquer um pode ver suas métricas e você aparece no ranking global.'}
              </p>
            </div>

            <div className="pt-4 border-t border-border flex justify-between">
              {auth?.currentUser && (
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-400 transition-colors">
                  Sair da conta
                </button>
              )}
              {!profile && (
                <button onClick={() => setProfile(null)} className="text-sm text-subtext hover:text-text transition-colors">
                  Voltar
                </button>
              )}
            </div>
          </div>
        ) : !auth?.currentUser ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-subtext">Você está rodando localmente sem Firebase. Perfil offline ativado.</p>
            <button 
              onClick={() => {
                syncService.getUserProfile('local').then(p => setProfile(p));
              }}
              className="bg-accent text-bg px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Ver Perfil Offline
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <p className="text-text font-medium">Crie seu perfil social</p>
            <p className="text-sm text-subtext">Escolha um handle único para que seus amigos possam te encontrar.</p>
            <div className="flex gap-2">
              <span className="bg-bg border border-border rounded-l-lg px-4 py-2 text-subtext flex items-center">@</span>
              <input
                type="text"
                value={handleInput}
                onChange={e => setHandleInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="seu_handle"
                className="flex-1 bg-bg border border-border rounded-r-lg px-4 py-2 text-text outline-none focus:border-subtext"
                required
                minLength={3}
                maxLength={20}
              />
            </div>
            <button 
              type="submit" 
              disabled={isCreating}
              className="w-full bg-accent text-bg px-4 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
            >
              {isCreating ? 'Criando...' : 'Criar Perfil'}
            </button>
          </form>
        )}
      </div>
    </ModalShell>
  );
}
