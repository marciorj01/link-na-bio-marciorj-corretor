import React from 'react';
import { ArrowRight, Sparkles, MessageCircle, ExternalLink } from 'lucide-react';
import { CustomBlock } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface CustomBlockRendererProps {
  block: CustomBlock;
  phone: string;
}

export const CustomBlockRenderer: React.FC<CustomBlockRendererProps> = ({ block, phone }) => {
  if (!block.enabled) return null;

  const whatsappUrl = block.whatsappMessage
    ? formatWhatsAppUrl(phone, block.whatsappMessage)
    : null;

  return (
    <section className="px-5 py-3">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#181A20] via-[#141519] to-[#101114] p-6 border border-white/8 hover:border-[#C5973D]/40 transition-all duration-300 shadow-xl overflow-hidden group text-left">
        {/* Subtle ambient light */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#C5973D]/5 rounded-bl-full pointer-events-none" />

        {/* Badge */}
        {block.badge && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase text-[#C5973D] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{block.badge}</span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl font-serif font-medium text-[#F8F7F4] mb-2 leading-snug">
          {block.title}
        </h2>

        {/* Description */}
        {block.description && (
          <p className="text-sm text-[#D4D2CD] font-light leading-relaxed mb-4">
            {block.description}
          </p>
        )}

        {/* Image if provided */}
        {block.imageUrl && (
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/10 mb-5">
            <ImageWithFallback
              src={block.imageUrl}
              alt={block.title}
              label={block.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        {/* Buttons / Actions */}
        <div className="space-y-2.5">
          {block.ctaLink && block.ctaText && (
            <a
              href={block.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full min-h-[50px] px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#B8872F] text-[#0E0F12] font-semibold text-sm tracking-wide shadow-lg shadow-[#C5973D]/15 hover:brightness-105 active:scale-[0.99] transition-all group/btn"
            >
              <span>{block.ctaText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2] transform group-hover/btn:translate-x-1 transition-transform" />
            </a>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#E8D5A0] hover:text-white border border-white/5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Conversar sobre esta novidade via WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
