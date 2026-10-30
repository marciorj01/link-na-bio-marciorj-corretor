import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, MessageCircle, Share2, Smartphone, Upload, Image as ImageIcon } from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/whatsapp';

const QRCODE_STORAGE_KEY = 'marciorogerio_custom_qrcode';

interface ShareModalProps {
  name: string;
  isOpen: boolean;
  onClose: () => void;
  phone: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  name,
  isOpen,
  onClose,
  phone,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://marciorjcorretor.com.br';

  // Carregar QR Code salvo no localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(QRCODE_STORAGE_KEY);
      if (saved) setQrCodeImage(saved);
    } catch (e) {
      // storage disabled
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQrUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que é imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem (PNG, JPG ou WEBP).');
      return;
    }

    // Limitar tamanho a 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setQrCodeImage(dataUrl);
      try {
        localStorage.setItem(QRCODE_STORAGE_KEY, dataUrl);
      } catch (err) {
        console.warn('Não foi possível salvar QR Code no localStorage:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQr = () => {
    setQrCodeImage(null);
    try {
      localStorage.removeItem(QRCODE_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const shareWhatsAppMessage = `Olá! Segue o contato de ${name}, corretor de imóveis (CRECI-PR 59138) em Mandirituba, Curitiba e região: ${currentUrl}`;
  const shareWhatsAppUrl = formatWhatsAppUrl(phone, shareWhatsAppMessage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl bg-[#16171B] border border-white/10 p-6 shadow-2xl text-center z-10 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#9E9B95] hover:text-white flex items-center justify-center transition-colors"
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
          {qrCodeImage
            ? 'Aponte a câmera do celular para abrir o minisite ou envie o link diretamente.'
            : 'Envie seu QR Code personalizado para compartilhar o minisite.'}
        </p>

        {/* QR Code Area */}
        <div className="p-3.5 bg-white rounded-xl shadow-inner mb-4 flex flex-col items-center min-w-[180px]">
          {qrCodeImage ? (
            <>
              <img
                src={qrCodeImage}
                alt="QR Code personalizado"
                className="w-40 h-40 object-contain"
              />
              <span className="text-[10px] font-mono uppercase text-[#151619]/60 tracking-wider mt-1">
                marciorogeriocorretor.com.br
              </span>
            </>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-40 h-40 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#C5973D] hover:bg-[#C5973D]/5 transition-colors cursor-pointer group"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-[#C5973D] transition-colors" />
              <span className="text-[11px] font-medium text-gray-500 group-hover:text-[#C5973D] transition-colors text-center leading-tight">
                Clique para subir<br />seu QR Code
              </span>
            </button>
          )}
        </div>

        {/* Upload / Change / Remove QR Code buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#E8D5A0] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{qrCodeImage ? 'Trocar QR Code' : 'Subir QR Code'}</span>
          </button>

          {qrCodeImage && (
            <button
              onClick={handleRemoveQr}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Remover</span>
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleQrUpload}
          className="hidden"
        />

        {/* Copy Link Button */}
        <div className="w-full space-y-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#F8F7F4] border border-white/10 transition-colors"
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
