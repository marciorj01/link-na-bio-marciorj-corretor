import { SiteConfig } from '../types';

/**
 * Realiza a mesclagem inteligente e não-destrutiva entre as configurações
 * padrão do desenvolvedor/IA e as edições personalizadas do cliente.
 * 
 * Regra de Ouro: AS ALTERAÇÕES DO CLIENTE SEMPRE PREVALECEM.
 * Se o desenvolvedor ou a IA adicionar novos campos, botões ou blocos
 * em atualizações futuras, esses novos campos serão incorporados com
 * seus valores padrão SEM NUNCA apagar o que o cliente já digitou ou configurou.
 */
export function deepMergePreservingUserEdits(
  defaults: SiteConfig,
  userCustom: Partial<SiteConfig> | null | undefined
): SiteConfig {
  if (!userCustom || typeof userCustom !== 'object') {
    return { ...defaults };
  }

  const merged: SiteConfig = {
    ...defaults,
    ...userCustom,
    adminPassword: userCustom.adminPassword || defaults.adminPassword || '1234',

    // Perfil do Corretor
    profile: {
      ...defaults.profile,
      ...(userCustom.profile || {}),
      avatarUrl:
        userCustom.profile?.avatarUrl && userCustom.profile.avatarUrl.trim() !== ''
          ? userCustom.profile.avatarUrl
          : defaults.profile?.avatarUrl || '',
      qrCodeUrl:
        userCustom.profile?.qrCodeUrl && userCustom.profile.qrCodeUrl.trim() !== ''
          ? userCustom.profile.qrCodeUrl
          : defaults.profile?.qrCodeUrl || '',
      expertise: Array.isArray(userCustom.profile?.expertise) && userCustom.profile.expertise.length > 0
        ? userCustom.profile.expertise
        : defaults.profile.expertise,
    },

    // Bloco Sobre / Trajetória
    aboutBlock: {
      ...(defaults.aboutBlock || {}),
      ...(userCustom.aboutBlock || {}),
    },

    // Bloco Comprador (Sua próxima compra)
    buyerBlock: {
      ...defaults.buyerBlock,
      ...(userCustom.buyerBlock || {}),
    },

    // Curadoria de Imóveis (preserva fotos carregadas pelo usuário em cada imóvel)
    curatedBlock: {
      ...defaults.curatedBlock,
      ...(userCustom.curatedBlock || {}),
      properties: Array.isArray(userCustom.curatedBlock?.properties) && userCustom.curatedBlock.properties.length > 0
        ? userCustom.curatedBlock.properties.map((prop) => {
            const matchingDefault = (defaults.curatedBlock?.properties || []).find((p) => p.id === prop.id);
            return {
              ...(matchingDefault || {}),
              ...prop,
              imageUrl:
                prop.imageUrl && prop.imageUrl.trim() !== ''
                  ? prop.imageUrl
                  : matchingDefault?.imageUrl || prop.imageUrl || '',
              pdfFilename:
                prop.pdfFilename !== undefined
                  ? prop.pdfFilename
                  : matchingDefault?.pdfFilename || '',
              pdfEnabled:
                prop.pdfEnabled !== undefined
                  ? prop.pdfEnabled
                  : matchingDefault?.pdfEnabled || false,
            };
          })
        : defaults.curatedBlock.properties,
    },

    // Destaque Imobiliário Principal (preserva foto do destaque)
    featuredProject: {
      ...defaults.featuredProject,
      ...(userCustom.featuredProject || {}),
      imageUrl:
        userCustom.featuredProject?.imageUrl && userCustom.featuredProject.imageUrl.trim() !== ''
          ? userCustom.featuredProject.imageUrl
          : defaults.featuredProject?.imageUrl || '',
      pdfFilename:
        userCustom.featuredProject?.pdfFilename !== undefined
          ? userCustom.featuredProject.pdfFilename
          : defaults.featuredProject?.pdfFilename || 'helbor-vm125-apresentacao.pdf',
      pdfEnabled:
        userCustom.featuredProject?.pdfEnabled !== undefined
          ? userCustom.featuredProject.pdfEnabled
          : defaults.featuredProject?.pdfEnabled ?? true,
      specs: {
        ...defaults.featuredProject.specs,
        ...(userCustom.featuredProject?.specs || {}),
      },
    },

    // Bloco de Financiamento & Crédito
    financingBlock: {
      ...(defaults.financingBlock || { title: '', description: '' }),
      ...(userCustom.financingBlock || {}),
      banks: Array.isArray(userCustom.financingBlock?.banks)
        ? userCustom.financingBlock.banks
        : (defaults.financingBlock?.banks || ['Caixa', 'Itaú', 'Bradesco', 'Santander']),
      cards: Array.isArray(userCustom.financingBlock?.cards) && userCustom.financingBlock.cards.length > 0
        ? userCustom.financingBlock.cards
        : (defaults.financingBlock?.cards || []),
    },

    // Bloco Vendedor / Proprietário
    sellerBlock: {
      ...defaults.sellerBlock,
      ...(userCustom.sellerBlock || {}),
      cards: Array.isArray(userCustom.sellerBlock?.cards) && userCustom.sellerBlock.cards.length > 0
        ? userCustom.sellerBlock.cards
        : (defaults.sellerBlock.cards || []),
    },

    // Lead Magnet / E-book / Material Rico
    leadMagnet: userCustom.leadMagnet
      ? {
          ...(defaults.leadMagnet || {}),
          ...userCustom.leadMagnet,
          bulletPoints: Array.isArray(userCustom.leadMagnet.bulletPoints) && userCustom.leadMagnet.bulletPoints.length > 0
            ? userCustom.leadMagnet.bulletPoints
            : (defaults.leadMagnet?.bulletPoints || []),
        } as any
      : defaults.leadMagnet,

    // Chatbot com IA & Base de Conhecimento
    chatbot: userCustom.chatbot
      ? {
          ...(defaults.chatbot || { enabled: true, botName: 'Assistente', welcomeMessage: '', quickOptions: [] }),
          ...userCustom.chatbot,
          quickOptions: Array.isArray(userCustom.chatbot.quickOptions) && userCustom.chatbot.quickOptions.length > 0
            ? userCustom.chatbot.quickOptions
            : (defaults.chatbot?.quickOptions || []),
          knowledgeBase: Array.isArray(userCustom.chatbot.knowledgeBase)
            ? userCustom.chatbot.knowledgeBase
            : (defaults.chatbot?.knowledgeBase || []),
        }
      : defaults.chatbot,

    // Tema Visual (Cores, Fontes, Formas)
    theme: {
      ...(defaults.theme || {}),
      ...(userCustom.theme || {}),
    } as any,

    // Visibilidade dos Blocos
    blockVisibility: {
      ...(defaults.blockVisibility || {}),
      ...(userCustom.blockVisibility || {}),
    } as any,

    // Blocos Customizados Adicionais
    customBlocks: Array.isArray(userCustom.customBlocks)
      ? userCustom.customBlocks
      : (defaults.customBlocks || []),

    // Leads Capturados
    capturedLeads: Array.isArray(userCustom.capturedLeads)
      ? userCustom.capturedLeads
      : (defaults.capturedLeads || []),

    // Rodapé
    footer: {
      ...defaults.footer,
      ...(userCustom.footer || {}),
    },
  };

  return merged;
}

