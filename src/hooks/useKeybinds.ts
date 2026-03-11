import { useEffect } from 'react';
import { repository } from '../data/store';

type KeybindAction = 
  | 'toggleCommandLine'
  | 'toggleThemePicker'
  | 'toggleReports'
  | 'toggleSettings'
  | 'quickCreate'
  | 'actionEnter'
  | 'actionDelay'
  | 'nav1' | 'nav2' | 'nav3' | 'nav4' | 'nav5'
  | 'closeOverlays'
  | 'toggleShortcuts'
  | 'toggleMode'
  | 'logDistraction'
  | 'toggleDailyReview'
  | 'toggleProfile'
  | 'toggleFriends'
  | 'toggleLeaderboard'
  | 'toggleCoop'
  | 'toggleLeague'
  | 'toggleCommunity'
  | 'toggleReplay';

export function useKeybinds(onAction: (action: KeybindAction) => void) {
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Check if user has keybinds enabled
      const user = await repository.getOrCreateUser();
      if (user.settings?.keybindsOn === false) return;

      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement).tagName
      ) || (e.target as HTMLElement).isContentEditable;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (!isInputFocused) {
          onAction('toggleCommandLine');
        } else {
          (e.target as HTMLElement).blur();
          onAction('closeOverlays');
        }
        return;
      }

      // If input is focused, don't trigger other shortcuts
      if (isInputFocused) return;

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onAction('toggleCommandLine');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onAction('toggleCommandLine');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onAction('toggleMode');
      } else if (e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        onAction('toggleThemePicker');
      } else if (e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onAction('toggleReports');
      } else if (e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onAction('toggleSettings');
      } else if (e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onAction('toggleDailyReview');
      } else if (e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onAction('toggleProfile');
      } else if (e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onAction('toggleFriends');
      } else if (e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onAction('toggleLeaderboard');
      } else if (e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        onAction('toggleCoop');
      } else if (e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        onAction('toggleLeague');
      } else if (e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        onAction('toggleCommunity');
      } else if (e.shiftKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        onAction('toggleReplay');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onAction('quickCreate');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onAction('actionEnter');
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onAction('actionDelay');
      } else if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        onAction('logDistraction');
      } else if (e.key === '1') {
        onAction('nav1');
      } else if (e.key === '2') {
        onAction('nav2');
      } else if (e.key === '3') {
        onAction('nav3');
      } else if (e.key === '4') {
        onAction('nav4');
      } else if (e.key === '5') {
        onAction('nav5');
      } else if (e.key === '?') {
        onAction('toggleShortcuts');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAction]);
}
