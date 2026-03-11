import { useEffect } from 'react';
import { repository } from '../data/store';

export function useTheme() {
  useEffect(() => {
    repository.getOrCreateUser().then(user => {
      const theme = user.settings?.theme || 'default-dark';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }, []);

  const setTheme = async (themeName: string) => {
    document.documentElement.setAttribute('data-theme', themeName);
    await repository.updateUser({ settings: { theme: themeName } });
  };

  return { setTheme };
}
