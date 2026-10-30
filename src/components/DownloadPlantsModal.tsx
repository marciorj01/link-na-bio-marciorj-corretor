import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2, Loader2, User, Phone, ShieldCheck, AlertCircle, MessageCircle } from 'lucide-react';
import { insertLead, createSignedStorageUrl } from '../services/supabase';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface DownloadPlantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  pdfFilename?: string;
  phone: string;
}

export const DownloadPlantsModal: React.FC<DownloadPlantsModalProps> = ({
  isOpen,
  onClose,
  projectName = 'Helbor VM125',
  pdfFilename = 'helbor-vm125-apresentacao.pdf',
  phone,
}) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const maskPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      return digits.length > 0 ? `(${digits}` : '';
    }
    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(maskPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanDigits = whatsapp.replace(/\D/g, '');
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Por favor, digite seu nome completo.');
      return;
    }
    if (cleanDigits.length < 10) {
      setErrorMessage('Por favor, informe um número de WhatsApp válido com DDD.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Grava o lead no Supabase na tabela 'leads'
      await insertLead({
        nome: name.trim(),
        telefone: whatsapp.trim(),
        empreendimento: projectName,
      });

      // 2. Gera URL temporária e assinada de 120 segundos do bucket privado 'plantas'
      const storageResult = await createSignedStorageUrl('plantas', pdfFilename, 120);

      if (storageResult.success && storageResult.signedUrl) {
        setSuccessMessage('Download liberado com sucesso!');
        // Abre o PDF assinado em uma nova aba
        window.open(storageResult.signedUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => {
          setIsLoading(false);
          onClose();
        }, 1800);
      } else {
        // Se o arquivo ainda não foi subido no Supabase Storage pelo corretor
        setErrorMessage(
          storageResult.error ||
            `O arquivo "${pdfFilename}" ainda não está disponível no Supabase Storage. Seus dados foram salvos!`
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro inesperado ao processar solicitação.');
      setIsLoading(false);
    }
  };

  const fallbackWhatsAppUrl = formatWhatsAppUrl(
    phone,
    `Olá Márcio, meu nome é ${name || 'um cliente interessado'}, tentei baixar as plantas do ${projectName} e gostaria de receber o PDF direto por aqui.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
      <div
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1C1E24] via-[#16171B] to-[#121316] border border-[#C5973D]/40 p-6 sm:p-7 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient gold accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C5973D] to-transparent opacity-85" />
        <div className="absolute -right-12 -top-12 w-36 h-36 bg-[#C5973D]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#9E9B95] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#C5973D]/15 border border-[#C5973D]/30 flex items-center justify-center text-[#C5973D] shrink-0">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5973D] block">
              Material Exclusivo em PDF
            </span>
            <h3 className="text-lg font-serif font-medium text-[#F8F7F4] leading-tight">
              Receba o material completo do {projectName}
            </h3>
          </div>
        </div>

        <p className="text-xs text-[#A6ABB7] leading-relaxed mb-5">
          Preencha seus dados abaixo para liberar o acesso imediato ao caderno de plantas, metragens e apresentação detalhada em alta resolução.
        </p>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2 animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">{errorMessage}</span>
            </div>
            {/* Fallback button if storage is missing the file */}
            <a
              href={fallbackWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Receber Plantas pelo WhatsApp</span>
            </a>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-[#C8CCD6] mb-1.5">
              Nome completo <span className="text-[#C5973D]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9B95]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0E0F12] border border-white/10 text-xs text-white placeholder-[#71717A] focus:border-[#C5973D] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#C8CCD6] mb-1.5">
              WhatsApp / Telefone com DDD <span className="text-[#C5973D]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9B95]" />
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={handlePhoneChange}
                placeholder="(41) 99999-9999"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0E0F12] border border-white/10 text-xs text-white placeholder-[#71717A] focus:border-[#C5973D] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || Boolean(successMessage)}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#B8872F] text-[#0E0F12] font-semibold text-xs tracking-wide shadow-lg shadow-[#C5973D]/20 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0E0F12]" />
                  <span>Gerando link seguro...</span>
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#0E0F12]" />
                  <span>Acesso Liberado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.2]" />
                  <span>Acessar Plantas Agora</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-[#71717A]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Seus dados estão protegidos e não serão compartilhados com terceiros.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
