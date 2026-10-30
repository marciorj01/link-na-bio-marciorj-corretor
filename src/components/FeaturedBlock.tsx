import React from 'react';
import { Sparkles, MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import { FeaturedProject } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { formatWhatsAppUrl } from '../utils/whatsapp';

const normalizeUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

interface FeaturedBlockProps {
  project: FeaturedProject;
  phone: string;
  onOpenEditor?: () => void;
}

export const FeaturedBlock: React.FC<FeaturedBlockProps> = ({
  project,
  phone,
}) => {
  const whatsappUrl = formatWhatsAppUrl(
    phone,
    project.whatsappMessage || `Olá Márcio, vi o ${project.name} no link da bio e gostaria de receber plantas e detalhes.`
  );

  const targetLink = normalizeUrl(project.link);
  const hasLink = Boolean(targetLink);

  const handleOpenLink = () => {
    if (hasLink) {
      window.open(targetLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="px-5 py-4">
      {/* Block Header */}
      <div className="mb-3 text-left">
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase text-[#C5973D] mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{project.badge || 'Destaque do momento'}</span>
        </div>
        <h2 className="text-2xl font-serif font-medium text-[#F8F7F4]">
          Destaque do momento.
        </h2>
      </div>

      {/* Larger Featured Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#1B1D22] via-[#16171B] to-[#131417] border border-[#C5973D]/40 shadow-2xl overflow-hidden group">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C5973D] to-transparent opacity-80" />

        {/* Larger Featured Photo */}
        <div
          className={`photo-card-media relative aspect-[16/10] w-full overflow-hidden ${hasLink ? 'cursor-pointer' : ''}`}
          onClick={hasLink ? handleOpenLink : undefined}
        >
          <ImageWithFallback
            src={project.imageUrl}
            alt={`${project.name} - ${project.neighborhood}`}
            label={project.name}
            category={project.neighborhood}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Luxury Scrim */}
          <div className="photo-scrim absolute inset-0 bg-gradient-to-t from-[#16171B] via-transparent to-black/40" />

          {/* Prominent Neighborhood Pill */}
          <div className="photo-pill absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0E0F12]/90 backdrop-blur-md border border-[#C5973D]/40 text-xs font-bold text-white shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-[#C5973D]" />
            <span className="font-bold text-white">{project.neighborhood}</span>
          </div>

          <div className="photo-badge absolute bottom-3 left-3.5 right-3.5">
            <span className="text-xs uppercase tracking-widest text-[#F8E8C2] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              Lançamento Selecionado
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col">
          {/* Project Name and Subtitle */}
          <div className="mb-3">
            <h3
              className={`text-2xl font-serif font-medium text-[#F8F7F4] mb-1 ${hasLink ? 'cursor-pointer hover:text-[#E8D5A0] transition-colors' : ''}`}
              onClick={hasLink ? handleOpenLink : undefined}
            >
              {project.name}
              <span className="text-lg font-light text-[#9E9B95] ml-2">
                — {project.neighborhood}
              </span>
            </h3>

            {/* Short Phrase */}
            <p className="text-sm text-[#D4D2CD] font-light leading-relaxed">
              {project.phrase}
            </p>
          </div>

          {/* Quick Specifications Strip */}
          {project.specs && (
            <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9E9B95] block">
                  Tipologia
                </span>
                <span className="font-medium text-[#F8F7F4]">
                  {project.specs.typology || 'Sob Consulta'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9E9B95] block">
                  Metragem / Suítes
                </span>
                <span className="font-medium text-[#F8F7F4]">
                  {project.specs.footage || 'Plantas Exclusivas'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons: Project Page + Direct WhatsApp */}
          <div className="flex flex-col gap-2.5">
            {/* Primary Project Link Button: "Conheça o VM125" */}
            <a
              href={targetLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full min-h-[50px] px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#B8872F] text-[#0E0F12] font-semibold text-sm tracking-wide shadow-lg shadow-[#C5973D]/15 hover:brightness-105 active:scale-[0.99] transition-all group/btn"
            >
              <span className="font-medium">{project.ctaText}</span>
              <ExternalLink className="w-4 h-4 stroke-[2.2] transform group-hover/btn:translate-x-0.5 transition-transform" />
            </a>

            {/* Direct WhatsApp Concierge CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#E8D5A0] hover:text-white border border-white/10 text-xs font-medium transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Solicitar apresentação e plantas via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
