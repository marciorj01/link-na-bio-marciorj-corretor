import React from 'react';
import { X, MapPin, MessageCircle, ExternalLink, Maximize2, Bed, Bath, Car, Shield, Calculator } from 'lucide-react';
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

interface PropertyModalProps {
  property: CuratedProperty | null;
  phone: string;
  onClose: () => void;
  simulationUrl?: string;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  phone,
  onClose,
  simulationUrl = 'https://simular.credihome.com.br/marciorj-corretor',
}) => {
  if (!property) return null;

  const whatsappUrl = formatWhatsAppUrl(
    phone,
    property.whatsappInquiryText ||
      `Olá Márcio, vi o imóvel ${property.title} no link da bio e gostaria de mais informações.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-[#16171B] border border-white/10 shadow-2xl text-left flex flex-col z-10">
        {/* Top Grab Bar for Mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white flex items-center justify-center transition-colors border border-white/10"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Header Photo */}
        <div className="photo-card-media relative aspect-[16/10] w-full overflow-hidden shrink-0">
          <ImageWithFallback
            src={property.imageUrl}
            alt={property.title}
            label={property.title}
            category={property.neighborhood}
            className="w-full h-full object-cover"
          />
          <div className="photo-scrim absolute inset-0 bg-gradient-to-t from-[#16171B] via-transparent to-black/40" />

          <div className="photo-pill absolute bottom-3 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0E0F12]/90 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-[#C5973D]" />
            <span className="font-bold text-white">{property.neighborhood}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col flex-1">
          {/* Tag & Type */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-wider text-[#C5973D] font-medium">
              {property.type}
            </span>
            {property.tag && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-xs text-[#E8D5A0] font-light">{property.tag}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-serif font-medium text-[#F8F7F4] mb-3">
            {property.title}
          </h3>

          {/* Phrase */}
          <p className="text-sm text-[#D4D2CD] font-light leading-relaxed mb-5">
            {property.phrase}
          </p>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 mb-6 text-xs">
            {property.specs.area && (
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#C5973D] shrink-0" />
                <div>
                  <div className="text-[10px] text-[#9E9B95] uppercase">Área</div>
                  <div className="font-medium text-[#F8F7F4]">{property.specs.area}</div>
                </div>
              </div>
            )}
            {property.specs.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#C5973D] shrink-0" />
                <div>
                  <div className="text-[10px] text-[#9E9B95] uppercase">Dormitórios</div>
                  <div className="font-medium text-[#F8F7F4]">{property.specs.bedrooms}</div>
                </div>
              </div>
            )}
            {property.specs.suites && (
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-[#C5973D] shrink-0" />
                <div>
                  <div className="text-[10px] text-[#9E9B95] uppercase">Suítes</div>
                  <div className="font-medium text-[#F8F7F4]">{property.specs.suites}</div>
                </div>
              </div>
            )}
            {property.specs.parking && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#C5973D] shrink-0" />
                <div>
                  <div className="text-[10px] text-[#9E9B95] uppercase">Vagas</div>
                  <div className="font-medium text-[#F8F7F4]">{property.specs.parking}</div>
                </div>
              </div>
            )}
          </div>

          {/* Price status */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/8 text-sm">
            <span className="text-[#9E9B95]">Condição comercial</span>
            <span className="font-serif text-lg text-[#E8D5A0] font-medium">
              {property.price || 'Sob Consulta Confidencial'}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full min-h-[50px] px-5 py-3 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#B8872F] text-[#0E0F12] font-semibold text-sm tracking-wide shadow-lg shadow-[#C5973D]/15 hover:brightness-105 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-[#0E0F12]" />
              <span>Solicitar dossiê completo via WhatsApp</span>
            </a>

            {/* Simulação de Financiamento */}
            <a
              href={simulationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#E8D5A0] hover:text-white border border-[#C5973D]/30 hover:border-[#C5973D] transition-all group/sim"
            >
              <Calculator className="w-4 h-4 text-[#C5973D]" />
              <span>Simular parcelas deste imóvel</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#9E9B95] group-hover/sim:text-white" />
            </a>

            {property.externalLink && property.externalLink.trim() && (
              <a
                href={normalizeUrl(property.externalLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#D4D2CD] border border-white/5 transition-colors"
              >
                <span>Acessar ficha no site oficial</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C5973D]" />
              </a>
            )}
          </div>

          {/* Discretion seal */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#9E9B95]/70">
            <Shield className="w-3 h-3 text-[#C5973D]" />
            <span>Atendimento estritamente consultivo e discreto</span>
          </div>
        </div>
      </div>
    </div>
  );
};
