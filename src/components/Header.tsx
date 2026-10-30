import React from 'react';
import { MarcioAvatar } from './MarcioAvatar';
import { ShieldCheck, MapPin, Share2 } from 'lucide-react';
import { ThemeModeToggle, ColorMode } from './ThemeModeToggle';

interface HeaderProps {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  creci: string;
  city?: string;
  colorMode?: ColorMode;
  onColorModeChange?: (mode: ColorMode) => void;
  onShareClick?: () => void;
  onSecretAccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  name,
  subtitle,
  avatarUrl,
  creci,
  city = 'Mandirituba, Curitiba e Região',
  colorMode,
  onColorModeChange,
  onShareClick,
  onSecretAccess,
}) => {
  const tapCountRef = React.useRef(0);
  const tapTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCreciTap = () => {
    if (!onSecretAccess) return;
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      onSecretAccess();
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 700);
    }
  };

  return (
    <header className="relative pt-5 pb-3 px-5 text-center flex flex-col items-center">
      {/* Top Controls: Modo de Cor (Claro / Escuro) */}
      <div className="w-full flex items-center justify-between mb-4 px-1">
        {colorMode && onColorModeChange ? (
          <ThemeModeToggle
            colorMode={colorMode}
            onColorModeChange={onColorModeChange}
            size="sm"
          />
        ) : <div />}

        {onShareClick && (
          <button
            type="button"
            onClick={onShareClick}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 hover:bg-white/10 text-[#9E9B95] hover:text-[#C5973D] border border-white/10 transition-colors"
            title="Compartilhar minisite"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        )}
      </div>

      {/* Top subtle decorative brand crest */}
      <div className="flex items-center gap-2 mb-4 text-[#C5973D]/80">
        <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#C5973D]/50" />
        <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#E8D5A0]/90">
          {city}
        </span>
        <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#C5973D]/50" />
      </div>

      {/* Professional Photo */}
      <div className="mb-5">
        <MarcioAvatar avatarUrl={avatarUrl} size="lg" />
      </div>

      {/* Name */}
      <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-[#F8F7F4] mb-1">
        {name}
      </h1>

      <p className="text-xs uppercase tracking-widest text-[#C5973D] font-medium mb-2.5">
        {subtitle || 'Corretor de Imóveis · Consultoria Imobiliária'}
      </p>

      {/* Subtitle / Trust marker */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#9E9B95] mb-2 select-none">
        <div
          onClick={handleCreciTap}
          className="flex items-center gap-1 text-[#C5973D] cursor-default"
          title={onSecretAccess ? undefined : 'CRECI Verificado'}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#E8D5A0]">{creci}</span>
        </div>
        <span aria-hidden="true" className="text-white/20">·</span>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#9E9B95]" />
          <span>{city}</span>
        </div>
      </div>

      {/* Hairline subtle divider */}
      <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C5973D]/40 to-transparent mt-2" />
    </header>
  );
};
