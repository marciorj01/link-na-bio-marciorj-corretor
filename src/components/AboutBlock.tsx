import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';

interface AboutBlockProps {
  name?: string;
  creci: string;
  websiteUrl: string;
  propostaDeValor?: string;
  tag?: string;
  aboutText?: string;
  linkText?: string;
}

export const AboutBlock: React.FC<AboutBlockProps> = ({
  name = 'Márcio Rogério',
  creci,
  websiteUrl,
  propostaDeValor = 'Do Sul do Brasil a Miami: compra, venda, locação e investimento.',
  tag = 'Apresentação Profissional',
  aboutText = 'Consultoria imobiliária especializada em Mandirituba, Curitiba e Região Metropolitana. Avaliação técnica, lançamentos e assessoria de crédito.',
  linkText = 'Conheça minha trajetória completa no site oficial',
}) => {
  return (
    <section className="px-5 py-2">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#18191E] to-[#121316] p-5 border border-white/8 hover:border-[#C5973D]/30 transition-all duration-300 shadow-xl overflow-hidden group text-left">
        {/* Subtle corner golden aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5973D]/5 rounded-bl-full pointer-events-none" />

        {/* Small editorial tag */}
        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.2em] uppercase text-[#C5973D] mb-2">
          <Compass className="w-3.5 h-3.5 stroke-[2]" />
          <span>{tag}</span>
        </div>

        {/* Name and CRECI followed by Proposta de Valor */}
        <div className="space-y-1.5 mb-3">
          <p className="text-sm md:text-base text-[#F8F7F4]/90 font-light leading-relaxed">
            <strong className="text-[#E8D5A0] font-semibold">{name} | {creci}</strong>
          </p>
          <p className="text-xs md:text-sm text-[#E8D5A0] font-medium tracking-wide">
            {propostaDeValor}
          </p>
          <p className="text-xs md:text-sm text-[#9E9B95] font-light leading-relaxed">
            {aboutText}
          </p>
        </div>

        {/* Subtle link pointing to official website */}
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#C5973D] hover:text-[#E8D5A0] font-medium transition-colors group/link pt-1"
        >
          <span>{linkText}</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
};
