import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { DEFAULT_CONFIG } from './data/defaultData';
import { SiteConfig, CuratedProperty, CapturedLead } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StoryModeFrame } from './components/StoryModeFrame';
import { MessageCircle, Sliders } from 'lucide-react';
import { formatWhatsAppUrl } from './utils/whatsapp';
import { useColorMode } from './hooks/useColorMode';
import { deepMergePreservingUserEdits, saveSafetySnapshot } from './utils/configMerge';

// Lazy loading dos blocos do minisite para máxima performance e carregamento inicial veloz
const AboutBlock = lazy(() => import('./components/AboutBlock').then((m) => ({ default: m.AboutBlock })));
const BuyerBlock = lazy(() => import('./components/BuyerBlock').then((m) => ({ default: m.BuyerBlock })));
const CuratedBlock = lazy(() => import('./components/CuratedBlock').then((m) => ({ default: m.CuratedBlock })));
const FeaturedBlock = lazy(() => import('./components/FeaturedBlock').then((m) => ({ default: m.FeaturedBlock })));
const SellerBlock = lazy(() => import('./components/SellerBlock').then((m) => ({ default: m.SellerBlock })));
const FinancingBlock = lazy(() => import('./components/FinancingBlock').then((m) => ({ default: m.FinancingBlock })));
const LeadMagnetBlock = lazy(() => import('./components/LeadMagnetBlock').then((m) => ({ default: m.LeadMagnetBlock })));
const CustomBlockRenderer = lazy(() => import('./components/CustomBlockRenderer').then((m) => ({ default: m.CustomBlockRenderer })));

