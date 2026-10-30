import React from 'react';
import { Sun, Moon } from 'lucide-react';

export type ColorMode = 'light' | 'dark';

interface ThemeModeToggleProps {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  colorMode,
  onColorModeChange,
  className = '',
  size = 'sm',
}) => {
  const options: { mode: ColorMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'light',
      label: 'Claro',
      icon: <Sun className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    {
      mode: 'dark',
      label: 'Escuro',
      icon: <Moon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Selecionar modo de cor (Claro ou Escuro)"
      className={`inline-flex items-center p-1 rounded-full border transition-all duration-200 ${
        colorMode === 'light'
          ? 'bg-stone-100/90 border-stone-300/80 shadow-sm'
          : 'bg-[#16171B]/90 border-white/10 shadow-inner'
      } ${className}`}
    >
      {options.map(({ mode, label, icon }) => {
        const isActive = colorMode === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onColorModeChange(mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#C5973D] text-[#0E0F12] font-semibold shadow-xs scale-100'
                : colorMode === 'light'
                ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                : 'text-[#9E9B95] hover:text-[#F8F7F4] hover:bg-white/5'
            }`}
            title={`Modo ${label}`}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
