import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  CheckCircle2,
  Sparkles,
  User,
  Mail,
  Phone,
  ArrowRight,
  Lock,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { LeadMagnetConfig, CapturedLead } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface LeadMagnetBlockProps {
  leadMagnet?: LeadMagnetConfig;
  brokerPhone: string;
  brokerName: string;
  onLeadCaptured?: (lead: CapturedLead) => void;
  isLivePreview?: boolean;
}

export const LeadMagnetBlock: React.FC<LeadMagnetBlockProps> = ({
  leadMagnet,
  brokerPhone,
  brokerName,
  onLeadCaptured,
  isLivePreview = false,
}) => {
  if (!leadMagnet || leadMagnet.enabled === false) {
    return null;
  }

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Por favor, informe seu nome.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Por favor, informe um e-mail válido.');
      return;
    }

    setIsSubmitting(true);

    const newLead: CapturedLead = {
      id: `lead-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      phone: phone.trim() || undefined,
      createdAt: new Date().toISOString(),
      materialTitle: leadMagnet.title || 'Guia do Investidor Imobiliário',
    };

    // 1. Salvar no localStorage de leads
    try {
      const existing = localStorage.getItem('marciorogerio_captured_leads');
      const leadsList: CapturedLead[] = existing ? JSON.parse(existing) : [];
      leadsList.unshift(newLead);
      localStorage.setItem('marciorogerio_captured_leads', JSON.stringify(leadsList));
    } catch (e) {
      console.warn('Storage error:', e);
    }

    // 2. Notificar callback
    if (onLeadCaptured) {
      onLeadCaptured(newLead);
    }

    // 3. Tentar envio assíncrono para o backend ou PHP (se disponível)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      if (!res.ok) {
        await fetch('./lead.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead),
        });
      }
    } catch {
      try {
        await fetch('./lead.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead),
        });
      } catch {
        // Armazenado localmente com sucesso
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsUnlocked(true);
    }, 450);
  };

  const whatsappInquiryUrl = formatWhatsAppUrl(
    brokerPhone,
    `Olá ${brokerName}, acabei de baixar o "${leadMagnet.title}" (Nome: ${name || 'Investidor'}) e gostaria de conversar sobre oportunidades!`
  );

  return (
    <section
      className="lead-magnet-block my-6 relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#181A20] via-[#14151A] to-[#0F1014] border border-[#C5973D]/30 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.85)] flex flex-col transition-all duration-300"
      style={{
        padding: '3rem 1.5rem',
        gap: '2rem',
      }}
    >
      {/* Glow ambar sutil de fundo */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#C5973D]/12 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#C5973D]/8 rounded-full blur-2xl pointer-events-none" />

      {/* Header Tag / Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5973D]/15 border border-[#C5973D]/40 text-[#E8D5A0] text-[11px] font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C5973D]" />
          <span>{leadMagnet.tag || 'Material Gratuito Exclusivo'}</span>
        </div>
        {leadMagnet.badgeText && (
          <span className="text-[10px] text-[#9E9B95] font-medium flex items-center gap-1">
            <FileText className="w-3 h-3 text-[#C5973D]" />
            {leadMagnet.badgeText}
          </span>
        )}
      </div>

      {/* Título & Descrição */}
      <div className="space-y-2">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight">
          {leadMagnet.title}
        </h3>

        {leadMagnet.subtitle && (
          <p className="text-xs sm:text-sm text-[#E8D5A0] font-medium leading-snug">
            {leadMagnet.subtitle}
          </p>
        )}

        {leadMagnet.description && (
          <p className="text-xs text-[#9E9B95] leading-relaxed pt-1">
            {leadMagnet.description}
          </p>
        )}
      </div>

      {/* Destaque Visual / Capa Opcional */}
      {leadMagnet.coverImageUrl && (
        <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-white/10 group shadow-inner">
          <img
            src={leadMagnet.coverImageUrl}
            alt={leadMagnet.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/95 font-medium">
              <BookOpen className="w-4 h-4 text-[#C5973D]" />
              <span>Acesso Digital Imediato</span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Tópicos / Bullet Points */}
      {leadMagnet.bulletPoints && leadMagnet.bulletPoints.length > 0 && (
        <div className="space-y-2 bg-[#0E0F12]/70 p-3.5 rounded-xl border border-white/5">
          <p className="text-[11px] font-semibold text-[#E8D5A0] uppercase tracking-wider mb-1">
            O que você vai aprender neste material:
          </p>
          {leadMagnet.bulletPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-snug">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C5973D] shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      )}

      {/* Estado: DESBLOQUEADO (Download Pronto) */}
      {isUnlocked ? (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-[#1C1F26] to-[#121317] border border-emerald-500/40 animate-fade-in text-center space-y-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <Download className="w-5 h-5 animate-bounce" />
          </div>

          <div>
            <h4 className="text-sm sm:text-base font-semibold text-white">
              Acesso Liberado com Sucesso!
            </h4>
            <p className="text-xs text-emerald-400/90 mt-1">
              {leadMagnet.successMessage || 'Clique no botão abaixo para baixar seu exemplar agora.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <a
              href={leadMagnet.downloadFileUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#C5973D] text-[#0E0F12] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#C5973D]/25 hover:brightness-110 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Baixar Guia em PDF Agora</span>
            </a>

            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#252830] hover:bg-[#2e323c] text-[#E8D5A0] text-xs font-semibold border border-[#C5973D]/30 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#C5973D]" />
              <span>{leadMagnet.whatsappCtaText || 'Receber também no meu WhatsApp'}</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsUnlocked(false)}
            className="text-[11px] text-[#9E9B95] hover:text-white underline pt-1"
          >
            Baixar novamente com outro e-mail
          </button>
        </div>
      ) : (
        /* Formulário de Captura */
        <form onSubmit={handleSubmit} className="space-y-3 bg-[#111216]/90 p-4 rounded-xl border border-white/8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8D5A0] pb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>Preencha abaixo para liberar seu download instantâneo:</span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-[11px] text-[#9E9B95] mb-1">Seu Nome Completo *</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9B95]" />
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181A20] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C5973D] focus:ring-1 focus:ring-[#C5973D]"
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-[11px] text-[#9E9B95] mb-1">Seu Melhor E-mail *</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9B95]" />
              <input
                type="email"
                required
                placeholder="Ex: joao@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181A20] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C5973D] focus:ring-1 focus:ring-[#C5973D]"
              />
            </div>
          </div>

          {/* Telefone / WhatsApp (opcional para agilizar) */}
          <div>
            <label className="block text-[11px] text-[#9E9B95] mb-1">
              WhatsApp com DDD <span className="text-[10px] text-white/40">(opcional para receber no celular)</span>
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9B95]" />
              <input
                type="tel"
                placeholder="Ex: 41 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181A20] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C5973D] focus:ring-1 focus:ring-[#C5973D]"
              />
            </div>
          </div>

          {/* Botão de Liberação */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#C5973D] text-[#0E0F12] font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#C5973D]/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0E0F12] border-t-transparent rounded-full animate-spin" />
                Liberando seu acesso...
              </span>
            ) : (
              <>
                <span>{leadMagnet.buttonText || 'Quero Baixar Meu Guia Gratuito'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Selo de Segurança */}
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-[#9E9B95]">
            <Lock className="w-3 h-3 text-[#C5973D]" />
            <span>Seus dados estão 100% seguros. Não enviamos spam.</span>
          </div>
        </form>
      )}
    </section>
  );
};
