import React from 'react';
import { Key, ArrowRight, ExternalLink, MessageCircle, Building2, Info } from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import { PartnershipCard } from '../types';

interface SellerBlockProps {
  title?: string;
  description?: string;
  ctaText?: string;
  whatsappMessage?: string;
  phone: string;
  comparisonNote?: string;
  cards?: PartnershipCard[];
  // For backwards compatibility
  quintoAndarCtaText?: string;
  quintoAndarUrl?: string;
}

export const SellerBlock: React.FC<SellerBlockProps> = ({
  title = 'Quer vender ou alugar seu imóvel?',
  description = 'Anuncie com quem é parceiro Loft e QuintoAndar. Para locação: seguro locação — você recebe todo mês, mesmo se o inquilino atrasar. Para venda: avaliação precisa, fotos profissionais e divulgação nas maiores vitrines do país.',
  ctaText = 'Quero vender ou alugar meu imóvel',
  whatsappMessage = 'Olá Márcio, tenho um imóvel e gostaria de conversar sobre avaliação, vistoria e possibilidades de venda ou locação.',
  phone,
  comparisonNote = 'A Loft oferece simulação de financiamento; o QuintoAndar não.',
  cards,
  quintoAndarCtaText = 'Cadastrar meu imóvel no QuintoAndar',
  quintoAndarUrl = 'https://www.quintoandar.com.br/anunciar-imovel',
}) => {
  const mainWhatsappUrl = formatWhatsAppUrl(phone, whatsappMessage);

  // If no cards are passed from config, use the standard 2 partnership cards
  const displayCards: PartnershipCard[] = cards && cards.length > 0
    ? cards.filter((c) => c.enabled !== false)
    : [
        {
          id: 'card-loft',
          title: 'Parceiro Loft',
          badge: 'Venda & Locação',
          description:
            'Venda e locação nas maiores vitrines do país, com seguro locação garantido e simulação de financiamento.',
          buttonText: 'Falar no WhatsApp',
          buttonType: 'whatsapp',
          whatsappMessage:
            'Olá Márcio, tenho um imóvel e gostaria de conversar sobre a parceria com a Loft.',
          enabled: true,
        },
        {
          id: 'card-quintoandar',
          title: 'Parceiro QuintoAndar',
          badge: '100% Digital',
          description:
            'Venda e locação sem burocracia: fotos profissionais, visitas agendadas e contrato 100% digital.',
          buttonText: quintoAndarCtaText || 'Cadastrar meu imóvel',
          buttonType: 'url',
          url: quintoAndarUrl || 'https://www.quintoandar.com.br/anunciar-imovel',
          enabled: true,
        },
      ];

  return (
    <section className="seller-block px-5 py-4">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#18191E] to-[#121316] p-5 sm:p-6 border border-white/8 hover:border-[#C5973D]/30 transition-all duration-300 shadow-xl overflow-hidden group text-left">
        {/* Subtle background glow */}
        <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-[#C5973D]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Small editorial category tag */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-[#C5973D] mb-2.5">
          <Key className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Para Proprietários</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-serif font-medium text-[#F8F7F4] mb-4">
          {title}
        </h2>

        {/* 2 Separate Partnership Cards: container grid responsivo com auto-fit minmax(280px, 1fr) */}
        <div
          className="grid gap-4 items-stretch"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            alignItems: 'stretch',
          }}
        >
          {displayCards.map((card) => {
            const isWhatsapp = card.buttonType === 'whatsapp';
            const cardUrl = isWhatsapp
              ? formatWhatsAppUrl(phone, card.whatsappMessage || whatsappMessage)
              : (card.url || '#');

            return (
              <div
                key={card.id}
                className="card w-full rounded-xl bg-[#20232A]/90 hover:bg-[#20232A] border border-white/8 hover:border-[#C5973D]/40 transition-all duration-200"
                style={{
                  minHeight: '250px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  wordWrap: 'break-word',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#C5973D]/15 flex items-center justify-center text-[#C5973D] shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-serif font-medium text-[#F8F7F4] leading-snug break-words">
                        {card.title}
                      </h3>
                    </div>
                    {card.badge && (
                      <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#C5973D] font-medium shrink-0">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#D4D2CD] leading-relaxed mb-4 font-light break-words">
                    {card.description}
                  </p>
                </div>

                {/* Exactly ONE CTA button per card */}
                <div className="pt-1">
                  <a
                    href={cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between w-full min-h-[48px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all group/btn ${
                      isWhatsapp
                        ? 'bg-white/5 hover:bg-white/10 text-[#F8F7F4] border border-white/10 hover:border-[#C5973D]/40'
                        : 'bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#B8872F] text-[#0E0F12] shadow-md shadow-[#C5973D]/15 hover:brightness-105 active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isWhatsapp ? (
                        <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ExternalLink className="w-4 h-4 text-[#0E0F12] stroke-[2.2] shrink-0" />
                      )}
                      <span className="text-left leading-snug break-words whitespace-normal py-0.5">
                        {card.buttonText}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-80 shrink-0 ml-2 transform group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Discreet reassurance */}
        <p className="text-[11px] text-center text-[#9E9B95]/70 mt-3.5">
          Atendimento reservado e consultivo para o seu patrimônio.
        </p>
      </div>
    </section>
  );
};
