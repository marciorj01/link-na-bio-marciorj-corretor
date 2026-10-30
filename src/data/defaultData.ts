import { SiteConfig } from '../types';
import vm125FeaturedImage from '../assets/images/regenerated_image_1793108371869.jpg';

export const DEFAULT_CONFIG: SiteConfig = {
  adminPassword: '1234',
  profile: {
    name: 'Márcio Rogério',
    subtitle: 'Corretor de Imóveis & Avaliador Imobiliário',
    creci: 'CRECI-PR 59138',
    phone: '5541999999999',
    city: 'Mandirituba, Curitiba e Região',
    email: 'marcioroger.gestor@gmail.com',
    instagram: '@marciorogeriocorretor',
    websiteUrl: 'https://marciorjcorretor.com.br',
    propostaDeValor: 'Do Sul do Brasil a Miami: compra, venda, locação e investimento.',
    positioningText:
      'Atuação em Mandirituba, Curitiba e região, além de oportunidades imobiliárias em outras localidades. Conectando pessoas a oportunidades com transparência e segurança.',
    avatarUrl: '', // Se vazio, usa a arte vetorial elegante com araucária e silhueta executiva
    expertise: [
      'Avaliação Imobiliária',
      'Vistoria Técnica',
      'Assessoria de Crédito',
      'Mandirituba & Curitiba',
    ],
  },
  aboutBlock: {
    tag: 'Apresentação Profissional',
    description:
      'Consultoria imobiliária especializada em Mandirituba, Curitiba e Região Metropolitana. Avaliação técnica, lançamentos e assessoria de crédito.',
    websiteLinkText: 'Conheça minha trajetória completa no site oficial',
    websiteUrl: 'https://marciorjcorretor.com.br',
  },
  buyerBlock: {
    tag: 'Atendimento Consultivo',
    title: 'Sua próxima compra.',
    description:
      'Receba uma seleção personalizada de casas, apartamentos, terrenos, chácaras ou lançamentos alinhados ao seu objetivo e perfil.',
    ctaText: 'Converse sobre sua próxima compra',
    whatsappMessage:
      'Olá Márcio, gostaria de tirar dúvidas sobre crédito e imóveis.',
    footnoteText: 'Atendimento direto pelo WhatsApp',
    footnoteSubtext: 'Sigilo & Discrição',
  },
  curatedBlock: {
    title: 'Imóveis e oportunidades selecionadas.',
    description:
      'Uma curadoria de opções em Mandirituba, Curitiba e região metropolitana, abrangendo imóveis urbanos e rurais.',
    ctaText: 'Conheça os imóveis e oportunidades',
    websiteUrl: 'https://marciorjcorretor.com.br',
    properties: [
      {
        id: 'prop-1',
        title: 'Chácara com Área Verde e Refúgio Natural',
        neighborhood: 'Mandirituba (PR)',
        type: 'Imóvel Rural / Chácara',
        phrase:
          'Mata nativa, nascente de água limpa, espaço para cultivo ou lazer familiar com excelente acesso à rodovia.',
        specs: {
          area: '20.000 m²',
          bedrooms: '3 Quartos',
          suites: '1 Suíte',
          highlight: 'Nascente & Tanque',
        },
        price: 'Sob Consulta',
        tag: 'Oportunidade Rural',
        imageUrl:
          'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=80',
        whatsappInquiryText:
          'Olá Márcio, vi a Chácara com Área Verde no link da bio e gostaria de mais informações.',
        externalLink: 'https://marciorjcorretor.com.br/imoveis/mandirituba-chacara',
      },
      {
        id: 'prop-2',
        title: 'Apartamento com Varanda e Lazer Completo',
        neighborhood: 'Curitiba (PR)',
        type: 'Apartamento Urbano',
        phrase:
          'Planta funcional com excelente insolação, sacada com churrasqueira a carvão e condomínio com estrutura completa.',
        specs: {
          area: '142 m²',
          bedrooms: '3 Quartos',
          suites: '2 Suítes',
          parking: '2 Vagas',
        },
        price: 'Sob Consulta',
        tag: 'Urbano Nobre',
        imageUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        whatsappInquiryText:
          'Olá Márcio, vi o Apartamento Urbano no link da bio e quero agendar uma visita.',
        externalLink: 'https://marciorjcorretor.com.br/imoveis/curitiba-apartamento',
      },
      {
        id: 'prop-3',
        title: 'Terreno em Condomínio Fechado',
        neighborhood: 'Curitiba e Região Metropolitana',
        type: 'Terreno / Lote',
        phrase:
          'Topografia favorável e excelente orientação solar em condomínio fechado com portaria 24h e segurança integrada.',
        specs: {
          area: '480 m²',
          typology: 'Lote Residencial',
          highlight: 'Pronto para Construir',
        },
        price: 'Sob Consulta',
        tag: 'Segurança & Natureza',
        imageUrl:
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        whatsappInquiryText:
          'Olá Márcio, vi o Terreno em Condomínio no link da bio e gostaria de mais informações.',
        externalLink: 'https://marciorjcorretor.com.br/imoveis/terreno-condominio',
      },
      {
        id: 'prop-4',
        title: 'Residência Familiar com Espaço Gourmet',
        neighborhood: 'Mandirituba e Região',
        type: 'Casa Residencial',
        phrase:
          'Casa térrea com acabamento moderno, amplo quintal gramado, espaço gourmet e garagem coberta para sua família.',
        specs: {
          area: '190 m²',
          bedrooms: '3 Quartos',
          suites: '1 Suíte',
          parking: '2 Vagas',
        },
        price: 'Sob Consulta',
        tag: 'Espaço & Conforto',
        imageUrl:
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        whatsappInquiryText:
          'Olá Márcio, vi a Casa Residencial no link da bio e quero agendar uma visita.',
        externalLink: 'https://marciorjcorretor.com.br/imoveis/casa-familiar',
      },
    ],
  },
  featuredProject: {
    id: 'feat-vm125',
    badge: 'Parceria em Destaque — São Paulo',
    name: 'Helbor VM125',
    neighborhood: 'Vila Madalena · SP',
    phrase:
      'Parceria imobiliária trazendo oportunidades exclusivas de investimento e moradia de alto padrão em um dos bairros mais desejados de São Paulo.',
    ctaText: 'Conheça o VM125',
    link: 'https://marciorjcorretor.com.br/vm125',
    imageUrl: vm125FeaturedImage,
    specs: {
      typology: 'Residências de 145m² a 290m²',
      footage: '3 e 4 Suítes com Varanda Integrada',
      highlight: 'Parceria exclusiva Curitiba · São Paulo',
    },
    whatsappMessage:
      'Olá Márcio, vi o Helbor VM125 no link da bio e gostaria de receber plantas e detalhes.',
  },
  financingBlock: {
    title: 'Assessoria & Financiamento Imobiliário',
    description:
      'Compare taxas entre bancos e parceiras e escolha a melhor condição para o seu perfil.',
    ctaText: 'Simular Financiamento Gratuito',
    simulationUrl: 'https://simular.credihome.com.br/marciorj-corretor',
    disclaimer:
      '*Simulação informativa sujeita à análise de crédito pelas instituições financeiras parceiras.',
    whatsappMessage: 'Olá Márcio, gostaria de tirar dúvidas sobre crédito e imóveis.',
    cards: [
      {
        id: 'fin-simulator',
        title: 'Simulador de crédito',
        badge: '',
        description:
          'Simule em múltiplos bancos (Caixa, Itaú, Bradesco, Santander) e encontre a menor taxa para o seu perfil.',
        buttonText: 'Simular Financiamento Gratuito',
        buttonType: 'url',
        url: 'https://simular.credihome.com.br/marciorj-corretor',
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
    ],
  },
  sellerBlock: {
    title: 'Quer vender ou alugar seu imóvel?',
    description:
      'Anuncie com quem é parceiro Loft e QuintoAndar. Para locação: seguro locação — você recebe todo mês, mesmo se o inquilino atrasar. Para venda: avaliação precisa, fotos profissionais e divulgação nas maiores vitrines do país.',
    ctaText: 'Quero vender ou alugar meu imóvel',
    whatsappMessage:
      'Olá Márcio, tenho um imóvel e gostaria de conversar sobre avaliação, vistoria e possibilidades de venda ou locação.',
    comparisonNote: 'A Loft oferece simulação de financiamento; o QuintoAndar não.',
    quintoAndarCtaText: 'Cadastrar meu imóvel no QuintoAndar',
    quintoAndarUrl: 'https://www.quintoandar.com.br/anunciar-imovel',
    cards: [
      {
        id: 'seller-card-loft',
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
        id: 'seller-card-quintoandar',
        title: 'Parceiro QuintoAndar',
        badge: '100% Digital',
        description:
          'Venda e locação sem burocracia: fotos profissionais, visitas agendadas e contrato 100% digital.',
        buttonText: 'Cadastrar meu imóvel',
        buttonType: 'url',
        url: 'https://www.quintoandar.com.br/anunciar-imovel',
        enabled: true,
      },
    ],
  },
  leadMagnet: {
    enabled: true,
    tag: 'Material Gratuito Exclusivo',
    badgeText: 'E-book em PDF · Download Imediato',
    title: 'Guia do Investidor Imobiliário: Do Sul do Brasil a Miami',
    subtitle: 'Como multiplicar e proteger seu patrimônio com imóveis de alta rentabilidade.',
    description:
      'Um material completo e prático preparado pelo corretor Márcio Rogério. Entenda as oportunidades em Curitiba e Região Metropolitana, as tendências de São Paulo e o passo a passo para dolarizar seu patrimônio na Flórida.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    bulletPoints: [
      'Mapeamento dos polos de valorização no Paraná (Curitiba & Mandirituba)',
      'Oportunidades de alto padrão e parcerias estratégicas em São Paulo',
      'Como investir nos EUA (Miami/Flórida) com rentabilidade em dólar',
      'Estratégias de crédito e simulação com as menores taxas bancárias',
    ],
    downloadFileUrl: 'https://marciorogeriocorretor.com.br/materiais/guia-investidor-imobiliario.pdf',
    buttonText: 'Quero Baixar Meu Guia Gratuito',
    whatsappCtaText: 'Receber também no meu WhatsApp',
    successMessage: 'Acesso liberado com sucesso! Clique no botão abaixo para iniciar o download do seu guia.',
  },
  capturedLeads: [
    {
      id: 'lead-ex-1',
      name: 'Dr. Roberto Silveira',
      email: 'roberto.silveira@exemplo.com.br',
      phone: '41991234567',
      createdAt: '2025-05-10T14:30:00Z',
      materialTitle: 'Guia do Investidor Imobiliário: Do Sul do Brasil a Miami',
    },
    {
      id: 'lead-ex-2',
      name: 'Camila Mendonça',
      email: 'camila.mendonca@exemplo.com.br',
      phone: '41988776655',
      createdAt: '2025-05-12T09:15:00Z',
      materialTitle: 'Guia do Investidor Imobiliário: Do Sul do Brasil a Miami',
    },
  ],
  footer: {
    disclaimer:
      'As informações sobre imóveis, valores e disponibilidade devem ser confirmadas diretamente com o corretor responsável. Atendimento com responsabilidade e segurança em todas as etapas.',
  },
  theme: {
    presetName: 'Ouro Nobre & Noir',
    primaryColor: '#C5973D',
    secondaryColor: '#E8D5A0',
    backgroundColor: '#0E0F12',
    cardBackgroundColor: '#16171B',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Plus Jakarta Sans',
    buttonShape: 'rounded-xl',
  },
  blockVisibility: {
    about: true,
    buyer: true,
    curated: true,
    featured: true,
    financing: true,
    seller: true,
    leadMagnet: true,
  },
  customBlocks: [],
  chatbot: {
    enabled: true,
    botName: 'Assistente Virtual do Márcio',
    welcomeMessage:
      'Olá! Seja bem-vindo ao atendimento do corretor Márcio Rogério (CRECI-PR 59138). Estou aqui para entender seu objetivo — do Sul do Brasil a São Paulo, Paraguai e Miami (EUA) — e te conectar com as melhores oportunidades.',
    quickOptions: [
      { id: 'opt-1', label: '🏡 Quero comprar imóvel', prompt: 'Gostaria de ver imóveis para compra.' },
      { id: 'opt-2', label: '🌾 Chácara em Mandirituba', prompt: 'Procuro chácara ou imóvel com área verde em Mandirituba e região.' },
      { id: 'opt-3', label: '📊 Simular financiamento', prompt: 'Quero simular meu crédito imobiliário na Credihome.' },
      { id: 'opt-4', label: '🔑 Avaliar ou vender meu imóvel', prompt: 'Tenho um imóvel e quero avaliar para venda ou locação.' },
    ],
    knowledgeBase: [
      {
        id: 'kb-1',
        question: 'área de atuação, cidades, onde atende, miami, são paulo, paraguai, regiões',
        answer:
          'Minha área de atuação é ampla: tenho foco e forte presença em Mandirituba, Curitiba e Região Metropolitana, além de soluções consolidadas para São Paulo, Paraguai e mercado internacional na Flórida/Miami (EUA). Para compra, venda, locação ou investimento, apresento oportunidades sob medida.',
      },
      {
        id: 'kb-2',
        question: 'simulação de financiamento, bancos, juros, caixa, itaú, santander, bradesco, crédito',
        answer:
          'Trabalhamos com simulação de crédito imobiliário simultânea nos principais bancos (Caixa Econômica, Itaú, Bradesco e Santander) através da parceria com a Credihome/Loft, buscando sempre a menor taxa e as melhores condições para o seu perfil.',
      },
      {
        id: 'kb-3',
        question: 'vender imóvel, alugar imóvel, quintoandar, loft, seguro locação, proprietários',
        answer:
          'Anunciamos seu imóvel com parceria Loft e QuintoAndar. Para locação, você conta com o seguro locação (recebe todo mês mesmo se o inquilino atrasar). Para venda, realizamos avaliação precisa, fotos profissionais e divulgação nas maiores vitrines imobiliárias do país.',
      },
      {
        id: 'kb-4',
        question: 'avaliação imobiliária, vistoria técnica, laudo, creci',
        answer:
          'Realizamos avaliação imobiliária mercadológica precisa e vistoria técnica detalhada com registro profissional CRECI-PR 59138, conferindo total segurança jurídica e valorização real para a negociação do seu patrimônio.',
      },
    ],
    systemInstruction:
      'Você é o assistente virtual do corretor de imóveis Márcio Rogério (CRECI-PR 59138). Tom profissional, consultivo e refinado em português.\n\nREGRA GEOGRÁFICA OBRIGATÓRIA: JAMAIS diga ou dê a entender que o corretor é exclusivo de Mandirituba e Curitiba. Embora tenha forte foco em Mandirituba, Curitiba e Região Metropolitana, sua consultoria atende amplamente São Paulo, Paraguai e o mercado internacional na Flórida/Miami (EUA), além de outras regiões.\n\nPRIORIDADE DA BASE DE CONHECIMENTO: Se a pergunta do cliente corresponder a um item da base de conhecimento, utilize EXATAMENTE a resposta cadastrada, sem contradizer nem alterar nada.\n\nLIMITES: Nunca invente imóveis, preços, metragens ou condições. Fale apenas dos imóveis listados na página. Para perguntas fora da base ou casos específicos, responda de forma prestativa dentro de sua atuação (compra, venda, locação, investimento, financiamento, avaliação) e direcione para o WhatsApp do corretor.',
    whatsappCtaText: 'Continuar com Márcio no WhatsApp',
  },
};
