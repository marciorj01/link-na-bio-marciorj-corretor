import React from 'react';
import { Calculator, ExternalLink, MessageCircle, ShieldCheck, Landmark, Clock, ArrowRight } from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import { FinancingCard } from '../types';

interface FinancingBlockProps {
  title?: string;
  description?: string;
  ctaText?: string;
  simulationUrl?: string;
  disclaimer?: string;
  phone: string;
  banks?: string[];
  cards?: FinancingCard[];
}

export const FinancingBlock: React.FC<FinancingBlockProps> = ({
  title = 'Assessoria & Financiamento Imobiliário',
  description = 'Compare taxas entre bancos e parceiras e escolha a melhor condição para o seu perfil.',
  ctaText = 'Simular Financiamento Gratuito',
  simulationUrl = 'https://simular.credihome.com.br/marciorj-corretor',
  disclaimer = '*Simulação informativa sujeita à análise de crédito pelas instituições financeiras parceiras.',
  phone,
  banks,
  cards,
}) => {
  const displayBanks = Array.isArray(banks) && banks.length > 0
    ? banks
    : ['Caixa', 'Itaú', 'Bradesco', 'Santander'];
  const displayCards: FinancingCard[] = cards && cards.length > 0
    ? cards.filter((c) => c.enabled !== false)
    : [
        {
          id: 'fin-simulator',
          title: 'Simulador de crédito',
          badge: '',
          description:
            'Simule em múltiplos bancos (Caixa, Itaú, Bradesco, Santander) e encontre a menor taxa para o seu perfil.',
          buttonText: ctaText || 'Simular Financiamento Gratuito',
          buttonType: 'url',
          url: simulationUrl || 'https://simular.credihome.com.br/marciorj-corretor',
          status: 'active',
          enabled: true,
        },
        {
          id: 'fin-partner-1',
          title: 'Parceira de financiamento',
          badge: '',
          description:
            'CrediHome by Loft: assessoria especializada e gratuita para aprovar seu crédito imobiliário com agilidade e as melhores condições.',
          buttonText: 'Consultar no WhatsApp',
          buttonType: 'whatsapp',
          whatsappMessage:
            'Olá Márcio, gostaria de tirar dúvidas e consultar a aprovação de crédito imobiliário com a parceira de financiamento.',
          status: 'active',
          enabled: true,
        },
        {
          id: 'fin-partner-2',
          title: 'Em breve',
          badge: 'Em homologação',
          description:
            'Slot reservado para uma segunda parceira de financiamento que será ativada futuramente para ampliar ainda mais suas opções.',
          buttonText: 'Em homologação',
          buttonType: 'none',
          status: 'coming_soon',
          enabled: true,
        },
      ];

  return (
    <section className="financing-block px-5 py-4">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#1A1C22] via-[#15161A] to-[#111215] p-5 sm:p-6 border border-[#C5973D]/30 hover:border-[#C5973D]/60 transition-all duration-300 shadow-xl overflow-hidden group text-left">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C5973D] to-transparent opacity-75" />
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#C5973D]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Small editorial tag */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-[#C5973D] mb-2.5">
          <Calculator className="w-3.5 h-3.5 stroke-[2]" />
          <span>Financiamento & Crédito</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-serif font-medium text-[#F8F7F4] mb-2 leading-snug">
          {title}
        </h2>

        {/* Bank Partners Trust Strip */}
        {displayBanks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-[10px] uppercase tracking-wider text-[#9E9B95] mr-1 flex items-center gap-1">
              <Landmark className="w-3 h-3 text-[#C5973D]" />
              Bancos:
            </span>
            {displayBanks.map((bank, index) => (
              <span
                key={`${bank}-${index}`}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/8 text-[11px] font-medium text-[#F8F7F4]/90"
              >
                {bank}
              </span>
            ))}
          </div>
        )}

        {/* Financing Cards: container grid responsivo com auto-fit minmax(280px, 1fr) */}
        <div
          className="grid gap-4 items-stretch mb-5"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            alignItems: 'stretch',
          }}
        >
          {displayCards.map((card, idx) => {
            const isSimulator =
              card.id === 'fin-simulator' ||
              card.title.toLowerCase().includes('simulador') ||
              idx === 0;

            const isSlotFuturo =
              card.status === 'coming_soon' ||
              card.id === 'fin-partner-2' ||
              card.title.toLowerCase().includes('breve');

            const isPartner = !isSimulator && !isSlotFuturo;

            const isWhatsapp = card.buttonType === 'whatsapp';
            const isUrl = card.buttonType === 'url';
            const cardUrl = isWhatsapp
              ? formatWhatsAppUrl(
                  phone,
                  card.whatsappMessage ||
                    'Olá Márcio, tenho dúvidas sobre financiamento imobiliário e crédito.'
                )
              : card.url || '#';

            return (
              <div
                key={card.id}
                className={`card w-full rounded-xl transition-all duration-200 ${
                  isSlotFuturo
                    ? 'bg-white/[0.015] border border-dashed border-white/15'
                    : 'bg-[#20232A]/90 hover:bg-[#20232A] border border-white/8 hover:border-[#C5973D]/40'
                }`}
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
                  {/* Card Header: Título e Ícone sem badges sobrepostas */}
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSlotFuturo
                            ? 'bg-white/5 text-[#9E9B95]'
                            : 'bg-[#C5973D]/15 text-[#C5973D]'
                        }`}
                      >
                        {isSlotFuturo ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <Calculator className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <h3
                        className={`text-base font-serif font-medium leading-snug break-words ${
                          isSlotFuturo ? 'text-[#9E9B95]' : 'text-[#F8F7F4]'
                        }`}
                      >
                        {isSlotFuturo ? 'Em breve' : card.title}
                      </h3>
                    </div>

                    {/* Regra 1, 3, 4, 5: Apenas o slot futuro tem UMA badge 'Em homologação'. Simulador e Parceira não têm badge para não colidir. */}
                    {isSlotFuturo && (
                      <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold shrink-0">
                        Em homologação
                      </span>
                    )}
                  </div>

                  {/* Descrição com quebra de linha natural e texto completo */}
                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-4 font-light break-words ${
                      isSlotFuturo ? 'text-[#9E9B95]/80' : 'text-[#D4D2CD]'
                    }`}
                  >
                    {card.description}
                  </p>
                </div>

                {/* Botão de Ação Único e Completo (sem cortes ou '...') */}
                <div className="pt-1">
                  {isSlotFuturo || card.buttonType === 'none' ? (
                    <div className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/[0.03] border border-dashed border-white/10 text-xs sm:text-sm text-[#9E9B95] font-medium text-center">
                      <Clock className="w-3.5 h-3.5 text-[#9E9B95]/70 shrink-0" />
                      <span className="break-words leading-snug">
                        {card.buttonText && card.buttonText !== 'none'
                          ? card.buttonText
                          : 'Slot reservado para futura parceira'}
                      </span>
                    </div>
                  ) : isUrl ? (
                    <a
                      href={cardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#B8872F] text-[#0E0F12] font-semibold text-xs sm:text-sm tracking-wide shadow-md shadow-[#C5973D]/15 hover:brightness-105 active:scale-[0.99] transition-all group/btn"
                    >
                      <span className="text-left leading-snug break-words whitespace-normal py-0.5">
                        {card.buttonText || 'Simular Financiamento Gratuito'}
                      </span>
                      <ExternalLink className="w-4 h-4 stroke-[2.2] shrink-0 ml-2 transform group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  ) : (
                    <a
                      href={cardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F8F7F4] border border-white/10 hover:border-[#C5973D]/40 text-xs sm:text-sm font-semibold tracking-wide transition-all group/btn"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-left leading-snug break-words whitespace-normal text-[#E8D5A0] py-0.5">
                          {card.buttonText || 'Consultar no WhatsApp'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#C5973D] opacity-80 shrink-0 ml-2 transform group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-3 border-t border-white/6 flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5973D] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#9E9B95]/80 font-light leading-snug break-words">
            {disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
};
