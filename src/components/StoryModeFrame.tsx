import React from 'react';
import { Sparkles, LogOut, ShieldCheck, QrCode } from 'lucide-react';

interface StoryModeFrameProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isEditorOpen?: boolean;
  resolvedTheme?: 'light' | 'dark';
  onOpenShare?: () => void;
  onOpenEditor: () => void;
  onLogout: () => void;
}

export const StoryModeFrame: React.FC<StoryModeFrameProps> = ({
  children,
  isAuthenticated,
  isEditorOpen = false,
  resolvedTheme = 'dark',
  onOpenShare,
  onOpenEditor,
  onLogout,
}) => {
  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-colors duration-300 ${
        resolvedTheme === 'light' ? 'bg-[#ECE8DF] text-[#141519]' : 'bg-[#0A0B0D] text-[#F8F7F4]'
      }`}
    >
      {/* Top Floating Administration Bar (ONLY VISIBLE WHEN AUTHENTICATED) */}
      {isAuthenticated && (
        <div
          className={`w-full flex items-center justify-between px-4 md:px-6 py-2.5 bg-[#121316]/95 backdrop-blur-md border-b border-[#C5973D]/30 z-40 sticky top-0 shadow-lg animate-fade-in transition-all duration-300 ${
            isEditorOpen ? 'lg:pr-[500px] xl:pr-[560px]' : ''
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex items-center gap-1.5 text-[#E8D5A0] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#C5973D]" />
              <span>Painel do Corretor Ativo</span>
            </div>
            {isEditorOpen && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#C5973D]/20 text-[#E8D5A0] border border-[#C5973D]/30">
                Visualização ao Vivo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-[#D4D2CD] hover:text-white transition-colors"
                title="Compartilhar ou ver QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-[#C5973D]" />
                <span>QR Code</span>
              </button>
            )}

            {/* Studio & Canva Trigger */}
            <button
              onClick={onOpenEditor}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 ${
                isEditorOpen
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-[#C5973D] text-[#0E0F12] hover:brightness-110'
              }`}
              title="Abrir Studio de Personalização e Canva"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{isEditorOpen ? 'Painel Aberto' : 'Studio & Canva'}</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors border border-red-500/20"
              title="Sair do modo administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Shifts smoothly to the left on desktop when editor is open so minisite stays fully visible */}
      <main
        className={`w-full flex-1 flex flex-col items-center justify-start p-0 transition-all duration-300 ${
          isEditorOpen ? 'lg:mr-[480px] xl:mr-[540px]' : ''
        }`}
      >
        <div
          className={`minisite-frame w-full max-w-[480px] min-h-screen shadow-2xl flex flex-col transition-colors duration-300 ${
            resolvedTheme === 'light'
              ? 'bg-[#FAF8F5] border-x border-[#E2DBD0] text-[#141519]'
              : 'bg-[#0E0F12] border-x border-white/[0.04] text-[#F8F7F4]'
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
};
