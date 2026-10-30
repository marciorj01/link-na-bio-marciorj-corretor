import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Share2, Smartphone } from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface ShareModalProps {
  name: string;
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  qrCodeUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  name,
  isOpen,
  onClose,
  phone,
  qrCodeUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://marciorjcorretor.com.br';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsAppMessage = `Olá! Segue o contato de ${name}, corretor de imóveis (CRECI-PR 59138) em Curitiba, Mandirituba e região: ${currentUrl}`;
  const shareWhatsAppUrl = formatWhatsAppUrl(phone, shareWhatsAppMessage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl bg-[#16171B] border border-white/10 p-6 shadow-2xl text-center z-10 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#9E9B95] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-full bg-[#C5973D]/15 text-[#E8D5A0] flex items-center justify-center mb-3">
          <Share2 className="w-5 h-5 stroke-[1.8]" />
        </div>

        <h3 className="text-xl font-serif font-medium text-[#F8F7F4] mb-1">
          Compartilhar Bio & Contato
        </h3>
        <p className="text-xs text-[#9E9B95] mb-5">
          Aponte a câmera do celular para abrir o minisite ou envie o link diretamente.
        </p>

        {/* QR Code Display Area (100% público e protegido) */}
        <div className="p-3.5 bg-white rounded-xl shadow-inner mb-5 flex flex-col items-center min-w-[180px]">
          {qrCodeUrl && qrCodeUrl.trim() !== '' ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code - ${name}`}
              className="w-40 h-40 object-contain rounded-lg"
            />
          ) : (
            <svg
              viewBox="0 0 120 120"
              className="w-40 h-40"
              fill="#0E0F12"
            >
              {/* Corner finder patterns */}
              <rect x="10" y="10" width="30" height="30" rx="3" fill="#0E0F12" />
              <rect x="16" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="21" y="21" width="8" height="8" rx="1" fill="#C5973D" />

              <rect x="80" y="10" width="30" height="30" rx="3" fill="#0E0F12" />
              <rect x="86" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="91" y="21" width="8" height="8" rx="1" fill="#C5973D" />

              <rect x="10" y="80" width="30" height="30" rx="3" fill="#0E0F12" />
              <rect x="16" y="86" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="21" y="91" width="8" height="8" rx="1" fill="#C5973D" />

              {/* Simulated QR data matrix dots */}
              <rect x="46" y="12" width="6" height="6" rx="1" />
              <rect x="56" y="12" width="6" height="6" rx="1" />
              <rect x="66" y="18" width="6" height="6" rx="1" />
              <rect x="46" y="26" width="6" height="6" rx="1" />
              <rect x="58" y="26" width="6" height="6" rx="1" />
              
              <rect x="14" y="46" width="6" height="6" rx="1" />
              <rect x="24" y="52" width="6" height="6" rx="1" />
              <rect x="34" y="46" width="6" height="6" rx="1" />
              
              <rect x="46" y="46" width="8" height="8" rx="1" fill="#C5973D" />
              <rect x="58" y="46" width="6" height="6" rx="1" />
              <rect x="68" y="52" width="6" height="6" rx="1" />
              <rect x="80" y="46" width="6" height="6" rx="1" />
              <rect x="92" y="46" width="6" height="6" rx="1" />
              <rect x="102" y="52" width="6" height="6" rx="1" />
              
              <rect x="46" y="60" width="6" height="6" rx="1" />
              <rect x="58" y="62" width="6" height="6" rx="1" />
              <rect x="70" y="60" width="6" height="6" rx="1" />
              
              <rect x="14" y="68" width="6" height="6" rx="1" />
              <rect x="26" y="66" width="6" height="6" rx="1" />
              <rect x="36" y="70" width="6" height="6" rx="1" />

              <rect x="46" y="80" width="6" height="6" rx="1" />
              <rect x="58" y="84" width="6" height="6" rx="1" />
              <rect x="70" y="80" width="6" height="6" rx="1" />
              <rect x="82" y="72" width="6" height="6" rx="1" />
              <rect x="94" y="80" width="6" height="6" rx="1" />
              <rect x="84" y="92" width="6" height="6" rx="1" />
              <rect x="98" y="94" width="6" height="6" rx="1" />
              <rect x="52" y="98" width="6" height="6" rx="1" />
              <rect x="66" y="98" width="6" height="6" rx="1" />
            </svg>
          )}
          <span className="text-[10px] font-mono uppercase text-[#151619]/60 tracking-wider mt-1.5">
            marciorjcorretor.com.br
          </span>
        </div>

        {/* Action Buttons: Copy Link & Share via WhatsApp */}
        <div className="w-full space-y-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#F8F7F4] border border-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#C5973D]" />
                <span className="text-[#C5973D]">Copiado para a área de transferência!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar link da bio</span>
              </>
            )}
          </button>

          <a
            href={shareWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#E8D5A0] border border-white/5 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Compartilhar via WhatsApp</span>
          </a>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#9E9B95]">
          <Smartphone className="w-3 h-3 text-[#C5973D]" />
          <span>Otimizado para Instagram Story e bio móvel</span>
        </div>
      </div>
    </div>
  );
};
