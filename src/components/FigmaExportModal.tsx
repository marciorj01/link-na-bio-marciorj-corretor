import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download, Layers, Sparkles, Smartphone, Palette } from 'lucide-react';

interface FigmaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FigmaExportModal: React.FC<FigmaExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState(false);

  if (!isOpen) return null;

  // Prefer shared/preview applet URL or fallback to current origin
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-kerozsvxxqok67h74qxf4n-876870352705.us-east1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadTokens = () => {
    const tokens = {
      name: 'Márcio Rogério Corretor - Dark Luxury Design Tokens',
      version: '1.0.0',
      color: {
        background: {
          deep: '#0E0F12',
          card: '#151619',
          elevated: '#1D1F23',
        },
        gold: {
          primary: '#C5973D',
          champagne: '#D4AF37',
          soft: '#E8D5A0',
        },
        text: {
          primary: '#F8F7F4',
          secondary: '#D4D2CD',
          muted: '#9E9B95',
        },
      },
      typography: {
        display: 'Cormorant Garamond',
        body: 'Plus Jakarta Sans',
      },
    };

    const blob = new Blob([JSON.stringify(tokens, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'figma-tokens-marcio-rogerio.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-left">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-[#16171B] border border-[#C5973D]/40 p-6 shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#9E9B95] hover:text-white flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C5973D]/20 to-[#E8D5A0]/10 border border-[#C5973D]/40 flex items-center justify-center text-[#E8D5A0]">
            <Layers className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-medium text-[#F8F7F4] flex items-center gap-2">
              Exportar para o Figma
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#C5973D]/20 text-[#E8D5A0] font-semibold border border-[#C5973D]/30">
                Auto Layout
              </span>
            </h3>
            <p className="text-xs text-[#9E9B95]">
              Importe o mini-site como vetores, fontes e frames 100% editáveis no Figma.
            </p>
          </div>
        </div>

        {/* Option 1: Direct 1-Click Import (Recommended) */}
        <div className="rounded-xl bg-[#1C1E24] border border-white/8 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#C5973D]" />
            <h4 className="text-sm font-semibold text-[#F8F7F4]">
              Método 1: Importação Direta via Plugin (1 Clique)
            </h4>
          </div>
          <p className="text-xs text-[#D4D2CD] mb-3 leading-relaxed">
            Utilize o plugin oficial <strong className="text-white">html.to.design</strong> ou <strong className="text-white">HTML to Figma (Builder.io)</strong> para converter o site ao vivo em frames nativos do Figma:
          </p>

          {/* Copy URL Box */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0E0F12] border border-white/10 mb-3">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="bg-transparent text-xs text-[#E8D5A0] font-mono flex-1 outline-none truncate"
            />
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#C5973D] text-[#0E0F12] font-semibold text-xs transition-transform active:scale-95 shrink-0"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar URL</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Steps */}
          <div className="space-y-1.5 text-xs text-[#9E9B95] pl-1 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#E8D5A0] flex items-center justify-center shrink-0">1</span>
              <span>No Figma, abra o plugin <strong>html.to.design</strong> ou <strong>HTML to Figma</strong>.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#E8D5A0] flex items-center justify-center shrink-0">2</span>
              <span>Cole a URL copiada acima no campo de importação.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#E8D5A0] flex items-center justify-center shrink-0">3</span>
              <span>Escolha a viewport <strong>Mobile (430px)</strong> ou <strong>Story (1080×1920)</strong> e clique em <strong>Import</strong>.</span>
            </div>
          </div>

          <a
            href="https://www.figma.com/community/plugin/1159123024924461424/html-to-design"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#E8D5A0] border border-white/10 transition-colors"
          >
            <span>Abrir página do plugin no Figma Community</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Option 2: Design Tokens JSON */}
        <div className="rounded-xl bg-white/[0.02] border border-white/8 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#C5973D]" />
              <h4 className="text-sm font-semibold text-[#F8F7F4]">
                Tokens de Cores & Tipografia (Tokens Studio)
              </h4>
            </div>
          </div>
          <p className="text-xs text-[#9E9B95] mb-3 leading-relaxed">
            Baixe o arquivo de tokens compatível com o plugin <strong>Tokens Studio for Figma</strong> contendo toda a paleta Dark Luxury e tipografia oficial (`Cormorant Garamond` e `Plus Jakarta Sans`).
          </p>

          <button
            onClick={handleDownloadTokens}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#F8F7F4] border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>Baixar arquivo figma-design-tokens.json</span>
          </button>
        </div>

        {/* Proportions hint */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-[#9E9B95]">
          <Smartphone className="w-5 h-5 text-[#C5973D] shrink-0" />
          <div>
            <strong className="text-white block font-medium">Proporções recomendadas no Figma:</strong>
            <span>Canvas de <strong>430 × 932 px</strong> (iPhone 15 Pro Max) ou <strong>1080 × 1920 px</strong> (Story vertical).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
