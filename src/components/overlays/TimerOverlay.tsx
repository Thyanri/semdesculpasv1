import { useState, useEffect } from 'react';
import { ModalShell } from '../ModalShell';
import { repository } from '../../data/store';
import { Case } from '../../domain/models';
import { DistractionLogOverlay } from './DistractionLogOverlay';
import { syncService } from '../../services/SyncService';

interface TimerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: Case | null;
  onComplete?: (id: string) => void;
  onTimeUp?: () => void;
  onForceTribunal?: () => void;
  userMode?: string;
  onDeepComplete?: () => void;
}

export function TimerOverlay({ isOpen, onClose, caseItem, onComplete, onTimeUp, onForceTribunal, userMode, onDeepComplete }: TimerOverlayProps) {
  const [mode, setMode] = useState<"2min" | "25min" | "stopped">("2min");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isActive, setIsActive] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showDistractionLog, setShowDistractionLog] = useState(false);
  const [hasNotifiedTimeUp, setHasNotifiedTimeUp] = useState(false);
  const [sprintPrompt, setSprintPrompt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode("2min");
      setTimeLeft(userMode === 'sprint' ? 5 * 60 : 120);
      setIsActive(true);
      setBlockReason("");
      setShowDistractionLog(false);
      setHasNotifiedTimeUp(false);
      setSprintPrompt(false);
      syncService.logEvent('start2min', { caseId: caseItem?.id });
    } else {
      setIsActive(false);
    }
  }, [isOpen, userMode, caseItem?.id]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0 && !showDistractionLog) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          const newT = t - 1;
          if (userMode === 'sprint' && newT > 0 && newT % 60 === 0) {
            setSprintPrompt(true);
            setTimeout(() => setSprintPrompt(false), 3000);
          }
          return newT;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (userMode === 'chain' && onTimeUp && !hasNotifiedTimeUp) {
        setHasNotifiedTimeUp(true);
        onTimeUp();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, showDistractionLog, userMode, onTimeUp, hasNotifiedTimeUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && isActive && e.key.toLowerCase() === 'x' && !showDistractionLog) {
        // Prevent triggering if an input is focused
        const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        ) || (e.target as HTMLElement).isContentEditable;
        
        if (!isInputFocused) {
          e.preventDefault();
          setShowDistractionLog(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isActive, showDistractionLog]);

  const handleCompleteStep = async () => {
    await repository.updateStreak(new Date().toISOString());
    if (caseItem && onComplete) {
      onComplete(caseItem.id);
    } else {
      onClose();
    }
  };

  const handleStartDeepWork = () => {
    setMode("25min");
    setTimeLeft(25 * 60);
    setIsActive(true);
  };

  const handleStop = () => {
    if (userMode === 'no_escape') {
      if (onForceTribunal) {
        onForceTribunal();
      } else {
        onClose();
      }
      return;
    }
    setIsActive(false);
    setMode("stopped");
  };

  const handleFinalizeStop = async () => {
    if (blockReason.trim() && caseItem) {
      await repository.createSession({
        caseId: caseItem.id,
        actionAttempted: "start",
        excuseTag: "Travou",
        excuseText: blockReason,
        judgeCardId: "",
        verdict: "do2min"
      });
    }
    onClose();
  };

  const handleCompleteDeepWork = async () => {
    await repository.updateStreak(new Date().toISOString());
    if (caseItem) {
      await repository.createSession({
        caseId: caseItem.id,
        actionAttempted: "start",
        excuseTag: "",
        judgeCardId: "",
        verdict: "do2min",
        deepFocus: true
      });
      if (onDeepComplete) onDeepComplete();
      syncService.logEvent('deepSession', { caseId: caseItem.id });
      if (onComplete) {
        onComplete(caseItem.id);
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!caseItem) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <>
      <ModalShell isOpen={isOpen} onClose={onClose} fullScreen preventCloseOnClickOutside={userMode === 'no_escape'}>
        <div className="flex flex-col h-full items-center justify-center p-6 space-y-12 max-w-2xl mx-auto w-full text-center">
          
          {mode !== "stopped" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-sm font-mono text-subtext uppercase tracking-widest">
                {mode === "2min" ? "Só comece." : "Sessão Profunda"}
              </p>
              <h2 className="text-2xl font-bold text-text">{caseItem.nextPhysicalStep}</h2>
              <p className="text-xs text-subtext opacity-50">Pressione 'X' para registrar distração</p>
            </div>
          )}

          {mode !== "stopped" && (
            <div className="text-8xl sm:text-9xl font-mono font-bold text-text tracking-tighter animate-in zoom-in-95 relative">
              {mins}:{secs.toString().padStart(2, '0')}
              {sprintPrompt && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-500 text-white text-sm px-4 py-1 rounded-full animate-bounce font-sans">
                  Volta pro passo!
                </div>
              )}
            </div>
          )}

          {mode === "2min" && (
            <div className="flex flex-col sm:flex-row gap-4 w-full animate-in fade-in slide-in-from-bottom-4">
              <button className="flex-1 py-4 rounded-lg bg-text text-bg font-mono font-bold hover:opacity-90 transition-opacity" onClick={handleCompleteStep}>
                CONCLUÍ O PASSO
              </button>
              <button className="flex-1 py-4 rounded-lg bg-panel border border-border text-text font-mono hover:border-subtext transition-colors" onClick={handleStartDeepWork}>
                CONTINUAR (25 MIN)
              </button>
              <button className="flex-1 py-4 rounded-lg bg-transparent text-subtext font-mono hover:text-text transition-colors" onClick={handleStop}>
                PARAR
              </button>
            </div>
          )}

          {mode === "25min" && (
            <div className="flex flex-col sm:flex-row gap-4 w-full animate-in fade-in slide-in-from-bottom-4">
              <button className="flex-1 py-4 rounded-lg bg-text text-bg font-mono font-bold hover:opacity-90 transition-opacity" onClick={handleCompleteDeepWork}>
                CONCLUIR SESSÃO
              </button>
              <button className="flex-1 py-4 rounded-lg bg-transparent text-subtext font-mono hover:text-text transition-colors" onClick={handleStop}>
                INTERROMPER
              </button>
            </div>
          )}

          {mode === "stopped" && (
            <div className="w-full space-y-6 animate-in fade-in zoom-in-95 text-left bg-panel p-8 rounded-xl border border-border">
              <h2 className="text-2xl font-bold text-text">O que travou?</h2>
              <p className="text-subtext font-mono text-sm">Opcional. Registre o obstáculo para resolver depois.</p>
              <input 
                autoFocus
                placeholder="Ex: Faltou uma senha..." 
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono outline-none focus:border-subtext transition-colors"
              />
              <div className="flex gap-4 pt-4">
                <button className="flex-1 py-3 rounded-lg bg-transparent text-subtext font-mono hover:text-text transition-colors" onClick={onClose}>CANCELAR</button>
                <button className="flex-1 py-3 rounded-lg bg-text text-bg font-mono font-bold hover:opacity-90 transition-opacity" onClick={handleFinalizeStop}>FINALIZAR</button>
              </div>
            </div>
          )}

        </div>
      </ModalShell>
      
      {showDistractionLog && (
        <DistractionLogOverlay 
          caseId={caseItem.id} 
          onClose={() => setShowDistractionLog(false)} 
        />
      )}
    </>
  );
}
