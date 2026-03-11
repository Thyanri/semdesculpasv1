import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { PillNav } from './components/PillNav';
import { Arena } from './components/Arena';
import { CommandLine } from './components/overlays/CommandLine';
import { ThemePicker } from './components/overlays/ThemePicker';
import { ReportsOverlay } from './components/overlays/ReportsOverlay';
import { SettingsOverlay } from './components/overlays/SettingsOverlay';
import { TribunalOverlay } from './components/overlays/TribunalOverlay';
import { TimerOverlay } from './components/overlays/TimerOverlay';
import { ShortcutsOverlay } from './components/overlays/ShortcutsOverlay';
import { QuickAddOverlay } from './components/overlays/QuickAddOverlay';
import { ModeSelectorOverlay } from './components/overlays/ModeSelectorOverlay';
import { DailyReviewOverlay } from './components/overlays/DailyReviewOverlay';
import { PlusOneModal } from './components/overlays/PlusOneModal';
import { ProfileOverlay } from './components/overlays/ProfileOverlay';
import { FriendsOverlay } from './components/overlays/FriendsOverlay';
import { LeaderboardOverlay } from './components/overlays/LeaderboardOverlay';
import { CoopOverlay } from './components/overlays/CoopOverlay';
import { LeagueOverlay } from './components/overlays/LeagueOverlay';
import { CommunityOverlay } from './components/overlays/CommunityOverlay';
import { ReplayOverlay } from './components/overlays/ReplayOverlay';
import { DebtListOverlay } from './components/overlays/DebtListOverlay';
import { useTheme } from './hooks/useTheme';
import { useKeybinds } from './hooks/useKeybinds';
import { repository } from './data/store';
import { User, Case, DailyProgress, PlusOneTag, MinimumType } from './domain/models';
import { ensureSeed } from './data/seed';
import { todayStr, markMinimumDone, markPlusOne, markClarityEdit, incrementFacedDelay } from './domain/dailyProgress';
import { AppAction, Overlay, parseCommand } from './domain/appActions';

