import React from 'react';
import { MessageCircle, ArrowRight, Compass } from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface BuyerBlockProps {
  tag?: string;
  title: string;
  description: string;
  ctaText: string;
  whatsappMessage: string;
  phone: string;
  footnoteText?: string;
  footnoteSubtext?: string;
}

export const BuyerBlock: React.FC<BuyerBlockProps> = ({
  tag = 'Atendimento Consultivo',
  title,
  description,
  ctaText,
  whatsappMessage,
  phone,
  footnoteText = 'Atendimento direto pelo WhatsApp',
  footnoteSubtext = 'Sigilo & Discrição',
}) => {
  const whatsappUrl = formatWhatsAppUrl(phone, whatsappMessage);

  return (
    <section className="px-5 py-4">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#181A1F] to-[#141518] p-6 border border-white/8 hover:border-[#C5973D]/30 transition-all duration-300 shadow-xl overflow-hidden group">
        {/* Subtle corner light accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5973D]/5 rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100" />

        {/* Small editorial label */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-[#C5973D] mb-2.5">
          <Compass className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>{tag}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-serif font-medium text-[#F8F7F4] mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-[#9E9B95] leading-relaxed mb-6 font-light">
          {description}
        </p>

        {/* Primary CTA Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full min-h-[52px] px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#B8872F] text-[#0E0F12] font-semibold text-sm tracking-wide shadow-lg shadow-[#C5973D]/15 hover:shadow-[#C5973D]/30 hover:brightness-105 active:scale-[0.99] transition-all group/btn"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0E0F12]/15 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 fill-[#0E0F12] stroke-[#0E0F12]" />
            </div>
            <span className="font-medium text-left leading-tight">{ctaText}</span>
          </div>
          <ArrowRight className="w-4 h-4 stroke-[2.2] transform group-hover/btn:translate-x-1 transition-transform shrink-0 ml-2" />
        </a>

        {/* Reassurance footnote */}
        {(footnoteText || footnoteSubtext) && (
          <div className="mt-4 flex flex-col items-center justify-center gap-1 text-center">
            {footnoteText && (
              <span className="text-xs text-[#D4D2CD] font-medium">
                {footnoteText}
              </span>
            )}
            {footnoteSubtext && (
              <span className="text-[10px] tracking-wider uppercase text-[#C5973D] font-medium opacity-90">
                {footnoteSubtext}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
