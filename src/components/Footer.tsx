import React, { useState } from 'react';
import { Instagram, Globe, Shield, Share2, Copy, Check, Unlock, Sparkles, LogOut } from 'lucide-react';
import { ThemeModeToggle, ColorMode } from './ThemeModeToggle';

interface FooterProps {
  name: string;
  creci: string;
  instagram: string;
  websiteUrl: string;
  disclaimer: string;
  city?: string;
  isAuthenticated: boolean;
  colorMode?: ColorMode;
  onColorModeChange?: (mode: ColorMode) => void;
  onOpenShare: () => void;
  onOpenEditor: () => void;
  onOpenLogin?: () => void;
  onLogout: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  name,
  creci,
  instagram,
  websiteUrl,
  disclaimer,
  city = 'Mandirituba · Curitiba · Paraná · Brasil',
  isAuthenticated,
  colorMode,
  onColorModeChange,
  onOpenShare,
  onOpenEditor,
  onOpenLogin,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);

  const cleanInstagramHandle = instagram.replace('@', '');
  const instagramUrl = `https://instagram.com/${cleanInstagramHandle}`;
  const displayWebsite = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="pt-8 pb-24 px-6 text-center border-t border-white/6 mt-6">
      {/* Brand Title */}
      <div className="mb-4">
        <h4 className="text-xl font-serif font-medium text-[#F8F7F4] mb-1">
          {name}
        </h4>
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#C5973D]">
          <Shield className="w-3.5 h-3.5" />
          <span className="tracking-wide">{creci}</span>
        </div>
      </div>

      {/* Social & Web Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#D4D2CD] mb-6">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#E8D5A0] transition-colors border border-white/5"
        >
          <Instagram className="w-3.5 h-3.5 text-[#C5973D]" />
          <span>{instagram}</span>
        </a>

        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#E8D5A0] transition-colors border border-white/5"
        >
          <Globe className="w-3.5 h-3.5 text-[#C5973D]" />
          <span>{displayWebsite}</span>
        </a>
      </div>

      {/* Quick utility actions: Copy Link & Share QR (Clean for all visitors) */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#9E9B95] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          title="Copiar link do perfil"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#C5973D]" />
              <span className="text-[#C5973D]">Link copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar link</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#9E9B95] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          title="Compartilhar ou ver QR Code"
        >
          <Share2 className="w-3.5 h-3.5 text-[#C5973D]" />
          <span>QR Code</span>
        </button>
      </div>

      {/* When Authenticated: Show admin toolbar in footer */}
      {isAuthenticated && (
        <div className="mb-6 inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[#1A1C22] border border-[#C5973D]/40 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium mr-1">
            <Unlock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </div>
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C5973D] text-[#0E0F12] font-semibold text-[11px] hover:brightness-105 transition-all"
          >
            <Sparkles className="w-3 h-3 fill-[#0E0F12]" />
            <span>Studio & Canva</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#9E9B95] hover:text-red-300 text-[11px] transition-colors"
            title="Sair do modo administrador"
          >
            <LogOut className="w-3 h-3" />
            <span>Sair</span>
          </button>
        </div>
      )}

      {/* Client theme selector in footer */}
      {colorMode && onColorModeChange && (
        <div className="flex flex-col items-center justify-center gap-1.5 mb-6">
          <span className="text-[11px] text-[#9E9B95] font-medium">Tema de Navegação</span>
          <ThemeModeToggle
            colorMode={colorMode}
            onColorModeChange={onColorModeChange}
            size="sm"
          />
        </div>
      )}

      {/* Legal & Compliance Disclaimer */}
      <p className="text-[11px] text-[#9E9B95]/80 font-light leading-relaxed max-w-sm mx-auto">
        {disclaimer}
      </p>

      {/* Location Seal */}
      <div className="mt-6 text-[10px] tracking-widest uppercase text-white/20">
        {city}
      </div>

      {/* Sessão ativa: visível EXCLUSIVAMENTE para o corretor quando já estiver logado (100% invisível para clientes) */}
      {isAuthenticated && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-red-400 transition-colors cursor-pointer"
            title="Sair da sessão de administrador"
          >
            <Unlock className="w-3 h-3 text-emerald-400/60" />
            <span>Sessão ativa · Sair</span>
          </button>
        </div>
      )}
    </footer>
  );
};
