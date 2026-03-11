/**
 * Central Action Bus — "Sem Desculpas"
 * 
 * Single type that describes every possible user action.
 * UI buttons, keybinds, and command line all produce AppActions.
 */

export type Overlay =
  | 'none' | 'commandLine' | 'themePicker' | 'reports' | 'settings'
  | 'tribunal' | 'quickCreate' | 'timer' | 'shortcuts' | 'quickAdd'
  | 'modeSelector' | 'dailyReview' | 'profile' | 'friends'
  | 'leaderboard' | 'coop' | 'league' | 'community' | 'replay' | 'debtList';

export type AppAction =
  // --- Case CRUD ---
  | { type: 'createCase'; title: string; step: string; category?: string }
  | { type: 'startCase'; caseId?: string }
  | { type: 'completeCase'; caseId?: string }
  | { type: 'delayCase' }
  | { type: 'archiveCase'; caseId?: string }
  | { type: 'markLie'; caseId?: string }
  | { type: 'scheduleCase'; caseId?: string; date: string }
  // --- Template ---
  | { type: 'useTemplate'; name: string }
  // --- Debt ---
  | { type: 'createDebt'; title: string; cost: number }
  // --- Navigation ---
  | { type: 'openOverlay'; overlay: Overlay }
  | { type: 'closeOverlay' }
  | { type: 'toggleOverlay'; overlay: Overlay }
  | { type: 'selectCase'; caseId: string | null }
  | { type: 'toggleFilter' }
  // --- Daily Progress ---
  | { type: 'showPlusOne' }
  // --- No-op (unknown command) ---
  | { type: 'noop' };

/**
 * Parse a command-line string into an AppAction.
 * This eliminates the giant if/else chain in App.tsx.
 */
export function parseCommand(cmd: string, selectedCaseId: string | null): AppAction {
  const parts = cmd.trim().split(' ');
  const action = parts[0].toLowerCase();

  switch (action) {
    case 'new': {
      const titleMatch = cmd.match(/new\s+"([^"]+)"/);
      const stepMatch = cmd.match(/\/step\s+"([^"]+)"/);
      if (titleMatch && stepMatch) {
        return { type: 'createCase', title: titleMatch[1], step: stepMatch[1] };
      }
      return { type: 'noop' };
    }
    case 'start': {
      const id = parts[1] || selectedCaseId || undefined;
      return { type: 'startCase', caseId: id };
    }
    case 'delay':
      return { type: 'delayCase' };
    case 'done': {
      const id = parts[1] || selectedCaseId || undefined;
      return { type: 'completeCase', caseId: id };
    }
    case 'archive':
      return { type: 'archiveCase', caseId: parts[1] || selectedCaseId || undefined };
    case 'lie':
      return { type: 'markLie', caseId: parts[1] || selectedCaseId || undefined };
    case 'report':
    case 'reports':
      return { type: 'openOverlay', overlay: 'reports' };
    case 'theme':
      return { type: 'openOverlay', overlay: 'themePicker' };
    case 'mode':
      return { type: 'openOverlay', overlay: 'modeSelector' };
    case 'review':
      return { type: 'openOverlay', overlay: 'dailyReview' };
    case 'profile':
      return { type: 'openOverlay', overlay: 'profile' };
    case 'friends':
      return { type: 'openOverlay', overlay: 'friends' };
    case 'coop':
      return { type: 'openOverlay', overlay: 'coop' };
    case 'league':
      return { type: 'openOverlay', overlay: 'league' };
    case 'community':
      return { type: 'openOverlay', overlay: 'community' };
    case 'replay':
      return { type: 'openOverlay', overlay: 'replay' };
    case 'shortcuts':
      return { type: 'openOverlay', overlay: 'shortcuts' };
    case '+1':
      return { type: 'showPlusOne' };
    case 'today':
      return { type: 'toggleFilter' };
    case 'template': {
      if (parts[1] === 'list') return { type: 'openOverlay', overlay: 'quickAdd' };
      if (parts[1] === 'use') {
        const nameMatch = cmd.match(/use\s+"([^"]+)"/);
        if (nameMatch) return { type: 'useTemplate', name: nameMatch[1] };
      }
      return { type: 'noop' };
    }
    case 'schedule': {
      const id = parts[1] || selectedCaseId || undefined;
      const date = parts[2];
      if (id && date) return { type: 'scheduleCase', caseId: id, date };
      return { type: 'noop' };
    }
    case 'debt':
    case 'debts': {
      if (parts[1] === 'add') {
        const titleMatch = cmd.match(/add\s+"([^"]+)"/);
        const costMatch = cmd.match(/cost\s+(\d+)/);
        if (titleMatch) {
          return { type: 'createDebt', title: titleMatch[1], cost: costMatch ? parseInt(costMatch[1]) : 1 };
        }
      }
      return { type: 'openOverlay', overlay: 'debtList' };
    }
    default:
      return { type: 'noop' };
  }
}

/**
 * All available commands for fuzzy matching in the CommandLine UI.
 */
export const COMMAND_CATALOG = [
  { cmd: 'new "titulo" /step "passo"', desc: 'Criar caso' },
  { cmd: 'start [id]', desc: 'Iniciar 2 min' },
  { cmd: 'delay', desc: 'Adiar caso atual' },
  { cmd: 'done [id]', desc: 'Concluir' },
  { cmd: 'archive [id]', desc: 'Arquivar caso' },
  { cmd: 'template list', desc: 'Listar templates' },
  { cmd: 'template use "nome"', desc: 'Usar template' },
  { cmd: 'schedule [id] YYYY-MM-DD', desc: 'Agendar caso' },
  { cmd: 'today', desc: 'Filtrar hoje' },
  { cmd: 'review', desc: 'Daily Review' },
  { cmd: '+1', desc: 'Marcar +1 do dia' },
  { cmd: 'report', desc: 'Relatórios' },
  { cmd: 'theme', desc: 'Mudar tema' },
  { cmd: 'mode', desc: 'Mudar modo' },
  { cmd: 'shortcuts', desc: 'Atalhos de teclado' },
  { cmd: 'profile', desc: 'Perfil Social' },
  { cmd: 'friends', desc: 'Amigos' },
  { cmd: 'coop', desc: 'Co-op Session' },
  { cmd: 'league', desc: 'Ligas Semanais' },
  { cmd: 'community', desc: 'Comunidade' },
  { cmd: 'replay', desc: 'Weekly Replay' },
  { cmd: 'debt', desc: 'Ver Dívidas' },
  { cmd: 'debt add "Title" cost 1', desc: 'Adicionar Dívida' },
];