// Lazy loading sob demanda de modais pesados e painel de administração (economiza ~200KB no carregamento inicial)
const PropertyModal = lazy(() => import('./components/PropertyModal').then((m) => ({ default: m.PropertyModal })));
const ShareModal = lazy(() => import('./components/ShareModal').then((m) => ({ default: m.ShareModal })));
const StudioPanel = lazy(() => import('./components/StudioPanel').then((m) => ({ default: m.StudioPanel })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
const ChatbotModal = lazy(() => import('./components/ChatbotModal').then((m) => ({ default: m.ChatbotModal })));

// Skeleton luxo ultra-leve para transição suave durante o carregamento assíncrono dos blocos
const BlockSkeleton = () => (
  <section className="px-5 py-2.5 animate-pulse">
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 min-h-[140px] flex flex-col justify-between">
      <div className="space-y-2.5">
        <div className="h-3 w-28 rounded-full bg-[#C5973D]/25" />
        <div className="h-5 w-48 rounded-lg bg-white/10" />
        <div className="h-3 w-full max-w-[260px] rounded bg-white/5" />
      </div>
      <div className="h-9 w-full rounded-xl bg-white/[0.03] mt-4" />
    </div>
  </section>
);

const STORAGE_KEY = 'marciorogerio_minisite_config_v5';
const AUTH_KEY = 'corretor_auth_token_v1';
const SESSION_PANEL_KEY = 'corretor_studio_panel_open_v1';

// Palavras-chave secretas para o corretor acessar o painel pela URL (?painel, ?admin, #painel, etc.)
const SECRET_ACCESS_KEYS = ['painel', 'admin', 'gestao', 'studio', 'portal', 'corretor', 'login'];

const isSecretAccessRequested = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase().replace(/^#/, '');
    return SECRET_ACCESS_KEYS.some((key) => params.has(key) || hash === key);
  } catch (e) {
    return false;
  }
};

const cleanUrlSecretKeys = () => {
  if (typeof window === 'undefined') return;
  try {
    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      SECRET_ACCESS_KEYS.forEach((key) => url.searchParams.delete(key));
      url.hash = '';
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  } catch (e) {
    // ignore
  }
};

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.profile && typeof parsed.profile.websiteUrl === 'string') {
            if (parsed.profile.websiteUrl.includes('marciorogeriocorretor.com.br')) {
              parsed.profile.websiteUrl = parsed.profile.websiteUrl.replace(
                'marciorogeriocorretor.com.br',
                'marciorjcorretor.com.br'
              );
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
              } catch (e) {
                // ignore
              }
            }
          }
          // Mesclagem profunda não-destrutiva: nunca perde personalizações do usuário
          return deepMergePreservingUserEdits(DEFAULT_CONFIG, parsed);
        }
      } catch (err) {
        console.error('Failed to load stored config', err);
      }
    }
    return DEFAULT_CONFIG;
  });

  const [selectedProperty, setSelectedProperty] = useState<CuratedProperty | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState<SiteConfig | null>(null);

  // Visitor theme switcher: Claro / Escuro
  const { colorMode, resolvedTheme, setColorMode } = useColorMode();

  // Authentication state for broker management (only reveals top bar & Studio button)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(AUTH_KEY) === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Controls Studio & Canva panel visibility: stays open even if user reloads (F5) while logged in
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
        if (!isAuth) return false;
        const hasParam = isSecretAccessRequested();
        const wasOpen = sessionStorage.getItem(SESSION_PANEL_KEY) === 'true';
        return hasParam || wasOpen;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync session storage so refreshing with F5 maintains editor open without conflict
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (isEditorOpen && isAuthenticated) {
          sessionStorage.setItem(SESSION_PANEL_KEY, 'true');
        } else {
          sessionStorage.removeItem(SESSION_PANEL_KEY);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isEditorOpen, isAuthenticated]);

  // Sincronização automática com dados gravados no servidor (/api/config ou dados.json)
  // Garante que fotos, textos e customizações feitas no painel nunca sejam perdidas entre sessões, abas ou recompilações
  useEffect(() => {
    let isMounted = true;
    const fetchServerConfig = async () => {
      try {
        let res = await fetch(`/api/config?t=${Date.now()}`);
        if (!res.ok) {
          res = await fetch(`./dados.json?t=${Date.now()}`);
        }
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && remoteData.profile && isMounted) {
            setConfig((prev) => {
              // Mescla dados remotos garantindo que fotos e textos gravados no servidor prevaleçam e complementem
              const merged = deepMergePreservingUserEdits(prev, remoteData);
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              } catch (e) {
                // Quota storage ignore
              }
              return merged;
            });
          }
        }
      } catch (err) {
        // Normal in offline/local
      }
    };

    fetchServerConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check URL query parameters or hash for ?painel, ?admin, #painel, etc. (active monitor without needing F5)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAccessUrl = () => {
      if (isSecretAccessRequested()) {
        const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
        if (isAuth) {
          setIsAuthenticated(true);
          setIsEditorOpen(true);
          setIsAuthModalOpen(false);
        } else {
          setIsAuthModalOpen(true);
        }
      }
    };

    checkAccessUrl();

    window.addEventListener('hashchange', checkAccessUrl);
    window.addEventListener('popstate', checkAccessUrl);
    window.addEventListener('focus', checkAccessUrl);

    // Watcher ativo suave (400ms) para detectar mudanças na URL instantaneamente sem exigir F5
    const interval = setInterval(() => {
      if (!isEditorOpen && !isAuthModalOpen) {
        checkAccessUrl();
      }
    }, 400);

    return () => {
      window.removeEventListener('hashchange', checkAccessUrl);
      window.removeEventListener('popstate', checkAccessUrl);
      window.removeEventListener('focus', checkAccessUrl);
      clearInterval(interval);
    };
  }, [isEditorOpen, isAuthModalOpen]);

  // Atalho de teclado rápido para o corretor (Alt + P ou Ctrl + Shift + P)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if (
        (e.altKey && (e.key === 'p' || e.key === 'P')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P'))
      ) {
        e.preventDefault();
        const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
        if (isAuth) {
          setIsAuthenticated(true);
          setIsEditorOpen((prev) => !prev);
        } else {
          setIsAuthModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyShortcut);
    return () => window.removeEventListener('keydown', handleKeyShortcut);
  }, []);

  // Memoized draft handler preventing infinite re-render loops with StudioPanel
  const handleDraftChange = useCallback((draft: SiteConfig) => {
    setDraftConfig((prev) => {
      if (prev === draft) return prev;
      return draft;
    });
  }, []);

  // Real-time live preview: when the Studio panel is open and user edits something, display the draft immediately
  const activeConfig = isEditorOpen && draftConfig ? draftConfig : config;

  // Active theme and visibility with safe defaults
  const theme = activeConfig.theme || DEFAULT_CONFIG.theme!;
  const visibility = activeConfig.blockVisibility || DEFAULT_CONFIG.blockVisibility!;
  const customBlocks = activeConfig.customBlocks || [];

  // Save changes to localStorage and update state with automatic safety snapshot
  const handleSaveConfig = (newConfig: SiteConfig) => {
    // 1. Grava snapshot de emergência antes de persistir
    saveSafetySnapshot(newConfig);

    // 2. Atualiza estado e localStorage
    setConfig(newConfig);
    setDraftConfig(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (err) {
      console.error('Failed to save config', err);
    }
  };

  const handleResetConfig = () => {
    if (window.confirm('Deseja restaurar as configurações originais do minisite? Uma cópia de emergência será guardada para caso queira desfazer.')) {
      // Salva snapshot de segurança do estado atual antes de restaurar
      saveSafetySnapshot(config);

      setConfig(DEFAULT_CONFIG);
      setDraftConfig(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Failed to clear config', err);
      }
    }
  };

  const handleLeadCaptured = (newLead: CapturedLead) => {
    setConfig((prev) => {
      const existingLeads = prev.capturedLeads || [];
      const updated = {
        ...prev,
        capturedLeads: [newLead, ...existingLeads],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem(AUTH_KEY, 'true');
      sessionStorage.setItem(SESSION_PANEL_KEY, 'true');
    } catch (e) {
      // ignore
    }
    setIsAuthModalOpen(false);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setDraftConfig(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(SESSION_PANEL_KEY);
        cleanUrlSecretKeys();
      } catch (e) {
        // ignore
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(SESSION_PANEL_KEY);
    } catch (e) {
      // ignore
    }
    setIsEditorOpen(false);
    setDraftConfig(null);
    cleanUrlSecretKeys();
  };

  const quickConsultUrl = formatWhatsAppUrl(
    activeConfig.profile.phone,
    'Olá, gostaria de tirar dúvidas sobre crédito e imóveis.'
  );

  return (
    <StoryModeFrame
      isAuthenticated={isAuthenticated}
      isEditorOpen={isEditorOpen}
      onOpenShare={() => setIsShareOpen(true)}
      onOpenEditor={() => setIsEditorOpen(true)}
      onLogout={handleLogout}
      resolvedTheme={resolvedTheme}
    >
      {/* Dynamic Theme Typography & CSS Variables */}
      <style>{`
        :root {
          --theme-primary: ${theme.primaryColor};
          --theme-secondary: ${theme.secondaryColor};
          --theme-bg: ${theme.backgroundColor};
          --theme-card: ${theme.cardBackgroundColor};
        }
        .font-serif, h1, h2, h3, .font-title {
          font-family: '${theme.fontTitle}', serif, sans-serif !important;
        }
        body, .font-body, p, span, button, a, div {
          font-family: '${theme.fontBody}', sans-serif;
        }
        p, span, a {
          font-weight: 600;
        }
      `}</style>

      <div
        className={`relative flex flex-col w-full text-left transition-colors duration-300 ${
          resolvedTheme === 'light' ? 'theme-light' : 'theme-dark'
        }`}
        style={{
          backgroundColor: resolvedTheme === 'light' ? '#FAF8F5' : theme.backgroundColor,
        }}
      >
        {/* Ambient subtle light wash */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-64 blur-3xl pointer-events-none opacity-40 transition-colors duration-500"
          style={{
            background: `radial-gradient(circle, ${theme.primaryColor} 0%, transparent 70%)`,
          }}
        />

        {/* 1. CABEÇALHO */}
        <Header
          name={activeConfig.profile.name}
          subtitle={activeConfig.profile.subtitle}
          avatarUrl={activeConfig.profile.avatarUrl}
          creci={activeConfig.profile.creci}
          city={activeConfig.profile.city}
          onShareClick={() => setIsShareOpen(true)}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
          onSecretAccess={() => {
            if (isAuthenticated) {
              setIsEditorOpen(true);
            } else {
              setIsAuthModalOpen(true);
            }
          }}
        />

        {/* BLOCO — SOBRE O CORRETOR */}
        {visibility.about && (
          <Suspense fallback={<BlockSkeleton />}>
            <AboutBlock
              name={activeConfig.profile.name}
              creci={activeConfig.profile.creci}
              websiteUrl={activeConfig.aboutBlock?.websiteUrl || activeConfig.profile.websiteUrl}
              propostaDeValor={activeConfig.profile.propostaDeValor}
              tag={activeConfig.aboutBlock?.tag}
              aboutText={activeConfig.aboutBlock?.description}
              linkText={activeConfig.aboutBlock?.websiteLinkText}
            />
          </Suspense>
        )}

        {/* 2. BLOCO PRINCIPAL — COMPRAR */}
        {visibility.buyer && (
          <Suspense fallback={<BlockSkeleton />}>
            <BuyerBlock
              tag={activeConfig.buyerBlock.tag}
              title={activeConfig.buyerBlock.title}
              description={activeConfig.buyerBlock.description}
              ctaText={activeConfig.buyerBlock.ctaText}
              whatsappMessage={activeConfig.buyerBlock.whatsappMessage}
              phone={activeConfig.profile.phone}
              footnoteText={activeConfig.buyerBlock.footnoteText}
              footnoteSubtext={activeConfig.buyerBlock.footnoteSubtext}
            />
          </Suspense>
        )}

        {/* 3. BLOCO — DESTAQUE ATUAL (Aparece em primeiro lugar) */}
        {visibility.featured && (
          <Suspense fallback={<BlockSkeleton />}>
            <FeaturedBlock
              project={activeConfig.featuredProject}
              phone={activeConfig.profile.phone}
            />
          </Suspense>
        )}

        {/* 4. BLOCO — CURADORIA DE IMÓVEIS */}
        {visibility.curated && (
          <Suspense fallback={<BlockSkeleton />}>
            <CuratedBlock
              title={activeConfig.curatedBlock.title}
              description={activeConfig.curatedBlock.description}
              ctaText={activeConfig.curatedBlock.ctaText}
              websiteUrl={activeConfig.curatedBlock.websiteUrl}
              properties={activeConfig.curatedBlock.properties}
              phone={activeConfig.profile.phone}
              onSelectProperty={(prop) => setSelectedProperty(prop)}
            />
          </Suspense>
        )}

        {/* 5. BLOCO — PROPRIETÁRIOS (QuintoAndar & Venda) - Posicionado logo após os destaques */}
        {visibility.seller && (
          <Suspense fallback={<BlockSkeleton />}>
            <SellerBlock
              title={activeConfig.sellerBlock.title}
              description={activeConfig.sellerBlock.description}
              ctaText={activeConfig.sellerBlock.ctaText}
              whatsappMessage={activeConfig.sellerBlock.whatsappMessage}
              phone={activeConfig.profile.phone}
              comparisonNote={activeConfig.sellerBlock.comparisonNote}
              cards={activeConfig.sellerBlock.cards}
              quintoAndarCtaText={activeConfig.sellerBlock.quintoAndarCtaText}
              quintoAndarUrl={activeConfig.sellerBlock.quintoAndarUrl}
            />
          </Suspense>
        )}

        {/* BLOCO — ASSESSORIA & FINANCIAMENTO IMOBILIÁRIO */}
        {visibility.financing && (
          <Suspense fallback={<BlockSkeleton />}>
            <FinancingBlock
              title={activeConfig.financingBlock?.title}
              description={activeConfig.financingBlock?.description}
              ctaText={activeConfig.financingBlock?.ctaText}
              simulationUrl={activeConfig.financingBlock?.simulationUrl}
              disclaimer={activeConfig.financingBlock?.disclaimer}
              phone={activeConfig.profile.phone}
              cards={activeConfig.financingBlock?.cards}
            />
          </Suspense>
        )}

        {/* 6. BLOCO — LEAD MAGNET / GUIA & E-BOOK COM CAPTURA DE NOME E E-MAIL */}
        {visibility.leadMagnet !== false && activeConfig.leadMagnet?.enabled !== false && (
          <Suspense fallback={<BlockSkeleton />}>
            <LeadMagnetBlock
              leadMagnet={activeConfig.leadMagnet}
              brokerPhone={activeConfig.profile.phone}
              brokerName={activeConfig.profile.name}
              onLeadCaptured={handleLeadCaptured}
            />
          </Suspense>
        )}

        {/* BLOCOS PERSONALIZADOS CRIADOS PELO USUÁRIO (NOVIDADES / LANÇAMENTOS) */}
        {customBlocks.map((block) => (
          <Suspense key={block.id} fallback={<BlockSkeleton />}>
            <CustomBlockRenderer
              block={block}
              phone={activeConfig.profile.phone}
            />
          </Suspense>
        ))}

        {/* 6. RODAPÉ INSTITUCIONAL */}
        <Footer
          name={activeConfig.profile.name}
          creci={activeConfig.profile.creci}
          instagram={activeConfig.profile.instagram}
          websiteUrl={activeConfig.profile.websiteUrl}
          disclaimer={activeConfig.footer.disclaimer}
          city={activeConfig.profile.city}
          isAuthenticated={isAuthenticated}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenEditor={() => setIsEditorOpen(true)}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
        />

        {/* Floating Bar on Mobile: Studio button ONLY when authenticated; WhatsApp always accessible */}
        <div className="sticky bottom-4 px-5 z-30 pointer-events-none flex items-center justify-between">
          {isAuthenticated ? (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#181A20]/95 hover:bg-[#252830] text-[#E8D5A0] hover:text-white backdrop-blur-md border border-[#C5973D]/40 shadow-xl transition-transform active:scale-95 text-xs font-semibold"
              title="Abrir Studio & Canva (Personalizar Geral)"
              aria-label="Abrir Studio & Canva"
            >
              <Sliders className="w-3.5 h-3.5 text-[#C5973D]" />
              <span>Studio & Canva</span>
            </button>
          ) : (
            <div className="pointer-events-none" />
          )}

          <a
            href={quickConsultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C5973D] text-[#0E0F12] font-semibold text-xs tracking-wide shadow-xl shadow-[#C5973D]/25 hover:brightness-105 active:scale-95 transition-all ml-auto"
            title={`Falar com ${activeConfig.profile.name} pelo WhatsApp`}
          >
            <MessageCircle className="w-4 h-4 fill-[#0E0F12]" />
            <span>Falar pelo WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Modals & Studio Panel (Carregados via React.lazy sob demanda) */}
      <Suspense fallback={null}>
        {selectedProperty && (
          <PropertyModal
            property={selectedProperty}
            phone={activeConfig.profile.phone}
            simulationUrl={activeConfig.financingBlock?.simulationUrl}
            onClose={() => setSelectedProperty(null)}
          />
        )}

        {isShareOpen && (
          <ShareModal
            name={activeConfig.profile.name}
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            phone={activeConfig.profile.phone}
          />
        )}

        {isEditorOpen && (
          <StudioPanel
            isOpen={isEditorOpen}
            onClose={handleCloseEditor}
            config={config}
            onSave={handleSaveConfig}
            onReset={handleResetConfig}
            onDraftChange={handleDraftChange}
          />
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleLoginSuccess}
            currentPassword={config.adminPassword || '1234'}
          />
        )}

        {/* Intelligent Lead Qualification Chatbot */}
        <ChatbotModal config={activeConfig} />
      </Suspense>
    </StoryModeFrame>
  );
}
