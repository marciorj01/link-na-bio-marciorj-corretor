import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Phone,
  Shield,
  Instagram,
  Globe,
  Building2,
  Upload,
  Palette,
  Layers,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Type,
  MapPin,
  Compass,
  Lock,
  KeyRound,
  Check,
  Loader2,
  Server,
  Smartphone,
  Bot,
  GraduationCap,
  BookOpen,
  Download,
  FileText,
  CheckCircle2,
  Mail,
  User,
  Users,
  FileSpreadsheet,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Calculator,
  Clock,
  Info,
  QrCode,
  Database,
  Landmark,
  FileDown,
} from 'lucide-react';
import {
  SiteConfig,
  CuratedProperty,
  CustomBlock,
  ThemeConfig,
  BlockVisibility,
  ChatbotConfig,
  ChatbotQuickOption,
  ChatbotKnowledgeItem,
  LeadMagnetConfig,
  CapturedLead,
  PartnershipCard,
  FinancingCard,
} from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { MinisiteLivePreview } from './MinisiteLivePreview';
import {
  downloadConfigAsJson,
  generateDefaultDataCode,
  loadSafetySnapshot,
  deepMergePreservingUserEdits,
} from '../utils/configMerge';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testSupabaseConnection,
  saveConfigToSupabase,
  cleanSupabaseUrl,
  SUPABASE_SETUP_SQL,
} from '../services/supabase';

interface StudioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onSave: (newConfig: SiteConfig) => void;
  onReset: () => void;
  onDraftChange?: (draftConfig: SiteConfig) => void;
}

const COLOR_PRESETS = [
  {
    name: 'Ouro Nobre & Noir',
    primary: '#C5973D',
    secondary: '#E8D5A0',
    background: '#0E0F12',
    card: '#16171B',
  },
  {
    name: 'Champagne & Grafite',
    primary: '#D4AF37',
    secondary: '#F3E5AB',
    background: '#121316',
    card: '#1A1C22',
  },
  {
    name: 'Esmeralda & Black (Rural/Nobre)',
    primary: '#10B981',
    secondary: '#A7F3D0',
    background: '#0A0F0D',
    card: '#111915',
  },
  {
    name: 'Bronze & Terracota',
    primary: '#D97706',
    secondary: '#FDE68A',
    background: '#120E0D',
    card: '#1B1513',
  },
  {
    name: 'Safira & Noite',
    primary: '#3B82F6',
    secondary: '#BFDBFE',
    background: '#0B0F19',
    card: '#131926',
  },
  {
    name: 'Minimalista Grafite',
    primary: '#9E9B95',
    secondary: '#F5F4F0',
    background: '#141416',
    card: '#1D1E22',
  },
];

const TITLE_FONTS = [
  { name: 'Cormorant Garamond (Clássica Luxo)', value: 'Cormorant Garamond' },
  { name: 'Playfair Display (Editorial Moderna)', value: 'Playfair Display' },
  { name: 'Cinzel (Romana Imperial)', value: 'Cinzel' },
  { name: 'Montserrat (Imponente Clean)', value: 'Montserrat' },
  { name: 'Plus Jakarta Sans (Moderna)', value: 'Plus Jakarta Sans' },
];

const BODY_FONTS = [
  { name: 'Plus Jakarta Sans (Recomendada)', value: 'Plus Jakarta Sans' },
  { name: 'Inter (Suíça / Clean)', value: 'Inter' },
  { name: 'Roboto (Neutra & Legível)', value: 'Roboto' },
  { name: 'Poppins (Geométrica Amigável)', value: 'Poppins' },
];

