import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Phone,
  Shield,
  Instagram,
  Globe,
  Image,
  Check,
  Calculator,
  Building2,
  Upload,
  MessageCircle,
} from 'lucide-react';
import { SiteConfig, FeaturedProject, CuratedProperty } from '../types';
import vm125FeaturedImage from '../assets/images/regenerated_image_1793108371869.jpg';

interface EditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onSave: (newConfig: SiteConfig) => void;
  onReset: () => void;
}

export const EditorDrawer: React.FC<EditorDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState<'geral' | 'imoveis' | 'destaque' | 'mensagens'>('geral');
  const [selectedPropId, setSelectedPropId] = useState<string>(
    config.curatedBlock.properties[0]?.id || 'prop-1'
  );
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync state if external config changes
  React.useEffect(() => {
    setFormData(config);
    if (config.curatedBlock.properties.length > 0 && !selectedPropId) {
      setSelectedPropId(config.curatedBlock.properties[0].id);
    }
  }, [config]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const handleFeaturedPreset = (preset: Partial<FeaturedProject>) => {
    setFormData((prev) => ({
      ...prev,
      featuredProject: {
        ...prev.featuredProject,
        ...preset,
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg h-full bg-[#151619] border-l border-white/10 shadow-2xl flex flex-col text-left z-10">
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-medium text-[#F8F7F4] flex items-center gap-2">
              Painel de Edição Direta
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#C5973D]/20 text-[#E8D5A0] font-semibold">
                Ao Vivo
              </span>
            </h3>
            <p className="text-[11px] text-[#9E9B95]">
              Altere textos, fotos, contatos e imóveis instantaneamente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/8 bg-[#101113] p-1.5 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'geral'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            Perfil & Contatos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('imoveis')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'imoveis'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            Imóveis ({formData.curatedBlock.properties.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('destaque')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'destaque'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            Destaque do Mês
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mensagens')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'mensagens'
                ? 'bg-[#1F2128] text-[#E8D5A0] shadow-sm'
                : 'text-[#9E9B95] hover:text-white'
            }`}
          >
            WhatsApp
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: PERFIL & CONTATOS */}
          {activeTab === 'geral' && (
            <div className="space-y-4 animate-fade-in">
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
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Número do CRECI
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-[#C5973D] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.profile.creci}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, creci: e.target.value },
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                    placeholder="CRECI-PR 59138"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  WhatsApp (apenas números com DDD)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#C5973D] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.profile.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, phone: e.target.value },
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none font-mono"
                    placeholder="5541999999999"
                  />
                </div>
                <span className="text-[10px] text-[#9E9B95] mt-1 block">
                  Ex: 5541999999999 (55 país + 41 Curitiba + celular)
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Frase de Posicionamento / Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.profile.positioningText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        positioningText: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Foto de Perfil */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-2.5">
                <label className="block text-xs font-medium text-[#E8D5A0]">
                  Sua Foto Profissional
                </label>

                {formData.profile.avatarUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.profile.avatarUrl}
                      alt="Preview"
                      className="w-14 h-14 rounded-full object-cover border border-[#C5973D]"
                    />
                    <div className="flex-1">
                      <span className="text-xs text-[#F8F7F4] block font-medium">Foto personalizada ativa</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            profile: { ...formData.profile, avatarUrl: '' },
                          })
                        }
                        className="text-[11px] text-red-400 hover:underline"
                      >
                        Restaurar silhueta executiva
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#9E9B95]">
                    Usando a arte vetorial padrão com silhueta executiva e Araucárias do Paraná.
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#F8F7F4] border border-white/10 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#C5973D]" />
                    <span>Escolher foto do meu computador / celular</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setFormData({
                                ...formData,
                                profile: {
                                  ...formData.profile,
                                  avatarUrl: event.target.result as string,
                                },
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <div className="relative">
                    <Image className="w-4 h-4 text-[#9E9B95] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formData.profile.avatarUrl || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, avatarUrl: e.target.value },
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                      placeholder="Ou cole o link direto da sua foto (https://...)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="w-4 h-4 text-[#C5973D] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.profile.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, instagram: e.target.value },
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                    placeholder="@marciorogeriocorretor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Site Oficial
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#C5973D] absolute left-3 top-3" />
                  <input
                    type="url"
                    value={formData.profile.websiteUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, websiteUrl: e.target.value },
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                    placeholder="https://marciorogeriocorretor.com.br"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Link da Simulação de Crédito (Credihome/Loft)
                </label>
                <div className="relative">
                  <Calculator className="w-4 h-4 text-[#C5973D] absolute left-3 top-3" />
                  <input
                    type="url"
                    value={
                      formData.financingBlock?.simulationUrl ||
                      'https://simular.credihome.com.br/marciorj-corretor'
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        financingBlock: {
                          title: formData.financingBlock?.title || 'Assessoria & Simulação de Crédito Imobiliário',
                          description:
                            formData.financingBlock?.description ||
                            'Simule em múltiplos bancos simultaneamente (Caixa, Itaú, Bradesco, Santander) e encontre a menor taxa para o seu perfil.',
                          ctaText: formData.financingBlock?.ctaText || 'Simular Financiamento Gratuito',
                          disclaimer:
                            formData.financingBlock?.disclaimer ||
                            '*Simulação informativa sujeita à análise de crédito pelas instituições financeiras parceiras.',
                          simulationUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                    placeholder="https://simular.credihome.com.br/marciorj-corretor"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMÓVEIS DA CURADORIA (EDITAR CARDS) */}
          {activeTab === 'imoveis' && currentProperty && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-[#E8D5A0] mb-2">
                  Selecione o imóvel para editar:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {formData.curatedBlock.properties.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPropId(p.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center gap-2 ${
                        p.id === selectedPropId
                          ? 'bg-[#252830] border-[#C5973D] text-[#E8D5A0]'
                          : 'bg-[#0E0F12] border-white/8 text-[#D4D2CD] hover:border-white/20'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#C5973D] shrink-0" />
                      <span className="truncate font-medium">{p.neighborhood}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-3.5">
                <span className="text-xs uppercase tracking-wider text-[#C5973D] font-semibold block">
                  Editando: {currentProperty.title}
                </span>

                <div>
                  <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                    Título do Imóvel
                  </label>
                  <input
                    type="text"
                    value={currentProperty.title}
                    onChange={(e) => updateCurrentProperty({ title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                      Bairro / Cidade
                    </label>
                    <input
                      type="text"
                      value={currentProperty.neighborhood}
                      onChange={(e) => updateCurrentProperty({ neighborhood: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                      Tipo / Categoria
                    </label>
                    <input
                      type="text"
                      value={currentProperty.type}
                      onChange={(e) => updateCurrentProperty({ type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                    Frase de Destaque
                  </label>
                  <textarea
                    rows={2}
                    value={currentProperty.phrase}
                    onChange={(e) => updateCurrentProperty({ phrase: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none resize-none"
                  />
                </div>

                {/* Foto do Imóvel */}
                <div>
                  <label className="block text-xs font-medium text-[#9E9B95] mb-1.5">
                    Foto do Imóvel
                  </label>

                  {currentProperty.imageUrl && (
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-white/10 mb-2">
                      <img
                        src={currentProperty.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#F8F7F4] border border-white/10 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#C5973D]" />
                      <span>Trocar foto do meu computador / celular</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                updateCurrentProperty({
                                  imageUrl: event.target.result as string,
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      value={currentProperty.imageUrl}
                      onChange={(e) => updateCurrentProperty({ imageUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                      placeholder="Ou cole a URL da foto (https://...)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                    Mensagem de WhatsApp para este Imóvel
                  </label>
                  <textarea
                    rows={2}
                    value={currentProperty.whatsappInquiryText}
                    onChange={(e) => updateCurrentProperty({ whatsappInquiryText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESTAQUE DO MÊS */}
          {activeTab === 'destaque' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#C5973D]/30 mb-2">
                <span className="text-[11px] font-medium text-[#E8D5A0] block mb-1">
                  Atalhos Rápidos de Destaque:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleFeaturedPreset({
                        name: 'Helbor VM125',
                        neighborhood: 'Vila Madalena · SP',
                        phrase:
                          'Parceria imobiliária trazendo oportunidades exclusivas de investimento e moradia de alto padrão em São Paulo.',
                        ctaText: 'Conheça o VM125',
                        link: 'https://marciorogeriocorretor.com.br/vm125',
                        imageUrl: vm125FeaturedImage,
                        specs: {
                          typology: 'Residências de 145m² a 290m²',
                          footage: '3 e 4 Suítes com Varanda Integrada',
                          highlight: 'Parceria exclusiva Curitiba · São Paulo',
                        },
                      })
                    }
                    className="px-2.5 py-1 rounded bg-[#252830] hover:bg-[#C5973D]/20 text-[11px] text-[#D4D2CD] hover:text-[#E8D5A0] transition-colors border border-white/5"
                  >
                    Helbor VM125 (Parceria SP)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleFeaturedPreset({
                        name: 'Refúgio das Araucárias',
                        neighborhood: 'Mandirituba (PR)',
                        phrase:
                          'Propriedade rural exclusiva com 20.000m², nascente límpida, pomar produtivo e casa sede aconchegante.',
                        ctaText: 'Conheça o Refúgio',
                        link: 'https://marciorogeriocorretor.com.br/chacara-mandirituba',
                        imageUrl:
                          'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80',
                        specs: {
                          typology: 'Chácara / Propriedade Rural',
                          footage: '20.000 m² com Casa Sede',
                          highlight: 'Mata nativa & nascente',
                        },
                      })
                    }
                    className="px-2.5 py-1 rounded bg-[#252830] hover:bg-[#C5973D]/20 text-[11px] text-[#D4D2CD] hover:text-[#E8D5A0] transition-colors border border-white/5"
                  >
                    Chácara Mandirituba
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Nome do Empreendimento
                </label>
                <input
                  type="text"
                  value={formData.featuredProject.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: {
                        ...formData.featuredProject,
                        name: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="Ex: Helbor VM125"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Bairro / Localização
                </label>
                <input
                  type="text"
                  value={formData.featuredProject.neighborhood}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: {
                        ...formData.featuredProject,
                        neighborhood: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="Ex: Vila Madalena · SP"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Frase Curta do Empreendimento
                </label>
                <textarea
                  rows={2}
                  value={formData.featuredProject.phrase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: {
                        ...formData.featuredProject,
                        phrase: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={formData.featuredProject.ctaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: {
                        ...formData.featuredProject,
                        ctaText: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Link Individual do Empreendimento
                </label>
                <input
                  type="url"
                  value={formData.featuredProject.link}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: {
                        ...formData.featuredProject,
                        link: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                />
              </div>

              {/* Foto do Empreendimento */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-2">
                <label className="block text-xs font-medium text-[#E8D5A0]">
                  Foto do Destaque
                </label>

                {formData.featuredProject.imageUrl && (
                  <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-white/10 mb-2">
                    <img
                      src={formData.featuredProject.imageUrl}
                      alt="Destaque"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-[#20232A] hover:bg-[#282C35] text-xs font-medium text-[#F8F7F4] border border-white/10 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#C5973D]" />
                  <span>Escolher foto do computador / celular</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setFormData({
                              ...formData,
                              featuredProject: {
                                ...formData.featuredProject,
                                imageUrl: event.target.result as string,
                              },
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  value={formData.featuredProject.imageUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: {
                        ...formData.featuredProject,
                        imageUrl: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-xs text-[#F8F7F4] focus:border-[#C5973D] outline-none"
                  placeholder="Ou cole a URL da imagem (https://...)"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MENSAGENS WHATSAPP */}
          {activeTab === 'mensagens' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Mensagem pré-preenchida — Comprador
                </label>
                <textarea
                  rows={3}
                  value={formData.buyerBlock.whatsappMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      buyerBlock: {
                        ...formData.buyerBlock,
                        whatsappMessage: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Mensagem pré-preenchida — Proprietários
                </label>
                <textarea
                  rows={3}
                  value={formData.sellerBlock.whatsappMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sellerBlock: {
                        ...formData.sellerBlock,
                        whatsappMessage: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9E9B95] mb-1">
                  Mensagem pré-preenchida — Destaque
                </label>
                <textarea
                  rows={3}
                  value={formData.featuredProject.whatsappMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProject: {
                        ...formData.featuredProject,
                        whatsappMessage: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0F12] border border-white/10 text-sm text-[#F8F7F4] focus:border-[#C5973D] outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Action buttons footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 sticky bottom-0 bg-[#151619] py-3">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#9E9B95] hover:text-white transition-colors"
              title="Restaurar dados originais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5973D] via-[#D4AF37] to-[#B8872F] text-[#0E0F12] font-semibold text-xs tracking-wide shadow-md hover:brightness-105 active:scale-[0.98] transition-all ml-auto"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvo com Sucesso!</span>
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
  );
};