export const SAFETY_SNAPSHOT_KEY = 'marciorogerio_minisite_safety_snapshot';

/**
 * Salva uma cópia de segurança instantânea no navegador antes de qualquer operação
 */
export function saveSafetySnapshot(config: SiteConfig): void {
  try {
    if (typeof window !== 'undefined') {
      const snapshot = {
        savedAt: new Date().toISOString(),
        config,
      };
      localStorage.setItem(SAFETY_SNAPSHOT_KEY, JSON.stringify(snapshot));
    }
  } catch (e) {
    console.warn('Não foi possível gravar o snapshot de segurança', e);
  }
}

/**
 * Recupera o último snapshot de emergência salvo
 */
export function loadSafetySnapshot(): { savedAt: string; config: SiteConfig } | null {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SAFETY_SNAPSHOT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (e) {
    console.warn('Falha ao ler snapshot de emergência', e);
  }
  return null;
}

/**
 * Dispara o download de um arquivo .json de backup para o computador/celular do cliente
 */
export function downloadConfigAsJson(config: SiteConfig, filenamePrefix = 'minisite-marciorogerio-backup'): void {
  try {
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
    
    link.href = url;
    link.download = `${filenamePrefix}_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erro ao gerar download de backup JSON:', err);
    alert('Erro ao gerar o arquivo de backup. Tente usar a opção "Copiar Configuração JSON".');
  }
}

/**
 * Gera o código TypeScript formatado para colar diretamente em src/data/defaultData.ts.
 * Isso permite "eternizar" as alterações do cliente como o padrão de fábrica permanente do projeto!
 */
export function generateDefaultDataCode(config: SiteConfig): string {
  const json = JSON.stringify(config, null, 2);
  return `import { SiteConfig } from '../types';\n\n/**\n * Configuração Padrão de Fábrica do Minisite\n * Exportado diretamente das edições personalizadas do cliente.\n * Atualizado em: ${new Date().toLocaleString('pt-BR')}\n */\nexport const DEFAULT_CONFIG: SiteConfig = ${json};\n`;
}
