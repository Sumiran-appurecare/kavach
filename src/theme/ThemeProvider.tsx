import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, Palette } from './tokens';

export type ThemeChoice = 'system' | 'light' | 'dark';

type ThemeValue = {
  c: Palette;
  isDark: boolean;
  choice: ThemeChoice;
  setChoice: (choice: ThemeChoice) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [choice, setChoice] = useState<ThemeChoice>('system');

  const value = useMemo<ThemeValue>(() => {
    const isDark = choice === 'system' ? system === 'dark' : choice === 'dark';
    return { c: isDark ? dark : light, isDark, choice, setChoice };
  }, [choice, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
