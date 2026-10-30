export interface Specs {
  area?: string;
  bedrooms?: string;
  suites?: string;
  parking?: string;
  typology?: string;
  footage?: string;
  highlight?: string;
}

export interface CuratedProperty {
  id: string;
  title: string;
  neighborhood: string;
  type: string;
  phrase: string;
  specs: Specs;
  price?: string;
  imageUrl: string;
  tag?: string;
  whatsappInquiryText: string;
  externalLink?: string;
}

export interface FeaturedProject {
  id: string;
  badge: string;
  name: string;
  neighborhood: string;
  phrase: string;
  ctaText: string;
  link: string;
  imageUrl: string;
  specs: {
    typology: string;
    footage: string;
    highlight: string;
  };
  whatsappMessage: string;
}

export interface CustomBlock {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  whatsappMessage?: string;
  enabled: boolean;
}

export interface ThemeConfig {
  presetName: string;
  primaryColor: string; // ex: #C5973D (Dourado Âmbar)
  secondaryColor: string; // ex: #E8D5A0
  backgroundColor: string; // ex: #0E0F12
  cardBackgroundColor: string; // ex: #16171B
  fontTitle: string; // 'Cormorant Garamond' | 'Playfair Display' | 'Cinzel' | 'Montserrat' | 'Plus Jakarta Sans'
  fontBody: string; // 'Plus Jakarta Sans' | 'Inter' | 'Roboto' | 'Poppins'
  buttonShape: 'rounded-xl' | 'rounded-full' | 'rounded-lg';
}

export interface CapturedLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  materialTitle: string;
}

export interface LeadMagnetConfig {
  enabled: boolean;
  tag: string;
  badgeText?: string;
  title: string;
  subtitle: string;
  description: string;
  coverImageUrl?: string;
  bulletPoints: string[];
  downloadFileUrl: string;
  buttonText: string;
  whatsappCtaText?: string;
  successMessage?: string;
}

export interface BlockVisibility {
  about: boolean;
  buyer: boolean;
  curated: boolean;
  featured: boolean;
  financing: boolean;
  seller: boolean;
  leadMagnet?: boolean;
}

export interface ChatbotQuickOption {
  id: string;
  label: string;
  prompt: string;
}

export interface ChatbotKnowledgeItem {
  id: string;
  question: string;
  answer: string;
}

export interface ChatbotConfig {
  enabled: boolean;
  botName: string;
  avatarIcon?: string;
  welcomeMessage: string;
  quickOptions: ChatbotQuickOption[];
  knowledgeBase?: ChatbotKnowledgeItem[];
  systemInstruction?: string;
  whatsappCtaText?: string;
}

export interface PartnershipCard {
  id: string;
  title: string;
  badge?: string;
  description: string;
  buttonText: string;
  buttonType: 'whatsapp' | 'url';
  url?: string;
  whatsappMessage?: string;
  enabled: boolean;
}

export interface FinancingCard {
  id: string;
  title: string;
  badge?: string;
  description: string;
  buttonText?: string;
  buttonType?: 'url' | 'whatsapp' | 'none';
  url?: string;
  whatsappMessage?: string;
  status: 'active' | 'coming_soon';
  enabled: boolean;
}

export interface SiteConfig {
  adminPassword?: string;
  profile: {
    name: string;
    subtitle: string;
    creci: string;
    phone: string;
    instagram: string;
    websiteUrl: string;
    positioningText: string;
    avatarUrl: string;
    city?: string;
    email?: string;
    expertise?: string[];
    propostaDeValor?: string;
  };
  aboutBlock?: {
    tag?: string;
    description?: string;
    websiteLinkText?: string;
    websiteUrl?: string;
  };
  buyerBlock: {
    tag?: string;
    title: string;
    description: string;
    ctaText: string;
    whatsappMessage: string;
    footnoteText?: string;
    footnoteSubtext?: string;
  };
  curatedBlock: {
    title: string;
    description: string;
    ctaText: string;
    websiteUrl: string;
    properties: CuratedProperty[];
  };
  featuredProject: FeaturedProject;
  financingBlock?: {
    title: string;
    description: string;
    ctaText?: string;
    simulationUrl?: string;
    disclaimer?: string;
    whatsappMessage?: string;
    cards?: FinancingCard[];
  };
  sellerBlock: {
    title: string;
    description: string;
    ctaText: string;
    whatsappMessage: string;
    comparisonNote?: string;
    cards?: PartnershipCard[];
    quintoAndarCtaText?: string;
    quintoAndarUrl?: string;
  };
  leadMagnet?: LeadMagnetConfig;
  capturedLeads?: CapturedLead[];
  footer: {
    disclaimer: string;
  };
  theme?: ThemeConfig;
  customBlocks?: CustomBlock[];
  blockVisibility?: BlockVisibility;
  chatbot?: ChatbotConfig;
}

