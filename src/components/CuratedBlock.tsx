import React from 'react';
import { ExternalLink, MapPin, ChevronRight, MessageCircle } from 'lucide-react';
import { CuratedProperty } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { formatWhatsAppUrl } from '../utils/whatsapp';

const normalizeUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

interface CuratedBlockProps {
  title: string;
  description: string;
  ctaText: string;
  websiteUrl: string;
  properties: CuratedProperty[];
  phone: string;
  onSelectProperty: (property: CuratedProperty) => void;
}

export const CuratedBlock: React.FC<CuratedBlockProps> = ({
  title,
  description,
  ctaText,
  websiteUrl,
  properties,
  phone,
  onSelectProperty,
}) => {
  return (
    <section className="px-5 py-4 curated-block">
      {/* Block Heading */}
      <div className="mb-4 text-left">
        <h2 className="text-2xl font-serif font-medium text-[#F8F7F4] mb-1.5">
          {title}
        </h2>
        <p className="text-sm text-[#9E9B95] font-light leading-relaxed">
          {description}
        </p>
      </div>

      {/* Primary Curatorship Portal Link Button */}
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full min-h-[50px] px-5 py-3.5 mb-5 rounded-xl bg-[#1E2026] hover:bg-[#252830] border border-white/10 hover:border-[#C5973D]/40 text-[#F8F7F4] text-sm font-medium tracking-wide shadow-md transition-all group"
      >
        <span className="font-medium text-left leading-tight text-[#E8D5A0]">
          {ctaText}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-[#9E9B95] group-hover:text-white transition-colors shrink-0">
          <span className="hidden sm:inline">
            {websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </span>
          <ExternalLink className="w-4 h-4 stroke-[1.8] text-[#C5973D]" />
        </div>
      </a>

      {/* Property Cards Grid (3 to 6 properties) */}
      <div className="space-y-3.5">
        {properties.map((property) => {
          const directInquiryUrl = formatWhatsAppUrl(
            phone,
            property.whatsappInquiryText ||
              `Olá Márcio, vi o imóvel ${property.title} no link da bio e gostaria de mais informações.`
          );

          const hasExternalLink = Boolean(property.externalLink && property.externalLink.trim());
          const targetUrl = hasExternalLink ? normalizeUrl(property.externalLink) : '';

          const handlePropertyCardClick = () => {
            if (hasExternalLink) {
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            } else {
              onSelectProperty(property);
            }
          };

          return (
            <div
              key={property.id}
              className="rounded-xl bg-[#16171B] border border-white/7 hover:border-[#C5973D]/35 transition-all overflow-hidden flex flex-col group shadow-sm hover:shadow-lg hover:shadow-black/40"
            >
              {/* Photo Area with Fallback */}
              <div
                className="photo-card-media relative aspect-[16/9] w-full overflow-hidden cursor-pointer"
                onClick={handlePropertyCardClick}
              >
                <ImageWithFallback
                  src={property.imageUrl}
                  alt={property.title}
                  label={property.title}
                  category={property.neighborhood}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Scrim Overlay */}
                <div className="photo-scrim absolute inset-0 bg-gradient-to-t from-[#16171B] via-transparent to-black/30" />

                {/* Top Location indicator */}
                <div className="photo-pill absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0E0F12]/90 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-lg">
                  <MapPin className="w-3 h-3 text-[#C5973D]" />
                  <span className="font-bold text-white">{property.neighborhood}</span>
                </div>

                {property.tag && (
                  <div className="photo-badge absolute top-3 right-3 px-2 py-0.5 rounded bg-[#C5973D] text-[#0E0F12] text-[10px] font-bold tracking-wider uppercase shadow-md">
                    {property.tag}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-1">
                {/* Title and Type */}
                <div className="mb-2">
                  <div className="text-[11px] font-medium tracking-wide uppercase text-[#C5973D]/90 mb-0.5">
                    {property.type}
                  </div>
                  <h3
                    className="text-lg font-serif font-medium text-[#F8F7F4] group-hover:text-[#E8D5A0] transition-colors leading-snug cursor-pointer"
                    onClick={handlePropertyCardClick}
                  >
                    {property.title}
                  </h3>
                </div>

                {/* Short Phrase */}
                <p className="text-xs text-[#9E9B95] font-light leading-relaxed mb-4 flex-1">
                  {property.phrase}
                </p>

                {/* Card Action Row */}
                <div className="pt-3 border-t border-white/6 flex items-center justify-between gap-2">
                  {hasExternalLink ? (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#E8D5A0] hover:text-white font-medium flex items-center gap-1 py-1 transition-colors group/link"
                      title="Acessar ficha completa no site oficial"
                    >
                      <span>Ver detalhes</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2] text-[#C5973D] group-hover/link:translate-x-0.5 transition-transform" />
                    </a>
                  ) : (
                    <button
                      onClick={() => onSelectProperty(property)}
                      className="text-xs text-[#E8D5A0] hover:text-white font-medium flex items-center gap-1 py-1 transition-colors"
                      title="Ver detalhes do imóvel"
                    >
                      <span>Ver detalhes</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  )}

                  <a
                    href={directInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20232A] hover:bg-[#C5973D] text-[#D4D2CD] hover:text-[#0E0F12] text-xs font-medium border border-white/5 hover:border-transparent transition-all"
                    title="Consultar pelo WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Consultar</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
