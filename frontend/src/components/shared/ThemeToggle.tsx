import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { IconButton } from './IconButton';

export const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <IconButton label="Toggle theme" onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </IconButton>
  );
};