export const StudioPanel: React.FC<StudioPanelProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onReset,
  onDraftChange,
}) => {
  const [formData, setFormData] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState<'perfil' | 'canva' | 'imoveis' | 'destaque' | 'blocos' | 'leadmagnet' | 'chatbot' | 'codigo'>('perfil');
  const [selectedPropId, setSelectedPropId] = useState<string>(
    config.curatedBlock.properties[0]?.id || 'prop-1'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<{ active: boolean; server: boolean; message: string } | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [compressingTarget, setCompressingTarget] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [capturedLeadsList, setCapturedLeadsList] = useState<CapturedLead[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('marciorogerio_captured_leads');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return config.capturedLeads || [];
  });

  // Sync state if external config changes
  React.useEffect(() => {
    setFormData(config);
    if (config.curatedBlock.properties.length > 0 && !selectedPropId) {
      setSelectedPropId(config.curatedBlock.properties[0].id);
    }
  }, [config]);

  // Ref to avoid dependency cycle and re-render loops
  const onDraftChangeRef = useRef(onDraftChange);
  React.useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  }, [onDraftChange]);

  const lastBroadcastRef = useRef<string>('');
  // Real-time synchronization: As Márcio edits in the panel, update the live minisite preview
  React.useEffect(() => {
    if (isOpen && onDraftChangeRef.current) {
      try {
        const currentSerialized = JSON.stringify(formData);
        if (lastBroadcastRef.current !== currentSerialized) {
          lastBroadcastRef.current = currentSerialized;
          onDraftChangeRef.current(formData);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [formData, isOpen]);

  // Close panel on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Carrega leads atualizados da API / PHP
  React.useEffect(() => {
    if (!isOpen) return;
    const fetchRemoteLeads = async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.leads) && data.leads.length > 0) {
            setCapturedLeadsList((prev) => {
              const combined = [...data.leads];
              for (const p of prev) {
                if (!combined.some((c) => c.id === p.id || (c.email === p.email && c.createdAt === p.createdAt))) {
                  combined.push(p);
                }
              }
              return combined;
            });
            return;
          }
        }
      } catch {}

      try {
        const resPhp = await fetch('./lead.php');
        if (resPhp.ok) {
          const dataPhp = await resPhp.json();
          if (Array.isArray(dataPhp.leads) && dataPhp.leads.length > 0) {
            setCapturedLeadsList((prev) => {
              const combined = [...dataPhp.leads];
              for (const p of prev) {
                if (!combined.some((c) => c.id === p.id || (c.email === p.email && c.createdAt === p.createdAt))) {
                  combined.push(p);
                }
              }
              return combined;
            });
          }
        }
      } catch {}
    };
    fetchRemoteLeads();
  }, [isOpen]);

  if (!isOpen) return null;

  // Reusable image upload and compression handler
  const handleImageUpload = async (file: File, targetKey: string, onDone: (base64: string) => void) => {
    try {
      setCompressingTarget(targetKey);
      const compressedDataUrl = await compressImageFile(file, 900, 0.82);
      onDone(compressedDataUrl);
    } catch (err) {
      console.error('Falha ao comprimir imagem:', err);
      alert('Não foi possível processar a imagem selecionada. Tente outra foto.');
    } finally {
      setCompressingTarget(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const configWithTimestamp: SiteConfig = {
      ...formData,
    };

    // 1. Salva no estado do React e no localStorage
    onSave(configWithTimestamp);

    // 2. Envia para a nuvem (Supabase) e/ou servidor (/api/salvar ou ./salvar.php)
    let serverSuccess = false;
    let message = 'Salvo com sucesso!';

    try {
      const supabaseSaved = await saveConfigToSupabase(configWithTimestamp);
      if (supabaseSaved) {
        serverSuccess = true;
        message = 'Alterações salvas na Nuvem (Supabase) e no dispositivo!';
      }
    } catch (e) {
      // ignore
    }

    const payload = {
      password: formData.adminPassword || '1234',
      config: configWithTimestamp,
    };

    try {
      let res = await fetch('/api/salvar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch('./salvar.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          serverSuccess = true;
          message = 'Alterações e fotos gravadas no servidor e no dispositivo!';
        }
      }
    } catch (err) {
      if (!serverSuccess) {
        console.info('Servidor offline ou sem suporte a gravação em disco. Salvo no navegador.');
        message = 'Salvo com sucesso no seu dispositivo!';
      }
    }

    setIsSaving(false);
    setSavedFeedback({
      active: true,
      server: serverSuccess,
      message,
    });

    setTimeout(() => {
      setSavedFeedback(null);
    }, 3000);
  };

  const handleApplyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...(prev.theme || {
          fontTitle: 'Cormorant Garamond',
          fontBody: 'Plus Jakarta Sans',
          buttonShape: 'rounded-xl',
        }),
        presetName: preset.name,
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        backgroundColor: preset.background,
        cardBackgroundColor: preset.card,
      },
    }));
  };

  const currentPropertyIndex = formData.curatedBlock.properties.findIndex(
    (p) => p.id === selectedPropId
  );
  const currentProperty: CuratedProperty | undefined =
    formData.curatedBlock.properties[currentPropertyIndex] || formData.curatedBlock.properties[0];

  const updateCurrentProperty = (fields: Partial<CuratedProperty>) => {
    if (currentPropertyIndex === -1) return;
    const updated = [...formData.curatedBlock.properties];
    updated[currentPropertyIndex] = {
      ...updated[currentPropertyIndex],
      ...fields,
    };
    setFormData((prev) => ({
      ...prev,
      curatedBlock: {
        ...prev.curatedBlock,
        properties: updated,
      },
    }));
  };

  const handleAddNewProperty = () => {
    const newId = `prop-${Date.now()}`;
    const newProp: CuratedProperty = {
      id: newId,
      title: 'Nova Oportunidade Imobiliária',
      neighborhood: formData.profile.city || 'Curitiba e Região',
      type: 'Casa / Apartamento',
      phrase: 'Descreva os principais atrativos desta oportunidade imobiliária.',
      specs: {
        area: '120 m²',
        bedrooms: '3 Quartos',
        suites: '1 Suíte',
        parking: '2 Vagas',
      },
      price: 'Sob Consulta',
      tag: 'Lançamento',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      whatsappInquiryText: `Olá ${formData.profile.name}, vi a Nova Oportunidade no link da bio e gostaria de mais informações.`,
      externalLink: formData.profile.websiteUrl,
    };

    setFormData((prev) => ({
      ...prev,
      curatedBlock: {
        ...prev.curatedBlock,
        properties: [newProp, ...prev.curatedBlock.properties],
      },
    }));
    setSelectedPropId(newId);
  };

  const handleDeleteProperty = (id: string) => {
    if (formData.curatedBlock.properties.length <= 1) {
      alert('Você precisa manter pelo menos 1 imóvel na lista.');
      return;
    }
    const updated = formData.curatedBlock.properties.filter((p) => p.id !== id);
    setFormData((prev) => ({
      ...prev,
      curatedBlock: {
        ...prev.curatedBlock,
        properties: updated,
      },
    }));
    if (selectedPropId === id) {
      setSelectedPropId(updated[0]?.id || '');
    }
  };

  const handleAddCustomBlock = () => {
    const newId = `block-${Date.now()}`;
    const newBlock: CustomBlock = {
      id: newId,
      badge: 'Novidade',
      title: 'Novo Comunicado ou Lançamento',
      description: 'Espaço livre para você adicionar novidades, plantões de venda, oportunidades ou avisos.',
      ctaText: 'Falar com Corretor',
      ctaLink: `https://wa.me/${formData.profile.phone}`,
      whatsappMessage: `Olá ${formData.profile.name}, vi a novidade no seu link da bio e gostaria de conversar a respeito.`,
      enabled: true,
    };

    setFormData((prev) => ({
      ...prev,
      customBlocks: [...(prev.customBlocks || []), newBlock],
    }));
  };

  const updateCustomBlock = (id: string, fields: Partial<CustomBlock>) => {
    const updated = (formData.customBlocks || []).map((b) =>
      b.id === id ? { ...b, ...fields } : b
    );
    setFormData((prev) => ({
      ...prev,
      customBlocks: updated,
    }));
  };

  const handleDeleteCustomBlock = (id: string) => {
    const updated = (formData.customBlocks || []).filter((b) => b.id !== id);
    setFormData((prev) => ({
      ...prev,
      customBlocks: updated,
    }));
  };

  // --- BUILDER: CARTÕES DE PARCERIA (PROPRIETÁRIOS) ---
  const defaultSellerCards: PartnershipCard[] = [
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
      buttonText: formData.sellerBlock.quintoAndarCtaText || 'Cadastrar meu imóvel',
      buttonType: 'url',
      url: formData.sellerBlock.quintoAndarUrl || 'https://www.quintoandar.com.br/anunciar-imovel',
      enabled: true,
    },
  ];

  const currentSellerCards: PartnershipCard[] =
    formData.sellerBlock.cards && formData.sellerBlock.cards.length > 0
      ? formData.sellerBlock.cards
      : defaultSellerCards;

  const updateSellerCards = (newCards: PartnershipCard[]) => {
    setFormData((prev) => ({
      ...prev,
      sellerBlock: {
        ...prev.sellerBlock,
        cards: newCards,
      },
    }));
  };

  const handleAddSellerCard = () => {
    const newCard: PartnershipCard = {
      id: `seller-card-${Date.now()}`,
      title: 'Nova Parceria Imobiliária',
      badge: 'Parceiro Oficial',
      description: 'Divulgação nas maiores plataformas com assessoria jurídica e visitas qualificadas.',
      buttonText: 'Cadastrar Imóvel',
      buttonType: 'url',
      url: 'https://exemplo.com.br',
      enabled: true,
    };
    updateSellerCards([...currentSellerCards, newCard]);
  };

  const handleUpdateSellerCard = (id: string, updates: Partial<PartnershipCard>) => {
    updateSellerCards(currentSellerCards.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleDeleteSellerCard = (id: string) => {
    if (currentSellerCards.length <= 1) {
      alert('Você deve manter pelo menos um cartão de parceria.');
      return;
    }
    updateSellerCards(currentSellerCards.filter((c) => c.id !== id));
  };

  const handleMoveSellerCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSellerCards.length) return;
    const reordered = [...currentSellerCards];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    updateSellerCards(reordered);
  };

  const handleDuplicateSellerCard = (card: PartnershipCard) => {
    const duplicated: PartnershipCard = {
      ...card,
      id: `seller-card-${Date.now()}`,
      title: `${card.title} (Cópia)`,
    };
    updateSellerCards([...currentSellerCards, duplicated]);
  };

  // --- BUILDER: CARTÕES DE FINANCIAMENTO ---
  const defaultFinancingCards: FinancingCard[] = [
    {
      id: 'fin-simulator',
      title: 'Simulador de crédito',
      badge: '',
      description:
        'Simule em múltiplos bancos (Caixa, Itaú, Bradesco, Santander) e encontre a menor taxa para o seu perfil.',
      buttonText: formData.financingBlock?.ctaText || 'Simular Financiamento Gratuito',
      buttonType: 'url',
      url: formData.financingBlock?.simulationUrl || 'https://simular.credihome.com.br/marciorj-corretor',
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

  const currentFinancingCards: FinancingCard[] =
    formData.financingBlock?.cards && formData.financingBlock.cards.length > 0
      ? formData.financingBlock.cards
      : defaultFinancingCards;

  const updateFinancingCards = (newCards: FinancingCard[]) => {
    setFormData((prev) => ({
      ...prev,
      financingBlock: {
        ...(prev.financingBlock || {
          title: 'Assessoria & Financiamento Imobiliário',
          description:
            'Compare taxas entre bancos e parceiras e escolha a melhor condição para o seu perfil.',
          disclaimer:
            '*Simulação informativa sujeita à análise de crédito pelas instituições financeiras parceiras.',
        }),
        cards: newCards,
      },
    }));
  };

  const currentBanks: string[] = Array.isArray(formData.financingBlock?.banks)
    ? formData.financingBlock.banks
    : ['Caixa', 'Itaú', 'Bradesco', 'Santander'];

  const [newBankInput, setNewBankInput] = useState('');

  const handleAddBank = () => {
    const trimmed = newBankInput.trim();
    if (!trimmed) return;
    if (currentBanks.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
      alert('Este banco já está na lista.');
      return;
    }
    const updated = [...currentBanks, trimmed];
    setFormData((prev) => ({
      ...prev,
      financingBlock: {
        ...(prev.financingBlock || {
          title: 'Assessoria & Financiamento Imobiliário',
          description: '',
          disclaimer: '*Simulação informativa sujeita à análise de crédito pelas instituições financeiras parceiras.',
        }),
        banks: updated,
      },
    }));
    setNewBankInput('');
  };

  const handleRemoveBank = (indexToRemove: number) => {
    const updated = currentBanks.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({
      ...prev,
      financingBlock: {
        ...(prev.financingBlock || {
          title: 'Assessoria & Financiamento Imobiliário',
          description: '',
          disclaimer: '*Simulação informativa sujeita à análise de crédito pelas instituições financeiras parceiras.',
        }),
        banks: updated,
      },
    }));
  };

  const handleResetBanks = () => {
    setFormData((prev) => ({
      ...prev,
      financingBlock: {
        ...(prev.financingBlock || {
          title: 'Assessoria & Financiamento Imobiliário',
          description: '',
          disclaimer: '*Simulação informativa sujeita à análise de crédito pelas instituições financeiras parceiras.',
        }),
        banks: ['Caixa', 'Itaú', 'Bradesco', 'Santander'],
      },
    }));
  };

  const handleAddFinancingCard = () => {
    const newCard: FinancingCard = {
      id: `fin-card-${Date.now()}`,
      title: 'Nova Parceira de Financiamento',
      badge: 'Parceira Oficial',
      description: 'Assessoria especializada e condições diferenciadas de taxas para crédito imobiliário.',
      buttonText: 'Consultar Condições',
      buttonType: 'whatsapp',
      whatsappMessage:
        'Olá Márcio, gostaria de saber mais sobre as taxas e condições desta parceira de financiamento.',
      status: 'active',
      enabled: true,
    };
    updateFinancingCards([...currentFinancingCards, newCard]);
  };

  const handleUpdateFinancingCard = (id: string, updates: Partial<FinancingCard>) => {
    updateFinancingCards(
      currentFinancingCards.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteFinancingCard = (id: string) => {
    if (currentFinancingCards.length <= 1) {
      alert('Você deve manter pelo menos um cartão de financiamento.');
      return;
    }
    updateFinancingCards(currentFinancingCards.filter((c) => c.id !== id));
  };

  const handleMoveFinancingCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentFinancingCards.length) return;
    const reordered = [...currentFinancingCards];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    updateFinancingCards(reordered);
  };

  const handleDuplicateFinancingCard = (card: FinancingCard) => {
    const duplicated: FinancingCard = {
      ...card,
      id: `fin-card-${Date.now()}`,
      title: `${card.title} (Cópia)`,
    };
    updateFinancingCards([...currentFinancingCards, duplicated]);
  };

  const chatbotData: ChatbotConfig = formData.chatbot || {
    enabled: true,
    botName: 'Assistente do Márcio',
    welcomeMessage:
      'Olá! Sou o assistente virtual do corretor Márcio Rogério (CRECI-PR 59138). Estou aqui para entender o que você procura e te conectar com as melhores oportunidades em Mandirituba, Curitiba e região.',
    quickOptions: [
      { id: '1', label: '🏡 Quero comprar imóvel', prompt: 'Gostaria de ver imóveis para compra.' },
      { id: '2', label: '🌾 Chácara em Mandirituba', prompt: 'Procuro chácara ou imóvel com área verde em Mandirituba e região.' },
      { id: '3', label: '📊 Simulação de crédito', prompt: 'Gostaria de simular crédito imobiliário.' },
      { id: '4', label: '🔑 Avaliar ou vender imóvel', prompt: 'Quero avaliar ou vender meu imóvel.' },
    ],
    systemInstruction: '',
    whatsappCtaText: 'Falar com Márcio no WhatsApp',
  };

  const updateChatbot = (fields: Partial<ChatbotConfig>) => {
    setFormData((prev) => ({
      ...prev,
      chatbot: {
        ...(prev.chatbot || chatbotData),
        ...fields,
      },
    }));
  };

  const handleAddQuickOption = () => {
    const newOption: ChatbotQuickOption = {
      id: `opt-${Date.now()}`,
      label: '💬 Nova Opção Rápida',
      prompt: 'Gostaria de tirar uma dúvida específica.',
    };
    updateChatbot({
      quickOptions: [...(chatbotData.quickOptions || []), newOption],
    });
  };

  const handleUpdateQuickOption = (id: string, fields: Partial<ChatbotQuickOption>) => {
    const updated = (chatbotData.quickOptions || []).map((o) =>
      o.id === id ? { ...o, ...fields } : o
    );
    updateChatbot({ quickOptions: updated });
  };

  const handleDeleteQuickOption = (id: string) => {
    const updated = (chatbotData.quickOptions || []).filter((o) => o.id !== id);
    updateChatbot({ quickOptions: updated });
  };

  const handleAddKnowledgeItem = () => {
    const newItem: ChatbotKnowledgeItem = {
      id: `kb-${Date.now()}`,
      question: '',
      answer: '',
    };
    updateChatbot({
      knowledgeBase: [...(chatbotData.knowledgeBase || []), newItem],
    });
  };

  const handleUpdateKnowledgeItem = (id: string, fields: Partial<ChatbotKnowledgeItem>) => {
    const updated = (chatbotData.knowledgeBase || []).map((k) =>
      k.id === id ? { ...k, ...fields } : k
    );
    updateChatbot({ knowledgeBase: updated });
  };

  const handleDeleteKnowledgeItem = (id: string) => {
    const updated = (chatbotData.knowledgeBase || []).filter((k) => k.id !== id);
    updateChatbot({ knowledgeBase: updated });
  };

  const leadMagnetData: LeadMagnetConfig = formData.leadMagnet || {
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
  };

  const updateLeadMagnet = (fields: Partial<LeadMagnetConfig>) => {
    setFormData((prev) => {
      const updated = {
        ...(prev.leadMagnet || leadMagnetData),
        ...fields,
      };
      return {
        ...prev,
        leadMagnet: updated,
        blockVisibility: {
          ...(prev.blockVisibility || currentVisibility),
          leadMagnet: updated.enabled,
        },
      };
    });
  };

  const handleAddBulletPoint = () => {
    const updated = [...(leadMagnetData.bulletPoints || []), 'Novo benefício ou tópico do material'];
    updateLeadMagnet({ bulletPoints: updated });
  };

  const handleUpdateBulletPoint = (index: number, value: string) => {
    const updated = [...(leadMagnetData.bulletPoints || [])];
    updated[index] = value;
    updateLeadMagnet({ bulletPoints: updated });
  };

  const handleDeleteBulletPoint = (index: number) => {
    const updated = (leadMagnetData.bulletPoints || []).filter((_, i) => i !== index);
    updateLeadMagnet({ bulletPoints: updated });
  };

  const exportLeadsToCsv = () => {
    if (capturedLeadsList.length === 0) return;
    const headers = ['Nome', 'Email', 'Telefone', 'Material', 'Data'];
    const rows = capturedLeadsList.map((l) => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.materialTitle || '').replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleString('pt-BR')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_capturados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyEmails = () => {
    if (capturedLeadsList.length === 0) return;
    const emails = capturedLeadsList.map((l) => l.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const [copiedCode, setCopiedCode] = useState(false);
  const [backupRestoreMessage, setBackupRestoreMessage] = useState<string | null>(null);
  const backupFileRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = () => {
    downloadConfigAsJson(formData);
  };

  const handleCopyCode = () => {
    const code = generateDefaultDataCode(formData);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Gerenciamento de conexão com o Supabase (Nuvem em tempo real)
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseCredentials()?.url || 'https://rujmbhnwyxjzmezhqikw.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseCredentials()?.anonKey || '');
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseFeedback, setSupabaseFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestAndSaveSupabase = async () => {
    const cleanedUrl = cleanSupabaseUrl(supabaseUrl);
    setSupabaseUrl(cleanedUrl);
    if (!cleanedUrl || !supabaseAnonKey.trim()) {
      alert('Por favor, informe a URL e a Chave Anônima (Anon Key) do seu projeto Supabase.');
      return;
    }
    setSupabaseTesting(true);
    setSupabaseFeedback(null);
    const result = await testSupabaseConnection(cleanedUrl, supabaseAnonKey);
    setSupabaseTesting(false);
    setSupabaseFeedback(result);
    if (result.success) {
      saveSupabaseCredentials(cleanedUrl, supabaseAnonKey);
      await saveConfigToSupabase(formData);
    }
  };

  const handleDisconnectSupabase = () => {
    if (window.confirm('Deseja desconectar o Supabase deste painel?')) {
      clearSupabaseCredentials();
      setSupabaseUrl('');
      setSupabaseAnonKey('');
      setSupabaseFeedback({ success: false, message: 'Supabase desconectado.' });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          const restored = deepMergePreservingUserEdits(config, parsed);
          setFormData(restored);
          if (onDraftChange) onDraftChange(restored);
          onSave(restored);

          // Sincroniza imediatamente com o servidor para persistência em disco
          fetch('/api/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              password: restored.adminPassword || '1234',
              config: restored,
            }),
          }).catch(() => {
            fetch('./salvar.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                password: restored.adminPassword || '1234',
                config: restored,
              }),
            }).catch(() => {});
          });

          setBackupRestoreMessage('Backup restaurado e gravado com sucesso no minisite e no servidor!');
          setTimeout(() => setBackupRestoreMessage(null), 4000);
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        console.error('Falha ao restaurar backup JSON:', err);
        alert('Não foi possível ler este arquivo de backup. Verifique se é um arquivo .json válido.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleRestoreSnapshot = () => {
    const snapshot = loadSafetySnapshot();
    if (!snapshot || !snapshot.config) {
      alert('Nenhum snapshot de emergência encontrado no navegador.');
      return;
    }
    const formattedDate = new Date(snapshot.savedAt).toLocaleString('pt-BR');
    if (window.confirm(`Deseja restaurar a cópia de segurança salva em ${formattedDate}?`)) {
      setFormData(snapshot.config);
      if (onDraftChange) onDraftChange(snapshot.config);
      onSave(snapshot.config);
      setBackupRestoreMessage(`Cópia de segurança (${formattedDate}) restaurada com sucesso!`);
      setTimeout(() => setBackupRestoreMessage(null), 4000);
    }
  };

  const currentTheme: ThemeConfig = formData.theme || {
    presetName: 'Ouro Nobre & Noir',
    primaryColor: '#C5973D',
    secondaryColor: '#E8D5A0',
    backgroundColor: '#0E0F12',
    cardBackgroundColor: '#16171B',
    fontTitle: 'Cormorant Garamond',
    fontBody: 'Plus Jakarta Sans',
    buttonShape: 'rounded-xl',
  };

  const currentVisibility: BlockVisibility = formData.blockVisibility || {
    about: true,
    buyer: true,
    curated: true,
    featured: true,
    financing: true,
    seller: true,
  };

  return (
    <div className="studio-panel-root fixed inset-0 z-50 flex bg-[#0A0B0E]/95 backdrop-blur-md animate-fade-in text-left">
      {/* 1. LEFT PANE: LIVE MINISITE PREVIEW (DESKTOP & TABLET WIDE SCREENS) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-between p-6 bg-gradient-to-b from-[#0E0F13] to-[#07080A] border-r border-white/8 relative overflow-hidden select-none">
        {/* Top Header of Preview */}
        <div className="w-full max-w-[420px] flex items-center justify-between pt-1 pb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#C5973D]" />
            <span className="font-serif text-sm font-medium text-white">Visualização em Tempo Real</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Atualização Instantânea</span>
          </div>
        </div>

        {/* Live Phone Frame */}
        <div className="flex-1 w-full flex items-center justify-center overflow-hidden py-1">
          <MinisiteLivePreview config={formData} />
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-[#9E9B95]/80 text-center pb-1">
          📱 Esta é a prévia exata do seu link na bio como seus clientes veem no celular.
        </p>
      </div>

      {/* 2. RIGHT PANE: CONFIGURATION CONTROLS */}
      <div className="w-full lg:w-[480px] xl:w-[540px] h-full bg-[#141518] shadow-2xl flex flex-col z-10 text-[#F8F7F4]">
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#111215]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${currentTheme.primaryColor}20`, color: currentTheme.secondaryColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-medium text-white">
                  Painel Studio & Canva
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#C5973D]/20 text-[#E8D5A0] border border-[#C5973D]/40">
                  Ao Vivo
                </span>
              </div>
              <p className="text-[11px] text-[#9E9B95]">
                Altere dados, fotos e design vendo as mudanças ao lado em tempo real.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar Painel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View Toggle (Visible ONLY on phones / small screens) */}
        <div className="lg:hidden flex border-b border-white/10 bg-[#0E0F12] p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              mobileView === 'editor'
                ? 'bg-[#C5973D] text-[#0E0F12] font-semibold shadow-xs'
                : 'text-[#9E9B95] hover:text-white bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Configurações</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              mobileView === 'preview'
                ? 'bg-[#C5973D] text-[#0E0F12] font-semibold shadow-xs'
                : 'text-[#9E9B95] hover:text-white bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ver Prévia ao Vivo</span>
          </button>
        </div>

        {/* Mobile Live Preview when active */}
        {mobileView === 'preview' && (
          <div className="lg:hidden flex-1 flex flex-col items-center justify-center p-2 bg-[#0B0C0E] overflow-hidden">
            <div className="w-full flex justify-between items-center px-3 pb-2 text-[11px] text-[#E8D5A0]">
              <span>📱 Prévia do link na bio</span>
              <button
                type="button"
                onClick={() => setMobileView('editor')}
                className="text-xs text-[#C5973D] font-medium hover:underline"
              >
                Voltar e Editar →
              </button>
            </div>
            <div className="flex-1 w-full overflow-hidden flex items-center justify-center">
              <MinisiteLivePreview config={formData} />
            </div>
          </div>
        )}

        {/* Editor Form Container */}
        <div className={`flex-1 flex flex-col overflow-hidden ${mobileView === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Tab Switcher - Perfil & Identidade em 1º Lugar */}
          <div className="flex border-b border-white/8 bg-[#0D0E10] p-1.5 gap-1 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'perfil'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>👤 Perfil & Identidade</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('canva')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'canva'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>🎨 Design & Canva</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('imoveis')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'imoveis'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>🏡 Imóveis ({formData.curatedBlock.properties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('destaque')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'destaque'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>⭐ Destaque</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blocos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'blocos'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>📦 Blocos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leadmagnet')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'leadmagnet'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>🧲 Lead Magnet / E-book</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chatbot')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'chatbot'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>🤖 Chatbot & Leads</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('codigo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'codigo'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#C5973D]" />
            <span>🛡️ Segurança & Backup</span>
          </button>
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-left">
          {/* TAB 1: PERFIL & IDENTIDADE */}
          {activeTab === 'perfil' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-[#1A1C22] border border-[#C5973D]/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider">
                    Dados do Corretor & Negócio
                  </h4>
                  <p className="text-[11px] text-[#9E9B95]">
                    Altere todas as informações sem tocar em código.
                  </p>
                </div>
              </div>

              {/* Nome do Corretor */}
              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Nome do Corretor
                </label>
                <input
                  type="text"
                  value={formData.profile.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="Seu Nome Completo"
                />
              </div>

              {/* Subtítulo / Cargo no Cabeçalho */}
              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Subtítulo / Cargo no Cabeçalho
                </label>
                <input
                  type="text"
                  value={formData.profile.subtitle || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="Ex: Corretor de Imóveis · Consultoria Imobiliária"
                />
              </div>

              {/* Número do CRECI */}
              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Número do CRECI
                </label>
                <input
                  type="text"
                  value={formData.profile.creci}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, creci: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="Ex: CRECI-PR 59138"
                />
              </div>

              {/* Cidade / Região de Atuação */}
              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C5973D]" />
                  <span>Cidade e Região de Atuação (Brasão do Topo)</span>
                </label>
                <input
                  type="text"
                  value={formData.profile.city || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="Ex: Mandirituba, Curitiba e Região"
                />
              </div>

              {/* WhatsApp com DDD */}
              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C5973D]" />
                  <span>Telefone do WhatsApp (com DDD, apenas números)</span>
                </label>
                <input
                  type="text"
                  value={formData.profile.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none font-mono"
                  placeholder="5541999999999"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-[#C5973D]" />
                  <span>@ do Instagram</span>
                </label>
                <input
                  type="text"
                  value={formData.profile.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, instagram: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="@seuperfil"
                />
              </div>

              {/* Site Oficial */}
              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#C5973D]" />
                  <span>Link do Site Oficial</span>
                </label>
                <input
                  type="url"
                  value={formData.profile.websiteUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, websiteUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="https://seusite.com.br"
                />
              </div>


              {/* Proposta de Valor / Linha de Apresentação */}
              <div>
                <label className="block text-xs font-medium text-[#E8D5A0] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5973D]" />
                  <span>Proposta de Valor (Abaixo do Nome & CRECI)</span>
                </label>
                <input
                  type="text"
                  value={formData.profile.propostaDeValor || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, propostaDeValor: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="Do Sul do Brasil a Miami: compra, venda, locação e investimento."
                />
                <p className="text-[10px] text-[#9E9B95] mt-1">
                  Exibida logo abaixo do seu nome e CRECI na apresentação profissional.
                </p>
              </div>

              {/* Foto de Perfil com upload + compressão automática Canvas */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <label className="block text-xs font-medium text-[#E8D5A0]">
                  Foto de Perfil (Otimização Automática)
                </label>
                {formData.profile.avatarUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.profile.avatarUrl}
                      alt="Preview Foto"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#C5973D]"
                    />
                    <div className="space-y-1">
                      <span className="text-[11px] text-emerald-400 block font-medium">
                        ✓ Foto carregada e otimizada
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, avatarUrl: '' },
                          })
                        }
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remover foto (usar ilustração padrão)
                      </button>
                    </div>
                  </div>
                ) : null}

                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#F8F7F4] border border-white/10 cursor-pointer transition-colors">
                  {compressingTarget === 'avatar' ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#C5973D] animate-spin" />
                      <span>Otimizando foto em alta resolução leve...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#C5973D]" />
                      <span>Escolher Foto do Celular / Computador</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, 'avatar', (base64) => {
                          setFormData((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, avatarUrl: base64 },
                          }));
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {/* QR Code Personalizado do Minisite */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#C5973D]" />
                  <label className="text-xs font-medium text-[#E8D5A0]">
                    QR Code do Minisite (Compartilhamento)
                  </label>
                </div>
                <p className="text-[11px] text-[#9E9B95] leading-relaxed">
                  Suba a imagem do seu QR Code oficial. Ela será exibida com exclusividade aos clientes quando clicarem no botão "QR Code" ou "Compartilhar".
                </p>

                {formData.profile.qrCodeUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.profile.qrCodeUrl}
                      alt="Preview QR Code"
                      className="w-16 h-16 rounded-xl object-contain bg-white p-1 border-2 border-[#C5973D]"
                    />
                    <div className="space-y-1">
                      <span className="text-[11px] text-emerald-400 block font-medium">
                        ✓ QR Code personalizado ativo
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, qrCodeUrl: '' },
                          })
                        }
                        className="text-xs text-red-400 hover:underline cursor-pointer"
                      >
                        Remover QR Code (usar padrão vetorial)
                      </button>
                    </div>
                  </div>
                ) : null}

                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#F8F7F4] border border-white/10 cursor-pointer transition-colors">
                  {compressingTarget === 'qrcode' ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#C5973D] animate-spin" />
                      <span>Otimizando QR Code...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#C5973D]" />
                      <span>{formData.profile.qrCodeUrl ? 'Trocar Imagem do QR Code' : 'Subir Imagem do QR Code'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, 'qrcode', (base64) => {
                          setFormData((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, qrCodeUrl: base64 },
                          }));
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {/* Senha de Acesso do Corretor */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[#C5973D]/20 space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#C5973D]" />
                  <label className="text-xs font-medium text-[#E8D5A0]">
                    Senha de Acesso ao Painel (para o cadeado)
                  </label>
                </div>
                <p className="text-[11px] text-[#9E9B95] leading-relaxed">
                  Esta é a senha solicitada quando você clica no cadeado discreto no final do site.
                </p>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.adminPassword || '1234'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adminPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none pr-10 font-mono"
                    placeholder="1234"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9B95] hover:text-[#E8D5A0]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESIGN & CANVA (CORES & FONTES) */}
          {activeTab === 'canva' && (
            <div className="space-y-6 animate-fade-in">
              {/* Paletas Prontas */}
              <div>
                <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block mb-2">
                  1. Paletas de Cores Prontas (1 Clique)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyColorPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        currentTheme.primaryColor === preset.primary
                          ? 'border-[#C5973D] bg-white/[0.04]'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-medium text-white">{preset.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: preset.card }}
                          />
                        </div>
                      </div>
                      {currentTheme.primaryColor === preset.primary && (
                        <Check className="w-4 h-4 text-[#C5973D]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor Customizado de Cores */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                  2. Personalizar Cores Livres (Conta-Gotas / HEX)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Cor Primária (Destaques)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTheme.primaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...currentTheme, primaryColor: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.primaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...currentTheme, primaryColor: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1 text-xs rounded-md bg-[#0E0F12] border border-white/10 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Cor Secundária (Texto Ouro)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTheme.secondaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...currentTheme, secondaryColor: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.secondaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...currentTheme, secondaryColor: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1 text-xs rounded-md bg-[#0E0F12] border border-white/10 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Fundo da Página</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTheme.backgroundColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...currentTheme, backgroundColor: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.backgroundColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...currentTheme, backgroundColor: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1 text-xs rounded-md bg-[#0E0F12] border border-white/10 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Fundo dos Cartões</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTheme.cardBackgroundColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...currentTheme, cardBackgroundColor: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.cardBackgroundColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...currentTheme, cardBackgroundColor: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1 text-xs rounded-md bg-[#0E0F12] border border-white/10 font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipografia / Fontes */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#C5973D]" />
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    3. Tipografia & Fontes
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Fonte dos Títulos (Cabeçalhos e Nomes)</label>
                    <select
                      value={currentTheme.fontTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...currentTheme, fontTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white outline-none"
                    >
                      {TITLE_FONTS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Fonte dos Textos (Corpo e Descrições)</label>
                    <select
                      value={currentTheme.fontBody}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...currentTheme, fontBody: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white outline-none"
                    >
                      {BODY_FONTS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMÓVEIS DA CURADORIA (UPLOAD GALERIA + COMPRESSÃO) */}
          {activeTab === 'imoveis' && currentProperty && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    Gerenciar Imóveis da Curadoria
                  </label>
                  <p className="text-[11px] text-[#9E9B95]">
                    Adicione, altere fotos direto da câmera/galeria ou remova imóveis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewProperty}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5973D] text-[#0E0F12] font-semibold text-xs shadow-sm hover:brightness-105 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Imóvel</span>
                </button>
              </div>

              {/* Botão de Acesso Geral ao Catálogo / Site */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/8 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8D5A0]">
                  <ExternalLink className="w-3.5 h-3.5 text-[#C5973D]" />
                  <span>Botão Geral do Catálogo (Topo da Curadoria)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#9E9B95] mb-1">Texto do Botão Geral</label>
                    <input
                      type="text"
                      value={formData.curatedBlock.ctaText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          curatedBlock: { ...formData.curatedBlock, ctaText: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                      placeholder="Conheça os imóveis e oportunidades"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#9E9B95] mb-1">Hiperlink do Botão Geral</label>
                    <input
                      type="url"
                      value={formData.curatedBlock.websiteUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          curatedBlock: { ...formData.curatedBlock, websiteUrl: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                      placeholder="https://marciorjcorretor.com.br"
                    />
                  </div>
                </div>
              </div>

              {/* Seletor de Imóvel */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                {formData.curatedBlock.properties.map((prop, idx) => (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => setSelectedPropId(prop.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                      selectedPropId === prop.id
                        ? 'bg-[#C5973D]/20 border-[#C5973D] text-[#E8D5A0]'
                        : 'bg-white/5 border-white/10 text-[#9E9B95] hover:text-white'
                    }`}
                  >
                    #{idx + 1} {prop.title.substring(0, 16)}...
                  </button>
                ))}
              </div>

              {/* Formulário do Imóvel Selecionado */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <div className="flex items-center justify-between border-b border-white/8 pb-2">
                  <span className="text-xs font-semibold text-white">Editar Imóvel Selecionado</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteProperty(currentProperty.id)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Imóvel</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">Título do Imóvel</label>
                  <input
                    type="text"
                    value={currentProperty.title}
                    onChange={(e) => updateCurrentProperty({ title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Bairro / Localização</label>
                    <input
                      type="text"
                      value={currentProperty.neighborhood}
                      onChange={(e) => updateCurrentProperty({ neighborhood: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Tipo de Imóvel</label>
                    <input
                      type="text"
                      value={currentProperty.type}
                      onChange={(e) => updateCurrentProperty({ type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">Descrição Comercial</label>
                  <textarea
                    rows={2}
                    value={currentProperty.phrase}
                    onChange={(e) => updateCurrentProperty({ phrase: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white resize-none"
                  />
                </div>

                {/* Upload Foto do Imóvel com Compressão Canvas */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
                  <label className="block text-[11px] text-[#E8D5A0] font-medium">
                    Foto do Imóvel (Câmera ou Galeria)
                  </label>
                  {currentProperty.imageUrl && (
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={currentProperty.imageUrl}
                        alt="Preview Imóvel"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#F8F7F4] border border-white/10 cursor-pointer transition-colors">
                    {compressingTarget === currentProperty.id ? (
                      <>
                        <Loader2 className="w-4 h-4 text-[#C5973D] animate-spin" />
                        <span>Otimizando foto em alta definição leve...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#C5973D]" />
                        <span>Escolher Foto do Celular / Computador</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, currentProperty.id, (base64) => {
                            updateCurrentProperty({ imageUrl: base64 });
                          });
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Preço / Valor</label>
                    <input
                      type="text"
                      value={currentProperty.price || 'Sob Consulta'}
                      onChange={(e) => updateCurrentProperty({ price: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Etiqueta / Tag</label>
                    <input
                      type="text"
                      value={currentProperty.tag || ''}
                      onChange={(e) => updateCurrentProperty({ tag: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Mensagem de WhatsApp Pré-formatada
                  </label>
                  <input
                    type="text"
                    value={currentProperty.whatsappInquiryText}
                    onChange={(e) => updateCurrentProperty({ whatsappInquiryText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-[#C5973D]" />
                    <span>Hiperlink da Ficha do Imóvel (Link no seu site oficial ou portal)</span>
                  </label>
                  <input
                    type="url"
                    value={currentProperty.externalLink || ''}
                    onChange={(e) => updateCurrentProperty({ externalLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                    placeholder="Ex: https://marciorjcorretor.com.br/imoveis/chacara-mandirituba"
                  />
                  <p className="text-[10px] text-[#9E9B95] mt-1">
                    Quando preenchido, os visitantes poderão abrir a ficha deste imóvel diretamente no seu site oficial.
                  </p>
                </div>

                {/* Configuração de Apresentação e Plantas (PDF no Supabase Storage) */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-[#E8D5A0] font-medium flex items-center gap-1.5">
                      <FileDown className="w-3.5 h-3.5 text-[#C5973D]" />
                      <span>Botão &quot;Baixar Apresentação e Plantas (PDF)&quot;</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentProperty.pdfEnabled ?? Boolean(currentProperty.pdfFilename)}
                        onChange={(e) => updateCurrentProperty({ pdfEnabled: e.target.checked })}
                        className="rounded accent-[#C5973D] w-3.5 h-3.5"
                      />
                      <span className="text-[10px] text-[#9E9B95]">Ativar botão</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#9E9B95] mb-1">
                      Nome do arquivo PDF no Supabase Storage (bucket &quot;plantas&quot;)
                    </label>
                    <input
                      type="text"
                      value={currentProperty.pdfFilename || ''}
                      onChange={(e) =>
                        updateCurrentProperty({
                          pdfFilename: e.target.value.trim(),
                          pdfEnabled: e.target.value.trim() !== '' ? true : currentProperty.pdfEnabled,
                        })
                      }
                      placeholder="ex: bioma-curitiba.pdf ou helbor-vm125-apresentacao.pdf"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none font-mono"
                    />
                    <p className="text-[10px] text-[#71717A] mt-1 leading-relaxed">
                      Ao preencher, o botão &quot;Baixar Apresentação e Plantas (PDF)&quot; aparece abaixo de &quot;Ver detalhes&quot; e &quot;Consultar&quot; no card. O cliente preenche Nome e WhatsApp (salvos na tabela leads do Supabase) e recebe o PDF assinado na hora!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DESTAQUE ATUAL (UPLOAD GALERIA + COMPRESSÃO) */}
          {activeTab === 'destaque' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-[#1A1C22] border border-[#C5973D]/30">
                <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                  Empreendimento ou Parceria em Destaque
                </label>
                <p className="text-[11px] text-[#9E9B95]">
                  Altere o grande lançamento em destaque no mini-site.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">Selo / Badge</label>
                <input
                  type="text"
                  value={formData.featuredProject.badge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: { ...formData.featuredProject, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">Nome do Empreendimento</label>
                <input
                  type="text"
                  value={formData.featuredProject.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: { ...formData.featuredProject, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">Localização</label>
                <input
                  type="text"
                  value={formData.featuredProject.neighborhood}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: { ...formData.featuredProject, neighborhood: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={formData.featuredProject.phrase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: { ...formData.featuredProject, phrase: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none resize-none"
                />
              </div>

              {/* Botão e Hiperlink de Acesso do Empreendimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-[#9E9B95] mb-1">Texto do Botão Principal</label>
                  <input
                    type="text"
                    value={formData.featuredProject.ctaText || 'Conheça o Lançamento'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredProject: { ...formData.featuredProject, ctaText: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                    placeholder="Ex: Conheça o VM125"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9E9B95] mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-[#C5973D]" />
                    <span>Hiperlink / URL do Empreendimento</span>
                  </label>
                  <input
                    type="url"
                    value={formData.featuredProject.link || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredProject: { ...formData.featuredProject, link: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                    placeholder="Ex: https://marciorjcorretor.com.br/vm125"
                  />
                </div>
              </div>

              {/* Foto do Destaque com Compressão Canvas */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-2">
                <label className="block text-xs font-medium text-[#E8D5A0]">Foto do Empreendimento</label>
                {formData.featuredProject.imageUrl && (
                  <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-white/10 mb-2">
                    <img src={formData.featuredProject.imageUrl} alt="Destaque" className="w-full h-full object-cover" />
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#F8F7F4] border border-white/10 cursor-pointer transition-colors">
                  {compressingTarget === 'destaque' ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#C5973D] animate-spin" />
                      <span>Otimizando foto em alta definição leve...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#C5973D]" />
                      <span>Escolher Foto do Celular / Computador</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, 'destaque', (base64) => {
                          setFormData((prev) => ({
                            ...prev,
                            featuredProject: { ...prev.featuredProject, imageUrl: base64 },
                          }));
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {/* Material em PDF do Destaque */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#E8D5A0] font-medium flex items-center gap-1.5">
                    <FileDown className="w-3.5 h-3.5 text-[#C5973D]" />
                    <span>Material em PDF (Plantas & Apresentação)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featuredProject.pdfEnabled ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featuredProject: { ...formData.featuredProject, pdfEnabled: e.target.checked },
                        })
                      }
                      className="rounded accent-[#C5973D] w-3.5 h-3.5"
                    />
                    <span className="text-[10px] text-[#9E9B95]">Ativo</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.featuredProject.pdfFilename || 'helbor-vm125-apresentacao.pdf'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: { ...formData.featuredProject, pdfFilename: e.target.value.trim() },
                    })
                  }
                  placeholder="helbor-vm125-apresentacao.pdf"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none font-mono"
                />
                <p className="text-[10px] text-[#71717A] leading-relaxed">
                  Nome exato do arquivo no bucket &quot;plantas&quot; do Supabase Storage. O botão &quot;Baixar Apresentação e Plantas (PDF)&quot; baixa esse arquivo após capturar o lead.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: BLOCOS & VISIBILIDADE */}
          {activeTab === 'blocos' && (
            <div className="space-y-6 animate-fade-in">
              {/* Ligar / Desligar Seções */}
              <div>
                <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block mb-2">
                  Ativar ou Desativar Seções Padrão
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'about', label: 'Sobre o Corretor (Bio e Trajetória)' },
                    { key: 'buyer', label: 'Comprar Imóveis (Interesse do Cliente)' },
                    { key: 'curated', label: 'Curadoria de Imóveis (Galeria de Imóveis)' },
                    { key: 'featured', label: 'Destaque Atual (Empreendimento / Parceria)' },
                    { key: 'financing', label: 'Simulador de Financiamento (Credihome)' },
                    { key: 'seller', label: 'Vender ou Avaliar Imóvel (Captação)' },
                  ].map((sec) => (
                    <div
                      key={sec.key}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-xs text-white font-medium">{sec.label}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            blockVisibility: {
                              ...currentVisibility,
                              [sec.key]: !currentVisibility[sec.key as keyof BlockVisibility],
                            },
                          })
                        }
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          currentVisibility[sec.key as keyof BlockVisibility]
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-[#9E9B95] border border-white/10'
                        }`}
                      >
                        {currentVisibility[sec.key as keyof BlockVisibility] ? 'Ativado' : 'Oculto'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ======================================================== */}
              {/* SEÇÃO 1: SOBRE O CORRETOR (APRESENTAÇÃO PROFISSIONAL)     */}
              {/* ======================================================== */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C5973D]" />
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    Bloco Apresentação / Sobre o Corretor (Seção 1)
                  </label>
                </div>

                <p className="text-[11px] text-[#9E9B95] leading-relaxed">
                  Personalize a etiqueta, proposta de valor e texto descritivo da sua trajetória profissional no Sul do Brasil e regiões atendidas.
                </p>

                <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/8">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Etiqueta Superior / Tag</label>
                    <input
                      type="text"
                      value={formData.aboutBlock?.tag || 'Apresentação Profissional'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aboutBlock: {
                            ...formData.aboutBlock,
                            tag: e.target.value,
                            description:
                              formData.aboutBlock?.description ||
                              'Consultoria imobiliária especializada em Mandirituba, Curitiba e Região Metropolitana. Avaliação técnica, lançamentos e assessoria de crédito.',
                            websiteLinkText:
                              formData.aboutBlock?.websiteLinkText ||
                              'Conheça minha trajetória completa no site oficial',
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                      placeholder="Apresentação Profissional"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Texto de Trajetória / Atuação</label>
                    <textarea
                      rows={2}
                      value={
                        formData.aboutBlock?.description ||
                        'Consultoria imobiliária especializada em Mandirituba, Curitiba e Região Metropolitana. Avaliação técnica, lançamentos e assessoria de crédito.'
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aboutBlock: {
                            ...formData.aboutBlock,
                            description: e.target.value,
                            tag: formData.aboutBlock?.tag || 'Apresentação Profissional',
                            websiteLinkText:
                              formData.aboutBlock?.websiteLinkText ||
                              'Conheça minha trajetória completa no site oficial',
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#9E9B95] mb-1">Texto do Link</label>
                      <input
                        type="text"
                        value={
                          formData.aboutBlock?.websiteLinkText ||
                          'Conheça minha trajetória completa no site oficial'
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            aboutBlock: {
                              ...formData.aboutBlock,
                              websiteLinkText: e.target.value,
                              tag: formData.aboutBlock?.tag || 'Apresentação Profissional',
                              description:
                                formData.aboutBlock?.description ||
                                'Consultoria imobiliária especializada em Mandirituba, Curitiba e Região Metropolitana. Avaliação técnica, lançamentos e assessoria de crédito.',
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                        placeholder="Conheça minha trajetória completa no site oficial"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#9E9B95] mb-1 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-[#C5973D]" />
                        <span>Hiperlink / URL de Destino do Link</span>
                      </label>
                      <input
                        type="url"
                        value={formData.aboutBlock?.websiteUrl || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            aboutBlock: {
                              ...formData.aboutBlock,
                              websiteUrl: e.target.value,
                              tag: formData.aboutBlock?.tag || 'Apresentação Profissional',
                              description:
                                formData.aboutBlock?.description ||
                                'Consultoria imobiliária especializada em Mandirituba, Curitiba e Região Metropolitana. Avaliação técnica, lançamentos e assessoria de crédito.',
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                        placeholder="Ex: https://marciorjcorretor.com.br ou página sobre"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SEÇÃO 2: COMPRAR IMÓVEIS (INTERESSE DO CLIENTE - SEÇÃO 2) */}
              {/* ======================================================== */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#C5973D]" />
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    Bloco Comprar Imóveis (Interesse do Cliente - Seção 2)
                  </label>
                </div>

                <p className="text-[11px] text-[#9E9B95] leading-relaxed">
                  Personalize títulos, texto de apoio, botão de WhatsApp e frases de garantia e rodapé da seção de compras.
                </p>

                <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/8">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Etiqueta Superior / Tag</label>
                    <input
                      type="text"
                      value={formData.buyerBlock.tag || 'Atendimento Consultivo'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buyerBlock: { ...formData.buyerBlock, tag: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                      placeholder="Atendimento Consultivo"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Título do Bloco</label>
                    <input
                      type="text"
                      value={formData.buyerBlock.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buyerBlock: { ...formData.buyerBlock, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                      placeholder="Sua próxima compra."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Texto de Apoio / Descritivo</label>
                    <textarea
                      rows={3}
                      value={formData.buyerBlock.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buyerBlock: { ...formData.buyerBlock, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                      placeholder="Receba uma seleção personalizada de casas, apartamentos, terrenos, chácaras ou lançamentos alinhados ao seu objetivo e perfil."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#9E9B95] mb-1">Texto do Botão CTA</label>
                      <input
                        type="text"
                        value={formData.buyerBlock.ctaText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buyerBlock: { ...formData.buyerBlock, ctaText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                        placeholder="Converse sobre sua próxima compra"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#9E9B95] mb-1">Mensagem Padrão do WhatsApp</label>
                      <input
                        type="text"
                        value={formData.buyerBlock.whatsappMessage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buyerBlock: { ...formData.buyerBlock, whatsappMessage: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                        placeholder="Olá Márcio, gostaria de tirar dúvidas sobre crédito e imóveis."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#9E9B95] mb-1">Frase de Rodapé 1 (Abaixo do Botão)</label>
                      <input
                        type="text"
                        value={formData.buyerBlock.footnoteText || 'Atendimento direto pelo WhatsApp'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buyerBlock: { ...formData.buyerBlock, footnoteText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                        placeholder="Atendimento direto pelo WhatsApp"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#9E9B95] mb-1">Frase de Rodapé 2 (Em destaque)</label>
                      <input
                        type="text"
                        value={formData.buyerBlock.footnoteSubtext || 'Sigilo & Discrição'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buyerBlock: { ...formData.buyerBlock, footnoteSubtext: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                        placeholder="Sigilo & Discrição"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SEÇÃO 3: PARA PROPRIETÁRIOS (LOFT & QUINTOANDAR)          */}
              {/* ======================================================== */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#C5973D]" />
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    Bloco Para Proprietários (Loft & QuintoAndar)
                  </label>
                </div>

                {/* Título do Bloco */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8">
                  <label className="block text-[11px] text-[#9E9B95] mb-1">Título do Bloco</label>
                  <input
                    type="text"
                    value={formData.sellerBlock.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerBlock: { ...formData.sellerBlock, title: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                    placeholder="Quer vender ou alugar seu imóvel?"
                  />
                </div>

                {/* Lista de Cartões de Parceria */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#E8D5A0] uppercase tracking-wider">
                      Cartões Individuais de Parceria ({currentSellerCards.length})
                    </span>
                    <span className="text-[10px] text-[#9E9B95]">1 objetivo & 1 botão por cartão</span>
                  </div>

                  {currentSellerCards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 transition-all"
                    >
                      {/* Top bar do cartão */}
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#C5973D]/20 text-[#C5973D] flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                            {card.title}
                          </span>
                          {card.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#C5973D] border border-white/10">
                              {card.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSellerCard(idx, 'up')}
                            className="p-1 rounded text-[#9E9B95] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === currentSellerCards.length - 1}
                            onClick={() => handleMoveSellerCard(idx, 'down')}
                            className="p-1 rounded text-[#9E9B95] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateSellerCard(card)}
                            className="p-1 rounded text-[#9E9B95] hover:text-[#C5973D]"
                            title="Duplicar cartão"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSellerCard(card.id, { enabled: card.enabled === false ? true : false })
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              card.enabled !== false
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-white/5 text-[#9E9B95]'
                            }`}
                          >
                            {card.enabled !== false ? 'Ativo' : 'Oculto'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSellerCard(card.id)}
                            className="p-1 rounded text-red-400 hover:text-red-300"
                            title="Excluir cartão"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Campos do cartão */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-1">Título do Cartão</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleUpdateSellerCard(card.id, { title: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-1">Selo / Tag do Topo</label>
                          <input
                            type="text"
                            value={card.badge || ''}
                            onChange={(e) => handleUpdateSellerCard(card.id, { badge: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                            placeholder="Ex: Venda & Locação, 100% Digital"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#9E9B95] mb-1">Descrição</label>
                        <textarea
                          rows={2}
                          value={card.description}
                          onChange={(e) => handleUpdateSellerCard(card.id, { description: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-1">Texto do Botão Único</label>
                          <input
                            type="text"
                            value={card.buttonText}
                            onChange={(e) => handleUpdateSellerCard(card.id, { buttonText: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-1">Ação do Botão</label>
                          <select
                            value={card.buttonType}
                            onChange={(e) =>
                              handleUpdateSellerCard(card.id, {
                                buttonType: e.target.value as 'whatsapp' | 'url',
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                          >
                            <option value="whatsapp">💬 Conversa direta no WhatsApp</option>
                            <option value="url">🔗 Link / Site Externo (ex: QuintoAndar)</option>
                          </select>
                        </div>
                      </div>

                      {card.buttonType === 'whatsapp' ? (
                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-1">
                            Mensagem Pronta do WhatsApp ao Clicar
                          </label>
                          <input
                            type="text"
                            value={card.whatsappMessage || ''}
                            onChange={(e) =>
                              handleUpdateSellerCard(card.id, { whatsappMessage: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                            placeholder="Olá Márcio, tenho um imóvel e gostaria de anunciar..."
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-1">
                            Link / Destino da URL (Configurável)
                          </label>
                          <input
                            type="url"
                            value={card.url || ''}
                            onChange={(e) => handleUpdateSellerCard(card.id, { url: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none font-mono"
                            placeholder="https://www.quintoandar.com.br/anunciar-imovel"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ======================================================== */}
              {/* SEÇÃO 2: FINANCIAMENTO (BUILDER COM SLOT 'EM BREVE')     */}
              {/* ======================================================== */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#C5973D]" />
                    <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                      Bloco Financiamento & Crédito (3 Cartões)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFinancingCard}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C5973D] hover:bg-[#D4AF37] text-[#0E0F12] font-semibold text-[11px] shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Cartão</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#9E9B95] leading-relaxed">
                  Gerencie o simulador de bancos, a parceira de financiamento atual e o slot reservado &apos;Em breve&apos; que você pode ativar com 1 clique quando firmar nova parceria.
                </p>

                {/* Campos Gerais do Bloco */}
                <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/8">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Título do Bloco</label>
                    <input
                      type="text"
                      value={formData.financingBlock?.title || 'Assessoria & Financiamento Imobiliário'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          financingBlock: {
                            ...(formData.financingBlock || {
                              title: '',
                              description: '',
                              disclaimer: '',
                            }),
                            title: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                    />
                  </div>

                  {/* Gerenciamento Dinâmico de Bancos Parceiros */}
                  <div className="pt-2 border-t border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-[#C5973D]" />
                        <label className="text-[11px] font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                          Bancos Parceiros Exibidos ({currentBanks.length})
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetBanks}
                        className="text-[10px] text-[#9E9B95] hover:text-[#C5973D] underline cursor-pointer"
                        title="Restaurar lista original de bancos"
                      >
                        Restaurar padrão
                      </button>
                    </div>

                    <p className="text-[10px] text-[#9E9B95] leading-relaxed">
                      Adicione ou remova os bancos exibidos na tarja do bloco de financiamento:
                    </p>

                    {/* Tags dos bancos cadastrados com botão de excluir */}
                    <div className="flex flex-wrap items-center gap-1.5 min-h-[34px] p-2 rounded-lg bg-black/30 border border-white/5">
                      {currentBanks.map((bank, index) => (
                        <span
                          key={`${bank}-${index}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/10 text-xs text-[#F8F7F4] group hover:border-red-400/40 transition-colors"
                        >
                          <span>{bank}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBank(index)}
                            className="w-3.5 h-3.5 rounded-full hover:bg-red-500/20 text-[#9E9B95] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                            title={`Remover ${bank}`}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                      {currentBanks.length === 0 && (
                        <span className="text-[11px] text-[#71717A] italic">
                          Nenhum banco cadastrado. Adicione abaixo.
                        </span>
                      )}
                    </div>

                    {/* Formulário para adicionar novo banco */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newBankInput}
                        onChange={(e) => setNewBankInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBank();
                          }
                        }}
                        placeholder="Nome do banco (ex: Banco do Brasil, Inter, Sicredi...)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddBank}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C5973D] hover:bg-[#D4A74D] text-[#0E0F12] font-semibold text-xs transition-colors cursor-pointer shadow-sm shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Adicionar Banco</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">Aviso Legal / Disclaimer de Rodapé</label>
                    <input
                      type="text"
                      value={
                        formData.financingBlock?.disclaimer ||
                        '*Simulação informativa sujeita à análise de crédito pelas instituições financeiras parceiras.'
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          financingBlock: {
                            ...(formData.financingBlock || {
                              title: '',
                              description: '',
                              disclaimer: '',
                            }),
                            disclaimer: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                    />
                  </div>
                </div>

                {/* Lista de Cartões de Financiamento */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#E8D5A0] uppercase tracking-wider">
                      Cartões de Financiamento ({currentFinancingCards.length})
                    </span>
                    <span className="text-[10px] text-[#9E9B95]">Simulador · Parceira · Slot Em breve</span>
                  </div>

                  {currentFinancingCards.map((card, idx) => {
                    const isComingSoon = card.status === 'coming_soon';

                    return (
                      <div
                        key={card.id}
                        className={`p-3.5 rounded-xl border space-y-3 transition-all ${
                          isComingSoon
                            ? 'bg-white/[0.015] border-dashed border-[#C5973D]/40'
                            : 'bg-white/[0.03] border-white/10'
                        }`}
                      >
                        {/* Top bar do cartão de financiamento */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#C5973D]/20 text-[#C5973D] flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                              {card.title}
                            </span>
                            {isComingSoon ? (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                                <Clock className="w-3 h-3" />
                                Slot Reservado
                              </span>
                            ) : (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                                Ativo no Site
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveFinancingCard(idx, 'up')}
                              className="p-1 rounded text-[#9E9B95] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === currentFinancingCards.length - 1}
                              onClick={() => handleMoveFinancingCard(idx, 'down')}
                              className="p-1 rounded text-[#9E9B95] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateFinancingCard(card)}
                              className="p-1 rounded text-[#9E9B95] hover:text-[#C5973D]"
                              title="Duplicar cartão"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateFinancingCard(card.id, {
                                  enabled: card.enabled === false ? true : false,
                                })
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                card.enabled !== false
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-white/5 text-[#9E9B95]'
                              }`}
                            >
                              {card.enabled !== false ? 'Exibido' : 'Oculto'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFinancingCard(card.id)}
                              className="p-1 rounded text-red-400 hover:text-red-300"
                              title="Excluir cartão"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Status do Slot: Ativo vs Em breve */}
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-medium text-white block">
                              Modo deste Cartão:
                            </span>
                            <span className="text-[10px] text-[#9E9B95]">
                              {isComingSoon
                                ? 'Exibido como placeholder reservado até você ativar a nova parceira.'
                                : 'Cartão com botão ativo e clicável pelo visitante.'}
                            </span>
                          </div>

                          <select
                            value={card.status}
                            onChange={(e) =>
                              handleUpdateFinancingCard(card.id, {
                                status: e.target.value as 'active' | 'coming_soon',
                                buttonType:
                                  e.target.value === 'coming_soon'
                                    ? 'none'
                                    : card.buttonType === 'none'
                                    ? 'whatsapp'
                                    : card.buttonType,
                              })
                            }
                            className="px-2.5 py-1 rounded bg-[#16171B] border border-[#C5973D]/40 text-xs font-semibold text-[#E8D5A0] outline-none"
                          >
                            <option value="active">🟢 Ativo (Parceria Ativa)</option>
                            <option value="coming_soon">⏳ Em breve (Slot Reservado)</option>
                          </select>
                        </div>

                        {/* Campos do cartão de financiamento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] text-[#9E9B95] mb-1">Título do Cartão</label>
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) =>
                                handleUpdateFinancingCard(card.id, { title: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#9E9B95] mb-1">Selo / Tag do Topo</label>
                            <input
                              type="text"
                              value={card.badge || ''}
                              onChange={(e) =>
                                handleUpdateFinancingCard(card.id, { badge: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                              placeholder="Ex: Multi-Bancos, CrediHome by Loft"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-1">Descrição</label>
                          <textarea
                            rows={2}
                            value={card.description}
                            onChange={(e) =>
                              handleUpdateFinancingCard(card.id, { description: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                          />
                        </div>

                        {!isComingSoon && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[10px] text-[#9E9B95] mb-1">Texto do Botão</label>
                                <input
                                  type="text"
                                  value={card.buttonText || ''}
                                  onChange={(e) =>
                                    handleUpdateFinancingCard(card.id, { buttonText: e.target.value })
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-[#9E9B95] mb-1">Tipo de Ação</label>
                                <select
                                  value={card.buttonType || 'url'}
                                  onChange={(e) =>
                                    handleUpdateFinancingCard(card.id, {
                                      buttonType: e.target.value as 'url' | 'whatsapp' | 'none',
                                    })
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                                >
                                  <option value="url">🔗 Link Externo (Simulador de Crédito)</option>
                                  <option value="whatsapp">💬 Conversa direta no WhatsApp</option>
                                </select>
                              </div>
                            </div>

                            {card.buttonType === 'whatsapp' ? (
                              <div>
                                <label className="block text-[10px] text-[#9E9B95] mb-1">
                                  Mensagem do WhatsApp
                                </label>
                                <input
                                  type="text"
                                  value={card.whatsappMessage || ''}
                                  onChange={(e) =>
                                    handleUpdateFinancingCard(card.id, {
                                      whatsappMessage: e.target.value,
                                    })
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                                  placeholder="Olá Márcio, tenho interesse em financiamento..."
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-[10px] text-[#9E9B95] mb-1">
                                  URL do Simulador / Site
                                </label>
                                <input
                                  type="url"
                                  value={card.url || ''}
                                  onChange={(e) =>
                                    handleUpdateFinancingCard(card.id, { url: e.target.value })
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none font-mono"
                                  placeholder="https://simular.credihome.com.br/..."
                                />
                              </div>
                            )}
                          </>
                        )}

                        {isComingSoon && (
                          <div className="p-2 rounded bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              Este cartão é um slot pronto. Quando você firmar a segunda parceria de financiamento, basta alterar o seletor acima para &ldquo;Ativo&rdquo; e preencher os dados!
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Criar Novos Blocos Livres */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                      Novos Blocos & Avisos Livres
                    </label>
                    <p className="text-[11px] text-[#9E9B95]">
                      Adicione novidades ou avisos com fotos e botões de WhatsApp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomBlock}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5973D] text-[#0E0F12] font-semibold text-xs shadow-sm hover:brightness-105 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Bloco</span>
                  </button>
                </div>

                {formData.customBlocks && formData.customBlocks.length > 0 ? (
                  <div className="space-y-3">
                    {formData.customBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{block.title}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomBlock(block.id)}
                            className="p-1 rounded text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#9E9B95] mb-1">Título do Bloco</label>
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) => updateCustomBlock(block.id, { title: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#9E9B95] mb-1">Descrição</label>
                          <textarea
                            rows={2}
                            value={block.description}
                            onChange={(e) => updateCustomBlock(block.id, { description: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white resize-none"
                          />
                        </div>

                        {/* Foto do Bloco com Compressão Canvas */}
                        <div>
                          <label className="block text-[11px] text-[#E8D5A0] mb-1">Foto do Bloco (Opcional)</label>
                          {block.imageUrl && (
                            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-white/10 mb-2">
                              <img src={block.imageUrl} alt="Bloco" className="w-full h-full object-cover" />
                            </div>
                          )}

                          <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#F8F7F4] border border-white/10 cursor-pointer transition-colors">
                            {compressingTarget === block.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 text-[#C5973D] animate-spin" />
                                <span>Otimizando foto...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-[#C5973D]" />
                                <span>Escolher Foto do Celular / Computador</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(file, block.id, (base64) => {
                                    updateCustomBlock(block.id, { imageUrl: base64 });
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#9E9B95] italic pt-1">
                    Nenhum bloco extra adicionado. Clique no botão acima para criar novidades!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LEAD MAGNET / E-BOOK & CAPTURA DE LEADS */}
          {activeTab === 'leadmagnet' && (
            <div className="space-y-5 animate-fade-in text-left">
              {/* Header Card & Toggle */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#181A20] to-[#121316] border border-[#C5973D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C5973D]/15 border border-[#C5973D]/30 flex items-center justify-center text-[#E8D5A0] shrink-0">
                    <BookOpen className="w-5 h-5 text-[#C5973D]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">
                        Lead Magnet (E-book / Guia do Imóvel)
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          leadMagnetData.enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {leadMagnetData.enabled ? 'Ativo na Página Inicial' : 'Oculto'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9E9B95] mt-0.5">
                      Ofereça um e-book ou guia e capture o Nome e E-mail dos visitantes antes de liberar o download.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateLeadMagnet({ enabled: !leadMagnetData.enabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 ${
                    leadMagnetData.enabled
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#252830] hover:bg-[#303440] text-white/80 border border-white/10'
                  }`}
                >
                  {leadMagnetData.enabled ? '✓ Seção Ativada' : 'Ativar Lead Magnet'}
                </button>
              </div>

              {/* Informações Principais do Material */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3.5">
                <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                  Apresentação do Material
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">
                      Tag Superior (Destaque)
                    </label>
                    <input
                      type="text"
                      value={leadMagnetData.tag}
                      onChange={(e) => updateLeadMagnet({ tag: e.target.value })}
                      placeholder="Ex: Material Gratuito Exclusivo"
                      className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">
                      Selo de Formato
                    </label>
                    <input
                      type="text"
                      value={leadMagnetData.badgeText || ''}
                      onChange={(e) => updateLeadMagnet({ badgeText: e.target.value })}
                      placeholder="Ex: E-book em PDF · Download Imediato"
                      className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Título do E-book / Material *
                  </label>
                  <input
                    type="text"
                    value={leadMagnetData.title}
                    onChange={(e) => updateLeadMagnet({ title: e.target.value })}
                    placeholder="Ex: Guia do Investidor Imobiliário: Do Sul do Brasil a Miami"
                    className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Subtítulo / Chamada de Valor
                  </label>
                  <input
                    type="text"
                    value={leadMagnetData.subtitle}
                    onChange={(e) => updateLeadMagnet({ subtitle: e.target.value })}
                    placeholder="Ex: Como multiplicar e proteger seu patrimônio com imóveis de alta rentabilidade."
                    className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Descrição Detalhada
                  </label>
                  <textarea
                    rows={3}
                    value={leadMagnetData.description}
                    onChange={(e) => updateLeadMagnet({ description: e.target.value })}
                    placeholder="Explique o propósito do guia e como ele ajuda o cliente..."
                    className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none resize-none"
                  />
                </div>

                {/* Upload de Imagem de Capa do E-book */}
                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Imagem da Capa do E-book / Destaque Visual
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    {leadMagnetData.coverImageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0">
                        <img
                          src={leadMagnetData.coverImageUrl}
                          alt="Capa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="url"
                        value={leadMagnetData.coverImageUrl || ''}
                        onChange={(e) => updateLeadMagnet({ coverImageUrl: e.target.value })}
                        placeholder="https://exemplo.com/capa-ebook.jpg ou envie do seu celular"
                        className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                      />
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-semibold text-[#E8D5A0] border border-[#C5973D]/30 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#C5973D]" />
                        <span>
                          {compressingTarget === 'leadmagnet-cover'
                            ? 'Otimizando Imagem...'
                            : 'Escolher Foto do Celular / Computador'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, 'leadmagnet-cover', (base64) => {
                                updateLeadMagnet({ coverImageUrl: base64 });
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tópicos / O que o leitor vai aprender */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    Tópicos de Conteúdo (Bullet Points)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBulletPoint}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C5973D]/15 hover:bg-[#C5973D]/25 text-[#E8D5A0] text-xs font-semibold border border-[#C5973D]/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Tópico</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(leadMagnetData.bulletPoints || []).map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#C5973D]/20 text-[#E8D5A0] text-[10px] flex items-center justify-center shrink-0 font-bold">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleUpdateBulletPoint(idx, e.target.value)}
                        placeholder={`Tópico ${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBulletPoint(idx)}
                        className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Remover tópico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configurações de Download & Botões */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3.5">
                <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                  Link de Download & Mensagens
                </label>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Link do Arquivo (PDF no Google Drive, Dropbox ou URL direta) *
                  </label>
                  <input
                    type="url"
                    value={leadMagnetData.downloadFileUrl}
                    onChange={(e) => updateLeadMagnet({ downloadFileUrl: e.target.value })}
                    placeholder="https://seusite.com/guia.pdf ou link compartilhável do Google Drive"
                    className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                  />
                  <p className="text-[10px] text-[#9E9B95] mt-1">
                    Este é o link liberado imediatamente assim que o visitante digitar o Nome e E-mail.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">
                      Texto do Botão de Captura
                    </label>
                    <input
                      type="text"
                      value={leadMagnetData.buttonText}
                      onChange={(e) => updateLeadMagnet({ buttonText: e.target.value })}
                      placeholder="Ex: Quero Baixar Meu Guia Gratuito"
                      className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#9E9B95] mb-1">
                      Botão WhatsApp Pós-Download
                    </label>
                    <input
                      type="text"
                      value={leadMagnetData.whatsappCtaText || ''}
                      onChange={(e) => updateLeadMagnet({ whatsappCtaText: e.target.value })}
                      placeholder="Ex: Receber também no meu WhatsApp"
                      className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Mensagem de Confirmação (Após o envio)
                  </label>
                  <input
                    type="text"
                    value={leadMagnetData.successMessage || ''}
                    onChange={(e) => updateLeadMagnet({ successMessage: e.target.value })}
                    placeholder="Ex: Acesso liberado! Clique no botão abaixo para baixar."
                    className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                  />
                </div>
              </div>

              {/* LISTA DE LEADS CAPTURADOS */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C5973D]" />
                    <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                      Leads Capturados ({capturedLeadsList.length})
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyEmails}
                      disabled={capturedLeadsList.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-semibold text-[#E8D5A0] border border-[#C5973D]/30 transition-colors disabled:opacity-40"
                      title="Copiar todos os e-mails separados por vírgula"
                    >
                      {copiedEmails ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">E-mails Copiados!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#C5973D]" />
                          <span>Copiar E-mails</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={exportLeadsToCsv}
                      disabled={capturedLeadsList.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5973D] hover:bg-[#d8a846] text-[#0E0F12] text-xs font-bold transition-all disabled:opacity-40"
                      title="Exportar para planilha Excel / CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Exportar CSV</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#9E9B95] leading-relaxed">
                  Todos os visitantes que preencheram o formulário para baixar o e-book ficam listados abaixo. Você pode exportar para o Excel ou chamar diretamente no WhatsApp.
                </p>

                {capturedLeadsList.length === 0 ? (
                  <div className="p-6 rounded-xl bg-black/40 border border-dashed border-white/10 text-center space-y-1">
                    <Mail className="w-6 h-6 text-[#9E9B95] mx-auto opacity-60" />
                    <p className="text-xs font-medium text-white/80">Nenhum lead capturado ainda.</p>
                    <p className="text-[11px] text-[#9E9B95]">
                      Assim que alguém preencher o formulário no seu minisite, os dados aparecerão aqui em tempo real.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {capturedLeadsList.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-lg bg-[#16171B] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-[#C5973D]/30 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{lead.name}</span>
                            <span className="text-[10px] text-[#9E9B95]">
                              {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#D4D2CD]">
                            <Mail className="w-3 h-3 text-[#C5973D]" />
                            <span>{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                              <Phone className="w-3 h-3" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>

                        {lead.phone && (
                          <a
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${lead.name}, vi que você baixou o ${lead.materialTitle}. Tudo bem?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium self-start sm:self-auto transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Chamar no Whats</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CHATBOT INTELIGENTE & QUALIFICAÇÃO DE LEADS */}
          {activeTab === 'chatbot' && (
            <div className="space-y-5 animate-fade-in text-left">
              {/* Header Card & Toggle */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#181A20] to-[#121316] border border-[#C5973D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C5973D]/15 border border-[#C5973D]/30 flex items-center justify-center text-[#E8D5A0] shrink-0">
                    <Bot className="w-5 h-5 text-[#C5973D]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">
                        Assistente Virtual de Leads
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          chatbotData.enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {chatbotData.enabled ? 'Ativo no Minisite' : 'Desativado'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9E9B95] mt-0.5">
                      Qualifica seus clientes antes de chamarem no WhatsApp, entregando o lead pronto.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateChatbot({ enabled: !chatbotData.enabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 ${
                    chatbotData.enabled
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#252830] hover:bg-[#303440] text-white/80 border border-white/10'
                  }`}
                >
                  {chatbotData.enabled ? '✓ Chatbot Ativado' : 'Ativar Chatbot'}
                </button>
              </div>

              {/* Bot Identity & Greeting */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3.5">
                <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                  Identidade do Assistente
                </label>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Nome do Assistente (Como ele se apresenta)
                  </label>
                  <input
                    type="text"
                    value={chatbotData.botName}
                    onChange={(e) => updateChatbot({ botName: e.target.value })}
                    placeholder="Ex: Assistente do Márcio"
                    className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Mensagem de Boas-Vindas Inicial
                  </label>
                  <textarea
                    rows={3}
                    value={chatbotData.welcomeMessage}
                    onChange={(e) => updateChatbot({ welcomeMessage: e.target.value })}
                    placeholder="Mensagem exibida logo na abertura da conversa..."
                    className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none resize-none"
                  />
                  <p className="text-[10px] text-[#9E9B95] mt-1">
                    Aparece na abertura do chat para cumprimentar o visitante com educação e autoridade.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] text-[#9E9B95] mb-1">
                    Texto do Botão de Transferência para o WhatsApp
                  </label>
                  <input
                    type="text"
                    value={chatbotData.whatsappCtaText}
                    onChange={(e) => updateChatbot({ whatsappCtaText: e.target.value })}
                    placeholder="Ex: Falar com Márcio no WhatsApp"
                    className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                  />
                </div>
              </div>

              {/* Quick Option Prompts */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                      Perguntas & Atalhos Rápidos ({chatbotData.quickOptions.length})
                    </label>
                    <p className="text-[10px] text-[#9E9B95]">
                      Botões clicáveis no chat para o cliente iniciar com apenas 1 toque.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuickOption}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5973D]/15 hover:bg-[#C5973D]/25 text-[#E8D5A0] border border-[#C5973D]/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5973D]" />
                    <span>Adicionar Opção</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {chatbotData.quickOptions.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="p-3 rounded-lg bg-[#16171B] border border-white/5 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#E8D5A0]">
                          Opção #{idx + 1}
                        </span>
                        {chatbotData.quickOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteQuickOption(opt.id)}
                            className="text-white/40 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Remover opção"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-0.5">
                            Texto do Botão
                          </label>
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => handleUpdateQuickOption(opt.id, { label: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#0D0E10] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#9E9B95] mb-0.5">
                            Pergunta / Mensagem enviada
                          </label>
                          <input
                            type="text"
                            value={opt.prompt}
                            onChange={(e) => handleUpdateQuickOption(opt.id, { prompt: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#0D0E10] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ÁREA DE TREINAMENTO DO CHATBOT (BASE DE CONHECIMENTO) */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#181A20] via-[#141518] to-[#101114] border border-[#C5973D]/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/8 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#C5973D]/20 text-[#E8D5A0] flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-[#C5973D]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                          Treinar Chatbot (Base de Conhecimento)
                        </label>
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#C5973D]/15 text-[#E8D5A0] border border-[#C5973D]/30">
                          Prioridade Total
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9E9B95] mt-0.5">
                        Cadastre perguntas/palavras-chave e respostas prontas. O chatbot usará EXATAMENTE a resposta cadastrada aqui.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddKnowledgeItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5973D] text-[#0E0F12] hover:brightness-105 text-xs font-semibold transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Treinamento</span>
                  </button>
                </div>

                {/* Lista de Itens de Treinamento */}
                <div className="space-y-3.5">
                  {(chatbotData.knowledgeBase || []).map((kb, idx) => (
                    <div
                      key={kb.id}
                      className="p-3.5 rounded-xl bg-[#0E0F12] border border-white/10 hover:border-[#C5973D]/40 transition-colors space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1A1C22] text-[#E8D5A0] text-[10px] font-bold flex items-center justify-center border border-[#C5973D]/30">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-medium text-[#E8D5A0]">
                            Regra de Resposta Pronta #{idx + 1}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteKnowledgeItem(kb.id)}
                          className="text-white/40 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                          title="Excluir este par de treinamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#9E9B95] mb-1 font-medium">
                          Pergunta do Visitante ou Palavras-Chave (separadas por vírgula):
                        </label>
                        <input
                          type="text"
                          value={kb.question}
                          onChange={(e) => handleUpdateKnowledgeItem(kb.id, { question: e.target.value })}
                          placeholder="Ex: onde atende, cidades, você atende em miami ou são paulo?"
                          className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#9E9B95] mb-1 font-medium">
                          Resposta Pronta Exata (o robô responderá exatamente isso):
                        </label>
                        <textarea
                          rows={3}
                          value={kb.answer}
                          onChange={(e) => handleUpdateKnowledgeItem(kb.id, { answer: e.target.value })}
                          placeholder="Digite a resposta oficial exata..."
                          className="w-full px-2.5 py-1.5 rounded-md bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}

                  {(!chatbotData.knowledgeBase || chatbotData.knowledgeBase.length === 0) && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/15 text-center text-xs text-[#9E9B95]">
                      Nenhum par de pergunta e resposta cadastrado ainda. Clique em "Novo Treinamento" acima para cadastrar!
                    </div>
                  )}
                </div>

                {/* Guia Rápido */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1.5 text-[11px] text-[#9E9B95]">
                  <div className="flex items-center gap-1.5 text-[#E8D5A0] font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-[#C5973D]" />
                    <span>Como funciona a prioridade:</span>
                  </div>
                  <p>
                    Se o cliente perguntar algo que contenha suas palavras-chave cadastradas, o robô responderá <strong className="text-white">imediatamente com sua resposta exata</strong>. Se o assunto for outro, ele responderá de forma prestativa e consultiva, convidando para o WhatsApp oficial.
                  </p>
                </div>
              </div>

              {/* System Instruction (AI Persona & Qualification Guidelines) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    Instruções de Qualificação (Orientação da IA)
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#C5973D]/10 text-[#E8D5A0] border border-[#C5973D]/20">
                    O segredo dos leads bons
                  </span>
                </div>
                <p className="text-[11px] text-[#9E9B95] leading-relaxed">
                  Defina o que o assistente deve priorizar nas respostas. Ele sempre mantém o tom Dark Luxury, conciso (2 a 4 linhas) e conduz o cliente a tocar no botão de WhatsApp para envio da proposta.
                </p>
                <textarea
                  rows={5}
                  value={chatbotData.systemInstruction}
                  onChange={(e) => updateChatbot({ systemInstruction: e.target.value })}
                  placeholder="Ex: Focar em imóveis em Mandirituba e Curitiba. Ao falar de crédito, mencione simulação nos principais bancos (Caixa, Itaú, Bradesco, Santander). Pergunte se procura chácara ou imóvel urbano e se pretende financiar ou pagar à vista."
                  className="w-full px-3 py-2 rounded-lg bg-[#16171B] border border-white/10 text-xs text-white focus:border-[#C5973D] outline-none resize-none font-mono"
                />
              </div>

              {/* Lead Qualification Strategy Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1B1811] to-[#121316] border border-[#C5973D]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E8D5A0]">
                  <Sparkles className="w-4 h-4 text-[#C5973D]" />
                  <span>Como funciona o envio do Lead para seu WhatsApp:</span>
                </div>
                <ul className="text-[11px] text-[#9E9B95] space-y-1 list-disc list-inside">
                  <li>O cliente conversa com o assistente em até 2 ou 3 turnos para definir interesse.</li>
                  <li>O botão <strong className="text-emerald-400">"{chatbotData.whatsappCtaText}"</strong> compila todo o que o cliente buscou.</li>
                  <li>Ao clicar, o WhatsApp abre automaticamente com a mensagem estruturada pronta para você fechar a visita.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 6: SEGURANÇA, BACKUP & CÓDIGO */}
          {activeTab === 'codigo' && (
            <div className="space-y-4 animate-fade-in">
              {/* Feedback de restauração de backup */}
              {backupRestoreMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{backupRestoreMessage}</span>
                </div>
              )}

              {/* CARD 1: STATUS DE BLINDAGEM CONTRA PERDAS */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#1A1810] via-[#141519] to-[#0E0F12] border border-[#C5973D]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C5973D]" />
                    <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                      Proteção Não-Destrutiva Ativa
                    </label>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    100% Protegido
                  </span>
                </div>
                <p className="text-xs text-[#D4D2CD] leading-relaxed">
                  Suas alterações locais têm <strong className="text-white">prioridade absoluta</strong>. O sistema utiliza um motor de mesclagem não-destrutiva (<em>Deep Merge</em>): mesmo que o desenvolvedor ou a IA do Google AI Studio atualizem o código do site ou adicionem novos blocos, <strong className="text-[#E8D5A0]">seus textos, fotos cadastradas e cores não serão sobrescritos ou apagados</strong>.
                </p>
              </div>

              {/* CARD: CONEXÃO COM BANCO DE DADOS EM NUVEM (SUPABASE) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#121824] via-[#10141D] to-[#0D1017] border border-blue-500/30 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                      Banco de Dados em Nuvem (Supabase 100% Gratuito)
                    </label>
                  </div>
                  {getSupabaseCredentials() ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Conectado
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-[#9E9B95] border border-white/10">
                      Não configurado
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#C8CCD6] leading-relaxed">
                  Conecte seu projeto gratuito do <strong className="text-white">Supabase</strong>. Ao salvar imóveis ou alterações neste painel (no PC ou celular), eles sincronizam <strong className="text-emerald-400">em tempo real para todos os clientes</strong> que clicarem no seu Link na Bio, sem precisar de Git push ou alteração de código!
                </p>

                <div className="p-3.5 rounded-lg bg-black/40 border border-blue-500/25 text-xs text-[#D4D2CD] space-y-2">
                  <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Como ativar a tabela no Supabase em 1 minuto:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#C8CCD6]">
                    <li>Clique no botão <strong className="text-white">"Copiar Script SQL do Banco"</strong> abaixo.</li>
                    <li>No painel do seu projeto no Supabase, clique em <strong className="text-blue-300">SQL Editor</strong> (menu lateral esquerdo).</li>
                    <li>Cole o código no editor e clique no botão verde <strong className="text-emerald-400">Run</strong>.</li>
                    <li>Volte aqui e clique em <strong className="text-white">"Salvar & Conectar Supabase"</strong>!</li>
                  </ol>
                </div>

                {supabaseFeedback && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      supabaseFeedback.success
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/15 border border-red-500/30 text-red-300'
                    }`}
                  >
                    {supabaseFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{supabaseFeedback.message}</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-[#9E9B95] block mb-1">
                      URL do Projeto Supabase (Ex: https://xyz.supabase.co)
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(cleanSupabaseUrl(e.target.value))}
                      placeholder="https://rujmbhnwyxjzmezhqikw.supabase.co"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400/60 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#9E9B95] block mb-1">
                      Chave Anônima Pública (Anon Key)
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value.trim())}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400/60 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={supabaseTesting}
                    onClick={handleTestAndSaveSupabase}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium text-white transition-colors cursor-pointer shadow-sm"
                  >
                    {supabaseTesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Testando conexão...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        <span>Salvar & Conectar Supabase</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#D4D2CD] hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title="Copiar comando SQL para colar no editor do Supabase"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Script SQL Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#C5973D]" />
                        <span>Copiar Script SQL do Banco</span>
                      </>
                    )}
                  </button>

                  {getSupabaseCredentials() && (
                    <button
                      type="button"
                      onClick={handleDisconnectSupabase}
                      className="text-xs text-red-400/80 hover:text-red-300 ml-auto cursor-pointer"
                    >
                      Desconectar
                    </button>
                  )}
                </div>
              </div>

              {/* CARD 2: BACKUP EM ARQUIVO JSON & RESTAURAÇÃO (1 CLIQUE) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#C5973D]" />
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    Backup em Arquivo & Restauração
                  </label>
                </div>
                <p className="text-xs text-[#9E9B95] leading-relaxed">
                  Baixe uma cópia exata do seu minisite para seu computador ou celular. Se trocar de aparelho ou limpar o histórico do navegador, basta restaurar o arquivo para recuperar tudo instantaneamente:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Botão Baixar Backup */}
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#20232A] hover:bg-[#282C35] text-xs font-semibold text-[#E8D5A0] border border-[#C5973D]/30 transition-all active:scale-98 cursor-pointer"
                    title="Baixar arquivo JSON com todas as fotos, textos e configurações"
                  >
                    <Download className="w-4 h-4 text-[#C5973D]" />
                    <span>Baixar Backup (.json)</span>
                  </button>

                  {/* Botão Restaurar Backup */}
                  <div>
                    <input
                      type="file"
                      ref={backupFileRef}
                      onChange={handleImportBackup}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => backupFileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#181A20] hover:bg-[#22252D] text-xs font-semibold text-white border border-white/15 transition-all active:scale-98 cursor-pointer"
                      title="Selecionar um arquivo de backup (.json) para restaurar"
                    >
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>Restaurar de Arquivo JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 3: ETERNIZAR ALTERAÇÕES NO CÓDIGO FONTE DO DESENVOLVEDOR / IA */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C5973D]" />
                    <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                      Exportar para o Desenvolvedor / IA
                    </label>
                  </div>
                  <span className="text-[10px] text-[#9E9B95]">Padrão de Fábrica</span>
                </div>
                <p className="text-xs text-[#9E9B95] leading-relaxed">
                  Deseja que todas as suas alterações se tornem a base <strong className="text-white">oficial e definitiva</strong> do projeto no repositório? Copie o código pronto abaixo e envie para a IA ou desenvolvedor:
                </p>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#C5973D]/15 hover:bg-[#C5973D]/25 text-xs font-semibold text-[#E8D5A0] border border-[#C5973D]/40 transition-all active:scale-98 cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Código TypeScript copiado! Peça para a IA colar em defaultData.ts</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#C5973D]" />
                      <span>Copiar Código TypeScript para defaultData.ts</span>
                    </>
                  )}
                </button>
              </div>

              {/* CARD 4: SNAPSHOT AUTOMÁTICO DE EMERGÊNCIA */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#C5973D]" />
                    <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                      Snapshot Automático de Emergência
                    </label>
                  </div>
                  <span className="text-[10px] text-[#9E9B95]">Cópia Local</span>
                </div>
                <p className="text-xs text-[#9E9B95] leading-relaxed">
                  O sistema grava uma cópia de segurança antes de cada gravação ou restauração de fábrica. Se clicou em algo por engano, você pode voltar ao estado anterior:
                </p>

                <button
                  type="button"
                  onClick={handleRestoreSnapshot}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#D4D2CD] hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C5973D]" />
                  <span>Recuperar Último Snapshot Automático</span>
                </button>
              </div>

              {/* CARD 5: INTEGRAÇÃO COM HOSPEDAGEM PHP */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#C5973D]" />
                  <label className="text-xs font-semibold text-[#E8D5A0] uppercase tracking-wider block">
                    Integração com Hospedagem PHP (salvar.php)
                  </label>
                </div>
                <p className="text-xs text-[#9E9B95] leading-relaxed">
                  Ao clicar em <strong>Salvar Alterações</strong>, o painel envia os dados automaticamente para o arquivo <code className="text-[#E8D5A0]">salvar.php</code> na hospedagem, gravando em <code className="text-[#E8D5A0]">dados.json</code>.
                </p>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-[11px] text-[#D4D2CD] space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Pronto para cPanel, Locaweb, Hostinger, KingHost ou qualquer PHP</span>
                  </div>
                  <p className="text-[#9E9B95]">
                    As fotos são comprimidas diretamente no seu navegador antes do salvamento, sem risco de estourar o limite de upload do servidor.
                  </p>
                </div>
              </div>

              {/* CARD 6: CÓPIA JSON PURA */}
              <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9E9B95] font-medium">Backup em Texto (JSON Puro)</span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="text-xs text-[#C5973D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedJson ? 'Copiado!' : 'Copiar JSON'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons footer */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 sticky bottom-0 bg-[#141518] py-2.5 px-3 z-20">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-[#9E9B95] hover:text-white transition-colors cursor-pointer"
                title="Restaurar dados originais de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restaurar</span> Padrão
              </button>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-[11px] font-medium text-[#E8D5A0] border border-[#C5973D]/30 transition-colors cursor-pointer shadow-sm"
                title="Baixar arquivo de backup JSON completo para o seu computador (com todas as fotos e textos)"
              >
                <Download className="w-3.5 h-3.5 text-[#C5973D]" />
                <span>Baixar Backup</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreSnapshot}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-[11px] font-medium text-amber-300/90 hover:text-amber-200 border border-amber-500/30 transition-colors cursor-pointer shadow-sm"
                title="Recuperar a última versão salva automaticamente antes de qualquer perda"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Recuperar Snapshot</span>
              </button>

              <button
                type="button"
                onClick={() => backupFileRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#181A20] hover:bg-[#22252D] text-[11px] font-medium text-white/80 hover:text-white border border-white/15 transition-colors cursor-pointer"
                title="Restaurar arquivo .json de backup do seu computador"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Restaurar</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#0E0F12] font-semibold text-xs tracking-wide shadow-lg hover:brightness-105 active:scale-[0.98] transition-all ml-auto disabled:opacity-50"
              style={{
                backgroundColor: currentTheme.primaryColor,
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0E0F12]" />
                  <span>Gravando...</span>
                </>
              ) : savedFeedback ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{savedFeedback.server ? 'Salvo no Servidor!' : 'Salvo no Dispositivo!'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
