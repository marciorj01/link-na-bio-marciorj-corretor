import React from 'react';
import { SiteConfig, CuratedProperty } from '../types';
import { Header } from './Header';
import { AboutBlock } from './AboutBlock';
import { BuyerBlock } from './BuyerBlock';
import { CuratedBlock } from './CuratedBlock';
import { FeaturedBlock } from './FeaturedBlock';
import { FinancingBlock } from './FinancingBlock';
import { SellerBlock } from './SellerBlock';
import { LeadMagnetBlock } from './LeadMagnetBlock';
import { CustomBlockRenderer } from './CustomBlockRenderer';
import { Footer } from './Footer';
import { MessageCircle, Bot } from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface MinisiteLivePreviewProps {
  config: SiteConfig;
}

export const MinisiteLivePreview: React.FC<MinisiteLivePreviewProps> = ({ config }) => {
  const theme = config.theme || {
    presetName: 'Ouro Nobre & Noir',
    primaryColor: '#C5973D',
    secondaryColor: '#E8D5A0',
    backgroundColor: '#0E0F12',
    cardBackgroundColor: '#16171B',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Plus Jakarta Sans',
    buttonShape: 'rounded-xl',
  };

  const visibility = config.blockVisibility || {
    about: true,
    buyer: true,
    curated: true,
    featured: true,
    financing: true,
    seller: true,
  };

  const customBlocks = config.customBlocks || [];

  const quickConsultUrl = formatWhatsAppUrl(
    config.profile.phone,
    'Olá, gostaria de tirar dúvidas sobre crédito e imóveis.'
  );

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 select-none">
      {/* Smartphone Chassis Frame */}
      <div className="relative w-[340px] sm:w-[370px] md:w-[390px] h-[720px] md:h-[780px] rounded-[48px] bg-[#121316] border-[7px] border-[#252830] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(197,151,61,0.12)] overflow-hidden flex flex-col">
        {/* Dynamic Island / Notch */}
        <div className="h-8 shrink-0 bg-black/90 flex items-center justify-between px-6 pt-1.5 z-20 pointer-events-none text-[10px] font-semibold text-white/70">
          <span>9:41</span>
          <div className="w-24 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#18191D]" />
          </div>
          <div className="flex items-center gap-1 text-[9px]">
            <span>5G</span>
            <span className="w-3.5 h-2 rounded-xs border border-white/60 relative">
              <span className="absolute inset-0.5 bg-white/80 rounded-xs" />
            </span>
          </div>
        </div>

        {/* Dynamic Injected CSS for Theme within Preview */}
        <style>{`
          .preview-container .font-serif,
          .preview-container h1,
          .preview-container h2,
          .preview-container h3 {
            font-family: '${theme.fontTitle}', serif, sans-serif !important;
          }
          .preview-container,
          .preview-container p,
          .preview-container span,
          .preview-container button,
          .preview-container a {
            font-family: '${theme.fontBody}', sans-serif;
          }
          .preview-container p,
          .preview-container span,
          .preview-container a {
            font-weight: 600;
          }
        `}</style>

        {/* Scrollable Minisite Body */}
        <div
          className="preview-container flex-1 overflow-y-auto custom-scrollbar relative transition-colors duration-300 text-left"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          {/* Ambient subtle light wash */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-56 blur-3xl pointer-events-none opacity-40 transition-colors duration-500"
            style={{
              background: `radial-gradient(circle, ${theme.primaryColor} 0%, transparent 70%)`,
            }}
          />

          {/* 1. Header */}
          <Header
            name={config.profile.name}
            subtitle={config.profile.subtitle}
            avatarUrl={config.profile.avatarUrl}
            creci={config.profile.creci}
            city={config.profile.city}
          />

          {/* About Block */}
          {visibility.about && (
            <AboutBlock
              name={config.profile.name}
              creci={config.profile.creci}
              websiteUrl={config.aboutBlock?.websiteUrl || config.profile.websiteUrl}
              propostaDeValor={config.profile.propostaDeValor}
              tag={config.aboutBlock?.tag}
              aboutText={config.aboutBlock?.description}
              linkText={config.aboutBlock?.websiteLinkText}
            />
          )}

          {/* Buyer Block */}
          {visibility.buyer && (
            <BuyerBlock
              tag={config.buyerBlock.tag}
              title={config.buyerBlock.title}
              description={config.buyerBlock.description}
              ctaText={config.buyerBlock.ctaText}
              whatsappMessage={config.buyerBlock.whatsappMessage}
              phone={config.profile.phone}
              footnoteText={config.buyerBlock.footnoteText}
              footnoteSubtext={config.buyerBlock.footnoteSubtext}
            />
          )}

          {/* Featured Project Block (Destaque em primeiro) */}
          {visibility.featured && (
            <FeaturedBlock
              project={config.featuredProject}
              phone={config.profile.phone}
            />
          )}

          {/* Curated Properties Block */}
          {visibility.curated && (
            <CuratedBlock
              title={config.curatedBlock.title}
              description={config.curatedBlock.description}
              ctaText={config.curatedBlock.ctaText}
              websiteUrl={config.curatedBlock.websiteUrl}
              properties={config.curatedBlock.properties}
              phone={config.profile.phone}
              onSelectProperty={() => {}}
            />
          )}

          {/* Seller Block (Para Proprietários - QuintoAndar & Venda) */}
          {visibility.seller && (
            <SellerBlock
              title={config.sellerBlock.title}
              description={config.sellerBlock.description}
              ctaText={config.sellerBlock.ctaText}
              whatsappMessage={config.sellerBlock.whatsappMessage}
              phone={config.profile.phone}
              comparisonNote={config.sellerBlock.comparisonNote}
              cards={config.sellerBlock.cards}
              quintoAndarCtaText={config.sellerBlock.quintoAndarCtaText}
              quintoAndarUrl={config.sellerBlock.quintoAndarUrl}
            />
          )}

          {/* Financing Block */}
          {visibility.financing && (
            <FinancingBlock
              title={config.financingBlock?.title}
              description={config.financingBlock?.description}
              ctaText={config.financingBlock?.ctaText}
              simulationUrl={config.financingBlock?.simulationUrl}
              disclaimer={config.financingBlock?.disclaimer}
              phone={config.profile.phone}
              banks={config.financingBlock?.banks}
              cards={config.financingBlock?.cards}
            />
          )}

          {/* Lead Magnet Block (E-book / Guia) */}
          {visibility.leadMagnet !== false && config.leadMagnet?.enabled !== false && (
            <LeadMagnetBlock
              leadMagnet={config.leadMagnet}
              brokerPhone={config.profile.phone}
              brokerName={config.profile.name}
              isLivePreview={true}
            />
          )}

          {/* Custom Blocks */}
          {customBlocks.map((block) => (
            <CustomBlockRenderer
              key={block.id}
              block={block}
              phone={config.profile.phone}
            />
          ))}

          {/* Footer (Clean Visitor Mode in Preview) */}
          <Footer
            name={config.profile.name}
            creci={config.profile.creci}
            instagram={config.profile.instagram}
            websiteUrl={config.profile.websiteUrl}
            disclaimer={config.footer.disclaimer}
            city={config.profile.city}
            isAuthenticated={false}
            onOpenShare={() => {}}
            onOpenEditor={() => {}}
            onOpenLogin={() => {}}
            onLogout={() => {}}
          />

          {/* Simulated Floating Chatbot & WhatsApp CTA in phone preview */}
          <div className="sticky bottom-3 px-4 z-20 pointer-events-none flex flex-col items-end gap-2">
            {config.chatbot?.enabled !== false && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181A20]/95 border border-[#C5973D]/50 text-[#E8D5A0] shadow-lg text-[10px] font-medium backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Bot className="w-3.5 h-3.5 text-[#C5973D]" />
                <span>{config.chatbot?.botName || 'Assistente Virtual'}</span>
              </div>
            )}
            <div
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[#0E0F12] font-semibold text-[11px] shadow-lg shadow-black/40"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-[#0E0F12]" />
              <span>Falar pelo WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-5 shrink-0 bg-[#0E0F12] flex items-center justify-center pointer-events-none border-t border-white/5">
          <div className="w-28 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};