export default function App() {
  useTheme();
  
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<Overlay>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [arenaFilter, setArenaFilter] = useState<'all' | 'today'>('all');
  const [chainCount, setChainCount] = useState(0);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const loadData = async () => {
    setIsLoading(true);
    await ensureSeed(repository);
    const u = await repository.getOrCreateUser();
    setUser(u);
    const c = await repository.listCases("active");
    c.sort((a, b) => {
      if (b.delayCount !== a.delayCount) return b.delayCount - a.delayCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setCases(c);
    const dp = await repository.getDailyProgress(todayStr());
    setTodayProgress(dp);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useKeybinds((action) => {
    if (action === 'closeOverlays') {
      if (user?.settings?.mode === 'no_escape' && activeOverlay === 'timer') {
        setActiveOverlay('tribunal');
        return;
      }
      setActiveOverlay('none');
      return;
    }
    
    if (activeOverlay !== 'none' && action !== 'toggleCommandLine') return;

    switch (action) {
      case 'toggleCommandLine':
        setActiveOverlay(prev => prev === 'commandLine' ? 'none' : 'commandLine');
        break;
      case 'toggleMode':
        setActiveOverlay('modeSelector');
        break;
      case 'toggleDailyReview':
        setActiveOverlay('dailyReview');
        break;
      case 'toggleProfile':
        setActiveOverlay('profile');
        break;
      case 'toggleFriends':
        setActiveOverlay('friends');
        break;
      case 'toggleLeaderboard':
        setActiveOverlay('leaderboard');
        break;
      case 'toggleCoop':
        setActiveOverlay('coop');
        break;
      case 'toggleLeague':
        setActiveOverlay('league');
        break;
      case 'toggleCommunity':
        setActiveOverlay('community');
        break;
      case 'toggleReplay':
        setActiveOverlay('replay');
        break;
      case 'toggleThemePicker':
        setActiveOverlay('themePicker');
        break;
      case 'toggleReports':
        setActiveOverlay('reports');
        break;
      case 'toggleSettings':
        setActiveOverlay('settings');
        break;
      case 'quickCreate':
        setActiveOverlay('quickAdd');
        break;
      case 'actionEnter':
        if (selectedCaseId) setActiveOverlay('timer');
        break;
      case 'actionDelay':
        if (selectedCaseId) setActiveOverlay('tribunal');
        break;
      case 'toggleShortcuts':
        setActiveOverlay('shortcuts');
        break;
      case 'nav1':
        setSelectedCaseId(null);
        break;
      case 'nav2':
        if (cases.length > 0 && !selectedCaseId) setSelectedCaseId(cases[0].id);
        break;
      case 'nav3':
        if (selectedCaseId) setActiveOverlay('tribunal');
        break;
      case 'nav4':
        setActiveOverlay('reports');
        break;
      case 'nav5':
        setActiveOverlay('settings');
        break;
    }
  });

  // ─── Central Dispatch ───────────────────────────────────────────
  const dispatch = async (action: AppAction) => {
    switch (action.type) {
      case 'createCase':
        await repository.createCase({ title: action.title, nextPhysicalStep: action.step, status: 'active', category: action.category });
        showToast('Caso criado.');
        loadData();
        break;
      case 'startCase': {
        const id = action.caseId || selectedCaseId;
        if (id) { setSelectedCaseId(id); setActiveOverlay('timer'); }
        break;
      }
      case 'completeCase': {
        const id = action.caseId || selectedCaseId;
        if (id) await handleCompleteCase(id);
        break;
      }
      case 'delayCase':
        if (selectedCaseId) setActiveOverlay('tribunal');
        break;
      case 'archiveCase': {
        const id = action.caseId || selectedCaseId;
        if (id) { await repository.updateCase(id, { status: 'archived' }); showToast('Caso arquivado.'); loadData(); }
        break;
      }
      case 'markLie': {
        const id = action.caseId || selectedCaseId;
        if (id) { await repository.updateCase(id, { status: 'lie' }); showToast('Marcado como mentira.'); loadData(); }
        break;
      }
      case 'scheduleCase': {
        const id = action.caseId || selectedCaseId;
        if (id && action.date) { await repository.updateCase(id, { nextDueDate: new Date(action.date).toISOString() }); showToast('Agendado.'); loadData(); }
        break;
      }
      case 'useTemplate': {
        const templates = await repository.listTemplates();
        const t = templates.find(t => t.name.toLowerCase() === action.name.toLowerCase());
        if (t) { await repository.createCase({ title: t.titlePrefix ? `${t.titlePrefix} ` : 'Novo Caso', nextPhysicalStep: t.defaultNextStep, status: 'active' }); showToast('Caso criado via template.'); loadData(); }
        break;
      }
      case 'createDebt':
        await repository.createDebt({ title: action.title, costInSessions: action.cost, status: 'pending' });
        showToast('Dívida adicionada.');
        loadData();
        break;
      case 'openOverlay':
        setActiveOverlay(action.overlay);
        break;
      case 'closeOverlay':
        setActiveOverlay('none');
        break;
      case 'toggleOverlay':
        setActiveOverlay(prev => prev === action.overlay ? 'none' : action.overlay);
        break;
      case 'selectCase':
        setSelectedCaseId(action.caseId);
        break;
      case 'toggleFilter':
        setArenaFilter(prev => prev === 'today' ? 'all' : 'today');
        break;
      case 'showPlusOne':
        setShowPlusOne(true);
        break;
      case 'noop':
        break;
    }
  };

  const handleTimeUp = () => {
    if (user?.settings?.mode === 'chain') {
      const newChainCount = chainCount + 1;
      if (newChainCount < 3) {
        setChainCount(newChainCount);
        const nextCase = cases.find(c => c.id !== selectedCaseId);
        if (nextCase) {
          setSelectedCaseId(nextCase.id);
        } else {
          setChainCount(0);
          setActiveOverlay('none');
        }
      } else {
        setChainCount(0);
        setActiveOverlay('none');
      }
    }
  };

  const handleCreateCase = async (title: string, step: string) => {
    await dispatch({ type: 'createCase', title, step });
  };

  // Auto-detect daily minimum completion from events
  const handleDailyEvent = async (eventType: MinimumType) => {
    const minimum = user?.settings?.dailyMinimum;
    if (minimum && minimum === eventType && !todayProgress?.minimumDone) {
      await markMinimumDone(repository, eventType);
      const dp = await repository.getDailyProgress(todayStr());
      setTodayProgress(dp);
    }
  };

  const handlePlusOne = async (tag: PlusOneTag) => {
    await markPlusOne(repository, tag);
    const dp = await repository.getDailyProgress(todayStr());
    setTodayProgress(dp);
    setShowPlusOne(false);
  };

  const handleCompleteCase = async (id: string) => {
    await repository.updateCase(id, { status: "done" });
    await handleDailyEvent('debtPaid');
    
    if (user?.settings?.mode === 'chain') {
      const newChainCount = chainCount + 1;
      if (newChainCount < 3) {
        setChainCount(newChainCount);
        const nextCase = cases.find(c => c.id !== id && c.status !== 'done');
        if (nextCase) {
          setSelectedCaseId(nextCase.id);
          setActiveOverlay('timer');
        } else {
          setChainCount(0);
          setSelectedCaseId(null);
          setActiveOverlay('none');
        }
      } else {
        setChainCount(0);
        setSelectedCaseId(null);
        setActiveOverlay('none');
      }
    } else {
      setSelectedCaseId(null);
      setActiveOverlay('none');
    }
    
    loadData();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-subtext font-mono">Carregando...</div>;

  const selectedCase = cases.find(c => c.id === selectedCaseId) || null;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar 
        user={user} 
        onOpenTheme={() => dispatch({ type: 'openOverlay', overlay: 'themePicker' })}
        onOpenReports={() => dispatch({ type: 'openOverlay', overlay: 'reports' })}
        onOpenSettings={() => dispatch({ type: 'openOverlay', overlay: 'settings' })}
        onOpenProfile={() => dispatch({ type: 'openOverlay', overlay: 'profile' })}
        onOpenFriends={() => dispatch({ type: 'openOverlay', overlay: 'friends' })}
        onOpenLeaderboard={() => dispatch({ type: 'openOverlay', overlay: 'leaderboard' })}
        onOpenCoop={() => dispatch({ type: 'openOverlay', overlay: 'coop' })}
        onOpenLeague={() => dispatch({ type: 'openOverlay', overlay: 'league' })}
        onOpenCommunity={() => dispatch({ type: 'openOverlay', overlay: 'community' })}
        onOpenReplay={() => dispatch({ type: 'openOverlay', overlay: 'replay' })}
        onOpenDebtList={() => dispatch({ type: 'openOverlay', overlay: 'debtList' })}
      />
      
      <Arena 
        cases={cases}
        selectedCaseId={selectedCaseId}
        onSelectCase={setSelectedCaseId}
        onStartCase={() => dispatch({ type: 'startCase' })}
        onDelayCase={() => dispatch({ type: 'delayCase' })}
        onCompleteCase={(c) => dispatch({ type: 'completeCase', caseId: c.id })}
        onQuickCreate={() => dispatch({ type: 'openOverlay', overlay: 'quickAdd' })}
        filter={arenaFilter}
        onFilterChange={setArenaFilter}
        hasDailyMinimum={!!user?.settings?.dailyMinimum}
        dailyMinimumDone={!!todayProgress?.minimumDone}
      />

      <PillNav 
        onNav={(tab) => {
          if (tab === 'inbox') setSelectedCaseId(null);
          if (tab === 'arena' && cases.length > 0 && !selectedCaseId) setSelectedCaseId(cases[0].id);
          if (tab === 'tribunal' && selectedCaseId) setActiveOverlay('tribunal');
          if (tab === 'reports') setActiveOverlay('reports');
          if (tab === 'debtList') setActiveOverlay('debtList');
          if (tab === 'settings') setActiveOverlay('settings');
        }}
        hasActiveCase={!!selectedCaseId}
      />

      <CommandLine 
        isOpen={activeOverlay === 'commandLine'} 
        onClose={() => setActiveOverlay('none')} 
        onExecute={(cmd) => dispatch(parseCommand(cmd, selectedCaseId))} 
      />
      <ThemePicker 
        isOpen={activeOverlay === 'themePicker'} 
        onClose={() => setActiveOverlay('none')} 
      />
      <ReportsOverlay 
        isOpen={activeOverlay === 'reports'} 
        onClose={() => setActiveOverlay('none')} 
        user={user} 
      />
      <SettingsOverlay 
        isOpen={activeOverlay === 'settings'} 
        onClose={() => setActiveOverlay('none')} 
        user={user} 
        onUserUpdate={loadData} 
      />
      <TribunalOverlay 
        isOpen={activeOverlay === 'tribunal'} 
        onClose={() => setActiveOverlay('none')} 
        caseItem={selectedCase}
        onVerdict={async () => {
          await handleDailyEvent('tribunalVerdict');
          await incrementFacedDelay(repository);
          loadData();
          setActiveOverlay('none');
          setShowPlusOne(true);
        }}
      />

      {activeOverlay === 'quickAdd' && (
        <QuickAddOverlay 
          onClose={() => setActiveOverlay('none')} 
          onCreated={loadData} 
        />
      )}
      {activeOverlay === 'modeSelector' && (
        <ModeSelectorOverlay 
          onClose={() => setActiveOverlay('none')} 
          currentMode={user?.settings?.mode}
          onModeChange={loadData}
        />
      )}
      {activeOverlay === 'dailyReview' && (
        <DailyReviewOverlay 
          onClose={() => setActiveOverlay('none')} 
          onStartCase={(c) => {
            setSelectedCaseId(c.id);
            setActiveOverlay('timer');
          }}
        />
      )}
      <TimerOverlay 
        isOpen={activeOverlay === 'timer'} 
        onClose={() => setActiveOverlay('none')} 
        caseItem={selectedCase}
        onComplete={async (id) => {
          await handleDailyEvent('start2min');
          handleCompleteCase(id);
          setShowPlusOne(true);
        }}
        onTimeUp={handleTimeUp}
        onForceTribunal={() => setActiveOverlay('tribunal')}
        userMode={user?.settings?.mode}
        onDeepComplete={async () => {
          await handleDailyEvent('deepSession');
          setShowPlusOne(true);
        }}
      />
      <ShortcutsOverlay 
        isOpen={activeOverlay === 'shortcuts'} 
        onClose={() => setActiveOverlay('none')} 
      />
      {showPlusOne && !todayProgress?.plusOneTag && (
        <PlusOneModal
          onSelect={handlePlusOne}
          onSkip={() => setShowPlusOne(false)}
        />
      )}
      <ProfileOverlay 
        isOpen={activeOverlay === 'profile'} 
        onClose={() => setActiveOverlay('none')} 
      />
      <FriendsOverlay 
        isOpen={activeOverlay === 'friends'} 
        onClose={() => setActiveOverlay('none')} 
      />
      <LeaderboardOverlay 
        isOpen={activeOverlay === 'leaderboard'} 
        onClose={() => setActiveOverlay('none')} 
      />
      <CoopOverlay 
        isOpen={activeOverlay === 'coop'} 
        onClose={() => setActiveOverlay('none')} 
      />
      <LeagueOverlay 
        isOpen={activeOverlay === 'league'} 
        onClose={() => setActiveOverlay('none')} 
      />
      <CommunityOverlay 
        isOpen={activeOverlay === 'community'} 
        onClose={() => setActiveOverlay('none')} 
      />
      <ReplayOverlay 
        isOpen={activeOverlay === 'replay'} 
        onClose={() => setActiveOverlay('none')} 
      />
      <DebtListOverlay 
        isOpen={activeOverlay === 'debtList'} 
        onClose={() => setActiveOverlay('none')} 
      />
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] bg-panel border border-border rounded-lg px-5 py-2.5 shadow-lg text-text text-sm font-mono animate-[fadeInUp_0.2s_ease-out]">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
