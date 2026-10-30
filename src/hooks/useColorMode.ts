import { useState } from 'react';
import { ColorMode } from '../components/ThemeModeToggle';

const STORAGE_KEY = 'marciorogerio_color_mode';

export function useColorMode() {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as ColorMode;
        if (saved === 'light' || saved === 'dark') {
          return saved;
        }
      } catch (e) {
        // storage disabled
      }
    }
    return 'dark';
  });

  const setColorMode = (newMode: ColorMode) => {
    setColorModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (e) {
      // storage disabled
    }
  };

  const resolvedTheme: 'light' | 'dark' = colorMode;

  return {
    colorMode,
    resolvedTheme,
    setColorMode,
  };
}
